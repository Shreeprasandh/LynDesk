"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { supabase } from "../lib/supabase";
import { extractAvatarFromUser } from "../lib/avatar";
import { syncEventDeskWithCalendar, deleteWallCalendarEvent } from "../lib/wallCalendarSync";
import Link from "next/link";
import Header from "../components/Header";
import Footer from "../components/Footer";
import LynDeskLoadingCard from "../components/LynDeskLoadingCard";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Link2, 
  Users, 
  Award, 
  ArrowRight, 
  Globe, 
  Mail,
  Plus,
  MapPin,
  ExternalLink,
  UserPlus,
  User,
  X,
  Eye,
  EyeOff,
  Edit2,
  ChevronUp,
  ChevronDown,
  ArrowUpDown,
  Trash2,
  LogOut,
  Copy,
  Calendar,
  SlidersHorizontal
} from "lucide-react";
import PreferencePresetModal from "../components/PreferencePresetModal";
import { prefetchWorkspace, scheduleIdlePrefetch } from "../lib/workspacePrefetch";

// Brand Icon Helpers
const DiscordIcon = ({ size = 14 }: { size?: number }) => (
  <svg viewBox="0 0 127.14 96.36" width={size} height={size} fill="currentColor">
    <path d="M107.7,8.07A105.15,105.15,0,0,0,77.26,0a77.19,77.19,0,0,0-3.3,6.83A96.67,96.67,0,0,0,53.22,6.83,77.19,77.19,0,0,0,49.88,0,105.15,105.15,0,0,0,19.44,8.07C3.66,31.58-1.86,54.65,1,77.53A105.73,105.73,0,0,0,32,96.36a77.7,77.7,0,0,0,6.63-10.85,68.43,68.43,0,0,1-10.5-5c.9-.65,1.76-1.34,2.58-2a75.58,75.58,0,0,0,73.08,0c.83.71,1.69,1.4,2.59,2a68.61,68.61,0,0,1-10.5,5,77.45,77.45,0,0,0,6.63,10.85,105.73,105.73,0,0,0,31.58-18.83C129.24,49.07,122.86,26.32,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53S36.18,40.36,42.45,40.36,53.83,46,53.83,53,48.72,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.24,60,73.24,53S78.41,40.36,84.69,40.36,96.07,46,96.07,53,91,65.69,84.69,65.69Z" />
  </svg>
);

const GithubIcon = ({ size = 14 }: { size?: number }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
  </svg>
);

const getWorkspaceUuid = (rawId: string): string => {
  if (!rawId) return "00000000-0000-4000-8000-000000000000";
  const trimmed = rawId.trim();
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(trimmed)) {
    return trimmed;
  }
  let h1 = 0x811c9dc5;
  let h2 = 0x01000193;
  for (let i = 0; i < trimmed.length; i++) {
    const code = trimmed.charCodeAt(i);
    h1 = Math.imul(h1 ^ code, 16777619);
    h2 = Math.imul(h2 ^ code, 2246822519);
  }
  const hex1 = Math.abs(h1).toString(16).padStart(8, "0");
  const hex2 = Math.abs(h2).toString(16).padStart(8, "0");
  const combined = (hex1 + hex2 + hex1 + hex2).substring(0, 32);

  const p1 = combined.substring(0, 8);
  const p2 = combined.substring(8, 12);
  const p3 = "4" + combined.substring(13, 16);
  const p4 = "8" + combined.substring(17, 20);
  const p5 = combined.substring(20, 32);
  return `${p1}-${p2}-${p3}-${p4}-${p5}`;
};


function LandingSkeleton() {
  return (
    <LynDeskLoadingCard 
      message="Initializing Event Desk..."
      subtext="Loading team workspace directory"
      minHeight="min-h-[450px]"
    />
  );
}

function isDatePassed(dateStr?: string | null): boolean {
  if (!dateStr) return false;
  const clean = dateStr.trim().toLowerCase();
  if (clean.startsWith("completed") || clean.includes("(completed)")) {
    return true;
  }
  if (clean.includes("ongoing") || clean.includes("none") || clean.includes("not specified") || clean.includes("tbd") || clean.includes("date not") || clean.includes("to be announced")) {
    return false;
  }

  try {
    let raw = dateStr.replace(/^(Completed|Target|\s*|\(|\))*/gi, "").replace(/\)$/g, "").trim();
    if (!raw) return false;

    raw = raw.replace(/Sept/i, "Sep");

    let parsedTime = Date.parse(raw);

    if (isNaN(parsedTime)) {
      const currentYear = new Date().getFullYear();
      raw = `${raw}, ${currentYear}`;
      parsedTime = Date.parse(raw);
    }

    if (!isNaN(parsedTime)) {
      const targetDate = new Date(parsedTime);
      targetDate.setHours(23, 59, 59, 999);
      return new Date().getTime() > targetDate.getTime();
    }
  } catch {}

  return false;
}

function calculateSubDeadline(targetDeadline: string, daysBefore: number): string {
  if (!targetDeadline || targetDeadline === "TBD") return "TBD";
  try {
    const raw = targetDeadline.replace(/^(Completed|Target|\s*|\(|\))*/gi, "").replace(/\)$/g, "").trim();
    const time = Date.parse(raw);
    if (!isNaN(time)) {
      const d = new Date(time - daysBefore * 86400000);
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      return `${String(d.getDate()).padStart(2, '0')} ${months[d.getMonth()]} ${d.getFullYear()}`;
    }
  } catch {}
  return targetDeadline;
}

interface EventItem {
  id: string;
  title: string;
  deadline: string;
  location: "online" | "in_person" | "hybrid";
  level: "local" | "national" | "global";
  url: string;
  status: "ideation" | "development" | "testing" | "submitted";
  stages: string[];
}

// Production empty initial state
const INITIAL_EVENTS: EventItem[] = [];

