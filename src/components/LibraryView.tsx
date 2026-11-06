import React, { useState, useMemo } from 'react';
import {
  ResearchItem,
  ResearchCollection,
  ReadingStatus,
  CategoryDefinition,
} from '../types/research';
import {
  Search,
  Filter,
  SlidersHorizontal,
  BookOpen,
  Trash2,
  CheckSquare,
  Square,
  ArrowUpDown,
  ExternalLink,
} from 'lucide-react';
import { playPaperRustle, playTactileClick } from '../utils/sound';

interface LibraryViewProps {
  papers: ResearchItem[];
  collections: ResearchCollection[];
  categories: CategoryDefinition[];
  onSelectPaper: (paper: ResearchItem) => void;
  onOpenReader: (paper: ResearchItem) => void;
  onOpenImport?: () => void;
  onBulkUpdateStatus: (paperIds: string[], status: ReadingStatus) => void;
  onBulkDelete: (paperIds: string[]) => void;
  onCursorChange?: (state: any) => void;
  viewMode?: 'grid' | 'list' | 'table';
  onChangeViewMode?: (mode: 'grid' | 'list') => void;
  isNightMode?: boolean;
}

export const LibraryView: React.FC<LibraryViewProps> = ({
  papers,
  collections,
  categories,
  onSelectPaper,
  onOpenReader,
  onBulkUpdateStatus,
  onBulkDelete,
  viewMode = 'grid',
  isNightMode = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [collectionFilter, setCollectionFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'year_desc' | 'year_asc' | 'title' | 'progress'>('year_desc');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const isTable = viewMode === 'list' || viewMode === 'table';

  // Filter & Sort Papers
  const filteredPapers = useMemo(() => {
    return papers
      .filter((p) => {
        if (statusFilter !== 'all' && p.readingStatus !== statusFilter) return false;
        if (collectionFilter !== 'all' && !p.collectionIds.includes(collectionFilter)) return false;
        if (categoryFilter !== 'all' && p.category !== categoryFilter) return false;
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
    <div className="w-full max-w-7xl mx-auto p-4 md:p-8 space-y-5 animate-in fade-in duration-200">
      {/* Filter & Search Toolbar (Single unified controls, styled for Day / Night) */}
      <div
        className={`p-4 border transition-colors shadow-2xs ${
          isNightMode
            ? 'bg-[#181614] border-[#2E2822]'
            : 'bg-white border-[#141414]/15'
        }`}
      >
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search bar */}
          <div className="relative flex-1 w-full">
            <Search className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 ${isNightMode ? 'text-[#8C8275]' : 'text-[#77736B]'}`} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by title, author, keyword, or PRISMA tag..."
              className={`w-full pl-9 pr-3 py-1.5 text-xs font-mono border focus:outline-hidden transition-colors ${
                isNightMode
                  ? 'bg-[#221E19] border-[#38322A] text-[#EDE8DF] placeholder-[#77736B] focus:border-[#D4AF37]'
                  : 'bg-[#EDEBE6]/40 border-[#141414]/20 text-[#141414] focus:border-[#1F3FB0]'
              }`}
            />
          </div>

          {/* Filters & Sort */}
          <div className="flex items-center gap-2 w-full md:w-auto flex-wrap sm:flex-nowrap">
            {/* Status dropdown */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={`px-2.5 py-1.5 border text-xs font-mono cursor-pointer transition-colors ${
                isNightMode
                  ? 'bg-[#221E19] border-[#38322A] text-[#EDE8DF]'
                  : 'bg-white border-[#141414]/20 text-[#141414]'
              }`}
              title="Filter by Reading Status"
            >
              <option value="all">All Statuses</option>
              <option value="to_read">To Read</option>
              <option value="reading">Reading</option>
              <option value="completed">Completed</option>
            </select>

            {/* Collection dropdown */}
            <select
              value={collectionFilter}
              onChange={(e) => setCollectionFilter(e.target.value)}
              className={`px-2.5 py-1.5 border text-xs font-mono cursor-pointer transition-colors ${
                isNightMode
                  ? 'bg-[#221E19] border-[#38322A] text-[#EDE8DF]'
                  : 'bg-white border-[#141414]/20 text-[#141414]'
              }`}
              title="Filter by Collection"
            >
              <option value="all">All Collections</option>
              {collections.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            {/* Sort dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className={`px-2.5 py-1.5 border text-xs font-mono cursor-pointer transition-colors ${
                isNightMode
                  ? 'bg-[#221E19] border-[#38322A] text-[#EDE8DF]'
                  : 'bg-white border-[#141414]/20 text-[#141414]'
              }`}
              title="Sort Papers"
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
          <div
            className={`mt-3 p-2.5 border flex flex-wrap items-center justify-between gap-3 text-xs font-mono ${
              isNightMode
                ? 'bg-[#221E19] border-[#D4AF37]/35 text-[#EDE8DF]'
                : 'bg-[#EDEBE6] border-[#1F3FB0]/30 text-[#141414]'
            }`}
          >
            <div className={`flex items-center gap-2 font-semibold ${isNightMode ? 'text-[#D4AF37]' : 'text-[#1F3FB0]'}`}>
              <CheckSquare className="w-4 h-4" />
              <span>{selectedIds.length} volumes selected</span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <span className={isNightMode ? 'text-[#8C8275]' : 'text-[#77736B]'}>Mark as:</span>
              <button
                type="button"
                onClick={() => onBulkUpdateStatus(selectedIds, 'reading')}
                className={`px-2 py-0.5 border cursor-pointer ${
                  isNightMode
                    ? 'bg-[#181614] border-[#38322A] hover:border-[#D4AF37] text-[#EDE8DF]'
                    : 'bg-white border-[#141414]/20 hover:border-[#1F3FB0]'
                }`}
              >
                Reading
              </button>
              <button
                type="button"
                onClick={() => onBulkUpdateStatus(selectedIds, 'completed')}
                className={`px-2 py-0.5 border cursor-pointer ${
                  isNightMode
                    ? 'bg-[#181614] border-[#38322A] hover:border-[#D4AF37] text-[#EDE8DF]'
                    : 'bg-white border-[#141414]/20 hover:border-[#1F3FB0]'
                }`}
              >
                Completed
              </button>
              <button
                type="button"
                onClick={() => onBulkUpdateStatus(selectedIds, 'to_read')}
                className={`px-2 py-0.5 border cursor-pointer ${
                  isNightMode
                    ? 'bg-[#181614] border-[#38322A] hover:border-[#D4AF37] text-[#EDE8DF]'
                    : 'bg-white border-[#141414]/20 hover:border-[#1F3FB0]'
                }`}
              >
                To Read
              </button>
              <button
                type="button"
                onClick={() => {
                  onBulkDelete(selectedIds);
                  setSelectedIds([]);
                }}
                className="px-2 py-0.5 bg-rose-950/40 text-rose-300 border border-rose-800/40 hover:bg-rose-900/50 flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3 h-3" />
                <span>Delete</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* VIEW 1: EDITORIAL GRID CARDS */}
      {!isTable && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredPapers.map((paper) => (
            <div
              key={paper.id}
              className={`p-5 border transition-all flex flex-col justify-between group shadow-2xs ${
                isNightMode
                  ? 'bg-[#181614] border-[#2E2822] hover:border-[#D4AF37]/60'
                  : 'bg-white border-[#141414]/20 hover:border-[#1F3FB0]'
              }`}
            >
              <div>
                <div className={`flex items-center justify-between text-[10px] font-mono ${isNightMode ? 'text-[#8C8275]' : 'text-[#77736B]'}`}>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(paper.id)}
                      onChange={() => handleToggleSelect(paper.id)}
                      className="cursor-pointer accent-[#D4AF37]"
                    />
                    <span className={`font-bold uppercase ${isNightMode ? 'text-[#D4AF37]' : 'text-[#1F3FB0]'}`}>
                      VOL. {paper.number}
                    </span>
                  </div>
                  <span>{paper.year}</span>
                </div>

                <h3
                  onClick={() => onSelectPaper(paper)}
                  className={`font-serif font-medium text-lg mt-2 leading-snug cursor-pointer transition-colors ${
                    isNightMode
                      ? 'text-[#EDE8DF] group-hover:text-[#D4AF37]'
                      : 'text-[#141414] group-hover:text-[#1F3FB0]'
                  }`}
                >
                  {paper.title}
                </h3>
                <p className={`text-xs font-mono mt-1 truncate ${isNightMode ? 'text-[#9E9689]' : 'text-[#77736B]'}`}>
                  {paper.authors.join(', ')}
                </p>

                {paper.journal && (
                  <p className={`text-[11px] font-mono mt-0.5 italic ${isNightMode ? 'text-[#D4AF37]/90' : 'text-[#1F3FB0]'}`}>
                    {paper.journal}
                  </p>
                )}

                <p className={`text-xs font-sans mt-3 line-clamp-3 leading-relaxed ${isNightMode ? 'text-[#C0B7A8]' : 'text-[#141414]/75'}`}>
                  {paper.abstract}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1 mt-3">
                  {paper.tags.slice(0, 3).map((tag, idx) => (
                    <span
                      key={idx}
                      className={`text-[10px] font-mono px-1.5 py-0.5 border ${
                        isNightMode
                          ? 'bg-[#221E19] border-[#38322A] text-[#9E9689]'
                          : 'bg-[#EDEBE6] border-[#141414]/10 text-[#77736B]'
                      }`}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Card Footer */}
              <div className={`pt-4 border-t mt-4 flex items-center justify-between text-xs font-mono ${isNightMode ? 'border-[#2E2822]' : 'border-[#141414]/10'}`}>
                <span
                  className={`text-[10px] uppercase font-semibold ${
                    paper.readingStatus === 'completed'
                      ? isNightMode ? 'text-emerald-400' : 'text-[#536B52]'
                      : paper.readingStatus === 'reading'
                      ? isNightMode ? 'text-amber-400' : 'text-amber-800'
                      : isNightMode ? 'text-[#8C8275]' : 'text-[#77736B]'
                  }`}
                >
                  {paper.readingStatus.replace('_', ' ')}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onOpenReader(paper)}
                    className={`p-1 flex items-center gap-1 cursor-pointer transition-colors ${
                      isNightMode
                        ? 'text-[#D4AF37] hover:underline'
                        : 'text-[#1F3FB0] hover:underline'
                    }`}
                    title="Read in PDF Reader"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Read</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onSelectPaper(paper)}
                    className={`px-2 py-0.5 border transition-colors cursor-pointer ${
                      isNightMode
                        ? 'border-[#38322A] bg-[#221E19] text-[#EDE8DF] hover:border-[#D4AF37] hover:text-[#D4AF37]'
                        : 'border-[#141414]/20 bg-white hover:border-[#1F3FB0] hover:text-[#1F3FB0]'
                    }`}
                  >
                    Examine
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* VIEW 2: DETAILED TABLE VIEW */}
      {isTable && (
        <div className={`border overflow-x-auto shadow-2xs ${isNightMode ? 'bg-[#181614] border-[#2E2822]' : 'bg-white border-[#141414]/20'}`}>
          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead>
              <tr className={`border-b text-[10px] uppercase ${
                isNightMode
                  ? 'bg-[#221E19] border-[#2E2822] text-[#8C8275]'
                  : 'bg-[#EDEBE6] border-[#141414]/15 text-[#77736B]'
              }`}>
                <th className="p-3 w-8">
                  <input
                    type="checkbox"
                    checked={selectedIds.length === filteredPapers.length && filteredPapers.length > 0}
                    onChange={handleSelectAll}
                    className="cursor-pointer accent-[#D4AF37]"
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
            <tbody className={`divide-y ${isNightMode ? 'divide-[#2E2822]' : 'divide-[#141414]/10'}`}>
              {filteredPapers.map((paper) => (
                <tr
                  key={paper.id}
                  className={`transition-colors ${
                    isNightMode
                      ? 'hover:bg-[#221E19]'
                      : 'hover:bg-stone-50'
                  }`}
                >
                  <td className="p-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(paper.id)}
                      onChange={() => handleToggleSelect(paper.id)}
                      className="cursor-pointer accent-[#D4AF37]"
                    />
                  </td>
                  <td className={`p-3 font-bold ${isNightMode ? 'text-[#D4AF37]' : 'text-[#1F3FB0]'}`}>
                    VOL. {paper.number}
                  </td>
                  <td className="p-3 max-w-md">
                    <div
                      onClick={() => onSelectPaper(paper)}
                      className={`font-serif font-medium text-sm cursor-pointer line-clamp-1 transition-colors ${
                        isNightMode
                          ? 'text-[#EDE8DF] hover:text-[#D4AF37]'
                          : 'text-[#141414] hover:text-[#1F3FB0]'
                      }`}
                    >
                      {paper.title}
                    </div>
                    <div className={`text-[10px] truncate mt-0.5 ${isNightMode ? 'text-[#8C8275]' : 'text-[#77736B]'}`}>
                      {paper.authors.join(', ')}
                    </div>
                  </td>
                  <td className={`p-3 ${isNightMode ? 'text-[#9E9689]' : 'text-[#77736B]'}`}>{paper.category}</td>
                  <td className={`p-3 ${isNightMode ? 'text-[#EDE8DF]' : 'text-[#141414]'}`}>{paper.year}</td>
                  <td className="p-3">
                    <span className={`text-[10px] uppercase px-1.5 py-0.5 border font-semibold ${
                      isNightMode
                        ? 'bg-[#221E19] border-[#38322A] text-[#C0B7A8]'
                        : 'bg-[#EDEBE6] border-[#141414]/10 text-[#5A5248]'
                    }`}>
                      {paper.readingStatus.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-16 h-1.5 rounded-full overflow-hidden ${isNightMode ? 'bg-[#2E2822]' : 'bg-stone-200'}`}>
                        <div
                          className={`h-full ${isNightMode ? 'bg-[#D4AF37]' : 'bg-[#1F3FB0]'}`}
                          style={{ width: `${paper.readingProgress?.percent || 0}%` }}
                        />
                      </div>
                      <span className={`text-[10px] ${isNightMode ? 'text-[#9E9689]' : 'text-[#77736B]'}`}>
                        {paper.readingProgress?.percent || 0}%
                      </span>
                    </div>
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => onOpenReader(paper)}
                        className={`px-2 py-0.5 text-[10px] border transition-colors cursor-pointer ${
                          isNightMode
                            ? 'border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#121110] font-semibold'
                            : 'border-[#1F3FB0] text-[#1F3FB0] hover:bg-[#1F3FB0] hover:text-white'
                        }`}
                      >
                        Read
                      </button>
                      <button
                        type="button"
                        onClick={() => onSelectPaper(paper)}
                        className={`px-2 py-0.5 text-[10px] border transition-colors cursor-pointer ${
                          isNightMode
                            ? 'border-[#38322A] text-[#EDE8DF] hover:border-[#D4AF37]'
                            : 'border-[#141414]/20 text-[#141414] hover:border-[#141414]'
                        }`}
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
