"use client";

import React, { useState, useEffect } from "react";
import { useTheme } from "./components/ThemeProvider";
import { useAuth } from "./context/AuthContext";
import { supabase } from "./lib/supabase";
import LynDeskLogo from "./components/LynDeskLogo";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sun, 
  Moon, 
  Link2, 
  Users, 
  Award, 
  ArrowRight, 
  Globe, 
  Mail,
  Plus,
  LogOut,
  MapPin,
  ExternalLink,
  X,
  CheckCircle2,
  FolderGit
} from "lucide-react";

// Brand Icon Helpers
const DiscordIcon = ({ size = 14 }: { size?: number }) => (
  <svg viewBox="0 0 127.14 96.36" width={size} height={size} fill="currentColor">
    <path d="M107.7,8.07A105.15,105.15,0,0,0,77.26,0a77.19,77.19,0,0,0-3.3,6.83A96.67,96.67,0,0,0,53.22,6.83,77.19,77.19,0,0,0,49.88,0,105.15,105.15,0,0,0,19.44,8.07C3.66,31.58-1.86,54.65,1,77.53A105.73,105.73,0,0,0,32,96.36a77.7,77.7,0,0,0,6.63-10.85,68.43,68.43,0,0,1-10.5-5c.9-.65,1.76-1.34,2.58-2a75.58,75.58,0,0,0,73.08,0c.83.71,1.69,1.4,2.59,2a68.61,68.61,0,0,1-10.5,5,77.45,77.45,0,0,0,6.63,10.85,105.73,105.73,0,0,0,31.58-18.83C129.24,49.07,122.86,26.32,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53S36.18,40.36,42.45,40.36,53.83,46,53.83,53,48.72,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.24,60,73.24,53S78.41,40.36,84.69,40.36,96.07,46,96.07,53,91,65.69,84.69,65.69Z" />
  </svg>
);

const GithubIcon = ({ size = 14 }: { size?: number }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
  </svg>
);

