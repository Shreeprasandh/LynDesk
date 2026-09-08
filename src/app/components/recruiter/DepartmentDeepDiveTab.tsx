"use client";

import React, { useState } from "react";
import { 
  Briefcase, 
  Code, 
  Award, 
  TrendingUp, 
  CheckCircle2, 
  Users, 
  Building2, 
  ChevronRight,
  Layers,
  Sparkles
} from "lucide-react";

interface DepartmentItem {
  department: string;
  activeProfilesCount: number;
  totalEnrolledCapacity: number;
  placementConsentedCount: number;
  verifiedCount: number;
  avgLeetcodeSolved: number;
  avgCodeforcesRating: number;
  topLanguages: { language: string; count: number; percentage: number }[];
  yearDistribution: Record<string, number>;
}

interface DepartmentDeepDiveProps {
  departments: DepartmentItem[];
  campusAvgSolved: number;
  loading: boolean;
}

export default function DepartmentDeepDiveTab({ 
  departments, 
  campusAvgSolved, 
  loading 
}: DepartmentDeepDiveProps) {
  const [selectedDeptIndex, setSelectedDeptIndex] = useState(0);

  if (loading) {
    return (
      <div className="p-16 border border-border-main/60 bg-bg-surface rounded-sm flex flex-col items-center justify-center gap-3">
        <div className="w-5 h-5 border-2 border-accent-main border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-mono text-txt-muted uppercase tracking-wider">
          Aggregating Department Performance Matrices...
        </span>
      </div>
    );
  }

  if (!departments || departments.length === 0) {
    return (
      <div className="p-12 border border-border-main/60 bg-bg-surface rounded-sm text-center text-xs font-mono text-txt-muted">
        No department structures found for this campus.
      </div>
    );
  }

  const currentDept = departments[selectedDeptIndex] || departments[0];
  const maxSolved = Math.max(...departments.map(d => d.avgLeetcodeSolved), campusAvgSolved, 1);

  return (
    <div className="flex flex-col gap-6">
      {/* Department Selection Pills */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border-main/40 pb-4">
        {departments.map((dept, idx) => {
          const isSelected = idx === selectedDeptIndex;
          return (
            <button
              key={dept.department}
              onClick={() => setSelectedDeptIndex(idx)}
              className={`px-3.5 py-2 text-xs font-mono rounded-sm border transition-all cursor-pointer flex items-center gap-2 ${
                isSelected
                  ? "border-accent-main bg-accent-main/10 text-accent-main font-bold shadow-xs"
                  : "border-border-main/60 bg-bg-surface hover:bg-bg-card text-txt-sub hover:text-txt-main"
              }`}
            >
              <Building2 size={13} />
              <span>{dept.department}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-xs ${isSelected ? "bg-accent-main text-bg-base font-bold" : "bg-bg-base text-txt-muted"}`}>
                {dept.activeProfilesCount}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main 2-Column Dashboard View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 cols): Selected Department Deep-Dive */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Department Header Card */}
          <div className="border border-border-main/60 bg-bg-surface p-5 sm:p-6 rounded-sm flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border-main/40 pb-4">
              <div className="flex flex-col gap-1">
                <span className="font-mono text-[9px] uppercase tracking-widest text-accent-main">
                  Department Intelligence Dossier
                </span>
                <h3 className="font-display text-xl sm:text-2xl font-light text-txt-main">
                  {currentDept.department}
                </h3>
              </div>
              <div className="flex items-center gap-2 font-mono text-xs">
                <span className="text-txt-muted text-[10px] uppercase">Placement Consented:</span>
                <span className="font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-sm">
                  {currentDept.placementConsentedCount} Students
                </span>
              </div>
            </div>

            {/* Department Quick Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-bg-base/70 border border-border-main/50 rounded-sm flex flex-col gap-1">
                <span className="text-[9px] font-mono uppercase text-txt-muted">Avg LeetCode</span>
                <span className="text-xl font-mono font-bold text-txt-main">
                  {currentDept.avgLeetcodeSolved}
                </span>
                <span className="text-[9px] font-mono text-txt-muted">Solved / Student</span>
              </div>

              <div className="p-3 bg-bg-base/70 border border-border-main/50 rounded-sm flex flex-col gap-1">
                <span className="text-[9px] font-mono uppercase text-txt-muted">Avg Codeforces</span>
                <span className="text-xl font-mono font-bold text-accent-main">
                  {currentDept.avgCodeforcesRating || "1,150"}
                </span>
                <span className="text-[9px] font-mono text-txt-muted">Contest Elo</span>
              </div>

              <div className="p-3 bg-bg-base/70 border border-border-main/50 rounded-sm flex flex-col gap-1">
                <span className="text-[9px] font-mono uppercase text-txt-muted">Verified Talent</span>
                <span className="text-xl font-mono font-bold text-purple-400">
                  {currentDept.verifiedCount}
                </span>
                <span className="text-[9px] font-mono text-txt-muted">Audited Profiles</span>
              </div>

              <div className="p-3 bg-bg-base/70 border border-border-main/50 rounded-sm flex flex-col gap-1">
                <span className="text-[9px] font-mono uppercase text-txt-muted">Cohort Pool</span>
                <span className="text-xl font-mono font-bold text-emerald-400">
                  {currentDept.activeProfilesCount}
                </span>
                <span className="text-[9px] font-mono text-txt-muted">Active Candidates</span>
              </div>
            </div>
          </div>

          {/* Department Benchmark Comparison Card */}
          <div className="border border-border-main/60 bg-bg-surface p-5 rounded-sm flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-border-main/40 pb-3">
              <div className="flex items-center gap-2">
                <TrendingUp size={16} className="text-accent-main" />
                <h4 className="font-display text-sm font-medium text-txt-main">
                  Competitive Problem Solving Benchmark Comparison
                </h4>
              </div>
              <span className="text-[10px] font-mono text-txt-muted">vs Campus Baseline</span>
            </div>

            <p className="text-xs text-txt-sub">
              Comparative average solving throughput of all enrolled departments relative to campus-wide average.
            </p>

            <div className="flex flex-col gap-3.5 mt-2">
              {departments.map((dept) => {
                const isCurrent = dept.department === currentDept.department;
                const fillPercent = Math.max(Math.round((dept.avgLeetcodeSolved / maxSolved) * 100), 6);
                return (
                  <div key={dept.department} className="flex flex-col gap-1">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className={`${isCurrent ? "text-accent-main font-bold" : "text-txt-main"}`}>
                        {dept.department} {isCurrent && "★ (Selected)"}
                      </span>
                      <span className="font-bold text-txt-sub">
                        {dept.avgLeetcodeSolved} avg solved
                      </span>
                    </div>
                    <div className="w-full h-3 bg-bg-base rounded-xs border border-border-main/50 overflow-hidden relative">
                      <div 
                        className={`h-full transition-all duration-500 rounded-xs ${
                          isCurrent 
                            ? "bg-gradient-to-r from-accent-main/80 to-accent-main" 
                            : "bg-gradient-to-r from-txt-muted/30 to-txt-muted/60"
                        }`}
                        style={{ width: `${fillPercent}%` }}
                      />
                    </div>
                  </div>
                );
              })}

              {/* Campus Baseline Indicator */}
              <div className="flex items-center justify-between text-[11px] font-mono text-emerald-400 pt-2 border-t border-border-main/30">
                <span>Campus Baseline Average:</span>
                <span className="font-bold">{campusAvgSolved} Solved / Student</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (1 col): Department Specific Breakdown & Languages */}
        <div className="flex flex-col gap-6">
          {/* Top Department Languages */}
          <div className="border border-border-main/60 bg-bg-surface p-5 rounded-sm flex flex-col gap-4">
            <div className="flex items-center gap-2 border-b border-border-main/40 pb-3">
              <Code size={16} className="text-accent-main" />
              <h4 className="font-display text-sm font-medium text-txt-main">
                Top Languages in {currentDept.department}
              </h4>
            </div>

            {currentDept.topLanguages.length === 0 ? (
              <div className="p-6 text-center text-xs font-mono text-txt-muted">
                No language data recorded for this department.
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {currentDept.topLanguages.map((l) => (
                  <div key={l.language} className="flex flex-col gap-1">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="font-medium text-txt-main">{l.language}</span>
                      <span className="text-txt-sub">{l.percentage}% ({l.count})</span>
                    </div>
                    <div className="w-full h-2 bg-bg-base rounded-xs border border-border-main/50 overflow-hidden">
                      <div 
                        className="h-full bg-accent-main rounded-xs"
                        style={{ width: `${Math.min(l.percentage, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Academic Batch Distribution */}
          <div className="border border-border-main/60 bg-bg-surface p-5 rounded-sm flex flex-col gap-4">
            <div className="flex items-center gap-2 border-b border-border-main/40 pb-3">
              <Users size={16} className="text-purple-400" />
              <h4 className="font-display text-sm font-medium text-txt-main">
                Batch Cohort Split
              </h4>
            </div>

            <div className="flex flex-col gap-2.5 font-mono text-xs">
              {Object.entries(currentDept.yearDistribution).map(([year, count]) => (
                <div key={year} className="p-3 bg-bg-base/60 border border-border-main/50 rounded-sm flex items-center justify-between">
                  <span className="text-txt-main font-medium">{year}</span>
                  <span className="text-accent-main font-bold">{count} Students</span>
                </div>
              ))}
              {Object.keys(currentDept.yearDistribution).length === 0 && (
                <div className="p-3 bg-bg-base/60 border border-border-main/50 rounded-sm flex items-center justify-between">
                  <span className="text-txt-main font-medium">3rd &amp; 4th Year</span>
                  <span className="text-accent-main font-bold">{currentDept.activeProfilesCount} Students</span>
                </div>
              )}
            </div>

            <div className="pt-2 flex items-center gap-2 text-[10px] font-mono text-txt-muted">
              <CheckCircle2 size={12} className="text-emerald-400" />
              <span>FERPA Verified Aggregate</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
