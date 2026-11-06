import React, { useState } from 'react';
import {
  Sparkles,
  BookOpen,
  Search,
  X,
  Cpu,
  Zap,
  Globe,
  Dna,
  Compass,
  ArrowRight,
  Layers,
  Loader2,
} from 'lucide-react';
import { ResearchItem, ResearchCollection } from '../types/research';
import { POPULAR_TOPICS, fetchOpenAccessPapersByTopic, TopicPreset } from '../services/sampleResearchService';
import { playTactileClick, playPaperRustle } from '../utils/sound';

interface TopicSampleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadPapers: (papers: ResearchItem[], collection: ResearchCollection) => void;
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Cpu,
  Zap,
  Globe,
  Dna,
  Sparkles,
  Compass,
};

export const TopicSampleModal: React.FC<TopicSampleModalProps> = ({
  isOpen,
  onClose,
  onLoadPapers,
}) => {
  const [selectedTopic, setSelectedTopic] = useState<TopicPreset | null>(POPULAR_TOPICS[0]);
  const [customTopic, setCustomTopic] = useState('');
  const [paperCount, setPaperCount] = useState<number>(8);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  if (!isOpen) return null;

  const handleSelectPreset = (preset: TopicPreset) => {
    playTactileClick();
    setSelectedTopic(preset);
    setCustomTopic('');
  };

  const handleFetch = async () => {
    const topicToQuery = customTopic.trim() || selectedTopic?.query || 'artificial intelligence';
    const displayTopic = customTopic.trim() || selectedTopic?.name || 'Scientific Research';

    setIsLoading(true);
    setStatusMessage(`Searching open-access research archives for "${displayTopic}"…`);
    playPaperRustle();

    try {
      setTimeout(() => {
        setStatusMessage('Parsing peer-reviewed metadata, DOIs, and abstracts…');
      }, 700);

      const result = await fetchOpenAccessPapersByTopic(topicToQuery, paperCount);
      playPaperRustle();
      onLoadPapers(result.papers, result.collection);
      onClose();
    } catch (err) {
      console.error('Failed to load topic papers:', err);
      setStatusMessage('Network request timed out. Please try another query.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="topic-sample-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-[#EDE8DD] border-2 border-[#141414] shadow-[8px_8px_0px_0px_rgba(20,20,20,1)] overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Banner */}
        <div className="bg-[#1F3FB0] text-white px-5 py-3 flex items-center justify-between select-none">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-white" />
            <span className="font-mono text-xs tracking-widest uppercase font-semibold">
              EXPLORE OPEN-ACCESS SCHOLARSHIP
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white p-1 cursor-pointer transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          <div>
            <h2 id="topic-sample-title" className="font-serif text-2xl font-light text-[#141414]">
              Populate Your Shelf with Real Open-Science Literature
            </h2>
            <p className="mt-1 font-serif italic text-sm text-[#4A433B]">
              Choose a discipline or specify any academic domain. Marginalia will harvest peer-reviewed open-access articles with verified DOIs, abstracts, and authors from international repositories.
            </p>
          </div>

          {/* Preset Topics Grid */}
          <div className="space-y-2">
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#141414]/60 block font-semibold">
              TRENDING SCIENTIFIC FIELDS
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {POPULAR_TOPICS.map((preset) => {
                const IconComponent = ICON_MAP[preset.iconName] || BookOpen;
                const isSelected = selectedTopic?.id === preset.id && !customTopic.trim();
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleSelectPreset(preset)}
                    className={`p-3 text-left border transition-all cursor-pointer rounded-[2px] flex items-start gap-3 ${
                      isSelected
                        ? 'border-[#1F3FB0] bg-white text-[#141414] shadow-sm ring-1 ring-[#1F3FB0]'
                        : 'border-[#141414]/15 bg-[#F4F1EA] text-[#141414]/80 hover:bg-white hover:border-[#141414]/40'
                    }`}
                  >
                    <div
                      className={`p-2 rounded border mt-0.5 shrink-0 ${
                        isSelected
                          ? 'bg-[#1F3FB0] text-white border-[#1F3FB0]'
                          : 'bg-white text-[#1F3FB0] border-[#141414]/15'
                      }`}
                    >
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-serif text-sm font-medium leading-snug">
                        {preset.name}
                      </div>
                      <p className="font-sans text-[11px] text-[#77736B] leading-tight mt-1 line-clamp-2">
                        {preset.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Search Topic Input */}
          <div className="space-y-2">
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#141414]/60 block font-semibold">
              OR TYPE ANY CUSTOM RESEARCH INQUIRY
            </span>
            <div className="relative border-2 border-[#141414] bg-white flex items-center px-3.5 py-2.5">
              <Search className="w-4 h-4 text-[#1F3FB0] mr-2 shrink-0" />
              <input
                type="text"
                value={customTopic}
                onChange={(e) => {
                  setCustomTopic(e.target.value);
                  if (e.target.value.trim()) setSelectedTopic(null);
                }}
                placeholder="e.g. 'Surgical Robotics', 'Solid State Batteries', 'Paleogenomics'…"
                className="w-full bg-transparent font-serif text-sm text-[#141414] placeholder-[#141414]/40 focus:outline-none"
              />
              {customTopic && (
                <button
                  type="button"
                  onClick={() => setCustomTopic('')}
                  className="font-mono text-xs text-[#77736B] hover:text-[#141414] px-1 cursor-pointer"
                >
                  CLEAR
                </button>
              )}
            </div>
          </div>

          {/* Volume Count Selector */}
          <div className="flex items-center justify-between border-t border-[#141414]/10 pt-4">
            <span className="font-mono text-xs text-[#4A433B]">
              Number of Volumes to Bind:
            </span>
            <div className="flex items-center gap-1.5 font-mono text-xs">
              {[5, 8, 12].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => {
                    playTactileClick();
                    setPaperCount(num);
                  }}
                  className={`px-3 py-1 border transition-colors cursor-pointer ${
                    paperCount === num
                      ? 'bg-[#141414] text-white border-[#141414] font-semibold'
                      : 'bg-white text-[#141414] border-[#141414]/20 hover:border-[#141414]'
                  }`}
                >
                  {num} Books
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer & Action */}
        <div className="border-t-2 border-[#141414] bg-[#F4F1EA] px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs font-mono text-[#77736B] truncate max-w-sm">
            {isLoading ? (
              <span className="flex items-center gap-2 text-[#1F3FB0] font-semibold">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                {statusMessage}
              </span>
            ) : (
              <span>Source: OpenAlex Open Access Archive (Live API)</span>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 border border-[#141414]/25 bg-white font-mono text-xs uppercase hover:bg-stone-50 cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleFetch}
              disabled={isLoading || (!selectedTopic && !customTopic.trim())}
              className="px-5 py-2 bg-[#1F3FB0] border border-[#1F3FB0] text-white font-mono text-xs uppercase tracking-wider hover:bg-[#18338f] cursor-pointer disabled:opacity-50 flex items-center gap-2 shadow-sm font-semibold"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Harvesting…</span>
                </>
              ) : (
                <>
                  <span>Load Into Bookshelf</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
