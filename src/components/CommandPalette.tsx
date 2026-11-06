import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Search,
  BookOpen,
  Layers,
  FileText,
  BarChart3,
  Sparkles,
  GitFork,
  FolderOpen,
  Upload,
  Download,
  Palette,
  ArrowRight,
  ExternalLink,
  Check,
} from 'lucide-react';
import { ResearchItem, ShelfWoodMaterial } from '../types/research';
import { MainViewMode } from './TopNav';
import { playTactileClick, playPaperRustle } from '../utils/sound';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  papers: ResearchItem[];
  onSelectPaper: (paper: ResearchItem) => void;
  onOpenReader: (paper: ResearchItem) => void;
  onNavigateView: (mode: MainViewMode | 'shelf' | 'catalog') => void;
  onOpenImport: () => void;
  onOpenTopicSamples?: () => void;
  onOpenCustomizer: () => void;
  onExportBibtex: () => void;
  onExportObsidian: () => void;
  shelfMaterial: ShelfWoodMaterial;
  onChangeShelfMaterial: (mat: ShelfWoodMaterial) => void;
  isNightMode?: boolean;
  onToggleNightMode?: () => void;
}

interface CommandItem {
  id: string;
  category: 'Actions' | 'Navigation' | 'Papers' | 'Library Style';
  title: string;
  subtitle?: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  perform: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  papers,
  onSelectPaper,
  onOpenReader,
  onNavigateView,
  onOpenImport,
  onOpenTopicSamples,
  onOpenCustomizer,
  onExportBibtex,
  onExportObsidian,
  shelfMaterial,
  onChangeShelfMaterial,
  isNightMode = false,
  onToggleNightMode,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Construct command list
  const commands = useMemo<CommandItem[]>(() => {
    const list: CommandItem[] = [
      // Actions
      {
        id: 'action-ingest',
        category: 'Actions',
        title: 'Ingest New Paper (DOI, PDF, BibTeX)',
        subtitle: 'Resolve Crossref metadata or upload local PDF',
        icon: Upload,
        badge: 'DOI',
        perform: () => {
          onOpenImport();
          onClose();
        },
      },
      {
        id: 'action-explore-topics',
        category: 'Actions',
        title: 'Explore & Harvest Open-Access Research by Topic',
        subtitle: 'Harvest peer-reviewed papers from OpenAlex (AI, Quantum, Genomics, Climate...)',
        icon: Sparkles,
        badge: 'Open Science',
        perform: () => {
          onOpenTopicSamples?.();
          onClose();
        },
      },
      {
        id: 'action-export-bibtex',
        category: 'Actions',
        title: 'Export Master BibTeX Bibliography',
        subtitle: 'Download complete .bib archive with standard citekeys',
        icon: Download,
        badge: '.bib',
        perform: () => {
          onExportBibtex();
          onClose();
        },
      },
      {
        id: 'action-export-obsidian',
        category: 'Actions',
        title: 'Export Obsidian / Zotero Markdown Vault',
        subtitle: 'Download interconnected .zip vault with YAML frontmatter & annotations',
        icon: Download,
        badge: 'Vault .zip',
        perform: () => {
          onExportObsidian();
          onClose();
        },
      },
      {
        id: 'action-customize',
        category: 'Actions',
        title: 'Bookbinding & Shelf Customizer Studio',
        subtitle: 'Configure leather colors, finishes, and sorting presets',
        icon: Palette,
        badge: 'Studio',
        perform: () => {
          onOpenCustomizer();
          onClose();
        },
      },
      ...(onToggleNightMode
        ? [
            {
              id: 'action-toggle-night-lamp',
              category: 'Actions' as const,
              title: isNightMode
                ? 'Extinguish Vintage Desk Lamp (Daylight Study)'
                : 'Illuminate Vintage Banker\'s Lamp (Nocturne Night Mode)',
              subtitle: isNightMode
                ? 'Turn off the green desk lamp and switch back to daylight study mode'
                : 'Light up the emerald banker\'s desk lamp and activate dark academia night mode',
              icon: Sparkles,
              badge: isNightMode ? 'Nocturne ON' : 'Night Lamp',
              perform: () => {
                onToggleNightMode();
                onClose();
              },
            },
          ]
        : []),

      // Navigation
      {
        id: 'nav-shelf',
        category: 'Navigation',
        title: 'Go to Library Shelf Archive',
        subtitle: 'Physical timber bookshelf visualization',
        icon: Layers,
        perform: () => {
          onNavigateView('shelf');
          onClose();
        },
      },
      {
        id: 'nav-catalog',
        category: 'Navigation',
        title: 'Go to Research Catalog',
        subtitle: 'Detailed table listing with sorting and status filters',
        icon: BookOpen,
        perform: () => {
          onNavigateView('catalog');
          onClose();
        },
      },
      {
        id: 'nav-reader',
        category: 'Navigation',
        title: 'Go to Dedicated Academic Reader',
        subtitle: 'Distraction-free reading, margin notes and highlighter',
        icon: BookOpen,
        perform: () => {
          onNavigateView('reader');
          onClose();
        },
      },
      {
        id: 'nav-assistant',
        category: 'Navigation',
        title: 'Ask AI Research Assistant',
        subtitle: 'Grounded synthesis and literature matrix reasoning',
        icon: Sparkles,
        perform: () => {
          onNavigateView('assistant');
          onClose();
        },
      },
      {
        id: 'nav-notes',
        category: 'Navigation',
        title: 'Go to Research Notebook',
        subtitle: 'Literature reviews, synthesis, and reading reflections',
        icon: FileText,
        perform: () => {
          onNavigateView('notes');
          onClose();
        },
      },
      {
        id: 'nav-tracker',
        category: 'Navigation',
        title: 'Go to Reading Goals & Habit Tracker',
        subtitle: 'Annual pacing, reading velocity, and metrics',
        icon: BarChart3,
        perform: () => {
          onNavigateView('tracker');
          onClose();
        },
      },
      {
        id: 'nav-graph',
        category: 'Navigation',
        title: 'Go to Citation & Topic Map',
        subtitle: 'Interactive landscape of conceptual lineages',
        icon: GitFork,
        perform: () => {
          onNavigateView('graph');
          onClose();
        },
      },
      {
        id: 'nav-collections',
        category: 'Navigation',
        title: 'Go to Collections & Taxonomies',
        subtitle: 'Thematic folders and project binders',
        icon: FolderOpen,
        perform: () => {
          onNavigateView('collections');
          onClose();
        },
      },
    ];

    // Shelf Woods
    const woodOptions: { id: ShelfWoodMaterial; label: string }[] = [
      { id: 'walnut', label: 'Dark Walnut Finish' },
      { id: 'oak', label: 'Golden Antique Oak' },
      { id: 'mahogany', label: 'Polished Mahogany' },
      { id: 'ebony', label: 'Ebony Wood' },
      { id: 'light_wood', label: 'Nordic Light Pine' },
      { id: 'paper', label: 'Archival Cream Linen' },
    ];
    for (const wood of woodOptions) {
      list.push({
        id: `wood-${wood.id}`,
        category: 'Library Style',
        title: `Shelf Material: ${wood.label}`,
        subtitle: shelfMaterial === wood.id ? 'Currently active' : 'Click to apply timber finish',
        icon: Palette,
        badge: shelfMaterial === wood.id ? 'Active' : undefined,
        perform: () => {
          playTactileClick();
          onChangeShelfMaterial(wood.id);
          onClose();
        },
      });
    }

    // Add Papers from Library
    for (const paper of papers) {
      list.push({
        id: `paper-${paper.id}`,
        category: 'Papers',
        title: paper.title,
        subtitle: `${Array.isArray(paper.authors) ? paper.authors[0] : paper.authors} (${paper.year || 'n.d.'}) · ${paper.journal || paper.category || 'General'}`,
        icon: BookOpen,
        badge: paper.readingStatus || 'item',
        perform: () => {
          playPaperRustle();
          onSelectPaper(paper);
          onClose();
        },
      });
    }

    return list;
  }, [
    papers,
    shelfMaterial,
    onNavigateView,
    onOpenImport,
    onOpenCustomizer,
    onExportBibtex,
    onExportObsidian,
    onChangeShelfMaterial,
    onSelectPaper,
    onClose,
  ]);

