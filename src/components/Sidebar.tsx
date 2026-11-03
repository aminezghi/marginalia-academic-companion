import React from 'react';
import {
  Compass,
  Library,
  BookOpen,
  FileText,
  TrendingUp,
  Sparkles,
  Network,
  FolderKanban,
  Plus,
  ChevronLeft,
  ChevronRight,
  User,
  SlidersHorizontal,
} from 'lucide-react';
import { ResearcherProfile } from '../types/research';

export type ActiveTab =
  | 'home'
  | 'library'
  | 'reader'
  | 'notes'
  | 'tracker'
  | 'assistant'
  | 'graph'
  | 'collections';

interface SidebarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  totalPapers: number;
  readingNowCount: number;
  totalNotes: number;
  profile: ResearcherProfile;
  onOpenProfile: () => void;
  onOpenImport: () => void;
  onOpenCompanionTools: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  isCollapsed,
  onToggleCollapse,
  totalPapers,
  readingNowCount,
  totalNotes,
  profile,
  onOpenProfile,
  onOpenImport,
  onOpenCompanionTools,
}) => {
  const navItems = [
    {
      id: 'home' as ActiveTab,
      label: 'Research Universe',
      icon: Compass,
      badge: null,
    },
    {
      id: 'library' as ActiveTab,
      label: 'My Library',
      icon: Library,
      badge: totalPapers,
    },
    {
      id: 'reader' as ActiveTab,
      label: 'Academic Reader',
      icon: BookOpen,
      badge: readingNowCount > 0 ? `${readingNowCount} active` : null,
    },
    {
      id: 'notes' as ActiveTab,
      label: 'Research Notebook',
      icon: FileText,
      badge: totalNotes > 0 ? totalNotes : null,
    },
    {
      id: 'tracker' as ActiveTab,
      label: 'Reading Tracker',
      icon: TrendingUp,
      badge: null,
    },
    {
      id: 'assistant' as ActiveTab,
      label: 'AI Assistant',
      icon: Sparkles,
      badge: 'Gemini',
    },
    {
      id: 'graph' as ActiveTab,
      label: 'Research Map',
      icon: Network,
      badge: null,
    },
    {
      id: 'collections' as ActiveTab,
      label: 'Collections',
      icon: FolderKanban,
      badge: null,
    },
  ];

  return (
    <aside
      className={`relative border-r border-[#141414]/15 bg-[#EDEBE6] flex flex-col justify-between transition-all duration-300 z-30 select-none ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
      aria-label="Application Navigation"
    >
      {/* Top Brand Bar */}
      <div>
        <div className="p-4 border-b border-[#141414]/15 flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="font-serif font-bold text-lg tracking-tight text-[#141414] leading-none">
                Marginalia
              </span>
              <span className="text-[10px] font-mono text-[#77736B] tracking-wider uppercase mt-1">
                Academic Companion
              </span>
            </div>
          )}
          {isCollapsed && (
            <div className="w-8 h-8 rounded-[2px] bg-[#1F3FB0] text-white flex items-center justify-center font-serif font-bold text-base mx-auto">
              M
            </div>
          )}

          <button
            onClick={onToggleCollapse}
            className="p-1 text-[#77736B] hover:text-[#141414] hover:bg-[#141414]/5 rounded transition-colors cursor-pointer hidden md:block"
            title={isCollapsed ? 'Expand Navigation' : 'Collapse Navigation'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Quick Add / Import CTA Button */}
        <div className="p-3">
          <button
            onClick={onOpenImport}
            className="w-full py-2 px-3 bg-[#1F3FB0] hover:bg-[#19328D] text-white text-xs font-mono uppercase font-semibold tracking-wider flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
            title="Import DOI, PDF, BibTeX, RIS"
          >
            <Plus className="w-4 h-4 shrink-0" />
            {!isCollapsed && <span>IMPORT PAPERS</span>}
          </button>
        </div>

        {/* Primary Navigation Rail */}
        <nav className="px-2 py-1 space-y-1">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-mono tracking-wider transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-[#141414] text-white font-semibold'
                    : 'text-[#141414]/80 hover:text-[#141414] hover:bg-[#141414]/5'
                } ${isCollapsed ? 'justify-center' : 'justify-between'}`}
                title={item.label}
              >
                <div className="flex items-center gap-3 truncate">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#60A5FA]' : 'text-[#77736B]'}`} />
                  {!isCollapsed && <span className="truncate">{item.label}</span>}
                </div>

                {!isCollapsed && item.badge !== null && (
                  <span
                    className={`text-[10px] tabular-nums px-1.5 py-0.5 ${
                      isActive ? 'bg-white/20 text-white' : 'bg-[#141414]/10 text-[#77736B]'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Profile & Tools Footer */}
      <div className="p-3 border-t border-[#141414]/15 bg-[#E6E3DB]/50 space-y-2">
        {/* Companion Tools button */}
        <button
          onClick={onOpenCompanionTools}
          className={`w-full p-2 border border-[#141414]/20 hover:border-[#1F3FB0] hover:text-[#1F3FB0] text-xs font-mono uppercase flex items-center gap-2 transition-colors cursor-pointer ${
            isCollapsed ? 'justify-center' : 'justify-start'
          }`}
          title="Backup, export, and settings"
        >
          <SlidersHorizontal className="w-3.5 h-3.5 shrink-0" />
          {!isCollapsed && <span className="text-[11px]">ARCHIVE TOOLS</span>}
        </button>

        {/* Researcher Profile Switcher */}
        <button
          onClick={onOpenProfile}
          className={`w-full p-2 border border-transparent hover:border-[#141414]/20 hover:bg-white text-left flex items-center gap-2.5 transition-colors cursor-pointer ${
            isCollapsed ? 'justify-center' : ''
          }`}
          title="View and edit academic profile"
        >
          <div className="w-7 h-7 rounded-[2px] bg-[#141414] text-white flex items-center justify-center font-serif text-xs shrink-0 font-bold">
            {profile.name.charAt(0)}
          </div>
          {!isCollapsed && (
            <div className="min-w-0 flex-1">
              <div className="text-xs font-serif font-medium text-[#141414] truncate">
                {profile.name}
              </div>
              <div className="text-[10px] font-mono text-[#77736B] truncate">
                {profile.primaryAffiliation}
              </div>
            </div>
          )}
        </button>
      </div>
    </aside>
  );
};
