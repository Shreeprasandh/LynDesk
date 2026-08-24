"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "./context/AuthContext";
import { supabase } from "./lib/supabase";
import { extractAvatarFromUser } from "./lib/avatar";
import { validateEmail } from "./lib/emailValidation";
import { validatePassword } from "./lib/passwordValidation";
import Header from "./components/Header";
import LynDeskLogo from "./components/LynDeskLogo";
import LynDeskLoadingCard from "./components/LynDeskLoadingCard";
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
  BookOpen,
  Zap,
  Target,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock
} from "lucide-react";
import PreferencePresetModal from "./components/PreferencePresetModal";
import { fetchWallCalendarEvents, WallEvent } from "./lib/wallCalendarSync";

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

const getNextUpcomingDeadline = (list: any[]): string => {
  if (!Array.isArray(list) || list.length === 0) return "No Deadlines";
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const candidateDates: { raw: string; time: number }[] = [];

  list.forEach((w: any) => {
    if (!w) return;

    // 1. Direct workspace deadline
    const dStr = w.deadline || w.target_date;
    if (dStr && dStr !== "Ongoing" && dStr !== "TBD" && dStr !== "Target Active") {
      const d = new Date(dStr);
      if (!isNaN(d.getTime()) && d.getTime() >= now.getTime()) {
        candidateDates.push({ raw: dStr, time: d.getTime() });
      }
    }

    // 2. Real stages from localStorage cache
    if (typeof window !== "undefined" && w.id) {
      const realStr = localStorage.getItem(`ldk_workspace_real_stages_${w.id}`) || localStorage.getItem(`ldk_workspace_stages_${w.id}`);
      if (realStr) {
        try {
          const parsed = JSON.parse(realStr);
          if (Array.isArray(parsed)) {
            parsed.forEach((s: any) => {
              const stageDeadline = s.deadline || s.date;
              if (stageDeadline && stageDeadline !== "Ongoing" && stageDeadline !== "TBD" && stageDeadline !== "Target Active") {
                const sd = new Date(stageDeadline);
                if (!isNaN(sd.getTime()) && sd.getTime() >= now.getTime()) {
                  candidateDates.push({ raw: stageDeadline, time: sd.getTime() });
                }
              }
            });
          }
        } catch {}
      }

      const metaStr = localStorage.getItem(`ldk_workspace_meta_${w.id}`);
      if (metaStr) {
        try {
          const meta = JSON.parse(metaStr);
          if (meta && meta.stages && Array.isArray(meta.stages)) {
            meta.stages.forEach((s: any) => {
              const stageDeadline = s.deadline || s.date;
              if (stageDeadline && stageDeadline !== "Ongoing" && stageDeadline !== "TBD" && stageDeadline !== "Target Active") {
                const sd = new Date(stageDeadline);
                if (!isNaN(sd.getTime()) && sd.getTime() >= now.getTime()) {
                  candidateDates.push({ raw: stageDeadline, time: sd.getTime() });
                }
              }
            });
          }
        } catch {}
      }
    }
  });

  candidateDates.sort((a, b) => a.time - b.time);

  if (candidateDates.length > 0) {
    return candidateDates[0].raw;
  }
  return "No Deadlines";
};

