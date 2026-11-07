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
  FileSpreadsheet,
  UploadCloud,
  ChevronDown,
  ChevronUp,
  Database,
} from 'lucide-react';
import { ResearchItem, ResearchCategory, ResearchCollection, ImportDestination } from '../types/research';
import { PdfDocumentReference } from '../services/pdfDocuments';
import { parseBibliographyFile, ParsedRecord } from '../utils/importer';
import { playTactileClick, playPaperRustle } from '../utils/sound';

function detectFormatName(filename: string, content: string): string {
  const ext = filename.toLowerCase().split('.').pop() || '';
  if (ext === 'bib' || (content.includes('@') && content.includes('{'))) return 'BibTeX Bibliography';
  if (ext === 'nbib' || ext === 'medline' || /(?:^|\n)PMID\s*-\s*\d+/i.test(content)) return 'PubMed / MEDLINE Record';
  if (ext === 'ciw' || (/(?:^|\n)PT\s{1,3}J\b/i.test(content) && /(?:^|\n)TI\s{1,3}/i.test(content))) return 'Web of Science (Plain Text)';
  if (ext === 'enw' || /(?:^|\n)%0\s+/i.test(content)) return 'EndNote Tagged';
  if (ext === 'ris' || /(?:^|\n)TY\s+-/i.test(content)) return 'RIS Record';
  if (ext === 'tsv' || (content.slice(0, 1000).match(/\t/g)?.length || 0) > 5) return 'Web of Science / Scopus (Tab-Delimited TSV)';
  return 'CSV Spreadsheet (PubMed / Scopus / WoS)';
}

interface DedicatedImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingPapers: ResearchItem[];
  collections: ResearchCollection[];
  defaultCollectionIds?: string[];
  initialTab?: 'files' | 'doi' | 'pdf';
  onImportPapers: (newPapers: ResearchItem[], destination: ImportDestination) => void;
  onStorePdf: (file: File) => Promise<PdfDocumentReference>;
  categories: { id: string; label: string }[];
  isNightMode?: boolean;
}

