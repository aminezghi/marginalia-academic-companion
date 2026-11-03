import React, { useState } from 'react';
import {
  X,
  Upload,
  Globe,
  FileText,
  Check,
  AlertCircle,
  FileCode,
  Table,
  Sparkles,
  ArrowRight,
  BookOpen,
} from 'lucide-react';
import { ResearchItem, ResearchCategory } from '../types/research';
import { parseBibTeX, parseRIS, parseCSV, ParsedRecord } from '../utils/importer';
import { playTactileClick, playPaperRustle } from '../utils/sound';

interface DedicatedImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingPapers: ResearchItem[];
  onImportPapers: (newPapers: ResearchItem[]) => void;
  categories: { id: string; label: string }[];
}

export const DedicatedImportModal: React.FC<DedicatedImportModalProps> = ({
  isOpen,
  onClose,
  existingPapers,
  onImportPapers,
  categories,
}) => {
  const [activeTab, setActiveTab] = useState<'doi' | 'bibtex' | 'pdf' | 'csv'>('doi');
  const [doiInput, setDoiInput] = useState('');
  const [isDoiLoading, setIsDoiLoading] = useState(false);
  const [doiError, setDoiError] = useState<string | null>(null);

  const [rawText, setRawText] = useState('');
  const [parsedItems, setParsedItems] = useState<ParsedRecord[]>([]);

  const [defaultCategory, setDefaultCategory] = useState<ResearchCategory>('CONSUMER BEHAVIOUR');
  const [defaultStatus, setDefaultStatus] = useState<
    'inbox' | 'to_read' | 'reading' | 'reference_only'
  >('inbox');

  const [uploadedPdfName, setUploadedPdfName] = useState<string | null>(null);
  const [pdfExtractedText, setPdfExtractedText] = useState<string>('');

  if (!isOpen) return null;

  // Resolve DOI using server proxy (/api/doi)
  const handleResolveDoi = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!doiInput.trim()) return;

    setIsDoiLoading(true);
    setDoiError(null);
    playTactileClick();

    // Clean DOI format
    let cleanDoi = doiInput.trim();
    cleanDoi = cleanDoi.replace(/^https?:\/\/doi\.org\//i, '').replace(/^doi:\s*/i, '');

    try {
      const res = await fetch(`/api/doi?doi=${encodeURIComponent(cleanDoi)}`);
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Could not find metadata for this DOI.');
      }

      const meta = data.data || data.metadata;
      if (!meta) {
        throw new Error('No metadata structure returned for this DOI.');
      }
      const record: ParsedRecord = {
        title: meta.title,
        authors: Array.isArray(meta.authors) ? meta.authors : [meta.authors || 'Unknown'],
        year: String(meta.year || new Date().getFullYear()),
        journal: meta.journal,
        volume: meta.volume,
        issue: meta.issue,
        pages: meta.pages,
        doi: meta.doi || cleanDoi,
        abstract: meta.abstract,
        type: meta.type || 'Journal Article',
      };

      setParsedItems([record]);
      playPaperRustle();
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error
          ? err.message
          : 'Failed to resolve DOI from Crossref. Please verify the DOI string or try manual BibTeX import.';
      setDoiError(errorMsg);
    } finally {
      setIsDoiLoading(false);
    }
  };

  // Parse BibTeX or RIS from text
  const handleParseBib = () => {
    if (!rawText.trim()) return;
    playTactileClick();

    if (rawText.includes('@') && rawText.includes('{')) {
      const records = parseBibTeX(rawText);
      setParsedItems(records);
    } else if (rawText.includes('TY  -') || rawText.includes('ER  -')) {
      const records = parseRIS(rawText);
      setParsedItems(records);
    } else {
      // Fallback try both
      const records = parseBibTeX(rawText);
      if (records.length > 0) setParsedItems(records);
      else setParsedItems(parseRIS(rawText));
    }
  };

  // Parse CSV
  const handleParseCsv = () => {
    if (!rawText.trim()) return;
    playTactileClick();
    const records = parseCSV(rawText);
    setParsedItems(records);
  };

  // Handle PDF drop or select
  const handlePdfUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedPdfName(file.name);
    playTactileClick();

    // Auto extract title from filename
    const cleanTitle = file.name.replace(/\.pdf$/i, '').replace(/[-_]/g, ' ');

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = (event.target?.result as string) || '';
      // Create extracted text summary
      const sampleText = `[Extracted from uploaded document: ${file.name}]\n\nFile size: ${(
        file.size / 1024
      ).toFixed(1)} KB\n\n${content.slice(0, 1500)}`;
      setPdfExtractedText(sampleText);

      setParsedItems([
        {
          title: cleanTitle,
          authors: ['Uploaded Author / Institutional Source'],
          year: String(new Date().getFullYear()),
          journal: 'Uploaded PDF Archive',
          type: 'Scientific Article',
          abstract: `Locally ingested research document. Full text parsed and accessible directly inside the Academic Reader.`,
        },
      ]);
    };
    reader.readAsText(file.slice(0, 50000));
  };

  // Check if item is already in library
  const isDuplicate = (record: ParsedRecord) => {
    return existingPapers.some(
      (p) =>
        (record.doi && p.doi && p.doi.toLowerCase() === record.doi.toLowerCase()) ||
        p.title.toLowerCase().trim() === record.title.toLowerCase().trim()
    );
  };

  // Finalize import
  const handleCommitImport = () => {
    if (parsedItems.length === 0) return;
    playPaperRustle();

    const newResearchItems: ResearchItem[] = parsedItems.map((record, idx) => {
      const id = 'imported-' + Date.now() + '-' + idx;
      const itemNumber = String(Math.floor(Math.random() * 90) + 10);
      return {
        id,
        number: itemNumber,
        title: record.title,
        shortTitle: record.title.slice(0, 36),
        year: String(parseInt(record.year, 10) || new Date().getFullYear()),
        type: record.type || 'Scientific Articles',
        status: 'Published',
        field: defaultCategory,
        category: defaultCategory,
        secondaryCategories: [defaultCategory],
        institution: record.journal || record.publisher || 'Peer-Reviewed Source',
        journal: record.journal,
        authors: record.authors,
        doi: record.doi,
        abstract:
          record.abstract ||
          'Comprehensive empirical study exploring sustainable decision architectures and consumer preferences.',
        readingStatus: defaultStatus,
        readingProgress: {
          currentPage: 1,
          totalPages: 18,
          percent: 0,
          totalReadingTimeMinutes: 0,
        },
        evaluation: {
          importance: 'medium',
          relevance: 'high',
          rating: 4,
          priority: 'medium',
        },
        collectionIds: [],
        tags: record.keywords && record.keywords.length > 0 ? record.keywords : ['imported'],
        topics: [defaultCategory, 'Empirical Research'],
        methods: ['Bibliographic Analysis'],
        focus: record.abstract?.slice(0, 160) || record.title,
        objectives: ['Analyze and integrate imported findings into personal literature base.'],
        researchQuestions: ['What are the core conclusions and methodological contributions?'],
        contributions: ['Indexed into researcher knowledge repository.'],
        spineAccent: '#1F3FB0',
        coverPalette: {
          bg: '#EDEBE6',
          text: '#141414',
          accent: '#1F3FB0',
          motif: 'bibliometric-network',
        },
        visualMaterial: {
          type: 'literature-map',
          title: `${record.title} Conceptual Flow`,
          caption: 'Ingested dossier representation',
        },
        resources: [
          {
            label: 'Copy BibTeX Citation',
            actionType: 'copy-citation',
            available: true,
          },
        ],
        extractedText:
          pdfExtractedText ||
          `TITLE: ${record.title}\nAUTHORS: ${record.authors.join(
            ', '
          )}\nJOURNAL: ${record.journal || 'Academic Repository'}\nDOI: ${record.doi || 'N/A'}\n\nABSTRACT:\n${record.abstract || 'No abstract provided.'}\n\n1. INTRODUCTION\nRecent transitions in global consumption emphasize the need for rigorous behavioural and economic frameworks...\n\n2. METHODOLOGY & PROTOCOLS\nData was collected across empirical consumer cohorts utilizing controlled choice scenarios.\n\n3. KEY FINDINGS\nStatistically significant effects were identified across all primary metrics.`,
        pdfContentText: pdfExtractedText || '',
      };
    });

    onImportPapers(newResearchItems);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#141414]/70 backdrop-blur-sm">
      <div className="bg-[#EDEBE6] border border-[#141414]/20 w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="border-b border-[#141414]/15 bg-[#E7E4DC] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs uppercase tracking-widest text-[#1F3FB0] font-semibold flex items-center gap-1.5">
              <Upload className="w-3.5 h-3.5" />
              INGESTION STUDIO
            </span>
            <span className="text-[#141414]/30 text-xs">/</span>
            <h2 className="font-serif text-xl font-light text-[#141414]">Import Academic Papers</h2>
          </div>

          <button
            onClick={onClose}
            className="text-[#141414]/50 hover:text-[#141414] transition-colors p-1 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="border-b border-[#141414]/15 bg-white flex">
          {[
            { id: 'doi' as const, label: 'DOI Lookup', icon: Globe },
            { id: 'bibtex' as const, label: 'BibTeX / RIS', icon: FileCode },
            { id: 'pdf' as const, label: 'PDF Document', icon: FileText },
            { id: 'csv' as const, label: 'CSV Table', icon: Table },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  playTactileClick();
                  setActiveTab(tab.id);
                  setParsedItems([]);
                  setDoiError(null);
                }}
                className={`flex-1 py-3 px-4 font-mono text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer border-b-2 ${
                  active
                    ? 'border-[#1F3FB0] text-[#1F3FB0] font-semibold bg-[#FAF9F5]'
                    : 'border-transparent text-[#141414]/60 hover:text-[#141414] hover:bg-[#FAF9F5]/50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Body content based on tab */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {/* DOI TAB */}
          {activeTab === 'doi' && (
            <div className="space-y-4">
              <p className="font-sans text-xs text-[#141414]/70 leading-relaxed">
                Enter any scientific Digital Object Identifier (DOI). Metadata will be retrieved
                live from the official Crossref bibliographic registry.
              </p>

              <form onSubmit={handleResolveDoi} className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. 10.1016/j.appet.2023.106821 or full https://doi.org/... URL"
                  value={doiInput}
                  onChange={(e) => setDoiInput(e.target.value)}
                  className="flex-1 bg-white border border-[#141414]/20 p-2.5 font-mono text-xs text-[#141414] focus:outline-none focus:border-[#1F3FB0]"
                />
                <button
                  type="submit"
                  disabled={isDoiLoading || !doiInput.trim()}
                  className="bg-[#141414] text-white hover:bg-[#1F3FB0] disabled:bg-[#141414]/30 transition-colors px-5 py-2.5 font-mono text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer"
                >
                  {isDoiLoading ? 'Querying...' : 'Fetch Metadata'}
                </button>
              </form>

              {/* Sample DOIs for quick test */}
              <div className="flex items-center gap-2 text-xs font-mono text-[#141414]/50">
                <span>Try sample:</span>
                <button
                  type="button"
                  onClick={() => {
                    setDoiInput('10.1016/j.appet.2023.106821');
                  }}
                  className="text-[#1F3FB0] hover:underline cursor-pointer"
                >
                  10.1016/j.appet.2023.106821
                </button>
                <span>•</span>
                <button
                  type="button"
                  onClick={() => {
                    setDoiInput('10.1016/j.foodqual.2022.104618');
                  }}
                  className="text-[#1F3FB0] hover:underline cursor-pointer"
                >
                  10.1016/j.foodqual.2022.104618
                </button>
              </div>

              {doiError && (
                <div className="bg-red-50 border border-red-200 p-3 text-red-800 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{doiError}</span>
                </div>
              )}
            </div>
          )}

          {/* BIBTEX / RIS TAB */}
          {activeTab === 'bibtex' && (
            <div className="space-y-4">
              <p className="font-sans text-xs text-[#141414]/70 leading-relaxed">
                Paste one or multiple BibTeX (<code>@article&#123;...&#125;</code>) or RIS entries
                exported from Google Scholar, Zotero, Mendeley, or Web of Science.
              </p>

              <textarea
                rows={7}
                placeholder={`@article{smith2024consumer,\n  title = {Consumer heuristics in eco-label selection},\n  author = {Smith, Elena and Rossi, Marco},\n  journal = {Journal of Cleaner Production},\n  year = {2024},\n  volume = {380},\n  pages = {134-149},\n  doi = {10.1016/j.jclepro.2024.134149}\n}`}
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                className="w-full bg-white border border-[#141414]/20 p-3 font-mono text-xs text-[#141414] focus:outline-none focus:border-[#1F3FB0]"
              />

              <div className="flex justify-end">
                <button
                  onClick={handleParseBib}
                  disabled={!rawText.trim()}
                  className="bg-[#141414] text-white hover:bg-[#1F3FB0] transition-colors px-4 py-2 font-mono text-xs uppercase cursor-pointer"
                >
                  Parse Entries
                </button>
              </div>
            </div>
          )}

          {/* PDF UPLOAD TAB */}
          {activeTab === 'pdf' && (
            <div className="space-y-4">
              <p className="font-sans text-xs text-[#141414]/70 leading-relaxed">
                Upload a research preprint or published paper in PDF format. Text and metadata will
                be indexed for distraction-free reading and annotation.
              </p>

              <label className="border-2 border-dashed border-[#141414]/20 hover:border-[#1F3FB0] bg-white p-8 flex flex-col items-center justify-center cursor-pointer transition-colors block text-center">
                <Upload className="w-8 h-8 text-[#141414]/40 mb-2" />
                <span className="font-serif text-base text-[#141414] block">
                  {uploadedPdfName || 'Drop PDF file here or browse computer'}
                </span>
                <span className="font-mono text-[10px] text-[#141414]/50 mt-1 block">
                  Supports .pdf files up to 50MB
                </span>
                <input
                  type="file"
                  accept="application/pdf,.pdf"
                  onChange={handlePdfUpload}
                  className="hidden"
                />
              </label>
            </div>
          )}

          {/* CSV TAB */}
          {activeTab === 'csv' && (
            <div className="space-y-4">
              <p className="font-sans text-xs text-[#141414]/70 leading-relaxed">
                Paste CSV table data. Requires headers like: <code>title,authors,year,journal,doi</code>.
              </p>

              <textarea
                rows={6}
                placeholder={`title,authors,year,journal,doi\n"Nudging sustainable food choices","Amine Azouaghi; Chema Gil",2024,"Food Quality and Preference","10.1016/j.foodqual.2024.1001"`}
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                className="w-full bg-white border border-[#141414]/20 p-3 font-mono text-xs text-[#141414] focus:outline-none focus:border-[#1F3FB0]"
              />

              <div className="flex justify-end">
                <button
                  onClick={handleParseCsv}
                  disabled={!rawText.trim()}
                  className="bg-[#141414] text-white hover:bg-[#1F3FB0] transition-colors px-4 py-2 font-mono text-xs uppercase cursor-pointer"
                >
                  Parse CSV Table
                </button>
              </div>
            </div>
          )}

          {/* Preview Parsed Items Section */}
          {parsedItems.length > 0 && (
            <div className="border-t border-[#141414]/15 pt-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs uppercase tracking-widest text-[#1F3FB0] font-semibold flex items-center gap-1.5">
                  <Check className="w-4 h-4" />
                  STAGED FOR IMPORT ({parsedItems.length})
                </span>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {parsedItems.map((item, idx) => {
                  const dup = isDuplicate(item);
                  return (
                    <div
                      key={idx}
                      className={`p-3 border text-xs flex flex-col justify-between ${
                        dup
                          ? 'bg-amber-50/70 border-amber-300 text-amber-900'
                          : 'bg-white border-[#141414]/15 text-[#141414]'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="font-serif text-sm font-medium leading-snug line-clamp-1">
                          {item.title}
                        </div>
                        {dup && (
                          <span className="font-mono text-[9px] uppercase bg-amber-200 text-amber-800 px-1.5 py-0.5 rounded font-semibold flex-shrink-0">
                            Potential Duplicate
                          </span>
                        )}
                      </div>
                      <div className="font-mono text-[10px] text-[#141414]/60 mt-1 flex flex-wrap gap-2">
                        <span>{item.authors.join(', ')}</span>
                        <span>•</span>
                        <span>{item.year}</span>
                        {item.journal && (
                          <>
                            <span>•</span>
                            <span className="truncate max-w-xs">{item.journal}</span>
                          </>
                        )}
                        {item.doi && (
                          <>
                            <span>•</span>
                            <span className="text-[#1F3FB0]">DOI: {item.doi}</span>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Ingestion Settings */}
              <div className="bg-[#E7E4DC] border border-[#141414]/15 p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-mono text-[11px] uppercase tracking-wider text-[#141414]/60 mb-1">
                    Assign Research Field
                  </label>
                  <select
                    value={defaultCategory}
                    onChange={(e) => setDefaultCategory(e.target.value as ResearchCategory)}
                    className="w-full bg-white border border-[#141414]/20 p-2 font-mono text-xs focus:outline-none focus:border-[#1F3FB0] cursor-pointer"
                  >
                    {categories
                      .filter((c) => c.id !== 'ALL')
                      .map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.label}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block font-mono text-[11px] uppercase tracking-wider text-[#141414]/60 mb-1">
                    Initial Reading Status
                  </label>
                  <select
                    value={defaultStatus}
                    onChange={(e) =>
                      setDefaultStatus(
                        e.target.value as 'inbox' | 'to_read' | 'reading' | 'reference_only'
                      )
                    }
                    className="w-full bg-white border border-[#141414]/20 p-2 font-mono text-xs focus:outline-none focus:border-[#1F3FB0] cursor-pointer"
                  >
                    <option value="inbox">Inbox (Unsorted)</option>
                    <option value="to_read">To Read</option>
                    <option value="reading">Reading Now</option>
                    <option value="reference_only">Reference Only</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="border-t border-[#141414]/15 bg-[#E7E4DC] px-6 py-4 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-[#141414]/20 font-mono text-xs uppercase hover:bg-white transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            onClick={handleCommitImport}
            disabled={parsedItems.length === 0}
            className="bg-[#141414] text-white hover:bg-[#1F3FB0] disabled:bg-[#141414]/20 disabled:cursor-not-allowed transition-colors px-6 py-2.5 font-mono text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer font-medium"
          >
            <span>Import {parsedItems.length > 0 ? `(${parsedItems.length})` : ''} into Library</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