const LinkedinIcon = ({ size = 14 }: { size?: number }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

interface EventItem {
  id: string;
  title: string;
  deadline: string;
  location: "online" | "in_person" | "hybrid";
  level: "local" | "national" | "global";
  url: string;
  status: "ideation" | "development" | "testing" | "submitted";
  stages: string[];
}

// Mock Timelines for initial state
const INITIAL_EVENTS: EventItem[] = [
  {
    id: "e1",
    title: "MIT HackHarvard 2026",
    deadline: "Oct 12, 2026",
    location: "hybrid",
    level: "global",
    url: "https://hackharvard.org",
    status: "development",
    stages: ["Ideation", "Build", "Review", "Submitted"]
  },
  {
    id: "e2",
    title: "Google Developer Hackathon",
    deadline: "Nov 02, 2026",
    location: "online",
    level: "national",
    url: "https://build.google.com",
    status: "ideation",
    stages: ["Concept", "Prototype Selection", "Final Presentation"]
  }
];

export default function Home() {
  const { theme, toggleTheme } = useTheme();
  const { user, loading: authLoading, signOut } = useAuth();
  const [authStep, setAuthStep] = useState<"idle" | "login" | "signup" | "success">("idle");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Dashboard & Scraper States
  const [events, setEvents] = useState<EventItem[]>(INITIAL_EVENTS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [scraperUrl, setScraperUrl] = useState("");
  const [scraping, setScraping] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState("");
  const [newEventDeadline, setNewEventDeadline] = useState("");
  const [newEventLocation, setNewEventLocation] = useState<"online" | "in_person" | "hybrid">("online");

  useEffect(() => {
    if (user) {
      setAuthStep("success");
    } else {
      setAuthStep("idle");
    }
  }, [user]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setError("Registration successful. Check your email for verification.");
      setLoading(false);
    }
  };

  const handleOAuthLogin = async (provider: "google" | "github" | "discord" | "linkedin") => {
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: provider === "linkedin" ? "linkedin_oidc" : provider,
      options: {
        redirectTo: typeof window !== "undefined" ? window.location.origin : undefined,
      },
    });
    if (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  // Mock URL Scraper Logic
  const handleScrape = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scraperUrl) return;
    setScraping(true);
    
    // Simulate web scraping delay
    setTimeout(() => {
      setScraping(false);
      // Auto-populate based on parsed URL parts
      try {
        const urlObj = new URL(scraperUrl);
        const namePart = urlObj.hostname.replace("www.", "").split(".")[0];
        setNewEventTitle(`${namePart.charAt(0).toUpperCase() + namePart.slice(1)} Hackathon 2026`);
      } catch {
        setNewEventTitle("Scraped Hackathon Event");
      }
      setNewEventDeadline("Nov 24, 2026");
    }, 1500);
  };

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle || !newEventDeadline) return;

    const newObj = {
      id: `e_${Date.now()}`,
      title: newEventTitle,
      deadline: newEventDeadline,
      location: newEventLocation,
      level: "global" as const,
      url: scraperUrl || "https://lyndesk.com",
      status: "ideation" as const,
      stages: ["Ideation", "Development", "Final Submission"]
    };

    setEvents([newObj, ...events]);
    setIsModalOpen(false);
    setScraperUrl("");
    setNewEventTitle("");
    setNewEventDeadline("");
  };

  return (
    <div className="h-screen overflow-hidden flex flex-col font-sans selection:bg-accent-main selection:text-bg-base">
      
      {/* 1. Header (Frosted Glass, Swiss Grid Style) */}
      <header className="sticky top-0 z-50 h-16 flex items-center justify-between px-6 md:px-12 bg-bg-surface/80 backdrop-blur-md border-b border-border-main/60 transition-colors duration-150 flex-shrink-0">
        <div className="flex items-center gap-2">
          <img 
            src="/lyndesk-logo.jpg" 
            alt="LynDesk Logo" 
            className="w-5 h-5 mr-1 object-contain rounded-full border border-border-main/60 filter grayscale dark:invert"
          />
          <span className="font-display text-base font-semibold tracking-[0.25em] text-txt-main">
            LYNDESK
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
          
          {user && (
            <button 
              onClick={signOut}
              className="p-2 rounded-full border border-border-main/80 hover:bg-bg-card text-txt-main transition-colors duration-150 focus:outline-none"
              title="Sign Out"
            >
              <LogOut size={14} />
            </button>
          )}
        </div>
      </header>

      {/* Conditional Layout: Landing VS. Dashboard */}
      {!user ? (
        /* ==================== LANDING PANEL ==================== */
        <main className="flex-1 max-w-7xl w-full mx-auto px-6 md:px-12 py-6 lg:py-12 overflow-y-auto lg:overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center">
          
          {/* Left Column: Typographic layout */}
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

          {/* Right Column: Portal Terminal Auth Card */}
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

                    {error && (
                      <div className="text-xs text-txt-muted bg-bg-card border border-border-main/60 p-2.5 rounded-sm font-mono tracking-tight text-center">
                        {error}
                      </div>
                    )}

                    <button 
                      onClick={() => {
                        setError(null);
                        setAuthStep("login");
                      }}
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
                      onClick={() => handleOAuthLogin("google")}
                      disabled={loading}
                      className="w-full h-11 rounded-sm bg-accent-main hover:opacity-90 disabled:opacity-50 text-bg-base font-medium text-xs tracking-wider uppercase flex items-center justify-center gap-2.5 transition-opacity duration-150 focus:outline-none focus:ring-1 focus:ring-ring-main cursor-pointer"
                    >
                      {loading ? (
                        <span className="h-4 w-4 rounded-full border border-bg-base/30 border-t-bg-base animate-spin" />
                      ) : (
                        <>
                          <Globe size={14} className="stroke-[1.5]" />
                          Institutional Google Sign-In
                        </>
                      )}
                    </button>

                    <div className="flex gap-3 items-center w-full">
                      <button 
                        onClick={() => handleOAuthLogin("github")}
                        disabled={loading}
                        className="flex-1 h-11 rounded-sm border border-border-main/80 hover:bg-bg-card text-txt-main flex items-center justify-center gap-2 transition-colors duration-150 focus:outline-none focus:ring-1 focus:ring-ring-main cursor-pointer"
                        title="Authenticate via GitHub"
                      >
                        <GithubIcon size={14} />
                        <span className="text-[10px] font-mono tracking-widest uppercase">Git</span>
                      </button>

                      <button 
                        onClick={() => handleOAuthLogin("discord")}
                        disabled={loading}
                        className="flex-1 h-11 rounded-sm border border-border-main/80 hover:bg-bg-card text-txt-main flex items-center justify-center gap-2 transition-colors duration-150 focus:outline-none focus:ring-1 focus:ring-ring-main cursor-pointer"
                        title="Authenticate via Discord"
                      >
                        <DiscordIcon size={14} />
                        <span className="text-[10px] font-mono tracking-widest uppercase">Discord</span>
                      </button>

                      <button 
                        onClick={() => handleOAuthLogin("linkedin")}
                        disabled={loading}
                        className="flex-1 h-11 rounded-sm border border-border-main/80 hover:bg-bg-card text-txt-main flex items-center justify-center gap-2 transition-colors duration-150 focus:outline-none focus:ring-1 focus:ring-ring-main cursor-pointer"
                        title="Authenticate via LinkedIn"
                      >
                        <LinkedinIcon size={14} />
                        <span className="text-[10px] font-mono tracking-widest uppercase">In</span>
                      </button>
                    </div>

                    <p className="text-[10px] text-center text-txt-muted leading-relaxed font-light mt-1">
                      Using Google Auth automatically routes you into your local campus network.
                    </p>
                  </motion.div>
                )}

                {(authStep === "login" || authStep === "signup") && (
                  <motion.form 
                    key={authStep}
                    onSubmit={authStep === "login" ? handleLogin : handleSignUp}
                    initial={{ opacity: 0, y: 3 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -3 }}
                    transition={{ duration: 0.12, ease: [0.16, 1, 0.3, 1] }}
                    className="flex flex-col gap-5"
                  >
                    <div className="flex flex-col gap-1">
                      <button 
                        type="button"
                        onClick={() => {
                          setError(null);
                          setAuthStep("idle");
                        }}
                        className="text-[10px] text-txt-muted hover:text-txt-main self-start transition-colors duration-150 font-mono tracking-widest uppercase"
                      >
                        ← Back
                      </button>
                      <h2 className="font-display text-lg font-semibold tracking-tight text-txt-main mt-2">
                        {authStep === "login" ? "Secure Sign In" : "Create Account"}
                      </h2>
                    </div>

                    {error && (
                      <div className="text-xs text-txt-muted bg-bg-card border border-border-main/60 p-2.5 rounded-sm font-mono tracking-tight">
                        {error}
                      </div>
                    )}

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
                          {authStep === "login" && (
                            <a href="#" className="text-[10px] text-txt-muted hover:text-txt-main transition-colors font-light">Forgot?</a>
                          )}
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
                          {authStep === "login" ? "Authenticate Session" : "Initialize Registration"}
                          <ArrowRight size={14} />
                        </>
                      )}
                    </button>

                    <div className="text-center">
                      <button
                        type="button"
                        onClick={() => {
                          setError(null);
                          setAuthStep(authStep === "login" ? "signup" : "login");
                        }}
                        className="text-xs text-txt-muted hover:text-txt-main transition-colors font-light underline"
                      >
                        {authStep === "login" ? "Need a new desk? Create an account" : "Already registered? Sign in"}
                      </button>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </section>
        </main>
      ) : (
        /* ==================== DASHBOARD PANEL ==================== */
        <main className="flex-1 max-w-7xl w-full mx-auto px-6 md:px-12 py-6 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* A. Left Sidebar: Profile & Campus Credits (3 Columns) */}
          <section className="lg:col-span-3 flex flex-col gap-6">
            
            {/* User profile Summary */}
            <div className="border border-border-main/70 bg-bg-surface p-5 rounded-md flex flex-col gap-3">
              <span className="font-mono text-[9px] uppercase tracking-widest text-txt-muted">Verified Session</span>
              <div className="flex items-center gap-3">
                <img 
                  src="/lyndesk-logo.jpg" 
                  alt="Profile" 
                  className="w-10 h-10 rounded-full border border-border-main/60 object-cover"
                />
                <div className="flex flex-col min-w-0">
                  <span className="text-xs text-txt-main font-mono truncate font-medium">{user.email}</span>
                  <span className="text-[10px] text-txt-muted font-light">Student Engineer</span>
                </div>
              </div>
            </div>

            {/* Academic Credits Tracker */}
            <div className="border border-border-main/70 bg-bg-surface p-5 rounded-md flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[9px] uppercase tracking-widest text-txt-muted">Academic Credits</span>
                <Award size={14} className="text-txt-main" />
              </div>
              <div className="flex flex-col gap-1.5">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-display font-light tracking-tight text-txt-main">32</span>
                  <span className="text-[10px] text-txt-muted uppercase tracking-wider font-mono">/ 100 Pts</span>
                </div>
                <div className="w-full h-1 bg-border-main/50 rounded-full overflow-hidden">
                  <div className="bg-accent-main h-full rounded-full" style={{ width: "32%" }} />
                </div>
                <p className="text-[10px] text-txt-muted font-light leading-relaxed">
                  3 completed projects verified by academic coordinators. 8 points pending.
                </p>
              </div>
            </div>

            {/* Teammates List */}
            <div className="border border-border-main/70 bg-bg-surface p-5 rounded-md flex flex-col gap-4">
              <span className="font-mono text-[9px] uppercase tracking-widest text-txt-muted">Active Co-Workers</span>
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-xs text-txt-main font-light">Alex Carter</span>
                  </div>
                  <span className="text-[8px] font-mono text-txt-muted uppercase tracking-wider">Dev</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-xs text-txt-main font-light">Mira Sen</span>
                  </div>
                  <span className="text-[8px] font-mono text-txt-muted uppercase tracking-wider">Designer</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-border-main" />
                    <span className="text-xs text-txt-muted font-light">Prof. Davis</span>
                  </div>
                  <span className="text-[8px] font-mono text-txt-muted uppercase tracking-wider">Mentor</span>
                </div>
              </div>
            </div>

          </section>

          {/* B. Center Panel: The Event Registry & Timelines (6 Columns) */}
          <section className="lg:col-span-6 flex flex-col gap-6">
            
            {/* Header + Add button */}
            <div className="flex items-center justify-between border-b border-border-main/50 pb-4">
              <div className="flex flex-col gap-0.5">
                <h2 className="font-display text-xl font-light text-txt-main">Event Registry</h2>
                <p className="text-[10px] text-txt-muted font-light">Tracked project desks and submission stages.</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="h-9 px-3.5 rounded-sm bg-accent-main hover:opacity-90 text-bg-base text-xs font-mono uppercase tracking-wider flex items-center gap-1.5 transition-opacity duration-150 cursor-pointer"
              >
                <Plus size={13} />
                Track Link
              </button>
            </div>

            {/* List of active events */}
            <div className="flex flex-col gap-5">
              {events.map((ev) => (
                <div 
                  key={ev.id}
                  className="border border-border-main/70 bg-bg-surface p-6 rounded-md flex flex-col gap-5 hover:shadow-[0_4px_16px_rgba(0,0,0,0.01)] transition-shadow duration-300"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex flex-col gap-1 min-w-0">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <h3 className="font-display text-base font-semibold text-txt-main truncate">{ev.title}</h3>
                        <span className="text-[9px] font-mono tracking-widest text-txt-muted uppercase border border-border-main/80 px-2 py-0.5 rounded bg-bg-card">
                          {ev.level}
                        </span>
                      </div>
                      <a 
                        href={ev.url} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-[10px] text-txt-muted hover:text-txt-main font-mono flex items-center gap-1 self-start transition-colors"
                      >
                        {ev.url}
                        <ExternalLink size={10} />
                      </a>
                    </div>

                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      <span className="text-[9px] font-mono tracking-wider uppercase text-txt-muted">Deadline</span>
                      <span className="text-xs text-txt-main font-medium">{ev.deadline}</span>
                    </div>
                  </div>

                  {/* Horizontal Stage Progress line */}
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center text-[9px] font-mono tracking-widest text-txt-muted uppercase">
                      <span>Timeline Stages</span>
                      <span className="text-txt-main font-bold">Active: {ev.status}</span>
                    </div>
                    
                    <div className="relative flex justify-between items-center py-2">
                      <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-border-main/50 -translate-y-1/2 z-0" />
                      <div 
                        className="absolute top-1/2 left-0 h-[2px] bg-accent-main -translate-y-1/2 z-0 transition-all duration-300"
                        style={{ width: ev.status === "ideation" ? "33%" : ev.status === "development" ? "66%" : "100%" }}
                      />
                      
                      {ev.stages.map((stg, idx) => (
                        <div key={idx} className="relative z-10 flex flex-col items-center gap-1.5">
                          <div className={`h-4 w-4 rounded-full border-2 bg-bg-surface flex items-center justify-center transition-colors duration-200 ${
                            idx === 0 || (idx === 1 && ev.status !== "ideation") || (idx === 2 && ev.status === "submitted")
                              ? "border-accent-main text-accent-main" 
                              : "border-border-main"
                          }`}>
                            {(idx === 0 || (idx === 1 && ev.status !== "ideation")) && <CheckCircle2 size={10} className="fill-accent-main text-bg-surface" />}
                          </div>
                          <span className="text-[9px] font-light text-txt-sub">{stg}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions row */}
                  <div className="flex items-center justify-between border-t border-border-main/40 pt-4 mt-1">
                    <div className="flex items-center gap-1 text-[10px] text-txt-muted">
                      <MapPin size={11} />
                      <span className="uppercase font-mono">{ev.location}</span>
                    </div>

                    <button className="h-8 px-4 rounded-sm border border-border-main/80 hover:bg-bg-card text-txt-main font-mono text-[10px] tracking-wider uppercase transition-colors duration-150 cursor-pointer">
                      Enter Workspace Deck →
                    </button>
                  </div>

                </div>
              ))}
            </div>

          </section>

          {/* C. Right Panel: Leaderboards & Approvals (3 Columns) */}
          <section className="lg:col-span-3 flex flex-col gap-6">
            
            {/* Campus Leaderboard */}
            <div className="border border-border-main/70 bg-bg-surface p-5 rounded-md flex flex-col gap-4">
              <span className="font-mono text-[9px] uppercase tracking-widest text-txt-muted">College Arena</span>
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-txt-main font-medium">1. Stanford University</span>
                  <span className="text-xs text-txt-muted font-mono">1,420 pts</span>
                </div>
                <div className="flex items-center justify-between border-b border-border-main/40 pb-2">
                  <span className="text-xs text-txt-main font-medium">2. MIT</span>
                  <span className="text-xs text-txt-muted font-mono">1,180 pts</span>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs text-txt-main font-bold">24. IIT Delhi</span>
                  <span className="text-xs text-txt-muted font-mono">310 pts</span>
                </div>
              </div>
            </div>

            {/* Coordinator Verifications Feed */}
            <div className="border border-border-main/70 bg-bg-surface p-5 rounded-md flex flex-col gap-4">
              <span className="font-mono text-[9px] uppercase tracking-widest text-txt-muted">Credit Approvals</span>
              <div className="flex flex-col gap-3.5">
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs text-txt-main font-medium">Concept Pitch Verified</span>
                  <span className="text-[10px] text-txt-muted font-light leading-relaxed">Approved by Coordinator Prof. Davis (+10 pts)</span>
                  <span className="text-[8px] font-mono text-txt-muted uppercase mt-0.5">12 Hours Ago</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs text-txt-main font-medium">GitHub Repository Synced</span>
                  <span className="text-[10px] text-txt-muted font-light leading-relaxed">Commit verification validated by LDK:BOT (+5 pts)</span>
                  <span className="text-[8px] font-mono text-txt-muted uppercase mt-0.5">2 Days Ago</span>
                </div>
              </div>
            </div>

          </section>

        </main>
      )}

      {/* 3. Footer */}
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

      {/* ==================== SCRAPER ADD MODAL ==================== */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            {/* Frosted Backing overlay */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-bg-primary/60 backdrop-blur-sm"
            />

            {/* Modal Box */}
            <motion.div 
              initial={{ opacity: 0, y: 8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-lg border border-border-main/80 bg-bg-surface p-6 rounded-md shadow-lg z-10 flex flex-col gap-5"
            >
              
              {/* Close Button */}
              <button 
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-bg-card text-txt-muted hover:text-txt-main transition-colors"
              >
                <X size={15} />
              </button>

              <div className="flex flex-col gap-1 border-b border-border-main/40 pb-3">
                <h3 className="font-display text-lg font-semibold text-txt-main">Track New Event Link</h3>
                <p className="text-xs text-txt-muted font-light">Paste hackathon URL to auto-extract timelines and stages.</p>
              </div>

              {/* Scraper Input */}
              <form onSubmit={handleScrape} className="flex gap-2 items-center">
                <input 
                  type="url"
                  required
                  placeholder="https://devpost.com/hackathon-name"
                  value={scraperUrl}
                  onChange={(e) => setScraperUrl(e.target.value)}
                  className="flex-1 h-10 px-3 border border-border-main/80 bg-bg-base text-txt-main rounded-sm text-sm placeholder:text-txt-muted/50 focus:outline-none focus:border-txt-main focus:ring-1 focus:ring-ring-main transition-colors font-light"
                />
                <button 
                  type="submit"
                  disabled={scraping}
                  className="h-10 px-4 rounded-sm bg-accent-main hover:opacity-90 disabled:opacity-50 text-bg-base text-xs font-mono uppercase tracking-wider transition-opacity cursor-pointer flex items-center justify-center"
                >
                  {scraping ? "Parsing..." : "Auto-Scrape"}
                </button>
              </form>

              {/* Manual Fields form */}
              <form onSubmit={handleAddEvent} className="flex flex-col gap-4 pt-2">
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-txt-sub font-medium">Event Title</label>
                  <input 
                    type="text"
                    required
                    placeholder="MIT HackHarvard 2026"
                    value={newEventTitle}
                    onChange={(e) => setNewEventTitle(e.target.value)}
                    className="h-10 px-3 border border-border-main/80 bg-bg-base text-txt-main rounded-sm text-sm placeholder:text-txt-muted/50 focus:outline-none focus:border-txt-main focus:ring-1 focus:ring-ring-main transition-colors font-light"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-txt-sub font-medium">Deadline Date</label>
                    <input 
                      type="text"
                      required
                      placeholder="Oct 12, 2026"
                      value={newEventDeadline}
                      onChange={(e) => setNewEventDeadline(e.target.value)}
                      className="h-10 px-3 border border-border-main/80 bg-bg-base text-txt-main rounded-sm text-sm placeholder:text-txt-muted/50 focus:outline-none focus:border-txt-main focus:ring-1 focus:ring-ring-main transition-colors font-light"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-txt-sub font-medium">Location</label>
                    <select
                      value={newEventLocation}
                      onChange={(e) => setNewEventLocation(e.target.value as any)}
                      className="h-10 px-3 border border-border-main/80 bg-bg-base text-txt-main rounded-sm text-sm focus:outline-none focus:border-txt-main focus:ring-1 focus:ring-ring-main transition-colors font-light"
                    >
                      <option value="online">Online</option>
                      <option value="in_person">In-Person</option>
                      <option value="hybrid">Hybrid</option>
                    </select>
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full h-11 rounded-sm bg-accent-main hover:opacity-90 text-bg-base font-medium text-xs tracking-wider uppercase flex items-center justify-center gap-2 mt-2 transition-opacity cursor-pointer"
                >
                  Create Project Vault
                  <ArrowRight size={14} />
                </button>
              </form>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
