# Windows Environment Handover

Audit date: 2026-11-04 (Europe/Paris)
Workspace: `C:\Users\azoua\Documents\marginalia-—-academic-knowledge-companion`

## Executive state

The checkout is the Marginalia Academic Knowledge Companion (React 19, Vite, TypeScript, Express and Firebase). The transferred source includes the project’s core research library, authentication, cloud sync, guest mode, collections, reading and AI views. It is not a clean continuation point: there are extensive unstaged changes, deleted tracked test/config files, a large set of untracked files, and AppleDouble `._*` sidecars. Preserve this state while recovering a known-good baseline.

## Project and Git

| Finding | Status | Evidence |
|---|---|---|
| Project identity | VERIFIED | Marginalia app components and project documentation are present. |
| Root | VERIFIED | `C:\Users\azoua\Documents\marginalia-—-academic-knowledge-companion` |
| Branch / HEAD | VERIFIED | `main`, `726f4f6dd37136d32fb991309a6d02f5500f5427` (`Initial commit with architecture docs`, 2026-11-03). |
| Worktree | BROKEN | Dirty: 17 tracked modifications, 3 tracked deletions (`jest.config.json`, `tests/security/firestore-rules.test.js`, `tests/security/storage-rules.test.js`) plus many untracked files. `git diff --stat` reports about 14.8k insertions / 4.0k deletions. |
| Transfer artifacts | BROKEN | Numerous `._*` AppleDouble files and `._` directory entries are present, including sidecars for env files, source, reports, tests and `node_modules`. Do not treat sidecars as restored originals without validating their contents. |
| Documentation | VERIFIED | Main README, architecture/setup docs, audits and handover source reports exist; many are untracked and therefore not in the current commit. |

## Windows development environment

| Component | Status | Finding |
|---|---|---|
| Windows | VERIFIED | Windows 11 Home, 64-bit, version 10.0.26300. |
| Node.js | VERIFIED | v24.1.0 |
| npm | VERIFIED | 11.3.0 |
| Git | VERIFIED | 2.55.0.windows.3 |
| Java | VERIFIED | Java 8.0.511 is installed. Emulator compatibility with this Java runtime was not verified. |
| Firebase CLI | VERIFIED | No global `firebase` command; project-local Firebase CLI runs as v15.34.2 via `node node_modules/firebase-tools/lib/bin/firebase.js`. `node_modules/.bin` shims are missing. |
| Playwright | UNVERIFIED | `@playwright/test` is in the manifest and browser binaries exist, but local command shims are missing. `npx playwright` exposed other installed Playwright versions, so it is not proof the project’s declared version works. |
| Disk | VERIFIED | C: has about 196.5 GB free of 992.5 GB. |
| Dependencies | BROKEN | `node_modules` exists but its `.bin` command shims are absent. `npm ci` failed before installation with ERESOLVE: Vite 8.3.5 requires optional peer esbuild `^0.27.0 || ^0.28.0`, but the root lock/manifest pins `^0.25.0`. No `--force` or peer override was used. |

## Architecture and configuration

| Finding | Status | Evidence |
|---|---|---|
| Frontend | VERIFIED | React + TypeScript SPA, Vite 8, Tailwind 4, source in `src/`. |
| Backend | VERIFIED | Express + Vite middleware in `server.ts`; endpoints include health, Gemini status, DOI lookup and AI. `npm run dev` uses `tsx server.ts`. |
| Firebase client | VERIFIED | Firebase Auth, Firestore and Storage initialized in `src/config/firebase.ts`; emulator endpoints bind to 127.0.0.1 ports 9099/8080/9199 when `VITE_USE_FIREBASE_EMULATORS` is true. |
| Firebase CLI project alias | BROKEN | `.firebaserc` default is `marginalia-academia`. Emulator config itself has no project alias. Commands need an explicit `--project marginalia-test-emulator`; a bare default command risks selecting the production project. |
| Env files | VERIFIED | `.env`, `.env.e2e.local`, `.env.test`, and `.env.example` exist. The three local envs use project ID `marginalia-test-emulator`, emulator flag `true`, and E2E flag `true`. Secret values were not printed. |
| Env isolation | UNVERIFIED | App emulator flag defaults to false when absent. Playwright global setup does not load `.env.e2e.local`; it checks only whether emulator endpoints respond. The current `.env` is emulator-safe, but E2E safety depends on this mutable local file being present and correct. No production Firebase connection was attempted. |
| Documented env names | MISSING | `.env.example` documents `GEMINI_API_KEY`, the six `VITE_FIREBASE_*` fields, `APP_URL`, and `PORT`; it omits `VITE_USE_FIREBASE_EMULATORS` and `E2E_TEST`, both used in local env files. |
| Rules/config | VERIFIED | `firebase.json` points Firestore and Storage at emulator rules; Firestore indexes file exists. Emulator config binds Storage to loopback. Both `firestore-emulator.rules` and `storage-emulator.rules` exist, with separate `storage.rules` also present. |
| E2E config | UNVERIFIED | Playwright targets 29 test declarations in `tests/e2e`, one Chromium worker, and localhost:3000. Setup requires emulators already running, but does not start them or assert the selected project ID. |
| Windows scripts | BROKEN | `clean` uses Unix `rm -rf`; root `runner.sh` is empty. These scripts are not Windows-compatible as written. |

