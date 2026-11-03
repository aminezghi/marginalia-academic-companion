import React, { useState, useRef, useEffect } from 'react';
import { User, LogOut, Settings, Brain, Database, Download, ExternalLink, HelpCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface ProfileMenuProps {
  researcherName: string;
  researcherTitle?: string;
  onLogout?: () => void;
  onOpenProfile?: () => void;
  onOpenSettings?: () => void;
  onOpenApiKeys?: () => void;
  onExportData?: () => void;
  onOpenHelp?: () => void;
  isGuest?: boolean;
}

export const ProfileMenu: React.FC<ProfileMenuProps> = ({
  researcherName,
  researcherTitle,
  onLogout,
  onOpenProfile,
  onOpenSettings,
  onOpenApiKeys,
  onExportData,
  onOpenHelp,
  isGuest = false,
}) => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'U';
  };

  return (
    <div ref={menuRef} className="relative inline-block">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-1.5 bg-[#2C2520]/10 border border-[#141414]/25 rounded-full hover:bg-[#3C3630] transition-colors"
      >
        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#1F3FB0] to-[#1668D1] text-[#EFECE4] flex items-center justify-center font-serif text-sm font-bold">
          {getInitials(researcherName)}
        </div>
        <div className="hidden sm:flex flex-col items-start">
          <span className="text-xs font-serif text-[#4A433B] leading-tight">
            {researcherName.length > 12 ? researcherName.substring(0, 10) + '...' : researcherName}
          </span>
          {researcherTitle && (
            <span className="text-xs font-serif text-[#77736B] leading-tight">{researcherTitle}</span>
          )}
        </div>
        <svg className="w-3 h-3 text-[#77736B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-64 bg-white border border-[#141414]/15 rounded-lg shadow-lg z-50">
          <div className="p-2">
            {isGuest ? (
              <>
                <div className="px-3 py-2 border-b border-[#141414]/10">
                  <span className="text-xs font-mono uppercase tracking-wider text-[#77736B]">GUEST MODE</span>
                </div>
                
                <button
                  onClick={() => { setOpen(false); onOpenProfile && onOpenProfile(); }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm rounded hover:bg-[#E7E4DC] transition-colors"
                >
                  <User className="w-4 h-4 text-[#1F3FB0]" />
                  <span>Guest Profile</span>
                </button>
                
                <button
                  onClick={() => { setOpen(false); onOpenSettings && onOpenSettings(); }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm rounded hover:bg-[#E7E4DC] transition-colors"
                >
                  <Settings className="w-4 h-4 text-[#1F3FB0]" />
                  <span>Library Settings</span>
                </button>
                
                <button
                  onClick={() => { setOpen(false); onOpenApiKeys && onOpenApiKeys(); }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm rounded hover:bg-[#E7E4DC] transition-colors"
                >
                  <Brain className="w-4 h-4 text-[#1F3FB0]" />
                  <span>AI Provider & API Keys</span>
                </button>
                
                <div className="px-3 py-2 border-t border-[#141414]/10">
                  <button
                    onClick={() => { setOpen(false); alert('Create account to save your library across devices!'); }}
                    className="text-xs text-[#1F3FB0] hover:underline cursor-pointer"
                  >
                    Save My Library → Create Account
                  </button>
                </div>
              </>
            ) : (
              <>
                {onOpenProfile && (
                  <button
                    onClick={() => { setOpen(false); onOpenProfile(); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm rounded hover:bg-[#E7E4DC] transition-colors"
                  >
                    <User className="w-4 h-4 text-[#1F3FB0]" />
                    <span>My Profile</span>
                  </button>
                )}
                
                {onOpenSettings && (
                  <button
                    onClick={() => { setOpen(false); onOpenSettings(); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm rounded hover:bg-[#E7E4DC] transition-colors"
                  >
                    <Settings className="w-4 h-4 text-[#1F3FB0]" />
                    <span>Account Settings</span>
                  </button>
                )}
                
                {onOpenApiKeys && (
                  <button
                    onClick={() => { setOpen(false); onOpenApiKeys(); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm rounded hover:bg-[#E7E4DC] transition-colors"
                  >
                    <Brain className="w-4 h-4 text-[#1F3FB0]" />
                    <span>API Keys & Integrations</span>
                  </button>
                )}
                
                {onExportData && (
                  <button
                    onClick={() => { setOpen(false); onExportData(); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm rounded hover:bg-[#E7E4DC] transition-colors"
                  >
                    <Download className="w-4 h-4 text-[#1F3FB0]" />
                    <span>Export My Data</span>
                  </button>
                )}
                
                {onOpenHelp && (
                  <button
                    onClick={() => { setOpen(false); onOpenHelp(); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm rounded hover:bg-[#E7E4DC] transition-colors"
                  >
                    <HelpCircle className="w-4 h-4 text-[#1F3FB0]" />
                    <span>Help & Documentation</span>
                  </button>
                )}
                
                <div className="border-t border-[#141414]/10 pt-2">
                  {onLogout && (
                    <button
                      onClick={() => { setOpen(false); onLogout(); }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm rounded hover:bg-red-50 text-red-600 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
