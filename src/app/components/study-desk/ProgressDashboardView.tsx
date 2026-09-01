"use client";

import React from "react";
import { StudyPath, StudyMistake, StudyStats } from "../../study-desk/types";
import { 
  Flame, 
  Zap, 
  RotateCcw, 
  BookOpen, 
  ArrowRight,
  Award,
  Activity,
  TrendingUp,
  Gamepad2,
  ExternalLink,
  CheckCircle2,
  Sparkles,
  KeyRound,
  X,
  RefreshCw,
  Eye,
  EyeOff
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";

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
  const { user } = useAuth();

  // VanguarDZ Account Connection State with 0ms Cache & Supabase Sync
  const [vanguardzAccount, setVanguardzAccount] = React.useState<{ username: string; highScore: number } | null>(() => {
    if (typeof window !== "undefined") {
      try {
        const uId = user?.id;
        const userStored = uId ? localStorage.getItem(`ldk_vanguardz_account_${uId}`) : null;
        const stored = userStored || localStorage.getItem("ldk_vanguardz_account");
        if (stored) return JSON.parse(stored);

        const metaUsername = user?.user_metadata?.vanguardz_username;
        const metaScore = user?.user_metadata?.vanguardz_high_score;
        if (metaUsername) {
          return { username: metaUsername, highScore: Number(metaScore) || 0 };
        }
      } catch {}
    }
    return null;
  });

  const [isConnectModalOpen, setIsConnectModalOpen] = React.useState(false);
  const [vgUsername, setVgUsername] = React.useState("");
  const [vgPassword, setVgPassword] = React.useState("");
  const [showVgPassword, setShowVgPassword] = React.useState(false);
  const [vgLoading, setVgLoading] = React.useState(false);
  const [vgError, setVgError] = React.useState<string | null>(null);

  // Sync with Supabase on mount if metadata exists
  React.useEffect(() => {
    if (user?.user_metadata?.vanguardz_username && !vanguardzAccount) {
      const uname = user.user_metadata.vanguardz_username;
      const score = Number(user.user_metadata.vanguardz_high_score) || 0;
      queueMicrotask(() => {
        setVanguardzAccount({ username: uname, highScore: score });
      });
    }
  }, [user, vanguardzAccount]);

  const handleConnectVanguarDZ = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vgUsername.trim() || !vgPassword.trim()) {
      setVgError("Please enter both username and password.");
      return;
    }
    setVgLoading(true);
    setVgError(null);

    try {
      const res = await fetch("/api/vanguardz/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: vgUsername.trim(), password: vgPassword.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        const accountData = { username: data.username, highScore: data.highScore };
        setVanguardzAccount(accountData);
        if (typeof window !== "undefined") {
          localStorage.setItem("ldk_vanguardz_account", JSON.stringify(accountData));
          if (user?.id) {
            localStorage.setItem(`ldk_vanguardz_account_${user.id}`, JSON.stringify(accountData));
          }
        }

        // Persist permanently in Supabase User Metadata
        if (user) {
          try {
            await supabase.auth.updateUser({
              data: {
                ...user.user_metadata,
                vanguardz_username: data.username,
                vanguardz_high_score: data.highScore
              }
            });
          } catch (dbErr) {
            console.warn("Failed saving VanguarDZ handle to Supabase metadata:", dbErr);
          }
        }

        setIsConnectModalOpen(false);
        setVgPassword("");
      } else {
        setVgError(data.message || "Failed to authenticate VanguarDZ account.");
      }
    } catch {
      setVgError("Network error connecting to VanguarDZ.");
    } finally {
      setVgLoading(false);
    }
  };

  const handleRefreshVgStats = async () => {
    if (!vanguardzAccount?.username) return;
    try {
      const res = await fetch(`/api/vanguardz/connect?username=${encodeURIComponent(vanguardzAccount.username)}`);
      const data = await res.json();
      if (data.success && typeof data.highScore === "number") {
        const updated = { username: vanguardzAccount.username, highScore: data.highScore };
        setVanguardzAccount(updated);
        if (typeof window !== "undefined") {
          localStorage.setItem("ldk_vanguardz_account", JSON.stringify(updated));
          if (user?.id) {
            localStorage.setItem(`ldk_vanguardz_account_${user.id}`, JSON.stringify(updated));
          }
        }

        if (user) {
          try {
            await supabase.auth.updateUser({
              data: {
                ...user.user_metadata,
                vanguardz_username: vanguardzAccount.username,
                vanguardz_high_score: data.highScore
              }
            });
          } catch {}
        }
      }
    } catch {}
  };

  const handleUnlinkVanguarDZ = async () => {
    setVanguardzAccount(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("ldk_vanguardz_account");
      if (user?.id) {
        localStorage.removeItem(`ldk_vanguardz_account_${user.id}`);
      }
    }

    if (user) {
      try {
        await supabase.auth.updateUser({
          data: {
            ...user.user_metadata,
            vanguardz_username: null,
            vanguardz_high_score: null
          }
        });
      } catch (e) {
        console.warn("Failed unlinking VanguarDZ from Supabase:", e);
      }
    }
  };
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

        {/* Right Column (5 cols): Rank Progress, Skill Radar & VanguarDZ Suite */}
        <div className="lg:col-span-5 space-y-6">

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

              <p className="text-xs text-txt-sub font-light leading-relaxed pt-1">
                Earn XP by completing lessons, practice sums, and error retries to advance to higher tier scholar ranks.
              </p>
            </div>
          </div>

          {/* Skill Proficiency & Topic Radar Card */}
          <div className="border border-border-main/80 bg-bg-surface p-6 rounded-md space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-border-main/40 pb-3">
              <div className="flex items-center gap-2">
                <Activity size={16} className="text-accent-main" />
                <h3 className="font-display text-base font-light text-txt-main">Skill Proficiency Radar</h3>
              </div>
              <span className="font-mono text-[10px] text-txt-muted uppercase">Active Mastery</span>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div>
                <div className="flex justify-between text-[10px] uppercase text-txt-sub mb-1">
                  <span>Arrays & Memory Layout</span>
                  <span className="text-txt-main font-bold">
                    {(() => {
                      if (typeof window === "undefined") return "0% Uninitiated";
                      try {
                        const dsaMap = JSON.parse(localStorage.getItem("lyndesk_dsa_progress_cache") || "{}");
                        const solved = Object.keys(dsaMap).filter(k => dsaMap[k]?.status === "completed" && (k.includes("array") || k.includes("two-sum") || k.includes("matrix"))).length;
                        const pct = Math.min(100, Math.round((solved / 5) * 100));
                        return pct > 0 ? `${pct}% ${pct >= 80 ? "Mastered" : "Intermediate"}` : "0% Uninitiated";
                      } catch { return "0% Uninitiated"; }
                    })()}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-bg-card border border-border-main/40 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-accent-main rounded-full transition-all duration-500" 
                    style={{ 
                      width: `${(() => {
                        if (typeof window === "undefined") return 0;
                        try {
                          const dsaMap = JSON.parse(localStorage.getItem("lyndesk_dsa_progress_cache") || "{}");
                          const solved = Object.keys(dsaMap).filter(k => dsaMap[k]?.status === "completed" && (k.includes("array") || k.includes("two-sum") || k.includes("matrix"))).length;
                          return Math.min(100, Math.round((solved / 5) * 100));
                        } catch { return 0; }
                      })()}%` 
                    }} 
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[10px] uppercase text-txt-sub mb-1">
                  <span>Two Pointers & Sliding Window</span>
                  <span className="text-txt-main font-bold">
                    {(() => {
                      if (typeof window === "undefined") return "0% Uninitiated";
                      try {
                        const dsaMap = JSON.parse(localStorage.getItem("lyndesk_dsa_progress_cache") || "{}");
                        const solved = Object.keys(dsaMap).filter(k => dsaMap[k]?.status === "completed" && (k.includes("pointer") || k.includes("window") || k.includes("sliding"))).length;
                        const pct = Math.min(100, Math.round((solved / 5) * 100));
                        return pct > 0 ? `${pct}% ${pct >= 80 ? "Mastered" : "Intermediate"}` : "0% Uninitiated";
                      } catch { return "0% Uninitiated"; }
                    })()}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-bg-card border border-border-main/40 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-txt-main rounded-full transition-all duration-500" 
                    style={{ 
                      width: `${(() => {
                        if (typeof window === "undefined") return 0;
                        try {
                          const dsaMap = JSON.parse(localStorage.getItem("lyndesk_dsa_progress_cache") || "{}");
                          const solved = Object.keys(dsaMap).filter(k => dsaMap[k]?.status === "completed" && (k.includes("pointer") || k.includes("window") || k.includes("sliding"))).length;
                          return Math.min(100, Math.round((solved / 5) * 100));
                        } catch { return 0; }
                      })()}%` 
                    }} 
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[10px] uppercase text-txt-sub mb-1">
                  <span>Algorithmic Optimization</span>
                  <span className="text-txt-main font-bold">
                    {(() => {
                      if (typeof window === "undefined") return "0% Uninitiated";
                      try {
                        const dsaMap = JSON.parse(localStorage.getItem("lyndesk_dsa_progress_cache") || "{}");
                        const solved = Object.keys(dsaMap).filter(k => dsaMap[k]?.status === "completed" && (k.includes("opt") || k.includes("dynamic") || k.includes("binary"))).length;
                        const pct = Math.min(100, Math.round((solved / 5) * 100));
                        return pct > 0 ? `${pct}% ${pct >= 80 ? "Mastered" : "Intermediate"}` : "0% Uninitiated";
                      } catch { return "0% Uninitiated"; }
                    })()}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-bg-card border border-border-main/40 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-txt-muted rounded-full transition-all duration-500" 
                    style={{ 
                      width: `${(() => {
                        if (typeof window === "undefined") return 0;
                        try {
                          const dsaMap = JSON.parse(localStorage.getItem("lyndesk_dsa_progress_cache") || "{}");
                          const solved = Object.keys(dsaMap).filter(k => dsaMap[k]?.status === "completed" && (k.includes("opt") || k.includes("dynamic") || k.includes("binary"))).length;
                          return Math.min(100, Math.round((solved / 5) * 100));
                        } catch { return 0; }
                      })()}%` 
                    }} 
                  />
                </div>
              </div>
            </div>
          </div>

          {/* VanguarDZ Typing Game Card (Placed under Skill Proficiency Radar) */}
          <div className="border border-border-main/80 bg-bg-surface p-6 rounded-md space-y-4 shadow-xs relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-border-main/40 pb-3">
              <div className="flex items-center gap-2">
                <Gamepad2 size={18} className="text-accent-main" />
                <h3 className="font-display text-base font-light text-txt-main">VanguarDZ Typing Game</h3>
              </div>
              <span className="font-mono text-[9px] text-accent-main border border-accent-main/30 bg-accent-main/10 px-2 py-0.5 rounded font-semibold uppercase">
                vanguardz.in
              </span>
            </div>

            <p className="text-xs text-txt-sub font-light leading-relaxed">
              Practice your typing skills with VanguarDZ — play while you get better and level up your developer velocity!
            </p>

            {/* Account Link & High Score Status */}
            {vanguardzAccount ? (
              <div className="bg-bg-base/70 border border-border-main/70 rounded p-3.5 space-y-2 font-mono text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-txt-main font-semibold">
                    <CheckCircle2 size={14} className="text-accent-main" />
                    <span>@{vanguardzAccount.username}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={handleRefreshVgStats}
                      aria-label="Refresh high score"
                      className="text-txt-muted hover:text-txt-main p-1 transition-colors cursor-pointer"
                    >
                      <RefreshCw size={12} />
                    </button>
                    <button
                      onClick={handleUnlinkVanguarDZ}
                      aria-label="Unlink VanguarDZ account"
                      className="text-txt-muted hover:text-rose-400 p-1 transition-colors cursor-pointer text-[10px] font-mono"
                    >
                      <X size={12} />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-border-main/40 text-[11px]">
                  <span className="text-txt-sub font-light">VanguarDZ High Score</span>
                  <span className="text-accent-main font-bold flex items-center gap-1">
                    <Sparkles size={12} /> {vanguardzAccount.highScore} pts
                  </span>
                </div>
              </div>
            ) : (
              <div className="bg-bg-card/40 border border-border-main/50 rounded p-3 text-center space-y-2">
                <p className="text-[11px] text-txt-muted font-mono font-light">
                  Connect your VanguarDZ account to display your live high score here.
                </p>
                <button
                  onClick={() => setIsConnectModalOpen(true)}
                  className="px-3 py-1.5 bg-bg-surface hover:bg-border-main/30 border border-border-main text-txt-main font-mono text-[10px] uppercase font-semibold rounded cursor-pointer transition-colors inline-flex items-center gap-1.5"
                >
                  <KeyRound size={12} className="text-accent-main" /> Connect Account
                </button>
              </div>
            )}

            {/* Primary Action Play Button */}
            <a
              href="https://vanguardz.in"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 bg-accent-main hover:opacity-90 text-bg-base font-mono text-xs uppercase tracking-wider font-semibold rounded cursor-pointer transition-opacity flex items-center justify-center gap-2 shadow-xs text-center"
            >
              Play VanguarDZ → <ExternalLink size={14} />
            </a>
          </div>

        </div>
      </div>

      {/* VanguarDZ Connect Account Modal */}
      {isConnectModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-bg-surface border border-border-main/90 rounded-md p-6 max-w-md w-full space-y-5 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-border-main/40 pb-3">
              <div className="flex items-center gap-2">
                <Gamepad2 size={18} className="text-accent-main" />
                <h3 className="font-display text-lg font-normal text-txt-main">Connect VanguarDZ Account</h3>
              </div>
              <button
                onClick={() => setIsConnectModalOpen(false)}
                className="text-txt-muted hover:text-txt-main p-1 transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <p className="text-xs text-txt-sub font-light leading-relaxed">
              Enter your VanguarDZ player credentials to connect your typing account and display your live high score in LynDesk.
            </p>

            {vgError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono rounded">
                {vgError}
              </div>
            )}

            <form onSubmit={handleConnectVanguarDZ} className="space-y-4">
              <div className="space-y-1.5">
                <label className="font-mono text-[10px] uppercase text-txt-muted font-bold block">
                  VanguarDZ Username
                </label>
                <input
                  type="text"
                  required
                  value={vgUsername}
                  onChange={(e) => setVgUsername(e.target.value)}
                  placeholder="Enter your VanguarDZ username"
                  className="w-full px-3.5 py-2.5 bg-bg-base border border-border-main/80 rounded text-sm text-txt-main focus:border-accent-main focus:outline-hidden font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-mono text-[10px] uppercase text-txt-muted font-bold block">
                  VanguarDZ Password
                </label>
                <div className="relative">
                  <input
                    type={showVgPassword ? "text" : "password"}
                    required
                    value={vgPassword}
                    onChange={(e) => setVgPassword(e.target.value)}
                    placeholder="Enter your VanguarDZ password"
                    className="w-full pl-3.5 pr-10 py-2.5 bg-bg-base border border-border-main/80 rounded text-sm text-txt-main focus:border-accent-main focus:outline-hidden font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowVgPassword(!showVgPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-txt-muted hover:text-txt-main transition-colors p-0.5 cursor-pointer"
                    aria-label={showVgPassword ? "Hide password" : "Show password"}
                  >
                    {showVgPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsConnectModalOpen(false)}
                  className="px-4 py-2 text-xs font-mono uppercase text-txt-muted hover:text-txt-main transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={vgLoading}
                  className="px-5 py-2.5 bg-accent-main hover:opacity-90 text-bg-base font-mono text-xs uppercase font-semibold rounded cursor-pointer transition-opacity flex items-center gap-2"
                >
                  {vgLoading ? "Verifying..." : "Connect Account"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
