"use client";

import React, { useState, useEffect } from "react";
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
}

export default function CodingDeckPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Platform usernames
  const [leetcodeUser, setLeetcodeUser] = useState("");
  const [codeforcesUser, setCodeforcesUser] = useState("");
  const [codechefUser, setCodechefUser] = useState("");
  const [unstopUser, setUnstopUser] = useState("");
  const [hack2skillUser, setHack2skillUser] = useState("");

  // Daily Challenge completed state
  const [dailyCompleted, setDailyCompleted] = useState(false);
  const [streak, setStreak] = useState(12); // Mock current streak

  // Connection edit states
  const [editLeetcode, setEditLeetcode] = useState(false);
  const [editCodeforces, setEditCodeforces] = useState(false);
  const [editCodechef, setEditCodechef] = useState(false);
  const [editUnstop, setEditUnstop] = useState(false);
  const [editHack2skill, setEditHack2skill] = useState(false);

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

  // Load platform details from Supabase Auth user metadata
  useEffect(() => {
    if (!user) return;

    const loadPlatformData = () => {
      try {
        setLoading(true);
        const meta = user.user_metadata || {};
        
        setLeetcodeUser(meta.leetcode_username || "");
        setCodeforcesUser(meta.codeforces_username || "");
        setCodechefUser(meta.codechef_username || "");
        setUnstopUser(meta.unstop_username || "");
        setHack2skillUser(meta.hack2skill_username || "");
        setDailyCompleted(!!meta.leetcode_daily_completed);
        
        // Populate stats if usernames exist
        setStats({
          leetcode: meta.leetcode_username ? {
            solved: 342,
            solvedEasy: 154,
            solvedMedium: 148,
            solvedHard: 40,
            rank: "Top 8.4%",
            rating: 1782,
            globalRank: 125430
          } : null,
          codeforces: meta.codeforces_username ? {
            solved: 215,
            solvedEasy: 0,
            solvedMedium: 0,
            solvedHard: 0,
            rank: "Specialist",
            rating: 1480,
            globalRank: 8540
          } : null,
          codechef: meta.codechef_username ? {
            solved: 129,
            solvedEasy: 0,
            solvedMedium: 0,
            solvedHard: 0,
            rank: "3★",
            rating: 1624,
            globalRank: 4120
          } : null,
          unstop: meta.unstop_username ? {
            registered: 6,
            completed: 4,
            rank: 42
          } : null,
          hack2skill: meta.hack2skill_username ? {
            registered: 3,
            completed: 3,
            rank: 12
          } : null,
        });

      } catch (err) {
        console.error("Error loading coding platform details:", err);
      } finally {
        setLoading(false);
      }
    };

    loadPlatformData();
  }, [user]);

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

      // Update local state metrics dynamically
      setStats(prev => ({
        ...prev,
        [platform]: username.trim() ? (
          platform === "leetcode" ? { solved: 342, solvedEasy: 154, solvedMedium: 148, solvedHard: 40, rank: "Top 8.4%", rating: 1782, globalRank: 125430 } :
          platform === "codeforces" ? { solved: 215, solvedEasy: 0, solvedMedium: 0, solvedHard: 0, rank: "Specialist", rating: 1480, globalRank: 8540 } :
          platform === "codechef" ? { solved: 129, solvedEasy: 0, solvedMedium: 0, solvedHard: 0, rank: "3★", rating: 1624, globalRank: 4120 } :
          platform === "unstop" ? { registered: 6, completed: 4, rank: 42 } :
          { registered: 3, completed: 3, rank: 12 }
        ) : null
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

  // Toggle LeetCode Daily Challenge Completion
  const handleToggleDailyChallenge = async () => {
    if (!user) return;
    const newState = !dailyCompleted;
    setDailyCompleted(newState);
    setStreak(prev => (newState ? prev + 1 : prev - 1));

    try {
      try {
        await supabase
          .from("profiles")
          .upsert({
            id: user.id,
            leetcode_daily_completed: newState
          });
      } catch (dbErr) {
        console.warn("Profiles daily status upsert skipped.", dbErr);
      }

      await supabase.auth.updateUser({
        data: {
          leetcode_daily_completed: newState
        }
      });
    } catch (err) {
      console.warn("Could not save daily completed state.", err);
    }
  };

  // Heatmap helper: Generate 53 columns x 7 rows (deterministic mock generation)
  const renderHeatmap = () => {
    const days = [];
    for (let i = 0; i < 371; i++) {
      // Pure deterministic algorithm: generates a recurring aesthetic calendar pattern
      const level = (i * 3 + 7) % 5 > 2 ? ((i * 13 + 5) % 4) : 0;
      days.push(level);
    }

    return (
      <div className="grid grid-flow-col grid-rows-7 gap-1 overflow-x-auto py-2">
        {days.map((level, idx) => {
          let colorClass = "bg-bg-card border border-border-main/20";
          if (level === 1) colorClass = "bg-emerald-500/20";
          if (level === 2) colorClass = "bg-emerald-500/50";
          if (level === 3) colorClass = "bg-emerald-500";

          return (
            <div 
              key={idx} 
              className={`w-2.5 h-2.5 rounded-sm transition-all hover:scale-125 ${colorClass}`}
              title={`Contribution Level: ${level}`}
            />
          );
        })}
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
        {!dailyCompleted && leetcodeUser && (
          <div className="border border-yellow-500/40 bg-yellow-500/10 p-4 rounded-md flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-pulse">
            <div className="flex items-center gap-3">
              <AlertCircle className="text-yellow-500 flex-shrink-0" size={18} />
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-txt-main">LeetCode Daily Challenge Pending</span>
                <span className="text-[10px] text-txt-sub">Today&apos;s daily challenge is outstanding. Solve now to maintain your {streak}-day streak!</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <a 
                href="https://leetcode.com/problemset/all/" 
                target="_blank" 
                rel="noreferrer"
                className="h-8 px-4 border border-yellow-500/50 hover:bg-yellow-500/20 text-yellow-500 text-[10px] font-mono uppercase tracking-wider rounded-sm flex items-center gap-1.5 transition-all"
              >
                Solve on LeetCode <ExternalLink size={10} />
              </a>
              <button 
                onClick={handleToggleDailyChallenge}
                className="h-8 px-4 bg-yellow-500 hover:opacity-90 text-bg-base text-[10px] font-mono uppercase tracking-wider font-semibold rounded-sm transition-opacity"
              >
                Mark Completed
              </button>
            </div>
          </div>
        )}

        {dailyCompleted && leetcodeUser && (
          <div className="border border-emerald-500/40 bg-emerald-500/10 p-4 rounded-md flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="text-emerald-500 flex-shrink-0" size={18} />
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-txt-main">Daily Streak Secure!</span>
                <span className="text-[10px] text-txt-sub">LeetCode daily challenge marked completed. Active Streak: {streak} days.</span>
              </div>
            </div>
            <button 
              onClick={handleToggleDailyChallenge}
              className="text-[10px] text-txt-muted hover:text-txt-main font-mono underline uppercase"
            >
              Undo
            </button>
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
                    <span className="w-8 h-8 rounded-md bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center text-yellow-500 font-bold text-sm">L</span>
                    <div className="flex flex-col">
                      <h3 className="text-sm font-semibold text-txt-main">LeetCode Profile</h3>
                      <span className="text-[10px] text-txt-muted">Sync solve tallies & activity heatmap</span>
                    </div>
                  </div>

                  {!editLeetcode && leetcodeUser && (
                    <button 
                      onClick={() => setEditLeetcode(true)}
                      className="text-[10px] font-mono text-txt-muted hover:text-txt-main underline"
                    >
                      Update Handle
                    </button>
                  )}
                </div>

                {!leetcodeUser || editLeetcode ? (
                  <div className="flex flex-col sm:flex-row gap-3 items-end pt-2">
                    <div className="flex-grow flex flex-col gap-1">
                      <label className="text-[10px] text-txt-sub font-semibold">LeetCode Username</label>
                      <input 
                        type="text" 
                        defaultValue={leetcodeUser}
                        id="leetcode-username-input"
                        placeholder="e.g. mirasen_code"
                        className="h-10 px-3 border border-border-main/80 bg-bg-base text-txt-main rounded-sm text-xs placeholder:text-txt-muted/50 focus:outline-none focus:border-txt-main font-mono"
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
                          const val = (document.getElementById("leetcode-username-input") as HTMLInputElement)?.value;
                          setLeetcodeUser(val);
                          handleSavePlatform("leetcode", val);
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
                    {/* Stats stats */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      
                      <div className="border border-border-main/60 bg-bg-base/30 p-3 rounded flex flex-col gap-1">
                        <span className="text-[10px] font-mono text-txt-muted uppercase">Solved Problems</span>
                        <span className="text-xl font-semibold text-txt-main font-display">{stats.leetcode?.solved}</span>
                        <span className="text-[9px] text-txt-sub font-mono">
                          E: {stats.leetcode?.solvedEasy} | M: {stats.leetcode?.solvedMedium} | H: {stats.leetcode?.solvedHard}
                        </span>
                      </div>

                      <div className="border border-border-main/60 bg-bg-base/30 p-3 rounded flex flex-col gap-1">
                        <span className="text-[10px] font-mono text-txt-muted uppercase">Global Rank</span>
                        <span className="text-xl font-semibold text-txt-main font-display">#{stats.leetcode?.globalRank.toLocaleString()}</span>
                        <span className="text-[9px] text-txt-sub font-mono">{stats.leetcode?.rank}</span>
                      </div>

                      <div className="border border-border-main/60 bg-bg-base/30 p-3 rounded flex flex-col gap-1">
                        <span className="text-[10px] font-mono text-txt-muted uppercase">Contest Rating</span>
                        <span className="text-xl font-semibold text-txt-main font-display">{stats.leetcode?.rating}</span>
                        <span className="text-[9px] text-txt-sub font-mono">Knight Tier</span>
                      </div>

                      <div className="border border-border-main/60 bg-bg-base/30 p-3 rounded flex flex-col gap-1">
                        <span className="text-[10px] font-mono text-txt-muted uppercase">Leetcode Handle</span>
                        <a 
                          href={`https://leetcode.com/${leetcodeUser}/`} 
                          target="_blank" 
                          rel="noreferrer"
                          className="text-xs font-semibold text-accent-main hover:underline flex items-center gap-1 font-mono pt-1.5"
                        >
                          @{leetcodeUser} <ExternalLink size={10} />
                        </a>
                      </div>

                    </div>

                    {/* Contribution Calendar Graph */}
                    <div className="border border-border-main/60 bg-bg-base/30 p-4 rounded flex flex-col gap-2">
                      <div className="flex justify-between items-center border-b border-border-main/40 pb-2">
                        <span className="text-[10px] font-mono text-txt-muted uppercase flex items-center gap-1.5">
                          <Calendar size={12} /> Activity Heatmap (Last 12 Months)
                        </span>
                        <span className="text-[8px] font-mono text-txt-muted uppercase">Less • Gray to Green • More</span>
                      </div>
                      
                      {renderHeatmap()}
                    </div>

                  </div>
                )}
              </div>

              {/* Codeforces Profile Card */}
              <div className="border border-border-main/70 bg-bg-surface p-6 rounded-md flex flex-col gap-4">
                <div className="flex items-center justify-between gap-4 border-b border-border-main/40 pb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="w-8 h-8 rounded-md bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-500 font-bold text-xs font-mono">CF</span>
                    <div className="flex flex-col">
                      <h3 className="text-sm font-semibold text-txt-main">Codeforces Profile</h3>
                      <span className="text-[10px] text-txt-muted">Track division ratings & solve metrics</span>
                    </div>
                  </div>

                  {!editCodeforces && codeforcesUser && (
                    <button 
                      onClick={() => setEditCodeforces(true)}
                      className="text-[10px] font-mono text-txt-muted hover:text-txt-main underline"
                    >
                      Update Handle
                    </button>
                  )}
                </div>

                {!codeforcesUser || editCodeforces ? (
                  <div className="flex flex-col sm:flex-row gap-3 items-end pt-2">
                    <div className="flex-grow flex flex-col gap-1">
                      <label className="text-[10px] text-txt-sub font-semibold">Codeforces Username</label>
                      <input 
                        type="text" 
                        defaultValue={codeforcesUser}
                        id="codeforces-username-input"
                        placeholder="e.g. mirasen_cf"
                        className="h-10 px-3 border border-border-main/80 bg-bg-base text-txt-main rounded-sm text-xs placeholder:text-txt-muted/50 focus:outline-none focus:border-txt-main font-mono"
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
                          const val = (document.getElementById("codeforces-username-input") as HTMLInputElement)?.value;
                          setCodeforcesUser(val);
                          handleSavePlatform("codeforces", val);
                        }}
                        disabled={saving}
                        className="h-10 px-4 bg-accent-main text-bg-base text-xs uppercase font-semibold rounded-sm hover:opacity-90 transition-opacity cursor-pointer"
                      >
                        {saving ? "Saving..." : "Connect"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
                    <div className="border border-border-main/60 bg-bg-base/30 p-3 rounded flex flex-col gap-1">
                      <span className="text-[10px] font-mono text-txt-muted uppercase">Division Rating</span>
                      <span className="text-xl font-semibold text-txt-main font-display">{stats.codeforces?.rating}</span>
                      <span className="text-[9px] text-txt-sub font-mono">{stats.codeforces?.rank}</span>
                    </div>

                    <div className="border border-border-main/60 bg-bg-base/30 p-3 rounded flex flex-col gap-1">
                      <span className="text-[10px] font-mono text-txt-muted uppercase">Solved Problems</span>
                      <span className="text-xl font-semibold text-txt-main font-display">{stats.codeforces?.solved}</span>
                      <span className="text-[9px] text-txt-sub font-mono">Synced 5m ago</span>
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
                )}
              </div>

              {/* CodeChef Profile Card */}
              <div className="border border-border-main/70 bg-bg-surface p-6 rounded-md flex flex-col gap-4">
                <div className="flex items-center justify-between gap-4 border-b border-border-main/40 pb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="w-8 h-8 rounded-md bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-500 font-bold text-xs font-mono">CC</span>
                    <div className="flex flex-col">
                      <h3 className="text-sm font-semibold text-txt-main">CodeChef Profile</h3>
                      <span className="text-[10px] text-txt-muted">Track rating divisions & stars</span>
                    </div>
                  </div>

                  {!editCodechef && codechefUser && (
                    <button 
                      onClick={() => setEditCodechef(true)}
                      className="text-[10px] font-mono text-txt-muted hover:text-txt-main underline"
                    >
                      Update Handle
                    </button>
                  )}
                </div>

                {!codechefUser || editCodechef ? (
                  <div className="flex flex-col sm:flex-row gap-3 items-end pt-2">
                    <div className="flex-grow flex flex-col gap-1">
                      <label className="text-[10px] text-txt-sub font-semibold">CodeChef Username</label>
                      <input 
                        type="text" 
                        defaultValue={codechefUser}
                        id="codechef-username-input"
                        placeholder="e.g. mirasen_cc"
                        className="h-10 px-3 border border-border-main/80 bg-bg-base text-txt-main rounded-sm text-xs placeholder:text-txt-muted/50 focus:outline-none focus:border-txt-main font-mono"
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
                          const val = (document.getElementById("codechef-username-input") as HTMLInputElement)?.value;
                          setCodechefUser(val);
                          handleSavePlatform("codechef", val);
                        }}
                        disabled={saving}
                        className="h-10 px-4 bg-accent-main text-bg-base text-xs uppercase font-semibold rounded-sm hover:opacity-90 transition-opacity cursor-pointer"
                      >
                        {saving ? "Saving..." : "Connect"}
                      </button>
                    </div>
                  </div>
                ) : (
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
                      <span>@{unstopUser}</span>
                      <span className="text-[9px] bg-bg-card px-2 py-0.5 border border-border-main/80 rounded">{stats.unstop?.registered} Applied</span>
                    </div>
                  ) : editUnstop ? (
                    <div className="flex gap-2 items-center">
                      <input 
                        type="text" 
                        defaultValue={unstopUser}
                        id="unstop-username-input"
                        placeholder="Unstop Handle"
                        className="h-8 flex-1 px-2 border border-border-main bg-bg-base text-xs font-mono text-txt-main focus:outline-none"
                      />
                      <button 
                        onClick={() => {
                          const val = (document.getElementById("unstop-username-input") as HTMLInputElement)?.value;
                          setUnstopUser(val);
                          handleSavePlatform("unstop", val);
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
                      <span>@{hack2skillUser}</span>
                      <span className="text-[9px] bg-bg-card px-2 py-0.5 border border-border-main/80 rounded">{stats.hack2skill?.registered} Applied</span>
                    </div>
                  ) : editHack2skill ? (
                    <div className="flex gap-2 items-center">
                      <input 
                        type="text" 
                        defaultValue={hack2skillUser}
                        id="hack2skill-username-input"
                        placeholder="Hack2Skill Handle"
                        className="h-8 flex-1 px-2 border border-border-main bg-bg-base text-xs font-mono text-txt-main focus:outline-none"
                      />
                      <button 
                        onClick={() => {
                          const val = (document.getElementById("hack2skill-username-input") as HTMLInputElement)?.value;
                          setHack2skillUser(val);
                          handleSavePlatform("hack2skill", val);
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

    </div>
  );
}
