# Marginalia — Local Functionality Repair Report

Date: 2026-11-04 (Europe/Paris)  
Project: `C:\Users\azoua\Documents\marginalia-—-academic-knowledge-companion`  
Branch / commit: `main` / `726f4f6dd37136d32fb991309a6d02f5500f5427` (`Initial commit with architecture docs`)

## Professional verification approach

1. A senior application engineer would trace the critical user journeys end to end: guest PDF import and reopen, authenticated PDF upload and read, first account creation, subsequent login, stored settings, and viewport behavior. They would also prove the app fails closed when emulator settings are missing or point at the wrong project.
2. The rawest useful evidence is the current source and rule files, exact PDF bytes, actual browser canvas/text-layer output, Firebase emulator requests/logs, and a clean lockfile install. Prior audit reports are useful for orientation but do not prove current behavior.
3. Methods used here: `npm ci`, TypeScript check, Vite production build, Firebase Auth/Firestore/Storage emulators under the explicit `marginalia-test-emulator` project, Playwright browser journeys, direct canvas/text-layer assertions, REST metadata inspection with the signed-in emulator token, and viewport measurements at all eight target widths.
4. Independent evidence is provided by repeatable local tests and emulator behavior, rather than the visual impression of the app alone. The final suite passed 106 rule tests and 32 browser E2E tests; the PDF tests inspect rendered output and authorization errors as well as user-visible controls.

The Vercel React best-practices and Web Design Guidelines skills were applied to lazy-load the heavy PDF reader, keep rendering work bounded to nearby pages, and validate responsive layout and overflow. Firebase Auth guidance informed the local-only provider test strategy; emulator Google simulation is kept distinct from real Google OAuth.

## Result

**READY for local development with the emulator command below.** The core guest and email/password journeys, PDF reading, attachment of a real user-supplied PDF to an existing metadata record, private storage access, profile/settings schema, and responsive header are verified. This is not a production-readiness claim. The real Google OAuth service is not exercised by the Auth Emulator, and the online Gemini feature needs a user-provided API key.

## Environment

| Finding | Status | Evidence |
|---|---|---|
| Windows | VERIFIED | Windows 11 Home, build 26300 |
| Node.js / npm | VERIFIED | Node `v24.22.2`, npm `11.19.1` |
| Git | VERIFIED with issue | Git `2.55.0.windows.3`; branch and HEAD are readable, but Git reports a non-monotonic AppleDouble pack index (details below). |
| Java | VERIFIED | OpenJDK `21.0.13` |
| Firebase CLI | VERIFIED | `15.34.2` from the project dependency |
| Playwright | VERIFIED | `1.64.1`; Chromium browser ran the E2E suite successfully |
| Free disk | READY | About 162.4 GB free on C: |
| Lockfile install | VERIFIED | `npm ci` completed successfully: 1,037 packages installed |
| Dependency audit | UNVERIFIED | npm reports 39 dependency vulnerabilities: 4 low, 29 moderate, 6 high. Dependencies were not force-upgraded as part of this repair. |

## Architecture and configuration

- React 19 + TypeScript + Vite client, with an Express development server in `server.ts`.
- Firebase Auth, Firestore and Storage client SDKs. Guest data remains independent of Firebase Auth; guest PDF bytes are stored in IndexedDB.
- React-PDF/PDF.js renders actual PDF pages. Authenticated PDF bytes are read using Firebase Storage SDK `getBytes` after verifying the owner path.
- `.env` and `.env.e2e.local` are present. Both select project ID `marginalia-test-emulator` and enable emulators. `.env.local` is absent (optional). `.env.example` documents `GEMINI_API_KEY`, Firebase variables, `APP_URL`, `PORT`, `VITE_USE_FIREBASE_EMULATORS` and `E2E_TEST`. No secret values are included here.
- Playwright config loads `.env.e2e.local`, rejects a non-test project or disabled emulator mode, and starts its own app server. E2E commands below also start only local emulators with an explicit project ID.
- `.firebaserc` still has `marginalia-academia` as its default alias. `dev:local` and all test commands override this with `--project marginalia-test-emulator`; no production Firebase connection was used.
- `src/config/firebase.ts` requires the dedicated test project when emulator mode is enabled and refuses that test project when emulators are disabled. The checked-in local `.env` uses the emulator project. This guard protects local use; do not change `.env` to production values while running `dev:local`.
- Firebase Auth/Firestore/Storage rules were not weakened in this repair. Existing strict root profile rules require settings to live in the settings document.

### Run locally on Windows

The verified command starts the app and its local Auth, Firestore and Storage emulators together:

```powershell
npm ci
npm run dev:local
```

Open `http://localhost:3000`. The `dev:local` script passes `--project marginalia-test-emulator`; stop the app and emulators with Ctrl+C in that terminal. The local smoke check returned HTTP 200 from `/api/health`; Auth, Firestore and Storage emulator ports 9099, 8080 and 9199 were reachable. Firebase Emulator UI port 4000 was not listening under this startup command (MISSING); the app and tests do not depend on the dashboard.

