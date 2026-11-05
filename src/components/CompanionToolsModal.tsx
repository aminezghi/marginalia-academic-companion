import React, { useRef, useState } from 'react';
import { ResearchItem, CategoryDefinition, ResearcherProfile } from '../types/research';
import { X, Download, Upload, RotateCcw, Copy, Check, BookOpen, Database, Sparkles } from 'lucide-react';
import { playTactileClick } from '../utils/sound';

interface CompanionToolsModalProps {
  isOpen: boolean;
  onClose: () => void;
  researchItems: ResearchItem[];
  categories: CategoryDefinition[];
  profile: ResearcherProfile;
  onImportData: (data: {
    researchItems: ResearchItem[];
    categories: CategoryDefinition[];
    profile: ResearcherProfile;
  }) => void;
  onClearContent: () => void | Promise<void>;
}

export const CompanionToolsModal: React.FC<CompanionToolsModalProps> = ({
  isOpen,
  onClose,
  researchItems,
  categories,
  profile,
  onImportData,
  onClearContent,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [copiedBibtex, setCopiedBibtex] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [resetError, setResetError] = useState<string | null>(null);
  const [resetSuccess, setResetSuccess] = useState<string | null>(null);
  const [resetting, setResetting] = useState(false);

  if (!isOpen) return null;

  // Generate full BibTeX file for all shelf publications
  const fullBibtex = researchItems
    .map((item) => {
      const year = item.year.slice(0, 4);
      return `@article{zouaghi_${year}_vol${item.number},
  title = {${item.title}},
  author = {Zouaghi, Amine and Collaborators},
  year = {${year}},
  type = {${item.type}},
  status = {${item.status}},
  category = {${item.category}},
  institution = {${item.institution || 'University of Parma'}},
  keywords = {${item.topics.join(', ')}}
}`;
    })
    .join('\n\n');

  const handleCopyAllBibtex = () => {
    navigator.clipboard.writeText(fullBibtex).then(() => {
      setCopiedBibtex(true);
      setTimeout(() => setCopiedBibtex(false), 2000);
    });
  };

  const handleExportJSON = () => {
    playTactileClick();
    const data = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      profile,
      categories,
      researchItems,
    };
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `academic-research-archive-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (!parsed.researchItems || !Array.isArray(parsed.researchItems)) {
          throw new Error('Invalid archive file format: missing researchItems array.');
        }
        playTactileClick();
        onImportData({
          researchItems: parsed.researchItems,
          categories: parsed.categories || categories,
          profile: parsed.profile || profile,
        });
        setImportError(null);
        onClose();
      } catch (err: any) {
        setImportError(err.message || 'Failed to parse JSON archive file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/65 backdrop-blur-sm overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Archive Companion Tools"
    >
      <div className="relative w-full max-w-2xl bg-[#F4F2ED] text-[#141414] border border-[#141414]/25 shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#141414]/15 bg-[#EDEBE6]">
          <div className="flex items-center gap-2 text-xs font-mono tracking-widest text-[#77736B]">
            <span className="text-[#141414] font-bold">RESEARCHER COMPANION SUITE</span>
            <span aria-hidden="true">·</span>
            <span className="text-[#1F3FB0]">DATA PERSISTENCE & PORTABILITY</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 border border-[#141414]/20 hover:bg-[#141414] hover:text-white transition-colors cursor-pointer"
            aria-label="Close Tools"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 md:p-8 space-y-6 overflow-y-auto max-h-[75vh]">
          {/* Shelf Summary Stats */}
          <div className="p-4 bg-white border border-[#141414]/15 grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-serif font-bold text-[#1F3FB0]">{researchItems.length}</div>
              <div className="text-[10px] font-mono text-[#77736B] uppercase mt-1">Total Volumes</div>
            </div>
            <div>
              <div className="text-2xl font-serif font-bold text-[#536B52]">{categories.length - 1}</div>
              <div className="text-[10px] font-mono text-[#77736B] uppercase mt-1">Research Areas</div>
            </div>
            <div>
              <div className="text-2xl font-serif font-bold text-[#141414]">
                {researchItems.filter((i) => i.status.includes('Published')).length}
              </div>
              <div className="text-[10px] font-mono text-[#77736B] uppercase mt-1">Published Papers</div>
            </div>
          </div>

          {/* Action 1: Export Complete Portfolio JSON */}
          <div className="p-4 bg-white border border-[#141414]/15 flex items-start justify-between gap-4">
            <div>
              <div className="font-semibold text-xs font-mono text-[#141414] uppercase">
                Export Archive Portfolio (.json)
              </div>
              <p className="text-[11px] font-mono text-[#77736B] mt-1 leading-relaxed">
                Download your complete shelf, customized publications, visual figures, and taxonomies into an open JSON archive format for safekeeping or sharing with peers.
              </p>
            </div>
            <button
              onClick={handleExportJSON}
              className="px-3.5 py-2 bg-[#1F3FB0] text-white text-xs font-mono uppercase font-bold shrink-0 flex items-center gap-1.5 hover:bg-[#19328D] transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>EXPORT</span>
            </button>
          </div>

          {/* Action 2: Import Archive JSON */}
          <div className="p-4 bg-white border border-[#141414]/15 flex items-start justify-between gap-4">
            <div>
              <div className="font-semibold text-xs font-mono text-[#141414] uppercase">
                Import Archive Portfolio (.json)
              </div>
              <p className="text-[11px] font-mono text-[#77736B] mt-1 leading-relaxed">
                Restore a previously exported research collection or load a peer's portfolio directly onto your physical 3D shelf.
              </p>
              {importError && (
                <div className="text-xs font-mono text-rose-700 mt-2 bg-rose-50 p-2 border border-rose-200">
                  {importError}
                </div>
              )}
            </div>
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileChange}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-3.5 py-2 border border-[#141414]/30 hover:border-[#1F3FB0] hover:text-[#1F3FB0] text-xs font-mono uppercase font-bold shrink-0 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>IMPORT</span>
              </button>
            </div>
          </div>

          {/* Action 3: Master BibTeX Export */}
          <div className="p-4 bg-white border border-[#141414]/15 flex items-start justify-between gap-4">
            <div>
              <div className="font-semibold text-xs font-mono text-[#141414] uppercase">
                Master BibTeX Bibliography
              </div>
              <p className="text-[11px] font-mono text-[#77736B] mt-1 leading-relaxed">
                Copy formatted BibTeX citation blocks for all {researchItems.length} publications on your shelf for insertion into LaTeX, Overleaf, or reference managers.
              </p>
            </div>
            <button
              onClick={handleCopyAllBibtex}
              className="px-3.5 py-2 border border-[#141414]/30 hover:border-[#1F3FB0] hover:text-[#1F3FB0] text-xs font-mono uppercase font-bold shrink-0 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {copiedBibtex ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">COPIED</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>COPY ALL</span>
                </>
              )}
            </button>
          </div>

          {/* Action 4: Clear all saved library content */}
          <div className="p-4 bg-[#EDEBE6] border border-[#141414]/15 flex items-center justify-between gap-4">
            <div>
              <div className="font-semibold text-xs font-mono text-[#141414] uppercase">
                Clear All Library Content
              </div>
              <p className="text-[11px] font-mono text-[#77736B] mt-0.5">
                Remove saved papers and library content from this device and your local account. Your sign-in and preferences stay intact.
              </p>
            </div>
            <button
              onClick={() => setShowResetConfirm(true)}
              className="px-3 py-1.5 border border-rose-300 text-rose-700 hover:bg-rose-50 text-xs font-mono uppercase shrink-0 transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <RotateCcw className="w-3 h-3" />
              <span>CLEAR CONTENT</span>
            </button>
          </div>

          {/* Reset Confirmation Prompt */}
          {showResetConfirm && (
            <div className="p-4 bg-rose-50 border border-rose-300 space-y-3">
              <div className="text-xs font-mono text-rose-900 font-bold uppercase">
                Clear all saved content?
              </div>
              <p className="text-xs font-mono text-rose-800 leading-relaxed">
                This cannot be undone. It removes papers, collections, notes, highlights, progress, goals, activity history, and attached PDFs. Your account and preferences stay.
              </p>
              {resetError && <p role="alert" className="text-xs font-mono text-rose-900">{resetError}</p>}
              <div className="flex gap-2">
                <button
                  onClick={() => setShowResetConfirm(false)}
                  disabled={resetting}
                  className="px-3 py-1 bg-white border border-rose-300 text-xs font-mono uppercase cursor-pointer"
                >
                  CANCEL
                </button>
                <button
                  disabled={resetting}
                  onClick={async () => {
                    setResetting(true);
                    setResetError(null);
                    setResetSuccess(null);
                    try {
                      await onClearContent();
                      setShowResetConfirm(false);
                      setResetSuccess('Library content was cleared successfully.');
                    } catch (error) {
                      setResetError(error instanceof Error ? error.message : 'Could not clear library content. Please try again.');
                    } finally {
                      setResetting(false);
                    }
                  }}
                  className="px-3 py-1 bg-rose-700 text-white text-xs font-mono uppercase font-bold cursor-pointer hover:bg-rose-800 disabled:opacity-60"
                >
                  {resetting ? 'CLEARING…' : 'CONFIRM CLEAR'}
                </button>
              </div>
            </div>
          )}
          {resetSuccess && <p role="status" className="p-3 bg-emerald-50 border border-emerald-200 text-xs font-mono text-emerald-800">{resetSuccess}</p>}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[#141414]/15 bg-[#EDEBE6] flex items-center justify-between text-[11px] font-mono text-[#77736B]">
          <span>Archive state is stored automatically in your browser localStorage.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#141414] text-white hover:bg-[#1F3FB0] transition-colors cursor-pointer"
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
};
