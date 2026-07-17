"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import Link from "next/link";
import Header from "../components/Header";
import { useAuth } from "../context/AuthContext";
import { 
  ArrowLeft, 
  Search, 
  UserPlus, 
  Check, 
  Plus, 
  Filter, 
  MapPin, 
  ExternalLink
} from "lucide-react";

interface ProfileItem {
  id: string;
  full_name: string;
  username: string;
  avatar_url: string;
  skills: string;
  bio: string;
  college_name: string;
  department: string;
  isOpenToTeam: boolean;
}

interface HackathonItem {
  id: string;
  title: string;
  deadline: string;
  location: "online" | "in_person" | "hybrid";
  level: "local" | "national" | "global";
  url: string;
  description: string;
}

export default function ExplorePage() {
  const { user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<"teammate_board" | "directory" | "events">("teammate_board");
  const [searchQuery, setSearchQuery] = useState("");
  const [skillFilter, setSkillFilter] = useState("");

  const [classmates, setClassmates] = useState<ProfileItem[]>([]);
  const [events, setEvents] = useState<HackathonItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [connectionStates, setConnectionStates] = useState<{ [key: string]: "none" | "pending" | "connected" }>({});
  const [invitingStates, setInvitingStates] = useState<{ [key: string]: boolean }>({});



  // Fetch classmates and events
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // 1. Fetch profiles from database
        const { data: profiles, error } = await supabase
          .from("profiles")
          .select("*")
          .limit(20);

        if (!error && profiles) {
          const formatted: ProfileItem[] = profiles.map(p => ({
            id: p.id,
            full_name: p.full_name || "Student Engineer",
            username: p.username || "student",
            avatar_url: p.avatar_url || "",
            skills: "React, Next.js, TypeScript, UI/UX", // Fallback skills
            bio: "Building clean codebases and minimal interfaces. Open to hackathons.",
            college_name: "MIT",
            department: "Computer Science",
            isOpenToTeam: Math.random() > 0.4 // Mock availability
          }));
          setClassmates(formatted);
        } else {
          // Fallback mock data
          const mocks: ProfileItem[] = [
            { id: "u1", full_name: "Alex Carter", username: "alexcarter", avatar_url: "", skills: "Rust, WebAssembly, Node.js, C++", bio: "Backend systems optimizer. Building high-throughput servers.", college_name: "Stanford University", department: "Computer Science", isOpenToTeam: true },
            { id: "u2", full_name: "Mira Sen", username: "mirasen", avatar_url: "", skills: "Figma, React, Tailwind, UI/UX", bio: "Product designer & frontend strategist. Focused on premium minimalism.", college_name: "MIT", department: "Design", isOpenToTeam: true },
            { id: "u3", full_name: "Nikhil Mehta", username: "nikmehta", avatar_url: "", skills: "Python, PyTorch, LangChain, FastAPI", bio: "Machine Learning researcher. Building AI agents and LLM orchestration layers.", college_name: "IIT Delhi", department: "Computer Science", isOpenToTeam: true },
            { id: "u4", full_name: "Sophia Vance", username: "sophiav", avatar_url: "", skills: "Solidify, Go, Kubernetes, Docker", bio: "Infrastructure developer. Devops enthusiast.", college_name: "Stanford University", department: "Electrical Engineering", isOpenToTeam: false }
          ];
          setClassmates(mocks);
        }

        // 2. Fetch hackathons
        const { data: dbEvents } = await supabase
          .from("events")
          .select("*")
          .limit(10);

        if (dbEvents && dbEvents.length > 0) {
          const formattedEvents: HackathonItem[] = dbEvents.map(e => ({
            id: e.id,
            title: e.title,
            deadline: new Date(e.registration_deadline).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
            location: e.location as "online" | "in_person" | "hybrid",
            level: e.level as "local" | "national" | "global",
            url: e.source_url || "https://lyndesk.com",
            description: "Official campus hackathon with university credit approval."
          }));
          setEvents(formattedEvents);
        } else {
          const mockEvents: HackathonItem[] = [
            { id: "ev1", title: "MIT HackHarvard 2026", deadline: "Oct 12, 2026", location: "hybrid", level: "global", url: "https://hackharvard.org", description: "Harvard's premier global hackathon. Tracks for Healthtech, EdTech, and Sustainability." },
            { id: "ev2", title: "Google Developer Hackathon", deadline: "Nov 02, 2026", location: "online", level: "national", url: "https://build.google.com", description: "National developer jam leveraging Google Cloud and AI agents." },
            { id: "ev3", title: "Stanford TreeHacks 2026", deadline: "Feb 18, 2026", location: "in_person", level: "global", url: "https://treehacks.com", description: "Stanford's landmark hackathon focusing on engineering solutions for social good." }
          ];
          setEvents(mockEvents);
        }

      } catch (err) {
        console.error("Explore fetch error: ", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleConnect = (id: string) => {
    setConnectionStates(prev => ({
      ...prev,
      [id]: prev[id] === "pending" ? "none" : "pending"
    }));
    
    // Simulate accepted connection request after 4 seconds
    if (connectionStates[id] !== "pending") {
      setTimeout(() => {
        setConnectionStates(prev => ({
          ...prev,
          [id]: "connected"
        }));
      }, 4000);
    }
  };

  const handleInviteToTeam = (id: string) => {
    setInvitingStates(prev => ({ ...prev, [id]: true }));
    setTimeout(() => {
      setInvitingStates(prev => ({ ...prev, [id]: false }));
      // Set to connected-like state or connection confirmation
      alert("Invitation sent successfully! They will receive a notification in their chat deck.");
    }, 1200);
  };

  // Filters logic
  const filteredClassmates = classmates.filter(c => {
    const matchesSearch = c.full_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          c.skills.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.username.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSkill = skillFilter === "" || c.skills.toLowerCase().includes(skillFilter.toLowerCase());
    return matchesSearch && matchesSkill;
  });

  const filteredEvents = events.filter(e => 
    e.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    e.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (authLoading) {
    return (
      <div className="h-screen bg-bg-base flex flex-col items-center justify-center font-mono text-xs text-txt-muted gap-2">
        <div className="w-4 h-4 border-2 border-accent-main border-t-transparent rounded-full animate-spin" />
        <span>Syncing session...</span>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="h-screen overflow-hidden flex flex-col font-sans selection:bg-accent-main selection:text-bg-base">
      
      {/* Header (Unified Navigation & Notifications Drawer) */}
      <Header />

      {/* Main content grid */}
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
            <span className="font-mono text-[9px] uppercase tracking-widest text-txt-muted">Matchmaking Arena</span>
            <h1 className="font-display text-3xl font-light tracking-tight text-txt-main">Explore Campus Registry</h1>
            <p className="text-xs text-txt-sub">Discover classmates, available team builders, and open hackathon stages.</p>
          </div>

          {/* Tab Navigation */}
          <div className="flex border border-border-main/80 rounded p-0.5 bg-bg-card/50 self-start font-mono text-[10px] tracking-wider uppercase">
            <button 
              onClick={() => { setActiveTab("teammate_board"); setSearchQuery(""); }}
              className={`px-3 py-1.5 rounded-sm transition-colors cursor-pointer ${
                activeTab === "teammate_board" ? "bg-accent-main text-bg-base" : "text-txt-sub hover:text-txt-main"
              }`}
            >
              Teammate Board
            </button>
            <button 
              onClick={() => { setActiveTab("directory"); setSearchQuery(""); }}
              className={`px-3 py-1.5 rounded-sm transition-colors cursor-pointer ${
                activeTab === "directory" ? "bg-accent-main text-bg-base" : "text-txt-sub hover:text-txt-main"
              }`}
            >
              Classmates
            </button>
            <button 
              onClick={() => { setActiveTab("events"); setSearchQuery(""); }}
              className={`px-3 py-1.5 rounded-sm transition-colors cursor-pointer ${
                activeTab === "events" ? "bg-accent-main text-bg-base" : "text-txt-sub hover:text-txt-main"
              }`}
            >
              Hackathons
            </button>
          </div>
        </div>

        {/* Search and filter bar */}
        <div className="flex flex-col sm:flex-row gap-3 items-center">
          <div className="relative flex-1 w-full">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-txt-muted" />
            <input 
              type="text"
              placeholder={
                activeTab === "events" 
                  ? "Search hackathon stages or locations..." 
                  : "Search classmates by name, skills, or username..."
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 pl-10 pr-4 border border-border-main/80 bg-bg-surface text-txt-main rounded-sm text-xs placeholder:text-txt-muted/50 focus:outline-none focus:border-txt-main transition-colors font-light"
            />
          </div>

          {activeTab !== "events" && (
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter size={12} className="text-txt-muted flex-shrink-0" />
              <select
                value={skillFilter}
                onChange={(e) => setSkillFilter(e.target.value)}
                className="h-11 px-3 border border-border-main/80 bg-bg-surface text-txt-main rounded-sm text-xs focus:outline-none focus:border-txt-main transition-colors w-full sm:w-44"
              >
                <option value="">All Skills</option>
                <option value="react">React / Frontend</option>
                <option value="rust">Rust / Systems</option>
                <option value="figma">Figma / UI/UX</option>
                <option value="python">Python / AI</option>
              </select>
            </div>
          )}
        </div>

        {/* Dynamic content rendering */}
        {loading ? (
          <div className="flex-1 overflow-y-auto pr-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-8">
              {[1, 2, 3, 4].map(n => (
                <div key={n} className="border border-border-main/40 bg-bg-surface/50 p-6 rounded-md flex flex-col gap-4 animate-pulse">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-border-main/20" />
                      <div className="flex flex-col gap-2">
                        <div className="h-3 w-28 bg-border-main/20 rounded-sm" />
                        <div className="h-2.5 w-36 bg-border-main/10 rounded-sm" />
                      </div>
                    </div>
                    <div className="h-4 w-14 bg-border-main/10 rounded-sm" />
                  </div>
                  <div className="h-3 w-full bg-border-main/10 rounded-sm" />
                  <div className="h-3 w-2/3 bg-border-main/10 rounded-sm" />
                  <div className="flex gap-2 pt-2 border-t border-border-main/20">
                    <div className="h-8 w-20 bg-border-main/20 rounded-sm" />
                    <div className="h-8 w-20 bg-border-main/10 rounded-sm" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto pr-1">
            
            {/* 1. Teammate Board */}
            {activeTab === "teammate_board" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-8">
                {filteredClassmates.filter(c => c.isOpenToTeam).map(c => (
                  <div key={c.id} className="border border-border-main/70 bg-bg-surface p-6 rounded-md flex flex-col gap-4 hover:shadow-[0_4px_16px_rgba(0,0,0,0.01)] transition-shadow duration-300">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full border border-border-main bg-bg-card flex items-center justify-center font-mono text-sm font-bold text-txt-main select-none">
                          {c.full_name.charAt(0)}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs text-txt-main font-semibold truncate">{c.full_name}</span>
                          <span className="text-[9px] text-txt-muted font-mono">@{c.username} • {c.college_name}</span>
                        </div>
                      </div>

                      <span className="text-[8px] font-mono tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/40 px-2 py-0.5 rounded uppercase">
                        Available
                      </span>
                    </div>

                    <p className="text-xs text-txt-sub font-light leading-relaxed">
                      {c.bio}
                    </p>

                    <div className="flex flex-wrap gap-1.5">
                      {c.skills.split(",").map((s, idx) => (
                        <span key={idx} className="text-[8px] font-mono text-txt-muted border border-border-main/80 px-2 py-0.5 rounded bg-bg-card/50">
                          {s.trim()}
                        </span>
                      ))}
                    </div>

                    <div className="flex gap-2 border-t border-border-main/40 pt-4 mt-2 justify-end">
                      <button 
                        onClick={() => handleConnect(c.id)}
                        className={`h-8 px-3 rounded-sm font-mono text-[9px] tracking-wider uppercase transition-colors flex items-center gap-1 cursor-pointer ${
                          connectionStates[c.id] === "connected"
                            ? "bg-bg-card text-emerald-500 border border-border-main"
                            : connectionStates[c.id] === "pending"
                            ? "bg-bg-card text-txt-muted border border-border-main"
                            : "border border-border-main/80 text-txt-main hover:bg-bg-card"
                        }`}
                      >
                        {connectionStates[c.id] === "connected" ? (
                          <><Check size={10} /> Linked</>
                        ) : connectionStates[c.id] === "pending" ? (
                          "Pending"
                        ) : (
                          <><UserPlus size={10} /> Connect</>
                        )}
                      </button>
                      
                      <button 
                        onClick={() => handleInviteToTeam(c.id)}
                        disabled={invitingStates[c.id]}
                        className="h-8 px-4 bg-accent-main text-bg-base font-mono text-[9px] tracking-wider uppercase rounded-sm hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50"
                      >
                        {invitingStates[c.id] ? "Inviting..." : "Invite to Team"}
                      </button>
                    </div>
                  </div>
                ))}

                {filteredClassmates.filter(c => c.isOpenToTeam).length === 0 && (
                  <div className="col-span-2 text-center py-12 text-xs text-txt-muted font-light italic">
                    No classmate candidates found matching this criteria.
                  </div>
                )}
              </div>
            )}

            {/* 2. Classmate Directory */}
            {activeTab === "directory" && (
              <div className="flex flex-col border border-border-main/60 bg-bg-surface rounded-md divide-y divide-border-main/60 pb-4">
                {filteredClassmates.map(c => (
                  <div key={c.id} className="p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-bg-card/20 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full border border-border-main bg-bg-card flex items-center justify-center font-mono text-sm font-bold text-txt-main select-none">
                        {c.full_name.charAt(0)}
                      </div>
                      <div className="flex flex-col">
                        <div className="flex items-baseline gap-2">
                          <span className="text-xs text-txt-main font-semibold">{c.full_name}</span>
                          <span className="text-[9px] text-txt-muted font-mono">@{c.username}</span>
                        </div>
                        <span className="text-[10px] text-txt-sub font-light">{c.department} • {c.college_name}</span>
                        <span className="text-[9px] text-txt-muted font-mono mt-0.5 truncate max-w-sm sm:max-w-md">{c.skills}</span>
                      </div>
                    </div>

                    <button 
                      onClick={() => handleConnect(c.id)}
                      className={`h-8 px-4 rounded-sm font-mono text-[9px] tracking-wider uppercase transition-colors flex items-center gap-1 cursor-pointer w-full sm:w-auto justify-center ${
                        connectionStates[c.id] === "connected"
                          ? "bg-bg-card text-emerald-500 border border-border-main"
                          : connectionStates[c.id] === "pending"
                          ? "bg-bg-card text-txt-muted border border-border-main"
                          : "border border-border-main/80 text-txt-main hover:bg-bg-card"
                      }`}
                    >
                      {connectionStates[c.id] === "connected" ? (
                        <><Check size={10} /> Linked</>
                      ) : connectionStates[c.id] === "pending" ? (
                        "Pending"
                      ) : (
                        <><UserPlus size={10} /> Connect</>
                      )}
                    </button>
                  </div>
                ))}

                {filteredClassmates.length === 0 && (
                  <div className="text-center py-12 text-xs text-txt-muted font-light italic">
                    No classmates discovered in this department.
                  </div>
                )}
              </div>
            )}

            {/* 3. Hackathon registry feed */}
            {activeTab === "events" && (
              <div className="flex flex-col gap-6 pb-8">
                {filteredEvents.map(e => (
                  <div key={e.id} className="border border-border-main/70 bg-bg-surface p-6 rounded-md flex flex-col gap-4 hover:shadow-[0_4px_16px_rgba(0,0,0,0.01)] transition-shadow duration-300">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex flex-col gap-1 min-w-0">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <h3 className="font-display text-base font-semibold text-txt-main">{e.title}</h3>
                          <span className="text-[8px] font-mono tracking-widest text-txt-muted uppercase border border-border-main/80 px-2 py-0.5 rounded bg-bg-card">
                            {e.level}
                          </span>
                        </div>
                        <a 
                          href={e.url} 
                          target="_blank" 
                          rel="noreferrer"
                          className="text-[9px] text-txt-muted hover:text-txt-main font-mono flex items-center gap-1 self-start transition-colors"
                        >
                          {e.url}
                          <ExternalLink size={10} />
                        </a>
                      </div>

                      <div className="flex flex-col items-end gap-0.5">
                        <span className="text-[9px] font-mono tracking-wider uppercase text-txt-muted">Deadline</span>
                        <span className="text-xs text-txt-main font-semibold">{e.deadline}</span>
                      </div>
                    </div>

                    <p className="text-xs text-txt-sub font-light leading-relaxed">
                      {e.description}
                    </p>

                    <div className="flex items-center justify-between border-t border-border-main/40 pt-4 mt-1">
                      <div className="flex items-center gap-1.5 text-[9px] text-txt-muted font-mono uppercase">
                        <MapPin size={10} />
                        {e.location}
                      </div>

                      <button className="h-8 px-4 rounded-sm bg-accent-main hover:opacity-90 text-bg-base font-mono text-[9px] tracking-wider uppercase transition-opacity cursor-pointer flex items-center gap-1">
                        <Plus size={10} /> Track Event Vault
                      </button>
                    </div>
                  </div>
                ))}

                {filteredEvents.length === 0 && (
                  <div className="text-center py-12 text-xs text-txt-muted font-light italic">
                    No hackathon events matched your query. Try adding one manually.
                  </div>
                )}
              </div>
            )}

          </div>
        )}

      </main>

    </div>
  );
}
