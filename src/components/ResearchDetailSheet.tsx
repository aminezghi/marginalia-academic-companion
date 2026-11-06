import React, { useState, useEffect } from 'react';
import { ResearchItem } from '../types/research';
import { VisualResearchMaterial } from './VisualResearchMaterial';
import { X, Copy, Check, ExternalLink, Download, FileText, ArrowRight, Share2 } from 'lucide-react';
import { playTactileClick } from '../utils/sound';

interface ResearchDetailSheetProps {
  item: ResearchItem | null;
  onClose: () => void;
  onNavigateNext?: () => void;
  onNavigatePrev?: () => void;
  hasNext?: boolean;
  hasPrev?: boolean;
  onEdit?: (item: ResearchItem) => void;
  onDelete?: (itemId: string) => void;
  onOpenInReader?: (paper: ResearchItem) => void;
  onStatusChange?: (newStatus: any) => void;
}

export const ResearchDetailSheet: React.FC<ResearchDetailSheetProps> = ({
  item,
  onClose,
  onNavigateNext,
  onNavigatePrev,
  hasNext = false,
  hasPrev = false,
  onEdit,
  onDelete,
  onOpenInReader,
  onStatusChange,
}) => {
  const [copiedAction, setCopiedAction] = useState<string | null>(null);
  const [showCitationModal, setShowCitationModal] = useState<boolean>(false);
  const [modalNotice, setModalNotice] = useState<string | null>(null);
  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Track scroll position of the long-form scientific abstract/methodology container
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    const maxScroll = scrollHeight - clientHeight;
    if (maxScroll > 0) {
      const progress = Math.min(100, Math.max(0, (scrollTop / maxScroll) * 100));
      setScrollProgress(progress);
    } else {
      setScrollProgress(100);
    }
  };

  if (!item) return null;

  const bibtex = `@article{zouaghi${item.year.slice(0, 4)}_${item.number},
  title = {${item.title}},
  author = {Zouaghi, Amine and Collaborators},
  year = {${item.year.slice(0, 4)}},
  type = {${item.type}},
  institution = {${item.institution || 'University of Parma'}},
  keywords = {${item.topics.join(', ')}}
}`;

  const handleCopyCitation = () => {
    navigator.clipboard.writeText(bibtex).then(() => {
      setCopiedAction('citation');
      setTimeout(() => setCopiedAction(null), 2000);
    });
  };

  const handleResourceClick = (actionType: string, meta?: string) => {
    playTactileClick();
    if (actionType === 'copy-citation') {
      handleCopyCitation();
    } else if (actionType === 'request-preprint') {
      setModalNotice(
        `Pre-print request initiated for: "${item.title}". You may direct correspondence to Amine Zouaghi at the University of Parma or via azouaghiamine@gmail.com.`
      );
    } else if (actionType === 'download-summary') {
      setModalNotice(
        `Methodology extraction sheet and protocol notes compiled for Archive Reference VOL. ${item.number}.`
      );
    } else if (actionType === 'schema-viewer') {
      setModalNotice(
        `Structured schema documentation loaded: ${item.dataSources || 'Open Scientific Repositories & Crossref Metadata'}. Unified relational model active in right panel.`
      );
    } else if (actionType === 'external-link') {
      window.open('https://www.unipr.it', '_blank');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/60 backdrop-blur-sm overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label={`Research Archive Detail: ${item.title}`}
    >
      {/* Expanding Paper-like Sheet */}
      <div
        className="relative w-full max-w-6xl min-h-[90vh] my-auto bg-[#F4F2ED] text-[#141414] shadow-2xl rounded-[2px] border border-[#141414]/20 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        style={{
          boxShadow: '0 30px 60px -12px rgba(0, 0, 0, 0.45), 0 0 0 1px rgba(20,20,20,0.15)',
        }}
      >
        {/* Subtle, slim progress indicator bar across the top of the detail sheet */}
        <div
          className="absolute top-0 inset-x-0 h-[3px] bg-[#141414]/10 z-50 overflow-hidden pointer-events-none"
          title={`Reading progress: ${Math.round(scrollProgress)}%`}
        >
          <div
            className="h-full bg-[#1F3FB0] transition-all duration-100 ease-out"
            style={{ width: `${scrollProgress}%` }}
            role="progressbar"
            aria-valuenow={Math.round(scrollProgress)}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>

        {/* Archival Top Header Strip */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#141414]/15 bg-[#EDEBE6] relative z-20">
          <div className="flex items-center gap-3 text-xs font-mono tracking-wider text-[#77736B]">
            <span className="font-bold text-[#141414]">ARCHIVE REF: ARCH-{item.number}</span>
            <span aria-hidden="true">·</span>
            <span>VOL. {item.year}</span>
            <span aria-hidden="true">·</span>
            <span className="text-[#1F3FB0] font-semibold">{item.category}</span>
            <span aria-hidden="true" className="hidden md:inline">·</span>
            <span className="hidden md:inline text-[10px] text-[#77736B] tabular-nums">
              READING PROGRESS: {Math.round(scrollProgress)}%
            </span>
          </div>

          {/* Right Header Navigation, Edit & Close Controls */}
          <div className="flex items-center gap-2">
            {onEdit && (
              <button
                onClick={() => onEdit(item)}
                className="px-2.5 py-1 text-xs font-mono border border-[#141414]/25 hover:border-[#1F3FB0] hover:text-[#1F3FB0] transition-colors cursor-pointer"
                title="Edit this research item"
              >
                EDIT ARTICLE
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="px-2 py-1 text-xs font-mono border border-rose-300 text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
                title="Remove this item from the shelf"
              >
                DELETE
              </button>
            )}
            {hasPrev && onNavigatePrev && (
              <button
                onClick={onNavigatePrev}
                className="px-2.5 py-1 text-xs font-mono border border-[#141414]/20 hover:border-[#1F3FB0] hover:text-[#1F3FB0] transition-colors cursor-pointer ml-1"
                title="Previous publication"
              >
                ← PREV
              </button>
            )}
            {hasNext && onNavigateNext && (
              <button
                onClick={onNavigateNext}
                className="px-2.5 py-1 text-xs font-mono border border-[#141414]/20 hover:border-[#1F3FB0] hover:text-[#1F3FB0] transition-colors cursor-pointer"
                title="Next publication"
              >
                NEXT →
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 border border-[#141414]/20 hover:bg-[#141414] hover:text-white transition-colors cursor-pointer ml-2"
              aria-label="Close Research Sheet"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Content Container with onScroll tracking */}
        <div onScroll={handleScroll} className="flex-1 p-6 md:p-10 overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            {/* LEFT COLUMN: Scientific Information (7 cols) */}
            <div className="lg:col-span-7 flex flex-col gap-8">
              {/* Header: Title, Field, Status */}
              <div>
                <div className="flex items-center gap-2 text-xs font-mono text-[#77736B] uppercase mb-2">
                  <span>{item.type}</span>
                  <span aria-hidden="true">·</span>
                  <span
                    className={`font-semibold ${
                      item.status.includes('Manuscript')
                        ? 'text-amber-800'
                        : item.status.includes('Ongoing')
                        ? 'text-[#1F3FB0]'
                        : 'text-[#536B52]'
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
                <h1 className="font-serif text-2xl md:text-3xl lg:text-4xl font-medium tracking-tight text-[#141414] leading-snug">
                  {item.title}
                </h1>
                <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-[#77736B] mt-3">
                  <span>Author: Amine Zouaghi</span>
                  {item.institution && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span className="text-[#1F3FB0]">{item.institution}</span>
                    </>
                  )}
                  <span aria-hidden="true">·</span>
                  <span>{item.year}</span>
                </div>
              </div>

              {/* Scientific Abstract */}
              <div className="border-t border-[#141414]/15 pt-6">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#77736B] block mb-2">
                  SCIENTIFIC ABSTRACT
                </span>
                <p className="font-serif text-base md:text-lg text-[#141414]/90 leading-relaxed max-w-prose text-justify first-letter:text-4xl first-letter:font-serif first-letter:font-medium first-letter:float-left first-letter:mr-2.5 first-letter:text-[#1F3FB0]">
                  {item.abstract}
                </p>
              </div>

              {/* Research Objectives & Questions */}
              <div className="border-t border-[#141414]/15 pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#77736B] block mb-3">
                    RESEARCH OBJECTIVES
                  </span>
                  <ul className="space-y-2 text-xs font-sans text-[#141414]/85 leading-relaxed">
                    {item.objectives.map((obj, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="font-mono text-[#1F3FB0] font-semibold text-[11px] shrink-0">
                          0{i + 1}.
                        </span>
                        <span>{obj}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#77736B] block mb-3">
                    RESEARCH QUESTIONS
                  </span>
                  <ul className="space-y-2 text-xs font-sans text-[#141414]/85 leading-relaxed">
                    {item.researchQuestions.map((q, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="font-mono text-[#536B52] font-semibold text-[11px] shrink-0">
                          Q{i + 1}.
                        </span>
                        <span>{q}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Methodology & Data Specifications */}
              <div className="border-t border-[#141414]/15 pt-6">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#77736B] block mb-3">
                  METHODOLOGY & EXPERIMENTAL ARCHITECTURE
                </span>
                <div className="bg-[#EDEBE6] p-4 border border-[#141414]/15 space-y-3 text-xs font-mono">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                    <span className="text-[#77736B] w-28 shrink-0">TECHNIQUES:</span>
                    <span className="text-[#141414] font-medium">{item.methods.join(' · ')}</span>
                  </div>
                  {item.tools && (
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 border-t border-[#141414]/10 pt-2">
                      <span className="text-[#77736B] w-28 shrink-0">SOFTWARE/TOOLS:</span>
                      <span className="text-[#1F3FB0] font-medium">{item.tools.join(', ')}</span>
                    </div>
                  )}
                  {item.dataSources && (
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 border-t border-[#141414]/10 pt-2">
                      <span className="text-[#77736B] w-28 shrink-0">DATA SOURCES:</span>
                      <span className="text-[#141414]">{item.dataSources}</span>
                    </div>
                  )}
                  {item.sample && (
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 border-t border-[#141414]/10 pt-2">
                      <span className="text-[#77736B] w-28 shrink-0">SAMPLE / CORPUS:</span>
                      <span className="text-[#141414]">{item.sample}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Verified Key Findings */}
              {item.keyFindings && item.keyFindings.length > 0 && (
                <div className="border-t border-[#141414]/15 pt-6">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#77736B] block mb-3">
                    VERIFIED RESEARCH FINDINGS & EVIDENCE
                  </span>
                  <div className="space-y-2.5">
                    {item.keyFindings.map((finding, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-white border border-[#141414]/15 text-xs font-sans text-[#141414] leading-relaxed flex items-start gap-2.5"
                      >
                        <span className="font-mono text-xs font-bold text-[#1F3FB0] shrink-0 mt-0.5">
                          §{idx + 1}
                        </span>
                        <span>{finding}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Scientific Contributions */}
              <div className="border-t border-[#141414]/15 pt-6">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#77736B] block mb-2">
                  INTELLECTUAL & POLICY CONTRIBUTIONS
                </span>
                <ul className="space-y-1.5 text-xs font-sans text-[#141414]/85 leading-relaxed">
                  {item.contributions.map((c, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-[#536B52] font-mono">▸</span>
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Collaborators & Institutions */}
              {item.collaborators && item.collaborators.length > 0 && (
                <div className="border-t border-[#141414]/15 pt-6 text-xs font-mono text-[#77736B]">
                  <span className="text-[10px] uppercase tracking-widest block mb-1">
                    COLLABORATING INSTITUTIONS & CONSORTIA
                  </span>
                  <p className="text-[#141414] font-sans text-xs">
                    {item.collaborators.join(' · ')}
                  </p>
                </div>
              )}
            </div>

            {/* RIGHT COLUMN: Visual Material & Interactive Figures (5 cols) */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              {/* Sticky container for visual materials */}
              <div className="lg:sticky lg:top-4 flex flex-col gap-6">
                {/* Visual Research Material Renderer */}
                <VisualResearchMaterial item={item} />

                {/* Topics / Keywords Taxonomy */}
                <div className="p-4 bg-white border border-[#141414]/15">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#77736B] block mb-2">
                    TOPICS & ONTOLOGICAL TAXONOMY
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {item.topics.map((t, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] font-mono text-[#141414] bg-[#EDEBE6] px-2 py-0.5 border border-[#141414]/15"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Resource Actions Panel */}
                <div className="p-4 bg-[#EDEBE6] border border-[#141414]/15 flex flex-col gap-2.5">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#77736B]">
                    RESEARCH RESOURCES & ACTIONS
                  </span>
                  {onOpenInReader && (
                    <button
                      onClick={() => {
                        onClose();
                        onOpenInReader(item);
                      }}
                      className="w-full text-left p-2.5 bg-[#141414] text-white hover:bg-[#1F3FB0] transition-colors text-xs font-mono flex items-center justify-between group cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-white" />
                        <span className="font-semibold uppercase tracking-wider">
                          Open in Academic Reader
                        </span>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </button>
                  )}
                  {item.resources.map((res, i) => (
                    <button
                      key={i}
                      onClick={() => handleResourceClick(res.actionType, res.meta)}
                      className="w-full text-left p-2.5 bg-white border border-[#141414]/20 hover:border-[#1F3FB0] hover:bg-[#1F3FB0]/5 transition-all text-xs font-mono flex items-center justify-between group cursor-pointer"
                    >
                      <div className="flex flex-col">
                        <span className="font-semibold text-[#141414] group-hover:text-[#1F3FB0]">
                          {res.label}
                        </span>
                        {res.meta && (
                          <span className="text-[10px] text-[#77736B]">{res.meta}</span>
                        )}
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-[#77736B] group-hover:text-[#1F3FB0] group-hover:translate-x-1 transition-transform" />
                    </button>
                  ))}

                  <button
                    onClick={handleCopyCitation}
                    className="w-full p-2 bg-transparent border border-[#141414]/30 hover:border-[#141414] text-xs font-mono flex items-center justify-center gap-2 cursor-pointer transition-colors"
                  >
                    {copiedAction === 'citation' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700 font-semibold">BIBTEX CITATION COPIED</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>COPY BIBTEX REFERENCE</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Notice Modal Overlay for Actions */}
        {modalNotice && (
          <div className="absolute inset-0 z-30 bg-black/40 backdrop-blur-xs flex items-center justify-center p-6">
            <div className="bg-[#F4F2ED] border border-[#141414]/30 p-6 max-w-md w-full shadow-2xl">
              <div className="text-xs font-mono text-[#1F3FB0] font-semibold uppercase tracking-wider mb-2">
                ARCHIVE DISPATCH
              </div>
              <p className="text-xs font-mono text-[#141414] leading-relaxed mb-4">
                {modalNotice}
              </p>
              <button
                onClick={() => setModalNotice(null)}
                className="w-full py-2 bg-[#141414] text-white text-xs font-mono uppercase tracking-wider hover:bg-[#1F3FB0] transition-colors cursor-pointer"
              >
                DISMISS
              </button>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="absolute inset-0 z-40 bg-black/50 backdrop-blur-xs flex items-center justify-center p-6">
            <div className="bg-[#F4F2ED] border border-rose-300 p-6 max-w-md w-full shadow-2xl">
              <div className="text-xs font-mono text-rose-700 font-semibold uppercase tracking-wider mb-2">
                CONFIRM ARCHIVE REMOVAL
              </div>
              <p className="text-xs font-mono text-[#141414] leading-relaxed mb-4">
                Are you sure you want to remove <span className="font-bold">"{item.title}"</span> from your physical archive shelf?
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 py-2 border border-[#141414]/30 text-xs font-mono uppercase tracking-wider hover:bg-stone-200 transition-colors cursor-pointer"
                >
                  CANCEL
                </button>
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    if (onDelete) onDelete(item.id);
                  }}
                  className="flex-1 py-2 bg-rose-700 text-white text-xs font-mono uppercase tracking-wider hover:bg-rose-800 transition-colors cursor-pointer"
                >
                  REMOVE FROM SHELF
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
