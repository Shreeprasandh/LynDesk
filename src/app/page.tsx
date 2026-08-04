"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "./context/AuthContext";
import Link from "next/link";
import Header from "./components/Header";
import { 
  Code, 
  Calendar, 
  BookOpen, 
  Users, 
  ArrowRight, 
  Flame
} from "lucide-react";

export default function Home() {
  const { user, loading: authLoading } = useAuth();
  const [codingStats, setCodingStats] = useState<any>(null);
  const [workspaceCount, setWorkspaceCount] = useState<number>(0);
  const nextDeadline = "Nov 02, 2026";

  // Load summary stats for overview cards
  useEffect(() => {
    if (!user) return;

    // Load cached coding stats
    if (typeof window !== "undefined") {
      const cachedStats = localStorage.getItem(`ldk_coding_stats_${user.id}`);
      const localEvents = localStorage.getItem("ldk_events");
      
      queueMicrotask(() => {
        if (cachedStats) {
          try {
            setCodingStats(JSON.parse(cachedStats));
          } catch {}
        }
        if (localEvents) {
          try {
            const eventsArr = JSON.parse(localEvents);
            setWorkspaceCount(eventsArr.length);
          } catch {}
        }
      });
    }
  }, [user]);

  if (authLoading) {
    return (
      <div className="h-screen bg-bg-base flex flex-col items-center justify-center font-mono text-xs text-txt-muted gap-2">
        <div className="w-4 h-4 border-2 border-accent-main border-t-transparent rounded-full animate-spin" />
        <span>Syncing session...</span>
      </div>
    );
  }

  // Landing view for unauthenticated visitors
  if (!user) {
    return (
      <div className="min-h-screen bg-bg-base text-txt-main flex flex-col font-sans">
        <Header />
        <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-16 flex flex-col items-center justify-center text-center gap-6">
          <span className="font-mono text-xs uppercase tracking-widest text-amber-500 border border-amber-500/30 px-3 py-1 rounded bg-amber-500/10">
            Quantum Engine v2.0
          </span>
          <h1 className="font-display text-4xl sm:text-6xl font-light tracking-tight text-txt-main max-w-3xl leading-tight">
            The All-in-One Academic & Engineering Workspace
          </h1>
          <p className="text-sm sm:text-base text-txt-sub max-w-2xl font-light leading-relaxed">
            Unifying project workspaces, real-time coding platform statistics, AI-powered study rooms, and campus matchmaking into a single developer portal.
          </p>
          <div className="flex items-center gap-4 mt-4">
            <Link 
              href="/profile" 
              className="h-11 px-6 bg-accent-main text-bg-base font-mono text-xs uppercase font-bold tracking-wider rounded flex items-center gap-2 hover:opacity-90 transition-opacity"
            >
              Sign In to Portal <ArrowRight size={14} />
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const lcStreak = codingStats?.leetcode?.leetcodeStreak || 0;
  const lcSolved = codingStats?.leetcode?.solved || 0;

  return (
    <div className="min-h-screen bg-bg-base text-txt-main flex flex-col font-sans selection:bg-accent-main selection:text-bg-base">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 md:px-12 py-8 flex flex-col gap-8">
        
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-border-main/40 pb-6 gap-4">
          <div className="flex flex-col gap-1">
            <span className="font-mono text-[9px] uppercase tracking-widest text-txt-muted">Command Hub</span>
            <h1 className="font-display text-3xl sm:text-4xl font-light tracking-tight text-txt-main">
              Welcome back, {user.user_metadata?.full_name || "Engineer"}
            </h1>
            <p className="text-xs text-txt-sub">
              Your centralized overview across Coding Desk, Event Desk, Study Desk, and Explore.
            </p>
          </div>

          <div className="flex items-center gap-2 font-mono text-[10px] uppercase text-txt-muted bg-bg-surface border border-border-main/60 px-3 py-1.5 rounded">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span>Portal Operational</span>
          </div>
        </div>

        {/* Overview Grid: 4 Core Desks */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* 1. Coding Desk Overview */}
          <div className="border border-border-main/70 bg-bg-surface p-6 rounded-md flex flex-col justify-between gap-5 hover:border-border-main transition-colors">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded bg-amber-500/10 border border-amber-500/30 text-amber-500">
                    <Code size={16} />
                  </div>
                  <span className="font-display text-base font-semibold text-txt-main">Coding Desk</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-mono text-amber-400 font-bold bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 rounded">
                  <Flame size={12} className="animate-pulse" /> {lcStreak} Day Streak
                </div>
              </div>

              <p className="text-xs text-txt-sub font-light">
                Track live LeetCode daily challenge status, problem solving totals, and contest ratings.
              </p>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="border border-border-main/50 bg-bg-base/40 p-3 rounded flex flex-col gap-1">
                  <span className="text-[9px] font-mono text-txt-muted uppercase">Solved Problems</span>
                  <span className="text-lg font-mono font-bold text-txt-main">{lcSolved > 0 ? lcSolved : "--"}</span>
                </div>
                <div className="border border-border-main/50 bg-bg-base/40 p-3 rounded flex flex-col gap-1">
                  <span className="text-[9px] font-mono text-txt-muted uppercase">Daily Challenge</span>
                  <span className="text-xs font-mono font-semibold text-emerald-400">Active Check</span>
                </div>
              </div>
            </div>

            <Link 
              href="/coding-deck" 
              className="h-9 px-4 border border-border-main/80 hover:bg-bg-card text-txt-main font-mono text-[10px] uppercase tracking-wider rounded transition-colors flex items-center justify-between mt-2"
            >
              <span>Open Coding Desk</span>
              <ArrowRight size={12} />
            </Link>
          </div>

          {/* 2. Event Desk Overview */}
          <div className="border border-border-main/70 bg-bg-surface p-6 rounded-md flex flex-col justify-between gap-5 hover:border-border-main transition-colors">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded bg-blue-500/10 border border-blue-500/30 text-blue-400">
                    <Calendar size={16} />
                  </div>
                  <span className="font-display text-base font-semibold text-txt-main">Event Desk</span>
                </div>
                <span className="text-xs font-mono text-blue-400 bg-blue-500/10 border border-blue-500/30 px-2.5 py-1 rounded font-semibold">
                  {workspaceCount} Workspaces
                </span>
              </div>

              <p className="text-xs text-txt-sub font-light">
                Manage team workspaces, track hackathon submission stages, and monitor live project repos.
              </p>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="border border-border-main/50 bg-bg-base/40 p-3 rounded flex flex-col gap-1">
                  <span className="text-[9px] font-mono text-txt-muted uppercase">Active Projects</span>
                  <span className="text-lg font-mono font-bold text-txt-main">{workspaceCount}</span>
                </div>
                <div className="border border-border-main/50 bg-bg-base/40 p-3 rounded flex flex-col gap-1">
                  <span className="text-[9px] font-mono text-txt-muted uppercase">Next Target</span>
                  <span className="text-xs font-mono font-semibold text-txt-main truncate">{nextDeadline}</span>
                </div>
              </div>
            </div>

            <Link 
              href="/event-desk" 
              className="h-9 px-4 border border-border-main/80 hover:bg-bg-card text-txt-main font-mono text-[10px] uppercase tracking-wider rounded transition-colors flex items-center justify-between mt-2"
            >
              <span>Open Event Desk</span>
              <ArrowRight size={12} />
            </Link>
          </div>

          {/* 3. Study Desk Overview */}
          <div className="border border-border-main/70 bg-bg-surface p-6 rounded-md flex flex-col justify-between gap-5 hover:border-border-main transition-colors">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded bg-purple-500/10 border border-purple-500/30 text-purple-400">
                    <BookOpen size={16} />
                  </div>
                  <span className="font-display text-base font-semibold text-txt-main">Study Desk</span>
                </div>
                <span className="text-xs font-mono text-purple-400 bg-purple-500/10 border border-purple-500/30 px-2.5 py-1 rounded font-semibold">
                  AI Teaching Ready
                </span>
              </div>

              <p className="text-xs text-txt-sub font-light">
                Access faculty materials, join collaborative study rooms, and learn topics point-by-point with Gemini AI.
              </p>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="border border-border-main/50 bg-bg-base/40 p-3 rounded flex flex-col gap-1">
                  <span className="text-[9px] font-mono text-txt-muted uppercase">Classroom Hub</span>
                  <span className="text-xs font-mono font-semibold text-emerald-400">Materials Linked</span>
                </div>
                <div className="border border-border-main/50 bg-bg-base/40 p-3 rounded flex flex-col gap-1">
                  <span className="text-[9px] font-mono text-txt-muted uppercase">Study Mode</span>
                  <span className="text-xs font-mono font-semibold text-purple-400">AI Tutor Available</span>
                </div>
              </div>
            </div>

            <Link 
              href="/study-desk" 
              className="h-9 px-4 border border-border-main/80 hover:bg-bg-card text-txt-main font-mono text-[10px] uppercase tracking-wider rounded transition-colors flex items-center justify-between mt-2"
            >
              <span>Open Study Desk</span>
              <ArrowRight size={12} />
            </Link>
          </div>

          {/* 4. Explore & Social Network Overview */}
          <div className="border border-border-main/70 bg-bg-surface p-6 rounded-md flex flex-col justify-between gap-5 hover:border-border-main transition-colors">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                    <Users size={16} />
                  </div>
                  <span className="font-display text-base font-semibold text-txt-main">Explore & Network</span>
                </div>
                <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded font-semibold">
                  Matchmaking Live
                </span>
              </div>

              <p className="text-xs text-txt-sub font-light">
                Discover student developers by tech stack, connect with friends, and view faculty-recommended hackathons.
              </p>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="border border-border-main/50 bg-bg-base/40 p-3 rounded flex flex-col gap-1">
                  <span className="text-[9px] font-mono text-txt-muted uppercase">Arena Status</span>
                  <span className="text-xs font-mono font-semibold text-emerald-400">Open for Teams</span>
                </div>
                <div className="border border-border-main/50 bg-bg-base/40 p-3 rounded flex flex-col gap-1">
                  <span className="text-[9px] font-mono text-txt-muted uppercase">Network Hub</span>
                  <span className="text-xs font-mono font-semibold text-txt-main">4 Sub-Tabs</span>
                </div>
              </div>
            </div>

            <Link 
              href="/explore" 
              className="h-9 px-4 border border-border-main/80 hover:bg-bg-card text-txt-main font-mono text-[10px] uppercase tracking-wider rounded transition-colors flex items-center justify-between mt-2"
            >
              <span>Explore Network</span>
              <ArrowRight size={12} />
            </Link>
          </div>

        </div>

      </main>
    </div>
  );
}
