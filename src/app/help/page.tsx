"use client";

import React, { useState } from "react";
import { useTheme } from "../components/ThemeProvider";
import { supabase } from "../lib/supabase";
import Link from "next/link";
import { Sun, Moon, ArrowLeft, Mail, MessageSquare } from "lucide-react";
import LynDeskLogo from "../components/LynDeskLogo";

export default function HelpCenter() {
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

  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const faqs = [
    {
      q: "How do I link my university email to join my campus portal?",
      a: "Simply sign out and authenticate using your official university email domain (e.g., student@university.edu) via Google or Email Credentials. LynDesk's database trigger automatically parses the domain and routes you into your local campus network."
    },
    {
      q: "What is the certified academic credit verification process?",
      a: "When your team completes a project round, click 'Claim Credits' in your event workspace. The platform bundles your GitHub commit hashes, slide deck versions, and team roles into a verification request sent directly to your department coordinator's panel for 1-click approval."
    },
    {
      q: "How does the offline-sync local cache operate?",
      a: "LynDesk caches your event timelines and active co-worker sheets locally in IndexedDB. If your internet connection is lost, you can still update tasks and write notes. All modifications are queued and played back once connection is re-established."
    },
    {
      q: "How do we sync our active GitHub repository?",
      a: "In Phase 4 (Workspace Decks), you can paste your public or private GitHub repository link in the Artifacts tab. Teams that authenticated using GitHub OAuth will automatically display their active commit logs directly in the workspace."
    }
  ];

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error: insertError } = await supabase
      .from("support_inquiries")
      .insert([{ email, subject, message }]);

    setLoading(false);
    if (insertError) {
      setError(insertError.message);
    } else {
      setSubmitted(true);
      setEmail("");
      setSubject("");
      setMessage("");
    }
  };

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
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 md:px-12 py-12 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        
        {/* Left Section: FAQ Accordion (7 Columns) */}
        <section className="lg:col-span-7 flex flex-col gap-8">
          
          <Link 
            href="/"
            className="flex items-center gap-2 text-xs text-txt-muted hover:text-txt-main self-start transition-colors font-mono tracking-wider uppercase text-[10px]"
          >
            <ArrowLeft size={13} />
            Back to Portal
          </Link>

          <div className="flex flex-col gap-2">
            <span className="font-mono text-[9px] uppercase tracking-widest text-txt-muted">Support Portal</span>
            <h1 className="font-display text-3xl font-light tracking-tight text-txt-main">Help & FAQ Center</h1>
            <p className="text-sm text-txt-sub font-light">Frequently asked technical queries and credit guidelines.</p>
          </div>

          <div className="flex flex-col border-t border-border-main/60">
            {faqs.map((faq, idx) => (
              <div key={idx} className="border-b border-border-main/60 py-4 flex flex-col gap-2">
                <button 
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                  className="w-full flex justify-between items-center text-left text-sm font-semibold text-txt-main hover:text-txt-sub transition-colors focus:outline-none"
                >
                  <span>{faq.q}</span>
                  <span className="font-mono text-txt-muted text-xs select-none">
                    {activeFaq === idx ? "[ − ]" : "[ + ]"}
                  </span>
                </button>
                {activeFaq === idx && (
                  <p className="text-xs text-txt-sub font-light leading-relaxed pt-1 pr-6">
                    {faq.a}
                  </p>
                )}
              </div>
            ))}
          </div>

        </section>

        {/* Right Section: Inquiry Submission Form (5 Columns) */}
        <section className="lg:col-span-5 w-full flex justify-center lg:sticky lg:top-28">
          <div className="w-full max-w-md border border-border-main/70 bg-bg-surface p-8 rounded-lg shadow-sm flex flex-col gap-6">
            
            <div className="flex flex-col gap-1 border-b border-border-main/40 pb-3">
              <h2 className="font-display text-lg font-semibold tracking-tight text-txt-main">
                Log Support Ticket
              </h2>
              <p className="text-xs text-txt-muted font-light">
                Submit an inquiry directly to the LynDesk developer support desk.
              </p>
            </div>

            {submitted ? (
              <div className="flex flex-col items-center text-center gap-5 py-6">
                <div className="h-10 w-10 rounded-full border border-border-main/80 bg-bg-card flex items-center justify-center text-txt-main">
                  <MessageSquare size={16} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-semibold text-txt-main font-mono">Inquiry Logged Successfully</span>
                  <p className="text-[11px] text-txt-sub leading-relaxed max-w-xs font-light">
                    A copy of your query has been dispatched. Our team will contact you shortly. Direct queries:
                    <span className="block font-mono text-txt-main font-semibold mt-1">shreecode.service@gmail.com</span>
                  </p>
                </div>
                <button 
                  onClick={() => setSubmitted(false)}
                  className="h-8 px-4 rounded-sm border border-border-main/80 hover:bg-bg-card text-txt-main font-mono text-[9px] tracking-wider uppercase transition-colors duration-150 focus:outline-none cursor-pointer"
                >
                  Log New Ticket
                </button>
              </div>
            ) : (
              <form onSubmit={handleInquirySubmit} className="flex flex-col gap-4">
                {error && (
                  <div className="text-xs text-txt-muted bg-bg-card border border-border-main/60 p-2.5 rounded-sm font-mono tracking-tight text-center">
                    {error}
                  </div>
                )}

                <div className="flex flex-col gap-1">
                  <label className="text-xs text-txt-sub font-medium">Your Email Address</label>
                  <input 
                    type="email" 
                    required
                    disabled={loading}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@university.edu"
                    className="h-10 px-3 border border-border-main/80 bg-bg-base text-txt-main rounded-sm text-xs placeholder:text-txt-muted/50 focus:outline-none focus:border-txt-main focus:ring-1 focus:ring-ring-main transition-colors font-light disabled:opacity-50"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs text-txt-sub font-medium">Inquiry Subject</label>
                  <input 
                    type="text" 
                    required
                    disabled={loading}
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g. Academic credit status error"
                    className="h-10 px-3 border border-border-main/80 bg-bg-base text-txt-main rounded-sm text-xs placeholder:text-txt-muted/50 focus:outline-none focus:border-txt-main focus:ring-1 focus:ring-ring-main transition-colors font-light disabled:opacity-50"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs text-txt-sub font-medium">Message Details</label>
                  <textarea 
                    required
                    rows={4}
                    disabled={loading}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Describe your issue or technical question..."
                    className="p-3 border border-border-main/80 bg-bg-base text-txt-main rounded-sm text-xs placeholder:text-txt-muted/50 focus:outline-none focus:border-txt-main focus:ring-1 focus:ring-ring-main transition-colors font-light resize-none disabled:opacity-50"
                  />
                </div>

                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 rounded-sm bg-accent-main hover:opacity-90 disabled:opacity-50 text-bg-base font-medium text-xs tracking-wider uppercase flex items-center justify-center gap-2 mt-2 transition-opacity cursor-pointer"
                >
                  {loading ? (
                    <span className="h-4 w-4 rounded-full border border-bg-base/30 border-t-bg-base animate-spin" />
                  ) : (
                    <>
                      <Mail size={14} className="stroke-[1.5]" />
                      Dispatch Inquiry
                    </>
                  )}
                </button>
              </form>
            )}

            <div className="text-[10px] text-center text-txt-muted font-light leading-relaxed">
              For direct administrative support or institutional partnerships, email:
              <a href="mailto:shreecode.service@gmail.com" className="block font-mono text-txt-main hover:underline mt-0.5">
                shreecode.service@gmail.com
              </a>
            </div>

          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="h-12 flex items-center justify-between px-6 md:px-12 border-t border-border-main/60 bg-bg-surface text-txt-muted text-[10px] font-mono tracking-wider transition-colors duration-150 flex-shrink-0">
        <div>© 2026 LYNDESK NETWORK INC.</div>
        <div className="flex gap-6 uppercase font-mono">
          <Link href="/privacy" className="hover:text-txt-main transition-colors">Privacy</Link>
          <Link href="/terms" className="hover:text-txt-main transition-colors">Terms</Link>
          <Link href="/help" className="text-txt-main">Help</Link>
          <span className="text-txt-muted select-none">LDK:SYS</span>
        </div>
      </footer>

    </div>
  );
}
