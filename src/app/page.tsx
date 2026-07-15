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
  Globe, 
  FolderGit, 
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
    setTimeout(() => {
      setLoading(false);
      setAuthStep("success");
    }, 1200);
  };

  return (
    <div className="h-screen overflow-hidden flex flex-col font-sans selection:bg-accent-main selection:text-bg-base">
      
      {/* 1. Header (Sticky, Frosted Glass, Swiss Grid Style) */}
      <header className="sticky top-0 z-50 h-16 flex items-center justify-between px-6 md:px-12 bg-bg-surface/80 backdrop-blur-md border-b border-border-main/60 transition-colors duration-150 flex-shrink-0">
        <div className="flex items-center gap-3">
          <span className="font-display text-base font-semibold tracking-[0.25em] text-txt-main">
            LYNDESK
          </span>
          <span className="text-[9px] font-mono tracking-widest text-txt-muted uppercase border border-border-main/80 px-2 py-0.5 rounded bg-bg-card">
            v0.1.0-alpha
          </span>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={toggleTheme}
            className="p-2 rounded-full border border-border-main/80 hover:bg-bg-card text-txt-main transition-colors duration-150 focus:outline-none focus:ring-1 focus:ring-ring-main"
            aria-label="Toggle Theme"
          >
            {theme === "light" ? <Moon size={14} /> : <Sun size={14} />}
          </button>
        </div>
      </header>

      {/* 2. Asymmetric Grid Layout (Locked Viewport, Internal Scroll on Mobile) */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 md:px-12 py-6 lg:py-12 overflow-y-auto lg:overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center">
        
        {/* Left Column: Premium Typographic Layout */}
        <section className="lg:col-span-7 flex flex-col items-start gap-12 lg:pr-8">
          <div className="flex flex-col gap-4">
            <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-txt-muted font-semibold">
              Link Your Next Desk
            </span>
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-light tracking-[-0.03em] text-txt-main leading-[1.08]">
              The space where technical projects <span className="font-normal border-b border-txt-main/30">take shape.</span>
            </h1>
          </div>
          
          <p className="text-txt-sub text-base md:text-lg leading-relaxed max-w-xl font-light">
            An index for student hackathons, team workspaces, and academic credit coordination. 
            No noise, no vanity metrics. Just a vault to organize your code, files, and milestones.
          </p>

          {/* Detailed Feature Cards (Swiss Design Principles: Clean alignment, fine borders, heavy copy) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full pt-8 border-t border-border-main/60">
            
            <div className="flex flex-col gap-3">
              <div className="h-9 w-9 rounded-sm border border-border-main/80 bg-bg-surface flex items-center justify-center text-txt-main">
                <Link2 size={15} className="stroke-[1.5]" />
              </div>
              <h3 className="font-display text-sm font-semibold tracking-tight text-txt-main">The Registry</h3>
              <p className="text-xs text-txt-muted leading-relaxed font-light">
                Paste any event link. The parser organizes deadlines, stage timelines, and guidelines into your personal vault.
              </p>
            </div>
            
            <div className="flex flex-col gap-3">
              <div className="h-9 w-9 rounded-sm border border-border-main/80 bg-bg-surface flex items-center justify-center text-txt-main">
                <Users size={15} className="stroke-[1.5]" />
              </div>
              <h3 className="font-display text-sm font-semibold tracking-tight text-txt-main">Workspace Decks</h3>
              <p className="text-xs text-txt-muted leading-relaxed font-light">
                A shared portal mapping your active slide deck, code repositories, team discussions, and voice channels.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <div className="h-9 w-9 rounded-sm border border-border-main/80 bg-bg-surface flex items-center justify-center text-txt-main">
                <Award size={15} className="stroke-[1.5]" />
              </div>
              <h3 className="font-display text-sm font-semibold tracking-tight text-txt-main">Campus Credits</h3>
              <p className="text-xs text-txt-muted leading-relaxed font-light">
                Export certified summaries of project completions directly to department coordinators for academic validation.
              </p>
            </div>

          </div>
        </section>

        {/* Right Column: Secure Portal Terminal Card */}
        <section className="lg:col-span-5 w-full flex justify-center lg:sticky lg:top-28">
          <div className="w-full max-w-md border border-border-main/70 bg-bg-surface p-8 rounded-lg shadow-[0_4px_24px_rgba(0,0,0,0.02)] transition-shadow duration-300">
            <AnimatePresence mode="wait">
              {authStep === "idle" && (
                <motion.div 
                  key="idle"
                  initial={{ opacity: 0, y: 3 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -3 }}
                  transition={{ duration: 0.12, ease: [0.16, 1, 0.3, 1] }}
                  className="flex flex-col gap-6"
                >
                  <div className="flex flex-col gap-1.5">
                    <h2 className="font-display text-lg font-semibold tracking-tight text-txt-main">
                      Authenticate Credentials
                    </h2>
                    <p className="text-xs text-txt-muted font-light">
                      Establish a secure session to access your workspaces.
                    </p>
                  </div>

                  <button 
                    onClick={() => setAuthStep("login")}
                    className="w-full h-11 rounded-sm border border-border-main/80 hover:bg-bg-card text-txt-main font-medium text-xs tracking-wider uppercase flex items-center justify-center gap-2.5 transition-colors duration-150 focus:outline-none focus:ring-1 focus:ring-ring-main cursor-pointer"
                  >
                    <Mail size={14} className="stroke-[1.5]" />
                    Email Credentials
                  </button>

                  <div className="relative flex py-1 items-center">
                    <div className="flex-grow border-t border-border-main/60"></div>
                    <span className="flex-shrink mx-3 text-[9px] font-mono tracking-widest text-txt-muted uppercase">or</span>
                    <div className="flex-grow border-t border-border-main/60"></div>
                  </div>

                  <button 
                    onClick={() => {
                      setLoading(true);
                      setTimeout(() => {
                        setLoading(false);
                        setAuthStep("success");
                      }, 1200);
                    }}
                    className="w-full h-11 rounded-sm bg-accent-main hover:opacity-90 text-bg-base font-medium text-xs tracking-wider uppercase flex items-center justify-center gap-2.5 transition-opacity duration-150 focus:outline-none focus:ring-1 focus:ring-ring-main cursor-pointer"
                  >
                    <Globe size={14} className="stroke-[1.5]" />
                    Institutional Google Sign-In
                  </button>

                  <p className="text-[10px] text-center text-txt-muted leading-relaxed font-light">
                    Using an approved university email automatically routes you into your local campus network.
                  </p>
                </motion.div>
              )}

              {authStep === "login" && (
                <motion.form 
                  key="login"
                  onSubmit={handleLogin}
                  initial={{ opacity: 0, y: 3 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -3 }}
                  transition={{ duration: 0.12, ease: [0.16, 1, 0.3, 1] }}
                  className="flex flex-col gap-5"
                >
                  <div className="flex flex-col gap-1">
                    <button 
                      type="button"
                      onClick={() => setAuthStep("idle")}
                      className="text-[10px] text-txt-muted hover:text-txt-main self-start transition-colors duration-150 font-mono tracking-widest uppercase"
                    >
                      ← Back
                    </button>
                    <h2 className="font-display text-lg font-semibold tracking-tight text-txt-main mt-2">
                      Secure Input
                    </h2>
                  </div>

                  <div className="flex flex-col gap-3.5">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs text-txt-sub font-medium">Domain Email Address</label>
                      <input 
                        type="email" 
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="username@university.edu"
                        className="h-10 px-3 border border-border-main/80 bg-bg-base text-txt-main rounded-sm text-sm placeholder:text-txt-muted/50 focus:outline-none focus:border-txt-main focus:ring-1 focus:ring-ring-main transition-colors duration-150 font-light"
                      />
                    </div>
                    
                    <div className="flex flex-col gap-1">
                      <div className="flex justify-between items-center">
                        <label className="text-xs text-txt-sub font-medium">Password</label>
                        <a href="#" className="text-[10px] text-txt-muted hover:text-txt-main transition-colors font-light">Forgot?</a>
                      </div>
                      <input 
                        type="password" 
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="h-10 px-3 border border-border-main/80 bg-bg-base text-txt-main rounded-sm text-sm placeholder:text-txt-muted/50 focus:outline-none focus:border-txt-main focus:ring-1 focus:ring-ring-main transition-colors duration-150"
                      />
                    </div>
                  </div>

                  <button 
                    type="submit"
                    disabled={loading}
                    className="w-full h-11 rounded-sm bg-accent-main hover:opacity-90 disabled:opacity-50 text-bg-base font-medium text-xs tracking-wider uppercase flex items-center justify-center gap-2 transition-opacity duration-150 focus:outline-none focus:ring-1 focus:ring-ring-main cursor-pointer"
                  >
                    {loading ? (
                      <span className="h-4 w-4 rounded-full border border-bg-base/30 border-t-bg-base animate-spin" />
                    ) : (
                      <>
                        Authenticate Session
                        <ArrowRight size={14} />
                      </>
                    )}
                  </button>
                </motion.form>
              )}

              {authStep === "success" && (
                <motion.div 
                  key="success"
                  initial={{ opacity: 0, y: 3 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -3 }}
                  transition={{ duration: 0.12, ease: [0.16, 1, 0.3, 1] }}
                  className="flex flex-col items-center text-center gap-6 py-6"
                >
                  <div className="h-12 w-12 rounded-full border border-border-main/80 bg-bg-card flex items-center justify-center text-txt-main animate-pulse">
                    <FolderGit size={18} className="stroke-[1.5]" />
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <h2 className="font-display text-lg font-semibold tracking-tight text-txt-main">
                      Desk Initialized
                    </h2>
                    <p className="text-xs text-txt-sub max-w-xs leading-relaxed font-light">
                      Verification complete. Accessing your workspaces and project timelines.
                    </p>
                  </div>

                  <button 
                    onClick={() => setAuthStep("idle")}
                    className="h-9 px-4 rounded-sm border border-border-main/80 hover:bg-bg-card text-txt-main font-medium text-[10px] tracking-wider uppercase transition-colors duration-150 focus:outline-none cursor-pointer"
                  >
                    Reset Console
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>

      </main>

      {/* 3. Footer (Simple, minimal metadata alignment) */}
      <footer className="h-16 flex items-center justify-between px-6 md:px-12 border-t border-border-main/60 bg-bg-surface text-txt-muted text-[10px] font-mono tracking-wider transition-colors duration-150 flex-shrink-0">
        <div>
          © 2026 LYNDESK NETWORK INC.
        </div>
        <div className="flex gap-6 uppercase">
          <a href="#" className="hover:text-txt-main transition-colors">Privacy</a>
          <a href="#" className="hover:text-txt-main transition-colors">Terms</a>
          <a href="#" className="text-txt-muted">LDK:SYS</a>
        </div>
      </footer>

    </div>
  );
}
