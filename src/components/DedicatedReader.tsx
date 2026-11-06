import React, { useCallback, useState, useEffect, useRef } from 'react';
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
import { generateCitationText } from '../utils/academicExport';
import type { PdfDocumentReaderProps } from './PdfDocumentReader';

interface DedicatedReaderProps {
  paper: ResearchItem | null;
  readingQueue: ResearchItem[];
  readingScope: string | null;
  onNavigatePaper: (paper: ResearchItem) => void;
  onClose: () => void;
  highlights: Highlight[];
  onAddHighlight: (highlight: Highlight) => void;
  onDeleteHighlight: (id: string) => void;
  onUpdateReadingProgress: (paperId: string, page: number, percent: number, totalPages: number) => void;
  onAttachPdf: (file: File) => Promise<void>;
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
  readingQueue,
  readingScope,
  onNavigatePaper,
  onClose,
  highlights,
  onAddHighlight,
  onDeleteHighlight,
  onUpdateReadingProgress,
  onAttachPdf,
}) => {
  const [currentPage, setCurrentPage] = useState<number>(paper?.readingProgress.currentPage || 1);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [requestedPage, setRequestedPage] = useState(0);
  const [zoom, setZoom] = useState(1);
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
  const [canvasTheme, setCanvasTheme] = useState<'linen' | 'sepia' | 'slate' | 'monochrome'>('linen');
  const [isZenMode, setIsZenMode] = useState<boolean>(false);
  const [showCitationDropdown, setShowCitationDropdown] = useState<boolean>(false);
  const [citationCopiedFormat, setCitationCopiedFormat] = useState<string | null>(null);
  const [copiedQuoteId, setCopiedQuoteId] = useState<string | null>(null);
  const lastProgressRef = useRef('');
  const [PdfDocumentReader, setPdfDocumentReader] = useState<React.ComponentType<PdfDocumentReaderProps> | null>(null);

  const paperHighlights = highlights.filter((h) => h.paperId === paper?.id);

  useEffect(() => {
    let active = true;
    void import('./PdfDocumentReader').then((module) => {
      if (active) setPdfDocumentReader(() => module.PdfDocumentReader);
    });
    return () => { active = false; };
  }, []);

  const handlePageCount = useCallback((pageCount: number) => {
    setTotalPages(pageCount);
    setCurrentPage((page) => pageCount > 0 ? Math.min(page, pageCount) : 1);
  }, []);

  const handleCurrentPageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  // Sync reading progress
  useEffect(() => {
    const progressKey = `${paper?.id ?? ''}:${currentPage}:${totalPages}`;
    if (paper && totalPages > 0 && lastProgressRef.current !== progressKey) {
      lastProgressRef.current = progressKey;
      const percent = Math.round((currentPage / totalPages) * 100);
      onUpdateReadingProgress(paper.id, currentPage, percent, totalPages);
    }
  }, [currentPage, totalPages, paper?.id, onUpdateReadingProgress]);

  useEffect(() => {
    const startPage = paper?.readingProgress.currentPage || 1;
    setCurrentPage(startPage);
    setTotalPages(0);
    setRequestedPage(startPage);
    lastProgressRef.current = '';
  }, [paper?.id, paper?.storagePath, paper?.guestPdfId]);

  if (!paper) return null;

  const queueIndex = Math.max(0, readingQueue.findIndex((queuedPaper) => queuedPaper.id === paper.id));
  const previousPaper = queueIndex > 0 ? readingQueue[queueIndex - 1] : null;
  const nextPaper = queueIndex < readingQueue.length - 1 ? readingQueue[queueIndex + 1] : null;

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

  return (
    <div className="fixed inset-0 z-50 bg-[#EDEBE6] flex flex-col overflow-hidden animate-in fade-in duration-150">
      {/* Top Reading Header & Progress Bar */}
      <div className="relative border-b border-[#141414]/15 bg-[#F4F2ED] px-4 py-2.5 flex items-center justify-between gap-4 z-20">
        {/* Slim progress bar along top */}
        <div className="absolute top-0 inset-x-0 h-[2.5px] bg-[#141414]/10">
          <div
            className="h-full bg-[#1F3FB0] transition-all duration-150"
            style={{ width: `${totalPages ? Math.round((currentPage / totalPages) * 100) : 0}%` }}
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
        <div className="flex items-center gap-1 sm:gap-3 text-xs font-mono">
          {readingQueue.length > 1 && (
            <nav aria-label={`Papers in ${readingScope || 'this book'}`} className="flex items-center gap-1 border border-[#1F3FB0]/25 bg-white p-1">
              <button
                type="button"
                aria-label="Previous paper"
                title="Previous paper in this book or folder"
                disabled={!previousPaper}
                onClick={() => previousPaper && onNavigatePaper(previousPaper)}
                className="p-1 hover:bg-[#EDEBE6] disabled:opacity-30 cursor-pointer"
              ><ChevronLeft className="w-3.5 h-3.5" /></button>
              <span className="px-1 text-[10px] font-semibold whitespace-nowrap" aria-live="polite">
                {readingScope ? `${readingScope} · ` : ''}{queueIndex + 1} of {readingQueue.length}
              </span>
              <button
                type="button"
                aria-label="Next paper"
                title="Next paper in this book or folder"
                disabled={!nextPaper}
                onClick={() => nextPaper && onNavigatePaper(nextPaper)}
                className="p-1 hover:bg-[#EDEBE6] disabled:opacity-30 cursor-pointer"
              ><ChevronRight className="w-3.5 h-3.5" /></button>
            </nav>
          )}
          <div className="flex items-center gap-1 bg-white border border-[#141414]/20 p-1">
            <button
              onClick={() => setRequestedPage(Math.max(1, currentPage - 1))}
              disabled={currentPage <= 1}
              className="p-1 hover:bg-[#EDEBE6] disabled:opacity-30 cursor-pointer"
              title="Previous Page"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="px-2 font-semibold">
              {totalPages > 0 ? `Page ${currentPage} of ${totalPages}` : paper.storagePath || paper.guestPdfId ? 'Loading pages…' : 'PDF not attached'}
            </span>
            <button
              onClick={() => setRequestedPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage >= totalPages}
              className="p-1 hover:bg-[#EDEBE6] disabled:opacity-30 cursor-pointer"
              title="Next Page"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-1 border border-[#141414]/20 p-1 bg-white">
            <button
              onClick={() => setZoom((s) => Math.max(0.5, Math.round((s - 0.1) * 10) / 10))}
              className="p-1 hover:bg-[#EDEBE6] cursor-pointer"
              title="Zoom out"
              aria-label="Zoom out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
              <span className="text-[10px] px-1 tabular-nums">{Math.round(zoom * 100)}%</span>
            <button
              onClick={() => setZoom((s) => Math.min(2, Math.round((s + 0.1) * 10) / 10))}
              className="p-1 hover:bg-[#EDEBE6] cursor-pointer"
              title="Zoom in"
              aria-label="Zoom in"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>
          <button
            type="button"
            onClick={() => setZoom(1)}
            className="p-1 border border-[#141414]/20 bg-white hover:bg-[#EDEBE6] cursor-pointer"
            title="Fit to width"
            aria-label="Fit PDF to width"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
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

          {/* Theme Canvas Picker */}
          <div className="hidden md:flex items-center gap-1 border border-[#141414]/20 bg-white p-1">
            {(['linen', 'sepia', 'slate', 'monochrome'] as const).map((thm) => (
              <button
                key={thm}
                onClick={() => {
                  playTactileClick();
                  setCanvasTheme(thm);
                }}
                className={`px-1.5 py-0.5 text-[10px] font-mono uppercase rounded-[1px] cursor-pointer transition-colors ${
                  canvasTheme === thm ? 'bg-[#1F3FB0] text-white font-bold' : 'text-[#141414]/70 hover:text-[#141414]'
                }`}
                title={`Switch to ${thm} canvas`}
              >
                {thm[0].toUpperCase()}
              </button>
            ))}
          </div>

          {/* Quick Citation Copy Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowCitationDropdown(!showCitationDropdown)}
              className="p-1.5 border border-[#141414]/25 bg-white hover:border-[#1F3FB0] text-xs font-mono flex items-center gap-1 cursor-pointer"
              title="Copy Academic Citation (APA, Chicago, BibTeX...)"
            >
              <Copy className="w-3.5 h-3.5 text-[#1F3FB0]" />
              <span className="hidden xl:inline text-[10px]">CITE</span>
            </button>
            {showCitationDropdown && (
              <div className="absolute right-0 top-full mt-1 w-44 bg-white border border-[#141414] shadow-lg z-50 p-1 divide-y divide-[#141414]/10 text-xs font-mono">
                {(['apa', 'chicago', 'harvard', 'mla', 'bibtex'] as const).map((fmt) => (
                  <button
                    key={fmt}
                    onClick={() => {
                      playTactileClick();
                      const text = generateCitationText(paper, fmt);
                      navigator.clipboard.writeText(text);
                      setCitationCopiedFormat(fmt);
                      setTimeout(() => {
                        setCitationCopiedFormat(null);
                        setShowCitationDropdown(false);
                      }, 1200);
                    }}
                    className="w-full text-left px-2.5 py-1.5 hover:bg-[#F4F1EA] flex items-center justify-between cursor-pointer"
                  >
                    <span className="uppercase font-semibold">{fmt}</span>
                    {citationCopiedFormat === fmt ? (
                      <span className="text-[10px] text-emerald-600 font-bold">COPIED</span>
                    ) : (
                      <span className="text-[10px] text-[#77736B]">Copy</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Zen Focus Mode Button */}
          <button
            onClick={() => {
              playTactileClick();
              setIsZenMode(!isZenMode);
            }}
            className={`p-1.5 border border-[#141414]/25 transition-colors cursor-pointer ${
              isZenMode ? 'bg-[#742421] text-white font-bold' : 'bg-white text-[#141414]'
            }`}
            title={isZenMode ? 'Exit Zen Focus Mode' : 'Enter Zen Focus Reading Mode'}
          >
            <span className="text-[10px] font-mono px-0.5">ZEN</span>
          </button>

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
      <div className="min-h-0 min-w-0 flex-1 flex overflow-hidden">
        {/* PANEL 1 (LEFT): Document Outline & Search */}
        {!isZenMode && showLeftNav && (
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
              <div className="max-h-[50vh] space-y-1 overflow-y-auto">
                {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setRequestedPage(page)}
                    aria-current={currentPage === page ? 'page' : undefined}
                    className={`w-full text-left p-2 text-xs font-mono transition-colors cursor-pointer ${
                      currentPage === page
                        ? 'bg-white border-l-2 border-[#1F3FB0] font-semibold text-[#141414] shadow-xs'
                        : 'text-[#141414]/70 hover:bg-white/60'
                    }`}
                  >
                    Page {page}
                  </button>
                ))}
                {totalPages === 0 && <p className="text-xs text-[#77736B]">Pages appear when the PDF is ready.</p>}
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

        {/* PANEL 2 (CENTER): Main Reading Area with Canvas Theme */}
        <main
          className={`relative min-h-0 min-w-0 flex-1 overflow-hidden transition-colors duration-200 ${
            canvasTheme === 'sepia'
              ? 'bg-[#EFE6D5]'
              : canvasTheme === 'slate'
                ? 'bg-[#18181B]'
                : canvasTheme === 'monochrome'
                  ? 'bg-[#FFFFFF]'
                  : 'bg-[#EDEBE6]'
          }`}
        >
          {/* Ribbon Reading Marker */}
          <div
            className="absolute top-0 right-6 z-30 pointer-events-none drop-shadow-md select-none transition-all duration-300"
            title={`Reading Progress: ${totalPages ? Math.round((currentPage / totalPages) * 100) : 0}%`}
          >
            <div className="w-6 h-12 bg-[#8B263E] border-b border-r border-[#5c1929] relative flex flex-col items-center justify-end pb-1 shadow-sm">
              <div className="absolute -bottom-2 inset-x-0 border-solid border-t-[#8B263E] border-t-[8px] border-x-transparent border-x-[12px] border-b-0" />
              <span className="text-[8px] font-mono font-bold text-amber-200 tracking-tighter">
                {totalPages ? Math.round((currentPage / totalPages) * 100) : 0}%
              </span>
            </div>
          </div>

          {PdfDocumentReader ? (
            <PdfDocumentReader
              key={paper.id}
              paper={paper}
              requestedPage={requestedPage}
              zoom={zoom}
              onPageCount={handlePageCount}
              onCurrentPageChange={handleCurrentPageChange}
              onTextSelection={handleTextSelection}
              onAttachPdf={onAttachPdf}
            />
          ) : (
            <p role="status" className="absolute inset-0 grid place-items-center font-mono text-sm text-[#77736B]">
              Loading PDF renderer…
            </p>
          )}
        </main>

        {/* PANEL 3 (RIGHT): Highlights, Annotations & Bookmarks */}
        {!isZenMode && showRightNav && (
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
