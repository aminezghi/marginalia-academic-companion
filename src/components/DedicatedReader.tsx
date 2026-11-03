import React, { useState, useEffect, useRef } from 'react';
import { ResearchItem, Highlight, HighlightColor, ReadingStatus } from '../types/research';
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Highlighter,
  Bookmark,
  MessageSquare,
  Search,
  Maximize2,
  Minimize2,
  Sidebar as SidebarIcon,
  Trash2,
  Copy,
  Check,
  ArrowLeft,
  Settings2,
} from 'lucide-react';
import { playTactileClick } from '../utils/sound';

interface DedicatedReaderProps {
  paper: ResearchItem | null;
  onClose: () => void;
  highlights: Highlight[];
  onAddHighlight: (highlight: Highlight) => void;
  onDeleteHighlight: (id: string) => void;
  onUpdateReadingProgress: (paperId: string, page: number, percent: number) => void;
}

const HIGHLIGHT_COLORS: { id: HighlightColor; label: string; hex: string; bgClass: string }[] = [
  { id: 'yellow', label: 'Important', hex: '#FDE047', bgClass: 'bg-yellow-200 text-yellow-950' },
  { id: 'blue', label: 'Methodology', hex: '#93C5FD', bgClass: 'bg-blue-200 text-blue-950' },
  { id: 'green', label: 'Key Finding', hex: '#86EFAC', bgClass: 'bg-emerald-200 text-emerald-950' },
  { id: 'pink', label: 'Research Question', hex: '#F9A8D4', bgClass: 'bg-pink-200 text-pink-950' },
  { id: 'orange', label: 'Future Idea', hex: '#FDBA74', bgClass: 'bg-orange-200 text-orange-950' },
];

