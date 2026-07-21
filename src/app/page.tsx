"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "./context/AuthContext";
import { supabase } from "./lib/supabase";
import Link from "next/link";
import Header from "./components/Header";
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
  User,
  CheckCircle2,
  X,
  Eye,
  EyeOff
} from "lucide-react";

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



function DashboardSkeleton() {
  return (
    <div className="flex-grow max-w-7xl w-full mx-auto px-6 md:px-12 py-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-pulse">
      {/* Left Sidebar Skeleton (3 columns) */}
      <div className="lg:col-span-3 flex flex-col gap-6">
        <div className="border border-border-main/40 bg-bg-surface/50 p-5 rounded-md flex flex-col gap-3">
          <div className="h-2 w-16 bg-border-main/60 rounded" />
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-border-main/60" />
            <div className="flex flex-col gap-2 flex-grow">
              <div className="h-3 w-24 bg-border-main/60 rounded" />
              <div className="h-2 w-32 bg-border-main/60 rounded" />
            </div>
          </div>
        </div>
        <div className="border border-border-main/40 bg-bg-surface/50 p-5 rounded-md flex flex-col gap-3">
          <div className="h-2 w-20 bg-border-main/60 rounded" />
          <div className="h-8 w-24 bg-border-main/60 rounded mt-1" />
          <div className="h-1 w-full bg-border-main/60 rounded" />
          <div className="h-2 w-full bg-border-main/40 rounded" />
        </div>
      </div>

      {/* Center Column Skeleton (6 columns) */}
      <div className="lg:col-span-6 flex flex-col gap-6">
        <div className="flex gap-4 border-b border-border-main/40 pb-2">
          <div className="h-4 w-20 bg-border-main/60 rounded" />
          <div className="h-4 w-20 bg-border-main/40 rounded" />
          <div className="h-4 w-20 bg-border-main/40 rounded" />
        </div>
        <div className="border border-border-main/40 bg-bg-surface/50 p-6 rounded-md flex flex-col gap-4">
          <div className="h-4 w-40 bg-border-main/60 rounded" />
          <div className="h-3 w-full bg-border-main/40 rounded" />
          <div className="h-3 w-5/6 bg-border-main/40 rounded" />
        </div>
        <div className="border border-border-main/40 bg-bg-surface/50 p-6 rounded-md flex flex-col gap-4">
          <div className="h-4 w-32 bg-border-main/60 rounded" />
          <div className="h-3 w-full bg-border-main/40 rounded" />
        </div>
      </div>

      {/* Right Column Skeleton (3 columns) */}
      <div className="lg:col-span-3 flex flex-col gap-6">
        <div className="border border-border-main/40 bg-bg-surface/50 p-5 rounded-md flex flex-col gap-3">
          <div className="h-2 w-24 bg-border-main/60 rounded" />
          <div className="h-3 w-full bg-border-main/40 rounded" />
          <div className="h-3 w-full bg-border-main/40 rounded" />
        </div>
      </div>
    </div>
  );
}

