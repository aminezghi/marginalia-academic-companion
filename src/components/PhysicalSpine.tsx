import React from 'react';
import {
  CollectionAppearance,
  ResearchItem,
  SpineEmblemType,
} from '../types/research';
import {
  DEFAULT_CATEGORY_APPEARANCES,
  resolveBookAppearance,
} from '../data/bookAppearanceData';

interface PhysicalSpineProps {
  item: ResearchItem;
  index?: number;
  isHovered?: boolean;
  paperCount?: number;
  categoryAppearances?: Record<string, CollectionAppearance>;
  className?: string;
}

export const SpineEmblemSvg: React.FC<{
  type: SpineEmblemType;
  color: string;
  size?: number;
}> = ({ type, color, size = 32 }) => {
  switch (type) {
    case 'wheat':
      return (
        <svg viewBox="0 0 40 48" width={size} height={size * 1.15} fill="none">
          <path
            d="M20 42V10"
            stroke={color}
            strokeWidth="1.4"
            strokeLinecap="round"
          />
          <path
            d="M20 14C15 12 13 8 15 5C18 7 20 10 20 14Z"
            stroke={color}
            strokeWidth="1.2"
          />
          <path
            d="M20 14C25 12 27 8 25 5C22 7 20 10 20 14Z"
            stroke={color}
            strokeWidth="1.2"
          />
          <path
            d="M20 22C14 20 11 15 13 12C17 14 20 18 20 22Z"
            stroke={color}
            strokeWidth="1.2"
          />
          <path
            d="M20 22C26 20 29 15 27 12C23 14 20 18 20 22Z"
            stroke={color}
            strokeWidth="1.2"
          />
          <path
            d="M20 30C14 28 11 23 13 20C17 22 20 26 20 30Z"
            stroke={color}
            strokeWidth="1.2"
          />
          <path
            d="M20 30C26 28 29 23 27 20C23 22 20 26 20 30Z"
            stroke={color}
            strokeWidth="1.2"
          />
          <path
            d="M20 37C16 35 14 32 15 29C18 31 20 34 20 37Z"
            stroke={color}
            strokeWidth="1.2"
          />
          <path
            d="M20 37C24 35 26 32 25 29C22 31 20 34 20 37Z"
            stroke={color}
            strokeWidth="1.2"
          />
        </svg>
      );
    case 'basket':
      return (
        <svg viewBox="0 0 40 40" width={size} height={size} fill="none">
          <path
            d="M8 18H32L29 33H11L8 18Z"
            stroke={color}
            strokeWidth="1.3"
            strokeLinejoin="round"
          />
          <path
            d="M6 18H34"
            stroke={color}
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          <path
            d="M14 18L18 9M26 18L22 9"
            stroke={color}
            strokeWidth="1.3"
            strokeLinecap="round"
          />
          <circle cx="20" cy="8" r="1.8" stroke={color} strokeWidth="1.2" />
          <line x1="14" y1="22" x2="15" y2="30" stroke={color} strokeWidth="1" />
          <line x1="20" y1="22" x2="20" y2="30" stroke={color} strokeWidth="1" />
          <line x1="26" y1="22" x2="25" y2="30" stroke={color} strokeWidth="1" />
          <line x1="10" y1="25" x2="30" y2="25" stroke={color} strokeWidth="1" />
        </svg>
      );
    case 'landscape':
      return (
        <svg viewBox="0 0 44 44" width={size * 1.15} height={size * 1.15} fill="none">
          <path
            d="M2 24C10 18 18 19 26 24C32 27 38 25 42 22"
            stroke={color}
            strokeWidth="1.3"
          />
          <path
            d="M2 29C12 24 22 26 42 31"
            stroke={color}
            strokeWidth="1.2"
          />
          <path
            d="M4 36C14 31 28 32 40 37"
            stroke={color}
            strokeWidth="1.1"
          />
          <path d="M12 29L4 38M20 28L12 39M28 29L22 39M35 30L31 39" stroke={color} strokeWidth="0.9" opacity="0.85" />
          <circle cx="31" cy="13" r="3.5" stroke={color} strokeWidth="1.2" />
          <path d="M14 14Q17 11 20 14" stroke={color} strokeWidth="1" />
        </svg>
      );
    case 'compass':
      return (
        <svg viewBox="0 0 40 40" width={size} height={size} fill="none">
          <line x1="20" y1="7" x2="20" y2="33" stroke={color} strokeWidth="1.2" />
          <line x1="7" y1="20" x2="33" y2="20" stroke={color} strokeWidth="1.2" />
          <circle cx="20" cy="20" r="2.5" fill={color} />
          <circle cx="20" cy="8" r="1.6" fill={color} />
          <circle cx="20" cy="32" r="1.6" fill={color} />
          <circle cx="8" cy="20" r="1.6" fill={color} />
          <circle cx="32" cy="20" r="1.6" fill={color} />
          <path d="M16 12L20 8L24 12" stroke={color} strokeWidth="1.1" />
          <path d="M28 16L32 20L28 24" stroke={color} strokeWidth="1.1" />
        </svg>
      );
    case 'chart':
      return (
        <svg viewBox="0 0 42 40" width={size * 1.05} height={size} fill="none">
          <line x1="6" y1="33" x2="36" y2="33" stroke={color} strokeWidth="1.3" />
          <line x1="7" y1="10" x2="7" y2="33" stroke={color} strokeWidth="1.1" />
          <rect x="10" y="23" width="3.5" height="10" stroke={color} strokeWidth="1.1" />
          <rect x="16" y="18" width="3.5" height="15" stroke={color} strokeWidth="1.1" />
          <rect x="22" y="21" width="3.5" height="12" stroke={color} strokeWidth="1.1" />
          <rect x="28" y="12" width="3.5" height="21" stroke={color} strokeWidth="1.2" />
          <path d="M10 20L17 14L24 17L31 9" stroke={color} strokeWidth="1.1" strokeDasharray="2 1.5" />
        </svg>
      );
    case 'eye':
      return (
        <svg viewBox="0 0 44 36" width={size * 1.1} height={size * 0.9} fill="none">
          <path
            d="M4 18C9 10 15 7 22 7C29 7 35 10 40 18C35 26 29 29 22 29C15 29 9 26 4 18Z"
            stroke={color}
            strokeWidth="1.4"
          />
          <circle cx="22" cy="18" r="6" stroke={color} strokeWidth="1.3" />
          <circle cx="22" cy="18" r="2.3" fill={color} />
          <line x1="22" y1="3" x2="22" y2="5.5" stroke={color} strokeWidth="1" />
          <line x1="13" y1="5" x2="14.5" y2="7" stroke={color} strokeWidth="1" />
          <line x1="31" y1="5" x2="29.5" y2="7" stroke={color} strokeWidth="1" />
        </svg>
      );
    case 'terroir':
      return (
        <svg viewBox="0 0 44 44" width={size * 1.15} height={size * 1.15} fill="none">
          <path d="M3 26Q14 19 25 24T41 23" stroke={color} strokeWidth="1.2" />
          <path d="M3 31Q18 26 41 32" stroke={color} strokeWidth="1.2" />
          <rect x="24" y="17" width="8" height="6" stroke={color} strokeWidth="1.1" />
          <path d="M23 17L28 13L33 17" stroke={color} strokeWidth="1.1" />
          <path d="M14 24V15C14 12 16 12 16 15V24" stroke={color} strokeWidth="1.1" />
          <path d="M36 23V14C36 11 38 11 38 14V23" stroke={color} strokeWidth="1.1" />
          <path d="M6 38L16 30M15 39L24 30M25 39L33 31M34 39L40 32" stroke={color} strokeWidth="0.9" />
        </svg>
      );
    case 'vr':
      return (
        <svg viewBox="0 0 42 36" width={size * 1.05} height={size * 0.9} fill="none">
          <rect
            x="6"
            y="11"
            width="30"
            height="16"
            rx="4"
            stroke={color}
            strokeWidth="1.4"
          />
          <path
            d="M17 27L21 23L25 27"
            stroke={color}
            strokeWidth="1.2"
          />
          <circle cx="14.5" cy="19" r="3.5" stroke={color} strokeWidth="1.1" />
          <circle cx="27.5" cy="19" r="3.5" stroke={color} strokeWidth="1.1" />
          <path d="M9 11C11 6 31 6 33 11" stroke={color} strokeWidth="1.1" />
        </svg>
      );
    case 'cart':
      return (
        <svg viewBox="0 0 40 40" width={size} height={size} fill="none">
          <path
            d="M6 10H10L13 26H30L33 14H11"
            stroke={color}
            strokeWidth="1.35"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <line x1="12" y1="18" x2="32" y2="18" stroke={color} strokeWidth="1" />
          <line x1="13" y1="22" x2="31" y2="22" stroke={color} strokeWidth="1" />
          <line x1="18" y1="14" x2="18" y2="26" stroke={color} strokeWidth="1" />
          <line x1="25" y1="14" x2="25" y2="26" stroke={color} strokeWidth="1" />
          <circle cx="15" cy="31" r="2.2" stroke={color} strokeWidth="1.3" />
          <circle cx="28" cy="31" r="2.2" stroke={color} strokeWidth="1.3" />
        </svg>
      );
    case 'sprout':
      return (
        <svg viewBox="0 0 40 44" width={size} height={size * 1.1} fill="none">
          <path d="M20 38V14" stroke={color} strokeWidth="1.4" strokeLinecap="round" />
          <path
            d="M20 26C13 25 10 19 12 14C17 15 20 20 20 26Z"
            stroke={color}
            strokeWidth="1.25"
          />
          <path
            d="M20 21C27 20 30 14 28 9C23 10 20 15 20 21Z"
            stroke={color}
            strokeWidth="1.25"
          />
          <path
            d="M13 38C17 35 23 35 27 38"
            stroke={color}
            strokeWidth="1.2"
            strokeLinecap="round"
          />
        </svg>
      );
    case 'olive':
      return (
        <svg viewBox="0 0 42 46" width={size * 1.05} height={size * 1.15} fill="none">
          <path
            d="M12 38C16 27 22 18 30 9"
            stroke={color}
            strokeWidth="1.4"
            strokeLinecap="round"
          />
          <path
            d="M20 24C14 22 11 16 14 11C18 14 20 19 20 24Z"
            stroke={color}
            strokeWidth="1.2"
          />
          <path
            d="M25 17C21 13 20 8 24 5C27 8 27 13 25 17Z"
            stroke={color}
            strokeWidth="1.2"
          />
          <path
            d="M22 23C28 23 33 20 35 15C29 15 25 18 22 23Z"
            stroke={color}
            strokeWidth="1.2"
          />
          <ellipse cx="16" cy="29" rx="2.6" ry="3.6" transform="rotate(-20 16 29)" stroke={color} strokeWidth="1.2" />
          <ellipse cx="25" cy="28" rx="2.5" ry="3.4" transform="rotate(25 25 28)" stroke={color} strokeWidth="1.2" />
        </svg>
      );
    case 'network':
    default:
      return (
        <svg viewBox="0 0 40 40" width={size} height={size} fill="none">
          <circle cx="20" cy="12" r="3.5" stroke={color} strokeWidth="1.3" />
          <circle cx="11" cy="27" r="3" stroke={color} strokeWidth="1.3" />
          <circle cx="29" cy="27" r="3" stroke={color} strokeWidth="1.3" />
          <line x1="18" y1="15" x2="13" y2="24" stroke={color} strokeWidth="1.1" />
          <line x1="22" y1="15" x2="27" y2="24" stroke={color} strokeWidth="1.1" />
          <line x1="14" y1="27" x2="26" y2="27" stroke={color} strokeWidth="1.1" strokeDasharray="2 2" />
        </svg>
      );
  }
};

