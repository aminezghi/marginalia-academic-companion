import React, { useState } from 'react';
import {
  Volume2,
  VolumeX,
  Compass,
  SlidersHorizontal,
  BookOpen,
  Library,
  FileText,
  TrendingUp,
  Sparkles,
  Network,
  FolderKanban,
  Menu,
  X,
  Search,
  Palette,
  User,
  LogOut,
  UserPlus,
} from 'lucide-react';
import { playTactileClick } from '../utils/sound';

export type MainViewMode =
  | 'shelf'
  | 'catalog'
  | 'reader'
  | 'notes'
  | 'tracker'
  | 'assistant'
  | 'graph'
  | 'collections';

interface TopNavProps {
  researcherName: string;
  researcherTitle?: string;
  affiliation?: string;
  activeView: MainViewMode;
  onChangeView: (view: MainViewMode) => void;
  onOpenAbout: () => void;
  onOpenMethodologies: () => void;
  onOpenNewArticle: () => void;
  onOpenImport: () => void;
  onOpenCompanionTools?: () => void;
  onOpenCustomizer?: () => void;
  onLogout?: () => void;
  onOpenProfile?: () => void;
  onOpenSettings?: () => void;
  onOpenApiKeys?: () => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  readingNowCount?: number;
  totalNotesCount?: number;
  isGuest?: boolean;
  onMigrateGuest?: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  researcherName,
  researcherTitle,
  affiliation = '',
  activeView,
  onChangeView,
  onOpenAbout,
  onOpenMethodologies,
  onOpenCompanionTools,
  onOpenCustomizer,
  onLogout,
  onOpenProfile,
  onOpenSettings,
  onOpenApiKeys,
  searchQuery = '',
  onSearchChange,
  soundEnabled,
  onToggleSound,
  readingNowCount = 0,
  totalNotesCount = 0,
  isGuest = false,
  onMigrateGuest,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSelectView = (view: MainViewMode) => {
    playTactileClick();
    onChangeView(view);
    setMobileMenuOpen(false);
  };

  const isLibraryActive = activeView === 'shelf' || activeView === 'catalog';

  const navItems: {
    id: MainViewMode;
    label: string;
    isActive: boolean;
    badge?: string | null;
  }[] = [
    {
      id: 'shelf',
      label: 'LIBRARY',
      isActive: isLibraryActive,
    },
    {
      id: 'notes',
      label: 'NOTES',
      isActive: activeView === 'notes',
      badge: totalNotesCount > 0 ? String(totalNotesCount) : null,
    },
    {
      id: 'graph',
      label: 'MAP',
      isActive: activeView === 'graph',
    },
    {
      id: 'tracker',
      label: 'ANALYTICS',
      isActive: activeView === 'tracker',
    },
    {
      id: 'assistant',
      label: 'AI',
      isActive: activeView === 'assistant',
    },
    {
      id: 'reader',
      label: 'READER',
      isActive: activeView === 'reader',
      badge: readingNowCount > 0 ? String(readingNowCount) : null,
    },
    {
      id: 'collections',
      label: 'COLLECTIONS',
      isActive: activeView === 'collections',
    },
  ];

  // Get initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };

  // Truncate long names for display
  const displayName = researcherName.length > 15
    ? researcherName.substring(0, 12) + '...'
    : researcherName;

