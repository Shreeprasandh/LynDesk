"use client";

import React, { use, useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";
import Link from "next/link";
import Header from "../../components/Header";
import { 
  ArrowLeft, 
  Paperclip, 
  Send, 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  FolderDown, 
  ExternalLink, 
  CheckCircle2, 
  Clock, 
  CloudUpload
} from "lucide-react";

const GithubIcon = ({ size = 14, className = "" }: { size?: number; className?: string }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
  </svg>
);

interface TeamMember {
  id: string;
  name: string;
  role: string;
  isOnline: boolean;
  isSpeaking?: boolean;
}

interface ChatMsg {
  id: string;
  sender_name: string;
  sender_role: string;
  content: string;
  created_at: string;
  isSystem?: boolean;
}

interface Artifact {
  id: string;
  file_name: string;
  file_url: string;
  version: number;
  is_active: boolean;
  uploaded_by: string;
  created_at: string;
}

export default function WorkspacePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user } = useAuth();

  // Project Details
  const [projectName, setProjectName] = useState("Loading Project...");
  const [eventTitle, setEventTitle] = useState("Hackathon Event");
  const [status, setStatus] = useState<"ideation" | "development" | "testing" | "submitted">("development");
  const [githubRepo, setGithubRepo] = useState("");
  const [liveDemo, setLiveDemo] = useState("");

  // Timeline / Stages
  const stages = ["Ideation", "Development", "Testing", "Submitted"];
  const stageDeadlines = [
    "Completed Oct 08",
    "Active (Target Oct 12)",
    "Target Oct 24",
    "Final submission Nov 02"
  ];

  // Voice/Video Room State
  const [inRoom, setInRoom] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(false);
  const [roomMembers, setRoomMembers] = useState<TeamMember[]>([
    { id: "m1", name: "Alex Carter", role: "Developer", isOnline: true, isSpeaking: false },
    { id: "m2", name: "Mira Sen", role: "Designer", isOnline: true, isSpeaking: false },
    { id: "m3", name: "Prof. Davis", role: "Mentor", isOnline: false },
  ]);

  // Chat Feed State
  const [chatMessages, setChatMessages] = useState<ChatMsg[]>([]);
  const [newMsg, setNewMsg] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Artifacts State
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Git Commits (live simulation list)
  const [commits, setCommits] = useState([
    { hash: "8f3e2b1", author: "Alex Carter", message: "refactor: optimize dynamic layout caching", time: "10 mins ago" },
    { hash: "2c7d9a0", author: "Alex Carter", message: "feat: establish state initializer hook in context", time: "1 hour ago" },
    { hash: "b4a9f82", author: "Mira Sen", message: "design: finalize paper-thin border color palette", time: "4 hours ago" }
  ]);

  // speaking simulation loop
  useEffect(() => {
    if (!inRoom) return;

    const interval = setInterval(() => {
      setRoomMembers(prev => prev.map(member => {
        if (member.isOnline && member.id !== "user-session") {
          // 30% chance to speak
          return {
            ...member,
            isSpeaking: Math.random() > 0.7
          };
        }
        return member;
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, [inRoom]);

  // Fetch Project Spaces & Chat Messages
  useEffect(() => {
    const fetchWorkspaceDetails = async () => {
      // Setup base/default states matching dynamic IDs
      if (id === "e1") {
        setProjectName("HealthVibe Workspace");
        setEventTitle("MIT HackHarvard 2026");
        setStatus("development");
        setGithubRepo("github.com/shreeprasandh/healthvibe");
        setLiveDemo("healthvibe.vercel.app");
      } else if (id === "e2") {
        setProjectName("CarbonTrace Portal");
        setEventTitle("Google Developer Hackathon");
        setStatus("ideation");
        setGithubRepo("github.com/shreeprasandh/carbontrace");
        setLiveDemo("carbontrace.dev");
      } else {
        // Fetch from Supabase
        try {
          const { data, error } = await supabase
            .from("project_spaces")
            .select(`
              *,
              events ( title )
            `)
            .eq("id", id)
            .single();

          if (!error && data) {
            setProjectName(data.project_name);
            setStatus(data.status);
            setGithubRepo(data.github_repo || "");
            setLiveDemo(data.live_demo_url || "");
            if (data.events) {
              setEventTitle(data.events.title);
            }
          } else {
            // Default mock setup if not found in db
            setProjectName("Student Vault Space");
            setEventTitle("Campus Track Hackathon");
            setStatus("development");
          }
        } catch (e) {
          console.error("Workspace fetch error: ", e);
        }
      }

      // Initial chat log load
      const initialLogs: ChatMsg[] = [
        { id: "c1", sender_name: "LDK:BOT", sender_role: "SYSTEM", content: "Workspace deck initialized successfully.", created_at: new Date(Date.now() - 36000000).toISOString(), isSystem: true },
        { id: "c2", sender_name: "Mira Sen", sender_role: "Designer", content: "I just uploaded the v1 presentation deck. Let me know if you need changes.", created_at: new Date(Date.now() - 18000000).toISOString() },
        { id: "c3", sender_name: "Alex Carter", sender_role: "Developer", content: "Awesome, starting integration. Repo is linked.", created_at: new Date(Date.now() - 12000000).toISOString() }
      ];
      setChatMessages(initialLogs);

      // Initial artifacts setup
      const initialArtifacts: Artifact[] = [
        { id: "art1", file_name: "Pitch_Deck_v1.pdf", file_url: "#", version: 1, is_active: true, uploaded_by: "Mira Sen", created_at: new Date(Date.now() - 18000000).toISOString() }
      ];
      setArtifacts(initialArtifacts);
    };

    fetchWorkspaceDetails();
  }, [id]);

  // Real-time Chat subscription
  useEffect(() => {
    // Subscribe to chat message inserts in Supabase for this project space
    const channel = supabase
      .channel(`project_chat:${id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: `project_space_id=eq.${id}`,
        },
        async (payload) => {
          // Fetch sender details
          const { data: profile } = await supabase
            .from("profiles")
            .select("username")
            .eq("id", payload.new.profile_id)
            .single();

          const incomingMsg: ChatMsg = {
            id: payload.new.id,
            sender_name: profile?.username || "Teammate",
            sender_role: "Developer",
            content: payload.new.content,
            created_at: payload.new.created_at,
          };

          setChatMessages((prev) => [...prev, incomingMsg]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);

  // Scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMsg.trim()) return;

    const myName = user?.email?.split("@")[0] || "You";
    const localMsg: ChatMsg = {
      id: `local_${Date.now()}`,
      sender_name: myName,
      sender_role: "Collaborator",
      content: newMsg.trim(),
      created_at: new Date().toISOString(),
    };

    // Update state locally first (optimistic)
    setChatMessages((prev) => [...prev, localMsg]);
    setNewMsg("");

    // Send to Supabase DB if user session exists and project is not in mocks
    if (user && id !== "e1" && id !== "e2") {
      try {
        await supabase.from("chat_messages").insert({
          project_space_id: id,
          profile_id: user.id,
          content: localMsg.content,
        });
      } catch (err) {
        console.error("Failed to sync chat message: ", err);
      }
    } else {
      // Simulate classmate responder in mock mode
      setTimeout(() => {
        const responses = [
          "Got it! I will check the commit history.",
          "Looks solid. I will review the artifacts shortly.",
          "Can we sync on the slide deck version?",
          "I am running local dev test now. Everything seems compiled!"
        ];
        const randomResp = responses[Math.floor(Math.random() * responses.length)];
        const systemResp: ChatMsg = {
          id: `bot_${Date.now()}`,
          sender_name: "Alex Carter",
          sender_role: "Developer",
          content: randomResp,
          created_at: new Date().toISOString(),
        };
        setChatMessages(prev => [...prev, systemResp]);
      }, 1500);
    }
  };

  const handleJoinRoom = () => {
    setInRoom(!inRoom);
    if (!inRoom) {
      // Add user to speaking list
      const myName = user?.email?.split("@")[0] || "You";
      setRoomMembers(prev => [
        ...prev,
        { id: "user-session", name: myName, role: "You", isOnline: true, isSpeaking: false }
      ]);
    } else {
      // Remove user from speaking list
      setRoomMembers(prev => prev.filter(member => member.id !== "user-session"));
      setIsMuted(false);
      setIsVideoOn(false);
    }
  };

  // Artifact file upload simulation
  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];

    setIsUploading(true);

    // Simulate upload delay
    setTimeout(() => {
      const myName = user?.email?.split("@")[0] || "You";
      const currentHighestVersion = artifacts
        .filter(a => a.file_name.split(".").pop() === file.name.split(".").pop())
        .reduce((max, a) => Math.max(max, a.version), 0);

      const nextVersion = currentHighestVersion + 1;

      // Deactivate previous active files of same type
      setArtifacts(prev => prev.map(art => {
        if (art.file_name.split(".").pop() === file.name.split(".").pop()) {
          return { ...art, is_active: false };
        }
        return art;
      }));

      const newArtifact: Artifact = {
        id: `art_${Date.now()}`,
        file_name: file.name,
        file_url: "#",
        version: nextVersion,
        is_active: true,
        uploaded_by: myName,
        created_at: new Date().toISOString()
      };

      setArtifacts(prev => [newArtifact, ...prev]);
      
      // Auto-post notification message in chat
      const systemNotice: ChatMsg = {
        id: `sys_${Date.now()}`,
        sender_name: "LDK:BOT",
        sender_role: "SYSTEM",
        content: `${myName} uploaded artifact: ${file.name} (v${nextVersion})`,
        created_at: new Date().toISOString(),
        isSystem: true
      };
      setChatMessages(prev => [...prev, systemNotice]);

      setIsUploading(false);
    }, 1500);
  };

  const updateGitRepository = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGithubRepo(e.target.value);
    // Add mock commit to list when repository updates
    if (e.target.value.includes("github.com/")) {
      const newCommit = {
        hash: Math.random().toString(16).substring(2, 9),
        author: user?.email?.split("@")[0] || "You",
        message: "chore: sync workflow configuration",
        time: "Just now"
      };
      setCommits(prev => [newCommit, ...prev]);
    }
  };

  return (
    <div className="h-screen overflow-hidden flex flex-col font-sans selection:bg-accent-main selection:text-bg-base">
      
      {/* Header (Unified Navigation & Notifications Drawer) */}
      <Header />

      {/* Main split workspace grid */}
      <main className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-0">
        
        {/* ================= COLUMN 1: STAGE TRACKER (3 Columns) ================= */}
        <section className="lg:col-span-3 border-r border-border-main/50 bg-bg-surface/30 flex flex-col h-full overflow-y-auto p-6 gap-6">
          <Link 
            href="/"
            className="flex items-center gap-2 text-[10px] text-txt-muted hover:text-txt-main transition-colors font-mono tracking-wider uppercase"
          >
            <ArrowLeft size={12} />
            Back to Registry
          </Link>

          <div className="flex flex-col gap-0.5 border-b border-border-main/40 pb-4">
            <span className="font-mono text-[9px] uppercase tracking-widest text-txt-muted">{eventTitle}</span>
            <h2 className="font-display text-lg font-light text-txt-main truncate">{projectName}</h2>
          </div>

          {/* Vertical Node Line */}
          <div className="relative flex flex-col gap-6 pl-4 py-2 flex-grow">
            <div className="absolute top-0 bottom-0 left-[21px] w-[1px] bg-border-main/60 z-0" />
            
            {stages.map((stg, idx) => {
              const isActive = status === stg.toLowerCase();
              const isPast = stages.indexOf(status.charAt(0).toUpperCase() + status.slice(1)) > idx;
              
              return (
                <div key={idx} className="relative z-10 flex gap-4 group cursor-help">
                  <div className={`h-4 w-4 rounded-full border-2 bg-bg-base flex items-center justify-center translate-y-0.5 transition-colors duration-200 ${
                    isActive 
                      ? "border-accent-main ring-4 ring-accent-main/10" 
                      : isPast 
                      ? "border-accent-main bg-accent-main" 
                      : "border-border-main"
                  }`}>
                    {isPast && <CheckCircle2 size={10} className="text-bg-base fill-accent-main" />}
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className={`text-xs font-semibold ${isActive ? "text-txt-main" : "text-txt-sub"}`}>{stg}</span>
                    <span className="text-[10px] text-txt-muted font-mono">{stageDeadlines[idx]}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Institutional verification trigger details */}
          <div className="border border-border-main/60 bg-bg-surface p-4 rounded-sm flex flex-col gap-2.5 mt-auto">
            <span className="font-mono text-[9px] tracking-widest uppercase text-txt-muted">University Verification</span>
            <p className="text-[10px] text-txt-sub leading-relaxed font-light">
              Once project milestones are completed, click to export cryptographic record summaries to coordinate university credits.
            </p>
            <button className="w-full h-8 bg-accent-main text-bg-base text-[10px] font-mono tracking-wider uppercase rounded-sm hover:opacity-90 transition-opacity">
              Export Credit Claim
            </button>
          </div>
        </section>

        {/* ================= COLUMN 2: COLLABORATIVE CHAT & AUDIO (6 Columns) ================= */}
        <section className="lg:col-span-6 border-r border-border-main/50 flex flex-col h-full bg-bg-base overflow-hidden">
          
          {/* Header strip: Voice channels & members */}
          <div className="h-14 border-b border-border-main/50 bg-bg-surface/50 backdrop-blur px-5 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              <span className="font-mono text-[9px] uppercase tracking-widest text-txt-muted">Ambient Room</span>
              <button 
                onClick={handleJoinRoom}
                className={`h-7 px-3 rounded-sm font-mono text-[9px] tracking-wider uppercase transition-colors flex items-center gap-1.5 ${
                  inRoom 
                    ? "bg-coral border border-coral text-white bg-red-500" 
                    : "border border-border-main/80 text-txt-main hover:bg-bg-card"
                }`}
              >
                {inRoom ? "Leave Call" : "Join Call"}
              </button>
            </div>

            {/* Speaking visual strip */}
            <div className="flex items-center gap-2.5">
              <span className="text-[9px] font-mono text-txt-muted uppercase tracking-wider hidden sm:inline">Active:</span>
              <div className="flex -space-x-2">
                {roomMembers.filter(m => m.isOnline).map(member => (
                  <div 
                    key={member.id} 
                    className={`w-6 h-6 rounded-full border border-bg-surface bg-bg-card flex items-center justify-center font-mono text-[8px] font-bold text-txt-main select-none transition-all duration-300 ${
                      member.isSpeaking ? "ring-2 ring-emerald-500 scale-105" : ""
                    }`}
                    title={`${member.name} (${member.role})`}
                  >
                    {member.name.charAt(0)}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Active room controls */}
          {inRoom && (
            <div className="bg-bg-surface/30 border-b border-border-main/50 px-5 py-2.5 flex items-center justify-between flex-shrink-0 animate-fade-in">
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] text-txt-sub font-light">Mic levels active</span>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => setIsMuted(!isMuted)}
                  className={`p-1.5 rounded border transition-colors ${
                    isMuted ? "bg-red-500/10 border-red-500 text-red-500" : "border-border-main hover:bg-bg-card text-txt-sub"
                  }`}
                >
                  {isMuted ? <MicOff size={12} /> : <Mic size={12} />}
                </button>
                <button 
                  onClick={() => setIsVideoOn(!isVideoOn)}
                  className={`p-1.5 rounded border transition-colors ${
                    isVideoOn ? "bg-emerald-500/10 border-emerald-500 text-emerald-500" : "border-border-main hover:bg-bg-card text-txt-sub"
                  }`}
                >
                  {isVideoOn ? <Video size={12} /> : <VideoOff size={12} />}
                </button>
              </div>
            </div>
          )}

          {/* Main Chat Stream */}
          <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
            {chatMessages.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex flex-col max-w-[85%] ${
                  msg.isSystem 
                    ? "self-center text-center py-1.5" 
                    : msg.sender_name === (user?.email?.split("@")[0] || "You") 
                    ? "self-end items-end" 
                    : "self-start items-start"
                }`}
              >
                {msg.isSystem ? (
                  <span className="text-[9px] font-mono tracking-widest text-txt-muted bg-bg-surface/50 border border-border-main/60 px-2.5 py-0.5 rounded uppercase">
                    {msg.content}
                  </span>
                ) : (
                  <>
                    <div className="flex items-baseline gap-2 mb-1 px-1">
                      <span className="text-[10px] font-mono font-semibold text-txt-main">{msg.sender_name}</span>
                      <span className="text-[8px] font-mono text-txt-muted uppercase tracking-wider">{msg.sender_role}</span>
                    </div>
                    <div className={`p-3 rounded-md text-xs leading-relaxed ${
                      msg.sender_name === (user?.email?.split("@")[0] || "You") 
                        ? "bg-accent-main text-bg-base rounded-tr-none font-normal" 
                        : "bg-bg-surface border border-border-main/70 text-txt-main rounded-tl-none font-light"
                    }`}>
                      {msg.content}
                    </div>
                  </>
                )}
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* Chat input box */}
          <form onSubmit={handleSendMessage} className="p-4 bg-bg-surface/30 border-t border-border-main/50 flex gap-2 flex-shrink-0 items-center">
            <button 
              type="button" 
              onClick={triggerFileUpload}
              className="p-2.5 rounded border border-border-main/80 text-txt-muted hover:text-txt-main hover:bg-bg-card transition-colors focus:outline-none"
              title="Attach File"
            >
              <Paperclip size={14} />
            </button>
            
            <input 
              type="text" 
              required
              placeholder="Send message to room deck..."
              value={newMsg}
              onChange={(e) => setNewMsg(e.target.value)}
              className="flex-1 h-10 px-3 border border-border-main/80 bg-bg-base text-txt-main rounded-sm text-xs placeholder:text-txt-muted/50 focus:outline-none focus:border-txt-main focus:ring-1 focus:ring-ring-main transition-colors font-light"
            />
            
            <button 
              type="submit" 
              className="h-10 px-4 rounded-sm bg-accent-main hover:opacity-90 text-bg-base text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-1.5 transition-opacity"
            >
              <Send size={12} />
              <span className="hidden sm:inline">Send</span>
            </button>
          </form>

        </section>

        {/* ================= COLUMN 3: ARTIFACT DECK & VERIFICATIONS (3 Columns) ================= */}
        <section className="lg:col-span-3 bg-bg-surface/30 flex flex-col h-full overflow-y-auto p-6 gap-6">
          
          <div className="flex flex-col gap-0.5 border-b border-border-main/40 pb-4">
            <span className="font-mono text-[9px] uppercase tracking-widest text-txt-muted">Decks & Codebases</span>
            <h2 className="font-display text-lg font-light text-txt-main">Artifact Registry</h2>
          </div>

          {/* GitHub Repo Integration Card */}
          <div className="border border-border-main/70 bg-bg-surface p-4 rounded-sm flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[9px] uppercase tracking-widest text-txt-muted">Git Repository</span>
              <GithubIcon size={14} className="text-txt-main" />
            </div>
            <input 
              type="text"
              placeholder="github.com/username/project"
              value={githubRepo}
              onChange={updateGitRepository}
              className="h-8 px-2.5 border border-border-main/80 bg-bg-base text-txt-main rounded-sm text-xs placeholder:text-txt-muted/50 focus:outline-none focus:border-txt-main transition-colors font-mono"
            />
            {githubRepo && (
              <a 
                href={`https://${githubRepo}`}
                target="_blank"
                rel="noreferrer"
                className="text-[10px] text-txt-muted hover:text-txt-main font-mono flex items-center gap-1.5 self-start transition-colors"
              >
                Open Codebase
                <ExternalLink size={10} />
              </a>
            )}
          </div>

          {/* Prototype Demo Card */}
          <div className="border border-border-main/70 bg-bg-surface p-4 rounded-sm flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[9px] uppercase tracking-widest text-txt-muted">Prototype Demo URL</span>
              <ExternalLink size={14} className="text-txt-main" />
            </div>
            <input 
              type="text"
              placeholder="project-demo.vercel.app"
              value={liveDemo}
              onChange={(e) => setLiveDemo(e.target.value)}
              className="h-8 px-2.5 border border-border-main/80 bg-bg-base text-txt-main rounded-sm text-xs placeholder:text-txt-muted/50 focus:outline-none focus:border-txt-main transition-colors font-mono"
            />
            {liveDemo && (
              <a 
                href={`https://${liveDemo}`}
                target="_blank"
                rel="noreferrer"
                className="text-[10px] text-txt-muted hover:text-txt-main font-mono flex items-center gap-1.5 self-start transition-colors"
              >
                Launch Prototype
                <ExternalLink size={10} />
              </a>
            )}
          </div>

          {/* Active Artifact Card */}
          <div className="border border-border-main/70 bg-bg-surface p-4 rounded-sm flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[9px] uppercase tracking-widest text-txt-muted">Active Artifacts</span>
              <FolderDown size={14} className="text-txt-main" />
            </div>

            <div className="flex flex-col gap-2.5">
              {artifacts.filter(a => a.is_active).map(art => (
                <div key={art.id} className="border border-border-main/60 p-3 rounded-sm flex flex-col gap-1.5 hover:bg-bg-card transition-colors duration-150 relative group">
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-xs text-txt-main font-semibold truncate max-w-[80%]">{art.file_name}</span>
                    <span className="text-[9px] font-mono text-txt-muted uppercase">v{art.version}</span>
                  </div>
                  <div className="flex justify-between items-center text-[9px] text-txt-muted font-mono">
                    <span>by {art.uploaded_by}</span>
                    <a href={art.file_url} className="text-txt-main hover:underline flex items-center gap-1">
                      Download
                      <FolderDown size={9} />
                    </a>
                  </div>
                </div>
              ))}

              {artifacts.length === 0 && (
                <span className="text-[10px] text-txt-muted font-light italic">No files uploaded yet.</span>
              )}
            </div>

            {/* File upload hidden input */}
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
              className="hidden" 
              accept=".pdf,.ppt,.pptx,.doc,.docx"
            />

            <button 
              onClick={triggerFileUpload}
              disabled={isUploading}
              className="w-full h-8 border border-border-main/80 border-dashed text-[10px] font-mono tracking-wider uppercase rounded-sm hover:bg-bg-card flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
            >
              {isUploading ? (
                <>
                  <span className="h-3 w-3 rounded-full border border-txt-main/30 border-t-txt-main animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <CloudUpload size={12} />
                  Upload Deck/PDF
                </>
              )}
            </button>
          </div>

          {/* History drawer list */}
          <div className="border border-border-main/70 bg-bg-surface p-4 rounded-sm flex flex-col gap-3">
            <span className="font-mono text-[9px] uppercase tracking-widest text-txt-muted">Version History</span>
            <div className="flex flex-col gap-2">
              {artifacts.filter(a => !a.is_active).map(art => (
                <div key={art.id} className="flex items-center justify-between border-b border-border-main/40 pb-2 text-[10px] font-mono">
                  <div className="flex flex-col min-w-0">
                    <span className="text-txt-sub truncate">{art.file_name}</span>
                    <span className="text-[8px] text-txt-muted">v{art.version} • {art.uploaded_by}</span>
                  </div>
                  <a href={art.file_url} className="text-txt-main hover:underline flex-shrink-0">
                    Get
                  </a>
                </div>
              ))}

              {artifacts.filter(a => !a.is_active).length === 0 && (
                <span className="text-[10px] text-txt-muted font-light italic text-center py-2">No archived versions.</span>
              )}
            </div>
          </div>

          {/* Live Git Commit Ticker */}
          <div className="border border-border-main/70 bg-bg-surface p-4 rounded-sm flex flex-col gap-3 mt-auto">
            <div className="flex items-center justify-between border-b border-border-main/40 pb-2">
              <span className="font-mono text-[9px] uppercase tracking-widest text-txt-muted">Git Commit Feed</span>
              <Clock size={11} className="text-txt-main animate-pulse" />
            </div>
            <div className="flex flex-col gap-3">
              {commits.map((c, idx) => (
                <div key={idx} className="flex flex-col gap-0.5 font-mono text-[10px]">
                  <div className="flex justify-between items-center text-txt-main font-semibold">
                    <span className="text-txt-muted font-normal">[{c.hash}]</span>
                    <span>{c.author}</span>
                  </div>
                  <p className="text-[9px] text-txt-sub leading-normal truncate">{c.message}</p>
                  <span className="text-[8px] text-txt-muted self-end mt-0.5">{c.time}</span>
                </div>
              ))}
            </div>
          </div>

        </section>

      </main>

    </div>
  );
}
