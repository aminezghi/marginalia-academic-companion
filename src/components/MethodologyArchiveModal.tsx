import React, { useState } from 'react';
import { MethodologyCard, ResearchItem } from '../types/research';
import { X, ArrowRight, CheckCircle, Wrench, Layers } from 'lucide-react';
import { playTactileClick } from '../utils/sound';

interface MethodologyArchiveModalProps {
  methodologies: MethodologyCard[];
  allResearchItems: ResearchItem[];
  isOpen: boolean;
  onClose: () => void;
  onSelectResearchItem: (item: ResearchItem) => void;
}

export const MethodologyArchiveModal: React.FC<MethodologyArchiveModalProps> = ({
  methodologies,
  allResearchItems,
  isOpen,
  onClose,
  onSelectResearchItem,
}) => {
  const [selectedMethodId, setSelectedMethodId] = useState<string>(methodologies[0]?.id || '');

  if (!isOpen) return null;

  const activeMethod = methodologies.find((m) => m.id === selectedMethodId) || methodologies[0];
  const associatedItems = allResearchItems.filter((item) =>
    activeMethod?.associatedResearchIds.includes(item.id)
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Research Methodology Archive"
    >
      <div className="relative w-full max-w-5xl max-h-[92vh] bg-[#F4F2ED] text-[#141414] border border-[#141414]/20 shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#141414]/15 bg-[#EDEBE6]">
          <div className="flex items-center gap-2 text-xs font-mono tracking-widest text-[#77736B]">
            <span className="text-[#141414] font-bold">METHODOLOGY ARCHIVE</span>
            <span aria-hidden="true">·</span>
            <span className="text-[#1F3FB0]">EXPERIMENTAL PROTOCOLS & TOOLING</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 border border-[#141414]/20 hover:bg-[#141414] hover:text-white transition-colors cursor-pointer"
            aria-label="Close Methodology Archive"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Two-Column Grid: Left list of Cards / Right detail */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden">
          {/* Left Column: Methodology Cards Rail */}
          <div className="md:col-span-5 border-r border-[#141414]/15 overflow-y-auto p-4 space-y-2 bg-[#EDEBE6]/40">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#77736B] block px-2 mb-2">
              SECTOR SPECIFIC METHODS ({methodologies.length})
            </span>
            {methodologies.map((m) => {
              const isSelected = m.id === activeMethod?.id;
              return (
                <button
                  key={m.id}
                  onClick={() => {
                    playTactileClick();
                    setSelectedMethodId(m.id);
                  }}
                  className={`w-full text-left p-3.5 border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-white border-[#1F3FB0] shadow-sm'
                      : 'bg-white/60 border-[#141414]/15 hover:bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] font-mono text-[#77736B]">
                    <span>{m.category}</span>
                    {isSelected && <div className="w-2 h-2 rounded-full bg-[#1F3FB0]" />}
                  </div>
                  <div className="font-serif font-medium text-base text-[#141414] mt-1">
                    {m.title}
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {m.associatedTechniques.slice(0, 2).map((tech, idx) => (
                      <span
                        key={idx}
                        className="text-[9px] font-mono bg-[#EDEBE6] px-1.5 py-0.5 border border-[#141414]/10 text-[#77736B]"
                      >
                        {tech}
                      </span>
                    ))}
                    {m.associatedTechniques.length > 2 && (
                      <span className="text-[9px] font-mono text-[#77736B] self-center">
                        +{m.associatedTechniques.length - 2}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right Column: Active Methodology Full Protocol & Breakdown */}
          {activeMethod && (
            <div className="md:col-span-7 p-6 md:p-8 overflow-y-auto space-y-6 bg-[#F4F2ED]">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#77736B] block">
                  {activeMethod.category}
                </span>
                <h2 className="font-serif text-2xl md:text-3xl font-medium tracking-tight text-[#141414] mt-1">
                  {activeMethod.title}
                </h2>
              </div>

              {/* Scientific Applications */}
              <div className="border-t border-[#141414]/15 pt-4">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#77736B] block mb-2">
                  SCIENTIFIC RATIONALE & APPLICATIONS
                </span>
                <p className="font-serif text-base text-[#141414]/90 leading-relaxed text-justify">
                  {activeMethod.scientificApplications}
                </p>
              </div>

              {/* Step-by-Step Experimental Workflow */}
              <div className="border-t border-[#141414]/15 pt-4">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#77736B] block mb-3">
                  RIGOROUS EXPERIMENTAL WORKFLOW
                </span>
                <div className="space-y-2">
                  {activeMethod.workflow.map((step, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-white border border-[#141414]/15 flex items-start gap-3 text-xs font-sans text-[#141414]"
                    >
                      <span className="font-mono text-xs font-bold text-[#1F3FB0] shrink-0">
                        STAGE 0{idx + 1}
                      </span>
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tools & Software Stack */}
              <div className="border-t border-[#141414]/15 pt-4">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#77736B] block mb-2">
                  COMPUTATIONAL TOOLS & PLATFORMS
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {activeMethod.tools.map((t, idx) => (
                    <span
                      key={idx}
                      className="text-xs font-mono bg-white px-2.5 py-1 border border-[#141414]/20 text-[#141414] font-medium"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Associated Archive Research Items */}
              {associatedItems.length > 0 && (
                <div className="border-t border-[#141414]/15 pt-4">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#77736B] block mb-2">
                    CROSS-REFERENCED ARCHIVE PUBLICATIONS
                  </span>
                  <div className="space-y-2">
                    {associatedItems.map((pub) => (
                      <button
                        key={pub.id}
                        onClick={() => {
                          onClose();
                          onSelectResearchItem(pub);
                        }}
                        className="w-full text-left p-3 bg-white border border-[#141414]/20 hover:border-[#1F3FB0] transition-colors flex items-center justify-between group cursor-pointer"
                      >
                        <div>
                          <div className="text-[10px] font-mono text-[#77736B]">
                            VOL. {pub.number} · {pub.year} · {pub.type}
                          </div>
                          <div className="font-serif font-medium text-sm text-[#141414] group-hover:text-[#1F3FB0] mt-0.5">
                            {pub.title}
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-[#77736B] group-hover:text-[#1F3FB0] group-hover:translate-x-1 transition-transform shrink-0 ml-2" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
