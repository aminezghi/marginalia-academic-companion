import React from 'react';
import { CollectionAppearance, ResearchItem } from '../types/research';
import {
  DEFAULT_CATEGORY_APPEARANCES,
  resolveBookAppearance,
} from '../data/bookAppearanceData';
import { SpineEmblemSvg } from './PhysicalSpine';
import { BookOpen, FileText } from 'lucide-react';
import { playTactileClick } from '../utils/sound';

interface PhysicalCoverProps {
  item: ResearchItem;
  index?: number;
  tiltX?: number;
  tiltY?: number;
  paperCount?: number;
  isPulledOut?: boolean;
  onStartReading?: (item: ResearchItem) => void;
  onOpenDetail?: (item: ResearchItem) => void;
  categoryAppearances?: Record<string, CollectionAppearance>;
  className?: string;
}

export const PhysicalCover: React.FC<PhysicalCoverProps> = ({
  item,
  index = 0,
  tiltX = 0,
  tiltY = 0,
  paperCount = 1,
  isPulledOut = false,
  onStartReading,
  onOpenDetail,
  categoryAppearances = DEFAULT_CATEGORY_APPEARANCES,
  className = '',
}) => {
  const resolved = resolveBookAppearance(item, index, categoryAppearances);
  const { spineColor, coverStyle, material, spineTitle, spineEmblem, isLight } = resolved;

  const isFullLeatherOrDark =
    coverStyle === 'leather' || (coverStyle === 'hardcover' && !isLight);
  const isClothStyle = coverStyle === 'cloth';
  const isModernStyle = coverStyle === 'modern';

  const coverBg = isFullLeatherOrDark
    ? spineColor
    : isClothStyle
    ? '#E4DAC8'
    : isModernStyle
    ? '#F3EFE6'
    : '#EAE0CE';

  const titleColor = isFullLeatherOrDark ? '#EAD8B1' : '#181512';
  const subTextColor = isFullLeatherOrDark
    ? 'rgba(234, 216, 177, 0.82)'
    : '#4A433B';
  const illustrationColor = isFullLeatherOrDark
    ? '#DFC896'
    : coverStyle === 'botanical'
    ? '#284A37'
    : coverStyle === 'journal' || coverStyle === 'cloth'
    ? '#5E2722'
    : '#234782';

  const spineFoilColor = isLight ? '#2C221A' : '#E2CE9F';
  const bookDepth = 30;

  const topHeaderLabel = item.type.toLowerCase().includes('project')
    ? 'RESEARCH MONOGRAPH'
    : item.type.toLowerCase().includes('method')
    ? 'METHODOLOGY DOSSIER'
    : item.bookPaperIds ? 'PAPER COLLECTION' : 'RESEARCH ARTICLE';

  const bottomTypeWords = (item.type || 'RESEARCH ARTICLE').toUpperCase();

  // Reading progress & paper count metrics
  const currentPage = item.readingProgress?.currentPage ?? 0;
  const totalPages = item.bookPaperIds?.length || item.readingProgress?.totalPages || item.pageCount || 0;
  const progressPercent = Math.max(
    0,
    Math.min(
      100,
      item.readingProgress?.percent ??
        (totalPages > 0 ? Math.round((currentPage / totalPages) * 100) : 0)
    )
  );

  // Determine how many papers this volume/collection represents
  const effectivePaperCount = Math.max(1, paperCount);

  return (
    <div
      className={`relative w-full h-full select-none preserve-3d transition-transform duration-200 ease-out ${className}`}
      style={{
        transform: `rotateZ(${isPulledOut ? -0.6 : -1.6}deg) rotateY(${
          (isPulledOut ? -8 : -13) + tiltY
        }deg) rotateX(${(isPulledOut ? 1.5 : 2.5) + tiltX}deg)`,
        transformStyle: 'preserve-3d',
      }}
    >
      {/* 1. LEFT 3D BOUND SPINE EDGE */}
      <div
        className="absolute top-0 bottom-0 left-0 pointer-events-none flex flex-col justify-between py-4 px-1 overflow-hidden rounded-l-[3px]"
        style={{
          width: `${bookDepth}px`,
          backgroundColor: spineColor,
          transformOrigin: 'left center',
          transform: 'rotateY(-78deg)',
          boxShadow:
            'inset -4px 0 10px rgba(0,0,0,0.55), inset 3px 0 6px rgba(255,255,255,0.15), -6px 8px 18px rgba(0,0,0,0.45)',
          borderLeft: '1px solid rgba(255,255,255,0.18)',
        }}
      >
        <div className="space-y-2 pt-1">
          <div className="w-full h-[2px] opacity-65" style={{ backgroundColor: spineFoilColor }} />
          <div className="w-full h-[3px] opacity-80" style={{ backgroundColor: spineFoilColor }} />
        </div>

        <div className="flex-1 flex items-center justify-center overflow-hidden my-2">
          <span
            className="font-serif text-[7px] uppercase tracking-[0.18em] whitespace-nowrap opacity-85"
            style={{
              writingMode: 'vertical-rl',
              transform: 'rotate(180deg)',
              color: spineFoilColor,
            }}
          >
            {spineTitle}
          </span>
        </div>

        <div className="space-y-2 pb-1">
          <div className="w-full h-[3px] opacity-80" style={{ backgroundColor: spineFoilColor }} />
          <div className="w-full h-[2px] opacity-65" style={{ backgroundColor: spineFoilColor }} />
        </div>
      </div>

      {/* 2. RIGHT 3D PAGE-BLOCK THICKNESS */}
      <div
        className="absolute top-[3px] bottom-[3px] right-0 pointer-events-none"
        style={{
          width: `${bookDepth - 6}px`,
          transformOrigin: 'right center',
          transform: 'rotateY(82deg)',
          background:
            'repeating-linear-gradient(90deg, #E5DEC9 0px, #E5DEC9 1.5px, #C8BEAA 1.5px, #C8BEAA 3px)',
          boxShadow: 'inset 0 0 8px rgba(40,30,15,0.35)',
        }}
      />

      {/* 3. BOTTOM 3D PAGE-BLOCK THICKNESS */}
      <div
        className="absolute left-[4px] right-[3px] bottom-0 pointer-events-none"
        style={{
          height: `${bookDepth - 8}px`,
          transformOrigin: 'center bottom',
          transform: 'rotateX(-82deg)',
          background:
            'repeating-linear-gradient(0deg, #DFD7C2 0px, #DFD7C2 1.5px, #C2B7A1 1.5px, #C2B7A1 3px)',
          boxShadow: 'inset 0 0 10px rgba(30,20,10,0.45)',
        }}
      />

      {/* 4. FRONT COVER SURFACE */}
      <div
        className="relative w-full h-full rounded-[3px] overflow-hidden flex flex-col justify-between p-4 sm:p-5 md:p-6"
        style={{
          backgroundColor: coverBg,
          color: titleColor,
          boxShadow: isPulledOut
            ? '0 32px 60px -10px rgba(10, 6, 2, 0.78), -4px 0 12px rgba(0,0,0,0.4), inset 0 0 28px rgba(95, 70, 40, 0.18), inset 0 0 0 1px rgba(60, 45, 30, 0.28)'
            : '0 22px 42px -10px rgba(15, 10, 5, 0.62), -2px 0 8px rgba(0,0,0,0.32), inset 0 0 28px rgba(95, 70, 40, 0.18), inset 0 0 0 1px rgba(60, 45, 30, 0.22)',
        }}
      >
        {/* Left Bound Quarter-Leather / Cloth Spine Hinge Band */}
        <div
          className="absolute left-0 top-0 bottom-0 w-3.5 sm:w-4 pointer-events-none z-20"
          style={{
            backgroundColor: spineColor,
            boxShadow:
              'inset -2px 0 4px rgba(0,0,0,0.45), inset 1px 0 2px rgba(255,255,255,0.25), 2px 0 5px rgba(0,0,0,0.28)',
          }}
        >
          <div
            className="w-full h-full opacity-35"
            style={{
              backgroundImage:
                'radial-gradient(rgba(235,220,195,0.5) 1px, transparent 0)',
              backgroundSize: '6px 10px',
            }}
          />
        </div>

        {/* Deep French Groove Crease beside the Spine Hinge */}
        <div
          className="absolute left-3.5 sm:left-4 top-0 bottom-0 w-2 pointer-events-none z-20"
          style={{
            background:
              'linear-gradient(90deg, rgba(20,14,8,0.28) 0%, rgba(255,255,255,0.35) 60%, transparent 100%)',
          }}
        />

        {/* Aged Paper / Cloth Grain & Corner Wear Vignette */}
        <div
          className="absolute inset-0 pointer-events-none z-10"
          style={{
            backgroundImage:
              material === 'cloth'
                ? 'repeating-linear-gradient(0deg, rgba(0,0,0,0.03) 0px, rgba(0,0,0,0.03) 1px, transparent 1px, transparent 3px), radial-gradient(circle at 50% 50%, transparent 55%, rgba(80,58,32,0.22) 100%)'
                : 'radial-gradient(rgba(70, 50, 25, 0.08) 1px, transparent 0), radial-gradient(circle at 50% 45%, transparent 52%, rgba(95, 70, 38, 0.24) 100%)',
            backgroundSize:
              material === 'cloth' ? '4px 4px, 100% 100%' : '14px 14px, 100% 100%',
          }}
        />

        {/* Decorative Border Frame for Leather / Journal / Botanical Styles */}
        {(coverStyle === 'leather' ||
          coverStyle === 'journal' ||
          coverStyle === 'botanical') && (
          <div
            className="absolute inset-2.5 left-5 pointer-events-none z-10 border"
            style={{
              borderColor: isFullLeatherOrDark
                ? 'rgba(229, 211, 167, 0.35)'
                : 'rgba(40, 32, 24, 0.22)',
            }}
          />
        )}

        {/* TOP HEADER: RESEARCH ARTICLE + PAPER COUNT STAMP */}
        <div className="relative z-20 pl-3 flex items-center justify-between gap-1 border-b pb-1.5" style={{ borderColor: isFullLeatherOrDark ? 'rgba(234,216,177,0.2)' : 'rgba(24,21,18,0.14)' }}>
          <span
            className="text-[8.5px] sm:text-[9.5px] font-serif uppercase tracking-[0.16em] font-medium truncate"
            style={{ color: subTextColor }}
          >
            {topHeaderLabel}
          </span>
          <span
            className="text-[8.5px] sm:text-[9px] font-mono font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-[2px] shrink-0"
            style={{
              backgroundColor: isFullLeatherOrDark
                ? 'rgba(234, 216, 177, 0.16)'
                : 'rgba(35, 71, 130, 0.1)',
              color: isFullLeatherOrDark ? '#EAD8B1' : '#1F3FB0',
              border: `1px solid ${
                isFullLeatherOrDark
                  ? 'rgba(234, 216, 177, 0.3)'
                  : 'rgba(35, 71, 130, 0.25)'
              }`,
            }}
            title={`This volume belongs to ${item.category} (${effectivePaperCount} ${effectivePaperCount === 1 ? 'Paper' : 'Papers'})`}
          >
            {effectivePaperCount} {effectivePaperCount === 1 ? 'PAPER' : 'PAPERS'}
          </span>
        </div>

        {/* MAIN EDITORIAL SERIF TITLE */}
        <div className="relative z-20 pl-3 pr-0.5 mt-2">
          <h2
            className="font-serif font-normal text-[17px] sm:text-[20px] md:text-[21px] leading-[1.16] tracking-[-0.01em] line-clamp-4"
            style={{
              color: titleColor,
              textShadow: isFullLeatherOrDark
                ? '0 1px 2px rgba(0,0,0,0.6)'
                : '0 0.5px 0 rgba(255,255,255,0.5)',
            }}
          >
            {item.title}
          </h2>
        </div>

        {/* VINTAGE ETCHING ILLUSTRATION (Middle of Cover) */}
        <div className="relative z-20 pl-3 my-auto py-1 flex items-center justify-center">
          {item.id === 'item-01' ||
          item.coverPalette.motif === 'gi-smart-map' ||
          item.coverPalette.motif === 'bibliometric-network' ||
          spineEmblem === 'terroir' ||
          spineEmblem === 'landscape' ? (
            <svg
              viewBox="0 0 240 105"
              className="w-full h-20 sm:h-24 md:h-26 overflow-visible"
              fill="none"
            >
              <path
                d="M8 52 Q 48 30, 92 44 T 175 34 Q 208 28, 234 42"
                stroke={illustrationColor}
                strokeWidth="1.1"
                opacity="0.7"
              />
              <path
                d="M6 60 Q 60 40, 118 52 T 234 48"
                stroke={illustrationColor}
                strokeWidth="1.2"
              />
              <path
                d="M35 42 L 48 51 M50 39 L 65 50 M68 41 L 80 50 M145 39 L 160 49 M165 36 L 182 48"
                stroke={illustrationColor}
                strokeWidth="0.7"
                opacity="0.55"
              />

              <rect
                x="146"
                y="43"
                width="32"
                height="16"
                fill={coverBg}
                stroke={illustrationColor}
                strokeWidth="1.2"
              />
              <path
                d="M143 43 L 162 33 L 181 43 Z"
                fill={coverBg}
                stroke={illustrationColor}
                strokeWidth="1.2"
              />
              <rect x="152" y="47" width="3.5" height="4" fill={illustrationColor} />
              <rect x="160" y="47" width="3.5" height="4" fill={illustrationColor} />
              <rect x="168" y="47" width="3.5" height="4" fill={illustrationColor} />
              <path d="M159 59 V 54 A 2.5 2.5 0 0 1 164 54 V 59" fill={illustrationColor} />

              <path
                d="M135 57 C 133 46, 134 36, 136 29 C 138 36, 139 46, 137 57 Z"
                fill={illustrationColor}
              />
              <path
                d="M190 58 C 188 44, 189 31, 191.5 22 C 194 31, 195 44, 193 58 Z"
                fill={illustrationColor}
              />
              <path
                d="M201 60 C 199.5 48, 200.5 37, 202.5 29 C 204.5 37, 205.5 48, 204 60 Z"
                fill={illustrationColor}
              />
              <circle cx="88" cy="53" r="4.5" fill={illustrationColor} opacity="0.85" />
              <circle cx="96" cy="54" r="3.5" fill={illustrationColor} opacity="0.75" />

              <path
                d="M6 68 Q 78 52, 152 61 T 234 66"
                stroke={illustrationColor}
                strokeWidth="1.4"
              />
              <path
                d="M6 80 Q 90 62, 175 74 T 234 83"
                stroke={illustrationColor}
                strokeWidth="1.3"
              />
              <path
                d="M10 94 Q 105 76, 232 96"
                stroke={illustrationColor}
                strokeWidth="1.2"
              />
              <path
                d="M10 70 L 45 98 M24 67 L 68 99 M40 64 L 92 99 M58 62 L 116 99 M76 60 L 140 99 M96 60 L 165 98 M118 61 L 190 97 M142 63 L 214 96 M168 65 L 232 92"
                stroke={illustrationColor}
                strokeWidth="0.95"
                opacity="0.82"
              />
            </svg>
          ) : (
            <div className="w-full h-20 sm:h-22 flex flex-col items-center justify-center relative">
              <div
                className="w-full border-t border-b py-2 flex items-center justify-center"
                style={{ borderColor: `${illustrationColor}40` }}
              >
                <SpineEmblemSvg
                  type={spineEmblem}
                  color={illustrationColor}
                  size={46}
                />
              </div>
            </div>
          )}
        </div>

        {/* ARCHIVAL READING PROGRESS BAR ON COVER */}
        <div className="relative z-20 pl-3 pt-1">
          <div className="flex items-center justify-between text-[9px] font-mono uppercase tracking-wider mb-1" style={{ color: subTextColor }}>
            <span>
              {progressPercent >= 100
                ? 'COMPLETED'
                : progressPercent > 0
                ? `READING · ${progressPercent}%`
                : 'UNREAD · 0%'}
            </span>
            <span className="tabular-nums">
              {item.bookPaperIds
                ? `${Math.min(currentPage, totalPages)}/${totalPages} papers`
                : totalPages > 0 ? `${Math.min(currentPage, totalPages)}/${totalPages} pp.` : item.pages ? `${item.pages} pp.` : 'PAGES —'}
            </span>
          </div>
          <div
            className="w-full h-1.5 rounded-full overflow-hidden"
            style={{
              backgroundColor: isFullLeatherOrDark
                ? 'rgba(255,255,255,0.16)'
                : 'rgba(24,21,18,0.12)',
            }}
          >
            <div
              className="h-full transition-all duration-300"
              style={{
                width: `${progressPercent}%`,
                backgroundColor: isFullLeatherOrDark
                  ? '#EAD8B1'
                  : progressPercent >= 100
                  ? '#234233'
                  : '#1F3FB0',
              }}
            />
          </div>
        </div>

        {/* BOTTOM FOOTER OR PULLED-OUT QUICK-READ ACTION BAR */}
        {isPulledOut ? (
          <div
            className="relative z-30 pl-3 pt-2.5 mt-1.5 border-t flex flex-col gap-1.5 animate-fadeIn"
            style={{
              borderColor: isFullLeatherOrDark
                ? 'rgba(234,216,177,0.25)'
                : 'rgba(24,21,18,0.18)',
            }}
          >
            <div className="text-[9.5px] font-serif italic truncate" style={{ color: subTextColor }}>
              {item.authors.join(', ')} · {item.year}
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                data-shelf-nav-btn="true"
                onClick={(e) => {
                  e.stopPropagation();
                  playTactileClick();
                  onStartReading?.(item);
                }}
                className="flex-1 py-1.5 px-2 bg-[#1F3FB0] hover:bg-[#162F8A] text-white text-[10px] font-mono uppercase tracking-wider font-semibold rounded-[2px] flex items-center justify-center gap-1 shadow-sm cursor-pointer transition-colors"
              >
                <FileText className="w-3 h-3" />
                <span>Start Reading</span>
              </button>
              <button
                type="button"
                data-shelf-nav-btn="true"
                onClick={(e) => {
                  e.stopPropagation();
                  playTactileClick();
                  onOpenDetail?.(item);
                }}
                className="py-1.5 px-2 bg-[#26211D] hover:bg-[#141414] text-[#F5F1E8] text-[10px] font-mono uppercase tracking-wider rounded-[2px] flex items-center justify-center gap-1 shadow-sm cursor-pointer transition-colors"
                title="View Full Methodology & Abstract Dossier"
              >
                <BookOpen className="w-3 h-3" />
                <span>Dossier</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="relative z-20 pl-3 pt-2 flex items-end justify-between gap-2">
            <div
              className="font-serif text-[9.5px] sm:text-[10.5px] uppercase tracking-[0.13em] leading-[1.2] max-w-[145px]"
              style={{ color: titleColor }}
            >
              {bottomTypeWords.split(' ').length >= 2 ? (
                <>
                  <span className="block">{bottomTypeWords.split(' ')[0]}</span>
                  <span className="block">
                    {bottomTypeWords.split(' ').slice(1).join(' ')}
                  </span>
                </>
              ) : (
                bottomTypeWords
              )}
            </div>

            <div
              className="font-serif text-sm sm:text-base font-medium tracking-wider tabular-nums"
              style={{ color: titleColor }}
            >
              {item.year}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
