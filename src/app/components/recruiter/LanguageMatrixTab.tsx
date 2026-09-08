"use client";

import React from "react";
import { 
  Code2, 
  Layers, 
  Cpu, 
  TrendingUp, 
  CheckCircle2, 
  Sparkles,
  BarChart2
} from "lucide-react";

interface LanguageItem {
  language: string;
  studentCount: number;
  sharePercentage: number;
  avgSolved: number;
}

interface DepartmentItem {
  department: string;
  activeProfilesCount: number;
  topLanguages: { language: string; count: number; percentage: number }[];
}

interface LanguageMatrixProps {
  languages: LanguageItem[];
  departments: DepartmentItem[];
  loading: boolean;
}

const LANGUAGE_COLOR_MAP: Record<string, string> = {
  Python: "#3776AB",
  "C++": "#00599C",
  Java: "#b07219",
  TypeScript: "#3178C6",
  JavaScript: "#F7DF1E",
  C: "#555555",
  Go: "#00ADD8",
  Rust: "#DEA584",
  SQL: "#E38C00",
  Kotlin: "#A97BFF",
  Swift: "#F05138",
  "C#": "#178600"
};

export default function LanguageMatrixTab({ 
  languages, 
  departments, 
  loading 
}: LanguageMatrixProps) {
  if (loading) {
    return (
      <div className="p-16 border border-border-main/60 bg-bg-surface rounded-sm flex flex-col items-center justify-center gap-3">
        <div className="w-5 h-5 border-2 border-accent-main border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-mono text-txt-muted uppercase tracking-wider">
          Compiling Polyglot Language Matrix...
        </span>
      </div>
    );
  }

  if (!languages || languages.length === 0) {
    return (
      <div className="p-12 border border-border-main/60 bg-bg-surface rounded-sm text-center text-xs font-mono text-txt-muted">
        No language adoption data recorded yet across candidate profiles.
      </div>
    );
  }

  const maxStudentCount = Math.max(...languages.map(l => l.studentCount), 1);
  const maxAvgSolved = Math.max(...languages.map(l => l.avgSolved), 1);

  return (
    <div className="flex flex-col gap-6">
      {/* Top Banner */}
      <div className="border border-border-main/60 bg-bg-surface p-5 rounded-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-sm bg-accent-main/10 text-accent-main flex items-center justify-center border border-accent-main/30 shrink-0">
            <Code2 size={20} />
          </div>
          <div className="flex flex-col">
            <h3 className="font-display text-lg font-medium text-txt-main">
              Institutional Programming Language &amp; Stack Matrix
            </h3>
            <p className="text-xs text-txt-sub">
              Empirical frequency, candidate share, and problem-solving correlation across all recognized languages.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 font-mono text-xs text-txt-muted">
          <span className="text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-sm">
            {languages.length} Active Languages Mapped
          </span>
        </div>
      </div>

      {/* Grid: Language Distribution & Solving Efficiency */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Language Adoption Share (Horizontal Bar Graph) */}
        <div className="border border-border-main/60 bg-bg-surface p-5 rounded-sm flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-border-main/40 pb-3">
            <div className="flex items-center gap-2">
              <BarChart2 size={16} className="text-accent-main" />
              <h4 className="font-display text-sm font-medium text-txt-main">
                Campus Language Adoption Share
              </h4>
            </div>
            <span className="text-[10px] font-mono text-txt-muted">% of Enrolled Pool</span>
          </div>

          <div className="flex flex-col gap-3.5 mt-1">
            {languages.slice(0, 8).map((l) => {
              const barWidth = Math.max(Math.round((l.studentCount / maxStudentCount) * 100), 5);
              const color = LANGUAGE_COLOR_MAP[l.language] || "var(--accent-main)";
              return (
                <div key={l.language} className="flex flex-col gap-1">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                      <span className="font-medium text-txt-main">{l.language}</span>
                    </div>
                    <span className="font-bold text-txt-sub">
                      {l.sharePercentage}% <span className="text-txt-muted font-normal text-[10px]">({l.studentCount} students)</span>
                    </span>
                  </div>
                  <div className="w-full h-3 bg-bg-base rounded-xs border border-border-main/50 overflow-hidden relative">
                    <div 
                      className="h-full rounded-xs transition-all duration-500"
                      style={{ 
                        width: `${barWidth}%`,
                        backgroundColor: color 
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Problem Solving Throughput per Language */}
        <div className="border border-border-main/60 bg-bg-surface p-5 rounded-sm flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-border-main/40 pb-3">
            <div className="flex items-center gap-2">
              <TrendingUp size={16} className="text-purple-400" />
              <h4 className="font-display text-sm font-medium text-txt-main">
                Avg Problems Solved by Primary Language
              </h4>
            </div>
            <span className="text-[10px] font-mono text-txt-muted">LeetCode / CodeChef Avg</span>
          </div>

          <div className="flex flex-col gap-3.5 mt-1">
            {languages.slice(0, 8).map((l) => {
              const barWidth = Math.max(Math.round((l.avgSolved / maxAvgSolved) * 100), 5);
              return (
                <div key={l.language} className="flex flex-col gap-1">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="font-medium text-txt-main">{l.language}</span>
                    <span className="font-bold text-accent-main">
                      {l.avgSolved} <span className="text-txt-muted font-normal text-[10px]">avg solved</span>
                    </span>
                  </div>
                  <div className="w-full h-3 bg-bg-base rounded-xs border border-border-main/50 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-purple-500/80 to-purple-400 rounded-xs transition-all duration-500"
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Department-by-Department Language Matrix Table */}
      <div className="border border-border-main/60 bg-bg-surface rounded-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-border-main/40 flex items-center justify-between font-mono text-xs">
          <div className="flex items-center gap-2">
            <Layers size={15} className="text-accent-main" />
            <span className="font-bold text-txt-main uppercase tracking-wider text-[11px]">
              Department-Wise Primary Stack Dominance
            </span>
          </div>
          <span className="text-[10px] text-txt-muted">Top 3 Languages per Department</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-bg-base/70 text-[10px] text-txt-muted uppercase border-b border-border-main/40">
              <tr>
                <th className="p-3.5">Department</th>
                <th className="p-3.5">Primary Language</th>
                <th className="p-3.5">Secondary Language</th>
                <th className="p-3.5">Tertiary Language</th>
                <th className="p-3.5 text-right">Cohort Size</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-main/30">
              {departments.map((dept) => {
                const lang1 = dept.topLanguages[0];
                const lang2 = dept.topLanguages[1];
                const lang3 = dept.topLanguages[2];
                return (
                  <tr key={dept.department} className="hover:bg-bg-base/50 transition-colors">
                    <td className="p-3.5 font-medium text-txt-main">
                      {dept.department}
                    </td>
                    <td className="p-3.5">
                      {lang1 ? (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-sm text-[10px] bg-accent-main/10 text-accent-main border border-accent-main/30 font-bold">
                          {lang1.language} ({lang1.percentage}%)
                        </span>
                      ) : (
                        <span className="text-txt-muted">—</span>
                      )}
                    </td>
                    <td className="p-3.5">
                      {lang2 ? (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-sm text-[10px] bg-bg-base text-txt-sub border border-border-main/50">
                          {lang2.language} ({lang2.percentage}%)
                        </span>
                      ) : (
                        <span className="text-txt-muted">—</span>
                      )}
                    </td>
                    <td className="p-3.5">
                      {lang3 ? (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-sm text-[10px] bg-bg-base text-txt-muted border border-border-main/40">
                          {lang3.language} ({lang3.percentage}%)
                        </span>
                      ) : (
                        <span className="text-txt-muted">—</span>
                      )}
                    </td>
                    <td className="p-3.5 text-right font-bold text-txt-main">
                      {dept.activeProfilesCount}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
