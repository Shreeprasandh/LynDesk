"use client";

import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import { useAuth } from "../context/AuthContext";
import { 
  Search, 
  ExternalLink, 
  Sparkles, 
  Trophy, 
  Newspaper, 
  Filter, 
  Calendar,
  Flame
} from "lucide-react";

interface OpportunityItem {
  id: string;
  title: string;
  category: "hackathon" | "contest" | "news";
  deadline: string;
  location: "online" | "in_person" | "hybrid";
  level: "local" | "national" | "global";
  url: string;
  description: string;
  facultyRecommended?: boolean;
  createdDate?: string;
}

export default function NewsContestsPage() {
  const { user, loading: authLoading } = useAuth();
  const [opportunities, setOpportunities] = useState<OpportunityItem[]>([]);
  const [searchOppQuery, setSearchOppQuery] = useState("");
  const [filterOppCategory, setFilterOppCategory] = useState("");
  const [filterOppLocation, setFilterOppLocation] = useState("");

  // Load opportunities from localStorage on mount and register active listener
  useEffect(() => {
    if (typeof window !== "undefined") {
      const loadOpps = () => {
        const stored = localStorage.getItem("ldk_opportunities");
        if (stored) {
          try {
            setOpportunities(JSON.parse(stored));
          } catch (err) {
            console.error("Failed parsing stored opportunities", err);
          }
        } else {
          const defaultOpps: OpportunityItem[] = [
            {
              id: "opp_1",
              title: "MIT HackHarvard 2026",
              category: "hackathon",
              deadline: "Oct 12, 2026",
              location: "hybrid",
              level: "global",
              url: "https://hackharvard.org",
              description: "Harvard's premier global hackathon. Tracks for Healthtech, EdTech, and Sustainability.",
              facultyRecommended: true,
              createdDate: "Oct 14"
            },
            {
              id: "opp_2",
              title: "Google Developer Hackathon India",
              category: "hackathon",
              deadline: "Nov 02, 2026",
              location: "online",
              level: "national",
              url: "https://build.google.com",
              description: "National developer jam leveraging Google Cloud and AI agents.",
              facultyRecommended: true,
              createdDate: "Oct 14"
            },
            {
              id: "opp_3",
              title: "Stanford TreeHacks 2026",
              category: "hackathon",
              deadline: "Feb 18, 2026",
              location: "in_person",
              level: "global",
              url: "https://treehacks.com",
              description: "Stanford's landmark hackathon focusing on engineering solutions for social good.",
              facultyRecommended: false,
              createdDate: "Oct 14"
            },
            {
              id: "opp_4",
              title: "Codeforces Round 990 (Div. 2)",
              category: "contest",
              deadline: "July 28, 2026",
              location: "online",
              level: "global",
              url: "https://codeforces.com",
              description: "Official Div. 2 programming contest with rating updates.",
              facultyRecommended: true,
              createdDate: "Oct 14"
            },
            {
              id: "opp_5",
              title: "LeetCode Weekly Contest 410",
              category: "contest",
              deadline: "July 26, 2026",
              location: "online",
              level: "global",
              url: "https://leetcode.com",
              description: "Weekly algorithmic challenge with globally ranked leaderboard.",
              facultyRecommended: false,
              createdDate: "Oct 14"
            },
            {
              id: "opp_6",
              title: "Smart India Hackathon (SIH) 2026",
              category: "hackathon",
              deadline: "Sept 15, 2026",
              location: "hybrid",
              level: "national",
              url: "https://sih.gov.in",
              description: "Nationwide initiative to provide students with a platform to solve pressing problems.",
              facultyRecommended: true,
              createdDate: "Oct 14"
            },
            {
              id: "opp_7",
              title: "Next.js 16 Conference Keynote Details",
              category: "news",
              deadline: "Oct 25, 2026",
              location: "online",
              level: "global",
              url: "https://nextjs.org/conf",
              description: "Vercel announces Next.js 16 featuring compiler optimizations and Server Component refinements.",
              facultyRecommended: false,
              createdDate: "Oct 14"
            }
          ];
          setOpportunities(defaultOpps);
          localStorage.setItem("ldk_opportunities", JSON.stringify(defaultOpps));
        }
      };

      loadOpps();
      window.addEventListener("ldk_opportunities_update", loadOpps);
      return () => window.removeEventListener("ldk_opportunities_update", loadOpps);
    }
  }, []);

  const hackathonsCount = opportunities.filter(o => o.category === "hackathon").length;
  const contestsCount = opportunities.filter(o => o.category === "contest").length;
  const newsCount = opportunities.filter(o => o.category === "news").length;

  const filteredOpportunities = opportunities.filter(opp => {
    const matchesSearch = opp.title.toLowerCase().includes(searchOppQuery.toLowerCase()) || 
                          opp.description.toLowerCase().includes(searchOppQuery.toLowerCase());
    const matchesCategory = filterOppCategory ? opp.category === filterOppCategory : true;
    const matchesLocation = filterOppLocation ? opp.location === filterOppLocation : true;
    return matchesSearch && matchesCategory && matchesLocation;
  });

  return (
    <div className="min-h-screen bg-bg-base text-txt-main flex flex-col selection:bg-accent-main/20">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">
        {/* Top Hero / Header banner */}
        <div className="border border-border-main/70 bg-bg-surface p-6 sm:p-8 rounded-lg flex flex-col gap-4 shadow-sm relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-accent-main" />
                <span className="font-mono text-[10px] uppercase tracking-widest text-accent-main font-bold">
                  Opportunity Board & Radar
                </span>
              </div>
              <h1 className="font-display text-2xl sm:text-3xl font-light text-txt-main tracking-tight">
                News & Contests
              </h1>
              <p className="text-xs sm:text-sm text-txt-sub max-w-2xl font-light leading-relaxed">
                Stay ahead with verified hackathons, algorithm contests, and faculty-recommended tech opportunities.
              </p>
            </div>

            {/* Quick Counters */}
            <div className="flex items-center gap-3 font-mono text-[10px] uppercase flex-wrap">
              <div className="bg-bg-card/40 border border-border-main/60 px-3 py-2 rounded-md flex flex-col items-center">
                <span className="text-txt-muted text-[8px] tracking-wider">Hackathons</span>
                <span className="text-txt-main font-bold text-sm">{hackathonsCount}</span>
              </div>
              <div className="bg-bg-card/40 border border-border-main/60 px-3 py-2 rounded-md flex flex-col items-center">
                <span className="text-txt-muted text-[8px] tracking-wider">Contests</span>
                <span className="text-txt-main font-bold text-sm">{contestsCount}</span>
              </div>
              <div className="bg-bg-card/40 border border-border-main/60 px-3 py-2 rounded-md flex flex-col items-center">
                <span className="text-txt-muted text-[8px] tracking-wider">Tech News</span>
                <span className="text-txt-main font-bold text-sm">{newsCount}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Faculty Recommended Section */}
        {opportunities.filter(o => o.facultyRecommended).length > 0 && (
          <div className="border border-amber-500/30 bg-amber-500/[0.04] p-5 sm:p-6 rounded-lg flex flex-col gap-4">
            <div className="flex items-center gap-2 text-amber-500 font-mono text-[10px] uppercase tracking-widest font-bold">
              <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
              🏫 Faculty Recommended Opportunities
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {opportunities.filter(o => o.facultyRecommended).map((opp) => (
                <div 
                  key={opp.id} 
                  className="bg-bg-surface/80 border border-amber-500/20 p-4 rounded-md flex flex-col justify-between gap-3 hover:border-amber-500/40 transition-colors"
                >
                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="text-sm font-semibold text-txt-main">{opp.title}</h3>
                      <span className="text-[8px] font-mono tracking-widest uppercase border border-amber-500/40 px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 font-bold shrink-0">
                        {opp.category}
                      </span>
                    </div>
                    <p className="text-xs text-txt-sub font-light leading-relaxed line-clamp-2">
                      {opp.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-border-main/30 text-[10px] font-mono">
                    <span className="text-txt-muted flex items-center gap-1">
                      <Calendar size={11} /> Deadline: <strong className="text-txt-main font-medium">{opp.deadline}</strong>
                    </span>
                    <a 
                      href={opp.url} 
                      target="_blank" 
                      rel="noreferrer"
                      className="text-amber-500 hover:text-amber-400 font-bold uppercase flex items-center gap-1 transition-colors"
                    >
                      Explore Opportunity <ExternalLink size={10} />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filter and Search controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-bg-surface p-4 border border-border-main/60 rounded-lg shadow-sm">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-txt-muted" />
            <input 
              type="text"
              value={searchOppQuery}
              onChange={(e) => setSearchOppQuery(e.target.value)}
              placeholder="Search hackathons, contests, tech news..."
              className="w-full h-9 pl-9 pr-3 border border-border-main/70 bg-bg-base text-txt-main text-xs focus:outline-none focus:border-accent-main rounded-md placeholder:text-txt-muted/50"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Filter size={13} className="text-txt-muted hidden sm:block" />
            <select
              value={filterOppCategory}
              onChange={(e) => setFilterOppCategory(e.target.value)}
              className="h-9 px-3 border border-border-main/70 bg-bg-base text-txt-main text-xs focus:outline-none focus:border-accent-main rounded-md cursor-pointer font-mono"
            >
              <option value="">All Categories</option>
              <option value="hackathon">Hackathons</option>
              <option value="contest">Contests</option>
              <option value="news">News & Updates</option>
            </select>

            <select
              value={filterOppLocation}
              onChange={(e) => setFilterOppLocation(e.target.value)}
              className="h-9 px-3 border border-border-main/70 bg-bg-base text-txt-main text-xs focus:outline-none focus:border-accent-main rounded-md cursor-pointer font-mono"
            >
              <option value="">All Locations</option>
              <option value="online">Online</option>
              <option value="in_person">In-Person</option>
              <option value="hybrid">Hybrid</option>
            </select>
          </div>
        </div>

        {/* Main Opportunities List */}
        <div className="border border-border-main/70 bg-bg-surface rounded-lg divide-y divide-border-main/50 overflow-hidden shadow-sm">
          {filteredOpportunities.length === 0 ? (
            <div className="p-12 text-center text-txt-muted font-mono text-xs uppercase tracking-wider flex flex-col items-center gap-2">
              <Trophy size={24} className="text-txt-muted/40" />
              <span>No matching opportunities found</span>
            </div>
          ) : (
            filteredOpportunities.map(opp => (
              <div 
                key={opp.id} 
                className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-bg-card/20 transition-colors"
              >
                <div className="flex flex-col min-w-0 gap-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm text-txt-main font-semibold">{opp.title}</span>
                    {opp.facultyRecommended && (
                      <span className="text-[8px] font-mono tracking-wider border border-amber-500/40 px-1.5 py-0.5 rounded uppercase font-bold text-amber-500 bg-amber-500/10">
                        Faculty Recommended
                      </span>
                    )}
                  </div>
                  
                  <p className="text-xs text-txt-sub font-light leading-relaxed max-w-2xl">
                    {opp.description}
                  </p>

                  <div className="flex items-center gap-2 mt-1 text-[9px] text-txt-muted uppercase font-mono flex-wrap">
                    <span className="bg-bg-card px-2 py-0.5 border border-border-main/50 rounded font-bold text-txt-main">
                      {opp.category}
                    </span>
                    <span>•</span>
                    <span>{opp.location}</span>
                    <span>•</span>
                    <span>{opp.level} level</span>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-border-main/30">
                  <span className="text-[10px] font-mono text-txt-muted">
                    Deadline: <strong className="text-txt-main">{opp.deadline}</strong>
                  </span>
                  <a 
                    href={opp.url}
                    target="_blank"
                    rel="noreferrer"
                    className="h-8 px-4 bg-accent-main hover:opacity-90 text-bg-base text-[10px] font-mono tracking-wider uppercase rounded-md flex items-center justify-center gap-1 font-bold transition-all"
                  >
                    Explore <ExternalLink size={11} />
                  </a>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