  // Filter commands by query
  const filteredCommands = useMemo(() => {
    if (!query.trim()) {
      return commands;
    }
    const q = query.toLowerCase();
    return commands.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        (c.subtitle && c.subtitle.toLowerCase().includes(q)) ||
        c.category.toLowerCase().includes(q)
    );
  }, [commands, query]);

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1 < filteredCommands.length ? prev + 1 : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 >= 0 ? prev - 1 : filteredCommands.length - 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          filteredCommands[selectedIndex].perform();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredCommands, selectedIndex, onClose]);

  // Scroll active item into view
  useEffect(() => {
    if (!listRef.current) return;
    const activeEl = listRef.current.querySelector('[data-active="true"]');
    if (activeEl) {
      activeEl.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Academic Command Palette"
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-[#EDE8DD] border-2 border-[#141414] shadow-[8px_8px_0px_0px_rgba(20,20,20,1)] overflow-hidden animate-scaleIn flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Vintage Header Accent */}
        <div className="bg-[#1F3FB0] text-white px-4 py-2 flex items-center justify-between select-none">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] tracking-widest uppercase font-semibold">
              MARGINALIA DISPATCH
            </span>
            <span className="text-white/40">·</span>
            <span className="font-serif italic text-xs text-white/90">Omnibox & Scholar Actions</span>
          </div>
          <span className="font-mono text-[9px] bg-white/20 px-1.5 py-0.5 rounded text-white tracking-wider">
            ESC TO DISMISS
          </span>
        </div>

        {/* Search Input Bar */}
        <div className="relative border-b-2 border-[#141414] bg-[#F4F1EA] flex items-center px-4 py-3.5">
          <Search className="w-5 h-5 text-[#1F3FB0] mr-3 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Type a paper title, author, action, or command…"
            className="w-full bg-transparent font-serif text-base text-[#141414] placeholder-[#141414]/40 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => {
                setQuery('');
                setSelectedIndex(0);
              }}
              className="text-xs font-mono text-[#141414]/40 hover:text-[#141414] px-1 cursor-pointer"
            >
              CLEAR
            </button>
          )}
        </div>

        {/* Results List */}
        <div
          ref={listRef}
          className="flex-1 overflow-y-auto divide-y divide-[#141414]/10 bg-[#EDE8DD] p-2 select-none"
        >
          {filteredCommands.length === 0 ? (
            <div className="text-center py-12 text-[#141414]/60">
              <p className="font-serif italic text-base">No matching scholarship or action found</p>
              <p className="font-mono text-xs text-[#141414]/40 mt-1">
                Try searching for an author name, DOI, or keyword
              </p>
            </div>
          ) : (
            filteredCommands.map((cmd, idx) => {
              const Icon = cmd.icon;
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={cmd.id}
                  data-active={isSelected}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  onClick={() => cmd.perform()}
                  className={`flex items-center justify-between p-3 rounded cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-[#1F3FB0] text-white shadow-sm'
                      : 'hover:bg-[#E5DFD3] text-[#141414]'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1 pr-3">
                    <div
                      className={`p-2 rounded border flex-shrink-0 ${
                        isSelected
                          ? 'border-white/30 bg-white/10 text-white'
                          : 'border-[#141414]/15 bg-[#F4F1EA] text-[#1F3FB0]'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-serif text-sm font-medium truncate ${
                            isSelected ? 'text-white' : 'text-[#141414]'
                          }`}
                        >
                          {cmd.title}
                        </span>
                      </div>
                      {cmd.subtitle && (
                        <p
                          className={`font-sans text-xs truncate mt-0.5 ${
                            isSelected ? 'text-white/80' : 'text-[#141414]/60'
                          }`}
                        >
                          {cmd.subtitle}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {cmd.badge && (
                      <span
                        className={`font-mono text-[9px] uppercase tracking-wider px-2 py-0.5 rounded border ${
                          isSelected
                            ? 'border-white/40 bg-white/20 text-white'
                            : 'border-[#141414]/20 bg-[#F4F1EA] text-[#141414]/70'
                        }`}
                      >
                        {cmd.badge}
                      </span>
                    )}
                    <span
                      className={`font-mono text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded ${
                        isSelected ? 'bg-white/10 text-white/70' : 'text-[#141414]/30'
                      }`}
                    >
                      {cmd.category}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Vintage Command Footer Hints */}
        <div className="border-t-2 border-[#141414] bg-[#F4F1EA] px-4 py-2 flex items-center justify-between font-mono text-[10px] text-[#141414]/70 select-none">
          <div className="flex items-center gap-3">
            <span>
              <kbd className="bg-[#EDE8DD] border border-[#141414]/30 px-1 py-0.5 rounded">↑</kbd>{' '}
              <kbd className="bg-[#EDE8DD] border border-[#141414]/30 px-1 py-0.5 rounded">↓</kbd>{' '}
              Navigate
            </span>
            <span>
              <kbd className="bg-[#EDE8DD] border border-[#141414]/30 px-1 py-0.5 rounded">↵</kbd>{' '}
              Select
            </span>
          </div>
          <div>
            <span>Press <kbd className="bg-[#EDE8DD] border border-[#141414]/30 px-1 py-0.5 rounded">⌘K</kbd> or <kbd className="bg-[#EDE8DD] border border-[#141414]/30 px-1 py-0.5 rounded">/</kbd> anywhere</span>
          </div>
        </div>
      </div>
    </div>
  );
};
