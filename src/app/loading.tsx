import React from "react";
import LynDeskLoadingCard from "./components/LynDeskLoadingCard";

export default function GlobalLoadingSkeleton() {
  return (
    <div className="w-full min-h-[60vh] flex flex-col items-center justify-center p-6 bg-bg-base">
      <div className="w-48 h-1 bg-bg-card border border-border-main/50 rounded-full overflow-hidden relative">
        <div className="w-1/2 h-full bg-accent-main rounded-full animate-pulse" />
      </div>
    </div>
  );
}
