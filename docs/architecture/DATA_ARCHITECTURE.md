# DATA ARCHITECTURE DOCUMENT
## Marginalia Academic Companion

## Document Version: 3.0
## Date: 2026-11-03

---

## 1. Executive Summary

This document defines the Firestore data architecture for Marginalia Academic Companion, establishing clear domain entities with proper document boundaries, pagination-ready subcollections, and scalable structures for handling large academic libraries.

This version reconciles all inconsistencies, unifies entity models, and documents the canonical data structures.

---

## 2. Domain Entity Model (Unified - One Canonical Model)

### 2.1 Entity Summary Table

| Entity | Description | Firestore Path | Notes |
|--------|-------------|----------------|-------|
| **User** | Root user document | `users/{uid}` | One per authenticated user |
| **Settings** | User preferences | `users/{uid}/settings/current` | Single document |
| **Paper** | Bibliographic research record | `users/{uid}/papers/{paperId}` | Reusable across collections/volumes |
| **PDF Metadata** | PDF file reference (metadata only) | `users/{uid}/papers/{paperId}/PDFs/{pdfId}` | Points to Firebase Storage |
| **Annotation** | Highlight/comment on paper | `users/{uid}/papers/{paperId}/annotations/{annotationId}` | Nested under paper |
| **Highlight** | Standalone highlight | `users/{uid}/highlights/{highlightId}` | Independent entity |
| **Volume** | Curated bookshelf object | `users/{uid}/volumes/{volumeId}` | Contains paper references |
| **Collection** | Organizational grouping | `users/{uid}/collections/{collectionId}` | Can contain papers and volumes |
| **Membership** | Collection membership | `users/{uid}/collections/{collectionId}/memberships/{entityId}` | Many-to-many link |
| **ReadingProgress** | Per-paper reading state | `users/{uid}/readingProgress/{paperId}` | Sessions embedded |
| **Note** | Research notes | `users/{uid}/notes/{noteId}` | Can reference multiple papers |
| **Bookmark** | Page bookmark | `users/{uid}/bookmarks/{bookmarkId}` | Points to paper + page |
| **Goal** | Reading target | `users/{uid}/goals/{goalId}` | Weekly/monthly goals |
| **Activity** | Audit log entry | `users/{uid}/activities/{activityId}` | Append-only |
| **MigrationJob** | Guest migration tracking | `users/{uid}/migrations/{migrationId}` | Resumable, idempotent |

### 2.2 Key Invariants

1. **Paper Reusability**: A paper can exist in multiple collections and volumes without duplication
2. **ReadingProgress Sessions**: Sessions are **embedded in** the ReadingProgress document, not a subcollection
3. **Settings Single Document**: All settings in one document at `users/{uid}/settings/current`
4. **Document Ownership**: Every document's owner is validated against its path UID
5. **PDF Storage Path**: Files stored at `pdfs/{uid}/{timestamp}_{uuid}_{originalName}.pdf`

---

## 3. TypeScript Domain Models

### 3.1 User Document

**Path**: `users/{uid}`

```typescript
interface User {
  uid: string;                    // Must match document ID
  email: string;                  // User email (verified)
  displayName: string | null;     // Display name
  photoURL: string | null;        // Profile picture URL
  provider: 'google' | 'email';   // Auth provider
  createdAt: Timestamp;           // Account creation time
  lastLoginAt: Timestamp;         // Last login timestamp
  migratedFromGuest: boolean;     // True if migrated from guest mode
  guestMigrationId?: string;      // Reference if currently migrating
}
```

### 3.2 Settings Document

**Path**: `users/{uid}/settings/current`

```typescript
interface Settings {
  userId: string;                 // Must match parent UID
  createdAt: Timestamp;
  lastUpdated: Timestamp;
  shelfMaterial: 'wood' | 'leather' | 'fabric' | 'metal';
  shelfSortMode: 'title' | 'author' | 'year' | 'custom' | 'recentlyAdded';
  soundEnabled: boolean;
  aiConfigured: boolean;          // AI API key configured
  theme: 'light' | 'dark' | 'auto';
  language: string;               // e.g., 'en', 'es', 'fr'
  notifications: {
    readingReminders: boolean;
    goalCompletion: boolean;
  };
  appearance: {
    compactMode: boolean;
    coverImages: boolean;
  };
  lastSynced: Timestamp;
  version: string;                // Schema version for migrations
}
```

