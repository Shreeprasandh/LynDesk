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
  Calendar, 
  TrendingUp 
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

const extractUsername = (platform: string, input: string): string => {
  let val = input.trim();
  if (!val) return "";
  
  // Remove trailing slashes
  val = val.replace(/\/+$/, "");
  
  try {
    // If it's a URL
    if (val.startsWith("http://") || val.startsWith("https://") || val.includes(".com/")) {
      const urlString = val.startsWith("http") ? val : `https://${val}`;
      const url = new URL(urlString);
      const pathname = url.pathname;
      const segments = pathname.split("/").filter(Boolean);
      
      if (platform === "leetcode") {
        if (segments[0] === "u" && segments[1]) return segments[1];
        if (segments[0]) return segments[0];
      } else if (platform === "codeforces") {
        if (segments[0] === "profile" && segments[1]) return segments[1];
        if (segments[0]) return segments[0];
      } else if (platform === "codechef") {
        if (segments[0] === "users" && segments[1]) return segments[1];
        if (segments[0]) return segments[0];
      } else if (platform === "unstop" || platform === "hack2skill") {
        if (segments[0] === "u" && segments[1]) return segments[1];
        if (segments[0]) return segments[0];
      }
    }
  } catch (e) {
    console.warn("URL parsing failed", e);
  }
  
  if (val.includes("/")) {
    const parts = val.split("/");
    return parts[parts.length - 1] || val;
  }
  
  return val;
};