export default function Home() {
  const { user, loading, resolveEmailFromInput, requestPasswordResetOtp, verifyPasswordResetOtp } = useAuth();
  
  // Instant 0ms Sync Profile Initialization from localStorage or user_metadata
  const [profile, setProfile] = useState<DashboardProfile | null>(() => {
    if (typeof window !== "undefined") {
      try {
        const uId = user?.id;
        const rawPublic = uId ? localStorage.getItem(`ldk_public_profile_${uId}`) : null;
        const publicProf = rawPublic ? JSON.parse(rawPublic) : {};
        const rawDraft = uId ? localStorage.getItem(`ldk_profile_draft_${uId}`) : null;
        const draft = rawDraft ? JSON.parse(rawDraft) : {};
        const meta = user?.user_metadata || {};

        const localAvatar = (uId ? localStorage.getItem(`ldk_user_avatar_${uId}`) || localStorage.getItem(`ldk_avatar_url_${uId}`) : null) || "";
        const fullName = publicProf.full_name || draft.fullName || meta.full_name || meta.name || "";
        const username = publicProf.username || draft.username || meta.username || user?.email?.split("@")[0] || "";
        if (fullName || username) {
          return {
            full_name: fullName,
            username: username,
            avatar_url: localAvatar || publicProf.avatar_url || draft.avatarUrl || meta.avatar_url || "",
            college_name: publicProf.college_name || draft.collegeName || meta.college_name || "",
            department: publicProf.department || draft.department || meta.department || "",
            leetcode_username: publicProf.leetcode_username || draft.leetcodeUsername || meta.leetcode_username || "",
            github_url: publicProf.github_url || draft.githubUrl || meta.github_url || "",
          };
        }
        const cachedActive = localStorage.getItem("ldk_last_active_profile");
        if (cachedActive) return JSON.parse(cachedActive);
      } catch {}
    }
    return null;
  });

  // 0ms Synchronous Completion Calculation
  const [completion, setCompletion] = useState<number>(() => {
    if (typeof window !== "undefined") {
      try {
        const cachedVal = localStorage.getItem("ldk_last_active_completion");
        if (cachedVal) return Number(cachedVal);

        const uId = user?.id;
        const rawPublic = uId ? localStorage.getItem(`ldk_public_profile_${uId}`) : null;
        const publicProf = rawPublic ? JSON.parse(rawPublic) : {};
        const rawDraft = uId ? localStorage.getItem(`ldk_profile_draft_${uId}`) : null;
        const draft = rawDraft ? JSON.parse(rawDraft) : {};
        const meta = user?.user_metadata || {};

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
  const [authStep, setAuthStep] = useState<"idle" | "login" | "signup" | "faculty_login" | "forgot">("idle");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [staffKey, setStaffKey] = useState("");
  const [authActionLoading, setAuthActionLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Coding stats state - 0ms Cache Reader
  const [stats, setStats] = useState<LocalStats | null>(() => {
    if (typeof window !== "undefined") {
      try {
        const uId = user?.id;
        const cached = uId ? localStorage.getItem(`ldk_coding_stats_${uId}`) : null;
        if (cached) return JSON.parse(cached);
        const lastActive = localStorage.getItem("ldk_last_active_coding_stats");
        if (lastActive) return JSON.parse(lastActive);
      } catch {}
    }
    return null;
  });
  const [leetcodeHandle, setLeetcodeHandle] = useState<string>("");

  // Study Desk Live Focus & Track State
  const [studyCardStats, setStudyCardStats] = useState<{
    streakCount: number;
    totalXp: number;
    solvedProblemsCount: number;
    activePathTitle: string;
    activePathProgress: number;
  }>(() => {
    if (typeof window !== "undefined") {
      try {
        const statsStr = localStorage.getItem("lyndesk_study_stats_cache");
        const stats = statsStr ? JSON.parse(statsStr) : null;
        const dsaMapStr = localStorage.getItem("lyndesk_dsa_progress_cache");
        const dsaMap = dsaMapStr ? JSON.parse(dsaMapStr) : {};
        const solvedCount = Object.values(dsaMap).filter((p: any) => p?.status === "completed").length;
        const pathsStr = localStorage.getItem("lyndesk_study_paths_cache");
        const paths = pathsStr ? JSON.parse(pathsStr) : [];
        const activePath = paths.find((p: any) => p.isActive) || paths[0];

        return {
          streakCount: stats?.streakCount || 0,
          totalXp: stats?.totalXp || 0,
          solvedProblemsCount: solvedCount || 0,
          activePathTitle: activePath?.title || "DSA Systems & Algorithms",
          activePathProgress: activePath?.progress || 0
        };
      } catch {}
    }
    return {
      streakCount: 0,
      totalXp: 0,
      solvedProblemsCount: 0,
      activePathTitle: "DSA Systems & Algorithms",
      activePathProgress: 0
    };
  });

  // Deadlines & workspace counts - 0ms Multi-Cache & Supabase Readers
  const [upcomingDeadline, setUpcomingDeadline] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      try {
        const cachedDeadline = localStorage.getItem("ldk_last_active_deadline");
        if (cachedDeadline) return cachedDeadline;

        const userEventsKey = user?.id ? `ldk_events_${user.id}` : null;
        const userJoinedKey = user?.id ? `ldk_joined_workspaces_${user.id}` : null;
        const e1 = userEventsKey ? localStorage.getItem(userEventsKey) : null;
        const e2 = userJoinedKey ? localStorage.getItem(userJoinedKey) : null;
        const p1 = e1 ? JSON.parse(e1) : [];
        const p2 = e2 ? JSON.parse(e2) : [];
        const list = [...(Array.isArray(p1) ? p1 : []), ...(Array.isArray(p2) ? p2 : [])];
        if (list.length > 0) {
          return getNextUpcomingDeadline(list);
        }
      } catch {}
    }
    return "No Deadlines";
  });

  const [activeWorkspacesCount, setActiveWorkspacesCount] = useState<number>(() => {
    if (typeof window !== "undefined") {
      try {
        const cachedCount = localStorage.getItem("ldk_last_active_workspace_count");
        if (cachedCount !== null) return Number(cachedCount);

        const userEventsKey = user?.id ? `ldk_events_${user.id}` : null;
        const userJoinedKey = user?.id ? `ldk_joined_workspaces_${user.id}` : null;
        const e1 = userEventsKey ? localStorage.getItem(userEventsKey) : null;
        const e2 = userJoinedKey ? localStorage.getItem(userJoinedKey) : null;
        const p1 = e1 ? JSON.parse(e1) : [];
        const p2 = e2 ? JSON.parse(e2) : [];
        const list = [...(Array.isArray(p1) ? p1 : []), ...(Array.isArray(p2) ? p2 : [])];
        const seen = new Set();
        const unique = list.filter((w: any) => {
          if (!w) return false;
          const id = w.id || w.title;
          if (!id || seen.has(id)) return false;
          seen.add(id);
          return true;
        });
        return unique.length;
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
    const targetEmail = await resolveEmailFromInput(email);
    const { error } = await supabase.auth.signInWithPassword({
      email: targetEmail,
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

    try {
      const targetEmail = await resolveEmailFromInput(email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email: targetEmail,
        password,
      });

      if (error) {
        setAuthError(error.message);
        return;
      }

      if (!data.user) {
        setAuthError("Authentication failed.");
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
        try {
          await supabase.auth.signOut();
        } catch (err) {
          console.error("SignOut error:", err);
        }
        setAuthError("Invalid Staff Key. Access denied.");
      }
    } catch (err: any) {
      console.error("[Faculty Login Exception]:", err);
      setAuthError(err?.message || "An unexpected error occurred during login. Please try again.");
    } finally {
      setAuthActionLoading(false);
    }
  };

  const [forgotSuccess, setForgotSuccess] = useState<string | null>(null);
  const [resetOtpSent, setResetOtpSent] = useState(false);
  const [resetOtpCode, setResetOtpCode] = useState("");
  const [resetNewPassword, setResetNewPassword] = useState("");
  const [resetConfirmPassword, setResetConfirmPassword] = useState("");

  useEffect(() => {
    queueMicrotask(() => {
      setAuthActionLoading(false);
      setAuthError(null);
      setForgotSuccess(null);
    });
  }, [authStep]);

  const handleRequestResetOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setAuthError("Please enter your registered email address or username.");
      return;
    }
    setAuthActionLoading(true);
    setAuthError(null);
    setForgotSuccess(null);

    const emailVal = validateEmail(email);
    if (!emailVal.isValidSyntax && !email.includes("@")) {
      // Username input allowed
    } else if (emailVal.isDisposable) {
      setAuthError("Disposable or temporary email addresses are not allowed.");
      setAuthActionLoading(false);
      return;
    } else if (emailVal.suggestedCorrection) {
      setAuthError(`Did you mean ${emailVal.suggestedCorrection}?`);
      setAuthActionLoading(false);
      return;
    }

    try {
      const { error } = await requestPasswordResetOtp(email);
      if (error) throw error;
      setResetOtpSent(true);
      setForgotSuccess("Security OTP code & link dispatched!\nCheck your email inbox.");
    } catch (err: any) {
      setAuthError(err?.message || "Failed to dispatch password reset email.");
    } finally {
      setAuthActionLoading(false);
    }
  };

  const handleVerifyResetOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetOtpCode || resetOtpCode.trim().length < 6) {
      setAuthError("Please enter the 6-digit OTP code received in your email.");
      return;
    }

    const rules = validatePassword(resetNewPassword, resetConfirmPassword);
    if (!rules.isValid) {
      if (!rules.passwordsMatch) {
        setAuthError("Passwords do not match. Re-enter password twice.");
      } else if (!rules.hasMinLength) {
        setAuthError("Password must be at least 8 characters long.");
      } else if (!rules.hasUppercase) {
        setAuthError("Password must contain at least 1 uppercase letter (A-Z).");
      } else if (!rules.hasLowercase) {
        setAuthError("Password must contain at least 1 lowercase letter (a-z).");
      } else if (!rules.hasNumber) {
        setAuthError("Password must contain at least 1 number (0-9).");
      } else if (!rules.hasSpecialChar) {
        setAuthError("Password must contain at least 1 special character (!@#$%^&*).");
      } else {
        setAuthError("Please enter a strong password matching all security rules.");
      }
      return;
    }

    setAuthActionLoading(true);
    setAuthError(null);
    setForgotSuccess(null);

    try {
      const { error: otpErr } = await verifyPasswordResetOtp(email, resetOtpCode, resetNewPassword, resetConfirmPassword);
      if (otpErr) throw otpErr;

      setForgotSuccess("Password successfully updated! Redirecting to sign in...");
      setTimeout(() => {
        setAuthStep("login");
        setResetOtpSent(false);
        setResetOtpCode("");
        setResetNewPassword("");
        setResetConfirmPassword("");
      }, 2000);
    } catch (err: any) {
      setAuthError(err?.message || "Failed to verify OTP code or update password.");
    } finally {
      setAuthActionLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthActionLoading(true);
    setAuthError(null);

    const emailVal = validateEmail(email);
    if (!emailVal.isValidSyntax) {
      setAuthError("Please enter a valid email address. (e.g. user@domain.com)");
      setAuthActionLoading(false);
      return;
    }
    if (emailVal.isDisposable) {
      setAuthError("Disposable / temporary email addresses are not allowed. Please use a real email.");
      setAuthActionLoading(false);
      return;
    }
    if (emailVal.suggestedCorrection) {
      setAuthError(`Did you mean ${emailVal.suggestedCorrection}? Check for typos.`);
      setAuthActionLoading(false);
      return;
    }

    try {
      if (typeof window !== "undefined") {
        localStorage.setItem("ldk_first_time_signup", "true");
      }
      const rawUser = email.split("@")[0].toLowerCase().replace(/[^a-z0-9_]/g, "_");
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: email.split("@")[0],
            username: rawUser,
          }
        }
      });
      if (error) {
        setAuthError(error.message);
      } else {
        if (data?.session) {
          window.location.href = "/profile";
        } else {
          setAuthError("Registration successful. Verification email dispatched to your inbox.");
        }
      }
    } catch (err: any) {
      setAuthError(err.message || "Registration failed. Please try again.");
    } finally {
      setAuthActionLoading(false);
    }
  };

  const handleOAuthLogin = async (provider: "google" | "github" | "discord" | "linkedin") => {
    setAuthActionLoading(true);
    setAuthError(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: provider === "linkedin" ? "linkedin_oidc" : provider,
        options: {
          redirectTo: typeof window !== "undefined" ? `${window.location.origin}/auth/callback` : undefined,
        },
      });
      if (error) {
        setAuthError(error.message);
        setAuthActionLoading(false);
      }
    } catch (err: any) {
      setAuthError(err.message || "OAuth login failed.");
      setAuthActionLoading(false);
    }
  };

  // Preference Preset Modal State
  const [isPresetModalOpen, setIsPresetModalOpen] = useState(false);

  // Weekly Schedule Horizon State
  const [weekEvents, setWeekEvents] = useState<WallEvent[]>([]);
  const [hoveredWeekDate, setHoveredWeekDate] = useState<string | null>(null);

  // Fix #1: No duplicate modal — dispatch to Header's single WallCalendarModal instance
  const openWallCalendar = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("ldk_open_wall_calendar"));
    }
  };

  useEffect(() => {
    if (!user?.id) return;
    const loadWeekEvents = async () => {
      try {
        const events = await fetchWallCalendarEvents(user.id);
        setWeekEvents(events);
      } catch {}
    };
    loadWeekEvents();
    window.addEventListener("ldk_wall_calendar_update", loadWeekEvents);
    return () => window.removeEventListener("ldk_wall_calendar_update", loadWeekEvents);
  }, [user?.id]);

  const getCurrentWeekDates = () => {
    const today = new Date();
    const currentDay = today.getDay();
    const distanceToMon = currentDay === 0 ? -6 : 1 - currentDay;
    const monday = new Date(today);
    monday.setDate(today.getDate() + distanceToMon);

    const daysMap = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
    const todayStr = today.toISOString().split("T")[0];

    const week = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const dateStr = d.toISOString().split("T")[0];
      week.push({
        dayName: daysMap[i],
        dayNum: d.getDate(),
        dateStr,
        isToday: dateStr === todayStr
      });
    }
    return week;
  };

  // Fetch dashboard data
  useEffect(() => {
    if (!user) return;

    const meta = user.user_metadata || {};

    // 0ms Synchronous local profile initialization to avoid avatar image flicker on reload
    if (typeof window !== "undefined") {
      try {
        const rawPublic = localStorage.getItem(`ldk_public_profile_${user.id}`);
        const publicProf = rawPublic ? JSON.parse(rawPublic) : {};
        const rawDraft = localStorage.getItem(`ldk_profile_draft_${user.id}`);
        const draft = rawDraft ? JSON.parse(rawDraft) : {};
        const localAvatar = localStorage.getItem(`ldk_user_avatar_${user.id}`) || localStorage.getItem(`ldk_avatar_url_${user.id}`) || "";

        const fullName = publicProf.full_name || draft.fullName || meta.full_name || meta.name || "";
        const username = publicProf.username || draft.username || meta.username || user.email?.split("@")[0] || "";
        const avatarUrl = localAvatar || publicProf.avatar_url || draft.avatarUrl || meta.avatar_url || extractAvatarFromUser(user) || "";

        if (fullName || username || avatarUrl) {
          queueMicrotask(() => {
            setProfile(prev => ({
              full_name: fullName || prev?.full_name || "",
              username: username || prev?.username || "",
              avatar_url: avatarUrl || prev?.avatar_url || "",
              college_name: publicProf.college_name || draft.collegeName || meta.college_name || prev?.college_name || "",
              department: publicProf.department || draft.department || meta.department || prev?.department || "",
              leetcode_username: publicProf.leetcode_username || draft.leetcodeUsername || meta.leetcode_username || prev?.leetcode_username || "",
              github_url: publicProf.github_url || draft.githubUrl || meta.github_url || prev?.github_url || "",
            }));
          });
        }
      } catch {}
    }

    // 1. Resolve LeetCode handle from user_metadata or localStorage
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
          const safeHandle = encodeURIComponent(handle.trim());
          const res = await fetch(`/api/coding-stats?platform=leetcode&username=${safeHandle}&t=${Date.now()}`);
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
              localStorage.setItem("ldk_last_active_coding_stats", JSON.stringify(formatted));
            }
          }
        } catch {}
      };

      fetchLiveStats();
    }

    // 2. Load profile from Supabase with valid column names
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
          localAvatar = localStorage.getItem(`ldk_user_avatar_${user.id}`) || localStorage.getItem(`ldk_avatar_url_${user.id}`) || "";
        } catch {}
      }

      const fallbackName = meta.full_name || meta.name || user?.email?.split("@")[0] || "Student";
      const fallbackUsername = meta.username || user?.email?.split("@")[0] || "student";
      const fullName = dbProfile?.full_name || publicProf.full_name || draft.fullName || fallbackName;
      const username = dbProfile?.username || publicProf.username || draft.username || fallbackUsername;
      const isValidImage = (s: any) => typeof s === "string" && (s.startsWith("http://") || s.startsWith("https://") || s.startsWith("data:image/"));
      const rawAvatar = [
        localAvatar,
        dbProfile?.avatar_url,
        publicProf.avatar_url,
        draft.avatarUrl,
        draft.avatar_url,
        meta.avatar_url
      ].find(isValidImage) || extractAvatarFromUser(user) || "";
      const avatarUrl = rawAvatar;
      const collegeName = dbProfile?.college_name || publicProf.college_name || draft.collegeName || meta.college_name || "University Student";
      const department = dbProfile?.department || publicProf.department || draft.department || meta.department || "Computer Science";
      const lcHandle = dbProfile?.leetcode_username || publicProf.leetcode_username || draft.leetcodeUsername || meta.leetcode_username || handle || "";
      const ghUrl = dbProfile?.github_url || publicProf.github_url || draft.githubUrl || meta.github_url || "";
      const liUrl = publicProf.linkedin_url || draft.linkedinUrl || meta.linkedin_url || "";
      const pfUrl = publicProf.portfolio_url || draft.portfolioUrl || meta.portfolio_url || "";

      const profilePayload = {
        full_name: fullName,
        username: username,
        avatar_url: avatarUrl,
        college_name: collegeName,
        department: department,
        leetcode_username: lcHandle,
        github_url: ghUrl,
      };

      setProfile(profilePayload);

      // Compute exact profile completion %
      const fields = [fullName, username, collegeName, department, lcHandle, ghUrl, liUrl, pfUrl];
      const filled = fields.filter((f) => f && String(f).trim() !== "").length;
      const computedCompletion = Math.round((filled / fields.length) * 100);
      setCompletion(computedCompletion);

      if (typeof window !== "undefined") {
        localStorage.setItem("ldk_last_active_completion", String(computedCompletion));
        localStorage.setItem("ldk_last_active_profile", JSON.stringify(profilePayload));
      }
    };

    fetchProfile();

    // 3. Fetch Live Study Desk Focus Stats & DSA Track Progress
    const fetchStudyDeskStats = async () => {
      try {
        if (typeof window !== "undefined") {
          const statsStr = localStorage.getItem("lyndesk_study_stats_cache");
          const stats = statsStr ? JSON.parse(statsStr) : null;
          const dsaMapStr = localStorage.getItem("lyndesk_dsa_progress_cache");
          const dsaMap = dsaMapStr ? JSON.parse(dsaMapStr) : {};
          const solvedCount = Object.values(dsaMap).filter((p: any) => p?.status === "completed").length;
          const pathsStr = localStorage.getItem("lyndesk_study_paths_cache");
          const paths = pathsStr ? JSON.parse(pathsStr) : [];
          const activePath = paths.find((p: any) => p.isActive) || paths[0];

          setStudyCardStats({
            streakCount: stats?.streakCount || 0,
            totalXp: stats?.totalXp || 0,
            solvedProblemsCount: solvedCount || 0,
            activePathTitle: activePath?.title || "DSA Systems & Algorithms",
            activePathProgress: activePath?.progress || 0
          });
        }
      } catch {}
    };

    // 4. Fetch Live Event Workspaces from Supabase DB & Caches
    const fetchUserWorkspaces = async () => {
      if (!user?.id) return;
      try {
        let wsList: any[] = [];
        const userEventsKey = `ldk_events_${user.id}`;
        const userDeletedKey = `ldk_deleted_workspaces_${user.id}`;

        let deletedIds: string[] = [];
        if (typeof window !== "undefined") {
          const delStr = localStorage.getItem(userDeletedKey) || localStorage.getItem("ldk_deleted_workspaces");
          if (delStr) {
            try {
              deletedIds = JSON.parse(delStr);
            } catch {}
          }

          // Primary authoritative cache that Event Desk maintains
          const e1 = localStorage.getItem(userEventsKey);
          if (e1) {
            try {
              const p1 = JSON.parse(e1);
              if (Array.isArray(p1)) wsList = [...p1];
            } catch {}
          }
        }

        if (wsList.length === 0) {
          const { data: memberData } = await supabase
            .from("project_members")
            .select("project_space_id, project_spaces(*)")
            .eq("profile_id", user.id);

          if (memberData && Array.isArray(memberData) && memberData.length > 0) {
            const dbSpaces = memberData.map((m: any) => m.project_spaces).filter(Boolean);
            wsList = [...wsList, ...dbSpaces];
          }
        }

        const seen = new Set();
        const unique = wsList.filter((w: any) => {
          if (!w || !w.id) return false;
          if (deletedIds.includes(w.id)) return false;
          const idKey = w.id;
          if (seen.has(idKey)) return false;
          seen.add(idKey);
          return true;
        });

        const nextDeadline = getNextUpcomingDeadline(unique);
        setActiveWorkspacesCount(unique.length);
        setUpcomingDeadline(nextDeadline);

        if (typeof window !== "undefined") {
          localStorage.setItem("ldk_last_active_workspace_count", String(unique.length));
          localStorage.setItem("ldk_last_active_deadline", nextDeadline);
        }
      } catch {
        setUpcomingDeadline("No Deadlines");
      }
    };

    fetchStudyDeskStats();
    fetchUserWorkspaces();

    const handleCodingStatsUpdate = () => {
      if (typeof window !== "undefined") {
        const raw = localStorage.getItem("ldk_last_active_coding_stats") || (user?.id ? localStorage.getItem(`ldk_coding_stats_${user.id}`) : null);
        if (raw) {
          try {
            setStats(JSON.parse(raw));
          } catch {}
        }
      }
    };

    if (typeof window !== "undefined") {
      window.addEventListener("ldk_profile_update", fetchProfile);
      window.addEventListener("ldk_study_stats_update", fetchStudyDeskStats);
      window.addEventListener("ldk_workspace_update", fetchUserWorkspaces);
      window.addEventListener("ldk_coding_stats_update", handleCodingStatsUpdate);
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("ldk_profile_update", fetchProfile);
        window.removeEventListener("ldk_study_stats_update", fetchStudyDeskStats);
        window.removeEventListener("ldk_workspace_update", fetchUserWorkspaces);
        window.removeEventListener("ldk_coding_stats_update", handleCodingStatsUpdate);
      }
    };
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-base text-txt-main flex flex-col font-sans">
        <Header />
        <main className="flex-1 flex items-center justify-center p-6">
          <LynDeskLoadingCard
            message="Initializing LynDesk Command Center..."
            subtext="Verifying network session, workspace indexes & live telemetry"
            minHeight="min-h-[420px]"
          />
        </main>
        <Footer />
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
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2.5">
                <LynDeskLogo size={28} />
                <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-txt-muted font-semibold">
                  Link Your Next Desk
                </span>
              </div>
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
                    layout
                    initial={{ opacity: 0, y: 6, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.98 }}
                    transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                    className="relative z-10 overflow-hidden flex flex-col gap-4"
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
                    layout
                    onSubmit={authStep === "login" ? handleLogin : handleSignUp}
                    initial={{ opacity: 0, y: 6, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.98 }}
                    transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                    className="relative z-10 overflow-hidden flex flex-col gap-4"
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
                        <label className="text-[11px] text-txt-sub font-medium">Email Address or Username</label>
                        <input 
                          type="text" 
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="email@university.edu or @username"
                          className="h-9 px-3 border border-border-main/80 bg-bg-base text-txt-main rounded-sm text-xs placeholder:text-txt-muted/50 focus:outline-none focus:border-sky-400/80 focus:ring-2 focus:ring-sky-500/20 transition-all duration-200 ease-out font-light"
                        />
                      </div>
                      
                      <div className="flex flex-col gap-1">
                        <div className="flex justify-between items-center">
                          <label className="text-[11px] text-txt-sub font-medium">Password</label>
                          {authStep === "login" && (
                            <button
                              type="button"
                              onClick={() => {
                                setAuthError(null);
                                setForgotSuccess(null);
                                setAuthStep("forgot");
                              }}
                              className="text-[9px] text-txt-muted hover:text-txt-main transition-colors font-light cursor-pointer underline"
                            >
                              Forgot?
                            </button>
                          )}
                        </div>
                        <input 
                          type="password" 
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="h-9 px-3 border border-border-main/80 bg-bg-base text-txt-main rounded-sm text-xs placeholder:text-txt-muted/50 focus:outline-none focus:border-sky-400/80 focus:ring-2 focus:ring-sky-500/20 transition-all duration-200 ease-out"
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

                {authStep === "forgot" && (
                  <motion.form 
                    key="forgot"
                    layout
                    onSubmit={resetOtpSent ? handleVerifyResetOtp : handleRequestResetOtp}
                    initial={{ opacity: 0, y: 6, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.98 }}
                    transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                    className="relative z-10 overflow-hidden flex flex-col gap-4"
                  >
                    <div className="flex flex-col gap-1">
                      <button 
                        type="button"
                        onClick={() => {
                          setAuthError(null);
                          setForgotSuccess(null);
                          setResetOtpSent(false);
                          setAuthStep("login");
                        }}
                        className="text-[9px] text-txt-muted hover:text-txt-main self-start transition-colors duration-150 font-mono tracking-widest uppercase cursor-pointer"
                      >
                        ← Back to Sign In
                      </button>
                      <h2 className="font-display text-base font-semibold tracking-tight text-txt-main mt-1">
                        Reset LynDesk Password
                      </h2>
                      <p className="text-[11px] text-txt-muted font-light">
                        {resetOtpSent ? "Type the 6-digit OTP received in your email along with your new password." : "Enter your account email or username to receive a 6-digit security OTP code."}
                      </p>
                    </div>

                    {authError && (
                      <div className="text-[11px] text-red-400 bg-red-500/10 border border-red-500/30 p-2 rounded-sm font-mono tracking-tight text-center">
                        {authError}
                      </div>
                    )}

                    {forgotSuccess && (
                      <div className="text-[11px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 p-2.5 rounded-sm font-mono tracking-tight text-center whitespace-pre-line">
                        {forgotSuccess}
                      </div>
                    )}

                    <div className="flex flex-col gap-3">
                      <div className="flex flex-col gap-1">
                        <label className="text-[11px] text-txt-sub font-medium">Registered Email or Username</label>
                        <input 
                          type="text" 
                          required
                          disabled={resetOtpSent}
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="email@domain.com or @username"
                          className="h-9 px-3 border border-border-main/80 bg-bg-base text-txt-main rounded-sm text-xs focus:outline-none focus:border-sky-400/80 focus:ring-2 focus:ring-sky-500/20 transition-all duration-200 ease-out font-mono disabled:opacity-60"
                        />
                      </div>

                      {resetOtpSent && (
                        <>
                          <div className="flex flex-col gap-1 border-t border-border-main/40 pt-2">
                            <div className="flex justify-between items-center">
                              <label className="text-[11px] text-txt-sub font-medium">6-Digit Security OTP Code *</label>
                              <span className="text-[9px] font-mono text-txt-muted">Check Gmail / Inbox</span>
                            </div>
                            <input 
                              type="text" 
                              required
                              maxLength={6}
                              value={resetOtpCode}
                              onChange={(e) => setResetOtpCode(e.target.value.trim())}
                              placeholder="e.g. 849201"
                              className="h-9 px-3 border border-border-main/80 bg-bg-base text-txt-main rounded-sm text-sm focus:outline-none focus:border-sky-400/80 focus:ring-2 focus:ring-sky-500/20 transition-all duration-200 ease-out font-mono tracking-widest text-center"
                            />
                          </div>

                          <div className="flex flex-col gap-1">
                            <label className="text-[11px] text-txt-sub font-medium">New LynDesk Password *</label>
                            <input 
                              type="password" 
                              required
                              value={resetNewPassword}
                              onChange={(e) => setResetNewPassword(e.target.value)}
                              placeholder="Min 8 chars, A-Z, 0-9, special..."
                              className="h-9 px-3 border border-border-main/80 bg-bg-base text-txt-main rounded-sm text-xs focus:outline-none focus:border-sky-400/80 focus:ring-2 focus:ring-sky-500/20 transition-all duration-200 ease-out font-mono"
                            />
                          </div>

                          <div className="flex flex-col gap-1">
                            <label className="text-[11px] text-txt-sub font-medium">Confirm New Password *</label>
                            <input 
                              type="password" 
                              required
                              value={resetConfirmPassword}
                              onChange={(e) => setResetConfirmPassword(e.target.value)}
                              placeholder="Re-enter new password..."
                              className="h-9 px-3 border border-border-main/80 bg-bg-base text-txt-main rounded-sm text-xs focus:outline-none focus:border-sky-400/80 focus:ring-2 focus:ring-sky-500/20 transition-all duration-200 ease-out font-mono"
                            />
                          </div>

                          {/* Live Password Rules Checklist */}
                          {(() => {
                            const rules = validatePassword(resetNewPassword, resetConfirmPassword);
                            return (
                              <div className="grid grid-cols-2 gap-1 pt-1 text-[9px] font-mono border-t border-border-main/40">
                                <span className={rules.hasMinLength ? "text-emerald-400 font-semibold" : "text-txt-muted"}>
                                  {rules.hasMinLength ? "✓" : "○"} 8+ Chars
                                </span>
                                <span className={rules.hasUppercase ? "text-emerald-400 font-semibold" : "text-txt-muted"}>
                                  {rules.hasUppercase ? "✓" : "○"} Uppercase
                                </span>
                                <span className={rules.hasLowercase ? "text-emerald-400 font-semibold" : "text-txt-muted"}>
                                  {rules.hasLowercase ? "✓" : "○"} Lowercase
                                </span>
                                <span className={rules.hasNumber ? "text-emerald-400 font-semibold" : "text-txt-muted"}>
                                  {rules.hasNumber ? "✓" : "○"} Number
                                </span>
                                <span className={rules.hasSpecialChar ? "text-emerald-400 font-semibold" : "text-txt-muted"}>
                                  {rules.hasSpecialChar ? "✓" : "○"} Special Char
                                </span>
                                <span className={rules.passwordsMatch && resetConfirmPassword ? "text-emerald-400 font-semibold" : "text-txt-muted"}>
                                  {rules.passwordsMatch && resetConfirmPassword ? "✓ Passwords Match" : "○ Match Passwords"}
                                </span>
                              </div>
                            );
                          })()}
                        </>
                      )}
                    </div>

                    <button 
                      type="submit"
                      disabled={authActionLoading || (resetOtpSent && (!resetOtpCode || !validatePassword(resetNewPassword, resetConfirmPassword).isValid))}
                      className="w-full h-9 rounded-sm bg-accent-main hover:opacity-90 text-bg-base font-medium text-[11px] tracking-wider uppercase transition-opacity duration-150 cursor-pointer disabled:opacity-50 mt-1"
                    >
                      {authActionLoading 
                        ? (resetOtpSent ? "Verifying OTP Code..." : "Dispatching OTP...") 
                        : (resetOtpSent ? "Verify OTP & Reset Password" : "Send 6-Digit Security OTP")}
                    </button>

                    {resetOtpSent && (
                      <div className="text-center pt-1">
                        <button
                          type="button"
                          onClick={() => setResetOtpSent(false)}
                          className="text-[10px] text-txt-muted hover:text-txt-main transition-colors font-mono underline cursor-pointer"
                        >
                          Change Email / Resend OTP
                        </button>
                      </div>
                    )}
                  </motion.form>
                )}

                {authStep === "faculty_login" && (
                  <motion.form 
                    key="faculty_login"
                    layout
                    onSubmit={handleFacultyLogin}
                    initial={{ opacity: 0, y: 6, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.98 }}
                    transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                    className="relative z-10 overflow-hidden flex flex-col gap-4"
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
              {(profile?.avatar_url || extractAvatarFromUser(user)) ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={profile?.avatar_url || extractAvatarFromUser(user)} alt={profile?.full_name || "Profile"} className="w-full h-full object-cover" />
              ) : (
                (profile?.full_name || user?.user_metadata?.full_name || user?.email || "D").charAt(0).toUpperCase()
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

            {/* 2. Study Desk Focus & DSA Track Card */}
            <div className="border border-border-main/70 bg-bg-surface p-5 rounded-md flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[9px] uppercase tracking-widest text-txt-muted font-bold flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-txt-main" />
                  Study Desk Focus
                </span>
                <span className="text-[8px] font-mono text-txt-muted uppercase tracking-wider bg-bg-card px-1.5 py-0.5 rounded border border-border-main/50 font-bold flex items-center gap-1">
                  <Zap className="w-2.5 h-2.5 text-txt-main" />
                  {studyCardStats.streakCount} Day Streak
                </span>
              </div>

              <div className="flex flex-col gap-2.5">
                <div className="flex items-center justify-between p-2.5 rounded-sm bg-bg-card border border-border-main/60 text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <Target className="w-3.5 h-3.5 text-txt-sub" />
                    <span className="text-txt-muted text-[11px]">Solved Problems</span>
                  </div>
                  <span className="font-bold text-txt-main text-xs">{studyCardStats.solvedProblemsCount} Solved</span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-sm bg-bg-card border border-border-main/60 text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <Award className="w-3.5 h-3.5 text-txt-sub" />
                    <span className="text-txt-muted text-[11px]">Total XP Earned</span>
                  </div>
                  <span className="font-bold text-txt-main text-xs">{studyCardStats.totalXp} XP</span>
                </div>

                <div className="p-2.5 rounded-sm bg-bg-card border border-border-main/60 flex flex-col gap-1.5 font-mono">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-txt-muted font-medium truncate max-w-[170px]">
                      {studyCardStats.activePathTitle}
                    </span>
                    <span className="text-txt-main font-bold">{studyCardStats.activePathProgress}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-bg-surface rounded-full overflow-hidden border border-border-main/40">
                    <div
                      className="h-full bg-txt-main transition-all duration-500 rounded-full"
                      style={{ width: `${Math.min(100, Math.max(5, studyCardStats.activePathProgress))}%` }}
                    />
                  </div>
                </div>
              </div>

              <Link
                href="/study-desk"
                className="text-[9px] font-mono text-txt-sub hover:text-txt-main transition-colors uppercase font-medium flex items-center gap-1 self-start group mt-1"
              >
                <span>Open Study Desk</span>
                <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

          </div>

          {/* ───────────────────────────────────────────────────────────────── */}
          {/* COLUMN 2: CENTER DESK CARDS (Event Desk top, Code Desk bottom)  */}
          {/* ───────────────────────────────────────────────────────────────── */}
          <div className="lg:col-span-6 flex flex-col justify-between gap-6 h-full">

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
                    {upcomingDeadline || "No Deadlines"}
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

            {/* CARD 2: CODE DESK (BOTTOM) */}
            <div className="border border-border-main/70 bg-bg-surface p-6 rounded-md flex flex-col gap-5 flex-1 justify-between">
              <div className="flex items-center justify-between border-b border-border-main/30 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-bg-card border border-border-main/60 text-txt-main rounded-sm">
                    <Code size={15} />
                  </div>
                  <div className="flex flex-col">
                    <h2 className="font-display text-base font-medium text-txt-main">
                      Code Desk
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
                  Open Code Desk <ArrowRight size={11} />
                </Link>
              </div>

              {leetcodeHandle ? (
                <div className="flex flex-col gap-4 my-auto">
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
                <div className="p-4 border border-dashed border-border-main/60 rounded-sm flex flex-col items-center gap-2 text-center text-xs font-mono my-auto">
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
          <div className="lg:col-span-3 flex flex-col justify-between gap-6 h-full">

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

            {/* 📅 Weekly Schedule Horizon Agenda Card */}
            <div className="border border-border-main/70 bg-bg-surface p-5 rounded-md flex flex-col gap-3.5 relative">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CalendarIcon size={12} className="text-txt-main" />
                  <span className="font-mono text-[9px] uppercase tracking-widest text-txt-muted font-bold">
                    Weekly Horizon Agenda
                  </span>
                </div>
                <button
                  onClick={openWallCalendar}
                  className="text-[10px] font-mono text-txt-muted hover:text-txt-main transition-colors flex items-center gap-1"
                >
                  <Plus size={10} />
                  <span>Add Event</span>
                </button>
              </div>

              {/* 7-Day Grid */}
              <div className="grid grid-cols-7 gap-1.5 pt-1">
                {getCurrentWeekDates().map((day) => {
                  const dayEvents = weekEvents.filter(e => e.date === day.dateStr);
                  const hasEvents = dayEvents.length > 0;
                  const isHovered = hoveredWeekDate === day.dateStr;

                  return (
                    <div
                      key={day.dateStr}
                      onMouseEnter={() => setHoveredWeekDate(day.dateStr)}
                      onMouseLeave={() => setHoveredWeekDate(null)}
                      onClick={() => setHoveredWeekDate(isHovered ? null : day.dateStr)}
                      className={`relative p-2 rounded-md border transition-all cursor-pointer flex flex-col items-center justify-center text-center ${
                        day.isToday
                          ? "bg-bg-card border-txt-main/60 shadow-md ring-1 ring-txt-main/20"
                          : isHovered
                          ? "bg-bg-card/80 border-border-main"
                          : "bg-bg-surface border-border-main/50 hover:border-border-main"
                      }`}
                    >
                      {day.isToday && (
                        <span className="absolute -top-2 px-1.5 py-[1px] bg-txt-main text-bg-surface font-mono text-[7px] font-bold uppercase rounded-full tracking-wider shadow-sm">
                          TODAY
                        </span>
                      )}
                      <span className="font-mono text-[9px] text-txt-muted font-medium mt-1">{day.dayName}</span>
                      <span className={`font-mono text-sm font-bold my-0.5 ${day.isToday ? "text-txt-main" : "text-txt-sub"}`}>
                        {day.dayNum}
                      </span>

                      {/* Event Indicator Badge */}
                      {hasEvents ? (
                        <div className="flex items-center gap-1 mt-0.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                          <span className="font-mono text-[8px] text-txt-main font-semibold">{dayEvents.length}</span>
                        </div>
                      ) : (
                        <span className="font-mono text-[8px] text-txt-muted/40 mt-0.5">•</span>
                      )}

                      {/* Hover Popover Tooltip */}
                      <AnimatePresence>
                        {isHovered && (
                          <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.94 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 6, scale: 0.94 }}
                            transition={{ type: "spring", stiffness: 450, damping: 26, mass: 0.75 }}
                            className="absolute z-50 bottom-full mb-2.5 left-1/2 -translate-x-1/2 w-64 p-3 bg-bg-card border border-border-main/90 rounded-lg shadow-2xl text-left pointer-events-auto backdrop-blur-xl ring-1 ring-border-main/50"
                          >
                            <div className="flex items-center justify-between pb-2 border-b border-border-main/60 mb-2">
                              <span className="font-mono text-[10px] text-txt-main font-bold flex items-center gap-1.5">
                                <CalendarIcon size={10} className="text-txt-muted" />
                                {day.dayName}, {day.dateStr}
                              </span>
                              <span className="text-[9px] font-mono px-2 py-0.5 bg-bg-surface text-txt-main border border-border-main/80 rounded-md font-bold shadow-xs">
                                {dayEvents.length} {dayEvents.length === 1 ? "Event" : "Events"}
                              </span>
                            </div>

                            {dayEvents.length === 0 ? (
                              <div className="py-3 text-center text-txt-muted font-mono text-[10px]">
                                No events scheduled for this day
                              </div>
                            ) : (
                              <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto pr-0.5">
                                {dayEvents.map((evt) => (
                                  <div key={evt.id} className="p-2 rounded bg-bg-surface border border-border-main/60 flex flex-col gap-1 hover:border-border-main transition-colors">
                                    <div className="flex items-center justify-between gap-1">
                                      <span className="font-mono text-[10px] font-bold text-txt-main truncate max-w-[135px]">
                                        {evt.title}
                                      </span>
                                      <span className={`text-[8px] font-mono uppercase px-1.5 py-0.5 rounded-md font-bold tracking-wider ${
                                        evt.category === "contest" ? "bg-red-500/10 text-red-500 border border-red-500/20" :
                                        evt.category === "study" ? "bg-blue-500/10 text-blue-500 border border-blue-500/20" :
                                        evt.category === "deadline" ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" :
                                        "bg-purple-500/10 text-purple-500 border border-purple-500/20"
                                      }`}>
                                        {evt.category}
                                      </span>
                                    </div>
                                    {evt.time && (
                                      <div className="flex items-center gap-1 font-mono text-[8px] text-txt-muted font-medium">
                                        <Clock size={9} />
                                        <span>{evt.time}</span>
                                      </div>
                                    )}
                                    {evt.description && (
                                      <p className="font-sans text-[9px] text-txt-sub line-clamp-2 leading-relaxed">
                                        {evt.description}
                                      </p>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

        </div>

      </main>

      <Footer />

      <PreferencePresetModal 
        isOpen={isPresetModalOpen}
        onClose={() => setIsPresetModalOpen(false)}
      />
    </div>
  );
}
