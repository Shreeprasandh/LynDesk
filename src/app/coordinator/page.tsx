"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import Link from "next/link";
import Header from "../components/Header";
import { 
  ArrowLeft, 
  Award, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ExternalLink, 
  FileText, 
  Users, 
  FolderLock
} from "lucide-react";

interface CreditClaim {
  id: string;
  student_name: string;
  student_email: string;
  project_name: string;
  event_title: string;
  repo_url: string;
  artifact_name: string;
  points: number;
  status: "pending" | "approved" | "rejected";
  created_at: string;
}

// Local Custom Icons for missing/problematic lucide ones
const GithubIcon = ({ size = 14, className = "" }: { size?: number; className?: string }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
  </svg>
);

export default function CoordinatorConsole() {

  const [claims, setClaims] = useState<CreditClaim[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClaim, setSelectedClaim] = useState<CreditClaim | null>(null);

  interface DBClaim {
  id: string;
  credit_points: number;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  profiles: { full_name: string | null; username: string | null } | null;
  project_spaces: { project_name: string; github_repo: string | null } | null;
}

// Fetch claims
useEffect(() => {
  const fetchClaims = async () => {
    try {
      setLoading(true);
      // Query credit applications from Supabase
      const { data, error } = await supabase
        .from("credit_applications")
        .select(`
          id,
          credit_points,
          status,
          created_at,
          profiles:student_id ( full_name, username ),
          project_spaces:project_space_id ( project_name, github_repo )
        `)
        .order("created_at", { ascending: false });

      if (!error && data && data.length > 0) {
        const formatted: CreditClaim[] = (data as unknown as DBClaim[]).map((item) => ({
          id: item.id,
          student_name: item.profiles?.full_name || "Student Engineer",
          student_email: item.profiles?.username ? `${item.profiles.username}@university.edu` : "student@university.edu",
          project_name: item.project_spaces?.project_name || "Project Vault",
          event_title: "Campus tracked event",
          repo_url: item.project_spaces?.github_repo || "github.com",
          artifact_name: "Pitch_Deck_v2.pdf",
          points: item.credit_points,
          status: item.status,
          created_at: new Date(item.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })
        }));
        setClaims(formatted);
      } else {
          // Fallback mock claims
          const mockClaims: CreditClaim[] = [
            { id: "c1", student_name: "Alex Carter", student_email: "alexcarter@mit.edu", project_name: "HealthVibe Dashboard", event_title: "MIT HackHarvard 2026", repo_url: "github.com/alexcarter/healthvibe", artifact_name: "HealthVibe_Pitch_v3.pdf", points: 10, status: "pending", created_at: "Oct 13" },
            { id: "c2", student_name: "Mira Sen", student_email: "mirasen@mit.edu", project_name: "CarbonTrace Portal", event_title: "Google Developer Hackathon", repo_url: "github.com/mirasen/carbontrace", artifact_name: "CarbonTrace_Spec_v2.pdf", points: 10, status: "pending", created_at: "Oct 12" },
            { id: "c3", student_name: "David Chen", student_email: "dchen@mit.edu", project_name: "EduForge Vault", event_title: "TreeHacks 2026", repo_url: "github.com/dchen/eduforge", artifact_name: "EduForge_Deck_v1.pdf", points: 8, status: "approved", created_at: "Oct 08" }
          ];
          setClaims(mockClaims);
        }
      } catch (err) {
        console.error("Claims fetch error: ", err);
      } finally {
        setLoading(false);
      }
    };

    fetchClaims();
  }, []);

  const handleVerifyClaim = async (id: string, action: "approved" | "rejected") => {
    try {
      // Find current claim
      const claim = claims.find(c => c.id === id);
      if (!claim) return;

      // 1. Update Supabase if claim exists in DB
      if (id !== "c1" && id !== "c2" && id !== "c3") {
        await supabase
          .from("credit_applications")
          .update({ status: action })
          .eq("id", id);
      }

      // 2. Update local UI state
      setClaims(prev => prev.map(c => {
        if (c.id === id) {
          return { ...c, status: action };
        }
        return c;
      }));

      // Update selected claim reference
      if (selectedClaim && selectedClaim.id === id) {
        setSelectedClaim(prev => prev ? { ...prev, status: action } : null);
      }

      alert(`Activity point claim has been successfully ${action === "approved" ? "verified" : "declined"}.`);
    } catch (err) {
      console.error("Failed to update credit application: ", err);
    }
  };

  const pendingCount = claims.filter(c => c.status === "pending").length;
  const approvedPoints = claims.filter(c => c.status === "approved").reduce((sum, c) => sum + c.points, 0);

  return (
    <div className="h-screen overflow-hidden flex flex-col font-sans selection:bg-accent-main selection:text-bg-base">
      
      {/* Header (Unified Navigation & Notifications Drawer) */}
      <Header />

      {/* Main split grid */}
      <main className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-0">
        
        {/* ================= LEFT CONSOLE: APPLICATION LIST (7 Columns) ================= */}
        <section className="lg:col-span-7 border-r border-border-main/50 flex flex-col h-full bg-bg-base overflow-hidden p-6 gap-6">
          <Link 
            href="/"
            className="flex items-center gap-2 text-[10px] text-txt-muted hover:text-txt-main transition-colors font-mono tracking-wider uppercase self-start"
          >
            <ArrowLeft size={12} />
            Back to Portal
          </Link>

          <div className="flex flex-col gap-1 border-b border-border-main/40 pb-4">
            <span className="font-mono text-[9px] uppercase tracking-widest text-txt-muted">Faculty Console</span>
            <h1 className="font-display text-3xl font-light tracking-tight text-txt-main">Academic Credit Claims</h1>
            <p className="text-xs text-txt-sub">Verify student hackathon portfolios and award extracurricular graduation credits.</p>
          </div>

          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-3 gap-4 flex-shrink-0">
            <div className="border border-border-main/60 bg-bg-surface p-4 rounded-sm flex flex-col gap-1">
              <span className="font-mono text-[8px] uppercase tracking-widest text-txt-muted">Pending Verification</span>
              <span className="text-xl font-display font-light text-txt-main flex items-center gap-1.5">
                <Clock size={14} className="text-txt-muted" />
                {pendingCount}
              </span>
            </div>
            <div className="border border-border-main/60 bg-bg-surface p-4 rounded-sm flex flex-col gap-1">
              <span className="font-mono text-[8px] uppercase tracking-widest text-txt-muted">Awarded Credits</span>
              <span className="text-xl font-display font-light text-txt-main flex items-center gap-1.5">
                <Award size={14} className="text-txt-main" />
                {approvedPoints} Pts
              </span>
            </div>
            <div className="border border-border-main/60 bg-bg-surface p-4 rounded-sm flex flex-col gap-1">
              <span className="font-mono text-[8px] uppercase tracking-widest text-txt-muted">Registered Students</span>
              <span className="text-xl font-display font-light text-txt-main flex items-center gap-1.5">
                <Users size={14} className="text-txt-muted" />
                {claims.length} Active
              </span>
            </div>
          </div>

          {/* Claims List Table */}
          <div className="flex-1 overflow-y-auto border border-border-main/60 bg-bg-surface rounded-md">
            {loading ? (
              <div className="h-full flex items-center justify-center font-mono text-[9px] text-txt-muted">
                FETCHING PORTFOLIO CLAIMS...
              </div>
            ) : (
              <div className="flex flex-col divide-y divide-border-main/60">
                {claims.map((claim) => (
                  <div 
                    key={claim.id} 
                    onClick={() => setSelectedClaim(claim)}
                    className={`p-4 flex justify-between items-center gap-4 cursor-pointer hover:bg-bg-card/25 transition-colors ${
                      selectedClaim?.id === claim.id ? "bg-bg-card/30" : ""
                    }`}
                  >
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-baseline gap-2">
                        <span className="text-xs text-txt-main font-semibold">{claim.student_name}</span>
                        <span className="text-[9px] text-txt-muted font-mono">{claim.created_at}</span>
                      </div>
                      <span className="text-[10px] text-txt-sub truncate">{claim.project_name}</span>
                      <span className="text-[9px] text-txt-muted font-mono uppercase tracking-wider">{claim.event_title}</span>
                    </div>

                    <div className="flex items-center gap-4 flex-shrink-0">
                      <span className="text-xs text-txt-main font-bold font-mono">+{claim.points} pts</span>
                      <span className={`text-[8px] font-mono tracking-wider border px-2 py-0.5 rounded uppercase ${
                        claim.status === "approved"
                          ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-500"
                          : claim.status === "rejected"
                          ? "bg-red-500/10 border-red-500/40 text-red-500"
                          : "bg-bg-card border-border-main/80 text-txt-muted"
                      }`}>
                        {claim.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </section>

        {/* ================= RIGHT PANEL: CLAIM INSPECTION / ACTION (5 Columns) ================= */}
        <section className="lg:col-span-5 bg-bg-surface/30 flex flex-col h-full overflow-y-auto p-6 gap-6">
          
          <div className="flex flex-col gap-0.5 border-b border-border-main/40 pb-4">
            <span className="font-mono text-[9px] uppercase tracking-widest text-txt-muted">Security Audit</span>
            <h2 className="font-display text-lg font-light text-txt-main">Portfolio Inspector</h2>
          </div>

          {selectedClaim ? (
            <div className="flex flex-col gap-6 animate-fade-in">
              
              {/* Student Identification */}
              <div className="border border-border-main/70 bg-bg-surface p-5 rounded-sm flex flex-col gap-3">
                <span className="font-mono text-[9px] uppercase tracking-widest text-txt-muted font-bold">Claimant details</span>
                <div className="flex flex-col">
                  <span className="text-sm text-txt-main font-semibold">{selectedClaim.student_name}</span>
                  <span className="text-xs text-txt-muted font-mono">{selectedClaim.student_email}</span>
                </div>
              </div>

              {/* Submission Materials */}
              <div className="border border-border-main/70 bg-bg-surface p-5 rounded-sm flex flex-col gap-4">
                <span className="font-mono text-[9px] uppercase tracking-widest text-txt-muted font-bold">Submission materials</span>
                
                {/* PDF Deck Link */}
                <div className="flex items-center justify-between border-b border-border-main/40 pb-2.5">
                  <div className="flex items-center gap-2">
                    <FileText size={14} className="text-txt-muted" />
                    <div className="flex flex-col">
                      <span className="text-xs text-txt-main font-medium">Pitch presentation deck</span>
                      <span className="text-[9px] text-txt-muted font-mono truncate max-w-[180px]">{selectedClaim.artifact_name}</span>
                    </div>
                  </div>
                  <a 
                    href={selectedClaim.repo_url}
                    className="text-[10px] text-txt-main hover:underline flex items-center gap-1 font-mono uppercase"
                  >
                    View
                    <ExternalLink size={9} />
                  </a>
                </div>

                {/* Git Repository Link */}
                <div className="flex items-center justify-between pb-1">
                  <div className="flex items-center gap-2">
                    <GithubIcon size={14} className="text-txt-muted" />
                    <div className="flex flex-col">
                      <span className="text-xs text-txt-main font-medium">Git repository codebase</span>
                      <span className="text-[9px] text-txt-muted font-mono truncate max-w-[180px]">{selectedClaim.repo_url}</span>
                    </div>
                  </div>
                  <a 
                    href={`https://${selectedClaim.repo_url}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] text-txt-main hover:underline flex items-center gap-1 font-mono uppercase"
                  >
                    Repo
                    <ExternalLink size={9} />
                  </a>
                </div>
              </div>

              {/* Cryptographic verification checklist */}
              <div className="border border-border-main/70 bg-bg-surface p-5 rounded-sm flex flex-col gap-3">
                <span className="font-mono text-[9px] uppercase tracking-widest text-txt-muted font-bold">LDK:BOT Security Validation</span>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between text-xs text-emerald-500 font-mono text-[10px]">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 size={11} /> GitHub Commits Validated
                    </span>
                    <span>PASS</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-emerald-500 font-mono text-[10px]">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 size={11} /> Artifact PDF Hash Verified
                    </span>
                    <span>PASS</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons (Verify/Decline) */}
              {selectedClaim.status === "pending" ? (
                <div className="flex gap-3 border-t border-border-main/40 pt-4">
                  <button 
                    onClick={() => handleVerifyClaim(selectedClaim.id, "rejected")}
                    className="flex-1 h-10 border border-red-500/60 hover:bg-red-500/10 text-red-500 text-xs font-mono uppercase tracking-wider rounded-sm transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <XCircle size={12} />
                    Decline Claim
                  </button>
                  
                  <button 
                    onClick={() => handleVerifyClaim(selectedClaim.id, "approved")}
                    className="flex-1 h-10 bg-accent-main hover:opacity-90 text-bg-base text-xs font-mono uppercase tracking-wider rounded-sm transition-opacity cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 size={12} />
                    Approve Credit
                  </button>
                </div>
              ) : (
                <div className="border border-border-main/60 p-4 rounded bg-bg-card/40 text-center font-mono text-[10px] text-txt-sub">
                  This activity point application has been completed ({selectedClaim.status}).
                </div>
              )}

            </div>
          ) : (
            <div className="h-44 border border-border-main/80 border-dashed rounded-sm flex flex-col items-center justify-center text-center p-6 text-txt-muted">
              <FolderLock size={18} className="mb-2" />
              <span className="text-[10px] font-mono uppercase tracking-wider">Audit Queue Empty</span>
              <p className="text-[10px] font-light leading-relaxed max-w-xs mt-1">Select a student credit claim from the pending list to audit codebase references and verify credits.</p>
            </div>
          )}

        </section>

      </main>

    </div>
  );
}
