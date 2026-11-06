import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import { BookOpen, ExternalLink, FileUp, Sparkles } from 'lucide-react';
import { ResearchItem } from '../types/research';
import { loadPdfBytes } from '../services/pdfDocuments';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

export interface PdfDocumentReaderProps {
  paper: ResearchItem;
  requestedPage: number;
  zoom: number;
  onPageCount: (count: number) => void;
  onCurrentPageChange: (page: number) => void;
  onTextSelection: () => void;
  onAttachPdf: (file: File) => Promise<void>;
  isNightMode?: boolean;
}

export function PdfDocumentReader({
  paper,
  requestedPage,
  zoom,
  onPageCount,
  onCurrentPageChange,
  onTextSelection,
  onAttachPdf,
  isNightMode: propNightMode,
}: PdfDocumentReaderProps) {
  const isNight = propNightMode ?? (typeof document !== 'undefined' && document.documentElement.classList.contains('theme-nocturne'));
  const scrollRootRef = useRef<HTMLDivElement>(null);
  const pageElementsRef = useRef(new Map<number, HTMLDivElement>());
  const [pdfBytes, setPdfBytes] = useState<Uint8Array | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [pageWidth, setPageWidth] = useState(760);
  const [renderedPages, setRenderedPages] = useState<Set<number>>(() => new Set());
  const [isAttaching, setIsAttaching] = useState(false);
  const [attachError, setAttachError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const sourceUrl = paper.url && /^https?:\/\//i.test(paper.url)
    ? paper.url
    : paper.doi ? `https://doi.org/${encodeURIComponent(paper.doi)}` : undefined;

  const handleAttachFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setAttachError(null);
    try {
      if (!file.name.toLowerCase().endsWith('.pdf') || (file.type && file.type !== 'application/pdf')) {
        throw new Error('Choose a PDF file.');
      }
      if (file.size <= 0 || file.size > 100 * 1024 * 1024) {
        throw new Error('PDF files must be between 1 byte and 100 MB.');
      }
      const signature = new TextDecoder().decode(new Uint8Array(await file.slice(0, 5).arrayBuffer()));
      if (signature !== '%PDF-') throw new Error('The selected file does not have a valid PDF signature.');
      setIsAttaching(true);
      await onAttachPdf(file);
    } catch (attachFailure) {
      setAttachError(attachFailure instanceof Error ? attachFailure.message : 'Could not attach this PDF.');
    } finally {
      setIsAttaching(false);
      event.target.value = '';
    }
  };

  useEffect(() => {
    let cancelled = false;
    setPdfBytes(null);
    setError(null);
    setPageCount(0);
    setRenderedPages(new Set());

    void loadPdfBytes(paper)
      .then((bytes) => {
        if (!cancelled) setPdfBytes(bytes);
      })
      .catch((loadError: unknown) => {
        if (!cancelled) {
          setError(
            loadError instanceof Error ? loadError.message : 'Could not load this PDF.'
          );
          // Set to 1 page for the Archival Folio edition
          onPageCount(1);
          onCurrentPageChange(1);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [paper.id, paper.storagePath, paper.guestPdfId, onPageCount, onCurrentPageChange]);

  const file = useMemo(() => pdfBytes ? { data: pdfBytes } : null, [pdfBytes]);

  useEffect(() => {
    const root = scrollRootRef.current;
    if (!root) return;

    const updateWidth = () => setPageWidth(Math.max(280, Math.min(root.clientWidth - 48, 900)));
    updateWidth();
    const resizeObserver = new ResizeObserver(updateWidth);
    resizeObserver.observe(root);
    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    const root = scrollRootRef.current;
    if (!root || pageCount === 0) return;

    const active = new Map<number, number>();
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        const page = Number((entry.target as HTMLElement).dataset.pageNumber);
        if (entry.isIntersecting) active.set(page, entry.intersectionRatio);
        else active.delete(page);
      }

      const closestPage = [...active.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
      if (closestPage) onCurrentPageChange(closestPage);

      const nearbyPages = new Set<number>();
      for (const page of active.keys()) {
        nearbyPages.add(page);
        if (page > 1) nearbyPages.add(page - 1);
        if (page < pageCount) nearbyPages.add(page + 1);
      }
      setRenderedPages(nearbyPages);
    }, { root, rootMargin: '1000px 0px', threshold: [0, 0.15, 0.5, 0.85, 1] });

    for (const pageElement of pageElementsRef.current.values()) observer.observe(pageElement);
    return () => observer.disconnect();
  }, [pageCount, onCurrentPageChange]);

  useEffect(() => {
    if (requestedPage < 1) return;
    const pageElement = pageElementsRef.current.get(requestedPage);
    pageElement?.scrollIntoView({ behavior: 'auto', block: 'start' });
  }, [requestedPage, pageCount]);

  const registerPage = useCallback((page: number, element: HTMLDivElement | null) => {
    if (element) pageElementsRef.current.set(page, element);
    else pageElementsRef.current.delete(page);
  }, []);

  const handleDocumentLoad = useCallback((document: PDFDocumentProxy) => {
    setPageCount(document.numPages);
    onPageCount(document.numPages);
  }, [onPageCount]);

  return (
    <div
      ref={scrollRootRef}
      onMouseUp={onTextSelection}
      className={`absolute inset-0 min-h-0 overflow-auto px-4 py-6 md:px-8 md:py-10 paper-grain transition-colors ${
        isNight ? 'bg-[#121110] text-[#EDE8DF]' : 'bg-[#EDEBE6] text-[#141414]'
      }`}
      aria-label="PDF pages"
    >
      {error && (
        <article
          className={`mx-auto max-w-3xl border p-6 sm:p-10 md:p-12 shadow-2xl transition-colors relative my-4 sm:my-8 ${
            isNight
              ? 'bg-[#181614] border-[#38322A] text-[#EDE8DF]'
              : 'bg-[#FAF8F3] border-[#141414]/20 text-[#141414]'
          }`}
          style={{
            backgroundImage: isNight
              ? 'radial-gradient(#25201A 0.75px, transparent 0.75px)'
              : 'radial-gradient(#14141412 0.75px, transparent 0.75px)',
            backgroundSize: '16px 16px',
          }}
        >
          {/* Top Archival Folio Banner */}
          <header className={`border-b pb-4 ${isNight ? 'border-[#38322A]' : 'border-[#141414]/15'}`}>
            <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono tracking-widest uppercase">
              <span className={`flex items-center gap-1.5 ${isNight ? 'text-[#D4AF37]' : 'text-[#1F3FB0]'}`}>
                <BookOpen className="w-3.5 h-3.5" />
                <span>ARCHIVAL FOLIO EDITION · MARGINALIA STUDY ROOM</span>
              </span>
              <span className={`px-2 py-0.5 rounded border ${
                isNight
                  ? 'border-[#38322A] bg-[#221E19] text-[#C9A354]'
                  : 'border-[#141414]/15 bg-white text-[#77736B]'
              }`}>
                {paper.category.toUpperCase()} · {paper.year}
              </span>
            </div>

            {/* Document Title */}
            <h1 className={`mt-4 font-serif text-2xl sm:text-3xl font-normal leading-snug tracking-tight ${
              isNight ? 'text-[#EDE8DF]' : 'text-[#141414]'
            }`}>
              {paper.title}
            </h1>

            {/* Authors & Academic Provenance */}
            <p className={`mt-2 font-serif italic text-sm ${
              isNight ? 'text-[#A89F91]' : 'text-[#5A5248]'
            }`}>
              {paper.authors.join(', ')}
            </p>

            {/* Journal / Venue & DOI Links */}
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-mono">
              {paper.journal && (
                <span className={`px-2 py-0.5 rounded text-[11px] ${
                  isNight ? 'bg-[#25201A] text-[#EDE8DF]' : 'bg-[#EDEBE6] text-[#141414]'
                }`}>
                  {paper.journal}
                </span>
              )}
              {paper.doi && (
                <a
                  href={`https://doi.org/${encodeURIComponent(paper.doi)}`}
                  target="_blank"
                  rel="noreferrer"
                  className={`inline-flex items-center gap-1 transition-colors underline decoration-dotted text-[11px] ${
                    isNight ? 'text-[#D4AF37] hover:text-[#F3C74D]' : 'text-[#1F3FB0] hover:text-[#143088]'
                  }`}
                  title="Official DOI Link"
                >
                  <span>doi:{paper.doi}</span>
                  <ExternalLink className="w-2.5 h-2.5 opacity-70" />
                </a>
              )}
            </div>
          </header>

          {/* Synthesized Abstract Section */}
          <section className="my-6">
            <h2 className={`text-[11px] font-mono uppercase tracking-widest mb-3 flex items-center gap-1.5 ${
              isNight ? 'text-[#D4AF37]' : 'text-[#1F3FB0]'
            }`}>
              <Sparkles className="w-3.5 h-3.5" />
              <span>SYNTHESIZED ABSTRACT & SCHOLARLY SUMMARY</span>
            </h2>

            <div className={`font-serif text-sm sm:text-base leading-relaxed whitespace-pre-wrap select-text first-letter:font-serif first-letter:text-3xl sm:first-letter:text-4xl first-letter:float-left first-letter:mr-2.5 first-letter:leading-none first-letter:font-normal ${
              isNight
                ? 'text-[#D5CEC2] first-letter:text-[#D4AF37]'
                : 'text-[#2C2723] first-letter:text-[#1F3FB0]'
            }`}>
              {paper.abstract || 'No abstract text available for this publication record.'}
            </div>
          </section>

          {/* Study Design / Methodological Protocols */}
          {(paper.sample || (paper.tags && paper.tags.length > 0)) && (
            <section className={`border-t pt-4 my-4 ${isNight ? 'border-[#38322A]' : 'border-[#141414]/15'}`}>
              <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
                {paper.sample && (
                  <span className={`px-2.5 py-1 rounded border ${
                    isNight ? 'border-[#38322A] bg-[#221E19] text-[#C9A354]' : 'border-[#141414]/15 bg-white text-[#77736B]'
                  }`}>
                    SAMPLE: {paper.sample}
                  </span>
                )}
                {paper.tags?.map((t) => (
                  <span key={t} className={`px-2 py-0.5 rounded text-[10px] ${
                    isNight ? 'bg-[#2A241E] text-[#B8AE9F]' : 'bg-[#EDEBE6] text-[#554F46]'
                  }`}>
                    #{t}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Archival Actions: Read Full Text & Attach PDF */}
          <footer className={`border-t pt-5 mt-6 flex flex-wrap items-center justify-between gap-3 ${
            isNight ? 'border-[#38322A]' : 'border-[#141414]/15'
          }`}>
            <div className="flex flex-wrap items-center gap-2">
              {sourceUrl && (
                <a
                  href={sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center gap-1.5 px-4 py-2 font-mono text-xs uppercase tracking-wider font-semibold transition-colors cursor-pointer border shadow-xs ${
                    isNight
                      ? 'border-[#D4AF37] bg-[#D4AF37] text-[#121110] hover:bg-[#F3C74D]'
                      : 'border-[#1F3FB0] bg-[#1F3FB0] text-white hover:bg-[#16318C]'
                  }`}
                >
                  <span>Read Full Text (Open Access)</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isAttaching}
                className={`inline-flex items-center gap-1.5 px-4 py-2 font-mono text-xs uppercase tracking-wider transition-colors cursor-pointer border ${
                  isNight
                    ? 'border-[#38322A] bg-[#221E19] text-[#EDE8DF] hover:border-[#D4AF37] hover:text-[#D4AF37]'
                    : 'border-[#141414]/25 bg-white text-[#141414] hover:border-[#1F3FB0] hover:text-[#1F3FB0]'
                }`}
              >
                <FileUp className="w-3.5 h-3.5" />
                <span>{isAttaching ? 'Attaching…' : 'Attach Local PDF'}</span>
              </button>
            </div>

            <span className={`text-[10px] font-mono ${isNight ? 'text-[#8C8275]' : 'text-[#77736B]'}`}>
              Select any text above to highlight or annotate
            </span>
          </footer>

          {attachError && (
            <span className="mt-2.5 block font-mono text-xs text-rose-500">
              {attachError}
            </span>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf,.pdf"
            className="sr-only"
            aria-label="Choose a PDF to attach to this paper"
            onChange={handleAttachFile}
          />
        </article>
      )}
      {!error && !file && (
        <p role="status" aria-live="polite" className="mx-auto max-w-2xl p-5 text-center font-mono text-sm text-[#77736B]">
          Loading PDF…
        </p>
      )}
      {file && (
        <Document
          file={file}
          onLoadSuccess={handleDocumentLoad}
          onLoadError={(loadError) => setError(loadError.message || 'This file is not a valid PDF.')}
          loading={<p role="status" className="mx-auto max-w-2xl p-5 text-center font-mono text-sm text-[#77736B]">Opening PDF…</p>}
          error={<p role="alert" className="mx-auto max-w-2xl border border-rose-300 bg-rose-50 p-5 text-sm text-rose-900">This file could not be parsed as a PDF. Reimport a valid PDF file.</p>}
          className="mx-auto flex w-fit flex-col items-center"
        >
          {Array.from({ length: pageCount }, (_, index) => {
            const pageNumber = index + 1;
            const shouldRender = renderedPages.has(pageNumber);
            return (
              <div
                key={pageNumber}
                ref={(element) => registerPage(pageNumber, element)}
                data-page-number={pageNumber}
                className="mb-5 flex justify-center bg-white shadow-xl"
                style={{ width: `${pageWidth * zoom}px`, minHeight: `${(pageWidth * zoom) * 1.294}px` }}
              >
                {shouldRender && (
                  <Page
                    pageNumber={pageNumber}
                    width={pageWidth}
                    scale={zoom}
                    devicePixelRatio={Math.min(window.devicePixelRatio || 1, 2)}
                    renderTextLayer
                    renderAnnotationLayer
                    loading={<div className="w-full bg-white" style={{ minHeight: `${pageWidth * zoom * 1.294}px` }} />}
                    error={<div role="alert" className="p-6 text-sm text-rose-800">Page {pageNumber} could not be rendered.</div>}
                    onLoadSuccess={(page) => {
                      const element = pageElementsRef.current.get(pageNumber);
                      if (element) {
                        const width = page.view[2] - page.view[0];
                        const height = page.view[3] - page.view[1];
                        element.style.minHeight = `${height / width * pageWidth * zoom}px`;
                      }
                    }}
                  />
                )}
                {!shouldRender && <div aria-hidden="true" style={{ width: '100%', minHeight: `${pageWidth * zoom * 1.294}px` }} />}
                <span className="sr-only">Page {pageNumber} of {pageCount}</span>
              </div>
            );
          })}
        </Document>
      )}
    </div>
  );
}