export default function CodingDeckPage() {
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);



  // Platform usernames
  const [leetcodeUser, setLeetcodeUser] = useState("");
  const [codeforcesUser, setCodeforcesUser] = useState("");
  const [codechefUser, setCodechefUser] = useState("");
  const [unstopUser, setUnstopUser] = useState("");
  const [hack2skillUser, setHack2skillUser] = useState("");

  // Calculate current streak based on calendar activity dynamically
  const calculateCurrentStreak = () => {
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

    let streakVal = 0;
    const today = new Date();
    let checkDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    const getDateStr = (d: Date) => 
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

    // If no submissions today, start checking from yesterday
    if (!(combinedCal[getDateStr(checkDate)] > 0)) {
      checkDate.setDate(checkDate.getDate() - 1);
    }
    
    while (true) {
      const key = getDateStr(checkDate);
      if (combinedCal[key] > 0) {
        streakVal++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
    return streakVal;
  };

  // Connection edit states
  const [editLeetcode, setEditLeetcode] = useState(false);
  const [editCodeforces, setEditCodeforces] = useState(false);
  const [editCodechef, setEditCodechef] = useState(false);
  const [editUnstop, setEditUnstop] = useState(false);
  const [editHack2skill, setEditHack2skill] = useState(false);

  // LeetCode year filter state
  const [selectedLcYear, setSelectedLcYear] = useState<number | null>(null);
  const heatmapScrollRef = useRef<HTMLDivElement>(null);

  // LeetCode success banner transition and display state
  const [showSuccessBanner, setShowSuccessBanner] = useState(false);
  const [prevCompleted, setPrevCompleted] = useState<boolean | null>(null);

  // Custom disconnect confirmation modal state
  const [disconnectModal, setDisconnectModal] = useState<{
    isOpen: boolean;
    platform: string;
  }>({ isOpen: false, platform: "" });

  // Error messages for failed API fetches
  const [platformErrors, setPlatformErrors] = useState<Record<string, string>>({});

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

  // Handle LeetCode daily challenge success banner timeout (display for 15 seconds on completion transition)
  useEffect(() => {
    const isCompleted = stats.leetcode?.dailyChallenge?.completed;
    if (isCompleted !== undefined && isCompleted !== null) {
      if (prevCompleted === false && isCompleted === true) {
        setShowSuccessBanner(true);
        const timer = setTimeout(() => {
          setShowSuccessBanner(false);
        }, 15000);
        setPrevCompleted(true);
        return () => clearTimeout(timer);
      } else if (prevCompleted !== isCompleted) {
        setPrevCompleted(isCompleted);
      }
    }
  }, [stats.leetcode?.dailyChallenge?.completed, prevCompleted]);

  // Load platform details from Supabase Auth user metadata
  useEffect(() => {
    if (!user) return;

    const loadPlatformData = async () => {
      try {
        const isFirstLoad = !stats.leetcode && !stats.codeforces && !stats.codechef;
        if (isFirstLoad) {
          setLoading(true);
        }
        const meta = user.user_metadata || {};
        
        const lc = meta.leetcode_username || "";
        const cf = meta.codeforces_username || "";
        const cc = meta.codechef_username || "";
        const un = meta.unstop_username || "";
        const h2s = meta.hack2skill_username || "";

        setLeetcodeUser(lc);
        setCodeforcesUser(cf);
        setCodechefUser(cc);
        setUnstopUser(un);
        setHack2skillUser(h2s);

        
        const fetchStats = async (platform: string, username: string, year?: number | null) => {
          if (!username) return null;
          try {
            const yearQuery = year && platform === "leetcode" ? `&year=${year}` : "";
            const res = await fetch(`/api/coding-stats?platform=${platform}&username=${username}${yearQuery}`);
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

        setStats({
          leetcode: leetcodeStats,
          codeforces: codeforcesStats,
          codechef: codechefStats,
          unstop: un ? { registered: 6, completed: 4, rank: 42 } : null,
          hack2skill: h2s ? { registered: 3, completed: 3, rank: 12 } : null,
        });

      } catch (err) {
        console.error("Error loading coding platform details:", err);
      } finally {
        setLoading(false);
      }
    };

    loadPlatformData();
  }, [user, selectedLcYear]);

  // Poll statistics every 15 seconds in the background for live auto-detection
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
            const res = await fetch(`/api/coding-stats?platform=${platform}&username=${username}${yearQuery}`);
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
    }, 15000); // 15 seconds
    
    return () => clearInterval(interval);
  }, [user, leetcodeUser, codeforcesUser, codechefUser, selectedLcYear]);

  // Save specific platform handle
  const handleSavePlatform = async (platform: string, username: string) => {
    if (!user) return;
    setSaving(true);
    setMessage(null);

    const metaKey = `${platform}_username`;

    try {
      // 1. Try public profiles updates first
      try {
        const payload: Record<string, string | boolean> = { id: user.id };
        payload[metaKey] = username.trim();
        
        await supabase
          .from("profiles")
          .upsert(payload);
      } catch (dbErr) {
        console.warn("Profiles table handle write error. Proceeding with Auth Metadata fallback.", dbErr);
      }

      // 2. Auth metadata update
      const updateData: Record<string, string | boolean> = {};
      updateData[metaKey] = username.trim();

      const { error } = await supabase.auth.updateUser({
        data: updateData
      });

      if (error) throw error;

      // Fetch stats for the newly connected platform dynamically
      let platformStats = null;
      if (username.trim()) {
        if (platform === "leetcode" || platform === "codeforces" || platform === "codechef") {
          try {
            const res = await fetch(`/api/coding-stats?platform=${platform}&username=${username}`);
            if (res.ok) {
              setPlatformErrors(prev => ({ ...prev, [platform]: "" }));
              platformStats = await res.json();
            } else {
              const err = await res.json();
              setPlatformErrors(prev => ({ ...prev, [platform]: err.error || `Failed to link ${platform}` }));
            }
          } catch (e) {
            console.warn("Error fetching dynamic connected stats", e);
            setPlatformErrors(prev => ({ ...prev, [platform]: "Connection error while linking profile" }));
          }
        } else if (platform === "unstop") {
          platformStats = { registered: 6, completed: 4, rank: 42 };
        } else {
          platformStats = { registered: 3, completed: 3, rank: 12 };
        }
      } else {
        setPlatformErrors(prev => ({ ...prev, [platform]: "" }));
      }

      // Update local state metrics dynamically
      setStats(prev => ({
        ...prev,
        [platform]: platformStats
      }));

      // Close editing
      if (platform === "leetcode") setEditLeetcode(false);
      if (platform === "codeforces") setEditCodeforces(false);
      if (platform === "codechef") setEditCodechef(false);
      if (platform === "unstop") setEditUnstop(false);
      if (platform === "hack2skill") setEditHack2skill(false);

      setMessage({ text: `${platform.toUpperCase()} handle connected successfully.`, type: "success" });
    } catch (err) {
      setMessage({ text: "Failed to link coding platform.", type: "error" });
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  // Trigger disconnect modal
  const handleDisconnectClick = (platform: string) => {
    setDisconnectModal({ isOpen: true, platform });
  };

  // Perform actual disconnect action
  const confirmDisconnect = async () => {
    const platform = disconnectModal.platform;
    if (!platform || !user) return;
    
    // Reset state locally
    if (platform === "leetcode") setLeetcodeUser("");
    if (platform === "codeforces") setCodeforcesUser("");
    if (platform === "codechef") setCodechefUser("");
    if (platform === "unstop") setUnstopUser("");
    if (platform === "hack2skill") setHack2skillUser("");

    setDisconnectModal({ isOpen: false, platform: "" });
    await handleSavePlatform(platform, "");
  };



  // Heatmap helper: Generate 53 columns x 7 rows mapping to actual calendar dates
  const renderHeatmap = () => {
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
    const cells: { dateStr: string; level: number; dateLabel: string }[] = [];
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
      const now = new Date();
      endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
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

      const dateLabel = cellDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
      });

      cells.push({
        dateStr: dateKey,
        level,
        dateLabel: `${dateLabel}: ${count} submission${count !== 1 ? "s" : ""}`
      });
    }

    // Group the 371 cells into chronological month blocks
    interface Week {
      cells: {
        dateStr: string;
        level: number;
        dateLabel: string;
      }[];
    }

    interface MonthBlock {
      monthName: string;
      monthYearKey: string;
      weeks: Week[];
    }

    const monthBlocks: MonthBlock[] = [];
    let currentBlock: MonthBlock | null = null;

    for (let w = 0; w < 53; w++) {
      const weekCells = [];
      for (let d = 0; d < 7; d++) {
        const cellIdx = w * 7 + d;
        weekCells.push(cells[cellIdx]);
      }

      // Determine which month this week belongs to based on the middle day (Wednesday)
      const weekDate = new Date(startDate.getTime());
      weekDate.setDate(startDate.getDate() + w * 7 + 3);
      
      const monthName = weekDate.toLocaleDateString("en-US", { month: "short" });
      const monthYearKey = `${weekDate.getFullYear()}-${weekDate.getMonth()}`;

      if (!currentBlock || currentBlock.monthYearKey !== monthYearKey) {
        currentBlock = {
          monthName,
          monthYearKey,
          weeks: []
        };
        monthBlocks.push(currentBlock);
      }

      currentBlock.weeks.push({ cells: weekCells });
    }

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
            <span className="text-txt-muted text-xs cursor-pointer select-none" title="Information">ⓘ</span>
          </div>
          <div className="flex items-center gap-4 font-mono text-[10px] text-txt-muted">
            <span>Total active days: <strong className="text-txt-main font-bold">{totalActiveDays}</strong></span>
            <span>Max streak: <strong className="text-txt-main font-bold">{maxStreak}</strong></span>
            
            {/* Year Dropdown Filter matching LeetCode ref image layout */}
            {stats.leetcode?.activeYears && stats.leetcode.activeYears.length > 0 && (
              <div className="relative bg-bg-card hover:bg-bg-card/80 text-txt-main px-2.5 py-1 rounded border border-border-main/60 cursor-pointer transition-all select-none text-[9px] font-sans flex items-center pr-5">
                <select
                  value={selectedLcYear || ""}
                  onChange={(e) => setSelectedLcYear(e.target.value ? parseInt(e.target.value) : null)}
                  className="bg-transparent border-none outline-none cursor-pointer text-txt-main font-semibold appearance-none w-full py-0.5 [&::-ms-expand]:hidden pr-1"
                >
                  <option value="" className="bg-bg-surface text-txt-main">Current</option>
                  {stats.leetcode.activeYears.map((y) => (
                    <option key={y} value={y} className="bg-bg-surface text-txt-main">{y}</option>
                  ))}
                </select>
                <span className="text-[7px] pointer-events-none absolute right-2">▼</span>
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
          <div className="flex gap-2 items-start select-none min-w-max pb-1 px-4">
            {monthBlocks.map((block, bIdx) => (
              <div key={bIdx} className="flex flex-col gap-2">
                {/* Cells for this month */}
                <div className="flex gap-1">
                  {block.weeks.map((week, wIdx) => (
                    <div key={wIdx} className="flex flex-col gap-1 w-2.5">
                      {week.cells.map((cell, cIdx) => {
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
                <div className="text-[9px] font-mono text-txt-muted text-center h-3 select-none">
                  {block.monthName}
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
    <div className="h-screen overflow-hidden flex flex-col font-sans selection:bg-accent-main selection:text-bg-base">
      
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
        <div className="flex flex-col gap-2 border-b border-border-main/40 pb-4">
          <span className="font-mono text-[9px] uppercase tracking-widest text-txt-muted">Integrations Center</span>
          <h1 className="font-display text-3xl font-light tracking-tight text-txt-main">Coding Deck & Platforms</h1>
          <p className="text-xs text-txt-sub">Link your developer profiles across competitive coding and hackathon platforms to sync stats.</p>
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
                    <span className="w-8 h-8 rounded-md bg-bg-card border border-border-main/60 flex items-center justify-center text-[#ffa116]">
                      <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
                        <path d="M13.483 0a1.374 1.374 0 0 0-.961.438L7.116 6.226l-3.854 4.126a5.266 5.266 0 0 0-1.209 2.104 5.35 5.35 0 0 0-.125.513 5.527 5.527 0 0 0 .062 2.362 5.83 5.83 0 0 0 .349 1.017 5.938 5.938 0 0 0 1.271 1.818l4.277 4.193.039.038c2.248 2.165 5.852 2.133 8.063-.074l2.396-2.392c.54-.54.54-1.414.003-1.955a1.378 1.378 0 0 0-1.955-.003l-2.388 2.385c-2.278 2.183-5.83 2.211-8.122.062l-.004-.004L4.35 13.559a4.444 4.444 0 0 1 .135-2.091 4.364 4.364 0 0 1 1.023-1.78l3.853-4.126 5.406-5.788a1.374 1.374 0 0 0-.961-.438 1.374 1.374 0 0 0-.323.04z" />
                      </svg>
                    </span>
                    <div className="flex flex-col">
                      <h3 className="text-sm font-semibold text-txt-main">LeetCode Profile</h3>
                      <span className="text-[10px] text-txt-muted">Sync solve tallies & activity heatmap</span>
                    </div>
                  </div>

                  {!editLeetcode && leetcodeUser && (
                    <div className="flex gap-3">
                      <button 
                        onClick={() => setEditLeetcode(true)}
                        className="text-[10px] font-mono text-txt-muted hover:text-txt-main underline cursor-pointer"
                      >
                        Update Handle
                      </button>
                      <button 
                        onClick={() => handleDisconnectClick("leetcode")}
                        className="text-[10px] font-mono text-red-500 hover:text-red-600 hover:underline cursor-pointer"
                      >
                        Disconnect
                      </button>
                    </div>
                  )}
                </div>

                {!leetcodeUser || editLeetcode ? (
                  <div className="flex flex-col sm:flex-row gap-3 items-end pt-2">
                    <div className="flex-grow flex flex-col gap-1 w-full">
                      <label className="text-[10px] text-txt-sub font-semibold">LeetCode Profile Link / Username</label>
                      <input 
                        type="text" 
                        defaultValue={leetcodeUser ? `https://leetcode.com/${leetcodeUser}` : ""}
                        id="leetcode-username-input"
                        placeholder="e.g. https://leetcode.com/mirasen_code"
                        className="h-10 px-3 border border-border-main/80 bg-bg-base text-txt-main rounded-sm text-xs placeholder:text-txt-muted/50 focus:outline-none focus:border-txt-main font-mono w-full"
                      />
                    </div>
                    <div className="flex gap-2">
                      {editLeetcode && (
                        <button 
                          onClick={() => setEditLeetcode(false)}
                          className="h-10 px-3 border border-border-main hover:bg-bg-card text-txt-main text-xs uppercase font-mono rounded-sm transition-colors cursor-pointer"
                        >
                          Cancel
                        </button>
                      )}
                      <button 
                        onClick={() => {
                          const rawVal = (document.getElementById("leetcode-username-input") as HTMLInputElement)?.value || "";
                          const extracted = extractUsername("leetcode", rawVal);
                          setLeetcodeUser(extracted);
                          handleSavePlatform("leetcode", extracted);
                        }}
                        disabled={saving}
                        className="h-10 px-4 bg-accent-main text-bg-base text-xs uppercase font-semibold rounded-sm hover:opacity-90 transition-opacity cursor-pointer"
                      >
                        {saving ? "Saving..." : "Connect"}
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
                     {/* Stats stats */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                      
                      <div className="border border-border-main/60 bg-bg-base/30 p-3 rounded flex flex-col gap-1">
                        <span className="text-[10px] font-mono text-txt-muted uppercase">Solved Problems</span>
                        <span className="text-xl font-semibold text-txt-main font-display">{stats.leetcode?.solved ?? 0}</span>
                        <span className="text-[9px] text-txt-sub font-mono">
                          {stats.leetcode 
                            ? `E: ${stats.leetcode.solvedEasy} | M: ${stats.leetcode.solvedMedium} | H: ${stats.leetcode.solvedHard}`
                            : "E: 0 | M: 0 | H: 0"}
                        </span>
                      </div>

                      <div className="border border-border-main/60 bg-bg-base/30 p-3 rounded flex flex-col gap-1">
                        <span className="text-[10px] font-mono text-txt-muted uppercase">Submissions</span>
                        <span className="text-xl font-semibold text-txt-main font-display">{(stats.leetcode as any)?.totalSubmissions ?? 0}</span>
                        <span className="text-[9px] text-txt-sub font-mono">
                          {stats.leetcode 
                            ? `E: ${(stats.leetcode as any).totalEasySubmissions ?? 0} | M: ${(stats.leetcode as any).totalMediumSubmissions ?? 0} | H: ${(stats.leetcode as any).totalHardSubmissions ?? 0}`
                            : "E: 0 | M: 0 | H: 0"}
                        </span>
                      </div>

                      <div className="border border-border-main/60 bg-bg-base/30 p-3 rounded flex flex-col gap-1">
                        <span className="text-[10px] font-mono text-txt-muted uppercase">Acceptance Rate</span>
                        <span className="text-xl font-semibold text-txt-main font-display">
                          {((stats.leetcode as any)?.totalSubmissions 
                            ? (((stats.leetcode as any)?.acceptedSubmissions / (stats.leetcode as any)?.totalSubmissions) * 100).toFixed(1)
                            : "0.0")}%
                        </span>
                        <span className="text-[9px] text-txt-sub font-mono">Correct solves ratio</span>
                      </div>

                      <div className="border border-border-main/60 bg-bg-base/30 p-3 rounded flex flex-col gap-1">
                        <span className="text-[10px] font-mono text-txt-muted uppercase">Global Rank</span>
                        <span className="text-xl font-semibold text-txt-main font-display">
                          {stats.leetcode?.globalRank ? `#${stats.leetcode.globalRank.toLocaleString()}` : "N/A"}
                        </span>
                        <span className="text-[9px] text-txt-sub font-mono">{stats.leetcode?.rank || "N/A"}</span>
                      </div>

                      <div className="border border-border-main/60 bg-bg-base/30 p-3 rounded flex flex-col gap-1">
                        <span className="text-[10px] font-mono text-txt-muted uppercase">Contest Rating</span>
                        <span className="text-xl font-semibold text-txt-main font-display">{stats.leetcode?.rating ?? "N/A"}</span>
                        <span className="text-[9px] text-txt-sub font-mono">Active Tier</span>
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
                      <svg viewBox="0 0 24 24" className="w-4.5 h-4.5" fill="currentColor">
                        <path d="M11.2574.0039c-.37.0101-.7353.041-1.1003.095C9.6164.153 9.0766.4236 8.482.694c-.757.3244-1.5147.6486-2.2176.7027-1.1896.3785-1.568.919-1.8925 1.3516 0 .054-.054.1079-.054.1079-.4325.865-.4873 1.73-.325 2.5952.1621.5407.3786 1.0282.5408 1.5148.3785 1.0274.7578 2.0007.92 3.1362.1622.3244.3235.7571.4316 1.1897.2704.8651.542 1.8383 1.353 2.5952l.0057-.0028c.0175.0183.0301.0387.0482.0568.0072-.0036.0141-.0063.0213-.0099l-.0213-.5849c.6489-.9733 1.5673-1.6221 2.865-1.8925.5195-.1093 1.081-.1497 1.6625-.1278a8.7733 8.7733 0 0 1 1.7988.2357c1.4599.3785 2.595 1.1358 2.6492 1.7846.0273.3549.0398.6952.0326 1.0364-.001.064-.0046.1285-.007.193l.1362.0682c.075-.0375.1424-.107.2059-.1902.0008-.001.002-.002.0028-.0028.0018-.0023.0039-.0061.0057-.0085.0396-.0536.0747-.1236.1107-.1931.0188-.0377.0372-.0866.0554-.1292.2048-.4622.362-1.1536.538-1.9635.0541-.2703.1092-.4864.1633-.7027.4326-.9733 1.0266-1.8382 1.6213-2.6492.9733-1.3518 1.8928-2.5962 1.7846-4.0561-1.784-3.4608-4.2718-4.0017-5.5695-4.272-.2163-.0541-.3233-.0539-.4856-.108-1.3382-.2433-2.4945-.3953-3.6046-.3648zm5.0428 14.3788a9.8602 9.8602 0 0 0-.0326-.9824c-.0541-.703-1.1892-1.46-2.7032-1.8386-.588-.1336-1.1764-.2142-1.7448-.2356-.539-.0137-1.0657.0248-1.5546.1277-1.2436.2704-2.2162.9193-2.811 1.8925l.0511 1.431c.6672-.3558 1.7326-.8747 3.139-.9994.0662-.0059.1368-.0059.2044-.0099.1177-.013.2667-.044.4444-.044 1.6075 0 3.2682.5336 4.8767 1.6483.039-.2744.0611-.549.071-.8234l.044.0227c.0028-.0622.0143-.1268.0156-.1888zM11.256.0578c.1239-.0034.2538.01.379.0114-.23-.0022-.4588.0026-.6871.0156.103-.0061.2046-.0242.308-.027zm.4983.0156c.6552.014 1.3255.0711 2.0387.1803-.6834-.0987-1.3646-.1671-2.0387-.1803zm-1.3147.0554c-.076.0087-.1527.0133-.2285.0241-.8168.1167-1.7742.7015-2.75 1.045.3545-.1323.7143-.2957 1.0747-.4501C9.0765.4774 9.6705.207 .999z" />
                      </svg>
                    </span>
                    <div className="flex flex-col">
                      <h3 className="text-sm font-semibold text-txt-main">CodeChef Profile</h3>
                      <span className="text-[10px] text-txt-muted">Track rating divisions & stars</span>
                    </div>
                  </div>

                  {!editCodechef && codechefUser && (
                    <div className="flex gap-3">
                      <button 
                        onClick={() => setEditCodechef(true)}
                        className="text-[10px] font-mono text-txt-muted hover:text-txt-main underline cursor-pointer"
                      >
                        Update Handle
                      </button>
                      <button 
                        onClick={() => handleDisconnectClick("codechef")}
                        className="text-[10px] font-mono text-red-500 hover:text-red-600 hover:underline cursor-pointer"
                      >
                        Disconnect
                      </button>
                    </div>
                  )}
                </div>

                {!codechefUser || editCodechef ? (
                  <div className="flex flex-col sm:flex-row gap-3 items-end pt-2">
                    <div className="flex-grow flex flex-col gap-1 w-full">
                      <label className="text-[10px] text-txt-sub font-semibold">CodeChef Profile Link / Username</label>
                      <input 
                        type="text" 
                        defaultValue={codechefUser ? `https://www.codechef.com/users/${codechefUser}` : ""}
                        id="codechef-username-input"
                        placeholder="e.g. https://www.codechef.com/users/mirasen_cc"
                        className="h-10 px-3 border border-border-main/80 bg-bg-base text-txt-main rounded-sm text-xs placeholder:text-txt-muted/50 focus:outline-none focus:border-txt-main font-mono w-full"
                      />
                    </div>
                    <div className="flex gap-2">
                      {editCodechef && (
                        <button 
                          onClick={() => setEditCodechef(false)}
                          className="h-10 px-3 border border-border-main hover:bg-bg-card text-txt-main text-xs uppercase font-mono rounded-sm transition-colors cursor-pointer"
                        >
                          Cancel
                        </button>
                      )}
                      <button 
                        onClick={() => {
                          const rawVal = (document.getElementById("codechef-username-input") as HTMLInputElement)?.value || "";
                          const extracted = extractUsername("codechef", rawVal);
                          setCodechefUser(extracted);
                          handleSavePlatform("codechef", extracted);
                        }}
                        disabled={saving}
                        className="h-10 px-4 bg-accent-main text-bg-base text-xs uppercase font-semibold rounded-sm hover:opacity-90 transition-opacity cursor-pointer"
                      >
                        {saving ? "Saving..." : "Connect"}
                      </button>
                    </div>
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

                  {!editCodeforces && codeforcesUser && (
                    <div className="flex gap-3">
                      <button 
                        onClick={() => setEditCodeforces(true)}
                        className="text-[10px] font-mono text-txt-muted hover:text-txt-main underline cursor-pointer"
                      >
                        Update Handle
                      </button>
                      <button 
                        onClick={() => handleDisconnectClick("codeforces")}
                        className="text-[10px] font-mono text-red-500 hover:text-red-600 hover:underline cursor-pointer"
                      >
                        Disconnect
                      </button>
                    </div>
                  )}
                </div>

                {!codeforcesUser || editCodeforces ? (
                  <div className="flex flex-col sm:flex-row gap-3 items-end pt-2">
                    <div className="flex-grow flex flex-col gap-1 w-full">
                      <label className="text-[10px] text-txt-sub font-semibold">Codeforces Profile Link / Username</label>
                      <input 
                        type="text" 
                        defaultValue={codeforcesUser ? `https://codeforces.com/profile/${codeforcesUser}` : ""}
                        id="codeforces-username-input"
                        placeholder="e.g. https://codeforces.com/profile/mirasen_cf"
                        className="h-10 px-3 border border-border-main/80 bg-bg-base text-txt-main rounded-sm text-xs placeholder:text-txt-muted/50 focus:outline-none focus:border-txt-main font-mono w-full"
                      />
                    </div>
                    <div className="flex gap-2">
                      {editCodeforces && (
                        <button 
                          onClick={() => setEditCodeforces(false)}
                          className="h-10 px-3 border border-border-main hover:bg-bg-card text-txt-main text-xs uppercase font-mono rounded-sm transition-colors cursor-pointer"
                        >
                          Cancel
                        </button>
                      )}
                      <button 
                        onClick={() => {
                          const rawVal = (document.getElementById("codeforces-username-input") as HTMLInputElement)?.value || "";
                          const extracted = extractUsername("codeforces", rawVal);
                          setCodeforcesUser(extracted);
                          handleSavePlatform("codeforces", extracted);
                        }}
                        disabled={saving}
                        className="h-10 px-4 bg-accent-main text-bg-base text-xs uppercase font-semibold rounded-sm hover:opacity-90 transition-opacity cursor-pointer"
                      >
                        {saving ? "Saving..." : "Connect"}
                      </button>
                    </div>
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
              
              {/* Unstop / Hack2Skill Panel */}
              <div className="border border-border-main/70 bg-bg-surface p-6 rounded-md flex flex-col gap-4">
                <span className="font-mono text-[9px] uppercase tracking-widest text-txt-muted font-bold">Hackathon Portals</span>
                
                {/* Unstop */}
                <div className="border-b border-border-main/40 pb-3 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-txt-main">Unstop Integrations</span>
                    {!unstopUser && !editUnstop && (
                      <button onClick={() => setEditUnstop(true)} className="text-[9px] text-accent-main font-mono uppercase font-bold cursor-pointer">Link</button>
                    )}
                  </div>

                  {unstopUser && !editUnstop ? (
                    <div className="flex justify-between items-center text-[10px] font-mono text-txt-sub">
                      <div className="flex items-center gap-2">
                        <span>@{unstopUser}</span>
                        <button
                          onClick={() => setEditUnstop(true)}
                          className="text-[8px] text-txt-muted hover:text-txt-main underline cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDisconnectClick("unstop")}
                          className="text-[8px] text-red-500 hover:text-red-600 underline cursor-pointer"
                        >
                          Disconnect
                        </button>
                      </div>
                      <span className="text-[9px] bg-bg-card px-2 py-0.5 border border-border-main/80 rounded">{stats.unstop?.registered} Applied</span>
                    </div>
                  ) : editUnstop ? (
                    <div className="flex gap-2 items-center">
                      <input 
                        type="text" 
                        defaultValue={unstopUser ? `https://unstop.com/u/${unstopUser}` : ""}
                        id="unstop-username-input"
                        placeholder="Unstop Link / Handle"
                        className="h-8 flex-1 px-2 border border-border-main bg-bg-base text-xs font-mono text-txt-main focus:outline-none"
                      />
                      <button
                        onClick={() => setEditUnstop(false)}
                        className="h-8 px-2 border border-border-main text-txt-main text-[10px] uppercase font-mono cursor-pointer hover:bg-bg-card"
                      >
                        X
                      </button>
                      <button 
                        onClick={() => {
                          const rawVal = (document.getElementById("unstop-username-input") as HTMLInputElement)?.value || "";
                          const extracted = extractUsername("unstop", rawVal);
                          setUnstopUser(extracted);
                          handleSavePlatform("unstop", extracted);
                        }}
                        className="h-8 px-3 bg-accent-main text-bg-base text-[10px] uppercase font-mono font-bold cursor-pointer"
                      >
                        Save
                      </button>
                    </div>
                  ) : (
                    <span className="text-[10px] text-txt-muted italic font-light">Link Unstop to fetch hackathon standings.</span>
                  )}
                </div>

                {/* Hack2Skill */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-txt-main">Hack2Skill Integrations</span>
                    {!hack2skillUser && !editHack2skill && (
                      <button onClick={() => setEditHack2skill(true)} className="text-[9px] text-accent-main font-mono uppercase font-bold cursor-pointer">Link</button>
                    )}
                  </div>

                  {hack2skillUser && !editHack2skill ? (
                    <div className="flex justify-between items-center text-[10px] font-mono text-txt-sub">
                      <div className="flex items-center gap-2">
                        <span>@{hack2skillUser}</span>
                        <button
                          onClick={() => setEditHack2skill(true)}
                          className="text-[8px] text-txt-muted hover:text-txt-main underline cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDisconnectClick("hack2skill")}
                          className="text-[8px] text-red-500 hover:text-red-600 underline cursor-pointer"
                        >
                          Disconnect
                        </button>
                      </div>
                      <span className="text-[9px] bg-bg-card px-2 py-0.5 border border-border-main/80 rounded">{stats.hack2skill?.registered} Applied</span>
                    </div>
                  ) : editHack2skill ? (
                    <div className="flex gap-2 items-center">
                      <input 
                        type="text" 
                        defaultValue={hack2skillUser ? `https://hack2skill.com/u/${hack2skillUser}` : ""}
                        id="hack2skill-username-input"
                        placeholder="Hack2Skill Link / Handle"
                        className="h-8 flex-1 px-2 border border-border-main bg-bg-base text-xs font-mono text-txt-main focus:outline-none"
                      />
                      <button
                        onClick={() => setEditHack2skill(false)}
                        className="h-8 px-2 border border-border-main text-txt-main text-[10px] uppercase font-mono cursor-pointer hover:bg-bg-card"
                      >
                        X
                      </button>
                      <button 
                        onClick={() => {
                          const rawVal = (document.getElementById("hack2skill-username-input") as HTMLInputElement)?.value || "";
                          const extracted = extractUsername("hack2skill", rawVal);
                          setHack2skillUser(extracted);
                          handleSavePlatform("hack2skill", extracted);
                        }}
                        className="h-8 px-3 bg-accent-main text-bg-base text-[10px] uppercase font-mono font-bold cursor-pointer"
                      >
                        Save
                      </button>
                    </div>
                  ) : (
                    <span className="text-[10px] text-txt-muted italic font-light">Link Hack2Skill to fetch college hackathon credentials.</span>
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

      {/* Custom Disconnect Confirmation Modal */}
      {disconnectModal.isOpen && (
        <div className="fixed inset-0 z-[15000] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" 
            onClick={() => setDisconnectModal({ isOpen: false, platform: "" })}
          />
          
          {/* Modal Container */}
          <div className="relative w-full max-w-sm border border-border-main/80 bg-bg-surface p-6 rounded-md shadow-2xl animate-fade-in flex flex-col gap-5 z-10">
            <div className="flex flex-col gap-2">
              <span className="font-mono text-[9px] uppercase tracking-widest text-red-500 font-bold">Revoke Connection</span>
              <h3 className="text-sm font-semibold text-txt-main">Disconnect Profile?</h3>
              <p className="text-xs text-txt-muted font-light leading-relaxed">
                Are you sure you want to disconnect your <span className="font-mono font-semibold text-txt-main">{disconnectModal.platform.toUpperCase()}</span> handle? You will lose immediate access to synced metrics and scoreboards.
              </p>
            </div>
            
            <div className="flex justify-end gap-3 font-mono text-[10px] uppercase tracking-wider">
              <button
                onClick={() => setDisconnectModal({ isOpen: false, platform: "" })}
                className="px-4 py-2.5 border border-border-main hover:bg-bg-card text-txt-main rounded-sm transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmDisconnect}
                className="px-4 py-2.5 bg-red-600 text-white rounded-sm hover:bg-red-700 transition-colors cursor-pointer font-bold"
              >
                Disconnect
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
