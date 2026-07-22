"use client";

import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import Header from "../components/Header";
import Link from "next/link";
import { 
  ArrowLeft, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle, 
  TrendingUp,
  Sparkles,
  RotateCw
} from "lucide-react";

interface PlatformStats {
  solved: number;
  solvedEasy: number;
  solvedMedium: number;
  solvedHard: number;
  rank: string;
  rating: number;
  globalRank: number;
  submissionCalendar?: Record<string, number>;
  submissionCalendarPrivate?: boolean;
  acceptedSubmissions?: number;
  dailyChallenge?: {
    title: string;
    link: string;
    difficulty: string;
    date: string;
    completed: boolean;
  } | null;
  leetcodeStreak?: number;
  activeYears?: number[];
}

export default function CodingDeckPage() {
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Auto-clear message notification after 4 seconds
  useEffect(() => {
    if (message) {
      const handle = setTimeout(() => {
        setMessage(null);
      }, 4000);
      return () => clearTimeout(handle);
    }
  }, [message]);



  // Platform usernames
  const [leetcodeUser, setLeetcodeUser] = useState("");
  const [codeforcesUser, setCodeforcesUser] = useState("");
  const [codechefUser, setCodechefUser] = useState("");
  const [unstopUser, setUnstopUser] = useState("");
  const [hack2skillUser, setHack2skillUser] = useState("");

  // Inline handle input state
  const [inputLcHandle, setInputLcHandle] = useState("");

  const handleSaveInlineHandle = async () => {
    if (!inputLcHandle.trim()) return;
    const cleanHandle = inputLcHandle.trim();
    setLeetcodeUser(cleanHandle);
    if (typeof window !== "undefined") {
      localStorage.setItem("ldk_leetcode_handle", cleanHandle);
    }

    if (user) {
      try {
        await supabase.auth.updateUser({
          data: { ...user.user_metadata, leetcode_username: cleanHandle }
        });
      } catch (e) {}
    }

    setMessage({ text: `Successfully linked LeetCode handle @${cleanHandle}! Syncing live stats...`, type: "success" });
  };



  // LeetCode year filter state
  const [selectedLcYear, setSelectedLcYear] = useState<number | null>(null);
  const heatmapScrollRef = useRef<HTMLDivElement>(null);
  const isFirstLoadRef = useRef(true);

  // LeetCode success banner transition and display state
  const [showSuccessBanner, setShowSuccessBanner] = useState(false);
  const [prevCompleted, setPrevCompleted] = useState<boolean | null>(null);

  // Error messages for failed API fetches
  const [platformErrors, setPlatformErrors] = useState<Record<string, string>>({});

  // AI Portfolio Analyst states
  const [aiSummary, setAiSummary] = useState<{
    summary: string;
    score: number;
    skills: string[];
    insights: string[];
    isMock?: boolean;
  } | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiStage, setAiStage] = useState("");
  const [aiError, setAiError] = useState("");

  const handleGenerateAiSummary = async () => {
    setAiLoading(true);
    setAiError("");
    
    // Nice staggered audit stages
    const stages = [
      "Analyzing solved problem counts...",
      "Evaluating streak & coding habit metrics...",
      "Calibrating competitive ratings...",
      "Synthesizing recruiter report..."
    ];

    for (let i = 0; i < stages.length; i++) {
      setAiStage(stages[i]);
      await new Promise(r => setTimeout(r, 700));
    }

    try {
      const res = await fetch("/api/ai/portfolio-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leetcode: stats.leetcode ? {
            solved: stats.leetcode.solved || 0,
            easySolved: stats.leetcode.solvedEasy || 0,
            mediumSolved: stats.leetcode.solvedMedium || 0,
            hardSolved: stats.leetcode.solvedHard || 0,
            leetcodeStreak: stats.leetcode.leetcodeStreak || 0
          } : null,
          codeforces: stats.codeforces ? {
            rating: stats.codeforces.rating || 0,
            rank: stats.codeforces.rank || "Unrated",
            solved: stats.codeforces.solved || 0
          } : null,
          codechef: stats.codechef ? {
            rating: stats.codechef.rating || 0,
            globalRank: stats.codechef.globalRank || "N/A",
            solved: stats.codechef.solved || 0
          } : null
        })
      });

      if (res.ok) {
        const data = await res.json();
        setAiSummary(data);
      } else {
        const err = await res.json();
        setAiError(err.error || "Failed to generate AI report");
      }
    } catch {
      setAiError("Connection error while calling Gemini API");
    } finally {
      setAiLoading(false);
    }
  };

  // Mock platforms stats based on username presence
  const [stats, setStats] = useState<{
    leetcode: PlatformStats | null;
    codeforces: PlatformStats | null;
    codechef: PlatformStats | null;
    unstop: { registered: number; completed: number; rank: number } | null;
    hack2skill: { registered: number; completed: number; rank: number } | null;
  }>({
    leetcode: null,
    codeforces: null,
    codechef: null,
    unstop: null,
    hack2skill: null,
  });

  // Auto-scroll the heatmap to the far right (current month/latest submissions)
  useEffect(() => {
    const handle = setTimeout(() => {
      if (heatmapScrollRef.current) {
        heatmapScrollRef.current.scrollLeft = heatmapScrollRef.current.scrollWidth;
      }
    }, 120);
    return () => clearTimeout(handle);
  }, [stats.leetcode, selectedLcYear]);

  useEffect(() => {
    const isCompleted = stats.leetcode?.dailyChallenge?.completed;
    if (isCompleted !== undefined && isCompleted !== null) {
      if (prevCompleted === false && isCompleted === true) {
        setTimeout(() => {
          setShowSuccessBanner(true);
          setPrevCompleted(true);
        }, 0);
        const timer = setTimeout(() => {
          setShowSuccessBanner(false);
        }, 15000);
        return () => clearTimeout(timer);
      } else if (prevCompleted !== isCompleted) {
        setTimeout(() => {
          setPrevCompleted(isCompleted);
        }, 0);
      }
    }
  }, [stats.leetcode?.dailyChallenge?.completed, prevCompleted]);

  // Load platform details from Supabase Auth user metadata & localStorage
  useEffect(() => {
    const loadPlatformData = async () => {
      try {
        if (isFirstLoadRef.current) {
          setLoading(true);
          isFirstLoadRef.current = false;
        }
        const meta = user?.user_metadata || {};
        
        const localLc = typeof window !== "undefined" ? localStorage.getItem("ldk_leetcode_handle") || "" : "";
        const localCf = typeof window !== "undefined" ? localStorage.getItem("ldk_codeforces_handle") || "" : "";
        const localCc = typeof window !== "undefined" ? localStorage.getItem("ldk_codechef_handle") || "" : "";
        const localUn = typeof window !== "undefined" ? localStorage.getItem("ldk_unstop_handle") || "" : "";
        const localH2s = typeof window !== "undefined" ? localStorage.getItem("ldk_hack2skill_handle") || "" : "";

        const lc = meta.leetcode_username || localLc;
        const cf = meta.codeforces_username || localCf;
        const cc = meta.codechef_username || localCc;
        const un = meta.unstop_username || localUn;
        const h2s = meta.hack2skill_username || localH2s;

        setLeetcodeUser(lc);
        setCodeforcesUser(cf);
        setCodechefUser(cc);
        setUnstopUser(un);
        setHack2skillUser(h2s);

        const fetchStats = async (platform: string, username: string, year?: number | null) => {
          if (!username) return null;
          try {
            const yearQuery = year && platform === "leetcode" ? `&year=${year}` : "";
            const res = await fetch(`/api/coding-stats?platform=${platform}&username=${username}${yearQuery}&t=${Date.now()}`, {
              cache: "no-store",
              headers: { "Cache-Control": "no-cache" }
            });
            if (res.ok) {
              setPlatformErrors(prev => ({ ...prev, [platform]: "" }));
              return await res.json();
            } else {
              const err = await res.json();
              setPlatformErrors(prev => ({ ...prev, [platform]: err.error || `Failed to fetch ${platform} stats` }));
            }
          } catch (e) {
            console.warn(`Failed to fetch stats for ${platform}`, e);
            setPlatformErrors(prev => ({ ...prev, [platform]: "Connection error while syncing profile" }));
          }
          return null;
        };

        const [leetcodeStats, codeforcesStats, codechefStats] = await Promise.all([
          fetchStats("leetcode", lc, selectedLcYear),
          fetchStats("codeforces", cf),
          fetchStats("codechef", cc)
        ]);

        const updatedStats = {
          leetcode: leetcodeStats,
          codeforces: codeforcesStats,
          codechef: codechefStats,
          unstop: un ? { registered: 6, completed: 4, rank: 42 } : null,
          hack2skill: h2s ? { registered: 3, completed: 3, rank: 12 } : null,
        };

        setStats(updatedStats);

        // Auto-emit streak warning notification to global header drawer if daily problem is pending
        if (leetcodeStats?.dailyChallenge && !leetcodeStats.dailyChallenge.completed) {
          const todayStr = new Date().toISOString().split("T")[0];
          const notifId = `notif_streak_warning_${todayStr}`;
          const title = leetcodeStats.dailyChallenge.title || "Daily Challenge";
          const diff = leetcodeStats.dailyChallenge.difficulty || "Medium";
          const streak = leetcodeStats.leetcodeStreak || 0;

          if (typeof window !== "undefined") {
            const userKey = user ? `ldk_user_notifications_${user.id}` : "ldk_global_notifications";
            const stored = localStorage.getItem(userKey);
            const list = stored ? JSON.parse(stored) : [];
            if (!list.some((n: any) => n.id === notifId)) {
              list.unshift({
                id: notifId,
                title: "🔥 LeetCode Streak at Risk!",
                message: `Today's Daily Challenge "${title}" (${diff}) is pending. Solve now to maintain your ${streak}-day streak!`,
                type: "deadline",
                category: "alerts",
                time: "Just now",
                read: false,
                actionLabel: "Solve Challenge",
                actionUrl: "/coding-deck"
              });
              localStorage.setItem(userKey, JSON.stringify(list.slice(0, 100)));
              window.dispatchEvent(new Event("ldk_notifications_update"));
            }
          }
        }

        setStats(updatedStats);
        if (typeof window !== "undefined" && user?.id) {
          localStorage.setItem(`ldk_coding_stats_${user.id}`, JSON.stringify(updatedStats));
          window.dispatchEvent(new Event("ldk_coding_stats_update"));
        }

      } catch (err) {
        console.error("Error loading coding platform details:", err);
      } finally {
        setLoading(false);
      }
    };

    loadPlatformData();
  }, [user, selectedLcYear]);

  const [isManualSyncing, setIsManualSyncing] = useState(false);

  const handleManualSync = async () => {
    if (!user || isManualSyncing) return;
    setIsManualSyncing(true);
    try {
      const lc = leetcodeUser;
      const cf = codeforcesUser;
      const cc = codechefUser;

      const fetchStats = async (platform: string, username: string, year?: number | null) => {
        if (!username) return null;
        try {
          const yearQuery = year && platform === "leetcode" ? `&year=${year}` : "";
          const res = await fetch(`/api/coding-stats?platform=${platform}&username=${username}${yearQuery}&t=${Date.now()}`, {
            cache: "no-store",
            headers: { "Cache-Control": "no-cache" }
          });
          if (res.ok) return await res.json();
        } catch (e) {
          console.warn(`Sync failed for ${platform}`, e);
        }
        return null;
      };

      const [leetcodeStats, codeforcesStats, codechefStats] = await Promise.all([
        lc ? fetchStats("leetcode", lc, selectedLcYear) : Promise.resolve(null),
        cf ? fetchStats("codeforces", cf) : Promise.resolve(null),
        cc ? fetchStats("codechef", cc) : Promise.resolve(null)
      ]);

      setStats(prev => ({
        ...prev,
        leetcode: leetcodeStats || prev.leetcode,
        codeforces: codeforcesStats || prev.codeforces,
        codechef: codechefStats || prev.codechef,
      }));
      setMessage({ text: "Live coding platform stats synced!", type: "success" });
    } finally {
      setIsManualSyncing(false);
    }
  };

  // Poll statistics every 5 seconds in the background for instant live auto-detection
  useEffect(() => {
    if (!user) return;
    
    const interval = setInterval(() => {
      const pollStats = async () => {
        const lc = leetcodeUser;
        const cf = codeforcesUser;
        const cc = codechefUser;
        
        if (!lc && !cf && !cc) return;
        
        const fetchStats = async (platform: string, username: string, year?: number | null) => {
          if (!username) return null;
          try {
            const yearQuery = year && platform === "leetcode" ? `&year=${year}` : "";
            const res = await fetch(`/api/coding-stats?platform=${platform}&username=${username}${yearQuery}&t=${Date.now()}`, {
              cache: "no-store",
              headers: { "Cache-Control": "no-cache" }
            });
            if (res.ok) {
              return await res.json();
            }
          } catch (e) {
            console.warn(`Polling failed for ${platform}`, e);
          }
          return null;
        };

        const [leetcodeStats, codeforcesStats, codechefStats] = await Promise.all([
          lc ? fetchStats("leetcode", lc, selectedLcYear) : Promise.resolve(null),
          cf ? fetchStats("codeforces", cf) : Promise.resolve(null),
          cc ? fetchStats("codechef", cc) : Promise.resolve(null)
        ]);

        setStats(prev => ({
          ...prev,
          leetcode: leetcodeStats || prev.leetcode,
          codeforces: codeforcesStats || prev.codeforces,
          codechef: codechefStats || prev.codechef,
        }));
      };
      
      pollStats();
    }, 5000); // 5 seconds live auto-poll
    
    return () => clearInterval(interval);
  }, [user, leetcodeUser, codeforcesUser, codechefUser, selectedLcYear]);





  // Heatmap helper: Generate 53 columns x 7 rows mapping to actual calendar dates
  const renderHeatmap = () => {
    const now = new Date();
    const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    // 1. Build a combined calendar map of YYYY-MM-DD: count from active platforms
    const combinedCal: Record<string, number> = {};
    const addCalendar = (cal?: Record<string, number>) => {
      if (!cal) return;
      Object.entries(cal).forEach(([dateKey, count]) => {
        combinedCal[dateKey] = (combinedCal[dateKey] || 0) + count;
      });
    };

    addCalendar(stats.leetcode?.submissionCalendar);
    addCalendar(stats.codeforces?.submissionCalendar);
    addCalendar(stats.codechef?.submissionCalendar);

    // 2. Generate 371 days based on selected year (full calendar year) or current date (last 12 months)
    const cells: { dateStr: string; level: number; dateLabel: string; monthYearKey: string; cellMonthName: string }[] = [];
    let startDate: Date;
    let endDate: Date;

    if (selectedLcYear) {
      // Show calendar year of selectedLcYear
      const yearStart = new Date(selectedLcYear, 0, 1);
      const startDay = yearStart.getDay();
      startDate = new Date(yearStart.getTime());
      startDate.setDate(yearStart.getDate() - startDay); // Sunday of the week containing Jan 1

      endDate = new Date(startDate.getTime());
      endDate.setDate(startDate.getDate() + (53 * 7 - 1)); // Saturday of 53 weeks later
    } else {
      // Show last 12 months ending today
      endDate = new Date(todayMidnight.getTime());
      const endDay = endDate.getDay();
      endDate.setDate(endDate.getDate() + (6 - endDay)); // Saturday of the current week

      startDate = new Date(endDate.getTime());
      startDate.setDate(endDate.getDate() - (53 * 7 - 1)); // Sunday of 53 weeks ago
    }

    let totalActiveDays = 0;
    let maxStreak = 0;
    let currentStreak = 0;

    for (let i = 0; i < 371; i++) {
      const cellDate = new Date(startDate.getTime());
      cellDate.setDate(startDate.getDate() + i);
      
      const dateKey = `${cellDate.getFullYear()}-${String(cellDate.getMonth() + 1).padStart(2, "0")}-${String(cellDate.getDate()).padStart(2, "0")}`;
      const count = combinedCal[dateKey] || 0;
      
      // Calculate streaks
      if (count > 0) {
        totalActiveDays++;
        currentStreak++;
        if (currentStreak > maxStreak) {
          maxStreak = currentStreak;
        }
      } else {
        currentStreak = 0;
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

    // Group the 371 cells into chronological month blocks with precise day-of-week alignment
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
      // If we are showing a specific year, only include months of that year
      if (selectedLcYear && new Date(c.dateStr).getFullYear() !== selectedLcYear) {
        return;
      }
      if (!uniqueMonths.find(m => m.monthYearKey === c.monthYearKey)) {
        uniqueMonths.push({ monthYearKey: c.monthYearKey, monthName: c.cellMonthName });
      }
    });

    const monthGroups: MonthGroup[] = [];

    uniqueMonths.forEach(({ monthYearKey, monthName }) => {
      const weeksForMonth: Week[] = [];

      for (let w = 0; w < 53; w++) {
        // Check if this week has any days belonging to this month
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

    const isLeetcodePrivate = stats.leetcode?.submissionCalendarPrivate;
    const totalSubmissionsInCalendar = Object.values(combinedCal).reduce((sum, val) => sum + val, 0);

    return (
      <div className="border border-border-main/60 bg-bg-base/30 p-5 rounded flex flex-col gap-3 w-full overflow-hidden">
        {/* Heatmap header box matching LeetCode's layout */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-border-main/40 pb-3 gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-sm text-txt-main">
              <strong className="text-lg font-semibold text-txt-main font-sans mr-1">{totalSubmissionsInCalendar}</strong> 
              {selectedLcYear ? `submissions in ${selectedLcYear}` : "submissions in the past one year"}
            </span>
          </div>
          <div className="flex items-center gap-4 font-mono text-[10px] text-txt-muted">
            <span>Total active days: <strong className="text-txt-main font-bold">{totalActiveDays}</strong></span>
            <span>Max streak: <strong className="text-txt-main font-bold">{maxStreak}</strong></span>
            
            {/* Year Dropdown Filter matching LeetCode ref image layout */}
            {stats.leetcode?.activeYears && stats.leetcode.activeYears.length > 0 && (
              <div className="relative bg-bg-card hover:bg-bg-card/80 text-txt-main pl-3.5 pr-2.5 py-1.5 rounded border border-border-main/60 cursor-pointer transition-all select-none text-[9px] font-sans flex items-center gap-2 min-w-[80px] justify-between">
                <span className="font-semibold">{selectedLcYear || "Current"}</span>
                <span className="text-[7px] pointer-events-none">▼</span>
                <select
                  value={selectedLcYear || ""}
                  onChange={(e) => setSelectedLcYear(e.target.value ? parseInt(e.target.value) : null)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer text-txt-main bg-bg-surface"
                >
                  <option value="" className="bg-bg-surface text-txt-main">{"\u00A0\u00A0Current"}</option>
                  {stats.leetcode.activeYears
                    .filter((y) => y < new Date().getFullYear())
                    .map((y) => (
                      <option key={y} value={y} className="bg-bg-surface text-txt-main">{"\u00A0\u00A0" + y}</option>
                    ))
                  }
                </select>
              </div>
            )}
          </div>
        </div>

        {isLeetcodePrivate && (
          <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded text-xs font-mono text-yellow-500 flex flex-col gap-1.5 mt-1">
            <span className="font-bold flex items-center gap-1">🔒 LeetCode Submission Calendar is Private:</span>
            <span className="text-[10px] text-txt-muted font-sans leading-relaxed">
              To fetch and display your live contribution heatmap and calculate streaks correctly, you must log in to your LeetCode Account settings (https://leetcode.com/profile/settings/), look for the Privacy section, and turn off &quot;Make my submission calendar private&quot;.
            </span>
          </div>
        )}

        {/* Heatmap Grid with bottom Month Labels and no day labels */}
        <div 
          ref={heatmapScrollRef}
          className="overflow-x-auto w-full py-2 scroll-smooth [webkit-overflow-scrolling:touch] select-none scrollbar-thin scrollbar-thumb-border-main/40 scrollbar-track-transparent"
        >
          <div className="flex gap-2.5 items-start select-none min-w-max pb-1 px-4">
            {monthGroups.map((group, gIdx) => (
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
                            className={`w-2.5 h-2.5 rounded-sm transition-transform duration-100 ease-out hover:scale-125 cursor-pointer [will-change:transform] ${colorClass}`}
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
          <div className="w-2 h-2 rounded-sm bg-[#f3f4f6]/70 dark:bg-[#2c2c2c]/70 border border-[#e5e7eb]/70 dark:border-[#3c3c3c]/40" />
          <div className="w-2 h-2 rounded-sm bg-emerald-500/20 border border-emerald-500/10" />
          <div className="w-2 h-2 rounded-sm bg-emerald-500/50 border border-emerald-500/20" />
          <div className="w-2 h-2 rounded-sm bg-emerald-500" />
          <span>More</span>
        </div>
      </div>
    );
  };

  // Upcoming coding contests listing
  const contests = [
    { platform: "LeetCode", title: "Biweekly Contest 135", time: "July 20, 2026 - 08:00 PM", url: "https://leetcode.com/contest/" },
    { platform: "Codeforces", title: "Codeforces Round 970 (Div. 2)", time: "July 22, 2026 - 06:35 PM", url: "https://codeforces.com/contests" },
    { platform: "CodeChef", title: "Starters 148", time: "July 24, 2026 - 08:00 PM", url: "https://www.codechef.com/contests" },
    { platform: "Unstop", title: "Uber HackTag 2026 Hackathon", time: "Registration ends in 2 days", url: "https://unstop.com/" },
  ];

  if (authLoading) {
    return (
      <div className="h-screen bg-bg-base flex flex-col items-center justify-center font-mono text-xs text-txt-muted gap-2">
        <div className="w-4 h-4 border-2 border-accent-main border-t-transparent rounded-full animate-spin" />
        <span>Syncing session...</span>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen lg:h-screen lg:overflow-hidden flex flex-col font-sans selection:bg-accent-main selection:text-bg-base">
      
      {/* Header component */}
      <Header />

      {/* Main scrolling section */}
      <main className="flex-1 overflow-y-auto bg-bg-base/30 py-8 px-4 md:px-12 max-w-6xl w-full mx-auto flex flex-col gap-6">
        
        <Link 
          href="/profile"
          className="flex items-center gap-2 text-[10px] text-txt-muted hover:text-txt-main transition-colors font-mono tracking-wider uppercase self-start"
        >
          <ArrowLeft size={12} />
          Back to Profile
        </Link>

        {/* Title Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-main/40 pb-4">
          <div className="flex flex-col gap-1">
            <span className="font-mono text-[9px] uppercase tracking-widest text-txt-muted">Integrations Center</span>
            <h1 className="font-display text-3xl font-light tracking-tight text-txt-main">Coding Deck & Platforms</h1>
            <p className="text-xs text-txt-sub">Link your developer profiles across competitive coding and hackathon platforms to sync stats.</p>
          </div>
          <button
            onClick={handleManualSync}
            disabled={isManualSyncing}
            className="h-8 px-3 rounded-sm border border-accent-main/40 hover:bg-accent-main/10 text-accent-main text-[10px] font-mono uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer w-fit"
            title="Force immediate live sync with coding platforms"
          >
            <RotateCw size={12} className={isManualSyncing ? "animate-spin" : ""} />
            {isManualSyncing ? "Syncing Live..." : "Sync Live Stats"}
          </button>
        </div>

        {/* Banner Alert for outstanding daily problem */}
        {leetcodeUser && stats.leetcode?.dailyChallenge && !stats.leetcode.dailyChallenge.completed && (
          <div className="border border-yellow-500/40 bg-yellow-500/10 p-4 rounded-md flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-pulse">
            <div className="flex items-center gap-3">
              <AlertCircle className="text-yellow-500 flex-shrink-0" size={18} />
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-txt-main">LeetCode Daily Challenge Pending</span>
                <span className="text-[10px] text-txt-sub">
                  Today&apos;s daily challenge <strong className="text-yellow-500 font-mono font-bold">“{stats.leetcode.dailyChallenge.title}”</strong> ({stats.leetcode.dailyChallenge.difficulty}) is pending. {stats.leetcode?.leetcodeStreak && stats.leetcode.leetcodeStreak > 0 ? `Solve now to maintain your ${stats.leetcode.leetcodeStreak}-day streak!` : "Solve now to start your daily challenge streak!"}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <a 
                href={stats.leetcode.dailyChallenge.link} 
                target="_blank" 
                rel="noreferrer"
                className="h-8 px-4 border border-yellow-500/50 hover:bg-yellow-500/20 text-yellow-500 text-[10px] font-mono uppercase tracking-wider rounded-sm flex items-center justify-center gap-1.5 transition-all w-fit"
              >
                Solve on LeetCode <ExternalLink size={10} />
              </a>
            </div>
          </div>
        )}

        {leetcodeUser && showSuccessBanner && stats.leetcode?.dailyChallenge?.completed && (
          <div className="border border-emerald-500/40 bg-emerald-500/10 p-4 rounded-md flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="text-emerald-500 flex-shrink-0" size={18} />
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-txt-main">Daily Challenge Completed!</span>
                <span className="text-[10px] text-txt-sub">
                  Awesome! You solved <strong className="text-emerald-400 font-semibold font-mono">“{stats.leetcode.dailyChallenge.title}”</strong> today. Active Streak: {stats.leetcode?.leetcodeStreak || 0} days!
                </span>
              </div>
            </div>
            <span className="text-[9px] font-mono text-emerald-400 uppercase tracking-wider font-semibold border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 rounded-sm">
              Verified Live
            </span>
          </div>
        )}

        {message && (
          <div className={`text-xs p-3 border rounded-sm font-mono tracking-tight text-center ${
            message.type === "success" 
              ? "bg-emerald-500/10 border-emerald-500/50 text-txt-main" 
              : "bg-red-500/10 border-red-500/50 text-txt-muted"
          }`}>
            {message.text}
          </div>
        )}

        {loading ? (
          <div className="flex-1 flex items-center justify-center font-mono text-[10px] text-txt-muted py-24">
            FETCHING LINKED HANDLES...
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* ================= LEFT COLUMN: CODING CARD STACKS (8 Columns) ================= */}
            <div className="lg:col-span-8 flex flex-col gap-6">
              
              {/* LeetCode Card */}
              <div className="border border-border-main/70 bg-bg-surface p-6 rounded-md flex flex-col gap-4">
                <div className="flex items-center justify-between gap-4 border-b border-border-main/40 pb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="w-8 h-8 rounded-md bg-bg-card border border-border-main/60 flex items-center justify-center text-txt-main">
                      <svg viewBox="-5 -2 105 118" className="w-4 h-4" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M67.5068339,83.0664138 C70.0005384,80.5763786 74.0371402,80.5828822 76.5228362,83.0809398 C79.0085322,85.5789975 79.00204,89.6226456 76.5083355,92.1126808 L65.4351451,103.169577 C55.2192332,113.370744 38.5604663,113.518673 28.1722578,103.513204 C28.112217,103.455678 23.486583,98.9201326 8.22702585,83.9570195 C-1.92478479,74.0028895 -2.93614945,58.0748736 6.61697549,47.8463644 L24.4286944,28.7745461 C33.9100043,18.6218594 51.3874487,17.5122246 62.2279907,26.2789232 L78.4052912,39.3620235 C81.1448956,41.5776292 81.5728103,45.5984975 79.3610655,48.3428842 C77.1493207,51.0872709 73.1354592,51.5159327 70.3958548,49.300327 L54.2186634,36.2173149 C48.5492813,31.6325105 38.631911,32.2621597 33.7398535,37.5006265 L15.9279056,56.5726899 C11.2772073,61.552182 11.7865613,69.5740156 17.1461283,74.8292186 C28.3515339,85.8169393 36.9874071,94.2846214 36.9973988,94.294225 C42.3981571,99.4959838 51.130862,99.418438 56.43358,94.1233737 L67.5068339,83.0664138 Z" fill="#FFA116" fillRule="nonzero" />
                        <path d="M40.6069914,72.0014117 C37.086019,72.0014117 34.2317068,69.142117 34.2317068,65.6149982 C34.2317068,62.0878794 37.086019,59.2285847 40.6069914,59.2285847 L87.6247154,59.2285847 C91.1456879,59.2285847 94,62.0878794 94,65.6149982 C94,69.142117 91.1456879,72.0014117 87.6247154,72.0014117 L40.6069914,72.0014117 Z" fill="#B3B3B3" />
                        <path d="M49.4124315,2.02335002 C51.8178981,-0.552320454 55.852269,-0.686893945 58.4234511,1.72277172 C60.9946333,4.13243738 61.1289722,8.17385083 58.7235056,10.7495213 L15.9282277,56.5728697 C11.2773659,61.551984 11.7867168,69.5737689 17.1459309,74.8291832 L36.9094236,94.2091099 C39.4255514,96.6764051 39.4686234,100.719828 37.0056277,103.240348 C34.5426319,105.760868 30.5062548,105.804016 27.990127,103.33672 L8.22654289,83.9567041 C-1.92467414,74.0021005 -2.93603527,58.0741402 6.61751533,47.846311 L49.4124315,2.02335002 Z" fill="currentColor" />
                      </svg>
                    </span>
                    <div className="flex flex-col">
                      <h3 className="text-sm font-semibold text-txt-main">LeetCode Profile</h3>
                      <span className="text-[10px] text-txt-muted">Sync solve tallies & activity heatmap</span>
                    </div>
                  </div>

                  {leetcodeUser && (
                    <span className="text-[10px] font-mono text-txt-muted bg-bg-base/50 px-2 py-0.5 border border-border-main/60 rounded">
                      @{leetcodeUser}
                    </span>
                  )}
                </div>

                {!leetcodeUser ? (
                  <div className="p-5 border border-dashed border-border-main/80 rounded bg-bg-base/20 font-mono text-xs text-txt-muted flex flex-col sm:flex-row items-center justify-between gap-4 py-6">
                    <div className="flex flex-col gap-1 text-left">
                      <span className="font-semibold text-txt-main">LeetCode handle is not linked yet.</span>
                      <span className="text-[10px] text-txt-sub">Enter your LeetCode username below to sync daily challenge streak & stats.</span>
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <input
                        type="text"
                        value={inputLcHandle}
                        onChange={(e) => setInputLcHandle(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") handleSaveInlineHandle(); }}
                        placeholder="e.g. your_leetcode_id"
                        className="h-8 px-2.5 bg-bg-base border border-border-main/70 text-txt-main text-xs font-mono rounded focus:outline-none focus:border-accent-main"
                      />
                      <button
                        type="button"
                        onClick={handleSaveInlineHandle}
                        className="h-8 px-3 bg-accent-main text-bg-base font-mono text-[10px] uppercase font-bold rounded hover:opacity-90 transition-all shrink-0 cursor-pointer"
                      >
                        Link & Sync
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-6 pt-2">
                    {platformErrors.leetcode && (
                      <div className="border border-red-500/30 bg-red-500/10 p-3.5 rounded text-xs font-mono text-red-400 flex flex-col gap-1.5">
                        <span className="font-bold flex items-center gap-1">⚠️ Profile Sync Error:</span>
                        <span>{platformErrors.leetcode}</span>
                        <span className="text-[10px] text-txt-muted font-sans">
                          Please verify that your LeetCode handle is spelled correctly and your profile is public. If it is private, change your privacy settings on LeetCode.
                        </span>
                      </div>
                    )}
                    {/* Stats cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                      
                      <div className="border border-border-main/40 bg-bg-surface/50 backdrop-blur-sm p-3.5 rounded flex flex-col gap-1">
                        <span className="text-[9px] font-mono text-txt-muted uppercase font-semibold">Solved Problems</span>
                        <span className="text-xl font-semibold text-txt-main font-display">{stats.leetcode?.solved ?? 0}</span>
                        <span className="text-[9px] text-txt-sub font-mono tracking-tight">
                          {stats.leetcode 
                            ? `E: ${stats.leetcode.solvedEasy} | M: ${stats.leetcode.solvedMedium} | H: ${stats.leetcode.solvedHard}`
                            : "E: 0 | M: 0 | H: 0"}
                        </span>
                      </div>

                      <div className="border border-border-main/40 bg-bg-surface/50 backdrop-blur-sm p-3.5 rounded flex flex-col gap-1">
                        <span className="text-[9px] font-mono text-txt-muted uppercase font-semibold">Submissions</span>
                        <span className="text-xl font-semibold text-txt-main font-display">{(stats.leetcode as any)?.totalSubmissions ?? 0}</span>
                        <span className="text-[9px] text-txt-sub font-mono tracking-tight">
                          {stats.leetcode 
                            ? `E: ${(stats.leetcode as any).totalEasySubmissions ?? 0} | M: ${(stats.leetcode as any).totalMediumSubmissions ?? 0} | H: ${(stats.leetcode as any).totalHardSubmissions ?? 0}`
                            : "E: 0 | M: 0 | H: 0"}
                        </span>
                      </div>

                      <div className="border border-border-main/40 bg-bg-surface/50 backdrop-blur-sm p-3.5 rounded flex flex-col gap-1">
                        <span className="text-[9px] font-mono text-txt-muted uppercase font-semibold">Acceptance Rate</span>
                        <span className="text-xl font-semibold text-txt-main font-display">
                          {((stats.leetcode as any)?.totalSubmissions 
                            ? (((stats.leetcode as any)?.acceptedSubmissions / (stats.leetcode as any)?.totalSubmissions) * 100).toFixed(1)
                            : "0.0")}%
                        </span>
                        <span className="text-[9px] text-txt-sub font-mono tracking-tight">Correct solves ratio</span>
                      </div>

                      <div className="border border-border-main/40 bg-bg-surface/50 backdrop-blur-sm p-3.5 rounded flex flex-col gap-1">
                        <span className="text-[9px] font-mono text-txt-muted uppercase font-semibold">Global Rank</span>
                        <span className="text-xl font-semibold text-txt-main font-display">
                          {stats.leetcode?.globalRank ? `#${stats.leetcode.globalRank.toLocaleString()}` : "N/A"}
                        </span>
                        <span className="text-[9px] text-txt-sub font-mono tracking-tight">{stats.leetcode?.rank || "N/A"}</span>
                      </div>

                      <div className="border border-border-main/40 bg-bg-surface/50 backdrop-blur-sm p-3.5 rounded flex flex-col gap-1">
                        <span className="text-[9px] font-mono text-txt-muted uppercase font-semibold">Contest Rating</span>
                        <span className="text-xl font-semibold text-txt-main font-display">{stats.leetcode?.rating ?? "N/A"}</span>
                        <span className="text-[9px] text-txt-sub font-mono tracking-tight">Active Tier</span>
                      </div>

                    </div>

                    <div className="flex justify-between items-center bg-bg-base/30 border border-border-main/60 p-3 rounded-md">
                      <span className="text-[10px] font-mono text-txt-muted uppercase">Leetcode Profile</span>
                      <a 
                        href={`https://leetcode.com/${leetcodeUser}/`} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-xs font-semibold text-accent-main hover:underline flex items-center gap-1 font-mono"
                      >
                        @{leetcodeUser} <ExternalLink size={10} />
                      </a>
                    </div>

                    {/* Contribution Calendar Graph */}
                    {renderHeatmap()}

                  </div>
                )}
              </div>

              {/* CodeChef Profile Card */}
              <div className="border border-border-main/70 bg-bg-surface p-6 rounded-md flex flex-col gap-4">
                <div className="flex items-center justify-between gap-4 border-b border-border-main/40 pb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="w-8 h-8 rounded-md bg-bg-card border border-border-main/60 flex items-center justify-center text-[#A87D56]">
                      <svg viewBox="0 0 24 24" className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M6 18V20H18V18" />
                        <path d="M12 2C8.5 2 7 4.5 7 7C7 8.5 8 9.5 9 10C7.5 11 6 13 6 15C6 17 8 18 12 18C16 18 18 17 18 15C18 13 16.5 11 15 10C16 9.5 17 8.5 17 7C17 4.5 15.5 2 12 2Z" />
                      </svg>
                    </span>
                    <div className="flex flex-col">
                      <h3 className="text-sm font-semibold text-txt-main">CodeChef Profile</h3>
                      <span className="text-[10px] text-txt-muted">Track rating divisions & stars</span>
                    </div>
                  </div>

                  {codechefUser && (
                    <span className="text-[10px] font-mono text-txt-muted bg-bg-base/50 px-2 py-0.5 border border-border-main/60 rounded">
                      @{codechefUser}
                    </span>
                  )}
                </div>

                {!codechefUser ? (
                  <div className="p-5 border border-dashed border-border-main/80 rounded bg-bg-base/20 text-center font-mono text-xs text-txt-muted flex flex-col gap-1 items-center py-6">
                    <span>CodeChef account is not linked.</span>
                    <span className="text-[10px] text-txt-sub">Link your handle in your Profile Settings to sync metrics.</span>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4 w-full">
                    {platformErrors.codechef && (
                      <div className="border border-red-500/30 bg-red-500/10 p-3.5 rounded text-xs font-mono text-red-400 flex flex-col gap-1.5">
                        <span className="font-bold flex items-center gap-1">⚠️ Profile Sync Error:</span>
                        <span>{platformErrors.codechef}</span>
                        <span className="text-[10px] text-txt-muted font-sans">
                          Verify that your CodeChef username is spelled correctly and the account exists.
                        </span>
                      </div>
                    )}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
                      <div className="border border-border-main/60 bg-bg-base/30 p-3 rounded flex flex-col gap-1">
                        <span className="text-[10px] font-mono text-txt-muted uppercase">Star Division</span>
                        <span className="text-xl font-semibold text-txt-main font-display">{stats.codechef?.rank}</span>
                        <span className="text-[9px] text-txt-sub font-mono">Rating: {stats.codechef?.rating}</span>
                      </div>

                      <div className="border border-border-main/60 bg-bg-base/30 p-3 rounded flex flex-col gap-1">
                        <span className="text-[10px] font-mono text-txt-muted uppercase">Solved Problems</span>
                        <span className="text-xl font-semibold text-txt-main font-display">{stats.codechef?.solved}</span>
                        <span className="text-[9px] text-txt-sub font-mono">Synced 5m ago</span>
                      </div>

                      <div className="border border-border-main/60 bg-bg-base/30 p-3 rounded flex flex-col gap-1">
                        <span className="text-[10px] font-mono text-txt-muted uppercase">Platform Handle</span>
                        <a 
                          href={`https://www.codechef.com/users/${codechefUser}`} 
                          target="_blank" 
                          rel="noreferrer"
                          className="text-xs font-semibold text-accent-main hover:underline flex items-center gap-1 font-mono pt-1.5"
                        >
                          @{codechefUser} <ExternalLink size={10} />
                        </a>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Codeforces Profile Card */}
              <div className="border border-border-main/70 bg-bg-surface p-6 rounded-md flex flex-col gap-4">
                <div className="flex items-center justify-between gap-4 border-b border-border-main/40 pb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="w-8 h-8 rounded-md bg-bg-card border border-border-main/60 flex items-center justify-center">
                      <svg viewBox="0 0 24 24" className="w-4.5 h-4.5" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="3" y="8" width="4" height="13" rx="1.5" fill="#1877F2"/>
                        <rect x="10" y="3" width="4" height="18" rx="1.5" fill="#EF3F3A"/>
                        <rect x="17" y="12" width="4" height="9" rx="1.5" fill="#F9A825"/>
                      </svg>
                    </span>
                    <div className="flex flex-col">
                      <h3 className="text-sm font-semibold text-txt-main">Codeforces Profile</h3>
                      <span className="text-[10px] text-txt-muted">Track division ratings & solve metrics</span>
                    </div>
                  </div>

                  {codeforcesUser && (
                    <span className="text-[10px] font-mono text-txt-muted bg-bg-base/50 px-2 py-0.5 border border-border-main/60 rounded">
                      @{codeforcesUser}
                    </span>
                  )}
                </div>

                {!codeforcesUser ? (
                  <div className="p-5 border border-dashed border-border-main/80 rounded bg-bg-base/20 text-center font-mono text-xs text-txt-muted flex flex-col gap-1 items-center py-6">
                    <span>Codeforces account is not linked.</span>
                    <span className="text-[10px] text-txt-sub">Link your handle in your Profile Settings to sync metrics.</span>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4 w-full">
                    {platformErrors.codeforces && (
                      <div className="border border-red-500/30 bg-red-500/10 p-3.5 rounded text-xs font-mono text-red-400 flex flex-col gap-1.5">
                        <span className="font-bold flex items-center gap-1">⚠️ Profile Sync Error:</span>
                        <span>{platformErrors.codeforces}</span>
                        <span className="text-[10px] text-txt-muted font-sans">
                          Verify that your Codeforces username handle is correct and exists on the platform.
                        </span>
                      </div>
                    )}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 pt-2">
                      <div className="border border-border-main/60 bg-bg-base/30 p-3 rounded flex flex-col gap-1">
                        <span className="text-[10px] font-mono text-txt-muted uppercase">Division Rating</span>
                        <span className="text-xl font-semibold text-txt-main font-display">{stats.codeforces?.rating}</span>
                        <span className="text-[9px] text-txt-sub font-mono">{stats.codeforces?.rank}</span>
                      </div>

                      <div className="border border-border-main/60 bg-bg-base/30 p-3 rounded flex flex-col gap-1">
                        <span className="text-[10px] font-mono text-txt-muted uppercase">Solved Problems</span>
                        <span className="text-xl font-semibold text-txt-main font-display">{stats.codeforces?.solved}</span>
                        <span className="text-[9px] text-txt-sub font-mono">Unique problems</span>
                      </div>

                      <div className="border border-border-main/60 bg-bg-base/30 p-3 rounded flex flex-col gap-1">
                        <span className="text-[10px] font-mono text-txt-muted uppercase">Submissions</span>
                        <span className="text-xl font-semibold text-txt-main font-display">{(stats.codeforces as any)?.totalSubmissions || 0}</span>
                        <span className="text-[9px] text-txt-sub font-mono">Total runs</span>
                      </div>

                      <div className="border border-border-main/60 bg-bg-base/30 p-3 rounded flex flex-col gap-1">
                        <span className="text-[10px] font-mono text-txt-muted uppercase">Acceptance Rate</span>
                        <span className="text-xl font-semibold text-txt-main font-display">
                          {((stats.codeforces as any)?.totalSubmissions 
                            ? (((stats.codeforces as any)?.acceptedSubmissions / (stats.codeforces as any)?.totalSubmissions) * 100).toFixed(1)
                            : "0.0")}%
                        </span>
                        <span className="text-[9px] text-txt-sub font-mono">Correct runs ratio</span>
                      </div>

                      <div className="border border-border-main/60 bg-bg-base/30 p-3 rounded flex flex-col gap-1">
                        <span className="text-[10px] font-mono text-txt-muted uppercase">Platform Handle</span>
                        <a 
                          href={`https://codeforces.com/profile/${codeforcesUser}`} 
                          target="_blank" 
                          rel="noreferrer"
                          className="text-xs font-semibold text-accent-main hover:underline flex items-center gap-1 font-mono pt-1.5"
                        >
                          @{codeforcesUser} <ExternalLink size={10} />
                        </a>
                      </div>
                    </div>
                  </div>
                )}
              </div>

            </div>

            {/* ================= RIGHT COLUMN: CONTESTS FEED & HACKATHONS (4 Columns) ================= */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              
              {/* AI Programming Portfolio Analyst Panel */}
              <div className="border border-border-main/70 bg-bg-surface p-6 rounded-md flex flex-col gap-4">
                <div className="flex items-center justify-between border-b border-border-main/40 pb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles size={14} className="text-amber-500 animate-pulse" />
                    <span className="font-mono text-[9px] uppercase tracking-widest text-txt-muted font-bold">AI Portfolio Analyst</span>
                  </div>
                </div>

                {/* Staging / Loading state */}
                {aiLoading && (
                  <div className="py-6 flex flex-col items-center justify-center gap-3 text-center">
                    <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                    <span className="text-[10px] font-mono text-txt-muted uppercase tracking-wider animate-pulse">{aiStage}</span>
                  </div>
                )}

                {/* Error state */}
                {!aiLoading && aiError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded flex flex-col gap-2">
                    <span className="text-[10px] font-mono text-red-500 font-bold uppercase">Analysis Error</span>
                    <p className="text-[10px] text-txt-muted leading-relaxed font-light">{aiError}</p>
                    <button 
                      onClick={handleGenerateAiSummary} 
                      className="text-[9px] font-mono uppercase font-bold text-accent-main hover:underline text-left cursor-pointer"
                    >
                      Retry Analysis
                    </button>
                  </div>
                )}

                {/* Initial state (no analysis generated yet) */}
                {!aiLoading && !aiError && !aiSummary && (
                  <div className="flex flex-col gap-3">
                    <p className="text-xs text-txt-muted font-light leading-relaxed">
                      Evaluate your synced programming profiles (LeetCode, Codeforces, CodeChef) using Google Gemini 1.5 Flash to synthesize an industry-grade recruiter summary and index score.
                    </p>
                    <button
                      onClick={handleGenerateAiSummary}
                      className="w-full py-2 bg-bg-card hover:bg-bg-card/80 border border-border-main/60 hover:border-border-main text-txt-main text-[10px] uppercase font-mono tracking-wider font-bold transition-all duration-150 rounded flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Sparkles size={10} className="text-amber-500" />
                      Generate AI Analysis
                    </button>
                  </div>
                )}

                {/* Report state */}
                {!aiLoading && !aiError && aiSummary && (
                  <div className="flex flex-col gap-4">
                    {/* Index score and header */}
                    <div className="flex items-center justify-between gap-4 bg-bg-base/30 border border-border-main/50 p-3 rounded">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[9px] font-mono text-txt-muted uppercase">Coding Index</span>
                        <span className="text-lg font-bold text-txt-main font-mono leading-none">{aiSummary.score}<span className="text-[10px] text-txt-muted font-light font-sans">/100</span></span>
                      </div>
                      
                      {/* Custom bar matching progress */}
                      <div className="flex-1 max-w-[120px] h-1.5 bg-bg-card rounded-full overflow-hidden border border-border-main/40">
                        <div 
                          className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 transition-all duration-500" 
                          style={{ width: `${aiSummary.score}%` }}
                        />
                      </div>
                    </div>

                    {/* Summary paragraph */}
                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] font-mono text-txt-muted uppercase font-bold">Profile Summary</span>
                      <p className="text-xs text-txt-main font-light leading-relaxed">
                        {aiSummary.summary}
                      </p>
                    </div>

                    {/* Key insights list */}
                    {Array.isArray(aiSummary.insights) && aiSummary.insights.length > 0 && (
                      <div className="flex flex-col gap-1.5">
                        <span className="text-[9px] font-mono text-txt-muted uppercase font-bold">Recruiter Insights</span>
                        <ul className="flex flex-col gap-1.5">
                          {aiSummary.insights.map((ins, idx) => (
                            <li key={idx} className="text-[10px] text-txt-sub font-light flex items-start gap-1.5 leading-relaxed">
                              <span className="text-amber-500 mt-1 select-none">•</span>
                              <span>{ins}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Skills badges */}
                    {Array.isArray(aiSummary.skills) && aiSummary.skills.length > 0 && (
                      <div className="flex flex-col gap-1.5 pt-1.5 border-t border-border-main/30">
                        <div className="flex flex-wrap gap-1.5">
                          {aiSummary.skills.map((skill, idx) => (
                            <span 
                              key={idx} 
                              className="text-[8px] font-mono uppercase tracking-wider bg-bg-card border border-border-main/50 px-2 py-0.5 rounded text-txt-main"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Buttons */}
                    <div className="flex items-center justify-between gap-4 pt-1 border-t border-border-main/30">
                      <button 
                        onClick={handleGenerateAiSummary}
                        className="text-[9px] font-mono uppercase font-bold text-accent-main hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Sparkles size={8} /> Re-Analyze
                      </button>
                      
                      {aiSummary.isMock && (
                        <span className="text-[8px] font-sans text-txt-muted italic bg-yellow-500/10 text-yellow-600 border border-yellow-500/20 px-2 py-0.5 rounded">
                          Mock mode active
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Unstop / Hack2Skill Panel */}
              <div className="border border-border-main/70 bg-bg-surface p-6 rounded-md flex flex-col gap-4">
                <span className="font-mono text-[9px] uppercase tracking-widest text-txt-muted font-bold">Hackathon Portals</span>
                
                {/* Unstop */}
                <div className="border-b border-border-main/40 pb-3 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-txt-main">Unstop Integrations</span>
                    {unstopUser && (
                      <span className="text-[9px] bg-bg-card px-2 py-0.5 border border-border-main/80 rounded">{stats.unstop?.registered} Applied</span>
                    )}
                  </div>

                  {unstopUser ? (
                    <div className="flex justify-between items-center text-[10px] font-mono text-txt-sub">
                      <span>@{unstopUser}</span>
                    </div>
                  ) : (
                    <span className="text-[10px] text-txt-muted italic font-light">Link Unstop in your Profile Settings to sync metrics.</span>
                  )}
                </div>

                {/* Hack2Skill */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-txt-main">Hack2Skill Integrations</span>
                    {hack2skillUser && (
                      <span className="text-[9px] bg-bg-card px-2 py-0.5 border border-border-main/80 rounded">{stats.hack2skill?.registered} Applied</span>
                    )}
                  </div>

                  {hack2skillUser ? (
                    <div className="flex justify-between items-center text-[10px] font-mono text-txt-sub">
                      <span>@{hack2skillUser}</span>
                    </div>
                  ) : (
                    <span className="text-[10px] text-txt-muted italic font-light">Link Hack2Skill in your Profile Settings to sync metrics.</span>
                  )}
                </div>

              </div>

              {/* Active / Upcoming Contests Feed */}
              <div className="border border-border-main/70 bg-bg-surface p-6 rounded-md flex flex-col gap-4">
                <div className="flex items-center justify-between border-b border-border-main/40 pb-3">
                  <div className="flex items-center gap-2">
                    <TrendingUp size={14} className="text-accent-main" />
                    <span className="font-mono text-[9px] uppercase tracking-widest text-txt-muted font-bold">Active Contest Feed</span>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  {contests.map((c, idx) => (
                    <div key={idx} className="border border-border-main/40 p-3 rounded bg-bg-base/30 flex flex-col gap-1.5 hover:border-txt-main transition-colors duration-200">
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] font-mono tracking-wider font-bold bg-bg-card px-2 py-0.5 rounded border border-border-main/60 text-txt-main">{c.platform}</span>
                        <a href={c.url} target="_blank" rel="noreferrer" className="text-[9px] text-txt-muted hover:text-txt-main flex items-center gap-0.5">
                          Open <ExternalLink size={8} />
                        </a>
                      </div>
                      <span className="text-xs font-semibold text-txt-main font-mono truncate">{c.title}</span>
                      <span className="text-[9px] text-txt-sub">{c.time}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        )}

      </main>



    </div>
  );
}
