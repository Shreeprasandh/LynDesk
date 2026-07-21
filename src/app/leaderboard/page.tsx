"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "../context/AuthContext";
import Header from "../components/Header";
import { 
  ArrowLeft, 
  Award, 
  Building2, 
  ShieldCheck, 
  Sparkles
} from "lucide-react";

interface LeaderboardMember {
  rank: number;
  name: string;
  username: string;
  department: string;
  points: number;
  completed: number;
  isCurrentUser?: boolean;
}

interface LegacyMember {
  rank: number;
  name: string;
  username: string;
  department: string;
  points: number;
  completed: number;
  gradYear: string;
  status: string;
}

export default function LeaderboardPage() {
  const { user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<"active" | "legacy" | "department">("active");
  const [selectedDept, setSelectedDept] = useState("Computer Science");

  if (authLoading) {
    return (
      <div className="h-screen bg-bg-base flex flex-col items-center justify-center font-mono text-xs text-txt-muted gap-2">
        <div className="w-4 h-4 border-2 border-accent-main border-t-transparent rounded-full animate-spin" />
        <span>Syncing session...</span>
      </div>
    );
  }

  if (!user) return null;

  const meta = user.user_metadata || {};
  const collegeKey = meta.college_key || "";
  const companyKey = meta.company_key || "";
  const collegeName = meta.college_name || "Your Linked University";
  const companyName = meta.company_name || "Your Linked Employer";
  const currentUsername = meta.username || meta.full_name || user.email?.split("@")[0] || "You";

  const isConnected = collegeKey || companyKey;
  const institutionName = collegeKey ? collegeName : companyName;

  // Active college/company members
  const activeMembers: LeaderboardMember[] = [
    { rank: 1, name: "Alex Carter", username: "alexcarter", department: "Computer Science", points: 82, completed: 5 },
    { rank: 2, name: "Mira Sen", username: "mirasen", department: "Design", points: 74, completed: 4 },
    { rank: 3, name: "Nikhil Mehta", username: "nikmehta", department: "Computer Science", points: 68, completed: 4 },
    { rank: 4, name: "Sophia Vance", username: "sophiav", department: "Electrical Engineering", points: 55, completed: 3 },
    { rank: 5, name: currentUsername.includes("You") ? "You" : currentUsername, username: "current_user", department: meta.department || "Computer Science", points: 32, completed: 3, isCurrentUser: true }
  ];

  // Sort active members by points
  const sortedActive = [...activeMembers].sort((a, b) => b.points - a.points).map((member, idx) => ({
    ...member,
    rank: idx + 1
  }));

  // Legacy members (frozen alumni / employees who left)
  const legacyMembers: LegacyMember[] = [
    { rank: 1, name: "John Doe", username: "johndoe24", department: "Computer Science", points: 142, completed: 9, gradYear: "Class of 2024", status: "Data Frozen (Alumni)" },
    { rank: 2, name: "Sarah Smith", username: "sarahs", department: "Information Technology", points: 120, completed: 8, gradYear: "Class of 2023", status: "Data Frozen (Alumni)" },
    { rank: 3, name: "Michael Chang", username: "mchang", department: "Computer Science", points: 98, completed: 6, gradYear: "Class of 2024", status: "Data Frozen (Alumni)" }
  ];

  // Unique list of departments for the selector
  const departments = ["Computer Science", "Information Technology", "Electrical Engineering", "Design"];

  // Filtered members for department view
  const departmentMembers = sortedActive.filter(member => member.department.toLowerCase().includes(selectedDept.toLowerCase()));

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return <span className="h-5 px-1.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/30 text-[9px] font-bold font-mono">GOLD</span>;
      case 2:
        return <span className="h-5 px-1.5 rounded bg-gray-400/10 text-gray-400 border border-gray-400/30 text-[9px] font-bold font-mono">SILVER</span>;
      case 3:
        return <span className="h-5 px-1.5 rounded bg-amber-700/10 text-amber-700 border border-amber-700/30 text-[9px] font-bold font-mono">BRONZE</span>;
      default:
        return <span className="text-[10px] font-mono text-txt-muted">#{rank}</span>;
    }
  };

  return (
    <div className="min-h-screen lg:h-screen lg:overflow-hidden flex flex-col font-sans selection:bg-accent-main selection:text-bg-base bg-bg-base">
      <Header />

      <main className="flex-1 overflow-y-auto lg:overflow-hidden max-w-5xl w-full mx-auto px-6 md:px-12 py-6 flex flex-col gap-6">
        
        <Link 
          href="/"
          className="flex items-center gap-2 text-[10px] text-txt-muted hover:text-txt-main transition-colors font-mono tracking-wider uppercase self-start"
        >
          <ArrowLeft size={12} />
          Back to Portal
        </Link>

        {!isConnected ? (
          /* Locked State: Prompts user to link college/company */
          <div className="flex-grow flex items-center justify-center p-6">
            <div className="max-w-md w-full border border-border-main/70 bg-bg-surface p-8 rounded-md shadow-2xl flex flex-col gap-6 text-center animate-fade-in">
              <div className="h-12 w-12 rounded-full bg-accent-main/15 text-accent-main flex items-center justify-center mx-auto border border-accent-main/30">
                <Building2 size={22} />
              </div>
              
              <div className="flex flex-col gap-1">
                <h1 className="font-display text-2xl font-light text-txt-main">Leaderboard Locked</h1>
                <p className="text-xs text-txt-sub">
                  LynDesk leaderboards are private. Please enter your college registrar code or company access key to view your local standings.
                </p>
              </div>

              <Link
                href="/profile"
                className="h-10 bg-accent-main hover:opacity-90 text-bg-base text-xs font-mono uppercase tracking-wider rounded-sm transition-opacity flex items-center justify-center font-bold"
              >
                Go to Profile Settings &rarr;
              </Link>
            </div>
          </div>
        ) : (
          /* Main Leaderboard Panel */
          <div className="flex-grow flex flex-col min-h-0 gap-6">
            
            {/* Header Banner */}
            <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-border-main/40 pb-4 gap-4 flex-shrink-0">
              <div className="flex flex-col gap-1">
                <span className="font-mono text-[9px] uppercase tracking-widest text-txt-muted flex items-center gap-1.5">
                  <ShieldCheck size={12} className="text-accent-main" /> Verified Local Arena
                </span>
                <h1 className="font-display text-3xl font-light tracking-tight text-txt-main">
                  {institutionName} Standings
                </h1>
                <p className="text-xs text-txt-sub">Rankings are calculated dynamically based on verified campus credits and coding solves.</p>
              </div>

              {/* Sub tabs */}
              <div className="flex border border-border-main/80 rounded p-0.5 bg-bg-card/50 self-start font-mono text-[10px] tracking-wider uppercase">
                <button 
                  onClick={() => setActiveTab("active")}
                  className={`px-3 py-1.5 rounded-sm transition-colors cursor-pointer ${
                    activeTab === "active" ? "bg-accent-main text-bg-base" : "text-txt-sub hover:text-txt-main"
                  }`}
                >
                  Active Members
                </button>
                <button 
                  onClick={() => setActiveTab("legacy")}
                  className={`px-3 py-1.5 rounded-sm transition-colors cursor-pointer ${
                    activeTab === "legacy" ? "bg-accent-main text-bg-base" : "text-txt-sub hover:text-txt-main"
                  }`}
                >
                  Legacy Forever Board
                </button>
                <button 
                  onClick={() => setActiveTab("department")}
                  className={`px-3 py-1.5 rounded-sm transition-colors cursor-pointer ${
                    activeTab === "department" ? "bg-accent-main text-bg-base" : "text-txt-sub hover:text-txt-main"
                  }`}
                >
                  Department wise
                </button>
              </div>
            </div>

            {/* Leaderboard Lists */}
            <div className="flex-grow overflow-y-auto pr-1">
              
              {/* 1. Active Members tab */}
              {activeTab === "active" && (
                <div className="flex flex-col border border-border-main/60 bg-bg-surface rounded-md divide-y divide-border-main/60">
                  {sortedActive.map((std) => (
                    <div 
                      key={std.username} 
                      className={`p-4 flex justify-between items-center gap-4 transition-colors ${
                        std.isCurrentUser ? "bg-accent-main/5 border-l-2 border-accent-main" : "hover:bg-bg-card/25"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-8 flex justify-center flex-shrink-0">
                          {getRankBadge(std.rank)}
                        </div>
                        <div className="w-10 h-10 rounded-full border border-border-main bg-bg-card flex items-center justify-center font-mono text-sm font-bold text-txt-main select-none flex-shrink-0">
                          {std.name.charAt(0)}
                        </div>
                        <div className="flex flex-col">
                          <div className="flex items-baseline gap-2">
                            <span className="text-xs text-txt-main font-semibold flex items-center gap-1.5">
                              {std.name} 
                              {std.isCurrentUser && <span className="text-[8px] font-mono tracking-wider bg-accent-main text-bg-base px-1 py-0.5 rounded uppercase font-bold">You</span>}
                            </span>
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
                          <span className="text-[8px] text-txt-muted uppercase tracking-wider">Score Balance</span>
                          <span className="text-txt-main font-bold flex items-center gap-1">
                            <Award size={12} className="text-accent-main" />
                            {std.points}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* 2. Legacy Forever Board tab */}
              {activeTab === "legacy" && (
                <div className="flex flex-col gap-4">
                  <div className="bg-bg-card/20 p-4 border border-border-main/50 rounded-md text-[10px] text-txt-sub font-light leading-relaxed flex items-center gap-2">
                    <Sparkles size={14} className="text-accent-main" />
                    <strong> Historic Archive Standings</strong>: Former members and graduates of this institution have their access keys unlinked and connection metadata frozen to preserve historic project records.
                  </div>

                  <div className="flex flex-col border border-border-main/60 bg-bg-surface rounded-md divide-y divide-border-main/60">
                    {legacyMembers.map((std) => (
                      <div 
                        key={std.username} 
                        className="p-4 flex justify-between items-center gap-4 hover:bg-bg-card/20 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-8 flex justify-center flex-shrink-0">
                            {getRankBadge(std.rank)}
                          </div>
                          <div className="w-10 h-10 rounded-full border border-border-main bg-bg-card/60 flex items-center justify-center font-mono text-sm font-bold text-txt-muted select-none flex-shrink-0">
                            {std.name.charAt(0)}
                          </div>
                          <div className="flex flex-col">
                            <div className="flex items-baseline gap-2">
                              <span className="text-xs text-txt-muted font-semibold">{std.name}</span>
                              <span className="text-[9px] text-txt-muted font-mono">@{std.username}</span>
                            </div>
                            <span className="text-[10px] text-txt-muted font-light">{std.department} • <span className="font-mono text-[9px]">{std.gradYear}</span></span>
                          </div>
                        </div>

                        <div className="flex items-center gap-8 font-mono text-xs">
                          <div className="hidden sm:flex flex-col items-end">
                            <span className="text-[8px] text-txt-muted uppercase tracking-wider">Historic Projects</span>
                            <span className="text-txt-muted font-medium">{std.completed} Projects</span>
                          </div>
                          
                          <div className="flex flex-col items-end">
                            <span className="text-[8px] text-txt-muted uppercase tracking-wider">Frozen Score</span>
                            <span className="text-txt-muted font-bold flex items-center gap-1">
                              <Award size={12} className="text-txt-muted" />
                              {std.points}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 3. Department wise tab */}
              {activeTab === "department" && (
                <div className="flex flex-col gap-4">
                  {/* Selector Dropdown */}
                  <div className="flex items-center gap-2 bg-bg-card/10 border border-border-main/50 p-3 rounded-md self-start flex-shrink-0">
                    <label className="text-[10px] font-mono uppercase text-txt-muted">Filter Department:</label>
                    <select
                      value={selectedDept}
                      onChange={(e) => setSelectedDept(e.target.value)}
                      className="h-8 px-2 border border-border-main bg-bg-base text-txt-main text-xs focus:outline-none focus:border-txt-main rounded-sm cursor-pointer"
                    >
                      {departments.map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col border border-border-main/60 bg-bg-surface rounded-md divide-y divide-border-main/60">
                    {departmentMembers.length > 0 ? (
                      departmentMembers.map((std, idx) => (
                        <div 
                          key={std.username} 
                          className={`p-4 flex justify-between items-center gap-4 transition-colors ${
                            std.isCurrentUser ? "bg-accent-main/5 border-l-2 border-accent-main" : "hover:bg-bg-card/25"
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-8 flex justify-center flex-shrink-0">
                              {getRankBadge(idx + 1)}
                            </div>
                            <div className="w-10 h-10 rounded-full border border-border-main bg-bg-card flex items-center justify-center font-mono text-sm font-bold text-txt-main select-none flex-shrink-0">
                              {std.name.charAt(0)}
                            </div>
                            <div className="flex flex-col">
                              <div className="flex items-baseline gap-2">
                                <span className="text-xs text-txt-main font-semibold flex items-center gap-1.5">
                                  {std.name} 
                                  {std.isCurrentUser && <span className="text-[8px] font-mono tracking-wider bg-accent-main text-bg-base px-1 py-0.5 rounded uppercase font-bold">You</span>}
                                </span>
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
                              <span className="text-[8px] text-txt-muted uppercase tracking-wider">Score Balance</span>
                              <span className="text-txt-main font-bold flex items-center gap-1">
                                <Award size={12} className="text-accent-main" />
                                {std.points}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center text-xs font-mono text-txt-muted uppercase">
                        No active members found in this department.
                      </div>
                    )}
                  </div>
                </div>
              )}

            </div>
          </div>
        )}

      </main>
    </div>
  );
}
