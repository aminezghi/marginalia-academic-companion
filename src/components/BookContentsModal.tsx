import React from 'react';
import { BookOpen, FileText, Plus, X } from 'lucide-react';
import type { ResearchCollection, ResearchItem } from '../types/research';

interface BookContentsModalProps {
  bookTitle: string;
  collectionId: string | null;
  collections: ResearchCollection[];
  papers: ResearchItem[];
  onClose: () => void;
  onAddPapers: () => void;
  onMovePaper: (paper: ResearchItem, collectionId: string) => void;
  onToggleRead: (paper: ResearchItem) => void;
  onReadPaper: (paper: ResearchItem, readingQueue: ResearchItem[]) => void;
  onOpenDossier: (paper: ResearchItem) => void;
}

export const BookContentsModal: React.FC<BookContentsModalProps> = ({ bookTitle, collectionId, collections, papers, onClose, onAddPapers, onMovePaper, onToggleRead, onReadPaper, onOpenDossier }) => (
  <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#141414]/65 p-4 backdrop-blur-sm" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <section role="dialog" aria-modal="true" aria-labelledby="book-contents-title" className="flex max-h-[85vh] w-full max-w-3xl flex-col overflow-hidden border border-[#141414]/20 bg-[#F4F2ED] shadow-2xl">
      <header className="flex items-center justify-between border-b border-[#141414]/15 bg-[#E7E4DC] px-5 py-4">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#1F3FB0]">Collected papers · {papers.length} items</span>
          <h2 id="book-contents-title" className="mt-1 font-serif text-2xl text-[#141414]">{bookTitle}</h2>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={onAddPapers} className="inline-flex items-center gap-1.5 border border-[#141414]/20 bg-white px-3 py-2 font-mono text-[10px] uppercase hover:border-[#1F3FB0] hover:text-[#1F3FB0]"><Plus className="h-3.5 w-3.5" />Add papers</button>
          <button type="button" aria-label="Close book contents" onClick={onClose} className="p-2 text-[#5A534A] hover:bg-white"><X className="h-5 w-5" /></button>
        </div>
      </header>
      <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-4">
        {papers.length === 0 ? <p className="p-6 text-center font-mono text-sm text-[#77736B]">This volume has no papers.</p> : papers.map((paper) => {
          const pageCount = paper.readingProgress?.totalPages || paper.pageCount;
          return (
            <article key={paper.id} className="flex flex-col gap-3 border border-[#141414]/15 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <h3 className="font-serif text-base font-medium leading-snug text-[#141414]">{paper.title}</h3>
                <p className="mt-1 truncate font-mono text-[10px] text-[#77736B]">{paper.authors.join(', ') || 'Unknown authors'} · {paper.year || 'n.d.'} · {paper.journal || paper.type}</p>
                <p className="mt-1 font-mono text-[10px] text-[#5A534A]">
                  {pageCount ? `${pageCount} pages` : paper.pages ? `Source pages ${paper.pages}` : 'Page count unavailable'}
                  {' · '}{paper.readingStatus.replace('_', ' ')}
                </p>
                {paper.abstract && <p className="mt-2 line-clamp-2 font-serif text-xs leading-relaxed text-[#5A534A]">{paper.abstract}</p>}
              </div>
              <div className="flex shrink-0 flex-wrap items-center gap-2">
                <button type="button" onClick={() => onToggleRead(paper)} aria-pressed={paper.readingStatus === 'completed'} className={`border px-2.5 py-2 font-mono text-[10px] uppercase ${paper.readingStatus === 'completed' ? 'border-emerald-700 bg-emerald-50 text-emerald-800' : 'border-[#141414]/20 text-[#141414] hover:border-emerald-700 hover:text-emerald-800'}`}>{paper.readingStatus === 'completed' ? '✓ Read' : 'Mark read'}</button>
                {collections.some((collection) => !collection.isSmart && collection.kind !== 'area' && collection.id !== collectionId) && (
                  <select
                    aria-label={`${collectionId ? 'Move' : 'Add'} ${paper.title} ${collectionId ? 'to another folder' : 'to a folder'}`}
                    value=""
                    onChange={(event) => onMovePaper(paper, event.target.value)}
                    className="max-w-40 border border-[#141414]/20 bg-[#F4F2ED] px-2 py-2 font-mono text-[10px]"
                  >
                    <option value="">{collectionId ? 'Move to folder…' : 'Add to folder…'}</option>
                    {collections.filter((collection) => !collection.isSmart && collection.kind !== 'area' && collection.id !== collectionId).map((collection) => (
                      <option key={collection.id} value={collection.id}>{collection.name}</option>
                    ))}
                  </select>
                )}
                <button type="button" onClick={() => onReadPaper(paper, papers)} className="inline-flex items-center gap-1.5 bg-[#1F3FB0] px-3 py-2 font-mono text-[10px] uppercase text-white hover:bg-[#19328D]"><FileText className="h-3.5 w-3.5" />Read</button>
                <button type="button" onClick={() => onOpenDossier(paper)} className="inline-flex items-center gap-1.5 border border-[#141414]/20 px-3 py-2 font-mono text-[10px] uppercase text-[#141414] hover:bg-[#EDEBE6]"><BookOpen className="h-3.5 w-3.5" />Details</button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  </div>
);