## Project health checks

| Check | Status | Result |
|---|---|---|
| Production build | BROKEN | `npm run build` could not find `vite` because npm command shims are missing. |
| Dependency restore | BROKEN | `npm ci` stopped on the Vite/esbuild peer conflict; dependencies remain unrepaired. |
| 103 Firebase security tests | UNVERIFIED | Not run. The suite mixes self-contained syntax checks with emulator-backed suites. Canonical tracked `firestore-rules.test.js` and `storage-rules.test.js` are deleted in this worktree; replacement/untracked suites exist. Running emulator tests is deferred until dependencies and a test-only emulator launcher/project selection are verified. |
| E2E (29) | UNVERIFIED | Not run. Although env values currently select the test emulator, setup does not load `.env.e2e.local`, emulator startup is external, and Playwright’s project-local executable is missing. |
| Firebase production | VERIFIED | No production Firebase operation or deployment was performed. |

## Reported progress checked against current source

| Previously reported work | Status | Source inspection |
|---|---|---|
| PDF Storage path | VERIFIED | `src/hooks/useFirebaseSync.ts` generates `pdfs/{uid}/{13-digit timestamp}_{8-hex id}_{sanitized filename}.pdf`. |
| Persistent `getDownloadURL()` removal | VERIFIED | No `getDownloadURL` references remain in `src`; upload returns the Storage path. |
| Authenticated Firebase SDK PDF reading | MISSING | No `getBytes`, `getBlob`, or equivalent Storage read is present in `src`. Storage-path-aware UI filtering exists, but reading PDF bytes through authenticated SDK access is not implemented in inspected source. |
| Temporary object URL cleanup | VERIFIED | Export and companion download flows call `URL.revokeObjectURL()` after use. This is source-level verification, not a lifecycle test. |
| Firestore user document schema | BROKEN | Rules allow a strict root profile (`uid`, email, displayName, photoURL, provider, createdAt and migration fields). `AuthContext` creates `settings` inside that root document, which is outside the allowed key set. Email sign-up then calls `updateDoc` on a user document that may not yet exist. Source and rules do not currently agree. |
| Guest migration | UNVERIFIED | `guestMigration.ts` builds a migration payload, but it hardcodes existing cloud items/collections to empty arrays and comments that cloud fetch is not implemented. It is not proof of a complete, duplicate-aware migration. |
| Authentication flows | VERIFIED | Google popup, email/password sign-in/up, password reset, auth state and logout code exist. Runtime behavior is untested. |
| Account management | VERIFIED | Export, account deletion with reauthentication, profile update, and an account settings modal are present. Runtime behavior is untested; deletion code performs destructive operations only when invoked by the user and was not executed. |

## Missing or changed files

- **MISSING/BROKEN:** Tracked Jest config and two tracked security test files are deleted in the worktree. Recover their original Git versions only after reviewing the current untracked replacement suites; do not overwrite the latter blindly.
- **MISSING:** No `.env.local` exists. `.env` exists and is set to test-emulator values; retain it securely and do not publish it.
- **MISSING:** No separate Firebase emulator project configuration file is established as canonical; test port configs exist (`firebase-emulator-test.json`, `firebase.storage-test.json`, `emulators.json`) but coexist with a Firebase config whose `.firebaserc` default is the production project.
- **BROKEN:** Dependency install needs resolution of the Vite/esbuild version mismatch and missing npm shims.
- **UNVERIFIED:** `public/assets/aistudio/...png` exists, but other expected local assets were not enumerated from historical evidence; there is no previous-machine manifest to compare against.
- **UNVERIFIED:** `dist/`, Playwright reports/results, logs, diagnostics, debug scripts, backups, and a nested `deploy/` project are present. It is unclear which are intended project artifacts versus transfer leftovers; `dist` cannot substitute for a current successful build.
- **BROKEN:** Many report files and newer tests are untracked; only commit history can establish what belonged to the transferred project baseline.

## Differences from the previous environment

The prior reports reference macOS paths and Unix shell commands. The current host is Windows 11, and the repository has CRLF conversion warnings plus AppleDouble files consistent with cross-platform transfer. The Git HEAD is an initial architecture-doc commit while a large later implementation appears only in the working tree and untracked files. There is no verified clean commit/tag or source manifest for the previous machine, so “exact point” cannot be confirmed from Git history alone.

## Recommended next development step

Recover and compare the transfer’s original source/test files against Git and the `._*` sidecars, preserving the current worktree as evidence. Then resolve the declared Vite/esbuild peer mismatch and restore project-local npm shims from the lockfile. Before emulator or E2E execution, make the test command explicitly load `.env.e2e.local`, assert project ID `marginalia-test-emulator`, and launch only local emulators with an explicit `--project marginalia-test-emulator`. Reconcile the Firestore profile schema with the AuthContext write path. Once that recovery is reviewable, rerun the build, all 103 security tests and 29 E2E tests.
