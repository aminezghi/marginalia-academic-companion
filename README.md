<p align="center">
  <img src="brand/marginalia-mark-color.svg" width="96" height="96" alt="Marginalia Logo" />
  <h1 align="center">Marginalia by Amine</h1>
  <p align="center">
    <strong>Editorial Academic Knowledge Companion & Vintage Bookshelf Reading Studio</strong><br/>
    <em>Tactile 3D physical bookshelf · Deep paper reading with margin annotations · Local-first & Cloud-synced · DOI resolution & Gemini AI synthesis</em>
  </p>
</p>

<p align="center">
  <a href="https://marginalia-academic-knowledge-compa.vercel.app"><img src="https://img.shields.io/badge/Deployment-Vercel%20Live-000000?logo=vercel&logoColor=white" alt="Vercel Deployment" /></a>
  <a href="#-desktop-workbench--local-emulator"><img src="https://img.shields.io/badge/Platform-Windows%2010%20%7C%2011%20(64--bit)-0078D6?logo=windows" alt="Platform" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-10B981?style=flat" alt="License" /></a>
  <a href="#-testing--verification"><img src="https://img.shields.io/badge/Tests-152%20Passing%20(100%25)-brightgreen" alt="Tests" /></a>
  <a href="docs/audits/PROJECT_STATUS.md"><img src="https://img.shields.io/badge/Security%20Rules-111%20Passing-blue" alt="Security" /></a>
  <img src="https://img.shields.io/badge/Stack-React%2019%20%7C%20TypeScript%20%7C%20Vite%208-61DAFB?logo=react" alt="Stack" />
</p>

---

## 💡 The Story & Motivation Behind Marginalia

> *"As a doctoral researcher in computer engineering, my daily work requires absorbing dozens of peer-reviewed papers across machine learning, computer vision, and data engineering.*
> 
> *Yet every digital tool we are given — Zotero, Mendeley, basic PDF viewers — treats scientific literature like rows in a sterile, clinical spreadsheet. Papers are dumped into rigid listviews, filed away into nested folders, and forgotten. The human, tactile dimension of intellectual discovery is completely stripped away.*
> 
> *For centuries, scholarship flourished through **marginalia**: Pierre de Fermat inscribing his famous conjecture in the margins of Diophantus's Arithmetica, Samuel Taylor Coleridge arguing with philosophy in the margins of his library books, researchers building intimate dialogues with physical volumes resting on warm timber shelves.*
> 
> *I built **Marginalia by Amine** to restore that intellectual warmth to modern research: an application that pairs the sensory delight of a physical vintage library bookshelf with the rigor of modern academic workflows. Here, your papers live as tactile, customized hardbound volumes on a wooden shelf; you read real PDFs with margin notes, resolve DOIs instantly via Crossref, consult an AI research assistant powered by Google Gemini, and retain 100% control over your data — whether in private local-first guest mode or synced securely through owner-isolated cloud storage."*

---

### 👤 About the Author & Current Research
**Amine Zouaghi** is a Doctoral Researcher and **FutureData4EU Fellow** funded under the European Union’s **Marie Skłodowska-Curie Actions (MSCA COFUND / Horizon Europe)**, carrying out doctoral research affiliated with the **University of Parma** (Department of Engineering and Architecture / Food Project) and the **University of Bologna**. His research focuses on Big Data, AI, Computer Vision, and Digital Transition:

