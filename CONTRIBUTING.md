# Contributing to Marginalia

Thank you for your interest in contributing to **Marginalia by Amine**! Marginalia is an editorial personal academic knowledge companion and vintage bookshelf reading studio.

---

## 🏛️ Code of Conduct & Core Principles

1. **Academic Rigor & Privacy**: Guest mode retains full functionality local-first via client-side IndexedDB. Authenticated accounts operate with strict per-user Firestore and Firebase Storage security isolation (no shared data leakage).
2. **Open Science & Research Standards**: Bibliographic resolution interfaces directly with open academic infrastructures (Crossref DOIs) and adheres to open-access principles.
3. **Reproducibility & Verification**: Every pull request must pass the full test harness:
   - TypeScript static check (`npm run lint` / `tsc --noEmit`)
   - Jest security rule suite (`npm run test:security`)
   - Playwright E2E browser test suite (`npm run test:e2e`)
   - Production Vite bundle build (`npm run build`)

---

## 🛠️ Development Setup

**Prerequisites:** Node.js 24+, Java 21+ (for Firebase local emulators), and npm.

```powershell
# 1. Install lockfile dependencies
npm ci

# 2. Configure local development environment
# Copy .env.example to .env (defaults to local emulator project)
if (!(Test-Path .env)) { Copy-Item .env.example .env }

# 3. Launch local app with Auth, Firestore, and Storage emulators
npm run dev:local
```
The application runs on `http://localhost:3000`.

---

## 🧪 Testing Before Submitting Pull Requests

Every PR must pass automated testing before merging:

```powershell
# 1. TypeScript static analysis
npm run lint

# 2. Unit & API integration tests
npx jest tests/server-api.test.js tests/security/rules-validation.test.js

# 3. Firebase emulator security tests (111 tests)
npm run test:security

# 4. Playwright E2E browser test suite (41 tests)
npm run test:e2e

# 5. Production build verification
npm run build
```

---

## 📄 License

By contributing to Marginalia, you agree that your contributions will be licensed under the project's [MIT License](LICENSE).
