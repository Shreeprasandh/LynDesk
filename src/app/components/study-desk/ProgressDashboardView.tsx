"use client";

import React from "react";
import { StudyPath, StudyMistake, StudyStats } from "../../study-desk/types";
import { 
  Flame, 
  Zap, 
  Calendar, 
  RotateCcw, 
  BookOpen, 
  ArrowRight,
  Award,
  TrendingUp,
  Activity
} from "lucide-react";

interface ProgressDashboardViewProps {
  stats: StudyStats;
  paths: StudyPath[];
  mistakes: StudyMistake[];
  onOpenErrorBank: () => void;
  onResumePath: (pathId: string) => void;
}

export default function ProgressDashboardView({
  stats,
  paths,
  mistakes,
  onOpenErrorBank,
  onResumePath,
}: ProgressDashboardViewProps) {
  // Generate 30-day activity grid
  const daysGrid: { dateStr: string; isActive: boolean; dayNum: number }[] = [];
  const todayMs = new Date().getTime();

  for (let i = 29; i >= 0; i--) {
    const d = new Date(todayMs - i * 24 * 60 * 60 * 1000);
    const dateStr = d.toISOString().split("T")[0];
    const isActive = (stats.activeDays || []).includes(dateStr);
    daysGrid.push({
      dateStr,
      isActive,
      dayNum: d.getDate(),
    });
  }

  // Determine League Rank in LynDesk Swiss Style
  let leagueName = "BRONZE SCHOLAR";
  let leagueLevel = "TIER I";
  if (stats.totalXp >= 200) {
    leagueName = "DIAMOND MASTER";
    leagueLevel = "TIER IV";
  } else if (stats.totalXp >= 100) {
    leagueName = "GOLD CHAMPION";
    leagueLevel = "TIER III";
  } else if (stats.totalXp >= 50) {
    leagueName = "SILVER EXPLORER";
    leagueLevel = "TIER II";
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12 font-sans text-txt-main">
      {/* Top Stats 3-Col Swiss Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Streak Card */}
        <div className="border border-border-main/80 bg-bg-surface p-5 rounded-md flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[9px] uppercase tracking-widest text-txt-muted">Study Streak</span>
            <div className="w-8 h-8 rounded border border-border-main/70 bg-bg-card flex items-center justify-center text-accent-main">
              <Flame size={16} />
            </div>
          </div>
          <div>
            <div className="font-mono text-2xl font-bold text-txt-main tracking-tight">
              {stats.streakCount} <span className="text-xs font-light text-txt-sub">Days</span>
            </div>
            <span className="font-mono text-[9px] text-txt-muted block mt-0.5">
              Record: {stats.longestStreak} Consecutive Days
            </span>
          </div>
        </div>

        {/* XP Card */}
        <div className="border border-border-main/80 bg-bg-surface p-5 rounded-md flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[9px] uppercase tracking-widest text-txt-muted">Total Knowledge XP</span>
            <div className="w-8 h-8 rounded border border-border-main/70 bg-bg-card flex items-center justify-center text-accent-main">
              <Zap size={16} />
            </div>
          </div>
          <div>
            <div className="font-mono text-2xl font-bold text-accent-main tracking-tight">
              {stats.totalXp} <span className="text-xs font-light text-txt-sub">XP</span>
            </div>
            <span className="font-mono text-[9px] text-txt-muted block mt-0.5">Verified Academic Score</span>
          </div>
        </div>

        {/* League Rank */}
        <div className="border border-border-main/80 bg-bg-surface p-5 rounded-md flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[9px] uppercase tracking-widest text-txt-muted">Academic Rank</span>
            <div className="w-8 h-8 rounded border border-border-main/70 bg-bg-card flex items-center justify-center text-txt-main font-mono text-[10px] font-bold">
              <Award size={16} className="text-txt-main" />
            </div>
          </div>
          <div>
            <div className="font-mono text-xs font-bold text-txt-main tracking-wider">{leagueName}</div>
            <span className="font-mono text-[9px] text-txt-muted block mt-0.5">{leagueLevel} • Global Leaderboard</span>
          </div>
        </div>
      </div>

      {/* Error Bank Adaptive Review Queue (LynDesk Swiss Style) */}
      <div className="border border-border-main/80 bg-bg-surface p-6 rounded-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-accent-main/10 border border-accent-main/30 text-accent-main font-mono text-[9px] uppercase tracking-wider rounded font-bold">
              ADAPTIVE REVIEW
            </span>
          </div>
          <h3 className="font-display text-xl font-light text-txt-main">Error Bank Queue</h3>
          <p className="text-xs text-txt-sub font-light">
            You have <span className="font-mono text-txt-main font-bold">{mistakes.length} mistake(s)</span> queued for targeted review.
          </p>
        </div>

        <button
          onClick={onOpenErrorBank}
          disabled={mistakes.length === 0}
          className="h-10 px-5 bg-accent-main hover:opacity-90 disabled:opacity-40 text-bg-base font-mono text-xs uppercase tracking-wider font-semibold rounded cursor-pointer transition-opacity shrink-0 flex items-center gap-2"
        >
          <RotateCcw size={14} />
          {mistakes.length > 0 ? "Review Mistakes →" : "Queue Empty"}
        </button>
      </div>

      {/* 30-Day Activity Matrix (Minimal Dark Contribution Squares) */}
      <div className="border border-border-main/80 bg-bg-surface p-6 rounded-md space-y-4">
        <div className="flex items-center justify-between border-b border-border-main/40 pb-3">
          <div className="flex items-center gap-2">
            <Activity size={16} className="text-accent-main" />
            <h3 className="font-display text-sm font-semibold text-txt-main">30-Day Study Activity Matrix</h3>
          </div>
          <span className="font-mono text-[10px] text-txt-muted uppercase">
            {stats.activeDays?.length || 0} Active Days
          </span>
        </div>

        <div className="grid grid-cols-6 sm:grid-cols-10 gap-2 pt-2">
          {daysGrid.map((day, idx) => (
            <div
              key={idx}
              className={`aspect-square rounded flex flex-col items-center justify-center p-1 border font-mono text-xs transition-all ${
                day.isActive
                  ? "bg-accent-main/20 border-accent-main text-accent-main font-bold"
                  : "bg-bg-card border-border-main/50 text-txt-muted/70"
              }`}
              title={day.dateStr}
            >
              <span className="text-[11px]">{day.dayNum}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Per-Path Completion Table */}
      <div className="border border-border-main/80 bg-bg-surface p-6 rounded-md space-y-4">
        <div className="flex items-center justify-between border-b border-border-main/40 pb-3">
          <div className="flex items-center gap-2">
            <BookOpen size={16} className="text-accent-main" />
            <h3 className="font-display text-sm font-semibold text-txt-main">Learning Path Breakdown</h3>
          </div>
          <span className="font-mono text-[10px] text-txt-muted uppercase">{paths.length} Paths</span>
        </div>

        {paths.length === 0 ? (
          <div className="py-8 text-center text-xs font-mono text-txt-muted border border-dashed border-border-main/50 rounded">
            No active learning paths created yet.
          </div>
        ) : (
          <div className="space-y-3">
            {paths.map((p) => {
              const percent = p.totalLessons > 0 ? Math.round((p.completedLessons / p.totalLessons) * 100) : 0;

              return (
                <div
                  key={p.id}
                  className="p-4 rounded border border-border-main/70 bg-bg-base/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-txt-main">{p.title}</span>
                      <span className="px-2 py-0.2 bg-bg-card border border-border-main/60 font-mono text-[9px] text-txt-muted uppercase rounded">
                        {p.depthMode || "STANDARD"}
                      </span>
                    </div>

                    <div className="font-mono text-[10px] text-txt-muted flex items-center gap-3">
                      <span>{p.completedLessons}/{p.totalLessons} Lessons Completed</span>
                      <span className="text-accent-main font-bold">+{p.xpEarned || 0} XP</span>
                    </div>

                    <div className="w-full max-w-xs h-1.5 bg-bg-card border border-border-main/40 rounded-full overflow-hidden mt-1">
                      <div
                        className="h-full bg-accent-main rounded-full"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => onResumePath(p.id)}
                    className="h-8 px-3.5 bg-bg-card hover:bg-border-main/30 border border-border-main/80 text-txt-main font-mono text-[10px] uppercase font-semibold rounded flex items-center gap-1.5 cursor-pointer transition-colors shrink-0"
                  >
                    Resume <ArrowRight size={11} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
