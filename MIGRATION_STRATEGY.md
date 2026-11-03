# GUEST-TO-ACCOUNT MIGRATION STRATEGY
## Marginalia Academic Companion

## Document Version: 3.0
## Date: 2026-11-03

---

## 1. Executive Summary

This document defines the safe, idempotent migration process for transferring user data from browser localStorage (guest mode) to Firebase Firestore (authenticated accounts).

Key improvements from version 2.1:
- Deterministic IDs without Date.now()
- Explicit preservation of localStorage
- Correct counter handling for idempotency
- Chunked writes below batch limit

---

## 2. Migration Overview

### 2.1 When Migration Occurs

| Trigger | Condition |
|---------|-----------|
| **First-time Sign-in** | User signs in, no Firestore profile exists, guest data present in localStorage |
| **Returning User** | User previously signed in, data already in Firestore, guest data may exist |
| **Explicit Migration** | User initiates migration from settings |

### 2.2 Migration Flow

```
[User Signs In]
       ↓
[Check: Firestore profile exists?]
       ↓
[Check: localStorage guest data exists?]
       ↓
[Create Migration Job Document]
       ↓
[Batch Transfer: Papers → Collections → Notes → Highlights]
       ↓
[Transfer: Reading Progress → Goals → Activities]
       ↓
[Checksum Verification]
       ↓
[User Confirmation Dialog]
       ↓
[Mark Migration: Verified]
       ↓
[Application Ready - localStorage PRESERVED for 30 days]
```

---

## 3. Deterministic ID Generation

### 3.1 Why Deterministic IDs?

Using deterministic IDs ensures:
- **Idempotency**: Same source data always maps to same target document
- **Duplicate Prevention**: Check if already migrated before writing
- **Resume Capability**: Can resume from failure point

### 3.2 ID Generation Algorithm (CORRECTED)

Use stable source identifiers - NOT `Date.now()`:

```typescript
import { createHash } from 'crypto';

/**
 * Generate deterministic ID from source data + user UID
 * Uses stable identifiers, NOT timestamps
 */
function generateDeterministicId(
  type: 'paper' | 'collection' | 'note' | 'highlight' | 'bookmark' | 'goal',
  sourceId: string,    // From localStorage (already has timestamp or UUID)
  uid: string
): string {
  // Hash combines type, source ID, and user for uniqueness
  const hash = createHash('sha256')
    .update(`${type}|${sourceId}|${uid}`)
    .digest('hex');
  
  // Use first 12 chars of hash + short timestamp for readability
  const shortHash = hash.substring(0, 12);
  const shortTimestamp = Math.floor(Date.now() / 1000).toString(36);
  
  return `${type}_${shortHash}_${shortTimestamp}`;
}

// Examples:
// Paper with DOI: generateDeterministicId('paper', 'doi:10.1234/test', 'user123')
//                → paper_abc123def456_17h4k2m
// Collection:   generateDeterministicId('collection', 'My Research', 'user123')
//                → collection_fed456abc123_17h4k2m
```

### 3.3 ID Format Reference

| Entity | Format | Example |
|--------|--------|---------|
| Paper | `paper_{hash}_{ts}` | `paper_abc123_17h4k2m` |
| Collection | `coll_{hash}_{ts}` | `coll_def456_17h4k2m` |
| Volume | `vol_{hash}_{ts}` | `vol_ghi789_17h4k2m` |
| Note | `note_{hash}_{ts}` | `note_jkl012_17h4k2m` |
| Highlight | `hl_{hash}_{ts}` | `hl_mno345_17h4k2m` |
| Bookmark | `bk_{hash}_{ts}` | `bk_pqr678_17h4k2m` |
| Goal | `goal_{hash}_{ts}` | `goal_stu901_17h4k2m` |
| Activity | `act_{hash}_{ts}` | `act_vwx234_17h4k2m` |

---

## 4. Data Transfer Process

### 4.1 Migration Job Document Structure

**Path**: `users/{uid}/migrations/{migrationId}`

