import React, { useState, useMemo } from 'react';
import {
  ResearchItem,
  ResearchCollection,
  ReadingStatus,
  CategoryDefinition,
} from '../types/research';
import { ShelfArchive } from './ShelfArchive';
import { ResearchCaption } from './ResearchCaption';
import {
  Search,
  Filter,
  SlidersHorizontal,
  LayoutGrid,
  List,
  Columns,
  BookOpen,
  Trash2,
  CheckSquare,
  Square,
  ArrowUpDown,
  Plus,
} from 'lucide-react';
import { playPaperRustle, playTactileClick } from '../utils/sound';

interface LibraryViewProps {
  papers: ResearchItem[];
  collections: ResearchCollection[];
  categories: CategoryDefinition[];
  onSelectPaper: (paper: ResearchItem) => void;
  onOpenReader: (paper: ResearchItem) => void;
  onOpenImport: () => void;
  onBulkUpdateStatus: (paperIds: string[], status: ReadingStatus) => void;
  onBulkDelete: (paperIds: string[]) => void;
  onCursorChange: (state: any) => void;
}

export const LibraryView: React.FC<LibraryViewProps> = ({
  papers,
  collections,
  categories,
  onSelectPaper,
  onOpenReader,
  onOpenImport,
  onBulkUpdateStatus,
  onBulkDelete,
  onCursorChange,
}) => {
  const [viewMode, setViewMode] = useState<'shelf' | 'grid' | 'table'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [collectionFilter, setCollectionFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'year_desc' | 'year_asc' | 'title' | 'progress'>('year_desc');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [shelfActiveIndex, setShelfActiveIndex] = useState<number>(0);

  // Filter & Sort Papers
  const filteredPapers = useMemo(() => {
    return papers
      .filter((p) => {
        // Status filter
        if (statusFilter !== 'all' && p.readingStatus !== statusFilter) return false;
        // Collection filter
        if (collectionFilter !== 'all' && !p.collectionIds.includes(collectionFilter)) return false;
        // Category filter
        if (categoryFilter !== 'all' && p.category !== categoryFilter) return false;
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesTitle = p.title.toLowerCase().includes(q);
          const matchesAuthors = p.authors.some((a) => a.toLowerCase().includes(q));
          const matchesAbstract = p.abstract.toLowerCase().includes(q);
          const matchesTags = p.tags.some((t) => t.toLowerCase().includes(q));
          if (!matchesTitle && !matchesAuthors && !matchesAbstract && !matchesTags) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'year_desc') return parseInt(b.year, 10) - parseInt(a.year, 10);
        if (sortBy === 'year_asc') return parseInt(a.year, 10) - parseInt(b.year, 10);
        if (sortBy === 'title') return a.title.localeCompare(b.title);
        if (sortBy === 'progress') return (b.readingProgress?.percent || 0) - (a.readingProgress?.percent || 0);
        return 0;
      });
  }, [papers, statusFilter, collectionFilter, categoryFilter, searchQuery, sortBy]);

  const activeShelfItem = filteredPapers[shelfActiveIndex] || filteredPapers[0] || null;

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === filteredPapers.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredPapers.map((p) => p.id));
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-8 space-y-6 animate-in fade-in duration-200">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#141414]/15 pb-4">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#77736B]">
            CENTRAL REPOSITORY · {filteredPapers.length} OF {papers.length} VOLUMES
          </span>
          <h1 className="font-serif text-3xl font-medium tracking-tight text-[#141414] mt-0.5">
            My Research Library
          </h1>
        </div>

        {/* View Mode Switcher & Import */}
        <div className="flex items-center gap-2">
          <div className="flex items-center border border-[#141414]/25 bg-white p-0.5">
            <button
              onClick={() => {
                playPaperRustle();
                setViewMode('shelf');
              }}
              className={`p-1.5 transition-colors cursor-pointer ${
                viewMode === 'shelf' ? 'bg-[#1F3FB0] text-white' : 'text-[#77736B] hover:text-[#141414]'
              }`}
              title="3D Shelf View"
            >
              <Columns className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                playPaperRustle();
                setViewMode('grid');
              }}
              className={`p-1.5 transition-colors cursor-pointer ${
                viewMode === 'grid' ? 'bg-[#1F3FB0] text-white' : 'text-[#77736B] hover:text-[#141414]'
              }`}
              title="Editorial Card Grid"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                playPaperRustle();
                setViewMode('table');
              }}
              className={`p-1.5 transition-colors cursor-pointer ${
                viewMode === 'table' ? 'bg-[#1F3FB0] text-white' : 'text-[#77736B] hover:text-[#141414]'
              }`}
              title="Detailed Table View"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={onOpenImport}
            className="px-3.5 py-1.5 bg-[#1F3FB0] hover:bg-[#19328D] text-white text-xs font-mono uppercase font-semibold tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>IMPORT</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="p-4 bg-white border border-[#141414]/15 space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search bar */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-[#77736B] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by title, author, keyword, or PRISMA tag..."
              className="w-full pl-9 pr-3 py-1.5 bg-[#EDEBE6]/40 border border-[#141414]/20 text-xs font-mono focus:border-[#1F3FB0] focus:outline-hidden"
            />
          </div>

          {/* Reading Status Filter */}
          <div className="w-full md:w-auto flex items-center gap-2">
            <span className="text-[10px] font-mono text-[#77736B] uppercase shrink-0">STATUS:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="p-1.5 bg-[#EDEBE6]/40 border border-[#141414]/20 text-xs font-mono"
            >
              <option value="all">All Statuses</option>
              <option value="reading">Reading Now</option>
              <option value="to_read">To Read</option>
              <option value="inbox">Inbox</option>
              <option value="completed">Completed</option>
              <option value="reference_only">Reference Only</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          {/* Collection Filter */}
          <div className="w-full md:w-auto flex items-center gap-2">
            <span className="text-[10px] font-mono text-[#77736B] uppercase shrink-0">COLLECTION:</span>
            <select
              value={collectionFilter}
              onChange={(e) => setCollectionFilter(e.target.value)}
              className="p-1.5 bg-[#EDEBE6]/40 border border-[#141414]/20 text-xs font-mono"
            >
              <option value="all">All Collections</option>
              {collections.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div className="w-full md:w-auto flex items-center gap-2">
            <span className="text-[10px] font-mono text-[#77736B] uppercase shrink-0">SORT:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="p-1.5 bg-[#EDEBE6]/40 border border-[#141414]/20 text-xs font-mono"
            >
              <option value="year_desc">Year (Newest)</option>
              <option value="year_asc">Year (Oldest)</option>
              <option value="title">Title (A-Z)</option>
              <option value="progress">Reading Progress</option>
            </select>
          </div>
        </div>

        {/* Bulk Action Strip when items selected */}
        {selectedIds.length > 0 && (
          <div className="p-2.5 bg-[#EDEBE6] border border-[#1F3FB0]/30 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
            <div className="flex items-center gap-2 font-semibold text-[#1F3FB0]">
              <CheckSquare className="w-4 h-4" />
              <span>{selectedIds.length} volumes selected</span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[#77736B]">Mark as:</span>
              <button
                onClick={() => onBulkUpdateStatus(selectedIds, 'reading')}
                className="px-2 py-0.5 bg-white border border-[#141414]/20 hover:border-[#1F3FB0]"
              >
                Reading
              </button>
              <button
                onClick={() => onBulkUpdateStatus(selectedIds, 'completed')}
                className="px-2 py-0.5 bg-white border border-[#141414]/20 hover:border-[#1F3FB0]"
              >
                Completed
              </button>
              <button
                onClick={() => onBulkUpdateStatus(selectedIds, 'to_read')}
                className="px-2 py-0.5 bg-white border border-[#141414]/20 hover:border-[#1F3FB0]"
              >
                To Read
              </button>
              <button
                onClick={() => {
                  onBulkDelete(selectedIds);
                  setSelectedIds([]);
                }}
                className="px-2 py-0.5 bg-rose-50 text-rose-700 border border-rose-300 hover:bg-rose-100 flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" />
                <span>Delete</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* VIEW 1: 3D SHELF VIEW */}
      {viewMode === 'shelf' && (
        <div className="p-4 bg-[#EDEBE6] border border-[#141414]/15 flex flex-col justify-center">
          <ShelfArchive
            items={filteredPapers}
            activeIndex={shelfActiveIndex}
            onSelectIndex={setShelfActiveIndex}
            onOpenDetail={onSelectPaper}
            onCursorChange={onCursorChange}
          />
          <ResearchCaption
            item={activeShelfItem}
            currentIndex={shelfActiveIndex}
            totalItems={filteredPapers.length}
            onPrev={() => setShelfActiveIndex((prev) => Math.max(0, prev - 1))}
            onNext={() => setShelfActiveIndex((prev) => Math.min(filteredPapers.length - 1, prev + 1))}
            onOpen={onSelectPaper}
            onReadPaper={onOpenReader}
          />
        </div>
      )}

      {/* VIEW 2: EDITORIAL GRID CARDS */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredPapers.map((paper) => (
            <div
              key={paper.id}
              className="p-5 bg-white border border-[#141414]/20 hover:border-[#1F3FB0] transition-all flex flex-col justify-between group shadow-2xs"
            >
              <div>
                <div className="flex items-center justify-between text-[10px] font-mono text-[#77736B]">
                  <div className="flex items-center gap-1.5">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(paper.id)}
                      onChange={() => handleToggleSelect(paper.id)}
                      className="cursor-pointer"
                    />
                    <span className="font-bold text-[#1F3FB0] uppercase">VOL. {paper.number}</span>
                  </div>
                  <span>{paper.year}</span>
                </div>

                <h3
                  onClick={() => onSelectPaper(paper)}
                  className="font-serif font-medium text-lg text-[#141414] group-hover:text-[#1F3FB0] mt-2 leading-snug cursor-pointer"
                >
                  {paper.title}
                </h3>
                <p className="text-xs font-mono text-[#77736B] mt-1 truncate">
                  {paper.authors.join(', ')}
                </p>

                {paper.journal && (
                  <p className="text-[11px] font-mono text-[#1F3FB0] mt-0.5 italic">
                    {paper.journal}
                  </p>
                )}

                <p className="text-xs font-sans text-[#141414]/75 mt-3 line-clamp-3 leading-relaxed">
                  {paper.abstract}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1 mt-3">
                  {paper.tags.slice(0, 3).map((tag, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] font-mono bg-[#EDEBE6] px-1.5 py-0.5 border border-[#141414]/10 text-[#77736B]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Card Footer */}
              <div className="pt-4 border-t border-[#141414]/10 mt-4 flex items-center justify-between text-xs font-mono">
                <span
                  className={`text-[10px] uppercase font-semibold ${
                    paper.readingStatus === 'completed'
                      ? 'text-[#536B52]'
                      : paper.readingStatus === 'reading'
                      ? 'text-amber-800'
                      : 'text-[#77736B]'
                  }`}
                >
                  {paper.readingStatus.replace('_', ' ')}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onOpenReader(paper)}
                    className="p-1 text-[#1F3FB0] hover:underline flex items-center gap-1 cursor-pointer"
                    title="Read in PDF Reader"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Read</span>
                  </button>
                  <button
                    onClick={() => onSelectPaper(paper)}
                    className="px-2 py-0.5 border border-[#141414]/20 hover:border-[#1F3FB0] hover:text-[#1F3FB0] cursor-pointer"
                  >
                    Examine
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* VIEW 3: DETAILED TABLE VIEW */}
      {viewMode === 'table' && (
        <div className="bg-white border border-[#141414]/20 overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead>
              <tr className="bg-[#EDEBE6] border-b border-[#141414]/15 text-[10px] uppercase text-[#77736B]">
                <th className="p-3 w-8">
                  <input
                    type="checkbox"
                    checked={selectedIds.length === filteredPapers.length && filteredPapers.length > 0}
                    onChange={handleSelectAll}
                    className="cursor-pointer"
                  />
                </th>
                <th className="p-3">Ref</th>
                <th className="p-3">Title & Authors</th>
                <th className="p-3">Category</th>
                <th className="p-3">Year</th>
                <th className="p-3">Status</th>
                <th className="p-3">Progress</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#141414]/10">
              {filteredPapers.map((paper) => (
                <tr key={paper.id} className="hover:bg-stone-50 transition-colors">
                  <td className="p-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(paper.id)}
                      onChange={() => handleToggleSelect(paper.id)}
                      className="cursor-pointer"
                    />
                  </td>
                  <td className="p-3 text-[#1F3FB0] font-bold">VOL. {paper.number}</td>
                  <td className="p-3 max-w-md">
                    <div
                      onClick={() => onSelectPaper(paper)}
                      className="font-serif font-medium text-sm text-[#141414] hover:text-[#1F3FB0] cursor-pointer line-clamp-1"
                    >
                      {paper.title}
                    </div>
                    <div className="text-[10px] text-[#77736B] truncate mt-0.5">
                      {paper.authors.join(', ')}
                    </div>
                  </td>
                  <td className="p-3 text-[#77736B]">{paper.category}</td>
                  <td className="p-3 text-[#141414]">{paper.year}</td>
                  <td className="p-3">
                    <span className="text-[10px] uppercase px-1.5 py-0.5 bg-[#EDEBE6] border border-[#141414]/10 font-semibold">
                      {paper.readingStatus.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-stone-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#1F3FB0]"
                          style={{ width: `${paper.readingProgress?.percent || 0}%` }}
                        />
                      </div>
                      <span className="text-[10px]">{paper.readingProgress?.percent || 0}%</span>
                    </div>
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onOpenReader(paper)}
                        className="px-2 py-0.5 text-[10px] border border-[#1F3FB0] text-[#1F3FB0] hover:bg-[#1F3FB0] hover:text-white transition-colors cursor-pointer"
                      >
                        Read
                      </button>
                      <button
                        onClick={() => onSelectPaper(paper)}
                        className="px-2 py-0.5 text-[10px] border border-[#141414]/20 hover:border-[#141414] transition-colors cursor-pointer"
                      >
                        Detail
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