### 3.3 Paper Document

**Path**: `users/{uid}/papers/{paperId}`

```typescript
interface Paper {
  id: string;                     // Unique paper identifier (UUID)
  uid: string;                     // Owner UID (denormalized for queries)
  doi: string | null;             // Digital Object Identifier
  title: string;                  // Full title
  shortTitle: string;             // Abbreviated title
  authors: string[];              // Array of author names
  year: string;                   // Publication year (YYYY)
  journal?: string;
  volume?: string;
  issue?: string;
  pages?: string;
  publisher?: string;
  url?: string;                   // Published URL
  abstract: string;               // Abstract text
  methodology?: string;
  findings?: string[];
  keywords?: string[];
  categories: string[];           // Research category membership
  tags: string[];                 // User-defined tags
  rating?: number;                // 1-5 user rating
  priority: 'low' | 'medium' | 'high';
  readingStatus: ReadingStatus;   // Current reading state
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastImported?: Timestamp;       // For CSV/BibTeX imports
  source: 'manual' | 'doi' | 'import' | 'user' | 'migrated';
  storagePath?: string;           // Firebase Storage path for PDF
  type?: string;                  // 'Journal Article', 'Book', etc.
  status?: string;                // Additional status field
  pageCount?: number;             // PDF page count
  evaluation?: any;               // Evaluation data
  field?: string;                 // Research field
  secondaryCategories?: string[];
  importance?: string;            // Importance level
}

type ReadingStatus = 'inbox' | 'to_read' | 'reading' | 'paused' | 'completed' | 'archive' | 'reference_only';
```

### 3.4 PDF Metadata Document

**Path**: `users/{uid}/papers/{paperId}/PDFs/{pdfId}`

**IMPORTANT**: This is metadata only. The actual PDF file is stored in Firebase Storage.

```typescript
interface PDFMetadata {
  id: string;                     // PDF document ID
  paperId: string;                 // Parent paper ID
  uid: string;                     // Owner UID (denormalized)
  fileName: string;               // Original filename
  fileSize: number;                // Bytes
  pageCount: number;
  uploadDate: Timestamp;
  storagePath: string;             // Firebase Storage path: pdfs/{uid}/{timestamp}_{uuid}_{name}.pdf
  mimeType: 'application/pdf';     // Always PDF
  status: 'processing' | 'ready' | 'failed';
  textExtracted: boolean;          // True when OCR/text extraction complete
  processedAt?: Timestamp;
  checksum?: string;              // SHA-256 for integrity verification
}
```

**Storage Path Format**: `pdfs/{uid}/{timestamp}_{uuid}_{originalName}.pdf`

Example: `pdfs/user123/1700000000000_abc123def456_my-research-paper.pdf`

### 3.5 Volume Document

**Path**: `users/{uid}/volumes/{volumeId}`

Volumes represent physical bookshelf positions - curated groupings of papers (by reference, not duplication).

```typescript
interface Volume {
  id: string;                     // Unique volume ID
  uid: string;                     // Owner UID
  title: string;                  // Volume title
  description?: string;
  position: number;               // Order on bookshelf (lower = higher)
  paperIds: string[];             // Array of paper IDs (references, not copies)
  coverImage?: string;            // Optional custom cover URL
  spineTitle?: string;            // Short title for spine
  spineAccent: string;              // Color accent for spine
  coverPalette?: CoverPalette;     // UI colors
  createdAt: Timestamp;
  updatedAt: Timestamp;
  isPublic?: boolean;              // Future: shareable volumes
  metadata?: VolumeMetadata;
}

interface VolumeMetadata {
  isbn?: string;
  publisher?: string;
  year?: number;
  edition?: string;
  pageCount?: number;
}

interface CoverPalette {
  bg: string;
  text: string;
  accent: string;
  motif: string;
}
```

### 3.6 Collection Document

**Path**: `users/{uid}/collections/{collectionId}`

