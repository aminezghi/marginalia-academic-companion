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
import { ResearchItem, ResearchCollection, ReadingStatus } from '../types/research';
import { playTactileClick, playPaperRustle } from '../utils/sound';

interface CollectionsViewProps {
  papers: ResearchItem[];
  collections: ResearchCollection[];
  onUpdateCollections: (collections: ResearchCollection[]) => void;
  onUpdatePapers: (papers: ResearchItem[]) => void;
  onOpenPaperInReader: (paper: ResearchItem) => void;
  onOpenPaperDetail: (paper: ResearchItem) => void;
}

export const CollectionsView: React.FC<CollectionsViewProps> = ({
  papers,
  collections,
  onUpdateCollections,
  onUpdatePapers,
  onOpenPaperInReader,
  onOpenPaperDetail,
}) => {
  const [selectedCollectionId, setSelectedCollectionId] = useState<string>('all');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [isCreatingCollection, setIsCreatingCollection] = useState(false);
  const [newColName, setNewColName] = useState('');
  const [newColDesc, setNewColDesc] = useState('');
  const [newColColor, setNewColColor] = useState('#1F3FB0');
  const [editingCollection, setEditingCollection] = useState<ResearchCollection | null>(null);

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
      filter: (p: ResearchItem) => Boolean(p.extractedText || p.pdfUrl),
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

    // Check if it's a smart preset
    const smart = SMART_PRESETS.find((s) => s.id === selectedCollectionId);
    if (smart) {
      return result.filter(smart.filter);
    }

    // Custom user collection
    return result.filter(
      (p) => p.collectionIds && p.collectionIds.includes(selectedCollectionId)
    );
  }, [papers, selectedCollectionId, selectedTag]);

  // Active collection metadata
  const activeCollection = collections.find((c) => c.id === selectedCollectionId);
  const activeSmart = SMART_PRESETS.find((s) => s.id === selectedCollectionId);

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
      };
      onUpdateCollections([...collections, newCol]);
      setSelectedCollectionId(newCol.id);
    }

    setIsCreatingCollection(false);
    setNewColName('');
    setNewColDesc('');
  };

  const handleDeleteCollection = (id: string) => {
    if (confirm('Delete this collection? (Papers will remain in your library)')) {
      playTactileClick();
      onUpdateCollections(collections.filter((c) => c.id !== id));
      if (selectedCollectionId === id) setSelectedCollectionId('all');
    }
  };

  const handleTogglePaperInCollection = (paper: ResearchItem, colId: string) => {
    playTactileClick();
    const currentCols = paper.collectionIds || [];
    const newCols = currentCols.includes(colId)
      ? currentCols.filter((id) => id !== colId)
      : [...currentCols, colId];

    const updated = papers.map((p) => (p.id === paper.id ? { ...p, collectionIds: newCols } : p));
    onUpdatePapers(updated);
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

          <button
            onClick={() => {
              playTactileClick();
              setIsCreatingCollection(true);
              setEditingCollection(null);
              setNewColName('');
              setNewColDesc('');
            }}
            className="bg-[#141414] text-white hover:bg-[#1F3FB0] transition-colors px-4 py-2 text-xs font-mono uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-sm"
          >
            <FolderPlus className="w-3.5 h-3.5" />
            <span>New Collection</span>
          </button>
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
                  setSelectedCollectionId('all');
                  setSelectedTag(null);
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
                      setSelectedCollectionId(s.id);
                      setSelectedTag(null);
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
                Custom Collections ({collections.length})
              </span>
            </div>

            <div className="space-y-1">
              {collections.map((c) => {
                const count = papers.filter(
                  (p) => p.collectionIds && p.collectionIds.includes(c.id)
                ).length;
                const isActive = selectedCollectionId === c.id && !selectedTag;

                return (
                  <div
                    key={c.id}
                    className={`flex items-center justify-between px-3 py-2 border transition-colors cursor-pointer group ${
                      isActive
                        ? 'bg-white border-[#1F3FB0] text-[#1F3FB0] font-semibold'
                        : 'border-transparent text-[#141414]/80 hover:bg-white/60'
                    }`}
                    onClick={() => {
                      playTactileClick();
                      setSelectedCollectionId(c.id);
                      setSelectedTag(null);
                    }}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span
                        className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
                        style={{ backgroundColor: c.color || '#1F3FB0' }}
                      />
                      <span className="text-xs truncate">{c.name}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] text-[#141414]/50">{count}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteCollection(c.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 text-[#141414]/40 hover:text-red-600 transition-opacity p-0.5"
                        title="Delete collection"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}

              {collections.length === 0 && (
                <div className="text-center py-4 text-xs font-sans text-[#141414]/50">
                  No custom collections yet. Click "New Collection" to create one.
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
                    : activeCollection
                    ? 'CUSTOM COLLECTION'
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
                : activeCollection
                ? activeCollection.name
                : 'All Publications'}
            </h2>

            {activeCollection?.description && (
              <p className="font-sans text-xs text-[#141414]/60 mt-1 leading-relaxed">
                {activeCollection.description}
              </p>
            )}
          </div>

          {/* Paper List */}
          <div className="space-y-3">
            {filteredPapers.map((paper) => {
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
                      <button
                        onClick={() => onOpenPaperInReader(paper)}
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

      {/* Create / Edit Collection Modal */}
      {isCreatingCollection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#141414]/60 backdrop-blur-sm">
          <div className="bg-[#EDEBE6] border border-[#141414]/20 w-full max-w-md p-6 shadow-2xl animate-scaleUp">
            <h3 className="font-serif text-2xl font-light text-[#141414] mb-1">
              {editingCollection ? 'Edit Collection' : 'Create Research Collection'}
            </h3>
            <p className="font-sans text-xs text-[#141414]/60 mb-5">
              Organize your publications around specific grants, review topics, or dissertations.
            </p>

            <form onSubmit={handleSaveCollection} className="space-y-4">
              <div>
                <label className="block font-mono text-xs uppercase tracking-wider text-[#141414]/60 mb-1">
                  Collection Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. EU Green Deal Dietary Policy"
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
