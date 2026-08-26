"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  Star,
  Eye,
  Trash2,
  RefreshCw,
  X,
  ChevronDown,
  Upload,
  FileText,
  BookOpen,
  Music,
  Gamepad2,
  Palette,
  Film,
  Smartphone,
  Mic,
  Scroll,
  Globe,
  Package,
  FolderKanban,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
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
  codechef_username?: string;
  hackerrank_username?: string;
  codeforces_username?: string;
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

interface WorkItem {
  id: string;
  institute_id: string;
  student_id: string;
  title: string;
  category: string;
  description: string | null;
  is_published: boolean;
  external_url: string | null;
  file_path: string | null;
  is_alias: boolean;
  status: 'pending' | 'ai_verified' | 'staff_review' | 'approved' | 'rejected';
  rejection_reason: string | null;
  views: number;
  average_rating: number;
  rating_count: number;
  tags: string[] | null;
  how_to_use: string | null;
  embed_url: string | null;
  expires_at: string;
  renewed_at: string | null;
  created_at: string;
  student_name?: string;
  student_department?: string;
  student_year?: string;
}

const DEFAULT_EVENTS: OpportunityItem[] = [
  {
    id: "opp_1",
    title: "Unstop National Innovation Hackathons 2026",
    category: "hackathon",
    deadline: "Open / Rolling",
    location: "hybrid",
    level: "national",
    url: "https://unstop.com/hackathons",
    description: "Active national software engineering and product innovation hackathons with company PPI tracks.",
    facultyRecommended: true,
  },
  {
    id: "opp_2",
    title: "Google Summer of Code 2026",
    category: "contest",
    deadline: "Oct 15, 2026",
    location: "online",
    level: "global",
    url: "https://summerofcode.withgoogle.com",
    description: "Global open-source software development mentorship program sponsored by Google Open Source.",
    facultyRecommended: true,
  },
  {
    id: "opp_3",
    title: "Smart India Hackathon 2026 (SIH)",
    category: "hackathon",
    deadline: "Nov 20, 2026",
    location: "in_person",
    level: "national",
    url: "https://sih.gov.in",
    description: "Nationwide government initiative providing students a platform to solve pressing real-world challenges.",
    facultyRecommended: true,
  },
  {
    id: "opp_4",
    title: "Devpost Global AI & Agents Hackathon",
    category: "hackathon",
    deadline: "Nov 05, 2026",
    location: "online",
    level: "global",
    url: "https://devpost.com/hackathons",
    description: "Build autonomous multi-agent systems and full-stack AI applications with global developer teams.",
    facultyRecommended: true,
  },
  {
    id: "opp_5",
    title: "LeetCode Weekly Contest",
    category: "contest",
    deadline: "Every Sunday 08:00 AM",
    location: "online",
    level: "global",
    url: "https://leetcode.com/contest",
    description: "Global competitive programming contest. Solve 4 algorithmic problems in 90 minutes.",
    facultyRecommended: false,
  },
];

