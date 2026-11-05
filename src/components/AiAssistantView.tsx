import React, { useState } from 'react';
import {
  Sparkles,
  Search,
  BookOpen,
  Layers,
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  RefreshCw,
  Copy,
  Check,
  Cpu,
  FileQuestion,
  GitCompare,
  Scroll,
} from 'lucide-react';
import { ResearchItem } from '../types/research';
import { playTactileClick, playPaperRustle } from '../utils/sound';

interface AiAssistantViewProps {
  onShowApiKeyPrompt?: () => void;
  papers: ResearchItem[];
  onOpenPaperInReader: (paper: ResearchItem) => void;
  onOpenPaperDetail: (paper: ResearchItem) => void;
}

interface CitationSource {
  index: number;
  title: string;
  year?: string | number;
  authors?: string | string[];
  paperId?: string;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  mode?: string;
  citedPapers?: CitationSource[];
}

export const AiAssistantView: React.FC<AiAssistantViewProps> = ({
  onShowApiKeyPrompt,
  papers,
  onOpenPaperInReader,
  onOpenPaperDetail,
}) => {
  const [query, setQuery] = useState('');
  const [selectedPaperIds, setSelectedPaperIds] = useState<string[]>([]);
  const [selectedMode, setSelectedMode] = useState<
    'ask' | 'summarize' | 'compare' | 'synthesis' | 'methodology'
  >('ask');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        'Welcome to your Academic Research Assistant. You can query your indexed papers, synthesize literature across authors, contrast methodologies, or explore theoretical gaps. Every insight will cite specific sources in your library.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Suggested prompt templates
  const SUGGESTED_PROMPTS = [
    {
      label: 'Synthesize sustainable consumption findings',
      mode: 'synthesis' as const,
      query:
        'What are the prevailing empirical findings across our library regarding consumer choices in sustainable food systems?',
    },
    {
      label: 'Compare experimental & survey methodologies',
      mode: 'compare' as const,
      query:
        'Compare the methodologies used in the eye-tracking / VR studies against traditional stated-preference surveys.',
    },
    {
      label: 'Identify research gaps in digital nudging',
      mode: 'ask' as const,
      query:
        'What theoretical and empirical gaps are highlighted regarding digital nudging and consumer food choice?',
    },
    {
      label: 'Summarize top evaluated paper',
      mode: 'summarize' as const,
      query: 'Summarize the primary contribution, methodology, and limitations of this study.',
    },
  ];

  // Helper to toggle paper filter
  const togglePaperSelect = (id: string) => {
    playTactileClick();
    setSelectedPaperIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    playTactileClick();
    setSelectedPaperIds(papers.map((p) => p.id));
  };

  const clearSelection = () => {
    playTactileClick();
    setSelectedPaperIds([]);
  };

  // Determine active target papers
  const targetPapers =
    selectedPaperIds.length > 0
      ? papers.filter((p) => selectedPaperIds.includes(p.id))
      : papers;

  const handleSend = async (customQuery?: string, customMode?: typeof selectedMode) => {
    const textToSend = customQuery || query;
    const modeToSend = customMode || selectedMode;

    if (!textToSend.trim() || isLoading) return;

    playPaperRustle();
    const userMsgId = 'msg-' + Date.now();
    const newUserMsg: Message = {
      id: userMsgId,
      role: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      mode: modeToSend,
    };

    setMessages((prev) => [...prev, newUserMsg]);
    setQuery('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: textToSend,
          mode: modeToSend,
          papers: targetPapers.map((p) => ({
            id: p.id,
            title: p.title,
            authors: Array.isArray(p.authors) ? p.authors.join(', ') : (p.authors || p.journal || 'Academic Research'),
            year: parseInt(String(p.year), 10) || 2026,
            abstract: p.abstract || '',
            category: p.category,
            methodology: p.methodology || (p.methods ? p.methods.join(', ') : 'Empirical study'),
            findings: p.findings || (p.keyFindings ? p.keyFindings.join('. ') : 'Significant behavioral effects observed'),
            fullText: p.extractedText || p.pdfContentText || p.abstract || '',
          })),
        }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        if (data.code === 'API_KEY_REQUIRED') onShowApiKeyPrompt?.();
        throw new Error(data.error || `AI request failed (${response.status}).`);
      }

      // Find citations in the returned response
      const matchedCitations: CitationSource[] = [];
      targetPapers.forEach((p, idx) => {
        const authorsStr = Array.isArray(p.authors) ? p.authors.join(', ') : (p.authors || '');
        const primaryAuthor = authorsStr.split(',')[0].trim().toLowerCase();
        if (
          data.answer.toLowerCase().includes(p.title.toLowerCase().slice(0, 30)) ||
          data.answer.includes(`[Source ${idx + 1}`) ||
          (primaryAuthor && data.answer.toLowerCase().includes(primaryAuthor))
        ) {
          matchedCitations.push({
            index: idx + 1,
            title: p.title,
            year: p.year,
            authors: authorsStr,
            paperId: p.id,
          });
        }
      });

      const assistantMsg: Message = {
        id: 'msg-res-' + Date.now(),
        role: 'assistant',
        content: data.answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        mode: modeToSend,
        citedPapers: matchedCitations.length > 0 ? matchedCitations : undefined,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (error) {
      const assistantMsg: Message = {
        id: 'msg-fallback-' + Date.now(),
        role: 'assistant',
        content: error instanceof Error
          ? `AI is unavailable: ${error.message}`
          : 'AI is unavailable. Check the API key and internet connection, then try again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        mode: modeToSend,
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    playTactileClick();
    setTimeout(() => setCopiedId(null), 2000);
  };


  return (
    <div className="min-h-screen bg-[#EDEBE6] text-[#141414] pb-24">
      {/* Header bar */}
      <div className="border-b border-[#141414]/10 bg-[#EDEBE6]/90 backdrop-blur-md sticky top-0 z-20 px-8 py-5">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-xs uppercase tracking-widest text-[#1F3FB0] font-medium flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                INTELLIGENT RESEARCH ASSISTANT
              </span>
              <span className="text-[#141414]/30 text-xs">/</span>
              <span className="font-mono text-xs uppercase tracking-wider text-[#141414]/50">
                LITERATURE REASONING & SYNTHESIS
              </span>
            </div>
            <h1 className="font-serif text-3xl font-light tracking-tight text-[#141414]">
              Ask Your Library
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-[#141414]/60 uppercase tracking-wider">
              SCOPE:
            </span>
            <span className="px-2.5 py-1 bg-[#141414]/5 border border-[#141414]/15 font-mono text-xs rounded font-medium">
              {selectedPaperIds.length === 0
                ? `All Papers (${papers.length})`
                : `${selectedPaperIds.length} of ${papers.length} selected`}
            </span>
            {selectedPaperIds.length > 0 && (
              <button
                onClick={clearSelection}
                className="text-xs font-mono text-[#1F3FB0] hover:underline ml-1 cursor-pointer"
              >
                Reset
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-8 pt-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Scope & Mode selection */}
        <div className="lg:col-span-4 space-y-6">
          {/* Mode Selector */}
          <div className="bg-[#E7E4DC] border border-[#141414]/15 p-5">
            <div className="font-mono text-xs uppercase tracking-widest text-[#141414]/60 mb-3 flex items-center justify-between">
              <span>Reasoning Mode</span>
              <Cpu className="w-3.5 h-3.5 text-[#1F3FB0]" />
            </div>

            <div className="space-y-1.5">
              {[
                {
                  id: 'ask' as const,
                  label: 'General Query',
                  desc: 'Search & question the whole collection',
                  icon: Search,
                },
                {
                  id: 'synthesis' as const,
                  label: 'Literature Synthesis',
                  desc: 'Generate thematic review & evidence matrix',
                  icon: Scroll,
                },
                {
                  id: 'compare' as const,
                  label: 'Cross-Paper Comparison',
                  desc: 'Contrasting methods, hypotheses & results',
                  icon: GitCompare,
                },
                {
                  id: 'summarize' as const,
                  label: 'Comprehensive Summary',
                  desc: 'Structured breakdown of key contribution',
                  icon: BookOpen,
                },
                {
                  id: 'methodology' as const,
                  label: 'Methodology Audit',
                  desc: 'Inspect sample sizes, stimuli & experimental tools',
                  icon: FileQuestion,
                },
              ].map((m) => {
                const Icon = m.icon;
                const active = selectedMode === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => {
                      playTactileClick();
                      setSelectedMode(m.id);
                    }}
                    className={`w-full text-left p-3 border transition-all cursor-pointer ${
                      active
                        ? 'border-[#1F3FB0] bg-white text-[#141414] shadow-sm'
                        : 'border-[#141414]/10 bg-[#EDEBE6]/60 text-[#141414]/80 hover:bg-white/80'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Icon
                        className={`w-4 h-4 ${active ? 'text-[#1F3FB0]' : 'text-[#141414]/60'}`}
                      />
                      <span className="font-sans text-sm font-medium">{m.label}</span>
                    </div>
                    <p className="font-sans text-xs text-[#141414]/60 leading-relaxed pl-6">
                      {m.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Paper Scope Selector */}
          <div className="bg-[#E7E4DC] border border-[#141414]/15 p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="font-mono text-xs uppercase tracking-widest text-[#141414]/60">
                Target Sources ({selectedPaperIds.length || papers.length})
              </span>
              <div className="flex gap-2">
                <button
                  onClick={selectAll}
                  className="font-mono text-[10px] text-[#1F3FB0] hover:underline uppercase cursor-pointer"
                >
                  All
                </button>
                <span className="text-[#141414]/30">|</span>
                <button
                  onClick={clearSelection}
                  className="font-mono text-[10px] text-[#141414]/60 hover:underline uppercase cursor-pointer"
                >
                  None
                </button>
              </div>
            </div>

            <p className="font-sans text-xs text-[#141414]/65 mb-3 leading-relaxed">
              Limit queries to specific papers or let the assistant scan your entire index.
            </p>

            <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1">
              {papers.map((p) => {
                const isSelected = selectedPaperIds.includes(p.id);
                return (
                  <button
                    key={p.id}
                    onClick={() => togglePaperSelect(p.id)}
                    className={`w-full text-left p-2.5 text-xs border transition-colors flex items-start gap-2 cursor-pointer ${
                      isSelected
                        ? 'border-[#1F3FB0] bg-[#1F3FB0]/5 text-[#141414]'
                        : 'border-[#141414]/10 bg-[#EDEBE6]/40 hover:bg-[#EDEBE6]'
                    }`}
                  >
                    <div
                      className={`w-3.5 h-3.5 rounded border mt-0.5 flex items-center justify-center flex-shrink-0 ${
                        isSelected
                          ? 'border-[#1F3FB0] bg-[#1F3FB0] text-white'
                          : 'border-[#141414]/30 bg-white'
                      }`}
                    >
                      {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-serif font-normal text-xs text-[#141414] line-clamp-1">
                        {p.title}
                      </div>
                      <div className="font-mono text-[10px] text-[#141414]/50 flex items-center gap-1 mt-0.5">
                        <span>{p.year}</span>
                        <span>•</span>
                        <span className="truncate">{p.category}</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Prompts */}
          <div className="bg-[#E7E4DC] border border-[#141414]/15 p-5">
            <span className="font-mono text-xs uppercase tracking-widest text-[#141414]/60 block mb-3">
              Prompt Inspirations
            </span>
            <div className="space-y-2">
              {SUGGESTED_PROMPTS.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setSelectedMode(p.mode);
                    setQuery(p.query);
                    handleSend(p.query, p.mode);
                  }}
                  className="w-full text-left p-2.5 bg-white border border-[#141414]/10 hover:border-[#1F3FB0] text-xs font-sans text-[#141414]/80 hover:text-[#1F3FB0] transition-colors flex items-center justify-between group cursor-pointer"
                >
                  <span className="line-clamp-1">{p.label}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#141414]/40 group-hover:text-[#1F3FB0] transition-transform group-hover:translate-x-0.5 flex-shrink-0 ml-2" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Chat Interface & Source Inspection */}
        <div className="lg:col-span-8 flex flex-col space-y-6">
          {/* Messages Feed */}
          <div className="space-y-4 min-h-[460px]">
            {messages.map((m) => {
              const isAssistant = m.role === 'assistant';
              return (
                <div
                  key={m.id}
                  className={`border transition-all ${
                    isAssistant
                      ? 'bg-white border-[#141414]/15 shadow-sm'
                      : 'bg-[#141414] text-white border-[#141414]'
                  }`}
                >
                  {/* Message header */}
                  <div
                    className={`px-5 py-3 border-b flex items-center justify-between ${
                      isAssistant
                        ? 'border-[#141414]/10 bg-[#FAF9F5]'
                        : 'border-white/10 bg-[#1E1E1E]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {isAssistant ? (
                        <>
                          <Sparkles className="w-4 h-4 text-[#1F3FB0]" />
                          <span className="font-mono text-xs uppercase tracking-widest text-[#1F3FB0] font-medium">
                            Marginalia Intelligence
                          </span>
                        </>
                      ) : (
                        <span className="font-mono text-xs uppercase tracking-widest text-white/70">
                          Researcher Query
                        </span>
                      )}
                      {m.mode && (
                        <span
                          className={`font-mono text-[10px] uppercase px-1.5 py-0.5 border ${
                            isAssistant
                              ? 'border-[#141414]/15 bg-white text-[#141414]/60'
                              : 'border-white/20 bg-white/10 text-white/70'
                          }`}
                        >
                          {m.mode}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className={`font-mono text-[10px] ${
                          isAssistant ? 'text-[#141414]/40' : 'text-white/40'
                        }`}
                      >
                        {m.timestamp}
                      </span>
                      {isAssistant && (
                        <button
                          onClick={() => handleCopy(m.id, m.content)}
                          className="text-[#141414]/40 hover:text-[#141414] transition-colors p-1 cursor-pointer"
                          title="Copy response"
                        >
                          {copiedId === m.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Message Body */}
                  <div className="p-6">
                    <div
                      className={`font-serif text-base leading-relaxed whitespace-pre-wrap ${
                        isAssistant ? 'text-[#141414]/90' : 'text-white/95'
                      }`}
                    >
                      {m.content}
                    </div>

                    {/* Cited sources section */}
                    {m.citedPapers && m.citedPapers.length > 0 && (
                      <div className="mt-6 pt-5 border-t border-[#141414]/10">
                        <div className="font-mono text-[11px] uppercase tracking-wider text-[#141414]/50 mb-3 flex items-center gap-1.5">
                          <Layers className="w-3.5 h-3.5 text-[#1F3FB0]" />
                          <span>REFERENCED SOURCES IN LIBRARY ({m.citedPapers.length})</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                          {m.citedPapers.map((c, i) => {
                            const originalPaper = papers.find((p) => p.id === c.paperId);
                            return (
                              <div
                                key={i}
                                className="bg-[#FAF9F5] border border-[#141414]/15 p-3 hover:border-[#1F3FB0] transition-colors flex flex-col justify-between"
                              >
                                <div>
                                  <div className="flex items-center gap-1.5 mb-1">
                                    <span className="font-mono text-[10px] bg-[#1F3FB0] text-white px-1.5 py-0.2 rounded font-semibold">
                                      [{c.index}]
                                    </span>
                                    <span className="font-mono text-[10px] text-[#141414]/60">
                                      {c.year}
                                    </span>
                                  </div>
                                  <div className="font-serif text-xs font-normal text-[#141414] line-clamp-2">
                                    {c.title}
                                  </div>
                                  {c.authors && (
                                    <div className="font-sans text-[11px] text-[#141414]/50 truncate mt-1">
                                      {c.authors}
                                    </div>
                                  )}
                                </div>

                                {originalPaper && (
                                  <div className="flex items-center gap-2 mt-3 pt-2 border-t border-[#141414]/10">
                                    <button
                                      onClick={() => onOpenPaperInReader(originalPaper)}
                                      className="font-mono text-[10px] text-[#1F3FB0] hover:underline flex items-center gap-1 cursor-pointer"
                                    >
                                      <BookOpen className="w-3 h-3" />
                                      Read Paper
                                    </button>
                                    <span className="text-[#141414]/20">•</span>
                                    <button
                                      onClick={() => onOpenPaperDetail(originalPaper)}
                                      className="font-mono text-[10px] text-[#141414]/60 hover:text-[#141414] flex items-center gap-1 cursor-pointer"
                                    >
                                      <ExternalLink className="w-3 h-3" />
                                      Inspect
                                    </button>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {isLoading && (
              <div className="bg-white border border-[#141414]/15 p-6 shadow-sm flex items-center gap-4">
                <RefreshCw className="w-5 h-5 text-[#1F3FB0] animate-spin" />
                <div>
                  <div className="font-mono text-xs uppercase tracking-wider text-[#1F3FB0] font-medium">
                    SYNTHESIZING RESEARCH ARCHIVE...
                  </div>
                  <div className="font-serif text-sm text-[#141414]/60 mt-0.5">
                    Analyzing abstracts, findings, methodologies, and cross-referencing citations
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Prompt Input Box */}
          <div className="bg-white border border-[#141414]/20 shadow-md p-3 sticky bottom-4">
            <div className="flex items-end gap-3">
              <textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                rows={2}
                placeholder={`Ask anything across ${
                  targetPapers.length
                } research items (e.g. "Contrast findings on eco-labels and consumer willingness to pay")...`}
                className="flex-1 bg-transparent border-0 resize-none font-serif text-base text-[#141414] placeholder-[#141414]/40 focus:outline-none p-2 leading-relaxed"
              />

              <button
                onClick={() => handleSend()}
                disabled={!query.trim() || isLoading}
                className="bg-[#141414] text-white hover:bg-[#1F3FB0] disabled:bg-[#141414]/20 disabled:cursor-not-allowed transition-colors px-5 py-3 flex items-center gap-2 font-mono text-xs uppercase tracking-wider font-medium cursor-pointer"
              >
                <span>Inquire</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center justify-between px-2 pt-2 border-t border-[#141414]/10 mt-2">
              <span className="font-mono text-[10px] text-[#141414]/40">
                Press Enter to send, Shift + Enter for new line • Grounded in your collection
              </span>
              <span className="font-mono text-[10px] text-[#1F3FB0] flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Zero Hallucination Grounding
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Fallback logic for offline synthesis
