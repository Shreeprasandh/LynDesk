"use client";

import React, { useState } from "react";
import { useTheme } from "./components/ThemeProvider";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sun, 
  Moon, 
  Link2, 
  Users, 
  Award, 
  ArrowRight, 
  Chrome, 
  FolderGit, 
  Compass, 
  Bell, 
  FileText,
  Lock,
  Mail
} from "lucide-react";

export default function Home() {
  const { theme, toggleTheme } = useTheme();
  const [authStep, setAuthStep] = useState<"idle" | "login" | "success">("idle");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate premium transition delay
    setTimeout(() => {
      setLoading(false);
      setAuthStep("success");
    }, 1200);
  };

  return (
    <div className="flex-1 flex flex-col font-sans selection:bg-accent-main selection:text-bg-base">
      
      {/* 1. Header (Sticky, Frosted Glass) */}
      <header className="sticky top-0 z-50 h-16 flex items-center justify-between px-6 md:px-12 bg-bg-surface/85 backdrop-blur-md border-b border-border-main transition-colors duration-150">
        <div className="flex items-center gap-2">
          <span className="font-display text-lg font-semibold tracking-[0.18em] text-txt-main">
            LYNDESK
          </span>
          <span className="text-[10px] tracking-wider text-txt-muted uppercase px-2 py-0.5 border border-border-main rounded bg-bg-card font-mono">
            Campus Beta
          </span>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={toggleTheme}
            className="p-2.5 rounded-full border border-border-main hover:bg-bg-card text-txt-main transition-all duration-150 focus:outline-none focus:ring-1 focus:ring-ring-main"
            aria-label="Toggle Theme"
          >
            {theme === "light" ? <Moon size={15} /> : <Sun size={15} />}
          </button>
        </div>
      </header>

      {/* 2. Page Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 md:px-12 py-16 md:py-24 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
        
        {/* Left Column: Hero Copy & Features Summary */}
        <section className="lg:col-span-7 flex flex-col items-start gap-8">
          <div className="flex flex-col gap-4">
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-txt-muted font-medium">
              Link Your Next Desk
            </span>
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-light tracking-tight text-txt-main leading-[1.1] max-w-2xl">
              Where your projects and hackathons <span className="font-normal border-b-2 border-accent-main/20">take form.</span>
            </h1>
          </div>
          
          <p className="text-txt-sub text-lg leading-relaxed max-w-xl">
            LynDesk is a highly focused workspace vault for engineering students. 
            Track stages, collaborate in real-time, and verify extracurricular accomplishments 
            for academic credits on a clean, distraction-free campus network.
          </p>

          {/* Features Checklist */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full pt-4 border-t border-border-main">
            <div className="flex flex-col gap-2">
              <div className="h-8 w-8 rounded border border-border-main bg-bg-surface flex items-center justify-center text-txt-main">
                <Link2 size={14} />
              </div>
              <h3 className="font-display text-sm font-medium text-txt-main">The Event Vault</h3>
              <p className="text-xs text-txt-muted leading-relaxed">
                Paste hackathon links to auto-fetch stages, timelines, and registration guidelines.
              </p>
            </div>
            
            <div className="flex flex-col gap-2">
              <div className="h-8 w-8 rounded border border-border-main bg-bg-surface flex items-center justify-center text-txt-main">
                <Users size={14} />
              </div>
              <h3 className="font-display text-sm font-medium text-txt-main">Co-Worker Sync</h3>
              <p className="text-xs text-txt-muted leading-relaxed">
                Shared workspaces containing chat, voice decks, live github repos, and file archives.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <div className="h-8 w-8 rounded border border-border-main bg-bg-surface flex items-center justify-center text-txt-main">
                <Award size={14} />
              </div>
              <h3 className="font-display text-sm font-medium text-txt-main">Campus Credits</h3>
              <p className="text-xs text-txt-muted leading-relaxed">
                Export cryptographic summaries of won events for quick, university-accredited points.
              </p>
            </div>
          </div>
        </section>

        {/* Right Column: Premium Auth Card Deck */}
        <section className="lg:col-span-5 w-full flex justify-center">
          <div className="w-full max-w-md border border-border-main bg-bg-surface p-8 rounded-lg shadow-sm hover:shadow-md transition-all duration-300">
            <AnimatePresence mode="wait">
              {authStep === "idle" && (
                <motion.div 
                  key="idle"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
                  className="flex flex-col gap-6"
                >
                  <div className="flex flex-col gap-2">
                    <h2 className="font-display text-xl font-semibold text-txt-main tracking-tight">
                      Authenticate Workspace
                    </h2>
                    <p className="text-xs text-txt-muted">
                      Join the LynDesk platform to manage your next project.
                    </p>
                  </div>

                  <button 
                    onClick={() => setAuthStep("login")}
                    className="w-full h-11 rounded border border-border-main hover:bg-bg-card text-txt-main font-medium text-sm flex items-center justify-center gap-2.5 transition-colors duration-150 focus:outline-none focus:ring-1 focus:ring-ring-main"
                  >
                    <Mail size={15} />
                    Continue with Email
                  </button>

                  <div className="relative flex py-1 items-center">
                    <div className="flex-grow border-t border-border-main"></div>
                    <span className="flex-shrink mx-4 text-[10px] font-mono tracking-widest text-txt-muted uppercase">or</span>
                    <div className="flex-grow border-t border-border-main"></div>
                  </div>

                  <button 
                    onClick={() => {
                      setLoading(true);
                      setTimeout(() => {
                        setLoading(false);
                        setAuthStep("success");
                      }, 1200);
                    }}
                    className="w-full h-11 rounded bg-accent-main hover:opacity-90 text-bg-base font-medium text-sm flex items-center justify-center gap-2.5 transition-opacity duration-150 focus:outline-none focus:ring-1 focus:ring-ring-main"
                  >
                    <Chrome size={15} />
                    Login with Institution Google Account
                  </button>

                  <p className="text-[10px] text-center text-txt-muted leading-relaxed">
                    Signing up automatically links your account to your university portal if using a valid institutional email domain.
                  </p>
                </motion.div>
              )}

              {authStep === "login" && (
                <motion.form 
                  key="login"
                  onSubmit={handleLogin}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
                  className="flex flex-col gap-5"
                >
                  <div className="flex flex-col gap-1.5">
                    <button 
                      type="button"
                      onClick={() => setAuthStep("idle")}
                      className="text-xs text-txt-muted hover:text-txt-main self-start transition-colors duration-150 font-mono tracking-wide"
                    >
                      ← Back
                    </button>
                    <h2 className="font-display text-xl font-semibold text-txt-main tracking-tight mt-1">
                      Email Credentials
                    </h2>
                  </div>

                  <div className="flex flex-col gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs text-txt-sub font-medium">Email Address</label>
                      <input 
                        type="email" 
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@university.edu"
                        className="h-10 px-3 border border-border-main bg-bg-base text-txt-main rounded text-sm placeholder:text-txt-muted/70 focus:outline-none focus:border-txt-main focus:ring-1 focus:ring-ring-main transition-colors duration-150"
                      />
                    </div>
                    
                    <div className="flex flex-col gap-1">
                      <div className="flex justify-between items-center">
                        <label className="text-xs text-txt-sub font-medium">Password</label>
                        <a href="#" className="text-[10px] text-txt-muted hover:text-txt-main transition-colors">Forgot?</a>
                      </div>
                      <input 
                        type="password" 
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="h-10 px-3 border border-border-main bg-bg-base text-txt-main rounded text-sm placeholder:text-txt-muted/70 focus:outline-none focus:border-txt-main focus:ring-1 focus:ring-ring-main transition-colors duration-150"
                      />
                    </div>
                  </div>

                  <button 
                    type="submit"
                    disabled={loading}
                    className="w-full h-11 rounded bg-accent-main hover:opacity-90 disabled:opacity-50 text-bg-base font-medium text-sm flex items-center justify-center gap-2.5 transition-opacity duration-150 focus:outline-none focus:ring-1 focus:ring-ring-main"
                  >
                    {loading ? (
                      <span className="h-4 w-4 rounded-full border-2 border-bg-base/30 border-t-bg-base animate-spin" />
                    ) : (
                      <>
                        Secure Sign In
                        <ArrowRight size={14} />
                      </>
                    )}
                  </button>
                </motion.form>
              )}

              {authStep === "success" && (
                <motion.div 
                  key="success"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
                  className="flex flex-col items-center text-center gap-6 py-6"
                >
                  <div className="h-12 w-12 rounded-full border border-border-main bg-bg-card flex items-center justify-center text-txt-main animate-pulse">
                    <FolderGit size={20} />
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <h2 className="font-display text-xl font-semibold text-txt-main tracking-tight">
                      Desk Linked Successfully
                    </h2>
                    <p className="text-xs text-txt-sub max-w-xs leading-relaxed">
                      Welcome to your developer dashboard. We are setting up your project vault.
                    </p>
                  </div>

                  <button 
                    onClick={() => setAuthStep("idle")}
                    className="h-9 px-4 rounded border border-border-main hover:bg-bg-card text-txt-main font-medium text-xs transition-colors duration-150 focus:outline-none"
                  >
                    Reset Demo Console
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>

      </main>

      {/* 3. Footer (Simple, minimal text info) */}
      <footer className="h-16 flex items-center justify-between px-6 md:px-12 border-t border-border-main bg-bg-surface text-txt-muted text-xs transition-colors duration-150">
        <div>
          © 2026 LynDesk Inc. All rights reserved.
        </div>
        <div className="flex gap-4">
          <a href="#" className="hover:text-txt-main transition-colors">Privacy</a>
          <a href="#" className="hover:text-txt-main transition-colors">Terms</a>
          <a href="#" className="hover:text-txt-main transition-colors font-mono uppercase tracking-wider text-[10px]">v0.1.0</a>
        </div>
      </footer>

    </div>
  );
}
