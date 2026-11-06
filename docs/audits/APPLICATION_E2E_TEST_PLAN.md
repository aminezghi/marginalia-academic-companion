# Application E2E Test Plan

## Marginalia Academic Knowledge Companion

**Plan Date:** 2026-11-03  
**Scope:** End-to-end browser testing of authentication, data sync, and security  
**Prerequisite:** All 103 Firebase security tests pass

---

## Test Environment Setup

### Required
1. Firebase project: `marginalia-academia` (production) or test project
2. Firebase emulators running locally OR production Firebase access
3. Browser testing environment (Chrome/Firefox)
4. Google account for OAuth testing
5. Email account for email/password testing

### Emulator Alternative
```bash
# For local testing with emulators
cd /Users/zouaghiamine/Downloads/marginalia-—-academic-knowledge-companion
npx firebase emulators:start --project marginalia-test-emulator
```

---

## Test Categories

### 1. Authentication Tests

#### 1.1 Google Sign-In
| Test ID | Description | Expected Result |
|---------|-------------|-----------------|
| AUTH-001 | User can sign in with Google | Redirect to Google, return with auth state |
| AUTH-002 | First-time user gets auto-profile | User document created in Firestore |
| AUTH-003 | Profile creation succeeds with rules | Profile matches allowed field schema |

#### 1.2 Email/Password Sign-Up
| Test ID | Description | Expected Result |
|---------|-------------|-----------------|
| AUTH-004 | User can register with email | Account created, user signed in |
| AUTH-005 | DisplayName is stored correctly | Profile.displayName matches input |
| AUTH-006 | Duplicate email rejected | Error message shown |

#### 1.3 Email/Password Sign-In
| Test ID | Description | Expected Result |
|---------|-------------|-----------------|
| AUTH-007 | Registered user can sign in | Redirect to app |
| AUTH-008 | Wrong password rejected | Error message shown |

#### 1.4 Session Management
| Test ID | Description | Expected Result |
|---------|-------------|-----------------|
| AUTH-009 | Page refresh preserves auth | User still signed in |
| AUTH-010 | Auth modal shown when signed out | Modal appears on route change |
| AUTH-011 | Logout clears auth state | Modal shows, user data cleared |

### 2. Data Model Tests

#### 2.1 User Profile
| Test ID | Description | Expected Result |
|---------|-------------|-----------------|
| DATA-001 | Default profile creation succeeds | No PERMISSION_DENIED errors |
| DATA-002 | Profile update works | displayName, photoURL updated |
| DATA-003 | Profile contains required fields only | No embedded arrays in rules |

#### 2.2 Paper Collections
| Test ID | Description | Expected Result |
|---------|-------------|-----------------|
| DATA-004 | Create paper succeeds | Paper added to user's papers |
| DATA-005 | Read own paper succeeds | Paper details displayed |
| DATA-006 | Update own paper succeeds | Changes persisted |
| DATA-007 | Delete own paper succeeds | Paper removed from library |

#### 2.3 Reading Progress
| Test ID | Description | Expected Result |
|---------|-------------|-----------------|
| DATA-008 | Reading progress update by user | Progress saved correctly |

### 3. Storage Tests

#### 3.1 PDF Upload/Download
| Test ID | Description | Expected Result |
|---------|-------------|-----------------|
| STORAGE-001 | PDF upload with valid filename | Upload succeeds, PDF visible |
| STORAGE-002 | PDF filename matches pattern | Format: `{13-digit-timestamp}_{8-hex-uuid}_{name}.pdf` |
| STORAGE-003 | PDF read as owner | Download URL access works |
| STORAGE-004 | PDF denied to other users | PERMISSION_DENIED |
| STORAGE-005 | PDF denied to unauthenticated | PERMISSION_DENIED |
| STORAGE-006 | PDF MIME type validation | Non-PDF rejected |
| STORAGE-007 | PDF size limit enforced | >100MB rejected |

#### 3.2 Avatar Upload
| Test ID | Description | Expected Result |
|---------|-------------|-----------------|
| STORAGE-008 | Avatar upload as PNG | Upload succeeds |
| STORAGE-009 | Avatar MIME type validated | Non-PNG rejected |
| STORAGE-010 | Avatar size limit enforced | >2MB rejected |
| STORAGE-011 | Public avatar read | Unauthenticated can read |
| STORAGE-012 | Avatar delete as owner | Avatar removed |
| STORAGE-013 | Avatar delete by other denied | PERMISSION_DENIED |

#### 3.3 Cover Upload
| Test ID | Description | Expected Result |
|---------|-------------|-----------------|
| STORAGE-014 | Cover upload as JPEG | Upload succeeds |
| STORAGE-015 | Cover MIME type validated | Non-JPEG rejected |
| STORAGE-016 | Cover size limit enforced | >5MB rejected |
| STORAGE-017 | Cover read as owner | Cover visible |
| STORAGE-018 | Cover denied to other users | PERMISSION_DENIED |
| STORAGE-019 | Cover denied to unauthenticated | PERMISSION_DENIED |

