import React from "react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="h-12 w-full flex items-center justify-between px-6 md:px-12 border-t border-border-main/60 bg-bg-surface text-txt-muted text-[10px] font-mono tracking-wider shrink-0 mt-auto">
      <div>
        © 2026 LYNDESK NETWORK INC.
      </div>
      <div className="flex items-center gap-6 uppercase font-mono">
        <Link href="/privacy" className="hover:text-txt-main transition-colors">
          Privacy
        </Link>
        <Link href="/terms" className="hover:text-txt-main transition-colors">
          Terms
        </Link>
        <div className="flex items-center gap-1.5 text-[8px] text-txt-sub">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-semibold text-txt-main">LDK:SYS</span>
        </div>
      </div>
    </footer>
  );
}
