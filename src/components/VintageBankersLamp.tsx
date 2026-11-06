import React, { useState, useEffect } from 'react';
import { playTactileClick } from '../utils/sound';

export type BankersLampStyle = 'emerald' | 'amber' | 'oxford';

export interface LampStyleDefinition {
  id: BankersLampStyle;
  name: string;
  subtitle: string;
  shadeColor: string;
}

export const BANKER_LAMP_STYLES: LampStyleDefinition[] = [
  {
    id: 'emerald',
    name: "Emeralite Banker's",
    subtitle: 'Classic 1909 Forest Emerald Cased Glass',
    shadeColor: '#10B981',
  },
  {
    id: 'amber',
    name: 'Art Deco Cognac',
    subtitle: 'Warm Honey Amber Smoked Glass',
    shadeColor: '#F59E0B',
  },
  {
    id: 'oxford',
    name: 'Oxford Bodleian Brass',
    subtitle: 'Burnished Antique Brass Study Dome',
    shadeColor: '#D4AF37',
  },
];

interface VintageBankersLampProps {
  isLit: boolean;
  onToggle: () => void;
  lampStyle?: BankersLampStyle;
  onChangeLampStyle?: (style: BankersLampStyle) => void;
  className?: string;
}

export const VintageBankersLamp: React.FC<VintageBankersLampProps> = ({
  isLit,
  onToggle,
  lampStyle: controlledStyle,
  onChangeLampStyle,
  className = '',
}) => {
  const [internalStyle, setInternalStyle] = useState<BankersLampStyle>(() => {
    if (typeof window === 'undefined') return 'emerald';
    return (localStorage.getItem('marginalia_lamp_style') as BankersLampStyle) || 'emerald';
  });

  const activeStyle = controlledStyle || internalStyle;
  const [isPulling, setIsPulling] = useState(false);
  const [turnkeyAngle, setTurnkeyAngle] = useState(0);

  useEffect(() => {
    if (controlledStyle) {
      setInternalStyle(controlledStyle);
    }
  }, [controlledStyle]);

  const handleToggleLit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPulling(true);
    playTactileClick();
    onToggle();
    setTimeout(() => setIsPulling(false), 280);
  };

  const handleCycleStyle = (e: React.MouseEvent) => {
    e.stopPropagation();
    playTactileClick();
    setTurnkeyAngle((prev) => prev + 90);
    const styles: BankersLampStyle[] = ['emerald', 'amber', 'oxford'];
    const currentIdx = styles.indexOf(activeStyle);
    const nextStyle = styles[(currentIdx + 1) % styles.length];
    setInternalStyle(nextStyle);
    if (typeof window !== 'undefined') {
      localStorage.setItem('marginalia_lamp_style', nextStyle);
    }
    onChangeLampStyle?.(nextStyle);
  };

  const currentDef = BANKER_LAMP_STYLES.find((s) => s.id === activeStyle) || BANKER_LAMP_STYLES[0];

  return (
    <div
      className={`relative select-none flex flex-col items-center ${className}`}
      role="region"
      aria-label="Vintage Banker's Desk Lamp"
    >
      {/* Tooltip hint on hover */}
      <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded bg-[#181614]/95 text-[#F4F0E6] text-[10px] font-mono whitespace-nowrap opacity-0 hover:opacity-100 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none shadow-xl border border-[#3E382E] z-50">
        <span className="text-[#D4AF37] font-semibold">{currentDef.name}</span>
        <span className="opacity-60 ml-1.5">· Click chain: {isLit ? 'Day' : 'Night'} · Key: Style</span>
      </div>

      {/* SVG DESK LAMP ILLUSTRATION */}
      <svg
        viewBox="0 0 110 160"
        className="w-20 sm:w-24 md:w-28 h-auto overflow-visible drop-shadow-md cursor-pointer"
        fill="none"
        onClick={handleToggleLit}
      >
        <defs>
          {/* Brass Gradients */}
          <linearGradient id="brassMetallic" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#DFC37C" />
            <stop offset="35%" stopColor="#B38A3A" />
            <stop offset="70%" stopColor="#7E5F22" />
            <stop offset="100%" stopColor="#D8BA6F" />
          </linearGradient>

          <linearGradient id="brassBase" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#6E511D" />
            <stop offset="25%" stopColor="#C9A354" />
            <stop offset="50%" stopColor="#EFD99B" />
            <stop offset="75%" stopColor="#A88232" />
            <stop offset="100%" stopColor="#553E13" />
          </linearGradient>

          {/* 1. EMERALD GREEN GLASS */}
          <linearGradient id="emeraldGlassOff" x1="0%" y1="0%" x2="100%" y2="80%">
            <stop offset="0%" stopColor="#1E4D34" />
            <stop offset="30%" stopColor="#123B25" />
            <stop offset="70%" stopColor="#0B2618" />
            <stop offset="100%" stopColor="#071910" />
          </linearGradient>
          <radialGradient id="emeraldGlassLit" cx="50%" cy="60%" r="65%">
            <stop offset="0%" stopColor="#6EE7B7" />
            <stop offset="25%" stopColor="#10B981" />
            <stop offset="65%" stopColor="#065F46" />
            <stop offset="100%" stopColor="#022C22" />
          </radialGradient>

          {/* 2. AMBER COGNAC GLASS */}
          <linearGradient id="amberGlassOff" x1="0%" y1="0%" x2="100%" y2="80%">
            <stop offset="0%" stopColor="#5B3618" />
            <stop offset="30%" stopColor="#3F220B" />
            <stop offset="70%" stopColor="#291404" />
            <stop offset="100%" stopColor="#170902" />
          </linearGradient>
          <radialGradient id="amberGlassLit" cx="50%" cy="60%" r="65%">
            <stop offset="0%" stopColor="#FDE68A" />
            <stop offset="25%" stopColor="#F59E0B" />
            <stop offset="65%" stopColor="#B45309" />
            <stop offset="100%" stopColor="#451A03" />
          </radialGradient>

          {/* 3. OXFORD SOLID BRASS DOME */}
          <linearGradient id="oxfordBrassOff" x1="0%" y1="0%" x2="100%" y2="80%">
            <stop offset="0%" stopColor="#B38A3A" />
            <stop offset="30%" stopColor="#7E5F22" />
            <stop offset="70%" stopColor="#4A340C" />
            <stop offset="100%" stopColor="#2E1F05" />
          </linearGradient>
          <radialGradient id="oxfordBrassLit" cx="50%" cy="60%" r="65%">
            <stop offset="0%" stopColor="#FEF08A" />
            <stop offset="30%" stopColor="#EAB308" />
            <stop offset="70%" stopColor="#A16207" />
            <stop offset="100%" stopColor="#582A03" />
          </radialGradient>

          {/* Warm Amber Filament Glow */}
          <radialGradient id="bulbGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFFBEB" stopOpacity="1" />
            <stop offset="35%" stopColor="#FDE68A" stopOpacity="0.9" />
            <stop offset="75%" stopColor="#F59E0B" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#B45309" stopOpacity="0" />
          </radialGradient>

          {/* Wide Study Light Cone */}
          <radialGradient id="coneGlow" cx="50%" cy="0%" r="100%">
            <stop offset="0%" stopColor={activeStyle === 'emerald' ? '#D1FAE5' : activeStyle === 'amber' ? '#FEF3C7' : '#FFFBEB'} stopOpacity="0.65" />
            <stop offset="40%" stopColor={activeStyle === 'emerald' ? '#A7F3D0' : activeStyle === 'amber' ? '#FCD34D' : '#FDE68A'} stopOpacity="0.25" />
            <stop offset="80%" stopColor="#F59E0B" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#B45309" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* ==================================================== */}
        {/* RADIANT CONE OF LIGHT WHEN LIT */}
        {/* ==================================================== */}
        {isLit && (
          <g className="transition-opacity duration-500 animate-pulse pointer-events-none" style={{ animationDuration: '4s' }}>
            <path
              d="M 24 64 L -40 180 L 150 180 L 86 64 Z"
              fill="url(#coneGlow)"
              className="opacity-75"
            />
            <ellipse cx="55" cy="80" rx="42" ry="16" fill="url(#bulbGlow)" className="opacity-85" />
          </g>
        )}

        {/* ==================================================== */}
        {/* STEPPED HEAVY BRASS BASE */}
        {/* ==================================================== */}
        <ellipse cx="55" cy="150" rx="34" ry="7" fill="url(#brassBase)" />
        <path
          d="M 21 150 C 21 152 36 156 55 156 C 74 156 89 152 89 150 L 89 153 C 89 155 74 159 55 159 C 36 159 21 155 21 153 Z"
          fill="#4A340C"
        />
        <ellipse cx="55" cy="146" rx="27" ry="5.5" fill="url(#brassMetallic)" />
        <ellipse cx="55" cy="142" rx="19" ry="4" fill="url(#brassBase)" />
        <ellipse cx="55" cy="138" rx="12" ry="3" fill="#D4AF37" />

        {/* ==================================================== */}
        {/* CURVED BRASS GOOSENECK COLUMN & SWIVEL ARMS */}
        {/* ==================================================== */}
        <path
          d="M 52 138 L 52 108 Q 52 80 55 68"
          stroke="url(#brassMetallic)"
          strokeWidth="6"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M 54 138 L 54 108 Q 54 80 57 68"
          stroke="#FCE7B0"
          strokeWidth="1.2"
          strokeLinecap="round"
          fill="none"
          opacity="0.75"
        />

        {/* INTERACTIVE ROTATING TURNKEY MECHANISM (Cycles Lamp Styles on Click) */}
        <g
          className="cursor-pointer group/turnkey"
          onClick={handleCycleStyle}
          aria-label="Turn Key: Switch Lamp Style (Emerald · Amber · Oxford Brass)"
        >
          <title>Turn Key: Switch Lamp Style (Emerald · Amber · Oxford Brass)</title>
          <rect x="47" y="97" width="12" height="6" rx="1.5" fill="url(#brassBase)" stroke="#3E2B08" strokeWidth="0.6" />
          <g
            style={{
              transform: `rotate(${turnkeyAngle}deg)`,
              transformOrigin: '59px 100px',
              transition: 'transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
            }}
          >
            <circle cx="59" cy="100" r="4" fill="#C9A354" stroke="#4A340C" strokeWidth="0.8" />
            <line x1="56" y1="100" x2="62" y2="100" stroke="#3D2909" strokeWidth="1" />
            <line x1="59" y1="97" x2="59" y2="103" stroke="#3D2909" strokeWidth="1" />
          </g>
        </g>

        {/* Twin Curved Arched Yoke Holding the Shade */}
        <path
          d="M 28 58 Q 55 46 82 58"
          stroke="url(#brassBase)"
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
        />
        <circle cx="28" cy="58" r="3.2" fill="#DFC37C" stroke="#5E4314" strokeWidth="1" />
        <circle cx="82" cy="58" r="3.2" fill="#DFC37C" stroke="#5E4314" strokeWidth="1" />

        {/* ==================================================== */}
        {/* SHADE (EMERALD / AMBER / OXFORD BRASS) */}
        {/* ==================================================== */}
        <g className="transition-all duration-300">
          <path
            d="M 23 58 C 23 40 40 34 55 34 C 70 34 87 40 87 58 C 87 64 83 67 79 67 L 31 67 C 27 67 23 64 23 58 Z"
            fill={
              activeStyle === 'emerald'
                ? isLit
                  ? 'url(#emeraldGlassLit)'
                  : 'url(#emeraldGlassOff)'
                : activeStyle === 'amber'
                ? isLit
                  ? 'url(#amberGlassLit)'
                  : 'url(#amberGlassOff)'
                : isLit
                ? 'url(#oxfordBrassLit)'
                : 'url(#oxfordBrassOff)'
            }
            stroke={
              activeStyle === 'emerald'
                ? isLit ? '#10B981' : '#0E301F'
                : activeStyle === 'amber'
                ? isLit ? '#F59E0B' : '#3E2108'
                : isLit ? '#FBBF24' : '#4E3810'
            }
            strokeWidth="1.5"
            style={{
              filter: isLit
                ? activeStyle === 'emerald'
                  ? 'drop-shadow(0 0 12px rgba(52, 211, 153, 0.8))'
                  : activeStyle === 'amber'
                  ? 'drop-shadow(0 0 12px rgba(245, 158, 11, 0.85))'
                  : 'drop-shadow(0 0 12px rgba(250, 204, 21, 0.85))'
                : 'none',
            }}
          />

          {/* Top Specular Sheen Highlight */}
          <path
            d="M 33 46 C 42 40 68 40 77 46"
            stroke="white"
            strokeWidth="1.8"
            strokeLinecap="round"
            opacity={isLit ? '0.65' : '0.22'}
            fill="none"
          />

          {/* Shade Bottom Lip */}
          <ellipse
            cx="55"
            cy="66"
            rx="27"
            ry="4.5"
            fill={isLit ? '#FEF3C7' : activeStyle === 'emerald' ? '#092416' : activeStyle === 'amber' ? '#261203' : '#3D2808'}
            stroke={isLit ? '#F59E0B' : '#061A10'}
            strokeWidth="1"
          />

          {/* Incandescent Filament when lit */}
          {isLit && (
            <g>
              <ellipse cx="55" cy="65" rx="10" ry="3" fill="#FFFBEB" />
              <circle cx="55" cy="63" r="4.5" fill="#FEF08A" opacity="0.9" />
              <path
                d="M 53 62 Q 55 58 57 62"
                stroke="#F59E0B"
                strokeWidth="1.2"
                fill="none"
              />
            </g>
          )}
        </g>

        {/* ==================================================== */}
        {/* INTERACTIVE BRASS PULL CHAIN */}
        {/* ==================================================== */}
        <g
          className="transition-transform duration-200"
          style={{
            transform: isPulling ? 'translateY(5px)' : 'translateY(0)',
          }}
        >
          <line
            x1="64"
            y1="67"
            x2="64"
            y2="92"
            stroke="#99742B"
            strokeWidth="1.2"
            strokeDasharray="2.2, 1.2"
          />
          <circle
            cx="64"
            cy="95"
            r="3"
            fill="url(#brassBase)"
            stroke="#4A340C"
            strokeWidth="0.8"
            className="hover:scale-125 transition-transform origin-center"
          />
          <circle cx="63.2" cy="94" r="0.8" fill="#FFF" opacity="0.75" />
        </g>
      </svg>

      {/* Tactile Controls: Pull Chain + Turnkey Style Switch */}
      <div className="flex items-center gap-1.5 mt-1">
        <button
          type="button"
          onClick={handleToggleLit}
          className={`text-[9px] font-mono tracking-wider transition-colors cursor-pointer px-1.5 py-0.5 rounded border ${
            isLit
              ? 'bg-[#F59E0B]/15 border-[#F59E0B]/30 text-[#F59E0B] font-semibold'
              : 'border-[#141414]/15 text-[#8C8275] hover:text-[#141414] hover:border-[#141414]/30'
          }`}
          title="Click to toggle desk lamp & night mode"
        >
          {isLit ? '● NOCTURNE ON' : '○ PULL CHAIN'}
        </button>

        <button
          type="button"
          onClick={handleCycleStyle}
          className="text-[9px] font-mono tracking-wider text-[#8C8275] hover:text-[#D4AF37] px-1 py-0.5 transition-colors cursor-pointer"
          title={`Switch lamp style (Current: ${currentDef.name})`}
          aria-label="Cycle lamp style"
        >
          ⚙ {activeStyle.toUpperCase()}
        </button>
      </div>
    </div>
  );
};
