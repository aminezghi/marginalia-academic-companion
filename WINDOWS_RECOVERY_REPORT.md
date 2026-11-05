# Marginalia — Windows Recovery Report

Date: 2026-11-04 (Europe/Paris)
Project: `C:\Users\azoua\Documents\marginalia-—-academic-knowledge-companion`
Git HEAD: `726f4f6dd37136d32fb991309a6d02f5500f5427` (`Initial commit with architecture docs`)

## Recovery result

**Environment recovery completed and validated.** The app built successfully, all **103 Firebase security tests passed**, and all **29 E2E tests passed**. No production Firebase operation, deploy, push, security-rule deployment, or user-data deletion occurred.

## Backup and Git inventory

A separate backup was created before recovery changes:

`C:\Users\azoua\Documents\marginalia-recovery-backup-20261104-123517`

It preserves the source tree, docs, configuration, untracked files, and pre-recovery Git inventories; it excludes the actual `node_modules` and `dist` directories. The copy contains 18,629 files (about 278 MB). Git inventory snapshots are `git-status-before.txt`, `git-diff-stat-before.txt`, `git-diff-name-status-before.txt`, `untracked-files-before.txt`, `deleted-tracked-before.txt`, and `head-before.txt`. The three original deleted tracked files were separately recovered from Git HEAD into `git-head-originals/` for comparison; they were not restored over current replacements.

| Worktree item | Before recovery | After recovery |
|---|---:|---:|
| Current branch / HEAD | `main` / `726f4f6dd37136d32fb991309a6d02f5500f5427` | Unchanged |
| Modified tracked files | 17 | 18 (one additional `.env.example` documentation edit) |
| Deleted tracked files | 3 | 3 (preserved as deletions) |
| Untracked file paths | 431 | 433 (includes the Windows clean helper and this report) |

Modified tracked files cover project status, Firebase config/rules, package manifests, Vite config, and app/auth/sync/type/migration files. The deleted tracked files are `jest.config.json`, `tests/security/firestore-rules.test.js`, and `tests/security/storage-rules.test.js`.

The current package includes the lost Jest `setupFilesAfterEnv` hook. The active replacement security suites are larger than the Git HEAD copies: Firestore 34 vs 9 tests; Storage 41 vs 7 tests; plus 28 rule-structure checks. The current three suites total 103 and all pass. No older tests were restored over the replacements.

| Recovery disposition | Items |
|---|---|
| Preserved | All original tracked changes, untracked files, environment files, local assets, docs, tests, logs and backups remain in the project; the pre-recovery copy is external. |
| Recovered | Original Git HEAD copies of the three deleted files are in the backup. The lost Jest setup hook is represented in `package.json`. Dependencies, Node, JDK and the matching Playwright browser were restored. |
| Duplicated | 345 AppleDouble files/directories remain beside their counterparts as transfer metadata. None were intentionally deleted. Playwright regenerated `playwright-report/index.html`; its pre-run copy remains in the backup. |
| Obsolete | No source/configuration files were classified obsolete or removed. |

During E2E cleanup, two AppleDouble sidecars under `playwright-report` and `test-results` were removed by the existing reporter/teardown cleanup; both exact files were restored from the pre-recovery backup and verified present. Hash comparison found no other original untracked file missing. The expected updated files are `playwright.config.ts`, `tests/e2e/global-setup.ts`, and the generated `playwright-report/index.html`.

There are 345 untracked AppleDouble `._*` items. A sample begins with the AppleDouble magic bytes `00 05 16 07` and identifies itself as `Mac OS X`, confirming these are transfer metadata files. They were preserved in both the working tree and backup; none were deleted. Untracked items also include newer source (`src/components/AccountSettingsModal.tsx`, `src/vite-env.d.ts`), E2E/security tests, diagnostics, docs, `.agents` skills, a nested `deploy/` project, assets, logs, and backups. The full untracked inventory is in the external backup.

Git has `core.autocrlf=true`; Git emits LF-to-CRLF warnings for several edited files. No mass line-ending conversion was applied. The HEAD commit did not change.

## Windows runtime and dependencies

| Component | Recovered state |
|---|---|
| Windows | Windows 11 Home, 64-bit, build 26300 |
| Node.js | **24.22.2** installed under `%LOCALAPPDATA%\Programs\MarginaliaRecovery\Node-v24.22.2`; user PATH updated |
| npm | **11.19.1** bundled with Node 24.22.2 |
| Java | **Temurin JDK 21.0.13+9** installed under `%LOCALAPPDATA%\Programs\MarginaliaRecovery\Temurin-21`; user `JAVA_HOME` and PATH updated |
| Firebase CLI | Local **15.34.2** |
| Vite / esbuild | **8.3.5 / 0.28.2** |
| Jest / Playwright | **29.7.0 / 1.64.1** |
| Playwright browser | Matching Chromium 1248 installed |
| Disk | About 196 GB free on C: at audit start |

