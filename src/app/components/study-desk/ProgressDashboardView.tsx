"use client";

import React from "react";
import { StudyPath, StudyMistake, StudyStats } from "../../study-desk/types";
import { DSA_TRACKS } from "../../study-desk/dsaMasteryData";
import { 
  Flame, 
  Zap, 
  RotateCcw, 
  BookOpen, 
  ArrowRight,
  Award,
  Activity,
  Layers,
  TrendingUp
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
  let nextRankTarget = 50;
  let currentRankMin = 0;

  if (stats.totalXp >= 200) {
    leagueName = "DIAMOND MASTER";
    leagueLevel = "TIER IV";
    nextRankTarget = 500;
    currentRankMin = 200;
  } else if (stats.totalXp >= 100) {
    leagueName = "GOLD CHAMPION";
    leagueLevel = "TIER III";
    nextRankTarget = 200;
    currentRankMin = 100;
  } else if (stats.totalXp >= 50) {
    leagueName = "SILVER EXPLORER";
    leagueLevel = "TIER II";
    nextRankTarget = 100;
    currentRankMin = 50;
  }

  const rankProgressPercent = Math.min(
    100,
    Math.round(((stats.totalXp - currentRankMin) / (nextRankTarget - currentRankMin)) * 100)
  );

  return (
    <div className="w-full space-y-6 pb-12 font-sans text-txt-main">
      {/* Top 4-Column Swiss Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Streak Card */}
        <div className="border border-border-main/80 bg-bg-surface p-5 rounded-md flex flex-col justify-between gap-3 shadow-xs">
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

        {/* Knowledge XP Card */}
        <div className="border border-border-main/80 bg-bg-surface p-5 rounded-md flex flex-col justify-between gap-3 shadow-xs">
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

        {/* Academic League Rank */}
        <div className="border border-border-main/80 bg-bg-surface p-5 rounded-md flex flex-col justify-between gap-3 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[9px] uppercase tracking-widest text-txt-muted">Academic Rank</span>
            <div className="w-8 h-8 rounded border border-border-main/70 bg-bg-card flex items-center justify-center text-txt-main">
              <Award size={16} />
            </div>
          </div>
          <div>
            <div className="font-mono text-sm font-bold text-txt-main tracking-wider">{leagueName}</div>
            <span className="font-mono text-[9px] text-txt-muted block mt-0.5">{leagueLevel} • Global Leaderboard</span>
          </div>
        </div>

        {/* Error Bank Spotlight Card */}
        <div className="border border-border-main/80 bg-bg-surface p-5 rounded-md flex flex-col justify-between gap-3 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[9px] uppercase tracking-widest text-txt-muted">Adaptive Review</span>
            <div className="w-8 h-8 rounded border border-border-main/70 bg-bg-card flex items-center justify-center text-rose-400">
              <RotateCcw size={15} />
            </div>
          </div>
          <div className="flex items-end justify-between gap-2">
            <div>
              <div className="font-mono text-2xl font-bold text-txt-main tracking-tight">
                {mistakes.length} <span className="text-xs font-light text-txt-sub">Queued</span>
              </div>
              <span className="font-mono text-[9px] text-txt-muted block mt-0.5">Error Bank Queue</span>
            </div>
            <button
              onClick={onOpenErrorBank}
              disabled={mistakes.length === 0}
              className="px-3 py-1.5 bg-accent-main hover:opacity-90 disabled:opacity-30 text-bg-base font-mono text-[10px] uppercase font-semibold rounded cursor-pointer transition-opacity shrink-0"
            >
              Review →
            </button>
          </div>
        </div>
      </div>

      {/* Main Asymmetric Grid Layout (7 : 5) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols): Activity Matrix & Learning Paths */}
        <div className="lg:col-span-7 space-y-6">
          {/* 30-Day Activity Matrix */}
          <div className="border border-border-main/80 bg-bg-surface p-6 rounded-md space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-border-main/40 pb-3">
              <div className="flex items-center gap-2">
                <Activity size={16} className="text-accent-main" />
                <h3 className="font-display text-base font-light text-txt-main">30-Day Activity Matrix</h3>
              </div>
              <span className="font-mono text-[10px] text-txt-muted uppercase">
                {stats.activeDays?.length || 0} Active Days Recorded
              </span>
            </div>

            <div className="grid grid-cols-6 sm:grid-cols-10 gap-2.5 pt-1">
              {daysGrid.map((day, idx) => (
                <div
                  key={idx}
                  className={`aspect-square rounded border font-mono text-xs flex flex-col items-center justify-center transition-all ${
                    day.isActive
                      ? "bg-accent-main/20 border-accent-main text-accent-main font-bold ring-1 ring-accent-main/30"
                      : "bg-bg-card border-border-main/50 text-txt-muted/70 hover:border-border-main"
                  }`}
                  title={`${day.dateStr} - ${day.isActive ? "Active Study Day" : "No Activity"}`}
                >
                  <span className="text-[11px]">{day.dayNum}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Learning Path Breakdown */}
          <div className="border border-border-main/80 bg-bg-surface p-6 rounded-md space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-border-main/40 pb-3">
              <div className="flex items-center gap-2">
                <BookOpen size={16} className="text-accent-main" />
                <h3 className="font-display text-base font-light text-txt-main">Learning Path Progress</h3>
              </div>
              <span className="font-mono text-[10px] text-txt-muted uppercase">{paths.length} Paths Created</span>
            </div>

            {paths.length === 0 ? (
              <div className="py-10 text-center font-mono text-xs text-txt-muted border border-dashed border-border-main/50 rounded space-y-2">
                <p>No active learning paths created yet.</p>
                <span className="text-[10px] text-txt-sub block">Go to Learning Way to generate an AI Study Path from notes or files.</span>
              </div>
            ) : (
              <div className="space-y-3">
                {paths.map((p) => {
                  const percent = p.totalLessons > 0 ? Math.round((p.completedLessons / p.totalLessons) * 100) : 0;

                  return (
                    <div
                      key={p.id}
                      className="p-4 rounded border border-border-main/70 bg-bg-base/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors hover:border-border-main"
                    >
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-display font-light text-txt-main truncate">{p.title}</span>
                          <span className="px-2 py-0.2 bg-bg-card border border-border-main/60 font-mono text-[8px] text-txt-muted uppercase rounded">
                            {p.depthMode || "STANDARD"}
                          </span>
                        </div>

                        <div className="font-mono text-[10px] text-txt-sub flex items-center gap-3">
                          <span>{p.completedLessons}/{p.totalLessons} Lessons Done</span>
                          <span className="text-accent-main font-bold">+{p.xpEarned || 0} XP</span>
                        </div>

                        <div className="w-full max-w-md h-1.5 bg-bg-card border border-border-main/40 rounded-full overflow-hidden mt-1">
                          <div
                            className="h-full bg-accent-main rounded-full transition-all duration-300"
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

        {/* Right Column (5 cols): DSA Way Summary & Rank Progress */}
        <div className="lg:col-span-5 space-y-6">
          {/* DSA Way Curriculum Overview */}
          <div className="border border-border-main/80 bg-bg-surface p-6 rounded-md space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-border-main/40 pb-3">
              <div className="flex items-center gap-2">
                <Layers size={16} className="text-accent-main" />
                <h3 className="font-display text-base font-light text-txt-main">DSA Way Curriculums</h3>
              </div>
              <span className="font-mono text-[10px] text-txt-muted uppercase">6 Tracks</span>
            </div>

            <div className="space-y-3">
              {DSA_TRACKS.map((track) => (
                <div
                  key={track.id}
                  className="p-3 bg-bg-base/60 border border-border-main/60 rounded flex items-center justify-between gap-3 font-mono text-xs"
                >
                  <div className="space-y-0.5 flex-1 min-w-0">
                    <span className="text-[9px] uppercase tracking-wider text-accent-main font-semibold block">
                      {track.badge}
                    </span>
                    <h4 className="font-display text-xs font-semibold text-txt-main truncate">{track.title}</h4>
                  </div>
                  <span className="text-[10px] text-txt-muted bg-bg-card px-2 py-0.5 rounded border border-border-main/40 shrink-0">
                    {track.steps.reduce((acc, s) => acc + s.problems.length, 0)} Problems
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Academic Rank Advancement Card */}
          <div className="border border-border-main/80 bg-bg-surface p-6 rounded-md space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-border-main/40 pb-3">
              <div className="flex items-center gap-2">
                <TrendingUp size={16} className="text-accent-main" />
                <h3 className="font-display text-base font-light text-txt-main">Rank Advancement</h3>
              </div>
              <span className="font-mono text-[10px] text-accent-main font-semibold uppercase">{leagueLevel}</span>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between font-mono text-xs">
                <span className="text-txt-main font-semibold">{leagueName}</span>
                <span className="text-txt-muted text-[10px]">{stats.totalXp} / {nextRankTarget} XP</span>
              </div>

              <div className="w-full h-2 bg-bg-card border border-border-main/50 rounded-full overflow-hidden">
                <div
                  className="h-full bg-accent-main rounded-full transition-all duration-500"
                  style={{ width: `${rankProgressPercent}%` }}
                />
              </div>

              <span className="font-mono text-[9px] text-txt-muted block pt-1">
                Earn +{nextRankTarget - stats.totalXp} XP by completing study lessons or DSA problems to reach next tier rank.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