export const DedicatedImportModal: React.FC<DedicatedImportModalProps> = ({
  isOpen,
  onClose,
  existingPapers,
  collections,
  defaultCollectionIds = [],
  initialTab = 'files',
  onImportPapers,
  onStorePdf,
  categories,
  isNightMode: propNightMode,
}) => {
  const isNight = propNightMode ?? (typeof document !== 'undefined' && document.documentElement.classList.contains('theme-nocturne'));
  const [activeTab, setActiveTab] = useState<'files' | 'doi' | 'pdf'>(initialTab);
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [detectedFormat, setDetectedFormat] = useState<string | null>(null);
  const [isPasteExpanded, setIsPasteExpanded] = useState(false);

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
    const fmt = detectFormatName(filename, text);
    setDetectedFormat(fmt);
    setUploadedFileName(filename === 'pasted.txt' ? 'Pasted Text' : filename);
    setParsedItems(records);
    if (records.length === 0) {
      setBibliographyError('No article records found in the input. Check that the format matches Web of Science, PubMed, Scopus, BibTeX, or CSV.');
    } else {
      setBibliographyError(null);
      playPaperRustle();
    }
  };

  const handleProcessFile = async (file: File) => {
    setBibliographyError(null);
    setDetectedFormat(null);
    setUploadedFileName(null);
    playTactileClick();
    try {
      if (file.size > 25 * 1024 * 1024) throw new Error('Bibliography files must be smaller than 25 MB.');
      const content = await file.text();
      setRawText(content);
      const records = parseBibliographyFile(file.name, content);
      const fmt = detectFormatName(file.name, content);
      setDetectedFormat(fmt);
      setUploadedFileName(file.name);
      setParsedItems(records);
      if (records.length === 0) {
        setBibliographyError(`No article records could be extracted from "${file.name}". Please check the export columns or format.`);
      } else {
        setBibliographyError(null);
        playPaperRustle();
      }
    } catch (error) {
      setBibliographyError(error instanceof Error ? error.message : 'Could not read this bibliography file.');
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#141414]/75 backdrop-blur-sm">
      <div
        className={`border w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] transition-colors ${
          isNight
            ? 'bg-[#181614] border-[#38322A] text-[#EDE8DF]'
            : 'bg-[#EDEBE6] border-[#141414]/20 text-[#141414]'
        }`}
      >
        {/* Modal Header */}
        <div
          className={`border-b px-6 py-4 flex items-center justify-between transition-colors ${
            isNight
              ? 'bg-[#1E1B17] border-[#38322A]'
              : 'bg-[#E7E4DC] border-[#141414]/15'
          }`}
        >
          <div className="flex items-center gap-2">
            <span
              className={`font-mono text-xs uppercase tracking-widest font-semibold flex items-center gap-1.5 ${
                isNight ? 'text-[#D4AF37]' : 'text-[#1F3FB0]'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              INGESTION STUDIO
            </span>
            <span className={isNight ? 'text-[#8C8275]' : 'text-[#141414]/30'}>/</span>
            <h2 className={`font-serif text-xl font-light ${isNight ? 'text-[#EDE8DF]' : 'text-[#141414]'}`}>
              Import Academic Papers
            </h2>
          </div>

          <button
            onClick={onClose}
            className={`transition-colors p-1 cursor-pointer ${
              isNight ? 'text-[#9E9689] hover:text-[#EDE8DF]' : 'text-[#141414]/50 hover:text-[#141414]'
            }`}
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div
          className={`border-b flex transition-colors ${
            isNight ? 'bg-[#151413] border-[#38322A]' : 'bg-white border-[#141414]/15'
          }`}
        >
          {[
            { id: 'files' as const, label: 'Upload Files (CSV, BibTeX, WoS, PubMed)', icon: FileSpreadsheet },
            { id: 'doi' as const, label: 'Live DOI Lookup', icon: Globe },
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
                  setBibliographyError(null);
                }}
                className={`flex-1 py-3 px-3 font-mono text-[11px] sm:text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer border-b-2 ${
                  active
                    ? isNight
                      ? 'border-[#D4AF37] text-[#D4AF37] font-semibold bg-[#221E19]'
                      : 'border-[#1F3FB0] text-[#1F3FB0] font-semibold bg-[#FAF9F5]'
                    : isNight
                      ? 'border-transparent text-[#9E9689] hover:text-[#EDE8DF] hover:bg-[#1E1B17]'
                      : 'border-transparent text-[#5A5248] hover:text-[#141414] hover:bg-[#FAF9F5]/50'
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Body content based on tab */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {/* FILES (CSV, BIBTEX, WOS, PUBMED, RIS) TAB */}
          {activeTab === 'files' && (
            <div className="space-y-4">
              {/* Repository format guidance chips */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] font-mono">
                <div
                  className={`p-2 border flex items-center gap-1.5 transition-colors ${
                    isNight ? 'border-[#38322A] bg-[#1E1B17]' : 'border-[#141414]/15 bg-white'
                  }`}
                >
                  <Database className={`w-3.5 h-3.5 flex-shrink-0 ${isNight ? 'text-[#D4AF37]' : 'text-[#1F3FB0]'}`} />
                  <div>
                    <div className={`font-semibold ${isNight ? 'text-[#EDE8DF]' : 'text-[#141414]'}`}>Web of Science</div>
                    <div className={`text-[9px] ${isNight ? 'text-[#8C8275]' : 'text-[#77736B]'}`}>.txt, .tsv, .csv, .ciw</div>
                  </div>
                </div>
                <div
                  className={`p-2 border flex items-center gap-1.5 transition-colors ${
                    isNight ? 'border-[#38322A] bg-[#1E1B17]' : 'border-[#141414]/15 bg-white'
                  }`}
                >
                  <Database className={`w-3.5 h-3.5 flex-shrink-0 ${isNight ? 'text-[#D4AF37]' : 'text-[#1F3FB0]'}`} />
                  <div>
                    <div className={`font-semibold ${isNight ? 'text-[#EDE8DF]' : 'text-[#141414]'}`}>PubMed / MEDLINE</div>
                    <div className={`text-[9px] ${isNight ? 'text-[#8C8275]' : 'text-[#77736B]'}`}>.nbib, .medline, .csv</div>
                  </div>
                </div>
                <div
                  className={`p-2 border flex items-center gap-1.5 transition-colors ${
                    isNight ? 'border-[#38322A] bg-[#1E1B17]' : 'border-[#141414]/15 bg-white'
                  }`}
                >
                  <Database className={`w-3.5 h-3.5 flex-shrink-0 ${isNight ? 'text-[#D4AF37]' : 'text-[#1F3FB0]'}`} />
                  <div>
                    <div className={`font-semibold ${isNight ? 'text-[#EDE8DF]' : 'text-[#141414]'}`}>Scopus</div>
                    <div className={`text-[9px] ${isNight ? 'text-[#8C8275]' : 'text-[#77736B]'}`}>.csv, .bib, .ris</div>
                  </div>
                </div>
                <div
                  className={`p-2 border flex items-center gap-1.5 transition-colors ${
                    isNight ? 'border-[#38322A] bg-[#1E1B17]' : 'border-[#141414]/15 bg-white'
                  }`}
                >
                  <FileCode className={`w-3.5 h-3.5 flex-shrink-0 ${isNight ? 'text-[#D4AF37]' : 'text-[#1F3FB0]'}`} />
                  <div>
                    <div className={`font-semibold ${isNight ? 'text-[#EDE8DF]' : 'text-[#141414]'}`}>BibTeX</div>
                    <div className={`text-[9px] ${isNight ? 'text-[#8C8275]' : 'text-[#77736B]'}`}>.bib archives</div>
                  </div>
                </div>
                <div
                  className={`p-2 border flex items-center gap-1.5 transition-colors ${
                    isNight ? 'border-[#38322A] bg-[#1E1B17]' : 'border-[#141414]/15 bg-white'
                  }`}
                >
                  <FileText className={`w-3.5 h-3.5 flex-shrink-0 ${isNight ? 'text-[#D4AF37]' : 'text-[#1F3FB0]'}`} />
                  <div>
                    <div className={`font-semibold ${isNight ? 'text-[#EDE8DF]' : 'text-[#141414]'}`}>RIS / EndNote</div>
                    <div className={`text-[9px] ${isNight ? 'text-[#8C8275]' : 'text-[#77736B]'}`}>.ris, .enw tagged</div>
                  </div>
                </div>
                <div
                  className={`p-2 border flex items-center gap-1.5 transition-colors ${
                    isNight ? 'border-[#38322A] bg-[#1E1B17]' : 'border-[#141414]/15 bg-white'
                  }`}
                >
                  <FileSpreadsheet className={`w-3.5 h-3.5 flex-shrink-0 ${isNight ? 'text-[#D4AF37]' : 'text-[#1F3FB0]'}`} />
                  <div>
                    <div className={`font-semibold ${isNight ? 'text-[#EDE8DF]' : 'text-[#141414]'}`}>Research CSV / TSV</div>
                    <div className={`text-[9px] ${isNight ? 'text-[#8C8275]' : 'text-[#77736B]'}`}>Tables with titles/DOIs</div>
                  </div>
                </div>
              </div>

              {/* Drag-and-drop Dropzone */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDraggingFile(true);
                }}
                onDragLeave={() => setIsDraggingFile(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDraggingFile(false);
                  const file = e.dataTransfer.files?.[0];
                  if (file) handleProcessFile(file);
                }}
                className={`border-2 border-dashed p-8 text-center transition-all cursor-pointer ${
                  isDraggingFile
                    ? isNight ? 'border-[#D4AF37] bg-[#2A241E]' : 'border-[#1F3FB0] bg-[#EEF2FF]'
                    : isNight ? 'border-[#38322A] hover:border-[#D4AF37] bg-[#1E1B17]' : 'border-[#141414]/20 hover:border-[#1F3FB0] bg-white'
                }`}
              >
                <UploadCloud className={`w-9 h-9 mx-auto mb-2 opacity-80 ${isNight ? 'text-[#D4AF37]' : 'text-[#1F3FB0]'}`} />
                <p className={`font-serif text-base ${isNight ? 'text-[#EDE8DF]' : 'text-[#141414]'}`}>
                  {uploadedFileName ? `Loaded: ${uploadedFileName}` : 'Drag & drop your export file here'}
                </p>
                <p className={`font-mono text-[11px] mt-1 ${isNight ? 'text-[#9E9689]' : 'text-[#77736B]'}`}>
                  Supports PubMed (.nbib, .medline, .csv), Web of Science (.ciw, .txt, .csv), Scopus (.csv, .bib, .ris), BibTeX (.bib)
                </p>
                <label
                  className={`inline-flex items-center gap-2 mt-4 px-4 py-2 font-mono text-xs uppercase tracking-wider transition-colors cursor-pointer ${
                    isNight
                      ? 'bg-[#D4AF37] text-[#121110] hover:bg-[#F3C74D] font-semibold'
                      : 'bg-[#141414] text-white hover:bg-[#1F3FB0]'
                  }`}
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Browse Export File</span>
                  <input
                    type="file"
                    accept=".csv,.tsv,.bib,.ris,.nbib,.medline,.txt,.enw,.ciw,text/plain,text/csv"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleProcessFile(file);
                    }}
                    className="sr-only"
                  />
                </label>
              </div>

              {/* Detected format status banner */}
              {detectedFormat && parsedItems.length > 0 && (
                <div
                  className={`p-3 border text-xs font-mono flex items-center justify-between ${
                    isNight
                      ? 'bg-[#1C281E] border-emerald-500/40 text-emerald-200'
                      : 'bg-emerald-50 border border-emerald-300 text-emerald-950'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Check className={`w-4 h-4 flex-shrink-0 ${isNight ? 'text-emerald-400' : 'text-emerald-700'}`} />
                    <span>
                      Detected <strong>{detectedFormat}</strong> ({uploadedFileName}): extracted <strong>{parsedItems.length}</strong> {parsedItems.length === 1 ? 'article' : 'articles'}.
                    </span>
                  </div>
                  <span
                    className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                      isNight
                        ? 'bg-emerald-900/60 text-emerald-200 border border-emerald-600/40'
                        : 'bg-emerald-200/70 text-emerald-800'
                    }`}
                  >
                    Verified
                  </span>
                </div>
              )}

              {/* Collapsible raw text paste box */}
              <div
                className={`border transition-colors ${
                  isNight ? 'border-[#38322A] bg-[#1E1B17]' : 'border-[#141414]/15 bg-white'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setIsPasteExpanded(!isPasteExpanded)}
                  className={`w-full px-3.5 py-2.5 text-left font-mono text-xs flex items-center justify-between cursor-pointer transition-colors ${
                    isNight
                      ? 'text-[#EDE8DF] hover:bg-[#25201A]'
                      : 'text-[#141414] hover:bg-[#FAF9F5]'
                  }`}
                >
                  <span className="flex items-center gap-2 font-medium">
                    <FileCode className={`w-3.5 h-3.5 ${isNight ? 'text-[#D4AF37]' : 'text-[#1F3FB0]'}`} />
                    <span>Or paste raw bibliography text / BibTeX / CSV rows</span>
                  </span>
                  {isPasteExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {isPasteExpanded && (
                  <div
                    className={`p-3 border-t space-y-2 ${
                      isNight ? 'border-[#38322A] bg-[#181614]' : 'border-[#141414]/10 bg-[#FAF9F5]/40'
                    }`}
                  >
                    <textarea
                      rows={5}
                      placeholder="Paste raw BibTeX (@article{...}), PubMed MEDLINE (PMID- ...), RIS (TY - JOUR ...), or CSV text"
                      value={rawText}
                      onChange={(e) => setRawText(e.target.value)}
                      className={`w-full border p-2.5 font-mono text-xs focus:outline-none transition-colors ${
                        isNight
                          ? 'bg-[#121110] border-[#38322A] text-[#EDE8DF] placeholder-[#8C8275] focus:border-[#D4AF37]'
                          : 'bg-[#FAF9F5] border-[#141414]/20 text-[#141414] placeholder-[#77736B] focus:border-[#1F3FB0]'
                      }`}
                    />
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => parseBibliography(rawText)}
                        disabled={!rawText.trim()}
                        className={`transition-colors px-4 py-2 font-mono text-xs uppercase cursor-pointer ${
                          isNight
                            ? 'bg-[#D4AF37] text-[#121110] hover:bg-[#F3C74D] font-semibold disabled:bg-[#38322A] disabled:text-[#8C8275]'
                            : 'bg-[#141414] text-white hover:bg-[#1F3FB0] disabled:bg-[#141414]/30'
                        }`}
                      >
                        Parse & Extract Articles
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {bibliographyError && (
                <div
                  className={`p-3 text-xs flex items-center gap-2 border ${
                    isNight
                      ? 'bg-rose-950/40 border-rose-800 text-rose-200'
                      : 'bg-red-50 border-red-200 text-red-800'
                  }`}
                >
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{bibliographyError}</span>
                </div>
              )}
            </div>
          )}

          {/* DOI TAB */}
          {activeTab === 'doi' && (
            <div className="space-y-4">
              <p className={`font-sans text-xs leading-relaxed ${isNight ? 'text-[#C0B7A8]' : 'text-[#141414]/70'}`}>
                Enter any scientific Digital Object Identifier (DOI). Metadata will be retrieved
                live from the official Crossref bibliographic registry.
              </p>

              <form onSubmit={handleResolveDoi} className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. 10.48550/arXiv.1706.03762 or full https://doi.org/... URL"
                  value={doiInput}
                  onChange={(e) => setDoiInput(e.target.value)}
                  className={`flex-1 border p-2.5 font-mono text-xs focus:outline-none transition-colors ${
                    isNight
                      ? 'bg-[#121110] border-[#38322A] text-[#EDE8DF] placeholder-[#8C8275] focus:border-[#D4AF37]'
                      : 'bg-white border-[#141414]/20 text-[#141414] placeholder-[#77736B] focus:border-[#1F3FB0]'
                  }`}
                />
                <button
                  type="submit"
                  disabled={isDoiLoading || !doiInput.trim()}
                  className={`transition-colors px-5 py-2.5 font-mono text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer ${
                    isNight
                      ? 'bg-[#D4AF37] text-[#121110] hover:bg-[#F3C74D] font-semibold disabled:bg-[#38322A] disabled:text-[#8C8275]'
                      : 'bg-[#141414] text-white hover:bg-[#1F3FB0] disabled:bg-[#141414]/30'
                  }`}
                >
                  {isDoiLoading ? 'Querying...' : 'Fetch Metadata'}
                </button>
              </form>

              {/* Landmark open-science DOIs for quick test */}
              <div className={`flex flex-wrap items-center gap-2 text-xs font-mono ${isNight ? 'text-[#9E9689]' : 'text-[#141414]/50'}`}>
                <span>Try open-access landmark:</span>
                <button
                  type="button"
                  onClick={() => {
                    setDoiInput('10.48550/arXiv.1706.03762');
                  }}
                  className={`cursor-pointer transition-colors ${isNight ? 'text-[#D4AF37] hover:underline' : 'text-[#1F3FB0] hover:underline'}`}
                  title="Attention Is All You Need (Transformer Architecture)"
                >
                  Attention (Transformer)
                </button>
                <span>•</span>
                <button
                  type="button"
                  onClick={() => {
                    setDoiInput('10.1126/science.1225829');
                  }}
                  className={`cursor-pointer transition-colors ${isNight ? 'text-[#D4AF37] hover:underline' : 'text-[#1F3FB0] hover:underline'}`}
                  title="CRISPR-Cas9 Programmable Gene Editing"
                >
                  CRISPR-Cas9
                </button>
                <span>•</span>
                <button
                  type="button"
                  onClick={() => {
                    setDoiInput('10.1038/s41586-021-03819-2');
                  }}
                  className={`cursor-pointer transition-colors ${isNight ? 'text-[#D4AF37] hover:underline' : 'text-[#1F3FB0] hover:underline'}`}
                  title="AlphaFold: Highly accurate protein structure prediction"
                >
                  AlphaFold
                </button>
              </div>

              {doiError && (
                <div
                  className={`p-3 text-xs flex items-center gap-2 border ${
                    isNight
                      ? 'bg-rose-950/40 border-rose-800 text-rose-200'
                      : 'bg-red-50 border-red-200 text-red-800'
                  }`}
                >
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{doiError}</span>
                </div>
              )}
            </div>
          )}

          {/* PDF UPLOAD TAB */}
          {activeTab === 'pdf' && (
            <div className="space-y-4">
              <p className={`font-sans text-xs leading-relaxed ${isNight ? 'text-[#C0B7A8]' : 'text-[#141414]/70'}`}>
                Upload a research PDF for private reading. Its original bytes are kept intact and
                rendered in the reader.
              </p>

              <label
                className={`border-2 border-dashed p-8 flex flex-col items-center justify-center cursor-pointer transition-colors block text-center ${
                  isNight
                    ? 'border-[#38322A] hover:border-[#D4AF37] bg-[#1E1B17]'
                    : 'border-[#141414]/20 hover:border-[#1F3FB0] bg-white'
                }`}
              >
                <Upload className={`w-8 h-8 mb-2 ${isNight ? 'text-[#D4AF37]' : 'text-[#141414]/40'}`} />
                <span className={`font-serif text-base block ${isNight ? 'text-[#EDE8DF]' : 'text-[#141414]'}`}>
                  {uploadedPdfName || 'Drop PDF file here or browse computer'}
                </span>
                <span className={`font-mono text-[10px] mt-1 block ${isNight ? 'text-[#9E9689]' : 'text-[#141414]/50'}`}>
                  {isPdfUploading ? 'Storing PDF…' : 'Supports .pdf files up to 50 MB'}
                </span>
                <input
                  type="file"
                  accept="application/pdf,.pdf"
                  onChange={handlePdfUpload}
                  className="hidden"
                />
              </label>
              {pdfUploadError && (
                <p role="alert" className={`text-sm ${isNight ? 'text-rose-300' : 'text-rose-800'}`}>
                  {pdfUploadError}
                </p>
              )}
              {uploadedPdfName && (
                <p role="status" className={`text-xs ${isNight ? 'text-emerald-300' : 'text-emerald-800'}`}>
                  PDF ready to import: {uploadedPdfName}
                </p>
              )}
            </div>
          )}

          {/* Preview Parsed Items Section */}
          {parsedItems.length > 0 && (
            <div
              className={`border-t pt-5 space-y-4 ${
                isNight ? 'border-[#38322A]' : 'border-[#141414]/15'
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`font-mono text-xs uppercase tracking-widest font-semibold flex items-center gap-1.5 ${
                    isNight ? 'text-[#D4AF37]' : 'text-[#1F3FB0]'
                  }`}
                >
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
                      className={`p-3 border text-xs flex flex-col justify-between transition-colors ${
                        dup
                          ? isNight
                            ? 'bg-[#2A2016] border-amber-600/40 text-[#F5E6CC]'
                            : 'bg-amber-50/70 border-amber-300 text-amber-900'
                          : isNight
                            ? 'bg-[#1E1B17] border-[#38322A] text-[#EDE8DF]'
                            : 'bg-white border-[#141414]/15 text-[#141414]'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="font-serif text-sm font-medium leading-snug line-clamp-1">
                          {item.title}
                        </div>
                        {dup && (
                          <span
                            className={`font-mono text-[9px] uppercase px-1.5 py-0.5 rounded font-semibold flex-shrink-0 ${
                              isNight
                                ? 'bg-amber-900/60 text-amber-200 border border-amber-700/50'
                                : 'bg-amber-200 text-amber-800'
                            }`}
                          >
                            Potential Duplicate
                          </span>
                        )}
                      </div>
                      <div
                        className={`font-mono text-[10px] mt-1 flex flex-wrap gap-2 ${
                          isNight ? 'text-[#9E9689]' : 'text-[#141414]/60'
                        }`}
                      >
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
                            <span className={isNight ? 'text-[#D4AF37]' : 'text-[#1F3FB0]'}>
                              DOI: {item.doi}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Ingestion Settings */}
              <div
                className={`border p-4 grid grid-cols-1 md:grid-cols-2 gap-4 transition-colors ${
                  isNight ? 'bg-[#1E1B17] border-[#38322A]' : 'bg-[#E7E4DC] border-[#141414]/15'
                }`}
              >
                <div>
                  <label
                    className={`block font-mono text-[11px] uppercase tracking-wider mb-1 ${
                      isNight ? 'text-[#C0B7A8]' : 'text-[#141414]/60'
                    }`}
                  >
                    Assign Research Field
                  </label>
                  <select
                    value={defaultCategory}
                    onChange={(e) => setDefaultCategory(e.target.value as ResearchCategory)}
                    className={`w-full border p-2 font-mono text-xs focus:outline-none cursor-pointer transition-colors ${
                      isNight
                        ? 'bg-[#121110] border-[#38322A] text-[#EDE8DF] focus:border-[#D4AF37]'
                        : 'bg-white border-[#141414]/20 text-[#141414] focus:border-[#1F3FB0]'
                    }`}
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
                  <label
                    className={`block font-mono text-[11px] uppercase tracking-wider mb-1 ${
                      isNight ? 'text-[#C0B7A8]' : 'text-[#141414]/60'
                    }`}
                  >
                    Initial Reading Status
                  </label>
                  <select
                    value={defaultStatus}
                    onChange={(e) =>
                      setDefaultStatus(
                        e.target.value as 'inbox' | 'to_read' | 'reading' | 'reference_only'
                      )
                    }
                    className={`w-full border p-2 font-mono text-xs focus:outline-none cursor-pointer transition-colors ${
                      isNight
                        ? 'bg-[#121110] border-[#38322A] text-[#EDE8DF] focus:border-[#D4AF37]'
                        : 'bg-white border-[#141414]/20 text-[#141414] focus:border-[#1F3FB0]'
                    }`}
                  >
                    <option value="inbox">Inbox (Unsorted)</option>
                    <option value="to_read">To Read</option>
                    <option value="reading">Reading Now</option>
                    <option value="reference_only">Reference Only</option>
                  </select>
                </div>

                <fieldset className="md:col-span-2 space-y-3">
                  <legend
                    className={`block font-mono text-[11px] uppercase tracking-wider mb-2 ${
                      isNight ? 'text-[#C0B7A8]' : 'text-[#141414]/60'
                    }`}
                  >
                    File these papers in a book
                  </legend>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <label
                      className={`block font-mono text-[10px] uppercase tracking-wide ${
                        isNight ? 'text-[#C0B7A8]' : 'text-[#5A534A]'
                      }`}
                    >
                      Research area
                      <select
                        aria-label="Research area"
                        value={createNewArea ? '__new_area__' : destinationAreaId}
                        onChange={(event) => {
                          const value = event.target.value;
                          setCreateNewArea(value === '__new_area__');
                          setCreateNewBook(false);
                          setDestinationAreaId(value === '__new_area__' ? '' : value);
                          setDestinationBookId('');
                        }}
                        className={`mt-1 w-full border p-2 font-sans text-sm normal-case transition-colors ${
                          isNight
                            ? 'bg-[#121110] border-[#38322A] text-[#EDE8DF] focus:border-[#D4AF37]'
                            : 'bg-white border-[#141414]/20 text-[#141414] focus:border-[#1F3FB0]'
                        }`}
                      >
                        <option value="">Choose a research area…</option>
                        <option value="__root__">My Research · no area</option>
                        {areas.map((area) => (
                          <option key={area.id} value={area.id}>
                            {area.name}
                          </option>
                        ))}
                        <option value="__new_area__">＋ Create a new research area…</option>
                      </select>
                    </label>
                    <label
                      className={`block font-mono text-[10px] uppercase tracking-wide ${
                        isNight ? 'text-[#C0B7A8]' : 'text-[#5A534A]'
                      }`}
                    >
                      Book
                      <select
                        aria-label="Book"
                        value={createNewBook ? '__new_book__' : destinationBookId}
                        disabled={!createNewArea && !destinationAreaId}
                        onChange={(event) => {
                          const value = event.target.value;
                          setCreateNewBook(value === '__new_book__');
                          setDestinationBookId(value === '__new_book__' ? '' : value);
                        }}
                        className={`mt-1 w-full border p-2 font-sans text-sm normal-case transition-colors ${
                          isNight
                            ? 'bg-[#121110] border-[#38322A] text-[#EDE8DF] disabled:bg-[#1E1B17] disabled:text-[#8C8275] focus:border-[#D4AF37]'
                            : 'bg-white border-[#141414]/20 text-[#141414] disabled:bg-[#E7E4DC] focus:border-[#1F3FB0]'
                        }`}
                      >
                        <option value="">Choose a book…</option>
                        {destinationBooks.map((book) => (
                          <option key={book.id} value={book.id}>
                            {book.name}
                          </option>
                        ))}
                        <option value="__new_book__">＋ Create a new book…</option>
                      </select>
                    </label>
                  </div>
                  {createNewArea && (
                    <label
                      className={`block font-mono text-[10px] uppercase tracking-wide ${
                        isNight ? 'text-[#C0B7A8]' : 'text-[#5A534A]'
                      }`}
                    >
                      New research area name
                      <input
                        aria-label="New research area name"
                        value={newAreaName}
                        onChange={(event) => setNewAreaName(event.target.value)}
                        placeholder="e.g. Food systems"
                        className={`mt-1 w-full border p-2 font-sans text-sm normal-case transition-colors ${
                          isNight
                            ? 'bg-[#121110] border-[#38322A] text-[#EDE8DF] placeholder-[#8C8275] focus:border-[#D4AF37]'
                            : 'bg-white border-[#141414]/20 text-[#141414] placeholder-[#77736B] focus:border-[#1F3FB0]'
                        }`}
                      />
                    </label>
                  )}
                  {createNewBook && (
                    <label
                      className={`block font-mono text-[10px] uppercase tracking-wide ${
                        isNight ? 'text-[#C0B7A8]' : 'text-[#5A534A]'
                      }`}
                    >
                      New book name
                      <input
                        aria-label="New book name"
                        value={newBookName}
                        onChange={(event) => setNewBookName(event.target.value)}
                        placeholder="e.g. Literature review"
                        className={`mt-1 w-full border p-2 font-sans text-sm normal-case transition-colors ${
                          isNight
                            ? 'bg-[#121110] border-[#38322A] text-[#EDE8DF] placeholder-[#8C8275] focus:border-[#D4AF37]'
                            : 'bg-white border-[#141414]/20 text-[#141414] placeholder-[#77736B] focus:border-[#1F3FB0]'
                        }`}
                      />
                    </label>
                  )}
                  <p className={`text-[10px] font-mono ${isNight ? 'text-[#8C8275]' : 'text-[#77736B]'}`}>
                    Every imported paper will be placed in this one book. You can move it later.
                  </p>
                </fieldset>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div
          className={`border-t px-6 py-4 flex items-center justify-between transition-colors ${
            isNight ? 'border-[#38322A] bg-[#1E1B17]' : 'border-[#141414]/15 bg-[#E7E4DC]'
          }`}
        >
          <button
            onClick={onClose}
            className={`px-4 py-2 border font-mono text-xs uppercase transition-colors cursor-pointer ${
              isNight
                ? 'border-[#38322A] text-[#EDE8DF] hover:bg-[#25201A]'
                : 'border-[#141414]/20 text-[#141414] hover:bg-white'
            }`}
          >
            Cancel
          </button>

          <button
            onClick={handleCommitImport}
            disabled={parsedItems.length === 0 || !destinationReady}
            className={`transition-colors px-6 py-2.5 font-mono text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer font-medium ${
              isNight
                ? 'bg-[#D4AF37] text-[#121110] hover:bg-[#F3C74D] font-semibold disabled:bg-[#38322A] disabled:text-[#8C8275] disabled:cursor-not-allowed'
                : 'bg-[#141414] text-white hover:bg-[#1F3FB0] disabled:bg-[#141414]/20 disabled:cursor-not-allowed'
            }`}
          >
            <span>{destinationReady ? `Import ${parsedItems.length > 0 ? `(${parsedItems.length})` : ''} into book` : 'Choose an area and book'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