export const DedicatedReader: React.FC<DedicatedReaderProps> = ({
  paper,
  onClose,
  highlights,
  onAddHighlight,
  onDeleteHighlight,
  onUpdateReadingProgress,
}) => {
  const [currentPage, setCurrentPage] = useState<number>(paper?.readingProgress.currentPage || 1);
  const totalPages = paper?.readingProgress.totalPages || 24;
  const [fontSize, setFontSize] = useState<number>(16); // px
  const [activeHighlightColor, setActiveHighlightColor] = useState<HighlightColor>('yellow');
  const [showLeftNav, setShowLeftNav] = useState<boolean>(() =>
    typeof window !== 'undefined' ? window.innerWidth >= 1200 : true
  );
  const [showRightNav, setShowRightNav] = useState<boolean>(() =>
    typeof window !== 'undefined' ? window.innerWidth >= 1200 : true
  );
  const [readerSearchQuery, setReaderSearchQuery] = useState<string>('');
  const [selectedTextForHighlight, setSelectedTextForHighlight] = useState<string>('');
  const [highlightNoteInput, setHighlightNoteInput] = useState<string>('');
  const [showHighlightModal, setShowHighlightModal] = useState<boolean>(false);
  const [copiedQuoteId, setCopiedQuoteId] = useState<string | null>(null);

  const readerContainerRef = useRef<HTMLDivElement>(null);

  const paperHighlights = highlights.filter((h) => h.paperId === paper?.id);

  // Sync reading progress
  useEffect(() => {
    if (paper) {
      const percent = Math.round((currentPage / totalPages) * 100);
      onUpdateReadingProgress(paper.id, currentPage, percent);
    }
  }, [currentPage, totalPages, paper, onUpdateReadingProgress]);

  if (!paper) return null;

  const handleTextSelection = () => {
    const selection = window.getSelection();
    const text = selection?.toString().trim();
    if (text && text.length > 5) {
      setSelectedTextForHighlight(text);
      setShowHighlightModal(true);
    }
  };

  const handleSaveHighlight = () => {
    if (!selectedTextForHighlight) return;
    const newHl: Highlight = {
      id: `hl-${Date.now()}`,
      paperId: paper.id,
      pageNumber: currentPage,
      text: selectedTextForHighlight,
      color: activeHighlightColor,
      note: highlightNoteInput.trim() || undefined,
      createdAt: new Date().toISOString(),
    };
    playTactileClick();
    onAddHighlight(newHl);
    setSelectedTextForHighlight('');
    setHighlightNoteInput('');
    setShowHighlightModal(false);
  };

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedQuoteId(id);
    setTimeout(() => setCopiedQuoteId(null), 2000);
  };

  // Generate document sections based on content text or metadata
  const documentSections = [
    { title: '1. Abstract & Objectives', page: 1 },
    { title: '2. Research Questions & Hypotheses', page: 3 },
    { title: '3. Methodology & Empirical Protocols', page: 6 },
    { title: '4. Data Extraction & Telemetry Analysis', page: 12 },
    { title: '5. Key Findings & Thematic Synthesis', page: 18 },
    { title: '6. Policy Contributions & References', page: 22 },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-[#EDEBE6] flex flex-col overflow-hidden animate-in fade-in duration-150">
      {/* Top Reading Header & Progress Bar */}
      <div className="relative border-b border-[#141414]/15 bg-[#F4F2ED] px-4 py-2.5 flex items-center justify-between gap-4 z-20">
        {/* Slim progress bar along top */}
        <div className="absolute top-0 inset-x-0 h-[2.5px] bg-[#141414]/10">
          <div
            className="h-full bg-[#1F3FB0] transition-all duration-150"
            style={{ width: `${Math.round((currentPage / totalPages) * 100)}%` }}
          />
        </div>

        {/* Left: Back & Document Metadata */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono uppercase border border-[#141414]/25 hover:border-[#1F3FB0] hover:text-[#1F3FB0] transition-colors cursor-pointer"
            title="Exit Reader"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">LIBRARY</span>
          </button>

          <div className="truncate">
            <span className="font-serif font-medium text-sm text-[#141414] truncate block">
              {paper.title}
            </span>
            <span className="text-[10px] font-mono text-[#77736B] truncate block">
              VOL. {paper.number} · {paper.authors.slice(0, 2).join(', ')} ({paper.year})
            </span>
          </div>
        </div>

        {/* Center: Pagination & Zoom */}
        <div className="hidden md:flex items-center gap-3 text-xs font-mono">
          <div className="flex items-center gap-1 bg-white border border-[#141414]/20 p-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              className="p-1 hover:bg-[#EDEBE6] disabled:opacity-30 cursor-pointer"
              title="Previous Page"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="px-2 font-semibold">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              className="p-1 hover:bg-[#EDEBE6] disabled:opacity-30 cursor-pointer"
              title="Next Page"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-1 border border-[#141414]/20 p-1 bg-white">
            <button
              onClick={() => setFontSize((s) => Math.max(13, s - 1))}
              className="p-1 hover:bg-[#EDEBE6] cursor-pointer"
              title="Decrease Font Size"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] px-1">{fontSize}px</span>
            <button
              onClick={() => setFontSize((s) => Math.min(22, s + 1))}
              className="p-1 hover:bg-[#EDEBE6] cursor-pointer"
              title="Increase Font Size"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right: Panel Toggles & Palette */}
        <div className="flex items-center gap-2">
          {/* Highlight Color Quick Swatch */}
          <div className="hidden sm:flex items-center gap-1 bg-white border border-[#141414]/20 p-1">
            {HIGHLIGHT_COLORS.map((c) => (
              <button
                key={c.id}
                onClick={() => setActiveHighlightColor(c.id)}
                className={`w-4 h-4 rounded-full transition-transform cursor-pointer ${
                  activeHighlightColor === c.id ? 'scale-125 ring-2 ring-[#1F3FB0]' : 'opacity-70 hover:opacity-100'
                }`}
                style={{ backgroundColor: c.hex }}
                title={`Highlight tool: ${c.label}`}
              />
            ))}
          </div>

          <button
            onClick={() => setShowLeftNav(!showLeftNav)}
            className={`p-1.5 border border-[#141414]/25 transition-colors cursor-pointer ${
              showLeftNav ? 'bg-[#1F3FB0] text-white' : 'bg-white text-[#141414]'
            }`}
            title="Toggle Outline Panel"
          >
            <SidebarIcon className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setShowRightNav(!showRightNav)}
            className={`p-1.5 border border-[#141414]/25 transition-colors cursor-pointer ${
              showRightNav ? 'bg-[#1F3FB0] text-white' : 'bg-white text-[#141414]'
            }`}
            title="Toggle Annotations Panel"
          >
            <Highlighter className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main 3-Panel Reading Stage */}
      <div className="flex-1 flex overflow-hidden">
        {/* PANEL 1 (LEFT): Document Outline & Search */}
        {showLeftNav && (
          <aside className="fixed inset-y-12 left-0 z-40 w-72 lg:static lg:w-64 border-r border-[#141414]/15 bg-[#F4F2ED] flex flex-col justify-between overflow-y-auto select-none p-4 space-y-4 shadow-2xl lg:shadow-none">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#77736B] block">
                  DOCUMENT OUTLINE
                </span>
                <button
                  onClick={() => setShowLeftNav(false)}
                  className="lg:hidden p-1 text-[#77736B] hover:text-[#141414] cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-1">
                {documentSections.map((sec, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentPage(sec.page)}
                    className={`w-full text-left p-2 text-xs font-mono transition-colors cursor-pointer flex items-center justify-between ${
                      currentPage >= sec.page &&
                      (idx === documentSections.length - 1 || currentPage < documentSections[idx + 1].page)
                        ? 'bg-white border-l-2 border-[#1F3FB0] font-semibold text-[#141414] shadow-xs'
                        : 'text-[#141414]/70 hover:bg-white/60'
                    }`}
                  >
                    <span className="truncate">{sec.title}</span>
                    <span className="text-[10px] text-[#77736B]">p.{sec.page}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Document Metadata Summary */}
            <div className="p-3 bg-white border border-[#141414]/15 text-xs font-mono space-y-2">
              <div className="text-[10px] text-[#77736B] uppercase font-bold">Document Specs</div>
              <div className="text-[#141414]">DOI: {paper.doi || 'Not assigned'}</div>
              <div className="text-[#141414]">Status: {paper.readingStatus.toUpperCase()}</div>
              <div className="text-[#141414]">Time Logged: {paper.readingProgress.totalReadingTimeMinutes}m</div>
            </div>
          </aside>
        )}

        {/* PANEL 2 (CENTER): Main Reading Area */}
        <main
          ref={readerContainerRef}
          onMouseUp={handleTextSelection}
          className="flex-1 overflow-y-auto p-6 md:p-12 flex justify-center bg-[#EDEBE6] paper-grain"
        >
          <div
            className="w-full max-w-3xl bg-white text-[#141414] p-8 md:p-14 border border-[#141414]/20 shadow-xl rounded-[2px] min-h-[90vh] space-y-8 select-text"
            style={{ fontSize: `${fontSize}px` }}
          >
            {/* Header Title block */}
            <div className="border-b border-[#141414]/15 pb-6">
              <div className="text-[11px] font-mono uppercase tracking-widest text-[#77736B]">
                {paper.type} · VOL. {paper.number} · {paper.year}
              </div>
              <h1 className="font-serif text-2xl md:text-3xl font-medium tracking-tight text-[#141414] mt-2 leading-snug">
                {paper.title}
              </h1>
              <div className="text-xs font-mono text-[#1F3FB0] mt-2">
                {paper.authors.join(' · ')}
              </div>
              {paper.institution && (
                <div className="text-xs font-mono text-[#77736B] mt-0.5">
                  {paper.institution}
                </div>
              )}
            </div>

            {/* Abstract */}
            <div className="p-4 bg-[#EDEBE6]/40 border-l-2 border-[#1F3FB0] italic font-serif leading-relaxed text-[#141414]/90">
              <span className="font-mono text-xs not-italic font-bold text-[#1F3FB0] uppercase tracking-wider block mb-1">
                Abstract
              </span>
              {paper.abstract}
            </div>

            {/* Realistic Extracted PDF Document Text or Scientific Synthesis */}
            <div className="space-y-6 font-serif leading-relaxed text-[#141414]/90">
              <h2 className="font-serif text-xl font-medium text-[#141414] border-b border-[#141414]/10 pb-1">
                1. Scientific Background & Research Focus
              </h2>
              <p>
                {paper.focus}
              </p>
              <p>
                Modern food systems and consumer research require robust empirical methodologies capable of evaluating granular behavioral micro-moments. Traditional surveys introduce hypothetical biases, while unobserved transactional data risks lack of qualitative intention context.
              </p>

              <h2 className="font-serif text-xl font-medium text-[#141414] border-b border-[#141414]/10 pb-1 pt-4">
                2. Experimental Objectives & Methodological Architecture
              </h2>
              <ul className="list-disc pl-5 space-y-2 font-sans text-sm">
                {paper.objectives.map((obj, i) => (
                  <li key={i}>{obj}</li>
                ))}
              </ul>

              {paper.pdfContentText && (
                <div className="mt-6 pt-4 border-t border-[#141414]/10 whitespace-pre-line font-serif text-base leading-relaxed">
                  {paper.pdfContentText}
                </div>
              )}

              {paper.keyFindings && paper.keyFindings.length > 0 && (
                <div className="mt-6 p-4 bg-emerald-50/50 border border-emerald-200/60 rounded-[2px] font-sans text-xs space-y-2">
                  <div className="font-mono font-bold text-emerald-900 uppercase tracking-wide">
                    Verified Empirical Findings
                  </div>
                  {paper.keyFindings.map((f, i) => (
                    <div key={i} className="text-emerald-950">
                      • {f}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Page Footer Navigation */}
            <div className="border-t border-[#141414]/15 pt-6 flex items-center justify-between text-xs font-mono text-[#77736B]">
              <span>Marginalia Academic Workspace · Archive Ref. ARCH-{paper.number}</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage <= 1}
                  className="px-2 py-1 border hover:border-[#1F3FB0] disabled:opacity-30 cursor-pointer"
                >
                  ← Previous
                </button>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage >= totalPages}
                  className="px-2 py-1 border hover:border-[#1F3FB0] disabled:opacity-30 cursor-pointer"
                >
                  Next →
                </button>
              </div>
            </div>
          </div>
        </main>

        {/* PANEL 3 (RIGHT): Highlights, Annotations & Bookmarks */}
        {showRightNav && (
          <aside className="fixed inset-y-12 right-0 z-40 w-80 lg:static lg:w-80 border-l border-[#141414]/15 bg-[#F4F2ED] flex flex-col justify-between overflow-y-auto p-4 space-y-4 select-none shadow-2xl lg:shadow-none">
            <div>
              <div className="flex items-center justify-between border-b border-[#141414]/15 pb-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#77736B]">
                  ANNOTATIONS ({paperHighlights.length})
                </span>
                <button
                  onClick={() => setShowRightNav(false)}
                  className="lg:hidden p-1 text-[#77736B] hover:text-[#141414] cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4 rotate-180" />
                </button>
              </div>

              {/* Highlights List */}
              <div className="space-y-3 mt-3">
                {paperHighlights.length === 0 ? (
                  <div className="p-4 bg-white border border-[#141414]/10 text-center text-xs font-mono text-[#77736B]">
                    No highlights created yet. Select text in the document to create an annotated citation.
                  </div>
                ) : (
                  paperHighlights.map((hl) => {
                    const colorDef = HIGHLIGHT_COLORS.find((c) => c.id === hl.color);
                    return (
                      <div
                        key={hl.id}
                        className="p-3 bg-white border border-[#141414]/20 rounded-[2px] space-y-2 text-xs font-mono group"
                      >
                        <div className="flex items-center justify-between text-[10px] text-[#77736B]">
                          <span
                            className="px-1.5 py-0.5 rounded-[1px] font-bold"
                            style={{ backgroundColor: colorDef?.hex || '#FDE047' }}
                          >
                            {colorDef?.label || 'Note'}
                          </span>
                          <span>Page {hl.pageNumber}</span>
                        </div>

                        <p className="font-serif italic text-xs leading-relaxed text-[#141414] border-l-2 border-[#1F3FB0] pl-2">
                          "{hl.text}"
                        </p>

                        {hl.note && (
                          <div className="p-2 bg-[#EDEBE6] text-[11px] font-mono text-[#141414] border-t border-[#141414]/10">
                            {hl.note}
                          </div>
                        )}

                        <div className="flex items-center justify-end gap-2 pt-1">
                          <button
                            onClick={() => handleCopyText(hl.text, hl.id)}
                            className="text-[#77736B] hover:text-[#1F3FB0] text-[10px] flex items-center gap-1 cursor-pointer"
                          >
                            {copiedQuoteId === hl.id ? (
                              <Check className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                            <span>Copy</span>
                          </button>
                          <button
                            onClick={() => onDeleteHighlight(hl.id)}
                            className="text-rose-600 hover:text-rose-800 text-[10px] flex items-center gap-1 cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Remove</span>
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Quick Annotation Guide */}
            <div className="p-3 bg-white border border-[#141414]/15 text-[11px] font-mono text-[#77736B] space-y-1">
              <span className="font-bold text-[#141414] block">READWISE-STYLE SHORTCUTS:</span>
              <div>• Select any text to trigger the highlighter modal.</div>
              <div>• All annotations persist in your personal knowledge base.</div>
            </div>
          </aside>
        )}
      </div>

      {/* Floating Highlight / Annotation Modal */}
      {showHighlightModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#F4F2ED] border border-[#141414]/30 p-5 max-w-lg w-full shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-[#141414]/15 pb-2">
              <span className="text-xs font-mono font-bold text-[#1F3FB0] uppercase tracking-wider">
                CREATE ACADEMIC HIGHLIGHT & NOTE
              </span>
              <button
                onClick={() => setShowHighlightModal(false)}
                className="text-xs font-mono text-[#77736B] hover:text-[#141414] cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-3 bg-white border border-[#141414]/20 italic font-serif text-sm leading-relaxed max-h-32 overflow-y-auto">
              "{selectedTextForHighlight}"
            </div>

            {/* Color picker */}
            <div>
              <label className="block text-[10px] font-mono uppercase text-[#77736B] mb-1.5">
                Annotation Category / Color
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {HIGHLIGHT_COLORS.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setActiveHighlightColor(c.id)}
                    className={`p-2 border flex items-center gap-2 text-left cursor-pointer transition-all ${
                      activeHighlightColor === c.id ? 'border-[#1F3FB0] bg-white shadow-xs' : 'border-[#141414]/20'
                    }`}
                  >
                    <div className="w-3.5 h-3.5 rounded-full shrink-0" style={{ backgroundColor: c.hex }} />
                    <span className="text-[10px] font-mono truncate">{c.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Note Input */}
            <div>
              <label className="block text-[10px] font-mono uppercase text-[#77736B] mb-1">
                Personal Interpretation or Question (Optional)
              </label>
              <textarea
                rows={3}
                value={highlightNoteInput}
                onChange={(e) => setHighlightNoteInput(e.target.value)}
                placeholder="What does this finding substantiate? Link to research question or thesis..."
                className="w-full p-2 bg-white border border-[#141414]/25 text-xs font-mono focus:border-[#1F3FB0] focus:outline-hidden"
              />
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-2 pt-2 border-t border-[#141414]/15">
              <button
                onClick={() => setShowHighlightModal(false)}
                className="px-3 py-1.5 border border-[#141414]/30 text-xs font-mono uppercase cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveHighlight}
                className="px-4 py-1.5 bg-[#1F3FB0] text-white text-xs font-mono uppercase font-bold hover:bg-[#19328D] transition-colors cursor-pointer"
              >
                Save Highlight
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
