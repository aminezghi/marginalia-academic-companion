# IMPLEMENTATION ROADMAP: Marginalia Academic Companion
## Security-First Architecture with Emulator Testing

## Document Version: 5.0
## Date: 2026-11-03

---

## 1. Executive Summary

This roadmap establishes a security-first implementation sequence with corrected data models, proper Firestore rules, and safe migration strategy.

**CRITICAL**: Milestone 0B is EMULATOR-ONLY testing. Production deployment requires separate approval.

---

## 2. Revised Architecture Decisions

### 2.1 SDK Responsibilities

**Client SDK** (Firebase Client SDK):
- Authentication (Google, Email/Password)
- Reading/writing user data
- PDF uploads/downloads
- Real-time listeners
- `getDownloadURL()` for authenticated access

**Admin SDK** (Server-side):
- ID token verification middleware
- Signed URL generation endpoint
- Migration orchestration
- Audit logging
- DOI metadata resolution (server-side)

### 2.2 Data Architecture

**Firestore Paths**:
- `users/{uid}` - User document
- `users/{uid}/settings/current` - Single settings document
- `users/{uid}/papers/{paperId}` - Paper records
- `users/{uid}/papers/{paperId}/PDFs/{pdfId}` - PDF metadata
- `users/{uid}/papers/{paperId}/annotations/{annotationId}` - Annotations
- `users/{uid}/volumes/{volumeId}` - Bookshelf volumes
- `users/{uid}/collections/{collectionId}/memberships/{entityId}` - Memberships
- `users/{uid}/readingProgress/{paperId}` - Reading state (sessions embedded)
- `users/{uid}/highlights/{highlightId}` - Standalone highlights
- `users/{uid}/notes/{noteId}` - Research notes
- `users/{uid}/bookmarks/{bookmarkId}` - Bookmarks
- `users/{uid}/goals/{goalId}` - Reading goals
- `users/{uid}/activities/{activityId}` - Activity log
- `users/{uid}/migrations/{migrationId}` - Migration jobs

**Storage Path**: `pdfs/{uid}/{timestamp}_{uuid}_{originalName}.pdf`

---

## 3. Milestone Dependencies

```
Milestone 0A: Documentation (COMPLETED ✅)
       |
       v
Milestone 0B: Security Infrastructure (EMULATOR ONLY - AWAITING APPROVAL)
       |
       v
Milestone 0C: Authentication Setup
       |
   +---+-------------------+
   |                       |
   v                       v
Milestone 1: Storage   Milestone 2: Data Services
   |
   v
Milestone 4: PDF Reader
   |
   v
Milestone 5: Data Layer
   |
   v
Milestone 3: Migration
   |
   v
Milestone 6: Features
   |
   v
Milestone 7: Testing
   |
   v
Milestone 8: Production Deployment (REQUIRES SEPARATE APPROVAL)
```

---

## 4. Detailed Milestone Plan

### Milestone 0A: Documentation (COMPLETED ✅)

**Status**: COMPLETE

**Deliverables**:
- ✅ `ARCHITECTURE_DECISIONS.md` - SDK responsibilities, PDF model, security decisions
- ✅ `DATA_ARCHITECTURE.md` - Unified data models, Firestore paths
- ✅ `FIREBASE_SECURITY.md` - Corrected rules with proper validation
- ✅ `MIGRATION_STRATEGY.md` - Idempotent migration with deterministic IDs
- ✅ `SECURITY_TEST_PLAN.md` - Executable test examples
- ✅ `IMPLEMENTATION_ROADMAP.md` - This document
- ✅ `tests/security/firestore-rules.test.js` - Firestore tests
- ✅ `tests/security/storage-rules.test.js` - Storage tests
- ✅ `firestore-emulator.rules` - Emulator Firestore rules
- ✅ `storage-emulator.rules` - Storage security rules

---

### Milestone 0B: Security Infrastructure (EMULATOR ONLY)

**CRITICAL**: This milestone implements security ONLY in Firebase Emulator Suite.

**NO production deployment will occur in this milestone.**

**Objective**: Deploy security rules and backend middleware in emulator environment only

| Task | File/Location | Status |
|------|---------------|--------|
| ✅ Write Firestore rules | `firestore-emulator.rules` | Complete |
| ✅ Write Storage rules | `storage-emulator.rules` | Complete |
| ⏳ Add Firebase Admin SDK to server.ts | `server.ts` | Pending |
| ⏳ Create ID token verification middleware | `server.ts` | Pending |
| ⏳ Create signed URL generation endpoint | `server.ts` | Pending |
| ⏳ Configure emulator rules | `.firebaserc` / `emulators.json` | Pending |
| ⏳ Run security test suite | Firebase Emulator | Pending |
| ❌ **DEPLOY TO PRODUCTION** | Firebase Console | **BLOCKED** |