export const PhysicalSpine: React.FC<PhysicalSpineProps> = ({
  item,
  index = 0,
  isHovered = false,
  categoryAppearances = DEFAULT_CATEGORY_APPEARANCES,
  className = '',
}) => {
  const resolved = resolveBookAppearance(item, index, categoryAppearances);
  const { spineColor, material, spineTitle, typeCode, spineEmblem, isLight } = resolved;

  // High-contrast vintage ink or bright embossed gold leaf for crisp legibility on side spines
  const primaryInk = isLight ? '#1E1610' : '#F5E6C4';
  const secondaryInk = isLight ? 'rgba(30, 22, 16, 0.82)' : 'rgba(245, 230, 196, 0.88)';
  const ruleInk = isLight ? 'rgba(30, 22, 16, 0.35)' : 'rgba(245, 230, 196, 0.42)';
  const ribShadow = isLight
    ? 'inset 0 1px 1px rgba(255,255,255,0.6), 0 2px 3px rgba(30,20,10,0.28)'
    : 'inset 0 1px 1px rgba(255,235,190,0.28), 0 2px 4px rgba(0,0,0,0.65)';

  // Surface texture overlays per material finish
  const textureBackground =
    material === 'cloth'
      ? 'repeating-linear-gradient(0deg, rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 1px, transparent 1px, transparent 3px), repeating-linear-gradient(90deg, rgba(0,0,0,0.05) 0px, rgba(0,0,0,0.05) 1px, transparent 1px, transparent 3px)'
      : material === 'aged_paper' || material === 'textured_paper'
      ? 'radial-gradient(rgba(65, 45, 25, 0.08) 1px, transparent 0), linear-gradient(180deg, rgba(80,55,25,0.06) 0%, transparent 20%, transparent 80%, rgba(70,45,20,0.10) 100%)'
      : 'radial-gradient(rgba(0, 0, 0, 0.12) 1px, transparent 0)';

  const yearDisplay =
    item.id === 'item-04' && item.status.toLowerCase().includes('ongoing')
      ? 'ONGO'
      : (item.year || '2025').slice(0, 4);

  const progressPercent = Math.max(
    0,
    Math.min(100, item.readingProgress?.percent ?? 0)
  );

  // Split title cleanly across lines and adapt font-size to longest word so it never clips horizontally
  const words = spineTitle.split(/\s+/).filter(Boolean);
  const longestWordLen = words.reduce((max, w) => Math.max(max, w.length), 0);
  const titleFontSize =
    longestWordLen >= 12
      ? '8.5px'
      : longestWordLen >= 10
      ? '9.5px'
      : '11px';

  return (
    <div
      className={`relative h-full w-full select-none flex flex-col justify-between overflow-hidden rounded-t-[4px] rounded-b-[2px] transition-shadow duration-300 ${className}`}
      style={{
        backgroundColor: spineColor,
        color: primaryInk,
        boxShadow: isHovered
          ? '0 18px 30px -6px rgba(0,0,0,0.65), -3px 0 8px rgba(0,0,0,0.45), 3px 0 8px rgba(0,0,0,0.45)'
          : '-2px 0 5px rgba(0,0,0,0.42), 2px 0 5px rgba(0,0,0,0.42), 0 6px 12px rgba(0,0,0,0.35)',
      }}
    >
      {/* 1. Cylindrical 3D Spine Curvature Shading (Kept subtle in the center 84% so text is 100% readable) */}
      <div
        className="absolute inset-0 pointer-events-none z-10"
        style={{
          background: isLight
            ? 'linear-gradient(90deg, rgba(35,24,14,0.32) 0%, rgba(35,24,14,0.04) 9%, rgba(255,255,255,0.22) 22%, rgba(255,255,255,0.04) 55%, rgba(35,24,14,0.06) 90%, rgba(25,16,8,0.38) 100%)'
            : 'linear-gradient(90deg, rgba(0,0,0,0.48) 0%, rgba(0,0,0,0.08) 9%, rgba(255,255,255,0.10) 22%, rgba(255,255,255,0.02) 55%, rgba(0,0,0,0.08) 90%, rgba(0,0,0,0.52) 100%)',
        }}
      />

      {/* 2. Material Grain & Patina Overlay */}
      <div
        className="absolute inset-0 pointer-events-none z-10 opacity-70"
        style={{
          backgroundImage: textureBackground,
          backgroundSize: material === 'cloth' ? '4px 4px' : '12px 12px, 100% 100%',
        }}
      />

      {/* 3. Aged Top & Bottom Crown Wear + Headband */}
      <div
        className="absolute top-0 inset-x-0 h-[5px] pointer-events-none z-20"
        style={{
          background:
            'linear-gradient(180deg, rgba(255,245,220,0.28) 0%, rgba(0,0,0,0.35) 100%)',
        }}
      />
      <div
        className="absolute bottom-0 inset-x-0 h-[5px] pointer-events-none z-20"
        style={{
          background:
            'linear-gradient(0deg, rgba(0,0,0,0.55) 0%, rgba(255,245,220,0.12) 100%)',
        }}
      />

      {/* Vertical French-Groove Binding Creases */}
      <div
        className="absolute inset-y-0 left-[3px] w-[1px] pointer-events-none z-20"
        style={{ backgroundColor: isLight ? 'rgba(40,28,16,0.15)' : 'rgba(0,0,0,0.32)' }}
      />
      <div
        className="absolute inset-y-0 right-[3px] w-[1px] pointer-events-none z-20"
        style={{ backgroundColor: isLight ? 'rgba(40,28,16,0.15)' : 'rgba(0,0,0,0.32)' }}
      />

      {/* 4. Top Raised Bookbinding Bands (Cord Ribs) */}
      <div className="relative z-20 pt-3.5 flex flex-col gap-2">
        <div
          className="w-full h-[3px]"
          style={{
            backgroundColor: spineColor,
            boxShadow: ribShadow,
            borderTop: `1px solid ${ruleInk}`,
            borderBottom: `1px solid rgba(0,0,0,0.35)`,
          }}
        />
        <div
          className="w-full h-[4px] mt-1.5"
          style={{
            backgroundColor: spineColor,
            boxShadow: ribShadow,
            borderTop: `1px solid ${ruleInk}`,
            borderBottom: `1px solid rgba(0,0,0,0.35)`,
          }}
        />
      </div>

      {/* 5. Upper Section: Stamped Bookbinder Title Plate (Crisp, High-Contrast & Readable) */}
      <div className="relative z-20 px-1 pt-2.5 flex flex-col items-center text-center">
        <div
          className="w-full py-1.5 px-0.5 rounded-[1px] border-t border-b flex flex-col items-center justify-center"
          style={{
            borderColor: ruleInk,
            backgroundColor: isLight
              ? 'rgba(255, 252, 244, 0.28)'
              : 'rgba(0, 0, 0, 0.22)',
          }}
        >
          <div
            className="font-serif font-semibold uppercase tracking-[0.03em] leading-[1.22] w-full text-center"
            style={{
              fontSize: titleFontSize,
              color: primaryInk,
              textShadow: isLight
                ? '0 1px 0 rgba(255,255,255,0.65)'
                : '0 1px 2px rgba(0,0,0,0.9)',
              wordBreak: 'break-word',
              hyphens: 'auto',
            }}
          >
            {spineTitle}
          </div>
        </div>
      </div>

      {/* 6. Middle Section: Domain Line-Art Illustration / Emblem */}
      <div className="relative z-20 my-auto py-1.5 flex items-center justify-center opacity-95">
        <SpineEmblemSvg type={spineEmblem} color={primaryInk} size={32} />
      </div>

      {/* 7. Lower Section: Type Code, Year & Subtle Reading Progress Strip */}
      <div className="relative z-20 pb-3 flex flex-col items-center">
        {/* Subtle Reading Progress Bar on Spine */}
        <div className="w-[76%] mb-2 flex flex-col items-center gap-0.5">
          <div
            className="w-full h-[2.5px] rounded-full overflow-hidden"
            style={{
              backgroundColor: isLight
                ? 'rgba(30,22,16,0.16)'
                : 'rgba(255,255,255,0.16)',
            }}
          >
            <div
              className="h-full transition-all duration-300"
              style={{
                width: `${progressPercent}%`,
                backgroundColor:
                  progressPercent >= 100
                    ? isLight
                      ? '#234233'
                      : '#8CE0A8'
                    : primaryInk,
              }}
            />
          </div>
          {progressPercent > 0 && (
            <span
              className="font-mono text-[7.5px] tracking-wider opacity-85"
              style={{ color: secondaryInk }}
            >
              {progressPercent}%
            </span>
          )}
        </div>

        {/* Raised Binding Rib Above Footer */}
        <div
          className="w-full h-[4px] mb-2"
          style={{
            backgroundColor: spineColor,
            boxShadow: ribShadow,
            borderTop: `1px solid ${ruleInk}`,
            borderBottom: `1px solid rgba(0,0,0,0.35)`,
          }}
        />

        <div
          className="w-[82%] border-t border-b py-1.5 flex flex-col items-center justify-center gap-0.5"
          style={{ borderColor: ruleInk }}
        >
          <span
            className="font-serif text-[10px] font-bold tracking-[0.14em] uppercase leading-none"
            style={{ color: primaryInk }}
          >
            {typeCode}
          </span>
          <span
            className="font-serif text-[10px] font-medium tracking-[0.1em] uppercase leading-none mt-0.5"
            style={{ color: secondaryInk }}
          >
            {yearDisplay}
          </span>
        </div>

        {/* Bottom Cord Rib */}
        <div
          className="w-full h-[3px] mt-2"
          style={{
            backgroundColor: spineColor,
            boxShadow: ribShadow,
            borderTop: `1px solid ${ruleInk}`,
            borderBottom: `1px solid rgba(0,0,0,0.4)`,
          }}
        />
      </div>

      {/* Bookmark Ribbon Indicator if Currently Reading */}
      {item.readingStatus === 'reading' && (
        <div
          className="absolute top-0 right-2 w-1.5 h-3.5 z-30 shadow-xs"
          style={{
            backgroundColor: '#9E2A22',
            clipPath: 'polygon(0 0, 100% 0, 100% 100%, 50% 78%, 0 100%)',
          }}
          title="Currently Reading"
        />
      )}
    </div>
  );
};
