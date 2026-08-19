"use client";

import React, { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "../../lib/supabase";

function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    let isMounted = true;

    const handleAuth = async () => {
      try {
        const nextParam = searchParams.get("next") || "/event-desk";
        const isFirstTime = typeof window !== "undefined" && localStorage.getItem("ldk_first_time_signup") === "true";
        const target = isFirstTime ? "/profile" : nextParam;

        // 1. Check if session was already established or exchanged via detectSessionInUrl
        const { data: { session } } = await supabase.auth.getSession();
        if (session && isMounted) {
          router.replace(target);
          return;
        }

        // 2. Listen for instant auth state change once PKCE completes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
          if (newSession && isMounted) {
            subscription.unsubscribe();
            router.replace(target);
          }
        });

        // 3. Fallback timeout to prevent hanging
        const timeout = setTimeout(() => {
          if (isMounted) {
            router.replace(target);
          }
        }, 1200);

        return () => {
          clearTimeout(timeout);
          subscription.unsubscribe();
        };
      } catch (err) {
        console.error("OAuth callback error:", err);
        if (isMounted) router.replace("/event-desk");
      }
    };

    handleAuth();

    return () => {
      isMounted = false;
    };
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-base text-txt-main font-mono text-xs">
      <div className="flex flex-col items-center gap-3 animate-pulse">
        <div className="w-6 h-6 border-2 border-accent-main border-t-transparent rounded-full animate-spin" />
        <span className="tracking-widest uppercase text-[10px] text-txt-muted">Signing in to LynDesk...</span>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-bg-base text-txt-main font-mono text-xs">
        <div className="w-6 h-6 border-2 border-accent-main border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <CallbackHandler />
    </Suspense>
  );
}
