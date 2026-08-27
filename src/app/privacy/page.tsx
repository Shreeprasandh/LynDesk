"use client";

import React from "react";
import { useTheme } from "../components/ThemeProvider";
import Link from "next/link";
import { Sun, Moon, ArrowLeft } from "lucide-react";
import LynDeskLogo from "../components/LynDeskLogo";
import Footer from "../components/Footer";

export default function PrivacyPolicy() {
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
            <h1 className="font-display text-3xl font-light tracking-tight text-txt-main">Privacy Policy</h1>
            <p className="text-xs text-txt-muted font-mono">Last updated: July 16, 2026</p>
          </div>

          <div className="flex flex-col gap-6 text-sm text-txt-sub font-light leading-relaxed">
            <p>
              At LynDesk (&quot;Link Your Next Desk — The Future in Your Hands&quot;), we believe technical accomplishment should be documented transparently and protected securely. 
              This Policy details how we collect, store, safeguard, and utilize your information across the LynDesk Campus network and workspace ecosystem.
            </p>

            <div className="flex flex-col gap-2">
              <h2 className="font-display text-lg font-semibold text-txt-main">1. Scope of Data Collection</h2>
              <p>
                We collect personal information strictly necessary to establish your student dashboard, verified portfolio, and university connection:
              </p>
              <ul className="list-disc list-inside pl-2 flex flex-col gap-1 text-xs">
                <li><strong>Identity & Authentication Data</strong>: Full legal name, unique username handle, date of birth, geographic location, primary email address, and OAuth authentication tokens from linked third-party providers (Google, GitHub, Discord).</li>
                <li><strong>Academic Credentials</strong>: University or college affiliation, academic department, intended graduation year, and extracurricular verification points.</li>
                <li><strong>Workspace Deliverables</strong>: Project tasks, Kanban milestone states, meeting agendas, slide decks, markdown documentation, whiteboard notes, and team chat transcripts within authorized project spaces.</li>
                <li><strong>Developer Metrics</strong>: Public GitHub repository URLs, commit histories, LeetCode performance statistics, and problem-solving metrics aggregated via your integrated profiles.</li>
              </ul>
            </div>

            <div className="flex flex-col gap-2">
              <h2 className="font-display text-lg font-semibold text-txt-main">2. Academic Record Protection (FERPA & Global Compliance)</h2>
              <p>
                For university-mandated credit claims and departmental oversight, LynDesk operates in strict compliance with the Family Educational Rights and Privacy Act (FERPA) regulations protecting student education records:
              </p>
              <ul className="list-disc list-inside pl-2 flex flex-col gap-1 text-xs">
                <li>Project accomplishment logs and credit requests are shared strictly with authorized, verified department deans and faculty advisors.</li>
                <li>Students retain full ownership of their extracurricular histories and can opt to make their profiles public or private at any time.</li>
                <li>No educational records or student performance metrics are indexed by commercial search engines without explicit user consent.</li>
              </ul>
            </div>

            <div className="flex flex-col gap-2">
              <h2 className="font-display text-lg font-semibold text-txt-main">3. Multi-Account OAuth & Credential Linking</h2>
              <p>
                LynDesk provides unified authentication allowing students to link multiple identity providers (Google, GitHub, Discord) to a single profile:
              </p>
              <ul className="list-disc list-inside pl-2 flex flex-col gap-1 text-xs">
                <li>OAuth tokens are used solely for identity verification and authorized metadata retrieval (e.g. GitHub repos, LeetCode stats). We never request or store your private repository passwords or third-party credentials.</li>
                <li>You can link or unlink OAuth accounts at any time from your Profile settings, subject to the safety rule that at least one authentication method must remain active to prevent account lockout.</li>
              </ul>
            </div>

            <div className="flex flex-col gap-2">
              <h2 className="font-display text-lg font-semibold text-txt-main">4. WebRTC Real-Time Communications & Voice/Video Privacy</h2>
              <p>
                Our collaborative workspace voice and video lounges operate via WebRTC peer-to-peer protocols:
              </p>
              <ul className="list-disc list-inside pl-2 flex flex-col gap-1 text-xs">
                <li>Audio and video streams are transmitted directly between workspace members using End-to-End Encryption (E2EE) and are never recorded, tapped, or stored on LynDesk servers.</li>
                <li>Signaling metadata is ephemeral and deleted immediately upon channel disconnection.</li>
              </ul>
            </div>

            <div className="flex flex-col gap-2">
              <h2 className="font-display text-lg font-semibold text-txt-main">5. AI Curriculum Processing & Data Privacy</h2>
              <p>
                When utilizing the Study Desk AI path generator or syllabus synthesizer:
              </p>
              <ul className="list-disc list-inside pl-2 flex flex-col gap-1 text-xs">
                <li>Uploaded PDF course syllabi and topic prompts are processed in transient memory to generate pedagogical flashcards and quizzes.</li>
                <li>User data is never used to train generalized foundation models without your explicit opt-in.</li>
              </ul>
            </div>

            <div className="flex flex-col gap-2">
              <h2 className="font-display text-lg font-semibold text-txt-main">6. Security Infrastructure & Zero-Sale Guarantee</h2>
              <p>
                All data transfers are encrypted in transit via TLS 1.3, and database records are isolated using strict PostgreSQL Row Level Security (RLS) policies. 
                <strong>We enforce a zero-sale policy:</strong> LynDesk never sells student profile information, contact data, or project codebases to third-party advertisers or commercial data brokers.
              </p>
            </div>
          </div>
        </div>

      </main>

      <Footer />

    </div>
  );
}
