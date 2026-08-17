"use client";

import React, { useEffect } from "react";
import LynDeskLogo from "./components/LynDeskLogo";

export default function ErrorBoundary({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Uncaught Client Exception:", error);
  }, [error]);

  return (
    <div className="min-h-[75vh] flex flex-col items-center justify-center p-6 text-center bg-bg-base text-txt-main font-mono">
      <div className="max-w-md w-full border border-border-main/80 bg-bg-surface p-8 rounded-md shadow-2xl flex flex-col items-center gap-5">
        
        <div className="p-3 bg-bg-card border border-border-main/70 rounded-md shadow-xs">
          <LynDeskLogo size={32} />
        </div>

        <div className="flex flex-col gap-1.5 min-w-0">
          <span className="text-[10px] uppercase tracking-widest text-txt-muted font-bold">Application Diagnostics</span>
          <h2 className="font-display text-2xl font-light text-txt-main">Something Went Wrong</h2>
          <p className="text-xs text-txt-sub font-light leading-relaxed mt-1">
            {error.message || "An unexpected exception occurred. We have logged this trace for recovery."}
          </p>
        </div>

        <div className="flex items-center gap-3 w-full pt-2">
          <button
            onClick={() => reset()}
            className="flex-1 h-9 px-4 bg-accent-main hover:opacity-90 text-bg-base font-semibold font-mono text-xs uppercase rounded cursor-pointer transition-opacity"
          >
            Retry Action
          </button>
          <button
            onClick={() => window.location.href = "/"}
            className="flex-1 h-9 px-4 border border-border-main/80 bg-bg-card hover:bg-bg-base text-txt-main font-semibold font-mono text-xs uppercase rounded cursor-pointer transition-colors"
          >
            Return Home
          </button>
        </div>

      </div>
    </div>
  );
}