- 🏛️ **Doctoral Fellowship Profile:** [FutureData4EU MSCA Fellow — Amine Zouaghi](https://site.unibo.it/futuredata4eu/en/fellows/thematic-area-5-food-bioeconomy-natural-resources-agriculture-and-environment)
- 🎓 **Institutional Faculty Page:** [University of Parma Profile](https://personale.unipr.it/en/ugovdocenti/person/270639)
- 📖 **Google Scholar:** [Amine Zouaghi on Google Scholar](https://scholar.google.com/citations?user=KeVyb90AAAAJ&hl=en)
- 🔬 **ResearchGate:** [Amine Zouaghi on ResearchGate](https://www.researchgate.net/profile/Amine-Zouaghi)
- 💼 **LinkedIn:** [Amine Zouaghi on LinkedIn](https://www.linkedin.com/in/zouaghi-amine/)

---

## 🌟 Key Capabilities

| Capability | Experience & Implementation Details |
| :--- | :--- |
| 📚 **Tactile 3D Bookshelf Archive** | Interactive physical bookshelf with realistic timber grains (Dark Walnut, Natural Oak, Mahogany), spring physics, tactile paper-rustle audio, and custom embossed spine ribs (`#D4AF37`). |
| 📖 **Dedicated Paper Reader** | Integrated React-PDF document reader with continuous scrolling, page zoom, text selection, visual highlighters, and persistent marginal notes. |
| 🔒 **Owner-Isolated Security Model** | 111 automated security tests verify strict zero-trust isolation: papers, PDFs, notes, and collections are strictly owner-scoped; unauthenticated cross-user reads and deletes are denied at the Firebase rules engine. |
| 🧭 **Local-First Guest Mode** | Complete functionality without requiring an account. Guest PDFs and notes persist securely in client-side IndexedDB with seamless single-click migration to authenticated cloud sync upon signup. |
| ⚡ **DOI Metadata Resolution** | Paste any DOI (e.g., `10.1038/s41586-020-2649-2`) to fetch peer-reviewed bibliographic metadata, author lists, journal abstracts, and publication years directly from Crossref. |
| 🤖 **AI Research Assistant** | Interactive scholarly literature companion powered by Google Gemini (Gemini 2.5 Flash / Pro). Synthesizes abstracts, drafts reading notes, and answers nuanced research questions across your collection. |
| 🌐 **Serverless Web + Desktop** | Deployed on **Vercel** via modular serverless functions (`api/[...route].ts`) and packageable as an offline **Windows Desktop** installer with bundled local emulators. |

---

## 🚀 Quick Start & Local Development

### Prerequisites
- **Node.js**: `v24+`
- **npm**: `v11+`
- **Java**: `JDK 21+` (required for local Firebase Auth/Firestore/Storage emulators)
- **Git**

### Installation & Run

```powershell
# 1. Clone the repository
git clone https://github.com/aminezghi/marginalia-academic-companion.git
cd marginalia-academic-companion

# 2. Install exact dependency versions
npm ci

# 3. Initialize your environment configuration
if (!(Test-Path .env)) { Copy-Item .env.example .env }

# 4. Start Marginalia with dedicated local test emulators
npm run dev:local
```

Open **`http://localhost:3000`** in your browser.  
- Press `Ctrl+C` in your terminal to stop the application and emulators cleanly.
- To enable the online Gemini AI assistant, add your free key from [Google AI Studio](https://aistudio.google.com/) as `GEMINI_API_KEY` in `.env`.

---

## 🧪 Testing & Verification

Marginalia enforces strict automated verification across security, APIs, and end-to-end browser workflows (152 total tests):

```powershell
# 1. TypeScript Static Analysis (0 errors)
npm run lint

# 2. Server API & Crossref Integration Tests (32 tests)
npx jest tests/server-api.test.js tests/security/rules-validation.test.js

# 3. Firebase Firestore & Storage Security Rules Suite (111 tests)
# Validates owner-only PDF reads, file size quotas, MIME validation, and cross-user denial
npm run test:security

# 4. Playwright End-to-End Browser Journey Suite (41 tests)
# Tests guest import, DOI lookup, PDF canvas rendering, user registration, and cloud sync
npm run test:e2e

# 5. Production Build Verification
npm run build
```

---

## 🏛️ Project Architecture

```
marginalia-academic-companion/
├── api/                    # Vercel Serverless Function entrypoints ([...route].ts)
├── brand/                  # Vector logo kit, web icons, favicons, and manifest
│   ├── marginalia-mark-color.svg
│   ├── marginalia-mark-black.svg
│   ├── marginalia-mark-white.svg
│   ├── marginalia-logo-horizontal.svg
│   └── favicon.ico
├── desktop/                # Electron Windows packaging configuration
├── docs/                   # Engineering documentation, audits, and test reports
│   ├── architecture/       # Data architecture, security models, deployment specs
│   └── audits/             # Comprehensive E2E reports, root cause analyses, status logs
├── public/                 # Static assets, web manifest, and browser favicons
├── scripts/                # Windows build and clean automation scripts
├── src/                    # React 19 + TypeScript application source
│   ├── components/         # Bookshelf archive, PDF reader, AI assistant, navigation
│   ├── config/             # Firebase SDK client initialization & emulator guards
│   ├── contexts/           # Authentication and user state contexts
│   ├── data/               # Wood materials, book covers, and spine appearance presets
│   ├── hooks/              # Firebase Firestore & Storage reactive synchronization
│   ├── services/           # PDF storage, user profiles, and Crossref DOI resolver
│   ├── types/              # Domain TypeScript types for research items and shelves
│   └── utils/              # Guest-to-cloud migration, import parsers, Web Audio sound
├── tests/
│   ├── e2e/                # Playwright end-to-end browser journeys (41 tests)
│   └── security/           # Firebase security rules standalone unit tests (111 tests)
├── dev-server.ts           # Development Express + Vite middleware server
├── server-app.js           # Shared Express backend application (DOI & Gemini endpoints)
├── firestore.production.rules
├── storage.production.rules
├── vercel.json             # Vercel routing, build settings, and Firebase rewrites
└── package.json
```

---

## 🔐 Environment Variables

| Variable | Description | Required | Source |
| :--- | :--- | :---: | :--- |
| `GEMINI_API_KEY` | Google Gemini API key for literature synthesis | Optional | [Google AI Studio](https://aistudio.google.com/) |
| `VITE_FIREBASE_API_KEY` | Firebase Web API Key | Yes | Firebase Console (Project Settings) |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase Auth domain (`*.firebaseapp.com`) | Yes | Firebase Console |
| `VITE_FIREBASE_PROJECT_ID` | Firebase Project ID | Yes | Firebase Console |
| `VITE_FIREBASE_STORAGE_BUCKET`| Cloud Storage bucket (`*.appspot.com` or `*.firebasestorage.app`) | Yes | Firebase Console |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Cloud Messaging sender ID | Yes | Firebase Console |
| `VITE_FIREBASE_APP_ID` | Firebase Web App ID | Yes | Firebase Console |
| `VITE_USE_FIREBASE_EMULATORS` | Set to `true` for local development & testing | Dev/Test | Local `.env` |
| `APP_URL` | Base application URL for OAuth redirects | Optional | `http://localhost:3000` |

---

## 🙏 Acknowledgments & Inspirations

- **Inspirations & Pioneers**:
  - **The Republic of Letters & Classical Libraries**: For the enduring humanist tradition of active marginal annotation.
  - **Crossref**: For maintaining the open global infrastructure linking digital scholarly works through DOIs.
  - **Vellum by Amine**: For pioneering local-first literature workflows and rigorous open-science tooling.
- **Foundations & Libraries**:
  - [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), and [Vite](https://vite.dev/)
  - [React-PDF / PDF.js](https://react-pdf.org/) for vector-sharp client-side academic document rendering
  - [Framer Motion](https://motion.dev/) for realistic spring physics and shelf dynamics
  - [Lucide Icons](https://lucide.dev/) for clean, accessible interface glyphs
  - [Kaan Kiziltug's Logo Design Skill](https://github.com/kaankiziltug/logo-design-skill) for the geometric SVG audit and production branding pipeline
  - [NextLevelBuilder's UI/UX Pro Max](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) for editorial typography and paper-reading design intelligence

---

## 👤 Author & Lead Architect

**Amine Zouaghi**
- Doctoral Researcher & Lead Architect
- Affiliations: University of Parma & University of Bologna (FutureData4EU MSCA Fellow)
- Institutional Email: `amine.zouaghi@unipr.it` · Personal: `azouaghiamine@gmail.com`
- [LinkedIn Profile](https://www.linkedin.com/in/zouaghi-amine/) · [Google Scholar](https://scholar.google.com/citations?user=KeVyb90AAAAJ&hl=en) · [GitHub (@aminezghi)](https://github.com/aminezghi)

---

## 📄 License

This project is licensed under the [MIT License](LICENSE) — free and open-access for researchers, students, and scholars worldwide.
