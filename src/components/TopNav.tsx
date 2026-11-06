import React, { useEffect, useRef, useState } from 'react';
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
  ChevronDown,
  Moon,
  Sun,
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
  onOpenCommandPalette?: () => void;
  onLogout?: () => void;
  onOpenProfile?: () => void;
  onOpenAccountSettings?: () => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  isNightMode?: boolean;
  onToggleNightMode?: () => void;
  readingNowCount?: number;
  totalNotesCount?: number;
  isGuest?: boolean;
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
  onOpenCommandPalette,
  onLogout,
  onOpenProfile,
  onOpenAccountSettings,
  searchQuery = '',
  onSearchChange,
  soundEnabled,
  onToggleSound,
  isNightMode = false,
  onToggleNightMode,
  readingNowCount = 0,
  totalNotesCount = 0,
  isGuest = false,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (accountMenuRef.current && !accountMenuRef.current.contains(event.target as Node)) {
        setAccountMenuOpen(false);
      }
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setAccountMenuOpen(false);
    };
    document.addEventListener('mousedown', closeOnOutsideClick);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('mousedown', closeOnOutsideClick);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, []);

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

  const displayName = researcherName.length > 15
    ? researcherName.substring(0, 12) + '...'
    : researcherName;

  return (
    <header
      className={`w-full backdrop-blur-md sticky top-0 z-40 border-b transition-colors duration-300 ${
        isNightMode
          ? 'bg-[#161412]/95 border-[#2E2822] text-[#EDE8DF]'
          : 'bg-[#EDE8DD]/95 border-[#1E1A16]/10 text-[#141414]'
      }`}
    >
      <div className="max-w-7xl 2xl:max-w-[1800px] mx-auto px-3 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-2 sm:gap-4">
        {/* LEFT: Marginalia Brand Identity */}
        <div
          className="flex items-center gap-2.5 sm:gap-3 cursor-pointer shrink-0 group"
          onClick={() => handleSelectView('shelf')}
        >
          <img
            src="/favicon.svg"
            alt="Marginalia Bookshelf Archive"
            className="w-7 h-7 sm:w-8 sm:h-8 object-contain shrink-0 group-hover:scale-105 transition-transform"
          />
          <span
            className={`font-serif text-2xl sm:text-[28px] font-normal tracking-[-0.02em] leading-none transition-colors ${
              isNightMode
                ? 'text-[#EDE8DF] group-hover:text-[#D4AF37]'
                : 'text-[#1A1612] group-hover:text-[#742421]'
            }`}
          >
            Marginalia
          </span>
          <span
            aria-hidden="true"
            className={`h-6 w-[1px] hidden sm:block ${
              isNightMode ? 'bg-white/20' : 'bg-[#1A1612]/25'
            }`}
          />
          <div
            className={`hidden sm:flex flex-col text-[9px] font-serif uppercase tracking-[0.16em] leading-[1.25] ${
              isNightMode ? 'text-[#8C8275]' : 'text-[#4A433B]'
            }`}
          >
            <span>ACADEMIC</span>
            <span>KNOWLEDGE COMPANION</span>
          </div>
        </div>

        {/* CENTER: Clean Editorial Navigation Links */}
        <nav
          className="hidden 2xl:flex items-center gap-4 2xl:gap-6"
          aria-label="Primary Workspace Navigation"
        >
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleSelectView(item.id)}
              className={`relative py-1 text-[11px] lg:text-xs font-serif uppercase tracking-[0.12em] transition-colors cursor-pointer flex items-center gap-1 ${
                item.isActive
                  ? isNightMode
                    ? 'text-[#D4AF37] font-semibold'
                    : 'text-[#141414] font-semibold'
                  : isNightMode
                    ? 'text-[#8C8275] hover:text-[#EDE8DF]'
                    : 'text-[#4A433B] hover:text-[#141414]'
              }`}
            >
              <span>{item.label}</span>
              {item.isActive && (
                <span
                  className={`absolute bottom-0 inset-x-0 h-[1.5px] ${
                    isNightMode ? 'bg-[#D4AF37]' : 'bg-[#1A1612]'
                  }`}
                />
              )}
            </button>
          ))}
        </nav>

        {/* RIGHT: Search, useful tools, and one profile control */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          {/* Quick Omnibox / Command Palette trigger */}
          {onOpenCommandPalette && (
            <button
              type="button"
              onClick={() => {
                playTactileClick();
                onOpenCommandPalette();
              }}
              className={`flex items-center gap-1.5 px-2 py-1 rounded border text-xs font-mono transition-colors cursor-pointer ${
                isNightMode
                  ? 'border-[#38322A] hover:border-[#D4AF37] bg-[#1E1B17] text-[#C0B7A8] hover:text-[#D4AF37]'
                  : 'border-[#1A1612]/20 hover:border-[#1F3FB0] bg-[#F4F1EA] text-[#4A433B] hover:text-[#1F3FB0]'
              }`}
              title="Command Palette (Cmd+K or /)"
              aria-label="Open Command Palette"
            >
              <Search className={`w-3.5 h-3.5 ${isNightMode ? 'text-[#D4AF37]' : 'text-[#1F3FB0]'}`} />
              <span className="hidden xl:inline text-[11px] font-serif">Omnibox</span>
              <kbd
                className={`text-[10px] px-1 py-0.2 rounded border font-mono ${
                  isNightMode
                    ? 'bg-[#161412] border-[#38322A] text-[#8C8275]'
                    : 'bg-[#EDE8DD] border-[#1A1612]/20 text-[#4A433B]'
                }`}
              >
                ⌘K
              </kbd>
            </button>
          )}

          {/* Minimal Underlined Search Bar - visible on all screens */}
          {onSearchChange && (
            <div
              className={`hidden lg:flex items-center gap-1.5 border-b pb-1 px-1 w-24 md:w-32 xl:w-56 transition-colors ${
                isNightMode
                  ? 'border-white/20 focus-within:border-[#D4AF37]'
                  : 'border-[#1A1612]/25 focus-within:border-[#1A1612]'
              }`}
            >
              <Search
                className={`w-3.5 h-3.5 shrink-0 ${
                  isNightMode ? 'text-[#8C8275]' : 'text-[#5A534A]'
                }`}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search papers, notes, topics..."
                className={`w-full bg-transparent text-xs font-serif focus:outline-none ${
                  isNightMode
                    ? 'text-[#EDE8DF] placeholder:text-[#8C8275]'
                    : 'text-[#141414] placeholder:text-[#6E675F]'
                }`}
                aria-label="Search library"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => onSearchChange('')}
                  className={`cursor-pointer ${
                    isNightMode
                      ? 'text-[#8C8275] hover:text-[#EDE8DF]'
                      : 'text-[#77736B] hover:text-[#141414]'
                  }`}
                  aria-label="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
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
              className="hidden sm:flex p-1.5 text-[#4A433B] hover:text-[#141414] transition-colors cursor-pointer"
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

          {/* Night Mode / Vintage Desk Lamp Toggle */}
          {onToggleNightMode && (
            <button
              type="button"
              onClick={() => {
                playTactileClick();
                onToggleNightMode();
              }}
              className={`p-1.5 transition-colors cursor-pointer rounded ${
                isNightMode
                  ? 'text-[#F59E0B] hover:text-[#FBBF24] bg-[#F59E0B]/10'
                  : 'text-[#4A433B] hover:text-[#141414]'
              }`}
              title={
                isNightMode
                  ? 'Extinguish desk lamp (Switch to Daylight Study)'
                  : 'Illuminate desk lamp (Switch to Nocturne Library Night Mode)'
              }
              aria-label="Toggle Nocturne Night Mode"
            >
              {isNightMode ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </button>
          )}

          {/* Sound Toggle */}
          <button
            type="button"
            onClick={onToggleSound}
            className="hidden sm:flex p-1.5 text-[#4A433B] hover:text-[#141414] transition-colors cursor-pointer"
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

          <div className="relative" ref={accountMenuRef}>
            <button
              type="button"
              onClick={() => {
                playTactileClick();
                setAccountMenuOpen((open) => !open);
              }}
              className={`flex items-center gap-2 px-3 py-2 rounded-full transition-colors cursor-pointer ${
                isNightMode
                  ? 'bg-[#D4AF37]/15 border border-[#D4AF37]/35 text-[#D4AF37] hover:bg-[#D4AF37]/25'
                  : 'bg-[#1F3FB0]/10 border border-[#1F3FB0]/30 hover:bg-[#1F3FB0]/15 text-[#1F3FB0]'
              }`}
              aria-expanded={accountMenuOpen}
              aria-haspopup="menu"
              aria-label={isGuest ? 'Open guest account menu' : 'Open account menu'}
            >
              <User className="w-3.5 h-3.5" />
              <span className="max-w-36 truncate text-xs sm:text-sm font-serif font-medium leading-tight">{isGuest ? 'Guest' : (displayName || 'Account')}</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
            {accountMenuOpen && (
              <div
                role="menu"
                className={`absolute right-0 mt-2 w-56 rounded border p-1 shadow-xl z-50 ${
                  isNightMode
                    ? 'border-[#38322A] bg-[#1E1B17] text-[#EDE8DF]'
                    : 'border-[#141414]/20 bg-[#F4F1EA] text-[#141414]'
                }`}
              >
                <div className={`px-3 py-2 border-b ${isNightMode ? 'border-white/10' : 'border-[#141414]/10'}`}>
                  <div className={`text-xs font-mono uppercase tracking-wider ${isNightMode ? 'text-[#8C8275]' : 'text-[#77736B]'}`}>{isGuest ? 'Guest session' : 'Signed in'}</div>
                  {!isGuest && <div className={`mt-1 truncate text-sm font-serif ${isNightMode ? 'text-[#EDE8DF]' : 'text-[#141414]'}`}>{researcherName}</div>}
                </div>
                <button
                  role="menuitem"
                  type="button"
                  onClick={() => {
                    playTactileClick();
                    setAccountMenuOpen(false);
                    onOpenProfile ? onOpenProfile() : onOpenAbout();
                  }}
                  className={`w-full px-3 py-2 text-left text-sm font-serif cursor-pointer ${
                    isNightMode ? 'hover:bg-[#28221D]' : 'hover:bg-[#E7E4DC]'
                  }`}
                >{isGuest ? 'Sign in or create account' : 'Research profile'}</button>
                {!isGuest && onOpenAccountSettings && (
                  <button
                    role="menuitem"
                    type="button"
                    onClick={() => { setAccountMenuOpen(false); onOpenAccountSettings(); }}
                    className={`w-full px-3 py-2 text-left text-sm font-serif cursor-pointer ${
                      isNightMode ? 'hover:bg-[#28221D]' : 'hover:bg-[#E7E4DC]'
                    }`}
                  >Account settings</button>
                )}
                {onLogout && (
                  <button
                    role="menuitem"
                    type="button"
                    onClick={() => { setAccountMenuOpen(false); onLogout(); }}
                    className={`w-full border-t mt-1 px-3 py-2 text-left text-sm font-serif text-rose-500 cursor-pointer ${
                      isNightMode ? 'border-white/10 hover:bg-rose-950/30' : 'border-[#141414]/10 hover:bg-rose-50'
                    }`}
                  ><LogOut className="inline w-3.5 h-3.5 mr-2" />Sign out</button>
                )}
              </div>
            )}
          </div>

          {/* Mobile Menu Trigger */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((o) => !o)}
            className={`2xl:hidden p-1.5 border cursor-pointer ${
              isNightMode
                ? 'border-white/20 text-[#EDE8DF]'
                : 'border-[#141414]/20 text-[#141414]'
            }`}
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
        <div
          className={`2xl:hidden border-t p-4 shadow-xl space-y-3 animate-fadeIn ${
            isNightMode
              ? 'border-white/15 bg-[#181614] text-[#EDE8DF]'
              : 'border-[#141414]/15 bg-[#F4F1EA] text-[#141414]'
          }`}
        >
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
            {onToggleNightMode && (
              <button
                onClick={() => {
                  playTactileClick();
                  onToggleNightMode();
                }}
                className={`flex items-center gap-1 cursor-pointer font-medium ${
                  isNightMode ? 'text-[#F59E0B]' : 'text-[#4A433B]'
                }`}
              >
                {isNightMode ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
                <span>{isNightMode ? 'Day Mode' : 'Night Lamp'}</span>
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

        </div>
      )}
    </header>
  );
};
