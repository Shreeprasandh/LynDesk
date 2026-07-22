"use client";

import React, { useState, useEffect } from "react";
import { useTheme } from "./ThemeProvider";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import { normalizeTitleCase, getSpellingSuggestion, normalizeSkillsList, getAutocompleteSuggestions } from "../lib/textNormalization";
import Link from "next/link";
import LynAI from "./LynAI";
import { usePathname, useRouter } from "next/navigation";
import LynDeskLogo from "./LynDeskLogo";
import { 
  Sun, 
  Moon, 
  User, 
  LogOut, 
  Bell, 
  X, 
  Clock, 
  Check, 
  Sparkles,
  Menu
} from "lucide-react";

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: "deadline" | "invite" | "credit" | "system";
  category: "alerts" | "updates";
  time: string;
  read: boolean;
  actionLabel?: string;
  actionUrl?: string;
  role?: "student" | "faculty" | "recruiter";
  senderId?: string;
  recipientId?: string;
}

export default function Header() {
  const { theme, toggleTheme } = useTheme();
  const { user, userRole, loading, signOut } = useAuth();

  const [isOpen, setIsOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [drawerTab, setDrawerTab] = useState<"alerts" | "updates">("alerts");
  const [isFaculty, setIsFaculty] = useState(false);
  const [isRecruiter, setIsRecruiter] = useState(false);

  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    setIsFaculty(userRole === "coordinator");
    setIsRecruiter(userRole === "recruiter");
  }, [userRole, pathname]);

  // Global authentication route guard: redirects unauthorized sessions immediately to landing page
  useEffect(() => {
    if (loading) return; // Wait until authentication check completes!
    const publicPaths = ["/", "/terms", "/privacy", "/help"];
    if (!user && !publicPaths.includes(pathname)) {
      router.push("/");
    }
  }, [user, loading, pathname, router]);

  // Derived state for notifications based on the current user's role
  const activeNotifRole = isFaculty ? "faculty" : isRecruiter ? "recruiter" : "student";
  const filteredNotifications = notifications.filter(n => {
    if (n.role && n.role !== activeNotifRole) return false;
    return true;
  });

  // Compute unread count dynamically during render
  const unreadCount = filteredNotifications.filter(n => !n.read).length;

  // Onboarding Wizard States
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingLoading, setOnboardingLoading] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  
  // Compulsory Fields
  const [oFullName, setOFullName] = useState("");
  const [oUsername, setOUsername] = useState("");
  const [oRole, setORole] = useState<"student" | "employee" | "solo">("student");
  const [oDob, setODob] = useState("");
  const [oLocation, setOLocation] = useState("");
  
  // Student dynamic fields
  const [oCollege, setOCollege] = useState("");
  const [oDepartment, setODepartment] = useState("");
  const [oGradYear, setOGradYear] = useState("");
  
  // Employee dynamic fields
  const [oCompany, setOCompany] = useState("");
  const [oDesignation, setODesignation] = useState("");
  
  // Optional expandable fields
  const [oShowOptional, setOShowOptional] = useState(false);
  const [oBio, setOBio] = useState("");
  const [oSkills, setOSkills] = useState("");
  const [oGithub, setOGithub] = useState("");
  const [oLinkedIn, setOLinkedIn] = useState("");
  const [oDiscord, setODiscord] = useState("");
  const [oPortfolio, setOPortfolio] = useState("");
  
  const [onboardingError, setOnboardingError] = useState<string | null>(null);

  // Suggestions
  const [oCollegeSuggestion, setOCollegeSuggestion] = useState<string | null>(null);
  const [oDeptSuggestion, setODeptSuggestion] = useState<string | null>(null);

  // Autocomplete Suggestions
  const [oCollegeSuggestions, setOCollegeSuggestions] = useState<string[]>([]);
  const [oDeptSuggestions, setODeptSuggestions] = useState<string[]>([]);
  const [oCompanySuggestions, setOCompanySuggestions] = useState<string[]>([]);

  // Check onboarding status on mount / user change
  useEffect(() => {
    if (user) {
      const isCompleted = user.user_metadata?.onboarding_completed;
      if (!isCompleted) {
        const handle = setTimeout(() => {
          setOFullName(user.user_metadata?.full_name || "");
          setOUsername(user.user_metadata?.username || user.email?.split("@")[0] || "");
          setShowOnboarding(true);
        }, 0);
        return () => clearTimeout(handle);
      } else {
        const handle = setTimeout(() => {
          setShowOnboarding(false);
        }, 0);
        return () => clearTimeout(handle);
      }
    } else {
      const handle = setTimeout(() => {
        setShowOnboarding(false);
      }, 0);
      return () => clearTimeout(handle);
    }
  }, [user]);

  const handleSubmitOnboarding = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    // Auto-normalize text fields on submit
    const cleanFullName = normalizeTitleCase(oFullName);
    const cleanUsername = oUsername.trim().toLowerCase();
    const cleanLocation = normalizeTitleCase(oLocation);
    const cleanCollege = oRole === "student" ? normalizeTitleCase(oCollege) : "";
    const cleanDept = oRole === "student" ? normalizeTitleCase(oDepartment) : "";
    const cleanCompany = oRole === "employee" ? normalizeTitleCase(oCompany) : "";
    const cleanDesignation = oRole === "employee" ? normalizeTitleCase(oDesignation) : "";
    const cleanSkills = normalizeSkillsList(oSkills);

    if (!cleanFullName || !cleanUsername || !oDob || !cleanLocation) {
      setOnboardingError("Full Name, Username, Date of Birth, and Location are required.");
      return;
    }
    
    if (oRole === "student" && (!cleanCollege || !cleanDept || !oGradYear.trim())) {
      setOnboardingError("Student academic credentials are required.");
      return;
    }

    if (oRole === "employee" && (!cleanCompany || !cleanDesignation)) {
      setOnboardingError("Company and designation details are required.");
      return;
    }

    const isValidUrl = (url: string) => {
      try {
        new URL(url);
        return true;
      } catch {
        return false;
      }
    };

    if (oGithub.trim() && !isValidUrl(oGithub.trim())) {
      setOnboardingError("Please enter a valid GitHub URL (including https://).");
      return;
    }
    if (oLinkedIn.trim() && !isValidUrl(oLinkedIn.trim())) {
      setOnboardingError("Please enter a valid LinkedIn URL (including https://).");
      return;
    }
    if (oPortfolio.trim() && !isValidUrl(oPortfolio.trim())) {
      setOnboardingError("Please enter a valid Portfolio URL (including https://).");
      return;
    }

    setOnboardingLoading(true);
    setOnboardingError(null);

    try {
      // 1. Try updating the public profiles table, but fail gracefully to prevent blocking the user
      try {
        const { error: profileErr } = await supabase
          .from("profiles")
          .upsert({
            id: user.id,
            username: cleanUsername,
            full_name: cleanFullName,
            avatar_url: user.user_metadata?.avatar_url || "",
            is_profile_public: true,
            updated_at: new Date().toISOString()
          });

        if (profileErr) {
          console.warn("Profiles table upsert failed (database RLS/Schema). Proceeding with Auth Metadata fallback.", profileErr);
        }
      } catch (dbErr) {
        console.warn("Database profiles table write exception. Proceeding with Auth Metadata fallback.", dbErr);
      }

      // 2. Update metadata in Auth users (this is the source of truth for onboarding state check)
      const { error: authErr } = await supabase.auth.updateUser({
        data: {
          onboarding_completed: true,
          role: oRole,
          dob: oDob,
          location: cleanLocation,
          college_name: oRole === "student" ? cleanCollege : undefined,
          department: oRole === "student" ? cleanDept : undefined,
          graduation_year: oRole === "student" ? oGradYear.trim() : undefined,
          company_name: oRole === "employee" ? cleanCompany : undefined,
          company_role: oRole === "employee" ? cleanDesignation : undefined,
          bio: oBio.trim(),
          skills: cleanSkills,
          github_url: oGithub.trim(),
          linkedin_url: oLinkedIn.trim(),
          discord_username: oDiscord.trim(),
          portfolio_url: oPortfolio.trim()
        }
      });

      if (authErr) throw authErr;

      setShowOnboarding(false);
      window.location.reload();
    } catch (err) {
      console.error("Onboarding setup failed:", err);
      let message = "Failed to complete setup. Please check connection.";
      if (err && typeof err === "object" && "message" in err) {
        message = String((err as { message: unknown }).message);
      } else if (typeof err === "string") {
        message = err;
      }
      setOnboardingError(message);
    } finally {
      setOnboardingLoading(false);
    }
  };

  // Initialize notifications from localStorage
  useEffect(() => {
    const defaultNotifications: NotificationItem[] = [];

    const loadNotifications = async () => {
      const stored = localStorage.getItem("ldk_global_notifications");
      let localList: NotificationItem[] = [];

      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            const seen = new Set<string>();
            localList = parsed.map((n: any) => {
              if (n.type === "invite" && (n.actionLabel === "Open Workspace" || !n.actionLabel)) {
                return { ...n, actionLabel: "Accept Invite" };
              }
              return n;
            }).filter((n: any) => {
              // Always purge outgoing/invite entries from the general global list
              if (n.type === "invite") return false;
              if (n.message && (n.message.includes("sent a team") || n.message.startsWith("You sent"))) return false;
              
              const key = `${n.type || ""}_${n.title || ""}_${n.message || ""}_${n.actionUrl || ""}`;
              if (seen.has(key)) return false;
              seen.add(key);
              return true;
            });
          }
        } catch (e) {
          console.error("Error cleaning notifications: ", e);
        }
      } else {
        localList = defaultNotifications.filter(n => n.type !== "invite");
        localStorage.setItem("ldk_global_notifications", JSON.stringify(localList));
      }

      // Read recipient-specific local notifications for current logged in user
      let userLocalNotifs: NotificationItem[] = [];
      if (user?.id) {
        const userStored = localStorage.getItem(`ldk_user_notifications_${user.id}`);
        if (userStored) {
          try {
            userLocalNotifs = JSON.parse(userStored);
          } catch (e) {
            console.error("Error parsing user notifications", e);
          }
        }
      }

      // Fetch real database notifications for recipient from Supabase
      let dbNotifs: NotificationItem[] = [];
      if (user?.id) {
        try {
          const { data: dbData } = await supabase
            .from("notifications")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false });

          if (dbData && dbData.length > 0) {
            dbNotifs = dbData.map((d: any) => ({
              id: d.id,
              title: d.title || "Notification",
              message: d.content || d.message || "",
              type: d.type || "invite",
              category: "alerts",
              time: "Just now",
              read: d.is_read ?? false,
              actionLabel: "Accept Invite",
              actionUrl: d.link_url || "/explore"
            }));
          }
        } catch (e) {
          console.warn("DB notification fetch fallback:", e);
        }
      }

      const combined = [...dbNotifs, ...userLocalNotifs, ...localList];
      const uniqueSet = new Set<string>();
      const finalNotifs = combined.filter((n: any) => {
        const idKey = n.id || `${n.title}_${n.message}`;
        const contentKey = `${n.title}_${n.message}`;
        if (uniqueSet.has(idKey) || uniqueSet.has(contentKey)) return false;
        uniqueSet.add(idKey);
        uniqueSet.add(contentKey);
        return true;
      });

      setNotifications(finalNotifs);

      // Check live LeetCode daily challenge status for streak warning
      const lcHandle = user?.user_metadata?.leetcode_username || (typeof window !== "undefined" ? localStorage.getItem("ldk_leetcode_handle") : "");
      if (lcHandle) {
        try {
          const res = await fetch(`/api/coding-stats?platform=leetcode&username=${lcHandle}`);
          if (res.ok) {
            const data = await res.json();
            if (data?.dailyChallenge && !data.dailyChallenge.completed) {
              const todayStr = new Date().toISOString().split("T")[0];
              const streakNotifId = `notif_streak_warning_${todayStr}`;
              const title = data.dailyChallenge.title || "Daily Challenge";
              const diff = data.dailyChallenge.difficulty || "Medium";
              const streak = data.leetcodeStreak || 0;

              const streakNotif: NotificationItem = {
                id: streakNotifId,
                title: "🔥 LeetCode Streak at Risk!",
                message: `Today's Daily Challenge "${title}" (${diff}) is pending. Solve now to maintain your ${streak}-day streak!`,
                type: "deadline",
                category: "alerts",
                time: "Today",
                read: false,
                actionLabel: "Solve Challenge",
                actionUrl: "/coding-deck"
              };

              setNotifications(prev => {
                if (prev.some(n => n.id === streakNotifId)) return prev;
                return [streakNotif, ...prev];
              });
            }
          }
        } catch (e) {}
      }
    };

    loadNotifications();

    window.addEventListener("ldk_notifications_update", loadNotifications);

    let channel: any = null;
    if (user?.id) {
      channel = supabase
        .channel("ldk_global_realtime_bus")
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` },
          () => {
            loadNotifications();
          }
        )
        .on(
          "broadcast",
          { event: "ldk_invite_sent" },
          (payload) => {
            const data = payload.payload;
            if (data && (data.recipientId === user.id || data.recipientId === user.email)) {
              // Add to recipient's local storage and reload notifications drawer
              const userKey = `ldk_user_notifications_${user.id}`;
              const userStored = localStorage.getItem(userKey);
              const notifList = userStored ? JSON.parse(userStored) : [];
              notifList.unshift({
                id: `n_rt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
                recipientId: user.id,
                senderId: data.senderId,
                title: data.title || "Teammate Match Invite",
                message: data.message || "You received a new team invite!",
                type: data.type || "invite",
                category: "alerts",
                time: "Just now",
                read: false,
                actionLabel: "Accept Invite",
                actionUrl: data.actionUrl || "/explore"
              });
              localStorage.setItem(userKey, JSON.stringify(notifList.slice(0, 100)));
              loadNotifications();
            }
          }
        )
        .subscribe();
    }

    return () => {
      window.removeEventListener("ldk_notifications_update", loadNotifications);
      if (channel) supabase.removeChannel(channel);
    };
  }, [user]);

  const handleClearTab = () => {
    const updated = notifications.filter(n => {
      if (n.category !== drawerTab) return true;
      if (n.actionLabel && !n.read) return true;
      return false;
    });
    setNotifications(updated);
    localStorage.setItem("ldk_global_notifications", JSON.stringify(updated));
    window.dispatchEvent(new Event("ldk_notifications_update"));
  };

  const handleNotificationAction = (id: string, actionUrl?: string) => {
    const targetNotif = notifications.find(n => n.id === id);
    const targetSenderId = targetNotif?.senderId;
    const myName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Teammate";

    if (actionUrl) {
      try {
        const urlParts = actionUrl.split("?");
        const workspacePath = urlParts[0];
        const workspaceId = workspacePath.split("/").pop();
        if (workspaceId && workspaceId.length > 0) {
          // Register workspace in ldk_joined_workspaces
          const joinedStr = localStorage.getItem("ldk_joined_workspaces");
          const joinedList: string[] = joinedStr ? JSON.parse(joinedStr) : [];
          if (!joinedList.includes(workspaceId)) {
            joinedList.push(workspaceId);
            localStorage.setItem("ldk_joined_workspaces", JSON.stringify(joinedList));
          }

          // Save workspace card to ldk_events so dashboard renders it immediately
          const eventsStr = localStorage.getItem("ldk_events");
          const eventsList: any[] = eventsStr ? JSON.parse(eventsStr) : [];
          if (!eventsList.some(e => e.id === workspaceId)) {
            eventsList.unshift({
              id: workspaceId,
              title: `Shared Workspace (${workspaceId.substring(0, 8)})`,
              deadline: "Ongoing",
              location: "online",
              level: "global",
              url: `/workspace/${workspaceId}`,
              status: "development",
              stages: ["Ideation", "Development", "Final Submission"]
            });
            localStorage.setItem("ldk_events", JSON.stringify(eventsList));
          }
        }
      } catch (e) {
        console.error("Error registering joined workspace on accept: ", e);
      }
    }

    // Send outcome notification back to the inviter
    if (targetSenderId) {
      fetch("/api/notifications/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientId: targetSenderId,
          senderId: user?.id || "guest",
          title: "Invitation Accepted",
          message: `🟢 ${myName} accepted your workspace invitation.`,
          type: "system",
          category: "updates",
          actionUrl: actionUrl || "/explore"
        })
      }).catch(() => {});
    }

    // Dismiss accepted notification from drawer so it disappears
    const updated = notifications.filter(n => n.id !== id);
    setNotifications(updated);
    if (user) {
      localStorage.setItem(`ldk_notifications_${user.id}`, JSON.stringify(updated));
    }
    localStorage.setItem("ldk_global_notifications", JSON.stringify(updated));
    window.dispatchEvent(new Event("ldk_notifications_update"));

    if (actionUrl) {
      router.push(actionUrl);
      setIsOpen(false);
    }
  };

  const handleNotificationReject = (id: string, actionUrl?: string) => {
    const targetNotif = notifications.find(n => n.id === id);
    const targetSenderId = targetNotif?.senderId;
    const myName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Teammate";

    // Send outcome notification back to the inviter
    if (targetSenderId) {
      fetch("/api/notifications/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientId: targetSenderId,
          senderId: user?.id || "guest",
          title: "Invitation Declined",
          message: `🔴 ${myName} declined your workspace invitation.`,
          type: "warning",
          category: "updates",
          actionUrl: "/explore"
        })
      }).catch(() => {});
    }

    // Dismiss declined notification from drawer so it disappears
    const updated = notifications.filter(n => n.id !== id);
    setNotifications(updated);
    if (user) {
      localStorage.setItem(`ldk_notifications_${user.id}`, JSON.stringify(updated));
    }
    localStorage.setItem("ldk_global_notifications", JSON.stringify(updated));

    if (actionUrl) {
      try {
        const urlParts = actionUrl.split("?");
        if (urlParts.length > 1) {
          const workspacePath = urlParts[0];
          const workspaceId = workspacePath.split("/").pop();
          const params = new URLSearchParams(urlParts[1]);
          const friendId = params.get("acceptInvite");

          if (workspaceId && friendId) {
            const storedKey = `ldk_sent_invites_${workspaceId}`;
            const storedStr = localStorage.getItem(storedKey);
            if (storedStr) {
              const list: string[] = JSON.parse(storedStr);
              const cleaned = list.filter(fid => fid !== friendId);
              localStorage.setItem(storedKey, JSON.stringify(cleaned));
            }
          }
        }
      } catch (e) {
        console.error("Error clearing sent invite on reject: ", e);
      }
    }
    
    window.dispatchEvent(new Event("ldk_notifications_update"));
  };

  const triggerCronNudge = () => {
    const alerts = [
      {
        id: `n_cron_${Date.now()}`,
        title: "Cron Sync Complete",
        message: "Resend background worker successfully synchronized active GitHub commits for your team project space.",
        type: "system" as const,
        category: "updates" as const,
        time: "Just now",
        read: false
      },
      {
        id: `n_cron_${Date.now()}`,
        title: "Urgent: Stage Overdue",
        message: "Your 'EduForge' prototype deployment is overdue. Submit your Vercel URL to avoid credit deductions.",
        type: "deadline" as const,
        category: "alerts" as const,
        time: "Just now",
        read: false,
        actionLabel: "Open Workspace",
        actionUrl: "/workspace/eduforge"
      }
    ];

    const randomAlert = alerts[Math.floor(Math.random() * alerts.length)];
    const updated = [randomAlert, ...notifications];
    setNotifications(updated);
    localStorage.setItem("ldk_global_notifications", JSON.stringify(updated));
  };

  return (
    <>
      <header className="sticky top-0 z-40 h-16 flex items-center justify-between px-6 md:px-12 bg-bg-surface/80 backdrop-blur-md border-b border-border-main/60 transition-colors duration-150 flex-shrink-0">
        <Link href="/" className="flex items-center gap-2 select-none cursor-pointer">
          <LynDeskLogo size={20} className="mr-1" />
          <span className="font-display text-base font-semibold tracking-[0.25em] text-txt-main">
            LYNDESK
          </span>
        </Link>

        {/* Right Controls Area containing Navigation & Icons */}
        <div className="flex items-center gap-6">
          {/* Navigation Links */}
          {user && (
            <nav className="hidden lg:flex items-center gap-6 font-mono text-[10px] uppercase tracking-wider">
              {isFaculty ? (
                <>
                  <Link href="/coordinator?tab=overview" className="text-txt-sub hover:text-txt-main transition-colors pb-0.5">Overview</Link>
                  <Link href="/coordinator?tab=talent_registry" className="text-txt-sub hover:text-txt-main transition-colors pb-0.5">Talent Registry</Link>
                  <Link href="/coordinator?tab=broadcasts" className="text-txt-sub hover:text-txt-main transition-colors pb-0.5">Broadcasts</Link>
                  <Link href="/coordinator?tab=verifications" className="text-txt-sub hover:text-txt-main transition-colors pb-0.5">Claims Queue</Link>
                  <Link href="/coordinator?tab=staff_access" className="text-txt-sub hover:text-txt-main transition-colors pb-0.5">Staff Access</Link>
                </>
              ) : isRecruiter ? (
                <>
                  <Link href="/recruiter" className="text-txt-sub hover:text-txt-main transition-colors pb-0.5">HR Console</Link>
                  <Link href="/profile" className="text-txt-sub hover:text-txt-main transition-colors pb-0.5">My Profile</Link>
                </>
              ) : (
                <>
                  <Link href="/" className="text-txt-sub hover:text-txt-main transition-colors pb-0.5">Dashboard</Link>
                  <Link href="/explore" className="text-txt-sub hover:text-txt-main transition-colors pb-0.5">Explore</Link>
                  <Link href="/coding-deck" className="text-txt-sub hover:text-txt-main transition-colors pb-0.5">Coding Deck</Link>
                  <Link href="/news-contests" className="text-txt-sub hover:text-txt-main transition-colors pb-0.5">News & Contests</Link>
                  <Link href="/leaderboard" className="text-txt-sub hover:text-txt-main transition-colors pb-0.5">Leaderboard</Link>
                  <Link href="/friends" className="text-txt-sub hover:text-txt-main transition-colors pb-0.5">Friends</Link>
                </>
              )}
            </nav>
          )}

          {/* Separator Line */}
          <div className="hidden lg:block w-[1px] h-4 bg-border-main/60" />

          <div className="flex items-center gap-2 md:gap-3">
            {/* Notification Bell (Only visible when user is logged in) */}
            {user && (
              <button 
                onClick={() => setIsOpen(true)}
                className="p-2 rounded-full border border-border-main/80 hover:bg-bg-card text-txt-main transition-colors duration-150 focus:outline-none relative cursor-pointer"
                aria-label="View notifications"
              >
                <Bell size={14} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                )}
              </button>
            )}

            {/* Theme Switcher */}
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-full border border-border-main/80 hover:bg-bg-card text-txt-main transition-colors duration-150 focus:outline-none"
              aria-label="Toggle theme"
            >
              {theme === "light" ? <Moon size={14} /> : <Sun size={14} />}
            </button>
            
            {user && (
              <>
                <Link 
                  href="/profile"
                  className="p-2 rounded-full border border-border-main/80 hover:bg-bg-card text-txt-main transition-colors duration-150 focus:outline-none flex items-center justify-center"
                  title="View Profile"
                >
                  <User size={14} />
                </Link>
                <button 
                  onClick={() => setShowLogoutConfirm(true)}
                  className="p-2 rounded-full border border-border-main/80 hover:bg-bg-card text-txt-main transition-colors duration-150 focus:outline-none cursor-pointer"
                  title="Sign Out"
                >
                  <LogOut size={14} />
                </button>
                
                {/* Hamburger menu button for mobile navigation */}
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="lg:hidden p-2 rounded-full border border-border-main/80 hover:bg-bg-card text-txt-main transition-colors duration-150 focus:outline-none cursor-pointer"
                  title="Toggle Menu"
                >
                  <Menu size={14} />
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Slide-over Mobile Navigation Drawer Overlay */}
      {mobileMenuOpen && user && (
        <div className="lg:hidden fixed inset-0 z-50 overflow-hidden font-sans text-left">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity" 
            onClick={() => setMobileMenuOpen(false)}
          />

          <div className="absolute inset-y-0 left-0 max-w-full flex pr-16 animate-slide-in-right">
            <div className="w-64 border-r border-border-main/70 bg-bg-surface flex flex-col h-full shadow-2xl text-left">
              
              {/* Drawer Header */}
              <div className="px-6 py-5 border-b border-border-main/40 flex items-center justify-between">
                <span className="font-display text-sm font-semibold tracking-wider text-txt-main">
                  Navigation Menu
                </span>
                <button 
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 rounded-full hover:bg-bg-card text-txt-muted hover:text-txt-main cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Navigation Links inside Drawer */}
              <nav className="flex flex-col p-6 gap-5 font-mono text-xs uppercase tracking-wider">
                {isFaculty ? (
                  <>
                    <Link href="/coordinator?tab=overview" onClick={() => setMobileMenuOpen(false)} className="text-txt-sub hover:text-txt-main transition-colors py-1 border-b border-border-main/30">Overview</Link>
                    <Link href="/coordinator?tab=talent_registry" onClick={() => setMobileMenuOpen(false)} className="text-txt-sub hover:text-txt-main transition-colors py-1 border-b border-border-main/30">Talent Registry</Link>
                    <Link href="/coordinator?tab=broadcasts" onClick={() => setMobileMenuOpen(false)} className="text-txt-sub hover:text-txt-main transition-colors py-1 border-b border-border-main/30">Broadcasts</Link>
                    <Link href="/coordinator?tab=verifications" onClick={() => setMobileMenuOpen(false)} className="text-txt-sub hover:text-txt-main transition-colors py-1 border-b border-border-main/30">Claims Queue</Link>
                    <Link href="/coordinator?tab=staff_access" onClick={() => setMobileMenuOpen(false)} className="text-txt-sub hover:text-txt-main transition-colors py-1 border-b border-border-main/30">Staff Access</Link>
                  </>
                ) : isRecruiter ? (
                  <>
                    <Link href="/recruiter" onClick={() => setMobileMenuOpen(false)} className="text-txt-sub hover:text-txt-main transition-colors py-1 border-b border-border-main/30">HR Console</Link>
                    <Link href="/profile" onClick={() => setMobileMenuOpen(false)} className="text-txt-sub hover:text-txt-main transition-colors py-1 border-b border-border-main/30">My Profile</Link>
                  </>
                ) : (
                  <>
                    <Link href="/" onClick={() => setMobileMenuOpen(false)} className="text-txt-sub hover:text-txt-main transition-colors py-1 border-b border-border-main/30">Dashboard</Link>
                    <Link href="/explore" onClick={() => setMobileMenuOpen(false)} className="text-txt-sub hover:text-txt-main transition-colors py-1 border-b border-border-main/30">Explore</Link>
                    <Link href="/coding-deck" onClick={() => setMobileMenuOpen(false)} className="text-txt-sub hover:text-txt-main transition-colors py-1 border-b border-border-main/30">Coding Deck</Link>
                    <Link href="/news-contests" onClick={() => setMobileMenuOpen(false)} className="text-txt-sub hover:text-txt-main transition-colors py-1 border-b border-border-main/30">News & Contests</Link>
                    <Link href="/leaderboard" onClick={() => setMobileMenuOpen(false)} className="text-txt-sub hover:text-txt-main transition-colors py-1 border-b border-border-main/30">Leaderboard</Link>
                    <Link href="/friends" onClick={() => setMobileMenuOpen(false)} className="text-txt-sub hover:text-txt-main transition-colors py-1 border-b border-border-main/30">Friends</Link>
                  </>
                )}
              </nav>

              {/* Bottom profile links */}
              <div className="mt-auto p-6 border-t border-border-main/40 flex flex-col gap-3 font-mono text-[10px] uppercase">
                <Link href="/profile" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 text-txt-sub hover:text-txt-main">
                  <User size={14} /> My Profile
                </Link>
                <button 
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setShowLogoutConfirm(true);
                  }}
                  className="flex items-center gap-2 text-txt-sub hover:text-red-500 text-left w-full cursor-pointer"
                >
                  <LogOut size={14} /> Sign Out
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {user && <LynAI />}

      {/* Slide-over Notification Drawer Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden font-sans">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity" 
            onClick={() => setIsOpen(false)}
          />

          <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md border-l border-border-main/70 bg-bg-surface flex flex-col h-full shadow-2xl animate-fade-in">
              
              {/* Drawer Header */}
              <div className="px-6 py-5 border-b border-border-main/40 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="font-mono text-[9px] uppercase tracking-widest text-txt-muted">Nudge Engine</span>
                  <h2 className="text-base font-semibold text-txt-main font-display">Notifications</h2>
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={handleClearTab}
                    className="text-[9px] font-mono uppercase tracking-wider text-txt-muted hover:text-txt-main cursor-pointer font-semibold"
                  >
                    Clear Tab
                  </button>
                  <button 
                    onClick={() => setIsOpen(false)}
                    className="p-1 rounded-full hover:bg-bg-card text-txt-muted hover:text-txt-main cursor-pointer"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* Category Tabs inside Drawer */}
              <div className="flex border-b border-border-main/40 bg-bg-base/30 px-6 py-2.5 font-mono text-[10px] uppercase tracking-wider gap-6">
                <button
                  onClick={() => setDrawerTab("alerts")}
                  className={`pb-1 cursor-pointer transition-all border-b-2 font-medium ${
                    drawerTab === "alerts" 
                      ? "text-txt-main border-txt-main" 
                      : "text-txt-muted border-transparent hover:text-txt-main"
                  }`}
                >
                  Personal Alerts ({filteredNotifications.filter(n => n.category === "alerts" && !n.read).length})
                </button>
                <button
                  onClick={() => setDrawerTab("updates")}
                  className={`pb-1 cursor-pointer transition-all border-b-2 font-medium ${
                    drawerTab === "updates" 
                      ? "text-txt-main border-txt-main" 
                      : "text-txt-muted border-transparent hover:text-txt-main"
                  }`}
                >
                  General Feed ({filteredNotifications.filter(n => n.category === "updates" && !n.read).length})
                </button>
              </div>

              {/* Nudge Engine Simulation Panel */}
              {(isFaculty || isRecruiter) && (
                <div className="px-6 py-4 bg-bg-base/40 border-b border-border-main/40 flex items-center justify-between">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] font-semibold text-txt-main flex items-center gap-1">
                      <Sparkles size={11} className="text-yellow-500" /> Cron Simulator
                    </span>
                    <span className="text-[9px] text-txt-muted font-light leading-snug max-w-[240px]">
                      Trigger background Resend worker deadlocks check manually.
                    </span>
                  </div>
                  <button
                    onClick={triggerCronNudge}
                    className="h-7 px-3 bg-accent-main text-bg-base text-[9px] font-mono tracking-wider uppercase rounded-sm hover:opacity-90 transition-opacity cursor-pointer"
                  >
                    Fire Worker
                  </button>
                </div>
              )}

              {/* Notification Items List */}
              <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-4">
                {filteredNotifications.filter(n => n.category === drawerTab).length > 0 ? (
                  filteredNotifications.filter(n => n.category === drawerTab).map((item, idx) => (
                    <div 
                      key={`${item.id}_${idx}`} 
                      className={`p-4 border rounded-sm flex flex-col gap-3 transition-colors ${
                        item.read 
                          ? "bg-bg-base/30 border-border-main/40 opacity-75" 
                          : "bg-bg-card border-border-main text-txt-main"
                      }`}
                    >
                      <div className="flex justify-between items-start gap-3">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${
                            item.type === "deadline" 
                              ? "bg-red-500" 
                              : item.type === "invite" 
                              ? "bg-blue-500" 
                              : item.type === "credit"
                              ? "bg-emerald-500"
                              : "bg-txt-muted"
                          }`} />
                          <h4 className="text-xs font-semibold text-txt-main">{item.title}</h4>
                        </div>
                        <span className="text-[8px] font-mono text-txt-muted">{item.time}</span>
                      </div>

                      <p className="text-[11px] text-txt-sub font-light leading-relaxed">
                        {item.message}
                      </p>

                      {item.actionLabel && !item.read && (
                        <div className="flex gap-2 justify-end pt-1">
                          {item.type === "invite" && (
                            <button
                              onClick={() => handleNotificationReject(item.id, item.actionUrl)}
                              className="h-6 px-3 border border-border-main hover:bg-bg-card text-txt-main font-mono text-[8px] tracking-wider uppercase rounded-sm transition-colors cursor-pointer flex items-center gap-1 font-bold"
                            >
                              <X size={8} /> Reject
                            </button>
                          )}
                          <button
                            onClick={() => handleNotificationAction(item.id, item.actionUrl)}
                            className="h-6 px-3 bg-accent-main text-bg-base font-mono text-[8px] tracking-wider uppercase rounded-sm hover:opacity-90 transition-opacity cursor-pointer flex items-center gap-1 font-bold"
                          >
                            <Check size={8} /> {item.actionLabel}
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="h-44 flex flex-col items-center justify-center text-center p-6 text-txt-muted font-mono text-[10px] uppercase">
                    <Clock size={16} className="mb-2" />
                    No notifications
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Onboarding Wizard Full-Screen Modal */}
      {showOnboarding && (
        <div className="fixed inset-0 z-[9999] overflow-y-auto bg-bg-base/95 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-bg-surface border border-border-main max-w-lg w-full p-6 md:p-8 rounded-md flex flex-col gap-6 shadow-2xl animate-fade-in">
            
            <div className="flex flex-col gap-1 border-b border-border-main/40 pb-4">
              <span className="font-mono text-[9px] uppercase tracking-widest text-txt-muted">Profile setup required</span>
              <h2 className="font-display text-2xl font-light text-txt-main">Setup Your LynDesk Portfolio</h2>
              <p className="text-xs text-txt-sub">Introduce yourself to the campus directory to collaborate in workspaces.</p>
            </div>

            {onboardingError && (
              <div className="text-xs p-3 border border-red-500/50 bg-red-500/10 text-txt-muted font-mono rounded-sm text-center">
                {onboardingError}
              </div>
            )}

            <form onSubmit={handleSubmitOnboarding} className="flex flex-col gap-4">
              
              {/* Primary Identity Section */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-txt-sub font-semibold uppercase tracking-wider">Full Legal Name *</label>
                  <input 
                    type="text" 
                    required
                    value={oFullName}
                    onChange={(e) => setOFullName(e.target.value)}
                    placeholder="Mira Sen"
                    className="h-10 px-3 border border-border-main/80 bg-bg-base text-txt-main rounded-sm text-xs focus:outline-none focus:border-txt-main font-light"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-txt-sub font-semibold uppercase tracking-wider">Username handle *</label>
                  <input 
                    type="text" 
                    required
                    value={oUsername}
                    onChange={(e) => setOUsername(e.target.value)}
                    placeholder="mirasen"
                    className="h-10 px-3 border border-border-main/80 bg-bg-base text-txt-main rounded-sm text-xs focus:outline-none focus:border-txt-main font-mono"
                  />
                </div>
              </div>

              {/* General Context Section */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-txt-sub font-semibold uppercase tracking-wider">Date of Birth *</label>
                  <input 
                    type="date" 
                    required
                    value={oDob}
                    onChange={(e) => setODob(e.target.value)}
                    className="h-10 px-3 border border-border-main/80 bg-bg-base text-txt-main rounded-sm text-xs focus:outline-none focus:border-txt-main font-mono"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-txt-sub font-semibold uppercase tracking-wider">City, Country *</label>
                  <input 
                    type="text" 
                    required
                    value={oLocation}
                    onChange={(e) => setOLocation(e.target.value)}
                    placeholder="San Francisco, CA"
                    className="h-10 px-3 border border-border-main/80 bg-bg-base text-txt-main rounded-sm text-xs focus:outline-none focus:border-txt-main font-light"
                  />
                </div>
              </div>

              {/* Role Selection */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-txt-sub font-semibold uppercase tracking-wider">Your Professional Role *</label>
                <select
                  value={oRole}
                  onChange={(e) => setORole(e.target.value as "student" | "employee" | "solo")}
                  className="h-10 px-3 border border-border-main/80 bg-bg-base text-txt-main rounded-sm text-xs focus:outline-none focus:border-txt-main cursor-pointer"
                >
                  <option value="student">Student / Academic</option>
                  <option value="employee">Industry Professional / Employee</option>
                  <option value="solo">Solo Independent Builder</option>
                </select>
              </div>

              {/* Dynamic Context based on Role */}
              {oRole === "student" && (
                <div className="border border-border-main/60 p-4 rounded bg-bg-base/30 flex flex-col gap-3">
                  <span className="font-mono text-[9px] uppercase tracking-widest text-txt-muted">Academic Credentials</span>
                  
                  <div className="flex flex-col gap-1 relative">
                    <label className="text-[10px] text-txt-sub">University Name *</label>
                    <input 
                      type="text"
                      required
                      value={oCollege}
                      onChange={(e) => {
                        const val = e.target.value;
                        setOCollege(val);
                        const match = getSpellingSuggestion(val);
                        setOCollegeSuggestion(match && match.toLowerCase() !== val.toLowerCase() ? match : null);
                        setOCollegeSuggestions(getAutocompleteSuggestions(val, "college"));
                      }}
                      placeholder="Massachusetts Institute of Technology (MIT)"
                      className="h-9 px-3 border border-border-main/80 bg-bg-base text-txt-main rounded-sm text-xs focus:outline-none focus:border-txt-main"
                    />
                    {oCollegeSuggestions.length > 0 && (
                      <ul className="absolute z-50 w-full bg-bg-surface border border-border-main/80 rounded-sm shadow-xl top-full left-0 mt-1 py-1 max-h-40 overflow-y-auto text-xs font-light">
                        {oCollegeSuggestions.map((s) => (
                          <li 
                            key={s} 
                            onClick={() => {
                              setOCollege(s);
                              setOCollegeSuggestions([]);
                              setOCollegeSuggestion(null);
                            }}
                            className="px-3 py-1.5 hover:bg-bg-card hover:text-txt-main cursor-pointer text-txt-sub transition-colors"
                          >
                            {s}
                          </li>
                        ))}
                      </ul>
                    )}
                    {oCollegeSuggestion && oCollegeSuggestions.length === 0 && (
                      <span className="text-[9px] text-accent-main font-mono mt-0.5 animate-fade-in">
                        Did you mean: <strong className="underline cursor-pointer" onClick={() => { setOCollege(oCollegeSuggestion); setOCollegeSuggestion(null); }}>{oCollegeSuggestion}</strong>?
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1 relative">
                      <label className="text-[10px] text-txt-sub">Department *</label>
                      <input 
                        type="text"
                        required
                        value={oDepartment}
                        onChange={(e) => {
                          const val = e.target.value;
                          setODepartment(val);
                          const match = getSpellingSuggestion(val);
                          setODeptSuggestion(match && match.toLowerCase() !== val.toLowerCase() ? match : null);
                          setODeptSuggestions(getAutocompleteSuggestions(val, "department"));
                        }}
                        placeholder="Computer Science"
                        className="h-9 px-3 border border-border-main/80 bg-bg-base text-txt-main rounded-sm text-xs focus:outline-none focus:border-txt-main"
                      />
                      {oDeptSuggestions.length > 0 && (
                        <ul className="absolute z-50 w-full bg-bg-surface border border-border-main/80 rounded-sm shadow-xl top-full left-0 mt-1 py-1 max-h-40 overflow-y-auto text-xs font-light">
                          {oDeptSuggestions.map((s) => (
                            <li 
                              key={s} 
                              onClick={() => {
                                setODepartment(s);
                                setODeptSuggestions([]);
                                setODeptSuggestion(null);
                              }}
                              className="px-3 py-1.5 hover:bg-bg-card hover:text-txt-main cursor-pointer text-txt-sub transition-colors"
                            >
                              {s}
                            </li>
                          ))}
                        </ul>
                      )}
                      {oDeptSuggestion && oDeptSuggestions.length === 0 && (
                        <span className="text-[9px] text-accent-main font-mono mt-0.5 animate-fade-in">
                          Did you mean: <strong className="underline cursor-pointer" onClick={() => { setODepartment(oDeptSuggestion); setODeptSuggestion(null); }}>{oDeptSuggestion}</strong>?
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] text-txt-sub">Grad Year *</label>
                      <input 
                        type="text"
                        required
                        value={oGradYear}
                        onChange={(e) => setOGradYear(e.target.value)}
                        placeholder="2027"
                        className="h-9 px-3 border border-border-main/80 bg-bg-base text-txt-main rounded-sm text-xs focus:outline-none focus:border-txt-main"
                      />
                    </div>
                  </div>
                </div>
              )}

              {oRole === "employee" && (
                <div className="border border-border-main/60 p-4 rounded bg-bg-base/30 flex flex-col gap-3">
                  <span className="font-mono text-[9px] uppercase tracking-widest text-txt-muted">Employment Credentials</span>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1 relative">
                      <label className="text-[10px] text-txt-sub">Company *</label>
                      <input 
                        type="text"
                        required
                        value={oCompany}
                        onChange={(e) => {
                          const val = e.target.value;
                          setOCompany(val);
                          setOCompanySuggestions(getAutocompleteSuggestions(val, "company"));
                        }}
                        placeholder="Google Inc."
                        className="h-9 px-3 border border-border-main/80 bg-bg-base text-txt-main rounded-sm text-xs focus:outline-none focus:border-txt-main"
                      />
                      {oCompanySuggestions.length > 0 && (
                        <ul className="absolute z-50 w-full bg-bg-surface border border-border-main/80 rounded-sm shadow-xl top-full left-0 mt-1 py-1 max-h-40 overflow-y-auto text-xs font-light">
                          {oCompanySuggestions.map((s) => (
                            <li 
                              key={s} 
                              onClick={() => {
                                setOCompany(s);
                                setOCompanySuggestions([]);
                              }}
                              className="px-3 py-1.5 hover:bg-bg-card hover:text-txt-main cursor-pointer text-txt-sub transition-colors"
                            >
                              {s}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] text-txt-sub">Job Title / Designation *</label>
                      <input 
                        type="text"
                        required
                        value={oDesignation}
                        onChange={(e) => setODesignation(e.target.value)}
                        placeholder="Senior Software Engineer"
                        className="h-9 px-3 border border-border-main/80 bg-bg-base text-txt-main rounded-sm text-xs focus:outline-none focus:border-txt-main"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Expandable Optional Details */}
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => setOShowOptional(!oShowOptional)}
                  className="text-left text-[10px] font-mono uppercase tracking-wider text-txt-muted hover:text-txt-main flex items-center gap-1 cursor-pointer self-start"
                >
                  {oShowOptional ? "[-] Hide Optional Details" : "[+] Customize Portfolio Links & Bio"}
                </button>

                {oShowOptional && (
                  <div className="flex flex-col gap-3 border border-border-main/65 p-4 rounded bg-bg-base/10 animate-fade-in">
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] text-txt-sub">Short Developer Bio</label>
                      <textarea
                        rows={2}
                        value={oBio}
                        onChange={(e) => setOBio(e.target.value)}
                        placeholder="Frontend builder, hackathon team seeker, Rust lover..."
                        className="p-3 border border-border-main/80 bg-bg-base text-txt-main rounded-sm text-xs focus:outline-none focus:border-txt-main resize-none"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] text-txt-sub">Skills (comma-separated)</label>
                      <input
                        type="text"
                        value={oSkills}
                        onChange={(e) => setOSkills(e.target.value)}
                        placeholder="React, Next.js, Rust, Tailwind"
                        className="h-9 px-3 border border-border-main/80 bg-bg-base text-txt-main rounded-sm text-xs focus:outline-none focus:border-txt-main"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] text-txt-sub">GitHub Link</label>
                        <input
                          type="url"
                          value={oGithub}
                          onChange={(e) => setOGithub(e.target.value)}
                          placeholder="https://github.com/username"
                          className="h-9 px-3 border border-border-main/80 bg-bg-base text-txt-main rounded-sm text-xs focus:outline-none focus:border-txt-main font-mono"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] text-txt-sub">LinkedIn Link</label>
                        <input
                          type="url"
                          value={oLinkedIn}
                          onChange={(e) => setOLinkedIn(e.target.value)}
                          placeholder="https://linkedin.com/in/username"
                          className="h-9 px-3 border border-border-main/80 bg-bg-base text-txt-main rounded-sm text-xs focus:outline-none focus:border-txt-main font-mono"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] text-txt-sub">Discord Username</label>
                        <input
                          type="text"
                          value={oDiscord}
                          onChange={(e) => setODiscord(e.target.value)}
                          placeholder="username#0000"
                          className="h-9 px-3 border border-border-main/80 bg-bg-base text-txt-main rounded-sm text-xs focus:outline-none focus:border-txt-main font-mono"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] text-txt-sub">Portfolio Link</label>
                        <input
                          type="url"
                          value={oPortfolio}
                          onChange={(e) => setOPortfolio(e.target.value)}
                          placeholder="https://myportfolio.dev"
                          className="h-9 px-3 border border-border-main/80 bg-bg-base text-txt-main rounded-sm text-xs focus:outline-none focus:border-txt-main font-mono"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <button 
                type="submit"
                disabled={onboardingLoading}
                className="w-full h-11 bg-accent-main hover:opacity-90 disabled:opacity-50 text-bg-base font-semibold text-xs tracking-wider uppercase flex items-center justify-center gap-2 transition-opacity cursor-pointer mt-2"
              >
                {onboardingLoading ? (
                  <span className="h-4 w-4 rounded-full border border-bg-base/30 border-t-bg-base animate-spin" />
                ) : (
                  "Complete Profile Onboarding"
                )}
              </button>

            </form>

          </div>
        </div>
      )}

      {/* Log Out Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[10000] overflow-hidden font-sans">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/45 backdrop-blur-sm" onClick={() => setShowLogoutConfirm(false)} />
          
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="bg-bg-surface border border-border-main/80 max-w-sm w-full p-6 rounded-md flex flex-col gap-4 shadow-2xl animate-fade-in">
              
              <div className="flex flex-col gap-1 border-b border-border-main/40 pb-3">
                <span className="font-mono text-[9px] uppercase tracking-widest text-txt-muted">Security Check</span>
                <h3 className="text-sm font-semibold text-txt-main font-display">Confirm Sign Out</h3>
              </div>
              
              <p className="text-xs text-txt-sub font-light leading-relaxed">
                Are you sure you want to end your active session? You will need to sign back in to access your workspaces.
              </p>
              
              <div className="flex justify-end gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setShowLogoutConfirm(false)}
                  className="h-8 px-4 border border-border-main hover:bg-bg-card text-txt-main text-[10px] uppercase font-mono rounded-sm transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    setShowLogoutConfirm(false);
                    localStorage.removeItem("faculty_staff_member");
                    localStorage.removeItem("company_recruiter_member");
                    await signOut();
                    router.push("/");
                  }}
                  className="h-8 px-4 bg-red-500 hover:opacity-90 text-white text-[10px] uppercase font-mono font-semibold rounded-sm transition-opacity cursor-pointer"
                >
                  Confirm Sign Out
                </button>
              </div>

            </div>
          </div>
        </div>
      )}
    </>
  );
}
