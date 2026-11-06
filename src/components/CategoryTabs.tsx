import React, { useState } from 'react';
import {
  BookOpen,
  LayoutGrid,
  List,
  Palette,
  Plus,
  ChevronDown,
  Sparkles,
  Upload,
} from 'lucide-react';
import { CategoryDefinition, ResearchCategory, ResearchItem } from '../types/research';
import { playPaperRustle, playTactileClick } from '../utils/sound';

interface CategoryTabsProps {
  categories: CategoryDefinition[];
  activeCategory: ResearchCategory;
  onSelectCategory: (category: ResearchCategory) => void;
  items: ResearchItem[];
  onOpenCategoryManager?: () => void;
  onOpenImport?: () => void;
  onOpenNewArticle?: () => void;
  onOpenCustomizer?: () => void;
  viewMode?: 'shelf' | 'grid' | 'list';
  onChangeViewMode?: (mode: 'shelf' | 'grid' | 'list') => void;
  isNightMode?: boolean;
}

const FRIENDLY_TAB_LABELS: Record<string, string> = {
  ALL: 'All',
  'FOOD SYSTEMS': 'Food Systems',
  'CONSUMER BEHAVIOUR': 'Consumer Behaviour',
  'BIG DATA': 'Big Data',
  'IMMERSIVE TECHNOLOGIES': 'Immersive Tech',
  BIODIVERSITY: 'Biodiversity',
  'DIGITAL INNOVATION': 'Digital Innovation',
  'RESEARCH PROJECTS': 'Research Projects',
  METHODOLOGY: 'Methodology',
};

