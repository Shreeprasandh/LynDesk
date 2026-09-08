"use client";

import React, { useState, useMemo, useRef } from "react";
import { 
  CheckCircle2, 
  Award, 
  TrendingUp, 
  Flame, 
  Code2, 
  Calendar, 
  Layers, 
  Trophy, 
  Target, 
  Medal, 
  BarChart3,
  ExternalLink,
  X,
  Lock,
  ArrowRight,
  Clock,
  Terminal
} from "lucide-react";
import { type CodingPlatform } from "../lib/platformHandles";

export interface PlatformStatsData {
  solved?: number;
  solvedEasy?: number;
  solvedMedium?: number;
  solvedHard?: number;
  rank?: string;
  rating?: number;
  globalRank?: number;
  attendedContestsCount?: number;
  submissionCalendar?: Record<string, number> | string;
  submissionCalendarPrivate?: boolean;
  acceptedSubmissions?: number;
  dailyChallenge?: {
    title: string;
    link: string;
    difficulty: string;
    date: string;
    completed: boolean;
    hasSolvedToday?: boolean;
    isStreakMaintained?: boolean;
  } | null;
  hasSolvedToday?: boolean;
  isStreakMaintained?: boolean;
  leetcodeStreak?: number;
  activeYears?: number[];
  maxRating?: number;
  maxRank?: string;
  stars?: number | string;
  countryRank?: number;
  score?: number;
  instituteRank?: number | string;
  badges?: string[];
  repos?: number;
  commits?: number;
  registered?: number;
  participations?: number;
  points?: number;
  badgesCount?: number;
  certificatesCount?: number;
  currentStreak?: number;
  hackathonsCount?: number;
  awards?: any[];
  certificates?: any[];
  [key: string]: any;
}

export interface CodingDeckDashboardProps {
  stats: Record<string, PlatformStatsData | null | undefined>;
  handles: {
    leetcode?: string;
    codeforces?: string;
    codechef?: string;
    geeksforgeeks?: string;
    hackerrank?: string;
    github?: string;
  };
  onOpenConnectModal?: (platform: CodingPlatform) => void;
  onSwitchToIntegrations?: () => void;
}

