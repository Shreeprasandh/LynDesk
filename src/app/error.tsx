"use client";

import React, { useEffect } from "react";

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
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center bg-[#0d1117] text-white">
      <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 mb-4">
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>

      <h2 className="text-2xl font-bold mb-2">Something went wrong</h2>
      <p className="text-[#8b949e] max-w-md mb-6 text-sm">
        {error.message || "An unexpected application error occurred. We have logged this diagnostic trace and prepared recovery."}
      </p>

      <div className="flex gap-3">
        <button
          onClick={() => reset()}
          className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm transition-all shadow-lg shadow-blue-500/20"
        >
          Try Again
        </button>
        <button
          onClick={() => window.location.href = "/"}
          className="px-5 py-2.5 rounded-xl bg-[#21262d] hover:bg-[#30363d] text-[#c9d1d9] font-medium text-sm transition-all"
        >
          Return Home
        </button>
      </div>
    </div>
  );
}
