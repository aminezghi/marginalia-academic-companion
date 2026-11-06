import React, { useState } from 'react';
import {
  BookAppearanceOverride,
  BookCoverStyle,
  BookMaterialFinish,
  BookSizePreset,
  CategoryDefinition,
  CollectionAppearance,
  ResearchItem,
  ShelfSortMode,
  ShelfWoodMaterial,
  SpineEmblemType,
} from '../types/research';
import {
  BOOK_COVER_STYLES,
  BOOK_MATERIAL_FINISHES,
  BOOK_SIZE_PRESETS,
  DEFAULT_CATEGORY_APPEARANCES,
  SHELF_WOOD_MATERIALS,
  SPINE_EMBLEM_OPTIONS,
  VINTAGE_SPINE_COLORS,
  resolveBookAppearance,
} from '../data/bookAppearanceData';
import { BANKER_LAMP_STYLES, BankersLampStyle } from './VintageBankersLamp';
import { PhysicalSpine } from './PhysicalSpine';
import { PhysicalCover } from './PhysicalCover';
import { playTactileClick } from '../utils/sound';
import {
  X,
  Palette,
  BookOpen,
  Layers,
  RotateCcw,
  ArrowUp,
  ArrowDown,
  Check,
  Sparkles,
} from 'lucide-react';

interface LibraryCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: ResearchItem[];
  categories: CategoryDefinition[];
  initialSelectedBook?: ResearchItem | null;
  shelfMaterial: ShelfWoodMaterial;
  onChangeShelfMaterial: (material: ShelfWoodMaterial) => void;
  lampStyle?: BankersLampStyle;
  onChangeLampStyle?: (style: BankersLampStyle) => void;
  sortMode: ShelfSortMode;
  onChangeSortMode: (mode: ShelfSortMode) => void;
  categoryAppearances: Record<string, CollectionAppearance>;
  onUpdateCategoryAppearance: (
    categoryId: string,
    appearance: CollectionAppearance
  ) => void;
  onUpdateBookAppearance: (
    paperId: string,
    override: BookAppearanceOverride | undefined
  ) => void;
  onMoveBookOrder: (paperId: string, direction: 'up' | 'down') => void;
}

