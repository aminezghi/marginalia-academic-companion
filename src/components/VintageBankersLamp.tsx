import React, { useState } from 'react';
import { playTactileClick } from '../utils/sound';

interface VintageBankersLampProps {
  isLit: boolean;
  onToggle: () => void;
  className?: string;
}

/**
 * Classic 1909 Emeralite Banker's Desk Lamp
 * Features an authentic forest emerald cased glass shade, stepped heavy brass base,
 * and an interactive brass pull-chain with realistic physics and tactile audio.
 */
export const VintageBankersLamp: React.FC<VintageBankersLampProps> = ({
  isLit,
  onToggle,
  className = '',
}) => {
  const [isPulling, setIsPulling] = useState(false);

  const handlePullChain = (e: React.MouseEvent | React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsPulling(true);
    playTactileClick();
    onToggle();
    setTimeout(() => setIsPulling(false), 280);
  };

  return (
    <div
      data-lamp="true"
      data-shelf-interactive="true"
      className={`relative select-none flex flex-col items-center group cursor-pointer pointer-events-auto ${className}`}
      role="button"
      tabIndex={0}
      aria-label="Vintage Emeralite Banker's Lamp. Click or pull chain to toggle Nocturne Night Mode"
      aria-pressed={isLit}
      onMouseDown={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
      onTouchStart={(e) => e.stopPropagation()}
      onClick={handlePullChain}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handlePullChain(e as unknown as React.MouseEvent);
        }
      }}
    >
      {/* Tooltip hint on hover */}
      <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded bg-[#181614]/95 text-[#F4F0E6] text-[10px] font-mono whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none shadow-xl border border-[#3E382E] z-50">
        <span className="text-[#10B981] font-semibold">Emeralite Banker's Lamp</span>
        <span className="opacity-75 ml-1.5">· Pull chain: {isLit ? 'Day Study' : 'Night Mode'}</span>
      </div>

      {/* SVG DESK LAMP ILLUSTRATION */}
      <svg
        viewBox="0 0 110 162"
        className="w-20 sm:w-24 md:w-26 h-auto overflow-visible drop-shadow-md cursor-pointer"
        fill="none"
      >
        <defs>
          {/* Authentic Brass Metallic Gradients */}
          <linearGradient id="brassMetallic" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#E2C982" />
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

          {/* Emeralite Forest Green Cased Glass Gradients */}
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

          {/* Warm Amber Filament Glow */}
          <radialGradient id="bulbGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFFBEB" stopOpacity="1" />
            <stop offset="35%" stopColor="#FDE68A" stopOpacity="0.9" />
            <stop offset="75%" stopColor="#F59E0B" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#B45309" stopOpacity="0" />
          </radialGradient>

          {/* Ambient Study Light Cone onto Desk */}
          <radialGradient id="coneGlow" cx="50%" cy="0%" r="100%">
            <stop offset="0%" stopColor="#D1FAE5" stopOpacity="0.55" />
            <stop offset="35%" stopColor="#A7F3D0" stopOpacity="0.22" />
            <stop offset="75%" stopColor="#F59E0B" stopOpacity="0.06" />
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
        {/* CONTACT SHADOW UNDER BASE (Resting on Wooden Shelf) */}
        {/* ==================================================== */}
        <ellipse cx="55" cy="158" rx="36" ry="4" fill="rgba(0,0,0,0.48)" />

        {/* ==================================================== */}
        {/* STEPPED HEAVY BRASS BASE (Sits Flush on Wood Plank) */}
        {/* ==================================================== */}
        <ellipse cx="55" cy="152" rx="34" ry="7" fill="url(#brassBase)" />
        <path
          d="M 21 152 C 21 154 36 158 55 158 C 74 158 89 154 89 152 L 89 155 C 89 157 74 161 55 161 C 36 161 21 157 21 155 Z"
          fill="#4A340C"
        />
        <ellipse cx="55" cy="148" rx="27" ry="5.5" fill="url(#brassMetallic)" />
        <ellipse cx="55" cy="144" rx="19" ry="4" fill="url(#brassBase)" />
        <ellipse cx="55" cy="140" rx="12" ry="3" fill="#D4AF37" />

        {/* ==================================================== */}
        {/* CURVED BRASS GOOSENECK COLUMN & SWIVEL YOKE */}
        {/* ==================================================== */}
        <path
          d="M 52 140 L 52 110 Q 52 82 55 68"
          stroke="url(#brassMetallic)"
          strokeWidth="6"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M 54 140 L 54 110 Q 54 82 57 68"
          stroke="#FCE7B0"
          strokeWidth="1.2"
          strokeLinecap="round"
          fill="none"
          opacity="0.75"
        />

        {/* Decorative Swivel Turnkey Mechanism on Stem */}
        <rect x="47" y="99" width="12" height="6" rx="1.5" fill="url(#brassBase)" stroke="#3E2B08" strokeWidth="0.6" />
        <circle cx="59" cy="102" r="3.5" fill="#C9A354" stroke="#4A340C" strokeWidth="0.8" />

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
        {/* EMERALD GREEN CASED GLASS BANKER'S SHADE */}
        {/* ==================================================== */}
        <g className="transition-all duration-300">
          <path
            d="M 23 58 C 23 40 40 34 55 34 C 70 34 87 40 87 58 C 87 64 83 67 79 67 L 31 67 C 27 67 23 64 23 58 Z"
            fill={isLit ? 'url(#emeraldGlassLit)' : 'url(#emeraldGlassOff)'}
            stroke={isLit ? '#10B981' : '#0E301F'}
            strokeWidth="1.5"
            style={{
              filter: isLit ? 'drop-shadow(0 0 12px rgba(52, 211, 153, 0.8))' : 'none',
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

          {/* Shade Bottom Lip / Opal White Inner Casing Ring */}
          <ellipse
            cx="55"
            cy="66"
            rx="27"
            ry="4.5"
            fill={isLit ? '#FEF3C7' : '#092416'}
            stroke={isLit ? '#F59E0B' : '#061A10'}
            strokeWidth="1"
          />

          {/* Incandescent Bulb Filament when lit */}
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
            transform: isPulling ? 'translateY(6px)' : 'translateY(0)',
          }}
        >
          <line
            x1="64"
            y1="67"
            x2="64"
            y2="94"
            stroke="#99742B"
            strokeWidth="1.2"
            strokeDasharray="2.2, 1.2"
          />
          <circle
            cx="64"
            cy="97"
            r="3.2"
            fill="url(#brassBase)"
            stroke="#4A340C"
            strokeWidth="0.8"
            className="group-hover:scale-125 transition-transform origin-center"
          />
          <circle cx="63.2" cy="96" r="0.8" fill="#FFF" opacity="0.75" />
        </g>
      </svg>
    </div>
  );
};
