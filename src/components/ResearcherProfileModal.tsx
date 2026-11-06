import React, { useState } from 'react';
import { ResearcherProfile } from '../types/research';
import { X, ExternalLink, GraduationCap, Building2, Terminal, Network, Edit3, Check } from 'lucide-react';
import { playTactileClick } from '../utils/sound';

interface ResearcherProfileModalProps {
  profile: ResearcherProfile;
  isOpen: boolean;
  onClose: () => void;
  onUpdateProfile: (updated: Partial<ResearcherProfile>) => void;
}

export const ResearcherProfileModal: React.FC<ResearcherProfileModalProps> = ({
  profile,
  isOpen,
  onClose,
  onUpdateProfile,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(profile.name);
  const [title, setTitle] = useState(profile.title);
  const [primaryAffiliation, setPrimaryAffiliation] = useState(profile.primaryAffiliation);

  if (!isOpen) return null;

  const handleSave = () => {
    playTactileClick();
    onUpdateProfile({
      name,
      title,
      primaryAffiliation,
    });
    setIsEditing(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Researcher Academic Dossier"
    >
      <div className="relative w-full max-w-4xl max-h-[92vh] bg-[#F4F2ED] text-[#141414] border border-[#141414]/20 shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#141414]/15 bg-[#EDEBE6]">
          <div className="flex items-center gap-2 text-xs font-mono tracking-widest text-[#77736B]">
            <span className="text-[#141414] font-bold">DOSSIER REF: BIO-MSCA-01</span>
            <span aria-hidden="true">·</span>
            <span className="text-[#1F3FB0]">ACADEMIC CURRICULUM & APPOINTMENTS</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (isEditing) handleSave();
                else setIsEditing(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1 text-xs font-mono border border-[#141414]/25 hover:border-[#1F3FB0] hover:text-[#1F3FB0] transition-colors cursor-pointer"
            >
              {isEditing ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>SAVE CHANGES</span>
                </>
              ) : (
                <>
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>EDIT METADATA</span>
                </>
              )}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 border border-[#141414]/20 hover:bg-[#141414] hover:text-white transition-colors cursor-pointer"
              aria-label="Close Profile"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 p-6 md:p-8 overflow-y-auto space-y-8">
          {/* Identity Section */}
          <div className="border-b border-[#141414]/15 pb-6">
            {isEditing ? (
              <div className="space-y-3 font-mono text-xs">
                <div>
                  <label className="block text-[#77736B] uppercase mb-1">Researcher Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-2 bg-white border border-[#141414]/30 text-sm font-serif"
                  />
                </div>
                <div>
                  <label className="block text-[#77736B] uppercase mb-1">Academic Title & Role</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full p-2 bg-white border border-[#141414]/30 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[#77736B] uppercase mb-1">Primary Institutional Affiliation</label>
                  <input
                    type="text"
                    value={primaryAffiliation}
                    onChange={(e) => setPrimaryAffiliation(e.target.value)}
                    className="w-full p-2 bg-white border border-[#141414]/30 text-xs font-mono"
                  />
                </div>
              </div>
            ) : (
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#77736B] block">
                  FELLOWSHIP & AFFILIATION
                </span>
                <h1 className="font-serif text-3xl font-medium tracking-tight text-[#141414] mt-1">
                  {profile.name}
                </h1>
                <p className="text-sm font-mono text-[#1F3FB0] font-medium mt-1">
                  {profile.title}
                </p>
                <p className="text-xs font-mono text-[#77736B] mt-0.5">
                  {profile.program} · {profile.primaryAffiliation}
                </p>
              </div>
            )}
          </div>

          {/* Core Biography / Intellectual Statement */}
          <div className="space-y-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#77736B] block">
              INTELLECTUAL IDENTITY
            </span>
            <p className="font-serif text-base text-[#141414]/90 leading-relaxed max-w-prose text-justify">
              A multidisciplinary researcher working at the rigorous intersection of data science, behavioural modeling, and empirical methodology. My research investigates computational trend modeling, evidence synthesis, and experimental decision analytics using high-frequency data streams, immersive technologies, and statistical inference.
            </p>
          </div>

          {/* Academic Background */}
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-[#141414] font-semibold uppercase mb-3">
              <GraduationCap className="w-4 h-4 text-[#1F3FB0]" />
              <span>ACADEMIC BACKGROUND & DEGREES</span>
            </div>
            <div className="space-y-2.5">
              {profile.academicBackground.map((item, idx) => (
                <div key={idx} className="p-3 bg-[#EDEBE6] border border-[#141414]/15 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs font-mono">
                  <div>
                    <span className="font-semibold text-[#141414]">{item.degree}: </span>
                    <span className="text-[#1F3FB0]">{item.field}</span>
                    {item.institution && (
                      <span className="text-[#77736B] block sm:inline sm:ml-2">({item.institution})</span>
                    )}
                  </div>
                  {item.year && <span className="text-[#77736B] font-semibold shrink-0">{item.year}</span>}
                </div>
              ))}
            </div>
          </div>

          {/* Research Environments & Experience */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-[#141414] font-semibold uppercase mb-3">
                <Building2 className="w-4 h-4 text-[#1F3FB0]" />
                <span>CURRENT RESEARCH ENVIRONMENT</span>
              </div>
              <div className="space-y-3">
                {profile.currentEnvironment.map((env, i) => (
                  <div key={i} className="p-3.5 bg-white border border-[#141414]/15 text-xs font-sans">
                    <div className="font-semibold text-[#141414] font-serif text-sm">{env.institution}</div>
                    <div className="text-[11px] font-mono text-[#1F3FB0] mt-0.5">{env.role}</div>
                    <p className="text-[#77736B] text-[11px] leading-relaxed mt-1.5">{env.details}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-[#141414] font-semibold uppercase mb-3">
                <Network className="w-4 h-4 text-[#536B52]" />
                <span>PREVIOUS RESEARCH APPOINTMENTS</span>
              </div>
              <div className="space-y-3">
                {profile.previousExperience.map((exp, i) => (
                  <div key={i} className="p-3.5 bg-white border border-[#141414]/15 text-xs font-sans">
                    <div className="font-semibold text-[#141414] font-serif text-sm">{exp.institution}</div>
                    <div className="text-[11px] font-mono text-[#536B52] mt-0.5 font-semibold">
                      {exp.project} {exp.period && `(${exp.period})`}
                    </div>
                    <p className="text-[#77736B] text-[11px] leading-relaxed mt-1.5">{exp.focus}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Technical & Methodological Expertise */}
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-[#141414] font-semibold uppercase mb-3">
              <Terminal className="w-4 h-4 text-[#1F3FB0]" />
              <span>TECHNICAL & COMPUTATIONAL EXPERTISE</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
              {profile.technicalExpertise.map((tech, i) => (
                <div key={i} className="p-3 bg-white border border-[#141414]/15 flex flex-col justify-between">
                  <div className="text-[10px] text-[#77736B] uppercase font-bold mb-1.5">
                    {tech.category}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {tech.skills.map((s, idx) => (
                      <span key={idx} className="text-[10px] bg-[#EDEBE6] px-1.5 py-0.5 border border-[#141414]/10 text-[#141414]">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Verified Profiles & Academic Identifiers */}
          <div className="border-t border-[#141414]/15 pt-6">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#77736B] block mb-3">
              VERIFIED IDENTIFIERS & PROFILES
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
              {profile.verifiedLinks.map((link, idx) => (
                <a
                  key={idx}
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2.5 bg-white border border-[#141414]/20 hover:border-[#1F3FB0] hover:text-[#1F3FB0] transition-colors flex flex-col justify-between text-xs font-mono group"
                >
                  <span className="text-[10px] text-[#77736B] uppercase font-bold">{link.label}</span>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[11px] truncate text-[#141414] group-hover:text-[#1F3FB0]">
                      {link.handle || 'View'}
                    </span>
                    <ExternalLink className="w-3 h-3 text-[#77736B] group-hover:text-[#1F3FB0] shrink-0 ml-1" />
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
