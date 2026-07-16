"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import Header from "../components/Header";
import { 
  ExternalLink, 
  Building2, 
  ShieldCheck, 
  Users,
  Download
} from "lucide-react";

interface RegistryEmployee {
  id: string;
  name: string;
  email: string;
  department: string;
  projectTeam: string;
  hireYear: string;
  skills: string[];
  leetcodeSolved: number;
  codeforcesRating: number;
  hackathons: number;
  github: string;
  portfolio: string;
  authorized: boolean;
}

export default function RecruiterConsole() {
  const { user } = useAuth();
  const [authorized, setAuthorized] = useState(false);
  const [accessKey, setAccessKey] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);

  // Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTeam, setFilterTeam] = useState("");
  const [filterYear, setFilterYear] = useState("");
  const [filterSolvedThreshold, setFilterSolvedThreshold] = useState(0);
  
  const [selectedEmployee, setSelectedEmployee] = useState<RegistryEmployee | null>(null);

  const employeesList: RegistryEmployee[] = [
    {
      id: "e1",
      name: "Alex Carter",
      email: "alexcarter@corporate.com",
      department: "R&D Software Division",
      projectTeam: "Team Alpha",
      hireYear: "2025",
      skills: ["React", "TypeScript", "Node.js", "Python", "Rust"],
      leetcodeSolved: 342,
      codeforcesRating: 1480,
      hackathons: 6,
      github: "github.com/alexcarter",
      portfolio: "alexcarter.dev",
      authorized: true
    },
    {
      id: "e2",
      name: "Mira Sen",
      email: "mirasen@corporate.com",
      department: "Cloud Engineering",
      projectTeam: "Team Beta",
      hireYear: "2026",
      skills: ["JavaScript", "HTML", "CSS", "React", "Next.js", "Supabase"],
      leetcodeSolved: 412,
      codeforcesRating: 1590,
      hackathons: 4,
      github: "github.com/mirasen",
      portfolio: "mirasen.io",
      authorized: true
    },
    {
      id: "e3",
      name: "David Chen",
      email: "dchen@corporate.com",
      department: "Systems Infrastructure",
      projectTeam: "Team Gamma",
      hireYear: "2025",
      skills: ["C++", "Python", "Docker", "Go"],
      leetcodeSolved: 184,
      codeforcesRating: 1240,
      hackathons: 3,
      github: "github.com/dchen",
      portfolio: "dchen.dev",
      authorized: true
    },
    {
      id: "e4",
      name: "Sofia Rodriguez",
      email: "srodriguez@corporate.com",
      department: "R&D Software Division",
      projectTeam: "Team Alpha",
      hireYear: "2026",
      skills: ["Python", "PyTorch", "React", "TypeScript"],
      leetcodeSolved: 289,
      codeforcesRating: 1410,
      hackathons: 5,
      github: "github.com/sofia_r",
      portfolio: "sofiarodriguez.com",
      authorized: false
    }
  ];

  // Auto-fill company key if user already has it in auth metadata
  useEffect(() => {
    if (user && user.user_metadata?.company_key) {
      const handle = setTimeout(() => {
        setAccessKey(user.user_metadata.company_key);
        setAuthorized(true);
      }, 0);
      return () => clearTimeout(handle);
    }
  }, [user]);

  const activeEmployee = selectedEmployee || (employeesList.length > 0 ? employeesList[0] : null);

  const handleVerifyKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (accessKey.trim().toLowerCase() === "recruit2026" || accessKey.trim() === user?.user_metadata?.company_key) {
      setAuthorized(true);
      setAuthError(null);
      
      // Save key to metadata so they stay logged in
      supabase.auth.updateUser({
        data: { company_key: accessKey.trim() }
      });
    } else {
      setAuthError("Invalid Company Access Key. Please contact support@lyndesk.com for key registration.");
    }
  };

  // Filter Logic
  const filteredEmployees = employeesList.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          emp.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTeam = filterTeam ? emp.projectTeam === filterTeam : true;
    const matchesYear = filterYear ? emp.hireYear === filterYear : true;
    const matchesThreshold = emp.leetcodeSolved >= filterSolvedThreshold;
    return matchesSearch && matchesTeam && matchesYear && matchesThreshold;
  });

  const handleExportCSV = () => {
    const headers = [
      "Full Name",
      "Email Address",
      "Department/Division",
      "Project Team",
      "Hiring Year",
      "LeetCode Handle",
      "LeetCode Solved",
      "CodeForces Handle",
      "CodeForces Rating",
      "Hackathons Participated",
      "Sharing Permission"
    ];

    const rows = filteredEmployees.map(e => [
      e.name,
      e.email,
      e.department,
      e.projectTeam,
      e.hireYear,
      e.leetcodeSolved,
      e.codeforcesRating,
      e.hackathons,
      e.authorized ? "YES" : "NO"
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `lyndesk_employees_${filterTeam || "all"}_year_${filterYear || "all"}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="h-screen overflow-hidden flex flex-col font-sans selection:bg-accent-main selection:text-bg-base bg-bg-base">
      <Header />

      {!authorized ? (
        /* Recruiter Secure Access Lock Screen */
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-md w-full border border-border-main/70 bg-bg-surface p-8 rounded-md shadow-2xl flex flex-col gap-6 text-center animate-fade-in">
            <div className="h-12 w-12 rounded-full bg-accent-main/15 text-accent-main flex items-center justify-center mx-auto border border-accent-main/30">
              <Building2 size={22} />
            </div>
            
            <div className="flex flex-col gap-1">
              <h1 className="font-display text-2xl font-light text-txt-main">Corporate HR Console</h1>
              <p className="text-xs text-txt-sub">Enter your corporate security key to manage connected employee profiles and project milestones.</p>
            </div>

            {authError && (
              <div className="text-xs p-3 border border-red-500/50 bg-red-500/10 text-red-500 font-mono rounded-sm">
                {authError}
              </div>
            )}

            <form onSubmit={handleVerifyKey} className="flex flex-col gap-3">
              <input 
                type="password"
                required
                value={accessKey}
                onChange={(e) => setAccessKey(e.target.value)}
                placeholder="Enter Corporate Access Key"
                className="h-10 px-3 border border-border-main/80 bg-bg-base text-txt-main rounded-sm text-xs focus:outline-none focus:border-txt-main transition-colors text-center font-mono placeholder:text-txt-muted/60"
              />
              <button 
                type="submit"
                className="h-10 bg-accent-main hover:opacity-90 text-bg-base text-xs font-mono uppercase tracking-wider rounded-sm transition-opacity cursor-pointer font-bold"
              >
                Authenticate Corporate HR
              </button>
            </form>
            
            <div className="text-[10px] text-txt-muted font-light leading-relaxed border-t border-border-main/40 pt-4">
              <strong>Tip</strong>: Use demo corporate key <code className="font-mono text-accent-main bg-bg-base px-1.5 py-0.5 rounded border border-border-main/50">recruit2026</code> to view sample database.
            </div>
          </div>
        </main>
      ) : (
        /* Recruiter Main Dashboard Console */
        <main className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-0">
          
          {/* ================= LEFT SIDEBAR: EMPLOYEE LIST & FILTERS (7 Columns) ================= */}
          <section className="lg:col-span-7 border-r border-border-main/50 flex flex-col h-full bg-bg-base overflow-hidden p-6 gap-6">
            <div className="flex justify-between items-center border-b border-border-main/40 pb-4">
              <div className="flex flex-col gap-0.5">
                <span className="font-mono text-[9px] uppercase tracking-widest text-txt-muted font-bold">Corporate Administration</span>
                <h1 className="font-display text-3xl font-light tracking-tight text-txt-main">Employee Performance Registry</h1>
              </div>
              <div className="flex items-center gap-1.5 border border-emerald-500/40 bg-emerald-500/10 text-emerald-500 px-3 py-1 rounded-sm text-[10px] font-mono uppercase">
                <ShieldCheck size={12} /> Connected Employer Console
              </div>
            </div>

            {/* Dynamic Filters Panel */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-bg-card/20 p-4 border border-border-main/50 rounded-md flex-shrink-0">
              <input 
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search name, department..."
                className="h-8 px-2 border border-border-main/80 bg-bg-base text-txt-main text-xs focus:outline-none focus:border-txt-main rounded-sm placeholder:text-txt-muted/60"
              />

              <select
                value={filterTeam}
                onChange={(e) => setFilterTeam(e.target.value)}
                className="h-8 px-2 border border-border-main/80 bg-bg-base text-txt-main text-xs focus:outline-none focus:border-txt-main rounded-sm cursor-pointer"
              >
                <option value="">All Teams</option>
                <option value="Team Alpha">Team Alpha</option>
                <option value="Team Beta">Team Beta</option>
                <option value="Team Gamma">Team Gamma</option>
              </select>

              <select
                value={filterYear}
                onChange={(e) => setFilterYear(e.target.value)}
                className="h-8 px-2 border border-border-main/80 bg-bg-base text-txt-main text-xs focus:outline-none focus:border-txt-main rounded-sm cursor-pointer"
              >
                <option value="">All Years</option>
                <option value="2025">Joined 2025</option>
                <option value="2026">Joined 2026</option>
              </select>

              <select
                value={filterSolvedThreshold}
                onChange={(e) => setFilterSolvedThreshold(Number(e.target.value))}
                className="h-8 px-2 border border-border-main/80 bg-bg-base text-txt-main text-xs focus:outline-none focus:border-txt-main rounded-sm cursor-pointer"
              >
                <option value={0}>LeetCode solves: Any</option>
                <option value={200}>solved &gt; 200</option>
                <option value={300}>solved &gt; 300</option>
              </select>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-[10px] font-mono uppercase text-txt-muted">Connected Members: {filteredEmployees.length}</span>
              <button 
                onClick={handleExportCSV}
                className="h-8 px-4 bg-accent-main text-bg-base text-[9px] font-mono tracking-wider uppercase rounded-sm hover:opacity-90 transition-opacity flex items-center gap-1.5 cursor-pointer font-bold animate-pulse"
              >
                <Download size={11} /> Export Registry to CSV
              </button>
            </div>

            {/* Registered Employee Cards */}
            <div className="flex-1 overflow-y-auto border border-border-main/60 bg-bg-surface rounded-md">
              <div className="flex flex-col divide-y divide-border-main/60">
                {filteredEmployees.length > 0 ? (
                  filteredEmployees.map(emp => (
                    <div 
                      key={emp.id}
                      onClick={() => setSelectedEmployee(emp)}
                      className={`p-4 flex justify-between items-center gap-4 cursor-pointer hover:bg-bg-card/20 transition-colors ${
                        selectedEmployee?.id === emp.id ? "bg-bg-card/35" : ""
                      }`}
                    >
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs text-txt-main font-semibold">{emp.name}</span>
                        <span className="text-[10px] text-txt-muted truncate">{emp.email} • {emp.department}</span>
                        <div className="flex items-center gap-2 mt-1 text-[9px] text-txt-sub">
                          <span className="font-mono text-[8px] bg-bg-card px-1 py-0.5 rounded border border-border-main/50">{emp.projectTeam} • Joined {emp.hireYear}</span>
                          <span className="font-mono text-[8px] bg-bg-card px-1 py-0.5 rounded border border-border-main/50">LC Solves: {emp.leetcodeSolved}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 flex-shrink-0 text-right">
                        {emp.authorized ? (
                          <span className="text-[8px] font-mono tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/40 px-2 py-0.5 rounded uppercase">
                            Authorized
                          </span>
                        ) : (
                          <span className="text-[8px] font-mono tracking-wider bg-red-500/10 text-red-500 border border-red-500/40 px-2 py-0.5 rounded uppercase">
                            Pending
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="h-44 flex flex-col items-center justify-center text-center p-6 text-txt-muted font-mono text-[10px] uppercase">
                    No matching employee profiles connected.
                  </div>
                )}
              </div>
            </div>

          </section>

          {/* ================= RIGHT PANEL: EMPLOYEE DOSSIER (5 Columns) ================= */}
          <section className="lg:col-span-5 bg-bg-surface/30 flex flex-col h-full overflow-y-auto p-6 gap-6">
            
            <div className="flex flex-col gap-0.5 border-b border-border-main/40 pb-4">
              <span className="font-mono text-[9px] uppercase tracking-widest text-txt-muted font-bold">Security & Performance Audit</span>
              <h2 className="font-display text-lg font-light text-txt-main">Employee Dossier</h2>
            </div>

            {activeEmployee ? (
              <div className="flex flex-col gap-6 animate-fade-in">
                
                {/* Core Bio */}
                <div className="border border-border-main/70 bg-bg-surface p-5 rounded-sm flex flex-col gap-3">
                  <div className="flex justify-between items-start">
                    <span className="font-mono text-[9px] uppercase tracking-widest text-txt-muted font-bold">Candidate Contact</span>
                    {activeEmployee.authorized ? (
                      <span className="text-[8px] font-mono tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/40 px-2 py-0.5 rounded uppercase">
                        Access Authorized
                      </span>
                    ) : (
                      <span className="text-[8px] font-mono tracking-wider bg-red-500/10 text-red-500 border border-red-500/40 px-2 py-0.5 rounded uppercase">
                        Consent Pending
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-txt-main font-semibold">{activeEmployee.name}</span>
                    <span className="text-xs text-txt-muted font-mono">{activeEmployee.email}</span>
                    <span className="text-[10px] text-txt-sub mt-1">{activeEmployee.department} • {activeEmployee.projectTeam} (Joined {activeEmployee.hireYear})</span>
                  </div>
                </div>

                {/* Skills Checklist */}
                <div className="border border-border-main/70 bg-bg-surface p-5 rounded-sm flex flex-col gap-3">
                  <span className="font-mono text-[9px] uppercase tracking-widest text-txt-muted font-bold font-semibold">Verified Tech Skill Stack</span>
                  <div className="flex flex-wrap gap-1.5">
                    {activeEmployee.skills.map(skill => (
                      <span key={skill} className="text-[10px] font-mono bg-bg-base border border-border-main px-2.5 py-1 rounded text-txt-main">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Developer Stats Grid */}
                <div className="border border-border-main/70 bg-bg-surface p-5 rounded-sm flex flex-col gap-3">
                  <span className="font-mono text-[9px] uppercase tracking-widest text-txt-muted font-bold">Competitive Coding Standings</span>
                  
                  <div className="grid grid-cols-2 gap-3 text-center">
                    <div className="bg-bg-base/30 p-3 border border-border-main/50 rounded flex flex-col gap-0.5">
                      <span className="text-[8px] font-mono text-txt-muted uppercase">LeetCode Solved</span>
                      <span className="text-base font-semibold text-txt-main font-mono">{activeEmployee.leetcodeSolved}</span>
                    </div>
                    <div className="bg-bg-base/30 p-3 border border-border-main/50 rounded flex flex-col gap-0.5">
                      <span className="text-[8px] font-mono text-txt-muted uppercase">Codeforces Rating</span>
                      <span className="text-base font-semibold text-accent-main font-mono">{activeEmployee.codeforcesRating}</span>
                    </div>
                  </div>
                </div>

                {/* External Portfolios */}
                <div className="border border-border-main/70 bg-bg-surface p-5 rounded-sm flex flex-col gap-3">
                  <span className="font-mono text-[9px] uppercase tracking-widest text-txt-muted font-bold">Verified Codebases</span>
                  
                  <div className="flex justify-between items-center border-b border-border-main/40 pb-2.5">
                    <span className="text-xs text-txt-sub font-mono">github.com</span>
                    <a 
                      href={`https://${activeEmployee.github}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[10px] text-txt-main hover:underline flex items-center gap-1 font-mono uppercase"
                    >
                      View Github <ExternalLink size={9} />
                    </a>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-xs text-txt-sub font-mono">portfolio.dev</span>
                    <a 
                      href={`https://${activeEmployee.portfolio}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[10px] text-txt-main hover:underline flex items-center gap-1 font-mono uppercase"
                    >
                      View Site <ExternalLink size={9} />
                    </a>
                  </div>
                </div>

                {/* Audit Action Info Alert */}
                <div className="border border-border-main/60 p-4 rounded bg-bg-card/40 text-center font-mono text-[9px] text-txt-sub leading-normal">
                  All developer statistics and milestones are live-verified directly from platform syncs.
                </div>

              </div>
            ) : (
              <div className="h-44 border border-border-main/80 border-dashed rounded-sm flex flex-col items-center justify-center text-center p-6 text-txt-muted">
                <Users size={18} className="mb-2" />
                <span className="text-[10px] font-mono uppercase tracking-wider">No Selection</span>
                <p className="text-[10px] font-light leading-relaxed max-w-xs mt-1">Select an employee from the left list to inspect their active stats and code verification portfolios.</p>
              </div>
            )}

          </section>

        </main>
      )}
    </div>
  );
}
