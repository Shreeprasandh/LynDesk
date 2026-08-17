"use client";

import React from "react";

export default function GlobalError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="bg-bg-base text-txt-main min-h-screen flex items-center justify-center p-6 font-mono selection:bg-accent-main selection:text-bg-base">
        <div className="max-w-md w-full border border-border-main/80 bg-bg-surface p-8 rounded-md shadow-2xl flex flex-col items-center text-center gap-5">
          <div className="w-12 h-12 rounded-md bg-bg-card border border-border-main/70 flex items-center justify-center text-txt-main mx-auto font-display text-xl font-bold">
            L
          </div>
          <div className="flex flex-col gap-1.5 min-w-0">
            <span className="text-[10px] uppercase tracking-widest text-txt-muted font-bold">Global System Diagnostic</span>
            <h1 className="font-display text-2xl font-light text-txt-main">Application Exception</h1>
            <p className="text-xs text-txt-sub font-light leading-relaxed mt-1">
              {error.message || "A critical error occurred while rendering the page layout."}
            </p>
          </div>
          <button
            onClick={() => reset()}
            className="w-full h-9 px-4 bg-accent-main hover:opacity-90 text-bg-base font-semibold font-mono text-xs uppercase rounded cursor-pointer transition-opacity"
          >
            Reload Application
          </button>
        </div>
      </body>
    </html>
  );
}
