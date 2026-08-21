import React from "react";
import Header from "../../components/Header";
import LynDeskLoadingCard from "../../components/LynDeskLoadingCard";

export default function WorkspaceLoading() {
  return (
    <div className="min-h-screen lg:h-screen lg:overflow-hidden flex flex-col font-sans selection:bg-accent-main selection:text-bg-base bg-bg-base">
      <Header />
      <div className="flex-1 flex items-center justify-center p-6 bg-bg-base">
        <LynDeskLoadingCard
          message="Initializing Workspace..."
          subtext="Syncing project vault, realtime channel & team presence..."
          minHeight="min-h-[500px]"
        />
      </div>
    </div>
  );
}
