"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";

export type UserRole = "student" | "recruiter" | "coordinator";

type AuthContextType = {
  user: User | null;
  session: Session | null;
  userRole: UserRole;
  loading: boolean;
  onlineUserIds: Set<string>;
  isUserOnline: (userId: string) => boolean;
  refreshUser: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userRole, setUserRole] = useState<UserRole>("student");
  const [loading, setLoading] = useState(true);
  const [onlineUserIds, setOnlineUserIds] = useState<Set<string>>(new Set());

  const resolveRole = (u: User | null): UserRole => {
    const metaRole = u?.user_metadata?.role;
    if (metaRole === "recruiter" || metaRole === "employee" || u?.user_metadata?.company_key) return "recruiter";
    if (metaRole === "coordinator" || metaRole === "faculty" || u?.user_metadata?.registered_staff) return "coordinator";

    if (typeof window !== "undefined") {
      const rec = localStorage.getItem("company_recruiter_member");
      if (rec && rec !== "false") return "recruiter";
      const fac = localStorage.getItem("faculty_staff_member");
      if (fac && fac !== "false") return "coordinator";
    }
    return "student";
  };

  useEffect(() => {
    // 1. Check initial active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setUserRole(resolveRole(session?.user ?? null));
      setLoading(false);

      if (session && typeof window !== "undefined") {
        if (window.location.search.includes("code=") || window.location.hash.includes("access_token=")) {
          window.history.replaceState(null, "", window.location.pathname);
        }
      }
    });

    // 2. Listen for authentication state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        setSession(session);
        setUser(session.user);
        setUserRole(resolveRole(session.user));
        setLoading(false);
        if (typeof window !== "undefined") {
          if (window.location.search.includes("code=") || window.location.hash.includes("access_token=")) {
            window.history.replaceState(null, "", window.location.pathname);
          }
        }
      } else if (event === "SIGNED_OUT") {
        setSession(null);
        setUser(null);
        setUserRole("student");
        setLoading(false);
      } else {
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!user?.id) {
      queueMicrotask(() => setOnlineUserIds(new Set()));
      return;
    }

    // 1. Single Global Supabase WebSockets Realtime Presence Channel
    const globalPresenceChannel = supabase.channel("global_presence", {
      config: { presence: { key: user.id } }
    });

    globalPresenceChannel
      .on("presence", { event: "sync" }, () => {
        const state = globalPresenceChannel.presenceState();
        const onlineSet = new Set<string>();
        Object.keys(state).forEach(key => {
          if (key) onlineSet.add(key);
        });
        onlineSet.add(user.id);
        setOnlineUserIds(onlineSet);
      })
      .on("presence", { event: "join" }, ({ key }) => {
        if (key) {
          setOnlineUserIds(prev => new Set(prev).add(key));
        }
      })
      .on("presence", { event: "leave" }, ({ key }) => {
        if (key) {
          setOnlineUserIds(prev => {
            const next = new Set(prev);
            next.delete(key);
            return next;
          });
        }
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await globalPresenceChannel.track({
            user_id: user.id,
            online_at: new Date().toISOString()
          });
        }
      });

    return () => {
      globalPresenceChannel.untrack().catch(() => {});
      supabase.removeChannel(globalPresenceChannel);
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
      localStorage.removeItem("faculty_staff_member");
      localStorage.removeItem("company_recruiter_member");
      localStorage.removeItem("ldk_recruiter_session");
      localStorage.removeItem("ldk_avatar_url");
    }
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error("Sign out error:", err);
    }
    setUser(null);
    setSession(null);
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

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.addEventListener("ldk_profile_update", refreshUser);
      return () => {
        window.removeEventListener("ldk_profile_update", refreshUser);
      };
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, session, userRole, loading, onlineUserIds, isUserOnline, refreshUser, signOut }}>
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
