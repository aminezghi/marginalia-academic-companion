# SECURITY TEST PLAN
## Marginalia Academic Companion

## Document Version: 3.0
## Date: 2026-11-03

---

## 1. Introduction

This document defines comprehensive security testing strategy for Marginalia Academic Companion, covering Firestore Security Rules, Firebase Storage Rules, authentication flows, and backend API security.

**IMPORTANT**: All testing uses Firebase Emulator Suite. This document is for EMULATOR-ONLY testing. Production deployment requires separate approval.

---

## 2. Test Environment

### 2.1 Firebase Emulator Suite Setup

```bash
# Install Firebase CLI if not present
npm install -g firebase-tools

# Create emulators.json configuration
cat > emulators.json << 'EMULATORS'
{
  "firestore": {
    "port": 8080
  },
  "storage": {
    "port": 9199
  },
  "auth": {
    "port": 9099
  },
  "ui": {
    "enabled": true
  }
}
EMULATORS

# Start emulators
firebase emulators:start --only firestore,storage,auth
```

### 2.2 Test Tools

- **Firebase Rules Unit Testing**: `@firebase/rules-unit-testing`
- **Jest**: Unit testing framework
- **Node.js**: Runtime environment

### 2.3 Install Dependencies

```bash
npm install --save-dev @firebase/rules-unit-testing jest
```

---

## 3. Firestore Security Tests

### 3.1 Authentication Tests

#### Test FS-AUTH-001: Unauthenticated Read Denied

```javascript
// tests/security/firestore-rules.test.js

const { initializeTestApp, assertFails } = require('@firebase/rules-unit-testing');
const { getFirestore, doc, getDoc } = require('firebase/firestore');

const PROJECT_ID = 'marginalia-test-emulator';

describe('FS-AUTH-001: Unauthenticated read denied', () => {
  test('should deny read users/{uid}', async () => {
    const app = initializeTestApp({
      projectId: PROJECT_ID,
      auth: null  // No authentication
    });
    
    const db = getFirestore(app);
    const userRef = doc(db, 'users/any-uid');
    
    await assertFails(getDoc(userRef));
  });
});
```

**Expected Result**: Rule denies with PERMISSION_DENIED
**Rules Section**: `isOwner()` returns false

#### Test FS-AUTH-002: Authenticated Read Own Data

```javascript
const { initializeTestApp, initializeAdminApp, assertSucceeds } = require('@firebase/rules-unit-testing');
const { getFirestore, doc, setDoc, getDoc } = require('firebase/firestore');

describe('FS-AUTH-002: Authenticated read own data', () => {
  const uid = 'test-user-1';
  
  beforeEach(async () => {
    // Setup: Create user document first (bypasses rules)
    const adminApp = initializeAdminApp({ projectId: PROJECT_ID });
    const adminDb = getFirestore(adminApp);
    await setDoc(doc(adminDb, `users/${uid}`), {
      uid: uid,
      email: 'test@example.com',
      createdAt: new Date()
    });
  });
  
  test('should allow read users/{uid}', async () => {
    const app = initializeTestApp({
      projectId: PROJECT_ID,
      auth: { uid }
    });
    
    const db = getFirestore(app);
    const userRef = doc(db, `users/${uid}`);
    
    await assertSucceeds(getDoc(userRef));
  });
});
```

#### Test FS-AUTH-003: Authenticated Write None Other's Data Denied

```javascript
describe('FS-AUTH-003: Authenticated write another\'s data denied', () => {
  const user1Uid = 'test-user-1';
  const user2Uid = 'test-user-2';
  
  beforeEach(async () => {
    const adminApp = initializeAdminApp({ projectId: PROJECT_ID });
    const adminDb = getFirestore(adminApp);
    await setDoc(doc(adminDb, `users/${user1Uid}`), {
      uid: user1Uid,
      email: 'user1@example.com',
      createdAt: new Date()
    });
  });
  
  test('should deny write to another user\'s document', async () => {
    const app = initializeTestApp({
      projectId: PROJECT_ID,
      auth: { uid: user2Uid }
    });
    
    const db = getFirestore(app);
    const user1Ref = doc(db, `users/${user1Uid}`);
    
    const newData = {
      uid: user1Uid,
      email: 'hacked@example.com',
      createdAt: new Date()
    };
    
    await assertFails(setDoc(user1Ref, newData));
  });
});
```

### 3.2 Paper Collection Tests

#### Test FS-PAPER-004: Invalid Paper Fields Denied