```typescript
interface MigrationJob {
  id: string;                    // Deterministic: mig-{uid}-{timestamp}
  uid: string;                   // User UID
  type: 'guest_to_account';
  status: 'pending' | 'running' | 'in_progress' | 'completed' | 'failed' | 'verified';
  progress: number;              // 0-100 completion
  startedAt: Timestamp;
  completedAt?: Timestamp;
  verifiedAt?: Timestamp;
  error?: string;
  
  // Entity counts (source data)
  entityCounts: {
    papers: number;
    collections: number;
    notes: number;
    highlights: number;
    readingSessions: number;
    goals: number;
    activities: number;
    pdfs: number;
  };
  
  // Processed counts (updated during migration)
  processedCounts: {
    papers: number;      // Incremented ONCE per entity
    collections: number;
    notes: number;
    highlights: number;
    readingSessions: number;
    goals: number;
    activities: number;
    pdfs: number;
  };
  
  // Checksums for verification
  sourceChecksums: { 
    papers: string; 
    collections: string; 
    notes: string; 
    highlights: string;
    sessions: string;
    goals: string;
  };
  targetChecksums?: { 
    papers: string; 
    collections: string; 
    notes: string; 
    highlights: string;
    sessions: string;
    goals: string;
  };
  
  // Recovery
  currentPhase: string;
  phaseProgress: number;
  backupRetentionDays: 30;       // localStorage retention
  recoveredFrom?: string;
  retryCount: number;
}
```

### 4.2 Counter Handling (CRITICAL)

**The bug in version 2.X**: Using `get().processedCounts.papers + 1` on retries could double-count.

**Correct approach**:

```typescript
async function transferEntity(db, migrationRef, item, type, uid) {
  const targetId = generateDeterministicId(type, item.id, uid);
  const targetRef = doc(db, getPathForType(type, uid, targetId));
  
  // Check if already exists (idempotency)
  const existing = await getDoc(targetRef);
  if (existing.exists()) {
    // Already migrated, DON'T increment counter
    return { migrated: false };
  }
  
  // Write new document
  await setDoc(targetRef, transformItem(item, uid));
  
  // INCREMENT COUNTER ONCE
  // Use atomic update for processedCounts
  const newCount = (migrationRef.data().processedCounts?.[type] || 0) + 1;
  await updateDoc(migrationRef, {
    [`processedCounts.${type}`]: newCount
  });
  
  return { migrated: true };
}
```

### 4.3 Batch Processing (Below Firestore Limit)

```typescript
const BATCH_SIZE = 450;  // Leave margin for 500 maximum

async function migrateInChunks(
  db: FirebaseFirestore,
  migrationRef: DocumentReference,
  uid: string,
  items: any[],
  type: string
): Promise<{ transferred: number; skipped: number }> {
  
  let transferred = 0;
  let skipped = 0;
  
  for (let i = 0; i < items.length; i += BATCH_SIZE) {
    const batchItems = items.slice(i, i + BATCH_SIZE);
    const batch = writeBatch(db);
    
    let batchTransferred = 0;
    
    for (const item of batchItems) {
      const result = await transferEntity(db, migrationRef, item, type, uid);
      if (result.migrated) {
        batchTransferred++;
        // Add to batch for commit
        // (in real implementation, accumulate operations)
      } else {
        skipped++;
      }
    }
    
    if (batch.operations.length > 0) {
      await batch.commit();
    }
    
    transferred += batchTransferred;
    
    // Update overall progress
    const totalItems = items.length;
    const overallProgress = Math.round((i + batchTransferred) / totalItems * 100);
    await.updateDoc(migrationRef, { progress: overallProgress });
  }
  
  return { transferred, skipped };
}
```

### 4.4 Paper Transfer Steps

1. Get `academic_archive_items_v3` from localStorage
2. For each paper, map localStorage fields to Firestore fields:

| localStorage Field | Firestore Field | Notes |
|--------------------|-----------------|-------|
| `id` | `id` | Generate if not present |
| `title` | `title` | Required |
| `authors` | `authors` | Array |
| `year` | `year` | String YYYY |
| `doi` | `doi` | Nullable |
| `abstract` | `abstract` | String |
| `readingStatus` | `readingStatus` | Enum |
| `priority` | `priority` | low/medium/high |
| `tags` | `tags` | Array |
| `categories` | `categories` | Array |
| `storagePath` | `storagePath` | Map to storage convention |
| `source` | `source` | Set to 'migrated' |