function LandingSkeleton() {
  return (
    <div className="flex-grow max-w-7xl w-full mx-auto px-6 md:px-12 py-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center animate-pulse">
      <div className="lg:col-span-7 flex flex-col gap-6">
        <div className="h-3 w-32 bg-border-main/60 rounded" />
        <div className="h-12 w-4/5 bg-border-main/60 rounded" />
        <div className="h-4 w-full bg-border-main/40 rounded" />
        <div className="h-4 w-2/3 bg-border-main/40 rounded" />
      </div>
      <div className="lg:col-span-5 border border-border-main/40 bg-bg-surface/50 p-8 rounded-md flex flex-col gap-4">
        <div className="h-6 w-32 bg-border-main/60 rounded" />
        <div className="h-10 w-full bg-border-main/40 rounded" />
        <div className="h-10 w-full bg-border-main/40 rounded" />
      </div>
    </div>
  );
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

// Mock Timelines for initial state
const INITIAL_EVENTS: EventItem[] = [
  {
    id: "e1",
    title: "MIT HackHarvard 2026",
    deadline: "Oct 12, 2026",
    location: "hybrid",
    level: "global",
    url: "https://hackharvard.org",
    status: "development",
    stages: ["Ideation", "Build", "Review", "Submitted"]
  },
  {
    id: "e2",
    title: "Google Developer Hackathon",
    deadline: "Nov 02, 2026",
    location: "online",
    level: "national",
    url: "https://build.google.com",
    status: "ideation",
    stages: ["Concept", "Prototype Selection", "Final Presentation"]
  }
];

export default function Home() {
  const { user, loading: authLoading } = useAuth();
  const [likelyHasSession, setLikelyHasSession] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const keys = Object.keys(localStorage);
      const hasToken = keys.some(key => key.startsWith("sb-") && key.endsWith("-auth-token"));
      queueMicrotask(() => {
        setLikelyHasSession(hasToken);
      });
    }
  }, []);

  const [authStep, setAuthStep] = useState<"idle" | "login" | "signup" | "success" | "faculty_login">("idle");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [staffKey, setStaffKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showFacultyPassword, setShowFacultyPassword] = useState(false);

  // Dashboard & Scraper States
  const [events, setEvents] = useState<EventItem[]>(INITIAL_EVENTS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [scraperUrl, setScraperUrl] = useState("");
  const [scraping, setScraping] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState("");
  const [newEventDeadline, setNewEventDeadline] = useState("");
  const [newEventLocation, setNewEventLocation] = useState<"online" | "in_person" | "hybrid">("online");
  const [modalError, setModalError] = useState<string | null>(null);

  // Active Co-workers live list state
  const [coworkers, setCoworkers] = useState<{ name: string; role: string; active: boolean }[]>([]);
  const [collegeName, setCollegeName] = useState("");

  // Home Invite Friends States
  const [inviteEventId, setInviteEventId] = useState<string | null>(null);
  const [friendsToInviteHome, setFriendsToInviteHome] = useState<any[]>([]);
  const [isInviteHomeModalOpen, setIsInviteHomeModalOpen] = useState(false);

  // News and Opportunities States
  const [dashTab, setDashTab] = useState<"workspaces" | "opportunities">("workspaces");
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [searchOppQuery, setSearchOppQuery] = useState("");
  const [filterOppCategory, setFilterOppCategory] = useState("");
  const [filterOppLocation, setFilterOppLocation] = useState("");

  // Load opportunities from localStorage on mount and register active listener
  useEffect(() => {
    if (typeof window !== "undefined") {
      const loadOpps = () => {
        const stored = localStorage.getItem("ldk_opportunities");
        if (stored) {
          setOpportunities(JSON.parse(stored));
        } else {
          const defaultOpps = [
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

  // Load events from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("ldk_events");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setTimeout(() => {
            setEvents(parsed);
          }, 0);
        } catch (e) {
          console.error("Failed to parse stored events: ", e);
        }
      }
    }
  }, []);

  // Sync events to localStorage on modification
  useEffect(() => {
    if (events && events.length > 0) {
      localStorage.setItem("ldk_events", JSON.stringify(events));
    }
  }, [events]);

  useEffect(() => {
    if (user) {
      const fetchCoworkersAndCollege = async () => {
        try {
          const { data: cowData, error: cowErr } = await supabase
            .from("profiles")
            .select("full_name, department")
            .limit(3);
          
          if (!cowErr && cowData && cowData.length > 0) {
            const list = cowData.map((p, index) => ({
              name: p.full_name || "Developer",
              role: p.department || "Engineer",
              active: index % 2 === 0
            }));
            setCoworkers(list);
          }

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
          const { data: memberData, error: memberErr } = await supabase
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

          if (!memberErr && memberData && memberData.length > 0) {
            const dbEvents = memberData.map((m: any) => {
              const space = m.project_spaces;
              const ev = space?.events;
              return {
                id: space?.id || m.project_space_id,
                title: space?.project_name || ev?.title || "Project Space",
                deadline: ev?.registration_deadline 
                  ? new Date(ev.registration_deadline).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) 
                  : "TBD",
                location: ev?.location || "online",
                level: ev?.level || "global",
                url: ev?.source_url || space?.github_repo || "https://lyndesk.com",
                status: space?.status || "ideation",
                stages: ["Ideation", "Development", "Final Submission"]
              };
            });

            setEvents(prev => {
              const merged = [...dbEvents];
              prev.forEach(p => {
                if (!merged.some(m => m.id === p.id)) {
                  merged.push(p);
                }
              });
              return merged;
            });
          }
        } catch (err) {
          console.error("Failed to load live active coworkers/college: ", err);
        }
      };
      fetchCoworkersAndCollege();
    }
  }, [user]);

  const fallbackCoworkers = [
    { name: "Alex Carter", role: "Dev", active: true },
    { name: "Mira Sen", role: "Designer", active: true },
    { name: "Prof. Davis", role: "Mentor", active: false }
  ];
  const activeCoworkers = coworkers.length > 0 ? coworkers : fallbackCoworkers;

  // Derivations for profile picture and username
  const avatarUrl = user?.user_metadata?.avatar_url || user?.user_metadata?.picture || "";
  const username = user?.user_metadata?.username || user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User";

  useEffect(() => {
    const handle = setTimeout(() => {
      if (!authLoading) {
        setLoading(false);
      }
      if (user) {
        setAuthStep("success");
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
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  const handleFacultyLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

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
        await supabase.auth.updateUser({
          data: { company_key: "recruit2026", role: "employee" }
        });
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
      await supabase.auth.signOut();
      setError("Invalid Staff Key. Access denied.");
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
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
  };

  const handleOAuthLogin = async (provider: "google" | "github" | "discord" | "linkedin") => {
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: provider === "linkedin" ? "linkedin_oidc" : provider,
      options: {
        redirectTo: typeof window !== "undefined" ? window.location.origin : undefined,
      },
    });
    if (error) {
      setError(error.message);
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
    if (!newEventTitle || !scraperUrl) {
      setModalError("Event Title and Link are required fields.");
      return;
    }

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
            source_url: scraperUrl,
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

    const newObj = {
      id: spaceId,
      title: newEventTitle,
      deadline: newEventDeadline.trim() || "TBD",
      location: newEventLocation,
      level: "global" as const,
      url: scraperUrl,
      status: "ideation" as const,
      stages: ["Ideation", "Development", "Final Submission"]
    };

    setEvents([newObj, ...events]);
    setIsModalOpen(false);
    setScraperUrl("");
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
        setFriendsToInviteHome(friendsList);
      } else {
        setFriendsToInviteHome([
          { id: "mock_f1", username: "alex_carter", full_name: "Alex Carter" },
          { id: "mock_f2", username: "mira_sen", full_name: "Mira Sen" }
        ]);
      }
    } catch (e) {
      console.error(e);
      setFriendsToInviteHome([
        { id: "mock_f1", username: "alex_carter", full_name: "Alex Carter" },
        { id: "mock_f2", username: "mira_sen", full_name: "Mira Sen" }
      ]);
    }
  };

  const handleSendInviteFromHome = async (friendId: string, friendName: string) => {
    if (!inviteEventId) return;
    try {
      const { error } = await supabase
        .from("project_members")
        .insert({
          project_space_id: inviteEventId,
          profile_id: friendId,
          role: "member"
        });

      if (!error) {
        await supabase.from("chat_messages").insert({
          project_space_id: inviteEventId,
          profile_id: user?.id,
          content: `Invited ${friendName} to collaborate via Dashboard!`
        });
        alert(`Successfully invited ${friendName} to this event!`);
      } else {
        alert(`Invite sent (simulated): ${friendName} invited.`);
      }
    } catch (e) {
      console.error(e);
      alert(`Invite sent (simulated): ${friendName} invited.`);
    }
  };

  return (
    <div className="min-h-screen lg:h-screen lg:overflow-hidden flex flex-col font-sans selection:bg-accent-main selection:text-bg-base">
      
      {/* 1. Header (Unified Navigation & Notifications Drawer) */}
      <Header />

      {/* Conditional Layout: Landing VS. Dashboard */}
      {authLoading ? (
        likelyHasSession ? (
          <DashboardSkeleton />
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
                Link Your Next Desk
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
        <main className="flex-1 max-w-7xl w-full mx-auto px-6 md:px-12 py-6 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
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
                    className="rounded-full border border-border-main/60 object-cover"
                  />
                ) : (
                  <div className="h-10 w-10 rounded-full border border-border-main/80 bg-bg-card flex items-center justify-center text-txt-muted flex-shrink-0">
                    <User size={18} className="stroke-[1.5]" />
                  </div>
                )}
                <div className="flex flex-col min-w-0">
                  <span className="text-xs text-txt-main font-mono truncate font-semibold">{username}</span>
                  <span className="text-[10px] text-txt-muted font-light">{collegeName || "Independent Student"}</span>
                  <span className="text-[8px] text-txt-muted font-mono select-all mt-0.5">Desk ID: {user?.id}</span>
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
                  <span className="text-3xl font-display font-light tracking-tight text-txt-main">32</span>
                  <span className="text-[10px] text-txt-muted uppercase tracking-wider font-mono">/ 100 Pts</span>
                </div>
                <div className="w-full h-1 bg-border-main/50 rounded-full overflow-hidden">
                  <div className="bg-accent-main h-full rounded-full" style={{ width: "32%" }} />
                </div>
                <p className="text-[10px] text-txt-muted font-light leading-relaxed">
                  3 completed projects verified by academic coordinators. 8 points pending.
                </p>
              </div>
            </div>

            {/* Teammates List */}
            <div className="border border-border-main/70 bg-bg-surface p-5 rounded-md flex flex-col gap-4">
              <span className="font-mono text-[9px] uppercase tracking-widest text-txt-muted font-bold">Active Co-Workers</span>
              <div className="flex flex-col gap-3">
                {activeCoworkers.map((cw, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${cw.active ? "bg-emerald-500" : "bg-border-main"}`} />
                      <span className="text-xs text-txt-main font-light">{cw.name}</span>
                    </div>
                    <span className="text-[8px] font-mono text-txt-muted uppercase tracking-wider">{cw.role}</span>
                  </div>
                ))}
              </div>
            </div>

          </section>

          {/* B. Center Panel: The Event Registry & Timelines (6 Columns) */}
          <section className="lg:col-span-6 flex flex-col gap-6">
            
            {/* Header + Add button */}
            <div className="flex items-center justify-between border-b border-border-main/50 pb-4">
              <div className="flex flex-col gap-0.5">
                <h2 className="font-display text-xl font-light text-txt-main">
                  {dashTab === "workspaces" ? "Event Registry" : "Opportunities Board"}
                </h2>
                <p className="text-[10px] text-txt-muted font-light">
                  {dashTab === "workspaces" ? "Tracked project desks and submission stages." : "Faculty-recommended contests, hackathons, and news."}
                </p>
              </div>
              {dashTab === "workspaces" && (
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="h-9 px-3.5 rounded-sm bg-accent-main hover:opacity-90 text-bg-base text-xs font-mono uppercase tracking-wider flex items-center gap-1.5 transition-opacity duration-150 cursor-pointer"
                >
                  <Plus size={13} />
                  Track Link
                </button>
              )}
            </div>

            {/* Tab selector */}
            <div className="flex gap-4 border-b border-border-main/45 pb-2 text-[10px] uppercase font-mono tracking-wider font-semibold">
              <button
                onClick={() => setDashTab("workspaces")}
                className={`pb-1 border-b-2 transition-all cursor-pointer ${
                  dashTab === "workspaces" ? "border-accent-main text-accent-main font-bold" : "border-transparent text-txt-muted hover:text-txt-main"
                }`}
              >
                My Workspaces
              </button>
              <button
                onClick={() => setDashTab("opportunities")}
                className={`pb-1 border-b-2 transition-all cursor-pointer ${
                  dashTab === "opportunities" ? "border-accent-main text-accent-main font-bold" : "border-transparent text-txt-muted hover:text-txt-main"
                }`}
              >
                News & Contests
              </button>
            </div>

            {dashTab === "workspaces" ? (
              /* List of active events */
              <div className="flex flex-col gap-5">
                {events.map((ev) => (
                <div 
                  key={ev.id}
                  className="border border-border-main/70 bg-bg-surface p-6 rounded-md flex flex-col gap-5 hover:shadow-[0_4px_16px_rgba(0,0,0,0.01)] transition-shadow duration-300"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex flex-col gap-1 min-w-0">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <h3 className="font-display text-base font-semibold text-txt-main truncate">{ev.title}</h3>
                        <span className="text-[9px] font-mono tracking-widest text-txt-muted uppercase border border-border-main/80 px-2 py-0.5 rounded bg-bg-card">
                          {ev.level}
                        </span>
                      </div>
                      <a 
                        href={ev.url} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-[10px] text-txt-muted hover:text-txt-main font-mono flex items-center gap-1 self-start transition-colors"
                      >
                        {ev.url}
                        <ExternalLink size={10} />
                      </a>
                    </div>

                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      <span className="text-[9px] font-mono tracking-wider uppercase text-txt-muted">Deadline</span>
                      <span className="text-xs text-txt-main font-medium">{ev.deadline}</span>
                    </div>
                  </div>

                  {/* Horizontal Stage Progress line */}
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center text-[9px] font-mono tracking-widest text-txt-muted uppercase">
                      <span>Timeline Stages</span>
                      <span className="text-txt-main font-bold">Active: {ev.status}</span>
                    </div>
                    
                    <div className="relative flex justify-between items-center py-2">
                      <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-border-main/50 -translate-y-1/2 z-0" />
                      <div 
                        className="absolute top-1/2 left-0 h-[2px] bg-accent-main -translate-y-1/2 z-0 transition-all duration-300"
                        style={{ width: ev.status === "ideation" ? "33%" : ev.status === "development" ? "66%" : "100%" }}
                      />
                      
                      {ev.stages.map((stg, idx) => (
                        <div key={idx} className="relative z-10 flex flex-col items-center gap-1.5">
                          <div className={`h-4 w-4 rounded-full border-2 bg-bg-surface flex items-center justify-center transition-colors duration-200 ${
                            idx === 0 || (idx === 1 && ev.status !== "ideation") || (idx === 2 && ev.status === "submitted")
                              ? "border-accent-main text-accent-main" 
                              : "border-border-main"
                          }`}>
                            {(idx === 0 || (idx === 1 && ev.status !== "ideation")) && <CheckCircle2 size={10} className="fill-accent-main text-bg-surface" />}
                          </div>
                          <span className="text-[9px] font-light text-txt-sub">{stg}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions row */}
                  <div className="flex items-center justify-between border-t border-border-main/40 pt-4 mt-1">
                    <div className="flex items-center gap-1 text-[10px] text-txt-muted">
                      <MapPin size={11} />
                      <span className="uppercase font-mono">{ev.location}</span>
                    </div>

                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleOpenInviteModal(ev.id)}
                        className="h-8 px-3 rounded-sm border border-border-main/60 hover:bg-bg-card text-txt-main font-mono text-[10px] tracking-wider uppercase transition-colors flex items-center justify-center cursor-pointer font-bold"
                      >
                        Invite
                      </button>
                      <Link 
                        href={`/workspace/${ev.id}`}
                        className="h-8 px-4 rounded-sm bg-accent-main hover:opacity-90 text-bg-base font-mono text-[10px] tracking-wider uppercase transition-colors duration-150 flex items-center justify-center cursor-pointer select-none font-bold"
                      >
                        Enter Workspace →
                      </Link>
                    </div>
                  </div>

                </div>
              ))}
            </div>
            ) : (
              /* News and Opportunities Board tab */
              <div className="flex flex-col gap-6 animate-fade-in text-left">
                
                {/* College Recommended Section */}
                {opportunities.filter(o => o.facultyRecommended).length > 0 && (
                  <div className="border border-amber-500/20 bg-amber-500/[0.03] p-5 rounded-md flex flex-col gap-3">
                    <div className="flex items-center gap-1.5 text-amber-500 font-mono text-[9px] uppercase tracking-widest font-bold">
                      <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
                      🏫 Faculty Recommended
                    </div>
                    <div className="flex flex-col gap-3.5 divide-y divide-amber-500/10">
                      {opportunities.filter(o => o.facultyRecommended).map((opp, idx) => (
                        <div key={opp.id} className={`flex justify-between items-start gap-4 ${idx > 0 ? "pt-3.5" : ""}`}>
                          <div className="flex flex-col min-w-0 gap-1">
                            <div className="flex items-baseline gap-2 flex-wrap">
                              <span className="text-xs text-txt-main font-semibold">{opp.title}</span>
                              <span className="text-[8px] font-mono tracking-widest uppercase border border-amber-500/30 px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-600 font-bold animate-fade-in">
                                {opp.category}
                              </span>
                            </div>
                            <p className="text-[10px] text-txt-sub font-light leading-relaxed truncate max-w-md">{opp.description}</p>
                          </div>
                          <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                            <span className="text-[9px] font-mono text-txt-muted">Deadline: {opp.deadline}</span>
                            <a 
                              href={opp.url} 
                              target="_blank" 
                              rel="noreferrer"
                              className="text-[9px] text-accent-main hover:underline font-mono uppercase font-bold flex items-center gap-0.5"
                            >
                              Explore <ExternalLink size={9} />
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Filter and Search controls */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-bg-card/25 p-4 border border-border-main/50 rounded-md">
                  <input 
                    type="text"
                    value={searchOppQuery}
                    onChange={(e) => setSearchOppQuery(e.target.value)}
                    placeholder="Search opportunities..."
                    className="h-8 px-2 border border-border-main bg-bg-base text-txt-main text-xs focus:outline-none focus:border-txt-main rounded-sm placeholder:text-txt-muted/50"
                  />
                  
                  <select
                    value={filterOppCategory}
                    onChange={(e) => setFilterOppCategory(e.target.value)}
                    className="h-8 px-2 border border-border-main bg-bg-base text-txt-main text-xs focus:outline-none focus:border-txt-main rounded-sm cursor-pointer"
                  >
                    <option value="">All Categories</option>
                    <option value="hackathon">Hackathons</option>
                    <option value="contest">Contests</option>
                    <option value="news">News & Updates</option>
                  </select>

                  <select
                    value={filterOppLocation}
                    onChange={(e) => setFilterOppLocation(e.target.value)}
                    className="h-8 px-2 border border-border-main bg-bg-base text-txt-main text-xs focus:outline-none focus:border-txt-main rounded-sm cursor-pointer"
                  >
                    <option value="">All Locations</option>
                    <option value="online">Online</option>
                    <option value="in_person">In-Person</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                </div>

                {/* Main Opportunities List */}
                <div className="flex flex-col border border-border-main/60 bg-bg-surface rounded-md divide-y divide-border-main/60">
                  {(() => {
                    const filtered = opportunities.filter(opp => {
                      const matchesSearch = opp.title.toLowerCase().includes(searchOppQuery.toLowerCase()) || 
                                            opp.description.toLowerCase().includes(searchOppQuery.toLowerCase());
                      const matchesCategory = filterOppCategory ? opp.category === filterOppCategory : true;
                      const matchesLocation = filterOppLocation ? opp.location === filterOppLocation : true;
                      return matchesSearch && matchesCategory && matchesLocation;
                    });

                    if (filtered.length === 0) {
                      return (
                        <div className="p-8 text-center text-txt-muted font-mono text-[10px] uppercase">
                          No matching opportunities found
                        </div>
                      );
                    }

                    return filtered.map(opp => (
                      <div key={opp.id} className="p-4 flex justify-between items-center gap-4 hover:bg-bg-card/10 transition-colors">
                        <div className="flex flex-col min-w-0 gap-0.5">
                          <div className="flex items-baseline gap-2 flex-wrap">
                            <span className="text-xs text-txt-main font-semibold">{opp.title}</span>
                            {opp.facultyRecommended && (
                              <span className="text-[8px] font-mono tracking-wider border border-amber-500/40 px-1.5 py-0.2 rounded uppercase font-bold text-amber-500 bg-amber-500/5">
                                Recommended
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-txt-sub font-light leading-relaxed max-w-md">{opp.description}</span>
                          <div className="flex items-center gap-2 mt-1 text-[9px] text-txt-muted uppercase font-mono">
                            <span className="bg-bg-card px-1.5 py-0.5 border border-border-main/40 rounded">{opp.category}</span>
                            <span>•</span>
                            <span>{opp.location}</span>
                            <span>•</span>
                            <span>{opp.level}</span>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                          <span className="text-[9px] font-mono text-txt-muted">Deadline: {opp.deadline}</span>
                          <a 
                            href={opp.url}
                            target="_blank"
                            rel="noreferrer"
                            className="h-7 px-3 bg-accent-main hover:opacity-90 text-bg-base text-[9px] font-mono tracking-wider uppercase rounded-sm flex items-center justify-center gap-0.5 font-bold"
                          >
                            Explore <ExternalLink size={9} />
                          </a>
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              </div>
            )}

          </section>

          {/* C. Right Panel: Coding Platform Overview (3 Columns) */}
          <section className="lg:col-span-3 flex flex-col gap-6">
            
            {/* Coding Platform Overview */}
            <div className="border border-border-main/70 bg-bg-surface p-5 rounded-md flex flex-col gap-4">
              <span className="font-mono text-[9px] uppercase tracking-widest text-txt-muted font-bold">Coding Platform Overview</span>
              
              {(() => {
                const meta = user?.user_metadata || {};
                const lcUser = meta.leetcode_username || "";
                const cfUser = meta.codeforces_username || "";
                const ccUser = meta.codechef_username || "";
                const unstopUser = meta.unstop_username || "";
                const hasAnyLinked = lcUser || cfUser || ccUser || unstopUser;

                if (hasAnyLinked) {
                  return (
                    <div className="flex flex-col gap-3">
                      {lcUser && (
                        <div className="bg-bg-base/40 border border-border-main/60 p-3 rounded flex flex-col gap-1">
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-txt-main font-semibold">LeetCode</span>
                            <span className="text-[10px] text-accent-main font-mono">@{lcUser}</span>
                          </div>
                          <div className="flex justify-between items-baseline mt-1">
                            <span className="text-base font-mono text-txt-main font-bold">342 <span className="text-[9px] text-txt-muted uppercase font-normal">Solved</span></span>
                            <span className="text-[9px] font-mono text-txt-sub">Top 8.4%</span>
                          </div>
                        </div>
                      )}

                      {cfUser && (
                        <div className="bg-bg-base/40 border border-border-main/60 p-3 rounded flex flex-col gap-1">
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-txt-main font-semibold">Codeforces</span>
                            <span className="text-[10px] text-accent-main font-mono">@{cfUser}</span>
                          </div>
                          <div className="flex justify-between items-baseline mt-1">
                            <span className="text-base font-mono text-txt-main font-bold">1480 <span className="text-[9px] text-txt-muted uppercase font-normal">Rating</span></span>
                            <span className="text-[9px] font-mono text-txt-sub">Specialist</span>
                          </div>
                        </div>
                      )}

                      {ccUser && (
                        <div className="bg-bg-base/40 border border-border-main/60 p-3 rounded flex flex-col gap-1">
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-txt-main font-semibold">CodeChef</span>
                            <span className="text-[10px] text-accent-main font-mono">@{ccUser}</span>
                          </div>
                          <div className="flex justify-between items-baseline mt-1">
                            <span className="text-base font-mono text-txt-main font-bold">1624 <span className="text-[9px] text-txt-muted uppercase font-normal">Rating</span></span>
                            <span className="text-[9px] font-mono text-txt-sub">3★ Star</span>
                          </div>
                        </div>
                      )}

                      {unstopUser && (
                        <div className="bg-bg-base/40 border border-border-main/60 p-3 rounded flex flex-col gap-1">
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-txt-main font-semibold">Unstop</span>
                            <span className="text-[10px] text-accent-main font-mono">@{unstopUser}</span>
                          </div>
                          <div className="flex justify-between items-baseline mt-1">
                            <span className="text-base font-mono text-txt-main font-bold">6 <span className="text-[9px] text-txt-muted uppercase font-normal">Hacks</span></span>
                            <span className="text-[9px] font-mono text-txt-sub">Rank #145</span>
                          </div>
                        </div>
                      )}

                      <Link 
                        href="/coding-deck"
                        className="h-8 bg-accent-main/10 hover:bg-accent-main/20 text-accent-main text-[9px] font-mono tracking-wider uppercase rounded-sm flex items-center justify-center gap-1.5 transition-colors border border-accent-main/30 font-bold"
                      >
                        Manage Coding Deck &rarr;
                      </Link>
                    </div>
                  );
                }

                return (
                  <div className="flex flex-col gap-3 text-center py-2">
                    <p className="text-[10px] text-txt-sub font-light leading-relaxed">
                      Link LeetCode, Codeforces, CodeChef, and Unstop handles to display stats, ratings, and streaks here.
                    </p>
                    <Link 
                      href="/coding-deck"
                      className="h-8 bg-accent-main hover:opacity-90 text-bg-base text-[9px] font-mono tracking-wider uppercase rounded-sm flex items-center justify-center gap-1.5 transition-opacity font-bold"
                    >
                      Connect Platforms &rarr;
                    </Link>
                  </div>
                );
              })()}
            </div>

          </section>

        </main>
      )}

      {/* 3. Footer */}
      <footer className="h-12 flex items-center justify-between px-6 md:px-12 border-t border-border-main/60 bg-bg-surface text-txt-muted text-[10px] font-mono tracking-wider transition-colors duration-150 flex-shrink-0">
        <div>
          © 2026 LYNDESK NETWORK INC.
        </div>
        <div className="flex gap-6 uppercase font-mono">
          <Link href="/privacy" className="hover:text-txt-main transition-colors">Privacy</Link>
          <Link href="/terms" className="hover:text-txt-main transition-colors">Terms</Link>
          <span className="text-txt-muted select-none">LDK:SYS</span>
        </div>
      </footer>

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
                  type="url"
                  required
                  placeholder="https://devpost.com/hackathon-name"
                  value={scraperUrl}
                  onChange={(e) => setScraperUrl(e.target.value)}
                  className="flex-1 h-10 px-3 border border-border-main/80 bg-bg-base text-txt-main rounded-sm text-sm placeholder:text-txt-muted/50 focus:outline-none focus:border-txt-main focus:ring-1 focus:ring-ring-main transition-colors font-light"
                />
                <button 
                  type="submit"
                  disabled={scraping}
                  className="h-10 px-4 rounded-sm bg-accent-main hover:opacity-90 disabled:opacity-50 text-bg-base text-xs font-mono uppercase tracking-wider transition-opacity cursor-pointer flex items-center justify-center"
                >
                  {scraping ? "Parsing..." : "Auto-Scrape"}
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

              {/* Direct Invite Friends Block */}
              <div className="flex flex-col gap-2.5">
                <span className="text-[10px] text-txt-sub font-semibold uppercase tracking-wider">Your Active Friends</span>
                
                <div className="max-h-56 overflow-y-auto border border-border-main/60 rounded bg-bg-base/30 divide-y divide-border-main/60">
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

    </div>
  );
}
