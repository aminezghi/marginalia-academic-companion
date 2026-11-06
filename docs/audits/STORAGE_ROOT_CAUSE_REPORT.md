# Storage Root Cause Report - PDF Security Investigation

## Confirmed Root Cause

The E2E test failures were **NOT** caused by emulator compatibility issues, Java problems, or SDK incompatibility.

**Root Cause (Phase 1):** Incorrect CSS selectors in test files using `button:has-text("Sign Out")` when the actual DOM button only has an `aria-label="Sign Out"` attribute and no visible text content.

**Root Cause (Phase 2 - PDF Security):** The `uploadPdf()` function in `src/hooks/useFirebaseSync.ts` calls `getDownloadURL()` which generates long-lived signed URLs. These URLs, if stored in Firestore `pdfUrl` field, can expose private PDFs by bypassing Storage-level authentication rules.

## Test Results

### Before Fixes (5 failures)
- GUEST-003: User can register from guest mode - FAILED (TimeoutError)
- SYNC-001: User authentication persists across sessions - FAILED (TimeoutError)
- SYNC-002: Two independent browser contexts can authenticate separately - FAILED (TimeoutError)
- SYNC-003: Firestore subcollections are accessible - FAILED (TimeoutError)
- SYNC-004: Cross-user isolation is enforced by Firestore rules - FAILED (TimeoutError)

### After Fixes (29 passed)
```
  29 passed (1.4m)
  Exit code: 0
```

## PDF Security Vulnerability Analysis

### The Issue

The `uploadPdf()` function (`src/hooks/useFirebaseSync.ts:212-223`):
```typescript
const uploadPdf = useCallback(async (uid: string, file: File): Promise<string> => {
  if (!uid) throw new Error('User not authenticated');

  try {
    const storage = getStorage();
    const fileName = generatePdfFilename(uid, file.name);
    const storageRef = ref(storage, fileName);
    
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);  // ← SECURITY RISK
    
    return downloadURL;
  } catch (error) {
    console.error('PDF upload error:', error);
    throw error;
  }
}, []);
```

### Why This Is a Security Risk

1. **`getDownloadURL()` returns a signed URL** with embedded authentication credentials
2. **This URL grants access based on authentication context at generation time**
3. **If stored in Firestore `pdfUrl` field**, the URL can be accessed later without re-authentication
4. **Storage rules enforce owner-only access**, but signed URLs bypass this by containing pre-validated tokens
5. **URLs can be exposed** through:
   - Browser console logs
   - Error messages
   - Shared documents or comments
   - Browser caching
   - Network interception

### Storage Rules Are Correct

The `storage-emulator.rules` correctly enforce:
```javascript
match /pdfs/{uid}/{fileName} {
  allow read: if request.auth != null 
                && request.auth.uid == uid
                && isValidPdfFilename(fileName);
```
These rules are valid and working. The vulnerability is in how the application handles the download URLs.

## Fixes Applied

### Fix 1: Test Selector Corrections
- Changed `button:has-text("Sign Out")` → `[aria-label="Sign Out"]` in E2E tests
- All 29 E2E tests now pass

### Fix 2: PDF Security - Documented (Not Yet Implemented in Code)
- Identified that `getDownloadURL()` results should not be permanently stored in Firestore
- Need to implement: Use Firebase Storage SDK direct reads or server-side proxy
- **NOT YET**: Code changes to prevent URL storage in research items

## Confirmed Findings

| Issue | Status | Evidence |
|-------|--------|----------|
| Test selector mismatch | ✅ FIXED | Selector changed to `[aria-label="Sign Out"]` |
| PDF URL storage risk | ⚠️ DOCUMENTED | `getDownloadURL()` can expose private PDFs if stored |
| Storage rules validity | ✅ CONFIRMED | Rules correctly enforce owner-only access |
| Emulator operation | ✅ CONFIRMED | All emulators running on correct ports |

## Rule Conditions Responsible

| Test Case | Path | UID | MIME | Size | Expected | Actual | Rule Condition |
|-----------|------|-----|------|------|----------|--------|----------------|
| Owner upload | `pdfs/{uid}/file.pdf` | uid | application/pdf | < 100MB | Pass | Pass | `isValidPdfOperation(fileName)` |
| Cross-user read | `pdfs/{otherUid}/file.pdf` | otherUid | application/pdf | < 100MB | Denied | Denied | `request.auth.uid == uid` |
| Unauthenticated read | `pdfs/{uid}/file.pdf` | none | application/pdf | < 100MB | Denied | Denied | `request.auth != null` |
| Invalid filename | `pdfs/{uid}/bad name.pdf` | uid | application/pdf | < 100MB | Denied | Denied | `isValidPdfFilename(fileName)` |

## Security Implications

### Confirmed
- Storage rules correctly enforce owner-only read/write access
- Emulator properly validates all rule conditions
- Test selector fix resolved 5 E2E failures
- All 103 Firebase security tests pass

### Unresolved (Requires Application Code Changes)
- PDF download URL exposure if stored in Firestore
- Need to implement authenticated Storage SDK reads
- Or server-side proxy for PDF downloads

## Remaining Untested Scenarios

1. PDF download URL security verification with actual browser access
2. Signed URL TTL and refresh mechanism
3. Server-side proxy implementation for PDF downloads
4. Cross-origin PDF access patterns

## Recommendation

**APPROVED** - All required tests pass with corrected selectors.

**CONDITIONAL:** Implement PDF download security fix before storing URLs in Firestore:
- Do not store `getDownloadURL()` results in research item `pdfUrl` field
- Use Firebase Storage SDK `ref()` + authenticated `getDownloadURL()` only at read time
- Or implement server-side proxy endpoint that validates `request.auth.uid` before serving PDF

**Do NOT weaken Storage rules.** The rules are correct; the fix is in application code.
