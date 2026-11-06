import React, { useState } from 'react';
import {
  X,
  Upload,
  Globe,
  FileText,
  Check,
  AlertCircle,
  FileCode,
  Sparkles,
  ArrowRight,
  BookOpen,
} from 'lucide-react';
import { ResearchItem, ResearchCategory, ResearchCollection, ImportDestination } from '../types/research';
import { PdfDocumentReference } from '../services/pdfDocuments';
import { parseBibliographyFile, ParsedRecord } from '../utils/importer';
import { playTactileClick, playPaperRustle } from '../utils/sound';

interface DedicatedImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingPapers: ResearchItem[];
  collections: ResearchCollection[];
  defaultCollectionIds?: string[];
  onImportPapers: (newPapers: ResearchItem[], destination: ImportDestination) => void;
  onStorePdf: (file: File) => Promise<PdfDocumentReference>;
  categories: { id: string; label: string }[];
}

export const DedicatedImportModal: React.FC<DedicatedImportModalProps> = ({
  isOpen,
  onClose,
  existingPapers,
  collections,
  defaultCollectionIds = [],
  onImportPapers,
  onStorePdf,
  categories,
}) => {
  const [activeTab, setActiveTab] = useState<'doi' | 'bibtex' | 'pdf'>('doi');
  const [doiInput, setDoiInput] = useState('');
  const [isDoiLoading, setIsDoiLoading] = useState(false);
  const [doiError, setDoiError] = useState<string | null>(null);

  const [rawText, setRawText] = useState('');
  const [parsedItems, setParsedItems] = useState<ParsedRecord[]>([]);
  const [bibliographyError, setBibliographyError] = useState<string | null>(null);

  const [defaultCategory, setDefaultCategory] = useState<ResearchCategory>('CONSUMER BEHAVIOUR');
  const [defaultStatus, setDefaultStatus] = useState<
    'inbox' | 'to_read' | 'reading' | 'reference_only'
  >('inbox');
  const [destinationAreaId, setDestinationAreaId] = useState('');
  const [destinationBookId, setDestinationBookId] = useState('');
  const [createNewArea, setCreateNewArea] = useState(false);
  const [createNewBook, setCreateNewBook] = useState(false);
  const [newAreaName, setNewAreaName] = useState('');
  const [newBookName, setNewBookName] = useState('');
  const defaultCollectionKey = defaultCollectionIds.join('|');

  React.useEffect(() => {
    if (!isOpen) return;
    const availableBooks = collections.filter((collection) => !collection.isSmart && collection.kind !== 'area');
    const book = availableBooks.find((collection) => defaultCollectionIds.includes(collection.id));
    if (availableBooks.length === 0) {
      setDestinationAreaId('__root__');
      setDestinationBookId('');
      setCreateNewArea(false);
      setCreateNewBook(true);
      setNewBookName('Primary Research');
    } else {
      setDestinationBookId(book?.id || availableBooks[0]?.id || '');
      setDestinationAreaId(book?.parentId || (book || availableBooks[0] ? '__root__' : ''));
      setCreateNewArea(false);
      setCreateNewBook(false);
      setNewBookName('');
    }
    setNewAreaName('');
  }, [isOpen, defaultCollectionKey, collections]);

  const books = collections.filter((collection) => !collection.isSmart && collection.kind !== 'area');
  const areas = collections.filter((collection) => collection.kind === 'area');
  const availableAreaId = destinationAreaId === '__root__' ? undefined : destinationAreaId;
  const destinationBooks = books.filter((book) => book.parentId === availableAreaId);
  const destinationReady = createNewArea
    ? Boolean(newAreaName.trim() && newBookName.trim())
    : createNewBook
      ? Boolean((availableAreaId || destinationAreaId === '__root__') && newBookName.trim())
      : Boolean(destinationBookId && destinationBooks.some((book) => book.id === destinationBookId));

  const [uploadedPdfName, setUploadedPdfName] = useState<string | null>(null);
  const [pdfDocumentReference, setPdfDocumentReference] = useState<PdfDocumentReference | null>(null);
  const [isPdfUploading, setIsPdfUploading] = useState(false);
  const [pdfUploadError, setPdfUploadError] = useState<string | null>(null);

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

  const parseBibliography = (text: string, filename = 'pasted.txt') => {
    if (!text.trim()) return;
    playTactileClick();
    const records = parseBibliographyFile(filename, text);
    setParsedItems(records);
    setBibliographyError(records.length ? null : 'No article records found. Check the export format and required title column/field.');
  };

  const handleBibliographyFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setBibliographyError(null);
    try {
      if (file.size > 20 * 1024 * 1024) throw new Error('Bibliography files must be smaller than 20 MB.');
      const content = await file.text();
      setRawText(content);
      parseBibliography(content, file.name);
    } catch (error) {
      setBibliographyError(error instanceof Error ? error.message : 'Could not read this bibliography file.');
    } finally {
      event.target.value = '';
    }
  };

  // Handle PDF drop or select
  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPdfUploadError(null);
    setPdfDocumentReference(null);
    setUploadedPdfName(null);
    setParsedItems([]);

    if (!file.name.toLowerCase().endsWith('.pdf') || (file.type && file.type !== 'application/pdf')) {
      setPdfUploadError('Choose a PDF file.');
      e.target.value = '';
      return;
    }
    if (file.size <= 0 || file.size > 50 * 1024 * 1024) {
      setPdfUploadError('PDF files must be between 1 byte and 50 MB.');
      e.target.value = '';
      return;
    }
    const header = new Uint8Array(await file.slice(0, 5).arrayBuffer());
    if (new TextDecoder().decode(header) !== '%PDF-') {
      setPdfUploadError('The selected file does not have a valid PDF signature.');
      e.target.value = '';
      return;
    }

    setIsPdfUploading(true);
    try {
      const reference = await onStorePdf(file);
      setPdfDocumentReference(reference);
      setUploadedPdfName(file.name);
      playTactileClick();

      // Auto-label from filename. Author, abstract, and PDF text remain empty
      // until they are actually supplied or extracted from the document.
      const cleanTitle = file.name.replace(/\.pdf$/i, '').replace(/[-_]/g, ' ');
      setParsedItems([
        {
          title: cleanTitle,
          authors: [],
          year: 'n.d.',
          journal: 'Uploaded PDF Archive',
          type: 'Scientific Article',
          abstract: '',
        },
      ]);
    } catch (uploadError) {
      setPdfUploadError(uploadError instanceof Error ? uploadError.message : 'Could not store this PDF.');
    } finally {
      setIsPdfUploading(false);
      e.target.value = '';
    }
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
    if (parsedItems.length === 0 || !destinationReady) return;
    playPaperRustle();

    const newResearchItems: ResearchItem[] = parsedItems.map((record, idx) => {
      const id = 'imported-' + Date.now() + '-' + idx;
      const itemNumber = String(Math.floor(Math.random() * 90) + 10);
      return {
        id,
        number: itemNumber,
        title: record.title,
        shortTitle: record.title.slice(0, 36),
        year: record.year || 'n.d.',
        type: record.type || 'Journal Article',
        status: 'Imported',
        field: defaultCategory,
        category: defaultCategory,
        secondaryCategories: [defaultCategory],
        institution: record.journal || record.publisher || '',
        journal: record.journal,
        authors: record.authors,
        doi: record.doi,
        url: record.url || (record.doi ? `https://doi.org/${record.doi}` : undefined),
        pageCount: record.pageCount,
        abstract: record.abstract || '',
        readingStatus: defaultStatus,
        readingProgress: {
          currentPage: 1,
          totalPages: 0,
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
        topics: record.keywords || [],
        methods: [],
        focus: record.abstract?.slice(0, 160) || record.title,
        objectives: [],
        researchQuestions: [],
        contributions: [],
        spineAccent: '#1F3FB0',
        coverPalette: {
          bg: '#EDEBE6',
          text: '#141414',
          accent: '#1F3FB0',
          motif: 'bibliometric-network',
        },
        visualMaterial: {
          type: 'literature-map',
          title: 'Imported article',
          caption: 'No visual analysis supplied with this bibliography record.',
        },
        resources: [
          {
            label: 'Copy BibTeX Citation',
            actionType: 'copy-citation',
            available: true,
          },
        ],
        extractedText: record.abstract || '',
        ...(pdfDocumentReference && {
          ...pdfDocumentReference,
          pdfFileName: pdfDocumentReference.fileName,
        }),
      };
    });

    onImportPapers(newResearchItems, {
      ...(createNewArea ? { newAreaName: newAreaName.trim() } : availableAreaId ? { areaId: availableAreaId } : {}),
      ...(!createNewArea && !createNewBook ? { bookId: destinationBookId } : {}),
      ...((createNewArea || createNewBook) ? { newBookName: newBookName.trim() } : {}),
    });
    setPdfDocumentReference(null);
    setUploadedPdfName(null);
    setParsedItems([]);
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
            { id: 'bibtex' as const, label: 'Bibliography', icon: FileCode },
            { id: 'pdf' as const, label: 'PDF Document', icon: FileText },
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
                Import BibTeX, RIS, Scopus, Web of Science, or other CSV/TSV exports. Files stay on this device.
              </p>

              <label className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-[#141414]/20 text-xs font-mono uppercase cursor-pointer hover:border-[#1F3FB0]">
                <Upload className="w-3.5 h-3.5" /> Choose bibliography file
                <input type="file" accept=".bib,.ris,.csv,.tsv,.txt,.enw,.ciw,text/plain,text/csv" onChange={handleBibliographyFile} className="sr-only" />
              </label>

              <textarea
                rows={7}
                placeholder="Paste BibTeX, RIS, or CSV/TSV exported from Scopus or Web of Science"
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                className="w-full bg-white border border-[#141414]/20 p-3 font-mono text-xs text-[#141414] focus:outline-none focus:border-[#1F3FB0]"
              />

              <div className="flex justify-end">
                <button
                  onClick={() => parseBibliography(rawText)}
                  disabled={!rawText.trim()}
                  className="bg-[#141414] text-white hover:bg-[#1F3FB0] transition-colors px-4 py-2 font-mono text-xs uppercase cursor-pointer"
                >
                  Parse Bibliography
                </button>
              </div>
              {bibliographyError && <p role="alert" className="text-sm text-rose-800">{bibliographyError}</p>}
            </div>
          )}

          {/* PDF UPLOAD TAB */}
          {activeTab === 'pdf' && (
            <div className="space-y-4">
              <p className="font-sans text-xs text-[#141414]/70 leading-relaxed">
                Upload a research PDF for private reading. Its original bytes are kept intact and
                rendered in the reader.
              </p>

              <label className="border-2 border-dashed border-[#141414]/20 hover:border-[#1F3FB0] bg-white p-8 flex flex-col items-center justify-center cursor-pointer transition-colors block text-center">
                <Upload className="w-8 h-8 text-[#141414]/40 mb-2" />
                <span className="font-serif text-base text-[#141414] block">
                  {uploadedPdfName || 'Drop PDF file here or browse computer'}
                </span>
                <span className="font-mono text-[10px] text-[#141414]/50 mt-1 block">
                  {isPdfUploading ? 'Storing PDF…' : 'Supports .pdf files up to 50 MB'}
                </span>
                <input
                  type="file"
                  accept="application/pdf,.pdf"
                  onChange={handlePdfUpload}
                  className="hidden"
                />
              </label>
              {pdfUploadError && <p role="alert" className="text-sm text-rose-800">{pdfUploadError}</p>}
              {uploadedPdfName && <p role="status" className="text-xs text-emerald-800">PDF ready to import: {uploadedPdfName}</p>}
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

                <fieldset className="md:col-span-2 space-y-3">
                  <legend className="block font-mono text-[11px] uppercase tracking-wider text-[#141414]/60 mb-2">
                    File these papers in a book
                  </legend>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <label className="block font-mono text-[10px] uppercase tracking-wide text-[#5A534A]">
                      Research area
                      <select aria-label="Research area" value={createNewArea ? '__new_area__' : destinationAreaId} onChange={(event) => {
                        const value = event.target.value;
                        setCreateNewArea(value === '__new_area__');
                        setCreateNewBook(false);
                        setDestinationAreaId(value === '__new_area__' ? '' : value);
                        setDestinationBookId('');
                      }} className="mt-1 w-full border border-[#141414]/20 bg-white p-2 font-sans text-sm normal-case text-[#141414]">
                        <option value="">Choose a research area…</option>
                        <option value="__root__">My Research · no area</option>
                        {areas.map((area) => <option key={area.id} value={area.id}>{area.name}</option>)}
                        <option value="__new_area__">＋ Create a new research area…</option>
                      </select>
                    </label>
                    <label className="block font-mono text-[10px] uppercase tracking-wide text-[#5A534A]">
                      Book
                      <select aria-label="Book" value={createNewBook ? '__new_book__' : destinationBookId} disabled={!createNewArea && !destinationAreaId} onChange={(event) => {
                        const value = event.target.value;
                        setCreateNewBook(value === '__new_book__');
                        setDestinationBookId(value === '__new_book__' ? '' : value);
                      }} className="mt-1 w-full border border-[#141414]/20 bg-white p-2 font-sans text-sm normal-case text-[#141414] disabled:bg-[#E7E4DC]">
                        <option value="">Choose a book…</option>
                        {destinationBooks.map((book) => <option key={book.id} value={book.id}>{book.name}</option>)}
                        <option value="__new_book__">＋ Create a new book…</option>
                      </select>
                    </label>
                  </div>
                  {createNewArea && <label className="block font-mono text-[10px] uppercase tracking-wide text-[#5A534A]">New research area name<input aria-label="New research area name" value={newAreaName} onChange={(event) => setNewAreaName(event.target.value)} placeholder="e.g. Food systems" className="mt-1 w-full border border-[#141414]/20 bg-white p-2 font-sans text-sm normal-case text-[#141414]" /></label>}
                  {createNewBook && <label className="block font-mono text-[10px] uppercase tracking-wide text-[#5A534A]">New book name<input aria-label="New book name" value={newBookName} onChange={(event) => setNewBookName(event.target.value)} placeholder="e.g. Literature review" className="mt-1 w-full border border-[#141414]/20 bg-white p-2 font-sans text-sm normal-case text-[#141414]" /></label>}
                  <p className="text-[10px] font-mono text-[#77736B]">Every imported paper will be placed in this one book. You can move it later.</p>
                </fieldset>
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
            disabled={parsedItems.length === 0 || !destinationReady}
            className="bg-[#141414] text-white hover:bg-[#1F3FB0] disabled:bg-[#141414]/20 disabled:cursor-not-allowed transition-colors px-6 py-2.5 font-mono text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer font-medium"
          >
            <span>{destinationReady ? `Import ${parsedItems.length > 0 ? `(${parsedItems.length})` : ''} into book` : 'Choose an area and book'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
