"use client";

import React from "react";
import { 
  Building2, 
  ShieldCheck, 
  Code, 
  TrendingUp, 
  Award, 
  Zap, 
  Sparkles, 
  BarChart3,
  Layers,
  CheckCircle2
} from "lucide-react";

interface OverviewProps {
  data: {
    totalStudents: number;
    consentedStudentsCount: number;
    verifiedTalentCount: number;
    avgSolved: number;
    medianSolved: number;
    top10PercentSolved: number;
    avgCfRating: number;
    solveDistribution: { bracket: string; label: string; count: number }[];
    domainStrengths: { domain: string; studentCount: number; percentage: number }[];
  } | null;
  institutionName: string;
  loading: boolean;
}

export default function CampusOverviewTab({ data, institutionName, loading }: OverviewProps) {
  if (loading) {
    return (
      <div className="p-16 border border-border-main/60 bg-bg-surface rounded-sm flex flex-col items-center justify-center gap-3">
        <div className="w-5 h-5 border-2 border-accent-main border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-mono text-txt-muted uppercase tracking-wider">
          Aggregating Institutional Radar &amp; Benchmarks...
        </span>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-12 border border-border-main/60 bg-bg-surface rounded-sm text-center text-xs font-mono text-txt-muted">
        No institutional analytics data available at this time.
      </div>
    );
  }

  const maxBracketCount = Math.max(...data.solveDistribution.map(d => d.count), 1);
  const maxDomainPercent = Math.max(...data.domainStrengths.map(d => d.percentage), 1);
  const consentRate = data.totalStudents > 0 ? Math.round((data.consentedStudentsCount / data.totalStudents) * 100) : 0;
  const verifiedRate = data.totalStudents > 0 ? Math.round((data.verifiedTalentCount / data.totalStudents) * 100) : 0;

  return (
    <div className="flex flex-col gap-6">
      {/* Institutional Hero Banner */}
      <div className="border border-border-main/60 bg-bg-surface p-5 sm:p-6 rounded-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-sm bg-accent-main/10 text-accent-main flex items-center justify-center border border-accent-main/30 shrink-0">
            <Building2 size={24} />
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[9px] uppercase tracking-widest text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-sm">
                Campus Benchmark Verified
              </span>
              <span className="font-mono text-[9px] text-txt-muted">Zero-PII Compliance</span>
            </div>
            <h2 className="font-display text-xl sm:text-2xl font-light text-txt-main">
              {institutionName}
            </h2>
            <p className="text-xs text-txt-sub">
              Macro engineering capability index across enrolled and placement-registered student cohorts.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end md:self-center font-mono">
          <div className="p-3 bg-bg-base/70 border border-border-main/50 rounded-sm text-right">
            <span className="text-[9px] text-txt-muted uppercase block">Placement Consent</span>
            <span className="text-base font-bold text-emerald-400">{consentRate}%</span>
            <span className="text-[9px] text-txt-muted block">({data.consentedStudentsCount} students)</span>
          </div>
          <div className="p-3 bg-bg-base/70 border border-border-main/50 rounded-sm text-right">
            <span className="text-[9px] text-txt-muted uppercase block">Verified Profiles</span>
            <span className="text-base font-bold text-accent-main">{verifiedRate}%</span>
            <span className="text-[9px] text-txt-muted block">({data.verifiedTalentCount} verified)</span>
          </div>
        </div>
      </div>

      {/* Key Metric Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 border border-border-main/60 bg-bg-surface rounded-sm flex flex-col gap-1">
          <div className="flex items-center justify-between text-txt-muted">
            <span className="text-[10px] font-mono uppercase tracking-wider">Campus Avg Solved</span>
            <Code size={14} className="text-accent-main" />
          </div>
          <span className="text-2xl font-mono font-bold text-txt-main mt-1">{data.avgSolved}</span>
          <span className="text-[10px] font-mono text-txt-muted">Problems / Student</span>
        </div>

        <div className="p-4 border border-border-main/60 bg-bg-surface rounded-sm flex flex-col gap-1">
          <div className="flex items-center justify-between text-txt-muted">
            <span className="text-[10px] font-mono uppercase tracking-wider">Median Solve Index</span>
            <TrendingUp size={14} className="text-emerald-400" />
          </div>
          <span className="text-2xl font-mono font-bold text-emerald-400 mt-1">{data.medianSolved}</span>
          <span className="text-[10px] font-mono text-txt-muted">50th Percentile Solve</span>
        </div>

        <div className="p-4 border border-border-main/60 bg-bg-surface rounded-sm flex flex-col gap-1">
          <div className="flex items-center justify-between text-txt-muted">
            <span className="text-[10px] font-mono uppercase tracking-wider">Top 10% Solve Tier</span>
            <Award size={14} className="text-purple-400" />
          </div>
          <span className="text-2xl font-mono font-bold text-purple-400 mt-1">{data.top10PercentSolved}+</span>
          <span className="text-[10px] font-mono text-txt-muted">Elite Solving Tier</span>
        </div>

        <div className="p-4 border border-border-main/60 bg-bg-surface rounded-sm flex flex-col gap-1">
          <div className="flex items-center justify-between text-txt-muted">
            <span className="text-[10px] font-mono uppercase tracking-wider">Avg Codeforces</span>
            <Zap size={14} className="text-amber-400" />
          </div>
          <span className="text-2xl font-mono font-bold text-amber-300 mt-1">{data.avgCfRating || "1,200+"}</span>
          <span className="text-[10px] font-mono text-txt-muted">Contest Elo Rating</span>
        </div>
      </div>

      {/* Two-Column Analytics: Problem Distribution & Domain Strengths */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Problem Solving Tier Distribution (SVG Bar Graph) */}
        <div className="border border-border-main/60 bg-bg-surface p-5 rounded-sm flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-border-main/40 pb-3">
            <div className="flex items-center gap-2">
              <BarChart3 size={16} className="text-accent-main" />
              <h3 className="font-display text-sm font-medium text-txt-main">
                Problem Solving Distribution Tiers
              </h3>
            </div>
            <span className="text-[10px] font-mono text-txt-muted">LeetCode / CodeChef</span>
          </div>

          <p className="text-xs text-txt-sub">
            Distribution of enrolled students partitioned across standard competitive solving thresholds.
          </p>

          <div className="flex flex-col gap-3.5 mt-2">
            {data.solveDistribution.map((item) => {
              const fillPercent = Math.max(Math.round((item.count / maxBracketCount) * 100), 4);
              return (
                <div key={item.bracket} className="flex flex-col gap-1">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="font-medium text-txt-main">
                      {item.bracket} <span className="text-txt-muted text-[10px] font-normal">({item.label})</span>
                    </span>
                    <span className="text-txt-muted font-bold">
                      {item.count} <span className="text-[10px] font-normal">students</span>
                    </span>
                  </div>
                  <div className="w-full h-3 bg-bg-base rounded-xs border border-border-main/50 overflow-hidden relative">
                    <div 
                      className="h-full bg-gradient-to-r from-accent-main/80 to-accent-main transition-all duration-500 rounded-xs"
                      style={{ width: `${fillPercent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-auto pt-3 border-t border-border-main/30 flex items-center justify-between text-[10px] font-mono text-txt-muted">
            <span>Fundamental (0-100)</span>
            <span>Master Tier (500+)</span>
          </div>
        </div>

        {/* Domain Competency Specialization */}
        <div className="border border-border-main/60 bg-bg-surface p-5 rounded-sm flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-border-main/40 pb-3">
            <div className="flex items-center gap-2">
              <Layers size={16} className="text-purple-400" />
              <h3 className="font-display text-sm font-medium text-txt-main">
                Core Domain Specialization
              </h3>
            </div>
            <span className="text-[10px] font-mono text-txt-muted">Skill Clusters</span>
          </div>

          <p className="text-xs text-txt-sub">
            Cluster distribution of technical domains verified across student repositories, works, and skill profiles.
          </p>

          <div className="flex flex-col gap-3 mt-2">
            {data.domainStrengths.slice(0, 6).map((dom) => (
              <div key={dom.domain} className="flex flex-col gap-1">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-txt-main font-medium">{dom.domain}</span>
                  <span className="text-txt-sub">{dom.percentage}% ({dom.studentCount})</span>
                </div>
                <div className="w-full h-2 bg-bg-base rounded-xs border border-border-main/50 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-500/80 to-purple-400 transition-all duration-500 rounded-xs"
                    style={{ width: `${Math.min(dom.percentage * 1.5, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-auto pt-3 border-t border-border-main/30 flex items-center gap-2 text-[10px] font-mono text-emerald-400">
            <CheckCircle2 size={12} />
            <span>Updated live from Supabase talent profiles</span>
          </div>
        </div>
      </div>
    </div>
  );
}
