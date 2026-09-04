"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";

export type UserRole = "student" | "recruiter" | "coordinator";

export interface UserProfileData {
  id: string;
  full_name: string;
  username: string;
  avatar_url: string;
  academic_credits: number;
  department: string;
  college_key: string;
  bio: string;
  skills: string;
  github_url?: string;
  linkedin_url?: string;
  portfolio_url?: string;
  leetcode_username?: string;
  codechef_username?: string;
  hackerrank_username?: string;
  hackerrank_verified?: boolean;
  geeksforgeeks_username?: string;
  geeksforgeeks_verified?: boolean;
  codeforces_username?: string;
  unstop_username?: string;
  devpost_username?: string;
  college_name?: string;
  graduation_year?: string;
  roll_number?: string;
  batch_code?: string;
  college_linked_status?: string;
  institute_id?: string;
}

type AuthContextType = {
  user: User | null;
  session: Session | null;
  userRole: UserRole;
  profileAvatar: string;
  userProfile: UserProfileData | null;
  loading: boolean;
  onlineUserIds: Set<string>;
  isUserOnline: (userId: string) => boolean;
  refreshUser: () => Promise<void>;
  updateUserProfile: (partial: Partial<UserProfileData>) => void;
  resolveEmailFromInput: (input: string) => Promise<string>;
  updateUserPassword: (newPassword: string) => Promise<{ error: Error | null }>;
  requestPasswordResetOtp: (email: string) => Promise<{ error: Error | null }>;
  verifyPasswordResetOtp: (email: string, token: string, newPassword?: string, confirmPassword?: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userRole, setUserRole] = useState<UserRole>("student");
  const [userProfile, setUserProfile] = useState<UserProfileData | null>(null);
  const [profileAvatar, setProfileAvatar] = useState<string>(() => {
    if (typeof window !== "undefined") {
      try {
        const active = localStorage.getItem("ldk_active_user_avatar");
        if (active && (active.startsWith("http") || active.startsWith("data:image/"))) {
          return active;
        }
      } catch {}
    }
    return "";
  });
  const [loading, setLoading] = useState(true);
  const [onlineUserIds, setOnlineUserIds] = useState<Set<string>>(new Set());

  const resolveRole = (u: User | null): UserRole => {
    const metaRole = u?.user_metadata?.role;
    if (metaRole === "recruiter" || metaRole === "employee" || u?.user_metadata?.company_key) return "recruiter";
    if (metaRole === "coordinator" || metaRole === "faculty" || u?.user_metadata?.registered_staff) return "coordinator";
    return "student";
  };

  useEffect(() => {
    let isMounted = true;

    // Safety fallback: ensure loading never hangs beyond 350ms
    const safetyTimer = setTimeout(() => {
      if (isMounted) setLoading(false);
    }, 350);

    // 1. Check initial active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!isMounted) return;
      clearTimeout(safetyTimer);
      setSession(session);
      setUser(session?.user ?? null);
      setUserRole(resolveRole(session?.user ?? null));
      setLoading(false);

      if (session && typeof window !== "undefined") {
        if (window.location.search.includes("code=") || window.location.hash.includes("access_token=")) {
          window.history.replaceState(null, "", window.location.pathname);
        }
      }
    }).catch(() => {
      if (isMounted) setLoading(false);
    });

    // 2. Listen for authentication state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!isMounted) return;
      clearTimeout(safetyTimer);
      if (session) {
        setSession(session);
        setUser(session.user);
        setUserRole(resolveRole(session.user));
        setLoading(false);
        if (typeof window !== "undefined") {
          const isFirstTime = localStorage.getItem("ldk_first_time_signup");
          if (isFirstTime === "true") {
            localStorage.removeItem("ldk_first_time_signup");
            if (window.location.pathname !== "/profile") {
              window.location.href = "/profile";
            }
          } else if (window.location.search.includes("code=") || window.location.hash.includes("access_token=")) {
            window.history.replaceState(null, "", window.location.pathname);
          }
        }
      } else if (event === "SIGNED_OUT") {
        setSession(null);
        setUser(null);
        setUserProfile(null);
        setProfileAvatar("");
        setUserRole("student");
        setLoading(false);
        if (typeof window !== "undefined") {
          try {
            const keysToRemove: string[] = [];
            for (let i = 0; i < localStorage.length; i++) {
              const key = localStorage.key(i);
              if (key && (key.startsWith("ldk_") || key.startsWith("lyndesk_") || key.includes("member") || key.includes("cache"))) {
                keysToRemove.push(key);
              }
            }
            keysToRemove.forEach(k => localStorage.removeItem(k));
          } catch {
            localStorage.clear();
          }
        }
      } else {
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      clearTimeout(safetyTimer);
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!user?.id) {
      queueMicrotask(() => setOnlineUserIds(new Set()));
      return;
    }

    let isSubscribed = true;

    // Single Global Supabase WebSockets Realtime Presence Channel with safe error handling
    const globalPresenceChannel = supabase.channel("global_presence", {
      config: { presence: { key: user.id } }
    });

    globalPresenceChannel
      .on("presence", { event: "sync" }, () => {
        if (!isSubscribed) return;
        const state = globalPresenceChannel.presenceState();
        const onlineSet = new Set<string>();
        Object.keys(state).forEach(key => {
          if (key) onlineSet.add(key);
        });
        onlineSet.add(user.id);
        setOnlineUserIds(onlineSet);
      })
      .on("presence", { event: "join" }, ({ key }) => {
        if (key && isSubscribed) {
          setOnlineUserIds(prev => new Set(prev).add(key));
        }
      })
      .on("presence", { event: "leave" }, ({ key }) => {
        if (key && isSubscribed) {
          setOnlineUserIds(prev => {
            const next = new Set(prev);
            next.delete(key);
            return next;
          });
        }
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED" && isSubscribed) {
          try {
            await globalPresenceChannel.track({
              user_id: user.id,
              online_at: new Date().toISOString()
            });
          } catch {}
        }
      });

    return () => {
      isSubscribed = false;
      try {
        globalPresenceChannel.untrack().catch(() => {});
        supabase.removeChannel(globalPresenceChannel);
      } catch {}
    };
  }, [user?.id]);

  const isUserOnline = (userId: string): boolean => {
    if (!userId) return false;
    if (user?.id && userId === user.id) return true;
    return onlineUserIds.has(userId);
  };

  const signOut = async () => {
    setLoading(true);
    if (user?.id) {
      try {
        await fetch("/api/workspace/presence", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            workspaceId: "00000000-0000-4000-8000-000000000000",
            userId: user.id,
            statusText: "Offline",
            isOnline: false
          })
        });
        await supabase
          .from("profiles")
          .update({ updated_at: new Date().toISOString() })
          .eq("id", user.id);
      } catch {}
    }

    if (typeof window !== "undefined") {
      try {
        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && (key.startsWith("ldk_") || key.startsWith("lyndesk_") || key.includes("member") || key.includes("cache"))) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach(k => localStorage.removeItem(k));
      } catch {
        localStorage.clear();
      }
    }
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error("Sign out error:", err);
    }
    setUser(null);
    setSession(null);
    setUserProfile(null);
    setProfileAvatar("");
    setUserRole("student");
    setOnlineUserIds(new Set());
    setLoading(false);
  };

  const refreshUser = async () => {
    try {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        setUser(data.user);
      }
    } catch {}
  };

  const updateUserProfile = (partial: Partial<UserProfileData>) => {
    setUserProfile(prev => {
      const updated = prev ? { ...prev, ...partial } : (partial as UserProfileData);
      if (partial.avatar_url && typeof window !== "undefined") {
        localStorage.setItem("ldk_active_user_avatar", partial.avatar_url);
        if (user?.id) {
          localStorage.setItem(`ldk_user_avatar_${user.id}`, partial.avatar_url);
        }
      }
      return updated;
    });
    if (partial.avatar_url) {
      setProfileAvatar(partial.avatar_url);
    }
  };

  useEffect(() => {
    if (!user?.id) {
      queueMicrotask(() => {
        setProfileAvatar("");
        setUserProfile(null);
      });
      return;
    }

    if (typeof window !== "undefined") {
      try {
        const rawPublic = localStorage.getItem(`ldk_public_profile_${user.id}`);
        if (rawPublic) {
          const parsed = JSON.parse(rawPublic);
          if (parsed?.avatar_url && (parsed.avatar_url.startsWith("http") || parsed.avatar_url.startsWith("data:image/"))) {
            queueMicrotask(() => {
              setProfileAvatar(parsed.avatar_url);
            });
          }
        }
        const cached =
          localStorage.getItem(`ldk_user_avatar_${user.id}`) ||
          localStorage.getItem(`ldk_avatar_url_${user.id}`) ||
          localStorage.getItem("ldk_active_user_avatar");
        if (cached && (cached.startsWith("http") || cached.startsWith("data:image/"))) {
          queueMicrotask(() => {
            setProfileAvatar(cached);
          });
        }
      } catch {}
    }

    const syncProfile = async () => {
      try {
        const { data } = await supabase
          .from("profiles")
          .select("id, full_name, username, avatar_url, academic_credits, department, college_key, bio, skills, github_url, linkedin_url, portfolio_url, leetcode_username, college_linked_status, institute_id, roll_number, college_name, graduation_year, batch_code")
          .eq("id", user.id)
          .maybeSingle();

        if (data) {
          const profData: UserProfileData = {
            id: data.id,
            full_name: data.full_name || user.user_metadata?.full_name || "Developer",
            username: data.username || "dev_user",
            avatar_url: data.avatar_url || user.user_metadata?.avatar_url || "",
            academic_credits: data.academic_credits || 0,
            department: data.department || "Computer Science",
            college_key: data.college_key || "",
            bio: data.bio || "",
            skills: data.skills || "",
            github_url: data.github_url,
            linkedin_url: data.linkedin_url,
            portfolio_url: data.portfolio_url,
            leetcode_username: data.leetcode_username,
            college_linked_status: data.college_linked_status || "none",
            institute_id: data.institute_id || undefined,
            college_name: data.college_name,
            roll_number: data.roll_number,
            graduation_year: data.graduation_year,
            batch_code: data.batch_code
          };
          setUserProfile(profData);

          if (data.avatar_url && typeof data.avatar_url === "string" && (data.avatar_url.startsWith("http") || data.avatar_url.startsWith("data:image/"))) {
            setProfileAvatar(data.avatar_url);
            if (typeof window !== "undefined") {
              localStorage.setItem("ldk_active_user_avatar", data.avatar_url);
              localStorage.setItem(`ldk_user_avatar_${user.id}`, data.avatar_url);
              localStorage.setItem(`ldk_avatar_url_${user.id}`, data.avatar_url);
            }
          }
        } else {
          // Auto-initialize profile row in database for newly registered user
          const defaultFullName = user.user_metadata?.full_name || (user.email ? user.email.split("@")[0] : "Student");
          const defaultUsername = user.user_metadata?.username || (user.email ? user.email.split("@")[0].toLowerCase().replace(/[^a-z0-9_]/g, "_") : `user_${user.id.slice(0, 6)}`);
          const defaultAvatar = user.user_metadata?.avatar_url || "";

          const newProfileData: UserProfileData = {
            id: user.id,
            full_name: defaultFullName,
            username: defaultUsername,
            avatar_url: defaultAvatar,
            academic_credits: 0,
            department: "Computer Science",
            college_key: "",
            bio: "",
            skills: "",
            college_linked_status: "none",
            institute_id: undefined
          };

          setUserProfile(newProfileData);

          // Save to database
          try {
            await supabase.from("profiles").upsert({
              id: user.id,
              full_name: defaultFullName,
              username: defaultUsername,
              avatar_url: defaultAvatar,
              department: "Computer Science",
              college_key: "",
              college_linked_status: "none",
              academic_credits: 0,
            });
          } catch (err) {
            console.error("Failed to auto-initialize profile in DB:", err);
          }
        }
      } catch (err) {
        console.error("Profile sync error:", err);
      }
    };

    syncProfile();
  }, [user?.id]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.addEventListener("ldk_profile_update", refreshUser);
      return () => {
        window.removeEventListener("ldk_profile_update", refreshUser);
      };
    }
  }, []);

  const resolveEmailFromInput = async (input: string): Promise<string> => {
    const trimmed = input.trim();
    if (trimmed.includes("@")) {
      return trimmed.toLowerCase();
    }
    return trimmed;
  };

  const updateUserPassword = async (newPassword: string): Promise<{ error: Error | null }> => {
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      return { error };
    } catch (err: any) {
      return { error: err instanceof Error ? err : new Error(String(err)) };
    }
  };

  const requestPasswordResetOtp = async (input: string): Promise<{ error: Error | null }> => {
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        return { error: new Error(data.error || "Failed to send 6-digit OTP code.") };
      }
      return { error: null };
    } catch (err: any) {
      return { error: err };
    }
  };

  const verifyPasswordResetOtp = async (input: string, token: string, newPassword?: string, confirmPassword?: string): Promise<{ error: Error | null }> => {
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input, otp: token, newPassword, confirmPassword }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        return { error: new Error(data.error || "Invalid or expired OTP code.") };
      }
      return { error: null };
    } catch (err: any) {
      return { error: err };
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      session, 
      userRole, 
      profileAvatar, 
      userProfile, 
      loading, 
      onlineUserIds, 
      isUserOnline, 
      refreshUser, 
      updateUserProfile, 
      resolveEmailFromInput, 
      updateUserPassword, 
      requestPasswordResetOtp, 
      verifyPasswordResetOtp,
      signOut 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
