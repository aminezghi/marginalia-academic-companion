import React, { useEffect, useState } from 'react';
import { ResearchItem } from '../types/research';
import { ArrowRight, Play, BookOpen, Palette } from 'lucide-react';
import { playTactileClick, playPaperRustle } from '../utils/sound';

interface ResearchCaptionProps {
  item: ResearchItem | null;
  currentIndex: number;
  totalItems: number;
  onPrev: () => void;
  onNext: () => void;
  onSelectIndex?: (index: number) => void;
  onOpen: (item: ResearchItem) => void;
  onReadPaper?: (item: ResearchItem) => void;
  onAskAi?: (item: ResearchItem) => void;
  onCustomizeBook?: (item: ResearchItem) => void;
  isNightMode?: boolean;
}

export const ResearchCaption: React.FC<ResearchCaptionProps> = ({
  item,
  currentIndex,
  totalItems,
  onSelectIndex,
  onOpen,
  onReadPaper,
  onCustomizeBook,
  isNightMode = false,
}) => {
  const [animatingKey, setAnimatingKey] = useState<string>('');
  const [displayedItem, setDisplayedItem] = useState<ResearchItem | null>(item);

  useEffect(() => {
    if (item && item.id !== displayedItem?.id) {
      setAnimatingKey('exit');
      const timer = setTimeout(() => {
        setDisplayedItem(item);
        setAnimatingKey('enter');
      }, 110);
      return () => clearTimeout(timer);
    } else if (item) {
      setDisplayedItem(item);
    }
  }, [item, displayedItem]);

  if (!displayedItem) return null;

  // Format clean typographic topics/domain line
  const domainSummary = displayedItem.field?.includes('·')
    ? displayedItem.field
    : [
        displayedItem.field,
        ...(displayedItem.tags || []).slice(0, 2),
      ]
        .filter(Boolean)
        .join(' · ');

  // Compute 5 visible pagination dots centered around currentIndex
  const dotIndices = (() => {
    if (totalItems <= 6) {
      return Array.from({ length: totalItems }, (_, i) => i);
    }
    const start = Math.max(
      0,
      Math.min(totalItems - 5, currentIndex - 2)
    );
    return Array.from({ length: 5 }, (_, i) => start + i);
  })();

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-5 select-none">
      <div className="grid grid-cols-1 md:grid-cols-12 items-center gap-4">
        {/* LEFT: Subtle Pagination Dots */}
        <div className="hidden md:flex md:col-span-3 items-center gap-2 pl-4">
          {dotIndices.map((idx) => {
            const isCurrent = idx === currentIndex;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  playPaperRustle();
                  onSelectIndex?.(idx);
                }}
                className={`w-2 h-2 rounded-full transition-all cursor-pointer ${
                  isCurrent
                    ? isNightMode
                      ? 'bg-[#D4AF37] scale-125'
                      : 'bg-[#1F3FB0] scale-125'
                    : isNightMode
                      ? 'bg-white/20 hover:bg-white/40'
                      : 'bg-[#1A1612]/25 hover:bg-[#1A1612]/50'
                }`}
                aria-label={`Select book ${idx + 1}`}
                title={`Volume ${idx + 1} of ${totalItems}`}
              />
            );
          })}
          <span
            className={`ml-2 text-[10px] font-mono tabular-nums ${
              isNightMode ? 'text-[#8C8275]' : 'text-[#6E675F]'
            }`}
          >
            {String(currentIndex + 1).padStart(2, '0')}/{String(totalItems).padStart(2, '0')}
          </span>
        </div>

        {/* CENTER: Editorial Publication Type, Italic Serif Title, and Year | Domain Line */}
        <div className="md:col-span-6 text-center px-2">
          {/* Line 1: Publication Type */}
          <div
            className={`text-[10px] sm:text-[11px] font-sans font-semibold uppercase tracking-[0.2em] transition-opacity duration-200 ${
              isNightMode ? 'text-[#D4AF37]' : 'text-[#1F3FB0]'
            } ${animatingKey === 'exit' ? 'opacity-0' : 'opacity-100'}`}
          >
            {displayedItem.type}
          </div>

          {/* Line 2: Large Italic Newsreader Serif Title */}
          <h1
            onClick={() => {
              playTactileClick();
              onOpen(displayedItem);
            }}
            className={`mt-1.5 font-serif italic font-normal text-xl sm:text-2xl md:text-[28px] leading-[1.2] tracking-[-0.01em] text-balance cursor-pointer transition-all duration-200 ${
              isNightMode
                ? 'text-[#EDE8DF] hover:text-[#D4AF37]'
                : 'text-[#141414] hover:text-[#1F3FB0]'
            } ${
              animatingKey === 'exit'
                ? 'opacity-0 translate-y-1'
                : 'opacity-100 translate-y-0'
            }`}
          >
            {displayedItem.title}
          </h1>

          {/* Line 3: Year | Domain Topics */}
          <div
            className={`mt-2.5 flex flex-wrap items-center justify-center gap-2.5 text-[11px] sm:text-xs font-mono transition-opacity duration-200 ${
              isNightMode ? 'text-[#9E9689]' : 'text-[#3A342D]'
            } ${animatingKey === 'exit' ? 'opacity-0' : 'opacity-100'}`}
          >
            <span className="tabular-nums">{displayedItem.year}</span>
            <span
              aria-hidden="true"
              className={isNightMode ? 'text-white/20' : 'text-[#141414]/35'}
            >
              |
            </span>
            <span className="truncate max-w-md">{domainSummary}</span>
          </div>
        </div>

        {/* RIGHT: Circular Play/Open Paper Button + Dossier & Style Triggers */}
        <div className="md:col-span-3 flex items-center justify-center md:justify-end gap-3 pr-2">
          <button
            type="button"
            onClick={() => {
              playTactileClick();
              if (onReadPaper) {
                onReadPaper(displayedItem);
              } else {
                onOpen(displayedItem);
              }
            }}
            className={`group inline-flex items-center gap-2.5 text-xs sm:text-sm font-serif transition-colors cursor-pointer ${
              isNightMode
                ? 'text-[#EDE8DF] hover:text-[#D4AF37]'
                : 'text-[#141414] hover:text-[#1F3FB0]'
            }`}
          >
            <span
              className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full border flex items-center justify-center transition-all shadow-2xs ${
                isNightMode
                  ? 'border-white/30 group-hover:border-[#D4AF37] group-hover:bg-[#D4AF37] group-hover:text-[#121110]'
                  : 'border-[#141414]/45 group-hover:border-[#1F3FB0] group-hover:bg-[#1F3FB0] group-hover:text-white'
              }`}
            >
              <Play className="w-3 h-3 fill-current ml-0.5" />
            </span>
            <span className="font-medium">Open Paper</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>

          <button
            type="button"
            onClick={() => {
              playTactileClick();
              onOpen(displayedItem);
            }}
            className={`px-2.5 py-1.5 border text-[10px] font-mono uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-colors ${
              isNightMode
                ? 'border-[#2E2822] bg-[#1E1B17] hover:bg-[#2A241E] text-[#EDE8DF] hover:border-[#D4AF37]'
                : 'border-[#141414]/20 hover:border-[#141414] bg-[#F5F1E8]/70 hover:bg-white text-[#3A342D]'
            }`}
            title="Examine Full Scientific Dossier & Metrics"
          >
            <BookOpen className={`w-3 h-3 ${isNightMode ? 'text-[#D4AF37]' : 'text-[#1F3FB0]'}`} />
            <span>Dossier</span>
          </button>

          {onCustomizeBook && (
            <button
              type="button"
              onClick={() => {
                playTactileClick();
                onCustomizeBook(displayedItem);
              }}
              className={`p-1.5 border cursor-pointer transition-colors ${
                isNightMode
                  ? 'border-[#2E2822] bg-[#1E1B17] hover:bg-[#2A241E] text-[#EDE8DF] hover:border-[#D4AF37]'
                  : 'border-[#141414]/20 hover:border-[#1F3FB0] bg-[#F5F1E8]/70 hover:bg-white text-[#3A342D] hover:text-[#1F3FB0]'
              }`}
              title="Customize this book's spine & cover"
              aria-label="Customize Book"
            >
              <Palette className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
