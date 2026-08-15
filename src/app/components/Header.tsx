"use client";

import React, { useState, useEffect } from "react";
import { useTheme } from "./ThemeProvider";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import { extractAvatarFromUser } from "../lib/avatar";
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
  const isFaculty = userRole === "coordinator";
  const isRecruiter = userRole === "recruiter";

  const pathname = usePathname();
  const router = useRouter();

  const isNavActive = (targetPath: string) => {
    if (targetPath === "/") return pathname === "/";
    return pathname === targetPath || pathname.startsWith(`${targetPath}/`);
  };

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
  const filteredNotifications = notifications
    .map(n => ({ ...n, category: n.category || "alerts" }))
    .filter(n => {
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

  // Legal Agreement & Gating States
  const [oPrivacyRead, setOPrivacyRead] = useState(false);
  const [oPrivacyChecked, setOPrivacyChecked] = useState(false);
  const [oTermsRead, setOTermsRead] = useState(false);
  const [oTermsChecked, setOTermsChecked] = useState(false);
  const [activeLegalModal, setActiveLegalModal] = useState<"privacy" | "terms" | null>(null);
  const [legalModalScrolledBottom, setLegalModalScrolledBottom] = useState(false);

  const handleLegalScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollTop + clientHeight >= scrollHeight - 35) {
      setLegalModalScrolledBottom(true);
      if (activeLegalModal === "privacy") {
        setOPrivacyRead(true);
      } else if (activeLegalModal === "terms") {
        setOTermsRead(true);
      }
    }
  };
  const [headerAvatar, setHeaderAvatar] = useState<string>(() => {
    if (typeof window !== "undefined" && user) {
      try {
        const rawPublic = localStorage.getItem(`ldk_public_profile_${user.id}`);
        if (rawPublic) {
          const parsed = JSON.parse(rawPublic);
          if (parsed?.avatar_url && (parsed.avatar_url.startsWith("http") || parsed.avatar_url.startsWith("data:image/"))) {
            return parsed.avatar_url;
          }
        }
        const stored =
          localStorage.getItem(`ldk_user_avatar_${user.id}`) ||
          localStorage.getItem(`ldk_avatar_url_${user.id}`) ||
          "";
        if (stored && (stored.startsWith("http") || stored.startsWith("data:image/"))) {
          return stored;
        }
      } catch {}
    }
    return extractAvatarFromUser(user);
  });

  // Live avatar updates prioritizing database profiles record & localStorage over OAuth initial picture
  useEffect(() => {
    let isMounted = true;
    const resolveHeaderAvatar = async () => {
      if (!user) {
        setHeaderAvatar("");
        return;
      }

      // Check if user explicitly removed their avatar
      const meta = user.user_metadata || {};
      if (meta.avatar_removed === true) {
        if (isMounted) setHeaderAvatar("");
        if (typeof window !== "undefined") {
          localStorage.removeItem(`ldk_user_avatar_${user.id}`);
          localStorage.removeItem(`ldk_avatar_url_${user.id}`);
          localStorage.removeItem(`ldk_public_profile_${user.id}`);
        }
        return;
      }

      // 1. Instant 0ms local storage cache check (prevents flash of Google OAuth picture)
      let localUrl = "";
      if (typeof window !== "undefined") {
        try {
          const rawPublic = localStorage.getItem(`ldk_public_profile_${user.id}`);
          if (rawPublic) {
            const parsed = JSON.parse(rawPublic);
            if (parsed?.avatar_url && (parsed.avatar_url.startsWith("http") || parsed.avatar_url.startsWith("data:image/"))) {
              localUrl = parsed.avatar_url;
            }
          }
        } catch {}
        if (!localUrl) {
          const stored =
            localStorage.getItem(`ldk_user_avatar_${user.id}`) ||
            localStorage.getItem(`ldk_avatar_url_${user.id}`) ||
            "";
          if (stored && (stored.startsWith("http") || stored.startsWith("data:image/"))) {
            localUrl = stored;
          }
        }
      }

      if (localUrl && isMounted) {
        setHeaderAvatar(localUrl);
      }

      // 2. Authoritative database profiles record check (syncs in background)
      if (user?.id) {
        try {
          const { data } = await supabase
            .from("profiles")
            .select("avatar_url")
            .eq("id", user.id)
            .maybeSingle();

          if (data) {
            if (data.avatar_url === null || data.avatar_url === "") {
              if (isMounted) setHeaderAvatar("");
              if (typeof window !== "undefined") {
                localStorage.removeItem(`ldk_user_avatar_${user.id}`);
                localStorage.removeItem(`ldk_avatar_url_${user.id}`);
              }
              return;
            } else if (typeof data.avatar_url === "string" && (data.avatar_url.startsWith("http") || data.avatar_url.startsWith("data:image/"))) {
              if (isMounted) setHeaderAvatar(data.avatar_url);
              if (typeof window !== "undefined") {
                localStorage.setItem(`ldk_user_avatar_${user.id}`, data.avatar_url);
                localStorage.setItem(`ldk_avatar_url_${user.id}`, data.avatar_url);
              }
              return;
            }
          }
        } catch {}
      }

      // 3. Fallback to extractAvatarFromUser ONLY if localUrl was not found
      if (!localUrl && isMounted) {
        const oauthUrl = extractAvatarFromUser(user);
        setHeaderAvatar(oauthUrl || "");
      }
    };

    resolveHeaderAvatar();
    window.addEventListener("ldk_profile_update", resolveHeaderAvatar);
    window.addEventListener("storage", resolveHeaderAvatar);
    return () => {
      isMounted = false;
      window.removeEventListener("ldk_profile_update", resolveHeaderAvatar);
      window.removeEventListener("storage", resolveHeaderAvatar);
    };
  }, [user]);

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
      const todayStr = new Date().toISOString().split("T")[0];
      const stored = localStorage.getItem("ldk_global_notifications");
      let localList: NotificationItem[] = [];

      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            const seen = new Set<string>();
            localList = parsed.map((n: any) => {
              const isDeclinedOrAccepted = n.title?.toLowerCase().includes("declined") || n.title?.toLowerCase().includes("accepted");
              if (isDeclinedOrAccepted) {
                return { ...n, actionLabel: undefined, type: n.type === "invite" ? "warning" : (n.type || "warning") };
              }
              if (n.type === "invite" && (n.actionLabel === "Open Workspace" || !n.actionLabel)) {
                return { ...n, actionLabel: "Accept Invite" };
              }
              return n;
            }).filter((n: any) => {
              // Purge stale streak risk notifications from previous days
              if (n.id?.startsWith("notif_streak_warning_")) {
                if (!n.id.endsWith(todayStr)) return false;
              }
              if (n.title?.includes("Streak at Risk") && n.id && !n.id.includes(todayStr)) {
                return false;
              }

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
            const parsedUser = JSON.parse(userStored);
            if (Array.isArray(parsedUser)) {
              userLocalNotifs = parsedUser.map((n: any) => {
                const isDeclinedOrAccepted = n.title?.toLowerCase().includes("declined") || n.title?.toLowerCase().includes("accepted");
                if (isDeclinedOrAccepted) {
                  return { ...n, actionLabel: undefined, type: n.type === "invite" ? "warning" : (n.type || "warning") };
                }
                return n;
              }).filter((n: any) => {
                // Purge stale streak warnings from previous days
                if (n.id?.startsWith("notif_streak_warning_") && !n.id.endsWith(todayStr)) {
                  return false;
                }
                if (n.title?.includes("Streak at Risk") && n.id && !n.id.includes(todayStr)) {
                  return false;
                }
                return true;
              });

              // Clean up local storage if stale items were purged
              if (userLocalNotifs.length !== parsedUser.length) {
                localStorage.setItem(`ldk_user_notifications_${user.id}`, JSON.stringify(userLocalNotifs));
              }
            }
          } catch (e) {
            console.error("Error parsing user notifications", e);
          }
        }
      }

      // Fetch server notifications via same-origin route handler
      let dbNotifs: NotificationItem[] = [];
      if (user?.id) {
        try {
          const res = await fetch(`/api/user/notifications?userId=${user.id}`);
          if (res.ok) {
            const json = await res.json();
            if (Array.isArray(json.notifications)) {
              dbNotifs = json.notifications;
            }
          }
        } catch {}
      }

      // Filter out duplicate invites for workspaces the user has already joined
      const joinedStr = typeof window !== "undefined" ? localStorage.getItem("ldk_joined_workspaces") : null;
      const joinedWorkspaces: string[] = joinedStr ? JSON.parse(joinedStr) : [];

      // Combine database notifications, user-specific notifications, and global notifications
      const combined = [...dbNotifs, ...userLocalNotifs, ...localList];
      const uniqueSet = new Set<string>();
      const finalNotifs = combined.filter((n: any) => {
        // If it's an invite for a workspace the user is already in, skip it
        if (n.type === "invite" && n.actionUrl) {
          const wsId = n.actionUrl.split("?")[0].split("/").pop();
          if (wsId && joinedWorkspaces.includes(wsId)) return false;
        }

        const idKey = n.id || `${n.title}_${n.message}`;
        const contentKey = `${n.title}_${n.message}`;
        if (uniqueSet.has(idKey) || uniqueSet.has(contentKey)) return false;
        uniqueSet.add(idKey);
        uniqueSet.add(contentKey);
        return true;
      });

      setNotifications(finalNotifs);

      // Check live LeetCode daily challenge status for streak warning ONLY if user has connected a LeetCode handle
      const lcHandle = (user?.user_metadata?.leetcode_username || 
                        user?.user_metadata?.leetcode || 
                        (typeof window !== "undefined" && user?.id ? localStorage.getItem(`ldk_leetcode_handle_${user.id}`) : "") || 
                        "").trim();

      if (!lcHandle) {
        // User has NOT connected LeetCode: purge any streak warning notifications!
        setNotifications(prev => prev.filter(n => 
          !n.id.startsWith("notif_streak_warning_") && 
          !n.title?.includes("Streak at Risk") && 
          !n.title?.includes("LeetCode Daily Challenge Pending")
        ));
        if (typeof window !== "undefined") {
          const globalStored = localStorage.getItem("ldk_global_notifications");
          if (globalStored) {
            try {
              const parsed = JSON.parse(globalStored);
              const cleaned = parsed.filter((n: any) => 
                !n.id?.startsWith("notif_streak_warning_") && 
                !n.title?.includes("Streak at Risk") && 
                !n.title?.includes("LeetCode Daily Challenge Pending")
              );
              localStorage.setItem("ldk_global_notifications", JSON.stringify(cleaned));
            } catch {}
          }
          if (user?.id) {
            const uStored = localStorage.getItem(`ldk_user_notifications_${user.id}`);
            if (uStored) {
              try {
                const parsedU = JSON.parse(uStored);
                const cleanedU = parsedU.filter((n: any) => 
                  !n.id?.startsWith("notif_streak_warning_") && 
                  !n.title?.includes("Streak at Risk") && 
                  !n.title?.includes("LeetCode Daily Challenge Pending")
                );
                localStorage.setItem(`ldk_user_notifications_${user.id}`, JSON.stringify(cleanedU));
              } catch {}
            }
          }
        }
        return;
      }

      try {
        const res = await fetch(`/api/coding-stats?platform=leetcode&username=${encodeURIComponent(lcHandle)}`);
        let dailyChallenge = null;
        let streakCount = 0;

        if (res.ok) {
          const data = await res.json();
          dailyChallenge = data?.dailyChallenge;
          if (data?.leetcodeStreak !== undefined) streakCount = data.leetcodeStreak;
        }

        const todayStr = new Date().toISOString().split("T")[0];
        const streakNotifId = `notif_streak_warning_${todayStr}`;

        if (dailyChallenge?.completed) {
          // If today's challenge is completed, purge streak warnings!
          setNotifications(prev => prev.filter(n => 
            !n.id.startsWith("notif_streak_warning_") && 
            !n.title?.includes("Streak at Risk") && 
            !n.title?.includes("LeetCode Daily Challenge Pending")
          ));
          if (typeof window !== "undefined") {
            const globalStored = localStorage.getItem("ldk_global_notifications");
            if (globalStored) {
              try {
                const parsed = JSON.parse(globalStored);
                const cleaned = parsed.filter((n: any) => 
                  !n.id?.startsWith("notif_streak_warning_") && 
                  !n.title?.includes("Streak at Risk") && 
                  !n.title?.includes("LeetCode Daily Challenge Pending")
                );
                localStorage.setItem("ldk_global_notifications", JSON.stringify(cleaned));
              } catch {}
            }
            if (user?.id) {
              const uStored = localStorage.getItem(`ldk_user_notifications_${user.id}`);
              if (uStored) {
                try {
                  const parsedU = JSON.parse(uStored);
                  const cleanedU = parsedU.filter((n: any) => 
                    !n.id?.startsWith("notif_streak_warning_") && 
                    !n.title?.includes("Streak at Risk") && 
                    !n.title?.includes("LeetCode Daily Challenge Pending")
                  );
                  localStorage.setItem(`ldk_user_notifications_${user.id}`, JSON.stringify(cleanedU));
                } catch {}
              }
            }
          }
        } else {
          const title = dailyChallenge?.title || "Daily Coding Challenge";
          const diff = dailyChallenge?.difficulty || "Medium";

          const streakNotif: NotificationItem = {
            id: streakNotifId,
            title: "LeetCode Daily Challenge Pending",
            message: streakCount > 0 
              ? `Today's daily challenge “${title}” (${diff}) is pending. Solve now to maintain your ${streakCount}-day streak!`
              : `Today's daily challenge “${title}” (${diff}) is pending. Solve now to start your daily challenge streak!`,
            type: "deadline",
            category: "alerts",
            time: "Today",
            read: false,
            actionLabel: "Solve Challenge",
            actionUrl: "/coding-desk"
          };

          setNotifications(prev => {
            const filtered = prev.filter(n => 
              !n.id.startsWith("notif_streak_warning_") && 
              !n.title?.includes("Streak at Risk") && 
              !n.title?.includes("LeetCode Daily Challenge Pending")
            );
            return [streakNotif, ...filtered];
          });
        }
      } catch (err) {
        console.warn("Failed fetching LeetCode daily challenge stats in Header:", err);
      }
    };

    loadNotifications();

    window.addEventListener("ldk_notifications_update", loadNotifications);

    let channel: any = null;
    if (user?.id) {
      channel = supabase
        .channel("ldk_global_realtime_bus")
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
              const isRealInvite = (data.type === "invite" || !data.type) && !data.title?.toLowerCase().includes("declined") && !data.title?.toLowerCase().includes("accepted");

              notifList.unshift({
                id: `n_rt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
                recipientId: user.id,
                senderId: data.senderId,
                title: data.title || "Teammate Match Invite",
                message: data.message || "You received a new team invite!",
                type: isRealInvite ? "invite" : (data.type || "warning"),
                category: "alerts",
                time: "Just now",
                read: false,
                actionLabel: isRealInvite ? (data.actionLabel || "Accept Invite") : undefined,
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

  // Mark notifications as read and auto-clear seen informational alerts (e.g. Invitation Accepted/Declined) when closing drawer
  const handleCloseDrawer = () => {
    setIsOpen(false);

    // Identify informational update alerts that have been seen (e.g. "Invitation Accepted", "Invitation Declined")
    const toAutoClear = notifications.filter(n => {
      const titleLower = (n.title || "").toLowerCase();
      const msgLower = (n.message || "").toLowerCase();
      const isInformational = titleLower.includes("accepted") || 
                              titleLower.includes("declined") ||
                              msgLower.includes("accepted") || 
                              msgLower.includes("declined") ||
                              n.type === "system";
      return isInformational;
    });

    // Delete auto-cleared informational notifications from DB
    toAutoClear.forEach(n => deleteNotificationFromDB(n.id));

    // Retain only actionable items or non-informational alerts, marked as read
    const updated = notifications
      .filter(n => !toAutoClear.some(tc => tc.id === n.id))
      .map(n => ({ ...n, read: true }));

    setNotifications(updated);
    localStorage.setItem("ldk_global_notifications", JSON.stringify(updated));
    if (user?.id) {
      localStorage.setItem(`ldk_user_notifications_${user.id}`, JSON.stringify(updated));
    }
  };

  const handleClearTab = () => {
    const updated = notifications.filter(n => n.category !== drawerTab);
    setNotifications(updated);
    localStorage.setItem("ldk_global_notifications", JSON.stringify(updated));
    if (user?.id) {
      localStorage.setItem(`ldk_user_notifications_${user.id}`, JSON.stringify(updated));
    }
    window.dispatchEvent(new Event("ldk_notifications_update"));
  };

  const deleteNotificationFromDB = async (id: string, title?: string, actionUrl?: string) => {
    if (!id) return;
    try {
      if (!id.startsWith("n_cron_") && !id.startsWith("notif_local_")) {
        await supabase.from("notifications").delete().eq("id", id);
      }
      if (user?.id) {
        if (title) {
          await supabase.from("notifications").delete().eq("user_id", user.id).eq("title", title);
        }
        if (actionUrl) {
          await supabase.from("notifications").delete().eq("user_id", user.id).eq("link_url", actionUrl);
        }
      }
      // Call server DELETE route handler with admin privileges to ensure permanent deletion
      fetch("/api/user/notifications", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, userId: user?.id, title, actionUrl })
      }).catch(() => {});
    } catch {}
  };

  const handleDismissNotification = async (id: string) => {
    const target = notifications.find(n => n.id === id);
    deleteNotificationFromDB(id, target?.title, target?.actionUrl);

    const updated = notifications.filter(n => n.id !== id && (target?.title ? n.title !== target.title : true));
    setNotifications(updated);
    
    if (user?.id) {
      const userKey = `ldk_user_notifications_${user.id}`;
      localStorage.setItem(userKey, JSON.stringify(updated));
    }
    const globalStored = localStorage.getItem("ldk_global_notifications");
    if (globalStored) {
      try {
        const parsed = JSON.parse(globalStored);
        const cleaned = parsed.filter((n: any) => n.id !== id && (target?.title ? n.title !== target.title : true));
        localStorage.setItem("ldk_global_notifications", JSON.stringify(cleaned));
      } catch {}
    }
    window.dispatchEvent(new Event("ldk_notifications_update"));
  };

  const handleNotificationAction = async (id: string, actionUrl?: string) => {
    const targetNotif = notifications.find(n => n.id === id);
    deleteNotificationFromDB(id, targetNotif?.title, actionUrl);
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

          // Clear workspaceId from ldk_deleted_workspaces on re-join
          const deletedStr = localStorage.getItem("ldk_deleted_workspaces");
          if (deletedStr) {
            try {
              const deletedList: string[] = JSON.parse(deletedStr);
              const cleanedDeleted = deletedList.filter(dId => dId !== workspaceId);
              localStorage.setItem("ldk_deleted_workspaces", JSON.stringify(cleanedDeleted));
            } catch {}
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
          message: `${myName} accepted your workspace invitation.`,
          type: "system",
          category: "updates",
          actionUrl: actionUrl || "/explore"
        })
      }).catch(() => {});
    }

    // Dismiss accepted notification from drawer so it disappears permanently
    const updated = notifications.filter(n => n.id !== id && (targetNotif?.title ? n.title !== targetNotif.title : true));
    setNotifications(updated);
    if (user?.id) {
      localStorage.setItem(`ldk_user_notifications_${user.id}`, JSON.stringify(updated));
    }
    const globalStored = localStorage.getItem("ldk_global_notifications");
    if (globalStored) {
      try {
        const parsed = JSON.parse(globalStored);
        const cleaned = parsed.filter((n: any) => n.id !== id && (targetNotif?.title ? n.title !== targetNotif.title : true));
        localStorage.setItem("ldk_global_notifications", JSON.stringify(cleaned));
      } catch {}
    }
    window.dispatchEvent(new Event("ldk_notifications_update"));

    if (actionUrl) {
      router.push(actionUrl);
      setIsOpen(false);
    }
  };

  const handleNotificationReject = async (id: string, actionUrl?: string) => {
    const targetNotif = notifications.find(n => n.id === id);
    deleteNotificationFromDB(id, targetNotif?.title, actionUrl);
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
          message: `${myName} declined your workspace invitation.`,
          type: "warning",
          category: "updates",
          actionUrl: "/explore"
        })
      }).catch(() => {});
    }

    // Dismiss declined notification from drawer so it disappears permanently
    const updated = notifications.filter(n => n.id !== id && (targetNotif?.title ? n.title !== targetNotif.title : true));
    setNotifications(updated);
    if (user?.id) {
      localStorage.setItem(`ldk_user_notifications_${user.id}`, JSON.stringify(updated));
    }
    const globalStored = localStorage.getItem("ldk_global_notifications");
    if (globalStored) {
      try {
        const parsed = JSON.parse(globalStored);
        const cleaned = parsed.filter((n: any) => n.id !== id && (targetNotif?.title ? n.title !== targetNotif.title : true));
        localStorage.setItem("ldk_global_notifications", JSON.stringify(cleaned));
      } catch {}
    }

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
          <LynDeskLogo size={29} className="mr-1" />
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
                  <Link href="/coordinator?tab=overview" className={`pb-0.5 transition-opacity ${isNavActive("/coordinator") ? "text-txt-main opacity-100 font-medium" : "text-txt-main opacity-50 hover:opacity-100"}`}>Overview</Link>
                  <Link href="/coordinator?tab=talent_registry" className={`pb-0.5 transition-opacity ${isNavActive("/coordinator") ? "text-txt-main opacity-100 font-medium" : "text-txt-main opacity-50 hover:opacity-100"}`}>Talent Registry</Link>
                  <Link href="/coordinator?tab=broadcasts" className={`pb-0.5 transition-opacity ${isNavActive("/coordinator") ? "text-txt-main opacity-100 font-medium" : "text-txt-main opacity-50 hover:opacity-100"}`}>Broadcasts</Link>
                  <Link href="/coordinator?tab=verifications" className={`pb-0.5 transition-opacity ${isNavActive("/coordinator") ? "text-txt-main opacity-100 font-medium" : "text-txt-main opacity-50 hover:opacity-100"}`}>Claims Queue</Link>
                  <Link href="/coordinator?tab=staff_access" className={`pb-0.5 transition-opacity ${isNavActive("/coordinator") ? "text-txt-main opacity-100 font-medium" : "text-txt-main opacity-50 hover:opacity-100"}`}>Staff Access</Link>
                </>
              ) : isRecruiter ? (
                <>
                  <Link href="/recruiter" className={`pb-0.5 transition-opacity ${isNavActive("/recruiter") ? "text-txt-main opacity-100 font-medium" : "text-txt-main opacity-50 hover:opacity-100"}`}>HR Console</Link>
                  <Link href="/profile" className={`pb-0.5 transition-opacity ${isNavActive("/profile") ? "text-txt-main opacity-100 font-medium" : "text-txt-main opacity-50 hover:opacity-100"}`}>My Profile</Link>
                </>
              ) : (
                <>
                  <Link href="/" className={`pb-0.5 transition-opacity ${isNavActive("/") ? "text-txt-main opacity-100 font-medium" : "text-txt-main opacity-50 hover:opacity-100"}`}>Dashboard</Link>
                  <Link href="/event-desk" className={`pb-0.5 transition-opacity ${isNavActive("/event-desk") ? "text-txt-main opacity-100 font-medium" : "text-txt-main opacity-50 hover:opacity-100"}`}>Event Desk</Link>
                  <Link href="/coding-desk" className={`pb-0.5 transition-opacity ${isNavActive("/coding-desk") ? "text-txt-main opacity-100 font-medium" : "text-txt-main opacity-50 hover:opacity-100"}`}>Code Desk</Link>
                  <Link href="/study-desk" className={`pb-0.5 transition-opacity ${isNavActive("/study-desk") ? "text-txt-main opacity-100 font-medium" : "text-txt-main opacity-50 hover:opacity-100"}`}>Study Desk</Link>
                  <Link href="/explore" className={`pb-0.5 transition-opacity ${isNavActive("/explore") ? "text-txt-main opacity-100 font-medium" : "text-txt-main opacity-50 hover:opacity-100"}`}>Explore</Link>
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
                className={`p-2 rounded-full transition-all duration-300 focus:outline-none relative cursor-pointer ${
                  unreadCount > 0
                    ? "border border-red-500/40 text-txt-main shadow-[0_0_6px_rgba(239,68,68,0.12)] animate-pulse hover:bg-bg-card"
                    : "border border-border-main/80 hover:bg-bg-card text-txt-main"
                }`}
                aria-label="View notifications"
                title={unreadCount > 0 ? `${unreadCount} new notification(s)` : "Notifications"}
              >
                <Bell size={14} />
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
                  className="w-8 h-8 rounded-full border border-border-main/80 hover:border-txt-main/40 text-txt-main transition-colors duration-150 focus:outline-none flex items-center justify-center overflow-hidden shrink-0 relative p-0"
                  title="View Profile"
                >
                  {headerAvatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={headerAvatar} alt="Profile" className="w-full h-full object-cover" onError={() => setHeaderAvatar("")} />
                  ) : (
                    <User size={14} />
                  )}
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
                    <Link href="/" onClick={() => setMobileMenuOpen(false)} className={`py-1 border-b border-border-main/30 transition-opacity ${isNavActive("/") ? "text-txt-main opacity-100 font-medium" : "text-txt-main opacity-50 hover:opacity-100"}`}>Dashboard</Link>
                    <Link href="/event-desk" onClick={() => setMobileMenuOpen(false)} className={`py-1 border-b border-border-main/30 transition-opacity ${isNavActive("/event-desk") ? "text-txt-main opacity-100 font-medium" : "text-txt-main opacity-50 hover:opacity-100"}`}>Event Desk</Link>
                    <Link href="/coding-desk" onClick={() => setMobileMenuOpen(false)} className={`py-1 border-b border-border-main/30 transition-opacity ${isNavActive("/coding-desk") ? "text-txt-main opacity-100 font-medium" : "text-txt-main opacity-50 hover:opacity-100"}`}>Code Desk</Link>
                    <Link href="/study-desk" onClick={() => setMobileMenuOpen(false)} className={`py-1 border-b border-border-main/30 transition-opacity ${isNavActive("/study-desk") ? "text-txt-main opacity-100 font-medium" : "text-txt-main opacity-50 hover:opacity-100"}`}>Study Desk</Link>
                    <Link href="/explore" onClick={() => setMobileMenuOpen(false)} className={`py-1 border-b border-border-main/30 transition-opacity ${isNavActive("/explore") ? "text-txt-main opacity-100 font-medium" : "text-txt-main opacity-50 hover:opacity-100"}`}>Explore</Link>
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
            onClick={handleCloseDrawer}
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
                    onClick={handleCloseDrawer}
                    className="p-1 rounded-full hover:bg-bg-card text-txt-muted hover:text-txt-main cursor-pointer"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* Category Tabs inside Drawer */}
              <div className="flex border-b border-border-main/40 bg-bg-card px-6 py-2.5 font-mono text-[10px] uppercase tracking-wider gap-6">
                <button
                  onClick={() => setDrawerTab("alerts")}
                  className={`pb-1 cursor-pointer transition-all border-b-2 font-medium flex items-center gap-1.5 ${
                    drawerTab === "alerts" 
                      ? "text-txt-main border-txt-main" 
                      : "text-txt-muted border-transparent hover:text-txt-main"
                  }`}
                >
                  Personal Alerts ({filteredNotifications.filter(n => (n.category || "alerts") === "alerts").length})
                  {filteredNotifications.some(n => (n.category || "alerts") === "alerts" && !n.read) && (
                    <span className="w-1.5 h-1.5 rounded-full bg-accent-main inline-block" />
                  )}
                </button>
                <button
                  onClick={() => setDrawerTab("updates")}
                  className={`pb-1 cursor-pointer transition-all border-b-2 font-medium flex items-center gap-1.5 ${
                    drawerTab === "updates" 
                      ? "text-txt-main border-txt-main" 
                      : "text-txt-muted border-transparent hover:text-txt-main"
                  }`}
                >
                  General Feed ({filteredNotifications.filter(n => n.category === "updates").length})
                  {filteredNotifications.some(n => n.category === "updates" && !n.read) && (
                    <span className="w-1.5 h-1.5 rounded-full bg-accent-main inline-block" />
                  )}
                </button>
              </div>

              {/* Nudge Engine Simulation Panel */}
              {(isFaculty || isRecruiter) && (
                <div className="px-6 py-4 bg-bg-card border-b border-border-main/40 flex items-center justify-between">
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
                {filteredNotifications.filter(n => (n.category || "alerts") === drawerTab).length > 0 ? (
                  filteredNotifications.filter(n => (n.category || "alerts") === drawerTab).map((item, idx) => (
                    <div 
                      key={`${item.id}_${idx}`} 
                      className={`p-4 border rounded-sm flex flex-col gap-3 transition-colors ${
                        item.read 
                          ? "bg-bg-card/60 border-border-main/40 opacity-75" 
                          : "bg-bg-card border-border-main text-txt-main"
                      }`}
                    >
                      <div className="flex justify-between items-start gap-3">
                        <div className="flex items-center gap-2">
                          <span className={`w-2.5 h-2.5 rounded-full border ${
                            item.type === "deadline" 
                              ? "border-red-500 opacity-85 bg-red-500/10" 
                              : item.type === "invite" 
                              ? "border-blue-500 opacity-85 bg-blue-500/10" 
                              : item.type === "credit"
                              ? "border-emerald-500 opacity-85 bg-emerald-500/10"
                              : "border-txt-muted opacity-85 bg-txt-muted/10"
                          }`} />
                          <h4 className="text-xs font-semibold text-txt-main">{item.title}</h4>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[8px] font-mono text-txt-muted">{item.time}</span>
                          {item.type !== "invite" && (
                            <button
                              type="button"
                              onClick={() => handleDismissNotification(item.id)}
                              className="p-1 rounded hover:bg-bg-surface text-txt-muted hover:text-red-400 transition-colors cursor-pointer"
                              title="Dismiss notification"
                            >
                              <X size={10} />
                            </button>
                          )}
                        </div>
                      </div>

                      <p className="text-[11px] text-txt-sub font-light leading-relaxed">
                        {item.message}
                      </p>

                      {item.actionLabel && !item.title?.toLowerCase().includes("declined") && !item.title?.toLowerCase().includes("accepted") && (
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

              {/* Mandatory Legal Consent Section */}
              <div className="border border-border-main/60 p-3.5 rounded bg-bg-base/30 flex flex-col gap-2.5">
                <span className="font-mono text-[9px] uppercase tracking-widest text-txt-muted">Legal Consent & Policy Agreement *</span>

                {/* Privacy Policy Checkbox Row */}
                <div className="flex items-center gap-2.5">
                  <input 
                    type="checkbox"
                    id="onboarding_cb_privacy"
                    disabled={!oPrivacyRead}
                    checked={oPrivacyChecked}
                    onChange={(e) => setOPrivacyChecked(e.target.checked)}
                    className="w-3.5 h-3.5 rounded-sm border-border-main/80 accent-accent-main cursor-pointer disabled:opacity-35 disabled:cursor-not-allowed shrink-0"
                  />
                  <label htmlFor="onboarding_cb_privacy" className="text-txt-sub text-xs font-light cursor-pointer select-none">
                    I accept the{" "}
                    <button
                      type="button"
                      onClick={() => {
                        setActiveLegalModal("privacy");
                        setLegalModalScrolledBottom(oPrivacyRead);
                      }}
                      className="text-accent-main font-semibold hover:underline cursor-pointer"
                    >
                      Privacy Policy
                    </button>
                  </label>
                  {!oPrivacyRead ? (
                    <span className="text-[9px] font-mono text-txt-muted/70 ml-auto shrink-0">(Click text to scroll)</span>
                  ) : (
                    <span className="text-[9px] font-mono text-emerald-400 ml-auto shrink-0 font-semibold">&check; Read</span>
                  )}
                </div>

                {/* Terms & Conditions Checkbox Row */}
                <div className="flex items-center gap-2.5">
                  <input 
                    type="checkbox"
                    id="onboarding_cb_terms"
                    disabled={!oTermsRead}
                    checked={oTermsChecked}
                    onChange={(e) => setOTermsChecked(e.target.checked)}
                    className="w-3.5 h-3.5 rounded-sm border-border-main/80 accent-accent-main cursor-pointer disabled:opacity-35 disabled:cursor-not-allowed shrink-0"
                  />
                  <label htmlFor="onboarding_cb_terms" className="text-txt-sub text-xs font-light cursor-pointer select-none">
                    I accept the{" "}
                    <button
                      type="button"
                      onClick={() => {
                        setActiveLegalModal("terms");
                        setLegalModalScrolledBottom(oTermsRead);
                      }}
                      className="text-accent-main font-semibold hover:underline cursor-pointer"
                    >
                      Terms & Conditions
                    </button>
                  </label>
                  {!oTermsRead ? (
                    <span className="text-[9px] font-mono text-txt-muted/70 ml-auto shrink-0">(Click text to scroll)</span>
                  ) : (
                    <span className="text-[9px] font-mono text-emerald-400 ml-auto shrink-0 font-semibold">&check; Read</span>
                  )}
                </div>
              </div>

              <button 
                type="submit"
                disabled={onboardingLoading || !oPrivacyChecked || !oTermsChecked}
                className="w-full h-11 bg-accent-main hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed text-bg-base font-semibold text-xs tracking-wider uppercase flex items-center justify-center gap-2 transition-opacity cursor-pointer mt-2"
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

      {/* Full Legal Document Viewer Modal */}
      {activeLegalModal && (
        <div className="fixed inset-0 z-[10005] bg-bg-base/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-bg-surface border border-border-main max-w-2xl w-full h-[85vh] rounded-md flex flex-col shadow-2xl animate-fade-in overflow-hidden text-left">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-border-main/50 bg-bg-card/40 flex items-center justify-between shrink-0">
              <div className="flex flex-col">
                <span className="font-mono text-[9px] uppercase tracking-widest text-txt-muted">LynDesk Legal Registry</span>
                <h2 className="font-display text-lg font-semibold text-txt-main">
                  {activeLegalModal === "privacy" ? "Privacy Policy" : "Terms & Conditions"}
                </h2>
              </div>
              <button 
                onClick={() => setActiveLegalModal(null)}
                className="p-1 rounded-full hover:bg-bg-card text-txt-muted hover:text-txt-main cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Scrollable Document Container */}
            <div 
              onScroll={handleLegalScroll}
              className="flex-1 p-6 md:p-8 overflow-y-auto font-sans text-xs text-txt-sub font-light leading-relaxed space-y-5 select-text"
            >
              {activeLegalModal === "privacy" ? (
                <>
                  <p className="text-sm font-normal text-txt-main">
                    At LynDesk (&quot;Link Your Next Desk&quot;), we believe technical accomplishment should be documented transparently and protected securely. This Policy details how we collect, store, and utilize your information across the LynDesk Campus network.
                  </p>
                  <div className="space-y-1.5 border-t border-border-main/40 pt-3">
                    <h3 className="font-display text-sm font-semibold text-txt-main">1. Scope of Data Collection</h3>
                    <p>We collect personal information required to establish your technical dashboard and university connection:</p>
                    <ul className="list-disc list-inside pl-2 space-y-1 text-[11px] text-txt-sub">
                      <li><strong>Authentication Data</strong>: Full name, email address, date of birth, location, and OAuth authentication tokens (from Google, GitHub, and Discord).</li>
                      <li><strong>Academic Portfolios</strong>: Project names, registration deadlines, co-worker associations, slide decks, and project reports.</li>
                      <li><strong>Integration Metadata</strong>: Public GitHub repository URLs, commit metrics, LeetCode/Codeforces stats, and chat communications inside project spaces.</li>
                    </ul>
                  </div>
                  <div className="space-y-1.5 border-t border-border-main/40 pt-3">
                    <h3 className="font-display text-sm font-semibold text-txt-main">2. Academic Record Protection (FERPA)</h3>
                    <p>For university-mandated credit claims, LynDesk operates in compliance with the Family Educational Rights and Privacy Act (FERPA) regulations protecting student education records:</p>
                    <ul className="list-disc list-inside pl-2 space-y-1 text-[11px] text-txt-sub">
                      <li>Project accomplishment logs and credit requests are shared strictly with verified department deans and faculty advisors.</li>
                      <li>Students retain full ownership of their extracurricular histories and can opt to make their profiles public or private at any time.</li>
                    </ul>
                  </div>
                  <div className="space-y-1.5 border-t border-border-main/40 pt-3">
                    <h3 className="font-display text-sm font-semibold text-txt-main">3. Data Sharing and Third-Party API Integrations</h3>
                    <p>We do not sell student profile metadata to third-party advertisers or recruitment brokers. Information is shared strictly in these cases:</p>
                    <ul className="list-disc list-inside pl-2 space-y-1 text-[11px] text-txt-sub">
                      <li><strong>Within Project Teams</strong>: Shared chat logs, slide decks, and codebases are visible to co-workers you invite.</li>
                      <li><strong>To Institutional Admins</strong>: Submitting credit requests routes verified files to your university&apos;s grading console.</li>
                    </ul>
                  </div>
                  <div className="space-y-1.5 border-t border-border-main/40 pt-3">
                    <h3 className="font-display text-sm font-semibold text-txt-main">4. Security Standards & Encryption</h3>
                    <p>All data transfers are encrypted in transit via SSL/TLS, and authentication sessions are guarded by Supabase Row Level Security (RLS) policies. Databases are hosted in secure, isolated cloud centers.</p>
                  </div>
                  <div className="space-y-1.5 border-t border-border-main/40 pt-3 pb-6">
                    <h3 className="font-display text-sm font-semibold text-txt-main">5. User Data Rights & Account Deletion</h3>
                    <p>You may request export or deletion of your profile data at any time from your profile settings or by contacting privacy@lyndesk.com.</p>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-sm font-normal text-txt-main">
                    Welcome to LynDesk (&quot;Link Your Next Desk&quot;). By accessing or utilizing our workspace dashboards, tracking registries, and institutional portals, you agree to comply with the terms detailed below.
                  </p>
                  <div className="space-y-1.5 border-t border-border-main/40 pt-3">
                    <h3 className="font-display text-sm font-semibold text-txt-main">1. Access and Account Registration</h3>
                    <p>
                      To enter your college&apos;s network directory and workspaces, you must establish an account using a supported email address or OAuth login (Google, GitHub, Discord). You are responsible for safeguarding your session tokens and password keys. LynDesk is not liable for unauthorized access resulting from negligence.
                    </p>
                  </div>
                  <div className="space-y-1.5 border-t border-border-main/40 pt-3">
                    <h3 className="font-display text-sm font-semibold text-txt-main">2. Intellectual Property and Content Ownership</h3>
                    <p>
                      <strong>You retain 100% ownership of your work.</strong> Any project documentation, source code repositories, slide decks, technical PDFs, or messages uploaded to your project spaces remain your intellectual property. LynDesk claims no proprietary rights or license over student creations.
                    </p>
                  </div>
                  <div className="space-y-1.5 border-t border-border-main/40 pt-3">
                    <h3 className="font-display text-sm font-semibold text-txt-main">3. Acceptable Use Guidelines</h3>
                    <p>By utilizing LynDesk workspaces, you agree not to engage in the following prohibited activities:</p>
                    <ul className="list-disc list-inside pl-2 space-y-1 text-[11px] text-txt-sub">
                      <li>Uploading malware, corrupted files, or scripts designed to interrupt platform operations.</li>
                      <li>Plagiarizing project codebases or falsifying credentials during academic credit claims.</li>
                      <li>Using project chat channels to propagate harassment or violate university student codes of conduct.</li>
                    </ul>
                  </div>
                  <div className="space-y-1.5 border-t border-border-main/40 pt-3">
                    <h3 className="font-display text-sm font-semibold text-txt-main">4. University Credits & Verification Disclaimer</h3>
                    <p>
                      LynDesk acts solely as a tracking coordinator and cryptographic validation platform for extracurricular activity points. <strong>The final approval and awarding of university academic credits or graduation points rests entirely with your institution&apos;s administration and faculty verifiers.</strong> LynDesk makes no guarantee that submission logs will be approved by your university department.
                    </p>
                  </div>
                  <div className="space-y-1.5 border-t border-border-main/40 pt-3 pb-6">
                    <h3 className="font-display text-sm font-semibold text-txt-main">5. Limitation of Liability</h3>
                    <p>
                      LynDesk is provided on an &quot;as is&quot; and &quot;as available&quot; basis. We make no warranty that operations will be completely uninterrupted. We are not liable for project deadlines missed due to internet outages, GitHub API down-times, or database synchronizer latency.
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* Sticky Bottom Action Bar */}
            <div className="p-4 border-t border-border-main/50 bg-bg-card flex items-center justify-between shrink-0 gap-4">
              <div className="flex items-center gap-2 text-xs font-mono">
                {!legalModalScrolledBottom ? (
                  <span className="text-amber-400 flex items-center gap-1.5 animate-pulse">
                    <span>&darr;</span> Scroll to the end of the document to unlock checkbox
                  </span>
                ) : (
                  <span className="text-emerald-400 flex items-center gap-1.5 font-bold">
                    <span>&check;</span> Document End Reached — Checkbox Unlocked
                  </span>
                )}
              </div>
              <button
                type="button"
                disabled={!legalModalScrolledBottom}
                onClick={() => {
                  if (activeLegalModal === "privacy") {
                    setOPrivacyRead(true);
                    setOPrivacyChecked(true);
                  } else if (activeLegalModal === "terms") {
                    setOTermsRead(true);
                    setOTermsChecked(true);
                  }
                  setActiveLegalModal(null);
                }}
                className="h-9 px-4 bg-accent-main hover:opacity-90 disabled:opacity-40 text-bg-base font-semibold font-mono text-xs uppercase rounded cursor-pointer disabled:cursor-not-allowed transition-opacity shrink-0"
              >
                {legalModalScrolledBottom ? "I Accept & Close" : "Scroll to Accept"}
              </button>
            </div>

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
