# Known Issues & Technical Limitations

## Resolved Issues

### 1. App.tsx Syntax Error (CRITICAL - RESOLVED)
- **Problem**: Malformed JSX at line 1286 (`/* Footer always visible on all views */ (`) caused Vite/TypeScript compilation errors and prevented the dev server from starting ("localhost refused to connect").
- **Fix**: Replaced malformed comment/JSX with clean `<div className="pb-14 md:pb-0">` wrapper.
- **Status**: ✅ RESOLVED

### 2. ShelfArchive Book Click Bug (CRITICAL - RESOLVED)
- **Problem**: Clicking a book that was already pulled out and centered toggled the detail panel instead of starting the reading experience.
- **Fix**: Updated the `onClick` handler in `src/components/ShelfArchive.tsx` to check if the clicked book is the centered centerpiece book and trigger `(onReadPaper || onOpenDetail)(item)`.
- **Status**: ✅ RESOLVED

### 3. Profile Pill Visibility (MEDIUM - RESOLVED)
- **Problem**: Profile pill in TopNav had low contrast and was almost invisible on some screen sizes.
- **Fix**: Updated CSS classes in `src/components/TopNav.tsx` to `bg-[#1F3FB0]/10 border border-[#1F3FB0]/30 rounded-full text-[#1F3FB0]` with hover effects.
- **Status**: ✅ RESOLVED

### 4. Gemini API Status Check (MEDIUM - RESOLVED)
- **Problem**: AiAssistantView was not checking if Gemini API key was configured on mount.
- **Fix**: Added `useEffect` in `src/components/AiAssistantView.tsx` that fetches `/api/gemini-status` on mount and calls `onShowApiKeyPrompt` if not configured.
- **Status**: ✅ RESOLVED

---

## Active Known Issues & Limitations

### 1. Data Persistence (By Design / Limitation)
- **Impact**: Medium
- **Description**: Guest user data is stored entirely in browser `localStorage`. Clearing browser data, using private browsing, or switching devices will lose all library contents.
- **Workaround**: Users must sign in to save data to Firebase Firestore.
- **Status**: KNOWN LIMITATION

### 2. PDF Rendering & Extraction (Incomplete Feature)
- **Impact**: Medium
- **Description**: The PDF reader provides a visual simulation of paper reading. Real PDF rendering (via PDF.js) and automated text extraction from uploaded PDF files are planned but not yet implemented.
- **Workaround**: Abstracts and metadata are manually or DOI-extracted.
- **Status**: PLANNED FEATURE

### 3. Firebase Cross-Device Sync (Requires Authentication)
- **Impact**: Low
- **Description**: Real-time cross-device synchronization requires users to sign in with an account. Guest mode data is not synced automatically.
- **Workaround**: Users are prompted to sign up/in to enable cloud sync.
- **Status**: WORKING AS INTENDED

### 4. AI Feature Requirement (Optional Key)
- **Impact**: Low
- **Description**: Live LLM synthesis requires a valid Google Gemini API key configured in `.env`. When no key is provided, the app falls back to a local synthesis engine based on paper keywords and abstracts.
- **Workaround**: Local fallback provides structured syntheses without API key.
- **Status**: WORKING AS INTENDED

### 5. Responsive Design Verification
- **Impact**: Low
- **Description**: While Tailwind CSS responsive classes are applied throughout the codebase, full visual verification at all specific breakpoints (360px, 390px, 430px, 768px, 1024px, 1280px, 1440px, 1920px) requires browser-based manual testing.
- **Status**: REQUIRES MANUAL TESTING

---

## Technical Debt

1. **Vite `__dirname` Warning**: Updated `vite.config.ts` to use `import.meta.dirname` for Vite native configLoader compatibility.
2. **Bundle Size**: React 19 + Lucide icons + Motion library generates a medium-sized JavaScript bundle. Future optimizations could include code splitting for modals.

---