export default function ExplorePage() {
  const { user, loading: authLoading } = useAuth();
  const { showToast } = useToast();

  // Two Main Sub-Tabs: "events" | "friends"
  const [activeTab, setActiveTab] = useState<"events" | "friends" | "works">("events");
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
        } else if (tab === "works" || tab === "creations" || tab === "portfolio") {
          setActiveTab("works");
        }
      });
    }
  }, []);

  // ── EVENTS & CONTESTS STATE ─────────────────────────────────────────────
  const [opportunities, setOpportunities] = useState<OpportunityItem[]>([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [eventSearchQuery, setEventSearchQuery] = useState("");
  const [eventCategoryFilter, setEventCategoryFilter] = useState("");

  const loadLiveEvents = useCallback(async () => {
    setEventsLoading(true);
    try {
      let locationFilter = "all";
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem("ldk_preference_preset");
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            if (parsed.locationMode && parsed.locationMode !== "all") {
              locationFilter = parsed.locationMode;
            }
          } catch {}
        }
      }

      /* await searchParams */
      const urlFilterParams = new URLSearchParams();
      if (eventCategoryFilter) urlFilterParams.set("category", eventCategoryFilter);
      if (eventSearchQuery.trim()) urlFilterParams.set("q", eventSearchQuery.trim());
      if (locationFilter !== "all") urlFilterParams.set("location", locationFilter);

      const res = await fetch(`/api/events?${urlFilterParams.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.events) && data.events.length > 0) {
          setOpportunities(data.events);
          return;
        }
      }
      // Fallback if network issue
      if (opportunities.length === 0) setOpportunities(DEFAULT_EVENTS);
    } catch {
      if (opportunities.length === 0) setOpportunities(DEFAULT_EVENTS);
    } finally {
      setEventsLoading(false);
    }
  }, [eventCategoryFilter, eventSearchQuery, opportunities.length]);

  const [trackingId, setTrackingId] = useState<string | null>(null);
  const [trackedTitles, setTrackedTitles] = useState<Set<string>>(new Set());

  const loadTrackedApplications = useCallback(async () => {
    if (!user) return;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const res = await fetch("/api/user/applied-hackathons", {
        headers: { Authorization: `Bearer ${session.access_token}` }
      });
      if (res.ok) {
        const data = await res.json();
        const titles = new Set<string>((data.applications || []).map((a: any) => a.title.toLowerCase().trim()));
        setTrackedTitles(titles);
      }
    } catch {}
  }, [user]);

  const handleTrackOpportunity = async (item: OpportunityItem) => {
    if (!user) {
      showToast("Please log in to track hackathons", "error");
      return;
    }
    setTrackingId(item.id);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const portalName = item.url.includes("unstop.com")
        ? "Unstop"
        : item.url.includes("devpost.com")
        ? "Devpost"
        : item.url.includes("sih.gov.in")
        ? "Hack2Skill"
        : "Other";

      const res = await fetch("/api/user/applied-hackathons", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          title: item.title,
          portal: portalName,
          portal_url: item.url,
          role: "Team Captain",
          status: "Applied",
          stage: "Round 1",
          create_workspace: false
        })
      });

      if (res.ok) {
        setTrackedTitles(prev => new Set([...prev, item.title.toLowerCase().trim()]));
        showToast(`✓ Tracked '${item.title}' in Applied Hackathons!`, "success");
      } else {
        showToast("Application logged or already tracked", "info");
      }
    } catch {
      showToast("Failed to track application", "error");
    } finally {
      setTrackingId(null);
    }
  };

  useEffect(() => {
    if (activeTab === "events") {
      loadLiveEvents();
      loadTrackedApplications();
    }
  }, [activeTab, loadLiveEvents, loadTrackedApplications]);

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

  // ── WORKS HUB STATE ────────────────────────────────────────────────────
  const [worksLoading, setWorksLoading] = useState(false);
  const [works, setWorks] = useState<WorkItem[]>([]);
  const [myWorks, setMyWorks] = useState<WorkItem[]>([]);
  const [worksTotal, setWorksTotal] = useState(0);
  const [worksPage, setWorksPage] = useState(1);
  const [worksSearch, setWorksSearch] = useState('');
  const [worksCategoryFilter, setWorksCategoryFilter] = useState('');
  const [worksDeptFilter, setWorksDeptFilter] = useState('');
  const [worksYearFilter, setWorksYearFilter] = useState('');
  const [worksSort, setWorksSort] = useState('trending');
  const [selectedWork, setSelectedWork] = useState<WorkItem | null>(null);
  const [showWorkDetail, setShowWorkDetail] = useState(false);
  const [showMyWorks, setShowMyWorks] = useState(false);
  const [showAddWork, setShowAddWork] = useState(false);
  const [collegeLinked, setCollegeLinked] = useState(false);
  const [worksError, setWorksError] = useState('');
  // Add Work form state
  const [addWorkStep, setAddWorkStep] = useState<1|2|3>(1);
  const [newWorkCategory, setNewWorkCategory] = useState('');
  const [newWorkIsPublished, setNewWorkIsPublished] = useState(true);
  const [newWorkTitle, setNewWorkTitle] = useState('');
  const [newWorkDescription, setNewWorkDescription] = useState('');
  const [newWorkUrl, setNewWorkUrl] = useState('');
  const [newWorkIsAlias, setNewWorkIsAlias] = useState(false);
  const [newWorkTags, setNewWorkTags] = useState('');
  const [newWorkHowToUse, setNewWorkHowToUse] = useState('');
  const [newWorkFile, setNewWorkFile] = useState<File | null>(null);
  const [addWorkLoading, setAddWorkLoading] = useState(false);
  const [userRatings, setUserRatings] = useState<Record<string, number>>({});
  const [ratingLoading, setRatingLoading] = useState('');
  const [showHowToUse, setShowHowToUse] = useState(false);

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
          sender:sender_id ( id, username, full_name, avatar_url, academic_credits, department, graduation_year, leetcode_username, codechef_username, hackerrank_username, codeforces_username, unstop_username, hack2skill_username, github_url, linkedin_url, portfolio_url, college_name ),
          receiver:receiver_id ( id, username, full_name, avatar_url, academic_credits, department, graduation_year, leetcode_username, codechef_username, hackerrank_username, codeforces_username, unstop_username, hack2skill_username, github_url, linkedin_url, portfolio_url, college_name )
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
                codechef_username: partner.codechef_username,
                hackerrank_username: partner.hackerrank_username,
                codeforces_username: partner.codeforces_username,
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
          codechef_username: meta.codechef_username || "",
          hackerrank_username: meta.hackerrank_username || "",
          codeforces_username: meta.codeforces_username || "",
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
            codechef_username: p.codechef_username,
            hackerrank_username: p.hackerrank_username,
            codeforces_username: p.codeforces_username,
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

  // ── WORKS HUB CONFIG ────────────────────────────────────────────────────
  const WORK_CATEGORIES = [
    { id: 'book', label: 'Book', Icon: BookOpen },
    { id: 'music', label: 'Music', Icon: Music },
    { id: 'web_game', label: 'Web Game', Icon: Gamepad2 },
    { id: 'software', label: 'Software', Icon: Code },
    { id: 'art', label: 'Art & Design', Icon: Palette },
    { id: 'film', label: 'Film & Media', Icon: Film },
    { id: 'mobile_app', label: 'Mobile App', Icon: Smartphone },
    { id: 'podcast', label: 'Podcast & Audio', Icon: Mic },
    { id: 'research', label: 'Research & Paper', Icon: Scroll },
    { id: 'website', label: 'Website & Tool', Icon: Globe },
    { id: 'physical_product', label: 'Product & Hardware', Icon: Package },
  ];

  const getCategoryIconComponent = (catId: string) => {
    const found = WORK_CATEGORIES.find(c => c.id === catId);
    return found ? found.Icon : FolderKanban;
  };

  const UNPUBLISHED_ALLOWED = ['book', 'music', 'art', 'research', 'physical_product'];

  const getDaysUntilExpiry = (expiresAt: string): number => {
    return Math.ceil((new Date(expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  };

  // ── WORKS HUB FUNCTIONS ──────────────────────────────────────────────
  const loadWorks = async (page = 1) => {
    if (!user) return;
    setWorksLoading(true);
    setWorksError('');
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const workQueryParams = new URLSearchParams({ page: String(page), sort: worksSort });
      if (worksSearch) workQueryParams.set('search', worksSearch);
      if (worksCategoryFilter) workQueryParams.set('category', worksCategoryFilter);
      if (worksDeptFilter) workQueryParams.set('department', worksDeptFilter);
      if (worksYearFilter) workQueryParams.set('academic_year', worksYearFilter);
      const res = await fetch(`/api/works?${workQueryParams}`, {
        headers: { Authorization: `Bearer ${session.access_token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setWorks(data.works || []);
        setWorksTotal(data.total || 0);
        setWorksPage(page);
      } else if (res.status === 403) {
        setCollegeLinked(false);
        setWorksError('college_not_linked');
      }
    } catch {
      setWorksError('Failed to load works.');
    } finally {
      setWorksLoading(false);
    }
  };

  const loadMyWorks = async () => {
    if (!user) return;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const res = await fetch('/api/works/my', {
        headers: { Authorization: `Bearer ${session.access_token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setMyWorks(data.works || []);
      }
    } catch { /* silent */ }
  };

  const handleRateWork = async (workId: string, rating: number) => {
    if (!user) return;
    setRatingLoading(workId);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      await fetch(`/api/works/${workId}/rate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ rating })
      });
      setUserRatings(prev => ({ ...prev, [workId]: rating }));
    } catch { /* silent */ } finally {
      setRatingLoading('');
    }
  };

  const handleDeleteWork = async (workId: string) => {
    if (!user) return;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      await fetch(`/api/works/${workId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${session.access_token}` }
      });
      await loadMyWorks();
      showToast('Work deleted successfully.');
    } catch { showToast('Failed to delete work.', 'error'); }
  };

  const handleRenewWork = async (workId: string) => {
    if (!user) return;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const res = await fetch(`/api/works/${workId}/renew`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${session.access_token}` }
      });
      if (res.ok) {
        await loadMyWorks();
        showToast('Work renewed for 90 more days!');
      }
    } catch { showToast('Failed to renew work.', 'error'); }
  };

  const handleSubmitWork = async () => {
    if (!user || !newWorkTitle || !newWorkCategory) return;
    setAddWorkLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      let filePath: string | undefined;
      if (!newWorkIsPublished && newWorkFile) {
        const fd = new FormData();
        fd.append('file', newWorkFile);
        fd.append('bucket', 'student-works');
        fd.append('category', newWorkCategory);
        const upRes = await fetch('/api/works/upload', {
          method: 'POST',
          headers: { Authorization: `Bearer ${session.access_token}` },
          body: fd
        });
        if (upRes.ok) {
          const upData = await upRes.json();
          filePath = upData.file_path;
        } else {
          showToast('File upload failed. Please try again.', 'error');
          setAddWorkLoading(false);
          return;
        }
      }
      const res = await fetch('/api/works', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({
          title: newWorkTitle,
          category: newWorkCategory,
          description: newWorkDescription,
          is_published: newWorkIsPublished,
          external_url: newWorkIsPublished ? newWorkUrl : undefined,
          is_alias: newWorkIsAlias,
          tags: newWorkTags ? newWorkTags.split(',').map(t => t.trim()).filter(Boolean) : [],
          how_to_use: newWorkHowToUse,
          file_path: filePath
        })
      });
      if (res.ok) {
        showToast('Work submitted! It will appear once verified.');
        setShowAddWork(false);
        setAddWorkStep(1);
        setNewWorkCategory(''); setNewWorkTitle(''); setNewWorkDescription('');
        setNewWorkUrl(''); setNewWorkTags(''); setNewWorkHowToUse('');
        setNewWorkFile(null); setNewWorkIsAlias(false); setNewWorkIsPublished(true);
        await loadMyWorks();
        await loadWorks();
      } else {
        const err = await res.json();
        showToast(err.error || 'Failed to submit work.', 'error');
      }
    } catch { showToast('Failed to submit work.', 'error'); }
    finally { setAddWorkLoading(false); }
  };

  // Load works when tab is activated
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (activeTab === 'works' && user) {
      loadWorks(1);
      loadMyWorks();
    }
  }, [activeTab, user]);

  // Re-fetch when filters/sort change
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (activeTab === 'works' && user) {
      loadWorks(1);
    }
  }, [worksSearch, worksCategoryFilter, worksDeptFilter, worksYearFilter, worksSort]);

  if (authLoading) {
    return (
      <div className="h-screen bg-bg-base flex flex-col items-center justify-center font-mono text-xs text-txt-muted gap-2">
        <div className="w-4 h-4 border-2 border-accent-main border-t-transparent rounded-full animate-spin" />
        <span>Syncing session...</span>
      </div>
    );
  }


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

          {/* Right Column: Subtabs */}
          <div className="flex items-center shrink-0">
            <div className="flex border border-border-main/80 rounded-sm p-0.5 bg-bg-card/50 font-mono text-[10px] tracking-wider uppercase">
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
              <button
                onClick={() => setActiveTab("works")}
                className={`px-4 py-2 rounded-sm transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeTab === "works"
                    ? "bg-accent-main text-bg-base font-semibold shadow-xs"
                    : "text-txt-sub hover:text-txt-main"
                }`}
              >
                <Palette size={13} />
                Works Hub
              </button>
            </div>
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
                  className="w-full h-10 pl-9 pr-3 border border-border-main/80 bg-bg-base text-txt-main rounded-sm text-xs placeholder:text-txt-muted/50 focus:outline-none focus:border-txt-main font-mono"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
                <button
                  type="button"
                  onClick={() => setIsPresetModalOpen(true)}
                  className="h-10 px-3 bg-bg-base hover:bg-bg-card border border-border-main/80 text-txt-sub hover:text-txt-main text-xs font-mono rounded-sm inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Customize location, category, and travel preference presets"
                >
                  <SlidersHorizontal size={12} className="text-accent-main" />
                  <span>Presets</span>
                  {hasActivePreset && <span className="w-1.5 h-1.5 rounded-full bg-accent-main animate-pulse ml-0.5" />}
                </button>

                <select
                  value={eventCategoryFilter}
                  onChange={(e) => setEventCategoryFilter(e.target.value)}
                  className="h-10 px-3 border border-border-main/80 bg-bg-base text-txt-main rounded-sm text-xs font-mono flex-1 sm:flex-none"
                >
                  <option value="">All Categories</option>
                  <option value="hackathon">Hackathons</option>
                  <option value="contest">Contests</option>
                  <option value="news">Announcements</option>
                </select>

                <span className="text-[10px] font-mono text-txt-muted uppercase px-2.5 py-2.5 bg-bg-card rounded-sm border border-border-main/60 shrink-0">
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
                  <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border-main/40 pt-4 mt-1">
                    <div className="flex items-center gap-3">
                      <Link
                        href="/event-desk"
                        className="text-[10px] font-mono text-txt-muted hover:text-txt-main transition-colors flex items-center gap-1"
                      >
                        <Plus size={10} /> Team Space
                      </Link>
                      {trackedTitles.has(e.title.toLowerCase().trim()) ? (
                        <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1 font-semibold">
                          <CheckCircle2 size={11} className="text-emerald-400" /> Tracked / Registered
                        </span>
                      ) : (
                        <button
                          onClick={() => handleTrackOpportunity(e)}
                          disabled={trackingId === e.id}
                          className="text-[10px] font-mono text-accent-main hover:opacity-80 transition-opacity flex items-center gap-1 cursor-pointer"
                        >
                          <CheckCircle2 size={10} />
                          {trackingId === e.id ? "Tracking..." : "Track Application"}
                        </button>
                      )}
                    </div>

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
          !user ? (
            <div className="border border-border-main/70 bg-bg-surface p-12 rounded-md text-center flex flex-col items-center justify-center gap-3 pb-12 mb-12">
              <Users size={32} className="text-accent-main opacity-80" />
              <h3 className="font-display text-lg font-light text-txt-main">Connect with Student Developers</h3>
              <p className="text-xs text-txt-muted max-w-md">
                Sign in to add friends, share institutional roll numbers, and collaborate across campus projects.
              </p>
              <Link
                href="/?auth=login"
                className="px-4 py-2 bg-accent-main hover:opacity-90 text-bg-base font-mono text-xs font-bold uppercase rounded-sm cursor-pointer mt-2"
              >
                Sign In to Continue
              </Link>
            </div>
          ) : (
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

                      const codechef =
                        selectedFriend.codechef_username ||
                        draft.codechefUsername ||
                        draft.codechef_username ||
                        publicCached.codechef_username ||
                        meta.codechef_username ||
                        "";

                      const hackerrank =
                        selectedFriend.hackerrank_username ||
                        draft.hackerrankUsername ||
                        draft.hackerrank_username ||
                        publicCached.hackerrank_username ||
                        meta.hackerrank_username ||
                        "";

                      const codeforces =
                        selectedFriend.codeforces_username ||
                        draft.codeforcesUsername ||
                        draft.codeforces_username ||
                        publicCached.codeforces_username ||
                        meta.codeforces_username ||
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
                                {leetcode || codechef || hackerrank || codeforces || unstop || hack2skill ? (
                                  <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                                    {leetcode && (
                                      <div className="bg-bg-base/40 p-2 border border-border-main/50 rounded flex flex-col">
                                        <span className="text-[8px] text-txt-muted uppercase">LeetCode</span>
                                        <span className="text-txt-main font-semibold truncate">
                                          @{leetcode}
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
                                    {hackerrank && (
                                      <div className="bg-bg-base/40 p-2 border border-[#00EA64]/30 rounded flex flex-col bg-[#00EA64]/5">
                                        <span className="text-[8px] text-[#00EA64] uppercase font-bold">HackerRank</span>
                                        <span className="text-txt-main font-semibold truncate">
                                          @{hackerrank}
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
          )
        )}

        {/* ─────────────────────────────────────────────────────────────────── */}
        {/* SUB-TAB 3: WORKS HUB                                               */}
        {/* ─────────────────────────────────────────────────────────────────── */}
        {activeTab === "works" && (
          <div className="flex flex-col gap-6 pb-12">
            {worksError === "college_not_linked" ? (
              /* ── A. College gate ── */
              <div className="border border-border-main/60 bg-bg-surface rounded-md p-10 flex flex-col items-center gap-4 text-center">
                <div className="w-12 h-12 rounded-sm bg-accent-main/10 border border-accent-main/20 flex items-center justify-center text-accent-main">
                  <GraduationCap size={24} />
                </div>
                <h3 className="font-display text-base font-light text-txt-main">Institutional Network Required</h3>
                <p className="text-xs text-txt-sub max-w-sm font-light leading-relaxed">
                  The Works Hub is exclusive to students verified with their college institution. Link your institutional credentials in your profile to access this arena.
                </p>
                <a href="/profile" className="mt-1 px-4 py-2 bg-accent-main text-bg-base rounded-sm text-xs font-mono uppercase tracking-wider font-semibold hover:opacity-90 transition-opacity">
                  Connect College in Profile →
                </a>
              </div>
            ) : (
              <>
                {/* ── B. Top Control Bar ── */}
                <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between border border-border-main/70 bg-bg-surface p-4 rounded-md">
                  <div className="flex flex-col sm:flex-row gap-2 flex-1 flex-wrap">
                    {/* Search */}
                    <div className="relative min-w-[200px] flex-1 max-w-xs">
                      <Search size={13} className="absolute left-3 top-[11px] text-txt-muted" />
                      <input
                        type="text"
                        value={worksSearch}
                        onChange={e => setWorksSearch(e.target.value)}
                        placeholder="Search works, authors..."
                        className="w-full h-9 pl-8 pr-3 border border-border-main/80 bg-bg-base text-txt-main rounded-sm text-xs placeholder:text-txt-muted/50 focus:outline-none focus:border-txt-main font-mono"
                      />
                    </div>
                    {/* Category filter */}
                    <select
                      value={worksCategoryFilter}
                      onChange={e => setWorksCategoryFilter(e.target.value)}
                      className="h-9 px-3 border border-border-main/80 bg-bg-base text-txt-main rounded-sm text-xs font-mono"
                    >
                      <option value="">All Categories</option>
                      {WORK_CATEGORIES.map(c => (
                        <option key={c.id} value={c.id}>{c.label}</option>
                      ))}
                    </select>
                    {/* Dept filter */}
                    <input
                      type="text"
                      value={worksDeptFilter}
                      onChange={e => setWorksDeptFilter(e.target.value)}
                      placeholder="Department..."
                      className="h-9 px-3 border border-border-main/80 bg-bg-base text-txt-main rounded-sm text-xs font-mono w-36"
                    />
                    {/* Year filter */}
                    <input
                      type="text"
                      value={worksYearFilter}
                      onChange={e => setWorksYearFilter(e.target.value)}
                      placeholder="Year (e.g. 2024)..."
                      className="h-9 px-3 border border-border-main/80 bg-bg-base text-txt-main rounded-sm text-xs font-mono w-36"
                    />
                    {/* Sort */}
                    <select
                      value={worksSort}
                      onChange={e => setWorksSort(e.target.value)}
                      className="h-9 px-3 border border-border-main/80 bg-bg-base text-txt-main rounded-sm text-xs font-mono"
                    >
                      <option value="trending">Trending</option>
                      <option value="newest">Newest</option>
                      <option value="top_rated">Top Rated</option>
                      <option value="most_viewed">Most Viewed</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {/* My Works button */}
                    <button
                      onClick={() => { setShowMyWorks(true); loadMyWorks(); }}
                      className="h-9 px-3.5 border border-border-main hover:bg-bg-card text-txt-sub hover:text-txt-main font-mono text-[10px] uppercase tracking-wider rounded-sm cursor-pointer transition-colors flex items-center gap-1.5"
                    >
                      <FileText size={12} />
                      My Works
                      {myWorks.length > 0 && (
                        <span className="ml-0.5 px-1.5 py-0.5 bg-accent-main/10 text-accent-main text-[9px] font-bold rounded-sm">
                          {myWorks.length}/5
                        </span>
                      )}
                    </button>
                    {/* Add Work */}
                    <button
                      onClick={() => { setAddWorkStep(1); setShowAddWork(true); }}
                      className="h-9 px-3.5 bg-accent-main hover:opacity-90 text-bg-base font-mono text-[10px] uppercase tracking-wider font-bold rounded-sm cursor-pointer transition-opacity flex items-center gap-1.5"
                    >
                      <Plus size={12} />
                      Add Work
                    </button>
                  </div>
                </div>

                {/* ── B. Works Grid ── */}
                {worksLoading ? (
                  /* Loading skeletons */
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="border border-border-main/40 bg-bg-surface rounded-md p-5 flex flex-col gap-3 animate-pulse">
                        <div className="flex gap-2">
                          <div className="w-16 h-4 bg-bg-card rounded-sm" />
                          <div className="w-10 h-4 bg-bg-card rounded-sm" />
                        </div>
                        <div className="h-5 bg-bg-card rounded-sm w-3/4" />
                        <div className="h-3 bg-bg-card rounded-sm w-1/2" />
                        <div className="h-8 bg-bg-card rounded-sm w-full" />
                        <div className="flex gap-3 mt-auto pt-2">
                          <div className="h-3 bg-bg-card rounded-sm w-10" />
                          <div className="h-3 bg-bg-card rounded-sm w-10" />
                          <div className="h-3 bg-bg-card rounded-sm w-10" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : works.length === 0 ? (
                  /* Empty state */
                  <div className="border border-dashed border-border-main/60 bg-bg-surface p-12 rounded-md flex flex-col items-center gap-3 text-center">
                    <Palette size={32} className="text-txt-muted/30" />
                    <h4 className="font-display text-base font-light text-txt-main">No works found</h4>
                    <p className="text-xs text-txt-muted max-w-xs font-light">
                      {worksSearch || worksCategoryFilter ? "Try adjusting your search criteria or category filter." : "Be the first creator in your college to publish a work."}
                    </p>
                    <button
                      onClick={() => { setAddWorkStep(1); setShowAddWork(true); }}
                      className="mt-2 px-4 py-2 bg-accent-main text-bg-base text-xs font-mono uppercase tracking-wider rounded-sm font-semibold hover:opacity-90 transition-opacity cursor-pointer"
                    >
                      + Submit Your Work
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {works.map((w, idx) => {
                      const CatIcon = getCategoryIconComponent(w.category);
                      const catLabel = WORK_CATEGORIES.find(c => c.id === w.category)?.label ?? w.category;
                      const days = getDaysUntilExpiry(w.expires_at);
                      return (
                        <motion.div
                          key={w.id}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.03, duration: 0.2 }}
                          className="border border-border-main/60 bg-bg-surface hover:border-border-main hover:bg-bg-card rounded-md p-4 flex flex-col gap-2.5 cursor-pointer transition-colors duration-150 group"
                          onClick={() => { setSelectedWork(w); setShowWorkDetail(true); setShowHowToUse(false); }}
                        >
                          {/* Category + status badge */}
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-mono text-[9px] uppercase tracking-widest px-2 py-0.5 rounded-sm border border-border-main/60 bg-bg-base/60 text-txt-muted flex items-center gap-1.5">
                              <CatIcon size={11} className="text-accent-main" />
                              {catLabel}
                            </span>
                            <span className="flex items-center gap-1 font-mono text-[9px] text-emerald-400">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                              Live
                            </span>
                          </div>

                          {/* Title */}
                          <h3 className="font-display text-sm font-medium text-txt-main leading-snug line-clamp-2 group-hover:text-txt-main transition-colors">
                            {w.title}
                          </h3>

                          {/* Author line */}
                          <p className="text-[10px] font-mono text-txt-muted truncate">
                            By {w.student_name ?? 'A student'}
                            {w.student_department ? ` · ${w.student_department}` : ''}
                            {w.student_year ? ` · ${w.student_year}` : ''}
                          </p>

                          {/* Description */}
                          {w.description && (
                            <p className="text-xs text-txt-sub font-light leading-relaxed line-clamp-2">
                              {w.description}
                            </p>
                          )}

                          {/* Stats footer */}
                          <div className="flex items-center justify-between mt-auto pt-3 border-t border-border-main/30">
                            <div className="flex items-center gap-3 text-[10px] font-mono text-txt-muted">
                              <span className="flex items-center gap-0.5">
                                <Star size={10} className="fill-amber-400 text-amber-400" />
                                {w.average_rating > 0 ? w.average_rating.toFixed(1) : '—'}
                              </span>
                              <span className="flex items-center gap-0.5">
                                <Eye size={10} />
                                {w.views}
                              </span>
                              <span className="flex items-center gap-0.5 text-txt-muted/70">
                                {days > 0 ? `${days}d left` : 'Expired'}
                              </span>
                            </div>
                            <span className="text-[9px] font-mono text-accent-main opacity-0 group-hover:opacity-100 transition-opacity">
                              View →
                            </span>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}

                {/* ── Pagination ── */}
                {worksTotal > 20 && !worksLoading && (
                  <div className="flex items-center justify-center gap-3 pt-2">
                    <button
                      disabled={worksPage <= 1}
                      onClick={() => loadWorks(worksPage - 1)}
                      className="h-8 px-4 border border-border-main hover:bg-bg-card text-txt-sub font-mono text-[10px] uppercase rounded-sm disabled:opacity-30 cursor-pointer transition-colors"
                    >
                      ← Previous
                    </button>
                    <span className="font-mono text-[10px] text-txt-muted">
                      Page {worksPage} · {worksTotal} total
                    </span>
                    <button
                      disabled={worksPage * 20 >= worksTotal}
                      onClick={() => loadWorks(worksPage + 1)}
                      className="h-8 px-4 border border-border-main hover:bg-bg-card text-txt-sub font-mono text-[10px] uppercase rounded-sm disabled:opacity-30 cursor-pointer transition-colors"
                    >
                      Next →
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ── C. My Works Slide-out Panel ── */}
        <AnimatePresence>
          {showMyWorks && (
            <>
              {/* Backdrop */}
              <motion.div
                key="my-works-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs"
                onClick={() => setShowMyWorks(false)}
              />
              {/* Drawer */}
              <motion.div
                key="my-works-panel"
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                className="fixed top-0 right-0 h-full w-full max-w-sm z-50 bg-bg-surface border-l border-border-main flex flex-col shadow-2xl"
              >
                {/* Panel header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-border-main/50 shrink-0">
                  <div>
                    <span className="font-mono text-[9px] uppercase tracking-widest text-txt-muted">Portfolio</span>
                    <h3 className="font-display text-base font-light text-txt-main mt-0.5">My Works</h3>
                  </div>
                  <button onClick={() => setShowMyWorks(false)} className="text-txt-muted hover:text-txt-main transition-colors cursor-pointer">
                    <X size={18} />
                  </button>
                </div>

                {/* Work list */}
                <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3">
                  {myWorks.length === 0 && (
                    <div className="py-12 text-center flex flex-col items-center gap-2 text-txt-muted">
                      <Palette size={28} className="text-txt-muted/30" />
                      <p className="text-xs font-mono">No works submitted yet.</p>
                    </div>
                  )}
                  {myWorks.map(w => {
                    const CatIcon = getCategoryIconComponent(w.category);
                    const catLabel = WORK_CATEGORIES.find(c => c.id === w.category)?.label ?? w.category;
                    const days = getDaysUntilExpiry(w.expires_at);
                    const canRenew = days <= 7 && w.status === 'approved' && !w.renewed_at;
                    const statusConfig = {
                      pending: { label: 'Pending AI', Icon: Clock, cls: 'text-amber-400 bg-amber-500/10 border-amber-500/30' },
                      ai_verified: { label: 'AI Verified', Icon: Sparkles, cls: 'text-accent-main bg-accent-main/10 border-accent-main/30' },
                      staff_review: { label: 'Staff Review', Icon: Clock, cls: 'text-accent-main bg-accent-main/10 border-accent-main/30' },
                      approved: { label: 'Live', Icon: CheckCircle2, cls: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' },
                      rejected: { label: 'Declined', Icon: AlertCircle, cls: 'text-red-400 bg-red-500/10 border-red-500/30' },
                    }[w.status] ?? { label: w.status, Icon: FolderKanban, cls: 'text-txt-muted border-border-main' };
                    const StatusIcon = statusConfig.Icon;

                    return (
                      <div key={w.id} className="border border-border-main/60 bg-bg-base/40 rounded-md p-3.5 flex flex-col gap-2.5">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex flex-col gap-1 min-w-0">
                            <span className="font-mono text-[9px] text-txt-muted uppercase flex items-center gap-1">
                              <CatIcon size={10} className="text-accent-main" />
                              {catLabel}
                            </span>
                            <span className="text-xs font-medium text-txt-main truncate">{w.title}</span>
                          </div>
                          <span className={`text-[8.5px] font-mono uppercase px-2 py-0.5 rounded-sm border shrink-0 flex items-center gap-1 ${statusConfig.cls}`}>
                            <StatusIcon size={9} />
                            {statusConfig.label}
                          </span>
                        </div>

                        {w.status === 'rejected' && w.rejection_reason && (
                          <p className="text-[10px] text-red-400/80 font-mono italic border-l-2 border-red-500/40 pl-2">
                            {w.rejection_reason}
                          </p>
                        )}

                        <div className="flex items-center justify-between gap-2 text-[9px] font-mono text-txt-muted">
                          <span>{days > 0 ? `${days}d until expiry` : 'Expired'}</span>
                          <div className="flex items-center gap-2">
                            {canRenew && (
                              <button
                                onClick={() => handleRenewWork(w.id)}
                                className="flex items-center gap-0.5 text-accent-main hover:opacity-80 transition-opacity cursor-pointer"
                              >
                                <RefreshCw size={10} /> Renew
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteWork(w.id)}
                              className="flex items-center gap-0.5 text-red-400/70 hover:text-red-400 transition-colors cursor-pointer"
                            >
                              <Trash2 size={10} /> Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Panel footer */}
                <div className="px-5 py-4 border-t border-border-main/50 shrink-0">
                  {myWorks.length < 5 && (
                    <button
                      onClick={() => { setShowMyWorks(false); setAddWorkStep(1); setShowAddWork(true); }}
                      className="w-full h-9 bg-accent-main hover:opacity-90 text-bg-base font-mono text-[10px] uppercase tracking-wider font-bold rounded-sm cursor-pointer transition-opacity flex items-center justify-center gap-1.5"
                    >
                      <Plus size={12} /> Add New Work
                    </button>
                  )}
                  {myWorks.length >= 5 && (
                    <p className="text-[10px] text-txt-muted font-mono text-center">
                      Portfolio limit reached (5/5). Delete a work to add another.
                    </p>
                  )}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* ── D. Work Detail Modal ── */}
        <AnimatePresence>
          {showWorkDetail && selectedWork && (
            <>
              <motion.div
                key="work-detail-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs"
                onClick={() => setShowWorkDetail(false)}
              />
              <motion.div
                key="work-detail-modal"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 30 }}
                transition={{ type: 'spring', damping: 30, stiffness: 320 }}
                className="fixed inset-x-0 bottom-0 md:inset-0 md:m-auto z-50 md:max-w-2xl md:h-fit md:rounded-md w-full bg-bg-surface border border-border-main/70 flex flex-col shadow-2xl overflow-hidden max-h-[90vh] md:max-h-[85vh]"
              >
                {/* Modal header */}
                <div className="flex items-start justify-between p-5 border-b border-border-main/40 shrink-0">
                  <div className="flex flex-col gap-1 min-w-0 pr-4">
                    {(() => {
                      const CatIcon = getCategoryIconComponent(selectedWork.category);
                      const catLabel = WORK_CATEGORIES.find(c => c.id === selectedWork.category)?.label ?? selectedWork.category;
                      return (
                        <span className="font-mono text-[9px] uppercase tracking-widest text-txt-muted flex items-center gap-1.5">
                          <CatIcon size={11} className="text-accent-main" />
                          {catLabel}
                        </span>
                      );
                    })()}
                    <h2 className="font-display text-xl font-light text-txt-main leading-snug">{selectedWork.title}</h2>
                    <p className="text-[10px] font-mono text-txt-muted">
                      By {selectedWork.student_name ?? 'A student'}
                      {selectedWork.student_department ? ` · ${selectedWork.student_department}` : ''}
                      {selectedWork.student_year ? ` · ${selectedWork.student_year}` : ''}
                    </p>
                  </div>
                  <button onClick={() => setShowWorkDetail(false)} className="text-txt-muted hover:text-txt-main transition-colors cursor-pointer shrink-0 mt-0.5">
                    <X size={18} />
                  </button>
                </div>

                {/* Modal body — scrollable */}
                <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-5">
                  {/* Tags + expiry */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="flex items-center gap-1.5 text-[9px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-sm uppercase">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" /> Verified
                    </span>
                    {selectedWork.tags?.map(tag => (
                      <span key={tag} className="text-[9px] font-mono text-txt-muted border border-border-main/60 bg-bg-base/60 px-2 py-0.5 rounded-sm">
                        #{tag}
                      </span>
                    ))}
                    <span className="ml-auto text-[9px] font-mono text-txt-muted">
                      {getDaysUntilExpiry(selectedWork.expires_at)}d until expiry
                    </span>
                  </div>

                  {/* ── Content area by category ── */}
                  {(() => {
                    const cat = selectedWork.category;
                    const url = selectedWork.external_url;
                    const file = selectedWork.file_path;

                    if ((cat === 'web_game' || cat === 'website') && url) {
                      return (
                        <div className="flex flex-col gap-2">
                          <iframe
                            src={url}
                            className="w-full h-80 rounded-sm border border-border-main/40 bg-bg-base"
                            sandbox="allow-scripts allow-same-origin allow-forms"
                            onError={() => {}}
                          />
                          <p className="text-[10px] font-mono text-txt-muted text-center">
                            Can&apos;t see the content?{' '}
                            <a href={url} target="_blank" rel="noreferrer" className="text-accent-main hover:underline">
                              Open in new tab →
                            </a>
                          </p>
                        </div>
                      );
                    }
                    if (cat === 'music' && (file || url)) {
                      return (
                        // eslint-disable-next-line jsx-a11y/media-has-caption
                        <audio controls src={file ?? url ?? ''} className="w-full mt-2" />
                      );
                    }
                    if ((cat === 'book' || cat === 'research') && file) {
                      return (
                        <iframe src={file} className="w-full h-[480px] rounded-sm border border-border-main/40 bg-bg-base" />
                      );
                    }
                    if ((cat === 'book' || cat === 'research') && url) {
                      return (
                        <a href={url} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-xs font-mono text-accent-main hover:underline border border-border-main/60 rounded-sm px-4 py-3 bg-bg-base/60 w-fit">
                          <ExternalLink size={13} /> Open on Platform →
                        </a>
                      );
                    }
                    if ((cat === 'art' || cat === 'physical_product') && file) {
                      return (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={file} alt={selectedWork.title} className="w-full max-h-96 object-contain rounded-sm border border-border-main/40" />
                      );
                    }
                    if (url) {
                      return (
                        <a href={url} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-xs font-mono text-accent-main hover:underline border border-border-main/60 rounded-sm px-4 py-3 bg-bg-base/60 w-fit">
                          <ExternalLink size={13} /> Open on Platform →
                        </a>
                      );
                    }
                    return (
                      <p className="text-xs text-txt-muted font-mono italic">No viewable content available.</p>
                    );
                  })()}

                  {/* Description */}
                  {selectedWork.description && (
                    <div className="flex flex-col gap-1.5">
                      <span className="font-mono text-[9px] uppercase tracking-widest text-txt-muted font-bold">About this work</span>
                      <p className="text-sm text-txt-sub font-light leading-relaxed">{selectedWork.description}</p>
                    </div>
                  )}

                  {/* How to use — collapsible */}
                  {selectedWork.how_to_use && (
                    <div className="border border-border-main/50 rounded-md overflow-hidden">
                      <button
                        onClick={() => setShowHowToUse(v => !v)}
                        className="w-full flex items-center justify-between px-4 py-3 text-xs font-mono text-txt-sub hover:text-txt-main transition-colors bg-bg-base/40 cursor-pointer"
                      >
                        <span className="uppercase tracking-wider text-[9px] font-bold">How to use</span>
                        <ChevronDown size={13} className={`transition-transform ${showHowToUse ? 'rotate-180' : ''}`} />
                      </button>
                      {showHowToUse && (
                        <div className="px-4 pb-4 pt-2 text-sm text-txt-sub font-light leading-relaxed border-t border-border-main/30">
                          {selectedWork.how_to_use}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Star rating widget */}
                  <div className="flex flex-col gap-2 pt-1 border-t border-border-main/30">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[9px] uppercase tracking-widest text-txt-muted font-bold">
                        Rate this work
                      </span>
                      <div className="flex items-center gap-1 text-[10px] font-mono text-txt-muted">
                        <Eye size={11} /> {selectedWork.views} views
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {[1, 2, 3, 4, 5].map(star => {
                        const isOwn = selectedWork.student_id === user?.id;
                        const myRating = userRatings[selectedWork.id] ?? 0;
                        return (
                          <button
                            key={star}
                            disabled={isOwn || ratingLoading === selectedWork.id}
                            onClick={() => handleRateWork(selectedWork.id, star)}
                            className={`cursor-pointer disabled:cursor-default transition-transform hover:scale-110 ${isOwn ? 'opacity-30' : ''}`}
                            title={isOwn ? "Can't rate your own work" : `Rate ${star}`}
                          >
                            <Star
                              size={18}
                              className={star <= myRating ? 'fill-amber-400 text-amber-400' : 'text-txt-muted/40'}
                            />
                          </button>
                        );
                      })}
                      {selectedWork.rating_count > 0 && (
                        <span className="text-[10px] font-mono text-txt-muted ml-1">
                          {selectedWork.average_rating.toFixed(1)} ({selectedWork.rating_count})
                        </span>
                      )}
                    </div>
                    {selectedWork.student_id === user?.id && (
                      <p className="text-[9px] font-mono text-txt-muted italic">You cannot rate your own work.</p>
                    )}
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* ── E. Add Work Wizard Modal ── */}
        <AnimatePresence>
          {showAddWork && (
            <>
              <motion.div
                key="add-work-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs"
                onClick={() => setShowAddWork(false)}
              />
              <motion.div
                key="add-work-modal"
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                className="fixed inset-0 m-auto z-50 w-full max-w-lg h-fit max-h-[90vh] bg-bg-surface border border-border-main/70 rounded-md flex flex-col shadow-2xl overflow-hidden"
              >
                {/* Wizard header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-border-main/40 shrink-0">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-mono text-[9px] uppercase tracking-widest text-txt-muted">
                      Step {addWorkStep} of 3
                    </span>
                    <h3 className="font-display text-base font-light text-txt-main">
                      {addWorkStep === 1 ? 'Choose a Category' : addWorkStep === 2 ? 'Visibility & Platform' : 'Work Details'}
                    </h3>
                  </div>
                  <button onClick={() => setShowAddWork(false)} className="text-txt-muted hover:text-txt-main transition-colors cursor-pointer">
                    <X size={18} />
                  </button>
                </div>

                {/* Progress bar */}
                <div className="h-0.5 bg-bg-card shrink-0">
                  <div
                    className="h-full bg-accent-main transition-all duration-300"
                    style={{ width: `${(addWorkStep / 3) * 100}%` }}
                  />
                </div>

                {/* Step content */}
                <div className="flex-1 overflow-y-auto p-6">
                  {/* Step 1: Pick category */}
                  {addWorkStep === 1 && (
                    <div className="flex flex-col gap-4">
                      <p className="text-xs text-txt-sub font-light">Select the medium that best describes your creative piece.</p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                        {WORK_CATEGORIES.map(c => {
                          const IconComp = c.Icon;
                          const isSelected = newWorkCategory === c.id;
                          return (
                            <button
                              key={c.id}
                              onClick={() => setNewWorkCategory(c.id)}
                              className={`flex items-center gap-2.5 p-3 rounded-sm border transition-colors cursor-pointer text-left ${
                                isSelected
                                  ? 'border-accent-main bg-accent-main/10 text-txt-main shadow-xs'
                                  : 'border-border-main/60 hover:border-border-main bg-bg-base/50 text-txt-sub hover:text-txt-main'
                              }`}
                            >
                              <IconComp size={16} className={isSelected ? 'text-accent-main' : 'text-txt-muted'} />
                              <span className="font-mono text-[9.5px] uppercase tracking-wider leading-tight">{c.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Step 2: Published vs Unpublished */}
                  {addWorkStep === 2 && (
                    <div className="flex flex-col gap-4">
                      <p className="text-xs text-txt-sub font-light">
                        A published work links to an external host (e.g. GitHub, Spotify, Itch.io).
                        {UNPUBLISHED_ALLOWED.includes(newWorkCategory) && ' You can also upload a private attachment for faculty review.'}
                      </p>
                      <div className="flex flex-col gap-3">
                        <button
                          onClick={() => setNewWorkIsPublished(true)}
                          className={`p-4 rounded-sm border text-left transition-colors cursor-pointer ${
                            newWorkIsPublished ? 'border-accent-main bg-accent-main/10' : 'border-border-main/60 hover:border-border-main bg-bg-base/50'
                          }`}
                        >
                          <div className="font-mono text-xs font-semibold text-txt-main mb-1 flex items-center gap-1.5">
                            <ExternalLink size={13} className="text-accent-main" />
                            Published (External Link)
                          </div>
                          <div className="text-[10px] text-txt-sub font-light">Link to an existing public platform. Automated AI verification active.</div>
                        </button>
                        {UNPUBLISHED_ALLOWED.includes(newWorkCategory) && (
                          <button
                            onClick={() => setNewWorkIsPublished(false)}
                            className={`p-4 rounded-sm border text-left transition-colors cursor-pointer ${
                              !newWorkIsPublished ? 'border-accent-main bg-accent-main/10' : 'border-border-main/60 hover:border-border-main bg-bg-base/50'
                            }`}
                          >
                            <div className="font-mono text-xs font-semibold text-txt-main mb-1 flex items-center gap-1.5">
                              <UploadCloud size={13} className="text-accent-main" />
                              Unpublished (File Attachment)
                            </div>
                            <div className="text-[10px] text-txt-sub font-light">Upload document or media file. Routed to faculty coordinator review.</div>
                          </button>
                        )}
                      </div>
                      <div className={`text-[9.5px] font-mono px-3 py-2 rounded-sm border flex items-center gap-1.5 ${
                        newWorkIsPublished && !newWorkIsAlias
                          ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
                          : 'text-amber-400 bg-amber-500/10 border-amber-500/30'
                      }`}>
                        {newWorkIsPublished && !newWorkIsAlias ? (
                          <>
                            <CheckCircle2 size={12} />
                            Automated AI Verification Active
                          </>
                        ) : (
                          <>
                            <AlertCircle size={12} />
                            Submission Requires Faculty Review
                          </>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Step 3: Details form */}
                  {addWorkStep === 3 && (
                    <div className="flex flex-col gap-4">
                      {/* Title */}
                      <div className="flex flex-col gap-1.5">
                        <label className="font-mono text-[9px] uppercase tracking-widest text-txt-muted font-bold">Title *</label>
                        <input
                          type="text"
                          value={newWorkTitle}
                          onChange={e => setNewWorkTitle(e.target.value)}
                          placeholder="e.g. Echoes in the Dark"
                          className="h-9 px-3 border border-border-main/80 bg-bg-base text-txt-main rounded-sm text-xs font-mono placeholder:text-txt-muted/40 focus:outline-none focus:border-txt-main"
                        />
                      </div>

                      {/* Description */}
                      <div className="flex flex-col gap-1.5">
                        <label className="font-mono text-[9px] uppercase tracking-widest text-txt-muted font-bold">Description</label>
                        <textarea
                          value={newWorkDescription}
                          onChange={e => setNewWorkDescription(e.target.value)}
                          rows={3}
                          placeholder="Briefly describe the inspiration, technology, or overview..."
                          className="px-3 py-2 border border-border-main/80 bg-bg-base text-txt-main rounded-sm text-xs font-light placeholder:text-txt-muted/40 focus:outline-none focus:border-txt-main resize-none"
                        />
                      </div>

                      {/* URL or File upload */}
                      {newWorkIsPublished ? (
                        <div className="flex flex-col gap-1.5">
                          <label className="font-mono text-[9px] uppercase tracking-widest text-txt-muted font-bold">External URL</label>
                          <input
                            type="url"
                            value={newWorkUrl}
                            onChange={e => setNewWorkUrl(e.target.value)}
                            placeholder="https://github.com/you/project"
                            className="h-9 px-3 border border-border-main/80 bg-bg-base text-txt-main rounded-sm text-xs font-mono placeholder:text-txt-muted/40 focus:outline-none focus:border-txt-main"
                          />
                        </div>
                      ) : (
                        <div className="flex flex-col gap-1.5">
                          <label className="font-mono text-[9px] uppercase tracking-widest text-txt-muted font-bold">Upload File</label>
                          <label className="h-9 flex items-center gap-2 px-3 border border-dashed border-border-main/60 bg-bg-base/60 rounded-sm text-xs font-mono text-txt-muted cursor-pointer hover:border-border-main transition-colors">
                            <Upload size={12} />
                            {newWorkFile ? newWorkFile.name : 'Click to select file...'}
                            <input
                              type="file"
                              className="sr-only"
                              onChange={e => setNewWorkFile(e.target.files?.[0] ?? null)}
                            />
                          </label>
                        </div>
                      )}

                      {/* Alias toggle */}
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setNewWorkIsAlias(v => !v)}
                          className={`w-8 h-4.5 rounded-full transition-colors shrink-0 relative cursor-pointer ${newWorkIsAlias ? 'bg-accent-main' : 'bg-bg-card border border-border-main'}`}
                        >
                          <span className={`absolute top-0.5 w-3.5 h-3.5 bg-bg-base rounded-full transition-all shadow ${newWorkIsAlias ? 'left-[calc(100%-14px-2px)]' : 'left-0.5'}`} />
                        </button>
                        <div className="flex flex-col">
                          <span className="text-xs text-txt-main">Published under an alias or stage name</span>
                          <span className="text-[9px] text-txt-muted font-mono">Requires faculty review to verify institutional student ownership.</span>
                        </div>
                      </div>

                      {/* Tags */}
                      <div className="flex flex-col gap-1.5">
                        <label className="font-mono text-[9px] uppercase tracking-widest text-txt-muted font-bold">Tags (comma-separated)</label>
                        <input
                          type="text"
                          value={newWorkTags}
                          onChange={e => setNewWorkTags(e.target.value)}
                          placeholder="e.g. indie, lo-fi, ambient"
                          className="h-9 px-3 border border-border-main/80 bg-bg-base text-txt-main rounded-sm text-xs font-mono placeholder:text-txt-muted/40 focus:outline-none focus:border-txt-main"
                        />
                      </div>

                      {/* How to use */}
                      <div className="flex flex-col gap-1.5">
                        <label className="font-mono text-[9px] uppercase tracking-widest text-txt-muted font-bold">Instructions &amp; How to Use (optional)</label>
                        <textarea
                          value={newWorkHowToUse}
                          onChange={e => setNewWorkHowToUse(e.target.value)}
                          rows={2}
                          placeholder="Instructions, game controls, setup details..."
                          className="px-3 py-2 border border-border-main/80 bg-bg-base text-txt-main rounded-sm text-xs font-light placeholder:text-txt-muted/40 focus:outline-none focus:border-txt-main resize-none"
                        />
                      </div>

                      {/* Review notice */}
                      <div className={`text-[9.5px] font-mono px-3 py-2 rounded-sm border flex items-center gap-1.5 ${
                        newWorkIsPublished && !newWorkIsAlias
                          ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
                          : 'text-amber-400 bg-amber-500/10 border-amber-500/30'
                      }`}>
                        {newWorkIsPublished && !newWorkIsAlias ? (
                          <>
                            <CheckCircle2 size={12} />
                            Automated AI Verification Active
                          </>
                        ) : (
                          <>
                            <AlertCircle size={12} />
                            Submission Requires Faculty Review
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Wizard footer buttons */}
                <div className="flex items-center justify-between px-6 py-4 border-t border-border-main/40 shrink-0 gap-3">
                  {addWorkStep > 1 ? (
                    <button
                      onClick={() => setAddWorkStep(s => (s - 1) as 1|2|3)}
                      className="h-9 px-4 border border-border-main hover:bg-bg-card text-txt-sub font-mono text-[10px] uppercase rounded-sm cursor-pointer transition-colors"
                    >
                      ← Back
                    </button>
                  ) : (
                    <div />
                  )}
                  {addWorkStep < 3 ? (
                    <button
                      disabled={addWorkStep === 1 && !newWorkCategory}
                      onClick={() => setAddWorkStep(s => (s + 1) as 1|2|3)}
                      className="h-9 px-5 bg-accent-main hover:opacity-90 text-bg-base font-mono text-[10px] uppercase font-bold rounded-sm cursor-pointer disabled:opacity-40 transition-opacity"
                    >
                      Next →
                    </button>
                  ) : (
                    <button
                      disabled={addWorkLoading || !newWorkTitle || !newWorkCategory}
                      onClick={handleSubmitWork}
                      className="h-9 px-5 bg-accent-main hover:opacity-90 text-bg-base font-mono text-[10px] uppercase font-bold rounded-sm cursor-pointer disabled:opacity-40 transition-opacity flex items-center gap-1.5"
                    >
                      {addWorkLoading ? (
                        <><span className="w-3.5 h-3.5 border-2 border-bg-base/40 border-t-bg-base rounded-full animate-spin" /> Submitting...</>
                      ) : (
                        'Submit Work'
                      )}
                    </button>
                  )}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

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
