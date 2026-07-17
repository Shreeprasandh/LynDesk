"use client";

import React from "react";
import { useTheme } from "../components/ThemeProvider";
import Link from "next/link";
import { Sun, Moon, ArrowLeft } from "lucide-react";
import LynDeskLogo from "../components/LynDeskLogo";

export default function PrivacyPolicy() {
  const { theme, toggleTheme } = useTheme();

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const navigationEntries = window.performance.getEntriesByType("navigation");
      if (navigationEntries.length > 0) {
        const navType = (navigationEntries[0] as PerformanceNavigationTiming).type;
        if (navType === "reload") {
          window.location.href = "/";
        }
      }
    }
  }, []);

  return (
    <div className="h-screen overflow-hidden flex flex-col font-sans selection:bg-accent-main selection:text-bg-base">
      
      {/* Header */}
      <header className="sticky top-0 z-50 h-16 flex items-center justify-between px-6 md:px-12 bg-bg-surface/80 backdrop-blur-md border-b border-border-main/60 transition-colors duration-150 flex-shrink-0">
        <Link href="/" className="flex items-center gap-2 select-none cursor-pointer">
          <LynDeskLogo size={20} className="mr-1" />
          <span className="font-display text-base font-semibold tracking-[0.25em] text-txt-main">
            LYNDESK
          </span>
        </Link>

        <div className="flex items-center gap-4">
          <button 
            onClick={toggleTheme}
            className="p-2 rounded-full border border-border-main/80 hover:bg-bg-card text-txt-main transition-colors duration-150 focus:outline-none"
            aria-label="Toggle Theme"
          >
            {theme === "light" ? <Moon size={14} /> : <Sun size={14} />}
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-6 py-12 overflow-y-auto flex flex-col gap-8">
        
        {/* Back Link */}
        <Link 
          href="/"
          className="flex items-center gap-2 text-xs text-txt-muted hover:text-txt-main self-start transition-colors font-mono tracking-wider uppercase text-[10px]"
        >
          <ArrowLeft size={13} />
          Back to Portal
        </Link>

        {/* Content */}
        <div className="flex flex-col gap-6">
          <div className="border-b border-border-main/50 pb-4 flex flex-col gap-2">
            <span className="font-mono text-[9px] uppercase tracking-widest text-txt-muted">Legal Registry</span>
            <h1 className="font-display text-3xl font-light tracking-tight text-txt-main">Privacy Policy</h1>
            <p className="text-xs text-txt-muted font-mono">Last updated: July 16, 2026</p>
          </div>

          <div className="flex flex-col gap-6 text-sm text-txt-sub font-light leading-relaxed">
            <p>
              At LynDesk, we believe technical accomplishment should be documented transparently and protected securely. 
              This Policy details how we collect, store, and utilize your information across the LynDesk Campus network.
            </p>

            <div className="flex flex-col gap-2">
              <h2 className="font-display text-lg font-semibold text-txt-main">1. Scope of Data Collection</h2>
              <p>
                We collect personal information required to establish your technical dashboard and university connection:
              </p>
              <ul className="list-disc list-inside pl-2 flex flex-col gap-1 text-xs">
                <li><strong>Authentication Data</strong>: Full name, email address, and OAuth authentication tokens (from Google, GitHub, and Discord).</li>
                <li><strong>Academic Portfolios</strong>: Project names, registration deadlines, co-worker associations, slide decks, and project reports.</li>
                <li><strong>Integration Metadata</strong>: Public GitHub repository URLs, commit metrics, and chat communications inside project spaces.</li>
              </ul>
            </div>

            <div className="flex flex-col gap-2">
              <h2 className="font-display text-lg font-semibold text-txt-main">2. Academic Record Protection (FERPA)</h2>
              <p>
                For university-mandated credit claims, LynDesk operates in compliance with the Family Educational Rights and Privacy Act (FERPA) regulations protecting student education records:
              </p>
              <ul className="list-disc list-inside pl-2 flex flex-col gap-1 text-xs">
                <li>Project accomplishment logs and credit requests are shared strictly with verified department deans and faculty advisors.</li>
                <li>Students retain full ownership of their extracurricular histories and can opt to make their profiles public or private at any time.</li>
              </ul>
            </div>

            <div className="flex flex-col gap-2">
              <h2 className="font-display text-lg font-semibold text-txt-main">3. Data Sharing and Third-Party API Integrations</h2>
              <p>
                We do not sell student profile metadata to third-party advertisers or recruitment brokers. Information is shared strictly in these cases:
              </p>
              <ul className="list-disc list-inside pl-2 flex flex-col gap-1 text-xs">
                <li><strong>Within Project Teams</strong>: Shared chat logs, slide decks, and codebases are visible to co-workers you invite.</li>
                <li><strong>To Institutional Admins</strong>: Submitting credit requests routes verified files to your university&apos;s grading console.</li>
              </ul>
            </div>

            <div className="flex flex-col gap-2">
              <h2 className="font-display text-lg font-semibold text-txt-main">4. Security Standards</h2>
              <p>
                All data transfers are encrypted in transit via SSL/TLS, and authentication sessions are guarded by Supabase Row Level Security (RLS) policies. Databases are hosted in secure, isolated ap-northeast cloud centers.
              </p>
            </div>
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="h-12 flex items-center justify-between px-6 md:px-12 border-t border-border-main/60 bg-bg-surface text-txt-muted text-[10px] font-mono tracking-wider transition-colors duration-150 flex-shrink-0">
        <div>© 2026 LYNDESK NETWORK INC.</div>
        <div className="flex gap-6 uppercase font-mono">
          <Link href="/privacy" className="text-txt-main">Privacy</Link>
          <Link href="/terms" className="hover:text-txt-main transition-colors">Terms</Link>
          <Link href="/help" className="hover:text-txt-main transition-colors">Help</Link>
          <span className="text-txt-muted select-none">LDK:SYS</span>
        </div>
      </footer>

    </div>
  );
}