```typescript
interface Collection {
  id: string;                     // Collection ID
  uid: string;                     // Owner UID
  name: string;                   // Collection name
  description?: string;
  parentId?: string;              // Parent collection for hierarchy
  type: 'folder' | 'project' | 'topic' | 'course' | 'smart';
  color?: string;                 // UI color
  appearance?: CollectionAppearance;
  isSmart?: boolean;              // Auto-populated via filter
  smartFilter?: SmartFilter;
  paperIds: string[];             // Direct paper references
  volumeIds?: string[];           // Volume references
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;              // UID of creator
}

interface SmartFilter {
  readingStatus?: ReadingStatus;
  minYear?: number;
  maxYear?: number;
  hasPdf?: boolean;
  hasNotes?: boolean;
  tags?: string[];
  categories?: string[];
}

interface CollectionAppearance {
  icon?: string;
  color?: string;
}
```

### 3.7 Membership Document

**Path**: `users/{uid}/collections/{collectionId}/memberships/{entityId}`

```typescript
interface Membership {
  id: string;                     // Paper or volume ID
  uid: string;                     // Owner UID
  collectionId: string;           // Parent collection
  type: 'paper' | 'volume';       // What is being referenced
  addedAt: Timestamp;
  addedBy: string;                // UID who added
  position?: number;              // Order within collection
}
```

### 3.8 ReadingProgress Document

**Path**: `users/{uid}/readingProgress/{paperId}`

**IMPORTANT**: Sessions are **embedded in** the ReadingProgress document, NOT a separate subcollection.

```typescript
interface ReadingProgress {
  paperId: string;                 // Document ID = paper ID
  uid: string;                      // Owner UID
  status: ReadingStatus;          // Current reading status
  currentPage: number;
  totalPages: number;
  percent: number;                // 0-100
  totalReadingTimeMinutes: number;
  lastReadAt: Timestamp;
  startedAt: Timestamp;
  completedAt?: Timestamp;
  interruptedAt?: Timestamp;      // Where user stopped reading
  sessions: ReadingSession[];     // Historical sessions (embedded array)
}

interface ReadingSession {
  id: string;                     // Session ID
  date: string;                    // YYYY-MM-DD
  durationMinutes: number;
  pagesRead: number;
  startedAt: Timestamp;
  endedAt: Timestamp;
}
```

### 3.9 Note Document

**Path**: `users/{uid}/notes/{noteId}`

```typescript
interface Note {
  id: string;                     // Note ID
  uid: string;                     // Owner UID
  title: string;
  content: string;
  type: 'paper' | 'general' | 'synthesis' | 'question';
  paperIds: string[];             // Papers referenced
  collectionIds?: string[];       // Collections this note belongs to
  tags: string[];
  synthesisData?: any;            // AI-generated synthesis
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### 3.10 Highlight Document

**Path**: `users/{uid}/highlights/{highlightId}`

```typescript
interface Highlight {
  id: string;                     // Highlight ID
  uid: string;                     // Owner UID
  paperId: string;                 // Reference to parent paper
  pageNumber: number;             // Page number
  text: string;                   // Highlighted text
  color: 'yellow' | 'blue' | 'green' | 'pink' | 'orange';
  note?: string;                  // Optional note
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

---

## 4. Pagination Strategy

### 4.1 Cursor-Based Pagination

For large collections (papers, notes, highlights):

```typescript
// First page
const firstPage = query(
  collection(db, `users/${uid}/papers`),
  orderBy('createdAt', 'desc'),
  limit(20)
);

// Next page
const nextPage = query(
  collection(db, `users/${uid}/papers`),
  orderBy('createdAt', 'desc'),
  startAfter(lastDocument),
  limit(20)
);
```

### 4.2 Required Composite Indexes

| Collection | Index Fields | Purpose |
|------------|--------------|---------|
| papers | `uid ASC, createdAt DESC` | Default listing |
| papers | `uid ASC, year DESC` | By year sorting |
| papers | `uid ASC, title ASC` | Title search |
| papers | `uid ASC, authors` | Author search (inverted) |
| papers | `uid ASC, category ASC, readingStatus ASC` | Category filter |
| activities | `uid ASC, timestamp DESC` | Recent activity |

---

## 5. Document Size & Batch Limits

| Limit | Max Value |
|-------|-----------|
| Document size | 1 MiB |
| Array elements | 20,000 |
| Fields | 40,000 |
| Batch operations | 500 |
| Write operations per second (per collection) | 10,000 |
| Recommended migration batch size | 450 |
| Storage file size | 100 MiB |

---

## 6. PDF Access Architecture

### 6.1 Recommended Approach: Signed URLs

For secure PDF access:

1. **Client request**: `GET /api/pdf/signed-url?paperId=xxx`
2. **Server verifies**: Firebase ID token and paper ownership
3. **Server generates**: Signed URL via Admin SDK
4. **Client downloads**: Expiring URL

### 6.2 Alternative: getDownloadURL()

Firebase `getDownloadURL()` returns a URL that:
- Contains an embedded Firebase Auth session token
- Is valid for the duration of the user's browser session
- Is **NOT** a cryptographically signed URL with expiration

**Use case**: Direct download when authenticated user already has access.

---

## 7. Migration Data Model

### 7.1 localStorage Keys

- `academic_archive_items_v3` - Papers (array)
- `academic_archive_collections_v2` - Collections (array)
- `academic_archive_notes_v2` - Notes (array)
- `academic_archive_highlights_v2` - Highlights (array)
- `academic_archive_sessions_v2` - Reading sessions (array)
- `academic_archive_goals_v2` - Goals (array)
- `academic_archive_activities_v2` - Activities (array)

### 7.2 Migration Job Document

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
  
