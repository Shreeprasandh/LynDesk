"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "./context/AuthContext";
import { supabase } from "./lib/supabase";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Code,
  Flame,
  Plus,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  UserPlus,
  FolderGit2,
  Link2,
  Users,
  Award,
  Globe,
  Mail,
} from "lucide-react";

// Brand Icon Helpers
const DiscordIcon = ({ size = 14 }: { size?: number }) => (
  <svg viewBox="0 0 127.14 96.36" width={size} height={size} fill="currentColor">
    <path d="M107.7,8.07A105.15,105.15,0,0,0,77.26,0a77.19,77.19,0,0,0-3.3,6.83A96.67,96.67,0,0,0,53.22,6.83,77.19,77.19,0,0,0,49.88,0,105.15,105.15,0,0,0,19.44,8.07C3.66,31.58-1.86,54.65,1,77.53A105.73,105.73,0,0,0,32,96.36a77.7,77.7,0,0,0,6.63-10.85,68.43,68.43,0,0,1-10.5-5c.9-.65,1.76-1.34,2.58-2a75.58,75.58,0,0,0,73.08,0c.83.71,1.69,1.4,2.59,2a68.61,68.61,0,0,1-10.5,5,77.45,77.45,0,0,0,6.63,10.85,105.73,105.73,0,0,0,31.58-18.83C129.24,49.07,122.86,26.32,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53S36.18,40.36,42.45,40.36,53.83,46,53.83,53,48.72,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.24,60,73.24,53S78.41,40.36,84.69,40.36,96.07,46,96.07,53,91,65.69,84.69,65.69Z" />
  </svg>
);

