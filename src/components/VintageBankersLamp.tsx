import React, { useState } from 'react';
import { playTactileClick } from '../utils/sound';

interface VintageBankersLampProps {
  isLit: boolean;
  onToggle: () => void;
  className?: string;
}

export const VintageBankersLamp: React.FC<VintageBankersLampProps> = ({
  isLit,
  onToggle,
  className = '',
}) => {
  const [isPulling, setIsPulling] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPulling(true);
    playTactileClick();
    onToggle();
    setTimeout(() => setIsPulling(false), 280);
  };

  return (
    <div
      className={`relative select-none cursor-pointer group flex flex-col items-center ${className}`}
      onClick={handleClick}
      title={isLit ? "Extinguish Desk Lamp (Switch to Day Study)" : "Illuminate Desk Lamp (Switch to Nocturne Library Night Mode)"}
      role="button"
      tabIndex={0}
      aria-pressed={isLit}
      aria-label="Vintage Banker's Desk Lamp · Toggle Nocturne Night Mode"
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick(e as unknown as React.MouseEvent);
        }
      }}
    >
      {/* Tooltip hint on hover */}
      <div className="absolute -top-9 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded bg-[#181614]/90 text-[#F4F0E6] text-[10px] font-mono whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none shadow-md border border-[#3E382E] z-50">
        {isLit ? '💡 Pull chain: Extinguish lamp' : '💡 Pull chain: Light up night mode'}
      </div>

      {/* SVG DESK LAMP ILLUSTRATION */}
      <svg
        viewBox="0 0 110 160"
        className="w-20 sm:w-24 md:w-28 h-auto overflow-visible drop-shadow-md"
        fill="none"
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

          {/* Emerald Green Glass Shade Gradients */}
          {/* Unlit State */}
          <linearGradient id="emeraldGlassOff" x1="0%" y1="0%" x2="100%" y2="80%">
            <stop offset="0%" stopColor="#1E4D34" />
            <stop offset="30%" stopColor="#123B25" />
            <stop offset="70%" stopColor="#0B2618" />
            <stop offset="100%" stopColor="#071910" />
          </linearGradient>

          {/* Lit State */}
          <radialGradient id="emeraldGlassLit" cx="50%" cy="60%" r="65%">
            <stop offset="0%" stopColor="#6EE7B7" />
            <stop offset="25%" stopColor="#10B981" />
            <stop offset="65%" stopColor="#065F46" />
            <stop offset="100%" stopColor="#022C22" />
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
            <stop offset="0%" stopColor="#FEF3C7" stopOpacity="0.65" />
            <stop offset="40%" stopColor="#FCD34D" stopOpacity="0.25" />
            <stop offset="80%" stopColor="#F59E0B" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#B45309" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* ==================================================== */}
        {/* RADIANT CONE OF LIGHT WHEN LIT */}
        {/* ==================================================== */}
        {isLit && (
          <g className="transition-opacity duration-500 animate-pulse pointer-events-none" style={{ animationDuration: '4s' }}>
            {/* Soft Wide Illumination Angle downwards */}
            <path
              d="M 24 64 L -40 180 L 150 180 L 86 64 Z"
              fill="url(#coneGlow)"
              className="opacity-70"
            />
            {/* Concentrated light directly underneath the shade */}
            <ellipse cx="55" cy="80" rx="42" ry="16" fill="url(#bulbGlow)" className="opacity-80" />
          </g>
        )}

        {/* ==================================================== */}
        {/* STEPPED HEAVY BRASS BASE */}
        {/* ==================================================== */}
        {/* Base Bottom Weighted Rim */}
        <ellipse cx="55" cy="150" rx="34" ry="7" fill="url(#brassBase)" />
        <path
          d="M 21 150 C 21 152 36 156 55 156 C 74 156 89 152 89 150 L 89 153 C 89 155 74 159 55 159 C 36 159 21 155 21 153 Z"
          fill="#4A340C"
        />

        {/* Middle Tier Ring */}
        <ellipse cx="55" cy="146" rx="27" ry="5.5" fill="url(#brassMetallic)" />

        {/* Top Tier Pedestal */}
        <ellipse cx="55" cy="142" rx="19" ry="4" fill="url(#brassBase)" />
        <ellipse cx="55" cy="138" rx="12" ry="3" fill="#D4AF37" />

        {/* ==================================================== */}
        {/* CURVED BRASS GOOSENECK COLUMN & SWIVEL ARMS */}
        {/* ==================================================== */}
        {/* Center Vertical Support Stem */}
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

        {/* Swivel Turnkey Mechanism on Stem */}
        <rect x="48" y="98" width="10" height="5" rx="1.5" fill="url(#brassBase)" />
        <circle cx="58" cy="100.5" r="3" fill="#C9A354" stroke="#4A340C" strokeWidth="0.8" />

        {/* Twin Curved Arched Yoke Holding the Shade */}
        <path
          d="M 28 58 Q 55 46 82 58"
          stroke="url(#brassBase)"
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
        />

        {/* Swivel Pivot Knobs on Left & Right of Shade */}
        <circle cx="28" cy="58" r="3.2" fill="#DFC37C" stroke="#5E4314" strokeWidth="1" />
        <circle cx="82" cy="58" r="3.2" fill="#DFC37C" stroke="#5E4314" strokeWidth="1" />

        {/* ==================================================== */}
        {/* EMERALD GREEN CASED GLASS BANKER'S SHADE */}
        {/* ==================================================== */}
        <g className="transition-all duration-300">
          {/* Outer Glass Casing */}
          <path
            d="M 23 58 C 23 40 40 34 55 34 C 70 34 87 40 87 58 C 87 64 83 67 79 67 L 31 67 C 27 67 23 64 23 58 Z"
            fill={isLit ? "url(#emeraldGlassLit)" : "url(#emeraldGlassOff)"}
            stroke={isLit ? "#10B981" : "#0E301F"}
            strokeWidth="1.5"
            style={{
              filter: isLit ? 'drop-shadow(0 0 10px rgba(52, 211, 153, 0.75))' : 'none',
            }}
          />

          {/* Glass Top Specular Sheen Highlight */}
          <path
            d="M 33 46 C 42 40 68 40 77 46"
            stroke="white"
            strokeWidth="1.8"
            strokeLinecap="round"
            opacity={isLit ? "0.6" : "0.22"}
            fill="none"
          />

          {/* Shade Bottom Lip / White Inner Casing Ring */}
          <ellipse
            cx="55"
            cy="66"
            rx="27"
            ry="4.5"
            fill={isLit ? "#FEF3C7" : "#092416"}
            stroke={isLit ? "#F59E0B" : "#061A10"}
            strokeWidth="1"
          />

          {/* Incandescent Bulb Filament visible when lit */}
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
          {/* Hanging Brass Beaded Chain */}
          <line
            x1="64"
            y1="67"
            x2="64"
            y2="92"
            stroke="#99742B"
            strokeWidth="1.2"
            strokeDasharray="2.2, 1.2"
          />
          {/* Pull Chain End Ball Fob */}
          <circle
            cx="64"
            cy="95"
            r="3"
            fill="url(#brassBase)"
            stroke="#4A340C"
            strokeWidth="0.8"
            className="group-hover:scale-125 transition-transform origin-center"
          />
          <circle cx="63.2" cy="94" r="0.8" fill="#FFF" opacity="0.75" />
        </g>
      </svg>

      {/* Tactile Status Label below base */}
      <span
        className={`mt-1 text-[9px] font-mono tracking-wider transition-colors duration-200 ${
          isLit
            ? 'text-[#F59E0B] font-semibold'
            : 'text-[#8C8275] group-hover:text-[#1F3FB0]'
        }`}
      >
        {isLit ? '● NOCTURNE ON' : '○ PULL CHAIN'}
      </span>
    </div>
  );
};
