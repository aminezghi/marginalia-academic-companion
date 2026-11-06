import React from 'react';
import { ExternalLink, User, GraduationCap, Building2, Mail } from 'lucide-react';

interface FooterProps {
  affiliation?: string;
  onOpenOnboarding?: () => void;
  madeBy?: string;
  isNightMode?: boolean;
}

export const Footer: React.FC<FooterProps> = ({
  affiliation = 'University of Parma · Department of Food and Drug · FutureData4EU',
  onOpenOnboarding,
  madeBy = 'Amine Zouaghi',
  isNightMode = false,
}) => {
  return (
    <footer
      className={`w-full border-t transition-colors duration-300 py-8 px-6 text-xs font-mono ${
        isNightMode
          ? 'bg-[#151413] border-[#2C2822] text-[#9E9689]'
          : 'bg-[#EDEBE6] border-[#141414]/15 text-[#77736B]'
      }`}
    >
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-5">
        {/* Left: Scholar & Official Institutional Affiliation */}
        <div className="flex flex-col sm:flex-row items-center gap-2 text-center sm:text-left">
          <a
            href="https://personale.unipr.it/en/ugovdocenti/person/270639"
            target="_blank"
            rel="noreferrer"
            className={`font-semibold tracking-wide flex items-center gap-1.5 transition-colors ${
              isNightMode
                ? 'text-[#E8E3DA] hover:text-[#D4AF37]'
                : 'text-[#141414] hover:text-[#1F3FB0]'
            }`}
            title="Amine Zouaghi — Official Faculty Directory at University of Parma"
          >
            <Building2 className="w-3.5 h-3.5 opacity-80" />
            <span>AMINE ZOUAGHI</span>
          </a>
          <span aria-hidden="true" className="hidden sm:inline opacity-40">·</span>
          <span className="text-[11px] leading-tight">
            {affiliation}
          </span>
        </div>

        {/* Center: Real Verified Academic & Research Portals */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-[11px]">
          <a
            href="https://personale.unipr.it/en/ugovdocenti/person/270639"
            target="_blank"
            rel="noreferrer"
            className={`transition-colors flex items-center gap-1 ${
              isNightMode ? 'hover:text-[#D4AF37]' : 'hover:text-[#1F3FB0]'
            }`}
            title="University of Parma Faculty Directory Profile"
          >
            <GraduationCap className="w-3 h-3 opacity-75" />
            <span>UniPR Profile</span>
            <ExternalLink className="w-2.5 h-2.5 opacity-60" />
          </a>

          <span aria-hidden="true" className="opacity-30">·</span>

          <a
            href="https://orcid.org/0009-0004-9407-7815"
            target="_blank"
            rel="noreferrer"
            className={`transition-colors flex items-center gap-1 ${
              isNightMode ? 'hover:text-[#D4AF37]' : 'hover:text-[#1F3FB0]'
            }`}
            title="ORCID ID: 0009-0004-9407-7815"
          >
            <span>ORCID</span>
            <ExternalLink className="w-2.5 h-2.5 opacity-60" />
          </a>

          <span aria-hidden="true" className="opacity-30">·</span>

          <a
            href="https://scholar.google.com/citations?user=KeVyb90AAAAJ&hl=en"
            target="_blank"
            rel="noreferrer"
            className={`transition-colors flex items-center gap-1 ${
              isNightMode ? 'hover:text-[#D4AF37]' : 'hover:text-[#1F3FB0]'
            }`}
            title="Google Scholar Citations"
          >
            <span>Google Scholar</span>
            <ExternalLink className="w-2.5 h-2.5 opacity-60" />
          </a>

          <span aria-hidden="true" className="opacity-30">·</span>

          <a
            href="https://www.researchgate.net/profile/Amine-Zouaghi"
            target="_blank"
            rel="noreferrer"
            className={`transition-colors flex items-center gap-1 ${
              isNightMode ? 'hover:text-[#D4AF37]' : 'hover:text-[#1F3FB0]'
            }`}
            title="ResearchGate Profile"
          >
            <span>ResearchGate</span>
            <ExternalLink className="w-2.5 h-2.5 opacity-60" />
          </a>

          <span aria-hidden="true" className="opacity-30">·</span>

          <a
            href="https://www.linkedin.com/in/zouaghi-amine/"
            target="_blank"
            rel="noreferrer"
            className={`transition-colors flex items-center gap-1 ${
              isNightMode ? 'hover:text-[#D4AF37]' : 'hover:text-[#1F3FB0]'
            }`}
            title="LinkedIn Profile"
          >
            <span>LinkedIn</span>
            <ExternalLink className="w-2.5 h-2.5 opacity-60" />
          </a>

          <span aria-hidden="true" className="opacity-30">·</span>

          <a
            href="mailto:amine.zouaghi@unipr.it"
            className={`transition-colors flex items-center gap-1 ${
              isNightMode ? 'hover:text-[#D4AF37]' : 'hover:text-[#1F3FB0]'
            }`}
            title="Official Academic Email: amine.zouaghi@unipr.it"
          >
            <Mail className="w-3 h-3 opacity-75" />
            <span>Contact / Dispatch</span>
          </a>
        </div>

        {/* Right: Archival Attribution & Curator */}
        <div className="text-right text-[10px] flex flex-col sm:flex-row sm:items-center sm:gap-2 opacity-80">
          <a
            href="https://personale.unipr.it/en/ugovdocenti/person/270639"
            target="_blank"
            rel="noreferrer"
            className={`flex items-center gap-1.5 transition-colors ${
              isNightMode ? 'hover:text-[#D4AF37]' : 'hover:text-[#1F3FB0]'
            }`}
          >
            <User className="w-3 h-3" />
            <span>Curated by {madeBy}</span>
          </a>
          <span className="hidden sm:inline opacity-40">·</span>
          <span>DOCTORAL ARCHIVE [2023–2026]</span>
        </div>
      </div>
    </footer>
  );
};
