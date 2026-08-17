import React from "react";
import LynDeskLoadingCard from "./components/LynDeskLoadingCard";

export default function GlobalLoadingSkeleton() {
  return (
    <div className="w-full min-h-[85vh] flex items-center justify-center p-6 bg-bg-base">
      <LynDeskLoadingCard 
        message="Loading LynDesk Desk..."
        subtext="Fetching live campus network state & workspace registries"
        minHeight="min-h-[400px]"
      />
    </div>
  );
}
