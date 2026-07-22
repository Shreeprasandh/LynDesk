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
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userRole, setUserRole] = useState<UserRole>("student");
  const [loading, setLoading] = useState(true);

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

  const signOut = async () => {
    setLoading(true);
    if (typeof window !== "undefined") {
      localStorage.removeItem("faculty_staff_member");
      localStorage.removeItem("company_recruiter_member");
      localStorage.removeItem("ldk_recruiter_session");
    }
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error("Sign out error:", err);
    }
    setUser(null);
    setSession(null);
    setUserRole("student");
    setLoading(false);
  };

  return (
    <AuthContext.Provider value={{ user, session, userRole, loading, signOut }}>
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