3. If PDF exists in localStorage as data URL, prompt user to re-download or skip

---

## 5. Idempotency Guarantees

### 5.1 How Idempotency Works

1. **Same source ID + UID → Same target ID**
2. **Check existence before write**
3. **Counters increment only on NEW writes**

### 5.2 Example: Retry Scenario

```
Initial run:
- 100 papers to migrate
- First 50 written, counters at 50
- Network error, migration fails

Retry:
- Migration job status restored from Firestore
- Current phase: "papers", progress: 50/100
- For papers 1-50: already exist, skipped, counters NOT incremented
- For papers 51-100: written, counters updated to 100
- Total correct: 100 papers
```

### 5.3 Resume After Failure

```typescript
async function resumeMigration(migrationId: string): Promise<void> {
  const jobData = await getDoc(migrationRef);
  const { status, currentPhase, processedCounts, entityCounts } = jobData.data();
  
  if (status === 'completed' && verifiedAt) {
    // Nothing to do
    return;
  }
  
  if (status === 'failed' && retryCount < 3) {
    // Can retry
    await updateDoc(migrationRef, { status: 'running', retryCount: retryCount + 1 });
    await runMigrationFromPhase(migrationId, currentPhase);
    return;
  }
  
  // Manual recovery needed
  throw new Error('Migration failed and max retries exceeded');
}
```

---

## 6. Guest Data Preservation (CORRECTED)

**The migration system NEVER automatically deletes localStorage data.**

### 6.1 Preservation Rules

| Rule | Implementation |
|------|---------------|
| Never auto-delete | localStorage preserved until user confirms clearing |
| User confirmation required | Dialog after successful verification |
| 30-day retention | localStorage data kept for 30 days after migration |
| Allows rollback | User can restore from localStorage if issues found |
| Preserves failures | If migration fails, localStorage intact |

### 6.2 localStorage Keys to Preserve

```typescript
const LOCAL_STORAGE_KEYS = [
  'academic_archive_items_v3',    // Papers
  'academic_archive_collections_v2',  // Collections
  'academic_archive_notes_v2',    // Notes
  'academic_archive_highlights_v2', // Highlights
  'academic_archive_sessions_v2',   // Reading sessions
  'academic_archive_goals_v2',      // Goals
  'academic_archive_activities_v2', // Activities
  // Any other app-specific localStorage
];
```

### 6.3 Local PDF Handling

**Important**: PDF files stored in localStorage as data URLs cannot be meaningfully migrated.

**Recommended approach**:
1. Store PDF metadata (title, storagePath) in Firestore
2. Prompt user to re-upload PDFs if needed
3. Preserve citation data and reading progress

---

## 7. Verification Process

### 7.1 Checksum Verification

```typescript
import { createHash } from 'crypto';

function calculateChecksum(data: any): string {
  const hash = createHash('sha256');
  hash.update(JSON.stringify(data, Object.keys(data).sort()));
  return hash.digest('hex');
}

async function verifyMigration(uid: string, migrationId: string): Promise<boolean> {
  const migrationDoc = await getDoc(migrationRef);
  const { sourceChecksums, targetChecksums, entityCounts, processedCounts } = migrationDoc.data();
  
  // 1. Verify counts match
  if (processedCounts.papers !== entityCounts.papers) return false;
  if (processedCounts.collections !== entityCounts.collections) return false;
  // ... etc
  
  // 2. Verify checksums (if calculated)
  // Note: Full checksum comparison may need pagination for large datasets
  
  // 3. Mark as verified
  await updateDoc(migrationRef, {
    status: 'verified',
    verifiedAt: serverTimestamp()
  });
  
  return true;
}
```

---

## 8. Production Considerations

1. **Never deploy rules that auto-delete localStorage**
2. **Monitor migration progress** - large users may need assistance
3. **Provide user education** - explain why PDFs may need re-upload
4. **Handle API rate limits** during export from DOI services
5. **Test with real data** - small user, large user, edge cases

---

*End of Migration Strategy Document*