export default function Home() {
  const { user, userProfile, loading: authLoading, isUserOnline } = useAuth();
  const { showToast } = useToast();
  const likelyHasSession = !!user;

  // Smart Reload-Only Session Loading State
  const [isHardReloading, setIsHardReloading] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const alreadyLoaded = sessionStorage.getItem("ldk_event_desk_session_loaded");
      if (alreadyLoaded) return false;
      sessionStorage.setItem("ldk_event_desk_session_loaded", "true");
      return true;
    }
    return true;
  });

  useEffect(() => {
    if (isHardReloading) {
      const timer = setTimeout(() => {
        setIsHardReloading(false);
      }, 450);
      return () => clearTimeout(timer);
    }
  }, [isHardReloading]);

  const [authStep, setAuthStep] = useState<"idle" | "login" | "signup" | "success" | "faculty_login">("idle");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [staffKey, setStaffKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showFacultyPassword, setShowFacultyPassword] = useState(false);

  // Dashboard & Scraper States with 0ms SWR Cache Initialization
  const [events, setEvents] = useState<EventItem[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem("ldk_event_workspaces_cache");
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch {}
    }
    return INITIAL_EVENTS;
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [scraperUrl, setScraperUrl] = useState("");
  const [scraping, setScraping] = useState(false);
  const [scrapedData, setScrapedData] = useState<any>(null);
  const [newEventTitle, setNewEventTitle] = useState("");
  const [newEventDeadline, setNewEventDeadline] = useState("");
  const [newEventLocation, setNewEventLocation] = useState<"online" | "in_person" | "hybrid">("online");
  const [modalError, setModalError] = useState<string | null>(null);

  // Home Workspace Title Rename States
  const [editingWorkspaceId, setEditingWorkspaceId] = useState<string | null>(null);
  const [tempWorkspaceTitle, setTempWorkspaceTitle] = useState("");

  // Active Co-workers live list state
  const [coworkers, setCoworkers] = useState<{ id?: string; name: string; role: string; active: boolean }[]>([]);
  const [collegeName, setCollegeName] = useState("");
  const [isReordering, setIsReordering] = useState(false);
  const [confirmLeaveId, setConfirmLeaveId] = useState<string | null>(null);

  // Home Invite Friends States
  const [inviteEventId, setInviteEventId] = useState<string | null>(null);
  const [friendsToInviteHome, setFriendsToInviteHome] = useState<any[]>([]);
  const [isInviteHomeModalOpen, setIsInviteHomeModalOpen] = useState(false);
  const [inviteToast, setInviteToast] = useState<{ msg: string } | null>(null);

  // News and Opportunities States
  const [dashTab, setDashTab] = useState<"workspaces" | "opportunities">("workspaces");
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [isPresetModalOpen, setIsPresetModalOpen] = useState(false);
  const [hasActivePreset, setHasActivePreset] = useState(false);

  useEffect(() => {
    const checkPreset = () => {
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem("ldk_preference_preset");
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            if (parsed.location || parsed.locationMode !== "all" || parsed.categoryFocus !== "all") {
              setHasActivePreset(true);
              return;
            }
          } catch {}
        }
      }
      setHasActivePreset(false);
    };
    checkPreset();
    if (typeof window !== "undefined") {
      window.addEventListener("ldk_preferences_update", checkPreset);
      return () => window.removeEventListener("ldk_preferences_update", checkPreset);
    }
  }, []);

  // Real-time Coding Platform Overview Stats
  const [, setCodingStats] = useState<{
    leetcode: any;
    codeforces: any;
    codechef: any;
    unstop: any;
  }>({
    leetcode: null,
    codeforces: null,
    codechef: null,
    unstop: null
  });

  // Load opportunities from localStorage on mount and register active listener
  useEffect(() => {
    if (typeof window !== "undefined") {
      const loadOpps = () => {
        const now = new Date();
        const d1 = new Date(now.getTime() + 17 * 86400000).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
        const d2 = new Date(now.getTime() + 35 * 86400000).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
        const d3 = new Date(now.getTime() + 50 * 86400000).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
        const d4 = new Date(now.getTime() + 5 * 86400000).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
        const d5 = new Date(now.getTime() + 8 * 86400000).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
        const d6 = new Date(now.getTime() + 40 * 86400000).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });

        const isContestItem = (o: any) => {
          const title = (o.title || "").toLowerCase();
          const url = (o.url || "").toLowerCase();
          const cat = (o.category || "").toLowerCase();
          return cat === "contest" || 
                 url.includes("codeforces.com") || 
                 url.includes("leetcode.com/contest") || 
                 url.includes("codechef.com") || 
                 title.includes("codeforces round") || 
                 title.includes("leetcode weekly") || 
                 title.includes("codechef rated");
        };

        const defaultOpps = [
          {
            id: "opp_1",
            title: "Unstop National Innovation Hackathons 2026",
            category: "hackathon",
            deadline: d1,
            location: "hybrid",
            level: "national",
            url: "https://unstop.com/hackathons",
            description: "Active national software engineering and product innovation hackathons with company PPI tracks.",
            facultyRecommended: true,
            createdDate: "Today"
          },
          {
            id: "opp_2",
            title: "Flipkart GRiD 6.0 - Software Development Challenge",
            category: "hackathon",
            deadline: d2,
            location: "online",
            level: "national",
            url: "https://unstop.com/competitions/flipkart-grid-6",
            description: "Premier corporate engineering challenge featuring Robotics, Information Security, and GenAI problem statements.",
            facultyRecommended: true,
            createdDate: "Today"
          },
          {
            id: "opp_3",
            title: "Devpost Global AI Innovation Hackathon",
            category: "hackathon",
            deadline: d3,
            location: "online",
            level: "global",
            url: "https://devpost.com/hackathons",
            description: "Build autonomous multi-agent systems and full-stack AI applications with global developer teams.",
            facultyRecommended: true,
            createdDate: "Today"
          },
          {
            id: "opp_4",
            title: "Tata Crucible Campus Hackathon 2026",
            category: "hackathon",
            deadline: d4,
            location: "online",
            level: "national",
            url: "https://unstop.com/competitions/tata-crucible-campus-2026",
            description: "Prestigious national campus case and software hackathon by the Tata Group.",
            facultyRecommended: true,
            createdDate: "Today"
          },
          {
            id: "opp_5",
            title: "MIT HackHarvard 2026 Hackathon",
            category: "hackathon",
            deadline: d5,
            location: "online",
            level: "global",
            url: "https://hackharvard.org",
            description: "Global collegiate hackathon uniting student builders to create impactful hardware and software solutions.",
            facultyRecommended: true,
            createdDate: "Today"
          },
          {
            id: "opp_6",
            title: "Smart India Hackathon 2026 (SIH)",
            category: "hackathon",
            deadline: d6,
            location: "in_person",
            level: "national",
            url: "https://sih.gov.in",
            description: "Nationwide government initiative solving real-world challenges across AI, IoT, and CleanTech.",
            facultyRecommended: true,
            createdDate: "Today"
          }
        ];

        const stored = localStorage.getItem("ldk_opportunities");
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            const activeOnly = parsed.filter((o: any) => !isDatePassed(o.deadline) && !o.url?.includes("uber-hacktag") && !isContestItem(o));
            setOpportunities(activeOnly.length > 0 ? activeOnly : defaultOpps);
          } catch {
            setOpportunities(defaultOpps);
          }
        } else {
          setOpportunities(defaultOpps);
          localStorage.setItem("ldk_opportunities", JSON.stringify(defaultOpps));
        }

        // Fetch live active events from unified events API
        fetch("/api/events")
          .then(res => res.json())
          .then(data => {
            if (data.events && Array.isArray(data.events) && data.events.length > 0) {
              const liveMapped = data.events
                .filter((ev: any) => !isContestItem(ev))
                .map((ev: any, idx: number) => ({
                  id: ev.id || `live_opp_${idx}`,
                  title: ev.title,
                  category: ev.category || "hackathon",
                  deadline: ev.deadline,
                  location: ev.location || "online",
                  level: ev.level || "national",
                  url: ev.url || "https://unstop.com",
                  description: ev.description || `${ev.title}. Verified event opportunity.`,
                  facultyRecommended: ev.facultyRecommended ?? true,
                  createdDate: "Live"
                }));
              setOpportunities(prev => {
                const existingTitles = new Set(prev.map(p => p.title.toLowerCase()));
                const filteredNew = liveMapped.filter((lm: any) => !existingTitles.has(lm.title.toLowerCase()));
                const merged = [...filteredNew, ...prev.filter(p => !isContestItem(p))];
                return merged;
              });
            }
          })
          .catch(err => console.warn("Live events fetch notice:", err));

        // Fetch official faculty-recommended events from database API
        fetch("/api/events/recommendations")
          .then(res => res.json())
          .then(data => {
            if (data.recommendations && Array.isArray(data.recommendations) && data.recommendations.length > 0) {
              setOpportunities(prev => {
                const existingUrls = new Set(prev.map(p => p.url));
                const newRecs = data.recommendations
                  .filter((r: any) => !existingUrls.has(r.url) && !isContestItem(r))
                  .map((r: any) => ({
                    ...r,
                    facultyRecommended: true,
                    createdDate: "Faculty Pick"
                  }));
                return [...newRecs, ...prev];
              });
            }
          })
          .catch(err => console.warn("Faculty recommendations fetch notice:", err));
      };
      loadOpps();
      window.addEventListener("ldk_opportunities_update", loadOpps);
      return () => window.removeEventListener("ldk_opportunities_update", loadOpps);
    }
  }, []);

  // Fetch and sync real-time coding stats for linked accounts
  useEffect(() => {
    if (!user) return;
    const meta = user.user_metadata || {};
    const lc = meta.leetcode_username || "";
    const cc = meta.codechef_username || "";
    const hr = meta.hackerrank_username || "";
    const gfg = meta.geeksforgeeks_username || "";
    const cf = meta.codeforces_username || "";
    const un = meta.unstop_username || "";

    if (!lc && !cf && !cc && !hr && !gfg && !un) return;

    const cacheKey = `ldk_coding_stats_${user.id}`;
    
    // Load cached stats first for instant rendering
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        queueMicrotask(() => setCodingStats(parsed));
      } catch (e) {
        console.warn("Failed parsing cached stats", e);
      }
    }

    const loadLiveStats = async () => {
      try {
        const fetchPlatformStats = async (platform: string, username: string) => {
          if (!username) return null;
          try {
            const res = await fetch(`/api/coding-stats?platform=${platform}&username=${username}&t=${Date.now()}`, {
              cache: "no-store",
              headers: { "Cache-Control": "no-cache" }
            });
            if (res.ok) {
              return await res.json();
            }
          } catch (e) {
            console.warn(`Failed to fetch ${platform} stats`, e);
          }
          return null;
        };

        const [lcStats, ccStats, hrStats, gfgStats, cfStats] = await Promise.all([
          fetchPlatformStats("leetcode", lc),
          fetchPlatformStats("codechef", cc),
          fetchPlatformStats("hackerrank", hr),
          fetchPlatformStats("geeksforgeeks", gfg),
          fetchPlatformStats("codeforces", cf)
        ]);

        let realUnstopCount = 0;
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
            const appRes = await fetch("/api/user/applied-hackathons", {
              headers: { Authorization: `Bearer ${session.access_token}` }
            });
            if (appRes.ok) {
              const appData = await appRes.json();
              realUnstopCount = (appData.applications || []).filter((a: any) => a.portal === "Unstop").length;
            }
          }
        } catch {}

        const updatedStats = {
          leetcode: lcStats,
          codechef: ccStats,
          hackerrank: hrStats,
          geeksforgeeks: gfgStats,
          codeforces: cfStats,
          unstop: un ? { registered: realUnstopCount, completed: 0, rank: 0 } : null
        };

        setCodingStats(updatedStats);
        localStorage.setItem(cacheKey, JSON.stringify(updatedStats));
      } catch (err) {
        console.error("Error fetching live coding stats on dashboard:", err);
      }
    };

    loadLiveStats();

    const handleStatsUpdate = () => {
      const updatedCache = localStorage.getItem(cacheKey);
      if (updatedCache) {
        try {
          setCodingStats(JSON.parse(updatedCache));
        } catch (e) {
          console.warn("Error updating stats from event", e);
        }
      }
    };

    window.addEventListener("ldk_coding_stats_update", handleStatsUpdate);
    return () => window.removeEventListener("ldk_coding_stats_update", handleStatsUpdate);
  }, [user]);

  // Load events and joined workspaces from localStorage on mount with live status & name enrichment
  useEffect(() => {
    if (typeof window !== "undefined") {
      const loadLocalWorkspaces = () => {
        const userEventsKey = user?.id ? `ldk_events_${user.id}` : "ldk_events";
        const stored = localStorage.getItem(userEventsKey) || (user?.id ? null : localStorage.getItem("ldk_events"));
        const parsedEvents: EventItem[] = stored ? JSON.parse(stored) : [];

        // Enrich parsed events with local workspace overrides
        const enrichedEvents = parsedEvents.map(e => {
          const customName = localStorage.getItem(`ldk_workspace_name_${e.id}`);
          const customStatus = localStorage.getItem(`ldk_workspace_status_${e.id}`);
          const metaStr = localStorage.getItem(`ldk_workspace_meta_${e.id}`);
          
          let finalTitle = e.title;
          if (customName && !customName.startsWith("Loading Project")) {
            finalTitle = customName;
          } else if (metaStr) {
            try {
              const meta = JSON.parse(metaStr);
              if (meta && meta.title) finalTitle = `${meta.title} Workspace`;
            } catch {}
          }

          let finalStages = e.stages;
          if (metaStr) {
            try {
              const meta = JSON.parse(metaStr);
              if (meta && meta.stages && meta.stages.length > 0) {
                finalStages = meta.stages.map((s: { stage: string }) => s.stage);
              }
            } catch {}
          }

          return {
            ...e,
            title: finalTitle,
            status: (customStatus as any) || e.status,
            stages: finalStages || ["Ideation", "Development", "Testing", "Submitted"]
          };
        });

        if (enrichedEvents.length > 0) {
          setEvents(enrichedEvents);
        }
      };

      loadLocalWorkspaces();
      window.addEventListener("ldk_events_update", loadLocalWorkspaces);
      window.addEventListener("storage", loadLocalWorkspaces);
      return () => {
        window.removeEventListener("ldk_events_update", loadLocalWorkspaces);
        window.removeEventListener("storage", loadLocalWorkspaces);
      };
    }
  }, [user?.id]);

  // Sync events to user-scoped localStorage on modification
  useEffect(() => {
    if (events && events.length > 0 && typeof window !== "undefined") {
      const userEventsKey = user?.id ? `ldk_events_${user.id}` : "ldk_events";
      localStorage.setItem(userEventsKey, JSON.stringify(events));
    }
  }, [events, user?.id]);

  const fetchCoworkersAndCollege = useCallback(async () => {
    if (!user) return;
    try {
      // Fetch institute/college name
      const { data: profData, error: profErr } = await supabase
        .from("profiles")
        .select(`
          institute_id,
          institutes ( name )
        `)
        .eq("id", user.id)
        .single();

      if (!profErr && profData) {
        const inst = profData.institutes as any;
        if (inst?.name) {
          setCollegeName(inst.name);
        }
      }

      // Fetch database workspaces/events user is a member of
      const { data: memberData } = await supabase
        .from("project_members")
        .select(`
          project_space_id,
          project_spaces (
            id,
            project_name,
            status,
            github_repo,
            events (
              id,
              title,
              source_url,
              registration_deadline,
              location,
              level
            )
          )
        `)
        .eq("profile_id", user.id);

      // 0. Update current user's profile timestamp so teammates see user as active
      supabase.from("profiles").update({ updated_at: new Date().toISOString() }).eq("id", user.id).then(() => {});

      const dbSpaceIds: string[] = (memberData || []).map((m: any) => m.project_space_id).filter(Boolean);
      const joinedStr = typeof window !== "undefined" ? localStorage.getItem("ldk_joined_workspaces") : null;
      const localJoinedIds: string[] = joinedStr ? JSON.parse(joinedStr) : [];
      const mySpaceIds = Array.from(new Set([...dbSpaceIds, ...localJoinedIds]));

      // Fetch fellow members from shared workspaces who are currently ONLINE
      let onlineTeammates: { id?: string; name: string; role: string; active: boolean }[] = [];
      const seenTeammateIds = new Set<string>();

      if (mySpaceIds.length > 0) {
        // 1. Fetch teammate profiles across your workspaces
        const { data: teammateMembers } = await supabase
          .from("project_members")
          .select("profile_id, profiles(id, full_name, username, department, updated_at)")
          .in("project_space_id", mySpaceIds)
          .neq("profile_id", user.id);

        const profileMap = new Map<string, any>();
        (teammateMembers || []).forEach((tm: any) => {
          const p = tm.profiles;
          if (p && p.id && p.id !== user.id) profileMap.set(p.id, p);
        });

        // 2. Include local workspace members
        mySpaceIds.forEach(spId => {
          if (typeof window !== "undefined") {
            const raw = localStorage.getItem(`ldk_workspace_members_${spId}`);
            if (raw) {
              try {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed)) {
                  parsed.forEach((m: any) => {
                    if (m && m.id && m.id !== user.id && !profileMap.has(m.id)) {
                      profileMap.set(m.id, {
                        id: m.id,
                        full_name: m.name || m.username || "Collaborator",
                        username: m.username || "collaborator",
                        department: "Teammate"
                      });
                    }
                  });
                }
              } catch {}
            }
          }
        });

        const MAX_IDLE_MS = 10 * 60 * 1000;
        const now = Date.now();

        onlineTeammates = Array.from(profileMap.values())
          .filter(p => {
            const updated = p.updated_at ? new Date(p.updated_at).getTime() : 0;
            const onlineSignal =
              isUserOnline(p.id) ||
              (updated > 0 && now - updated <= MAX_IDLE_MS);

            if (onlineSignal) {
              seenTeammateIds.add(p.id);
              return true;
            }
            return false;
          })
          .map(p => ({
            id: p.id,
            name: p.full_name || p.username || "Collaborator",
            role: p.department || "Teammate",
            active: true
          }));
      }

      // Complement with platform online peers if coworkers count is low
      if (onlineTeammates.length < 3) {
        const { data: activeProfiles } = await supabase
          .from("profiles")
          .select("id, username, full_name, department, updated_at")
          .neq("id", user.id);

        if (activeProfiles) {
          const MAX_IDLE_MS = 10 * 60 * 1000;
          const now = Date.now();
          activeProfiles.forEach((p: any) => {
            if (onlineTeammates.length >= 5) return;
            if (p.id && !seenTeammateIds.has(p.id)) {
              const updated = p.updated_at ? new Date(p.updated_at).getTime() : 0;
              const onlineSignal =
                isUserOnline(p.id) ||
                (updated > 0 && now - updated <= MAX_IDLE_MS);

              if (onlineSignal) {
                seenTeammateIds.add(p.id);
                onlineTeammates.push({
                  id: p.id,
                  name: p.full_name || p.username || "Online Teammate",
                  role: p.department || "Collaborator",
                  active: true
                });
              }
            }
          });
        }
      }

      setCoworkers(onlineTeammates);

      const dbEvents: EventItem[] = [];
      if (memberData && memberData.length > 0) {
        memberData.forEach((m: any) => {
          const space = m.project_spaces;
          const ev = space?.events;
          if (space || m.project_space_id) {
            const spaceId = space?.id || m.project_space_id;
            const localWorkspaceName = typeof window !== "undefined" ? localStorage.getItem(`ldk_workspace_name_${spaceId}`) : null;
            const realTitle = space?.project_name || ev?.title;
            const resolvedTitle = (localWorkspaceName && localWorkspaceName !== "Hackathon Project Desk" && localWorkspaceName !== "Workspace Desk") 
              ? localWorkspaceName 
              : realTitle || "Workspace Desk";

            if (typeof window !== "undefined" && realTitle) {
              localStorage.setItem(`ldk_workspace_name_${spaceId}`, realTitle);
            }

            dbEvents.push({
              id: spaceId,
              title: resolvedTitle,
              deadline: ev?.registration_deadline 
                ? new Date(ev.registration_deadline).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) 
                : "Ongoing",
              location: ev?.location || "online",
              level: ev?.level || "global",
              url: ev?.source_url || space?.github_repo || `/workspace/${spaceId}`,
              status: space?.status || "development",
              stages: ["Ideation", "Development", "Final Submission"]
            });
          }
        });
      }

      setEvents(() => {
        const userJoinedKey = user?.id ? `ldk_joined_workspaces_${user.id}` : null;
        const userDeletedKey = user?.id ? `ldk_deleted_workspaces_${user.id}` : null;

        const joinedStr = typeof window !== "undefined" && userJoinedKey
          ? localStorage.getItem(userJoinedKey)
          : null;
        const joinedIds: string[] = joinedStr ? JSON.parse(joinedStr) : [];
        
        const map = new Map<string, EventItem>();
        const seenTitles = new Set<string>();

        // 1. Add DB events
        dbEvents.forEach(item => {
          if (item && item.id && !map.has(item.id)) {
            const cleanTitle = (item.title || "").trim();
            if (cleanTitle && !seenTitles.has(cleanTitle.toLowerCase())) {
              seenTitles.add(cleanTitle.toLowerCase());
              map.set(item.id, item);
            }
          }
        });

        // 2. Add joined workspace IDs from localStorage ONLY if a real custom name exists (newest first)
        joinedIds.slice().reverse().forEach(id => {
          if (!map.has(id)) {
            const customName = typeof window !== "undefined" ? localStorage.getItem(`ldk_workspace_name_${id}`) : null;
            const metaStr = typeof window !== "undefined" ? localStorage.getItem(`ldk_workspace_meta_${id}`) : null;
            let metaTitle = "";
            if (metaStr) {
              try {
                const meta = JSON.parse(metaStr);
                if (meta && meta.title) metaTitle = meta.title;
              } catch {}
            }
            const resolvedTitle = (customName && !customName.startsWith("Loading Project") && customName !== "Hackathon Project Desk" && customName !== "Workspace Desk")
              ? customName
              : metaTitle
              ? metaTitle
              : "";

            const cleanTitle = resolvedTitle.trim();
            if (cleanTitle && !seenTitles.has(cleanTitle.toLowerCase())) {
              seenTitles.add(cleanTitle.toLowerCase());
              map.set(id, {
                id,
                title: resolvedTitle,
                deadline: "Ongoing",
                location: "online",
                level: "global",
                url: `/workspace/${id}`,
                status: "development",
                stages: ["Ideation", "Development", "Final Submission"]
              });
            }
          }
        });

        const deletedStr = typeof window !== "undefined" && userDeletedKey
          ? localStorage.getItem(userDeletedKey)
          : null;
        const deletedIds: string[] = deletedStr ? JSON.parse(deletedStr) : [];

        let mergedList = Array.from(map.values()).filter(e => !deletedIds.includes(e.id));

        if (typeof window !== "undefined") {
          const userOrderKey = user?.id ? `ldk_custom_workspace_order_${user.id}` : "ldk_custom_workspace_order";
          const customOrderStr = localStorage.getItem(userOrderKey);

          if (customOrderStr) {
            try {
              const customOrderIds: string[] = JSON.parse(customOrderStr);
              mergedList.sort((a, b) => {
                const indexA = customOrderIds.indexOf(a.id);
                const indexB = customOrderIds.indexOf(b.id);
                if (indexA === -1 && indexB === -1) return 0;
                if (indexA === -1) return -1; // Unordered/new track stays at the top
                if (indexB === -1) return 1;
                return indexA - indexB;
              });
            } catch {}
          } else {
            // Default: newest created workspaces stay at the top
            mergedList = mergedList.slice().reverse();
          }
          const userEventsKey = user?.id ? `ldk_events_${user.id}` : "ldk_events";
          localStorage.setItem(userEventsKey, JSON.stringify(mergedList));
          window.dispatchEvent(new Event("ldk_workspace_update"));
        }
        return mergedList;
      });
    } catch (err) {
      console.error("Failed to load live active coworkers/college: ", err);
    }
  }, [user, isUserOnline]);

  useEffect(() => {
    if (user) {
      queueMicrotask(() => {
        fetchCoworkersAndCollege();
      });

      const profileChannel = supabase
        .channel("public:profiles_home")
        .on("postgres_changes", { event: "*", schema: "public", table: "profiles" }, () => {
          fetchCoworkersAndCollege();
        })
        .on("postgres_changes", { event: "*", schema: "public", table: "project_members" }, () => {
          fetchCoworkersAndCollege();
        })
        .subscribe();

      return () => {
        supabase.removeChannel(profileChannel);
      };
    }
  }, [user, fetchCoworkersAndCollege]);

  // Schedule background idle pre-fetch for user's active workspaces
  useEffect(() => {
    if (events && events.length > 0) {
      const cancel = scheduleIdlePrefetch(events.map(e => e.id), 1200);
      return () => cancel();
    }
  }, [events]);

  const handleSaveWorkspaceTitle = async (workspaceId: string) => {
    if (!tempWorkspaceTitle || !tempWorkspaceTitle.trim()) return;
    const cleanTitle = tempWorkspaceTitle.trim();
    
    setEvents(prev => prev.map(e => e.id === workspaceId ? { ...e, title: cleanTitle } : e));
    localStorage.setItem(`ldk_workspace_name_${workspaceId}`, cleanTitle);
    
    if (typeof window !== "undefined") {
      try {
        const userEventsKey = user?.id ? `ldk_events_${user.id}` : "ldk_events";
        const stored = localStorage.getItem(userEventsKey);
        const parsed: EventItem[] = stored ? JSON.parse(stored) : [];
        const idx = parsed.findIndex(e => e.id === workspaceId);
        if (idx >= 0) {
          parsed[idx].title = cleanTitle;
          localStorage.setItem(userEventsKey, JSON.stringify(parsed));
        }
      } catch {}
    }

    const targetUuid = getWorkspaceUuid(workspaceId);
    if (user && workspaceId !== "mock" && targetUuid) {
      try {
        const { data: existing } = await supabase
          .from("project_spaces")
          .select("id")
          .eq("id", targetUuid)
          .maybeSingle();

        if (existing) {
          await supabase
            .from("project_spaces")
            .update({ project_name: cleanTitle })
            .eq("id", targetUuid);
        } else {
          await supabase
            .from("project_spaces")
            .insert({
              id: targetUuid,
              project_name: cleanTitle,
              status: "development"
            });
        }
      } catch (e) {
        console.error("Failed updating workspace title in db", e);
      }
    }
    
    setEditingWorkspaceId(null);
  };



  const handleMoveWorkspace = (index: number, direction: "up" | "down") => {
    const newEvents = [...events];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newEvents.length) return;
    
    const temp = newEvents[index];
    newEvents[index] = newEvents[targetIndex];
    newEvents[targetIndex] = temp;

    setEvents(newEvents);
    if (typeof window !== "undefined") {
      const userEventsKey = user?.id ? `ldk_events_${user.id}` : "ldk_events";
      localStorage.setItem(userEventsKey, JSON.stringify(newEvents));
      const userOrderKey = user?.id ? `ldk_custom_workspace_order_${user.id}` : "ldk_custom_workspace_order";
      const customOrderIds = newEvents.map(e => e.id);
      localStorage.setItem(userOrderKey, JSON.stringify(customOrderIds));
      window.dispatchEvent(new CustomEvent("ldk_events_update"));
    }
  };

  const handleConfirmLeaveWorkspace = async () => {
    if (!confirmLeaveId) return;
    const idToRemove = confirmLeaveId;
    setConfirmLeaveId(null);

    // Smoothly remove item from state for AnimatePresence transition
    setEvents(prev => prev.filter(e => e.id !== idToRemove));

    if (typeof window !== "undefined") {
      try {
        const userEventsKey = user?.id ? `ldk_events_${user.id}` : "ldk_events";
        const userJoinedKey = user?.id ? `ldk_joined_workspaces_${user.id}` : "ldk_joined_workspaces";
        const userDeletedKey = user?.id ? `ldk_deleted_workspaces_${user.id}` : "ldk_deleted_workspaces";

        const stored = localStorage.getItem(userEventsKey) || localStorage.getItem("ldk_events");
        const parsed: EventItem[] = stored ? JSON.parse(stored) : [];
        const filteredEvents = parsed.filter(e => e.id !== idToRemove);
        localStorage.setItem(userEventsKey, JSON.stringify(filteredEvents));

        const joinedStr = localStorage.getItem(userJoinedKey) || localStorage.getItem("ldk_joined_workspaces");
        const joinedIds: string[] = joinedStr ? JSON.parse(joinedStr) : [];
        const filteredJoined = joinedIds.filter(id => id !== idToRemove);
        localStorage.setItem(userJoinedKey, JSON.stringify(filteredJoined));

        const deletedStr = localStorage.getItem(userDeletedKey) || localStorage.getItem("ldk_deleted_workspaces");
        const deletedIds: string[] = deletedStr ? JSON.parse(deletedStr) : [];
        if (!deletedIds.includes(idToRemove)) {
          deletedIds.push(idToRemove);
          localStorage.setItem(userDeletedKey, JSON.stringify(deletedIds));
        }

        localStorage.removeItem(`ldk_workspace_name_${idToRemove}`);
        localStorage.removeItem(`ldk_workspace_status_${idToRemove}`);
        localStorage.removeItem(`ldk_workspace_meta_${idToRemove}`);
        localStorage.removeItem(`ldk_workspace_git_${idToRemove}`);
        localStorage.removeItem(`ldk_workspace_demo_${idToRemove}`);
        localStorage.removeItem(`ldk_workspace_tasks_${idToRemove}`);
        localStorage.removeItem(`ldk_chat_messages_${idToRemove}`);
        localStorage.removeItem(`ldk_workspace_members_${idToRemove}`);

        window.dispatchEvent(new CustomEvent("ldk_events_update"));
        window.dispatchEvent(new Event("ldk_workspace_update"));
      } catch (err) {
        console.error("Failed leaving workspace:", err);
      }
    }

    if (idToRemove !== "mock" && user) {
      try {
        const targetUuid = getWorkspaceUuid(idToRemove);
        await Promise.allSettled([
          deleteWallCalendarEvent(idToRemove, user.id),
          deleteWallCalendarEvent(targetUuid, user.id),
          supabase.from("project_members").delete().or(`project_space_id.eq.${idToRemove},project_space_id.eq.${targetUuid}`).eq("profile_id", user.id),
          supabase.from("wall_calendar_events").delete().or(`source_id.eq.${idToRemove},source_id.eq.${targetUuid}`).eq("user_id", user.id)
        ]);
      } catch (e) {
        console.error("Failed removing workspace in DB:", e);
      }
    }
    fetchCoworkersAndCollege();
  };

  // Derivations for profile picture and username
  const avatarUrl = (() => {
    if (typeof window !== "undefined" && user?.id) {
      try {
        const rawPublic = localStorage.getItem(`ldk_public_profile_${user.id}`);
        if (rawPublic) {
          const parsed = JSON.parse(rawPublic);
          if (parsed?.avatar_url) return parsed.avatar_url;
        }
      } catch {}
      const localAvatar = localStorage.getItem(`ldk_user_avatar_${user.id}`) || localStorage.getItem(`ldk_avatar_url_${user.id}`) || "";
      if (localAvatar) return localAvatar;
    }
    return extractAvatarFromUser(user);
  })();
  const username = user?.user_metadata?.username || user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User";

  const activeCoworkers = coworkers.filter(
    cw => cw.name.toLowerCase() !== username.toLowerCase() && cw.name.toLowerCase() !== "kaizzcer"
  );

  useEffect(() => {
    const handle = setTimeout(() => {
      if (!authLoading) {
        setLoading(false);
      }
      if (user) {
        setAuthStep("success");
        if (typeof window !== "undefined" && (window.location.hash.includes("access_token") || window.location.search.includes("code"))) {
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      } else {
        setAuthStep("idle");
      }
    }, 0);
    return () => clearTimeout(handle);
  }, [user, authLoading]);

  useEffect(() => {
    const handlePageShow = () => {
      setLoading(false);
      setError(null);
    };
    window.addEventListener("pageshow", handlePageShow);
    return () => window.removeEventListener("pageshow", handlePageShow);
  }, []);

  useEffect(() => {
    setTimeout(() => {
      setStaffKey("");
    }, 0);
  }, [authStep]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) {
        setError(error.message);
        setLoading(false);
      }
    } catch (err: any) {
      setError(err?.message || "Login connection error.");
      setLoading(false);
    }
  };

  const handleFacultyLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Check recruiter key first
      if (staffKey.trim().toLowerCase() === "recruit2026") {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (error) {
          setError(error.message);
          setLoading(false);
          return;
        }

        if (data.user) {
          localStorage.setItem("company_recruiter_member", JSON.stringify({ name: "Corporate Recruiter", key: "recruit2026" }));
          try {
            await supabase.auth.updateUser({
              data: { company_key: "recruit2026", role: "employee" }
            });
          } catch (updateErr) {
            console.error("Failed updating user metadata:", updateErr);
          }
          window.location.href = "/recruiter";
          return;
        }
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      if (!data.user) {
        setError("Authentication failed.");
        setLoading(false);
        return;
      }

      const staffList = data.user.user_metadata?.registered_staff || [];
      if (staffList.length === 0 || !staffList.find((s: any) => s.key === "ADMIN")) {
        staffList.push({ name: "Main Administrator", key: "ADMIN" });
      }

      const matched = staffList.find((s: any) => s.key === staffKey.trim());
      if (matched) {
        localStorage.setItem("faculty_staff_member", JSON.stringify(matched));
        window.location.href = "/coordinator";
      } else {
        try {
          await supabase.auth.signOut();
        } catch (signOutErr) {
          console.error("Sign out error:", signOutErr);
        }
        setError("Invalid Staff Key. Access denied.");
        setLoading(false);
      }
    } catch (err: any) {
      setError(err?.message || "Faculty authentication connection error.");
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const { error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
      });
      if (error) {
        setError(error.message);
        setLoading(false);
      } else {
        setSuccessMessage("Registration successful! Check your email for verification. (If email confirmation is disabled in your Supabase Auth settings, you can sign in immediately).");
        setPassword("");
        setLoading(false);
      }
    } catch (err: any) {
      setError(err?.message || "Sign up connection error.");
      setLoading(false);
    }
  };

  const handleOAuthLogin = async (provider: "google" | "github" | "discord" | "linkedin") => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: provider === "linkedin" ? "linkedin_oidc" : provider,
        options: {
          redirectTo: typeof window !== "undefined" ? `${window.location.origin}/auth/callback` : undefined,
        },
      });
      if (error) {
        setError(error.message);
        setLoading(false);
      }
    } catch (err: any) {
      setError(err?.message || "OAuth connection error.");
      setLoading(false);
    }
  };

  // Real URL Scraper Logic fetching /api/scrape
  const handleScrape = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scraperUrl) return;
    setScraping(true);
    setModalError(null);
    
    try {
      const response = await fetch("/api/scrape", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: scraperUrl }),
      });
      
      const data = await response.json();
      if (response.ok) {
        setScrapedData(data);
        setNewEventTitle(data.title || "");
        setNewEventDeadline(data.deadline || "");
      } else {
        setModalError(data.error || "Failed to parse URL metadata.");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to reach scraper service.";
      setModalError(message);
    } finally {
      setScraping(false);
    }
  };

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle.trim()) {
      setModalError("Event Title is required.");
      return;
    }

    const finalUrl = scraperUrl.trim() || `https://eventtracker.local/custom-${Date.now()}`;
    let eventId = `e_${Date.now()}`;
    let spaceId = eventId;

    if (user) {
      try {
        let formattedDeadline = null;
        if (newEventDeadline.trim()) {
          const parsedDate = new Date(newEventDeadline.trim());
          if (!isNaN(parsedDate.getTime())) {
            formattedDeadline = parsedDate.toISOString();
          }
        }

        // 1. Insert into events table
        const { data: eventData, error: eventErr } = await supabase
          .from("events")
          .insert({
            title: newEventTitle,
            source_url: finalUrl,
            registration_deadline: formattedDeadline,
            location: newEventLocation,
            level: "global"
          })
          .select()
          .single();

        if (!eventErr && eventData) {
          eventId = eventData.id;
          
          // 2. Insert into project_spaces table
          const { data: spaceData, error: spaceErr } = await supabase
            .from("project_spaces")
            .insert({
              event_id: eventId,
              project_name: `${newEventTitle} Workspace`,
              status: "ideation"
            })
            .select()
            .single();

          if (!spaceErr && spaceData) {
            spaceId = spaceData.id;

            // 3. Register user as Leader in project_members
            await supabase
              .from("project_members")
              .insert({
                project_space_id: spaceId,
                profile_id: user.id,
                role: "leader"
              });
          }
        }
      } catch (err) {
        console.error("DB Event sync error: ", err);
      }
    }

    const titleLower = newEventTitle.toLowerCase();
    const isContest = titleLower.includes("contest") ||
                      titleLower.includes("leetcode") ||
                      titleLower.includes("codeforces") ||
                      titleLower.includes("codechef") ||
                      titleLower.includes("assessment") ||
                      titleLower.includes("quiz");

    const initialMeta = scrapedData || {
      title: newEventTitle,
      description: `Official workspace for ${newEventTitle}. Collaborate with your team, assign tasks, and track stage milestones.`,
      organization: "Campus / Custom Host",
      prizes: "Certificate of Excellence & Awards",
      rules: isContest ? "Solve competitive programming problems during the contest timeline." : "1. Develop your project prototype during the hackathon timeline.\n2. Submit project demo and source repository before the deadline.",
      deadline: newEventDeadline.trim() || "TBD",
      team_size: isContest ? "1 Member (Solo)" : "2 - 4 Members",
      eligibility: "Open to student participants",
      stages: isContest ? [
        { stage: "Contest Live Session", deadline: newEventDeadline.trim() || "TBD", brief: "Compete live and solve problem set." }
      ] : [
        { stage: "Ideation & Proposal", deadline: calculateSubDeadline(newEventDeadline, 14), brief: "Problem selection, team assignment, and architecture draft." },
        { stage: "Prototype Development", deadline: calculateSubDeadline(newEventDeadline, 7), brief: "Implement core MVP components and features." },
        { stage: "QA & User Testing", deadline: calculateSubDeadline(newEventDeadline, 2), brief: "User testing, bug fixes, and polish." },
        { stage: "Final Submission", deadline: newEventDeadline.trim() || "TBD", brief: "Publish live demo and GitHub repository." }
      ],
      url: finalUrl
    };

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(`ldk_workspace_meta_${spaceId}`, JSON.stringify(initialMeta));
        if (initialMeta.stages && Array.isArray(initialMeta.stages) && initialMeta.stages.length > 0) {
          const formattedStages = initialMeta.stages.map((s: any, idx: number) => ({
            title: s.stage || s.title || `Round ${idx + 1}`,
            deadline: s.deadline || "TBD",
            brief: s.brief || ""
          }));
          localStorage.setItem(`ldk_workspace_real_stages_${spaceId}`, JSON.stringify(formattedStages));
        }
      } catch {}
    }

    const newObj = {
      id: spaceId,
      title: newEventTitle,
      deadline: newEventDeadline.trim() || "TBD",
      location: newEventLocation,
      level: "global" as const,
      url: finalUrl,
      status: "ideation" as const,
      stages: initialMeta.stages?.map((s: { stage: string }) => s.stage) || ["Ideation", "Development", "Final Submission"]
    };

    setEvents([newObj, ...events]);

    // Live sync Event Desk creation with WallCalendar
    syncEventDeskWithCalendar(
      "join",
      { id: newObj.id, title: newObj.title, date: newObj.deadline, category: isContest ? "contest" : "deadline" },
      user?.id
    );

    setIsModalOpen(false);
    setScraperUrl("");
    setScrapedData(null);
    setNewEventTitle("");
    setNewEventDeadline("");
    setModalError(null);
  };

  const handleOpenInviteModal = async (eventId: string) => {
    setInviteEventId(eventId);
    setIsInviteHomeModalOpen(true);
    
    try {
      const { data, error } = await supabase
        .from("friendships")
        .select(`
          id,
          status,
          sender_id,
          receiver_id,
          sender:sender_id ( id, username, full_name ),
          receiver:receiver_id ( id, username, full_name )
        `);
      
      if (!error && data) {
        const friendsList: any[] = [];
        data.forEach((item: any) => {
          if (item.status === "accepted") {
            const isSender = item.sender_id === user?.id;
            const partner = isSender ? item.receiver : item.sender;
            if (partner) {
              friendsList.push({
                id: partner.id,
                username: partner.username || "user",
                full_name: partner.full_name || "Classmate"
              });
            }
          }
        });
        const existingMemberIds: string[] = [user?.id || ""];
        if (typeof window !== "undefined") {
          const localMembersStr = localStorage.getItem(`ldk_workspace_members_${eventId}`);
          if (localMembersStr) {
            try {
              const parsedMembers = JSON.parse(localMembersStr);
              parsedMembers.forEach((m: any) => {
                if (m.id && !existingMemberIds.includes(m.id)) existingMemberIds.push(m.id);
              });
            } catch {}
          }
        }

        if (eventId && eventId !== "mock") {
          try {
            const targetUuid = getWorkspaceUuid(eventId);
            const { data: dbMembers } = await supabase
              .from("project_members")
              .select("profile_id")
              .eq("project_space_id", targetUuid);
            if (dbMembers) {
              dbMembers.forEach((m: any) => {
                if (m.profile_id && !existingMemberIds.includes(m.profile_id)) {
                  existingMemberIds.push(m.profile_id);
                }
              });
            }
          } catch {}
        }

        const availableFriends = friendsList.filter(f => !existingMemberIds.includes(f.id));
        setFriendsToInviteHome(availableFriends);
      } else {
        setFriendsToInviteHome([]);
      }
    } catch (e) {
      console.error(e);
      setFriendsToInviteHome([]);
    }
  };

  const handleSendInviteFromHome = async (friendId: string, friendName: string) => {
    if (!inviteEventId) return;
    try {
      const targetUrl = `/workspace/${inviteEventId}?acceptInvite=${friendId}&friendName=${encodeURIComponent(friendName)}`;

      if (user?.id) {
        try {
          await supabase.from("notifications").insert({
            user_id: friendId,
            sender_id: user.id,
            title: "Workspace Invitation",
            message: `${user.user_metadata?.full_name || "A classmate"} invited you to collaborate on project workspace!`,
            type: "workspace_invite",
            action_url: targetUrl
          });

          await fetch("/api/notifications/send", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              recipientId: friendId,
              senderId: user.id,
              title: "Workspace Invitation",
              message: `${user.user_metadata?.full_name || "A classmate"} invited you to collaborate on project workspace!`,
              actionUrl: targetUrl,
              type: "invite"
            })
          });
        } catch (e) {
          console.error("Error in home workspace invite dispatch: ", e);
        }
      }

      // Add to local notification bus for recipient
      const recipientKey = `ldk_user_notifications_${friendId}`;
      const notifStored = typeof window !== "undefined" ? localStorage.getItem(recipientKey) : null;
      const notifList = notifStored ? JSON.parse(notifStored) : [];
      const uniqueNotifId = typeof crypto !== "undefined" && crypto.randomUUID ? `n_invite_${crypto.randomUUID()}` : `n_invite_${friendId}_${notifList.length + 1}`;
      notifList.unshift({
        id: uniqueNotifId,
        recipientId: friendId,
        senderId: user?.id,
        title: "Workspace Invitation",
        message: `${user?.user_metadata?.full_name || "A classmate"} invited you to collaborate on project workspace!`,
        type: "invite",
        category: "alerts",
        time: "Just now",
        read: false,
        actionLabel: "Accept Invite",
        actionUrl: targetUrl
      });
      if (typeof window !== "undefined") {
        localStorage.setItem(recipientKey, JSON.stringify(notifList.slice(0, 100)));
        window.dispatchEvent(new Event("ldk_notifications_update"));
      }

      setIsInviteHomeModalOpen(false);
      setInviteToast({ msg: `Invitation dispatched to ${friendName}! Notification sent.` });
      setTimeout(() => setInviteToast(null), 4000);
    } catch (e) {
      console.error(e);
      setIsInviteHomeModalOpen(false);
      setInviteToast({ msg: `Invitation sent to ${friendName}.` });
      setTimeout(() => setInviteToast(null), 4000);
    }
  };

  return (
    <div className="min-h-screen bg-bg-base text-txt-main flex flex-col font-sans selection:bg-accent-main selection:text-bg-base">
      
      {/* 1. Header (Unified Navigation & Notifications Drawer) */}
      <Header />

      {/* Conditional Layout: Landing VS. Dashboard */}
      {authLoading || (isHardReloading && likelyHasSession) ? (
        likelyHasSession ? (
          <div className="flex-1 flex items-center justify-center p-6 min-h-[70vh]">
            <LynDeskLoadingCard 
              message="Syncing Event Desks & Live Milestones..." 
              subtext="Resolving multi-round schedules, peer presence & verified registries"
              minHeight="min-h-[420px]"
            />
          </div>
        ) : (
          <LandingSkeleton />
        )
      ) : !user ? (
        /* ==================== LANDING PANEL ==================== */
        <main className="flex-1 max-w-7xl w-full mx-auto px-6 md:px-12 py-6 lg:py-12 overflow-y-auto lg:overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center">
          
          {/* Left Column: Typographic layout */}
          <section className="lg:col-span-7 flex flex-col items-start gap-12 lg:pr-8">
            <div className="flex flex-col gap-4">
              <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-txt-muted font-semibold">
                Link Your Next Desk — The Future in Your Hands
              </span>
              <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-light tracking-[-0.03em] text-txt-main leading-[1.08]">
                The space where technical projects <span className="font-normal border-b border-txt-main/30">take shape.</span>
              </h1>
            </div>
            
            <p className="text-txt-sub text-base md:text-lg leading-relaxed max-w-xl font-light">
              An index for student hackathons, team workspaces, and academic credit coordination. 
              No noise, no vanity metrics. Just a vault to organize your code, files, and milestones.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full pt-8 border-t border-border-main/60">
              <div className="flex flex-col gap-3">
                <div className="h-9 w-9 rounded-sm border border-border-main/80 bg-bg-surface flex items-center justify-center text-txt-main">
                  <Link2 size={15} className="stroke-[1.5]" />
                </div>
                <h3 className="font-display text-sm font-semibold tracking-tight text-txt-main">The Registry</h3>
                <p className="text-xs text-txt-muted leading-relaxed font-light">
                  Paste any event link. The parser organizes deadlines, stage timelines, and guidelines into your personal vault.
                </p>
              </div>
              
              <div className="flex flex-col gap-3">
                <div className="h-9 w-9 rounded-sm border border-border-main/80 bg-bg-surface flex items-center justify-center text-txt-main">
                  <Users size={15} className="stroke-[1.5]" />
                </div>
                <h3 className="font-display text-sm font-semibold tracking-tight text-txt-main">Workspace Decks</h3>
                <p className="text-xs text-txt-muted leading-relaxed font-light">
                  A shared portal mapping your active slide deck, code repositories, team discussions, and voice channels.
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <div className="h-9 w-9 rounded-sm border border-border-main/80 bg-bg-surface flex items-center justify-center text-txt-main">
                  <Award size={15} className="stroke-[1.5]" />
                </div>
                <h3 className="font-display text-sm font-semibold tracking-tight text-txt-main">Campus Credits</h3>
                <p className="text-xs text-txt-muted leading-relaxed font-light">
                  Export certified summaries of project completions directly to department coordinators for academic validation.
                </p>
              </div>
            </div>
          </section>

          {/* Right Column: Portal Terminal Auth Card */}
          <section className="lg:col-span-5 w-full flex justify-center lg:sticky lg:top-28">
            <div className="w-full max-w-md border border-border-main/70 bg-bg-surface p-8 rounded-lg shadow-[0_4px_24px_rgba(0,0,0,0.02)] transition-shadow duration-300">
              <AnimatePresence mode="wait">
                {authStep === "idle" && (
                  <motion.div 
                    key="idle"
                    initial={{ opacity: 0, y: 3 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -3 }}
                    transition={{ duration: 0.12, ease: [0.16, 1, 0.3, 1] }}
                    className="flex flex-col gap-6"
                  >
                    <div className="flex flex-col gap-1.5">
                      <h2 className="font-display text-lg font-semibold tracking-tight text-txt-main">
                        Authenticate Credentials
                      </h2>
                      <p className="text-xs text-txt-muted font-light">
                        Establish a secure session to access your workspaces.
                      </p>
                    </div>

                    {error && (
                      <div className="text-xs text-txt-muted bg-bg-card border border-border-main/60 p-2.5 rounded-sm font-mono tracking-tight text-center">
                        {error}
                      </div>
                    )}

                    <button 
                      onClick={() => {
                        setError(null);
                        setAuthStep("login");
                      }}
                      className="w-full h-11 rounded-sm border border-border-main/80 hover:bg-bg-card text-txt-main font-medium text-xs tracking-wider uppercase flex items-center justify-center gap-2.5 transition-colors duration-150 focus:outline-none focus:ring-1 focus:ring-ring-main cursor-pointer"
                    >
                      <Mail size={14} className="stroke-[1.5]" />
                      Email Credentials
                    </button>

                    <div className="relative flex py-1 items-center">
                      <div className="flex-grow border-t border-border-main/60"></div>
                      <span className="flex-shrink mx-3 text-[9px] font-mono tracking-widest text-txt-muted uppercase">or</span>
                      <div className="flex-grow border-t border-border-main/60"></div>
                    </div>

                    <button 
                      onClick={() => handleOAuthLogin("google")}
                      disabled={loading}
                      className="w-full h-11 rounded-sm bg-accent-main hover:opacity-90 disabled:opacity-50 text-bg-base font-medium text-xs tracking-wider uppercase flex items-center justify-center gap-2.5 transition-opacity duration-150 focus:outline-none focus:ring-1 focus:ring-ring-main cursor-pointer"
                    >
                      {loading ? (
                        <span className="h-4 w-4 rounded-full border border-bg-base/30 border-t-bg-base animate-spin" />
                      ) : (
                        <>
                          <Globe size={14} className="stroke-[1.5]" />
                          Institutional Google Sign-In
                        </>
                      )}
                    </button>

                    <div className="flex gap-3 items-center w-full">
                      <button 
                        onClick={() => handleOAuthLogin("github")}
                        disabled={loading}
                        className="flex-1 h-11 rounded-sm border border-border-main/80 hover:bg-bg-card text-txt-main flex items-center justify-center gap-2 transition-colors duration-150 focus:outline-none focus:ring-1 focus:ring-ring-main cursor-pointer"
                      >
                        <GithubIcon size={14} />
                        <span className="text-[10px] font-mono tracking-widest uppercase">GitHub</span>
                      </button>

                      <button 
                        onClick={() => handleOAuthLogin("discord")}
                        disabled={loading}
                        className="flex-1 h-11 rounded-sm border border-border-main/80 hover:bg-bg-card text-txt-main flex items-center justify-center gap-2 transition-colors duration-150 focus:outline-none focus:ring-1 focus:ring-ring-main cursor-pointer"
                      >
                        <DiscordIcon size={14} />
                        <span className="text-[10px] font-mono tracking-widest uppercase">Discord</span>
                      </button>
                    </div>

                    <p className="text-[10px] text-center text-txt-muted leading-relaxed font-light mt-1">
                      Using Google Auth automatically routes you into your local campus network.
                    </p>

                    <div className="border-t border-border-main/40 pt-4 text-center mt-1">
                      <button
                        onClick={() => {
                          setError(null);
                          setAuthStep("faculty_login");
                        }}
                        className="text-[9px] text-txt-muted hover:text-txt-main transition-colors font-mono tracking-wider uppercase underline cursor-pointer"
                      >
                        Faculty / Company Portal Login
                      </button>
                    </div>
                  </motion.div>
                )}

                {(authStep === "login" || authStep === "signup") && (
                  <motion.form 
                    key={authStep}
                    onSubmit={authStep === "login" ? handleLogin : handleSignUp}
                    initial={{ opacity: 0, y: 3 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -3 }}
                    transition={{ duration: 0.12, ease: [0.16, 1, 0.3, 1] }}
                    className="flex flex-col gap-5"
                  >
                    <div className="flex flex-col gap-1">
                      <button 
                        type="button"
                        onClick={() => {
                          setError(null);
                          setAuthStep("idle");
                        }}
                        className="text-[10px] text-txt-muted hover:text-txt-main self-start transition-colors duration-150 font-mono tracking-widest uppercase"
                      >
                        ← Back
                      </button>
                      <h2 className="font-display text-lg font-semibold tracking-tight text-txt-main mt-2">
                        {authStep === "login" ? "Secure Sign In" : "Create Account"}
                      </h2>
                    </div>

                    {error && (
                      <div className="text-xs text-red-500 bg-red-500/10 border border-red-500/30 p-2.5 rounded-sm font-mono tracking-tight">
                        {error}
                      </div>
                    )}

                    {successMessage && (
                      <div className="text-xs text-green-500 bg-green-500/10 border border-green-500/30 p-2.5 rounded-sm font-mono tracking-tight leading-relaxed">
                        {successMessage}
                      </div>
                    )}

                    <div className="flex flex-col gap-3.5">
                      <div className="flex flex-col gap-1">
                        <label className="text-xs text-txt-sub font-medium">Domain Email Address</label>
                        <input 
                          type="email" 
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="username@university.edu"
                          className="h-10 px-3 border border-border-main/80 bg-bg-base text-txt-main rounded-sm text-sm placeholder:text-txt-muted/50 focus:outline-none focus:border-txt-main focus:ring-1 focus:ring-ring-main transition-colors duration-150 font-light"
                        />
                      </div>
                      
                      <div className="flex flex-col gap-1">
                        <div className="flex justify-between items-center">
                          <label className="text-xs text-txt-sub font-medium">Password</label>
                          {authStep === "login" && (
                            <a href="#" className="text-[10px] text-txt-muted hover:text-txt-main transition-colors font-light">Forgot?</a>
                          )}
                        </div>
                        <div className="relative">
                          <input 
                            type={showPassword ? "text" : "password"} 
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="h-10 pl-3 pr-10 border border-border-main/80 bg-bg-base text-txt-main rounded-sm text-sm placeholder:text-txt-muted/50 focus:outline-none focus:border-txt-main focus:ring-1 focus:ring-ring-main transition-colors duration-150 w-full"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-txt-muted hover:text-txt-main cursor-pointer flex items-center justify-center bg-transparent border-0 outline-none"
                          >
                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                      </div>
                    </div>

                    <button 
                      type="submit"
                      disabled={loading}
                      className="w-full h-11 rounded-sm bg-accent-main hover:opacity-90 disabled:opacity-50 text-bg-base font-medium text-xs tracking-wider uppercase flex items-center justify-center gap-2 transition-opacity duration-150 focus:outline-none focus:ring-1 focus:ring-ring-main cursor-pointer"
                    >
                      {loading ? (
                        <span className="h-4 w-4 rounded-full border border-bg-base/30 border-t-bg-base animate-spin" />
                      ) : (
                        <>
                          {authStep === "login" ? "Authenticate Session" : "Initialize Registration"}
                          <ArrowRight size={14} />
                        </>
                      )}
                    </button>

                    <div className="text-center">
                      <button
                        type="button"
                        onClick={() => {
                          setError(null);
                          setAuthStep(authStep === "login" ? "signup" : "login");
                        }}
                        className="text-xs text-txt-muted hover:text-txt-main transition-colors font-light underline"
                      >
                        {authStep === "login" ? "Need a new desk? Create an account" : "Already registered? Sign in"}
                      </button>
                    </div>
                  </motion.form>
                )}

                {authStep === "faculty_login" && (
                  <motion.form 
                    key="faculty_login"
                    onSubmit={handleFacultyLogin}
                    initial={{ opacity: 0, y: 3 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -3 }}
                    transition={{ duration: 0.12, ease: [0.16, 1, 0.3, 1] }}
                    className="flex flex-col gap-5"
                  >
                    <div className="flex flex-col gap-1">
                      <button 
                        type="button"
                        onClick={() => {
                          setError(null);
                          setAuthStep("idle");
                        }}
                        className="text-[10px] text-txt-muted hover:text-txt-main self-start transition-colors duration-150 font-mono tracking-widest uppercase"
                      >
                        ← Back
                      </button>
                      <h2 className="font-display text-lg font-semibold tracking-tight text-txt-main mt-2">
                        Faculty & Company Portal
                      </h2>
                      <p className="text-xs text-txt-muted font-light">
                        Log in using your shared institutional email and unique staff key.
                      </p>
                    </div>

                    {error && (
                      <div className="text-xs text-red-500 bg-red-500/10 border border-red-500/30 p-2.5 rounded-sm font-mono tracking-tight">
                        {error}
                      </div>
                    )}

                    <div className="flex flex-col gap-3.5">
                      <div className="flex flex-col gap-1">
                        <label className="text-xs text-txt-sub font-medium">Shared Portal Email</label>
                        <input 
                          type="email" 
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="e.g. coordinator@college.edu"
                          className="h-10 px-3 border border-border-main/80 bg-bg-base text-txt-main rounded-sm text-sm placeholder:text-txt-muted/50 focus:outline-none focus:border-txt-main focus:ring-1 focus:ring-ring-main transition-colors duration-150 font-light"
                        />
                      </div>
                      
                      <div className="flex flex-col gap-1">
                        <label className="text-xs text-txt-sub font-medium">Portal Password</label>
                        <div className="relative">
                          <input 
                            type={showFacultyPassword ? "text" : "password"} 
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="h-10 pl-3 pr-10 border border-border-main/80 bg-bg-base text-txt-main rounded-sm text-sm placeholder:text-txt-muted/50 focus:outline-none focus:border-txt-main focus:ring-1 focus:ring-ring-main transition-colors duration-150 w-full"
                          />
                          <button
                            type="button"
                            onClick={() => setShowFacultyPassword(!showFacultyPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-txt-muted hover:text-txt-main cursor-pointer flex items-center justify-center bg-transparent border-0 outline-none"
                          >
                            {showFacultyPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-xs text-txt-sub font-medium">Unique Staff Key / ID</label>
                        <input 
                          type="text" 
                          required
                          value={staffKey}
                          onChange={(e) => setStaffKey(e.target.value)}
                          placeholder="e.g. DAVIS987"
                          className="h-10 px-3 border border-border-main/80 bg-bg-base text-txt-main rounded-sm text-sm placeholder:text-txt-muted/50 focus:outline-none focus:border-txt-main focus:ring-1 focus:ring-ring-main transition-colors duration-150 font-mono"
                        />
                      </div>
                    </div>

                    <button 
                      type="submit"
                      disabled={loading}
                      className="w-full h-11 rounded-sm bg-accent-main hover:opacity-90 disabled:opacity-50 text-bg-base font-medium text-xs tracking-wider uppercase flex items-center justify-center gap-2 transition-opacity duration-150 focus:outline-none focus:ring-1 focus:ring-ring-main cursor-pointer"
                    >
                      {loading ? (
                        <span className="h-4 w-4 rounded-full border border-bg-base/30 border-t-bg-base animate-spin" />
                      ) : (
                        <>
                          Authenticate Staff Session
                          <ArrowRight size={14} />
                        </>
                      )}
                    </button>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </section>
        </main>
      ) : (
        /* ==================== DASHBOARD PANEL ==================== */
        <main className="flex-1 max-w-7xl w-full mx-auto px-6 md:px-12 pt-6 pb-2 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* A. Left Sidebar: Profile & Campus Credits (3 Columns) */}
          <section className="lg:col-span-3 flex flex-col gap-6">
            
            {/* User profile Summary */}
            <div className="border border-border-main/70 bg-bg-surface p-5 rounded-md flex flex-col gap-3">
              <span className="font-mono text-[9px] uppercase tracking-widest text-txt-muted font-bold">Verified Session</span>
              <div className="flex items-center gap-3">
                {avatarUrl ? (
                  <Image 
                    src={avatarUrl} 
                    alt="Profile" 
                    width={40}
                    height={40}
                    className="rounded-full border border-border-main/60 object-cover object-center aspect-square shrink-0"
                  />
                ) : (
                  <div className="h-10 w-10 rounded-full border border-border-main/80 bg-bg-card flex items-center justify-center text-txt-muted shrink-0 aspect-square">
                    <User size={18} className="stroke-[1.5]" />
                  </div>
                )}
                <div className="flex flex-col min-w-0">
                  <span className="text-xs text-txt-main font-mono truncate font-semibold">{username}</span>
                  <span className="text-[10px] text-txt-muted font-light">{collegeName || "Independent Student"}</span>
                  <div className="flex items-center gap-1.5 text-[9px] font-mono text-txt-muted mt-0.5 max-w-full">
                    <span className="shrink-0 text-txt-muted/80 font-medium">UID:</span>
                    <span className="truncate font-light select-all" title={user?.id}>
                      {user?.id ? `${user.id.slice(0, 8)}...${user.id.slice(-4)}` : "..."}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        if (user?.id) {
                          navigator.clipboard.writeText(user.id);
                          showToast("UID copied to clipboard");
                        }
                      }}
                      className="p-0.5 hover:text-txt-main text-txt-muted/70 transition-colors cursor-pointer shrink-0"
                      aria-label="Copy UID"
                    >
                      <Copy size={10} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Academic Credits Tracker */}
            <div className="border border-border-main/70 bg-bg-surface p-5 rounded-md flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[9px] uppercase tracking-widest text-txt-muted">Academic Credits</span>
                <Award size={14} className="text-txt-main" />
              </div>
              <div className="flex flex-col gap-1.5">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-display font-light tracking-tight text-txt-main">
                    {userProfile?.academic_credits || 0}
                  </span>
                  <span className="text-[10px] text-txt-muted uppercase tracking-wider font-mono">/ 100 Pts</span>
                </div>
                <div className="w-full h-1 bg-border-main/50 rounded-full overflow-hidden">
                  <div 
                    className="bg-accent-main h-full rounded-full transition-all duration-500" 
                    style={{ width: `${Math.min(100, userProfile?.academic_credits || 0)}%` }} 
                  />
                </div>
                <p className="text-[10px] text-txt-muted font-light leading-relaxed">
                  {userProfile?.academic_credits ? `${userProfile.academic_credits} points verified by academic coordinators.` : "0 completed projects verified. Complete team projects to earn campus credits."}
                </p>
              </div>
            </div>

            {/* Teammates List */}
            <div className="border border-border-main/70 bg-bg-surface p-5 rounded-md flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <span className="font-mono text-[9px] uppercase tracking-widest text-txt-muted font-bold">Active Co-Workers</span>
                {activeCoworkers.length > 0 && (
                  <span className="text-[8px] font-mono text-txt-muted uppercase tracking-wider bg-bg-card px-1.5 py-0.5 rounded border border-border-main/50 font-bold">
                    {activeCoworkers.length} Online
                  </span>
                )}
              </div>
              <div className="flex flex-col gap-2.5">
                {activeCoworkers.length > 0 ? (
                  activeCoworkers.map((cw, i) => (
                    <div key={(cw as any).id || i} className="flex items-center justify-between gap-2 py-0.5 border-b border-border-main/20 last:border-0 pb-1.5 last:pb-0">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-2 h-2 rounded-full border border-emerald-500/85 bg-emerald-500/20 shrink-0" />
                        <span className="text-xs text-txt-main font-medium truncate">{cw.name}</span>
                      </div>
                      <span className="text-[8px] font-mono text-txt-muted uppercase tracking-wider shrink-0 bg-bg-card px-1.5 py-0.5 rounded border border-border-main/50">{cw.role}</span>
                    </div>
                  ))
                ) : (
                  <span className="text-[10px] font-mono text-txt-muted/60 py-1 text-center block uppercase tracking-wider">
                    None online
                  </span>
                )}
              </div>
            </div>

          </section>

          {/* B. Main Panel: The Event Registry & Timelines (9 Columns) */}
          <section className="lg:col-span-9 flex flex-col gap-6">
            
            {/* Header + Add button */}
            <div className="flex items-center justify-between border-b border-border-main/50 pb-4">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setDashTab("workspaces")}
                    className={`font-display text-xl font-light cursor-pointer transition-colors ${
                      dashTab === "workspaces" ? "text-txt-main border-b-2 border-accent-main font-medium pb-0.5" : "text-txt-muted hover:text-txt-main pb-0.5"
                    }`}
                  >
                    Event Registry
                  </button>
                  <span className="text-border-main/60">•</span>
                  <button
                    onClick={() => setDashTab("opportunities")}
                    className={`font-display text-xl font-light cursor-pointer transition-colors ${
                      dashTab === "opportunities" ? "text-txt-main border-b-2 border-accent-main font-medium pb-0.5" : "text-txt-muted hover:text-txt-main pb-0.5"
                    }`}
                  >
                    Opportunities Board ({opportunities.length})
                  </button>
                </div>
                <p className="text-[10px] text-txt-muted font-light">
                  {dashTab === "workspaces" ? "Tracked project desks and submission stages." : "Faculty-recommended contests, hackathons, and news."}
                </p>
              </div>
              {dashTab === "workspaces" && (
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="h-9 px-3.5 rounded-sm bg-accent-main hover:opacity-90 text-bg-base text-xs font-mono uppercase tracking-wider flex items-center gap-1.5 transition-opacity duration-150 cursor-pointer font-semibold"
                >
                  <Plus size={13} />
                  Track Link
                </button>
              )}
            </div>
              {dashTab === "workspaces" ? (
              <>
                {/* My Active Workspaces Section Header */}
                <div className="flex items-center justify-between border-b border-border-main/45 pb-2">
                  <div className="flex items-center gap-2.5">
                    <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-accent-main">
                      My Active Workspaces
                    </span>
                    {events.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setIsReordering(!isReordering)}
                        className={`text-[9px] font-mono uppercase tracking-wider transition-all flex items-center gap-1 px-2 py-0.5 rounded border cursor-pointer ${
                          isReordering 
                            ? "bg-accent-main/15 text-accent-main border-accent-main/40 font-bold opacity-100" 
                            : "bg-bg-card text-txt-muted/70 hover:text-txt-main opacity-60 hover:opacity-100 border-border-main/60"
                        }`}
                      >
                        <ArrowUpDown size={10} />
                        <span>{isReordering ? "Done Reordering" : "Reorder Workspaces"}</span>
                      </button>
                    )}
                  </div>
                  <span className="text-[9px] font-mono text-txt-muted uppercase">
                    {events.length} Active {events.length === 1 ? "Project" : "Projects"}
                  </span>
                </div>

                {/* List of active events / workspaces */}
                <div className="flex flex-col gap-5">
                  {events.length === 0 ? (
                    <div className="border border-dashed border-border-main/60 bg-bg-surface/50 p-8 rounded-md flex flex-col items-center justify-center text-center gap-3 py-12">
                      <div className="h-10 w-10 rounded-full bg-bg-card border border-border-main/80 flex items-center justify-center text-txt-muted">
                        <Plus size={18} />
                      </div>
                      <div className="flex flex-col gap-1 max-w-sm">
                        <h3 className="font-display text-sm font-semibold text-txt-main">No active workspaces</h3>
                        <p className="text-xs text-txt-muted font-light leading-relaxed">
                          Track a hackathon or event link to auto-extract stages and launch your team project workspace desk.
                        </p>
                      </div>
                      <button
                        onClick={() => setIsModalOpen(true)}
                        className="mt-2 h-9 px-4 rounded-sm bg-accent-main hover:opacity-90 text-bg-base text-xs font-mono uppercase tracking-wider flex items-center gap-1.5 font-bold cursor-pointer"
                      >
                        <Plus size={13} />
                        Track Link
                      </button>
                    </div>
                  ) : (
                    <AnimatePresence>
                      {events.map((ev, evIndex) => {
                        const resolvedTitle = (() => {
                          const localName = typeof window !== "undefined" ? localStorage.getItem(`ldk_workspace_name_${ev.id}`) : null;
                          if (localName && !localName.startsWith("Loading Project")) return localName;
                          const metaStr = typeof window !== "undefined" ? localStorage.getItem(`ldk_workspace_meta_${ev.id}`) : null;
                          if (metaStr) {
                            try {
                              const meta = JSON.parse(metaStr);
                              if (meta && meta.title) return meta.title;
                            } catch {}
                          }
                          return (ev.title && !ev.title.startsWith("Loading Project")) ? ev.title : "Hackathon Event";
                        })();

                        const stageObjects = (() => {
                          let list: { stage: string; deadline: string }[] = [];
                          const realStr = typeof window !== "undefined" ? (localStorage.getItem(`ldk_workspace_real_stages_${ev.id}`) || localStorage.getItem(`ldk_workspace_stages_${ev.id}`)) : null;
                          if (realStr) {
                            try {
                              const parsed = JSON.parse(realStr);
                              if (Array.isArray(parsed) && parsed.length > 0) {
                                list = parsed.map((s: any) => ({
                                  stage: s.title || s.stage || "Stage",
                                  deadline: s.deadline || "Target Active"
                                }));
                              }
                            } catch {}
                          }
                          if (list.length === 0) {
                            const metaStr = typeof window !== "undefined" ? localStorage.getItem(`ldk_workspace_meta_${ev.id}`) : null;
                            if (metaStr) {
                              try {
                                const meta = JSON.parse(metaStr);
                                if (meta && meta.stages && meta.stages.length > 0) {
                                  list = meta.stages.map((s: any) => ({
                                    stage: s.title || s.stage || "Stage",
                                    deadline: s.deadline || "Target Active"
                                  }));
                                }
                              } catch {}
                            }
                          }
                          
                          if (list.length === 0) {
                            // Dynamic Date Synthesis based on actual event deadline (Zero static fake dates)
                            const rawNames = (ev.stages && ev.stages.length > 0)
                              ? ev.stages
                              : ["Ideation & Proposal", "Prototype Development", "QA & User Testing", "Final Submission"];

                            const now = new Date();
                            let targetDate = new Date(ev.deadline);
                            if (isNaN(targetDate.getTime()) || targetDate.getTime() <= now.getTime()) {
                              targetDate = new Date(now.getTime() + 30 * 86400000);
                            }

                            const startTime = now.getTime();
                            const endTime = targetDate.getTime();
                            const totalDuration = Math.max(86400000 * 7, endTime - startTime);
                            const count = rawNames.length;

                            list = rawNames.map((name, idx) => {
                              const fraction = (idx + 1) / count;
                              const stageTimestamp = startTime + (totalDuration * fraction);
                              const stageDate = new Date(stageTimestamp);
                              const formattedDeadline = stageDate.toLocaleDateString("en-US", { month: "short", day: "2-digit" });
                              return {
                                stage: name,
                                deadline: idx === count - 1 ? (ev.deadline && ev.deadline !== "Ongoing" && ev.deadline !== "TBD" ? ev.deadline : formattedDeadline) : formattedDeadline
                              };
                            });
                          }

                          // Keep natural round sequence
                          return list;
                        })();

                        const lastStageDeadline = stageObjects[stageObjects.length - 1]?.deadline || ev.deadline;
                        const isEventEnded = isDatePassed(lastStageDeadline);
                        const firstUnpassed = stageObjects.findIndex((s: { stage: string; deadline: string }) => !isDatePassed(s.deadline));
                        const allPassed = firstUnpassed === -1;
                        const activeIdx = (allPassed || isEventEnded) ? stageObjects.length - 1 : (firstUnpassed >= 0 ? firstUnpassed : 0);
                        const activeStageObj = stageObjects[activeIdx] || stageObjects[0];

                        return (
                          <motion.div 
                            key={ev.id}
                            layout
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ 
                              opacity: 0, 
                              scale: 0.95, 
                              height: 0, 
                              marginTop: 0, 
                              marginBottom: 0, 
                              paddingTop: 0, 
                              paddingBottom: 0, 
                              overflow: "hidden" 
                            }}
                            transition={{ duration: 0.35, ease: "easeInOut" }}
                            onMouseEnter={() => prefetchWorkspace(ev.id)}
                            className="relative z-10 border border-border-main/70 bg-bg-surface p-6 rounded-md flex flex-col gap-5 hover:shadow-[0_4px_16px_rgba(0,0,0,0.01)] transition-shadow duration-300"
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex flex-col gap-1 min-w-0">
                                <div className="flex items-center gap-2.5 flex-wrap">
                                  {editingWorkspaceId === ev.id ? (
                                    <div className="flex items-center gap-1.5 py-0.5">
                                      <input
                                        type="text"
                                        value={tempWorkspaceTitle}
                                        onChange={(e) => setTempWorkspaceTitle(e.target.value)}
                                        onKeyDown={(e) => {
                                          if (e.key === "Enter") handleSaveWorkspaceTitle(ev.id);
                                          if (e.key === "Escape") setEditingWorkspaceId(null);
                                        }}
                                        className="h-7 px-2 border border-accent-main bg-bg-base text-txt-main text-xs font-display rounded-sm focus:outline-none"
                                        autoFocus
                                      />
                                      <button
                                        type="button"
                                        onClick={() => handleSaveWorkspaceTitle(ev.id)}
                                        className="text-[9px] font-mono text-accent-main font-bold uppercase hover:underline cursor-pointer"
                                      >
                                        Save
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => setEditingWorkspaceId(null)}
                                        className="text-[9px] font-mono text-txt-muted uppercase hover:underline cursor-pointer"
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  ) : (
                                    <div className="flex items-center gap-2 group/title">
                                      <h3 className="font-display text-base font-semibold text-txt-main truncate">
                                        {resolvedTitle}
                                      </h3>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setTempWorkspaceTitle(resolvedTitle);
                                          setEditingWorkspaceId(ev.id);
                                        }}
                                        className="text-[9px] font-mono text-txt-muted/60 hover:text-accent-main opacity-80 sm:opacity-0 group-hover/title:opacity-100 transition-all cursor-pointer flex items-center gap-1 shrink-0 bg-bg-card px-1.5 py-0.5 rounded border border-border-main/60"
                                      >
                                        <Edit2 size={10} />
                                        <span>Rename</span>
                                      </button>
                                    </div>
                                  )}
                                </div>
                                {ev.url && (() => {
                                  let displayUrl = ev.url.startsWith("/workspace/") 
                                    ? `Workspace Desk (${ev.id.substring(0, 8)})` 
                                    : ev.url.replace(/^https?:\/\/(www\.)?/, "");

                                  if (!ev.url.startsWith("/workspace/") && displayUrl.length > 30) {
                                    displayUrl = displayUrl.substring(0, 30) + "...";
                                  }

                                  return (
                                    <a 
                                      href={ev.url.startsWith("/") || ev.url.startsWith("http") ? ev.url : `https://${ev.url}`} 
                                      target="_blank" 
                                      rel="noreferrer"
                                      className="text-[10px] text-txt-muted/80 hover:text-accent-main font-mono inline-flex items-center gap-1.5 self-start max-w-[180px] sm:max-w-[260px] md:max-w-[320px] overflow-hidden transition-colors group/link py-0.5 border border-border-main/40 px-1.5 py-0.5 rounded bg-bg-card"
                                    >
                                      <span className="truncate leading-none">{displayUrl}</span>
                                      <ExternalLink size={10} className="shrink-0 text-txt-muted/70 group-hover/link:text-accent-main transition-colors" />
                                    </a>
                                  );
                                })()}
                              </div>

                              <div className="flex items-center gap-3 flex-shrink-0">
                                {isReordering && events.length > 1 && (
                                  <div className="flex items-center gap-0.5 bg-bg-card p-1 rounded border border-accent-main/40">
                                    <button
                                      type="button"
                                      onClick={() => handleMoveWorkspace(evIndex, "up")}
                                      disabled={evIndex === 0}
                                      className={`p-1 rounded transition-colors ${
                                        evIndex === 0 ? "text-txt-muted/30 cursor-not-allowed" : "text-txt-muted hover:text-accent-main hover:bg-bg-surface cursor-pointer"
                                      }`}
                                    >
                                      <ChevronUp size={13} />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleMoveWorkspace(evIndex, "down")}
                                      disabled={evIndex === events.length - 1}
                                      className={`p-1 rounded transition-colors ${
                                        evIndex === events.length - 1 ? "text-txt-muted/30 cursor-not-allowed" : "text-txt-muted hover:text-accent-main hover:bg-bg-surface cursor-pointer"
                                      }`}
                                    >
                                      <ChevronDown size={13} />
                                    </button>
                                  </div>
                                )}

                                <div className="flex flex-col items-end gap-1">
                                  <span className="text-[9px] font-mono tracking-wider uppercase text-txt-muted max-w-[140px] truncate" title={activeStageObj?.stage || "Next Milestone"}>
                                    {activeStageObj?.stage || "Next Milestone"}
                                  </span>
                                  <span className="text-xs text-txt-main font-medium font-mono flex items-center gap-1">
                                    <Calendar size={11} className="text-accent-main" />
                                    {(() => {
                                      const d = activeStageObj?.deadline || ev.deadline || "Ongoing";
                                      return d.replace(/^(Completed\s*\(?|Target\s*)/i, "").replace(/\)$/, "").trim() || "Ongoing";
                                    })()}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Milestone Diagram */}
                            <div className="p-4 rounded-md border border-border-main/40 bg-bg-card overflow-x-auto">
                              <div className="relative flex justify-between items-start min-w-max w-full gap-4 px-2">
                                {/* Static Horizontal Track Line (Fading at both ends, never changes or glows) */}
                                <div className="absolute top-[8px] left-3 right-3 h-[1.5px] bg-gradient-to-r from-transparent via-border-main/70 to-transparent z-0" />
                                  
                                {stageObjects.map((stgObj: { stage: string; deadline: string }, idx: number) => {
                                  const isPassed = isDatePassed(stgObj.deadline);
                                  const isCompleted = isPassed || (allPassed) || (firstUnpassed > -1 && idx < firstUnpassed);
                                  const isCurrent = !isCompleted && idx === activeIdx;
                                  const isLastStage = idx === stageObjects.length - 1;
                                  const isLastStageCompleted = isLastStage && isCompleted;

                                  return (
                                    <div key={idx} className="relative flex flex-col items-center gap-1.5 text-center min-w-[120px]">
                                      {/* Node Circle with Workspace Left Section Glow */}
                                      <div className="relative h-[17px] w-[17px] shrink-0 flex items-center justify-center">
                                        {/* Glow Halos */}
                                        {isLastStageCompleted ? (
                                          <div className="absolute -inset-0.5 rounded-full bg-emerald-500/15 blur-[2px] pointer-events-none" />
                                        ) : isCompleted ? (
                                          <div className="absolute -inset-1 rounded-full bg-accent-main/20 blur-[2.5px] pointer-events-none" />
                                        ) : isCurrent ? (
                                          <div className="absolute -inset-1 rounded-full bg-accent-main/20 blur-[2.5px] pointer-events-none animate-pulse" />
                                        ) : null}

                                        {/* Node Circle with Numbers 1, 2, 3, 4 */}
                                        <div className={`relative z-10 h-[17px] w-[17px] rounded-full border-[1.5px] flex items-center justify-center leading-none p-0 transition-all duration-300 ${
                                          isLastStageCompleted
                                            ? "border-emerald-500 bg-bg-surface shadow-[0_0_5px_rgba(16,185,129,0.18)] text-emerald-400 font-bold"
                                            : isCompleted
                                            ? "border-accent-main bg-bg-surface shadow-[0_0_6px_rgba(var(--color-accent-main),0.15)] text-accent-main font-bold"
                                            : isCurrent
                                            ? "border-accent-main bg-bg-surface shadow-[0_0_6px_rgba(var(--color-accent-main),0.15)] text-accent-main font-bold"
                                            : "border-border-main/60 bg-bg-card text-txt-muted/60"
                                        }`}>
                                          <span className="text-[7.5px] font-mono leading-none block">
                                            {idx + 1}
                                          </span>
                                        </div>
                                      </div>

                                      <span className={`text-[10px] font-display font-medium leading-tight max-w-[130px] ${
                                        isLastStageCompleted
                                          ? "text-emerald-400 font-bold"
                                          : isCurrent || isCompleted
                                          ? "text-accent-main font-semibold"
                                          : "text-txt-muted/70"
                                      }`}>
                                        {stgObj.stage}
                                      </span>

                                      <span className={`text-[9px] font-mono ${
                                        isLastStageCompleted
                                          ? "text-emerald-400 font-semibold"
                                          : isCurrent || isCompleted
                                          ? "text-accent-main/90 font-medium"
                                          : "text-txt-muted/60"
                                      }`}>
                                        {(() => {
                                          const rawDeadline = stgObj.deadline || "Target Active";
                                          const clean = rawDeadline
                                            .replace(/^(Completed\s*\(?|Target\s*)/i, "")
                                            .replace(/\)$/, "")
                                            .trim();
                                          if (!clean || clean === "Date not specified" || clean === "TBD") {
                                            return "Date not specified";
                                          }
                                          if (isLastStageCompleted || isCompleted) {
                                            return clean === "Active" || clean === "Ongoing" ? "Completed" : `Completed (${clean})`;
                                          }
                                          return clean === "Active" ? "Target Active" : `Target ${clean}`;
                                        })()}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>

                            {/* Actions row */}
                            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border-main/30 pt-4 text-xs">
                              <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1.5 text-txt-sub font-light text-xs">
                                  <MapPin size={11} className="text-txt-muted/70" />
                                  <span className="uppercase font-mono text-[9px] tracking-wider">{ev.location}</span>
                                </div>
                                {ev.level && (
                                  <span className="text-[8px] font-mono tracking-widest text-txt-muted/70 uppercase border border-border-main/50 px-1.5 py-0.5 rounded bg-bg-card/50">
                                    {ev.level}
                                  </span>
                                )}
                              </div>
                              <div className="flex gap-2">
                                <button 
                                  type="button"
                                  onClick={() => setConfirmLeaveId(ev.id)}
                                  className="h-8 px-2.5 rounded-sm border border-border-main/50 hover:border-red-500/40 hover:bg-red-500/10 text-txt-muted hover:text-red-400 font-mono text-[10px] leading-none tracking-wider uppercase transition-all inline-flex items-center justify-center cursor-pointer font-medium gap-1.5 select-none"
                                >
                                  <Trash2 size={11} className="shrink-0" />
                                  <span className="leading-none">Leave</span>
                                </button>
                                <button 
                                  onClick={() => handleOpenInviteModal(ev.id)}
                                  className="h-8 px-3 rounded-sm border border-border-main/60 hover:bg-bg-card text-txt-main font-mono text-[10px] leading-none tracking-wider uppercase transition-colors inline-flex items-center justify-center gap-1.5 cursor-pointer font-medium select-none"
                                >
                                  <UserPlus size={11} className="shrink-0" />
                                  <span className="leading-none">Invite</span>
                                </button>
                                <Link 
                                  href={`/workspace/${ev.id}`}
                                  className="h-8 px-4 rounded-sm bg-accent-main hover:opacity-90 text-bg-base font-mono text-[10px] leading-none tracking-wider uppercase transition-colors duration-150 inline-flex items-center justify-center gap-1.5 cursor-pointer select-none font-semibold"
                                >
                                  <span className="leading-none">Enter Workspace</span>
                                  <ArrowRight size={11} className="shrink-0" />
                                </Link>
                              </div>
                            </div>

                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  )}
                </div>
              </>
            ) : (
              /* Opportunities Board Tab View */
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between border-b border-border-main/45 pb-2">
                  <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-accent-main">
                    Recommended Contests &amp; Hackathons
                  </span>
                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => setIsPresetModalOpen(true)}
                      className="h-5 px-2 bg-bg-card/70 hover:bg-bg-card border border-border-main/70 text-txt-muted hover:text-txt-main text-[8.5px] font-mono tracking-wider uppercase rounded inline-flex items-center gap-1 transition-all cursor-pointer opacity-80 hover:opacity-100 shrink-0 font-medium"
                      aria-label="Customize location, category, and travel preference presets"
                    >
                      <SlidersHorizontal size={9} className="text-accent-main" />
                      <span>Preference Preset</span>
                      {hasActivePreset && <span className="w-1.5 h-1.5 rounded-full bg-accent-main animate-pulse ml-0.5" />}
                    </button>
                    <span className="text-[9px] font-mono text-txt-muted uppercase">
                      {opportunities.filter(opp => !isDatePassed(opp.deadline)).length} Items Listed
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {opportunities.filter(opp => !isDatePassed(opp.deadline)).map((opp) => (
                    <div key={opp.id} className="border border-border-main/70 bg-bg-surface p-5 rounded-md flex flex-col gap-3 justify-between hover:border-txt-main/40 transition-colors">
                      <div className="flex flex-col gap-2">
                        <div className="flex justify-between items-start gap-2">
                          <h3 className="font-display text-sm font-semibold text-txt-main leading-snug">{opp.title}</h3>
                          {opp.facultyRecommended && (
                            <span className="text-[8px] font-mono text-amber-400 bg-amber-400/10 border border-amber-400/30 px-1.5 py-0.5 rounded uppercase font-bold shrink-0">
                              Faculty Pick
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-txt-muted font-light leading-relaxed line-clamp-2">{opp.description}</p>
                      </div>

                      <div className="flex flex-col gap-3 border-t border-border-main/30 pt-3">
                        <div className="flex justify-between items-center text-[9px] font-mono text-txt-muted">
                          <span>Deadline: {opp.deadline}</span>
                          <span className="uppercase">{opp.location} · {opp.level}</span>
                        </div>

                        <div className="flex gap-2 justify-end">
                          <a
                            href={opp.url}
                            target="_blank"
                            rel="noreferrer"
                            className="h-7 px-3 border border-border-main/60 hover:bg-bg-card text-txt-main text-[9px] font-mono uppercase tracking-wider rounded-sm flex items-center gap-1 font-semibold"
                          >
                            View Link <ExternalLink size={9} />
                          </a>
                          <button
                            onClick={() => {
                              setScraperUrl(opp.url);
                              setNewEventTitle(opp.title);
                              setNewEventDeadline(opp.deadline);
                              setIsModalOpen(true);
                            }}
                            className="h-7 px-3 bg-accent-main hover:opacity-90 text-bg-base text-[9px] font-mono uppercase tracking-wider rounded-sm flex items-center gap-1 font-bold cursor-pointer"
                          >
                            <Plus size={9} /> Track Desk
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        </main>
      )}



      {/* ==================== SCRAPER ADD MODAL ==================== */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            {/* Frosted Backing overlay */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setIsModalOpen(false); setModalError(null); setScraperUrl(""); setNewEventTitle(""); setNewEventDeadline(""); }}
              className="absolute inset-0 bg-bg-primary/60 backdrop-blur-sm"
            />

            {/* Modal Box */}
            <motion.div 
              initial={{ opacity: 0, y: 8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-lg border border-border-main/80 bg-bg-surface p-6 rounded-md shadow-lg z-10 flex flex-col gap-5"
            >
              
              {/* Close Button */}
              <button 
                onClick={() => { setIsModalOpen(false); setModalError(null); setScraperUrl(""); setNewEventTitle(""); setNewEventDeadline(""); }}
                className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-bg-card text-txt-muted hover:text-txt-main transition-colors"
              >
                <X size={15} />
              </button>

              <div className="flex flex-col gap-1 border-b border-border-main/40 pb-3">
                <h3 className="font-display text-lg font-semibold text-txt-main">Track New Event Link</h3>
                <p className="text-xs text-txt-muted font-light">Paste hackathon URL to auto-extract timelines and stages.</p>
              </div>

              {modalError && (
                <div className="text-xs text-txt-muted bg-bg-card border border-border-main/60 p-2.5 rounded-sm font-mono tracking-tight text-center">
                  {modalError}
                </div>
              )}

              {/* Scraper Input */}
              <form onSubmit={handleScrape} className="flex gap-2 items-center">
                <input 
                  type="text"
                  placeholder="Event Link (e.g. Unstop/Devpost URL or custom link)"
                  value={scraperUrl}
                  onChange={(e) => setScraperUrl(e.target.value)}
                  className="flex-1 h-10 px-3 border border-border-main/80 bg-bg-base text-txt-main rounded-sm text-sm placeholder:text-txt-muted/50 focus:outline-none focus:border-txt-main focus:ring-1 focus:ring-ring-main transition-colors font-light"
                />
                <button 
                  type="submit"
                  disabled={scraping || !scraperUrl.trim()}
                  className="h-10 px-4 rounded-sm bg-accent-main hover:opacity-90 disabled:opacity-50 text-bg-base text-xs font-mono uppercase tracking-wider transition-opacity cursor-pointer flex items-center justify-center shrink-0"
                >
                  {scraping ? "Extracting..." : "Auto-Extract"}
                </button>
              </form>

              {/* Manual Fields form */}
              <form onSubmit={handleAddEvent} className="flex flex-col gap-4 pt-2">
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-txt-sub font-medium">Event Title</label>
                  <input 
                    type="text"
                    required
                    placeholder="MIT HackHarvard 2026"
                    value={newEventTitle}
                    onChange={(e) => setNewEventTitle(e.target.value)}
                    className="h-10 px-3 border border-border-main/80 bg-bg-base text-txt-main rounded-sm text-sm placeholder:text-txt-muted/50 focus:outline-none focus:border-txt-main focus:ring-1 focus:ring-ring-main transition-colors font-light"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-txt-sub font-medium">Deadline Date (Optional)</label>
                    <input 
                      type="text"
                      placeholder="Oct 12, 2026 (Optional)"
                      value={newEventDeadline}
                      onChange={(e) => setNewEventDeadline(e.target.value)}
                      className="h-10 px-3 border border-border-main/80 bg-bg-base text-txt-main rounded-sm text-sm placeholder:text-txt-muted/50 focus:outline-none focus:border-txt-main focus:ring-1 focus:ring-ring-main transition-colors font-light"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-txt-sub font-medium">Location</label>
                    <select
                      value={newEventLocation}
                      onChange={(e) => setNewEventLocation(e.target.value as "online" | "in_person" | "hybrid")}
                      className="h-10 px-3 border border-border-main/80 bg-bg-base text-txt-main rounded-sm text-sm focus:outline-none focus:border-txt-main focus:ring-1 focus:ring-ring-main transition-colors font-light"
                    >
                      <option value="online">Online</option>
                      <option value="in_person">In-Person</option>
                      <option value="hybrid">Hybrid</option>
                    </select>
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full h-11 rounded-sm bg-accent-main hover:opacity-90 text-bg-base font-medium text-xs tracking-wider uppercase flex items-center justify-center gap-2 mt-2 transition-opacity cursor-pointer"
                >
                  Create Project Vault
                  <ArrowRight size={14} />
                </button>
              </form>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Invite Friends Modal from Homepage */}
      {isInviteHomeModalOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden font-sans">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" 
            onClick={() => setIsInviteHomeModalOpen(false)}
          />

          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="max-w-md w-full border border-border-main/70 bg-bg-surface p-6 rounded-md shadow-2xl flex flex-col gap-6 animate-fade-in relative z-55">
              
              <div className="flex justify-between items-start border-b border-border-main/40 pb-3">
                <div className="flex flex-col gap-0.5">
                  <span className="font-mono text-[9px] uppercase tracking-widest text-txt-muted font-bold">Event invitation</span>
                  <h3 className="font-display text-lg font-semibold text-txt-main">Invite Classmates to Collaborate</h3>
                </div>
                <button 
                  onClick={() => setIsInviteHomeModalOpen(false)}
                  className="p-1 rounded-full hover:bg-bg-card text-txt-muted hover:text-txt-main cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Workspace Invite Link Box */}
              <div className="flex flex-col gap-1.5 border-b border-border-main/40 pb-4">
                <span className="text-[10px] text-txt-sub font-semibold uppercase tracking-wider font-mono">Workspace Invite Link</span>
                <div className="flex items-center gap-2">
                  <input 
                    type="text"
                    readOnly
                    value={typeof window !== "undefined" ? `${window.location.origin}/workspace/${inviteEventId}?join=true` : ""}
                    className="h-9 px-3 border border-border-main/70 bg-bg-base text-txt-main rounded text-xs font-mono flex-1 font-light selection:bg-accent-main selection:text-bg-base"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (typeof window !== "undefined") {
                        const link = `${window.location.origin}/workspace/${inviteEventId}?join=true`;
                        navigator.clipboard.writeText(link);
                        showToast("Workspace invite link copied!");
                      }
                    }}
                    className="h-9 px-3 bg-accent-main hover:opacity-90 text-bg-base font-mono text-[9px] uppercase tracking-wider font-bold rounded flex items-center gap-1.5 cursor-pointer shrink-0"
                  >
                    <Copy size={11} /> Copy Link
                  </button>
                </div>
              </div>

              {/* Direct Invite Friends Block */}
              <div className="flex flex-col gap-2.5">
                <span className="text-[10px] text-txt-sub font-semibold uppercase tracking-wider font-mono">Your Active Friends</span>
                
                <div className="max-h-56 overflow-y-auto border border-border-main/60 rounded bg-bg-card divide-y divide-border-main/60">
                  {friendsToInviteHome.length > 0 ? (
                    friendsToInviteHome.map(f => (
                      <div key={f.id} className="p-3 flex justify-between items-center gap-4 bg-bg-surface">
                        <div className="flex flex-col">
                          <span className="text-xs text-txt-main font-semibold">{f.full_name}</span>
                          <span className="text-[9px] text-txt-muted font-mono">@{f.username}</span>
                        </div>
                        <button 
                          onClick={() => handleSendInviteFromHome(f.id, f.full_name)}
                          className="h-7 px-3 bg-accent-main hover:opacity-90 text-bg-base text-[9px] font-mono tracking-wider uppercase rounded-sm flex items-center gap-1 cursor-pointer font-bold"
                        >
                          Send Invite
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="p-6 text-center text-txt-muted font-mono text-[9px] uppercase">
                      No active friends found. Connect on the Friends tab first.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Leave Workspace Confirmation Modal */}
      <AnimatePresence>
        {confirmLeaveId && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[150] overflow-hidden font-sans text-left bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="max-w-xs w-full border border-border-main/80 bg-bg-surface p-6 rounded-md shadow-2xl flex flex-col gap-4 relative z-[160]"
            >
              <div className="flex flex-col gap-1.5 text-center">
                <span className="font-mono text-[9px] uppercase tracking-widest text-red-400 font-bold flex items-center justify-center gap-1">
                  <LogOut size={11} /> Leave Workspace
                </span>
                <h3 className="font-display text-base font-semibold text-txt-main">Leave this workspace?</h3>
                <p className="text-[11px] text-txt-muted font-light leading-relaxed">
                  Are you sure you want to leave and delete this workspace for your account? You will be removed from the active member roster and your local workspace desk access will be deleted.
                </p>
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setConfirmLeaveId(null)}
                  className="flex-1 h-8 rounded bg-bg-card border border-border-main/80 text-txt-muted hover:text-txt-main text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer font-medium"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmLeaveWorkspace}
                  className="flex-1 h-8 rounded bg-red-500/90 hover:bg-red-500 text-white text-xs font-mono uppercase tracking-wider font-bold transition-opacity cursor-pointer shadow-sm flex items-center justify-center gap-1"
                >
                  Confirm & Leave
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Custom LynDesk Invite Toast Banner */}
      {inviteToast && (
        <div className="fixed bottom-6 right-6 z-[10000] bg-bg-surface border border-emerald-500/50 shadow-2xl p-4 rounded-md flex items-center gap-3 animate-fade-in text-xs font-mono text-txt-main">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>{inviteToast.msg}</span>
        </div>
      )}

      <Footer />

      {/* Shared Global Preference Preset Modal */}
      <PreferencePresetModal 
        isOpen={isPresetModalOpen}
        onClose={() => setIsPresetModalOpen(false)}
      />
    </div>
  );
}
