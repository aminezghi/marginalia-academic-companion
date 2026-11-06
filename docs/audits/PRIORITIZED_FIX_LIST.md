# Prioritized Fix List - Marginalia Academic Companion

**Date:** 2026-11-04
**Next Step:** Invite External Researchers to Beta Test
**Status:** NOT READY - Requires 5 critical fixes

---

## 🔴 BLOCKERS (Must Fix Before Any Public Access)

### 1. Express Backend Vercel Incompatibility
**Severity:** CRITICAL
**Impact:** Cannot deploy current architecture to Vercel
**Effort:** Medium (4-6 hours)
**Fix Required:**
- Create `/api/gemini-status.js` Vercel Function
- Create `/api/health.js` Vercel Function  
- Create `/api/doi.js` Vercel Function
- Update `vercel.json` configuration
- Modify `package.json` build scripts
- Remove `server.ts` dependency for Vercel

**Files to Create/Modify:**
- `api/gemini-status.js` (new)
- `api/health.js` (new)
- `api/doi.js` (new)
- `vercel.json` (new)
- `package.json` (modify)

---

### 2. Public PDF Download URL Security Risk
**Severity:** HIGH
**Impact:** Users' private PDFs could be accessed via direct URLs
**Effort:** Medium (3-4 hours)
**Fix Required:**
- Implement server-side signed URL generation
- Or use Firebase Storage SDK direct reads
- Or create proxy endpoint for PDF downloads
- Ensure URLs are not stored in Firestore documents

**Files to Modify:**
- `src/hooks/useFirebaseSync.ts` (PDF handling)
- New: Proxy endpoint in Vercel Functions

---

### 3. No Password Reset Functionality
**Severity:** HIGH
**Impact:** Users who forget passwords are locked out
**Effort:** Low (1-2 hours)
**Fix Required:**
- Add "Forgot Password" link to AuthModal
- Enable Firebase Auth password reset
- Add UI for password reset flow
- Test email verification

**Files to Create/Modify:**
- `src/components/AuthModal.tsx` (UI)
- `src/contexts/AuthContext.tsx` (resetPassword function)

---

### 4. No Account Deletion/Export
**Severity:** HIGH
**Impact:** GDPR/privacy compliance risk, users cannot manage data
**Effort:** Medium (3-4 hours)
**Fix Required:**
- Add account deletion button in profile modal
- Implement Firestore document deletion
- Delete Storage files for user
- Add data export functionality
- Add terms of service agreement

**Files to Create/Modify:**
- `src/contexts/AuthContext.tsx` (deleteUser function)
- `src/components/ProfileModal.tsx` (UI)
- New: Export functionality

---

### 5. No Privacy Policy or Terms of Service
**Severity:** MEDIUM
**Impact:** Legal compliance risk for external users
**Effort:** Low (1-2 hours for documentation)
**Fix Required:**
- Create privacy policy page
- Create terms of service page
- Add links in app (footer or settings)
- Add cookie consent if required by law

**Files to Create:**
- `src/pages/Privacy.tsx` (new)
- `src/pages/Terms.tsx` (new)
- `src/components/Footer.tsx` (add links)

---

## ⚠️ HIGH PRIORITY (Fix Within First Week of Deployment)

### 6. CORS and Security Headers
**Severity:** MEDIUM
**Impact:** Potential security vulnerabilities
**Effort:** Low
**Fix Required:**
- Add security headers middleware
- Configure CORS properly
- Add rate limiting to API endpoints

---

### 7. Environment Variables Not Configured
**Severity:** MEDIUM
**Impact:** Deployment will fail
**Effort:** Low
**Fix Required:**
- Set 9 environment variables in Vercel
- Verify Firebase project is production-ready
- Test all authentication flows

---

## ⚠️ MEDIUM PRIORITY (Fix Within First Month)

### 8. No Rate Limiting or Abuse Protection
**Severity:** MEDIUM
**Impact:** Potential for DoS or abuse
**Effort:** Medium
**Fix Required:**
- Implement rate limiting on API endpoints
- Add request validation
- Monitor Firebase usage limits

---

### 9. Error Logging and Monitoring
**Severity:** MEDIUM
**Impact:** Difficult to debug production issues
**Effort:** Medium
**Fix Required:**
- Add error tracking (Sentry or similar)
- Configure logging
- Set up alerts for critical errors

---

## ✨ NICE TO HAVE (For Later Versions)

### 10. Mobile App Support
**Severity:** LOW
**Impact:** Limited mobile experience
**Effort:** High

### 11. Offline Mode Improvements
**Severity:** LOW
**Impact:** Minor enhancement
**Effort:** Medium

### 12. Analytics Integration
**Severity:** LOW
**Impact:** No usage metrics
**Effort:** Low

---

## Deployment Readiness Matrix

| Requirement | Status | Priority | Days to Fix |
|-------------|--------|----------|-------------|
| ✅ Security rules validated | PASS | N/A | N/A |
| ❌ Backend Vercel compatibility | FAIL | BLOCKER | 6 |
| ❌ PDF download security | FAIL | BLOCKER | 4 |
| ❌ Password reset | FAIL | BLOCKER | 2 |
| ❌ Account deletion/export | FAIL | BLOCKER | 4 |
| ❌ Privacy policy | FAIL | BLOCKER | 2 |
| ⚠️ Environment variables | NOT CONFIGURED | HIGH | 1 |
| ⚠️ CORS headers | NOT DONE | HIGH | 1 |

---

## 🚀 Minimum Viable Deployment (MVP)

To invite external researchers, at minimum you need:

1. **Backend conversion** (Vercel Functions) - 6 hours
2. **Password reset** - 2 hours
3. **Environment variables** - 1 hour
4. **Privacy policy** - 2 hours
5. **Security review** - 2 hours

**Total MVP Effort:** ~13 hours

---

## ✅ Post-Deployment Recommendations

After MVP is deployed and stable:

1. Implement PDF download proxy (Security fix #2)
2. Add account deletion/export (Compliance #4)
3. Add rate limiting (Security #8)
4. Add monitoring (Operations #9)
5. Create mobile app (Feature #10)

---

## Summary

**CURRENT STATUS:** ❌ NOT READY FOR EXTERNAL USERS

**Critical Issues:** 5 blockers must be resolved before any public deployment

**Estimated Time to Production:** 2-3 days for experienced developer

**Recommended Next Steps:**
1. Start with backend conversion to Vercel Functions
2. Implement password reset feature
3. Create privacy policy and terms
4. Configure all environment variables
5. Security audit before opening to external users

**GO/NO-GO DECISION:** NO-GO until all BLOCKER items are resolved
