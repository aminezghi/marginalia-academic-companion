import React, { useState } from 'react';
import {
  ResearchItem,
  ResearchNote,
  Highlight,
  ActivityLog,
  ReadingSession,
} from '../types/research';
import {
  BookOpen,
  CheckCircle2,
  Clock,
  Highlighter,
  FileText,
  Flame,
  ArrowRight,
  TrendingUp,
  Sparkles,
  Search,
  Calendar,
  Layers,
} from 'lucide-react';
import { playTactileClick } from '../utils/sound';

interface HomeDashboardProps {
  papers: ResearchItem[];
  notes: ResearchNote[];
  highlights: Highlight[];
  activities: ActivityLog[];
  readingSessions: ReadingSession[];
  onSelectPaper: (paper: ResearchItem) => void;
  onOpenReader: (paper: ResearchItem) => void;
  onNavigateTab: (tab: any) => void;
  onOpenImport: () => void;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  papers,
  notes,
  highlights,
  activities,
  readingSessions,
  onSelectPaper,
  onOpenReader,
  onNavigateTab,
  onOpenImport,
}) => {
  const [universeFilter, setUniverseFilter] = useState<'all' | 'reading' | 'completed' | 'recent'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Calculations
  const readingNow = papers.filter((p) => p.readingStatus === 'reading');
  const completed = papers.filter((p) => p.readingStatus === 'completed');
  const toRead = papers.filter((p) => p.readingStatus === 'to_read' || p.readingStatus === 'inbox');
  const totalMinutes = papers.reduce(
    (acc, p) => acc + (p.readingProgress?.totalReadingTimeMinutes || 0),
    0
  );
  const totalHours = (totalMinutes / 60).toFixed(1);

  // Compute 7-day reading streak
  const today = new Date();
  const pastDays = Array.from({ length: 35 }).map((_, i) => {
    const d = new Date();
    d.setDate(today.getDate() - (34 - i));
    const dateStr = d.toISOString().slice(0, 10);
    const session = readingSessions.find((s) => s.date === dateStr);
    return {
      date: dateStr,
      dayName: d.toLocaleDateString('en-US', { weekday: 'narrow' }),
      dayNumber: d.getDate(),
      duration: session?.durationMinutes || 0,
      pages: session?.pagesRead || 0,
    };
  });

  const activeDaysCount = pastDays.filter((d) => d.duration > 0).length;
  const currentStreak = 4; // consecutive days with reading

  // Filtered universe items
  const filteredUniversePapers = papers.filter((p) => {
    if (universeFilter === 'reading') return p.readingStatus === 'reading';
    if (universeFilter === 'completed') return p.readingStatus === 'completed';
    if (universeFilter === 'recent') return parseInt(p.year, 10) >= 2024;
    return true;
  }).filter((p) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.title.toLowerCase().includes(q) ||
      p.authors.some((a) => a.toLowerCase().includes(q)) ||
      p.category.toLowerCase().includes(q)
    );
  });

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-8 space-y-8 animate-in fade-in duration-200">
      {/* Top Banner & Quick Search */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#141414]/15 pb-6">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#77736B] block">
            PERSONAL ACADEMIC STUDIO
          </span>
          <h1 className="font-serif text-3xl md:text-4xl font-medium tracking-tight text-[#141414] mt-1">
            My Research Universe
          </h1>
          <p className="text-xs font-mono text-[#77736B] mt-1.5">
            Living collection of scientific literature, active reading sessions, and synthesized ideas.
          </p>
        </div>

        {/* Global Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-[#77736B] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search papers, topics, authors..."
            className="w-full pl-9 pr-3 py-2 bg-white border border-[#141414]/25 text-xs font-mono focus:border-[#1F3FB0] focus:outline-hidden"
          />
        </div>
      </div>

      {/* Top Statistical Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-3.5 bg-white border border-[#141414]/15 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#77736B]">
            <span className="text-[10px] font-mono uppercase">Library Total</span>
            <BookOpen className="w-3.5 h-3.5 text-[#1F3FB0]" />
          </div>
          <div className="text-2xl font-serif font-bold text-[#141414] mt-2">{papers.length}</div>
          <span className="text-[10px] font-mono text-[#77736B] mt-1">Volumes Catalogued</span>
        </div>

        <div className="p-3.5 bg-white border border-[#141414]/15 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#77736B]">
            <span className="text-[10px] font-mono uppercase">Reading Now</span>
            <span className="w-2 h-2 rounded-full bg-amber-500" />
          </div>
          <div className="text-2xl font-serif font-bold text-amber-700 mt-2">{readingNow.length}</div>
          <span className="text-[10px] font-mono text-[#77736B] mt-1">In Active Review</span>
        </div>

        <div className="p-3.5 bg-white border border-[#141414]/15 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#77736B]">
            <span className="text-[10px] font-mono uppercase">Completed</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-[#536B52]" />
          </div>
          <div className="text-2xl font-serif font-bold text-[#536B52] mt-2">{completed.length}</div>
          <span className="text-[10px] font-mono text-[#77736B] mt-1">Full Synthesis Done</span>
        </div>

        <div className="p-3.5 bg-white border border-[#141414]/15 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#77736B]">
            <span className="text-[10px] font-mono uppercase">Reading Time</span>
            <Clock className="w-3.5 h-3.5 text-[#1F3FB0]" />
          </div>
          <div className="text-2xl font-serif font-bold text-[#141414] mt-2">{totalHours}h</div>
          <span className="text-[10px] font-mono text-[#77736B] mt-1">Total Focused Immersion</span>
        </div>

        <div className="p-3.5 bg-white border border-[#141414]/15 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#77736B]">
            <span className="text-[10px] font-mono uppercase">Highlights</span>
            <Highlighter className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <div className="text-2xl font-serif font-bold text-blue-700 mt-2">{highlights.length}</div>
          <span className="text-[10px] font-mono text-[#77736B] mt-1">Annotated Passages</span>
        </div>

        <div className="p-3.5 bg-white border border-[#141414]/15 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#77736B]">
            <span className="text-[10px] font-mono uppercase">Reading Streak</span>
            <Flame className="w-3.5 h-3.5 text-orange-600" />
          </div>
          <div className="text-2xl font-serif font-bold text-orange-600 mt-2">{currentStreak} Days</div>
          <span className="text-[10px] font-mono text-[#77736B] mt-1">Active Routine</span>
        </div>
      </div>

      {/* Reading Progress Calendar & Weekly Heatmap */}
      <div className="p-6 bg-white border border-[#141414]/15 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#141414]/10 pb-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#1F3FB0]" />
            <h2 className="font-serif text-lg font-medium text-[#141414]">
              35-Day Reading Activity & Heatmap
            </h2>
          </div>
          <div className="flex items-center gap-3 text-xs font-mono text-[#77736B]">
            <span>{activeDaysCount} Days Active</span>
            <span aria-hidden="true">·</span>
            <div className="flex items-center gap-1">
              <span className="text-[9px] uppercase">Less</span>
              <div className="w-2.5 h-2.5 bg-stone-100 border border-stone-200" />
              <div className="w-2.5 h-2.5 bg-blue-200" />
              <div className="w-2.5 h-2.5 bg-blue-500" />
              <div className="w-2.5 h-2.5 bg-[#1F3FB0]" />
              <span className="text-[9px] uppercase">More</span>
            </div>
          </div>
        </div>

        {/* Calendar Day Grid */}
        <div className="grid grid-cols-7 sm:grid-cols-12 md:grid-cols-35 gap-1.5 overflow-x-auto pb-1">
          {pastDays.map((d, idx) => {
            let bgClass = 'bg-[#EDEBE6] border-[#141414]/10';
            if (d.duration > 45) bgClass = 'bg-[#1F3FB0] text-white border-[#1F3FB0]';
            else if (d.duration > 25) bgClass = 'bg-blue-500 text-white border-blue-500';
            else if (d.duration > 0) bgClass = 'bg-blue-200 text-[#141414] border-blue-300';

            return (
              <div
                key={idx}
                className={`h-11 rounded-[2px] border p-1 flex flex-col justify-between text-center select-none ${bgClass}`}
                title={`${d.date}: ${d.duration} mins (${d.pages} pages read)`}
              >
                <span className="text-[8px] font-mono opacity-70 leading-none">{d.dayName}</span>
                <span className="text-[10px] font-mono font-semibold leading-none">{d.dayNumber}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Currently Reading Focus Strip */}
      {readingNow.length > 0 && (
        <div className="p-6 bg-[#F4F2ED] border border-[#141414]/15 space-y-4">
          <div className="flex items-center justify-between border-b border-[#141414]/15 pb-2">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#1F3FB0]" />
              <h2 className="font-serif text-lg font-medium text-[#141414]">
                Currently In Reading Focus
              </h2>
            </div>
            <button
              onClick={() => onNavigateTab('reader')}
              className="text-xs font-mono text-[#1F3FB0] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Open Reader</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {readingNow.slice(0, 2).map((item) => (
              <div
                key={item.id}
                className="p-4 bg-white border border-[#141414]/20 flex flex-col justify-between gap-3 group hover:border-[#1F3FB0] transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between text-[10px] font-mono text-[#77736B]">
                    <span>VOL. {item.number} · {item.category}</span>
                    <span className="font-bold text-[#1F3FB0]">
                      PAGE {item.readingProgress.currentPage} OF {item.readingProgress.totalPages}
                    </span>
                  </div>
                  <h3
                    onClick={() => onSelectPaper(item)}
                    className="font-serif text-base font-medium text-[#141414] group-hover:text-[#1F3FB0] mt-1.5 cursor-pointer leading-snug"
                  >
                    {item.title}
                  </h3>
                  <p className="text-xs font-mono text-[#77736B] mt-1">
                    {item.authors.slice(0, 2).join(', ')} ({item.year})
                  </p>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[10px] font-mono text-[#77736B]">
                    <span>Progress: {item.readingProgress.percent}%</span>
                    <span>{item.readingProgress.totalReadingTimeMinutes} mins logged</span>
                  </div>
                  <div className="w-full h-1.5 bg-stone-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#1F3FB0] transition-all"
                      style={{ width: `${item.readingProgress.percent}%` }}
                    />
                  </div>
                  <div className="pt-2 flex gap-2">
                    <button
                      onClick={() => onOpenReader(item)}
                      className="px-3 py-1 bg-[#1F3FB0] text-white text-xs font-mono uppercase font-semibold hover:bg-[#19328D] transition-colors cursor-pointer"
                    >
                      RESUME READING
                    </button>
                    <button
                      onClick={() => onSelectPaper(item)}
                      className="px-3 py-1 border border-[#141414]/20 hover:border-[#141414] text-xs font-mono uppercase transition-colors cursor-pointer"
                    >
                      WORKSPACE
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Living Universe Grid & Activity Column */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Living Research Universe Cards (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#141414]/15 pb-2">
            <h2 className="font-serif text-xl font-medium text-[#141414]">
              Living Research Collection ({filteredUniversePapers.length})
            </h2>

            {/* Filter Buttons */}
            <div className="flex items-center gap-1">
              {(
                [
                  { id: 'all', label: 'ALL' },
                  { id: 'reading', label: 'READING' },
                  { id: 'completed', label: 'COMPLETED' },
                  { id: 'recent', label: 'RECENT (2024+)' },
                ] as const
              ).map((f) => (
                <button
                  key={f.id}
                  onClick={() => setUniverseFilter(f.id)}
                  className={`px-2.5 py-1 text-xs font-mono uppercase border transition-colors cursor-pointer ${
                    universeFilter === f.id
                      ? 'bg-[#1F3FB0] text-white border-[#1F3FB0]'
                      : 'bg-white text-[#141414] border-[#141414]/20 hover:border-[#141414]'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredUniversePapers.map((paper) => (
              <div
                key={paper.id}
                onClick={() => onSelectPaper(paper)}
                className="p-4 bg-white border border-[#141414]/20 hover:border-[#1F3FB0] transition-all cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between text-[10px] font-mono text-[#77736B]">
                    <span className="font-semibold" style={{ color: paper.spineAccent }}>
                      {paper.category}
                    </span>
                    <span>{paper.year}</span>
                  </div>
                  <h3 className="font-serif font-medium text-base text-[#141414] group-hover:text-[#1F3FB0] mt-1.5 leading-snug">
                    {paper.title}
                  </h3>
                  <p className="text-xs font-mono text-[#77736B] mt-1 truncate">
                    {paper.authors.join(', ')}
                  </p>
                  <p className="text-xs font-sans text-[#141414]/75 mt-2 line-clamp-2 leading-relaxed">
                    {paper.abstract}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#141414]/10 mt-3 flex items-center justify-between text-xs font-mono">
                  <span
                    className={`text-[10px] uppercase font-semibold ${
                      paper.readingStatus === 'completed'
                        ? 'text-[#536B52]'
                        : paper.readingStatus === 'reading'
                        ? 'text-amber-800'
                        : 'text-[#77736B]'
                    }`}
                  >
                    {paper.readingStatus.replace('_', ' ')}
                  </span>
                  <span className="text-[#1F3FB0] group-hover:translate-x-1 transition-transform">
                    Examine →
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Recent Activity Timeline & Quick Tools (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Quick AI Action Card */}
          <div className="p-5 bg-[#141414] text-white border border-[#141414] shadow-md space-y-3">
            <div className="flex items-center gap-2 text-xs font-mono text-[#60A5FA]">
              <Sparkles className="w-4 h-4" />
              <span className="font-bold uppercase tracking-wider">AI RESEARCH COMPANION</span>
            </div>
            <p className="font-serif text-sm leading-relaxed text-stone-200">
              Query your entire library for research contradictions, methodologies, and cross-paper synthesis.
            </p>
            <button
              onClick={() => onNavigateTab('assistant')}
              className="w-full py-2 bg-[#1F3FB0] hover:bg-[#2563EB] text-white text-xs font-mono uppercase font-semibold transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              <span>ASK YOUR LIBRARY</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Activity Timeline */}
          <div className="p-5 bg-white border border-[#141414]/15 space-y-4">
            <h3 className="font-serif text-base font-medium text-[#141414] border-b border-[#141414]/10 pb-2">
              Recent Activity Feed
            </h3>
            <div className="space-y-3">
              {activities.slice(0, 5).map((act) => (
                <div key={act.id} className="text-xs font-mono space-y-0.5">
                  <div className="text-[#77736B] text-[10px]">
                    {new Date(act.timestamp).toLocaleDateString()} · {act.type.replace('_', ' ').toUpperCase()}
                  </div>
                  <div className="text-[#141414] font-sans text-xs leading-snug">
                    {act.description}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
