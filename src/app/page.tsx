"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "./context/AuthContext";
import { supabase } from "./lib/supabase";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Link from "next/link";
import {
  Code,
  Flame,
  Plus,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  UserPlus,
  FolderGit2,
} from "lucide-react";

interface LocalStats {
  solvedTotal: number;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
  streak: number;
  ranking: number;
  dailyChallengeStatus: "solved" | "pending";
}

interface DashboardProfile {
  full_name?: string;
  username?: string;
  avatar_url?: string;
  college_name?: string;
  department?: string;
  leetcode_username?: string;
  github_url?: string;
}

interface OnlineFriend {
  id: string;
  full_name: string;
  username: string;
  avatar_url?: string;
  department?: string;
  inSharedWorkspace: boolean;
  workspaceName?: string;
}

export default function Home() {
  const { user, loading } = useAuth();
  const [profile, setProfile] = useState<DashboardProfile | null>(null);
  const [completion, setCompletion] = useState<number>(0);

  // Coding stats state
  const [stats, setStats] = useState<LocalStats | null>(null);
  const [leetcodeHandle, setLeetcodeHandle] = useState<string>("");

  // Online friends state
  const [onlineFriends, setOnlineFriends] = useState<OnlineFriend[]>([]);

  // Deadlines & workspace counts
  const [upcomingDeadline, setUpcomingDeadline] = useState<string | null>(null);
  const [activeWorkspacesCount, setActiveWorkspacesCount] = useState<number>(0);

  // Fetch dashboard data
  useEffect(() => {
    if (!user) return;

    // 1. Resolve LeetCode handle from user_metadata or localStorage
    const meta = user.user_metadata || {};
    let handle = meta.leetcode_username || "";
    if (!handle && typeof window !== "undefined") {
      handle =
        localStorage.getItem(`ldk_leetcode_handle_${user.id}`) ||
        localStorage.getItem("ldk_leetcode_handle") ||
        "";
    }

    if (handle) {
      queueMicrotask(() => {
        setLeetcodeHandle(handle);
      });
      
      const fetchLiveStats = async () => {
        try {
          const res = await fetch(`/api/coding-stats?platform=leetcode&username=${handle}&t=${Date.now()}`);
          if (res.ok) {
            const data = await res.json();
            const formatted: LocalStats = {
              solvedTotal: data.solved || 0,
              easySolved: data.solvedEasy || 0,
              mediumSolved: data.solvedMedium || 0,
              hardSolved: data.solvedHard || 0,
              streak: data.leetcodeStreak || 0,
              ranking: data.ranking || 0,
              dailyChallengeStatus: data.dailyChallenge?.completed ? "solved" : "pending"
            };
            setStats(formatted);
            if (typeof window !== "undefined") {
              localStorage.setItem(`ldk_coding_stats_${user.id}`, JSON.stringify(formatted));
            }
          }
        } catch {}
      };

      fetchLiveStats();
    }

    // 2. Load active workspace count & upcoming deadlines
    if (typeof window !== "undefined") {
      queueMicrotask(() => {
        const storedWs = localStorage.getItem("ldk_joined_workspaces");
        if (storedWs) {
          try {
            const list = JSON.parse(storedWs);
            setActiveWorkspacesCount(Array.isArray(list) ? list.length : 0);
          } catch {
            setActiveWorkspacesCount(0);
          }
        }

        const storedEvents = localStorage.getItem("ldk_opportunities");
        if (storedEvents) {
          try {
            const eventsList = JSON.parse(storedEvents);
            if (Array.isArray(eventsList) && eventsList.length > 0) {
              const sorted = [...eventsList]
                .filter((e: { deadline?: string }) => e.deadline)
                .sort(
                  (a: { deadline: string }, b: { deadline: string }) =>
                    new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
                );
              if (sorted.length > 0) {
                setUpcomingDeadline(sorted[0].deadline);
              }
            }
          } catch {}
        }
      });
    }

    // 3. Load profile from Supabase with valid column names
    const fetchProfile = async () => {
      let dbProfile: any = null;
      try {
        const { data } = await supabase
          .from("profiles")
          .select("full_name, username, avatar_url, college_name, department, leetcode_username, github_url")
          .eq("id", user.id)
          .single();
        dbProfile = data;
      } catch {}

      // Read draft & public profile from localStorage
      let draft: any = {};
      let publicProf: any = {};
      let localAvatar = "";
      if (typeof window !== "undefined") {
        try {
          const rawDraft = localStorage.getItem(`ldk_profile_draft_${user.id}`);
          if (rawDraft) draft = JSON.parse(rawDraft);
          const rawPublic = localStorage.getItem(`ldk_public_profile_${user.id}`);
          if (rawPublic) publicProf = JSON.parse(rawPublic);
          localAvatar = localStorage.getItem(`ldk_user_avatar_${user.id}`) || localStorage.getItem(`ldk_avatar_url_${user.id}`) || localStorage.getItem("ldk_avatar_url") || "";
        } catch {}
      }

      const fullName = dbProfile?.full_name || publicProf.full_name || draft.fullName || meta.full_name || "Developer";
      const username = dbProfile?.username || publicProf.username || draft.username || meta.username || "student";
      const avatarUrl = dbProfile?.avatar_url || publicProf.avatar_url || draft.avatarUrl || draft.avatar_url || meta.avatar_url || meta.picture || localAvatar || "";
      const collegeName = dbProfile?.college_name || publicProf.college_name || draft.collegeName || meta.college_name || "University Student";
      const department = dbProfile?.department || publicProf.department || draft.department || meta.department || "Computer Science";
      const lcHandle = dbProfile?.leetcode_username || publicProf.leetcode_username || draft.leetcodeUsername || meta.leetcode_username || handle || "";
      const ghUrl = dbProfile?.github_url || publicProf.github_url || draft.githubUrl || meta.github_url || "";
      const liUrl = publicProf.linkedin_url || draft.linkedinUrl || meta.linkedin_url || "";
      const pfUrl = publicProf.portfolio_url || draft.portfolioUrl || meta.portfolio_url || "";

      setProfile({
        full_name: fullName,
        username: username,
        avatar_url: avatarUrl,
        college_name: collegeName,
        department: department,
        leetcode_username: lcHandle,
        github_url: ghUrl,
      });

      // Compute exact profile completion %
      const fields = [fullName, username, collegeName, department, lcHandle, ghUrl, liUrl, pfUrl];
      const filled = fields.filter((f) => f && String(f).trim() !== "").length;
      setCompletion(Math.round((filled / fields.length) * 100));
    };

    fetchProfile();

    // 4. Fetch Online Friends (Prioritizing Workspace co-members)
    const fetchOnlineFriends = async () => {
      try {
        const { data: friendships } = await supabase
          .from("friendships")
          .select(`
            sender:sender_id ( id, username, full_name, avatar_url, department ),
            receiver:receiver_id ( id, username, full_name, avatar_url, department )
          `)
          .eq("status", "accepted");

        const rawFriends: OnlineFriend[] = [];

        if (friendships) {
          friendships.forEach((item: any) => {
            const partner = item.sender?.id === user.id ? item.receiver : item.sender;
            if (partner && partner.id !== user.id) {
              rawFriends.push({
                id: partner.id,
                full_name: partner.full_name || partner.username || "Peer",
                username: partner.username || "peer",
                avatar_url: partner.avatar_url,
                department: partner.department || "Engineering",
                inSharedWorkspace: false,
              });
            }
          });
        }

        // Add mock workspace co-members if list is short
        if (rawFriends.length === 0) {
          rawFriends.push(
            {
              id: "friend_1",
              full_name: "Aarav Sharma",
              username: "aarav_dev",
              department: "Computer Science",
              inSharedWorkspace: true,
              workspaceName: "HackHarvard Vault",
            },
            {
              id: "friend_2",
              full_name: "Priya Patel",
              username: "priya_p",
              department: "Information Technology",
              inSharedWorkspace: true,
              workspaceName: "AI Research Lab",
            }
          );
        }

        // Sort: co-members in shared workspace first
        rawFriends.sort((a, b) => (b.inSharedWorkspace ? 1 : 0) - (a.inSharedWorkspace ? 1 : 0));
        setOnlineFriends(rawFriends.slice(0, 5));
      } catch {
        setOnlineFriends([
          {
            id: "friend_1",
            full_name: "Aarav Sharma",
            username: "aarav_dev",
            department: "Computer Science",
            inSharedWorkspace: true,
            workspaceName: "HackHarvard Vault",
          },
          {
            id: "friend_2",
            full_name: "Priya Patel",
            username: "priya_p",
            department: "Information Technology",
            inSharedWorkspace: true,
            workspaceName: "AI Research Lab",
          },
        ]);
      }
    };

    fetchOnlineFriends();
  }, [user]);

  if (loading) {
    return (
      <div className="h-screen bg-bg-base flex flex-col items-center justify-center font-mono text-xs text-txt-muted gap-2">
        <div className="w-4 h-4 border border-border-main border-t-txt-main rounded-full animate-spin" />
        <span>Loading command center...</span>
      </div>
    );
  }

  // Unauthenticated Landing Page
  if (!user) {
    return (
      <div className="min-h-screen bg-bg-base text-txt-main flex flex-col font-sans selection:bg-accent-main selection:text-bg-base">
        <Header />
        <main className="flex-1 max-w-5xl w-full mx-auto px-6 md:px-12 py-16 flex flex-col items-center justify-center text-center gap-6">
          <span className="font-mono text-[9px] uppercase tracking-widest text-txt-muted border border-border-main/60 px-3 py-1 rounded-sm bg-bg-surface">
            Campus Engineer Command Center v2.0
          </span>
          <h1 className="font-display text-4xl md:text-5xl font-light tracking-tight text-txt-main max-w-2xl leading-tight">
            Track your competitive coding, team events, and study desks.
          </h1>
          <p className="text-xs text-txt-sub font-light max-w-lg leading-relaxed">
            Unified workspace for campus hackathons, LeetCode daily streaks, peer matchmaking, and AI teaching.
          </p>
          <div className="flex gap-3 pt-4">
            <Link
              href="/profile"
              className="h-10 px-6 bg-accent-main hover:opacity-90 text-bg-base font-mono text-[10px] tracking-wider uppercase font-bold rounded-sm flex items-center gap-2 transition-opacity"
            >
              Get Started <ArrowRight size={12} />
            </Link>
            <Link
              href="/explore"
              className="h-10 px-6 border border-border-main hover:bg-bg-card text-txt-main font-mono text-[10px] tracking-wider uppercase font-semibold rounded-sm transition-colors flex items-center gap-2"
            >
              Explore Arena
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-base text-txt-main flex flex-col font-sans selection:bg-accent-main selection:text-bg-base">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 md:px-12 pt-8 pb-2 flex flex-col gap-8">

        {/* ── TOP HEADER / USER PROFILE BANNER (EVENT DESK THEME) ─────────────── */}
        <div className="border border-border-main/70 bg-bg-surface p-6 rounded-md flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
          {/* User Profile Pill & Greeting */}
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="relative w-12 h-12 shrink-0 rounded-full overflow-hidden bg-bg-card border border-border-main flex items-center justify-center font-mono text-sm font-bold text-txt-main">
              {profile?.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={profile.avatar_url} alt={profile.full_name || "Profile"} className="w-full h-full object-cover" />
              ) : (
                (profile?.full_name || "D").charAt(0).toUpperCase()
              )}
            </div>

            {/* Name, Handle & Academic Info */}
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="font-display text-lg font-semibold tracking-tight text-txt-main truncate">
                  Welcome back, {profile?.full_name || "Developer"}
                </h1>
                {completion < 100 && (
                  <span className="text-[9px] font-mono text-txt-sub border border-border-main/70 bg-bg-card px-2 py-0.5 rounded-sm font-medium shrink-0">
                    {completion}% Complete
                  </span>
                )}
              </div>
              <span className="text-xs font-mono text-txt-muted truncate mt-0.5">
                @{profile?.username || "student"} · {profile?.department || "Computer Science"}
              </span>
            </div>
          </div>

          {/* Quick Streak & Actions */}
          <div className="flex items-center gap-3 font-mono text-[10px] uppercase">
            {stats && (
              <div className="bg-bg-base border border-border-main/70 px-3.5 py-2 rounded-sm flex items-center gap-2">
                <Flame size={13} className="text-txt-main" />
                <span className="text-txt-main font-semibold">{stats.streak} Day Streak</span>
              </div>
            )}

            <Link
              href="/profile"
              className="h-9 px-3.5 border border-border-main hover:bg-bg-card text-txt-main rounded-sm transition-colors flex items-center gap-1.5 font-medium"
            >
              Edit Profile
            </Link>
          </div>
        </div>

        {/* ── 3-COLUMN COMMAND CENTER GRID ──────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* ───────────────────────────────────────────────────────────────── */}
          {/* COLUMN 1: LEFT SIDEBAR (Snapshot & Online Friends)               */}
          {/* ───────────────────────────────────────────────────────────────── */}
          <div className="lg:col-span-3 flex flex-col gap-6">

            {/* 1. Today's Snapshot */}
            <div className="border border-border-main/60 bg-bg-surface p-5 rounded-md flex flex-col gap-4">
              <span className="font-mono text-[9px] uppercase tracking-widest text-txt-muted font-bold">
                Today&apos;s Snapshot
              </span>

              <div className="flex flex-col gap-3 font-mono text-xs">
                <div className="flex justify-between items-center py-1">
                  <span className="text-txt-sub font-light">Daily Challenge</span>
                  {stats?.dailyChallengeStatus === "solved" ? (
                    <span className="text-txt-main font-semibold flex items-center gap-1">
                      <CheckCircle2 size={12} /> Solved
                    </span>
                  ) : (
                    <span className="text-txt-muted font-light flex items-center gap-1">
                      <AlertCircle size={12} /> Pending
                    </span>
                  )}
                </div>

                <div className="flex justify-between items-center py-1 border-t border-border-main/30">
                  <span className="text-txt-sub font-light">Current Streak</span>
                  <span className="text-txt-main font-bold">{stats?.streak || 0} Days</span>
                </div>

                <div className="flex justify-between items-center py-1 border-t border-border-main/30">
                  <span className="text-txt-sub font-light">Total Solved</span>
                  <span className="text-txt-main font-bold">{stats?.solvedTotal || 0} Problems</span>
                </div>
              </div>
            </div>

            {/* 2. Online Friends (Prioritizing Shared Workspaces) */}
            <div className="border border-border-main/60 bg-bg-surface p-5 rounded-md flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[9px] uppercase tracking-widest text-txt-muted font-bold">
                  Online Friends
                </span>
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              </div>

              <div className="flex flex-col gap-2">
                {onlineFriends.map((friend) => (
                  <div
                    key={friend.id}
                    className="flex items-center justify-between p-2 rounded-sm bg-bg-base border border-border-main/40 text-xs font-mono"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="relative w-6 h-6 rounded-full bg-bg-card border border-border-main/60 flex items-center justify-center font-bold text-txt-main shrink-0 overflow-hidden text-[9px]">
                        {friend.avatar_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={friend.avatar_url} alt={friend.full_name} className="w-full h-full object-cover" />
                        ) : (
                          friend.full_name.charAt(0).toUpperCase()
                        )}
                        <span className="absolute bottom-0 right-0 w-1.5 h-1.5 bg-emerald-400 rounded-full ring-1 ring-bg-surface" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-txt-main font-semibold truncate leading-tight">
                          {friend.full_name}
                        </span>
                        <span className="text-[9px] text-txt-muted truncate">
                          {friend.inSharedWorkspace ? (
                            <span className="text-txt-main font-semibold">★ {friend.workspaceName || "Team Space"}</span>
                          ) : (
                            friend.department
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}

                {onlineFriends.length === 0 && (
                  <span className="text-[10px] font-mono text-txt-muted italic py-1">
                    No online friends right now.
                  </span>
                )}
              </div>

              <Link
                href="/explore?tab=friends"
                className="text-[9px] font-mono text-txt-sub hover:text-txt-main transition-colors uppercase font-bold flex items-center gap-1 self-start"
              >
                Find &amp; Add Friends →
              </Link>
            </div>

          </div>

          {/* ───────────────────────────────────────────────────────────────── */}
          {/* COLUMN 2: CENTER DESK CARDS (Event Desk top, Coding Desk bottom) */}
          {/* ───────────────────────────────────────────────────────────────── */}
          <div className="lg:col-span-6 flex flex-col gap-6">

            {/* CARD 1: EVENT DESK (TOP) */}
            <div className="border border-border-main/60 bg-bg-surface p-6 rounded-md flex flex-col gap-5">
              <div className="flex items-center justify-between border-b border-border-main/30 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-bg-card border border-border-main/60 text-txt-main rounded-sm">
                    <FolderGit2 size={15} />
                  </div>
                  <div className="flex flex-col">
                    <h2 className="font-display text-base font-semibold text-txt-main">
                      Event Desk
                    </h2>
                    <span className="text-[10px] font-mono text-txt-muted">
                      Team workspaces &amp; hackathon vault
                    </span>
                  </div>
                </div>
                <Link
                  href="/event-desk"
                  className="text-[10px] font-mono text-txt-sub hover:text-txt-main uppercase font-bold flex items-center gap-1 transition-colors"
                >
                  Open Desk <ArrowRight size={11} />
                </Link>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                <div className="bg-bg-base p-3.5 border border-border-main/40 rounded-sm flex flex-col gap-1">
                  <span className="text-txt-muted uppercase text-[9px]">Active Workspaces</span>
                  <span className="text-txt-main font-bold text-sm">
                    {activeWorkspacesCount} Team Spaces
                  </span>
                </div>
                <div className="bg-bg-base p-3.5 border border-border-main/40 rounded-sm flex flex-col gap-1">
                  <span className="text-txt-muted uppercase text-[9px]">Next Deadline</span>
                  <span className="text-txt-main font-bold text-sm truncate">
                    {upcomingDeadline || "Nov 20, 2026"}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-border-main/30 pt-3 text-[10px] font-mono">
                <span className="text-txt-sub font-light">Collaborate on hackathons &amp; submissions</span>
                <Link
                  href="/event-desk"
                  className="h-8 px-4 bg-accent-main hover:opacity-90 text-bg-base font-mono text-[10px] font-bold uppercase rounded-sm flex items-center gap-1 cursor-pointer transition-opacity"
                >
                  <Plus size={11} /> Create Workspace
                </Link>
              </div>
            </div>

            {/* CARD 2: CODING DESK (BOTTOM) */}
            <div className="border border-border-main/60 bg-bg-surface p-6 rounded-md flex flex-col gap-5">
              <div className="flex items-center justify-between border-b border-border-main/30 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-bg-card border border-border-main/60 text-txt-main rounded-sm">
                    <Code size={15} />
                  </div>
                  <div className="flex flex-col">
                    <h2 className="font-display text-base font-semibold text-txt-main">
                      Coding Desk
                    </h2>
                    <span className="text-[10px] font-mono text-txt-muted">
                      Competitive platform statistics
                    </span>
                  </div>
                </div>
                <Link
                  href="/coding-deck"
                  className="text-[10px] font-mono text-txt-sub hover:text-txt-main uppercase font-bold flex items-center gap-1 transition-colors"
                >
                  Open Coding Desk <ArrowRight size={11} />
                </Link>
              </div>

              {leetcodeHandle ? (
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-txt-sub font-light">Connected Handle:</span>
                    <span className="text-txt-main font-bold">@{leetcodeHandle}</span>
                  </div>

                  <div className="grid grid-cols-3 gap-3 text-center font-mono">
                    <div className="bg-bg-base p-3 border border-border-main/40 rounded-sm flex flex-col gap-0.5">
                      <span className="text-[8px] text-txt-muted uppercase font-bold">Easy</span>
                      <span className="text-sm text-txt-main font-bold">{stats?.easySolved || 0}</span>
                    </div>
                    <div className="bg-bg-base p-3 border border-border-main/40 rounded-sm flex flex-col gap-0.5">
                      <span className="text-[8px] text-txt-muted uppercase font-bold">Medium</span>
                      <span className="text-sm text-txt-main font-bold">{stats?.mediumSolved || 0}</span>
                    </div>
                    <div className="bg-bg-base p-3 border border-border-main/40 rounded-sm flex flex-col gap-0.5">
                      <span className="text-[8px] text-txt-muted uppercase font-bold">Hard</span>
                      <span className="text-sm text-txt-main font-bold">{stats?.hardSolved || 0}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 border border-dashed border-border-main/60 rounded-sm flex flex-col items-center gap-2 text-center text-xs font-mono">
                  <span className="text-txt-muted font-light">Link your LeetCode handle to view live problem statistics.</span>
                  <Link
                    href="/profile"
                    className="mt-1 px-3 py-1.5 bg-accent-main text-bg-base font-bold rounded-sm text-[9px] uppercase"
                  >
                    Link Handle Now →
                  </Link>
                </div>
              )}
            </div>

          </div>

          {/* ───────────────────────────────────────────────────────────────── */}
          {/* COLUMN 3: RIGHT SIDEBAR (Quick Actions & Difficulty Progress)      */}
          {/* ───────────────────────────────────────────────────────────────── */}
          <div className="lg:col-span-3 flex flex-col gap-6">

            {/* Quick Actions */}
            <div className="border border-border-main/60 bg-bg-surface p-5 rounded-md flex flex-col gap-3">
              <span className="font-mono text-[9px] uppercase tracking-widest text-txt-muted font-bold">
                Quick Actions
              </span>
              <div className="flex flex-col gap-2 font-mono text-[10px] uppercase">
                <Link
                  href="/event-desk"
                  className="p-2.5 border border-border-main/40 bg-bg-base hover:bg-bg-card rounded-sm text-txt-main transition-colors flex items-center justify-between"
                >
                  <span>New Workspace</span>
                  <Plus size={11} />
                </Link>
                <Link
                  href="/coding-deck"
                  className="p-2.5 border border-border-main/40 bg-bg-base hover:bg-bg-card rounded-sm text-txt-main transition-colors flex items-center justify-between"
                >
                  <span>Solve Daily Challenge</span>
                  <Code size={11} />
                </Link>
                <Link
                  href="/explore?tab=friends"
                  className="p-2.5 border border-border-main/40 bg-bg-base hover:bg-bg-card rounded-sm text-txt-main transition-colors flex items-center justify-between"
                >
                  <span>Find Teammates</span>
                  <UserPlus size={11} />
                </Link>
              </div>
            </div>

            {/* Problem Solving Breakdown */}
            <div className="border border-border-main/60 bg-bg-surface p-5 rounded-md flex flex-col gap-3">
              <span className="font-mono text-[9px] uppercase tracking-widest text-txt-muted font-bold">
                Problem Breakdown
              </span>

              <div className="flex flex-col gap-3 text-xs font-mono">
                <div>
                  <div className="flex justify-between text-[10px] mb-1">
                    <span className="text-txt-sub font-medium">Easy</span>
                    <span className="text-txt-muted">{stats?.easySolved || 0} Solved</span>
                  </div>
                  <div className="w-full h-1 bg-bg-base rounded-full overflow-hidden">
                    <div
                      className="h-full bg-txt-main rounded-full"
                      style={{ width: `${Math.min(100, ((stats?.easySolved || 0) / 200) * 100)}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[10px] mb-1">
                    <span className="text-txt-sub font-medium">Medium</span>
                    <span className="text-txt-muted">{stats?.mediumSolved || 0} Solved</span>
                  </div>
                  <div className="w-full h-1 bg-bg-base rounded-full overflow-hidden">
                    <div
                      className="h-full bg-txt-main/80 rounded-full"
                      style={{ width: `${Math.min(100, ((stats?.mediumSolved || 0) / 150) * 100)}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[10px] mb-1">
                    <span className="text-txt-sub font-medium">Hard</span>
                    <span className="text-txt-muted">{stats?.hardSolved || 0} Solved</span>
                  </div>
                  <div className="w-full h-1 bg-bg-base rounded-full overflow-hidden">
                    <div
                      className="h-full bg-txt-main/60 rounded-full"
                      style={{ width: `${Math.min(100, ((stats?.hardSolved || 0) / 50) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>

      </main>

      <Footer />
    </div>
  );
}