export const LibraryCustomizerModal: React.FC<LibraryCustomizerModalProps> = ({
  isOpen,
  onClose,
  items,
  categories,
  initialSelectedBook,
  shelfMaterial,
  onChangeShelfMaterial,
  lampStyle = 'emerald',
  onChangeLampStyle,
  sortMode,
  onChangeSortMode,
  categoryAppearances,
  onUpdateCategoryAppearance,
  onUpdateBookAppearance,
  onMoveBookOrder,
}) => {
  const [activeTab, setActiveTab] = useState<'book' | 'collection' | 'shelf'>(
    initialSelectedBook ? 'book' : 'book'
  );
  const [selectedBookId, setSelectedBookId] = useState<string>(
    initialSelectedBook?.id || items[0]?.id || ''
  );
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(
    categories.find((c) => c.id !== 'ALL')?.id || 'FOOD SYSTEMS'
  );

  if (!isOpen) return null;

  const selectedBook =
    items.find((i) => i.id === selectedBookId) || items[0] || null;
  const selectedBookIndex = items.findIndex((i) => i.id === selectedBook?.id);

  const resolvedBook = selectedBook
    ? resolveBookAppearance(
        selectedBook,
        Math.max(0, selectedBookIndex),
        categoryAppearances
      )
    : null;

  const activeCategoryAppearance: CollectionAppearance =
    categoryAppearances[selectedCategoryId] ||
    DEFAULT_CATEGORY_APPEARANCES[selectedCategoryId] ||
    DEFAULT_CATEGORY_APPEARANCES.ALL;

  const handleBookFieldUpdate = (patch: Partial<BookAppearanceOverride>) => {
    if (!selectedBook) return;
    playTactileClick();
    const current = selectedBook.bookAppearance || {};
    onUpdateBookAppearance(selectedBook.id, {
      ...current,
      ...patch,
    });
  };

  const handleResetBookToDefault = () => {
    if (!selectedBook) return;
    playTactileClick();
    onUpdateBookAppearance(selectedBook.id, undefined);
  };

  const handleCategoryFieldUpdate = (patch: Partial<CollectionAppearance>) => {
    playTactileClick();
    onUpdateCategoryAppearance(selectedCategoryId, {
      ...activeCategoryAppearance,
      ...patch,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-[#141414]/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-5xl bg-[#F4F1EA] border border-[#141414]/25 shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 bg-[#EAE5D9] border-b border-[#141414]/15 flex items-center justify-between gap-4">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#77736B]">
              MARGINALIA BINDERY & ARCHIVE ATELIER
            </div>
            <h2 className="font-serif text-xl sm:text-2xl text-[#141414] mt-0.5">
              Vintage Bookshelf & Bookbinding Studio
            </h2>
          </div>

          <button
            onClick={() => {
              playTactileClick();
              onClose();
            }}
            className="p-2 border border-[#141414]/20 hover:border-[#141414] bg-[#F4F1EA] text-[#141414] cursor-pointer transition-colors"
            aria-label="Close Customizer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mode Tabs */}
        <div className="px-6 pt-3 bg-[#EFECE4] border-b border-[#141414]/15 flex flex-wrap items-center gap-2 text-xs font-mono">
          <button
            onClick={() => {
              playTactileClick();
              setActiveTab('book');
            }}
            className={`px-4 py-2 border-t border-l border-r transition-colors flex items-center gap-2 cursor-pointer ${
              activeTab === 'book'
                ? 'bg-[#F4F1EA] border-[#141414]/20 text-[#141414] font-semibold -mb-[1px]'
                : 'border-transparent text-[#77736B] hover:text-[#141414]'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-[#1F3FB0]" />
            <span>1. Individual Book Binding</span>
          </button>

          <button
            onClick={() => {
              playTactileClick();
              setActiveTab('collection');
            }}
            className={`px-4 py-2 border-t border-l border-r transition-colors flex items-center gap-2 cursor-pointer ${
              activeTab === 'collection'
                ? 'bg-[#F4F1EA] border-[#141414]/20 text-[#141414] font-semibold -mb-[1px]'
                : 'border-transparent text-[#77736B] hover:text-[#141414]'
            }`}
          >
            <Palette className="w-3.5 h-3.5 text-[#1F3FB0]" />
            <span>2. Collection Defaults</span>
          </button>

          <button
            onClick={() => {
              playTactileClick();
              setActiveTab('shelf');
            }}
            className={`px-4 py-2 border-t border-l border-r transition-colors flex items-center gap-2 cursor-pointer ${
              activeTab === 'shelf'
                ? 'bg-[#F4F1EA] border-[#141414]/20 text-[#141414] font-semibold -mb-[1px]'
                : 'border-transparent text-[#77736B] hover:text-[#141414]'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-[#1F3FB0]" />
            <span>3. Shelf Timber & Book Order</span>
          </button>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT COLUMN: Controls (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {activeTab === 'book' && selectedBook && resolvedBook && (
              <>
                {/* Select which book to customize */}
                <div className="bg-white/70 border border-[#141414]/15 p-4 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <label className="text-[11px] font-mono uppercase tracking-wider text-[#77736B]">
                      SELECT VOLUME TO CUSTOMIZE
                    </label>
                    <button
                      onClick={handleResetBookToDefault}
                      className="text-[11px] font-mono text-[#1F3FB0] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Reset to Collection Default</span>
                    </button>
                  </div>
                  <select
                    value={selectedBook.id}
                    onChange={(e) => setSelectedBookId(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F4F1EA] border border-[#141414]/25 font-serif text-sm text-[#141414] focus:outline-none focus:border-[#1F3FB0]"
                  >
                    {items.map((item, idx) => (
                      <option key={item.id} value={item.id}>
                        {String(idx + 1).padStart(2, '0')}. {item.title} ({item.year})
                      </option>
                    ))}
                  </select>

                  {/* Spine Short Title & Type Code */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-mono uppercase tracking-wider text-[#77736B] mb-1">
                        SPINE STAMPED TITLE
                      </label>
                      <input
                        type="text"
                        value={
                          selectedBook.bookAppearance?.spineTitle ??
                          resolvedBook.spineTitle
                        }
                        onChange={(e) =>
                          handleBookFieldUpdate({ spineTitle: e.target.value })
                        }
                        className="w-full px-2.5 py-1.5 bg-[#F4F1EA] border border-[#141414]/20 text-xs font-mono uppercase"
                        placeholder="e.g. SUSTAINABLE DIETS"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono uppercase tracking-wider text-[#77736B] mb-1">
                        SPINE TYPE CODE
                      </label>
                      <input
                        type="text"
                        maxLength={6}
                        value={
                          selectedBook.bookAppearance?.typeCode ??
                          resolvedBook.typeCode
                        }
                        onChange={(e) =>
                          handleBookFieldUpdate({
                            typeCode: e.target.value.toUpperCase(),
                          })
                        }
                        className="w-full px-2.5 py-1.5 bg-[#F4F1EA] border border-[#141414]/20 text-xs font-mono uppercase"
                        placeholder="REV / EMP / EXP"
                      />
                    </div>
                  </div>
                </div>

                {/* Spine Colour Picker */}
                <div className="bg-white/70 border border-[#141414]/15 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-[#77736B]">
                      SPINE BOOKBINDING COLOUR
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-[#77736B]">
                        Custom HEX:
                      </span>
                      <input
                        type="color"
                        value={resolvedBook.spineColor}
                        onChange={(e) =>
                          handleBookFieldUpdate({
                            customSpineColor: e.target.value,
                          })
                        }
                        className="w-6 h-6 border border-[#141414]/25 cursor-pointer bg-transparent"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {VINTAGE_SPINE_COLORS.map((preset) => {
                      const active =
                        resolvedBook.spineColor.toLowerCase() ===
                        preset.hex.toLowerCase();
                      return (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() =>
                            handleBookFieldUpdate({
                              customSpineColor: preset.hex,
                            })
                          }
                          className={`p-2 border text-left flex items-center gap-2 transition-all cursor-pointer ${
                            active
                              ? 'border-[#1F3FB0] bg-[#1F3FB0]/5 font-semibold shadow-2xs'
                              : 'border-[#141414]/15 hover:border-[#141414]/40 bg-[#F4F1EA]/60'
                          }`}
                        >
                          <span
                            className="w-4 h-4 rounded-full shrink-0 border border-black/20"
                            style={{ backgroundColor: preset.hex }}
                          />
                          <span className="text-[11px] font-sans truncate">
                            {preset.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Spine Emblem & Book Dimensions */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-white/70 border border-[#141414]/15 p-4 space-y-2.5">
                    <label className="block text-[11px] font-mono uppercase tracking-wider text-[#77736B]">
                      SPINE ETCHING EMBLEM
                    </label>
                    <select
                      value={resolvedBook.spineEmblem}
                      onChange={(e) =>
                        handleBookFieldUpdate({
                          spineEmblem: e.target.value as SpineEmblemType,
                        })
                      }
                      className="w-full px-3 py-2 bg-[#F4F1EA] border border-[#141414]/20 text-xs font-mono"
                    >
                      {SPINE_EMBLEM_OPTIONS.map((em) => (
                        <option key={em.id} value={em.id}>
                          {em.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="bg-white/70 border border-[#141414]/15 p-4 space-y-2.5">
                    <label className="block text-[11px] font-mono uppercase tracking-wider text-[#77736B]">
                      BOOK VOLUME DIMENSIONS
                    </label>
                    <select
                      value={resolvedBook.bookSize}
                      onChange={(e) =>
                        handleBookFieldUpdate({
                          customSize: e.target.value as BookSizePreset,
                        })
                      }
                      className="w-full px-3 py-2 bg-[#F4F1EA] border border-[#141414]/20 text-xs font-mono"
                    >
                      {BOOK_SIZE_PRESETS.map((sz) => (
                        <option key={sz.id} value={sz.id}>
                          {sz.label} ({sz.spineWidthDesktop}px spine)
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Cover Style & Material Finish */}
                <div className="bg-white/70 border border-[#141414]/15 p-4 space-y-4">
                  <div>
                    <label className="block text-[11px] font-mono uppercase tracking-wider text-[#77736B] mb-2">
                      FRONT COVER EDITION STYLE
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {BOOK_COVER_STYLES.map((st) => {
                        const active = resolvedBook.coverStyle === st.id;
                        return (
                          <button
                            key={st.id}
                            type="button"
                            onClick={() =>
                              handleBookFieldUpdate({ customCoverStyle: st.id })
                            }
                            className={`p-2.5 border text-left transition-all cursor-pointer ${
                              active
                                ? 'border-[#1F3FB0] bg-[#1F3FB0]/5'
                                : 'border-[#141414]/15 hover:border-[#141414]/35 bg-[#F4F1EA]/50'
                            }`}
                          >
                            <div className="text-xs font-semibold text-[#141414] flex items-center justify-between">
                              <span>{st.label}</span>
                              {active && (
                                <Check className="w-3.5 h-3.5 text-[#1F3FB0]" />
                              )}
                            </div>
                            <div className="text-[10px] text-[#77736B] mt-0.5 line-clamp-1">
                              {st.description}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono uppercase tracking-wider text-[#77736B] mb-2">
                      BINDING MATERIAL & TEXTURE
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {BOOK_MATERIAL_FINISHES.map((mat) => {
                        const active = resolvedBook.material === mat.id;
                        return (
                          <button
                            key={mat.id}
                            type="button"
                            onClick={() =>
                              handleBookFieldUpdate({ customMaterial: mat.id })
                            }
                            className={`px-3 py-2 border text-xs font-mono text-left cursor-pointer transition-all ${
                              active
                                ? 'border-[#1F3FB0] bg-[#1F3FB0] text-white font-semibold'
                                : 'border-[#141414]/15 bg-[#F4F1EA] text-[#141414]'
                            }`}
                          >
                            {mat.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'collection' && (
              <div className="space-y-5">
                <div className="bg-white/70 border border-[#141414]/15 p-4 space-y-3">
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-[#77736B]">
                    SELECT RESEARCH COLLECTION / CATEGORY
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {categories
                      .filter((c) => c.id !== 'ALL')
                      .map((cat) => {
                        const active = selectedCategoryId === cat.id;
                        const app =
                          categoryAppearances[cat.id] ||
                          DEFAULT_CATEGORY_APPEARANCES[cat.id] ||
                          DEFAULT_CATEGORY_APPEARANCES.ALL;
                        return (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => {
                              playTactileClick();
                              setSelectedCategoryId(cat.id);
                            }}
                            className={`px-3 py-1.5 border text-xs font-mono uppercase flex items-center gap-2 cursor-pointer transition-all ${
                              active
                                ? 'border-[#141414] bg-[#26211D] text-white font-semibold'
                                : 'border-[#141414]/20 bg-[#F4F1EA] text-[#141414]'
                            }`}
                          >
                            <span
                              className="w-2.5 h-2.5 rounded-full border border-white/40"
                              style={{ backgroundColor: app.spineColor }}
                            />
                            <span>{cat.label}</span>
                          </button>
                        );
                      })}
                  </div>
                </div>

                {/* Default Spine Color for Selected Collection */}
                <div className="bg-white/70 border border-[#141414]/15 p-4 space-y-3">
                  <div className="text-[11px] font-mono uppercase tracking-wider text-[#77736B]">
                    COLLECTION DEFAULT SPINE COLOUR ({selectedCategoryId})
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {VINTAGE_SPINE_COLORS.map((preset) => {
                      const active =
                        activeCategoryAppearance.spineColor.toLowerCase() ===
                        preset.hex.toLowerCase();
                      return (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() =>
                            handleCategoryFieldUpdate({
                              spineColor: preset.hex,
                            })
                          }
                          className={`p-2 border text-left flex items-center gap-2 cursor-pointer ${
                            active
                              ? 'border-[#1F3FB0] bg-[#1F3FB0]/5 font-semibold'
                              : 'border-[#141414]/15 bg-[#F4F1EA]/60'
                          }`}
                        >
                          <span
                            className="w-4 h-4 rounded-full shrink-0 border border-black/20"
                            style={{ backgroundColor: preset.hex }}
                          />
                          <span className="text-[11px] truncate">
                            {preset.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Default Cover Style, Material & Size for Collection */}
                <div className="bg-white/70 border border-[#141414]/15 p-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-[#77736B] mb-1.5">
                      DEFAULT COVER STYLE
                    </label>
                    <select
                      value={activeCategoryAppearance.coverStyle}
                      onChange={(e) =>
                        handleCategoryFieldUpdate({
                          coverStyle: e.target.value as BookCoverStyle,
                        })
                      }
                      className="w-full px-2.5 py-2 bg-[#F4F1EA] border border-[#141414]/20 text-xs font-mono"
                    >
                      {BOOK_COVER_STYLES.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-[#77736B] mb-1.5">
                      DEFAULT MATERIAL
                    </label>
                    <select
                      value={activeCategoryAppearance.material}
                      onChange={(e) =>
                        handleCategoryFieldUpdate({
                          material: e.target.value as BookMaterialFinish,
                        })
                      }
                      className="w-full px-2.5 py-2 bg-[#F4F1EA] border border-[#141414]/20 text-xs font-mono"
                    >
                      {BOOK_MATERIAL_FINISHES.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-[#77736B] mb-1.5">
                      DEFAULT BOOK SIZE
                    </label>
                    <select
                      value={activeCategoryAppearance.bookSize}
                      onChange={(e) =>
                        handleCategoryFieldUpdate({
                          bookSize: e.target.value as BookSizePreset,
                        })
                      }
                      className="w-full px-2.5 py-2 bg-[#F4F1EA] border border-[#141414]/20 text-xs font-mono"
                    >
                      {BOOK_SIZE_PRESETS.map((sz) => (
                        <option key={sz.id} value={sz.id}>
                          {sz.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'shelf' && (
              <div className="space-y-5">
                {/* Wooden Shelf Material Selector */}
                <div className="bg-white/70 border border-[#141414]/15 p-4 space-y-3">
                  <div className="text-[11px] font-mono uppercase tracking-wider text-[#77736B]">
                    BOOKSHELF TIMBER & PLINTH MATERIAL
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {SHELF_WOOD_MATERIALS.map((wood) => {
                      const active = shelfMaterial === wood.id;
                      return (
                        <button
                          key={wood.id}
                          type="button"
                          onClick={() => {
                            playTactileClick();
                            onChangeShelfMaterial(wood.id);
                          }}
                          className={`p-3 border text-left transition-all cursor-pointer ${
                            active
                              ? 'border-[#1F3FB0] bg-[#1F3FB0]/5 shadow-xs'
                              : 'border-[#141414]/15 hover:border-[#141414]/40 bg-[#F4F1EA]/70'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span
                              className="w-8 h-4 rounded-xs border border-black/30 shrink-0"
                              style={{ background: wood.frontEdge }}
                            />
                            <span className="font-serif font-medium text-sm text-[#141414]">
                              {wood.label}
                            </span>
                            {active && (
                              <Check className="w-3.5 h-3.5 text-[#1F3FB0] ml-auto" />
                            )}
                          </div>
                          <p className="text-[11px] text-[#77736B] mt-1.5 leading-snug">
                            {wood.description}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Vintage Banker's Desk Lamp Style Selector */}
                <div className="bg-white/70 border border-[#141414]/15 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-[#77736B]">
                      VINTAGE BANKER'S DESK LAMP & NOCTURNE SHADE
                    </span>
                    <span className="text-[10px] font-mono text-[#D4AF37]">
                      Interactive Turnkey on Shelf
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {BANKER_LAMP_STYLES.map((lamp) => {
                      const active = lampStyle === lamp.id;
                      return (
                        <button
                          key={lamp.id}
                          type="button"
                          onClick={() => {
                            playTactileClick();
                            onChangeLampStyle?.(lamp.id);
                          }}
                          className={`p-3 border text-left transition-all cursor-pointer ${
                            active
                              ? 'border-[#D4AF37] bg-[#D4AF37]/10 shadow-xs ring-1 ring-[#D4AF37]'
                              : 'border-[#141414]/15 hover:border-[#141414]/40 bg-[#F4F1EA]/70'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className="w-4 h-4 rounded-full border border-black/30 shrink-0 shadow-xs"
                              style={{ background: lamp.shadeColor }}
                            />
                            <span className="font-serif font-medium text-xs text-[#141414]">
                              {lamp.name}
                            </span>
                            {active && (
                              <Check className="w-3.5 h-3.5 text-[#D4AF37] ml-auto shrink-0" />
                            )}
                          </div>
                          <p className="text-[10px] text-[#77736B] mt-1.5 leading-snug">
                            {lamp.subtitle}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Shelf Ordering & Custom Reordering */}
                <div className="bg-white/70 border border-[#141414]/15 p-4 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-[#77736B]">
                      SHELF ARRANGEMENT & SORTING
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {(
                        [
                          { id: 'custom', label: 'Custom Order' },
                          { id: 'year', label: 'Publication Year' },
                          { id: 'title', label: 'Title (A–Z)' },
                          { id: 'author', label: 'Author' },
                          { id: 'status', label: 'Reading Status' },
                          { id: 'recent', label: 'Recently Added' },
                        ] as { id: ShelfSortMode; label: string }[]
                      ).map((m) => (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => {
                            playTactileClick();
                            onChangeSortMode(m.id);
                          }}
                          className={`px-2.5 py-1 text-[11px] font-mono border cursor-pointer ${
                            sortMode === m.id
                              ? 'border-[#141414] bg-[#26211D] text-white font-semibold'
                              : 'border-[#141414]/15 bg-[#F4F1EA] text-[#141414]'
                          }`}
                        >
                          {m.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Manual Shelf Sequence Reorder List */}
                  <div className="max-h-56 overflow-y-auto border border-[#141414]/15 divide-y divide-[#141414]/10 bg-[#F4F1EA]">
                    {items.map((book, idx) => {
                      const app = resolveBookAppearance(
                        book,
                        idx,
                        categoryAppearances
                      );
                      return (
                        <div
                          key={book.id}
                          className="px-3 py-2 flex items-center justify-between gap-3 text-xs hover:bg-white/60"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="font-mono text-[10px] text-[#77736B] w-5">
                              {String(idx + 1).padStart(2, '0')}
                            </span>
                            <span
                              className="w-3 h-4 rounded-[1px] shrink-0 border border-black/20"
                              style={{ backgroundColor: app.spineColor }}
                            />
                            <span className="font-serif text-[#141414] truncate">
                              {book.title}
                            </span>
                            <span className="font-mono text-[10px] text-[#77736B] shrink-0">
                              ({book.year})
                            </span>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              disabled={idx === 0}
                              onClick={() => {
                                playTactileClick();
                                onChangeSortMode('custom');
                                onMoveBookOrder(book.id, 'up');
                              }}
                              className="p-1 border border-[#141414]/15 hover:border-[#141414] disabled:opacity-30 cursor-pointer"
                              title="Move Left on Shelf"
                            >
                              <ArrowUp className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              disabled={idx === items.length - 1}
                              onClick={() => {
                                playTactileClick();
                                onChangeSortMode('custom');
                                onMoveBookOrder(book.id, 'down');
                              }}
                              className="p-1 border border-[#141414]/15 hover:border-[#141414] disabled:opacity-30 cursor-pointer"
                              title="Move Right on Shelf"
                            >
                              <ArrowDown className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: Live 3D Book Spine & Front Cover Preview (5 cols) */}
          <div className="lg:col-span-5 flex flex-col">
            <div className="flex-1 bg-[#E5DEC9]/65 border border-[#141414]/15 p-5 flex flex-col justify-between relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-[#141414]/10 pb-2.5">
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#77736B] flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-[#1F3FB0]" />
                  <span>LIVE 3D BINDERY PREVIEW</span>
                </span>
                {resolvedBook && (
                  <span className="text-[10px] font-mono text-[#141414]/70 uppercase">
                    {resolvedBook.sizeConfig.label}
                  </span>
                )}
              </div>

              {/* Side-by-side Spine + 3D Front Cover on a Miniature Wooden Plinth */}
              {selectedBook && (
                <div className="my-auto py-6 flex flex-col items-center justify-center">
                  <div className="flex items-end justify-center gap-6 preserve-3d">
                    {/* Live Spine Preview */}
                    <div className="flex flex-col items-center gap-2">
                      <div
                        style={{
                          width: `${
                            resolvedBook?.sizeConfig.spineWidthDesktop || 64
                          }px`,
                          height: '290px',
                        }}
                      >
                        <PhysicalSpine
                          item={selectedBook}
                          index={Math.max(0, selectedBookIndex)}
                          categoryAppearances={categoryAppearances}
                        />
                      </div>
                    </div>

                    {/* Live 3D Cover Preview */}
                    <div className="flex flex-col items-center gap-2">
                      <div
                        className="preserve-3d"
                        style={{
                          width: '205px',
                          height: '295px',
                        }}
                      >
                        <PhysicalCover
                          item={selectedBook}
                          index={Math.max(0, selectedBookIndex)}
                          categoryAppearances={categoryAppearances}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Miniature Shelf Plinth Under Preview */}
                  <div
                    className="w-full h-5 -mt-1 rounded-xs shadow-md"
                    style={{
                      background:
                        (
                          SHELF_WOOD_MATERIALS.find(
                            (w) => w.id === shelfMaterial
                          ) || SHELF_WOOD_MATERIALS[0]
                        ).frontEdge,
                    }}
                  />
                </div>
              )}

              <div className="pt-3 border-t border-[#141414]/10 flex items-center justify-between text-[11px] font-mono text-[#77736B]">
                <span>Changes save automatically to your library</span>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-1.5 bg-[#26211D] hover:bg-[#141414] text-white font-mono text-xs uppercase tracking-wider cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
