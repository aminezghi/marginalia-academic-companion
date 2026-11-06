import React from 'react';
import { BookOpen } from 'lucide-react';

interface VintageSkeletonProps {
  label?: string;
  fullscreen?: boolean;
}

export const VintageSkeleton: React.FC<VintageSkeletonProps> = ({
  label = 'Retrieving archival volume…',
  fullscreen = false,
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 bg-[#EDE8DD]/90 backdrop-blur-sm select-none animate-fadeIn ${
        fullscreen ? 'fixed inset-0 z-50 min-h-screen' : 'min-h-[380px] w-full rounded border border-[#141414]/15'
      }`}
    >
      <div className="relative flex flex-col items-center">
        {/* Animated antique book spine glow */}
        <div className="relative mb-4 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-[#D4AF37]/20 blur-md animate-pulse" />
          <div className="relative p-3 rounded-full border border-[#D4AF37]/50 bg-[#E7E2D6] shadow-sm">
            <BookOpen className="w-6 h-6 text-[#1F3FB0] animate-pulse" />
          </div>
        </div>

        {/* Vintage typography indicator */}
        <div className="text-center space-y-1.5">
          <span className="font-mono text-[10px] uppercase tracking-widest text-[#1F3FB0] font-semibold block">
            MARGINALIA ARCHIVE
          </span>
          <p className="font-serif italic text-sm text-[#141414]/80">
            {label}
          </p>
        </div>

        {/* Pulsing editorial progress rule */}
        <div className="mt-4 w-32 h-[2px] bg-[#141414]/10 overflow-hidden rounded-full">
          <div className="w-full h-full bg-[#1F3FB0] origin-left animate-[shimmer_1.5s_infinite]" />
        </div>
      </div>
    </div>
  );
};
