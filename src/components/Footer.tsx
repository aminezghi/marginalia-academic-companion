import React from 'react';
import { ExternalLink, UserPlus, User } from 'lucide-react';

interface FooterProps {
  affiliation: string;
  onOpenOnboarding?: () => void;
  madeBy?: string;
}

export const Footer: React.FC<FooterProps> = ({ affiliation, onOpenOnboarding, madeBy = 'Made by Amine' }) => {
  return (
    <footer className="w-full border-t border-[#141414]/15 bg-[#EDEBE6] py-8 px-6 text-xs font-mono text-[#77736B]">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Left: Affiliation & Curatorial Statement */}
        <div className="flex flex-col sm:flex-row items-center gap-2 text-center sm:text-left">
          <span className="text-[#141414] font-semibold">ACADEMIC RESEARCH ARCHIVE</span>
          <span aria-hidden="true" className="hidden sm:inline">·</span>
          <span>{affiliation}</span>
          {onOpenOnboarding && (
            <button
              onClick={onOpenOnboarding}
              className="ml-2 text-xs text-[#1F3FB0] hover:text-[#1656d6] font-medium flex items-center gap-1 cursor-pointer"
            >
              <UserPlus className="w-3 h-3" />
              <span>Onboarding</span>
            </button>
          )}
        </div>

        {/* Center: Real Verified Academic Portals */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-[11px]">
          <a
            href="https://orcid.org"
            target="_blank"
            rel="noreferrer"
            className="hover:text-[#1F3FB0] transition-colors flex items-center gap-1"
          >
            <span>ORCID</span>
            <ExternalLink className="w-2.5 h-2.5" />
          </a>
          <span aria-hidden="true">·</span>
          <a
            href="https://scholar.google.com"
            target="_blank"
            rel="noreferrer"
            className="hover:text-[#1F3FB0] transition-colors flex items-center gap-1"
          >
            <span>Google Scholar</span>
            <ExternalLink className="w-2.5 h-2.5" />
          </a>
          <span aria-hidden="true">·</span>
          <a
            href="https://www.researchgate.net"
            target="_blank"
            rel="noreferrer"
            className="hover:text-[#1F3FB0] transition-colors flex items-center gap-1"
          >
            <span>ResearchGate</span>
            <ExternalLink className="w-2.5 h-2.5" />
          </a>
          <span aria-hidden="true">·</span>
          <a
            href="https://www.linkedin.com"
            target="_blank"
            rel="noreferrer"
            className="hover:text-[#1F3FB0] transition-colors flex items-center gap-1"
          >
            <span>LinkedIn</span>
            <ExternalLink className="w-2.5 h-2.5" />
          </a>
          <span aria-hidden="true">·</span>
          <a
            href="mailto:azouaghiamine@gmail.com"
            className="hover:text-[#1F3FB0] transition-colors"
          >
            Contact / Dispatch
          </a>
        </div>

        {/* Right: Archival Catalog Reference & Made by Amine */}
        <div className="text-right text-[10px] text-[#77736B]/80 flex flex-col sm:flex-row sm:items-center sm:gap-2">
          <span className="flex items-center gap-1.5">
            <User className="w-3 h-3" />
            <span>{madeBy}</span>
          </span>
          <span className="hidden sm:inline">·</span>
          <span>CURATED COLLECTION [2022–2026]</span>
        </div>
      </div>
    </footer>
  );
};
