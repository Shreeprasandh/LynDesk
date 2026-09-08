"use client";

import React from "react";
import { 
  Trophy, 
  Award, 
  Sparkles, 
  ExternalLink, 
  CheckCircle2, 
  Globe, 
  TrendingUp, 
  Flame,
  ShieldCheck,
  FolderGit2
} from "lucide-react";

interface ContestAnalyticsProps {
  data: {
    totalHackathonsLogged: number;
    shortlistedCount: number;
    podiumCount: number;
    portalBreakdown: { portal: string; count: number; percentage: number }[];
    approvedCreditsTotal: number;
    verifiedProjectsTotal: number;
  } | null;
  loading: boolean;
}

export default function ContestsEventsTab({ data, loading }: ContestAnalyticsProps) {
  if (loading) {
    return (
      <div className="p-16 border border-border-main/60 bg-bg-surface rounded-sm flex flex-col items-center justify-center gap-3">
        <div className="w-5 h-5 border-2 border-accent-main border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-mono text-txt-muted uppercase tracking-wider">
          Aggregating Competitive Hackathon &amp; Contest Intelligence...
        </span>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-12 border border-border-main/60 bg-bg-surface rounded-sm text-center text-xs font-mono text-txt-muted">
        No competitive events records available.
      </div>
    );
  }

  const shortlistRate = data.totalHackathonsLogged > 0 
    ? Math.round((data.shortlistedCount / data.totalHackathonsLogged) * 100) 
    : 0;

  const podiumRate = data.totalHackathonsLogged > 0 
    ? Math.round((data.podiumCount / data.totalHackathonsLogged) * 100) 
    : 0;

  return (
    <div className="flex flex-col gap-6">
      {/* Top Banner */}
      <div className="border border-border-main/60 bg-bg-surface p-5 rounded-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-sm bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/30 shrink-0">
            <Trophy size={20} />
          </div>
          <div className="flex flex-col">
            <h3 className="font-display text-lg font-medium text-txt-main">
              Competitive Contests &amp; Hackathon Benchmark Matrix
            </h3>
            <p className="text-xs text-txt-sub">
              Verified participation rates, national hackathon shortlists, and podium finishes across premier technical portals.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 rounded-sm font-bold">
            {data.totalHackathonsLogged} Total Applications Verified
          </span>
        </div>
      </div>

      {/* 4-Card Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 border border-border-main/60 bg-bg-surface rounded-sm flex flex-col gap-1">
          <div className="flex items-center justify-between text-txt-muted">
            <span className="text-[10px] font-mono uppercase tracking-wider">Total Hackathons</span>
            <Flame size={14} className="text-amber-400" />
          </div>
          <span className="text-2xl font-mono font-bold text-txt-main mt-1">
            {data.totalHackathonsLogged}
          </span>
          <span className="text-[10px] font-mono text-txt-muted">Logged &amp; Tracked</span>
        </div>

        <div className="p-4 border border-border-main/60 bg-bg-surface rounded-sm flex flex-col gap-1">
          <div className="flex items-center justify-between text-txt-muted">
            <span className="text-[10px] font-mono uppercase tracking-wider">Shortlist / Round 2</span>
            <TrendingUp size={14} className="text-emerald-400" />
          </div>
          <span className="text-2xl font-mono font-bold text-emerald-400 mt-1">
            {data.shortlistedCount}
          </span>
          <span className="text-[10px] font-mono text-txt-muted">{shortlistRate}% Shortlist Rate</span>
        </div>

        <div className="p-4 border border-border-main/60 bg-bg-surface rounded-sm flex flex-col gap-1">
          <div className="flex items-center justify-between text-txt-muted">
            <span className="text-[10px] font-mono uppercase tracking-wider">Podium / Finalist</span>
            <Trophy size={14} className="text-purple-400" />
          </div>
          <span className="text-2xl font-mono font-bold text-purple-400 mt-1">
            {data.podiumCount}
          </span>
          <span className="text-[10px] font-mono text-txt-muted">{podiumRate}% Podium Rate</span>
        </div>

        <div className="p-4 border border-border-main/60 bg-bg-surface rounded-sm flex flex-col gap-1">
          <div className="flex items-center justify-between text-txt-muted">
            <span className="text-[10px] font-mono uppercase tracking-wider">Approved Credits</span>
            <Award size={14} className="text-accent-main" />
          </div>
          <span className="text-2xl font-mono font-bold text-accent-main mt-1">
            {data.approvedCreditsTotal} Pts
          </span>
          <span className="text-[10px] font-mono text-txt-muted">Institutional Credit Bank</span>
        </div>
      </div>

      {/* Two Column Visual Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Portal Distribution */}
        <div className="border border-border-main/60 bg-bg-surface p-5 rounded-sm flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-border-main/40 pb-3">
            <div className="flex items-center gap-2">
              <Globe size={16} className="text-accent-main" />
              <h4 className="font-display text-sm font-medium text-txt-main">
                Competition Portal Origin Breakdown
              </h4>
            </div>
            <span className="text-[10px] font-mono text-txt-muted">Tracked Portals</span>
          </div>

          <div className="flex flex-col gap-3.5 mt-1">
            {data.portalBreakdown.length === 0 ? (
              <div className="p-6 text-center text-xs font-mono text-txt-muted">
                No portal activity tracked yet.
              </div>
            ) : (
              data.portalBreakdown.map((item) => (
                <div key={item.portal} className="flex flex-col gap-1">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="font-medium text-txt-main">{item.portal}</span>
                    <span className="text-txt-sub">{item.percentage}% ({item.count})</span>
                  </div>
                  <div className="w-full h-2.5 bg-bg-base rounded-xs border border-border-main/50 overflow-hidden">
                    <div 
                      className="h-full bg-accent-main rounded-xs transition-all duration-500"
                      style={{ width: `${Math.max(item.percentage, 5)}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="mt-auto pt-3 border-t border-border-main/30 flex items-center justify-between text-[10px] font-mono text-txt-muted">
            <span>Aggregated across Unstop, Devpost, Major League Hacking</span>
            <CheckCircle2 size={12} className="text-emerald-400" />
          </div>
        </div>

        {/* Student Innovation Works & Open-Source Projects */}
        <div className="border border-border-main/60 bg-bg-surface p-5 rounded-sm flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-border-main/40 pb-3">
            <div className="flex items-center gap-2">
              <FolderGit2 size={16} className="text-purple-400" />
              <h4 className="font-display text-sm font-medium text-txt-main">
                Published Engineering Works &amp; Innovation
              </h4>
            </div>
            <span className="text-[10px] font-mono text-txt-muted">Works Registry</span>
          </div>

          <p className="text-xs text-txt-sub">
            Verified production-grade project repositories, research papers, and technical artifacts published on LynDesk Works Registry.
          </p>

          <div className="p-5 bg-bg-base/70 border border-border-main/50 rounded-sm flex items-center justify-between font-mono">
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] text-txt-muted uppercase">Verified Published Works</span>
              <span className="text-2xl font-bold text-txt-main">{data.verifiedProjectsTotal} Works</span>
            </div>
            <div className="h-10 w-10 rounded-sm bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/30">
              <FolderGit2 size={18} />
            </div>
          </div>

          <div className="flex flex-col gap-2 font-mono text-xs text-txt-sub">
            <div className="flex items-center justify-between p-2.5 bg-bg-base/40 rounded-xs border border-border-main/40">
              <span>Full-Stack &amp; Distributed Systems</span>
              <span className="text-accent-main font-bold">Verified Codebase</span>
            </div>
            <div className="flex items-center justify-between p-2.5 bg-bg-base/40 rounded-xs border border-border-main/40">
              <span>Artificial Intelligence &amp; Neural Nets</span>
              <span className="text-emerald-400 font-bold">Model Artifacts</span>
            </div>
          </div>

          <div className="mt-auto pt-2 flex items-center gap-1.5 text-[10px] font-mono text-txt-muted">
            <ShieldCheck size={12} className="text-emerald-400" />
            <span>Institutional IP Protection &amp; FERPA Zero-PII Enforced</span>
          </div>
        </div>
      </div>
    </div>
  );
}
