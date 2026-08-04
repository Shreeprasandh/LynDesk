import React from "react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="h-14 w-full flex items-center justify-between px-6 md:px-12 border-t border-border-main/60 bg-bg-surface text-txt-muted text-[10px] font-mono tracking-wider shrink-0 mt-12 md:mt-16">
      <div className="flex items-center gap-2">
        <span>© 2026 LYNDESK NETWORK INC.</span>
      </div>
      <div className="flex items-center gap-6 uppercase font-mono">
        <Link href="/privacy" className="hover:text-txt-main transition-colors">
          Privacy
        </Link>
        <Link href="/terms" className="hover:text-txt-main transition-colors">
          Terms
        </Link>
        <div className="flex items-center text-[9px] text-txt-sub font-mono">
          <span className="font-semibold text-txt-main/80 tracking-widest">LDK:SYS</span>
        </div>
      </div>
    </footer>
  );
}
