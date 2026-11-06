# ARCHITECTURE DECISIONS DOCUMENT
## Marginalia Academic Companion

## Document Version: 3.0
## Date: 2026-11-03

---

## 1. Overview

This document formalizes key architectural decisions for the Marginalia Academic Companion application, documenting SDK responsibilities, data ownership models, PDF access patterns, and migration design choices.

---

## 2. Domain Entity Model

### 2.1 Entity Relationships

```
User (uid)
├── settings (single doc) - User preferences and configuration
├── papers/
│   ├── {paperId} (Paper bibliographic record)
│   │   ├── PDFs/{pdfId} (PDF metadata only)
│   │   └── annotations/{annotationId} (Annotations on the paper)
│   └── ...
├── volumes/{volumeId} (Curated bookshelf objects)
├── collections/{collectionId}
│   ├── memberships/{entityId} (Paper/Volume membership references)
│   └── ...
├── readingProgress/{paperId} (Single doc with sessions[] embedded)
├── highlights/{highlightId} (Standalone highlights)
├── annotations/{annotationId} (Nested under papers)
├── notes/{noteId} (Research notes)
├── bookmarks/{bookmarkId} (Page bookmarks)
├── goals/{goalId} (Reading goals)
├── activities/{activityId} (Audit log - append-only)
└── migrations/{migrationId} (Migration jobs)
```

---

## 3. Firebase SDK Responsibilities

### 3.1 Client-Side Operations (Firebase Client SDK)

**Used for**: Normal authenticated user operations that respect Security Rules

| Operation | SDK | Security |
|-----------|-----|----------|
| User reads papers | Client | Firestore Rules |
| User signs in (Google/Email) | Client | Firebase Auth |
| User creates paper | Client | Firestore Rules |
| User uploads PDF | Client | Storage Rules |
| User adds annotation | Client | Firestore Rules |
| User gets download URL | Client | Storage Rules (ownership verified) |
| User lists collections | Client | Firestore Rules |

### 3.2 Server-Side Operations (Firebase Admin SDK)

**Used for**: Privileged operations that bypass Security Rules, or operations needing additional verification

| Operation | SDK | Security |
|-----------|-----|----------|
| Verify ID token | Admin | Manual verification via `verifyIdToken()` |
| Generate signed URL | Admin | Ownership check before signing |
| Data migration orchestration | Admin | Service account privileges |
| Audit logging | Admin | Write access to activities |
| PDF text extraction | Admin | Cloud Functions background |

### 3.3 Boundary Definition

| Operation | SDK | Security |
|-----------|-----|----------|
| User reads their papers | Client | Firestore Rules validate ownership |
| User creates paper | Client | Firestore Rules validate fields |
| Backend verifies token | Admin | `verifyIdToken()` extracts UID from token |
| Generate signed PDF URL | Admin | Check user owns paper, then sign |
| Migrate guest data | Admin + Client | Upload via signed URLs, verify each entity |
| AI assistant queries | Client | User's own data only |

### 3.4 Key Principle: NEVER TRUST CLIENT-PROVIDED UID

```typescript
// CORRECT: Extract UID from verified token
async function handleSignedUrlRequest(req, res) {
  const idToken = req.headers.authorization?.split('Bearer ')[1];
  const decodedToken = await admin.auth().verifyIdToken(idToken);
  const uid = decodedToken.uid;  // Trusted - from verified token
  
  // Use uid for all subsequent operations
  const paperRef = db.collection('users').doc(uid).collection('papers').doc(paperId);
  // ...
}

// INCORRECT: Trust client-supplied UID
// const uid = req.body.uid;  // NEVER do this!
```

---

## 4. PDF Architecture

### 4.1 Storage Path Convention

```
Firebase Storage Path Format:
pdfs/{uid}/{timestamp}_{uuid}_{originalName}.pdf

Examples:
- pdfs/user123/1700000000000_abc12345_my-paper.pdf
- pdfs/user456/1700000000001_def67890_research.pdf
```

### 4.2 getDownloadURL() Behavior - CORRECTED

**CRITICAL**: Firebase `getDownloadURL()` returns a URL that:

1. **Contains an embedded Firebase Auth session token** - the URL includes a JWT that proves authentication
2. **Is valid for the duration of the user's browser session** - when the auth session expires, the URL becomes invalid
3. **Is NOT a short-lived cryptographically signed URL** - it doesn't have an explicit expiration timestamp
4. **Cannot be made to auto-expire without additional processing** - no built-in timeout mechanism