export default function CodingDeckDashboard({
  stats,
  handles,
  onOpenConnectModal,
  onSwitchToIntegrations
}: CodingDeckDashboardProps) {
  const [selectedLcYear, setSelectedLcYear] = useState<number | null>(null);
  const [showBadgesModal, setShowBadgesModal] = useState(false);
  const [isHoveringPlatformBar, setIsHoveringPlatformBar] = useState(false);
  const [hoveredContestIndex, setHoveredContestIndex] = useState<number | null>(null);
  const heatmapScrollRef = useRef<HTMLDivElement>(null);

  // Multi-Platform Total Calculations
  const summary = useMemo(() => {
    const lcSolved = stats.leetcode?.solved || 0;
    const cfSolved = stats.codeforces?.solved || 0;
    const ccSolved = stats.codechef?.solved || 0;
    const gfgSolved = stats.geeksforgeeks?.solved || 0;
    const hrSolved = stats.hackerrank?.solved || 0;

    const totalSolved = lcSolved + cfSolved + ccSolved + gfgSolved + hrSolved;

    const easySolved = stats.leetcode?.solvedEasy || 0;
    const medSolved = stats.leetcode?.solvedMedium || 0;
    const hardSolved = stats.leetcode?.solvedHard || 0;

    // Contests attended count
    const ccContests = typeof stats.codechef?.attendedContestsCount === "number"
      ? stats.codechef.attendedContestsCount
      : (stats.codechef?.contestHistory?.length || (stats.codechef?.rating ? 1 : 0));

    const lcContests = typeof stats.leetcode?.attendedContestsCount === "number"
      ? stats.leetcode.attendedContestsCount
      : (stats.leetcode?.contestHistory?.length || (stats.leetcode?.rating && stats.leetcode.rating > 1400 ? 1 : 0));

    const cfContests = typeof stats.codeforces?.attendedContestsCount === "number"
      ? stats.codeforces.attendedContestsCount
      : (stats.codeforces?.contestHistory?.length || (stats.codeforces?.rating ? 1 : 0));

    const totalContests = ccContests + lcContests + cfContests;

    // Connected count
    const connectedCount = [
      handles.leetcode,
      handles.codeforces,
      handles.codechef,
      handles.geeksforgeeks,
      handles.hackerrank,
      handles.github
    ].filter(Boolean).length;

    const activeStreak = stats.leetcode?.leetcodeStreak || 0;

    // Active Platforms with Non-Zero Solves
    const platformBreakdown = [
      { name: "LeetCode", count: lcSolved, color: "bg-accent-main" },
      { name: "CodeChef", count: ccSolved, color: "bg-accent-main/80" },
      { name: "Codeforces", count: cfSolved, color: "bg-accent-main/60" },
      { name: "GeeksforGeeks", count: gfgSolved, color: "bg-accent-main/45" },
      { name: "HackerRank", count: hrSolved, color: "bg-accent-main/30" },
    ].filter(p => p.count > 0);

    return {
      totalSolved,
      easySolved,
      medSolved,
      hardSolved,
      connectedCount,
      activeStreak,
      totalContests,
      ccContests,
      lcContests,
      cfContests,
      lcSolved,
      cfSolved,
      ccSolved,
      gfgSolved,
      hrSolved,
      platformBreakdown
    };
  }, [stats, handles]);

  // Exact Month-Grouped Heatmap Algorithm (LeetCode Structure)
  const heatmapData = useMemo(() => {
    const now = new Date();
    const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // Ingest submission calendars from all coding platforms (excluding git)
    const combinedCal: Record<string, number> = {};
    
    const ingestCal = (rawCal: any) => {
      if (!rawCal) return;
      let calObj = rawCal;
      if (typeof calObj === "string") {
        try { calObj = JSON.parse(calObj); } catch { calObj = {}; }
      }
      if (typeof calObj === "object" && calObj !== null) {
        Object.entries(calObj).forEach(([k, v]) => {
          const numV = Number(v) || 0;
          if (numV <= 0) return;
          if (/^\d{9,11}$/.test(k)) {
            const dateStr = new Date(parseInt(k, 10) * 1000).toISOString().split("T")[0];
            combinedCal[dateStr] = (combinedCal[dateStr] || 0) + numV;
          } else if (/^\d{4}-\d{2}-\d{2}$/.test(k)) {
            combinedCal[k] = (combinedCal[k] || 0) + numV;
          }
        });
      }
    };

    ingestCal(stats.leetcode?.submissionCalendar);
    ingestCal(stats.codeforces?.submissionCalendar);
    ingestCal(stats.codechef?.submissionCalendar);
    ingestCal(stats.geeksforgeeks?.submissionCalendar);
    ingestCal(stats.hackerrank?.submissionCalendar);

    // Generate 371 days based on selected year or rolling past 12 months
    const cells: { dateStr: string; level: number; dateLabel: string; monthYearKey: string; cellMonthName: string }[] = [];
    let startDate: Date;

    if (selectedLcYear) {
      const yearStart = new Date(selectedLcYear, 0, 1);
      const startDay = yearStart.getDay();
      startDate = new Date(yearStart.getTime());
      startDate.setDate(yearStart.getDate() - startDay);
    } else {
      const endDate = new Date(todayMidnight.getTime());
      const endDay = endDate.getDay();
      endDate.setDate(endDate.getDate() + (6 - endDay));
      startDate = new Date(endDate.getTime());
      startDate.setDate(endDate.getDate() - (53 * 7 - 1));
    }

    let totalActiveDays = 0;
    let maxStreak = 0;
    let currStreak = 0;

    for (let i = 0; i < 371; i++) {
      const cellDate = new Date(startDate.getTime());
      cellDate.setDate(startDate.getDate() + i);
      const dateKey = `${cellDate.getFullYear()}-${String(cellDate.getMonth() + 1).padStart(2, "0")}-${String(cellDate.getDate()).padStart(2, "0")}`;
      const count = combinedCal[dateKey] || 0;

      if (count > 0) {
        totalActiveDays++;
        currStreak++;
        if (currStreak > maxStreak) maxStreak = currStreak;
      } else {
        currStreak = 0;
      }

      let level = 0;
      if (count > 0 && count <= 2) level = 1;
      else if (count > 2 && count <= 5) level = 2;
      else if (count > 5) level = 3;

      const cellMonthYearKey = `${cellDate.getFullYear()}-${cellDate.getMonth()}`;
      const cellMonthName = cellDate.toLocaleDateString("en-US", { month: "short" });
      const dateFormatted = cellDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
      const dateLabel = `${dateFormatted}: ${count} submission${count !== 1 ? "s" : ""}`;

      cells.push({
        dateStr: dateKey,
        level,
        monthYearKey: cellMonthYearKey,
        cellMonthName,
        dateLabel
      });
    }

    // Group into chronological month blocks
    interface WeekCell {
      dateStr: string;
      level: number;
      dateLabel: string;
      isSpacer: boolean;
      cellDate: Date;
    }

    interface Week {
      cells: WeekCell[];
    }

    interface MonthGroup {
      monthYearKey: string;
      monthName: string;
      weeks: Week[];
    }

    const uniqueMonths: { monthYearKey: string; monthName: string }[] = [];
    cells.forEach(c => {
      if (selectedLcYear && new Date(c.dateStr).getFullYear() !== selectedLcYear) return;
      if (!uniqueMonths.find(m => m.monthYearKey === c.monthYearKey)) {
        uniqueMonths.push({ monthYearKey: c.monthYearKey, monthName: c.cellMonthName });
      }
    });

    const monthGroups: MonthGroup[] = [];
    uniqueMonths.forEach(({ monthYearKey, monthName }) => {
      const weeksForMonth: Week[] = [];

      for (let w = 0; w < 53; w++) {
        let hasDaysForMonth = false;
        for (let d = 0; d < 7; d++) {
          const cellIdx = w * 7 + d;
          if (cells[cellIdx].monthYearKey === monthYearKey) {
            hasDaysForMonth = true;
            break;
          }
        }

        if (hasDaysForMonth) {
          const weekCells: WeekCell[] = [];
          for (let d = 0; d < 7; d++) {
            const cellIdx = w * 7 + d;
            const cell = cells[cellIdx];
            const cellDate = new Date(startDate.getTime());
            cellDate.setDate(startDate.getDate() + cellIdx);
            const isSpacer = cell.monthYearKey !== monthYearKey || cellDate > todayMidnight;

            weekCells.push({
              dateStr: cell.dateStr,
              level: isSpacer ? 0 : cell.level,
              dateLabel: isSpacer ? "" : cell.dateLabel,
              isSpacer,
              cellDate
            });
          }
          weeksForMonth.push({ cells: weekCells });
        }
      }

      monthGroups.push({
        monthYearKey,
        monthName,
        weeks: weeksForMonth
      });
    });

    const totalSubmissionsInCalendar = Object.values(combinedCal).reduce((sum, val) => sum + val, 0);

    return {
      monthGroups,
      totalSubmissionsInCalendar: totalSubmissionsInCalendar || summary.totalSolved,
      totalActiveDays,
      maxStreak: maxStreak || summary.activeStreak || 0,
      isLeetcodePrivate: stats.leetcode?.submissionCalendarPrivate
    };
  }, [stats, summary.totalSolved, summary.activeStreak, selectedLcYear]);

  // Real Contest Rating Progression Timeline Data Points (Strictly Authentic Verified Contests)
  const contestTimeline = useMemo(() => {
    const list: Array<{ id: number; name: string; date: string; timestamp?: number; rating: number; rank: number; platform: string }> = [];

    if (Array.isArray(stats.codechef?.contestHistory)) {
      stats.codechef.contestHistory.forEach(c => {
        if (c.rating && c.rating > 0) list.push(c as any);
      });
    }

    if (Array.isArray(stats.leetcode?.contestHistory)) {
      stats.leetcode.contestHistory.forEach(c => {
        if (c.rating && c.rating > 0) list.push(c as any);
      });
    }

    if (Array.isArray(stats.codeforces?.contestHistory)) {
      stats.codeforces.contestHistory.forEach(c => {
        if (c.rating && c.rating > 0) list.push(c as any);
      });
    }

    // Sort chronologically if timestamps exist
    list.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));

    return list.map((item, idx) => ({ ...item, id: idx + 1 }));
  }, [stats.codechef?.contestHistory, stats.leetcode?.contestHistory, stats.codeforces?.contestHistory]);

  // DSA Topic Analysis Distribution (Genuine empirical problem counts from LeetCode / Platforms)
  const topicData = useMemo(() => {
    if (Array.isArray(stats.leetcode?.topics) && stats.leetcode.topics.length > 0) {
      return stats.leetcode.topics;
    }
    return [];
  }, [stats.leetcode?.topics]);

  const maxTopicSolved = Math.max(...topicData.map(t => t.solved), 1);

  // Language Mastery Distribution (Genuine problem solves per language from LeetCode only)
  const languageData = useMemo(() => {
    const map: Record<string, number> = {};

    if (Array.isArray(stats.leetcode?.languages)) {
      stats.leetcode.languages.forEach(l => {
        if (l.name && l.solved > 0) {
          map[l.name] = (map[l.name] || 0) + l.solved;
        }
      });
    }

    const list = Object.entries(map)
      .map(([name, solved]) => ({ name, solved }))
      .sort((a, b) => b.solved - a.solved);

    return list.slice(0, 6);
  }, [stats.leetcode?.languages]);

  const maxLanguageSolved = Math.max(...languageData.map(l => l.solved), 1);

  // Live Recent Solves Stream (Activity Feed)
  const recentSolves = useMemo(() => {
    const list: Array<{ id: string; title: string; platform: string; difficulty: string; time: string; link: string }> = [];
    if (Array.isArray(stats.leetcode?.recentSubmissions) && stats.leetcode.recentSubmissions.length > 0) {
      list.push(...stats.leetcode.recentSubmissions);
    }
    return list.slice(0, 6);
  }, [stats.leetcode?.recentSubmissions]);

  // Verified Badges & Recognition (Dynamically Computed from Real Achievements)
  const allAwardsList = useMemo(() => {
    const list: Array<{ id: string; title: string; issuer: string; category: string; date: string; desc: string; icon: any }> = [];

    if (summary.totalSolved >= 50) {
      list.push({
        id: "solved-50",
        title: "50 Problems Solved",
        issuer: "Code Desk",
        category: "Milestone",
        date: "Verified",
        desc: "Awarded for solving 50+ problems across connected coding platforms",
        icon: Target
      });
    }
    if (summary.totalSolved >= 100) {
      list.push({
        id: "solved-100",
        title: "Century Solver",
        issuer: "Code Desk",
        category: "Milestone",
        date: "Verified",
        desc: "Crossed 100+ verified algorithmic problem solutions",
        icon: Trophy
      });
    }
    if (summary.totalSolved >= 500) {
      list.push({
        id: "solved-500",
        title: "500+ Master Solver",
        issuer: "Code Desk",
        category: "Elite",
        date: "Verified",
        desc: "Attained 500+ solved problems across connected competitive platforms",
        icon: Award
      });
    }
    if (summary.activeStreak >= 7) {
      list.push({
        id: "streak-active",
        title: `${summary.activeStreak} Days Daily Streak`,
        issuer: "LeetCode",
        category: "Consistency",
        date: "Active",
        desc: `Maintained a continuous ${summary.activeStreak}-day active problem solving streak`,
        icon: Flame
      });
    }
    if (summary.totalContests > 0) {
      list.push({
        id: "contest-participant",
        title: `${summary.totalContests} Contest${summary.totalContests > 1 ? "s" : ""} Attended`,
        issuer: "Competitive Programming",
        category: "Competition",
        date: "Official",
        desc: `Participated in ${summary.totalContests} official rated round${summary.totalContests > 1 ? "s" : ""}`,
        icon: Medal
      });
    }
    if (stats.codechef?.stars && parseInt(String(stats.codechef.stars)) >= 2) {
      list.push({
        id: "codechef-stars",
        title: `${stats.codechef.stars} Stars Rated`,
        issuer: "CodeChef",
        category: "Rating Tier",
        date: "Official",
        desc: `Verified ${stats.codechef.stars} Stars competitive rating tier on CodeChef`,
        icon: Trophy
      });
    }
    if (stats.leetcode?.rank && !stats.leetcode.rank.includes("25%")) {
      list.push({
        id: "leetcode-percentile",
        title: `${stats.leetcode.rank} Percentile`,
        issuer: "LeetCode",
        category: "Global Rank",
        date: "Official",
        desc: `Attained top ${stats.leetcode.rank} global ranking tier on LeetCode`,
        icon: Award
      });
    }

    // Always have at least 1 verified starter credential if connected
    if (list.length === 0 && summary.connectedCount > 0) {
      list.push({
        id: "connected-developer",
        title: "Connected Developer",
        issuer: "Code Desk",
        category: "Identity",
        date: "Active",
        desc: "Successfully verified and synchronized competitive coding profiles",
        icon: Target
      });
    }

    return list;
  }, [summary.totalSolved, summary.activeStreak, summary.totalContests, summary.connectedCount, stats.codechef?.stars, stats.leetcode?.rank]);

  // Show only 4 recent badges in the card
  const previewAwards = allAwardsList.slice(0, 4);

  return (
    <div className="flex flex-col gap-6 w-full font-sans animate-fade-in pb-12">
      
      {/* ================= 1. TOP HERO KPI 4-BENTO ROW ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Questions Solved (Hover Platform Solves Breakdown) */}
        <div className="border border-border-main/70 bg-bg-surface p-5 rounded-md flex flex-col justify-between gap-3 shadow-xs relative">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[9px] uppercase tracking-widest text-txt-muted">Questions Solved</span>
            <Code2 size={15} className="text-txt-muted" />
          </div>
          <div>
            <div className="font-display text-4xl font-light text-txt-main tracking-tight">
              {summary.totalSolved}
            </div>
            <span className="text-[10px] text-txt-sub font-mono">
              Total problems solved across all the platforms
            </span>
          </div>

          {/* Segmented Platform Proportion Bar with Hover Floating Micro-Tooltip */}
          <div 
            className="relative w-full pt-1"
            onMouseEnter={() => setIsHoveringPlatformBar(true)}
            onMouseLeave={() => setIsHoveringPlatformBar(false)}
          >
            {isHoveringPlatformBar && (
              <div className="absolute -top-9 left-1/2 -translate-x-1/2 bg-bg-card text-txt-main font-mono text-[10px] px-2.5 py-1 rounded border border-border-main shadow-lg whitespace-nowrap z-30 flex items-center gap-2 pointer-events-none animate-in fade-in zoom-in-95 duration-100">
                {summary.platformBreakdown.map((p, i) => (
                  <React.Fragment key={p.name}>
                    {i > 0 && <span className="text-txt-muted">•</span>}
                    <span>{p.name}: <strong className="text-txt-main">{p.count}</strong></span>
                  </React.Fragment>
                ))}
              </div>
            )}
            <div className="w-full bg-border-main/40 h-2 rounded-full overflow-hidden flex gap-0.5 cursor-pointer">
              {summary.platformBreakdown.map((p, i) => {
                const widthPct = summary.totalSolved > 0 ? (p.count / summary.totalSolved) * 100 : 0;
                return (
                  <div
                    key={p.name}
                    style={{ width: `${widthPct}%` }}
                    className={`${p.color} h-full hover:opacity-90 ${i === 0 ? "rounded-l-full" : ""} ${i === summary.platformBreakdown.length - 1 ? "rounded-r-full" : ""}`}
                    title={`${p.name}: ${p.count}`}
                  />
                );
              })}
            </div>
          </div>
        </div>

        {/* Card 2: Active Days */}
        <div className="border border-border-main/70 bg-bg-surface p-5 rounded-md flex flex-col justify-between gap-3 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[9px] uppercase tracking-widest text-txt-muted">Active Days</span>
            <Flame size={16} className="text-txt-muted" />
          </div>
          <div>
            <div className="font-display text-4xl font-light text-txt-main tracking-tight flex items-baseline gap-2">
              {heatmapData.totalActiveDays} <span className="text-xs font-mono text-txt-muted font-normal">Active Days</span>
            </div>
            <span className="text-[10px] text-txt-sub font-mono">
              {summary.activeStreak} Days Current Streak
            </span>
          </div>
          <span className="text-[9px] text-txt-muted font-mono flex items-center gap-1">
            <CheckCircle2 size={11} className="text-txt-main" /> All platforms synchronized
          </span>
        </div>

        {/* Card 3: Contest Attended */}
        <div className="border border-border-main/70 bg-bg-surface p-5 rounded-md flex flex-col justify-between gap-3 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[9px] uppercase tracking-widest text-txt-muted">Contest Attended</span>
            <Trophy size={16} className="text-txt-muted" />
          </div>
          <div>
            <div className="font-display text-4xl font-light text-txt-main tracking-tight">
              {summary.totalContests}
            </div>
            <div className="flex flex-col gap-0.5 mt-0.5 font-mono text-[10px] text-txt-sub">
              {summary.ccContests > 0 && (
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent-main" />
                  CodeChef: <strong className="text-txt-main">{summary.ccContests}</strong>
                </span>
              )}
              {summary.lcContests > 0 && (
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent-main/60" />
                  LeetCode: <strong className="text-txt-main">{summary.lcContests}</strong>
                </span>
              )}
              {summary.cfContests > 0 && (
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent-main/40" />
                  Codeforces: <strong className="text-txt-main">{summary.cfContests}</strong>
                </span>
              )}
              {summary.totalContests === 0 && (
                <span className="text-[10px] text-txt-muted">No rated contests recorded</span>
              )}
            </div>
          </div>
          <span className="text-[9px] font-mono text-txt-muted">Official rated rounds</span>
        </div>

        {/* Card 4: Contest Rankings */}
        <div className="border border-border-main/70 bg-bg-surface p-5 rounded-md flex flex-col justify-between gap-3 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[9px] uppercase tracking-widest text-txt-muted">Contest Rankings</span>
            <Medal size={16} className="text-txt-muted" />
          </div>
          <div>
            <div className="text-[10px] font-mono text-txt-muted uppercase">
              {stats.codechef?.rating ? "CodeChef" : stats.leetcode?.rating ? "LeetCode" : stats.codeforces?.rating ? "Codeforces" : "Contest Rating"}
            </div>
            <div className="font-display text-2xl font-light text-txt-main tracking-tight">
              {stats.codechef?.rating 
                ? stats.codechef.rating 
                : stats.leetcode?.rating 
                  ? Math.round(stats.leetcode.rating) 
                  : stats.codeforces?.rating 
                    ? stats.codeforces.rating 
                    : (handles.codechef || handles.leetcode || handles.codeforces ? "Unrated" : "—")}
              {stats.codechef?.maxRating && stats.codechef.maxRating > (stats.codechef.rating || 0) ? (
                <span className="text-xs font-mono text-txt-muted font-normal ml-1.5">
                  (max : {stats.codechef.maxRating})
                </span>
              ) : null}
            </div>
            {stats.leetcode?.rating && stats.codechef?.rating ? (
              <div className="text-[10px] font-mono text-txt-sub mt-1">
                LeetCode: <strong className="text-txt-main">{Math.round(stats.leetcode.rating)}</strong>
              </div>
            ) : null}
          </div>
          <span className="text-[9px] font-mono text-txt-muted">
            {stats.codechef?.stars ? `${stats.codechef.stars} Stars Verified` : stats.leetcode?.rank ? stats.leetcode.rank : "Official Rated Rounds"}
          </span>
        </div>

      </div>

      {/* ================= 2. UNIVERSAL 365-DAY ACTIVITY HEATMAP (EXACT LEETCODE STYLE) ================= */}
      <div className="border border-border-main/70 bg-bg-surface p-6 rounded-md flex flex-col gap-4 shadow-xs">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-border-main/40 pb-3 gap-3">
          <div className="flex items-center gap-1.5">
            <Calendar size={15} className="text-txt-muted" />
            <span className="text-sm text-txt-main">
              <strong className="text-base font-semibold text-txt-main font-sans mr-1">{heatmapData.totalSubmissionsInCalendar}</strong> 
              {selectedLcYear ? `submissions in ${selectedLcYear}` : "submissions in the past one year"}
            </span>
          </div>
          
          <div className="flex items-center gap-4 font-mono text-[10px] text-txt-muted">
            <span>Total active days: <strong className="text-txt-main font-bold">{heatmapData.totalActiveDays}</strong></span>
            <span>Max streak: <strong className="text-txt-main font-bold">{heatmapData.maxStreak}</strong></span>
            
            {/* Year Dropdown Filter */}
            <div className="relative bg-bg-card hover:bg-bg-card/80 text-txt-main pl-3.5 pr-2.5 py-1.5 rounded border border-border-main/60 cursor-pointer transition-all select-none text-[9px] font-sans flex items-center gap-2 min-w-[80px] justify-between">
              <span className="font-semibold">{selectedLcYear || "Current"}</span>
              <span className="text-[7px] pointer-events-none">▼</span>
              <select
                value={selectedLcYear || ""}
                onChange={(e) => setSelectedLcYear(e.target.value ? parseInt(e.target.value) : null)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer text-txt-main bg-bg-surface"
              >
                <option value="" className="bg-bg-surface text-txt-main">Current</option>
                <option value="2026" className="bg-bg-surface text-txt-main">2026</option>
                <option value="2025" className="bg-bg-surface text-txt-main">2025</option>
              </select>
            </div>
          </div>
        </div>

        {heatmapData.isLeetcodePrivate && (
          <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded text-xs font-mono text-yellow-500 flex flex-col gap-1.5">
            <span className="font-bold flex items-center gap-1">
              <Lock size={12} /> LeetCode Submission Calendar is Private:
            </span>
            <span className="text-[10px] text-txt-muted font-sans leading-relaxed">
              To synchronize your exact live heatmap, turn off &quot;Make my submission calendar private&quot; in your LeetCode Account settings.
            </span>
          </div>
        )}

        {/* Heatmap Grid with bottom Month Labels */}
        <div 
          ref={heatmapScrollRef}
          className="overflow-x-auto w-full py-2 scroll-smooth select-none no-scrollbar"
        >
          <div className="flex gap-2.5 items-start select-none min-w-max pb-1 px-1">
            {heatmapData.monthGroups.map((group, gIdx) => (
              <div key={gIdx} className="flex flex-col gap-1.5">
                {/* Cells for this month */}
                <div className="flex gap-[3px]">
                  {group.weeks.map((week, wIdx) => (
                    <div key={wIdx} className="flex flex-col gap-[3px] w-2.5">
                      {week.cells.map((cell, cIdx) => {
                        if (cell.isSpacer) {
                          return (
                            <div 
                              key={cIdx} 
                              className="w-2.5 h-2.5" 
                            />
                          );
                        }

                        let colorClass = "bg-[#f3f4f6]/70 dark:bg-[#2c2c2c]/70 border border-[#e5e7eb]/70 dark:border-[#3c3c3c]/40";
                        if (cell.level === 1) colorClass = "bg-emerald-500/20 border border-emerald-500/10";
                        if (cell.level === 2) colorClass = "bg-emerald-500/50 border border-emerald-500/20";
                        if (cell.level === 3) colorClass = "bg-emerald-500";

                        return (
                          <div 
                            key={cIdx} 
                            className={`w-2.5 h-2.5 rounded-xs transition-transform duration-100 ease-out hover:scale-125 cursor-pointer ${colorClass}`}
                            title={cell.dateLabel}
                          />
                        );
                      })}
                    </div>
                  ))}
                </div>
                
                {/* Month Label centered under this month's weeks */}
                <div className="text-[9px] font-mono text-txt-muted text-center h-3.5 select-none mt-1">
                  {group.monthName}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex justify-end items-center gap-1.5 text-[8px] font-mono text-txt-muted uppercase pt-1">
          <span>Less</span>
          <div className="w-2 h-2 rounded-xs bg-[#f3f4f6]/70 dark:bg-[#2c2c2c]/70 border border-[#e5e7eb]/70 dark:border-[#3c3c3c]/40" />
          <div className="w-2 h-2 rounded-xs bg-emerald-500/20 border border-emerald-500/10" />
          <div className="w-2 h-2 rounded-xs bg-emerald-500/50 border border-emerald-500/20" />
          <div className="w-2 h-2 rounded-xs bg-emerald-500" />
          <span>More</span>
        </div>
      </div>

      {/* ================= 3. TWO-COLUMN SPLIT: CONTEST GRAPH & AWARDS (LEFT) | QUESTIONS & TOPICS & GITHUB (RIGHT) ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN (6 Cols): Rating Progression, Awards & Recent Solves Feed */}
        <div className="lg:col-span-6 flex flex-col gap-6">
          
          {/* Contest Rating Progression Graph (With Floating Micro-Tooltip Above Hovered Node) */}
          <div className="border border-border-main/70 bg-bg-surface p-6 rounded-md flex flex-col gap-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-border-main/40 pb-3">
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <TrendingUp size={14} className="text-txt-muted" />
                  <h3 className="text-sm font-semibold text-txt-main">Contest Rating Progression</h3>
                </div>
                <span className="text-[10px] text-txt-sub">
                  Historical contest performance &amp; rating milestones
                </span>
              </div>
              <span className="text-[10px] font-mono text-txt-muted">Hover points to inspect</span>
            </div>

            {/* Stable SVG Rating Graph Container */}
            <div className="w-full bg-bg-card/40 rounded p-4 border border-border-main/30 flex flex-col gap-2 relative">
              {contestTimeline.length === 0 ? (
                <div className="h-40 w-full flex flex-col items-center justify-center text-center p-4 text-txt-muted gap-1">
                  <TrendingUp size={22} className="opacity-40 mb-1" />
                  <span className="text-xs font-mono font-medium text-txt-main">No Rated Contests Synced</span>
                  <span className="text-[10px] text-txt-sub">Connect your CodeChef, LeetCode, or Codeforces accounts to plot your rating curve</span>
                </div>
              ) : (() => {
                const ratings = contestTimeline.map(n => n.rating).filter(r => typeof r === "number" && !isNaN(r));
                const rawMax = ratings.length > 0 ? Math.max(...ratings) : 2000;
                const rawMin = ratings.length > 0 ? Math.min(...ratings) : 800;
                const padding = Math.max(30, Math.round((rawMax - rawMin) * 0.15) || 50);
                const minR = Math.max(0, rawMin - padding);
                const maxR = rawMax + padding;
                const range = Math.max(1, maxR - minR);

                const getNodeCoords = (node: typeof contestTimeline[0], i: number) => {
                  const cx = contestTimeline.length === 1 ? 250 : 30 + (i / (contestTimeline.length - 1)) * 440;
                  const cy = 110 - ((node.rating - minR) / range) * 90;
                  return { cx, cy };
                };

                const pointsStr = contestTimeline.map((node, i) => {
                  const { cx, cy } = getNodeCoords(node, i);
                  return `${cx},${cy}`;
                }).join(" ");

                const areaPoints = contestTimeline.length === 1
                  ? `30,${getNodeCoords(contestTimeline[0], 0).cy} 470,${getNodeCoords(contestTimeline[0], 0).cy} 470,125 30,125`
                  : `${pointsStr} 470,125 30,125`;

                const linePoints = contestTimeline.length === 1
                  ? `30,${getNodeCoords(contestTimeline[0], 0).cy} 470,${getNodeCoords(contestTimeline[0], 0).cy}`
                  : pointsStr;

                return (
                  <>
                    {/* Floating Micro-Tooltip Positioned Directly Above Active Node */}
                    {hoveredContestIndex !== null && contestTimeline[hoveredContestIndex] && (
                      <div 
                        style={{
                          left: `${contestTimeline.length === 1 ? 50 : (hoveredContestIndex / (contestTimeline.length - 1)) * 80 + 10}%`,
                          top: "12px"
                        }}
                        className="absolute -translate-x-1/2 z-20 bg-bg-surface border border-border-main/80 px-2.5 py-1.5 rounded shadow-xl pointer-events-none flex flex-col items-center gap-0.5 text-center whitespace-nowrap animate-in fade-in zoom-in-95 duration-100"
                      >
                        <span className="font-mono text-[10px] font-bold text-txt-main">
                          {contestTimeline[hoveredContestIndex].name}
                        </span>
                        <div className="flex items-center gap-2 text-[9px] font-mono text-txt-muted">
                          <span className="text-accent-main font-bold">Rating: {contestTimeline[hoveredContestIndex].rating}</span>
                          <span>•</span>
                          <span>Rank: #{contestTimeline[hoveredContestIndex].rank}</span>
                          <span>•</span>
                          <span>{contestTimeline[hoveredContestIndex].date}</span>
                        </div>
                      </div>
                    )}

                    <div className="relative h-40 w-full">
                      <svg className="w-full h-full overflow-visible" viewBox="0 0 500 130" preserveAspectRatio="none">
                        <defs>
                          <linearGradient id="ratingSubtleGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity="0.18" />
                            <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>
                        
                        {/* Grid lines */}
                        <line x1="0" y1="20" x2="500" y2="20" stroke="currentColor" strokeOpacity="0.06" strokeDasharray="3 3" />
                        <line x1="0" y1="65" x2="500" y2="65" stroke="currentColor" strokeOpacity="0.06" strokeDasharray="3 3" />
                        <line x1="0" y1="110" x2="500" y2="110" stroke="currentColor" strokeOpacity="0.06" strokeDasharray="3 3" />

                        {/* Area */}
                        <polygon
                          points={areaPoints}
                          fill="url(#ratingSubtleGrad)"
                        />

                        {/* Line */}
                        <polyline
                          fill="none"
                          stroke="hsl(var(--accent))"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          points={linePoints}
                        />

                        {/* Interactive Nodes */}
                        {contestTimeline.map((node, i) => {
                          const { cx, cy } = getNodeCoords(node, i);
                          const isHovered = hoveredContestIndex === i;
                          return (
                            <g 
                              key={node.id} 
                              className="cursor-pointer"
                              onMouseEnter={() => setHoveredContestIndex(i)}
                              onMouseLeave={() => setHoveredContestIndex(null)}
                            >
                              <circle
                                cx={cx}
                                cy={cy}
                                r={isHovered ? "6.5" : "4.5"}
                                className="fill-bg-surface stroke-accent-main transition-all"
                                strokeWidth="2"
                              />
                              <text
                                x={cx}
                                y={cy - 10}
                                textAnchor="middle"
                                className="fill-txt-main text-[9px] font-mono font-semibold select-none"
                              >
                                {node.rating}
                              </text>
                            </g>
                          );
                        })}
                      </svg>
                    </div>

                    {/* Timeline Bottom Labels */}
                    <div className="flex justify-between items-center text-[9px] font-mono text-txt-muted px-1 pt-2 border-t border-border-main/30">
                      {contestTimeline.map((node) => (
                        <div key={node.id} className="flex flex-col items-center text-center">
                          <span className="font-medium text-txt-sub truncate max-w-[85px]">{node.name}</span>
                          <span className="text-[8px] text-txt-muted">{node.date}</span>
                        </div>
                      ))}
                    </div>
                  </>
                );
              })()}
            </div>
          </div>

          {/* Awards & Badges Vault (Max 4 Preview + View More Button) */}
          <div className="border border-border-main/70 bg-bg-surface p-6 rounded-md flex flex-col gap-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-border-main/40 pb-3">
              <div className="flex flex-col">
                <span className="font-mono text-[9px] uppercase tracking-widest text-txt-muted">Verified Badges &amp; Recognition</span>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-txt-main">Awards &amp; Milestones</h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-bg-card text-txt-muted border border-border-main/60">
                    {allAwardsList.length} Earned
                  </span>
                </div>
              </div>
              <Award size={16} className="text-txt-muted" />
            </div>

            {/* 4 Badges Preview Grid */}
            {previewAwards.length === 0 ? (
              <div className="py-6 flex flex-col items-center justify-center text-center text-txt-muted gap-1">
                <Award size={20} className="opacity-40 mb-1" />
                <span className="text-xs font-mono font-medium text-txt-main">No Milestone Badges Unlocked</span>
                <span className="text-[10px] text-txt-sub">Solve problems and participate in contests to unlock verified milestone badges</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {previewAwards.map(award => {
                  const IconComp = award.icon;
                  return (
                    <div 
                      key={award.id}
                      className="border border-border-main/70 bg-bg-card/40 hover:bg-bg-card/80 p-3.5 rounded-md flex flex-col justify-between gap-2.5 transition-colors shadow-2xs group"
                    >
                      <div className="flex items-start justify-between">
                        <span className="w-7 h-7 rounded flex items-center justify-center border border-border-main bg-bg-surface text-txt-main">
                          <IconComp size={14} />
                        </span>
                        <span className="text-[9px] font-mono text-txt-muted border border-border-main/50 bg-bg-surface px-1.5 py-0.5 rounded">
                          {award.issuer}
                        </span>
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold text-txt-main group-hover:text-accent-main transition-colors">
                          {award.title}
                        </h4>
                        <p className="text-[10px] text-txt-sub mt-0.5 leading-relaxed line-clamp-2">
                          {award.desc}
                        </p>
                      </div>
                      <div className="flex items-center justify-between pt-1.5 border-t border-border-main/30 text-[9px] font-mono text-txt-muted">
                        <span>{award.category}</span>
                        <span>{award.date}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Small View More Button */}
            <button
              type="button"
              onClick={() => setShowBadgesModal(true)}
              className="mt-2 w-full h-8 bg-bg-card hover:bg-bg-card/80 border border-border-main/70 text-txt-main text-[10px] font-mono uppercase tracking-wider rounded-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer font-semibold"
            >
              <span>View More Badges ({allAwardsList.length})</span>
              <ArrowRight size={12} />
            </button>
          </div>

          {/* Live Recent Solves Stream (Activity Feed - Subtle Theme & No Live Indicator) */}
          <div className="border border-border-main/70 bg-bg-surface p-6 rounded-md flex flex-col gap-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-border-main/40 pb-3">
              <div className="flex flex-col">
                <span className="font-mono text-[9px] uppercase tracking-widest text-txt-muted">Activity Stream</span>
                <h3 className="text-sm font-semibold text-txt-main">Recent Solved Stream</h3>
              </div>
              <Clock size={15} className="text-txt-muted" />
            </div>

            {recentSolves.length === 0 ? (
              <div className="py-6 flex flex-col items-center justify-center text-center text-txt-muted gap-1">
                <Code2 size={20} className="opacity-40 mb-1" />
                <span className="text-xs font-mono font-medium text-txt-main">No Recent Solves Recorded</span>
                <span className="text-[10px] text-txt-sub">Submit problem solutions on connected platforms to populate your live feed</span>
              </div>
            ) : (
              <div className="flex flex-col divide-y divide-border-main/30">
                {recentSolves.map((item) => (
                  <div key={item.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <a 
                        href={item.link} 
                        target="_blank" 
                        rel="noreferrer"
                        className="font-medium text-txt-main hover:text-accent-main truncate transition-colors flex items-center gap-1"
                      >
                        <span className="truncate">{item.title}</span>
                        <ExternalLink size={10} className="shrink-0 text-txt-muted" />
                      </a>
                      <div className="flex items-center gap-2 font-mono text-[10px] text-txt-muted">
                        <span>{item.platform}</span>
                        <span>•</span>
                        <span>{item.time}</span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-xs font-mono text-[10px] shrink-0 border border-border-main/60 bg-bg-card text-txt-sub">
                      {item.difficulty}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* RIGHT COLUMN (6 Cols): Question Distribution, Topic Analysis, Language Mastery & GitHub Matrix */}
        <div className="lg:col-span-6 flex flex-col gap-6">
          
          {/* Question Distribution Matrix (Raw Counts Only) */}
          <div className="border border-border-main/70 bg-bg-surface p-6 rounded-md flex flex-col gap-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-border-main/40 pb-3">
              <div className="flex flex-col">
                <span className="font-mono text-[9px] uppercase tracking-widest text-txt-muted">Metrics Breakdown</span>
                <h3 className="text-sm font-semibold text-txt-main">Question Distribution</h3>
              </div>
              <BarChart3 size={15} className="text-txt-muted" />
            </div>

            {/* DSA Based on Difficulty Bar Chart (No Percentages) */}
            <div className="flex flex-col gap-3">
              <div className="flex items-baseline justify-between">
                <span className="text-xs font-medium text-txt-main">DSA Solved by Difficulty</span>
                <span className="font-mono text-xs font-semibold text-txt-main">{summary.totalSolved}</span>
              </div>
              
              <div className="space-y-2.5 font-mono text-xs">
                {/* Easy Bar */}
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <span className="text-txt-sub">Easy</span>
                    <span className="text-txt-main font-semibold">{summary.easySolved}</span>
                  </div>
                  <div className="w-full bg-border-main/30 h-2 rounded-full overflow-hidden">
                    <div style={{ width: `${summary.totalSolved > 0 ? (summary.easySolved / summary.totalSolved) * 100 : 0}%` }} className="bg-accent-main/80 h-full rounded-full" />
                  </div>
                </div>

                {/* Medium Bar */}
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <span className="text-txt-sub">Medium</span>
                    <span className="text-txt-main font-semibold">{summary.medSolved}</span>
                  </div>
                  <div className="w-full bg-border-main/30 h-2 rounded-full overflow-hidden">
                    <div style={{ width: `${summary.totalSolved > 0 ? (summary.medSolved / summary.totalSolved) * 100 : 0}%` }} className="bg-accent-main/55 h-full rounded-full" />
                  </div>
                </div>

                {/* Hard Bar */}
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <span className="text-txt-sub">Hard</span>
                    <span className="text-txt-main font-semibold">{summary.hardSolved}</span>
                  </div>
                  <div className="w-full bg-border-main/30 h-2 rounded-full overflow-hidden">
                    <div style={{ width: `${summary.totalSolved > 0 ? (summary.hardSolved / summary.totalSolved) * 100 : 0}%` }} className="bg-accent-main/30 h-full rounded-full" />
                  </div>
                </div>
              </div>
            </div>

            {/* Competitive Programming Breakdown */}
            <div className="border-t border-border-main/40 pt-4 flex flex-col gap-2">
              <div className="flex items-baseline justify-between">
                <span className="text-xs font-medium text-txt-main">Competitive Programming</span>
                <span className="font-mono text-xs font-semibold text-txt-main">{summary.ccSolved}</span>
              </div>
              <div className="flex items-center justify-between font-mono text-xs pt-1">
                <span className="text-txt-sub">CodeChef Solves</span>
                <span className="font-medium text-txt-main">{summary.ccSolved}</span>
              </div>
              <div className="w-full bg-border-main/30 h-2 rounded-full overflow-hidden">
                <div style={{ width: `${summary.totalSolved > 0 ? (summary.ccSolved / summary.totalSolved) * 100 : summary.ccSolved > 0 ? 100 : 0}%` }} className="bg-accent-main/60 h-full rounded-full" />
              </div>
            </div>
          </div>

          {/* DSA Topic Analysis (Raw Counts Only) */}
          <div className="border border-border-main/70 bg-bg-surface p-6 rounded-md flex flex-col gap-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-border-main/40 pb-3">
              <div className="flex flex-col">
                <span className="font-mono text-[9px] uppercase tracking-widest text-txt-muted">Skill Matrix</span>
                <h3 className="text-sm font-semibold text-txt-main">DSA Topic Analysis</h3>
              </div>
              <Layers size={15} className="text-txt-muted" />
            </div>

            {topicData.length === 0 ? (
              <div className="py-6 flex flex-col items-center justify-center text-center text-txt-muted gap-1">
                <Layers size={20} className="opacity-40 mb-1" />
                <span className="text-xs font-mono font-medium text-txt-main">No Topic Metrics Synced</span>
                <span className="text-[10px] text-txt-sub">Connect your LeetCode profile to analyze your DSA category breakdown</span>
              </div>
            ) : (
              <div className="flex flex-col gap-3 pt-1">
                {topicData.map((topic, i) => {
                  const barWidth = Math.min(100, Math.round((topic.solved / maxTopicSolved) * 100));
                  return (
                    <div key={i} className="flex flex-col gap-1">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-txt-main font-medium">{topic.name}</span>
                        <span className="text-txt-sub font-semibold">{topic.solved} solved</span>
                      </div>
                      <div className="w-full bg-border-main/30 h-1.5 rounded-full overflow-hidden">
                        <div 
                          style={{ width: `${barWidth}%` }} 
                          className="h-full rounded-full bg-accent-main/70" 
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Language Mastery Breakdown (Raw Counts Only) */}
          <div className="border border-border-main/70 bg-bg-surface p-6 rounded-md flex flex-col gap-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-border-main/40 pb-3">
              <div className="flex flex-col">
                <span className="font-mono text-[9px] uppercase tracking-widest text-txt-muted">Polyglot Matrix</span>
                <h3 className="text-sm font-semibold text-txt-main">Language Mastery</h3>
              </div>
              <Terminal size={15} className="text-txt-muted" />
            </div>

            {languageData.length === 0 ? (
              <div className="py-6 flex flex-col items-center justify-center text-center text-txt-muted gap-1">
                <Terminal size={20} className="opacity-40 mb-1" />
                <span className="text-xs font-mono font-medium text-txt-main">No Language Metrics Synced</span>
                <span className="text-[10px] text-txt-sub">Connect your LeetCode profile to view your programming language solve breakdown</span>
              </div>
            ) : (
              <div className="flex flex-col gap-3 pt-1">
                {languageData.map((lang, i) => {
                  const barWidth = Math.min(100, Math.round((lang.solved / maxLanguageSolved) * 100));
                  return (
                    <div key={i} className="flex flex-col gap-1">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-txt-main font-medium">{lang.name}</span>
                        <span className="text-txt-sub font-semibold">{lang.solved} {lang.solved === 1 ? "solve" : "solves"}</span>
                      </div>
                      <div className="w-full bg-border-main/30 h-1.5 rounded-full overflow-hidden">
                        <div 
                          style={{ width: `${barWidth}%` }} 
                          className="h-full rounded-full bg-accent-main/80" 
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Dedicated GitHub Matrix Section (With gitlogo.jpg & Verified Commit Data) */}
          <div className="border border-border-main/70 bg-bg-surface p-6 rounded-md flex flex-col gap-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-border-main/40 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-md bg-bg-card border border-border-main/60 flex items-center justify-center p-1 overflow-hidden shrink-0">
                  <img src="/gitlogo.jpg" alt="GitHub" className="w-5.5 h-5.5 object-contain rounded-xs" />
                </span>
                <div className="flex flex-col">
                  <h3 className="text-sm font-semibold text-txt-main">GitHub Developer Activity</h3>
                  <span className="text-[10px] text-txt-muted font-mono">
                    {handles.github ? `@${handles.github}` : "Connected Developer Profile"}
                  </span>
                </div>
              </div>
              {handles.github ? (
                <a
                  href={`https://github.com/${handles.github}`}
                  target="_blank"
                  rel="noreferrer"
                  className="h-7 px-2.5 rounded-sm border border-border-main hover:bg-bg-card text-txt-main text-[10px] font-mono flex items-center gap-1 transition-colors"
                >
                  <span>Open Profile</span>
                  <ExternalLink size={10} />
                </a>
              ) : (
                <button
                  type="button"
                  onClick={() => onOpenConnectModal?.("GitHub" as any)}
                  className="h-7 px-2.5 rounded-sm border border-border-main hover:bg-bg-card text-txt-main text-[10px] font-mono flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <span>Link GitHub</span>
                </button>
              )}
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 gap-3">
              <div className="border border-border-main/40 bg-bg-card/40 p-3 rounded flex flex-col gap-0.5">
                <span className="text-[9px] font-mono text-txt-muted uppercase">Public Repos</span>
                <span className="text-xl font-semibold text-txt-main font-display">
                  {typeof stats.github?.repos === "number" ? stats.github.repos : (handles.github ? 0 : "—")}
                </span>
                <span className="text-[9px] text-txt-sub font-mono">Code repositories</span>
              </div>
              <div className="border border-border-main/40 bg-bg-card/40 p-3 rounded flex flex-col gap-0.5">
                <span className="text-[9px] font-mono text-txt-muted uppercase">Annual Commits</span>
                <span className="text-xl font-semibold text-accent-main font-display">
                  {typeof stats.github?.commits === "number" ? stats.github.commits : (handles.github ? 0 : "—")}
                </span>
                <span className="text-[9px] text-txt-sub font-mono">Verified pushes</span>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* ================= 4. VIEW MORE BADGES POPUP MODAL ================= */}
      {showBadgesModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-bg-surface border border-border-main rounded-md max-w-2xl w-full p-6 shadow-2xl flex flex-col gap-5 max-h-[85vh] overflow-hidden">
            
            <div className="flex items-center justify-between border-b border-border-main/40 pb-3">
              <div className="flex flex-col gap-0.5">
                <span className="font-mono text-[9px] uppercase tracking-widest text-accent-main font-bold">Credential Vault</span>
                <h3 className="font-display text-lg font-light text-txt-main flex items-center gap-2">
                  All Verified Badges &amp; Recognitions ({allAwardsList.length})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowBadgesModal(false)}
                className="w-7 h-7 rounded-sm bg-bg-card text-txt-muted hover:text-txt-main flex items-center justify-center cursor-pointer border border-border-main/50"
              >
                <X size={14} />
              </button>
            </div>

            {/* Scrollable Badges Grid */}
            <div className="overflow-y-auto pr-1 flex flex-col gap-3 max-h-[60vh]">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {allAwardsList.map(award => {
                  const IconComp = award.icon;
                  return (
                    <div 
                      key={award.id}
                      className="border border-border-main/70 bg-bg-card/50 p-4 rounded-md flex flex-col justify-between gap-3 shadow-2xs"
                    >
                      <div className="flex items-start justify-between">
                        <span className="w-8 h-8 rounded flex items-center justify-center border border-border-main bg-bg-surface text-txt-main">
                          <IconComp size={16} />
                        </span>
                        <span className="text-[9px] font-mono text-txt-muted border border-border-main/50 bg-bg-surface px-2 py-0.5 rounded">
                          {award.issuer}
                        </span>
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold text-txt-main">
                          {award.title}
                        </h4>
                        <p className="text-[10px] text-txt-sub mt-1 leading-relaxed">
                          {award.desc}
                        </p>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-border-main/30 text-[9px] font-mono text-txt-muted">
                        <span>{award.category}</span>
                        <span>{award.date}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-border-main/40">
              <button
                type="button"
                onClick={() => setShowBadgesModal(false)}
                className="h-8 px-4 bg-accent-main hover:opacity-90 text-bg-base font-mono text-[10px] uppercase font-bold rounded-sm cursor-pointer"
              >
                Close Vault
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