  return (
    <header className="w-full bg-[#EDE8DD]/95 backdrop-blur-md sticky top-0 z-40 border-b border-[#1E1A16]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
        {/* LEFT: Marginalia Brand Identity */}
        <div
          className="flex items-center gap-3 sm:gap-3.5 cursor-pointer shrink-0 group"
          onClick={() => handleSelectView('shelf')}
        >
          <span className="font-serif text-2xl sm:text-[28px] font-normal tracking-[-0.02em] text-[#1A1612] leading-none group-hover:text-[#1F3FB0] transition-colors">
            Marginalia
          </span>
          <span
            aria-hidden="true"
            className="h-6 w-[1px] bg-[#1A1612]/25 hidden sm:block"
          />
          <div className="hidden sm:flex flex-col text-[9px] font-serif uppercase tracking-[0.16em] text-[#4A433B] leading-[1.25]">
            <span>ACADEMIC</span>
            <span>KNOWLEDGE COMPANION</span>
          </div>
        </div>

        {/* CENTER: Clean Editorial Navigation Links */}
        <nav
          className="hidden md:flex items-center gap-5 lg:gap-7"
          aria-label="Primary Workspace Navigation"
        >
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleSelectView(item.id)}
              className={`relative py-1 text-[11px] lg:text-xs font-serif uppercase tracking-[0.12em] transition-colors cursor-pointer flex items-center gap-1 ${
                item.isActive
                  ? 'text-[#141414] font-semibold'
                  : 'text-[#4A433B] hover:text-[#141414]'
              }`}
            >
              <span>{item.label}</span>
              {item.isActive && (
                <span className="absolute bottom-0 inset-x-0 h-[1.5px] bg-[#1A1612]" />
              )}
            </button>
          ))}
        </nav>

        {/* RIGHT: Minimal Search Input + Bindery Customizer + Profile Pill + Avatar */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          {/* Minimal Underlined Search Bar - visible on all screens */}
          {onSearchChange && (
            <div className="flex items-center gap-1.5 border-b border-[#1A1612]/25 focus-within:border-[#1A1612] pb-1 px-1 w-40 lg:w-56 transition-colors">
              <Search className="w-3.5 h-3.5 text-[#5A534A] shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search papers, notes, topics..."
                className="w-full bg-transparent text-xs font-serif text-[#141414] placeholder:text-[#6E675F] focus:outline-none"
                aria-label="Search library"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => onSearchChange('')}
                  className="text-[#77736B] hover:text-[#141414] cursor-pointer"
                  aria-label="Clear search"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          )}

          {/* Bindery / Shelf Appearance Studio Trigger */}
          {onOpenCustomizer && (
            <button
              type="button"
              onClick={() => {
                playTactileClick();
                onOpenCustomizer();
              }}
              className="p-1.5 text-[#4A433B] hover:text-[#141414] transition-colors cursor-pointer"
              title="Customize Bookshelf Wood, Book Spines & Covers"
              aria-label="Customize Bookshelf Appearance"
            >
              <Palette className="w-4 h-4" />
            </button>
          )}

          {/* Methodology Dossiers Trigger - visible on large screens */}
          <button
            type="button"
            onClick={() => {
              playTactileClick();
              onOpenMethodologies();
            }}
            className="hidden lg:flex p-1.5 text-[#4A433B] hover:text-[#141414] transition-colors cursor-pointer"
            title="Research Methodology Dossiers"
            aria-label="Open Methodology Dossiers"
          >
            <Compass className="w-4 h-4" />
          </button>

          {/* Archive Tools (Export BibTeX, Backup, Reset) - visible on large screens */}
          {onOpenCompanionTools && (
            <button
              type="button"
              onClick={() => {
                playTactileClick();
                onOpenCompanionTools();
              }}
              className="hidden lg:flex p-1.5 text-[#4A433B] hover:text-[#141414] transition-colors cursor-pointer"
              title="Archive Tools: Export BibTeX, Backup & Restore"
              aria-label="Open Archive Tools"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>
          )}

          {/* Sound Toggle */}
          <button
            type="button"
            onClick={onToggleSound}
            className="p-1.5 text-[#4A433B] hover:text-[#141414] transition-colors cursor-pointer"
            title={
              soundEnabled ? 'Mute tactile archive audio' : 'Enable tactile archive audio'
            }
            aria-label="Toggle Sound"
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4" />
            ) : (
              <VolumeX className="w-4 h-4 opacity-50" />
            )}
          </button>

          {/* Profile Pill - Always visible on all screen sizes */}
          <div className="flex items-center gap-2 px-3 py-2 bg-[#1F3FB0]/10 border border-[#1F3FB0]/30 rounded-full mr-1 hover:bg-[#1F3FB0]/15 transition-colors">
            <User className="w-3.5 h-3.5 text-[#1F3FB0]" />
            <span className="text-xs sm:text-sm font-serif font-medium text-[#1F3FB0] leading-tight">
              {displayName || 'Guest'}
            </span>
            {onLogout && (
              <button
                type="button"
                onClick={onLogout}
                className="p-1 bg-red-100 text-red-800 text-xs font-medium rounded-full hover:bg-red-200 transition-colors cursor-pointer"
                title="Sign Out"
                aria-label="Sign Out"
              >
                <LogOut className="w-3 h-3" />
              </button>
            )}
            {onOpenProfile && (
              <button
                type="button"
                onClick={() => onOpenProfile()}
                className="p-1 bg-white text-[#1F3FB0] text-xs font-medium rounded-full hover:bg-[#EDEBE6] transition-colors cursor-pointer"
                title="Open Profile"
                aria-label="Open Profile"
              >
                <X className="w-2.5 h-2.5 text-[#1F3FB0]" />
              </button>
            )}
          </div>

          {/* Guest Mode Button - visible for guest users */}
          {isGuest && onMigrateGuest && (
            <button
              type="button"
              onClick={() => {
                playTactileClick();
                onMigrateGuest();
              }}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 text-[#1F3FB0] hover:text-[#1656d6] bg-[#1F3FB0]/10 border border-[#1F3FB0]/30 rounded-full text-xs font-medium transition-colors cursor-pointer"
              title="Create Account to Save Your Library"
              aria-label="Migrate Guest Data to Account"
            >
              <UserPlus className="w-3 h-3" />
              <span>Sign Up</span>
            </button>
          )}

          {/* Researcher Profile Portrait / Avatar Button */}
          <button
            type="button"
            onClick={() => {
              playTactileClick();
              onOpenProfile ? onOpenProfile() : onOpenAbout();
            }}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-[#1F3FB0] to-[#1668D1] text-[#EFECE4] border-2 border-[#141414]/30 flex items-center justify-center font-serif text-sm font-bold shadow-md hover:scale-105 hover:shadow-lg hover:rotate-1.5 transition-all cursor-pointer shrink-0"
            title={`${researcherName} — Researcher Profile & CV`}
            aria-label="Open Researcher Profile"
          >
            <span className="shadow-sm">
              {getInitials(researcherName) || 'AZ'}
            </span>
          </button>

          {/* Mobile Menu Trigger */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((o) => !o)}
            className="sm:hidden p-1.5 border border-[#141414]/20 text-[#141414] cursor-pointer"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? (
              <X className="w-4 h-4" />
            ) : (
              <Menu className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#141414]/15 bg-[#F4F1EA] p-4 shadow-xl space-y-3 animate-fadeIn">
          {onSearchChange && (
            <div className="flex items-center gap-2 border border-[#141414]/20 bg-white px-3 py-2">
              <Search className="w-3.5 h-3.5 text-[#77736B]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search papers, notes, topics..."
                className="w-full bg-transparent text-xs font-serif text-[#141414] focus:outline-none"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            {[
              { id: 'shelf' as MainViewMode, label: '3D Bookshelf', icon: Library },
              { id: 'catalog' as MainViewMode, label: 'Catalog Grid', icon: BookOpen },
              { id: 'reader' as MainViewMode, label: 'Academic Reader', icon: BookOpen },
              { id: 'notes' as MainViewMode, label: 'Research Notes', icon: FileText },
              { id: 'tracker' as MainViewMode, label: 'Analytics', icon: TrendingUp },
              { id: 'assistant' as MainViewMode, label: 'AI Companion', icon: Sparkles },
              { id: 'graph' as MainViewMode, label: 'Research Map', icon: Network },
              { id: 'collections' as MainViewMode, label: 'Collections', icon: FolderKanban },
            ].map((m) => {
              const Icon = m.icon;
              const active = activeView === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => handleSelectView(m.id)}
                  className={`p-2.5 border text-left flex items-center gap-2 cursor-pointer transition-colors ${
                    active
                      ? 'border-[#141414] bg-[#26211D] text-white font-semibold'
                      : 'border-[#141414]/15 bg-[#EDE8DD] text-[#141414]/85'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{m.label}</span>
                </button>
              );
            })}
          </div>

          <div className="border-t border-[#141414]/10 pt-3 flex items-center justify-between text-xs font-mono">
            {onOpenCustomizer && (
              <button
                onClick={() => {
                  playTactileClick();
                  setMobileMenuOpen(false);
                  onOpenCustomizer();
                }}
                className="text-[#1F3FB0] flex items-center gap-1 cursor-pointer"
              >
                <Palette className="w-3.5 h-3.5" />
                <span>Customize Shelf</span>
              </button>
            )}
            <button
              onClick={() => {
                playTactileClick();
                setMobileMenuOpen(false);
                onOpenMethodologies();
              }}
              className="text-[#4A433B] flex items-center gap-1 cursor-pointer"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Methods</span>
            </button>
            {onOpenCompanionTools && (
              <button
                onClick={() => {
                  playTactileClick();
                  setMobileMenuOpen(false);
                  onOpenCompanionTools();
                }}
                className="text-[#4A433B] flex items-center gap-1 cursor-pointer"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Tools</span>
              </button>
            )}
          </div>

          {/* Mobile Sign Out Option */}
          {onLogout && (
            <button
              onClick={() => {
                playTactileClick();
                onLogout();
              }}
              className="w-full flex items-center gap-2 p-2 text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer text-xs font-mono"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          )}
        </div>
      )}
    </header>
  );
};
