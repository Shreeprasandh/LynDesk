"use client";

import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import AppliedHackathonsModal from "../components/coding-desk/AppliedHackathonsModal";
import LynDeskLoadingCard from "../components/LynDeskLoadingCard";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Link from "next/link";
import { normalizeTitleCase } from "../lib/textNormalization";
import { 
  ArrowLeft, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle, 
  TrendingUp,
  Sparkles,
  Flame,
  RotateCw,
  FolderKanban,
  Lock,
  ChevronDown,
  ChevronUp,
  Puzzle,
  BookOpen,
  X
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
    hasSolvedToday?: boolean;
    isStreakMaintained?: boolean;
  } | null;
  hasSolvedToday?: boolean;
  isStreakMaintained?: boolean;
  leetcodeStreak?: number;
  activeYears?: number[];
}

export default function CodingDeckPage() {
  const { user, loading: authLoading } = useAuth();
  // Smart cache-aware initial loading state: 0ms instant render if cached data exists
  const [loading, setLoading] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const cached = localStorage.getItem("ldk_coding_desk_stats_cache");
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (parsed && (parsed.leetcode || parsed.codeforces || parsed.codechef || parsed.geeksforgeeks || parsed.hackerrank)) {
            return false;
          }
        } catch {}
      }
    }
    return true;
  });
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

  // Platform usernames - instant 0ms cache initialization
  const [leetcodeUser, setLeetcodeUser] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("ldk_leetcode_handle") || "";
    }
    return "";
  });
  const [codeforcesUser, setCodeforcesUser] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("ldk_codeforces_handle") || "";
    }
    return "";
  });
  const [codechefUser, setCodechefUser] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("ldk_codechef_handle") || "";
    }
    return "";
  });
  const [hackerrankUser, setHackerrankUser] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("ldk_hackerrank_handle") || "";
    }
    return "";
  });
  const [geeksforgeeksUser, setGeeksforgeeksUser] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("ldk_geeksforgeeks_handle") || "";
    }
    return "";
  });
  const [unstopUser, setUnstopUser] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("ldk_unstop_handle") || "";
    }
    return "";
  });
  const [hack2skillUser, setHack2skillUser] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("ldk_hack2skill_handle") || "";
    }
    return "";
  });
  const [showAppliedModal, setShowAppliedModal] = useState(false);
  const [showAllContests, setShowAllContests] = useState(false);
  const [showLeetieGuide, setShowLeetieGuide] = useState(false);
  const [showHandleModal, setShowHandleModal] = useState(false);
  const [inputHackerrankHandle, setInputHackerrankHandle] = useState("");
  const [inputGfgHandle, setInputGfgHandle] = useState("");
  const [inputUnstopHandle, setInputUnstopHandle] = useState("");
  const [inputH2sHandle, setInputH2sHandle] = useState("");
  const [savingHandles, setSavingHandles] = useState(false);
  const [realAppliedCounts, setRealAppliedCounts] = useState({ total: 0, unstop: 0, hack2skill: 0, devpost: 0 });

  // Inline handle input state
  const [inputLcHandle, setInputLcHandle] = useState("");

  const handleOpenHandleModal = () => {
    setInputHackerrankHandle(hackerrankUser || "");
    setInputGfgHandle(geeksforgeeksUser || "");
    setInputUnstopHandle(unstopUser || "");
    setInputH2sHandle(hack2skillUser || "");
    setShowHandleModal(true);
  };

  const handleSaveHackathonHandles = async () => {
    if (!user) return;
    setSavingHandles(true);
    let cleanUnstop = inputUnstopHandle.trim().replace(/^@/, "");
    let cleanH2s = inputH2sHandle.trim().replace(/^@/, "");

    if (cleanUnstop.includes("/") || cleanUnstop.includes(".")) {
      try {
        const u = new URL(/^https?:\/\//i.test(cleanUnstop) ? cleanUnstop : `https://${cleanUnstop}`);
        const segs = u.pathname.split("/").filter(Boolean);
        cleanUnstop = segs[segs.length - 1] || cleanUnstop;
      } catch {}
    }
    if (cleanH2s.includes("/") || cleanH2s.includes(".")) {
      try {
        const u = new URL(/^https?:\/\//i.test(cleanH2s) ? cleanH2s : `https://${cleanH2s}`);
        const segs = u.pathname.split("/").filter(Boolean);
        cleanH2s = segs[segs.length - 1] || cleanH2s;
      } catch {}
    }

    setUnstopUser(cleanUnstop);
    setHack2skillUser(cleanH2s);

    if (typeof window !== "undefined") {
      localStorage.setItem("ldk_unstop_handle", cleanUnstop);
      localStorage.setItem("ldk_hack2skill_handle", cleanH2s);
      if (user.id) {
        localStorage.setItem(`ldk_unstop_handle_${user.id}`, cleanUnstop);
        localStorage.setItem(`ldk_hack2skill_handle_${user.id}`, cleanH2s);
      }
    }

    try {
      await supabase.from("profiles").update({
        unstop_username: cleanUnstop || null,
        hack2skill_username: cleanH2s || null
      }).eq("id", user.id);
    } catch (e) {
      console.warn("Hackathon handle save error:", e);
    } finally {
      setSavingHandles(false);
      setShowHandleModal(false);
    }
  };

  const handleSaveInlineHandle = async () => {
    if (!inputLcHandle.trim()) return;
    let cleanHandle = inputLcHandle.trim().replace(/^@/, "");
    if (cleanHandle.includes("/") || cleanHandle.includes(".")) {
      try {
        const urlString = /^https?:\/\//i.test(cleanHandle) ? cleanHandle : `https://${cleanHandle}`;
        const url = new URL(urlString);
        const pathSegments = url.pathname.split("/").filter(Boolean);
        if (pathSegments[0] === "u" && pathSegments[1]) {
          cleanHandle = pathSegments[1];
        } else if (pathSegments[0] && pathSegments[0] !== "u" && pathSegments[0] !== "problems" && pathSegments[0] !== "contest") {
          cleanHandle = pathSegments[0];
        }
      } catch {}
    }
    setLeetcodeUser(cleanHandle);
    setInputLcHandle(cleanHandle);
    if (typeof window !== "undefined") {
      localStorage.setItem("ldk_leetcode_handle", cleanHandle);
      if (user?.id) localStorage.setItem(`ldk_leetcode_handle_${user.id}`, cleanHandle);
    }

    if (user) {
      try {
        await supabase.auth.updateUser({
          data: { ...user.user_metadata, leetcode_username: cleanHandle }
        });
      } catch {}
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

  // Platforms stats with 0ms SWR Cache Initialization
  const [stats, setStats] = useState<{
    leetcode: PlatformStats | null;
    codechef: PlatformStats | null;
    hackerrank: PlatformStats | null;
    geeksforgeeks: PlatformStats | null;
    codeforces: PlatformStats | null;
    unstop: { registered: number; completed: number; rank: number } | null;
    hack2skill: { registered: number; completed: number; rank: number } | null;
  }>(() => {
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem("ldk_coding_desk_stats_cache");
        if (cached) return JSON.parse(cached);
      } catch {}
    }
    return {
      leetcode: null,
      codechef: null,
      hackerrank: null,
      geeksforgeeks: null,
      codeforces: null,
      unstop: null,
      hack2skill: null,
    };
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
    const challengeDate = stats.leetcode?.dailyChallenge?.date || new Date().toISOString().split("T")[0];
    const storageKey = `ldk_seen_daily_banner_${challengeDate}`;

    if (isCompleted === true) {
      if (typeof window !== "undefined" && sessionStorage.getItem(storageKey)) {
        queueMicrotask(() => {
          setShowSuccessBanner(false);
          setPrevCompleted(true);
        });
        return;
      }

      if (prevCompleted === false) {
        queueMicrotask(() => {
          setShowSuccessBanner(true);
          setPrevCompleted(true);
        });
        if (typeof window !== "undefined") {
          sessionStorage.setItem(storageKey, "true");
        }
      } else if (prevCompleted === null) {
        if (typeof window !== "undefined" && !sessionStorage.getItem(storageKey)) {
          queueMicrotask(() => {
            setShowSuccessBanner(true);
            setPrevCompleted(true);
          });
          sessionStorage.setItem(storageKey, "true");
        } else {
          queueMicrotask(() => {
            setPrevCompleted(true);
          });
        }
      }
    } else if (isCompleted === false) {
      queueMicrotask(() => {
        setPrevCompleted(false);
      });
    }
  }, [stats.leetcode?.dailyChallenge?.completed, stats.leetcode?.dailyChallenge?.date, prevCompleted]);

  // Auto-hide Daily Challenge Verified banner after exactly 10 seconds & persist dismissal state
  useEffect(() => {
    if (showSuccessBanner) {
      const challengeDate = stats.leetcode?.dailyChallenge?.date || new Date().toISOString().split("T")[0];
      const storageKey = `ldk_seen_daily_banner_${challengeDate}`;
      if (typeof window !== "undefined") {
        sessionStorage.setItem(storageKey, "true");
      }
      const timer = setTimeout(() => {
        setShowSuccessBanner(false);
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [showSuccessBanner, stats.leetcode?.dailyChallenge?.date]);

  // Load platform details from Supabase Auth user metadata & localStorage
  useEffect(() => {
    const loadPlatformData = async () => {
      try {
        if (isFirstLoadRef.current) {
          setLoading(true);
          isFirstLoadRef.current = false;
        }
        const meta = user?.user_metadata || {};
        
        const userLcKey = user?.id ? `ldk_leetcode_handle_${user.id}` : "ldk_leetcode_handle";
        const userCcKey = user?.id ? `ldk_codechef_handle_${user.id}` : "ldk_codechef_handle";
        const userHrKey = user?.id ? `ldk_hackerrank_handle_${user.id}` : "ldk_hackerrank_handle";
        const userGfgKey = user?.id ? `ldk_geeksforgeeks_handle_${user.id}` : "ldk_geeksforgeeks_handle";
        const userCfKey = user?.id ? `ldk_codeforces_handle_${user.id}` : "ldk_codeforces_handle";
        const userUnKey = user?.id ? `ldk_unstop_handle_${user.id}` : "ldk_unstop_handle";
        const userH2sKey = user?.id ? `ldk_hack2skill_handle_${user.id}` : "ldk_hack2skill_handle";

        const localLc = typeof window !== "undefined" ? (localStorage.getItem(userLcKey) || localStorage.getItem("ldk_leetcode_handle") || "") : "";
        const localCc = typeof window !== "undefined" ? (localStorage.getItem(userCcKey) || localStorage.getItem("ldk_codechef_handle") || "") : "";
        const localHr = typeof window !== "undefined" ? (localStorage.getItem(userHrKey) || localStorage.getItem("ldk_hackerrank_handle") || "") : "";
        const localGfg = typeof window !== "undefined" ? (localStorage.getItem(userGfgKey) || localStorage.getItem("ldk_geeksforgeeks_handle") || "") : "";
        const localCf = typeof window !== "undefined" ? (localStorage.getItem(userCfKey) || localStorage.getItem("ldk_codeforces_handle") || "") : "";
        const localUn = typeof window !== "undefined" ? (localStorage.getItem(userUnKey) || localStorage.getItem("ldk_unstop_handle") || "") : "";
        const localH2s = typeof window !== "undefined" ? (localStorage.getItem(userH2sKey) || localStorage.getItem("ldk_hack2skill_handle") || "") : "";

        const lc = meta.leetcode_username || localLc;
        const cc = meta.codechef_username || localCc;
        const hr = meta.hackerrank_username || localHr;
        const gfg = meta.geeksforgeeks_username || localGfg;
        const cf = meta.codeforces_username || localCf;
        const un = meta.unstop_username || localUn;
        const h2s = meta.hack2skill_username || localH2s;

        setLeetcodeUser(lc);
        setCodechefUser(cc);
        setHackerrankUser(hr);
        setGeeksforgeeksUser(gfg);
        setCodeforcesUser(cf);
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

        const [leetcodeStats, codechefStats, hackerrankStats, geeksforgeeksStats, codeforcesStats, unstopStats] = await Promise.all([
          fetchStats("leetcode", lc, selectedLcYear),
          fetchStats("codechef", cc),
          fetchStats("hackerrank", hr),
          fetchStats("geeksforgeeks", gfg),
          fetchStats("codeforces", cf),
          fetchStats("unstop", un)
        ]);

        let realUnstopCount = 0;
        let realH2sCount = 0;
        let realDevpostCount = 0;
        let realTotalCount = 0;

        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
            const appRes = await fetch("/api/user/applied-hackathons", {
              headers: { Authorization: `Bearer ${session.access_token}` }
            });
            if (appRes.ok) {
              const appData = await appRes.json();
              const apps = appData.applications || [];
              realTotalCount = apps.length;
              realUnstopCount = apps.filter((a: any) => a.portal === "Unstop").length;
              realH2sCount = apps.filter((a: any) => a.portal === "Hack2Skill").length;
              realDevpostCount = apps.filter((a: any) => a.portal === "Devpost").length;
              setRealAppliedCounts({
                total: realTotalCount,
                unstop: realUnstopCount,
                hack2skill: realH2sCount,
                devpost: realDevpostCount
              });
            }
          }
        } catch {}

        const updatedStats = {
          leetcode: leetcodeStats,
          codechef: codechefStats,
          hackerrank: hackerrankStats,
          geeksforgeeks: geeksforgeeksStats,
          codeforces: codeforcesStats,
          unstop: unstopStats || (un ? { participations: realUnstopCount, points: 0, badgesCount: 0, certificatesCount: 0 } : null),
          hack2skill: h2s ? { registered: realH2sCount, completed: 0, rank: 0 } : null,
        };

        if (typeof window !== "undefined") {
          try {
            localStorage.setItem("ldk_coding_desk_stats_cache", JSON.stringify(updatedStats));
            if (leetcodeStats) {
              localStorage.setItem("ldk_last_active_coding_stats", JSON.stringify(leetcodeStats));
            }
            if (user?.id && leetcodeStats) {
              localStorage.setItem(`ldk_coding_stats_${user.id}`, JSON.stringify(leetcodeStats));
            }
          } catch {}
        }

        // Auto-manage streak warning notification in global header drawer for daily challenge
        if (leetcodeStats?.dailyChallenge) {
          const todayStr = new Date().toISOString().split("T")[0];
          const notifId = `notif_streak_warning_${todayStr}`;
          const title = leetcodeStats.dailyChallenge.title || "Daily Challenge";
          const diff = leetcodeStats.dailyChallenge.difficulty || "Easy";
          const streak = leetcodeStats.leetcodeStreak || 0;
          const isDCCDone = Boolean(leetcodeStats.dailyChallenge.completed);
          const isStreakSafe = Boolean(leetcodeStats.hasSolvedToday || leetcodeStats.dailyChallenge.hasSolvedToday || leetcodeStats.dailyChallenge.isStreakMaintained);

          if (typeof window !== "undefined") {
            const userKey = user ? `ldk_user_notifications_${user.id}` : "ldk_global_notifications";
            const stored = localStorage.getItem(userKey);
            let list = stored ? JSON.parse(stored) : [];

            if (isDCCDone || isStreakSafe) {
              // If streak is already maintained today, purge streak warning alarms!
              list = list.filter((n: any) => 
                !n.id?.startsWith("notif_streak_warning_") && 
                !n.title?.includes("Streak at Risk") && 
                !n.title?.includes("LeetCode Daily Challenge Pending")
              );
              localStorage.setItem(userKey, JSON.stringify(list));
              window.dispatchEvent(new Event("ldk_notifications_update"));
            } else {
              // Only trigger urgency if 0 submissions have been made today
              const message = streak > 0 
                ? `You haven't solved any problems today. Solve a challenge now to maintain your ${streak}-day streak!`
                : `Today's daily challenge “${title}” (${diff}) is pending. Solve now to start your daily challenge streak!`;
              
              // Filter out old warning variants
              list = list.filter((n: any) => 
                !n.id?.startsWith("notif_streak_warning_") && 
                !n.title?.includes("Streak at Risk") && 
                !n.title?.includes("LeetCode Daily Challenge Pending")
              );

              list.unshift({
                id: notifId,
                title: "LeetCode Daily Challenge Pending",
                message,
                type: "deadline",
                category: "alerts",
                time: "Today",
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
        if (typeof window !== "undefined") {
          try {
            localStorage.setItem("ldk_last_active_coding_stats", JSON.stringify(updatedStats));
            if (user?.id) {
              localStorage.setItem(`ldk_coding_stats_${user.id}`, JSON.stringify(updatedStats));
            }
            window.dispatchEvent(new Event("ldk_coding_stats_update"));
          } catch {}
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
      const cc = codechefUser;
      const hr = hackerrankUser;
      const cf = codeforcesUser;

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

      const [leetcodeStats, codechefStats, hackerrankStats, codeforcesStats] = await Promise.all([
        lc ? fetchStats("leetcode", lc, selectedLcYear) : Promise.resolve(null),
        cc ? fetchStats("codechef", cc) : Promise.resolve(null),
        hr ? fetchStats("hackerrank", hr) : Promise.resolve(null),
        cf ? fetchStats("codeforces", cf) : Promise.resolve(null)
      ]);

      setStats(prev => ({
        ...prev,
        leetcode: leetcodeStats || prev.leetcode,
        codechef: codechefStats || prev.codechef,
        hackerrank: hackerrankStats || prev.hackerrank,
        codeforces: codeforcesStats || prev.codeforces,
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
        const hr = hackerrankUser;
        const gfg = geeksforgeeksUser;
        const un = unstopUser;
        
        if (!lc && !cf && !cc && !hr && !gfg && !un) return;
        
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

        const [leetcodeStats, codeforcesStats, codechefStats, hackerrankStats, gfgStats, unstopStats] = await Promise.all([
          lc ? fetchStats("leetcode", lc, selectedLcYear) : Promise.resolve(null),
          cf ? fetchStats("codeforces", cf) : Promise.resolve(null),
          cc ? fetchStats("codechef", cc) : Promise.resolve(null),
          hr ? fetchStats("hackerrank", hr) : Promise.resolve(null),
          gfg ? fetchStats("geeksforgeeks", gfg) : Promise.resolve(null),
          un ? fetchStats("unstop", un) : Promise.resolve(null),
        ]);

        setStats(prev => ({
          ...prev,
          leetcode: leetcodeStats || prev.leetcode,
          codeforces: codeforcesStats || prev.codeforces,
          codechef: codechefStats || prev.codechef,
          hackerrank: hackerrankStats || prev.hackerrank,
          geeksforgeeks: gfgStats || prev.geeksforgeeks,
          unstop: unstopStats || prev.unstop,
        }));
      };
      
      pollStats();
    }, 15000); // 15 seconds live auto-poll
    
    return () => clearInterval(interval);
  }, [user, leetcodeUser, codeforcesUser, codechefUser, hackerrankUser, geeksforgeeksUser, unstopUser, selectedLcYear]);





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
    addCalendar(stats.hackerrank?.submissionCalendar);
    addCalendar(stats.geeksforgeeks?.submissionCalendar);

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
            <span className="font-bold flex items-center gap-1">
              <Lock size={12} /> LeetCode Submission Calendar is Private:
            </span>
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

  // Upcoming active coding contests listing (dynamically synchronized with current and upcoming future dates)
  const contests = React.useMemo(() => {
    const now = new Date();

    // Next Saturday 8:00 PM IST for LeetCode Biweekly Contest
    const nextSat = new Date(now);
    nextSat.setDate(now.getDate() + ((6 - now.getDay() + 7) % 7 || 7));
    const satStr = nextSat.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

    // Next Sunday 6:35 PM IST for Codeforces Round
    const nextSun = new Date(now);
    nextSun.setDate(now.getDate() + ((0 - now.getDay() + 7) % 7 || 7));
    const sunStr = nextSun.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

    // Next Wednesday 8:00 PM IST for CodeChef Starters
    const nextWed = new Date(now);
    nextWed.setDate(now.getDate() + ((3 - now.getDay() + 7) % 7 || 7));
    const wedStr = nextWed.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

    return [
      {
        platform: "LeetCode",
        title: "Biweekly Contest 137",
        time: `${satStr} - 08:00 PM IST`,
        url: "https://leetcode.com/contest/"
      },
      {
        platform: "Codeforces",
        title: "Codeforces Round 972 (Div. 2)",
        time: `${sunStr} - 06:35 PM IST`,
        url: "https://codeforces.com/contests"
      },
      {
        platform: "CodeChef",
        title: "Starters 150",
        time: `${wedStr} - 08:00 PM IST`,
        url: "https://www.codechef.com/contests"
      },
      {
        platform: "Unstop",
        title: "Uber HackTag 2026 Hackathon",
        time: "Aug 28, 2026 - Registration Open",
        url: "https://unstop.com/hackathons/uber-hacktag-2026"
      }
    ];
  }, []);

  const hasCachedStats = typeof window !== "undefined" && !!localStorage.getItem("ldk_coding_desk_stats_cache");

  if ((authLoading || loading) && !hasCachedStats) {
    return (
      <div className="min-h-screen bg-bg-base text-txt-main flex flex-col font-sans">
        <Header />
        <main className="flex-1 flex items-center justify-center p-6">
          <LynDeskLoadingCard
            message="Syncing Coding Desk Session..."
            subtext="Authenticating developer credentials & platform integrations"
            minHeight="min-h-[420px]"
          />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-base text-txt-main flex flex-col font-sans selection:bg-accent-main selection:text-bg-base">
      
      {/* Header component */}
      <Header />

      {/* Main scrolling section */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 md:px-12 pt-6 pb-2 flex flex-col gap-6">
        
        <Link 
          href="/profile"
          className="flex items-center gap-2 text-[10px] text-txt-muted hover:text-txt-main transition-colors font-mono tracking-wider uppercase self-start"
        >
          <ArrowLeft size={12} />
          Back to Profile
        </Link>

        {/* Title Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-main/40 pb-4">
          <div className="flex flex-col gap-1 min-w-0">
            <span className="font-mono text-[9px] uppercase tracking-widest text-txt-muted">Integrations Center</span>
            <h1 className="font-display text-3xl font-light tracking-tight text-txt-main">Code Desk &amp; Platforms</h1>
            <p className="text-xs text-txt-sub">Link your developer profiles across competitive coding and hackathon platforms to sync stats.</p>
          </div>
          <button
            onClick={handleManualSync}
            disabled={isManualSyncing}
            className="h-8 px-3 rounded-sm border border-accent-main/40 hover:bg-accent-main/10 text-accent-main text-[10px] font-mono uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer w-fit shrink-0 whitespace-nowrap"
            title="Force immediate live sync with coding platforms"
          >
            <RotateCw size={12} className={isManualSyncing ? "animate-spin" : ""} />
            {isManualSyncing ? "Syncing Live..." : "Sync Live Stats"}
          </button>
        </div>

        {/* Banner Alert for outstanding daily problem */}
        {leetcodeUser && stats.leetcode?.dailyChallenge && !stats.leetcode.dailyChallenge.completed && (
          (stats.leetcode.hasSolvedToday || stats.leetcode.dailyChallenge.hasSolvedToday || stats.leetcode.dailyChallenge.isStreakMaintained) ? (
            <div className="border border-emerald-500/30 bg-emerald-500/5 p-4 rounded-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <Sparkles className="text-emerald-400 flex-shrink-0" size={18} />
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-txt-main flex items-center gap-1.5">
                      <Flame size={13} className="text-amber-500 shrink-0" />
                      Daily Streak Maintained ({stats.leetcode.leetcodeStreak || 1} Days)
                    </span>
                    <span className="text-[9px] font-mono text-emerald-400 border border-emerald-500/30 bg-emerald-500/10 px-1.5 py-0.5 rounded">Active Today</span>
                  </div>
                  <span className="text-[10px] text-txt-sub mt-0.5">
                    You solved problems today! Today&apos;s featured challenge <strong className="text-emerald-300 font-mono font-medium">“{stats.leetcode.dailyChallenge.title}”</strong> ({stats.leetcode.dailyChallenge.difficulty}) is available to earn your DCC badge.
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <a 
                  href={stats.leetcode.dailyChallenge.link} 
                  target="_blank" 
                  rel="noreferrer"
                  className="h-8 px-4 border border-emerald-500/40 hover:bg-emerald-500/15 text-emerald-400 text-[10px] font-mono uppercase tracking-wider rounded-sm flex items-center justify-center gap-1.5 transition-all w-fit whitespace-nowrap"
                >
                  Solve Featured Challenge <ExternalLink size={10} />
                </a>
              </div>
            </div>
          ) : (
            <div className="border border-yellow-500/40 bg-yellow-500/10 p-4 rounded-md flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-pulse">
              <div className="flex items-center gap-3 min-w-0">
                <AlertCircle className="text-yellow-500 flex-shrink-0" size={18} />
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-semibold text-txt-main">LeetCode Daily Streak at Risk</span>
                  <span className="text-[10px] text-txt-sub">
                    No submissions recorded today. Solve today&apos;s challenge <strong className="text-yellow-500 font-mono font-bold">“{stats.leetcode.dailyChallenge.title}”</strong> ({stats.leetcode.dailyChallenge.difficulty}) to maintain your {stats.leetcode?.leetcodeStreak || 0}-day streak!
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <a 
                  href={stats.leetcode.dailyChallenge.link} 
                  target="_blank" 
                  rel="noreferrer"
                  className="h-8 px-4 border border-yellow-500/50 hover:bg-yellow-500/20 text-yellow-500 text-[10px] font-mono uppercase tracking-wider rounded-sm flex items-center justify-center gap-1.5 transition-all w-fit whitespace-nowrap"
                >
                  Solve on LeetCode <ExternalLink size={10} />
                </a>
              </div>
            </div>
          )
        )}

        {leetcodeUser && showSuccessBanner && stats.leetcode?.dailyChallenge?.completed && (
          <div className="border border-emerald-500/40 bg-emerald-500/10 p-4 rounded-md flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <CheckCircle2 className="text-emerald-500 flex-shrink-0" size={18} />
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-semibold text-txt-main">Daily Challenge Completed!</span>
                <span className="text-[10px] text-txt-sub">
                  Awesome! You solved <strong className="text-emerald-400 font-semibold font-mono">“{stats.leetcode.dailyChallenge.title}”</strong> today. Active Streak: {stats.leetcode?.leetcodeStreak || 0} days!
                </span>
              </div>
            </div>
            <span className="text-[9px] font-mono text-emerald-400 uppercase tracking-wider font-semibold border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 rounded-sm shrink-0 whitespace-nowrap">
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

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* ================= LEFT COLUMN: CODING CARD STACKS (8 Columns) ================= */}
            <div className="lg:col-span-8 flex flex-col gap-6 min-w-0">
              
              {/* LeetCode Card */}
              <div className="border border-border-main/70 bg-bg-surface p-6 rounded-md flex flex-col gap-4 overflow-hidden">
                <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 border-b border-border-main/40 pb-3 min-w-0">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-8 h-8 rounded-md bg-bg-card border border-border-main/60 flex items-center justify-center text-txt-main shrink-0">
                      <svg viewBox="-5 -2 105 118" className="w-4 h-4" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M67.5068339,83.0664138 C70.0005384,80.5763786 74.0371402,80.5828822 76.5228362,83.0809398 C79.0085322,85.5789975 79.00204,89.6226456 76.5083355,92.1126808 L65.4351451,103.169577 C55.2192332,113.370744 38.5604663,113.518673 28.1722578,103.513204 C28.112217,103.455678 23.486583,98.9201326 8.22702585,83.9570195 C-1.92478479,74.0028895 -2.93614945,58.0748736 6.61697549,47.8463644 L24.4286944,28.7745461 C33.9100043,18.6218594 51.3874487,17.5122246 62.2279907,26.2789232 L78.4052912,39.3620235 C81.1448956,41.5776292 81.5728103,45.5984975 79.3610655,48.3428842 C77.1493207,51.0872709 73.1354592,51.5159327 70.3958548,49.300327 L54.2186634,36.2173149 C48.5492813,31.6325105 38.631911,32.2621597 33.7398535,37.5006265 L15.9279056,56.5726899 C11.2772073,61.552182 11.7865613,69.5740156 17.1461283,74.8292186 C28.3515339,85.8169393 36.9874071,94.2846214 36.9973988,94.294225 C42.3981571,99.4959838 51.130862,99.418438 56.43358,94.1233737 L67.5068339,83.0664138 Z" fill="#FFA116" fillRule="nonzero" />
                        <path d="M40.6069914,72.0014117 C37.086019,72.0014117 34.2317068,69.142117 34.2317068,65.6149982 C34.2317068,62.0878794 37.086019,59.2285847 40.6069914,59.2285847 L87.6247154,59.2285847 C91.1456879,59.2285847 94,62.0878794 94,65.6149982 C94,69.142117 91.1456879,72.0014117 87.6247154,72.0014117 L40.6069914,72.0014117 Z" fill="#B3B3B3" />
                        <path d="M49.4124315,2.02335002 C51.8178981,-0.552320454 55.852269,-0.686893945 58.4234511,1.72277172 C60.9946333,4.13243738 61.1289722,8.17385083 58.7235056,10.7495213 L15.9282277,56.5728697 C11.2773659,61.551984 11.7867168,69.5737689 17.1459309,74.8291832 L36.9094236,94.2091099 C39.4255514,96.6764051 39.4686234,100.719828 37.0056277,103.240348 C34.5426319,105.760868 30.5062548,105.804016 27.990127,103.33672 L8.22654289,83.9567041 C-1.92467414,74.0021005 -2.93603527,58.0741402 6.61751533,47.846311 L49.4124315,2.02335002 Z" fill="currentColor" />
                      </svg>
                    </span>
                    <div className="flex flex-col min-w-0">
                      <h3 className="text-sm font-semibold text-txt-main truncate">LeetCode Profile</h3>
                      <span className="text-[10px] text-txt-muted truncate">Sync solve tallies & activity heatmap</span>
                    </div>
                  </div>

                  {leetcodeUser && (
                    <a 
                      href={`https://leetcode.com/${leetcodeUser}/`}
                      target="_blank" 
                      rel="noreferrer"
                      className="text-[10px] font-mono text-accent-main hover:bg-accent-main/10 border border-accent-main/30 px-2.5 py-1 rounded flex items-center gap-1 shrink-0 font-medium transition-colors max-w-full overflow-hidden"
                    >
                      <span className="truncate max-w-[140px]">@{leetcodeUser}</span>
                      <ExternalLink size={10} className="shrink-0" />
                    </a>
                  )}
                </div>

                {!leetcodeUser ? (
                  <div className="p-4 sm:p-5 border border-dashed border-border-main/80 rounded bg-bg-base/20 font-mono text-xs text-txt-muted flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-5 overflow-hidden">
                    <div className="flex flex-col gap-1 text-left min-w-0 flex-1">
                      <span className="font-semibold text-txt-main">LeetCode handle is not linked yet.</span>
                      <span className="text-[10px] text-txt-sub">Enter your LeetCode username below to sync daily challenge streak & stats.</span>
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 min-w-0">
                      <input
                        type="text"
                        value={inputLcHandle}
                        onChange={(e) => setInputLcHandle(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") handleSaveInlineHandle(); }}
                        placeholder="e.g. your_leetcode_id"
                        className="h-8 px-2.5 bg-bg-base border border-border-main/70 text-txt-main text-xs font-mono rounded focus:outline-none focus:border-accent-main min-w-0 flex-1 sm:w-44"
                      />
                      <button
                        type="button"
                        onClick={handleSaveInlineHandle}
                        className="h-8 px-3 bg-accent-main text-bg-base font-mono text-[10px] uppercase font-bold rounded hover:opacity-90 transition-all shrink-0 cursor-pointer whitespace-nowrap"
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
                    <a 
                      href={`https://www.codechef.com/users/${codechefUser}`}
                      target="_blank" 
                      rel="noreferrer"
                      className="text-[10px] font-mono text-accent-main hover:bg-accent-main/10 border border-accent-main/30 px-2.5 py-1 rounded flex items-center gap-1 shrink-0 font-medium transition-colors max-w-full overflow-hidden"
                    >
                      <span className="truncate max-w-[140px]">@{codechefUser}</span>
                      <ExternalLink size={10} className="shrink-0" />
                    </a>
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
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                      <div className="border border-border-main/40 bg-bg-surface/50 backdrop-blur-sm p-3.5 rounded flex flex-col gap-1">
                        <span className="text-[9px] font-mono text-txt-muted uppercase font-semibold">Contest Rating</span>
                        <span className="text-xl font-semibold text-txt-main font-display">{stats.codechef?.rating ?? "N/A"}</span>
                        <span className="text-[9px] text-txt-sub font-mono tracking-tight">Active division score</span>
                      </div>

                      <div className="border border-border-main/40 bg-bg-surface/50 backdrop-blur-sm p-3.5 rounded flex flex-col gap-1">
                        <span className="text-[9px] font-mono text-txt-muted uppercase font-semibold">Star Division</span>
                        <span className="text-xl font-semibold text-txt-main font-display">{stats.codechef?.rank ?? "N/A"}</span>
                        <span className="text-[9px] text-txt-sub font-mono tracking-tight">Rating Stars tier</span>
                      </div>

                      <div className="border border-border-main/40 bg-bg-surface/50 backdrop-blur-sm p-3.5 rounded flex flex-col gap-1">
                        <span className="text-[9px] font-mono text-txt-muted uppercase font-semibold">Solved Problems</span>
                        <span className="text-xl font-semibold text-txt-main font-display">{stats.codechef?.solved ?? 0}</span>
                        <span className="text-[9px] text-txt-sub font-mono tracking-tight">Verified solves</span>
                      </div>

                      <div className="border border-border-main/40 bg-bg-surface/50 backdrop-blur-sm p-3.5 rounded flex flex-col gap-1">
                        <span className="text-[9px] font-mono text-txt-muted uppercase font-semibold">Global Rank</span>
                        <span className="text-xl font-semibold text-txt-main font-display">
                          {(stats.codechef as any)?.globalRank ? `#${(stats.codechef as any).globalRank}` : "N/A"}
                        </span>
                        <span className="text-[9px] text-txt-sub font-mono tracking-tight">
                          {(stats.codechef as any)?.countryRank ? `Country: #${(stats.codechef as any).countryRank}` : "Country: N/A"}
                        </span>
                      </div>

                      <div className="border border-border-main/40 bg-bg-surface/50 backdrop-blur-sm p-3.5 rounded flex flex-col gap-1">
                        <span className="text-[9px] font-mono text-txt-muted uppercase font-semibold">Peak Rating</span>
                        <span className="text-xl font-semibold text-txt-main font-display">
                          {(stats.codechef as any)?.highestRating ?? "N/A"}
                        </span>
                        <span className="text-[9px] text-txt-sub font-mono tracking-tight">All-time highest</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* HackerRank Profile Card */}
              <div className="border border-border-main/70 bg-bg-surface p-6 rounded-md flex flex-col gap-4">
                <div className="flex items-center justify-between gap-4 border-b border-border-main/40 pb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="w-8 h-8 rounded-md bg-[#00EA64]/10 border border-[#00EA64]/30 flex items-center justify-center p-1 overflow-hidden shrink-0">
                      <img src="/hh.png" alt="HackerRank" className="w-5 h-5 object-contain" />
                    </span>
                    <div className="flex flex-col">
                      <h3 className="text-sm font-semibold text-txt-main">HackerRank Profile</h3>
                      <span className="text-[10px] text-txt-muted">Domain mastery, stars &amp; skill badges</span>
                    </div>
                  </div>

                  {hackerrankUser ? (
                    <a 
                      href={`https://www.hackerrank.com/profile/${hackerrankUser}`}
                      target="_blank" 
                      rel="noreferrer"
                      className="text-[10px] font-mono text-accent-main hover:bg-accent-main/10 border border-accent-main/30 px-2.5 py-1 rounded flex items-center gap-1 shrink-0 font-medium transition-colors max-w-full overflow-hidden"
                    >
                      <span className="truncate max-w-[140px]">@{hackerrankUser}</span>
                      <ExternalLink size={10} className="shrink-0" />
                    </a>
                  ) : (
                    <Link
                      href="/profile"
                      className="text-[9px] font-mono text-txt-muted hover:text-accent-main transition-colors cursor-pointer"
                    >
                      + Connect
                    </Link>
                  )}
                </div>

                {!hackerrankUser ? (
                  <div className="p-5 border border-dashed border-border-main/80 rounded bg-bg-base/20 text-center font-mono text-xs text-txt-muted flex flex-col gap-1.5 items-center py-6">
                    <span>HackerRank account is not linked.</span>
                    <span className="text-[10px] text-txt-sub">Link your handle in your Profile Settings to sync badges &amp; stars.</span>
                    <Link
                      href="/profile"
                      className="mt-1 text-[10px] font-mono uppercase tracking-wider text-accent-main hover:underline flex items-center gap-1 font-semibold"
                    >
                      Go to Profile Settings &rarr;
                    </Link>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4 w-full">
                    {platformErrors.hackerrank && (
                      <div className="border border-red-500/30 bg-red-500/10 p-3.5 rounded text-xs font-mono text-red-400 flex flex-col gap-1.5">
                        <span className="font-bold flex items-center gap-1">⚠️ Profile Sync Error:</span>
                        <span>{platformErrors.hackerrank}</span>
                        <span className="text-[10px] text-txt-muted font-sans">
                          Verify that your HackerRank username handle is correct and public.
                        </span>
                      </div>
                    )}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="border border-border-main/40 bg-bg-surface/50 backdrop-blur-sm p-3.5 rounded flex flex-col gap-1">
                        <span className="text-[9px] font-mono text-txt-muted uppercase font-semibold">Mastery Title</span>
                        <span className="text-xl font-semibold text-txt-main font-display">{stats.hackerrank?.rank ?? "Gold"}</span>
                        <span className="text-[9px] text-txt-sub font-mono tracking-tight">HackerRank Level</span>
                      </div>

                      <div className="border border-border-main/40 bg-bg-surface/50 backdrop-blur-sm p-3.5 rounded flex flex-col gap-1">
                        <span className="text-[9px] font-mono text-txt-muted uppercase font-semibold">Challenges Solved</span>
                        <span className="text-xl font-semibold text-txt-main font-display">{stats.hackerrank?.solved ?? 0}</span>
                        <span className="text-[9px] text-txt-sub font-mono tracking-tight">Across all domains</span>
                      </div>

                      <div className="border border-border-main/40 bg-bg-surface/50 backdrop-blur-sm p-3.5 rounded flex flex-col gap-1">
                        <span className="text-[9px] font-mono text-txt-muted uppercase font-semibold">Skill Badges</span>
                        <span className="text-xl font-semibold text-txt-main font-display">
                          {Array.isArray((stats.hackerrank as any)?.badges) ? (stats.hackerrank as any).badges.length : 0}
                        </span>
                        <span className="text-[9px] text-txt-sub font-mono tracking-tight">Verified domains</span>
                      </div>

                      <div className="border border-border-main/40 bg-bg-surface/50 backdrop-blur-sm p-3.5 rounded flex flex-col gap-1">
                        <span className="text-[9px] font-mono text-txt-muted uppercase font-semibold">Contest Score</span>
                        <span className="text-xl font-semibold text-txt-main font-display">
                          {stats.hackerrank?.rating ?? 1500}
                        </span>
                        <span className="text-[9px] text-txt-sub font-mono tracking-tight">Competitive ELO</span>
                      </div>
                    </div>

                    {/* HackerRank Domain Badges Showcase */}
                    {Array.isArray((stats.hackerrank as any)?.badges) && (stats.hackerrank as any).badges.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-1 border-t border-border-main/30">
                        {(stats.hackerrank as any).badges.map((b: any, idx: number) => (
                          <span 
                            key={idx}
                            className="text-[10px] font-mono px-2.5 py-1 rounded bg-[#00EA64]/10 text-[#00EA64] border border-[#00EA64]/30 flex items-center gap-1.5"
                          >
                            <span>⭐ {b.stars || 1}★</span>
                            <span className="font-sans font-medium text-txt-main">{b.name}</span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* GeeksforGeeks Profile Card */}
              <div className="border border-border-main/70 bg-bg-surface p-6 rounded-md flex flex-col gap-4">
                <div className="flex items-center justify-between gap-4 border-b border-border-main/40 pb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="w-8 h-8 rounded-md bg-[#2F8D46]/10 border border-[#2F8D46]/30 flex items-center justify-center p-1 overflow-hidden shrink-0">
                      <img src="/gfg.jpg" alt="GeeksforGeeks" className="w-5 h-5 object-contain rounded-[2px]" />
                    </span>
                    <div className="flex flex-col">
                      <h3 className="text-sm font-semibold text-txt-main">GeeksforGeeks Profile</h3>
                      <span className="text-[10px] text-txt-muted">POTD streaks, coding score &amp; campus rank</span>
                    </div>
                  </div>

                  {geeksforgeeksUser ? (
                    <a 
                      href={`https://www.geeksforgeeks.org/user/${geeksforgeeksUser}/`}
                      target="_blank" 
                      rel="noreferrer"
                      className="text-[10px] font-mono text-accent-main hover:bg-accent-main/10 border border-accent-main/30 px-2.5 py-1 rounded flex items-center gap-1 shrink-0 font-medium transition-colors max-w-full overflow-hidden"
                    >
                      <span className="truncate max-w-[140px]">@{geeksforgeeksUser}</span>
                      <ExternalLink size={10} className="shrink-0" />
                    </a>
                  ) : (
                    <Link
                      href="/profile"
                      className="text-[9px] font-mono text-txt-muted hover:text-accent-main transition-colors cursor-pointer"
                    >
                      + Connect
                    </Link>
                  )}
                </div>

                {!geeksforgeeksUser ? (
                  <div className="p-5 border border-dashed border-border-main/80 rounded bg-bg-base/20 text-center font-mono text-xs text-txt-muted flex flex-col gap-1.5 items-center py-6">
                    <span>GeeksforGeeks account is not linked.</span>
                    <span className="text-[10px] text-txt-sub">Link your handle in your Profile Settings to sync solved problems &amp; coding score.</span>
                    <Link
                      href="/profile"
                      className="mt-1 text-[10px] font-mono uppercase tracking-wider text-accent-main hover:underline flex items-center gap-1 font-semibold"
                    >
                      Go to Profile Settings &rarr;
                    </Link>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4 w-full">
                    {platformErrors.geeksforgeeks && (
                      <div className="border border-red-500/30 bg-red-500/10 p-3.5 rounded text-xs font-mono text-red-400 flex flex-col gap-1.5">
                        <span className="font-bold flex items-center gap-1">⚠️ Profile Sync Error:</span>
                        <span>{platformErrors.geeksforgeeks}</span>
                        <span className="text-[10px] text-txt-muted font-sans">
                          Verify that your GeeksforGeeks username is spelled correctly and the account exists.
                        </span>
                      </div>
                    )}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                      <div className="border border-border-main/40 bg-bg-surface/50 backdrop-blur-sm p-3.5 rounded flex flex-col gap-1">
                        <span className="text-[9px] font-mono text-txt-muted uppercase font-semibold">Solved Problems</span>
                        <span className="text-xl font-semibold text-txt-main font-display">{stats.geeksforgeeks?.solved ?? 0}</span>
                        <span className="text-[9px] text-txt-sub font-mono tracking-tight">
                          {stats.geeksforgeeks
                            ? `E: ${stats.geeksforgeeks.solvedEasy} | M: ${stats.geeksforgeeks.solvedMedium} | H: ${stats.geeksforgeeks.solvedHard}`
                            : "E: 0 | M: 0 | H: 0"}
                        </span>
                      </div>

                      <div className="border border-border-main/40 bg-bg-surface/50 backdrop-blur-sm p-3.5 rounded flex flex-col gap-1">
                        <span className="text-[9px] font-mono text-txt-muted uppercase font-semibold">Coding Score</span>
                        <span className="text-xl font-semibold text-txt-main font-display">{(stats.geeksforgeeks as any)?.codingScore ?? 0}</span>
                        <span className="text-[9px] text-txt-sub font-mono tracking-tight">Overall GFG Score</span>
                      </div>

                      <div className="border border-border-main/40 bg-bg-surface/50 backdrop-blur-sm p-3.5 rounded flex flex-col gap-1">
                        <span className="text-[9px] font-mono text-txt-muted uppercase font-semibold">Institute Rank</span>
                        <span className="text-xl font-semibold text-txt-main font-display">
                          {(stats.geeksforgeeks as any)?.instituteRank ? `#${(stats.geeksforgeeks as any).instituteRank}` : "N/A"}
                        </span>
                        <span className="text-[9px] text-txt-sub font-mono tracking-tight">{stats.geeksforgeeks?.rank || "Practitioner"}</span>
                      </div>

                      <div className="border border-border-main/40 bg-bg-surface/50 backdrop-blur-sm p-3.5 rounded flex flex-col gap-1">
                        <span className="text-[9px] font-mono text-txt-muted uppercase font-semibold">POTD Streak</span>
                        <span className="text-xl font-semibold text-txt-main font-display">
                          {(stats.geeksforgeeks as any)?.streak ?? 0}
                          <span className="text-xs font-normal text-txt-muted ml-1">Days</span>
                        </span>
                        <span className="text-[9px] text-txt-sub font-mono tracking-tight">Problem of the Day</span>
                      </div>

                      <div className="border border-border-main/40 bg-bg-surface/50 backdrop-blur-sm p-3.5 rounded flex flex-col gap-1">
                        <span className="text-[9px] font-mono text-txt-muted uppercase font-semibold">Contest Rating</span>
                        <span className="text-xl font-semibold text-txt-main font-display">
                          {stats.geeksforgeeks?.rating ? stats.geeksforgeeks.rating : "Active"}
                        </span>
                        <span className="text-[9px] text-txt-sub font-mono tracking-tight">Competitive Tier</span>
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
                    <a 
                      href={`https://codeforces.com/profile/${codeforcesUser}`}
                      target="_blank" 
                      rel="noreferrer"
                      className="text-[10px] font-mono text-accent-main hover:bg-accent-main/10 border border-accent-main/30 px-2.5 py-1 rounded flex items-center gap-1 shrink-0 font-medium transition-colors max-w-full overflow-hidden"
                    >
                      <span className="truncate max-w-[140px]">@{codeforcesUser}</span>
                      <ExternalLink size={10} className="shrink-0" />
                    </a>
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
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                      <div className="border border-border-main/40 bg-bg-surface/50 backdrop-blur-sm p-3.5 rounded flex flex-col gap-1">
                        <span className="text-[9px] font-mono text-txt-muted uppercase font-semibold">Division Rating</span>
                        <span className="text-xl font-semibold text-txt-main font-display">{stats.codeforces?.rating ?? "N/A"}</span>
                        <span className="text-[9px] text-txt-sub font-mono tracking-tight">
                          {stats.codeforces?.rank ? normalizeTitleCase(stats.codeforces.rank) : "Unrated"}
                        </span>
                      </div>

                      <div className="border border-border-main/40 bg-bg-surface/50 backdrop-blur-sm p-3.5 rounded flex flex-col gap-1">
                        <span className="text-[9px] font-mono text-txt-muted uppercase font-semibold">Solved Problems</span>
                        <span className="text-xl font-semibold text-txt-main font-display">{stats.codeforces?.solved ?? 0}</span>
                        <span className="text-[9px] text-txt-sub font-mono tracking-tight">Unique problems</span>
                      </div>

                      <div className="border border-border-main/40 bg-bg-surface/50 backdrop-blur-sm p-3.5 rounded flex flex-col gap-1">
                        <span className="text-[9px] font-mono text-txt-muted uppercase font-semibold">Submissions</span>
                        <span className="text-xl font-semibold text-txt-main font-display">{(stats.codeforces as any)?.totalSubmissions ?? 0}</span>
                        <span className="text-[9px] text-txt-sub font-mono tracking-tight">Total runs</span>
                      </div>

                      <div className="border border-border-main/40 bg-bg-surface/50 backdrop-blur-sm p-3.5 rounded flex flex-col gap-1">
                        <span className="text-[9px] font-mono text-txt-muted uppercase font-semibold">Acceptance Rate</span>
                        <span className="text-xl font-semibold text-txt-main font-display">
                          {((stats.codeforces as any)?.totalSubmissions 
                            ? (((stats.codeforces as any)?.acceptedSubmissions / (stats.codeforces as any)?.totalSubmissions) * 100).toFixed(1)
                            : "0.0")}%
                        </span>
                        <span className="text-[9px] text-txt-sub font-mono tracking-tight">Correct solves ratio</span>
                      </div>

                      <div className="border border-border-main/40 bg-bg-surface/50 backdrop-blur-sm p-3.5 rounded flex flex-col gap-1">
                        <span className="text-[9px] font-mono text-txt-muted uppercase font-semibold">Peak Rating</span>
                        <span className="text-xl font-semibold text-txt-main font-display">
                          {(stats.codeforces as any)?.maxRating ?? "N/A"}
                        </span>
                        <span className="text-[9px] text-txt-sub font-mono tracking-tight">
                          {(stats.codeforces as any)?.maxRank ? `Max: ${normalizeTitleCase((stats.codeforces as any).maxRank)}` : "Max: N/A"}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* AI Programming Portfolio Analyst Panel */}
              <div className="border border-border-main/70 bg-bg-surface p-6 rounded-md flex flex-col gap-4">
                <div className="flex items-center justify-between border-b border-border-main/40 pb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles size={14} className="text-amber-500 animate-pulse" />
                    <span className="font-mono text-[9px] uppercase tracking-widest text-txt-muted">AI Portfolio Analyst</span>
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

            </div>

            {/* ================= RIGHT COLUMN: CONTESTS FEED & HACKATHONS (4 Columns) ================= */}
            <div className="lg:col-span-4 flex flex-col gap-6 lg:sticky lg:top-24">
              
              {/* Hackathon Portals & Applied Workspaces Panel */}
              <div className="border border-border-main/70 bg-bg-surface p-6 rounded-md flex flex-col gap-4">
                <div className="flex items-center justify-between border-b border-border-main/40 pb-3">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-mono text-[9px] uppercase tracking-widest text-txt-muted font-bold">Portals & Applications</span>
                    <h3 className="text-xs font-semibold text-txt-main">Hackathon Hub</h3>
                  </div>
                  <button
                    onClick={handleOpenHandleModal}
                    className="text-[9px] font-mono text-txt-muted hover:text-txt-main transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    Edit Handles
                  </button>
                </div>
                
                {/* Unstop Row */}
                <div className="border-b border-border-main/40 pb-3 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-txt-main">Unstop</span>
                    {unstopUser ? (
                      <a
                        href={`https://unstop.com/u/${unstopUser}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] font-mono text-accent-main hover:underline flex items-center gap-1"
                      >
                        @{unstopUser} <ExternalLink size={9} />
                      </a>
                    ) : (
                      <button
                        onClick={handleOpenHandleModal}
                        className="text-[9px] font-mono text-txt-muted hover:text-accent-main cursor-pointer"
                      >
                        + Connect
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-0.5 font-mono text-[10px]">
                    <div className="bg-bg-card border border-border-main/50 p-2 rounded flex flex-col">
                      <span className="text-txt-muted text-[9px] uppercase">Registered Events</span>
                      <span className="text-xs font-bold text-txt-main font-display">
                        {(stats.unstop as any)?.participations !== undefined 
                          ? (stats.unstop as any).participations 
                          : realAppliedCounts.unstop}
                      </span>
                      <span className="text-[8px] text-txt-muted">Unstop profile</span>
                    </div>
                    <div className="bg-bg-card border border-border-main/50 p-2 rounded flex flex-col">
                      <span className="text-txt-muted text-[9px] uppercase">Unstop Points</span>
                      <span className="text-xs font-bold text-txt-main font-display">
                        {(stats.unstop as any)?.points !== undefined 
                          ? (stats.unstop as any).points.toLocaleString() 
                          : "—"}
                      </span>
                      <span className="text-[8px] text-txt-muted">
                        {(stats.unstop as any)?.badgesCount ? `${(stats.unstop as any).badgesCount} Badges` : "Gamification"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between font-mono text-[9.5px] text-txt-muted px-0.5">
                    <span>LynDesk Tracked:</span>
                    <span className="font-semibold text-txt-main">
                      {realAppliedCounts.unstop}
                    </span>
                  </div>
                </div>

                {/* Hack2Skill Row */}
                <div className="flex flex-col gap-1.5 pt-0.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-txt-main">Hack2Skill</span>
                    {hack2skillUser ? (
                      <span className="text-[10px] font-mono text-accent-main">
                        @{hack2skillUser}
                      </span>
                    ) : (
                      <button
                        onClick={handleOpenHandleModal}
                        className="text-[9px] font-mono text-txt-muted hover:text-accent-main cursor-pointer"
                      >
                        + Connect
                      </button>
                    )}
                  </div>
                  <div className="flex items-center justify-between font-mono text-[9.5px] text-txt-muted px-0.5">
                    <span>LynDesk Tracked:</span>
                    <span className="font-semibold text-txt-main">
                      {realAppliedCounts.hack2skill}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setShowAppliedModal(true)}
                  className="w-full h-9 bg-accent-main hover:opacity-90 text-bg-base text-[10px] font-mono tracking-wider uppercase flex items-center justify-center gap-1.5 rounded-sm transition-opacity font-bold cursor-pointer mt-1"
                >
                  <FolderKanban size={12} /> Manage Application Tracker
                </button>
              </div>

              {/* Active / Upcoming Contests Feed */}
              <div className="border border-border-main/70 bg-bg-surface p-6 rounded-md flex flex-col gap-4">
                <div className="flex items-center justify-between border-b border-border-main/40 pb-3">
                  <div className="flex items-center gap-2">
                    <TrendingUp size={14} className="text-accent-main" />
                    <span className="font-mono text-[9px] uppercase tracking-widest text-txt-muted">Active Contest Feed</span>
                  </div>
                  <span className="text-[9px] font-mono text-txt-muted">
                    {contests.length} Available
                  </span>
                </div>

                <div className="flex flex-col gap-3">
                  {(showAllContests ? contests : contests.slice(0, 3)).map((c, idx) => (
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

                {contests.length > 3 && (
                  <button
                    onClick={() => setShowAllContests((prev) => !prev)}
                    className="w-full pt-1 text-[10px] font-mono tracking-wider text-txt-muted hover:text-txt-main opacity-60 hover:opacity-100 transition-all duration-200 flex items-center justify-center gap-1 cursor-pointer select-none"
                  >
                    <span>{showAllContests ? "Show Less" : `Show More (${contests.length - 3} more)`}</span>
                    {showAllContests ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                  </button>
                )}
              </div>

              {/* Leetie Extension Card */}
              <div className="border border-border-main/70 bg-bg-surface p-6 rounded-md flex flex-col gap-4">
                <div className="flex items-center justify-between border-b border-border-main/40 pb-3">
                  <div className="flex items-center gap-2">
                    <Puzzle size={14} className="text-accent-main" />
                    <span className="font-mono text-[9px] uppercase tracking-widest text-txt-muted">Browser Extension</span>
                  </div>
                  <span className="text-[9px] font-mono text-txt-sub bg-bg-card px-2 py-0.5 border border-border-main/70 rounded-sm font-semibold">
                    v1.0.2
                  </span>
                </div>

                <div className="flex flex-col gap-1">
                  <h4 className="text-xs font-bold font-mono text-txt-main flex items-center gap-1.5">
                    Leetie Extension
                  </h4>
                  <p className="text-[11px] text-txt-muted font-light leading-snug">
                    Auto-archive accepted LeetCode solutions directly to your GitHub repository.
                  </p>
                </div>

                {/* Chrome Web Store Link */}
                <a
                  href="https://chrome.google.com/webstore/detail/dladcchefomefppalgbijajgegfhlhcd"
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2 bg-accent-main hover:opacity-90 text-bg-base text-[10px] uppercase font-mono tracking-wider font-bold transition-opacity rounded-sm flex items-center justify-center gap-1.5 cursor-pointer no-underline"
                >
                  <ExternalLink size={12} />
                  Add to Chrome (Web Store)
                </a>

                {/* Collapsible Installation Guide */}
                <div className="border-t border-border-main/30 pt-2 flex flex-col gap-2">
                  <button
                    onClick={() => setShowLeetieGuide((prev) => !prev)}
                    className="w-full text-left text-[10px] font-mono uppercase tracking-wider font-semibold text-txt-muted hover:text-txt-main flex items-center justify-between py-1 transition-colors cursor-pointer select-none"
                  >
                    <span className="flex items-center gap-1.5">
                      <BookOpen size={11} className="text-accent-main" />
                      How to Setup
                    </span>
                    {showLeetieGuide ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                  </button>

                  {showLeetieGuide && (
                    <div className="p-3 bg-bg-base/40 border border-border-main/40 rounded flex flex-col gap-2.5 text-xs text-txt-sub font-light leading-relaxed animate-in fade-in duration-200">
                      <ol className="flex flex-col gap-2 list-decimal list-inside text-[11px] text-txt-sub">
                        <li className="leading-snug">
                          Click <strong className="text-txt-main font-semibold">Add to Chrome</strong> on the Chrome Web Store page.
                        </li>
                        <li className="leading-snug">
                          Pin the <strong className="text-txt-main font-semibold">Leetie</strong> extension to your browser toolbar.
                        </li>
                        <li className="leading-snug">
                          Open the extension popup to connect your <strong className="text-txt-main font-semibold">GitHub Token</strong> &amp; target repository.
                        </li>
                        <li className="leading-snug">
                          Solve any problem on LeetCode — your accepted code and performance stats will automatically push to your GitHub repo in real time!
                        </li>
                      </ol>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>

      </main>

      {showAppliedModal && (
        <AppliedHackathonsModal
          unstopUser={unstopUser}
          hack2skillUser={hack2skillUser}
          onClose={() => setShowAppliedModal(false)}
        />
      )}

      {showHandleModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-bg-surface border border-border-main rounded-md max-w-md w-full p-6 shadow-2xl space-y-4 font-sans text-txt-main">
            <div className="flex items-center justify-between border-b border-border-main/40 pb-3">
              <div>
                <span className="font-mono text-[9px] uppercase tracking-widest text-txt-muted">Integrations</span>
                <h3 className="font-display text-lg font-light text-txt-main">Manage Hackathon Portals</h3>
              </div>
              <button
                onClick={() => setShowHandleModal(false)}
                className="w-7 h-7 rounded-sm bg-bg-card text-txt-muted hover:text-txt-main flex items-center justify-center cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block font-mono text-[10px] uppercase text-txt-muted mb-1">
                  Unstop Handle / Profile Link
                </label>
                <input
                  type="text"
                  placeholder="e.g. shreek64346 or https://unstop.com/u/..."
                  value={inputUnstopHandle}
                  onChange={e => setInputUnstopHandle(e.target.value)}
                  className="w-full h-9 px-3 bg-bg-card border border-border-main rounded-sm text-xs text-txt-main font-mono focus:outline-hidden focus:border-accent-main"
                />
              </div>

              <div>
                <label className="block font-mono text-[10px] uppercase text-txt-muted mb-1">
                  Hack2Skill Handle / Profile Link
                </label>
                <input
                  type="text"
                  placeholder="e.g. shreeprasandh_9916 or profile link"
                  value={inputH2sHandle}
                  onChange={e => setInputH2sHandle(e.target.value)}
                  className="w-full h-9 px-3 bg-bg-card border border-border-main rounded-sm text-xs text-txt-main font-mono focus:outline-hidden focus:border-accent-main"
                />
              </div>

              <p className="font-mono text-[10px] text-txt-muted">
                Tip: Leave blank and save to unlink any handle.
              </p>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border-main/30">
                <button
                  type="button"
                  onClick={() => setShowHandleModal(false)}
                  className="h-8 px-3 bg-bg-card border border-border-main text-txt-muted hover:text-txt-main font-mono text-[10px] uppercase rounded-sm cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveHackathonHandles}
                  disabled={savingHandles}
                  className="h-8 px-4 bg-accent-main hover:opacity-90 disabled:opacity-50 text-bg-base font-mono text-[10px] uppercase tracking-wider font-bold rounded-sm flex items-center gap-1.5 cursor-pointer"
                >
                  {savingHandles ? "Saving..." : "Save Handles"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
