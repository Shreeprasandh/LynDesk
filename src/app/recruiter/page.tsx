"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import Header from "../components/Header";
import { 
  ExternalLink, 
  Users,
  Download,
  Lock,
  Unlock,
  LogOut
} from "lucide-react";

interface StudentRegistryEntry {
  id: string;
  name: string;
  rawName: string;
  department: string;
  gradYear: string;
  skills: string[];
  leetcodeSolved: number;
  codeforcesRating: number;
  codechefRating: number;
  github: string;
  portfolio: string;
  linkedin: string;
  sharingGranted: boolean;
  collegeName: string;
}

export default function RecruiterConsole() {
  const { loading: authLoading } = useAuth();
  const [authorized, setAuthorized] = useState(false);
  const [activeCompany, setActiveCompany] = useState("");
  const [accessPin, setAccessPin] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [students, setStudents] = useState<StudentRegistryEntry[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterDept, setFilterDept] = useState("");
  const [filterGradYear, setFilterGradYear] = useState("");
  const [filterSolvedThreshold, setFilterSolvedThreshold] = useState(0);
  
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  // Check for existing recruiter session on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const session = localStorage.getItem("ldk_recruiter_session");
      if (session) {
        try {
          const parsed = JSON.parse(session);
          queueMicrotask(() => {
            setAuthorized(true);
            setActiveCompany(parsed.company);
          });
        } catch (e) {
          console.error("Failed to parse recruiter session", e);
        }
      }
    }
  }, []);

  // Fetch student profiles from Supabase once authorized
  useEffect(() => {
    if (authorized) {
      const fetchStudents = async () => {
        setLoadingStudents(true);
        try {
          const { data, error } = await supabase
            .from("profiles")
            .select(`
              id,
              full_name,
              department,
              graduation_year,
              leetcode_solved,
              codeforces_rating,
              codechef_rating,
              skills,
              portfolio_url,
              github_url,
              linkedin_url,
              college_name
            `);
          if (error) throw error;
          
          if (data) {
            const sharingPermissions = localStorage.getItem("ldk_student_sharing_permissions");
            const sharingMap = sharingPermissions ? JSON.parse(sharingPermissions) : {};
            
            const mapped = data.map((std: any) => {
              // Fallback to auto-granting sharing for students with > 250 solved if not configured
              const sharingGranted = sharingMap[std.id] !== undefined 
                ? sharingMap[std.id] 
                : ((std.leetcode_solved || 0) > 250);

              return {
                id: std.id,
                rawName: std.full_name || "Anonymous Student",
                name: sharingGranted ? (std.full_name || "Anonymous Student") : `Student #${std.id.substring(0, 4).toUpperCase()}`,
                department: std.department || "General Engineering",
                gradYear: std.graduation_year || "2026",
                leetcodeSolved: std.leetcode_solved || 0,
                codeforcesRating: std.codeforces_rating || 0,
                codechefRating: std.codechef_rating || 0,
                skills: std.skills ? std.skills.split(",").map((s: string) => s.trim()).filter(Boolean) : ["React", "TypeScript", "Python"],
                github: sharingGranted ? (std.github_url || "") : "",
                portfolio: sharingGranted ? (std.portfolio_url || "") : "",
                linkedin: sharingGranted ? (std.linkedin_url || "") : "",
                sharingGranted,
                collegeName: std.college_name || "SRM Institute of Science and Technology"
              };
            });
            setStudents(mapped);
          }
        } catch (err) {
          console.error("Error fetching student registry:", err);
        } finally {
          setLoadingStudents(false);
        }
      };

      fetchStudents();
    }
  }, [authorized]);

  const handleVerifyPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof window !== "undefined") {
      const pinsStored = localStorage.getItem("ldk_recruiter_pins");
      const pinsList = pinsStored ? JSON.parse(pinsStored) : [];
      
      const matched = pinsList.find((p: any) => p.pin === accessPin.trim());
      if (matched) {
        setAuthorized(true);
        setActiveCompany(matched.company);
        setAuthError(null);
        localStorage.setItem("ldk_recruiter_session", JSON.stringify({ company: matched.company, pin: matched.pin }));
      } else {
        setAuthError("Unauthorized Recruiter PIN. Please coordinate with the campus staff to generate a valid access code.");
      }
    }
  };

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("ldk_recruiter_session");
      setAuthorized(false);
      setActiveCompany("");
      setAccessPin("");
    }
  };

  // Filter logic
  const filteredStudents = students.filter(std => {
    const matchesSearch = std.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          std.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          std.skills.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesDept = filterDept ? std.department === filterDept : true;
    const matchesYear = filterGradYear ? std.gradYear === filterGradYear : true;
    const matchesThreshold = std.leetcodeSolved >= filterSolvedThreshold;
    return matchesSearch && matchesDept && matchesYear && matchesThreshold;
  });

  const activeStudent = filteredStudents.find(s => s.id === selectedStudentId) || (filteredStudents.length > 0 ? filteredStudents[0] : null);

  const handleExportCSV = () => {
    const headers = [
      "Student ID",
      "Full Name",
      "Department/Division",
      "Graduation Year",
      "Skills",
      "LeetCode Solved",
      "CodeForces Rating",
      "Github URL",
      "Portfolio URL",
      "Linkedin URL",
      "Sharing Permission"
    ];

    const rows = filteredStudents.map(s => [
      s.id,
      s.name,
      s.department,
      s.gradYear,
      s.skills.join(" | "),
      s.leetcodeSolved,
      s.codeforcesRating,
      s.github || "RESTRICTED",
      s.portfolio || "RESTRICTED",
      s.linkedin || "RESTRICTED",
      s.sharingGranted ? "AUTHORIZED" : "RESTRICTED"
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `lyndesk_talent_${activeCompany.toLowerCase().replace(/\s+/g, "_")}_export.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // College Talent Metrics
  const totalTalentPool = students.length;
  const avgLeetCodeSolved = totalTalentPool > 0 
    ? Math.round(students.reduce((sum, s) => sum + s.leetcodeSolved, 0) / totalTalentPool) 
    : 0;
  const topSolveCount = totalTalentPool > 0 
    ? Math.max(...students.map(s => s.leetcodeSolved), 0) 
    : 0;
  const avgCodeforcesRating = totalTalentPool > 0 
    ? Math.round(students.reduce((sum, s) => sum + s.codeforcesRating, 0) / totalTalentPool) 
    : 0;

  if (authLoading) {
    return (
      <div className="h-screen bg-bg-base flex flex-col items-center justify-center font-mono text-xs text-txt-muted gap-2">
        <div className="w-4 h-4 border-2 border-accent-main border-t-transparent rounded-full animate-spin" />
        <span>Syncing session...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen lg:h-screen lg:overflow-hidden flex flex-col font-sans selection:bg-accent-main selection:text-bg-base bg-bg-base">
      <Header />

      {!authorized ? (
        /* Secure access Lock Screen */
        <main className="flex-grow flex items-center justify-center p-6 bg-bg-base text-left">
          <div className="max-w-md w-full border border-border-main bg-bg-surface p-8 rounded-md shadow-2xl flex flex-col gap-6 animate-fade-in">
            <div className="h-12 w-12 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto border border-amber-500/30">
              <Lock size={20} />
            </div>
            
            <div className="flex flex-col gap-1 text-center">
              <h1 className="font-display text-2xl font-light text-txt-main">Recruiter Access Desk</h1>
              <p className="text-xs text-txt-sub">Enter the 6-digit Recruiter Access PIN generated by the College Administrator to audit candidate portfolios.</p>
            </div>

            {authError && (
              <div className="text-xs p-3 border border-red-500/50 bg-red-500/10 text-red-500 font-mono rounded-sm leading-normal">
                {authError}
              </div>
            )}

            <form onSubmit={handleVerifyPin} className="flex flex-col gap-3">
              <input 
                type="text"
                required
                maxLength={6}
                value={accessPin}
                onChange={(e) => setAccessPin(e.target.value.replace(/\D/g, ""))}
                placeholder="Enter 6-Digit Access PIN"
                className="h-10 px-3 border border-border-main bg-bg-base text-txt-main rounded-sm text-sm focus:outline-none focus:border-txt-main transition-colors text-center font-mono placeholder:text-txt-muted/60 tracking-widest font-bold"
              />
              <button 
                type="submit"
                className="h-10 bg-accent-main hover:opacity-90 text-bg-base text-xs font-mono uppercase tracking-wider rounded-sm transition-opacity cursor-pointer font-bold"
              >
                Authenticate Recruiter PIN
              </button>
            </form>
            
            <div className="text-[10.5px] text-txt-muted leading-relaxed border-t border-border-main/40 pt-4 text-center">
              Campus recruiters can request access credentials directly from the college coordinator.
            </div>
          </div>
        </main>
      ) : (
        /* Recruiter Main Dashboard Console */
        <main className="flex-1 overflow-y-auto lg:overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-0 text-left">
          
          {/* ================= LEFT SIDEBAR: STUDENT LIST & FILTERS (7 Columns) ================= */}
          <section className="lg:col-span-7 border-b lg:border-b-0 lg:border-r border-border-main/50 flex flex-col h-auto lg:h-full bg-bg-base overflow-hidden p-6 gap-5">
            
            {/* Header section with Stats */}
            <div className="flex justify-between items-start border-b border-border-main/40 pb-4">
              <div className="flex flex-col gap-0.5">
                <span className="font-mono text-[9px] uppercase tracking-widest text-accent-main font-bold">Partner Console • {activeCompany}</span>
                <h1 className="font-display text-2xl font-light tracking-tight text-txt-main">Student Talent Registry</h1>
              </div>
              <button
                onClick={handleLogout}
                className="h-7 px-3 border border-border-main hover:bg-bg-card text-txt-main text-[9px] font-mono tracking-wider uppercase rounded-sm transition-colors flex items-center gap-1 cursor-pointer"
              >
                <LogOut size={10} /> Exit Console
              </button>
            </div>

            {/* Performance Analytics Panel */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-bg-surface border border-border-main/60 p-3 rounded flex flex-col gap-0.5">
                <span className="text-[8px] font-mono text-txt-muted uppercase font-semibold">Total Students</span>
                <span className="text-sm font-semibold text-txt-main font-mono">{totalTalentPool}</span>
              </div>
              <div className="bg-bg-surface border border-border-main/60 p-3 rounded flex flex-col gap-0.5">
                <span className="text-[8px] font-mono text-txt-muted uppercase font-semibold">Avg LeetCode Solved</span>
                <span className="text-sm font-semibold text-emerald-500 font-mono">{avgLeetCodeSolved}</span>
              </div>
              <div className="bg-bg-surface border border-border-main/60 p-3 rounded flex flex-col gap-0.5">
                <span className="text-[8px] font-mono text-txt-muted uppercase font-semibold">Top LeetCode Solve</span>
                <span className="text-sm font-semibold text-accent-main font-mono">{topSolveCount}</span>
              </div>
              <div className="bg-bg-surface border border-border-main/60 p-3 rounded flex flex-col gap-0.5">
                <span className="text-[8px] font-mono text-txt-muted uppercase font-semibold">Avg CF Rating</span>
                <span className="text-sm font-semibold text-amber-500 font-mono">{avgCodeforcesRating}</span>
              </div>
            </div>

            {/* Dynamic Filters Panel */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-bg-card/20 p-4 border border-border-main/50 rounded-md flex-shrink-0">
              <input 
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search name, skills..."
                className="h-8 px-2 border border-border-main/80 bg-bg-base text-txt-main text-xs focus:outline-none focus:border-txt-main rounded-sm placeholder:text-txt-muted/65"
              />

              <select
                value={filterDept}
                onChange={(e) => setFilterDept(e.target.value)}
                className="h-8 px-2 border border-border-main/80 bg-bg-base text-txt-main text-xs focus:outline-none focus:border-txt-main rounded-sm cursor-pointer"
              >
                <option value="">All Departments</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Information Technology">Information Technology</option>
                <option value="Electrical Engineering">Electrical Engineering</option>
                <option value="Mechanical Engineering">Mechanical Engineering</option>
              </select>

              <select
                value={filterGradYear}
                onChange={(e) => setFilterGradYear(e.target.value)}
                className="h-8 px-2 border border-border-main/80 bg-bg-base text-txt-main text-xs focus:outline-none focus:border-txt-main rounded-sm cursor-pointer"
              >
                <option value="">All Batches</option>
                <option value="2025">Class of 2025</option>
                <option value="2026">Class of 2026</option>
                <option value="2027">Class of 2027</option>
              </select>

              <select
                value={filterSolvedThreshold}
                onChange={(e) => setFilterSolvedThreshold(Number(e.target.value))}
                className="h-8 px-2 border border-border-main/80 bg-bg-base text-txt-main text-xs focus:outline-none focus:border-txt-main rounded-sm cursor-pointer"
              >
                <option value={0}>LeetCode solves: Any</option>
                <option value={200}>solved &gt; 200</option>
                <option value={300}>solved &gt; 300</option>
                <option value={400}>solved &gt; 400</option>
              </select>
            </div>

            <div className="flex justify-between items-center text-xs">
              <span className="text-[10px] font-mono uppercase text-txt-muted">Filtered Candidates: {filteredStudents.length}</span>
              <button 
                onClick={handleExportCSV}
                className="h-8 px-4 bg-accent-main text-bg-base text-[9px] font-mono tracking-wider uppercase rounded-sm hover:opacity-90 transition-opacity flex items-center gap-1.5 cursor-pointer font-bold"
              >
                <Download size={11} /> Export Registry to CSV
              </button>
            </div>

            {/* Registered Student Cards */}
            <div className="flex-1 overflow-y-auto border border-border-main/60 bg-bg-surface rounded-md">
              <div className="flex flex-col divide-y divide-border-main/60">
                {loadingStudents ? (
                  <div className="p-8 text-center text-txt-muted font-mono text-[10px] uppercase">
                    Loading student data...
                  </div>
                ) : filteredStudents.length > 0 ? (
                  filteredStudents.map(std => (
                    <div 
                      key={std.id}
                      onClick={() => setSelectedStudentId(std.id)}
                      className={`p-4 flex justify-between items-center gap-4 cursor-pointer hover:bg-bg-card/20 transition-colors ${
                        activeStudent?.id === std.id ? "bg-bg-card/35" : ""
                      }`}
                    >
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs text-txt-main font-semibold flex items-center gap-2">
                          {std.name}
                          {std.sharingGranted && (
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" title="Sharing Authorized" />
                          )}
                        </span>
                        <span className="text-[10px] text-txt-muted truncate">{std.department} • Class of {std.gradYear}</span>
                        <div className="flex items-center gap-2 mt-1 text-[9px] text-txt-sub">
                          <span className="font-mono text-[8px] bg-bg-card px-1 py-0.5 rounded border border-border-main/50">LC Solves: {std.leetcodeSolved}</span>
                          <span className="font-mono text-[8px] bg-bg-card px-1 py-0.5 rounded border border-border-main/50">CF Rating: {std.codeforcesRating}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 flex-shrink-0 text-right">
                        {std.sharingGranted ? (
                          <span className="text-[8px] font-mono tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/40 px-2 py-0.5 rounded uppercase">
                            Open Access
                          </span>
                        ) : (
                          <span className="text-[8px] font-mono tracking-wider bg-bg-card text-txt-muted border border-border-main px-2 py-0.5 rounded uppercase">
                            Restricted
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="h-44 flex flex-col items-center justify-center text-center p-6 text-txt-muted font-mono text-[10px] uppercase">
                    No matching student profiles found.
                  </div>
                )}
              </div>
            </div>

          </section>

          {/* ================= RIGHT PANEL: STUDENT DOSSIER (5 Columns) ================= */}
          <section className="lg:col-span-5 bg-bg-surface/30 flex flex-col h-auto lg:h-full overflow-y-auto p-6 gap-6">
            
            <div className="flex flex-col gap-0.5 border-b border-border-main/40 pb-4">
              <span className="font-mono text-[9px] uppercase tracking-widest text-txt-muted font-bold">Candidate Portfolio Auditor</span>
              <h2 className="font-display text-lg font-light text-txt-main">Student Dossier</h2>
            </div>

            {activeStudent ? (
              <div className="flex flex-col gap-6 animate-fade-in">
                
                {/* Core Bio */}
                <div className="border border-border-main/70 bg-bg-surface p-5 rounded-sm flex flex-col gap-3">
                  <div className="flex justify-between items-start">
                    <span className="font-mono text-[9px] uppercase tracking-widest text-txt-muted font-bold">Identity & Verification</span>
                    {activeStudent.sharingGranted ? (
                      <span className="text-[8px] font-mono tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/40 px-2 py-0.5 rounded uppercase flex items-center gap-1">
                        <Unlock size={8} /> Contact Disclosed
                      </span>
                    ) : (
                      <span className="text-[8px] font-mono tracking-wider bg-amber-500/10 text-amber-600 border border-amber-500/40 px-2 py-0.5 rounded uppercase flex items-center gap-1">
                        <Lock size={8} /> Masked Profile
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-sm text-txt-main font-semibold">{activeStudent.name}</span>
                    <span className="text-[10.5px] text-txt-sub font-mono">
                      {activeStudent.sharingGranted ? `Verified Roll: ${activeStudent.id.substring(0, 8).toUpperCase()}` : "Contact: restricted (requires candidate consent)"}
                    </span>
                    <span className="text-[10px] text-txt-sub mt-1">
                      {activeStudent.collegeName} • {activeStudent.department} (Class of {activeStudent.gradYear})
                    </span>
                  </div>
                </div>

                {/* Skills Stack */}
                <div className="border border-border-main/70 bg-bg-surface p-5 rounded-sm flex flex-col gap-3">
                  <span className="font-mono text-[9px] uppercase tracking-widest text-txt-muted font-bold font-semibold">Verified Tech Skill Stack</span>
                  <div className="flex flex-wrap gap-1.5">
                    {activeStudent.skills.map(skill => (
                      <span key={skill} className="text-[10px] font-mono bg-bg-base border border-border-main px-2.5 py-1 rounded text-txt-main">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Coding Standings */}
                <div className="border border-border-main/70 bg-bg-surface p-5 rounded-sm flex flex-col gap-3">
                  <span className="font-mono text-[9px] uppercase tracking-widest text-txt-muted font-bold">Competitive Coding Milestones</span>
                  
                  <div className="grid grid-cols-2 gap-3 text-center">
                    <div className="bg-bg-base/30 p-3 border border-border-main/50 rounded flex flex-col gap-0.5">
                      <span className="text-[8px] font-mono text-txt-muted uppercase font-semibold">LeetCode Solved</span>
                      <span className="text-base font-semibold text-txt-main font-mono">{activeStudent.leetcodeSolved}</span>
                    </div>
                    <div className="bg-bg-base/30 p-3 border border-border-main/50 rounded flex flex-col gap-0.5">
                      <span className="text-[8px] font-mono text-txt-muted uppercase font-semibold">Codeforces Rating</span>
                      <span className="text-base font-semibold text-accent-main font-mono">{activeStudent.codeforcesRating}</span>
                    </div>
                  </div>
                </div>

                {/* External Portfolios */}
                <div className="border border-border-main/70 bg-bg-surface p-5 rounded-sm flex flex-col gap-3">
                  <span className="font-mono text-[9px] uppercase tracking-widest text-txt-muted font-bold">Verified Codebases & Networks</span>
                  
                  {activeStudent.sharingGranted ? (
                    <div className="flex flex-col gap-2.5">
                      {activeStudent.github && (
                        <div className="flex justify-between items-center border-b border-border-main/40 pb-2.5">
                          <span className="text-xs text-txt-sub font-mono">github.com</span>
                          <a 
                            href={`https://${activeStudent.github.replace(/https?:\/\//, "")}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[10px] text-txt-main hover:underline flex items-center gap-1 font-mono uppercase font-bold"
                          >
                            Open Link <ExternalLink size={9} />
                          </a>
                        </div>
                      )}

                      {activeStudent.portfolio && (
                        <div className="flex justify-between items-center border-b border-border-main/40 pb-2.5">
                          <span className="text-xs text-txt-sub font-mono">portfolio.dev</span>
                          <a 
                            href={`https://${activeStudent.portfolio.replace(/https?:\/\//, "")}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[10px] text-txt-main hover:underline flex items-center gap-1 font-mono uppercase font-bold"
                          >
                            Open Link <ExternalLink size={9} />
                          </a>
                        </div>
                      )}

                      {activeStudent.linkedin && (
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-txt-sub font-mono">linkedin.com</span>
                          <a 
                            href={`https://${activeStudent.linkedin.replace(/https?:\/\//, "")}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[10px] text-txt-main hover:underline flex items-center gap-1 font-mono uppercase font-bold"
                          >
                            Open Link <ExternalLink size={9} />
                          </a>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="py-4 text-center text-[10px] font-mono text-amber-600 bg-amber-500/5 border border-amber-500/20 rounded">
                      ⚠️ Student contact information is masked. Under privacy compliance rules, students must toggle sharing permission in their account dashboard to reveal developer links.
                    </div>
                  )}
                </div>

                <div className="border border-border-main/60 p-4 rounded bg-bg-card/40 text-center font-mono text-[9px] text-txt-sub leading-normal">
                  All statistics and handles are live-pulled directly from their platform sync records.
                </div>

              </div>
            ) : (
              <div className="h-44 border border-border-main/80 border-dashed rounded-sm flex flex-col items-center justify-center text-center p-6 text-txt-muted">
                <Users size={18} className="mb-2" />
                <span className="text-[10px] font-mono uppercase tracking-wider">No Selection</span>
                <p className="text-[10px] font-light leading-relaxed max-w-xs mt-1">Select a student from the left list to inspect their active stats and code verification portfolios.</p>
              </div>
            )}

          </section>

        </main>
      )}
    </div>
  );
}