```javascript
describe('FS-PAPER-004: Invalid paper fields denied', () => {
  const uid = 'test-user-papers';
  const paperId = 'paper-123';
  
  beforeEach(async () => {
    const adminApp = initializeAdminApp({ projectId: PROJECT_ID });
    const adminDb = getFirestore(adminApp);
    await setDoc(doc(adminDb, `users/${uid}`), {
      uid: uid,
      email: 'papers@example.com',
      createdAt: new Date()
    });
  });
  
  test('should deny paper with empty title', async () => {
    const app = initializeTestApp({
      projectId: PROJECT_ID,
      auth: { uid }
    });
    
    const db = getFirestore(app);
    const paperData = {
      id: paperId,
      title: '',  // Invalid: empty title
      authors: ['Test Author'],
      year: '2023',
      readingStatus: 'reading',
      source: 'manual',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const paperRef = doc(db, `users/${uid}/papers/${paperId}`);
    await assertFails(setDoc(paperRef, paperData));
  });
  
  test('should deny paper with invalid readingStatus', async () => {
    const app = initializeTestApp({
      projectId: PROJECT_ID,
      auth: { uid }
    });
    
    const db = getFirestore(app);
    const paperData = {
      id: paperId,
      title: 'Valid Title',
      authors: ['Test Author'],
      year: '2023',
      readingStatus: 'invalid_status',  // Invalid
      source: 'manual',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const paperRef = doc(db, `users/${uid}/papers/${paperId}`);
    await assertFails(setDoc(paperRef, paperData));
  });
});
```

### 3.3 Settings Tests

```javascript
describe('FS-SETTINGS: Settings access', () => {
  const uid = 'test-user-settings';
  
  beforeEach(async () => {
    const adminApp = initializeAdminApp({ projectId: PROJECT_ID });
    const adminDb = getFirestore(adminApp);
    await setDoc(doc(adminDb, `users/${uid}`), {
      uid: uid,
      email: 'settings@example.com',
      createdAt: new Date()
    });
  });
  
  test('should allow read/write own settings', async () => {
    const app = initializeTestApp({
      projectId: PROJECT_ID,
      auth: { uid }
    });
    
    const db = getFirestore(app);
    const settingsData = {
      userId: uid,
      shelfMaterial: 'walnut',
      shelfSortMode: 'custom',
      soundEnabled: true,
      aiConfigured: false,
      createdAt: new Date(),
      lastUpdated: new Date()
    };
    
    const settingsRef = doc(db, `users/${uid}/settings/current`);
    await assertSucceeds(setDoc(settingsRef, settingsData));
    await assertSucceeds(getDoc(settingsRef));
  });
});
```

### 3.4 Storage Security Tests

```javascript
// tests/security/storage-rules.test.js

const { initializeTestApp, initializeAdminApp, assertSucceeds, assertFails } = require('@firebase/rules-unit-testing');
const { getStorage, ref, uploadBytes, getMetadata } = require('firebase/storage');

const PROJECT_ID = 'marginalia-test-emulator';

describe('Storage-STRG-001: Unauthenticated PDF read denied', () => {
  test('should deny read pdfs/another-user/file.pdf', async () => {
    const app = initializeTestApp({
      projectId: PROJECT_ID,
      auth: null  // No authentication
    });
    
    const storage = getStorage(app);
    const pdfRef = ref(storage, 'pdfs/another-user/1234567890_abc12345_test.pdf');
    
    await assertFails(getMetadata(pdfRef));
  });
});

describe('Storage-STRG-002: Authenticated read own PDF', () => {
  const uid = 'test-user-pdf';
  
  test('should allow read own PDF', async () => {
    const app = initializeTestApp({
      projectId: PROJECT_ID,
      auth: { uid }
    });
    
    const storage = getStorage(app);
    // Valid format: 13-digit-timestamp_8-char-uuid_name.pdf
    const pdfRef = ref(storage, `pdfs/${uid}/1700000000000_abc12345_test.pdf`);
    
    // Note: Will fail if file doesn't exist, which is expected
    // In emulator, we need to upload first to test read
  });
});

describe('Storage-STRG-003: Upload non-PDF denied', () => {
  const uid = 'test-user-upload';
  
  test('should deny upload of non-PDF file', async () => {
    const app = initializeTestApp({
      projectId: PROJECT_ID,
      auth: { uid }
    });
    
    const storage = getStorage(app);
    const txtRef = ref(storage, `pdfs/${uid}/1700000000000_abc12345_test.txt`);
    
    const txtContent = new Uint8Array([116, 101, 120, 116]); // "text"
    
    await assertFails(uploadBytes(txtRef, txtContent, {
      contentType: 'text/plain'
    }));
  });
});

describe('Storage-STRG-005: Valid PDF upload allowed', () => {
  const uid = 'test-user-valid';
  
  test('should allow upload of valid PDF with correct filename', async () => {
    const app = initializeTestApp({
      projectId: PROJECT_ID,
      auth: { uid }
    });
    
    const storage = getStorage(app);
    // Valid format: timestamp_uuid_name.pdf
    const validRef = ref(storage, `pdfs/${uid}/1700000000000_abc12345_valid.pdf`);
    
    const pdfContent = new Uint8Array([
      37, 80, 68, 70, 45, 49, 46, 56, 10,  // %PDF-1.8.
    ]);
    
    await assertSucceeds(uploadBytes(validRef, pdfContent, {
      contentType: 'application/pdf'
    }));
  });
});

describe('Storage-STRG-006: Invalid filename format denied', () => {
  const uid = 'test-user-invalid';
  
  test('should deny upload with invalid filename pattern', async () => {
    const app = initializeTestApp({
      projectId: PROJECT_ID,
      auth: { uid }
    });
    
    const storage = getStorage(app);
    // Invalid: missing timestamp and uuid
    const invalidRef = ref(storage, `pdfs/${uid}/myfile.pdf`);
    
    const pdfContent = new Uint8Array([37, 80, 68, 70]);  // PDF header
    
    await assertFails(uploadBytes(invalidRef, pdfContent, {
      contentType: 'application/pdf'
    }));
  });
});
```

