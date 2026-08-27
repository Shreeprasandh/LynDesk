"use client";

import React from "react";
import { useTheme } from "../components/ThemeProvider";
import Link from "next/link";
import { Sun, Moon, ArrowLeft } from "lucide-react";
import LynDeskLogo from "../components/LynDeskLogo";
import Footer from "../components/Footer";

export default function TermsOfService() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen lg:h-screen lg:overflow-hidden flex flex-col font-sans selection:bg-accent-main selection:text-bg-base">
      
      {/* Header */}
      <header className="sticky top-0 z-50 h-16 flex items-center justify-between px-6 md:px-12 bg-bg-surface/80 backdrop-blur-md border-b border-border-main/60 transition-colors duration-150 flex-shrink-0">
        <Link href="/" className="flex items-center gap-2 select-none cursor-pointer">
          <LynDeskLogo size={29} className="mr-1" />
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
            <h1 className="font-display text-3xl font-light tracking-tight text-txt-main">Terms of Service</h1>
            <p className="text-xs text-txt-muted font-mono">Last updated: July 16, 2026</p>
          </div>

          <div className="flex flex-col gap-6 text-sm text-txt-sub font-light leading-relaxed">
            <p>
              Welcome to LynDesk (&quot;Link Your Next Desk — The Future in Your Hands&quot;). By accessing or utilizing our workspace dashboards, tracking registries, study desks, and institutional portals, you agree to comply with the terms detailed below.
            </p>

            <div className="flex flex-col gap-2">
              <h2 className="font-display text-lg font-semibold text-txt-main">1. Access and Account Registration</h2>
              <p>
                To enter your university&apos;s network directory, workspaces, and coding desks, you must establish an account using a valid email address or supported OAuth login (Google, GitHub, Discord). 
                You are responsible for safeguarding your session tokens and security passwords. LynDesk provides multi-account linking capabilities; you agree that at least one authentication method must remain active to preserve access.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <h2 className="font-display text-lg font-semibold text-txt-main">2. Intellectual Property and Content Ownership</h2>
              <p>
                <strong>You retain 100% ownership of your work.</strong> Any project documentation, source code repositories, Kanban tasks, slide decks, technical PDFs, or messages uploaded to your project spaces remain your intellectual property. 
                LynDesk claims no proprietary rights or license over student creations.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <h2 className="font-display text-lg font-semibold text-txt-main">3. Acceptable Use Guidelines</h2>
              <p>
                By utilizing LynDesk workspaces, you agree not to engage in the following prohibited activities:
              </p>
              <ul className="list-disc list-inside pl-2 flex flex-col gap-1 text-xs">
                <li>Uploading malware, corrupted files, or scripts designed to interrupt platform operations or compromise peer peers.</li>
                <li>Plagiarizing project codebases, forging commit metadata, or falsifying credentials during academic credit claims.</li>
                <li>Using collaborative chat channels, audio lounges, or message desks to propagate harassment or violate campus codes of conduct.</li>
                <li>Attempting to bypass role-based security access controls or exploit application programming interfaces.</li>
              </ul>
            </div>

            <div className="flex flex-col gap-2">
              <h2 className="font-display text-lg font-semibold text-txt-main">4. University Credits & Verification Disclaimer</h2>
              <p>
                LynDesk acts solely as a tracking coordinator and cryptographic validation platform for extracurricular activity points and hackathon milestones. 
                <strong>The final approval and awarding of university academic credits, graduation points, or faculty endorsements rests entirely with your institution&apos;s administration and authorized faculty verifiers.</strong> 
                LynDesk makes no guarantee that submission logs will be approved by your university department.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <h2 className="font-display text-lg font-semibold text-txt-main">5. WebRTC Communications & Third-Party Services</h2>
              <p>
                Collaborative voice, video, and screen-share features connect directly between peer browsers via WebRTC. LynDesk does not monitor, record, or assume liability for peer-to-peer audio/video discussions occurring in live lounges. 
                Integrations with third parties (GitHub, LeetCode, Google) are governed by their respective service terms.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <h2 className="font-display text-lg font-semibold text-txt-main">6. Limitation of Liability</h2>
              <p>
                LynDesk is provided on an &quot;as is&quot; and &quot;as available&quot; basis. We make no warranty that operations will be completely uninterrupted. 
                We are not liable for project deadlines missed due to internet outages, third-party API down-times, or network latency.
              </p>
            </div>
          </div>
        </div>

      </main>

      <Footer />

    </div>
  );
}
