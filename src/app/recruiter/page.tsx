"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import Header from "../components/Header";
import { 
  Search, 
  FileText, 
  ExternalLink, 
  Building2, 
  ShieldCheck, 
  Users
} from "lucide-react";

interface RegistryStudent {
  id: string;
  name: string;
  email: string;
  department: string;
  college: string;
  skills: string[];
  leetcodeSolved: number;
  codeforcesRating: number;
  hackathons: number;
  github: string;
  portfolio: string;
  resumeUrl: string;
}

export default function RecruiterConsole() {
  const { user } = useAuth();
  const [authorized, setAuthorized] = useState(false);
  const [accessKey, setAccessKey] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);

  // Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSkill, setSelectedSkill] = useState("");
  const [minLeetCode, setMinLeetCode] = useState(0);
  const [selectedStudent, setSelectedStudent] = useState<RegistryStudent | null>(null);

  // Pre-seeded database of students connected to LynDesk (fallbacks matching coordinator stats)
  const studentsList: RegistryStudent[] = [
    {
      id: "s1",
      name: "Alex Carter",
      email: "alexcarter@mit.edu",
      department: "Computer Science",
      college: "Massachusetts Institute of Technology (MIT)",
      skills: ["React", "TypeScript", "Node.js", "Python", "Rust"],
      leetcodeSolved: 342,
      codeforcesRating: 1480,
      hackathons: 6,
      github: "github.com/alexcarter",
      portfolio: "alexcarter.dev",
      resumeUrl: "#"
    },
    {
      id: "s2",
      name: "Mira Sen",
      email: "mirasen@mit.edu",
      department: "Information Technology",
      college: "Massachusetts Institute of Technology (MIT)",
      skills: ["JavaScript", "HTML", "CSS", "React", "Next.js", "Supabase"],
      leetcodeSolved: 412,
      codeforcesRating: 1590,
      hackathons: 4,
      github: "github.com/mirasen",
      portfolio: "mirasen.io",
      resumeUrl: "#"
    },
    {
      id: "s3",
      name: "David Chen",
      email: "dchen@mit.edu",
      department: "Electrical Engineering",
      college: "Massachusetts Institute of Technology (MIT)",
      skills: ["C++", "Python", "Docker", "Go"],
      leetcodeSolved: 184,
      codeforcesRating: 1240,
      hackathons: 3,
      github: "github.com/dchen",
      portfolio: "dchen.dev",
      resumeUrl: "#"
    },
    {
      id: "s4",
      name: "Sofia Rodriguez",
      email: "srodriguez@mit.edu",
      department: "Computer Science",
      college: "Stanford University",
      skills: ["Python", "PyTorch", "React", "TypeScript"],
      leetcodeSolved: 289,
      codeforcesRating: 1410,
      hackathons: 5,
      github: "github.com/sofia_r",
      portfolio: "sofiarodriguez.com",
      resumeUrl: "#"
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
  const filteredStudents = studentsList.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          student.college.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          student.skills.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesSkill = selectedSkill ? student.skills.includes(selectedSkill) : true;
    const matchesLeetCode = student.leetcodeSolved >= minLeetCode;
    return matchesSearch && matchesSkill && matchesLeetCode;
  });

  // Extract all unique skills for filter dropdown
  const allSkills = Array.from(new Set(studentsList.flatMap(s => s.skills)));

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
              <h1 className="font-display text-2xl font-light text-txt-main">Recruiter Access Portal</h1>
              <p className="text-xs text-txt-sub">Enter your corporate security key to browse verified student portfolios and competitive profiles.</p>
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
                Authenticate Recruiter
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
          
          {/* ================= LEFT SIDEBAR: STUDENT LIST & FILTERS (7 Columns) ================= */}
          <section className="lg:col-span-7 border-r border-border-main/50 flex flex-col h-full bg-bg-base overflow-hidden p-6 gap-6">
            <div className="flex justify-between items-center border-b border-border-main/40 pb-4">
              <div className="flex flex-col gap-0.5">
                <span className="font-mono text-[9px] uppercase tracking-widest text-txt-muted font-bold">Placement Cell Link</span>
                <h1 className="font-display text-3xl font-light tracking-tight text-txt-main">Hiring Search</h1>
              </div>
              <div className="flex items-center gap-1.5 border border-emerald-500/40 bg-emerald-500/10 text-emerald-500 px-3 py-1 rounded-sm text-[10px] font-mono uppercase">
                <ShieldCheck size={12} /> Verified recruiter
              </div>
            </div>

            {/* Dynamic Filters Panel */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-shrink-0">
              <div className="relative">
                <input 
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search name, college, skills..."
                  className="w-full h-9 pl-8 pr-3 border border-border-main/80 bg-bg-surface text-txt-main rounded-sm text-xs focus:outline-none focus:border-txt-main placeholder:text-txt-muted/60 transition-colors"
                />
                <Search size={12} className="absolute left-3 top-3 text-txt-muted" />
              </div>

              <select
                value={selectedSkill}
                onChange={(e) => setSelectedSkill(e.target.value)}
                className="h-9 px-3 border border-border-main/80 bg-bg-surface text-txt-main rounded-sm text-xs focus:outline-none focus:border-txt-main cursor-pointer"
              >
                <option value="">Filter by Skill (All)</option>
                {allSkills.map(skill => (
                  <option key={skill} value={skill}>{skill}</option>
                ))}
              </select>

              <select
                value={minLeetCode}
                onChange={(e) => setMinLeetCode(Number(e.target.value))}
                className="h-9 px-3 border border-border-main/80 bg-bg-surface text-txt-main rounded-sm text-xs focus:outline-none focus:border-txt-main cursor-pointer"
              >
                <option value={0}>LeetCode Solved: Any</option>
                <option value={150}>solved &gt; 150</option>
                <option value={250}>solved &gt; 250</option>
                <option value={350}>solved &gt; 350</option>
              </select>
            </div>

            {/* Registered Student Cards */}
            <div className="flex-1 overflow-y-auto border border-border-main/60 bg-bg-surface rounded-md">
              <div className="flex flex-col divide-y divide-border-main/60">
                {filteredStudents.length > 0 ? (
                  filteredStudents.map(student => (
                    <div 
                      key={student.id}
                      onClick={() => setSelectedStudent(student)}
                      className={`p-4 flex justify-between items-center gap-4 cursor-pointer hover:bg-bg-card/20 transition-colors ${
                        selectedStudent?.id === student.id ? "bg-bg-card/35" : ""
                      }`}
                    >
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs text-txt-main font-semibold">{student.name}</span>
                        <span className="text-[10px] text-txt-muted truncate">{student.college}</span>
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {student.skills.slice(0, 3).map(skill => (
                            <span key={skill} className="text-[8px] font-mono bg-bg-base border border-border-main/50 px-1.5 py-0.5 rounded text-txt-sub">
                              {skill}
                            </span>
                          ))}
                          {student.skills.length > 3 && (
                            <span className="text-[8px] font-mono text-txt-muted px-1">+{student.skills.length - 3} more</span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-4 flex-shrink-0 text-right">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[9px] text-txt-muted uppercase font-mono">LeetCode Solved</span>
                          <span className="text-sm font-semibold text-accent-main font-mono">{student.leetcodeSolved}</span>
                        </div>
                        <span className="text-[8px] font-mono tracking-wider bg-emerald-500/10 border border-emerald-500/40 text-emerald-500 px-2 py-0.5 rounded uppercase">
                          Contact Info
                        </span>
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

          {/* ================= RIGHT PANEL: TALENT DOSSIER / DOSSIER SUMMARY (5 Columns) ================= */}
          <section className="lg:col-span-5 bg-bg-surface/30 flex flex-col h-full overflow-y-auto p-6 gap-6">
            
            <div className="flex flex-col gap-0.5 border-b border-border-main/40 pb-4">
              <span className="font-mono text-[9px] uppercase tracking-widest text-txt-muted font-bold">Talent Pipeline</span>
              <h2 className="font-display text-lg font-light text-txt-main">Portfolio Dossier</h2>
            </div>

            {selectedStudent ? (
              <div className="flex flex-col gap-6 animate-fade-in">
                
                {/* Core Bio */}
                <div className="border border-border-main/70 bg-bg-surface p-5 rounded-sm flex flex-col gap-3">
                  <span className="font-mono text-[9px] uppercase tracking-widest text-txt-muted font-bold">Candidate Contact</span>
                  <div className="flex flex-col">
                    <span className="text-sm text-txt-main font-semibold">{selectedStudent.name}</span>
                    <span className="text-xs text-txt-muted font-mono">{selectedStudent.email}</span>
                    <span className="text-[10px] text-txt-sub mt-1">{selectedStudent.college} • {selectedStudent.department}</span>
                  </div>
                </div>

                {/* Skills Checklist */}
                <div className="border border-border-main/70 bg-bg-surface p-5 rounded-sm flex flex-col gap-3">
                  <span className="font-mono text-[9px] uppercase tracking-widest text-txt-muted font-bold">Verified Skills</span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedStudent.skills.map(skill => (
                      <span key={skill} className="text-[10px] font-mono bg-bg-base border border-border-main px-2.5 py-1 rounded text-txt-main">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Developer Stats Grid */}
                <div className="border border-border-main/70 bg-bg-surface p-5 rounded-sm flex flex-col gap-3">
                  <span className="font-mono text-[9px] uppercase tracking-widest text-txt-muted font-bold">Competitive Analytics</span>
                  
                  <div className="grid grid-cols-2 gap-3 text-center">
                    <div className="bg-bg-base/30 p-3 border border-border-main/50 rounded flex flex-col gap-0.5">
                      <span className="text-[8px] font-mono text-txt-muted uppercase">LeetCode Solved</span>
                      <span className="text-base font-semibold text-txt-main font-mono">{selectedStudent.leetcodeSolved}</span>
                    </div>
                    <div className="bg-bg-base/30 p-3 border border-border-main/50 rounded flex flex-col gap-0.5">
                      <span className="text-[8px] font-mono text-txt-muted uppercase">Codeforces Rating</span>
                      <span className="text-base font-semibold text-accent-main font-mono">{selectedStudent.codeforcesRating}</span>
                    </div>
                  </div>
                </div>

                {/* External Portfolios */}
                <div className="border border-border-main/70 bg-bg-surface p-5 rounded-sm flex flex-col gap-3">
                  <span className="font-mono text-[9px] uppercase tracking-widest text-txt-muted font-bold">Portfolio References</span>
                  
                  <div className="flex justify-between items-center border-b border-border-main/40 pb-2.5">
                    <span className="text-xs text-txt-sub font-mono">github.com</span>
                    <a 
                      href={`https://${selectedStudent.github}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[10px] text-txt-main hover:underline flex items-center gap-1 font-mono uppercase"
                    >
                      View Github <ExternalLink size={9} />
                    </a>
                  </div>

                  <div className="flex justify-between items-center border-b border-border-main/40 pb-2.5">
                    <span className="text-xs text-txt-sub font-mono">portfolio.dev</span>
                    <a 
                      href={`https://${selectedStudent.portfolio}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[10px] text-txt-main hover:underline flex items-center gap-1 font-mono uppercase"
                    >
                      View Site <ExternalLink size={9} />
                    </a>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-xs text-txt-sub font-mono">resume_file.pdf</span>
                    <a 
                      href={selectedStudent.resumeUrl}
                      className="text-[10px] text-txt-main hover:underline flex items-center gap-1 font-mono uppercase font-bold"
                    >
                      Download Resume <FileText size={9} />
                    </a>
                  </div>
                </div>

                {/* Action button */}
                <a 
                  href={`mailto:${selectedStudent.email}?subject=Hiring Inquiry from LynDesk`}
                  className="h-10 w-full bg-accent-main hover:opacity-90 text-bg-base text-xs font-mono uppercase tracking-wider rounded-sm transition-opacity flex items-center justify-center gap-1.5 font-bold cursor-pointer"
                >
                  Initiate Hiring Inquiry
                </a>

              </div>
            ) : (
              <div className="h-44 border border-border-main/80 border-dashed rounded-sm flex flex-col items-center justify-center text-center p-6 text-txt-muted">
                <Users size={18} className="mb-2" />
                <span className="text-[10px] font-mono uppercase tracking-wider">No Selection</span>
                <p className="text-[10px] font-light leading-relaxed max-w-xs mt-1">Select a student candidate from the left list to inspect their skills dossiers and initiate career outreach.</p>
              </div>
            )}

          </section>

        </main>
      )}
    </div>
  );
}
