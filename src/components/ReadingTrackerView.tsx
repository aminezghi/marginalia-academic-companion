import React, { useState } from 'react';
import {
  ResearchItem,
  ReadingGoal,
  ReadingSession,
  Highlight,
  ResearchNote,
} from '../types/research';
import {
  TrendingUp,
  Target,
  Clock,
  BookOpen,
  Calendar,
  Award,
  Plus,
  CheckCircle2,
  BarChart3,
  Flame,
} from 'lucide-react';
import { playTactileClick } from '../utils/sound';

interface ReadingTrackerViewProps {
  papers: ResearchItem[];
  goals: ReadingGoal[];
  readingSessions: ReadingSession[];
  highlights: Highlight[];
  notes: ResearchNote[];
  onUpdateGoals: (goals: ReadingGoal[]) => void;
}

export const ReadingTrackerView: React.FC<ReadingTrackerViewProps> = ({
  papers,
  goals,
  readingSessions,
  highlights,
  notes,
  onUpdateGoals,
}) => {
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [newGoalLabel, setNewGoalLabel] = useState('');
  const [newGoalTarget, setNewGoalTarget] = useState(5);
  const [newGoalPeriod, setNewGoalPeriod] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [newGoalType, setNewGoalType] = useState<'papers_per_week' | 'minutes_per_day' | 'papers_per_month'>('papers_per_week');

  // Aggregated Metrics
  const totalPagesRead = readingSessions.reduce((acc, s) => acc + s.pagesRead, 0);
  const totalMinutesRead = readingSessions.reduce((acc, s) => acc + s.durationMinutes, 0);
  const totalHours = (totalMinutesRead / 60).toFixed(1);
  const completedPapers = papers.filter((p) => p.readingStatus === 'completed');
  const inProgressPapers = papers.filter((p) => p.readingStatus === 'reading');

  // Category distribution calculation
  const categoryCounts: Record<string, number> = {};
  papers.forEach((p) => {
    categoryCounts[p.category] = (categoryCounts[p.category] || 0) + 1;
  });

  // Year histogram calculation
  const yearCounts: Record<string, number> = {};
  papers.forEach((p) => {
    const yr = p.year.slice(0, 4);
    yearCounts[yr] = (yearCounts[yr] || 0) + 1;
  });

  // 60-day calendar heatmap
  const today = new Date();
  const calendarDays = Array.from({ length: 60 }).map((_, i) => {
    const d = new Date();
    d.setDate(today.getDate() - (59 - i));
    const dateStr = d.toISOString().slice(0, 10);
    const session = readingSessions.find((s) => s.date === dateStr);
    return {
      date: dateStr,
      day: d.getDate(),
      month: d.toLocaleDateString('en-US', { month: 'short' }),
      weekday: d.toLocaleDateString('en-US', { weekday: 'narrow' }),
      duration: session?.durationMinutes || 0,
      pages: session?.pagesRead || 0,
    };
  });

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalLabel.trim()) return;
    playTactileClick();

    const newGoal: ReadingGoal = {
      id: `goal-${Date.now()}`,
      label: newGoalLabel.trim(),
      target: newGoalTarget,
      period: newGoalPeriod,
      type: newGoalType,
      current: 0,
    };

    onUpdateGoals([...goals, newGoal]);
    setNewGoalLabel('');
    setShowGoalModal(false);
  };

  const handleIncrementGoal = (goalId: string) => {
    playTactileClick();
    onUpdateGoals(
      goals.map((g) => (g.id === goalId ? { ...g, current: Math.min(g.target, g.current + 1) } : g))
    );
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-8 space-y-8 animate-in fade-in duration-200">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#141414]/15 pb-4">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#77736B]">
            HABIT & PROGRESS COMPANION · SUSTAINABLE SCHOLARSHIP
          </span>
          <h1 className="font-serif text-3xl font-medium tracking-tight text-[#141414] mt-0.5">
            Reading Tracker & Academic Habits
          </h1>
        </div>

        <button
          onClick={() => setShowGoalModal(true)}
          className="px-3.5 py-1.5 bg-[#1F3FB0] hover:bg-[#19328D] text-white text-xs font-mono uppercase font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>SET READING GOAL</span>
        </button>
      </div>

      {/* Primary KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        <div className="p-4 bg-white border border-[#141414]/15">
          <div className="text-[10px] font-mono text-[#77736B] uppercase">Pages Synthesized</div>
          <div className="text-2xl font-serif font-bold text-[#141414] mt-1">{totalPagesRead}</div>
          <span className="text-[10px] font-mono text-[#1F3FB0]">Across all sessions</span>
        </div>

        <div className="p-4 bg-white border border-[#141414]/15">
          <div className="text-[10px] font-mono text-[#77736B] uppercase">Total Deep Time</div>
          <div className="text-2xl font-serif font-bold text-[#1F3FB0] mt-1">{totalHours}h</div>
          <span className="text-[10px] font-mono text-[#77736B]">{totalMinutesRead} minutes</span>
        </div>

        <div className="p-4 bg-white border border-[#141414]/15">
          <div className="text-[10px] font-mono text-[#77736B] uppercase">Papers Completed</div>
          <div className="text-2xl font-serif font-bold text-[#536B52] mt-1">{completedPapers.length}</div>
          <span className="text-[10px] font-mono text-[#77736B]">{inProgressPapers.length} in progress</span>
        </div>

        <div className="p-4 bg-white border border-[#141414]/15">
          <div className="text-[10px] font-mono text-[#77736B] uppercase">Active Highlights</div>
          <div className="text-2xl font-serif font-bold text-blue-700 mt-1">{highlights.length}</div>
          <span className="text-[10px] font-mono text-[#77736B]">Key quotations</span>
        </div>

        <div className="p-4 bg-white border border-[#141414]/15">
          <div className="text-[10px] font-mono text-[#77736B] uppercase">Synthesis Notes</div>
          <div className="text-2xl font-serif font-bold text-amber-700 mt-1">{notes.length}</div>
          <span className="text-[10px] font-mono text-[#77736B]">Written insights</span>
        </div>

        <div className="p-4 bg-white border border-[#141414]/15">
          <div className="text-[10px] font-mono text-[#77736B] uppercase">Routine Streak</div>
          <div className="text-2xl font-serif font-bold text-orange-600 mt-1 flex items-center gap-1">
            <Flame className="w-5 h-5 text-orange-600" />
            <span>4 Days</span>
          </div>
          <span className="text-[10px] font-mono text-[#77736B]">Consistent pacing</span>
        </div>
      </div>

      {/* Reading Goals Section */}
      <div className="p-6 bg-white border border-[#141414]/15 space-y-4">
        <div className="flex items-center justify-between border-b border-[#141414]/10 pb-3">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-[#1F3FB0]" />
            <h2 className="font-serif text-lg font-medium text-[#141414]">
              Active Reading Goals
            </h2>
          </div>
          <span className="text-xs font-mono text-[#77736B]">
            {goals.filter((g) => g.current >= g.target).length} of {goals.length} Achieved
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {goals.map((goal) => {
            const percent = Math.min(100, Math.round((goal.current / goal.target) * 100));
            const isCompleted = goal.current >= goal.target;

            return (
              <div
                key={goal.id}
                className="p-4 bg-[#EDEBE6]/40 border border-[#141414]/15 rounded-[2px] flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between text-[10px] font-mono text-[#77736B] uppercase">
                    <span>{goal.period} GOAL</span>
                    {isCompleted && (
                      <span className="text-emerald-700 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> DONE
                      </span>
                    )}
                  </div>
                  <h3 className="font-serif font-medium text-base text-[#141414] mt-1">
                    {goal.label}
                  </h3>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-[#141414] font-bold">
                      {goal.current} / {goal.target}
                    </span>
                    <span className="text-[#77736B]">{percent}%</span>
                  </div>
                  <div className="w-full h-2 bg-stone-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        isCompleted ? 'bg-emerald-600' : 'bg-[#1F3FB0]'
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>

                <button
                  onClick={() => handleIncrementGoal(goal.id)}
                  disabled={isCompleted}
                  className="w-full py-1 border border-[#141414]/25 hover:border-[#1F3FB0] hover:text-[#1F3FB0] text-xs font-mono uppercase disabled:opacity-40 cursor-pointer bg-white"
                >
                  {isCompleted ? 'Goal Completed' : '+ Log Progress (+1)'}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* 60-Day Reading Heatmap Calendar */}
      <div className="p-6 bg-white border border-[#141414]/15 space-y-4">
        <div className="flex items-center justify-between border-b border-[#141414]/10 pb-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#1F3FB0]" />
            <h2 className="font-serif text-lg font-medium text-[#141414]">
              60-Day Literature Engagement Heatmap
            </h2>
          </div>
          <div className="text-xs font-mono text-[#77736B]">
            Daily reading duration in minutes
          </div>
        </div>

        <div className="grid grid-cols-6 sm:grid-cols-10 md:grid-cols-15 lg:grid-cols-20 gap-1.5 overflow-x-auto pb-2">
          {calendarDays.map((d, idx) => {
            let bg = 'bg-[#EDEBE6] border-[#141414]/10 text-[#77736B]';
            if (d.duration > 45) bg = 'bg-[#1F3FB0] text-white border-[#1F3FB0] font-bold';
            else if (d.duration > 25) bg = 'bg-blue-500 text-white border-blue-500 font-medium';
            else if (d.duration > 0) bg = 'bg-blue-200 text-[#141414] border-blue-300';

            return (
              <div
                key={idx}
                className={`h-12 border rounded-[2px] p-1 flex flex-col justify-between text-center select-none text-xs font-mono ${bg}`}
                title={`${d.date}: ${d.duration} mins reading (${d.pages} pages)`}
              >
                <span className="text-[8px] opacity-70 leading-none">{d.month}</span>
                <span className="text-[11px] leading-none">{d.day}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Literature Distribution Analytics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Chart 1: Research Category Distribution */}
        <div className="p-6 bg-white border border-[#141414]/15 space-y-4">
          <div className="flex items-center gap-2 border-b border-[#141414]/10 pb-2">
            <BarChart3 className="w-4 h-4 text-[#1F3FB0]" />
            <h3 className="font-serif text-base font-medium text-[#141414]">
              Collection Balance by Research Area
            </h3>
          </div>

          <div className="space-y-3">
            {Object.entries(categoryCounts).map(([cat, count]) => {
              const pct = Math.round((count / papers.length) * 100);
              return (
                <div key={cat} className="space-y-1">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-[#141414] font-medium">{cat}</span>
                    <span className="text-[#77736B]">
                      {count} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-stone-200 rounded-full overflow-hidden">
                    <div className="h-full bg-[#1F3FB0]" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chart 2: Publication Year Timeline */}
        <div className="p-6 bg-white border border-[#141414]/15 space-y-4">
          <div className="flex items-center gap-2 border-b border-[#141414]/10 pb-2">
            <TrendingUp className="w-4 h-4 text-[#536B52]" />
            <h3 className="font-serif text-base font-medium text-[#141414]">
              Chronological Publication Spectrum
            </h3>
          </div>

          <div className="flex items-end justify-between h-40 border-b border-[#141414]/15 pb-2 px-4">
            {Object.entries(yearCounts)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([year, count]) => (
                <div key={year} className="flex flex-col items-center gap-1.5 w-12">
                  <span className="text-[10px] font-mono font-bold text-[#141414]">{count}</span>
                  <div
                    className="w-full bg-[#536B52] rounded-t transition-all"
                    style={{ height: `${count * 30}px`, maxHeight: '100px' }}
                  />
                  <span className="text-[10px] font-mono text-[#77736B]">{year}</span>
                </div>
              ))}
          </div>

          <div className="text-[11px] font-mono text-[#77736B] text-center">
            Literature age distribution across active library catalog.
          </div>
        </div>
      </div>

      {/* Goal Modal */}
      {showGoalModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleAddGoal}
            className="bg-[#F4F2ED] border border-[#141414]/30 p-6 max-w-md w-full shadow-2xl space-y-4"
          >
            <div className="text-xs font-mono font-bold text-[#1F3FB0] uppercase">
              SET NEW ACADEMIC READING GOAL
            </div>

            <div>
              <label className="block text-[10px] font-mono uppercase text-[#77736B] mb-1">
                Goal Description
              </label>
              <input
                type="text"
                required
                value={newGoalLabel}
                onChange={(e) => setNewGoalLabel(e.target.value)}
                placeholder="e.g. Read 4 systematic reviews"
                className="w-full p-2 bg-white border border-[#141414]/25 text-xs font-mono"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-mono uppercase text-[#77736B] mb-1">
                  Target Units
                </label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={newGoalTarget}
                  onChange={(e) => setNewGoalTarget(parseInt(e.target.value, 10) || 1)}
                  className="w-full p-2 bg-white border border-[#141414]/25 text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-[#77736B] mb-1">
                  Period
                </label>
                <select
                  value={newGoalPeriod}
                  onChange={(e) => setNewGoalPeriod(e.target.value as any)}
                  className="w-full p-2 bg-white border border-[#141414]/25 text-xs font-mono"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#141414]/15">
              <button
                type="button"
                onClick={() => setShowGoalModal(false)}
                className="px-3 py-1.5 border text-xs font-mono uppercase cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-[#1F3FB0] text-white text-xs font-mono uppercase font-bold cursor-pointer"
              >
                Set Goal
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
