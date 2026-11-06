import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import type { PDFDocumentProxy } from 'pdfjs-dist';
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

    void loadPdfBytes(paper).then((bytes) => {
      if (!cancelled) setPdfBytes(bytes);
    }).catch((loadError: unknown) => {
      if (!cancelled) {
        setError(loadError instanceof Error ? loadError.message : 'Could not load this PDF.');
      }
    });

    return () => { cancelled = true; };
  }, [paper.id, paper.storagePath, paper.guestPdfId]);

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
        <div
          role="alert"
          className={`mx-auto max-w-2xl border p-6 text-sm shadow-xl transition-colors ${
            isNight
              ? 'bg-[#1A1815] border-[#2E2822] text-[#EDE8DF]'
              : 'bg-[#F9F7F2] border-[#141414]/15 text-[#141414]'
          }`}
        >
          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                isNight ? 'bg-[#D4AF37]' : 'bg-[#1F3FB0]'
              }`}
            />
            <strong
              className={`font-mono text-xs uppercase tracking-wider ${
                isNight ? 'text-[#D4AF37]' : 'text-[#1F3FB0]'
              }`}
            >
              PDF Document Unavailable
            </strong>
          </div>
          <p
            className={`mt-2 font-mono text-xs leading-relaxed ${
              isNight ? 'text-[#9E9689]' : 'text-[#77736B]'
            }`}
          >
            This paper record has no local PDF attached yet. You can attach a local PDF file or open the original publication directly via DOI / Open Access web repository.
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isAttaching}
              className={`px-4 py-2 font-mono text-xs uppercase tracking-wide transition-colors cursor-pointer disabled:opacity-60 border ${
                isNight
                  ? 'bg-[#25201A] border-[#3E362C] text-[#EDE8DF] hover:border-[#D4AF37] hover:text-[#D4AF37]'
                  : 'bg-[#141414] border-[#141414] text-white hover:bg-[#1F3FB0]'
              }`}
            >
              {isAttaching ? 'Attaching PDF…' : paper.storagePath || paper.guestPdfId ? 'Choose another PDF' : 'Attach Local PDF'}
            </button>

            {sourceUrl && (
              <a
                href={sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center px-4 py-2 font-mono text-xs uppercase transition-colors cursor-pointer border ${
                  isNight
                    ? 'border-[#D4AF37]/40 bg-[#D4AF37]/10 text-[#D4AF37] hover:bg-[#D4AF37]/20 hover:border-[#D4AF37]'
                    : 'border-[#1F3FB0]/30 bg-[#1F3FB0]/5 text-[#1F3FB0] hover:bg-[#1F3FB0]/15'
                }`}
              >
                Read Open Access via DOI / Web ↗
              </a>
            )}
          </div>

          {attachError && (
            <span className="mt-2.5 block font-mono text-xs text-rose-500">
              {attachError}
            </span>
          )}

          {paper.abstract && (
            <section
              className={`mt-6 pt-5 border-t text-left ${
                isNight ? 'border-[#2E2822]' : 'border-[#141414]/15'
              }`}
            >
              <h2
                className={`font-serif text-lg font-medium tracking-tight ${
                  isNight ? 'text-[#EDE8DF]' : 'text-[#141414]'
                }`}
              >
                Synthesized Abstract
              </h2>
              <p
                className={`mt-2 whitespace-pre-wrap font-serif text-sm leading-relaxed ${
                  isNight ? 'text-[#C0B7A8]' : 'text-[#35302B]'
                }`}
              >
                {paper.abstract}
              </p>
            </section>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf,.pdf"
            className="sr-only"
            aria-label="Choose a PDF to attach to this paper"
            onChange={handleAttachFile}
          />
        </div>
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
