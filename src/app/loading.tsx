import React from "react";

export default function GlobalLoadingSkeleton() {
  return (
    <div className="w-full min-h-[80vh] flex flex-col items-center justify-center p-6 space-y-4">
      <div className="w-12 h-12 rounded-2xl border-2 border-blue-500/30 border-t-blue-500 animate-spin" />
      <div className="h-4 w-36 bg-[#21262d] rounded-full animate-pulse" />
    </div>
  );
}