#### 3.4 Unauthorized Access
| Test ID | Description | Expected Result |
|---------|-------------|-----------------|
| STORAGE-020 | Unknown path access denied | PERMISSION_DENIED |
| STORAGE-021 | Invalid extension access denied | PERMISSION_DENIED |

### 4. User Isolation Tests

#### 4.1 Cross-User Data Access
Perform tests with User A (creates data) then User B (attempts access):

| Test ID | Data Type | Expected Result |
|---------|-----------|-----------------|
| ISOLATION-001 | User profile | User B cannot read User A's profile |
| ISOLATION-002 | Papers | User B cannot read User A's papers |
| ISOLATION-003 | PDF files | User B cannot download User A's PDFs |
| ISOLATION-004 | Collections | User B cannot read User A's collections |
| ISOLATION-005 | Notes | User B cannot read User A's notes |
| ISOLATION-006 | Highlights | User B cannot read User A's highlights |
| ISOLATION-007 | Bookmarks | User B cannot read User A's bookmarks |
| ISOLATION-008 | Covers | User B cannot read User A's covers |

#### 4.2 Session Switching
| Test ID | Description | Expected Result |
|---------|-------------|-----------------|
| ISOLATION-009 | Logout, then login as different user | Correct user data loaded |
| ISOLATION-010 | Cached data from previous user cleared | No stale data visible |

### 5. Guest Mode Tests

#### 5.1 Guest Functionality
| Test ID | Description | Expected Result |
|---------|-------------|-----------------|
| GUEST-001 | Guest can use app without auth | Features available in read-only mode |
| GUEST-002 | Guest data persists after refresh | localStorage maintains data |
| GUEST-003 | Guest data persists after restart | localStorage survives browser restart |

#### 5.2 Guest Migration
| Test ID | Description | Expected Result |
|---------|-------------|-----------------|
| MIGRATION-001 | Guest can register to save data | All guest data preserved |
| MIGRATION-002 | Guest data migrated to Firestore | Data exists in user document/subcollections |
| MIGRATION-003 | Duplicate migration prevented | Idempotent operation |
| MIGRATION-004 | Source guest data intact | localStorage data verifiable |

---

## Test Execution Checklist

### Pre-Test Setup
- [ ] Configure Firebase project
- [ ] Enable Authentication (Google, Email/Password)
- [ ] Configure Storage bucket rules
- [ ] Verify Firestore rules deployed
- [ ] Create test user accounts (User A, User B)

### Test Execution Order
1. Run all Firebase security tests (103 tests)
2. Execute Authentication Tests
3. Execute Data Model Tests
4. Execute Storage Tests (separate user contexts)
5. Execute User Isolation Tests
6. Execute Guest Mode Tests

### Post-Test Verification
- [ ] No PERMISSION_DENIED for authorized operations
- [ ] PERMISSION_DENIED for unauthorized operations
- [ ] No data leakage between users
- [ ] Guest data preserved during migration

---

## Test Data Requirements

### Test Users
```
User A: test-user-a@example.com (password: TestPass123!)
User B: test-user-b@example.com (password: TestPass123!)
```

### Test Data Files
- Valid PDF (small, proper filename format)
- Invalid PDF (wrong MIME type)
- Large file (>100MB)
- PNG image for avatar
- JPEG image for cover

---

## Automation Scripts

### Browser Test Runner
```bash
# Install Playwright
npm install -D @playwright/test

# Run tests
npx playwright test tests/e2e/
```

### Test Files Structure
```
tests/
├── e2e/
│   ├── auth.spec.ts
│   ├── data-model.spec.ts
│   ├── storage.spec.ts
│   └── isolation.spec.ts
└── security/
    ├── rules-validation.test.js
    ├── storage-security.test.js
    └── firestore-rules-standalone.test.js
```

---

## Success Criteria

| Criterion | Target |
|-----------|--------|
| All Firebase security tests pass | 103/103 |
| All Authentication tests pass | 11/11 |
| All Data Model tests pass | 13/13 |
| All Storage tests pass | 21/21 |
| All Isolation tests pass | 10/10 |
| Guest Mode tests pass | 4/4 |
| **Total** | **162/162** |

---

## Rollback Plan

If tests fail:
1. Do NOT deploy to production
2. Document specific failures
3. Fix application code, NOT security rules
4. Re-run test suite
5. Get approval to proceed

---

## Appendix

### Related Documents
- `APPLICATION_INTEGRATION_AUDIT.md` - Architecture analysis
- `SECURITY_VALIDATION_RESULTS.md` - Firebase security test results
- `FIRESTORE_EMULATOR.RULES` - Firestore security rules
- `STORAGE_EMULATOR.RULES` - Storage security rules

### Firebase References
- Project: marginalia-academia
- Auth Domain: marginalia-academia.firebaseapp.com
- Storage Bucket: marginalia-academia.appspot.com
