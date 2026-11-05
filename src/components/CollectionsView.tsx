import React, { useState, useMemo } from 'react';
import {
  FolderKanban,
  FolderPlus,
  Tag,
  BookOpen,
  Filter,
  Check,
  Trash2,
  Edit2,
  Plus,
  Sparkles,
  Layers,
  FileText,
  Clock,
  Star,
  ExternalLink,
} from 'lucide-react';
import { ResearchItem, ResearchCollection, ReadingStatus, ShelfSortMode } from '../types/research';
import { playTactileClick, playPaperRustle } from '../utils/sound';

interface CollectionsViewProps {
  papers: ResearchItem[];
  collections: ResearchCollection[];
  initialSelectedCollectionId?: string;
  onSelectedCollectionChange?: (collectionId: string) => void;
  onUpdateCollections: (collections: ResearchCollection[]) => void;
  onUpdatePapers: (papers: ResearchItem[]) => void;
  onTogglePaperRead: (paper: ResearchItem) => void;
  onOpenPaperInReader: (paper: ResearchItem, readingQueue?: ResearchItem[], scopeName?: string) => void;
  onOpenPaperDetail: (paper: ResearchItem) => void;
  onAddPapersToCollection: (collectionId: string) => void;
}

export const CollectionsView: React.FC<CollectionsViewProps> = ({
  papers,
  collections,
  initialSelectedCollectionId = 'all',
  onSelectedCollectionChange,
  onUpdateCollections,
  onUpdatePapers,
  onTogglePaperRead,
  onOpenPaperInReader,
  onOpenPaperDetail,
  onAddPapersToCollection,
}) => {
  const [selectedCollectionId, setSelectedCollectionId] = useState<string>(initialSelectedCollectionId);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [isCreatingCollection, setIsCreatingCollection] = useState(false);
  const [newColName, setNewColName] = useState('');
  const [newColDesc, setNewColDesc] = useState('');
  const [newColColor, setNewColColor] = useState('#1F3FB0');
  const [editingCollection, setEditingCollection] = useState<ResearchCollection | null>(null);
  const [newColKind, setNewColKind] = useState<'area' | 'book'>('book');
  const [newParentAreaId, setNewParentAreaId] = useState('');
  const [allSortMode, setAllSortMode] = useState<ShelfSortMode>(() => {
    try { return (localStorage.getItem('marginalia-library-paper-sort') as ShelfSortMode) || 'custom'; } catch { return 'custom'; }
  });

  const selectCollection = (collectionId: string) => {
    setSelectedCollectionId(collectionId);
    onSelectedCollectionChange?.(collectionId);
    setSelectedTag(null);
  };

  const areaNodes = collections.filter((collection) => collection.kind === 'area');
  const bookNodes = collections.filter((collection) => collection.kind !== 'area' && !collection.isSmart);
  const primaryBookId = (paper: ResearchItem) => paper.collectionIds?.find((id) => bookNodes.some((book) => book.id === id));

  // Smart collection presets
  const SMART_PRESETS = [
    {
      id: 'smart-reading',
      name: 'Currently Reading',
      icon: BookOpen,
      filter: (p: ResearchItem) => p.readingStatus === 'reading',
      badgeColor: '#1F3FB0',
    },
    {
      id: 'smart-priority',
      name: 'High Priority (★ 4-5)',
      icon: Star,
      filter: (p: ResearchItem) => (p.importance && p.importance >= 4) || p.priority === 'high',
      badgeColor: '#D97706',
    },
    {
      id: 'smart-unread',
      name: 'Unread / Inbox Queue',
      icon: Clock,
      filter: (p: ResearchItem) => p.readingStatus === 'inbox' || p.readingStatus === 'to_read',
      badgeColor: '#78716C',
    },
    {
      id: 'smart-pdf',
      name: 'Has Full Text / PDF',
      icon: FileText,
      filter: (p: ResearchItem) => Boolean(p.extractedText || p.storagePath),
      badgeColor: '#2E7D32',
    },
  ];

  // Extract all tags across papers
  const tagCounts = useMemo(() => {
    const map: Record<string, number> = {};
    papers.forEach((p) => {
      (p.tags || []).forEach((t) => {
        map[t] = (map[t] || 0) + 1;
      });
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [papers]);

  // Filter papers based on active selection
  const filteredPapers = useMemo(() => {
    let result = papers;

    // Filter by tag if selected
    if (selectedTag) {
      return result.filter((p) => p.tags && p.tags.includes(selectedTag));
    }

    if (selectedCollectionId === 'all') {
      return result;
    }

    if (selectedCollectionId.startsWith('area:')) {
      const areaId = selectedCollectionId.slice('area:'.length);
      const bookIds = bookNodes.filter((book) => book.parentId === areaId).map((book) => book.id);
      return result.filter((paper) => bookIds.includes(primaryBookId(paper) || ''));
    }

    // Check if it's a smart preset
    const smart = SMART_PRESETS.find((s) => s.id === selectedCollectionId);
    if (smart) {
      return result.filter(smart.filter);
    }

    // Custom user collection
    return result.filter(
      (p) => primaryBookId(p) === selectedCollectionId
    );
  }, [papers, collections, selectedCollectionId, selectedTag]);

  // Active collection metadata
  const activeCollection = collections.find((c) => c.id === selectedCollectionId);
  const activeArea = collections.find((c) => c.kind === 'area' && selectedCollectionId === `area:${c.id}`);
  const activeSmart = SMART_PRESETS.find((s) => s.id === selectedCollectionId);

  const sortMode = activeCollection?.appearance?.sortingMode || allSortMode;
  const orderedPapers = useMemo(() => {
    const items = [...filteredPapers];
    const textOrder = (a: string, b: string) => a.localeCompare(b, undefined, { sensitivity: 'base' });
    switch (sortMode) {
      case 'recent': return items.sort((a, b) => (b.uploadedAt || '').localeCompare(a.uploadedAt || ''));
      case 'year': return items.sort((a, b) => (Number(b.year) || 0) - (Number(a.year) || 0));
      case 'title': return items.sort((a, b) => textOrder(a.title, b.title));
      case 'author': return items.sort((a, b) => textOrder(a.authors?.[0] || '', b.authors?.[0] || ''));
      case 'status': return items.sort((a, b) => textOrder(a.readingStatus || 'inbox', b.readingStatus || 'inbox'));
      default: return items;
    }
  }, [filteredPapers, sortMode]);

  const handleSortChange = (sortingMode: NonNullable<ResearchCollection['appearance']>['sortingMode']) => {
    if (!sortingMode) return;
    if (!activeCollection || activeCollection.isSmart) {
      setAllSortMode(sortingMode);
      try { localStorage.setItem('marginalia-library-paper-sort', sortingMode); } catch {}
      if (selectedCollectionId === 'all' && !selectedTag) {
        const arranged = [...papers];
        const textOrder = (a: string, b: string) => a.localeCompare(b, undefined, { sensitivity: 'base' });
        if (sortingMode === 'recent') arranged.sort((a, b) => (b.uploadedAt || '').localeCompare(a.uploadedAt || ''));
        else if (sortingMode === 'year') arranged.sort((a, b) => (Number(b.year) || 0) - (Number(a.year) || 0));
        else if (sortingMode === 'title') arranged.sort((a, b) => textOrder(a.title, b.title));
        else if (sortingMode === 'author') arranged.sort((a, b) => textOrder(a.authors?.[0] || '', b.authors?.[0] || ''));
        else if (sortingMode === 'status') arranged.sort((a, b) => textOrder(a.readingStatus || 'inbox', b.readingStatus || 'inbox'));
        onUpdatePapers(arranged);
      }
      return;
    }
    onUpdateCollections(collections.map((collection) => collection.id === activeCollection.id
      ? { ...collection, appearance: { spineColor: collection.color || '#1F3FB0', coverStyle: 'editorial', material: 'aged_paper', bookSize: 'standard', ...collection.appearance, sortingMode } }
      : collection));
  };

  // Add / Save Collection
  const handleSaveCollection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newColName.trim()) return;

    playTactileClick();
    if (editingCollection) {
      const updated = collections.map((c) =>
        c.id === editingCollection.id
          ? {
              ...c,
              name: newColName,
              description: newColDesc,
              color: newColColor,
              ...(c.kind !== 'area' ? { parentId: newParentAreaId || undefined } : {}),
            }
          : c
      );
      onUpdateCollections(updated);
      setEditingCollection(null);
    } else {
      const newCol: ResearchCollection = {
        id: 'col-' + Date.now(),
        name: newColName,
        description: newColDesc,
        color: newColColor,
        kind: newColKind,
        ...(newColKind === 'book' && newParentAreaId ? { parentId: newParentAreaId } : {}),
      };
      onUpdateCollections([...collections, newCol]);
      selectCollection(newCol.kind === 'area' ? `area:${newCol.id}` : newCol.id);
    }

    setIsCreatingCollection(false);
    setNewColName('');
    setNewColDesc('');
    setNewColKind('book');
    setNewParentAreaId('');
  };

  const handleDeleteCollection = (id: string) => {
    const target = collections.find((collection) => collection.id === id);
    if (!target) return;
    const message = target.kind === 'area'
      ? 'Delete this research area? Its books and papers will stay in My Research.'
      : 'Remove this book? Its papers will stay in your library.';
    if (confirm(message)) {
      playTactileClick();
      const nextCollections = target.kind === 'area'
        ? collections.filter((collection) => collection.id !== id).map((collection) => collection.parentId === id ? { ...collection, parentId: undefined } : collection)
        : collections.filter((collection) => collection.id !== id);
      onUpdateCollections(nextCollections);
      if (selectedCollectionId === id || selectedCollectionId === `area:${id}`) selectCollection('all');
      if (target.kind !== 'area') onUpdatePapers(papers.map((paper) => paper.collectionIds?.includes(id)
        ? { ...paper, collectionIds: paper.collectionIds.filter((collectionId) => collectionId !== id) }
        : paper));
    }
  };

  const handleTogglePaperInCollection = (paper: ResearchItem, colId: string) => {
    playTactileClick();
    const currentCols = paper.collectionIds || [];
    const newCols = currentCols.includes(colId)
      ? currentCols.filter((id) => id !== colId)
      : [colId];

    const updated = papers.map((p) => (p.id === paper.id ? { ...p, collectionIds: newCols } : p));
    onUpdatePapers(updated);
  };

  const handleMovePaperToCollection = (paper: ResearchItem, targetId: string) => {
    if (!targetId) return;
    const nextIds = [targetId];
    onUpdatePapers(papers.map((item) => item.id === paper.id ? { ...item, collectionIds: nextIds } : item));
    selectCollection(targetId);
  };

  const scopeName = selectedTag
    ? `#${selectedTag}`
    : activeCollection?.name || activeArea?.name || activeSmart?.name || 'All Publications';

  const renderBookRow = (book: ResearchCollection, nested = false) => {
    const count = papers.filter((paper) => primaryBookId(paper) === book.id).length;
    const isActive = selectedCollectionId === book.id && !selectedTag;
    return (
      <div key={book.id} className={`flex items-center justify-between border transition-colors cursor-pointer group ${nested ? 'ml-4 pl-3' : 'px-3'} ${isActive ? 'bg-white border-[#1F3FB0] text-[#1F3FB0] font-semibold' : 'border-transparent text-[#141414]/80 hover:bg-white/60'}`} onClick={() => selectCollection(book.id)}>
        <div className="flex min-w-0 items-center gap-2 py-2">
          <BookOpen className="h-3.5 w-3.5 shrink-0 text-[#1F3FB0]/70" />
          <span className="truncate text-xs">{book.name}</span>
        </div>
        <div className="flex items-center gap-2 pl-2">
          <span className="font-mono text-[10px] text-[#141414]/50">{count}</span>
          <select aria-label={`Research area for ${book.name}`} title="Move book to another research area" value={book.parentId || '__root__'} onClick={(event) => event.stopPropagation()} onChange={(event) => onUpdateCollections(collections.map((item) => item.id === book.id ? { ...item, parentId: event.target.value === '__root__' ? undefined : event.target.value } : item))} className="max-w-28 border border-[#141414]/15 bg-white px-1 py-1 text-[9px] text-[#5A534A]">
            <option value="__root__">My Research</option>{areaNodes.map((area) => <option key={area.id} value={area.id}>{area.name}</option>)}
          </select>
          <button type="button" aria-label={`Rename book ${book.name}`} onClick={(event) => { event.stopPropagation(); setEditingCollection(book); setNewColName(book.name); setNewColDesc(book.description || ''); setNewColColor(book.color || '#1F3FB0'); setNewColKind('book'); setNewParentAreaId(book.parentId || ''); setIsCreatingCollection(true); }} className="opacity-0 group-hover:opacity-100 p-0.5 text-[#141414]/40 transition-opacity hover:text-[#1F3FB0]"><Edit2 className="h-3 w-3" /></button>
          <button type="button" aria-label={`Delete book ${book.name}`} onClick={(event) => { event.stopPropagation(); handleDeleteCollection(book.id); }} className="opacity-0 group-hover:opacity-100 p-0.5 text-[#141414]/40 transition-opacity hover:text-red-600"><Trash2 className="h-3 w-3" /></button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#EDEBE6] text-[#141414] pb-24">
      {/* Header bar */}
      <div className="border-b border-[#141414]/10 bg-[#EDEBE6]/90 backdrop-blur-md sticky top-0 z-20 px-8 py-5">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-xs uppercase tracking-widest text-[#1F3FB0] font-medium flex items-center gap-1.5">
                <FolderKanban className="w-3.5 h-3.5" />
                INTELLECTUAL TAXONOMY
              </span>
              <span className="text-[#141414]/30 text-xs">/</span>
              <span className="font-mono text-xs uppercase tracking-wider text-[#141414]/50">
                COLLECTIONS & TAGS
              </span>
            </div>
            <h1 className="font-serif text-3xl font-light tracking-tight text-[#141414]">
              Research Collections
            </h1>
          </div>

          <div className="flex gap-2">
            <button type="button" onClick={() => { setIsCreatingCollection(true); setEditingCollection(null); setNewColKind('area'); setNewParentAreaId(''); setNewColName(''); setNewColDesc(''); }} className="border border-[#141414]/20 bg-white px-3 py-2 text-xs font-mono uppercase tracking-wider hover:border-[#1F3FB0] hover:text-[#1F3FB0]">
              <FolderPlus className="mr-1.5 inline h-3.5 w-3.5" />New area
            </button>
            <button type="button" onClick={() => { setIsCreatingCollection(true); setEditingCollection(null); setNewColKind('book'); setNewParentAreaId(activeArea?.id || activeCollection?.parentId || ''); setNewColName(''); setNewColDesc(''); }} className="bg-[#141414] px-3 py-2 text-xs font-mono uppercase tracking-wider text-white hover:bg-[#1F3FB0]">
              <BookOpen className="mr-1.5 inline h-3.5 w-3.5" />New book
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-8 pt-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Collection List & Tag Cloud */}
        <div className="lg:col-span-4 space-y-6">
          {/* Smart Collections */}
          <div className="bg-[#E7E4DC] border border-[#141414]/15 p-5">
            <span className="font-mono text-xs uppercase tracking-widest text-[#141414]/60 block mb-3">
              Smart Folders
            </span>
            <div className="space-y-1">
              <button
                onClick={() => {
                  playTactileClick();
                  selectCollection('all');
                }}
                className={`w-full text-left px-3 py-2 text-xs font-sans transition-colors flex items-center justify-between cursor-pointer border ${
                  selectedCollectionId === 'all' && !selectedTag
                    ? 'bg-white border-[#1F3FB0] font-semibold text-[#1F3FB0]'
                    : 'border-transparent text-[#141414]/80 hover:bg-white/60'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Layers className="w-3.5 h-3.5 text-[#141414]/60" />
                  <span>All Publications</span>
                </div>
                <span className="font-mono text-[10px] text-[#141414]/50">{papers.length}</span>
              </button>

              {SMART_PRESETS.map((s) => {
                const Icon = s.icon;
                const count = papers.filter(s.filter).length;
                const isActive = selectedCollectionId === s.id && !selectedTag;
                return (
                  <button
                    key={s.id}
                    onClick={() => {
                      playTactileClick();
                      selectCollection(s.id);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs font-sans transition-colors flex items-center justify-between cursor-pointer border ${
                      isActive
                        ? 'bg-white border-[#1F3FB0] font-semibold text-[#1F3FB0]'
                        : 'border-transparent text-[#141414]/80 hover:bg-white/60'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="w-3.5 h-3.5 text-[#141414]/60" />
                      <span>{s.name}</span>
                    </div>
                    <span className="font-mono text-[10px] text-[#141414]/50">{count}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* User Custom Collections */}
          <div className="bg-[#E7E4DC] border border-[#141414]/15 p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="font-mono text-xs uppercase tracking-widest text-[#141414]/60">
                Research areas & books
              </span>
            </div>

            <div className="space-y-1">
              {areaNodes.map((area) => {
                const areaBooks = bookNodes.filter((book) => book.parentId === area.id);
                const bookIds = areaBooks.map((book) => book.id);
                const count = papers.filter((paper) => bookIds.includes(primaryBookId(paper) || '')).length;
                const isActive = selectedCollectionId === `area:${area.id}` && !selectedTag;
                return <div key={area.id} className="space-y-0.5">
                  <div className={`group flex items-center justify-between border px-3 py-2 ${isActive ? 'border-[#1F3FB0] bg-white font-semibold text-[#1F3FB0]' : 'border-transparent text-[#141414]/80 hover:bg-white/60'}`}>
                    <button type="button" onClick={() => selectCollection(`area:${area.id}`)} className="flex min-w-0 flex-1 items-center gap-2 text-left">
                      <FolderKanban className="h-3.5 w-3.5 shrink-0" /><span className="truncate text-xs">{area.name}</span>
                    </button>
                    <span className="px-2 font-mono text-[10px] text-[#141414]/50">{count}</span>
                    <button type="button" aria-label={`Add book to ${area.name}`} onClick={() => { setIsCreatingCollection(true); setEditingCollection(null); setNewColKind('book'); setNewParentAreaId(area.id); setNewColName(''); setNewColDesc(''); }} className="px-1 font-mono text-[10px] text-[#1F3FB0]">+ Book</button>
                    <button type="button" aria-label={`Rename area ${area.name}`} onClick={() => { setEditingCollection(area); setNewColName(area.name); setNewColDesc(area.description || ''); setNewColColor(area.color || '#1F3FB0'); setNewColKind('area'); setNewParentAreaId(''); setIsCreatingCollection(true); }} className="p-0.5 text-[#141414]/40 hover:text-[#1F3FB0]"><Edit2 className="h-3 w-3" /></button>
                    <button type="button" aria-label={`Delete area ${area.name}`} onClick={() => handleDeleteCollection(area.id)} className="ml-1 p-0.5 text-[#141414]/40 hover:text-red-600"><Trash2 className="h-3 w-3" /></button>
                  </div>
                  {areaBooks.map((book) => renderBookRow(book, true))}
                </div>;
              })}
              {bookNodes.some((book) => !book.parentId) && <div className="mt-3 space-y-1 border-t border-[#141414]/10 pt-3">
                <div className="px-3 pb-1 font-mono text-[9px] uppercase tracking-wider text-[#77736B]">My Research · ungrouped books</div>
                {bookNodes.filter((book) => !book.parentId).map((book) => renderBookRow(book))}
              </div>}
              {bookNodes.length === 0 && areaNodes.length === 0 && (
                <div className="text-center py-4 text-xs font-sans text-[#141414]/50">
                  Create a research area, then add named books to it.
                </div>
              )}
            </div>
          </div>

          {/* Tags Cloud */}
          <div className="bg-[#E7E4DC] border border-[#141414]/15 p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="font-mono text-xs uppercase tracking-widest text-[#141414]/60 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5" />
                Keywords & Tags
              </span>
              {selectedTag && (
                <button
                  onClick={() => setSelectedTag(null)}
                  className="font-mono text-[10px] text-[#1F3FB0] hover:underline"
                >
                  Clear tag
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-1.5">
              {tagCounts.map(([tag, count]) => {
                const isSelected = selectedTag === tag;
                return (
                  <button
                    key={tag}
                    onClick={() => {
                      playTactileClick();
                      setSelectedTag(isSelected ? null : tag);
                    }}
                    className={`px-2.5 py-1 text-xs border transition-colors flex items-center gap-1.5 cursor-pointer ${
                      isSelected
                        ? 'border-[#1F3FB0] bg-[#1F3FB0] text-white'
                        : 'border-[#141414]/15 bg-white text-[#141414]/80 hover:border-[#141414]'
                    }`}
                  >
                    <span>{tag}</span>
                    <span
                      className={`font-mono text-[10px] ${
                        isSelected ? 'text-white/80' : 'text-[#141414]/40'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Papers within Collection */}
        <div className="lg:col-span-8 space-y-6">
          {/* Collection Title Banner */}
          <div className="bg-white border border-[#141414]/15 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs uppercase tracking-widest text-[#1F3FB0]">
                  {selectedTag
                    ? `TAGGED: #${selectedTag}`
                    : activeSmart
                    ? `SMART FILTER • ${activeSmart.name}`
                    : activeArea
                    ? 'RESEARCH AREA'
                    : activeCollection
                    ? 'BOOK'
                    : 'ENTIRE LIBRARY'}
                </span>
              </div>
              <span className="font-mono text-xs text-[#141414]/50">
                {filteredPapers.length} {filteredPapers.length === 1 ? 'item' : 'items'}
              </span>
            </div>

            <h2 className="font-serif text-2xl font-light text-[#141414]">
              {selectedTag
                ? `Articles matching #${selectedTag}`
                : activeSmart
                ? activeSmart.name
                : activeArea
                ? activeArea.name
                : activeCollection
                ? activeCollection.name
                : 'All Publications'}
            </h2>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              {(!activeCollection || !activeCollection.isSmart) && (
                <label className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-wide text-[#5A534A]">
                  Arrange
                  <select aria-label="Arrange papers" value={sortMode} onChange={(event) => handleSortChange(event.target.value as NonNullable<ResearchCollection['appearance']>['sortingMode'])} className="border border-[#141414]/20 bg-white px-2 py-2 text-[10px] text-[#141414]">
                    <option value="custom">Added order</option><option value="recent">Recently updated</option><option value="year">Year</option><option value="title">Title</option><option value="author">Author</option><option value="status">Reading status</option>
                  </select>
                </label>
              )}
              {activeCollection && !activeCollection.isSmart && (
                <button
                  type="button"
                  onClick={() => onAddPapersToCollection(activeCollection.id)}
                  className="inline-flex items-center gap-2 border border-[#141414]/20 bg-[#EDEBE6] px-3 py-2 font-mono text-[10px] uppercase tracking-wide hover:border-[#1F3FB0] hover:text-[#1F3FB0]"
                >
                  <Plus className="h-3.5 w-3.5" /> Add papers to {activeCollection.name}
                </button>
              )}
              {filteredPapers.length > 0 && (
                <button
                  type="button"
              onClick={() => onOpenPaperInReader(orderedPapers[0], orderedPapers, scopeName)}
                  className="inline-flex items-center gap-2 bg-[#1F3FB0] px-3 py-2 font-mono text-[10px] uppercase tracking-wide text-white hover:bg-[#19328D]"
                >
                  <BookOpen className="h-3.5 w-3.5" /> Read {activeCollection || activeArea || activeSmart ? 'this book / area' : 'these papers'}
                </button>
              )}
            </div>

            {activeCollection?.description && (
              <p className="font-sans text-xs text-[#141414]/60 mt-1 leading-relaxed">
                {activeCollection.description}
              </p>
            )}
          </div>

          {/* Paper List */}
          <div className="space-y-3">
            {orderedPapers.map((paper) => {
              return (
                <div
                  key={paper.id}
                  className="bg-white border border-[#141414]/15 p-5 hover:border-[#1F3FB0] transition-all flex flex-col md:flex-row md:items-start justify-between gap-4 group"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 font-mono text-[11px] text-[#141414]/50 mb-1">
                      <span>{paper.year}</span>
                      <span>•</span>
                      <span className="text-[#1F3FB0] uppercase">{paper.category}</span>
                      <span>•</span>
                      <span className="capitalize">{paper.readingStatus || 'inbox'}</span>
                    </div>
                    <div className="mt-2 mb-3 h-1.5 w-full max-w-md overflow-hidden bg-[#141414]/10" aria-label={`Reading progress ${paper.readingStatus === 'completed' ? 100 : paper.readingProgress?.percent || 0}%`}>
                      <div className="h-full bg-[#1F3FB0] transition-all" style={{ width: `${paper.readingStatus === 'completed' ? 100 : paper.readingProgress?.percent || 0}%` }} />
                    </div>

                    <h3 className="font-serif text-lg font-light text-[#141414] group-hover:text-[#1F3FB0] transition-colors leading-snug">
                      {paper.title}
                    </h3>

                    {paper.authors && (
                      <div className="font-sans text-xs text-[#141414]/60 mt-1">
                        {paper.authors}
                      </div>
                    )}

                    {/* Tags row */}
                    {paper.tags && paper.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2.5">
                        {paper.tags.map((t) => (
                          <span
                            key={t}
                            onClick={() => setSelectedTag(t)}
                            className="font-mono text-[10px] text-[#141414]/60 bg-[#141414]/5 hover:bg-[#1F3FB0]/10 hover:text-[#1F3FB0] px-1.5 py-0.5 border border-[#141414]/10 cursor-pointer"
                          >
                            #{t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions & Collection Assignment */}
                  <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center gap-2 flex-shrink-0">
                    <div className="flex items-center gap-2">
                      <button type="button" onClick={() => onTogglePaperRead(paper)} aria-pressed={paper.readingStatus === 'completed'} className={`border px-2.5 py-1.5 text-xs font-mono transition-colors ${paper.readingStatus === 'completed' ? 'border-emerald-700 bg-emerald-50 text-emerald-800' : 'border-[#141414]/20 bg-white text-[#141414] hover:border-emerald-700 hover:text-emerald-800'}`}>
                        {paper.readingStatus === 'completed' ? '✓ Read' : 'Mark read'}
                      </button>
                      <button
                        onClick={() => onOpenPaperInReader(paper, orderedPapers, scopeName)}
                        className="bg-[#141414] text-white hover:bg-[#1F3FB0] transition-colors px-3 py-1.5 text-xs font-mono uppercase flex items-center gap-1 cursor-pointer"
                      >
                        <BookOpen className="w-3 h-3" />
                        <span>Read</span>
                      </button>
                      <button
                        onClick={() => onOpenPaperDetail(paper)}
                        className="bg-white border border-[#141414]/20 hover:border-[#1F3FB0] text-[#141414] transition-colors px-2.5 py-1.5 text-xs font-mono flex items-center gap-1 cursor-pointer"
                        title="Open Details Sheet"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Quick Add/Remove from active collection */}
                    {activeCollection && (
                      <button
                        onClick={() => handleTogglePaperInCollection(paper, activeCollection.id)}
                        className="text-[10px] font-mono text-red-600 hover:underline cursor-pointer"
                      >
                        Remove from collection
                      </button>
                    )}

                    {collections.some((collection) => !collection.isSmart && collection.kind !== 'area' && collection.id !== activeCollection?.id) && (
                      <label className="flex items-center gap-2 font-mono text-[10px] text-[#5A534A]">
                        <span className="sr-only">{activeCollection ? 'Move' : 'Add'} {paper.title} {activeCollection ? 'to another folder' : 'to a folder'}</span>
                        <select
                          aria-label={`${activeCollection ? 'Move' : 'Add'} ${paper.title} ${activeCollection ? 'to another folder' : 'to a folder'}`}
                          value=""
                          onChange={(event) => handleMovePaperToCollection(paper, event.target.value)}
                          className="max-w-40 border border-[#141414]/20 bg-[#F4F2ED] px-2 py-1 text-[10px] text-[#141414]"
                        >
                          <option value="">{activeCollection ? 'Move to folder…' : 'Add to folder…'}</option>
                          {collections.filter((collection) => !collection.isSmart && collection.kind !== 'area' && collection.id !== activeCollection?.id).map((collection) => (
                            <option key={collection.id} value={collection.id}>{collection.name}</option>
                          ))}
                        </select>
                      </label>
                    )}
                  </div>
                </div>
              );
            })}

            {filteredPapers.length === 0 && (
              <div className="bg-[#FAF9F5] border border-[#141414]/15 p-12 text-center">
                <FolderKanban className="w-8 h-8 text-[#141414]/30 mx-auto mb-3" />
                <h4 className="font-serif text-lg text-[#141414] mb-1">No publications found</h4>
                <p className="font-sans text-xs text-[#141414]/60 max-w-sm mx-auto">
                  This collection or tag currently contains no items. Add papers from your library or
                  reassign existing items.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create / Edit Area or Book Modal */}
      {isCreatingCollection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#141414]/60 backdrop-blur-sm">
          <div className="bg-[#EDEBE6] border border-[#141414]/20 w-full max-w-md p-6 shadow-2xl animate-scaleUp">
            <h3 className="font-serif text-2xl font-light text-[#141414] mb-1">
              {editingCollection ? (editingCollection.kind === 'area' ? 'Edit Research Area' : 'Edit Book') : newColKind === 'area' ? 'Create Research Area' : 'Create Book'}
            </h3>
            <p className="font-sans text-xs text-[#141414]/60 mb-5">
              Organize your publications around specific grants, review topics, or dissertations.
            </p>

            <form onSubmit={handleSaveCollection} className="space-y-4">
              {!editingCollection && <div>
                <div>
                  <label className="block font-mono text-xs uppercase tracking-wider text-[#141414]/60 mb-1">Create</label>
                  <select value={newColKind} onChange={(event) => setNewColKind(event.target.value as 'area' | 'book')} className="w-full border border-[#141414]/20 bg-white p-2.5 font-sans text-sm text-[#141414]">
                    <option value="area">Research area</option><option value="book">Book / folder</option>
                  </select>
                </div>
              </div>}
              {newColKind === 'book' && <div>
                <label className="block font-mono text-xs uppercase tracking-wider text-[#141414]/60 mb-1">Inside research area</label>
                <select value={newParentAreaId} onChange={(event) => setNewParentAreaId(event.target.value)} className="w-full border border-[#141414]/20 bg-white p-2.5 font-sans text-sm text-[#141414]">
                  <option value="">My Research · no area</option>{areaNodes.map((area) => <option key={area.id} value={area.id}>{area.name}</option>)}
                </select>
              </div>}
              <div>
                <label className="block font-mono text-xs uppercase tracking-wider text-[#141414]/60 mb-1">
                  {newColKind === 'area' ? 'Research area name *' : 'Book name *'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={newColKind === 'area' ? 'e.g. Food systems' : 'e.g. Literature review'}
                  value={newColName}
                  onChange={(e) => setNewColName(e.target.value)}
                  className="w-full bg-white border border-[#141414]/20 p-2.5 font-sans text-sm text-[#141414] focus:outline-none focus:border-[#1F3FB0]"
                />
              </div>

              <div>
                <label className="block font-mono text-xs uppercase tracking-wider text-[#141414]/60 mb-1">
                  Scope & Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Theoretical focus, research questions, or key hypotheses..."
                  value={newColDesc}
                  onChange={(e) => setNewColDesc(e.target.value)}
                  className="w-full bg-white border border-[#141414]/20 p-2.5 font-sans text-xs text-[#141414] focus:outline-none focus:border-[#1F3FB0]"
                />
              </div>

              <div>
                <label className="block font-mono text-xs uppercase tracking-wider text-[#141414]/60 mb-1">
                  Accent Color
                </label>
                <div className="flex gap-2">
                  {['#1F3FB0', '#2E7D32', '#D97706', '#9333EA', '#DC2626', '#0891B2'].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setNewColColor(c)}
                      className={`w-7 h-7 rounded border-2 transition-transform ${
                        newColColor === c ? 'scale-110 border-[#141414]' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-[#141414]/10">
                <button
                  type="button"
                  onClick={() => setIsCreatingCollection(false)}
                  className="px-4 py-2 border border-[#141414]/20 font-mono text-xs uppercase hover:bg-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#141414] text-white hover:bg-[#1F3FB0] font-mono text-xs uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Save Collection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