The current `.env` is already configured for local emulators. When setting up from a clean copy, preserve any existing `.env`; if creating one from `.env.example`, set `VITE_FIREBASE_PROJECT_ID=marginalia-test-emulator` and `VITE_USE_FIREBASE_EMULATORS=true` before using `dev:local`. A valid `GEMINI_API_KEY` is needed only for the online Gemini feature; none is configured in this environment.

## Repair details

| Area | Status | Root cause and verified correction |
|---|---|---|
| PDF display | VERIFIED | The import flow previously read PDF bytes as text and supplied synthetic text to the reader; there was no real PDF page renderer. Added React-PDF with a Vite-resolved PDF.js worker, actual page dimensions, text/annotation layers, loading/error states, continuous scrolling, visible-page synchronization, page navigation, zoom and fit-to-width. Nearby pages render lazily. |
| Guest PDFs | VERIFIED | Guest imports now store PDF bytes in IndexedDB and retain the local key in paper metadata. Reload/reopen reads the same local file. Guest mode requires no Firebase session. |
| Authenticated PDFs | VERIFIED | Upload persists bytes in Firebase Storage and metadata in the user’s papers collection. Reads use authenticated Storage SDK `getBytes`; no persistent `getDownloadURL()` usage exists in `src`. Storage filename generation matches the strict 8-hex-character rule pattern. A follow-up upload failure was traced to publisher filenames containing dots in the basename (for example `1-s2.0-…-main.pdf`), while the existing strict Storage rule permits dots only in the final `.pdf` extension. The client now normalizes dots and other disallowed basename characters to underscores; it does not alter PDF bytes or relax rules. PDF-005 exercises that exact dotted publisher-name pattern against the emulator, checks the normalized object path, and verifies that the PDF renders and metadata persists without an authorization error. |
| Attach PDF to an existing paper | VERIFIED | The screenshot showed a valid metadata record with a DOI and no PDF reference. DOI lookup only supplies bibliographic metadata; it cannot supply a publisher PDF. The reader now provides an Attach PDF action in its unavailable state. It saves the file to IndexedDB for guests or owner Storage for signed-in users, updates the existing paper by ID, and preserves its DOI and metadata instead of making a duplicate record. Empty page counts show “PDF not attached” instead of “Page 1 of 0.” |
| PDF annotations | VERIFIED | Text selection opens the existing highlight/note flow and saving preserves the selected text and note. A browser test exercises the complete flow on rendered PDF text. |
| Profile schema | VERIFIED | The old root profile included a `settings` field disallowed by the strict root schema. Settings are now initialized in `users/{uid}/settings/current`. New email signup uses safe create operations instead of updating a possibly absent document. Existing-account login reads current documents and does not initialize over existing settings. |
| Profile/settings lifecycle | VERIFIED | Emulator E2E covers new email registration, root profile and settings initialization, profile update, settings update, repeated initialization, existing login, refresh, logout, and cross-user isolation. Security assertions keep reads/writes owner-scoped; no rule change was used to pass them. |
| New Google profile branch | UNVERIFIED | New-user Google results use the safe new-profile initialization path; existing Google users use the read-first path. The Auth Emulator’s local Google account chooser is verified to open, but a full popup account submission and profile callback was not established as passing. This is not a real Google OAuth test. |
| Responsive header | VERIFIED | The previous fixed desktop navigation and always-visible controls overflowed compact widths. The header now uses a compact navigation drawer below 1536 px, reduces search/profile details at narrow breakpoints, and expands the desktop layout on ultrawide screens. Playwright confirmed no page overflow and that the avatar and profile pill fit at 360, 390, 430, 768, 1024, 1280, 1440 and 1920 px. |
| User progress | VERIFIED | Reading-progress updates no longer add elapsed minutes merely because the page changed or re-rendered. |
| Google OAuth production | UNVERIFIED | No production Firebase project was contacted. Real Google OAuth depends on Firebase Console provider/domain configuration and must be validated separately in an approved environment. |
| Gemini AI | MISSING configuration | The Express health response reports `apiConfigured=false`; no Gemini key is configured. Local non-AI app journeys work. The online Gemini assistant cannot be verified until the user supplies a key. |

## Files changed for this repair

- PDF: `src/components/PdfDocumentReader.tsx`, `src/components/DedicatedReader.tsx`, `src/components/DedicatedImportModal.tsx`, `src/services/pdfDocuments.ts`, `src/hooks/useFirebaseSync.ts`, `src/types/research.ts`, `src/App.tsx`.
- Auth/profile: `src/contexts/AuthContext.tsx`, `src/services/userProfile.ts`.
- Layout/local workflow: `src/components/TopNav.tsx`, `package.json`, `README.md`.
- Integration coverage: `tests/e2e/pdf-fixtures.ts`, `tests/e2e/pdf-upload.spec.ts`, `tests/e2e/responsive-header.spec.ts`, `tests/e2e/auth.spec.ts`.
- Dependency manifests: `package.json`, `package-lock.json` (`react-pdf` added).
- No production Firebase configuration or production rules were changed. No deploy or Git push occurred. The recovery backup at `C:\Users\azoua\Documents\marginalia-recovery-backup-20261104-123517` remains untouched.