const GithubIcon = ({ size = 14 }: { size?: number }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
  </svg>
);

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
  
  // Instant 0ms Sync Profile Initialization from localStorage or user_metadata
  const [profile, setProfile] = useState<DashboardProfile | null>(() => {
    if (typeof window !== "undefined" && user) {
      try {
        const meta = user.user_metadata || {};
        const rawPublic = localStorage.getItem(`ldk_public_profile_${user.id}`);
        const publicProf = rawPublic ? JSON.parse(rawPublic) : {};
        const rawDraft = localStorage.getItem(`ldk_profile_draft_${user.id}`);
        const draft = rawDraft ? JSON.parse(rawDraft) : {};

        const fullName = publicProf.full_name || draft.fullName || meta.full_name || meta.name || "";
        const username = publicProf.username || draft.username || meta.username || user.email?.split("@")[0] || "";
        if (fullName || username) {
          return {
            full_name: fullName,
            username: username,
            avatar_url: publicProf.avatar_url || draft.avatarUrl || meta.avatar_url || meta.picture || "",
            college_name: publicProf.college_name || draft.collegeName || meta.college_name || "",
            department: publicProf.department || draft.department || meta.department || "",
            leetcode_username: publicProf.leetcode_username || draft.leetcodeUsername || meta.leetcode_username || "",
            github_url: publicProf.github_url || draft.githubUrl || meta.github_url || "",
          };
        }
      } catch {}
    }
    return null;
  });

  // 0ms Synchronous Completion Calculation
  const [completion, setCompletion] = useState<number>(() => {
    if (typeof window !== "undefined" && user) {
      try {
        const rawPublic = localStorage.getItem(`ldk_public_profile_${user.id}`);
        const publicProf = rawPublic ? JSON.parse(rawPublic) : {};
        const rawDraft = localStorage.getItem(`ldk_profile_draft_${user.id}`);
        const draft = rawDraft ? JSON.parse(rawDraft) : {};
        const meta = user.user_metadata || {};

        const fullName = publicProf.full_name || draft.fullName || meta.full_name || "";
        const username = publicProf.username || draft.username || meta.username || "";
        const collegeName = publicProf.college_name || draft.collegeName || meta.college_name || "";
        const department = publicProf.department || draft.department || meta.department || "";
        const lcHandle = publicProf.leetcode_username || draft.leetcodeUsername || meta.leetcode_username || "";
        const ghUrl = publicProf.github_url || draft.githubUrl || meta.github_url || "";
        const liUrl = publicProf.linkedin_url || draft.linkedinUrl || meta.linkedin_url || "";
        const pfUrl = publicProf.portfolio_url || draft.portfolioUrl || meta.portfolio_url || "";

        const fields = [fullName, username, collegeName, department, lcHandle, ghUrl, liUrl, pfUrl];
        const filled = fields.filter((f) => f && String(f).trim() !== "").length;
        return Math.round((filled / fields.length) * 100);
      } catch {}
    }
    return 0;
  });

  // Authentication States
  const [authStep, setAuthStep] = useState<"idle" | "login" | "signup" | "faculty_login">("idle");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [staffKey, setStaffKey] = useState("");
  const [authActionLoading, setAuthActionLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Coding stats state - 0ms Cache Reader
  const [stats, setStats] = useState<LocalStats | null>(() => {
    if (typeof window !== "undefined" && user) {
      try {
        const cached = localStorage.getItem(`ldk_coding_stats_${user.id}`);
        if (cached) return JSON.parse(cached);
      } catch {}
    }
    return null;
  });
  const [leetcodeHandle, setLeetcodeHandle] = useState<string>("");

  // Online friends state - 0ms instant cache initialization
  const [onlineFriends, setOnlineFriends] = useState<OnlineFriend[]>(() => {
    if (typeof window !== "undefined" && user) {
      try {
        const cached = localStorage.getItem(`ldk_online_friends_${user.id}`);
        if (cached) return JSON.parse(cached);
      } catch {}
    }
    return [
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
    ];
  });

  // Deadlines & workspace counts - 0ms Cache Readers
  const [upcomingDeadline, setUpcomingDeadline] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      try {
        const storedEvents = localStorage.getItem("ldk_opportunities");
        if (storedEvents) {
          const eventsList = JSON.parse(storedEvents);
          if (Array.isArray(eventsList) && eventsList.length > 0) {
            const sorted = [...eventsList]
              .filter((e: { deadline?: string }) => e.deadline)
              .sort(
                (a: { deadline: string }, b: { deadline: string }) =>
                  new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
              );
            if (sorted.length > 0) return sorted[0].deadline;
          }
        }
      } catch {}
    }
    return null;
  });

  const [activeWorkspacesCount, setActiveWorkspacesCount] = useState<number>(() => {
    if (typeof window !== "undefined") {
      try {
        const storedWs = localStorage.getItem("ldk_joined_workspaces");
        if (storedWs) {
          const list = JSON.parse(storedWs);
          return Array.isArray(list) ? list.length : 0;
        }
      } catch {}
    }
    return 0;
  });

  useEffect(() => {
    queueMicrotask(() => setStaffKey(""));
  }, [authStep]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthActionLoading(true);
    setAuthError(null);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      setAuthError(error.message);
      setAuthActionLoading(false);
    }
  };

  const handleFacultyLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthActionLoading(true);
    setAuthError(null);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setAuthError(error.message);
      setAuthActionLoading(false);
      return;
    }

    if (!data.user) {
      setAuthError("Authentication failed.");
      setAuthActionLoading(false);
      return;
    }

    const staffList = data.user.user_metadata?.registered_staff || [];
    if (staffList.length === 0 || !staffList.find((s: any) => s.key === "ADMIN")) {
      staffList.push({ name: "Main Administrator", key: "ADMIN" });
    }

    const matched = staffList.find((s: any) => s.key === staffKey.trim());
    if (matched) {
      localStorage.setItem("faculty_staff_member", JSON.stringify(matched));
      window.location.href = "/coordinator";
    } else {
      await supabase.auth.signOut();
      setAuthError("Invalid Staff Key. Access denied.");
      setAuthActionLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthActionLoading(true);
    setAuthError(null);
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) {
      setAuthError(error.message);
      setAuthActionLoading(false);
    } else {
      setAuthError("Registration successful. Check your email for verification.");
      setAuthActionLoading(false);
    }
  };

  const handleOAuthLogin = async (provider: "google" | "github" | "discord" | "linkedin") => {
    setAuthActionLoading(true);
    setAuthError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: provider === "linkedin" ? "linkedin_oidc" : provider,
      options: {
        redirectTo: typeof window !== "undefined" ? window.location.origin : undefined,
      },
    });
    if (error) {
      setAuthError(error.message);
      setAuthActionLoading(false);
    }
  };

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

      const fallbackName = meta.full_name || meta.name || user?.email?.split("@")[0] || "Student";
      const fallbackUsername = meta.username || user?.email?.split("@")[0] || "student";
      const fullName = dbProfile?.full_name || publicProf.full_name || draft.fullName || fallbackName;
      const username = dbProfile?.username || publicProf.username || draft.username || fallbackUsername;
      const isValidImage = (s: any) => typeof s === "string" && (s.startsWith("http://") || s.startsWith("https://") || s.startsWith("data:image/"));
      const rawAvatar = [
        dbProfile?.avatar_url,
        publicProf.avatar_url,
        draft.avatarUrl,
        draft.avatar_url,
        localAvatar,
        meta.avatar_url,
        meta.picture
      ].find(isValidImage) || "";
      const avatarUrl = rawAvatar;
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

    if (typeof window !== "undefined") {
      window.addEventListener("ldk_profile_update", fetchProfile);
    }

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
        const finalFriends = rawFriends.slice(0, 5);
        setOnlineFriends(finalFriends);
        if (typeof window !== "undefined" && user?.id) {
          localStorage.setItem(`ldk_online_friends_${user.id}`, JSON.stringify(finalFriends));
        }
      } catch {
        const defaultFriends = [
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
        ];
        setOnlineFriends(defaultFriends);
      }
    };

    fetchOnlineFriends();

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("ldk_profile_update", fetchProfile);
      }
    };
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-base text-txt-main flex flex-col font-sans">
        <Header />
        <main className="flex-1 max-w-7xl w-full mx-auto px-6 md:px-12 pt-8 pb-12 flex flex-col gap-8">
          <div className="border border-border-main/70 bg-bg-surface p-6 rounded-md flex flex-col md:flex-row md:items-center justify-between gap-6 animate-pulse">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-bg-card border border-border-main/60 shrink-0" />
              <div className="flex flex-col gap-2">
                <div className="h-5 w-48 bg-bg-card rounded-sm" />
                <div className="h-3 w-32 bg-bg-card rounded-sm" />
              </div>
            </div>
            <div className="flex items-center gap-3 font-mono text-xs">
              <div className="h-9 w-28 bg-bg-card rounded-sm" />
              <div className="h-9 w-24 bg-bg-card rounded-sm" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="h-36 border border-border-main/60 bg-bg-surface rounded-md p-5 animate-pulse" />
            <div className="h-36 border border-border-main/60 bg-bg-surface rounded-md p-5 animate-pulse" />
            <div className="h-36 border border-border-main/60 bg-bg-surface rounded-md p-5 animate-pulse" />
          </div>
        </main>
      </div>
    );
  }

  // Unauthenticated Landing & Authentication Portal Page
  if (!user) {
    return (
      <div className="h-screen overflow-hidden flex flex-col font-sans bg-bg-base text-txt-main selection:bg-accent-main selection:text-bg-base">
        <Header />

        <main className="flex-1 max-w-7xl w-full mx-auto px-6 md:px-12 py-3 lg:py-4 overflow-y-auto lg:overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-center">
          
          {/* Left Column: Typographic layout */}
          <section className="lg:col-span-7 flex flex-col items-start gap-6 lg:gap-8 lg:pr-6">
            <div className="flex flex-col gap-2">
              <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-txt-muted font-semibold">
                Link Your Next Desk
              </span>
              <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-light tracking-[-0.03em] text-txt-main leading-[1.08]">
                The space where technical projects <span className="font-normal border-b border-txt-main/30">take shape.</span>
              </h1>
            </div>
            
            <p className="text-txt-sub text-xs sm:text-sm leading-relaxed max-w-lg font-light">
              An index for student hackathons, team workspaces, and academic credit coordination. 
              No noise, no vanity metrics. Just a vault to organize your code, files, and milestones.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full pt-5 border-t border-border-main/60">
              <div className="flex flex-col gap-2">
                <div className="h-8 w-8 rounded-sm border border-border-main/80 bg-bg-surface flex items-center justify-center text-txt-main shrink-0">
                  <Link2 size={14} className="stroke-[1.5]" />
                </div>
                <h3 className="font-display text-xs font-semibold tracking-tight text-txt-main">The Registry</h3>
                <p className="text-[11px] text-txt-muted leading-relaxed font-light">
                  Paste any event link. The parser organizes deadlines, stage timelines, and guidelines into your personal vault.
                </p>
              </div>
              
              <div className="flex flex-col gap-2">
                <div className="h-8 w-8 rounded-sm border border-border-main/80 bg-bg-surface flex items-center justify-center text-txt-main shrink-0">
                  <Users size={14} className="stroke-[1.5]" />
                </div>
                <h3 className="font-display text-xs font-semibold tracking-tight text-txt-main">Workspace Decks</h3>
                <p className="text-[11px] text-txt-muted leading-relaxed font-light">
                  A shared portal mapping your active slide deck, code repositories, team discussions, and voice channels.
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <div className="h-8 w-8 rounded-sm border border-border-main/80 bg-bg-surface flex items-center justify-center text-txt-main shrink-0">
                  <Award size={14} className="stroke-[1.5]" />
                </div>
                <h3 className="font-display text-xs font-semibold tracking-tight text-txt-main">Campus Credits</h3>
                <p className="text-[11px] text-txt-muted leading-relaxed font-light">
                  Export certified summaries of project completions directly to department coordinators for academic validation.
                </p>
              </div>
            </div>
          </section>

          {/* Right Column: Portal Terminal Auth Card */}
          <section className="lg:col-span-5 w-full flex justify-center">
            <div className="w-full max-w-md border border-border-main/70 bg-bg-surface p-6 rounded-lg shadow-[0_4px_24px_rgba(0,0,0,0.02)] transition-shadow duration-300">
              <AnimatePresence mode="wait">
                {authStep === "idle" && (
                  <motion.div 
                    key="idle"
                    initial={{ opacity: 0, y: 3 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -3 }}
                    transition={{ duration: 0.12, ease: [0.16, 1, 0.3, 1] }}
                    className="flex flex-col gap-4"
                  >
                    <div className="flex flex-col gap-1">
                      <h2 className="font-display text-base font-semibold tracking-tight text-txt-main">
                        Authenticate Credentials
                      </h2>
                      <p className="text-[11px] text-txt-muted font-light">
                        Establish a secure session to access your workspaces.
                      </p>
                    </div>

                    {authError && (
                      <div className="text-[11px] text-txt-muted bg-bg-card border border-border-main/60 p-2 rounded-sm font-mono tracking-tight text-center">
                        {authError}
                      </div>
                    )}

                    <button 
                      onClick={() => {
                        setAuthError(null);
                        setAuthStep("login");
                      }}
                      className="w-full h-10 rounded-sm border border-border-main/80 hover:bg-bg-card text-txt-main font-medium text-[11px] tracking-wider uppercase flex items-center justify-center gap-2 transition-colors duration-150 focus:outline-none focus:ring-1 focus:ring-ring-main cursor-pointer"
                    >
                      <Mail size={13} className="stroke-[1.5]" />
                      Email Credentials
                    </button>

                    <div className="relative flex py-0.5 items-center">
                      <div className="flex-grow border-t border-border-main/60"></div>
                      <span className="flex-shrink mx-2 text-[9px] font-mono tracking-widest text-txt-muted uppercase">or</span>
                      <div className="flex-grow border-t border-border-main/60"></div>
                    </div>

                    <button 
                      onClick={() => handleOAuthLogin("google")}
                      disabled={authActionLoading}
                      className="w-full h-10 rounded-sm bg-accent-main hover:opacity-90 disabled:opacity-50 text-bg-base font-medium text-[11px] tracking-wider uppercase flex items-center justify-center gap-2 transition-opacity duration-150 focus:outline-none focus:ring-1 focus:ring-ring-main cursor-pointer"
                    >
                      {authActionLoading ? (
                        <span className="h-3.5 w-3.5 rounded-full border border-bg-base/30 border-t-bg-base animate-spin" />
                      ) : (
                        <>
                          <Globe size={13} className="stroke-[1.5]" />
                          Institutional Google Sign-In
                        </>
                      )}
                    </button>

                    <div className="flex gap-2.5 items-center w-full">
                      <button 
                        onClick={() => handleOAuthLogin("github")}
                        disabled={authActionLoading}
                        className="flex-1 h-10 rounded-sm border border-border-main/80 hover:bg-bg-card text-txt-main flex items-center justify-center gap-1.5 transition-colors duration-150 focus:outline-none focus:ring-1 focus:ring-ring-main cursor-pointer"
                      >
                        <GithubIcon size={13} />
                        <span className="text-[9px] font-mono tracking-widest uppercase">GitHub</span>
                      </button>

                      <button 
                        onClick={() => handleOAuthLogin("discord")}
                        disabled={authActionLoading}
                        className="flex-1 h-10 rounded-sm border border-border-main/80 hover:bg-bg-card text-txt-main flex items-center justify-center gap-1.5 transition-colors duration-150 focus:outline-none focus:ring-1 focus:ring-ring-main cursor-pointer"
                      >
                        <DiscordIcon size={13} />
                        <span className="text-[9px] font-mono tracking-widest uppercase">Discord</span>
                      </button>
                    </div>

                    <p className="text-[9px] text-center text-txt-muted leading-relaxed font-light">
                      Using Google Auth automatically routes you into your local campus network.
                    </p>

                    <div className="border-t border-border-main/40 pt-3 text-center">
                      <button
                        onClick={() => {
                          setAuthError(null);
                          setAuthStep("faculty_login");
                        }}
                        className="text-[9px] text-txt-muted hover:text-txt-main transition-colors font-mono tracking-wider uppercase underline cursor-pointer"
                      >
                        Faculty / Company Portal Login
                      </button>
                    </div>
                  </motion.div>
                )}

                {(authStep === "login" || authStep === "signup") && (
                  <motion.form 
                    key={authStep}
                    onSubmit={authStep === "login" ? handleLogin : handleSignUp}
                    initial={{ opacity: 0, y: 3 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -3 }}
                    transition={{ duration: 0.12, ease: [0.16, 1, 0.3, 1] }}
                    className="flex flex-col gap-4"
                  >
                    <div className="flex flex-col gap-1">
                      <button 
                        type="button"
                        onClick={() => {
                          setAuthError(null);
                          setAuthStep("idle");
                        }}
                        className="text-[9px] text-txt-muted hover:text-txt-main self-start transition-colors duration-150 font-mono tracking-widest uppercase"
                      >
                        ← Back
                      </button>
                      <h2 className="font-display text-base font-semibold tracking-tight text-txt-main mt-1">
                        {authStep === "login" ? "Secure Sign In" : "Create Account"}
                      </h2>
                    </div>

                    {authError && (
                      <div className="text-[11px] text-txt-muted bg-bg-card border border-border-main/60 p-2 rounded-sm font-mono tracking-tight">
                        {authError}
                      </div>
                    )}

                    <div className="flex flex-col gap-3">
                      <div className="flex flex-col gap-1">
                        <label className="text-[11px] text-txt-sub font-medium">Domain Email Address</label>
                        <input 
                          type="email" 
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="username@university.edu"
                          className="h-9 px-3 border border-border-main/80 bg-bg-base text-txt-main rounded-sm text-xs placeholder:text-txt-muted/50 focus:outline-none focus:border-txt-main focus:ring-1 focus:ring-ring-main transition-colors duration-150 font-light"
                        />
                      </div>
                      
                      <div className="flex flex-col gap-1">
                        <div className="flex justify-between items-center">
                          <label className="text-[11px] text-txt-sub font-medium">Password</label>
                          {authStep === "login" && (
                            <a href="#" className="text-[9px] text-txt-muted hover:text-txt-main transition-colors font-light">Forgot?</a>
                          )}
                        </div>
                        <input 
                          type="password" 
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="h-9 px-3 border border-border-main/80 bg-bg-base text-txt-main rounded-sm text-xs placeholder:text-txt-muted/50 focus:outline-none focus:border-txt-main focus:ring-1 focus:ring-ring-main transition-colors duration-150"
                        />
                      </div>
                    </div>

                    <button 
                      type="submit"
                      disabled={authActionLoading}
                      className="w-full h-10 rounded-sm bg-accent-main hover:opacity-90 disabled:opacity-50 text-bg-base font-medium text-[11px] tracking-wider uppercase flex items-center justify-center gap-2 transition-opacity duration-150 focus:outline-none focus:ring-1 focus:ring-ring-main cursor-pointer"
                    >
                      {authActionLoading ? (
                        <span className="h-3.5 w-3.5 rounded-full border border-bg-base/30 border-t-bg-base animate-spin" />
                      ) : (
                        <>
                          {authStep === "login" ? "Authenticate Session" : "Initialize Registration"}
                          <ArrowRight size={13} />
                        </>
                      )}
                    </button>

                    <div className="text-center pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setAuthError(null);
                          setAuthStep(authStep === "login" ? "signup" : "login");
                        }}
                        className="text-[11px] text-txt-muted hover:text-txt-main transition-colors font-light underline"
                      >
                        {authStep === "login" ? "Need a new desk? Create an account" : "Already registered? Sign in"}
                      </button>
                    </div>
                  </motion.form>
                )}

                {authStep === "faculty_login" && (
                  <motion.form 
                    key="faculty_login"
                    onSubmit={handleFacultyLogin}
                    initial={{ opacity: 0, y: 3 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -3 }}
                    transition={{ duration: 0.12, ease: [0.16, 1, 0.3, 1] }}
                    className="flex flex-col gap-4"
                  >
                    <div className="flex flex-col gap-1">
                      <button 
                        type="button"
                        onClick={() => {
                          setAuthError(null);
                          setAuthStep("idle");
                        }}
                        className="text-[9px] text-txt-muted hover:text-txt-main self-start transition-colors duration-150 font-mono tracking-widest uppercase"
                      >
                        ← Back
                      </button>
                      <h2 className="font-display text-base font-semibold tracking-tight text-txt-main mt-1">
                        Faculty & Company Portal
                      </h2>
                      <p className="text-[11px] text-txt-muted font-light">
                        Log in using your shared institutional email and unique staff key.
                      </p>
                    </div>

                    {authError && (
                      <div className="text-[11px] text-txt-muted bg-bg-card border border-border-main/60 p-2 rounded-sm font-mono tracking-tight">
                        {authError}
                      </div>
                    )}

                    <div className="flex flex-col gap-2.5">
                      <div className="flex flex-col gap-1">
                        <label className="text-[11px] text-txt-sub font-medium">Shared Portal Email</label>
                        <input 
                          type="email" 
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="e.g. coordinator@college.edu"
                          className="h-9 px-3 border border-border-main/80 bg-bg-base text-txt-main rounded-sm text-xs placeholder:text-txt-muted/50 focus:outline-none focus:border-txt-main focus:ring-1 focus:ring-ring-main transition-colors duration-150 font-light"
                        />
                      </div>
                      
                      <div className="flex flex-col gap-1">
                        <label className="text-[11px] text-txt-sub font-medium">Portal Password</label>
                        <input 
                          type="password" 
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="h-9 px-3 border border-border-main/80 bg-bg-base text-txt-main rounded-sm text-xs placeholder:text-txt-muted/50 focus:outline-none focus:border-txt-main focus:ring-1 focus:ring-ring-main transition-colors duration-150"
                        />
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-[11px] text-txt-sub font-medium">Unique Staff Key / ID</label>
                        <input 
                          type="text" 
                          required
                          value={staffKey}
                          onChange={(e) => setStaffKey(e.target.value)}
                          placeholder="e.g. DAVIS987"
                          className="h-9 px-3 border border-border-main/80 bg-bg-base text-txt-main rounded-sm text-xs placeholder:text-txt-muted/50 focus:outline-none focus:border-txt-main focus:ring-1 focus:ring-ring-main transition-colors duration-150 font-mono"
                        />
                      </div>
                    </div>

                    <button 
                      type="submit"
                      disabled={authActionLoading}
                      className="w-full h-10 rounded-sm bg-accent-main hover:opacity-90 disabled:opacity-50 text-bg-base font-medium text-[11px] tracking-wider uppercase flex items-center justify-center gap-2 transition-opacity duration-150 focus:outline-none focus:ring-1 focus:ring-ring-main cursor-pointer"
                    >
                      {authActionLoading ? (
                        <span className="h-3.5 w-3.5 rounded-full border border-bg-base/30 border-t-bg-base animate-spin" />
                      ) : (
                        <>
                          Verify & Enter Portal
                          <ArrowRight size={13} />
                        </>
                      )}
                    </button>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </section>
        </main>
        <Footer />
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
            <div className="relative w-12 h-12 shrink-0 rounded-full overflow-hidden bg-bg-card border border-border-main/80 flex items-center justify-center font-mono text-sm font-semibold text-txt-main">
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
                <h1 className="font-display text-xl font-light tracking-tight text-txt-main truncate">
                  Welcome back, <span className="font-medium">{profile?.full_name || user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split("@")[0] || "Student"}</span>
                </h1>
                {completion < 100 && (
                  <span className="text-[9px] font-mono text-txt-sub border border-border-main/70 bg-bg-card px-2 py-0.5 rounded-sm font-normal shrink-0">
                    {completion}% Complete
                  </span>
                )}
              </div>
              <span className="text-xs font-mono text-txt-muted/80 font-light truncate mt-0.5">
                @{profile?.username || user?.user_metadata?.username || user?.email?.split("@")[0] || "student"} · {profile?.department || "Computer Science"}
              </span>
            </div>
          </div>

          {/* Quick Streak & Actions */}
          <div className="flex items-center gap-3 font-mono text-[10px] uppercase">
            {stats && (
              <div className="bg-bg-base border border-border-main/70 px-3.5 py-2 rounded-sm flex items-center gap-2">
                <Flame size={13} className="text-txt-main" />
                <span className="text-txt-main font-medium">{stats.streak} Day Streak</span>
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
            <div className="border border-border-main/70 bg-bg-surface p-5 rounded-md flex flex-col gap-4">
              <span className="font-mono text-[9px] uppercase tracking-widest text-txt-muted font-bold">
                Today&apos;s Snapshot
              </span>

              <div className="flex flex-col gap-3 font-mono text-xs">
                <div className="flex justify-between items-center py-1">
                  <span className="text-txt-sub font-light">Daily Challenge</span>
                  {stats?.dailyChallengeStatus === "solved" ? (
                    <span className="text-txt-main font-medium flex items-center gap-1">
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
                  <span className="text-txt-main font-semibold">{stats?.streak || 0} Days</span>
                </div>

                <div className="flex justify-between items-center py-1 border-t border-border-main/30">
                  <span className="text-txt-sub font-light">Total Solved</span>
                  <span className="text-txt-main font-semibold">{stats?.solvedTotal || 0} Problems</span>
                </div>
              </div>
            </div>

            {/* 2. Online Friends (Prioritizing Shared Workspaces) */}
            <div className="border border-border-main/70 bg-bg-surface p-5 rounded-md flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[9px] uppercase tracking-widest text-txt-muted font-bold">
                  Online Friends
                </span>
              </div>

              <div className="flex flex-col gap-2">
                {onlineFriends.map((friend) => (
                  <div
                    key={friend.id}
                    className="flex items-center justify-between p-2 rounded.sm bg-bg-card border border-border-main/60 text-xs font-mono"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="relative w-6 h-6 rounded-full bg-bg-surface border border-border-main/60 ring-1 ring-emerald-500/85 flex items-center justify-center font-semibold text-txt-main shrink-0 overflow-hidden text-[9px]">
                        {friend.avatar_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={friend.avatar_url} alt={friend.full_name} className="w-full h-full object-cover" />
                        ) : (
                          friend.full_name.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-txt-main font-medium truncate leading-tight">
                          {friend.full_name}
                        </span>
                        <span className="text-[9px] text-txt-muted font-light truncate">
                          {friend.inSharedWorkspace ? (
                            <span className="text-txt-main font-medium">★ {friend.workspaceName || "Team Space"}</span>
                          ) : (
                            friend.department
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}

                {onlineFriends.length === 0 && (
                  <span className="text-[10px] font-mono text-txt-muted/70 font-light italic py-1">
                    No online friends right now.
                  </span>
                )}
              </div>

              <Link
                href="/explore?tab=friends"
                className="text-[9px] font-mono text-txt-sub hover:text-txt-main transition-colors uppercase font-medium flex items-center gap-1 self-start"
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
            <div className="border border-border-main/70 bg-bg-surface p-6 rounded-md flex flex-col gap-5">
              <div className="flex items-center justify-between border-b border-border-main/30 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-bg-card border border-border-main/60 text-txt-main rounded-sm">
                    <FolderGit2 size={15} />
                  </div>
                  <div className="flex flex-col">
                    <h2 className="font-display text-base font-medium text-txt-main">
                      Event Desk
                    </h2>
                    <span className="text-[10px] font-mono text-txt-muted font-light">
                      Team workspaces &amp; hackathon vault
                    </span>
                  </div>
                </div>
                <Link
                  href="/event-desk"
                  className="text-[10px] font-mono text-txt-sub hover:text-txt-main uppercase font-medium flex items-center gap-1 transition-colors"
                >
                  Open Desk <ArrowRight size={11} />
                </Link>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                <div className="border border-border-main/60 bg-bg-card p-3.5 rounded flex flex-col gap-1">
                  <span className="text-[9px] font-mono text-txt-muted uppercase font-semibold">Active Workspaces</span>
                  <span className="text-xl font-semibold text-txt-main font-display">
                    {activeWorkspacesCount} <span className="text-xs font-mono font-normal text-txt-sub">Team Spaces</span>
                  </span>
                  <span className="text-[9px] text-txt-sub font-mono tracking-tight">Tracked in Event Desk</span>
                </div>
                <div className="border border-border-main/60 bg-bg-card p-3.5 rounded flex flex-col gap-1">
                  <span className="text-[9px] font-mono text-txt-muted uppercase font-semibold">Next Deadline</span>
                  <span className="text-xl font-semibold text-txt-main font-display truncate">
                    {upcomingDeadline || "Nov 20, 2026"}
                  </span>
                  <span className="text-[9px] text-txt-sub font-mono tracking-tight">Upcoming submission</span>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-border-main/30 pt-3 text-[10px] font-mono">
                <span className="text-txt-sub font-light">Collaborate on hackathons &amp; submissions</span>
                <Link
                  href="/event-desk"
                  className="h-8 px-4 bg-accent-main hover:opacity-90 text-bg-base font-mono text-[10px] font-semibold uppercase rounded-sm flex items-center gap-1 cursor-pointer transition-opacity"
                >
                  <Plus size={11} /> Create Workspace
                </Link>
              </div>
            </div>

            {/* CARD 2: CODING DESK (BOTTOM) */}
            <div className="border border-border-main/70 bg-bg-surface p-6 rounded-md flex flex-col gap-5">
              <div className="flex items-center justify-between border-b border-border-main/30 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-bg-card border border-border-main/60 text-txt-main rounded-sm">
                    <Code size={15} />
                  </div>
                  <div className="flex flex-col">
                    <h2 className="font-display text-base font-medium text-txt-main">
                      Coding Desk
                    </h2>
                    <span className="text-[10px] font-mono text-txt-muted font-light">
                      Competitive platform statistics
                    </span>
                  </div>
                </div>
                <Link
                  href="/coding-desk"
                  className="text-[10px] font-mono text-txt-sub hover:text-txt-main uppercase font-medium flex items-center gap-1 transition-colors"
                >
                  Open Coding Desk <ArrowRight size={11} />
                </Link>
              </div>

              {leetcodeHandle ? (
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-txt-sub font-light">Connected Handle:</span>
                    <span className="text-txt-main font-semibold">@{leetcodeHandle}</span>
                  </div>

                  <div className="grid grid-cols-3 gap-3 font-mono">
                    <div className="border border-border-main/60 bg-bg-card p-3 rounded flex flex-col gap-1">
                      <span className="text-[9px] font-mono text-txt-muted uppercase font-semibold">Easy</span>
                      <span className="text-xl font-semibold text-txt-main font-display">{stats?.easySolved || 0}</span>
                      <span className="text-[9px] text-txt-sub font-mono tracking-tight">Solves</span>
                    </div>
                    <div className="border border-border-main/60 bg-bg-card p-3 rounded flex flex-col gap-1">
                      <span className="text-[9px] font-mono text-txt-muted uppercase font-semibold">Medium</span>
                      <span className="text-xl font-semibold text-txt-main font-display">{stats?.mediumSolved || 0}</span>
                      <span className="text-[9px] text-txt-sub font-mono tracking-tight">Solves</span>
                    </div>
                    <div className="border border-border-main/60 bg-bg-card p-3 rounded flex flex-col gap-1">
                      <span className="text-[9px] font-mono text-txt-muted uppercase font-semibold">Hard</span>
                      <span className="text-xl font-semibold text-txt-main font-display">{stats?.hardSolved || 0}</span>
                      <span className="text-[9px] text-txt-sub font-mono tracking-tight">Solves</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 border border-dashed border-border-main/60 rounded-sm flex flex-col items-center gap-2 text-center text-xs font-mono">
                  <span className="text-txt-muted font-light">Link your LeetCode handle to view live problem statistics.</span>
                  <Link
                    href="/profile"
                    className="mt-1 px-3 py-1.5 bg-accent-main text-bg-base font-semibold rounded-sm text-[9px] uppercase"
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
            <div className="border border-border-main/70 bg-bg-surface p-5 rounded-md flex flex-col gap-3">
              <span className="font-mono text-[9px] uppercase tracking-widest text-txt-muted font-bold">
                Quick Actions
              </span>
              <div className="flex flex-col gap-2 font-mono text-[10px] uppercase">
                <Link
                  href="/event-desk"
                  className="p-2.5 border border-border-main/60 bg-bg-card hover:bg-border-main/30 rounded-sm text-txt-main transition-colors flex items-center justify-between font-light"
                >
                  <span>New Workspace</span>
                  <Plus size={11} />
                </Link>
                <Link
                  href="/coding-desk"
                  className="p-2.5 border border-border-main/60 bg-bg-card hover:bg-border-main/30 rounded-sm text-txt-main transition-colors flex items-center justify-between font-light"
                >
                  <span>Solve Daily Challenge</span>
                  <Code size={11} />
                </Link>
                <Link
                  href="/explore?tab=friends"
                  className="p-2.5 border border-border-main/60 bg-bg-card hover:bg-border-main/30 rounded-sm text-txt-main transition-colors flex items-center justify-between font-light"
                >
                  <span>Find Teammates</span>
                  <UserPlus size={11} />
                </Link>
              </div>
            </div>

            {/* Problem Solving Breakdown */}
            <div className="border border-border-main/70 bg-bg-surface p-5 rounded-md flex flex-col gap-3">
              <span className="font-mono text-[9px] uppercase tracking-widest text-txt-muted font-bold">
                Problem Breakdown
              </span>

              <div className="flex flex-col gap-3 text-xs font-mono">
                <div>
                  <div className="flex justify-between text-[10px] mb-1">
                    <span className="text-txt-sub font-medium">Easy</span>
                    <span className="text-txt-muted">{stats?.easySolved || 0} Solved</span>
                  </div>
                  <div className="w-full h-1 bg-bg-card rounded-full overflow-hidden">
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
                  <div className="w-full h-1 bg-bg-card rounded-full overflow-hidden">
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
                  <div className="w-full h-1 bg-bg-card rounded-full overflow-hidden">
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