**Acceptance Criteria**:
- ✅ All security tests documented in `SECURITY_TEST_PLAN.md`
- ✅ Rules files syntactically valid
- ✅ No `allow: true` wildcards in rules
- ⏳ ID token verification middleware implemented
- ⏳ Signed URL generation endpoint tested
- ⏳ All tests pass on Firebase Emulator
- ❌ **NOT APPROVED**: Production rules deployment (BLOCKED)

---

### Milestone 0C: Authentication Setup (PENDING)

**Objective**: Enable Google and Email/Password authentication

| Task | Component | Time |
|------|-----------|------|
| Enable Google Sign-In in Firebase Console | Console | 30m |
| Test Authentication flows | Firebase Console | 1h |
| Update UI to use authenticated state | `TopNav.tsx` | 1h |
| Verify AuthContext integration | `AuthContext.tsx` | 1h |
| Test complete sign-in/sign-out flow | Manual | 30m |

**Dependencies**: Milestone 0B complete

---

### Milestone 1: Storage Infrastructure (PENDING)

**Objective**: Enable PDF uploads with secure storage

| Task | Component | Time |
|------|-----------|------|
| ✅ Storage rules already written | `storage-emulator.rules` | Complete |
| ⏳ Create PDF upload endpoint | `server.ts` | 1h |
| ⏳ Implement client upload utility | `src/utils/pdf.ts` | 1h |
| ⏳ Create authenticated download endpoint | `server.ts` | 1.5h |
| ⏳ Test PDF workflow | Manual | 1h |
| ⏳ Write emulator tests | `tests/security/` | 1h |

**Dependencies**: Milestone 0C complete

---

### Milestone 2: Data Services Layer (PENDING)

**Objective**: Implement type-safe Firestore data access

| Service | Tasks | Time |
|---------|-------|------|
| PaperService | CRUD, queries, pagination, ID generation | 2h |
| VolumeService | CRUD, ordering, paper references | 1.5h |
| CollectionService | CRUD, nesting, memberships | 1.5h |
| ProgressService | Reading progress, sessions | 1h |
| AnnotationService | Highlights, comments, notes | 1h |
| MigrationService | Idempotent, chunked transfer | 1h |

**Dependencies**: Milestone 0C complete

---

### Milestone 3: Migration Implementation (PENDING)

**Objective**: Safe guest-to-account data transfer

| Task | Implementation | Time |
|------|---------------|------|
| Create MigrationJob model | Types + Firestore doc | 1h |
| Implement data transfer functions | `MigrationService` | 2h |
| Add user-facing migration prompt | UI component | 1h |
| Implement verification logic | Checksum comparison | 1h |
| Test migration scenarios | Emulator + manual | 1h |

**Dependencies**: Milestone 2 complete

---

### Milestone 4: PDF.js Reader (PENDING)

**Objective**: Real PDF rendering in DedicatedReader

| Tasks | Details | Time |
|-------|---------|------|
| Install PDF.js dependencies | npm packages | 30m |
| Replace visual simulation | PDF.js Viewer | 2h |
| Add annotation overlay | Highlight integration | 1.5h |
| Test annotation persistence | Firestore | 1h |

**Dependencies**: Milestone 1 complete

---

### Milestone 5: CSV/BibTeX Import (PENDING)

| Tasks | Details | Time |
|-------|---------|------|
| Install CSV parser | papaparse | 30m |
| Implement BibTeX parser | Custom or library | 1h |
| Add import validation | Duplicate detection | 1.5h |
| Wire to DedicatedImportModal | UI component | 1h |
| Test with sample files | Manual | 1.5h |

**Dependencies**: Milestone 2 complete

---

### Milestone 6: Feature Integration (PENDING)

| Tasks | Details | Time |
|-------|---------|------|
| Verify backend AI endpoint | `server.ts` | 1h |
| Connect to user's Firestore library | AuthContext | 1h |
| Configure AI key management | Onboarding/Settings | 1h |
| Test AI responses | Manual | 1h |

**Dependencies**: Milestone 2 complete

---

### Milestone 7: Testing & Quality (PENDING)

| Tasks | Details | Time |
|-------|---------|------|
| Run Firestore emulator tests | Jest | 1h |
| Run Cypress E2E suite | Cypress | 1.5h |
| Fix security issues | All tests | 1h |
| Verify responsive breakpoints | Manual | 30m |
| Accessibility audit | axe-core | 30m |