The initial conflict came from direct `esbuild@^0.25.0` while locked Vite 8.3.5 declares peer `esbuild@^0.27.0 || ^0.28.0`. The only dependency correction was `esbuild` to `^0.28.2`; package-lock was updated consistently. `npm ci` then exited successfully under Node 24.22.2, and `npm ls --depth=0` showed the declared direct dependencies installed. npm reported 39 audit vulnerabilities and warned that 5 package install scripts were not allow-listed by npm 11.19.1. No audit fixes or install-script approvals were applied. The build and tests succeeded despite those warnings.

An initial `npm ci` under Node 24.1.0 completed with `EBADENGINE` warnings because current Firebase packages require Node `>=24.12.0`. The compatible Node 24.22.2 runtime was installed and used for the final clean install and validation. JDK 21 was installed side-by-side because the previous Java 8 runtime is too old for current Firebase emulators. Both downloaded archives were checksum-verified against their official release metadata. Firebase’s [Emulator Suite setup guide](https://firebase.google.com/docs/emulator-suite/install_and_configure) documents the JDK prerequisite; the [Firestore emulator guide](https://firebase.google.com/docs/emulator-suite/connect_firestore) notes the current Java 21 requirement.

## Windows compatibility and emulator safety

- Replaced the Unix-only `clean` command with `node scripts/clean.mjs`; `node --check scripts/clean.mjs` passes. The clean action itself was not run, to keep generated project output intact.
- Added an explicit `emulators:test` command selecting `marginalia-test-emulator` and only Auth, Firestore and Storage.
- Playwright loads `.env.e2e.local` with override before server startup and refuses to load if project ID, emulator flag, or E2E flag is wrong. It does not reuse an existing server with unknown Firebase environment.
- E2E setup requires the same test project and checks Auth `127.0.0.1:9099`, Firestore `127.0.0.1:8080`, and Storage `127.0.0.1:9199`.
- Firebase client refuses emulator mode with a non-test project and refuses to use the test project without emulators. Emulator SDK connections are synchronous and errors are no longer swallowed.
- E2E and security suites were each run through `firebase emulators:exec --project marginalia-test-emulator --only auth,firestore,storage`. Emulator runs shut down on completion. `.firebaserc` still defaults to `marginalia-academia`, so emulator commands must continue to name the test project explicitly.
- Playwright and Jest now ignore AppleDouble files so `._*.spec.ts` / `._*.test.js` metadata is not interpreted as source.
- `.env.example` documents `VITE_USE_FIREBASE_EMULATORS` and `E2E_TEST`. `.env.e2e.local` remains ignored by Git. Secret values were not printed.

## Validation results

| Check | Result |
|---|---|
| `npm ci` on Node 24.22.2 / npm 11.19.1 | PASS, exit 0; 1,024 packages added |
| `npm ls --depth=0` | PASS |
| `npm run build` | PASS; Vite 8.3.5 built successfully. Existing bundle-size warning remains (about 1.37 MB minified JS). It used the current `.env`, which selects the test emulator, so `dist` is only a compile check and is not configured for production. |
| `npm run test:security` with explicit test emulator | **PASS: 103/103, 3 suites, exit 0** |
| `npm run test:e2e` with explicit test emulator | **PASS: 29/29, exit 0** |
| `npx --no-install playwright test --list` | PASS: enumerates the intended 29 tests; ignores AppleDouble files |
| `node --check scripts/clean.mjs` | PASS |
| `npm run lint` | **FAIL: 2 TypeScript errors**, listed below |

Lint errors are in existing application/test code and were left for the application-fix phase:

1. `src/App.tsx:1024`: prop `onOpenAccountSettings` is not declared in `TopNavProps` (TypeScript suggests `onOpenSettings`).
2. `tests/e2e/sync.spec.ts:1`: `browser` is imported from `@playwright/test`, but that package does not export it.

The E2E tests pass but browser logs repeatedly show Firestore `PERMISSION_DENIED` during root profile reads/writes (`firestore-emulator.rules` lines 22, 25, 36). `AuthContext` creates a profile with a `settings` field outside the rule’s allowed root schema, then attempts an `updateDoc` during signup. This is a confirmed application/rules integration issue for the next phase; it was not changed here.

## Remaining recovery notes

- The exact previous-machine point cannot be proven from the initial architecture-only Git commit; the implementation is carried largely in the modified and untracked worktree.
- Preserve the external backup and current worktree until source/test provenance has been reviewed. AppleDouble files remain untouched.
- Node and Java user-level PATH settings apply to new shells; restart the terminal/Codex process if it still resolves the older system Node or Java.
- npm reported 39 dependency audit vulnerabilities. They were not modified as part of environment recovery.
- No application behavior fixes were made. The report stops at recovery and validation, pending approval before application fixes.
