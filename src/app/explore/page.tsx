"use client";

import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";
import Link from "next/link";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import {
  Search,
  UserPlus,
  Check,
  Plus,
  MapPin,
  ExternalLink,
  Users,
  Trophy,
  UserCheck,
  Code,
  ChevronRight,
  GraduationCap,
  Copy,
  AlertTriangle,
  SlidersHorizontal,
} from "lucide-react";
import PreferencePresetModal from "../components/PreferencePresetModal";

// Types for Events & Contests
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
}

// Types for Friends & Network (exact match from legacy friends page)
interface FriendProfile {
  id: string;
  username: string;
  full_name: string;
  avatar_url?: string;
  academic_credits: number;
  department?: string;
  graduation_year?: string;
  college_name?: string;
  leetcode_username?: string;
  codeforces_username?: string;
  codechef_username?: string;
  unstop_username?: string;
  hack2skill_username?: string;
  github_url?: string;
  linkedin_url?: string;
  portfolio_url?: string;
}

interface Friendship {
  id: string;
  sender_id: string;
  receiver_id: string;
  status: "pending" | "accepted" | "rejected";
  sender_restricted?: boolean;
  receiver_restricted?: boolean;
  friend: FriendProfile;
}

const DEFAULT_EVENTS: OpportunityItem[] = [
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
  },
  {
    id: "opp_2",
    title: "Google Code Jam / Summer of Code 2026",
    category: "contest",
    deadline: "Nov 01, 2026",
    location: "online",
    level: "global",
    url: "https://summerofcode.withgoogle.com",
    description: "Global algorithmic contest and open-source mentorship program sponsored by Google Open Source.",
    facultyRecommended: true,
  },
  {
    id: "opp_3",
    title: "SIH (Smart India Hackathon) 2026 - Senior Edition",
    category: "hackathon",
    deadline: "Nov 20, 2026",
    location: "in_person",
    level: "national",
    url: "https://sih.gov.in",
    description: "Nationwide initiative to provide students a platform to solve pressing real-world problems.",
    facultyRecommended: true,
  },
  {
    id: "opp_4",
    title: "LeetCode Biweekly Contest 142",
    category: "contest",
    deadline: "This Saturday",
    location: "online",
    level: "global",
    url: "https://leetcode.com/contest",
    description: "90-minute competitive programming contest with 4 algorithmic problems.",
    facultyRecommended: false,
  },
];