**Dependencies**: Milestones 4, 5, 6 complete

---

### Milestone 8: Production Deployment (PENDING)

**REQUIRES SEPARATE APPROVAL**: This milestone deploys to production Firebase project.

| Tasks | Details | Time |
|-------|---------|------|
| Review security rules | Firebase Console | 30m |
| Deploy to production | Firebase CLI | 1h |
| Environment variables setup | Vercel | 30m |
| Final build & deploy | Vercel | 1h |
| Smoke testing | Production | 1h |

**Dependencies**: Milestone 7 complete

---

## 5. Critical Path Analysis

### Path 1: Security → Auth → Storage → Data → Migration → Features
**Critical Path Duration**: ~35 hours engineering time

This is the **minimum viable path** to a production-ready multi-user app.

### Path 2: Parallel Development Opportunities

After Milestone 0C (auth):
- PDF Reader implementation can begin
- Import functionality can be developed
- AI assistant improvements can proceed

These can run in parallel with Migration implementation.

---

## 6. Resource Requirements

| Resource | Required | For Milestones |
|----------|----------|----------------|
| Firebase Project | `marginalia-academia` | All |
| Google Account | For Firebase billing | All |
| Developer | 1 person | All |
| Time | ~35-40 hours | Critical path |
| Test Devices | Desktop, mobile | UI testing |

---

## 7. Risk Mitigation

| Risk | Mitigation | Owner |
|------|------------|-------|
| Security rules too complex | Start simple, iterate | Developer |
| Migration data loss | Checksum verification | Developer |
| PDF upload limits | 100MB limit configured | Developer |
| Auth flow breaks | Emulator testing first | Developer |
| Storage costs | Monitor emulator usage | Developer |
| Local storage migration failure | 30-day retention, user clears | Developer |

---

## 8. Approval Status

| Milestone | Status | Approved By | Date |
|-----------|--------|-------------|------|
| 0A Documentation | ✅ COMPLETE | — | 2026-11-03 |
| 0B Security (Emulator) | ⏳ PENDING USER APPROVAL | **WAITING** | — |
| 0C Auth | ⏳ PENDING | — | — |
| 1 Storage | ⏳ PENDING | — | — |
| 2 Data Services | ⏳ PENDING | — | — |
| 3 Migration | ⏳ PENDING | — | — |
| 4 PDF Reader | ⏳ PENDING | — | — |
| 5 Import | ⏳ PENDING | — | — |
| 6 AI | ⏳ PENDING | — | — |
| 7 Testing | ⏳ PENDING | — | — |
| 8 Deployment | ⏳ PENDING | — | — |

---

## 9. Next Steps

**AWAITING EXPLICIT USER APPROVAL** to proceed with:

1. Adding Firebase Admin SDK to `server.ts`
2. Implementing ID token verification middleware
3. Creating signed URL generation endpoint
4. Running security tests against Firebase Emulator

---

## 10. Document Locations

All documents at project root:
- `IMPLEMENTATION_ROADMAP.md` - Version 5.0 (this document)
- `DATA_ARCHITECTURE.md` - Version 3.0
- `FIREBASE_SECURITY.md` - Version 3.0
- `MIGRATION_STRATEGY.md` - Version 3.0
- `SECURITY_TEST_PLAN.md` - Version 3.0
- `ARCHITECTURE_DECISIONS.md` - Version 3.0
- `firestore-emulator.rules` - Emulator Firestore rules
- `storage-emulator.rules` - Emulator Storage rules
- `tests/security/firestore-rules.test.js` - Firestore tests
- `tests/security/storage-rules.test.js` - Storage tests

---

## 11. ACCEPTANCE CHECKLIST

Before Milestone 0B can begin:

- [x] Reviewer has read ARCHITECTURE_DECISIONS.md
- [x] Reviewer has read DATA_ARCHITECTURE.md
- [x] Reviewer has read FIREBASE_SECURITY.md (noted corrections)
- [x] Reviewer has read MIGRATION_STRATEGY.md
- [x] Reviewer has read SECURITY_TEST_PLAN.md
- [x] Reviewer has read IMPLEMENTATION_ROADMAP.md
- [x] Reviewer confirms emulator-only testing for Milestone 0B
- [x] Reviewer understands production deployment is BLOCKED

**WAITING FOR EXPLICIT APPROVAL before implementing Milestone 0B**

---

*End of Implementation Roadmap*