**Important Distinction**:
- `getDownloadURL()`: Session-valid URL (good for authenticated browsing)
- `getSignedUrl()` (Admin SDK): Cryptographically signed URL with explicit expiration (good for sharing, time-limited access)

### 4.3 Authenticated Retrieval (Primary Method)

**When to use**: User viewing PDF in their own browser while authenticated

```typescript
import { ref, getDownloadURL } from 'firebase/storage';

// Client-side code
const pdfRef = ref(storage, paper.storagePath);
const url = await getDownloadURL(pdfRef);
// URL contains auth token, valid for browser session
window.open(url, '_blank');
```

**Security**: Storage Rules ensure only owner can access via `request.auth.uid == uid`.

### 4.4 Server-Generated Signed URLs (For Sharing/Export)

**When to use**: 
- Need time-limited download links
- Sharing PDFs with others
- Export functionality
- Backend processing

```typescript
import { getStorage } from 'firebase-admin/storage';
import { initializeApp } from 'firebase-admin/app';

const app = initializeApp({
  credential: cert(serviceAccount),
});

const storage = getStorage(app);
const bucket = storage.bucket();

async function generateSignedUrl(uid: string, paperId: string, expiresInHours: number = 24) {
  // 1. Verify user owns the paper (admin can read any document)
  const paperSnap = await db.collection('users').doc(uid).collection('papers').doc(paperId).get();
  if (!paperSnap.exists) {
    throw new Error('Paper not found');
  }
  
  const paper = paperSnap.data() as Paper;
  if (!paper.storagePath) {
    throw new Error('No PDF associated with this paper');
  }
  
  // 2. Generate genuinely expiring signed URL
  const file = bucket.file(paper.storagePath);
  const [signedUrl] = await file.getSignedUrl({
    action: 'read',
    expires: new Date(Date.now() + expiresInHours * 60 * 60 * 1000),
  });
  
  return signedUrl;
}
```

### 4.5 PDF Access Flow

**Normal Authenticated Access**:
```
User → Client SDK getDownloadURL() → Storage Rules verify ownership → URL with auth token → User downloads
```

**Sharing/Signed URL Access**:
```
User requests share → Client calls /api/pdf/signed-url → Server verifies token + ownership → Admin SDK generates signed URL → Client receives expiring URL → URL expires after set time
```

---

## 5. Data Ownership Model

### 5.1 Ownership Invariant

**Every document MUST have a verifiable owner relationship**:

| Document Type | Ownership Check |
|---------------|-----------------|
| `users/{uid}` | `request.auth.uid == uid` |
| `users/{uid}/papers/{paperId}` | `request.auth.uid == uid` |
| `users/{uid}/volumes/{volumeId}` | `request.auth.uid == uid` |
| `users/{uid}/collections/{collectionId}` | `request.auth.uid == uid` |
| `users/{uid}/readingProgress/{paperId}` | `request.auth.uid == uid` |

### 5.2 Cross-User Data Isolation

**No user can access another user's data**:

| Access Type | Rule Condition |
|-------------|----------------|
| Read own papers | `request.auth.uid == uid` |
| Write any paper | `request.auth.uid == resource.data.uid` |
| Read another's PDF | Storage path UID doesn't match `request.auth.uid` |
| Modify annotations | Must be under user's paper (ownership inherited) |

---

## 6. Migration Design Decisions

### 6.1 Architecture: Client-Initiated with Server Verification

**Migration Flow**:
```
[Client reads localStorage]
       ↓
[Client batches data]
       ↓
[Client sends to server with ID token]
       ↓
[Server verifies token and ownership]
       ↓
[Server writes to Firestore in chunks]
       ↓
[Server returns verification tokens]
       ↓
[Client verifies counts match]
       ↓
[User confirms migration]
       ↓
[Client keeps localStorage for 30 days, then optionally clears]
```

**Why**: Server can validate tokens, prevent abuse, track progress.

### 6.2 Idempotency Strategy

**Migration jobs are idempotent by design**:

1. **Deterministic IDs**: Same source data always maps to same target document
   ```typescript
   function generateDeterministicId(type: string, sourceId: string, uid: string): string {
     // Use stable source identifiers, NOT Date.now()
     // DOI: "doi:10.1234/test" or PMID: "34567890"
     // localStorage ID: "paper_abc123"
     const hash = createHash('sha256')
       .update(`${type}|${sourceId}|${uid}`)
       .digest('hex');
     return `${type}_${hash.substring(0, 12)}_${Math.floor(Date.now()/1000).toString(36)}`;
   }
   ```

