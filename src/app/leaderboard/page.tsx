"use client";

import React, { useState } from "react";
import Link from "next/link";
import Header from "../components/Header";
import { 
  ArrowLeft, 
  Award, 
  Activity, 
  Building 
} from "lucide-react";

export default function LeaderboardPage() {
  
  const [activeBoard, setActiveBoard] = useState<"colleges" | "departments" | "individual">("colleges");

  const collegeStandings = [
    { rank: 1, name: "Stanford University", points: 1420, activeTeams: 24, winRate: "78%" },
    { rank: 2, name: "Massachusetts Institute of Technology (MIT)", points: 1180, activeTeams: 19, winRate: "71%" },
    { rank: 3, name: "IIT Delhi", points: 940, activeTeams: 15, winRate: "65%" },
    { rank: 4, name: "University of California, Berkeley", points: 810, activeTeams: 12, winRate: "60%" },
    { rank: 5, name: "Carnegie Mellon University (CMU)", points: 760, activeTeams: 14, winRate: "58%" }
  ];

  const departmentStandings = [
    { rank: 1, name: "Computer Science & Engineering", points: 640, activeStudents: 42, activeProjects: 11 },
    { rank: 2, name: "Electrical & Electronics", points: 410, activeStudents: 28, activeProjects: 7 },
    { rank: 3, name: "Mechanical Engineering", points: 230, activeStudents: 15, activeProjects: 4 },
    { rank: 4, name: "Design & Creative Portfolios", points: 190, activeStudents: 11, activeProjects: 3 }
  ];

  const studentStandings = [
    { rank: 1, name: "Alex Carter", username: "alexcarter", department: "Computer Science", points: 82, completed: 5 },
    { rank: 2, name: "Mira Sen", username: "mirasen", department: "Design", points: 74, completed: 4 },
    { rank: 3, name: "Nikhil Mehta", username: "nikmehta", department: "Computer Science", points: 68, completed: 4 },
    { rank: 4, name: "Sophia Vance", username: "sophiav", department: "Electrical Engineering", points: 55, completed: 3 },
    { rank: 5, name: "David Chen", username: "dchen", department: "Computer Science", points: 48, completed: 3 }
  ];

  return (
    <div className="h-screen overflow-hidden flex flex-col font-sans selection:bg-accent-main selection:text-bg-base">
      
      {/* Header (Unified Navigation & Notifications Drawer) */}
      <Header />

      {/* Main Container */}
      <main className="flex-1 overflow-hidden max-w-7xl w-full mx-auto px-6 md:px-12 py-6 flex flex-col gap-6">
        
        <Link 
          href="/"
          className="flex items-center gap-2 text-[10px] text-txt-muted hover:text-txt-main transition-colors font-mono tracking-wider uppercase self-start"
        >
          <ArrowLeft size={12} />
          Back to Portal
        </Link>

        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-border-main/40 pb-4 gap-4">
          <div className="flex flex-col gap-1">
            <span className="font-mono text-[9px] uppercase tracking-widest text-txt-muted">Global Ranking</span>
            <h1 className="font-display text-3xl font-light tracking-tight text-txt-main">College Arena Standings</h1>
            <p className="text-xs text-txt-sub">Track active project scores across institutes, departments, and developer profiles.</p>
          </div>

          {/* Sub boards tabs */}
          <div className="flex border border-border-main/80 rounded p-0.5 bg-bg-card/50 self-start font-mono text-[10px] tracking-wider uppercase">
            <button 
              onClick={() => setActiveBoard("colleges")}
              className={`px-3 py-1.5 rounded-sm transition-colors cursor-pointer ${
                activeBoard === "colleges" ? "bg-accent-main text-bg-base" : "text-txt-sub hover:text-txt-main"
              }`}
            >
              Colleges
            </button>
            <button 
              onClick={() => setActiveBoard("departments")}
              className={`px-3 py-1.5 rounded-sm transition-colors cursor-pointer ${
                activeBoard === "departments" ? "bg-accent-main text-bg-base" : "text-txt-sub hover:text-txt-main"
              }`}
            >
              Departments
            </button>
            <button 
              onClick={() => setActiveBoard("individual")}
              className={`px-3 py-1.5 rounded-sm transition-colors cursor-pointer ${
                activeBoard === "individual" ? "bg-accent-main text-bg-base" : "text-txt-sub hover:text-txt-main"
              }`}
            >
              Developers
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-6 pb-8">
          
          {/* 1. College Standings */}
          {activeBoard === "colleges" && (
            <div className="border border-border-main/60 bg-bg-surface rounded-md p-6 flex flex-col gap-6">
              <span className="font-mono text-[9px] uppercase tracking-widest text-txt-muted">Inter-College Rankings</span>
              
              <div className="flex flex-col gap-5">
                {collegeStandings.map((col) => {
                  const maxPoints = 1500;
                  const percentWidth = (col.points / maxPoints) * 100;
                  
                  return (
                    <div key={col.rank} className="flex flex-col gap-2">
                      <div className="flex justify-between items-center text-xs">
                        <div className="flex items-center gap-3">
                          <span className="font-mono font-semibold text-txt-muted w-4">{col.rank}.</span>
                          <span className="font-semibold text-txt-main flex items-center gap-1.5">
                            <Building size={12} className="text-txt-muted" />
                            {col.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-6 font-mono text-[10px] text-txt-muted">
                          <span>{col.activeTeams} Teams</span>
                          <span>{col.winRate} win rate</span>
                          <span className="font-bold text-txt-main">{col.points} pts</span>
                        </div>
                      </div>

                      {/* Paper thin progress bar */}
                      <div className="w-full h-1 bg-border-main/40 rounded-full overflow-hidden">
                        <div className="bg-accent-main h-full rounded-full transition-all duration-500" style={{ width: `${percentWidth}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 2. Department Standings */}
          {activeBoard === "departments" && (
            <div className="border border-border-main/60 bg-bg-surface rounded-md p-6 flex flex-col gap-6">
              <span className="font-mono text-[9px] uppercase tracking-widest text-txt-muted">Department Performance Standings</span>
              
              <div className="flex flex-col gap-5">
                {departmentStandings.map((dep) => {
                  const maxPoints = 800;
                  const percentWidth = (dep.points / maxPoints) * 100;
                  
                  return (
                    <div key={dep.rank} className="flex flex-col gap-2">
                      <div className="flex justify-between items-center text-xs">
                        <div className="flex items-center gap-3">
                          <span className="font-mono font-semibold text-txt-muted w-4">{dep.rank}.</span>
                          <span className="font-semibold text-txt-main flex items-center gap-1.5">
                            <Activity size={12} className="text-txt-muted" />
                            {dep.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-6 font-mono text-[10px] text-txt-muted">
                          <span>{dep.activeStudents} Active</span>
                          <span>{dep.activeProjects} Vaults</span>
                          <span className="font-bold text-txt-main">{dep.points} pts</span>
                        </div>
                      </div>

                      <div className="w-full h-1 bg-border-main/40 rounded-full overflow-hidden">
                        <div className="bg-accent-main h-full rounded-full transition-all duration-500" style={{ width: `${percentWidth}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 3. Individual Developer Rankings */}
          {activeBoard === "individual" && (
            <div className="flex flex-col border border-border-main/60 bg-bg-surface rounded-md divide-y divide-border-main/60">
              {studentStandings.map((std) => (
                <div key={std.rank} className="p-5 flex justify-between items-center gap-4 hover:bg-bg-card/20 transition-colors">
                  <div className="flex items-center gap-4">
                    <span className="font-mono font-semibold text-txt-muted w-5 text-center">{std.rank}</span>
                    <div className="w-10 h-10 rounded-full border border-border-main bg-bg-card flex items-center justify-center font-mono text-sm font-bold text-txt-main select-none">
                      {std.name.charAt(0)}
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-baseline gap-2">
                        <span className="text-xs text-txt-main font-semibold">{std.name}</span>
                        <span className="text-[9px] text-txt-muted font-mono">@{std.username}</span>
                      </div>
                      <span className="text-[10px] text-txt-sub font-light">{std.department}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-8 font-mono text-xs">
                    <div className="hidden sm:flex flex-col items-end">
                      <span className="text-[8px] text-txt-muted uppercase tracking-wider">Completed</span>
                      <span className="text-txt-main font-medium">{std.completed} Projects</span>
                    </div>
                    
                    <div className="flex flex-col items-end">
                      <span className="text-[8px] text-txt-muted uppercase tracking-wider">Total Score</span>
                      <span className="text-txt-main font-bold flex items-center gap-1">
                        <Award size={12} className="text-txt-main" />
                        {std.points}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>

      </main>

    </div>
  );
}
