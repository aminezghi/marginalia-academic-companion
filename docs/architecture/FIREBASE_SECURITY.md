# FIREBASE SECURITY RULES DOCUMENT
## Marginalia Academic Companion

## Document Version: 3.0
## Date: 2026-11-03

---

## 1. Executive Summary

This document defines production-ready Firebase Security Rules implementing default-deny access, field validation, ownership verification, and proper nested collection security for the Marginalia Academic Companion application.

**IMPORTANT**: The rules in `firestore-emulator.rules` and `storage-emulator.rules` are for EMULATOR-ONLY testing. Production deployment requires separate approval.

---

## 2. Security Principles

### 2.1 Default-Deny Architecture

- All access denied unless explicitly permitted
- No wildcards or overly permissive rules
- Every path must be explicitly validated
- Use `rules_version = '2';` for new features

### 2.2 Ownership Verification

- Users authenticated via Firebase Auth
- UID extracted from `request.auth.uid`
- Never trust client-supplied UID
- Document ID must match path parameter

### 2.3 Field Validation

- Types enforced (string, number, array, timestamp, int, bool)
- Required fields validated
- Value ranges constrained
- Immutable fields protected

---

## 3. Firestore Security Rules

### 3.1 Production Rules File

The complete rules are in `firestore-emulator.rules`. Key sections:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper function for ownership check
    function isOwner(uid) {
      return request.auth != null && request.auth.uid == uid;
    }
    
    // User document - separate read/create/update/delete
    match /users/{uid} {
      allow read: if isOwner(uid);
      allow create: if isOwner(uid) && isValidUserCreate(request.resource.data);
      allow update: if isOwner(uid) && isValidUserUpdate(request.resource.data);
      allow delete: if false;  // Never allow user deletion
    }
    
    // Papers with separate permissions per operation
    match /users/{uid}/papers/{paperId} {
      allow get, list: if isOwner(uid);
      allow create: if isOwner(uid) && paperId == request.resource.data.id && isValidPaper(request.resource.data);
      allow update: if isOwner(uid) && paperId == request.resource.data.id && isValidPaperUpdate(request.resource.data);
      allow delete: if isOwner(uid);
    }
    
    // All other paths follow similar pattern...
  }
}
```

### 3.2 Key Corrections from Previous Version

1. **Removed all `allow: true` wildcards** - every rule is explicit
2. **Separate permissions for read, create, update, delete** - following principle of least privilege
3. **Document ID validation** - `paperId == request.resource.data.id` ensures consistency
4. **Immutable field protection** - `createdAt` cannot be modified
5. **No Firestore queries in rules** - helper functions cannot use `getDocs()` or `query()`

---

## 4. Firebase Storage Security Rules

### 4.1 Storage Rules File

The complete rules are in `storage-emulator.rules`:

```javascript
rules_version = '2';
service cloud.storage {
  match /b/{bucket}/o {
    match /pdfs/{uid}/{fileName} {
      allow read: if request.auth != null 
                    && request.auth.uid == uid
                    && isValidFilename(fileName)
                    && isValidPdfExtension(fileName);
      
      allow write: if request.auth != null 
                   && request.auth.uid == uid
                   && request.resource.contentType == 'application/pdf'
                   && request.resource.size > 0
                   && request.resource.size <= 100 * 1024 * 1024  // 100MB max
                   && isValidFilename(fileName)
                   && isValidPdfExtension(fileName);
      
      function isValidFilename(name) {
        return name.matches('^\\d{13}_[a-fA-F0-9]{8}_[a-zA-Z0-9_-]+\\.pdf$');
      }
      
      function isValidPdfExtension(name) {
        return name.matches('.*\\.pdf$');
      }
    }
    
    match /{all=**} {
      allow read, write: if false;
    }
  }
}
```

### 4.2 Key Security Controls

- **Filename validation**: Must match `timestamp_uuid_name.pdf` pattern
- **Content type check**: Must be `application/pdf`
- **Size limits**: Maximum 100MB
- **Default deny**: All other paths forbidden

---

## 5. PDF Access Model - CORRECTED

### 5.1 getDownloadURL() vs getSignedUrl()

| Feature | getDownloadURL() | getSignedUrl() |
|---------|------------------|----------------|
| Source | Firebase Client SDK | Firebase Admin SDK |
| Auth | Embedded in URL as JWT | Cryptographic signature |
| Expiration | End of browser session | Explicit timestamp |
| Use case | Authenticated browsing | Sharing, time-limited access |
| Security rules | Still apply | Still apply, then signed |

### 5.2 Recommended Access Patterns

**For authenticated users viewing their own PDFs:**
```typescript
const pdfRef = ref(storage, paper.storagePath);
const url = await getDownloadURL(pdfRef);
```

**For sharing/time-limited access:**
```typescript
// Server-side
const [signedUrl] = await file.getSignedUrl({
  action: 'read',
  expires: '2026-11-04T00:00:00Z',
});
```

---

## 6. Development vs Production Rules

### 6.1 Development Rules (Emulator Suite)

For local development and testing using Firebase Emulator Suite, use the provided `firestore-emulator.rules` and `storage-emulator.rules` files. No changes needed for development.

### 6.2 Testing Strategy

Run security tests against Firebase Emulator:

```bash
# Terminal 1: Start emulators
firebase emulators:start --only firestore,storage,auth

# Terminal 2: Run tests
npx jest tests/security/ --no-coverage
```

---

## 7. Acceptance Criteria for Security Testing

- [ ] All Firestore security tests pass on Firebase Emulator
- [ ] All Storage security tests pass on Firebase Emulator
- [ ] No `allow: true` wildcards in rules
- [ ] All document paths explicitly covered
- [ ] Cross-user access properly denied
- [ ] Invalid writes properly rejected
- [ ] Production deployment requires separate approval

---

*End of Security Rules Document*