## Validation

| Check | Status | Result |
|---|---|---|
| `npm ci` | VERIFIED | Exit 0; 1,037 packages installed. npm reported the dependency vulnerabilities above. |
| `npm run lint` | VERIFIED | `tsc --noEmit` passes after the previous `TopNavProps` callback and Playwright import fixes. |
| `npm run build` | VERIFIED | Vite production build passes after the filename normalization fix (2204 modules). It emits a large-chunk advisory: main JS about 1.38 MB minified, PDF worker about 1.27 MB, PDF reader chunk about 635 KB. |
| `npm run test:security` under local emulators | VERIFIED | 106/106 tests pass, 3 suites. Emulator `PERMISSION_DENIED` logs correspond to deliberate negative security assertions; they are expected in these rule tests. |
| `npm run test:e2e` under local emulators | VERIFIED | 34/34 tests pass, including PDF-005 with `1-s2.0-S2215016126004486-main.pdf`; the generated Storage basename is normalized to `1-s2_0-S2215016126004486-main.pdf`. Successful signup/profile and PDF journeys did not report `PERMISSION_DENIED`. Firebase emitted occasional WebChannel transport warnings during refresh/teardown, while the tested operations and assertions passed. |
| PDF fixtures | VERIFIED | 1-page, 18-page selectable-text plus embedded raster-image, and 120-page synthetic PDFs. Verified rendered canvas/text, selection/highlight/note, page controls, scrolling, zoom, reload/reopen, existing-record attachment, and nearby-page rendering limit. No real user-provided PDF was available in the automated suite. |
| Header matrix | VERIFIED | All 8 widths listed above, included in E2E suite. |
| `npm run dev:local` smoke check | VERIFIED | App health endpoint HTTP 200; local Auth/Firestore/Storage endpoints reachable; app and emulators stopped after check. |
| Google popup account completion | UNVERIFIED | Local emulator provider page is accessible. A completed Google popup-to-profile E2E journey remains unverified; no external OAuth was attempted. |

## Transfer artifacts and remaining issues

- **VERIFIED — screenshot follow-up:** the reader was rendering its intended missing-file state for a metadata-only record, but provided no path to attach a PDF to that same record and presented an invalid `Page 1 of 0` control. The reader now exposes an attachment action, updates the selected paper without duplicating it, and has passing guest/authenticated E2E coverage.

- **BROKEN — Git pack metadata:** Git emits `non-monotonic index .git/objects/pack/._pack-….idx` warnings. The project tree also contains many `._*` AppleDouble artifacts, and `git status` is noisy. Branch and HEAD can be read, but do not clean or regenerate the Git metadata without preserving/reviewing the transfer files. No repair was attempted.
- **MISSING — Firebase Emulator UI:** TCP port 4000 did not respond when using `dev:local`; the actual app emulators do run and are reachable. The emulator UI dashboard is not needed to run or test the app.
- **MISSING — Gemini API configuration:** add a valid key locally to enable online AI. Do not paste it into this report or commit it.
- **UNVERIFIED — Real Google provider auth:** production OAuth cannot be proven by the Auth Emulator, and the emulator UI-to-app profile completion needs a dedicated passing browser journey.
- **UNVERIFIED — full feature certification:** the current browser suite covers critical journeys and data/security paths, not every possible interaction in every feature. Account deletion, data export/restore, external DOI/AI network behavior, and all annotation edge cases were not exhaustively exercised.
- **VERIFIED — generated build:** `dist/` is generated by `npm run build` and is not required in source control for development. `node_modules` is installed from the lockfile. No other missing local asset or generated file blocked the build/tests.
- **DIFFERENCE from previous workstation:** the previous environment is represented by the recovery report, not a complete machine snapshot. Current machine versions and test baseline are documented above. Test totals grew from 103 to 106 security cases and from 29 to 32 E2E cases. The project still has the same initial Git HEAD, so the recovered implementation is primarily in the existing working tree rather than a new commit.

## Recommended next step

Run `npm run dev:local`, open the paper from the screenshot, and choose its original PDF with **Attach PDF**. DOI metadata does not grant access to paywalled publisher files. Then verify the emulator Google account submission/profile callback in the target Windows browser. Afterward, decide whether to repair the transferred Git pack/AppleDouble state and review the 39 npm advisories before any release work. Keep AI and real-provider testing blocked on user-supplied credentials; do not substitute mock production auth or production Firebase values.