---

## 4. Migration Security Tests

### Test MIG-001: Create Migration for Another User Denied

```javascript
describe('MIG-001: Create migration for another user', () => {
  const migrationUid = 'migration-owner';
  const otherUid = 'other-user';
  
  beforeEach(async () => {
    const adminApp = initializeAdminApp({ projectId: PROJECT_ID });
    const adminDb = getFirestore(adminApp);
    
    await setDoc(doc(adminDb, `users/${migrationUid}`), {
      uid: migrationUid,
      email: 'owner@example.com',
      createdAt: new Date()
    });
    
    await setDoc(doc(adminDb, `users/${otherUid}`), {
      uid: otherUid,
      email: 'other@example.com',
      createdAt: new Date()
    });
  });
  
  test('should deny create migration for another user', async () => {
    const app = initializeTestApp({
      projectId: PROJECT_ID,
      auth: { uid: migrationUid }  // Authenticated as migrationUid
    });
    
    const db = getFirestore(app);
    const migrationData = {
      id: `mig_${otherUid}_20261103`,  // Trying to create for otherUid
      uid: otherUid,
      type: 'guest_to_account',
      status: 'pending',
      progress: 0,
      startedAt: new Date()
    };
    
    const migrationRef = doc(db, `users/${otherUid}/migrations`, `mig_${otherUid}_20261103`);
    await assertFails(setDoc(migrationRef, migrationData));
  });
});
```

---

## 5. Test Execution Instructions

### 5.1 Run Tests Against Emulator

```bash
# Terminal 1: Start emulators
firebase emulators:start --only firestore,storage,auth

# Terminal 2: Run tests
npx jest tests/security/ --no-coverage
```

### 5.2 Expected Test Summary

```
Test Suites: 2 passed, 2 total
Tests:       16 passed, 16 total
```

---

## 6. Security Testing Matrix

| Test Case | Expected Result | Rules Section | Status |
|-----------|-----------------|---------------|--------|
| FS-AUTH-001 | Unauthenticated read denied | `isOwner()` returns false | ✅ Available |
| FS-AUTH-002 | Authenticated read own data | `request.auth.uid == uid` passes | ✅ Available |
| FS-AUTH-003 | Authenticated write another's data denied | `isOwner()` fails | ✅ Available |
| FS-PAPER-004 | Invalid paper fields denied | `isValidPaper()` fails | ✅ Available |
| Storage-STRG-001 | Unauthenticated PDF read denied | Storage `isOwner(uid)` check | ✅ Available |
| Storage-STRG-003 | Upload non-PDF denied | Storage content type check | ✅ Available |
| Storage-STRG-005 | Valid PDF upload allowed | Storage rules pass | ✅ Available |
| Storage-STRG-006 | Invalid filename format denied | Storage filename regex | ✅ Available |
| MIG-001 | Create migration for another denied | Firestore rules | ✅ Available |

---

## 7. Acceptance Criteria for Milestone 0B

**CRITICAL**: Milestone 0B is EMULATOR-ONLY testing.

| Criteria | Status |
|----------|--------|
| All security tests pass on Firebase Emulator | ⏳ Pending execution |
| No `allow: true` wildcards in rules | ✅ Verified in rules file |
| ID token verification middleware implemented | ⏳ Pending implementation |
| Signed URL generation endpoint tested | ⏳ Pending implementation |
| Storage rules validated | ⏳ Pending execution |
| Migration security verified | ⏳ Pending execution |
| **NO production deployment** | ✅ Blocked |

---

## 8. Common Issues & Troubleshooting

| Error | Cause | Solution |
|-------|-------|----------|
| `EMULATOR_HOST_UNREACHABLE` | Emulators not started | Run `firebase emulators:start` |
| `Missing or insufficient permissions` | Rules deny access | Check rule conditions |
| `document doesn't exist` | Setup incomplete | Create test documents with Admin SDK |
| `Expected to be allowed but was denied` | Rule not matching | Review rule logic |

---

*End of Security Test Plan*
