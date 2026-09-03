"use client";

import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { 
  Building2, 
  ShieldCheck, 
  Search, 
  Download, 
  Lock, 
  LogOut, 
  Award, 
  Code, 
  Sparkles, 
  ChevronRight, 
  TrendingUp,
  CheckCircle2,
  Eye,
  EyeOff
} from "lucide-react";

interface Candidate {
  candidateId: string;
  department: string;
  academicYear: string;
  leetcodeSolved: number;
  codeforcesRating: number;
  codechefRating: number;
  isVerified: boolean;
  topSkills: string[];
  hackathonsWon: number;
}

export default function RecruiterConsole() {
  const [authorized, setAuthorized] = useState(false);
  const [activeCompany, setActiveCompany] = useState("");
  const [accessPin, setAccessPin] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loadingCandidates, setLoadingCandidates] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);

  // Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [deptFilter, setDeptFilter] = useState("all");
  const [yearFilter, setYearFilter] = useState("all");
  const [minLcFilter, setMinLcFilter] = useState(0);
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  const loadCandidates = async () => {
    setLoadingCandidates(true);
    try {
      const res = await fetch("/api/recruiter/talent");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.candidates)) {
          setCandidates(data.candidates);
          if (data.candidates.length > 0) {
            setSelectedCandidate(data.candidates[0]);
          }
        }
      }
    } catch {
      console.warn("Failed loading candidate roster.");
    } finally {
      setLoadingCandidates(false);
    }
  };

  // Check existing session
  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch("/api/recruiter/me");
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated && data.recruiter) {
            setAuthorized(true);
            setActiveCompany(data.recruiter.companyName);
            loadCandidates();
          }
        }
      } catch {}
    };
    checkSession();
  }, []);

  const handleVerifyPin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessPin) return;

    setIsVerifying(true);
    setAuthError(null);

    try {
      const res = await fetch("/api/recruiter/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin: accessPin.trim() })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setAuthorized(true);
        setActiveCompany(data.company.companyName);
        setAccessPin("");
        loadCandidates();
      } else {
        setAuthError(data.error || "Invalid or expired corporate access PIN.");
      }
    } catch {
      setAuthError("Network communication error. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/recruiter/logout", { method: "POST" });
    } catch {}
    setAuthorized(false);
    setActiveCompany("");
    setCandidates([]);
  };

  // Filter computation
  const filteredCandidates = candidates.filter(c => {
    const matchesSearch = 
      c.candidateId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.topSkills.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesDept = deptFilter === "all" || c.department === deptFilter;
    const matchesYear = yearFilter === "all" || c.academicYear === yearFilter;
    const matchesLc = minLcFilter === 0 || c.leetcodeSolved >= minLcFilter;
    const matchesVerified = !verifiedOnly || c.isVerified;

    return matchesSearch && matchesDept && matchesYear && matchesLc && matchesVerified;
  });

  const handleExportReport = async () => {
    try {
      const res = await fetch("/api/recruiter/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ candidates: filteredCandidates })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.csv) {
          const blob = new Blob([data.csv], { type: "text/csv;charset=utf-8;" });
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = data.fileName || "Lyndesk_Candidate_Report.csv";
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      }
    } catch (err) {
      console.warn("Export error:", err);
    }
  };

  // Metrics
  const totalTalent = candidates.length;
  const avgSolved = totalTalent > 0 ? Math.round(candidates.reduce((acc, c) => acc + c.leetcodeSolved, 0) / totalTalent) : 0;
  const verifiedCount = candidates.filter(c => c.isVerified).length;

  return (
    <div className="min-h-screen flex flex-col font-sans bg-bg-base text-txt-main">
      <Header />

      {!authorized ? (
        /* Secure PIN Lock Screen */
        <main className="flex-1 flex items-center justify-center p-6 bg-bg-base">
          <div className="max-w-md w-full border border-border-main/60 bg-bg-surface p-8 rounded-sm shadow-xl flex flex-col gap-6">
            <div className="h-12 w-12 rounded-sm bg-accent-main/10 text-accent-main flex items-center justify-center mx-auto border border-accent-main/30">
              <Building2 size={22} />
            </div>

            <div className="flex flex-col gap-1.5 text-center">
              <span className="font-mono text-[9px] uppercase tracking-widest text-txt-muted">Institutional Talent Gateway</span>
              <h1 className="font-display text-2xl font-light tracking-tight text-txt-main">Corporate Recruiter Desk</h1>
              <p className="text-xs text-txt-sub leading-relaxed">
                Enter your issued 6-digit corporate access PIN to inspect verified engineering benchmarks with Zero-PII privacy compliance.
              </p>
            </div>

            {authError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs rounded-sm font-mono leading-tight">
                {authError}
              </div>
            )}

            <form onSubmit={handleVerifyPin} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-mono uppercase text-txt-muted tracking-wider">
                  Corporate Access PIN
                </label>
                <div className="relative">
                  <input
                    type={showPin ? "text" : "password"}
                    maxLength={6}
                    value={accessPin}
                    onChange={(e) => setAccessPin(e.target.value)}
                    placeholder="••••••"
                    className="w-full h-11 bg-bg-base border border-border-main pl-10 pr-10 font-mono text-center tracking-[0.5em] text-lg text-txt-main placeholder:text-txt-muted/30 focus:border-accent-main focus:outline-none rounded-sm"
                    autoFocus
                  />
                  <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-txt-muted" />
                  <button
                    type="button"
                    onClick={() => setShowPin(!showPin)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-txt-muted hover:text-txt-main transition-colors p-0.5 cursor-pointer"
                    aria-label={showPin ? "Hide PIN" : "Show PIN"}
                  >
                    {showPin ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isVerifying || accessPin.length < 6}
                className="w-full h-10 bg-accent-main hover:opacity-90 disabled:opacity-40 text-bg-base text-xs font-mono uppercase font-bold tracking-wider rounded-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isVerifying ? (
                  <div className="w-4 h-4 border-2 border-bg-base border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    Authorize Corporate Gateway <ChevronRight size={14} />
                  </>
                )}
              </button>
            </form>

            <div className="border-t border-border-main/40 pt-4 flex flex-col gap-2">
              <span className="text-[10px] font-mono text-txt-muted uppercase tracking-wider">Demo Quick Access PINs:</span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setAccessPin("847291")}
                  className="p-2 border border-border-main/50 bg-bg-base/60 hover:bg-bg-base text-left rounded-sm text-[10px] font-mono transition-colors cursor-pointer"
                >
                  <strong className="text-txt-main block">Google India</strong>
                  <span className="text-txt-muted">PIN: 847291</span>
                </button>
                <button
                  onClick={() => setAccessPin("301984")}
                  className="p-2 border border-border-main/50 bg-bg-base/60 hover:bg-bg-base text-left rounded-sm text-[10px] font-mono transition-colors cursor-pointer"
                >
                  <strong className="text-txt-main block">Microsoft</strong>
                  <span className="text-txt-muted">PIN: 301984</span>
                </button>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 text-[10px] text-txt-muted font-mono">
              <ShieldCheck size={12} className="text-emerald-400" />
              <span>FERPA &amp; GDPR Zero-PII Compliant Gateway</span>
            </div>
          </div>
        </main>
      ) : (
        /* Recruiter Dashboard */
        <main className="flex-1 flex flex-col max-w-7xl w-full mx-auto p-4 sm:p-6 gap-6">
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-main/40 pb-4">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[9px] uppercase tracking-widest text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-sm">
                  Active Corporate Session
                </span>
                <span className="font-mono text-[9px] text-txt-muted">Zero-PII Mode</span>
              </div>
              <h1 className="font-display text-2xl sm:text-3xl font-light text-txt-main">
                {activeCompany} Placement Hub
              </h1>
              <p className="text-xs text-txt-sub">
                Explore platform-verified competitive solving benchmarks and engineering skills across the campus talent pool.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleExportReport}
                className="h-9 px-4 border border-border-main bg-bg-surface hover:bg-bg-surface/80 text-txt-main text-[11px] font-mono uppercase tracking-wider rounded-sm flex items-center gap-2 transition-all cursor-pointer"
              >
                <Download size={13} /> Export Candidates ({filteredCandidates.length})
              </button>
              <button
                onClick={handleLogout}
                className="h-9 px-3 border border-rose-500/40 text-rose-400 hover:bg-rose-500/10 text-[11px] font-mono uppercase tracking-wider rounded-sm flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <LogOut size={13} /> Exit
              </button>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 border border-border-main/60 bg-bg-surface rounded-sm flex items-center gap-3">
              <div className="h-10 w-10 rounded-sm bg-accent-main/10 text-accent-main flex items-center justify-center border border-accent-main/30 shrink-0">
                <Code size={18} />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-mono uppercase text-txt-muted">Consented Candidates</span>
                <span className="text-xl font-mono font-bold text-txt-main">{totalTalent}</span>
              </div>
            </div>

            <div className="p-4 border border-border-main/60 bg-bg-surface rounded-sm flex items-center gap-3">
              <div className="h-10 w-10 rounded-sm bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/30 shrink-0">
                <TrendingUp size={18} />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-mono uppercase text-txt-muted">Average Solved Problems</span>
                <span className="text-xl font-mono font-bold text-txt-main">{avgSolved}</span>
              </div>
            </div>

            <div className="p-4 border border-border-main/60 bg-bg-surface rounded-sm flex items-center gap-3">
              <div className="h-10 w-10 rounded-sm bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/30 shrink-0">
                <ShieldCheck size={18} />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-mono uppercase text-txt-muted">Platform Verified</span>
                <span className="text-xl font-mono font-bold text-txt-main">{verifiedCount}</span>
              </div>
            </div>
          </div>

          {/* Search & Filters */}
          <div className="p-4 border border-border-main/60 bg-bg-surface rounded-sm flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="relative w-full md:w-80">
              <input
                type="text"
                placeholder="Search candidates or skills..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-9 bg-bg-base border border-border-main pl-9 pr-3 text-xs text-txt-main placeholder:text-txt-muted focus:border-accent-main focus:outline-none rounded-sm font-sans"
              />
              <Search size={14} className="absolute left-3 top-2.5 text-txt-muted" />
            </div>

            <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
              <select
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                className="h-9 bg-bg-base border border-border-main px-3 text-xs text-txt-main focus:outline-none rounded-sm font-mono"
              >
                <option value="all">All Departments</option>
                <option value="Information Technology">IT</option>
                <option value="Computer Science and Engineering">CSE</option>
                <option value="Data Science & AI">AI / DS</option>
              </select>

              <select
                value={yearFilter}
                onChange={(e) => setYearFilter(e.target.value)}
                className="h-9 bg-bg-base border border-border-main px-3 text-xs text-txt-main focus:outline-none rounded-sm font-mono"
              >
                <option value="all">All Years</option>
                <option value="3rd Year">3rd Year (2027)</option>
                <option value="4th Year">4th Year (2026)</option>
              </select>

              <select
                value={minLcFilter}
                onChange={(e) => setMinLcFilter(Number(e.target.value))}
                className="h-9 bg-bg-base border border-border-main px-3 text-xs text-txt-main focus:outline-none rounded-sm font-mono"
              >
                <option value={0}>Min Solved (Any)</option>
                <option value={200}>200+ Solved</option>
                <option value={350}>350+ Solved</option>
                <option value={500}>500+ Solved</option>
              </select>

              <label className="flex items-center gap-1.5 text-xs text-txt-sub font-mono cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={verifiedOnly}
                  onChange={(e) => setVerifiedOnly(e.target.checked)}
                  className="rounded border-border-main text-accent-main focus:ring-0"
                />
                Verified Only
              </label>
            </div>
          </div>

          {/* Talent Matrix */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Candidate List (2 cols) */}
            <div className="lg:col-span-2 border border-border-main/60 bg-bg-surface rounded-sm overflow-hidden flex flex-col">
              <div className="p-3 border-b border-border-main/40 flex items-center justify-between font-mono text-[11px] text-txt-muted uppercase tracking-wider">
                <span>Matching Candidates ({filteredCandidates.length})</span>
                <span>Select for Benchmark Radar</span>
              </div>

              {loadingCandidates ? (
                <div className="p-12 text-center text-xs font-mono text-txt-muted flex flex-col items-center gap-2">
                  <div className="w-4 h-4 border-2 border-accent-main border-t-transparent rounded-full animate-spin" />
                  <span>Loading candidate benchmarks...</span>
                </div>
              ) : filteredCandidates.length === 0 ? (
                <div className="p-12 text-center text-xs font-mono text-txt-muted">
                  No candidates match the specified filter criteria.
                </div>
              ) : (
                <div className="divide-y divide-border-main/30 max-h-[520px] overflow-y-auto">
                  {filteredCandidates.map((c) => {
                    const isSelected = selectedCandidate?.candidateId === c.candidateId;
                    return (
                      <div
                        key={c.candidateId}
                        onClick={() => setSelectedCandidate(c)}
                        className={`p-4 transition-colors cursor-pointer flex items-center justify-between gap-4 ${
                          isSelected ? "bg-accent-main/10 border-l-2 border-l-accent-main" : "hover:bg-bg-base/50"
                        }`}
                      >
                        <div className="flex flex-col gap-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-txt-main">
                              {c.candidateId}
                            </span>
                            {c.isVerified && (
                              <span className="inline-flex items-center gap-1 text-[9px] font-mono text-emerald-400 border border-emerald-500/30 bg-emerald-500/10 px-1.5 py-0.2 rounded-sm">
                                <CheckCircle2 size={10} /> Verified
                              </span>
                            )}
                            <span className="text-[10px] font-mono text-txt-muted">
                              {c.department} · {c.academicYear}
                            </span>
                          </div>

                          <div className="flex flex-wrap gap-1.5 mt-1">
                            {c.topSkills.map((sk) => (
                              <span
                                key={sk}
                                className="text-[9px] font-mono text-txt-sub bg-bg-base px-1.5 py-0.5 border border-border-main/50 rounded-sm"
                              >
                                {sk}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center gap-4 shrink-0 text-right font-mono">
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-txt-main">{c.leetcodeSolved}</span>
                            <span className="text-[9px] text-txt-muted uppercase">Solved</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-accent-main">{c.codeforcesRating}</span>
                            <span className="text-[9px] text-txt-muted uppercase">CF Rating</span>
                          </div>
                          <ChevronRight size={14} className="text-txt-muted" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Candidate Benchmark Card (1 col) */}
            <div className="border border-border-main/60 bg-bg-surface p-5 rounded-sm flex flex-col gap-5">
              <div className="flex items-center justify-between border-b border-border-main/40 pb-3">
                <span className="font-mono text-[10px] uppercase tracking-wider text-txt-muted">Benchmark Profile</span>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-1.5 py-0.5 rounded-sm">
                  FERPA Protected
                </span>
              </div>

              {selectedCandidate ? (
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1">
                    <h3 className="font-display text-xl font-light text-txt-main">{selectedCandidate.candidateId}</h3>
                    <p className="text-xs text-txt-sub font-mono">
                      {selectedCandidate.department} ({selectedCandidate.academicYear})
                    </p>
                  </div>

                  {/* Benchmark Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 border border-border-main/50 bg-bg-base rounded-sm flex flex-col gap-1">
                      <span className="text-[9px] font-mono text-txt-muted uppercase">LeetCode Solved</span>
                      <span className="text-lg font-mono font-bold text-txt-main">{selectedCandidate.leetcodeSolved}</span>
                      <span className="text-[9px] text-emerald-400 font-mono">Top 5% Cohort</span>
                    </div>

                    <div className="p-3 border border-border-main/50 bg-bg-base rounded-sm flex flex-col gap-1">
                      <span className="text-[9px] font-mono text-txt-muted uppercase">Codeforces Rating</span>
                      <span className="text-lg font-mono font-bold text-accent-main">{selectedCandidate.codeforcesRating}</span>
                      <span className="text-[9px] text-txt-muted font-mono">Specialist Tier</span>
                    </div>

                    <div className="p-3 border border-border-main/50 bg-bg-base rounded-sm flex flex-col gap-1">
                      <span className="text-[9px] font-mono text-txt-muted uppercase">CodeChef Rating</span>
                      <span className="text-lg font-mono font-bold text-txt-main">{selectedCandidate.codechefRating}</span>
                      <span className="text-[9px] text-txt-muted font-mono">3-Star Division</span>
                    </div>

                    <div className="p-3 border border-border-main/50 bg-bg-base rounded-sm flex flex-col gap-1">
                      <span className="text-[9px] font-mono text-txt-muted uppercase">Hackathons Won</span>
                      <span className="text-lg font-mono font-bold text-purple-400">{selectedCandidate.hackathonsWon}</span>
                      <span className="text-[9px] text-txt-muted font-mono">Verified Podiums</span>
                    </div>
                  </div>

                  {/* Skills Radar */}
                  <div className="flex flex-col gap-2 border-t border-border-main/40 pt-3">
                    <span className="text-[10px] font-mono uppercase text-txt-muted tracking-wider flex items-center gap-1.5">
                      <Sparkles size={11} className="text-accent-main" /> Verified Skill Highlights
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedCandidate.topSkills.map((sk) => (
                        <span
                          key={sk}
                          className="px-2 py-1 bg-accent-main/10 text-accent-main border border-accent-main/30 text-[10px] font-mono rounded-sm"
                        >
                          {sk}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Institution Placement Note */}
                  <div className="p-3 border border-border-main/40 bg-bg-base/50 rounded-sm text-[11px] text-txt-sub leading-relaxed font-light flex items-start gap-2">
                    <Award size={14} className="text-amber-400 shrink-0 mt-0.5" />
                    <span>
                      To request interview scheduling or candidate contact unlocking, reach out to the campus Placement &amp; Training cell referencing <strong>{selectedCandidate.candidateId}</strong>.
                    </span>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center text-xs font-mono text-txt-muted">
                  Select a candidate from the talent list to view their benchmark card.
                </div>
              )}
            </div>
          </div>
        </main>
      )}

      <Footer />
    </div>
  );
}