export default function ExplorePage() {
  const { user, loading: authLoading } = useAuth();
  const { showToast } = useToast();

  // Two Main Sub-Tabs: "events" | "friends"
  const [activeTab, setActiveTab] = useState<"events" | "friends">("events");
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

  // Sync tab state from URL query parameter
  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const tab = urlParams.get("tab");
      queueMicrotask(() => {
        if (tab === "friends" || tab === "network" || tab === "classmates" || tab === "teammates") {
          setActiveTab("friends");
        } else if (tab === "events" || tab === "contests" || tab === "news" || tab === "hackathons") {
          setActiveTab("events");
        }
      });
    }
  }, []);

  // ── EVENTS & CONTESTS STATE ─────────────────────────────────────────────
  const [opportunities, setOpportunities] = useState<OpportunityItem[]>([]);
  const [eventSearchQuery, setEventSearchQuery] = useState("");
  const [eventCategoryFilter, setEventCategoryFilter] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("ldk_opportunities");
      queueMicrotask(() => {
        if (stored) {
          try {
            setOpportunities(JSON.parse(stored));
          } catch {
            setOpportunities(DEFAULT_EVENTS);
          }
        } else {
          setOpportunities(DEFAULT_EVENTS);
        }
      });
    }
  }, []);

  const filteredEvents = opportunities.filter((item) => {
    const matchesSearch =
      !eventSearchQuery.trim() ||
      item.title.toLowerCase().includes(eventSearchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(eventSearchQuery.toLowerCase());
    const matchesCat = !eventCategoryFilter || item.category === eventCategoryFilter;
    return matchesSearch && matchesCat;
  });

  // ── FRIENDS & NETWORK STATE (EXACT LEGACY FRIENDS SYSTEM) ────────────────
  const [friendsSubTab, setFriendsSubTab] = useState<"friends" | "requests">("friends");

  // Search States
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<FriendProfile[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchMessage, setSearchMessage] = useState<string | null>(null);

  // Lists
  const [friendsList, setFriendsList] = useState<Friendship[]>([]);
  const [requestsList, setRequestsList] = useState<Friendship[]>([]);
  const [outgoingRequestsList, setOutgoingRequestsList] = useState<Friendship[]>([]);
  const [loadingList, setLoadingList] = useState(true);

  // Selected friend details
  const [selectedFriend, setSelectedFriend] = useState<FriendProfile | null>(null);

  // Custom Alert
  const [customAlert, setCustomAlert] = useState<{
    isOpen: boolean;
    message: string;
    onConfirm?: () => void;
    showCancel?: boolean;
  }>({
    isOpen: false,
    message: "",
  });

  const showCustomAlert = (message: string, onConfirm?: () => void, showCancel: boolean = false) => {
    setCustomAlert({
      isOpen: true,
      message,
      onConfirm,
      showCancel,
    });
  };

  // Fetch Friends and Requests from Supabase with Realtime
  const triggerFetchList = useCallback(async () => {
    if (!user) return;
    setLoadingList(true);
    try {
      const { data, error } = await supabase
        .from("friendships")
        .select(`
          id,
          sender_id,
          receiver_id,
          status,
          sender_restricted,
          receiver_restricted,
          sender:sender_id ( id, username, full_name, avatar_url, academic_credits, department, graduation_year, leetcode_username, codeforces_username, codechef_username, unstop_username, hack2skill_username, github_url, linkedin_url, portfolio_url, college_name ),
          receiver:receiver_id ( id, username, full_name, avatar_url, academic_credits, department, graduation_year, leetcode_username, codeforces_username, codechef_username, unstop_username, hack2skill_username, github_url, linkedin_url, portfolio_url, college_name )
        `);

      if (!error && data && data.length > 0) {
        const friends: Friendship[] = [];
        const requests: Friendship[] = [];
        const outgoing: Friendship[] = [];

        data.forEach((item: any) => {
          const isSender = item.sender_id === user.id;
          const partner = isSender ? item.receiver : item.sender;

          const formattedFriend: FriendProfile = partner
            ? {
                id: partner.id,
                username: partner.username || "user",
                full_name: partner.full_name || "Teammate",
                avatar_url: partner.avatar_url,
                academic_credits: partner.academic_credits || 0,
                department: partner.department,
                graduation_year: partner.graduation_year,
                leetcode_username: partner.leetcode_username,
                codeforces_username: partner.codeforces_username,
                codechef_username: partner.codechef_username,
                unstop_username: partner.unstop_username,
                hack2skill_username: partner.hack2skill_username,
                github_url: partner.github_url,
                linkedin_url: partner.linkedin_url,
                portfolio_url: partner.portfolio_url,
                college_name: partner.college_name,
              }
            : {
                id: isSender ? item.receiver_id : item.sender_id,
                username: "anonymous_peer",
                full_name: "Anonymous Classmate",
                academic_credits: 0,
                department: "Engineering",
              };

          const friendshipObj: Friendship = {
            id: item.id,
            sender_id: item.sender_id,
            receiver_id: item.receiver_id,
            status: item.status,
            sender_restricted: !!item.sender_restricted,
            receiver_restricted: !!item.receiver_restricted,
            friend: formattedFriend,
          };

          if (item.status === "accepted") {
            friends.push(friendshipObj);
          } else if (item.status === "pending") {
            if (item.receiver_id === user.id) {
              requests.push(friendshipObj);
            } else {
              outgoing.push(friendshipObj);
            }
          }
        });

        setFriendsList(friends);
        setRequestsList(requests);
        setOutgoingRequestsList(outgoing);
      } else {
        setFriendsList([]);
        setRequestsList([]);
        setOutgoingRequestsList([]);
      }
    } catch (err) {
      console.error("Failed to fetch friendship list: ", err);
    } finally {
      setLoadingList(false);
    }
  }, [user]);

  // Realtime Supabase Subscription & Auto-Sync Metadata to Profiles Table
  useEffect(() => {
    if (!user) return;
    
    // Sync current user auth metadata to local public profile cache
    const meta = user.user_metadata || {};
    if (typeof window !== "undefined") {
      localStorage.setItem(
        `ldk_public_profile_${user.id}`,
        JSON.stringify({
          github_url: meta.github_url || "",
          linkedin_url: meta.linkedin_url || "",
          portfolio_url: meta.portfolio_url || "",
          leetcode_username: meta.leetcode_username || "",
          codeforces_username: meta.codeforces_username || "",
          codechef_username: meta.codechef_username || "",
          unstop_username: meta.unstop_username || "",
          hack2skill_username: meta.hack2skill_username || "",
          avatar_url: meta.avatar_url || "",
          full_name: meta.full_name || "",
          username: meta.username || "",
          college_name: meta.college_name || "",
          department: meta.department || "",
          graduation_year: meta.graduation_year || "",
        })
      );
    }
    queueMicrotask(() => {
      triggerFetchList();
    });

    const channel = supabase
      .channel(`public:friendships:${user.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "friendships" },
        () => {
          triggerFetchList();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, triggerFetchList]);

  // Search users based on exact UID or username
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearchLoading(true);
    setSearchMessage(null);
    setSearchResults([]);

    try {
      let query = supabase.from("profiles").select("*");

      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        searchQuery.trim()
      );
      if (isUUID) {
        query = query.eq("id", searchQuery.trim());
      } else {
        query = query.ilike("username", `%${searchQuery.trim()}%`);
      }

      const { data, error } = await query.limit(5);

      if (!error && data && data.length > 0) {
        const filtered = data
          .filter((p: any) => p.id !== user?.id)
          .map((p: any) => ({
            id: p.id,
            username: p.username || "user",
            full_name: p.full_name || "Teammate",
            avatar_url: p.avatar_url,
            academic_credits: p.academic_credits || 0,
            department: p.department,
            graduation_year: p.graduation_year,
            leetcode_username: p.leetcode_username,
            codeforces_username: p.codeforces_username,
            codechef_username: p.codechef_username,
            unstop_username: p.unstop_username,
            hack2skill_username: p.hack2skill_username,
            github_url: p.github_url,
            linkedin_url: p.linkedin_url,
            portfolio_url: p.portfolio_url,
            college_name: p.college_name,
          }));
        setSearchResults(filtered);
        if (filtered.length === 0) {
          setSearchMessage("No users found matching query.");
        }
      } else {
        setSearchMessage("No users found matching query.");
      }
    } catch (err) {
      console.error("Search failed: ", err);
      setSearchMessage("Error executing user directory query.");
    } fontFinally: {
      setSearchLoading(false);
    }
  };

  // Send a Friend Request
  const sendFriendRequest = async (receiverId: string) => {
    if (!user) return;

    const alreadyFriends = friendsList.some((f) => f.friend.id === receiverId);
    const alreadyRequested =
      requestsList.some((r) => r.friend.id === receiverId) ||
      outgoingRequestsList.some((r) => r.friend.id === receiverId);
    if (alreadyFriends || alreadyRequested) {
      showCustomAlert("You are already connected or request is pending.");
      return;
    }

    try {
      const { error } = await supabase.from("friendships").insert({
        sender_id: user.id,
        receiver_id: receiverId,
        status: "pending",
      });

      if (!error) {
        showCustomAlert("Friend request sent successfully!");
        setSearchQuery("");
        setSearchResults([]);
        triggerFetchList();
      } else {
        showCustomAlert("Could not send request: " + error.message);
      }
    } catch (e: any) {
      showCustomAlert("Friend request failed: " + e.message);
    }
  };

  // Respond to Friend Request (Accept or Reject)
  const handleRequestResponse = async (friendshipId: string, accept: boolean) => {
    if (!user) return;
    try {
      if (accept) {
        const { error } = await supabase
          .from("friendships")
          .update({ status: "accepted" })
          .eq("id", friendshipId);

        if (!error) {
          showCustomAlert("Friend request accepted!");
          triggerFetchList();
        }
      } else {
        const { error } = await supabase
          .from("friendships")
          .delete()
          .eq("id", friendshipId);

        if (!error) {
          showCustomAlert("Friend request rejected.");
          triggerFetchList();
        }
      }
    } catch (e: any) {
      console.error("Action failed:", e);
    }
  };

  // Toggle Restrict Friend Profile View
  const toggleRestrictFriend = async (friendshipId: string, isCurrentlyRestricted: boolean) => {
    if (!user) return;

    const friendship = friendsList.find((f) => f.id === friendshipId);
    if (!friendship) return;

    const isSender = friendship.sender_id === user.id;
    const updatePayload = isSender
      ? { sender_restricted: !isCurrentlyRestricted }
      : { receiver_restricted: !isCurrentlyRestricted };

    try {
      const { error } = await supabase
        .from("friendships")
        .update(updatePayload)
        .eq("id", friendshipId);

      if (!error) {
        showCustomAlert(
          !isCurrentlyRestricted
            ? "Profile view restricted for this friend."
            : "Profile view restriction lifted."
        );
        triggerFetchList();
      }
    } catch (e: any) {
      console.error(e);
    }
  };

  // Confirm Removal of Friend
  const handleRemoveFriendClick = () => {
    if (!selectedFriend) return;
    const friendship = friendsList.find((f) => f.friend.id === selectedFriend.id);
    if (!friendship) return;

    showCustomAlert(
      `Are you sure you want to remove ${selectedFriend.full_name} from your friends list?`,
      async () => {
        try {
          const { error } = await supabase
            .from("friendships")
            .delete()
            .eq("id", friendship.id);

          if (!error) {
            setSelectedFriend(null);
            triggerFetchList();
          }
        } catch (e: any) {
          console.error(e);
        }
      },
      true
    );
  };

  // Derived properties for selected friend
  const activeFriendship = selectedFriend
    ? friendsList.find((f) => f.friend.id === selectedFriend.id)
    : null;
  const isSender = activeFriendship ? activeFriendship.sender_id === user?.id : false;
  const isRestrictedByMe = activeFriendship
    ? isSender
      ? activeFriendship.sender_restricted
      : activeFriendship.receiver_restricted
    : false;
  const isRestrictedByThem = activeFriendship
    ? isSender
      ? activeFriendship.receiver_restricted
      : activeFriendship.sender_restricted
    : false;

  const handleRestrictClick = () => {
    if (!activeFriendship) return;
    toggleRestrictFriend(activeFriendship.id, !!isRestrictedByMe);
  };

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
    <div className="min-h-screen bg-bg-base text-txt-main flex flex-col font-sans selection:bg-accent-main selection:text-bg-base">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 md:px-12 pt-8 pb-2 flex flex-col gap-6">

        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-border-main/40 pb-5 gap-6">
          {/* Left Column: Title & Description */}
          <div className="flex flex-col gap-1 flex-1">
            <span className="font-mono text-[9px] uppercase tracking-widest text-txt-muted">
              Discovery &amp; Networking Hub
            </span>
            <h1 className="font-display text-3xl font-light tracking-tight text-txt-main">
              Explore Arena
            </h1>
            <p className="text-xs text-txt-sub font-light">
              Discover active hackathons, global contests, and connect with student developers across universities.
            </p>
          </div>

          {/* Right Column: Subtabs & Preference Preset Button */}
          <div className="flex flex-col items-start md:items-end justify-between gap-2.5 shrink-0">
            <div className="flex border border-border-main/80 rounded p-0.5 bg-bg-card/50 font-mono text-[10px] tracking-wider uppercase">
              <button
                onClick={() => setActiveTab("events")}
                className={`px-4 py-2 rounded-sm transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeTab === "events"
                    ? "bg-accent-main text-bg-base font-semibold shadow-xs"
                    : "text-txt-sub hover:text-txt-main"
                }`}
              >
                <Trophy size={13} />
                Events &amp; Contests
              </button>
              <button
                onClick={() => setActiveTab("friends")}
                className={`px-4 py-2 rounded-sm transition-colors cursor-pointer flex items-center gap-1.5 relative ${
                  activeTab === "friends"
                    ? "bg-accent-main text-bg-base font-semibold shadow-xs"
                    : "text-txt-sub hover:text-txt-main"
                }`}
              >
                <Users size={13} />
                Friends &amp; Network
                {requestsList.length > 0 && (
                  <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse ml-0.5" />
                )}
              </button>
            </div>

            <button
              type="button"
              onClick={() => setIsPresetModalOpen(true)}
              className="h-5 px-2 bg-bg-card/70 hover:bg-bg-card border border-border-main/70 text-txt-muted hover:text-txt-main text-[8.5px] font-mono tracking-wider uppercase rounded inline-flex items-center gap-1 transition-all cursor-pointer opacity-70 hover:opacity-100 shrink-0 font-medium"
              title="Customize location, category, and travel preference presets"
            >
              <SlidersHorizontal size={9} className="text-accent-main" />
              <span>Preference Preset</span>
              {hasActivePreset && <span className="w-1.5 h-1.5 rounded-full bg-accent-main animate-pulse ml-0.5" />}
            </button>
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────────────── */}
        {/* SUB-TAB 1: EVENTS & CONTESTS                                       */}
        {/* ─────────────────────────────────────────────────────────────────── */}
        {activeTab === "events" && (
          <div className="flex flex-col gap-6 pb-12">
            
            {/* Filter & Search Bar */}
            <div className="border border-border-main/70 bg-bg-surface p-4 rounded-md flex flex-col sm:flex-row gap-3 items-center justify-between">
              <div className="relative w-full sm:w-80">
                <Search size={14} className="absolute left-3 top-3 text-txt-muted" />
                <input
                  type="text"
                  value={eventSearchQuery}
                  onChange={(e) => setEventSearchQuery(e.target.value)}
                  placeholder="Search hackathons, contests, topics..."
                  className="w-full h-10 pl-9 pr-3 border border-border-main/80 bg-bg-base text-txt-main rounded text-xs placeholder:text-txt-muted/50 focus:outline-none focus:border-txt-main font-mono"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <select
                  value={eventCategoryFilter}
                  onChange={(e) => setEventCategoryFilter(e.target.value)}
                  className="h-10 px-3 border border-border-main/80 bg-bg-base text-txt-main rounded text-xs font-mono flex-1 sm:flex-none"
                >
                  <option value="">All Categories</option>
                  <option value="hackathon">Hackathons</option>
                  <option value="contest">Contests</option>
                  <option value="news">Announcements</option>
                </select>

                <span className="text-[10px] font-mono text-txt-muted uppercase px-2 py-1 bg-bg-card rounded border border-border-main/60 shrink-0">
                  {filteredEvents.length} Events Listed
                </span>
              </div>
            </div>

            {/* Events Feed */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filteredEvents.map((e) => (
                <div
                  key={e.id}
                  className="border border-border-main/70 bg-bg-surface p-6 rounded-md flex flex-col justify-between gap-4 hover:border-border-main transition-all duration-200"
                >
                  <div className="flex flex-col gap-3">
                    {/* Badge Strip */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[8px] font-mono tracking-widest uppercase px-2 py-0.5 rounded border ${
                            e.category === "hackathon"
                              ? "bg-purple-500/10 text-purple-400 border-purple-500/30"
                              : e.category === "contest"
                              ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                              : "bg-blue-500/10 text-blue-400 border-blue-500/30"
                          }`}
                        >
                          {e.category}
                        </span>
                        <span className="text-[8px] font-mono tracking-widest text-txt-muted uppercase border border-border-main/80 px-2 py-0.5 rounded bg-bg-card">
                          {e.level}
                        </span>
                      </div>

                      {e.facultyRecommended && (
                        <span className="text-[8px] font-mono uppercase text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded flex items-center gap-1 font-semibold">
                          <GraduationCap size={10} /> Faculty Pick
                        </span>
                      )}
                    </div>

                    {/* Title & Description */}
                    <div>
                      <h3 className="font-display text-base font-semibold text-txt-main leading-snug">
                        {e.title}
                      </h3>
                      <p className="text-xs text-txt-sub font-light leading-relaxed mt-1">
                        {e.description}
                      </p>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-2 gap-2 pt-2 text-[10px] font-mono">
                      <div className="bg-bg-base/40 p-2.5 border border-border-main/50 rounded flex flex-col gap-0.5">
                        <span className="text-txt-muted uppercase text-[8px]">Deadline</span>
                        <span className="text-txt-main font-semibold">{e.deadline}</span>
                      </div>
                      <div className="bg-bg-base/40 p-2.5 border border-border-main/50 rounded flex flex-col gap-0.5">
                        <span className="text-txt-muted uppercase text-[8px]">Location</span>
                        <span className="text-txt-main font-semibold flex items-center gap-1">
                          <MapPin size={9} /> {e.location}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex items-center justify-between border-t border-border-main/40 pt-4 mt-1">
                    <Link
                      href="/event-desk"
                      className="text-[10px] font-mono text-txt-muted hover:text-txt-main transition-colors flex items-center gap-1"
                    >
                      <Plus size={10} /> Create Team Workspace
                    </Link>

                    <a
                      href={e.url}
                      target="_blank"
                      rel="noreferrer"
                      className="h-8 px-4 bg-accent-main hover:opacity-90 text-bg-base font-mono text-[9px] tracking-wider uppercase font-semibold rounded transition-opacity flex items-center gap-1.5"
                    >
                      Register / View Event <ExternalLink size={10} />
                    </a>
                  </div>
                </div>
              ))}

              {filteredEvents.length === 0 && (
                <div className="col-span-full border border-dashed border-border-main/60 bg-bg-surface p-12 text-center rounded-md font-mono text-xs text-txt-muted flex flex-col items-center gap-2">
                  <Trophy size={20} className="text-txt-muted" />
                  <span>No events match your current filter.</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────────── */}
        {/* SUB-TAB 2: FRIENDS & NETWORK (FULL RESTORED FRIEND SYSTEM)         */}
        {/* ─────────────────────────────────────────────────────────────────── */}
        {activeTab === "friends" && (
          <div className="flex flex-col gap-6 pb-12">

            {/* Top Bar: Copy UID + Search form */}
            <div className="border border-border-main/70 bg-bg-surface p-5 rounded-md flex flex-col md:flex-row md:items-center justify-between gap-4">
              {/* My UID Copy Badge */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(user.id);
                    showToast("UID copied to clipboard!");
                  }}
                  className="font-mono text-[10px] uppercase text-txt-muted bg-bg-base border border-border-main/80 px-3 py-1.5 rounded hover:text-txt-main hover:border-border-main transition-colors flex items-center gap-1.5 cursor-pointer"
                  title="Click to copy your UID"
                >
                  <Copy size={11} className="text-accent-main" />
                  <span>My UID: {user.id ? `${user.id.slice(0, 8)}...${user.id.slice(-4)}` : ""}</span>
                </button>
              </div>

              {/* Search Form (by Username or exact UID) */}
              <form onSubmit={handleSearch} className="flex gap-2 items-center flex-1 max-w-md">
                <div className="relative flex-1">
                  <Search size={14} className="absolute left-3 top-3 text-txt-muted" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search classmates by username or full UID..."
                    className="w-full h-10 pl-9 pr-3 border border-border-main/80 bg-bg-base text-txt-main rounded text-xs placeholder:text-txt-muted/50 focus:outline-none focus:border-txt-main font-mono"
                  />
                </div>
                <button
                  type="submit"
                  disabled={searchLoading || !searchQuery.trim()}
                  className="h-10 px-4 bg-accent-main hover:opacity-90 text-bg-base font-mono text-[10px] uppercase font-bold tracking-wider rounded cursor-pointer disabled:opacity-40 transition-opacity shrink-0"
                >
                  {searchLoading ? "Searching..." : "Search"}
                </button>
              </form>
            </div>

            {/* Search Results Display Area */}
            {searchResults.length > 0 && (
              <div className="border border-border-main/70 bg-bg-surface p-5 rounded-md flex flex-col gap-3">
                <span className="font-mono text-[9px] uppercase tracking-widest text-accent-main font-bold">
                  Search Results ({searchResults.length})
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {searchResults.map((p) => {
                    const isAlreadyFriend = friendsList.some((f) => f.friend.id === p.id);
                    const isPending =
                      requestsList.some((r) => r.friend.id === p.id) ||
                      outgoingRequestsList.some((r) => r.friend.id === p.id);

                    return (
                      <div
                        key={p.id}
                        className="border border-border-main/50 bg-bg-base/40 p-4 rounded flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-bg-card border border-border-main flex items-center justify-center font-mono text-sm font-bold text-txt-main">
                            {p.full_name.charAt(0)}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs font-semibold text-txt-main">
                              {p.full_name}
                            </span>
                            <span className="text-[9px] text-txt-muted font-mono">
                              @{p.username} • UID: {p.id.substring(0, 8)}...
                            </span>
                            {p.department && (
                              <span className="text-[9px] text-txt-sub font-mono">{p.department}</span>
                            )}
                          </div>
                        </div>

                        <button
                          onClick={() => sendFriendRequest(p.id)}
                          disabled={isAlreadyFriend || isPending}
                          className="h-8 px-3.5 bg-accent-main hover:opacity-90 text-bg-base font-mono text-[9px] uppercase font-bold rounded cursor-pointer disabled:opacity-40 shrink-0 transition-opacity flex items-center gap-1"
                        >
                          {isAlreadyFriend ? (
                            <>
                              <Check size={10} /> Friends
                            </>
                          ) : isPending ? (
                            "Pending"
                          ) : (
                            <>
                              <UserPlus size={10} /> Send Request
                            </>
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {searchMessage && (
              <span className="text-[10px] font-mono text-amber-400/90 italic px-1">
                {searchMessage}
              </span>
            )}

            {/* Inner Friends Sub-Nav (My Friends vs Requests) */}
            <div className="flex items-center justify-between border-b border-border-main/40 pb-3 gap-2">
              <div className="flex items-center gap-2 font-mono text-[10px] uppercase">
                <button
                  onClick={() => setFriendsSubTab("friends")}
                  className={`px-4 py-1.5 rounded transition-colors cursor-pointer ${
                    friendsSubTab === "friends"
                      ? "bg-bg-card text-txt-main font-bold border border-border-main"
                      : "text-txt-sub hover:text-txt-main"
                  }`}
                >
                  My Friends ({friendsList.length})
                </button>
                <button
                  onClick={() => setFriendsSubTab("requests")}
                  className={`px-4 py-1.5 rounded transition-colors cursor-pointer flex items-center gap-1.5 ${
                    friendsSubTab === "requests"
                      ? "bg-bg-card text-txt-main font-bold border border-border-main"
                      : "text-txt-sub hover:text-txt-main"
                  }`}
                >
                  Requests
                  {requestsList.length > 0 && (
                    <span className="px-1.5 py-0.2 bg-amber-500/20 text-amber-400 rounded text-[9px] font-bold">
                      {requestsList.length}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* MAIN FRIENDS & REQUESTS CONTENT */}
            {friendsSubTab === "friends" ? (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Friends List (7 cols) */}
                <div className="lg:col-span-7 flex flex-col gap-3">
                  {friendsList.map((f) => (
                    <div
                      key={f.id}
                      onClick={() => setSelectedFriend(f.friend)}
                      className={`border p-4 rounded-md bg-bg-surface flex items-center justify-between cursor-pointer transition-all ${
                        selectedFriend?.id === f.friend.id
                          ? "border-accent-main ring-1 ring-accent-main/30"
                          : "border-border-main/60 hover:border-border-main"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-bg-card border border-border-main/60 flex items-center justify-center font-mono text-sm font-bold text-txt-main">
                          {f.friend.full_name.charAt(0)}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-semibold text-txt-main">
                            {f.friend.full_name}
                          </span>
                          <span className="text-[10px] font-mono text-txt-muted">
                            @{f.friend.username} {f.friend.department ? `· ${f.friend.department}` : ""}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {f.friend.academic_credits > 0 && (
                          <span className="text-[9px] font-mono text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded">
                            {f.friend.academic_credits} Credits
                          </span>
                        )}
                        <ChevronRight size={14} className="text-txt-muted" />
                      </div>
                    </div>
                  ))}

                  {friendsList.length === 0 && !loadingList && (
                    <div className="border border-dashed border-border-main/60 p-8 rounded-md text-center font-mono text-xs text-txt-muted flex flex-col items-center gap-2">
                      <Users size={18} />
                      <span>No friends connected yet. Use search above with classmate username or UID to connect.</span>
                    </div>
                  )}
                </div>

                {/* Selected Friend Detailed Overview Panel (5 cols) */}
                <div className="lg:col-span-5 border border-border-main/70 bg-bg-surface p-5 rounded-md flex flex-col gap-4">
                  {selectedFriend ? (
                    (() => {
                      // Multi-layer fail-safe resolution: selectedFriend -> Profile Draft -> Public Cache -> Auth Metadata
                      const isSelf = selectedFriend.id === user.id;
                      const meta = isSelf ? (user.user_metadata || {}) : {};
                      
                      let draft: any = {};
                      let publicCached: any = {};
                      
                      if (typeof window !== "undefined") {
                        try {
                          const draftRaw = localStorage.getItem(`ldk_profile_draft_${selectedFriend.id}`);
                          if (draftRaw) draft = JSON.parse(draftRaw);
                          const pubRaw = localStorage.getItem(`ldk_public_profile_${selectedFriend.id}`);
                          if (pubRaw) publicCached = JSON.parse(pubRaw);
                        } catch {}
                      }

                      const avatar =
                        selectedFriend.avatar_url ||
                        draft.avatarUrl ||
                        draft.avatar_url ||
                        publicCached.avatar_url ||
                        meta.avatar_url ||
                        "";

                      const leetcode =
                        selectedFriend.leetcode_username ||
                        draft.leetcodeUsername ||
                        draft.leetcode_username ||
                        publicCached.leetcode_username ||
                        meta.leetcode_username ||
                        "";

                      const codeforces =
                        selectedFriend.codeforces_username ||
                        draft.codeforcesUsername ||
                        draft.codeforces_username ||
                        publicCached.codeforces_username ||
                        meta.codeforces_username ||
                        "";

                      const codechef =
                        selectedFriend.codechef_username ||
                        draft.codechefUsername ||
                        draft.codechef_username ||
                        publicCached.codechef_username ||
                        meta.codechef_username ||
                        "";

                      const unstop =
                        selectedFriend.unstop_username ||
                        draft.unstopUsername ||
                        draft.unstop_username ||
                        publicCached.unstop_username ||
                        meta.unstop_username ||
                        "";

                      const hack2skill =
                        selectedFriend.hack2skill_username ||
                        draft.hack2skillUsername ||
                        draft.hack2skill_username ||
                        publicCached.hack2skill_username ||
                        meta.hack2skill_username ||
                        "";

                      const github =
                        selectedFriend.github_url ||
                        draft.githubUrl ||
                        draft.github_url ||
                        publicCached.github_url ||
                        meta.github_url ||
                        "";

                      const linkedin =
                        selectedFriend.linkedin_url ||
                        draft.linkedinUrl ||
                        draft.linkedin_url ||
                        publicCached.linkedin_url ||
                        meta.linkedin_url ||
                        "";

                      const portfolio =
                        selectedFriend.portfolio_url ||
                        draft.portfolioUrl ||
                        draft.portfolio_url ||
                        publicCached.portfolio_url ||
                        meta.portfolio_url ||
                        "";

                      return (
                        <>
                          <div className="flex items-center gap-3 border-b border-border-main/40 pb-4">
                            <div className="w-12 h-12 rounded-full bg-bg-card border border-border-main overflow-hidden flex items-center justify-center font-mono text-base font-bold text-txt-main shrink-0">
                              {avatar ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={avatar} alt={selectedFriend.full_name} className="w-full h-full object-cover" />
                              ) : (
                                selectedFriend.full_name.charAt(0).toUpperCase()
                              )}
                            </div>
                            <div className="flex flex-col min-w-0">
                              <h4 className="text-sm font-semibold text-txt-main truncate">
                                {selectedFriend.full_name}
                              </h4>
                              <span className="text-[10px] font-mono text-txt-muted truncate">
                                @{selectedFriend.username}
                              </span>
                              {selectedFriend.college_name && (
                                <span className="text-[9px] font-mono text-txt-sub truncate">
                                  {selectedFriend.college_name}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Restricted Profile Notice */}
                          {isRestrictedByThem ? (
                            <div className="p-4 border border-amber-500/30 bg-amber-500/[0.04] rounded text-center flex flex-col items-center gap-1 text-amber-400 font-mono text-[10px]">
                              <AlertTriangle size={16} />
                              <span>This friend has restricted full profile stats view.</span>
                            </div>
                          ) : (
                            <>
                              {/* Academic Credits */}
                              <div className="bg-bg-base/40 p-3 border border-border-main/50 rounded flex items-center justify-between text-xs font-mono">
                                <span className="text-txt-sub">Academic Credits</span>
                                <span className="text-amber-400 font-bold">
                                  {selectedFriend.academic_credits} pts
                                </span>
                              </div>

                              {/* Competitive Handles */}
                              <div className="flex flex-col gap-2 pt-2 border-t border-border-main/30">
                                <span className="font-mono text-[9px] uppercase tracking-widest text-txt-muted font-bold">
                                  Competitive Handles
                                </span>
                                {leetcode || codeforces || codechef || unstop || hack2skill ? (
                                  <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                                    {leetcode && (
                                      <div className="bg-bg-base/40 p-2 border border-border-main/50 rounded flex flex-col">
                                        <span className="text-[8px] text-txt-muted uppercase">LeetCode</span>
                                        <span className="text-txt-main font-semibold truncate">
                                          @{leetcode}
                                        </span>
                                      </div>
                                    )}
                                    {codeforces && (
                                      <div className="bg-bg-base/40 p-2 border border-border-main/50 rounded flex flex-col">
                                        <span className="text-[8px] text-txt-muted uppercase">Codeforces</span>
                                        <span className="text-txt-main font-semibold truncate">
                                          @{codeforces}
                                        </span>
                                      </div>
                                    )}
                                    {codechef && (
                                      <div className="bg-bg-base/40 p-2 border border-border-main/50 rounded flex flex-col">
                                        <span className="text-[8px] text-txt-muted uppercase">CodeChef</span>
                                        <span className="text-txt-main font-semibold truncate">
                                          @{codechef}
                                        </span>
                                      </div>
                                    )}
                                    {unstop && (
                                      <div className="bg-bg-base/40 p-2 border border-border-main/50 rounded flex flex-col">
                                        <span className="text-[8px] text-txt-muted uppercase">Unstop</span>
                                        <span className="text-txt-main font-semibold truncate">
                                          @{unstop}
                                        </span>
                                      </div>
                                    )}
                                    {hack2skill && (
                                      <div className="bg-bg-base/40 p-2 border border-border-main/50 rounded flex flex-col">
                                        <span className="text-[8px] text-txt-muted uppercase">Hack2Skill</span>
                                        <span className="text-txt-main font-semibold truncate">
                                          @{hack2skill}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-[10px] font-mono text-txt-muted italic">No handles connected</span>
                                )}
                              </div>

                              {/* Codebases & Links */}
                              <div className="flex flex-col gap-2 pt-2 border-t border-border-main/30 text-xs font-mono">
                                <span className="font-mono text-[9px] uppercase tracking-widest text-txt-muted font-bold">
                                  Verified Repos &amp; Links
                                </span>
                                <div className="flex flex-col gap-1.5">
                                  {github ? (
                                    <a
                                      href={github}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="text-txt-main hover:underline truncate flex items-center justify-between text-[10px]"
                                    >
                                      <span>GitHub Profile</span> <ExternalLink size={9} />
                                    </a>
                                  ) : (
                                    <span className="text-[10px] text-txt-muted italic">GitHub: Not linked</span>
                                  )}

                                  {linkedin ? (
                                    <a
                                      href={linkedin}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="text-txt-main hover:underline truncate flex items-center justify-between text-[10px]"
                                    >
                                      <span>LinkedIn Profile</span> <ExternalLink size={9} />
                                    </a>
                                  ) : (
                                    <span className="text-[10px] text-txt-muted italic">LinkedIn: Not linked</span>
                                  )}

                                  {portfolio ? (
                                    <a
                                      href={portfolio}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="text-txt-main hover:underline truncate flex items-center justify-between text-[10px]"
                                    >
                                      <span>Portfolio Website</span> <ExternalLink size={9} />
                                    </a>
                                  ) : (
                                    <span className="text-[10px] text-txt-muted italic">Portfolio: Not linked</span>
                                  )}
                                </div>
                              </div>
                            </>
                          )}

                          {/* Action Toggles for Restriction / Removal */}
                          {activeFriendship && (
                            <div className="flex justify-between items-center mt-2 pt-4 border-t border-border-main/20 text-[9px] font-mono uppercase">
                              <button
                                onClick={handleRestrictClick}
                                className="text-txt-muted hover:text-red-400 opacity-65 hover:opacity-100 transition-all cursor-pointer select-none"
                              >
                                {isRestrictedByMe ? "Lift profile restriction" : "Restrict profile view"}
                              </button>
                              <button
                                onClick={handleRemoveFriendClick}
                                className="text-txt-muted hover:text-red-500 opacity-65 hover:opacity-100 transition-all cursor-pointer select-none font-semibold"
                              >
                                Remove Friend
                              </button>
                            </div>
                          )}
                        </>
                      );
                    })()
                  ) : (
                    <div className="py-12 text-center text-xs font-mono text-txt-muted flex flex-col items-center gap-2">
                      <Code size={16} />
                      <span>Select a friend from the left list to view their handles, credits, and codebases.</span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* REQUESTS TAB */
              <div className="flex flex-col gap-5 max-w-2xl">
                <div className="border border-border-main/70 bg-bg-surface p-5 rounded-md flex flex-col gap-4">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-txt-muted font-bold">
                    Incoming Friend Requests ({requestsList.length})
                  </span>

                  {requestsList.map((r) => (
                    <div
                      key={r.id}
                      className="border border-border-main/50 bg-bg-base/40 p-4 rounded flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-bg-card border border-border-main flex items-center justify-center font-mono text-xs font-bold text-txt-main">
                          {r.friend.full_name.charAt(0)}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-semibold text-txt-main">
                            {r.friend.full_name}
                          </span>
                          <span className="text-[10px] font-mono text-txt-muted">
                            @{r.friend.username} {r.friend.department ? `· ${r.friend.department}` : ""}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleRequestResponse(r.id, true)}
                          className="h-7 px-3 bg-accent-main hover:opacity-90 text-bg-base font-mono text-[9px] uppercase font-bold rounded cursor-pointer transition-opacity flex items-center gap-1"
                        >
                          <UserCheck size={11} /> Accept
                        </button>
                        <button
                          onClick={() => handleRequestResponse(r.id, false)}
                          className="h-7 px-3 border border-border-main hover:bg-bg-card text-txt-sub font-mono text-[9px] uppercase rounded cursor-pointer transition-colors"
                        >
                          Decline
                        </button>
                      </div>
                    </div>
                  ))}

                  {requestsList.length === 0 && (
                    <span className="text-xs font-mono text-txt-muted italic py-2">
                      No incoming requests pending.
                    </span>
                  )}
                </div>

                {outgoingRequestsList.length > 0 && (
                  <div className="border border-border-main/70 bg-bg-surface p-5 rounded-md flex flex-col gap-3">
                    <span className="font-mono text-[10px] uppercase tracking-widest text-txt-muted font-bold">
                      Sent Requests Pending ({outgoingRequestsList.length})
                    </span>

                    {outgoingRequestsList.map((o) => (
                      <div
                        key={o.id}
                        className="border border-border-main/50 bg-bg-base/40 p-3.5 rounded flex items-center justify-between text-xs font-mono"
                      >
                        <span className="text-txt-main">@{o.friend.username}</span>
                        <button
                          onClick={() => handleRequestResponse(o.id, false)}
                          className="text-[9px] uppercase text-txt-muted hover:text-red-400 transition-colors"
                        >
                          Cancel Request
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>
        )}

      </main>

      {/* Custom Alert Modal */}
      {customAlert.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-bg-surface border border-border-main max-w-sm w-full mx-4 p-6 rounded-md shadow-2xl flex flex-col gap-4 font-mono">
            <div className="flex flex-col gap-1">
              <span className="text-[9px] uppercase tracking-widest text-txt-muted font-bold">
                System Notification
              </span>
              <p className="text-xs text-txt-main font-light leading-relaxed mt-2 whitespace-pre-line">
                {customAlert.message}
              </p>
            </div>
            <div className="flex justify-end gap-2 mt-2 text-[9px] uppercase">
              {customAlert.showCancel && (
                <button
                  onClick={() => setCustomAlert((prev) => ({ ...prev, isOpen: false }))}
                  className="px-4 h-8 border border-border-main hover:bg-bg-card text-txt-main rounded cursor-pointer"
                >
                  Cancel
                </button>
              )}
              <button
                onClick={() => {
                  setCustomAlert((prev) => ({ ...prev, isOpen: false }));
                  if (customAlert.onConfirm) {
                    customAlert.onConfirm();
                  }
                }}
                className="px-4 h-8 bg-accent-main hover:opacity-90 text-bg-base rounded font-bold cursor-pointer"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
      <PreferencePresetModal 
        isOpen={isPresetModalOpen} 
        onClose={() => setIsPresetModalOpen(false)} 
      />
    </div>
  );
}