export const CategoryTabs: React.FC<CategoryTabsProps> = ({
  categories,
  activeCategory,
  onSelectCategory,
  items,
  onOpenCategoryManager,
  onOpenImport,
  onOpenNewArticle,
  onOpenCustomizer,
  viewMode = 'shelf',
  onChangeViewMode,
  isNightMode = false,
}) => {
  const [addDropdownOpen, setAddDropdownOpen] = useState(false);

  const readingCount = items.filter((p) => p.readingStatus === 'reading').length;
  const toReadCount = items.filter(
    (p) => p.readingStatus === 'to_read' || p.readingStatus === 'inbox'
  ).length;
  const completedCount = items.filter(
    (p) => p.readingStatus === 'completed'
  ).length;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-3 pb-1 select-none">
      {/* ROW 1: Library Counter Card + Reading Status Strip + View Switcher + Add Papers */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3">
        {/* Left: Stitched Archival Paper Counter Card + Reading Stats */}
        <div className="flex flex-wrap items-center gap-4 sm:gap-6">
          {/* Stitched Paper Badge ("My Library / X Papers") */}
          <div
            className={`px-3.5 py-2 border shadow-xs flex flex-col justify-center transition-colors ${
              isNightMode
                ? 'bg-[#181614] border-[#2E2822]'
                : 'bg-[#ECE6D8] border-[#1E1A16]/20'
            }`}
            style={{
              boxShadow: isNightMode
                ? '0 2px 6px rgba(0,0,0,0.4), inset 0 0 0 1px rgba(255,255,255,0.06)'
                : '0 2px 6px rgba(25,18,10,0.08), inset 0 0 0 2px rgba(255,255,255,0.45)',
            }}
          >
            <span
              className={`text-[10px] font-serif leading-none ${
                isNightMode ? 'text-[#8C8275]' : 'text-[#5A5248]'
              }`}
            >
              My Library
            </span>
            <span
              className={`font-serif text-base sm:text-lg font-medium leading-tight mt-0.5 tabular-nums ${
                isNightMode ? 'text-[#EDE8DF]' : 'text-[#1A1612]'
              }`}
            >
              {items.length} Papers
            </span>
          </div>

          {/* Clean Typographic Reading Status Counts */}
          <div
            className={`flex items-center gap-3 sm:gap-4 text-xs sm:text-[13px] font-serif ${
              isNightMode ? 'text-[#C0B7A8]' : 'text-[#3A342D]'
            }`}
          >
            <div>
              <span className={isNightMode ? 'text-[#8C8275]' : 'text-[#5A5248]'}>
                Reading
              </span>{' '}
              <strong
                className={`font-semibold tabular-nums ml-1 ${
                  isNightMode ? 'text-[#EDE8DF]' : 'text-[#141414]'
                }`}
              >
                {readingCount}
              </strong>
            </div>
            <span
              aria-hidden="true"
              className={isNightMode ? 'text-white/20' : 'text-[#141414]/20'}
            >
              |
            </span>
            <div>
              <span className={isNightMode ? 'text-[#8C8275]' : 'text-[#5A5248]'}>
                To Read
              </span>{' '}
              <strong
                className={`font-semibold tabular-nums ml-1 ${
                  isNightMode ? 'text-[#EDE8DF]' : 'text-[#141414]'
                }`}
              >
                {toReadCount}
              </strong>
            </div>
            <span
              aria-hidden="true"
              className={isNightMode ? 'text-white/20' : 'text-[#141414]/20'}
            >
              |
            </span>
            <div>
              <span className={isNightMode ? 'text-[#8C8275]' : 'text-[#5A5248]'}>
                Completed
              </span>{' '}
              <strong
                className={`font-semibold tabular-nums ml-1 ${
                  isNightMode ? 'text-[#EDE8DF]' : 'text-[#141414]'
                }`}
              >
                {completedCount}
              </strong>
            </div>
          </div>
        </div>

        {/* Right: View Switcher (Bookshelf / Grid / List) + Customize Shelf + Add Papers */}
        <div className="flex items-center gap-2 sm:gap-2.5 ml-auto">
          {/* Customize Shelf & Bindery Button */}
          {onOpenCustomizer && (
            <button
              type="button"
              onClick={() => {
                playTactileClick();
                onOpenCustomizer();
              }}
              className={`px-3 py-1.5 rounded-full border text-xs font-serif flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs ${
                isNightMode
                  ? 'border-[#2E2822] bg-[#1E1B17] hover:bg-[#2A241E] text-[#C0B7A8]'
                  : 'border-[#1E1A16]/20 bg-[#ECE6D8]/70 hover:bg-white text-[#2C2520]'
              }`}
              title="Customize Shelf Material, Spine Colours & Book Styles"
            >
              <Palette className={`w-3.5 h-3.5 ${isNightMode ? 'text-[#D4AF37]' : 'text-[#1F3FB0]'}`} />
              <span className="hidden sm:inline">Customize Shelf</span>
            </button>
          )}

          {/* 3-Mode View Switcher Group */}
          {onChangeViewMode && (
            <div
              className={`inline-flex items-center rounded-full border p-0.5 shadow-2xs ${
                isNightMode
                  ? 'border-[#2E2822] bg-[#1E1B17]'
                  : 'border-[#1E1A16]/20 bg-[#ECE6D8]/70'
              }`}
            >
              <button
                type="button"
                onClick={() => {
                  playTactileClick();
                  onChangeViewMode('shelf');
                }}
                className={`p-1.5 rounded-full transition-all cursor-pointer ${
                  viewMode === 'shelf'
                    ? isNightMode
                      ? 'bg-[#2E2822] text-[#D4AF37] shadow-xs border border-[#D4AF37]/40'
                      : 'bg-[#F8F5EE] text-[#141414] shadow-xs border border-[#1E1A16]/15'
                    : isNightMode
                      ? 'text-[#8C8275] hover:text-[#EDE8DF]'
                      : 'text-[#5A5248] hover:text-[#141414]'
                }`}
                title="3D Vintage Bookshelf View"
                aria-label="Bookshelf View"
              >
                <BookOpen className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => {
                  playTactileClick();
                  onChangeViewMode('grid');
                }}
                className={`p-1.5 rounded-full transition-all cursor-pointer ${
                  viewMode === 'grid'
                    ? isNightMode
                      ? 'bg-[#2E2822] text-[#D4AF37] shadow-xs border border-[#D4AF37]/40'
                      : 'bg-[#F8F5EE] text-[#141414] shadow-xs border border-[#1E1A16]/15'
                    : isNightMode
                      ? 'text-[#8C8275] hover:text-[#EDE8DF]'
                      : 'text-[#5A5248] hover:text-[#141414]'
                }`}
                title="Visual Card Grid View"
                aria-label="Grid View"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => {
                  playTactileClick();
                  onChangeViewMode('list');
                }}
                className={`p-1.5 rounded-full transition-all cursor-pointer ${
                  viewMode === 'list'
                    ? isNightMode
                      ? 'bg-[#2E2822] text-[#D4AF37] shadow-xs border border-[#D4AF37]/40'
                      : 'bg-[#F8F5EE] text-[#141414] shadow-xs border border-[#1E1A16]/15'
                    : isNightMode
                      ? 'text-[#8C8275] hover:text-[#EDE8DF]'
                      : 'text-[#5A5248] hover:text-[#141414]'
                }`}
                title="Detailed Research Catalog Table"
                aria-label="List Table View"
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* "+ Add Papers" Primary Action Button with Dropdown */}
          <div className="relative">
            <div
              className={`inline-flex items-center rounded-md shadow-xs transition-colors ${
                isNightMode
                  ? 'bg-[#2A241E] hover:bg-[#342D25] text-[#EDE8DF] border border-[#3E362C]'
                  : 'bg-[#332922] hover:bg-[#231C17] text-[#F5F1E8]'
              }`}
            >
              <button
                type="button"
                onClick={() => {
                  playTactileClick();
                  if (onOpenImport) onOpenImport();
                  else if (onOpenNewArticle) onOpenNewArticle();
                }}
                className="px-3.5 py-1.5 text-xs font-serif font-medium flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Papers</span>
              </button>
              <button
                type="button"
                onClick={() => setAddDropdownOpen((o) => !o)}
                className="px-2 py-1.5 border-l border-white/15 hover:bg-white/10 cursor-pointer"
                aria-label="More add options"
              >
                <ChevronDown className="w-3 h-3" />
              </button>
            </div>

            {/* Dropdown Menu */}
            {addDropdownOpen && (
              <div
                className={`absolute right-0 mt-1.5 w-52 border shadow-xl z-50 py-1 text-xs font-serif ${
                  isNightMode
                    ? 'bg-[#1E1B17] border-[#38322A] text-[#EDE8DF]'
                    : 'bg-[#F4F1EA] border-[#141414]/25 text-[#141414]'
                }`}
                onMouseLeave={() => setAddDropdownOpen(false)}
              >
                <button
                  type="button"
                  onClick={() => {
                    setAddDropdownOpen(false);
                    onOpenImport?.();
                  }}
                  className={`w-full px-3.5 py-2 text-left flex items-center gap-2 cursor-pointer ${
                    isNightMode ? 'hover:bg-[#2A251F]' : 'hover:bg-[#EAE5D9]'
                  }`}
                >
                  <Upload className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>Import via DOI, BibTeX, PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAddDropdownOpen(false);
                    onOpenNewArticle?.();
                  }}
                  className={`w-full px-3.5 py-2 text-left flex items-center gap-2 cursor-pointer ${
                    isNightMode ? 'hover:bg-[#2A251F]' : 'hover:bg-[#EAE5D9]'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>Create Manual Entry</span>
                </button>
                {onOpenCategoryManager && (
                  <button
                    type="button"
                    onClick={() => {
                      setAddDropdownOpen(false);
                      onOpenCategoryManager();
                    }}
                    className={`w-full px-3.5 py-2 text-left flex items-center gap-2 border-t cursor-pointer ${
                      isNightMode
                        ? 'border-[#2E2822] hover:bg-[#2A251F]'
                        : 'border-[#141414]/10 hover:bg-[#EAE5D9]'
                    }`}
                  >
                    <Plus className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>Manage Categories</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ROW 2: Physical Category Folder Tabs Strip */}
      <nav
        className={`border-b transition-colors ${
          isNightMode ? 'border-[#2E2822]' : 'border-[#1E1A16]/15'
        }`}
        aria-label="Research Categories"
      >
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pt-1">
          {categories.map((cat) => {
            const isActive = activeCategory === cat.id;
            const displayLabel =
              cat.shortLabel ||
              FRIENDLY_TAB_LABELS[cat.id] ||
              FRIENDLY_TAB_LABELS[cat.label] ||
              cat.label;

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  playPaperRustle();
                  onSelectCategory(cat.id);
                }}
                className={`px-4 sm:px-5 py-1.5 text-xs sm:text-[13px] font-serif whitespace-nowrap transition-all duration-150 cursor-pointer border-t border-l border-r first:rounded-tl-sm last:rounded-tr-sm ${
                  isActive
                    ? isNightMode
                      ? 'bg-[#25201A] text-[#D4AF37] border-[#D4AF37]/60 font-semibold shadow-xs'
                      : 'bg-[#28221E] text-[#F5F1E8] border-[#28221E] font-medium shadow-xs'
                    : isNightMode
                      ? 'bg-[#181614] hover:bg-[#221E19] text-[#9E9689] border-[#2A2621]'
                      : 'bg-[#ECE6D8]/55 hover:bg-[#ECE6D8] text-[#2C2520] border-[#1E1A16]/12'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                {displayLabel}
              </button>
            );
          })}

          {/* "+" Tab Button to Add/Manage Categories */}
          {onOpenCategoryManager && (
            <button
              type="button"
              onClick={() => {
                playTactileClick();
                onOpenCategoryManager();
              }}
              className={`px-3 py-1.5 text-xs sm:text-[13px] font-serif border-t border-l border-r rounded-tr-sm cursor-pointer transition-colors ${
                isNightMode
                  ? 'bg-[#181614] hover:bg-[#221E19] text-[#9E9689] border-[#2A2621]'
                  : 'bg-[#ECE6D8]/55 hover:bg-[#ECE6D8] text-[#2C2520] border-[#1E1A16]/12'
              }`}
              title="Add or Manage Research Categories"
              aria-label="Manage Categories"
            >
              <Plus className="w-3.5 h-3.5 inline" />
            </button>
          )}
        </div>
      </nav>
    </div>
  );
};
