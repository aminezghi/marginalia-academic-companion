import React, { useState } from 'react';
import {
  CategoryDefinition,
  ResearchCategory,
  ResearchItem,
} from '../types/research';
import { playPaperRustle, playTactileClick } from '../utils/sound';
import {
  Plus,
  BookOpen,
  LayoutGrid,
  List,
  ChevronDown,
  Upload,
  FilePlus2,
  Palette,
} from 'lucide-react';

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
}) => {
  const [addDropdownOpen, setAddDropdownOpen] = useState(false);

  const readingCount = items.filter((p) => p.readingStatus === 'reading').length;
  const toReadCount = items.filter(
    (p) => p.readingStatus === 'to_read' || p.readingStatus === 'inbox'
  ).length;
  const completedCount = items.filter(
    (p) =>
      p.readingStatus === 'completed' || p.readingStatus === 'reference_only'
  ).length;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-3 pb-1 select-none">
      {/* ROW 1: Library Counter Card + Reading Status Strip + View Switcher + Add Papers */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3">
        {/* Left: Stitched Archival Paper Counter Card + Reading Stats */}
        <div className="flex flex-wrap items-center gap-4 sm:gap-6">
          {/* Stitched Paper Badge ("My Library / X Papers") */}
          <div
            className="px-3.5 py-2 bg-[#ECE6D8] border border-[#1E1A16]/20 shadow-xs flex flex-col justify-center"
            style={{
              boxShadow:
                '0 2px 6px rgba(25,18,10,0.08), inset 0 0 0 2px rgba(255,255,255,0.45)',
            }}
          >
            <span className="text-[10px] font-serif text-[#5A5248] leading-none">
              My Library
            </span>
            <span className="font-serif text-base sm:text-lg font-medium text-[#1A1612] leading-tight mt-0.5 tabular-nums">
              {items.length} Papers
            </span>
          </div>

          {/* Clean Typographic Reading Status Counts */}
          <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-[13px] font-serif text-[#3A342D]">
            <div>
              <span className="text-[#5A5248]">Reading</span>{' '}
              <strong className="font-semibold text-[#141414] tabular-nums ml-1">
                {readingCount}
              </strong>
            </div>
            <span aria-hidden="true" className="text-[#141414]/20">
              |
            </span>
            <div>
              <span className="text-[#5A5248]">To Read</span>{' '}
              <strong className="font-semibold text-[#141414] tabular-nums ml-1">
                {toReadCount}
              </strong>
            </div>
            <span aria-hidden="true" className="text-[#141414]/20">
              |
            </span>
            <div>
              <span className="text-[#5A5248]">Completed</span>{' '}
              <strong className="font-semibold text-[#141414] tabular-nums ml-1">
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
              className="px-3 py-1.5 rounded-full border border-[#1E1A16]/20 bg-[#ECE6D8]/70 hover:bg-white text-xs font-serif text-[#2C2520] flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
              title="Customize Shelf Material, Spine Colours & Book Styles"
            >
              <Palette className="w-3.5 h-3.5 text-[#1F3FB0]" />
              <span className="hidden sm:inline">Customize Shelf</span>
            </button>
          )}

          {/* 3-Mode View Switcher Group */}
          {onChangeViewMode && (
            <div className="inline-flex items-center rounded-full border border-[#1E1A16]/20 bg-[#ECE6D8]/70 p-0.5 shadow-2xs">
              <button
                type="button"
                onClick={() => {
                  playTactileClick();
                  onChangeViewMode('shelf');
                }}
                className={`p-1.5 rounded-full transition-all cursor-pointer ${
                  viewMode === 'shelf'
                    ? 'bg-[#F8F5EE] text-[#141414] shadow-xs border border-[#1E1A16]/15'
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
                    ? 'bg-[#F8F5EE] text-[#141414] shadow-xs border border-[#1E1A16]/15'
                    : 'text-[#5A5248] hover:text-[#141414]'
                }`}
                title="Grid View"
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
                    ? 'bg-[#F8F5EE] text-[#141414] shadow-xs border border-[#1E1A16]/15'
                    : 'text-[#5A5248] hover:text-[#141414]'
                }`}
                title="List View"
                aria-label="List View"
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Dark Walnut "+ Add Papers" Button with Dropdown */}
          <div className="relative">
            <div className="inline-flex items-center rounded-md bg-[#332922] hover:bg-[#231C17] text-[#F5F1E8] shadow-xs transition-colors">
              <button
                type="button"
                onClick={() => {
                  playTactileClick();
                  onOpenImport?.();
                }}
                className="px-3 sm:px-3.5 py-1.5 text-xs font-serif flex items-center gap-1.5 cursor-pointer"
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
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>

            {addDropdownOpen && (
              <div
                className="absolute right-0 mt-1.5 w-52 bg-[#F4F1EA] border border-[#141414]/25 shadow-xl z-50 py-1 text-xs font-serif"
                onMouseLeave={() => setAddDropdownOpen(false)}
              >
                <button
                  type="button"
                  onClick={() => {
                    setAddDropdownOpen(false);
                    onOpenImport?.();
                  }}
                  className="w-full px-3.5 py-2 text-left hover:bg-[#EAE5D9] flex items-center gap-2 text-[#141414] cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5 text-[#1F3FB0]" />
                  <span>Import DOI / PDF / BibTeX</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAddDropdownOpen(false);
                    onOpenNewArticle?.();
                  }}
                  className="w-full px-3.5 py-2 text-left hover:bg-[#EAE5D9] flex items-center gap-2 text-[#141414] cursor-pointer"
                >
                  <FilePlus2 className="w-3.5 h-3.5 text-[#1F3FB0]" />
                  <span>Create Record Manually</span>
                </button>
                {onOpenCustomizer && (
                  <button
                    type="button"
                    onClick={() => {
                      setAddDropdownOpen(false);
                      onOpenCustomizer();
                    }}
                    className="w-full px-3.5 py-2 text-left hover:bg-[#EAE5D9] flex items-center gap-2 text-[#141414] border-t border-[#141414]/10 cursor-pointer"
                  >
                    <Palette className="w-3.5 h-3.5 text-[#1F3FB0]" />
                    <span>Customize Book Bindings</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ROW 2: Classic Archival Folder-Tab Category Bar */}
      <nav
        className="w-full border-b border-[#1E1A16]/18 flex items-end justify-center overflow-x-auto no-scrollbar pt-1"
        aria-label="Research Collections"
      >
        <div className="inline-flex items-end">
          {categories.map((cat) => {
            const isActive = activeCategory === cat.id;
            const displayLabel =
              cat.shortLabel || FRIENDLY_TAB_LABELS[cat.id] || cat.label;

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
                    ? 'bg-[#28221E] text-[#F5F1E8] border-[#28221E] font-medium shadow-xs'
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
              className="px-3 py-1.5 text-xs sm:text-[13px] font-serif bg-[#ECE6D8]/55 hover:bg-[#ECE6D8] text-[#2C2520] border-t border-l border-r border-[#1E1A16]/12 rounded-tr-sm cursor-pointer transition-colors"
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