  // Entity counts
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
  
  processedCounts: { ... };
  
  // Checksums for verification
  sourceChecksums: { 
    papers: string; 
    collections: string; 
    notes: string; 
    highlights: string;
    sessions: string;
    goals: string;
    pdfs: string;
  };
  targetChecksums?: { 
    papers: string; 
    collections: string; 
    notes: string; 
    highlights: string;
    sessions: string;
    goals: string;
    pdfs: string;
  };
  
  // Recovery
  currentPhase: string;
  phaseProgress: number;
  backupRetentionDays: number;
  recoveredFrom?: string;
  retryCount: number;
}
```

---

## 8. Consistency Matrix

| Entity | Firestore Path | Required Fields | Rules Match | Migration Map |
|--------|----------------|-----------------|-------------|---------------|
| User | `users/{uid}` | uid, email, createdAt | ✅ | ✅ |
| Settings | `users/{uid}/settings/current` | userId, createdAt | ✅ | ✅ |
| Paper | `users/{uid}/papers/{paperId}` | id, title, authors, year, readingStatus, source | ✅ | ✅ |
| PDF | `users/{uid}/papers/{paperId}/PDFs/{pdfId}` | id, paperId, fileName, fileSize, storagePath, mimeType | ✅ | ✅ |
| Annotation | `users/{uid}/papers/{paperId}/annotations/{annotationId}` | id, paperId, content, type | ✅ | ✅ |
| Highlight | `users/{uid}/highlights/{highlightId}` | id, paperId, pageNumber, text, color | ✅ | ✅ |
| Volume | `users/{uid}/volumes/{volumeId}` | id, title, position, paperIds | ✅ | ✅ |
| Collection | `users/{uid}/collections/{collectionId}` | id, name, type | ✅ | ✅ |
| Membership | `users/{uid}/collections/{collectionId}/memberships/{entityId}` | paperId/volumeId, addedAt | ✅ | ✅ |
| ReadingProgress | `users/{uid}/readingProgress/{paperId}` | paperId, status, currentPage, totalPages, percent, sessions | ✅ | ✅ |
| Note | `users/{uid}/notes/{noteId}` | id, title, content, type | ✅ | ✅ |
| Bookmark | `users/{uid}/bookmarks/{bookmarkId}` | id, paperId, pageNumber | ✅ | ✅ |
| Goal | `users/{uid}/goals/{goalId}` | id, type, target, period | ✅ | ✅ |
| Activity | `users/{uid}/activities/{activityId}` | id, type, description, timestamp | ✅ | ✅ |
| MigrationJob | `users/{uid}/migrations/{migrationId}` | id, uid, type, status, progress, startedAt | ✅ | ✅ |

---

*End of Data Architecture Document*