2. **Check Before Write**: Skip if already exists
   ```typescript
   async function transferPaper(db, uid, paper, migrationRef) {
     const targetId = generateDeterministicId('paper', paper.id, uid);
     const targetRef = doc(db, `users/${uid}/papers/${targetId}`);
     
     // Check if already migrated (idempotent)
     const existing = await getDoc(targetRef);
     if (existing.exists()) {
       // Already migrated, update processed counters
       return true;
     }
     
     // Write new document
     await setDoc(targetRef, transformPaper(paper, uid));
     return true;
   }
   ```

### 6.3 Guest Data Preservation (CORRECTED)

**The migration system NEVER deletes localStorage data automatically**:

| Rule | Implementation |
|------|---------------|
| Never delete localStorage immediately | Migration copies data, localStorage remains |
| Require explicit user confirmation | Dialog after verification: "Clear your guest data?" |
| 30-day retention period | Local data kept for 30 days after migration |
| Allow rollback | User can restore from localStorage if needed |
| Preserve failures | If migration fails, localStorage intact |

### 6.4 Chunked Migration Process

For large libraries (>500 items):

```typescript
const BATCH_SIZE = 450;  // Leave margin for 500 Firestore limit

async function migrateInChunks(uid: string, items: any[], collection: string) {
  let processed = 0;
  
  for (let i = 0; i < items.length; i += BATCH_SIZE) {
    const batchItems = items.slice(i, i + BATCH_SIZE);
    const batch = writeBatch(db);
    
    for (const item of batchItems) {
      const id = generateDeterministicId(getTypeFromPath(collection), item.id, uid);
      const docRef = doc(db, `${collection}/${id}`);
      batch.set(docRef, transformItem(item, uid));
    }
    
    await batch.commit();
    processed += batchItems.length;
    
    // Update migration progress
    await updateDoc(migrationRef, {
      processedCounts: {
        ...migrationRef.data().processedCounts,
        [getCollectionType(collection)]: processed
      }
    });
  }
}
```

---

## 7. Security Decisions

### 7.1 Never Trusted Client Input

| Input | Source | Validation |
|-------|--------|------------|
| UID | `request.auth.uid` from verified token | Admin SDK `verifyIdToken()` |
| Timestamp | `serverTimestamp()` | Firestore server-generated |
| Document ID | Must match authenticated UID path | Rules validation |
| File metadata | Server-validated during upload | Storage rules |

### 7.2 Defense Layers

1. **Firestore Security Rules**: Primary access control
2. **Storage Security Rules**: File access control  
3. **Backend validation**: Additional server checks
4. **Input validation**: Type and range checks
5. **Audit logging**: Activity tracking for security review

### 7.3 Production Rule Requirements

**Rules MUST** use `rules_version = '2';` and implement default-deny.

---

## 8. Unresolved Risks

### 8.1 PDF URL Security

**Risk**: `getDownloadURL()` URLs could be intercepted
**Mitigation**: Storage Rules verify ownership; use signed URLs for sharing

### 8.2 Large Library Migration Timeout

**Risk**: >10,000 papers could timeout during migration
**Mitigation**: Chunked writes with progress tracking, resumable migration jobs

### 8.3 Cross-User Data Access Edge Cases

**Risk**: Complex nested relationships could have edge cases
**Mitigation**: Extensive emulator testing with all entity types

### 8.4 Migration Data Integrity

**Risk**: Data could be corrupted during transfer
**Mitigation**: Checksums on source and target, verification before cleanup

---

## 9. Decision Log

| Date | Decision | Status |
|------|----------|--------|
| 2026-11-03 | Client SDK for normal operations | ✅ Documented |
| 2026-11-03 | Admin SDK for privileged operations | ✅ Documented |
| 2026-11-03 | Storage path: pdfs/{uid}/{timestamp}_{uuid}_{name}.pdf | ✅ Documented |
| 2026-11-03 | Migration is client-initiated, server-verified | ✅ Documented |
| 2026-11-03 | getDownloadURL() explained correctly | ✅ Documented |
| 2026-11-03 | Signed URLs for sharing/export | ✅ Documented |
| 2026-11-03 | NEVER trust client-provided UID | ✅ Documented |
| 2026-11-03 | Migration preserves localStorage 30 days | ✅ Documented |
| 2026-11-03 | ReadingProgress sessions embedded | ✅ Documented |
| 2026-11-03 | Highlights as separate entity | ✅ Documented |

---

## 10. Approval

This document represents the official architectural decisions for Marginalia Academic Companion. All implementation must follow these documented patterns.

**Status**: Awaiting implementation approval

---

*End of Architecture Decisions Document*
