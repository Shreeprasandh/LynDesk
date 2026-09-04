"use client";

import React, { use, useState, useEffect, useRef, useCallback, useMemo, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { supabase } from "../../lib/supabase";
import { getCachedWorkspaceSnapshot } from "../../lib/workspacePrefetch";
import { isHarassmentOrOffensive } from "../../lib/moderation";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "../../components/Header";
import LynDeskLoadingCard from "../../components/LynDeskLoadingCard";
import { deleteWallCalendarEvent } from "../../lib/wallCalendarSync";
import { 
  ArrowLeft, 
  Paperclip, 
  Send, 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Phone, 
  PhoneOff, 
  UserPlus, 
  FolderDown, 
  ExternalLink, 
  CheckCircle2, 
  Clock, 
  CloudUpload, 
  Terminal, 
  Award, 
  Plus, 
  X, 
  LogOut, 
  AlertCircle, 
  Edit2, 
  Sparkles, 
  Eye, 
  Edit3, 
  Check, 
  FileText, 
  Download, 
  Monitor, 
  Tablet, 
  Smartphone, 
  RefreshCw, 
  Trash2, 
  User, 
  Users, 
  Layers, 
  Lock, 
  Unlock 
} from "lucide-react";

const getUniqueId = (prefix: string = "id") => {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};

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

interface FriendProfile {
  id: string;
  username: string;
  full_name: string;
  avatar_url?: string;
  academic_credits?: number;
}

interface TeamMember {
  id: string;
  name: string;
  isOnline: boolean;
  isSpeaking?: boolean;
  avatarUrl?: string;
  customStatus?: string;
  lastSeenAt?: string;
}

interface ChatMsg {
  id: string;
  sender_name: string;
  sender_role: string;
  content: string;
  created_at: string;
  isSystem?: boolean;
  file_url?: string;
  file_name?: string;
  file_type?: "image" | "file";
  file_size?: string;
}

interface Artifact {
  id: string;
  slot_index?: number;
  slot_name?: string;
  file_name: string;
  file_url: string;
  version: number;
  is_active: boolean;
  uploaded_by: string;
  created_at: string;
}

interface WorkspaceTask {
  id: string;
  title: string;
  status: "todo" | "in_progress" | "done";
  priority: "high" | "medium" | "low";
  assignee: string;
  scope: "team" | "self";
  created_by?: string;
}

interface GitLanguage {
  name: string;
  bytes: number;
  percentage: number;
}

const generateSessionId = () => Math.random().toString(36).substring(2, 11);

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

    // Ensure 4-digit year is present so Date.parse doesn't default to year 2001
    if (!/\b20\d{2}\b/.test(raw)) {
      const currentYear = new Date().getFullYear();
      raw = `${raw}, ${currentYear}`;
    }

    const parsedTime = Date.parse(raw);

    if (!isNaN(parsedTime)) {
      const targetDate = new Date(parsedTime);
      targetDate.setHours(23, 59, 59, 999);
      return new Date().getTime() > targetDate.getTime();
    }
  } catch {}

  return false;
}

function mergeChatMessages(prev: ChatMsg[], incoming: ChatMsg, currentUsername?: string): ChatMsg[] {
  if (!incoming || (!incoming.isSystem && !incoming.content && !incoming.file_url)) return prev;

  const existingIdx = prev.findIndex(m => m.id === incoming.id);
  if (existingIdx >= 0) {
    const updated = [...prev];
    updated[existingIdx] = {
      ...updated[existingIdx],
      ...incoming,
      file_url: incoming.file_url || updated[existingIdx].file_url,
      file_name: incoming.file_name || updated[existingIdx].file_name,
      file_type: incoming.file_type || updated[existingIdx].file_type,
      file_size: incoming.file_size || updated[existingIdx].file_size
    };
    return updated;
  }

  const matchIdx = prev.findIndex(m => {
    if (m.isSystem) return false;
    const sameContent = (m.content || "").trim() === (incoming.content || "").trim();
    const sameUrl = (m.file_url || "") === (incoming.file_url || "");
    const timeDiff = Math.abs(new Date(m.created_at).getTime() - new Date(incoming.created_at).getTime());

    const isMineA = m.sender_name === "You" || 
                    (currentUsername && m.sender_name.toLowerCase() === currentUsername.toLowerCase());
    const isMineB = incoming.sender_name === "You" || 
                    (currentUsername && incoming.sender_name.toLowerCase() === currentUsername.toLowerCase());
    const sameSender = (isMineA && isMineB) || m.sender_name.toLowerCase() === incoming.sender_name.toLowerCase();

    return sameSender && sameContent && sameUrl && timeDiff < 35000;
  });

  if (matchIdx >= 0) {
    const updated = [...prev];
    updated[matchIdx] = {
      ...incoming,
      file_url: incoming.file_url || prev[matchIdx].file_url,
      file_name: incoming.file_name || prev[matchIdx].file_name,
      file_type: incoming.file_type || prev[matchIdx].file_type,
      file_size: incoming.file_size || prev[matchIdx].file_size
    };
    return updated;
  }

  return [...prev, incoming];
}

export default function WorkspacePage({ params }: { params: Promise<{ id: string }> }) {

  const { id } = use(params);
  const workspaceUuid = useMemo(() => getWorkspaceUuid(id), [id]);
  const { user, isUserOnline, onlineUserIds } = useAuth();
  const { showToast } = useToast();
  const [userUsername, setUserUsername] = useState<string>("");

  useEffect(() => {
    if (user?.id) {
      supabase
        .from("profiles")
        .select("username")
        .eq("id", user.id)
        .maybeSingle()
        .then(({ data }) => {
          if (data?.username) setUserUsername(data.username);
        });
    }
  }, [user?.id]);

  const [activeTab, setActiveTab] = useState<"workspace" | "tasks" | "artifacts" | "notes" | "credits">("workspace");
  const [isWorkspaceHydrating, setIsWorkspaceHydrating] = useState(true);
  const [, startTabTransition] = useTransition();

  const handleTabChange = useCallback((nextTab: "workspace" | "tasks" | "artifacts" | "notes" | "credits") => {
    startTabTransition(() => {
      setActiveTab(nextTab);
    });
  }, []);

  // Mouse Drag Resizer State & Persistence
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDesktop, setIsDesktop] = useState(false);
  const [isResizing, setIsResizing] = useState<"left-center" | "center-right" | null>(null);
  const [isLayoutLocked, setIsLayoutLocked] = useState(false);
  const [panelWidths, setPanelWidths] = useState<{ left: number; chat: number; right: number }>({
    left: 25,
    chat: 41.67,
    right: 33.33
  });

  useEffect(() => {
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    checkDesktop();
    window.addEventListener("resize", checkDesktop);
    return () => window.removeEventListener("resize", checkDesktop);
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(`ldk_workspace_widths_${id}`);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed && typeof parsed.left === "number" && typeof parsed.chat === "number" && typeof parsed.right === "number") {
            setTimeout(() => setPanelWidths(parsed), 0);
          }
        } catch {}
      }
      const savedLock = localStorage.getItem(`ldk_workspace_layout_locked_${id}`);
      if (savedLock !== null) {
        setTimeout(() => setIsLayoutLocked(savedLock === "true"), 0);
      }
    }
  }, [id]);

  const toggleLayoutLock = () => {
    setIsLayoutLocked(prev => {
      const next = !prev;
      if (typeof window !== "undefined") {
        localStorage.setItem(`ldk_workspace_layout_locked_${id}`, String(next));
      }
      return next;
    });
  };

  useEffect(() => {
    if (!isResizing || isLayoutLocked) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const totalWidth = rect.width;
      const mouseX = e.clientX - rect.left;
      const mousePercent = (mouseX / totalWidth) * 100;

      if (isResizing === "left-center") {
        const newLeft = Math.max(15, Math.min(40, mousePercent));
        const remaining = 100 - newLeft;
        const currentChatRatio = panelWidths.chat / (panelWidths.chat + panelWidths.right);
        const newChat = Math.max(25, Math.min(60, remaining * currentChatRatio));
        const newRight = 100 - newLeft - newChat;
        if (newRight >= 20 && newRight <= 55) {
          const updated = { left: newLeft, chat: newChat, right: newRight };
          setPanelWidths(updated);
          localStorage.setItem(`ldk_workspace_widths_${id}`, JSON.stringify(updated));
        }
      } else if (isResizing === "center-right") {
        const remaining = 100 - panelWidths.left;
        const chatMousePercent = mousePercent - panelWidths.left;
        const newChat = Math.max(25, Math.min(60, chatMousePercent));
        const newRight = remaining - newChat;
        if (newRight >= 20 && newRight <= 55) {
          const updated = { left: panelWidths.left, chat: newChat, right: newRight };
          setPanelWidths(updated);
          localStorage.setItem(`ldk_workspace_widths_${id}`, JSON.stringify(updated));
        }
      }
    };

    const handleMouseUp = () => {
      setIsResizing(null);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing, isLayoutLocked, panelWidths, id]);

  const handleResetWidths = () => {
    const defaultWidths = { left: 25, chat: 41.67, right: 33.33 };
    setPanelWidths(defaultWidths);
    if (typeof window !== "undefined") {
      localStorage.setItem(`ldk_workspace_widths_${id}`, JSON.stringify(defaultWidths));
    }
  };

  // Workspace Tasks & Milestones State (Team vs Self) - 0ms Pre-fetch Cache Hydration
  const [tasks, setTasks] = useState<WorkspaceTask[]>(() => {
    const snap = getCachedWorkspaceSnapshot(workspaceUuid || id);
    return snap?.tasks && Array.isArray(snap.tasks) && snap.tasks.length > 0 ? (snap.tasks as WorkspaceTask[]) : [];
  });
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState<"high" | "medium" | "low">("medium");
  const [newTaskScope, setNewTaskScope] = useState<"team" | "self">("team");
  const [taskFilter, setTaskFilter] = useState<"all" | "team" | "self">("all");

  // Collaborative Scratchpad Notes State
  const [workspaceNotes, setWorkspaceNotes] = useState(
    "## Team Architecture Notes\n- Next.js 16 App Router with React 19 Server Components\n- WebRTC peer connection for real-time voice call\n- Supabase real-time channel for live chat feed"
  );

  // Project Details with 0ms Snapshot Hydration
  const [projectName, setProjectName] = useState(() => {
    const snap = getCachedWorkspaceSnapshot(workspaceUuid || id);
    return snap?.projectName && snap.projectName !== "Workspace" ? snap.projectName : "Loading Project...";
  });
  const [eventTitle, setEventTitle] = useState("Hackathon Event");
  const [status, setStatus] = useState<"ideation" | "development" | "testing" | "submitted">(() => {
    const snap = getCachedWorkspaceSnapshot(workspaceUuid || id);
    return (snap?.status as any) || "development";
  });
  const [githubRepo, setGithubRepo] = useState("");
  const [liveDemo, setLiveDemo] = useState("");
  const [gitLanguages, setGitLanguages] = useState<GitLanguage[]>([]);

  // Edit Workspace Name, Git & Host state variables
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState("");
  const [isEditingGit, setIsEditingGit] = useState(false);
  const [isEditingDemo, setIsEditingDemo] = useState(false);
  const [tempGit, setTempGit] = useState("");
  const [tempDemo, setTempDemo] = useState("");

  // Live Prototype Preview Simulator state
  const [showDemoPreviewModal, setShowDemoPreviewModal] = useState(false);
  const [isInlineDemoPreviewOpen, setIsInlineDemoPreviewOpen] = useState(false);
  const [demoViewportMode, setDemoViewportMode] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [demoIframeKey, setDemoIframeKey] = useState(0);
  // Event Details & Brief Modal States
  const [showBriefModal, setShowBriefModal] = useState(false);
  const [eventMetadata, setEventMetadata] = useState<{
    title: string;
    description: string;
    organization: string;
    prizes: string;
    rules: string;
    deadline: string;
    url: string;
  }>({
    title: "Project Workspace",
    description: "Official project workspace. Collaborate with your team, assign tasks, and track stage milestones.",
    organization: "LynDesk Workspace",
    prizes: "Certificate & Project Awards",
    rules: "1. All code must be submitted before deadline.\n2. Teams can have up to 4 members.\n3. Original projects only.",
    deadline: "Target Active",
    url: ""
  });

  // Real Event Stage Item Type
  type RealStageItem = {
    title: string;
    deadline: string;
    brief?: string;
  };

  function sanitizeStageItems(items: RealStageItem[]): RealStageItem[] {
    if (!Array.isArray(items)) return [];
    const seen = new Set<string>();
    const result: RealStageItem[] = [];

    for (const item of items) {
      if (!item || !item.title) continue;
      const cleanTitle = item.title
        .replace(/\s*-\s*Duplicate/gi, "")
        .replace(/\s*\(Duplicate\)/gi, "")
        .replace(/\s*\|\s*\d{4}-\d{2}-\d{2}.*/gi, "")
        .trim();

      const lower = cleanTitle.toLowerCase();
      // Exclude administrative email tasks, ambassador reminders, and duplicate markers
      if (
        lower.includes("send email") || 
        lower.includes("email (campus") || 
        lower.includes("campus ambassador") || 
        lower.includes("admin broadcast") ||
        lower.includes("round to send") ||
        lower.includes("duplicate")
      ) {
        continue;
      }

      if (!seen.has(lower)) {
        seen.add(lower);
        result.push({
          ...item,
          title: cleanTitle
        });
      }
    }
    return result;
  }

  const defaultRealStages: RealStageItem[] = [
    { title: "Ideation & Proposal", deadline: "Aug 19", brief: "Problem statement selection, team role assignment, technical architecture deck draft submission." },
    { title: "Prototype Development", deadline: "Sep 02", brief: "Implement core MVP components, API route handlers, database schemas, and live WebSockets data sync." },
    { title: "QA & User Testing", deadline: "Sep 16", brief: "Execute unit tests, audit accessibility & responsiveness across viewports, and refine UI micro-animations." },
    { title: "Final Submission", deadline: "Oct 01", brief: "Publish live production Vercel URL, verify public GitHub repository link, record video demonstration, and submit final entry." }
  ];

  const [realStageItems, setRealStageItems] = useState<RealStageItem[]>(defaultRealStages);

  const WORKSPACE_EVENT_URL_MAP: Record<string, { title: string; portalUrl: string }> = {
    "ws_unstop_uber_2026": { title: "Uber HackTag 2026 Hackathon", portalUrl: "https://unstop.com/hackathons/uber-hacktag-2026" },
    "ws_unstop_tata_2026": { title: "Tata Crucible Campus Hack 2026", portalUrl: "https://unstop.com/competitions/tata-crucible-campus-2026" },
    "ws_unstop_flipkart_grid": { title: "Flipkart GRID 6.0 Software Track", portalUrl: "https://unstop.com/competitions/flipkart-grid-6" },
    "ws_devpost_gemini_2026": { title: "Google Gemini AI Global Challenge 2026", portalUrl: "https://devpost.com/hackathons/gemini-ai-challenge" },
    "ws_devpost_cloud_2026": { title: "Google Cloud AI Hackathon", portalUrl: "https://devpost.com/hackathons/google-cloud-ai" },
    "0d72f1f4-cf25-4a99-bac4-37685be55df1": { title: "Adobe University Hackathon 2026", portalUrl: "https://unstop.com/hackathons/crp-adobe-university-hackathon-2026-adobe-1715333" }
  };

  useEffect(() => {
    if (!id) return;

    // 1. Resolve workspace-specific URL mapping
    const mapped = WORKSPACE_EVENT_URL_MAP[id];
    if (mapped) {
      queueMicrotask(() => {
        setEventMetadata(prev => ({
          ...prev,
          title: mapped.title,
          url: mapped.portalUrl
        }));
      });
    }

    // 2. Load workspace-specific metadata from local storage / cache
    if (typeof window !== "undefined") {
      const savedMeta = localStorage.getItem(`ldk_workspace_meta_${id}`);
      if (savedMeta) {
        try {
          const parsedMeta = JSON.parse(savedMeta);
          if (parsedMeta && typeof parsedMeta === "object") {
            setTimeout(() => {
              setEventMetadata(prev => ({
                ...prev,
                ...parsedMeta
              }));
            }, 0);
          }
        } catch {}
      }

      // 3. Load workspace-specific stages from local storage / cache
      const savedStages = localStorage.getItem(`ldk_workspace_real_stages_${id}`);
      if (savedStages) {
        try {
          const parsedStages = JSON.parse(savedStages);
          if (Array.isArray(parsedStages) && parsedStages.length > 0) {
            const clean = sanitizeStageItems(parsedStages);
            setTimeout(() => setRealStageItems(clean), 0);
          }
        } catch {}
      }
    }
  }, [id]);

  useEffect(() => {
    if (!eventMetadata?.url || eventMetadata.url.trim() === "") return;
    const fetchLiveWebDates = async () => {
      try {
        const res = await fetch("/api/scrape", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: eventMetadata.url })
        });
        if (res.ok) {
          const data = await res.json();
          if (data && !data.error) {
            const updatedMeta = {
              title: data.title || eventMetadata.title,
              description: data.description || eventMetadata.description,
              organization: data.organization || eventMetadata.organization,
              prizes: data.prizes || eventMetadata.prizes,
              rules: data.rules || eventMetadata.rules,
              deadline: data.deadline || eventMetadata.deadline,
              url: eventMetadata.url
            };

            setEventMetadata(updatedMeta);

            if (typeof window !== "undefined") {
              localStorage.setItem(`ldk_workspace_meta_${id}`, JSON.stringify(updatedMeta));
            }

            if (Array.isArray(data.stages) && data.stages.length > 0) {
              const extracted: RealStageItem[] = data.stages.map((s: any, idx: number) => ({
                title: s.stage || s.title || `Round ${idx + 1}`,
                deadline: s.deadline || "TBD",
                brief: s.brief || ""
              }));
              const cleanExtracted = sanitizeStageItems(extracted);
              setRealStageItems(cleanExtracted);
              if (typeof window !== "undefined") {
                localStorage.setItem(`ldk_workspace_real_stages_${id}`, JSON.stringify(cleanExtracted));
              }
            }
          }
        }
      } catch (err) {
        console.warn("Live event resync note (retaining stored DB/cache snapshot):", err);
      }
    };
    fetchLiveWebDates();
  }, [id, eventMetadata?.url]);

  // Voice/Video Room State
  const [inRoom, setInRoom] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [roomMembers, setRoomMembers] = useState<TeamMember[]>([]);
  const [showActiveMembersModal, setShowActiveMembersModal] = useState(false);
  const [myCustomStatus] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(`ldk_my_custom_status_${id}`) || "Active";
    }
    return "Active";
  });
  const myCustomStatusRef = useRef<string>(myCustomStatus);
  useEffect(() => {
    myCustomStatusRef.current = myCustomStatus;
  }, [myCustomStatus]);
  const [sentInviteIds, setSentInviteIds] = useState<string[]>([]);

  const router = useRouter();
  const [showLeaveConfirmModal, setShowLeaveConfirmModal] = useState(false);

  // WebRTC real-time voice and video variables
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [remoteIsVideoOn, setRemoteIsVideoOn] = useState(true);
  const [remoteIsMuted, setRemoteIsMuted] = useState(false);
  const [remoteName, setRemoteName] = useState<string>("Classmate");

  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const signalingChannelRef = useRef<any>(null);
  const userSessionIdRef = useRef<string>(generateSessionId());
  const activeChannelRef = useRef<any>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const iceCandidatesQueueRef = useRef<RTCIceCandidateInit[]>([]);

  // Reliable callback refs for video HTML element srcObject assignment
  const setLocalVideoNode = useCallback((node: HTMLVideoElement | null) => {
    localVideoRef.current = node;
    if (node && localStream) {
      node.srcObject = localStream;
    }
  }, [localStream]);

  const setRemoteVideoNode = useCallback((node: HTMLVideoElement | null) => {
    remoteVideoRef.current = node;
    if (node && remoteStream) {
      node.srcObject = remoteStream;
    }
  }, [remoteStream]);
  
  // Guarantee WebRTC media track and peer connection cleanup on component unmount
  useEffect(() => {
    return () => {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
        localStreamRef.current = null;
      }
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
        peerConnectionRef.current = null;
      }
    };
  }, []);

  // Live Call Active State for Room
  const [isCallActiveInRoom, setIsCallActiveInRoom] = useState(false);
  const [callCallerName, setCallCallerName] = useState("Teammate");

  // Chat Feed State - 0ms Pre-fetch Cache Hydration
  const [chatMessages, setChatMessages] = useState<ChatMsg[]>(() => {
    const snap = getCachedWorkspaceSnapshot(workspaceUuid || id);
    if (snap?.chatMessages && Array.isArray(snap.chatMessages) && snap.chatMessages.length > 0) {
      return snap.chatMessages as ChatMsg[];
    }
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(`ldk_chat_messages_${id}`);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch {}
    }
    return [];
  });
  const [newMsg, setNewMsg] = useState("");
  // Collaborative Chat State & File Attachments
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatFileInputRef = useRef<HTMLInputElement>(null);
  const [chatAttachment, setChatAttachment] = useState<{
    file: File;
    previewUrl: string;
    type: "image" | "file";
    name: string;
    sizeStr: string;
  } | null>(null);
  const [isUploadingChatFile, setIsUploadingChatFile] = useState(false);
  const [chatImagePreviewUrl, setChatImagePreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && chatImagePreviewUrl) {
        setChatImagePreviewUrl(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [chatImagePreviewUrl]);

  const handleChatFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];

    const isImg = file.type.startsWith("image/");
    const previewUrl = isImg ? URL.createObjectURL(file) : "";
    
    const bytes = file.size;
    let sizeStr = `${bytes} B`;
    if (bytes >= 1024 * 1024) {
      sizeStr = `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    } else if (bytes >= 1024) {
      sizeStr = `${(bytes / 1024).toFixed(0)} KB`;
    }

    setChatAttachment({
      file,
      previewUrl,
      type: isImg ? "image" : "file",
      name: file.name,
      sizeStr
    });
  };

  // Artifacts State
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Claim Academic Credits State
  const [claimStatus, setClaimStatus] = useState<"idle" | "pending" | "approved" | "rejected">("idle");
  const [isSubmittingClaim, setIsSubmittingClaim] = useState(false);

  // 4 Active Artifact Slots & Preview Modal State
  const [slotNames, setSlotNames] = useState<string[]>([
    "Presentation Pitch Deck",
    "Architecture Specification",
    "UI/UX Design Mockups",
    "Source Code & Deliverables"
  ]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedSlots = localStorage.getItem(`ldk_workspace_slot_names_${id}`);
      if (savedSlots) {
        try {
          const parsed = JSON.parse(savedSlots);
          if (Array.isArray(parsed) && parsed.length === 4) {
            setTimeout(() => setSlotNames(parsed), 0);
          }
        } catch {}
      }
    }
  }, [id]);
  const [editingSlotIndex, setEditingSlotIndex] = useState<number | null>(null);
  const [tempSlotName, setTempSlotName] = useState("");
  const [targetUploadSlot, setTargetUploadSlot] = useState<number>(0);

  const [previewArtifact, setPreviewArtifact] = useState<Artifact | null>(null);
  const [previewContent, setPreviewContent] = useState<string | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState<boolean>(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState<boolean>(false);

  const saveSlotName = (index: number) => {
    if (!tempSlotName.trim()) return;
    const updated = [...slotNames];
    updated[index] = tempSlotName.trim();
    setSlotNames(updated);
    localStorage.setItem(`ldk_workspace_slot_names_${id}`, JSON.stringify(updated));
    setEditingSlotIndex(null);
    if (workspaceUuid) {
      (async () => {
        try {
          await supabase.from("project_spaces").update({ slot_names: updated }).eq("id", workspaceUuid);
        } catch {}
      })();
    }
  };

  const triggerSlotUpload = (slotIndex: number) => {
    setTargetUploadSlot(slotIndex);
    fileInputRef.current?.click();
  };

  const handleOpenPreview = async (art: Artifact) => {
    setPreviewArtifact(art);
    setPreviewContent(null);
    setIsPreviewOpen(true);

    const ext = art.file_name.split(".").pop()?.toLowerCase() || "";
    const textExts = ["txt", "md", "json", "js", "ts", "jsx", "tsx", "py", "csv", "html", "css"];

    if (textExts.includes(ext) && art.file_url && art.file_url !== "#") {
      setIsPreviewLoading(true);
      try {
        if (art.file_url.startsWith("data:")) {
          const parts = art.file_url.split(",");
          if (parts[1]) {
            try {
              const decoded = atob(parts[1]);
              setPreviewContent(decoded);
            } catch {
              setPreviewContent(decodeURIComponent(parts[1]));
            }
          }
        } else {
          const res = await fetch(art.file_url);
          if (res.ok) {
            const text = await res.text();
            setPreviewContent(text);
          }
        }
      } catch {}
      setIsPreviewLoading(false);
    }
  };

  // Memoized Array Computation Performance Optimization
  const archivedArtifacts = useMemo(() => artifacts.filter(a => !a.is_active), [artifacts]);
  const activeSlotArtifacts = useMemo(() => {
    return [0, 1, 2, 3].map(slotIdx => {
      return artifacts.find(a => a.is_active && (a.slot_index === slotIdx || a.slot_name === slotNames[slotIdx])) || null;
    });
  }, [artifacts, slotNames]);
  const onlineMembers = useMemo(() => roomMembers.filter(m => m.isOnline), [roomMembers]);
  const completedTasksCount = useMemo(() => tasks.filter(t => t.status === "done").length, [tasks]);

  // Invite Classmates Modal States
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  const broadcastChannelRef = useRef<BroadcastChannel | null>(null);

  const broadcastLocalEvent = useCallback((type: string, payload: any) => {
    try {
      if (broadcastChannelRef.current) {
        broadcastChannelRef.current.postMessage({ type, payload });
      }
    } catch {
      // Safe fallback
    }
  }, []);

  // Browser BroadcastChannel for instant multi-tab sync on same origin
  useEffect(() => {
    if (typeof BroadcastChannel === "undefined") return;
    const bc = new BroadcastChannel(`ldk_bus_${id}`);
    broadcastChannelRef.current = bc;
    bc.onmessage = (event) => {
      const { type, payload } = event.data || {};
      if (type === "chat_message" && payload) {
        setChatMessages((prev) => {
          const updated = mergeChatMessages(prev, payload, userUsername);
          localStorage.setItem(`ldk_chat_messages_${id}`, JSON.stringify(updated));
          return updated;
        });
      } else if (type === "member_joined" && payload) {
        setRoomMembers((prev) => {
          if (prev.some((m) => m.id === payload.id)) return prev;
          return [
            ...prev,
            { id: payload.id, name: payload.name, avatarUrl: payload.avatarUrl || "", isOnline: true }
          ];
        });
      } else if (type === "tasks_update" && Array.isArray(payload)) {
        setTasks(payload);
        localStorage.setItem(`ldk_workspace_tasks_${id}`, JSON.stringify(payload));
      } else if (type === "notes_update" && typeof payload === "string") {
        setWorkspaceNotes(payload);
        localStorage.setItem(`ldk_workspace_notes_${id}`, payload);
      } else if (type === "artifacts_update" && Array.isArray(payload)) {
        setArtifacts(payload);
        localStorage.setItem(`ldk_workspace_artifacts_${id}`, JSON.stringify(payload));
      } else if (type === "links_update" && payload) {
        const git = payload.githubRepo || payload.github_repo;
        const demo = payload.liveDemo || payload.live_demo_url;
        if (git) {
          setGithubRepo(git);
          if (typeof window !== "undefined") localStorage.setItem(`ldk_workspace_git_${id}`, git);
        }
        if (demo) {
          setLiveDemo(demo);
          if (typeof window !== "undefined") localStorage.setItem(`ldk_workspace_demo_${id}`, demo);
        }
      } else if (type === "status_update" && typeof payload === "string") {
        setStatus(payload as any);
      } else if (type === "credits_update" && typeof payload === "string") {
        setClaimStatus(payload as any);
      } else if (type === "name_update" && typeof payload === "string") {
        setProjectName(payload);
        if (typeof window !== "undefined") localStorage.setItem(`ldk_workspace_name_${id}`, payload);
      } else if (type === "call_presence" && payload) {
        setIsCallActiveInRoom(!!payload.active);
        if (payload.callerName) setCallCallerName(payload.callerName);
      }
    };
    return () => {
      broadcastChannelRef.current = null;
      bc.close();
    };
  }, [id, userUsername]);

  useEffect(() => {
    if (typeof window !== "undefined" && typeof localStorage !== "undefined") {
      const savedCallStr = localStorage.getItem(`ldk_active_call_${id}`);
      if (savedCallStr) {
        try {
          const parsed = JSON.parse(savedCallStr);
          if (parsed && parsed.active) {
            queueMicrotask(() => {
              setIsCallActiveInRoom(true);
              if (parsed.callerName) setCallCallerName(parsed.callerName);
            });
          }
        } catch {}
      }
    }
  }, [id]);
  const [copiedLink, setCopiedLink] = useState(false);
  const [friendsToInvite, setFriendsToInvite] = useState<FriendProfile[]>([]);
  const [invitingFriendId, setInvitingFriendId] = useState<string | null>(null);
  const [workspaceTrigger, setWorkspaceTrigger] = useState(0);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const getBestAvatarUrl = (item: any): string => {
    if (!item) return "";
    if (typeof item === "string") return item;
    
    // Check local storage override first for current logged-in user to eliminate 0ms flash
    if (typeof window !== "undefined" && item.id && user?.id && item.id === user.id) {
      const localUpdated = localStorage.getItem(`ldk_user_avatar_${user.id}`) || localStorage.getItem(`ldk_avatar_url_${user.id}`);
      if (localUpdated && localUpdated.trim().length > 0) {
        return localUpdated.trim();
      }
    }

    // 1. Prioritize custom updated profile picture (DB profiles table / custom upload)
    const customAvatar = item.avatar_url || item.avatarUrl;
    if (customAvatar && typeof customAvatar === "string" && customAvatar.trim().length > 0) {
      return customAvatar.trim();
    }

    // 2. Only if no custom profile update was done, fall back to Google OAuth profile picture
    const meta = item.raw_user_meta_data || item.user_metadata;
    if (meta) {
      const metaAvatar = meta.avatar_url || meta.avatar;
      if (metaAvatar && typeof metaAvatar === "string" && metaAvatar.trim().length > 0) {
        return metaAvatar.trim();
      }
    }

    if (Array.isArray(item.identities)) {
      for (const identity of item.identities) {
        const idData = identity?.identity_data || {};
        const idUrl = idData.avatar_url || idData.picture || idData.avatarUrl || idData.avatar;
        if (idUrl && typeof idUrl === "string" && idUrl.trim().length > 0) {
          return idUrl.trim();
        }
      }
    }

    // 3. Fallback strictly to default SVG profile icon / letter badge
    return "";
  };

  // Load workspace members dynamically from local storage and DB
  useEffect(() => {
    const loadMembers = async () => {
      const baseMembers: TeamMember[] = user ? [
        {
          id: user.id,
          name: user.user_metadata?.full_name || user.email?.split("@")[0] || "You",
          isOnline: true,
          isSpeaking: false,
          avatarUrl: getBestAvatarUrl(user)
        }
      ] : [];

      // 1. Load mock members accepted from local storage
      const storedStr = localStorage.getItem(`ldk_workspace_members_${id}`);
      const storedList: TeamMember[] = storedStr ? JSON.parse(storedStr) : [];

      // 2. Query real database members from project_members & profiles
      let dbMembersList: TeamMember[] = [];
      try {
        const { data: memberRows } = await supabase
          .from("project_members")
          .select("profile_id, role")
          .eq("project_space_id", workspaceUuid);

        if (memberRows && memberRows.length > 0) {
          const profIds = memberRows.map((m: any) => m.profile_id).filter(Boolean);
          if (profIds.length > 0) {
            const { data: profRows } = await supabase
              .from("profiles")
              .select("*")
              .in("id", profIds);

            if (profRows && profRows.length > 0) {
              dbMembersList = profRows.map((prof: any) => ({
                id: prof.id,
                name: prof.full_name || prof.username || "Collaborator",
                avatarUrl: getBestAvatarUrl(prof),
                isOnline: isUserOnline(prof.id),
                customStatus: "Active",
                lastSeenAt: "Recently"
              }));
            }
          }
        }
      } catch (e) {
        console.error("Error loading project members: ", e);
      }

      // Combine base, stored, and DB members
      const combined = [...baseMembers, ...storedList, ...dbMembersList];
      const uniqueMap = new Map<string, TeamMember>();
      combined.forEach(m => {
        if (m && m.id) uniqueMap.set(m.id, m);
      });

      // Live Profile Avatar Enrichment from Supabase profiles table
      const allMemberIds = Array.from(uniqueMap.keys());
      if (allMemberIds.length > 0) {
        try {
          const { data: profData } = await supabase
            .from("profiles")
            .select("*")
            .in("id", allMemberIds);

          if (profData && profData.length > 0) {
            profData.forEach((p: any) => {
              const existing = uniqueMap.get(p.id);
              if (existing) {
                const resolvedAvatar = getBestAvatarUrl(p);
                uniqueMap.set(p.id, {
                  ...existing,
                  name: p.full_name || p.username || existing.name,
                  avatarUrl: resolvedAvatar || existing.avatarUrl || ""
                });
              }
            });
          }
        } catch (e) {
          console.warn("Avatar enrichment warning: ", e);
        }
      }

      // Ensure logged in user is always online with proper avatarUrl in roomMembers
      if (user && uniqueMap.has(user.id)) {
        const myMem = uniqueMap.get(user.id)!;
        uniqueMap.set(user.id, {
          ...myMem,
          isOnline: true,
          avatarUrl: getBestAvatarUrl(user) || myMem.avatarUrl || ""
        });
      } else if (user) {
        uniqueMap.set(user.id, {
          id: user.id,
          name: user.user_metadata?.full_name || user.email?.split("@")[0] || "You",
          isOnline: true,
          avatarUrl: getBestAvatarUrl(user) || ""
        });
      }

      const finalMembers = Array.from(uniqueMap.values()).map(m => ({
        ...m,
        isOnline: isUserOnline(m.id) || m.isOnline
      }));

      setRoomMembers(finalMembers);
      if (typeof window !== "undefined") {
        localStorage.setItem(`ldk_workspace_members_${id}`, JSON.stringify(finalMembers));
      }
    };

    if (user) {
      loadMembers();
    }
  }, [id, user, workspaceTrigger, workspaceUuid, onlineUserIds]);

  // Load sent invites from local storage
  useEffect(() => {
    const loadSentInvites = () => {
      const storedStr = localStorage.getItem(`ldk_sent_invites_${id}`);
      if (storedStr) {
        setSentInviteIds(JSON.parse(storedStr));
      } else {
        setSentInviteIds([]);
      }
    };

    loadSentInvites();

    window.addEventListener("ldk_notifications_update", loadSentInvites);
    window.addEventListener("storage", loadSentInvites);
    return () => {
      window.removeEventListener("ldk_notifications_update", loadSentInvites);
      window.removeEventListener("storage", loadSentInvites);
    };
  }, [id, workspaceTrigger]);

  // Handle invitation acceptance from notifications query string
  // Handle invitation acceptance and auto-join for workspace members
  useEffect(() => {
    if (typeof window !== "undefined" && user) {
      const urlSearchParams = new URLSearchParams(window.location.search);
      const inviteId = urlSearchParams.get("acceptInvite");
      const inviteName = urlSearchParams.get("friendName") || "Teammate";
      const isAutoJoin = urlSearchParams.has("join") || !!inviteId;

      const storedKey = `ldk_workspace_members_${id}`;
      const storedStr = localStorage.getItem(storedKey);
      const storedList: TeamMember[] = storedStr ? JSON.parse(storedStr) : [];

      const joiningUserId = user.id;
      const joiningUserName = user.user_metadata?.full_name || user.email?.split("@")[0] || (inviteId ? decodeURIComponent(inviteName) : "Collaborator");
      const userAvatar = getBestAvatarUrl(user);

      // Register member in database project_members table
      if (workspaceUuid) {
        (async () => {
          try {
            await supabase.from("project_members").upsert(
              {
                project_space_id: workspaceUuid,
                profile_id: joiningUserId,
                role: "member"
              },
              { onConflict: "project_space_id,profile_id", ignoreDuplicates: true }
            );
          } catch {}
        })();
      }

      // Add to local room members list if missing
      if (!storedList.some((m: any) => m.id === joiningUserId)) {
        const newMember: TeamMember = {
          id: joiningUserId,
          name: joiningUserName,
          isOnline: true,
          avatarUrl: userAvatar
        };
        const updated = [...storedList, newMember];
        localStorage.setItem(storedKey, JSON.stringify(updated));

        // Update state and post bot notice in chat if accepting invite
        if (inviteId || isAutoJoin) {
          const botNotice: ChatMsg = {
            id: getUniqueId("sys_join"),
            sender_name: "LDK:BOT",
            sender_role: "SYSTEM",
            content: `${joiningUserName} accepted the invite and joined the shared workspace!`,
            created_at: new Date().toISOString(),
            isSystem: true
          };

          queueMicrotask(() => {
            // Clear workspaceId from ldk_deleted_workspaces on re-join
            const deletedStr = localStorage.getItem("ldk_deleted_workspaces");
            if (deletedStr) {
              try {
                const deletedList: string[] = JSON.parse(deletedStr);
                const cleanedDeleted = deletedList.filter(dId => dId !== id && dId !== workspaceUuid);
                localStorage.setItem("ldk_deleted_workspaces", JSON.stringify(cleanedDeleted));
              } catch {}
            }

            setSentInviteIds(prev => {
              const cleanList = prev.filter(fid => fid !== joiningUserId);
              localStorage.setItem(`ldk_sent_invites_${id}`, JSON.stringify(cleanList));
              return cleanList;
            });
            setChatMessages(prev => [...prev, botNotice]);
            setMessage({ text: `Joined shared workspace!`, type: "success" });
            setWorkspaceTrigger(prev => prev + 1);
          });
        }
      }

      if (inviteId) {
        // Strip parameters from URL for clean navigation
        const newUrl = window.location.pathname;
        window.history.replaceState({}, document.title, newUrl);
      }
    }
  }, [user, id]);

  // Git Commits
  const [commits, setCommits] = useState<any[]>([]);

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

  useEffect(() => {
    if (typeof window !== "undefined" && user) {
      const urlSearchParams = new URLSearchParams(window.location.search);
      if (urlSearchParams.has("join")) {
        const autoJoin = async () => {
          try {
            const { data } = await supabase
              .from("project_members")
              .select("id")
              .eq("project_space_id", workspaceUuid)
              .eq("profile_id", user.id);
            
            if (!data || data.length === 0) {
              await supabase
                .from("project_members")
                .insert({
                  project_space_id: workspaceUuid,
                  profile_id: user.id,
                  role: "member"
                });

              await supabase.from("chat_messages").insert({
                project_space_id: workspaceUuid,
                profile_id: user.id,
                content: `Joined the workspace via share link!`
              });
            }
          } catch (err) {
            console.error("Auto-join error:", err);
          }
        };
        autoJoin();
        const newUrl = window.location.pathname;
        window.history.replaceState({}, document.title, newUrl);
      }
    }
  }, [user, id, workspaceUuid]);

  // Fetch classmates to invite
  useEffect(() => {
    if (user && isInviteModalOpen) {
      const fetchFriendsForInvite = async () => {
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
            const friendsList: FriendProfile[] = [];
            data.forEach((item: any) => {
              if (item.status === "accepted") {
                const isSender = item.sender_id === user.id;
                const partner = isSender ? item.receiver : item.sender;
                if (partner) {
                  friendsList.push({
                    id: partner.id,
                    username: partner.username || "user",
                    full_name: partner.full_name || "Classmate",
                    academic_credits: 0
                  });
                }
              }
            });
            if (friendsList.length === 0) {
              const { data: profs } = await supabase
                .from("profiles")
                .select("id, username, full_name, avatar_url")
                .neq("id", user.id)
                .limit(20);

              if (profs && profs.length > 0) {
                profs.forEach((p: any) => {
                  friendsList.push({
                    id: p.id,
                    username: p.username || p.full_name?.toLowerCase().replace(/\s+/g, "_") || "user",
                    full_name: p.full_name || p.username || "Classmate",
                    avatar_url: p.avatar_url || "",
                    academic_credits: 0
                  });
                });
              }
            }
            setFriendsToInvite(friendsList);
          } else {
            const { data: profs } = await supabase
              .from("profiles")
              .select("id, username, full_name, avatar_url")
              .neq("id", user.id)
              .limit(20);

            const realList: FriendProfile[] = (profs || []).map((p: any) => ({
              id: p.id,
              username: p.username || p.full_name?.toLowerCase().replace(/\s+/g, "_") || "user",
              full_name: p.full_name || p.username || "Classmate",
              avatar_url: p.avatar_url || "",
              academic_credits: 0
            }));
            setFriendsToInvite(realList);
          }
        } catch (e) {
          console.error(e);
          setFriendsToInvite([]);
        }
      };
      fetchFriendsForInvite();
    }
  }, [user, isInviteModalOpen]);

  // Fetch Project Spaces, Chat Messages, Artifacts, and Credit Application Status
  useEffect(() => {
    const fetchWorkspaceDetails = async () => {
      // Setup base/default states matching dynamic IDs
      const initialLogs: ChatMsg[] = [
        { id: "c1", sender_name: "LDK:BOT", sender_role: "SYSTEM", content: "Workspace deck initialized successfully.", created_at: new Date().toISOString(), isSystem: true }
      ];

      // Restore local persisted workspace states
      if (typeof window !== "undefined") {
        const localGit = localStorage.getItem(`ldk_workspace_git_${id}`);
        const localDemo = localStorage.getItem(`ldk_workspace_demo_${id}`);
        const localName = localStorage.getItem(`ldk_workspace_name_${id}`);
        const localStatus = localStorage.getItem(`ldk_workspace_status_${id}`);
        const localNotes = localStorage.getItem(`ldk_workspace_notes_${id}`);
        const localTasksStr = localStorage.getItem(`ldk_workspace_tasks_${id}`);
        const localCreditsStatus = localStorage.getItem(`ldk_workspace_credits_${id}`);

        if (localGit) { setGithubRepo(localGit); setTempGit(localGit); }
        if (localDemo) { setLiveDemo(localDemo); setTempDemo(localDemo); }
        if (localName) setProjectName(localName);
        if (localStatus) setStatus(localStatus as any);
        if (localNotes) setWorkspaceNotes(localNotes);
        if (localCreditsStatus) setClaimStatus(localCreditsStatus as any);

        if (localTasksStr) {
          try {
            const parsedTasks = JSON.parse(localTasksStr);
            if (Array.isArray(parsedTasks)) setTasks(parsedTasks);
          } catch {}
        }
      }

      // Ensure user is recorded in project_members so RLS policies pass
      if (user && workspaceUuid) {
        try {
          await supabase
            .from("project_members")
            .upsert(
              {
                project_space_id: workspaceUuid,
                profile_id: user.id,
                role: "member"
              },
              { onConflict: "project_space_id,profile_id", ignoreDuplicates: true }
            );
        } catch {}
      }

      // 1. Parallelize all core workspace queries
      try {
        const [
          projectSpaceSettled,
          chatSettled,
          artifactsSettled,
          creditSettled,
          tasksSettled,
          membersSettled
        ] = await Promise.allSettled([
          // Query 1: project_spaces + events
          supabase
            .from("project_spaces")
            .select(`
              *,
              events ( title, registration_deadline, source_url )
            `)
            .eq("id", workspaceUuid)
            .maybeSingle(),

          // Query 2: chat_messages + profiles
          supabase
            .from("chat_messages")
            .select(`
              id,
              content,
              created_at,
              profiles ( username, college_key, company_key )
            `)
            .eq("project_space_id", workspaceUuid)
            .order("created_at", { ascending: true }),

          // Query 3: project_artifacts + profiles
          supabase
            .from("project_artifacts")
            .select(`
              id,
              slot_index,
              slot_name,
              file_name,
              file_url,
              version,
              is_active,
              created_at,
              profiles:uploaded_by ( username )
            `)
            .eq("project_space_id", workspaceUuid)
            .order("created_at", { ascending: false }),

          // Query 4: credit_applications
          user ? supabase
            .from("credit_applications")
            .select("status")
            .eq("project_space_id", workspaceUuid)
            .eq("student_id", user.id)
            .maybeSingle() : Promise.resolve({ data: null, error: null }),

          // Query 5: project_tasks
          supabase
            .from("project_tasks")
            .select("id, title, status, priority, scope, assigned_to, position, created_at")
            .eq("project_space_id", workspaceUuid)
            .order("position", { ascending: true }),

          // Query 6: project_members
          supabase
            .from("project_members")
            .select(`
              id,
              role,
              joined_at,
              profiles ( id, username, full_name, avatar_url, college_key, company_key )
            `)
            .eq("project_space_id", workspaceUuid)
        ]);

        // Process 1: Project Spaces & Event Details
        if (projectSpaceSettled.status === "fulfilled" && !projectSpaceSettled.value.error && projectSpaceSettled.value.data) {
          const data = projectSpaceSettled.value.data;
          const savedLocalName = typeof window !== "undefined" ? localStorage.getItem(`ldk_workspace_name_${id}`) : null;
          const resolvedName = data.project_name || savedLocalName || "Shared Workspace";
          setProjectName(resolvedName);
          if (typeof window !== "undefined") {
            localStorage.setItem(`ldk_workspace_name_${id}`, resolvedName);
          }
          if (data.status) {
            setStatus(data.status);
            if (typeof window !== "undefined") {
              localStorage.setItem(`ldk_workspace_status_${id}`, data.status);
            }
          }

          const localGit = typeof window !== "undefined" ? localStorage.getItem(`ldk_workspace_git_${id}`) || "" : "";
          const localDemo = typeof window !== "undefined" ? localStorage.getItem(`ldk_workspace_demo_${id}`) || "" : "";
          const finalGit = data.github_repo?.trim() || localGit;
          const finalDemo = data.live_demo_url?.trim() || localDemo;

          setGithubRepo(finalGit);
          setLiveDemo(finalDemo);
          setTempGit(finalGit);
          setTempDemo(finalDemo);

          if (typeof window !== "undefined") {
            if (finalGit) localStorage.setItem(`ldk_workspace_git_${id}`, finalGit);
            if (finalDemo) localStorage.setItem(`ldk_workspace_demo_${id}`, finalDemo);
          }

          const dbEventUrl = data.events?.source_url || data.source_url;
          if (dbEventUrl && typeof dbEventUrl === "string" && dbEventUrl.startsWith("http")) {
            setEventMetadata(prev => ({ ...prev, url: dbEventUrl }));
          }
          if (data.events?.title) setEventTitle(data.events.title);

          if (data.notes !== undefined && data.notes !== null) {
            setWorkspaceNotes(data.notes);
            if (typeof window !== "undefined") localStorage.setItem(`ldk_workspace_notes_${id}`, data.notes);
          }
          if (Array.isArray(data.slot_names) && data.slot_names.length === 4) {
            setSlotNames(data.slot_names);
            if (typeof window !== "undefined") localStorage.setItem(`ldk_workspace_slot_names_${id}`, JSON.stringify(data.slot_names));
          }

          // User-scoped dashboard sync
          if (typeof window !== "undefined" && user?.id) {
            try {
              const userJoinedKey = `ldk_joined_workspaces_${user.id}`;
              const joinedStr = localStorage.getItem(userJoinedKey);
              const joinedList: string[] = joinedStr ? JSON.parse(joinedStr) : [];
              if (!joinedList.includes(id)) {
                joinedList.push(id);
                localStorage.setItem(userJoinedKey, JSON.stringify(joinedList));
              }
            } catch {}
          }
        } else if (projectSpaceSettled.status === "fulfilled" && projectSpaceSettled.value.error && user) {
          // Auto-create space if not yet initialized
          const localGit = typeof window !== "undefined" ? localStorage.getItem(`ldk_workspace_git_${id}`) || "" : "";
          const localDemo = typeof window !== "undefined" ? localStorage.getItem(`ldk_workspace_demo_${id}`) || "" : "";
          (async () => {
            try {
              await supabase.from("project_spaces").upsert({
                id: workspaceUuid,
                project_name: projectName || "Shared Workspace",
                github_repo: localGit || githubRepo || null,
                live_demo_url: localDemo || liveDemo || null,
                status: status || "development"
              });
            } catch {}
          })();
        }

        // Process 2: Tasks
        if (tasksSettled.status === "fulfilled" && !tasksSettled.value.error && tasksSettled.value.data && tasksSettled.value.data.length > 0) {
          const formatted: WorkspaceTask[] = tasksSettled.value.data.map(t => ({
            id: t.id,
            title: t.title,
            status: (t.status as any) || "todo",
            priority: (t.priority as any) || "medium",
            scope: (t.scope as any) || "team",
            assignee: t.assigned_to === user?.id ? (user?.user_metadata?.full_name || "You") : "Teammate",
            created_by: t.assigned_to
          }));
          setTasks(formatted);
          if (typeof window !== "undefined") localStorage.setItem(`ldk_workspace_tasks_${id}`, JSON.stringify(formatted));
        }

        // Process 3: Chat Messages
        const savedChatStr = typeof window !== "undefined" ? localStorage.getItem(`ldk_chat_messages_${id}`) : null;
        const savedChatList: ChatMsg[] = savedChatStr ? JSON.parse(savedChatStr) : [];
        let loadedChat: ChatMsg[] = [];

        if (chatSettled.status === "fulfilled" && !chatSettled.value.error && chatSettled.value.data && chatSettled.value.data.length > 0) {
          loadedChat = chatSettled.value.data.map(c => {
            const profile = c.profiles as any;
            let role = "Developer";
            if (profile?.college_key) role = "Faculty";
            else if (profile?.company_key) role = "Recruiter";

            let textContent = c.content;
            let fileUrl = undefined;
            let fileName = undefined;
            let fileType: "image" | "file" | undefined = undefined;
            let fileSize = undefined;

            try {
              if (c.content && c.content.trim().startsWith("{")) {
                const parsed = JSON.parse(c.content);
                if (parsed.file_url || parsed.text !== undefined) {
                  textContent = parsed.text || "";
                  fileUrl = parsed.file_url;
                  fileName = parsed.file_name;
                  fileType = parsed.file_type;
                  fileSize = parsed.file_size;
                }
              }
            } catch {}

            return {
              id: c.id,
              sender_name: profile?.username || "Teammate",
              sender_role: role,
              content: textContent,
              created_at: c.created_at,
              file_url: fileUrl,
              file_name: fileName,
              file_type: fileType,
              file_size: fileSize
            };
          });
        }

        setChatMessages(prev => {
          const combinedChat = [...initialLogs, ...savedChatList, ...prev, ...loadedChat];
          let mergedList: ChatMsg[] = [];
          combinedChat.forEach(m => {
            mergedList = mergeChatMessages(mergedList, m, userUsername);
          });
          if (typeof window !== "undefined") {
            localStorage.setItem(`ldk_chat_messages_${id}`, JSON.stringify(mergedList));
          }
          return mergedList;
        });

        // Process 4: Artifacts
        const savedArtStr = typeof window !== "undefined" ? localStorage.getItem(`ldk_workspace_artifacts_${id}`) : null;
        const savedArtList: Artifact[] = savedArtStr ? JSON.parse(savedArtStr) : [];

        if (artifactsSettled.status === "fulfilled" && !artifactsSettled.value.error && artifactsSettled.value.data && artifactsSettled.value.data.length > 0) {
          const loadedArtifacts: Artifact[] = artifactsSettled.value.data.map(a => ({
            id: a.id,
            slot_index: (a as any).slot_index ?? 0,
            slot_name: (a as any).slot_name || "Artifact",
            file_name: a.file_name,
            file_url: a.file_url,
            version: a.version,
            is_active: a.is_active,
            uploaded_by: (a.profiles as any)?.username || "Teammate",
            created_at: a.created_at
          }));
          const combined = [...loadedArtifacts, ...savedArtList];
          const uniqueMap = new Map<string, Artifact>();
          combined.forEach(a => { if (a && a.id) uniqueMap.set(a.id, a); });
          setArtifacts(Array.from(uniqueMap.values()));
        } else if (savedArtList.length > 0) {
          setArtifacts(savedArtList);
        }

        // Process 5: Credit Applications
        if (creditSettled.status === "fulfilled" && !creditSettled.value.error && creditSettled.value.data) {
          const claim = (creditSettled.value as any).data;
          if (claim && claim.status) {
            setClaimStatus(claim.status);
            if (typeof window !== "undefined") {
              localStorage.setItem(`ldk_workspace_credits_${id}`, claim.status);
            }
          }
        }

        // Process 6: Project Members
        if (membersSettled.status === "fulfilled" && !membersSettled.value.error && membersSettled.value.data && membersSettled.value.data.length > 0) {
          const dbMembers: TeamMember[] = membersSettled.value.data.map((m: any) => {
            const p = m.profiles || {};
            return {
              id: p.id || m.id,
              name: p.full_name || p.username || "Teammate",
              isOnline: false,
              avatarUrl: p.avatar_url || ""
            };
          });

          setRoomMembers(prev => {
            const map = new Map<string, TeamMember>();
            prev.forEach(item => { if (item.id) map.set(item.id, item); });
            dbMembers.forEach(item => {
              const existing = map.get(item.id);
              map.set(item.id, {
                ...item,
                isOnline: existing ? existing.isOnline : false,
                avatarUrl: existing?.avatarUrl || item.avatarUrl
              });
            });
            return Array.from(map.values());
          });
        }
      } catch (err) {
        console.error("Workspace parallel hydration error:", err);
      } finally {
        setIsWorkspaceHydrating(false);
      }
    };

    const safetyTimer = setTimeout(() => {
      setIsWorkspaceHydrating(false);
    }, 5000);

    fetchWorkspaceDetails();
    return () => clearTimeout(safetyTimer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, user, workspaceTrigger, workspaceUuid]);

  // Real-time Chat subscription
  useEffect(() => {
    // Subscribe to chat message inserts & real-time member presence/sync in Supabase for this project space
    const channel = supabase
      .channel(`project_chat:${workspaceUuid}`, {
        config: {
          presence: { key: user?.id || "guest" }
        }
      });

    const syncWorkspacePresences = () => {
      const wsState = channel.presenceState();
      const onlineKeys = new Set(Object.keys(wsState));

      setRoomMembers((prev) => {
        const updated = prev.map((member) => {
          const isOnlineNow = (user?.id && member.id === user.id) || onlineKeys.has(member.id);
          const userPresences = wsState[member.id] as any[];
          let latestStatus = member.customStatus;
          let newName = member.name;
          let newAvatar = member.avatarUrl;

          if (member.id === user?.id) {
            latestStatus = myCustomStatusRef.current || member.customStatus;
          } else if (userPresences && userPresences.length > 0) {
            const pres = userPresences[0];
            if (pres.customStatus) latestStatus = pres.customStatus;
            if (pres.name) newName = pres.name;
            if (pres.avatarUrl) newAvatar = pres.avatarUrl;
          }

          return {
            ...member,
            name: newName,
            avatarUrl: newAvatar || member.avatarUrl,
            isOnline: isOnlineNow,
            customStatus: latestStatus || member.customStatus
          };
        });

        // Dynamically add any online presence users NOT currently in roomMembers list
        const existingIds = new Set(updated.map((m) => m.id));
        onlineKeys.forEach((key) => {
          if (!existingIds.has(key)) {
            const presArray = wsState[key] as any[];
            if (presArray && presArray.length > 0) {
              const pres = presArray[0];
              updated.push({
                id: key,
                name: pres.name || "Collaborator",
                avatarUrl: pres.avatarUrl || "",
                isOnline: true,
                customStatus: pres.customStatus || "Active"
              });
            }
          }
        });

        return updated;
      });
    };

    channel
      .on("presence", { event: "sync" }, syncWorkspacePresences)
      .on("presence", { event: "join" }, syncWorkspacePresences)
      .on("presence", { event: "leave" }, syncWorkspacePresences)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: `project_space_id=eq.${workspaceUuid}`,
        },
        async (payload) => {
          // Skip if this message was sent by the current user (already added optimistically)
          if (payload.new.profile_id === user?.id) return;

          // Fetch sender details
          const { data: profile } = await supabase
            .from("profiles")
            .select("username")
            .eq("id", payload.new.profile_id)
            .maybeSingle();

          let textContent = payload.new.content;
          let fileUrl = undefined;
          let fileName = undefined;
          let fileType: "image" | "file" | undefined = undefined;
          let fileSize = undefined;

          try {
            if (payload.new.content && payload.new.content.trim().startsWith("{")) {
              const parsed = JSON.parse(payload.new.content);
              if (parsed.file_url || parsed.text !== undefined) {
                textContent = parsed.text || "";
                fileUrl = parsed.file_url;
                fileName = parsed.file_name;
                fileType = parsed.file_type;
                fileSize = parsed.file_size;
              }
            }
          } catch {}

          const incomingMsg: ChatMsg = {
            id: payload.new.id,
            sender_name: profile?.username || "Teammate",
            sender_role: "Developer",
            content: textContent,
            created_at: payload.new.created_at,
            file_url: fileUrl,
            file_name: fileName,
            file_type: fileType,
            file_size: fileSize
          };

          setChatMessages((prev) => {
            const updated = mergeChatMessages(prev, incomingMsg, userUsername);
            localStorage.setItem(`ldk_chat_messages_${id}`, JSON.stringify(updated));
            return updated;
          });
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "project_spaces",
          filter: `id=eq.${workspaceUuid}`,
        },
        (payload) => {
          if (payload.new && payload.new.status) {
            setStatus(payload.new.status);
            if (typeof window !== "undefined") {
              localStorage.setItem(`ldk_workspace_status_${id}`, payload.new.status);
            }
          }
          if (payload.new && payload.new.project_name) {
            setProjectName(payload.new.project_name);
            if (typeof window !== "undefined") {
              localStorage.setItem(`ldk_workspace_name_${id}`, payload.new.project_name);
            }
          }
        }
      )
      .on(
        "broadcast",
        { event: "chat_message" },
        (payload) => {
          const incoming = payload.payload;
          if (incoming && incoming.id) {
            setChatMessages((prev) => {
              const updated = mergeChatMessages(prev, incoming, userUsername);
              localStorage.setItem(`ldk_chat_messages_${id}`, JSON.stringify(updated));
              return updated;
            });
          }
        }
      )
      .on(
        "broadcast",
        { event: "workspace_sync" },
        (payload) => {
          const sync = payload.payload;
          if (!sync) return;
          const action = sync.action;
          const data = sync.data || sync;

          if (action === "links") {
            const git = data.githubRepo || data.github_repo;
            const demo = data.liveDemo || data.live_demo_url;
            if (git) {
              setGithubRepo(git);
              if (typeof window !== "undefined") localStorage.setItem(`ldk_workspace_git_${id}`, git);
            }
            if (demo) {
              setLiveDemo(demo);
              if (typeof window !== "undefined") localStorage.setItem(`ldk_workspace_demo_${id}`, demo);
            }
          } else if (action === "tasks" && Array.isArray(data)) {
            setTasks(data);
            localStorage.setItem(`ldk_workspace_tasks_${id}`, JSON.stringify(data));
          } else if (action === "notes" && typeof data === "string") {
            setWorkspaceNotes(data);
            localStorage.setItem(`ldk_workspace_notes_${id}`, data);
          } else if (action === "artifacts" && Array.isArray(data)) {
            setArtifacts(data);
            localStorage.setItem(`ldk_workspace_artifacts_${id}`, JSON.stringify(data));
          } else if (action === "status" && typeof data === "string") {
            setStatus(data as any);
            if (typeof window !== "undefined") {
              localStorage.setItem(`ldk_workspace_status_${id}`, data);
            }
          } else if (action === "credits" && typeof data === "string") {
            setClaimStatus(data as any);
          } else if (action === "name" && (data.projectName || data.name)) {
            const newName = data.projectName || data.name;
            setProjectName(newName);
            if (typeof window !== "undefined") {
              localStorage.setItem(`ldk_workspace_name_${id}`, newName);
            }
          } else if (action === "call_presence" && data) {
            setIsCallActiveInRoom(!!data.active);
            if (data.callerName) setCallCallerName(data.callerName);
          }
        }
      )
      .on(
        "broadcast",
        { event: "member_joined" },
        (payload) => {
          const newMember = payload.payload;
          if (newMember && newMember.id && newMember.id !== user?.id) {
            let isAlreadyMember = false;
            setRoomMembers((prev) => {
              isAlreadyMember = prev.some((m) => m.id === newMember.id);
              if (isAlreadyMember) {
                return prev.map((m) => (m.id === newMember.id ? { ...m, isOnline: true, avatarUrl: newMember.avatarUrl || m.avatarUrl } : m));
              }
              const updated = [
                ...prev,
                {
                  id: newMember.id,
                  name: newMember.name,
                  avatarUrl: newMember.avatarUrl || "",
                  isOnline: true
                }
              ];
              localStorage.setItem(`ldk_workspace_members_${id}`, JSON.stringify(updated));
              return updated;
            });

            // Only post "joined" system chat message if this is a genuine first-time join event
            if (newMember.isNewJoin === true && !isAlreadyMember) {
              setChatMessages((prev) => {
                const noticeId = `sys_rt_${newMember.id}`;
                if (prev.some((m) => m.id === noticeId)) return prev;
                const updated = [
                  ...prev,
                  {
                    id: noticeId,
                    sender_name: "LDK:BOT",
                    sender_role: "SYSTEM",
                    content: `${newMember.name} joined the shared workspace!`,
                    created_at: new Date().toISOString(),
                    isSystem: true
                  }
                ];
                localStorage.setItem(`ldk_chat_messages_${id}`, JSON.stringify(updated));
                return updated;
              });
            }
          }
        }
      )
      .on(
        "broadcast",
        { event: "member_left" },
        (payload) => {
          const leftData = payload.payload;
          const leftUserId = leftData?.userId || leftData?.id;
          const leftUserName = leftData?.userName || "Teammate";
          if (leftUserId) {
            setRoomMembers((prev) => {
              const updated = prev.filter((m) => m.id !== leftUserId);
              localStorage.setItem(`ldk_workspace_members_${id}`, JSON.stringify(updated));
              return updated;
            });

            // Clear left user from sent invites list
            setSentInviteIds((prev) => {
              const cleanList = prev.filter((fid) => fid !== leftUserId);
              localStorage.setItem(`ldk_sent_invites_${id}`, JSON.stringify(cleanList));
              return cleanList;
            });

            // Post system chat notice
            setChatMessages((prev) => {
              const noticeId = `sys_left_${leftUserId}_${Date.now()}`;
              const updated = [
                ...prev,
                {
                  id: noticeId,
                  sender_name: "LDK:BOT",
                  sender_role: "SYSTEM",
                  content: `${leftUserName} left the shared workspace.`,
                  created_at: new Date().toISOString(),
                  isSystem: true
                }
              ];
              localStorage.setItem(`ldk_chat_messages_${id}`, JSON.stringify(updated));
              return updated;
            });
          }
        }
      )
      .on(
        "broadcast",
        { event: "presence_ping" },
        (payload) => {
          const ping = payload.payload;
          if (ping && ping.id) {
            setRoomMembers((prev) => {
              const exists = prev.some((m) => m.id === ping.id);
              if (exists) {
                return prev.map((m) => (m.id === ping.id ? { 
                  ...m, 
                  isOnline: !!ping.isOnline, 
                  avatarUrl: (ping.avatarUrl && typeof ping.avatarUrl === "string" && ping.avatarUrl.trim().length > 0) ? ping.avatarUrl : m.avatarUrl 
                } : m));
              }
              return [
                ...prev,
                {
                  id: ping.id,
                  name: ping.name || "Collaborator",
                  avatarUrl: ping.avatarUrl || "",
                  isOnline: true
                }
              ];
            });
          }
        }
      )
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED" && user) {
          const myName = user.user_metadata?.full_name || user.email?.split("@")[0] || "Collaborator";
          const currentStatus = myCustomStatus || "Active";
          const myAvatar = getBestAvatarUrl(user);

          // 1. Update profiles table updated_at so Dashboard Active Co-Workers knows user is online right now
          try {
            await supabase.from("profiles").update({ updated_at: new Date().toISOString() }).eq("id", user.id);
          } catch {}
          
          // 2. Track presence on Supabase Realtime Server
          try {
            await channel.track({
              id: user.id,
              name: myName,
              avatarUrl: myAvatar,
              customStatus: currentStatus,
              online_at: new Date().toISOString()
            });
          } catch {}

          // 3. Persist presence row in database via server API route
          if (workspaceUuid) {
            fetch("/api/workspace/presence", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                workspaceId: workspaceUuid,
                userId: user.id,
                statusText: currentStatus,
                isOnline: true
              })
            }).catch(() => {});
          }

          // 4. Send member_joined and presence_ping broadcasts
          try {
            channel.send({
              type: "broadcast",
              event: "member_joined",
              payload: { id: user.id, name: myName, avatarUrl: myAvatar }
            });
            channel.send({
              type: "broadcast",
              event: "presence_ping",
              payload: { id: user.id, name: myName, avatarUrl: myAvatar, isOnline: true }
            });
          } catch {}
        }
      });

    activeChannelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
      activeChannelRef.current = null;
    };
  }, [id, user, workspaceUuid]);

  // Scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMsg.trim() && !chatAttachment) return;

    // Safety & Anti-Harassment Screening
    if (newMsg.trim()) {
      const modCheck = isHarassmentOrOffensive(newMsg);
      if (!modCheck.safe) {
        showToast(modCheck.reason || "Message flagged for inappropriate content.", "error");
        return;
      }
    }

    setIsUploadingChatFile(true);
    let attachedFileUrl = "";
    let attachedFileName = "";
    let attachedFileType: "image" | "file" | undefined = undefined;
    let attachedFileSize = "";

    if (chatAttachment) {
      attachedFileName = chatAttachment.name;
      attachedFileType = chatAttachment.type;
      attachedFileSize = chatAttachment.sizeStr;

      const readFileAsDataUrl = (f: File): Promise<string> => {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "");
          reader.onerror = () => resolve("");
          reader.readAsDataURL(f);
        });
      };

      const dataUrl = await readFileAsDataUrl(chatAttachment.file);
      attachedFileUrl = dataUrl || chatAttachment.previewUrl || "#";

      if (user && id !== "e1" && id !== "e2") {
        try {
          const fileExt = chatAttachment.file.name.split(".").pop();
          const fileName = `chat_${id}_${getUniqueId("chat")}.${fileExt}`;
          const uploadData = new FormData();
          uploadData.append("file", chatAttachment.file);
          uploadData.append("bucket", "project-vaults");
          uploadData.append("path", fileName);

          const uploadRes = await fetch("/api/upload", {
            method: "POST",
            body: uploadData
          });

          if (uploadRes.ok) {
            const resJson = await uploadRes.json();
            if (resJson?.publicUrl) {
              attachedFileUrl = resJson.publicUrl;
            }
          }
        } catch {}
      }
    }

    const myName = userUsername || user?.user_metadata?.username || user?.user_metadata?.full_name || user?.email?.split("@")[0] || "You";
    const localMsg: ChatMsg = {
      id: getUniqueId("msg"),
      sender_name: myName,
      sender_role: "Collaborator",
      content: newMsg.trim(),
      created_at: new Date().toISOString(),
      file_url: attachedFileUrl || undefined,
      file_name: attachedFileName || undefined,
      file_type: attachedFileType,
      file_size: attachedFileSize || undefined,
    };

    // 1. Update state locally first & save to persistent localStorage
    setChatMessages((prev) => {
      const updated = [...prev, localMsg];
      localStorage.setItem(`ldk_chat_messages_${id}`, JSON.stringify(updated));
      return updated;
    });
    setNewMsg("");
    setChatAttachment(null);
    setIsUploadingChatFile(false);
    if (chatFileInputRef.current) chatFileInputRef.current.value = "";

    // 2. Broadcast message over Supabase WebSocket channel
    if (activeChannelRef.current) {
      try {
        activeChannelRef.current.send({
          type: "broadcast",
          event: "chat_message",
          payload: localMsg
        });
      } catch (err) {
        console.warn("WebSocket broadcast chat message error: ", err);
      }
    }

    // 3. Broadcast message over browser BroadcastChannel for instant same-origin tab sync
    broadcastLocalEvent("chat_message", localMsg);

    // 4. Send to Supabase DB if user session exists and valid UUID workspace
    if (user && workspaceUuid) {
      try {
        let dbContent = localMsg.content;
        if (localMsg.file_url) {
          dbContent = JSON.stringify({
            text: localMsg.content || "",
            file_url: localMsg.file_url,
            file_name: localMsg.file_name,
            file_type: localMsg.file_type,
            file_size: localMsg.file_size
          });
        }

        await supabase.from("chat_messages").insert({
          project_space_id: workspaceUuid,
          profile_id: user.id,
          content: dbContent,
        });
      } catch (err) {
        console.error("Failed to sync chat message to DB: ", err);
      }
    }
  };

  // Bind local/remote streams to video tags
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  // WebRTC Implementation
  const cleanUpCall = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }
    setLocalStream(null);

    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    setRemoteStream(null);

    if (signalingChannelRef.current) {
      signalingChannelRef.current.unsubscribe();
      signalingChannelRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      cleanUpCall();
    };
  }, []);

  // Sync local tracks with mute/video state changes
  useEffect(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach(track => {
        track.enabled = !isMuted;
      });
      localStreamRef.current.getVideoTracks().forEach(track => {
        track.enabled = isVideoOn;
      });

      // Seamlessly update video/audio tracks on active RTCRtpSenders without disconnecting call
      if (peerConnectionRef.current) {
        const senders = peerConnectionRef.current.getSenders();
        const videoTrack = localStreamRef.current.getVideoTracks()[0];
        const videoSender = senders.find(s => s.track?.kind === "video");
        if (videoSender && videoTrack) {
          videoSender.replaceTrack(isVideoOn ? videoTrack : null).catch(() => {});
        }
        const audioTrack = localStreamRef.current.getAudioTracks()[0];
        const audioSender = senders.find(s => s.track?.kind === "audio");
        if (audioSender && audioTrack) {
          audioSender.replaceTrack(!isMuted ? audioTrack : null).catch(() => {});
        }
      }

      if (signalingChannelRef.current) {
        try {
          signalingChannelRef.current.send({
            type: "broadcast",
            event: "media-state",
            payload: { 
              from: userSessionIdRef.current, 
              isMuted, 
              isVideoOn 
            }
          });
        } catch {}
      }
    }
  }, [isMuted, isVideoOn]);

  const createPeerConnection = (channel: any, peerSessionId: string) => {
    if (peerConnectionRef.current) {
      try {
        peerConnectionRef.current.close();
      } catch {}
    }

    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
        { urls: "stun:stun2.l.google.com:19302" }
      ]
    });

    peerConnectionRef.current = pc;

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        pc.addTrack(track, localStreamRef.current!);
      });
    }

    pc.ontrack = (event) => {
      if (event.streams && event.streams[0]) {
        setRemoteStream(event.streams[0]);
      } else if (event.track) {
        const inboundStream = new MediaStream([event.track]);
        setRemoteStream(inboundStream);
      }
    };

    pc.onicecandidate = (event) => {
      if (event.candidate && channel) {
        try {
          channel.send({
            type: "broadcast",
            event: "ice-candidate",
            payload: { 
              candidate: event.candidate, 
              from: userSessionIdRef.current,
              target: peerSessionId
            }
          });
        } catch {}
      }
    };

    return pc;
  };

  const handleJoinRoom = async () => {
    const nextInRoom = !inRoom;
    setInRoom(nextInRoom);

    if (nextInRoom) {
      const myName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "You";

      setIsCallActiveInRoom(true);
      setCallCallerName(myName);
      localStorage.setItem(`ldk_active_call_${id}`, JSON.stringify({ active: true, callerName: myName }));

      // Broadcast call_presence to all active workspace teammates
      if (activeChannelRef.current) {
        try {
          activeChannelRef.current.send({
            type: "broadcast",
            event: "workspace_sync",
            payload: { action: "call_presence", active: true, callerName: myName }
          });
        } catch {}
      }
      broadcastLocalEvent("call_presence", { active: true, callerName: myName });

      // Post system notice to chat section & broadcast to all teammates
      const callNotice: ChatMsg = {
        id: getUniqueId("sys_call"),
        sender_name: "LDK:BOT",
        sender_role: "SYSTEM",
        content: `${myName} joined the call.`,
        created_at: new Date().toISOString(),
        isSystem: true
      };

      setChatMessages(prev => {
        const updated = [...prev, callNotice];
        localStorage.setItem(`ldk_chat_messages_${id}`, JSON.stringify(updated));
        return updated;
      });

      if (activeChannelRef.current) {
        try {
          activeChannelRef.current.send({
            type: "broadcast",
            event: "chat_message",
            payload: callNotice
          });
        } catch {}
      }
      broadcastLocalEvent("chat_message", callNotice);
      
      setRoomMembers(prev => [
        ...prev,
        { id: "user-session", name: myName, role: "You", isOnline: true, isSpeaking: false }
      ]);

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: true
        });

        localStreamRef.current = stream;
        setLocalStream(stream);

        stream.getAudioTracks().forEach(t => t.enabled = !isMuted);
        stream.getVideoTracks().forEach(t => t.enabled = isVideoOn);

        const channel = supabase.channel(`webrtc-call-${id}`);
        signalingChannelRef.current = channel;

        channel.on("broadcast", { event: "join" }, async ({ payload }) => {
          if (payload.from !== userSessionIdRef.current) {
            setRemoteName(payload.senderName);
            setRemoteIsMuted(payload.isMuted);
            setRemoteIsVideoOn(payload.isVideoOn);

            // Add remote participant to local UI list
            setRoomMembers(prev => {
              if (prev.some(m => m.id === payload.from)) return prev;
              return [
                ...prev,
                { id: payload.from, name: payload.senderName, role: "Classmate", isOnline: true, isSpeaking: false }
              ];
            });

            const pc = createPeerConnection(channel, payload.from);
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);

            channel.send({
              type: "broadcast",
              event: "offer",
              payload: { 
                sdp: offer, 
                from: userSessionIdRef.current, 
                senderName: myName,
                target: payload.from
              }
            });
          }
        });

        channel.on("broadcast", { event: "offer" }, async ({ payload }) => {
          if (payload.from !== userSessionIdRef.current && payload.target === userSessionIdRef.current) {
            setRemoteName(payload.senderName);
            
            // Add remote participant to local UI list if not already present
            setRoomMembers(prev => {
              if (prev.some(m => m.id === payload.from)) return prev;
              return [
                ...prev,
                { id: payload.from, name: payload.senderName, role: "Classmate", isOnline: true, isSpeaking: false }
              ];
            });

            const pc = createPeerConnection(channel, payload.from);
            await pc.setRemoteDescription(new RTCSessionDescription(payload.sdp));
            
            // Drain buffered ICE candidates after setting remote description
            while (iceCandidatesQueueRef.current.length > 0) {
              const cand = iceCandidatesQueueRef.current.shift();
              if (cand && pc) {
                try {
                  await pc.addIceCandidate(new RTCIceCandidate(cand));
                } catch {}
              }
            }

            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);

            channel.send({
              type: "broadcast",
              event: "answer",
              payload: { 
                sdp: answer, 
                from: userSessionIdRef.current,
                target: payload.from
              }
            });
          }
        });

        channel.on("broadcast", { event: "answer" }, async ({ payload }) => {
          if (payload.from !== userSessionIdRef.current && payload.target === userSessionIdRef.current) {
            if (peerConnectionRef.current) {
              await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(payload.sdp));
              
              // Drain buffered ICE candidates after setting remote description
              while (iceCandidatesQueueRef.current.length > 0) {
                const cand = iceCandidatesQueueRef.current.shift();
                if (cand && peerConnectionRef.current) {
                  try {
                    await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(cand));
                  } catch {}
                }
              }
            }
          }
        });

        channel.on("broadcast", { event: "ice-candidate" }, async ({ payload }) => {
          if (payload.from !== userSessionIdRef.current && payload.target === userSessionIdRef.current) {
            if (peerConnectionRef.current && peerConnectionRef.current.remoteDescription) {
              try {
                await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(payload.candidate));
              } catch {}
            } else {
              iceCandidatesQueueRef.current.push(payload.candidate);
            }
          }
        });

        channel.on("broadcast", { event: "media-state" }, ({ payload }) => {
          if (payload.from !== userSessionIdRef.current) {
            setRemoteIsMuted(payload.isMuted);
            setRemoteIsVideoOn(payload.isVideoOn);
          }
        });

        channel.on("broadcast", { event: "leave" }, ({ payload }) => {
          if (payload.from !== userSessionIdRef.current) {
            setRemoteStream(null);
            if (peerConnectionRef.current) {
              try {
                peerConnectionRef.current.close();
              } catch {}
              peerConnectionRef.current = null;
            }
            setRoomMembers(prev => prev.filter(m => m.id !== payload.from));
          }
        });

        channel.subscribe(async (status) => {
          if (status === "SUBSCRIBED") {
            channel.send({
              type: "broadcast",
              event: "join",
              payload: { 
                from: userSessionIdRef.current, 
                senderName: myName,
                isMuted,
                isVideoOn
              }
            });
          }
        });

      } catch {}
    } else {
      setIsCallActiveInRoom(false);
      localStorage.removeItem(`ldk_active_call_${id}`);

      if (activeChannelRef.current) {
        try {
          activeChannelRef.current.send({
            type: "broadcast",
            event: "workspace_sync",
            payload: { action: "call_presence", active: false }
          });
        } catch {}
      }
      broadcastLocalEvent("call_presence", { active: false });

      if (signalingChannelRef.current) {
        try {
          signalingChannelRef.current.send({
            type: "broadcast",
            event: "leave",
            payload: { from: userSessionIdRef.current }
          });
        } catch {}
      }

      cleanUpCall();
      const myName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "You";
      const leaveNotice: ChatMsg = {
        id: getUniqueId("sys_leave"),
        sender_name: "LDK:BOT",
        sender_role: "SYSTEM",
        content: `${myName} left the call.`,
        created_at: new Date().toISOString(),
        isSystem: true
      };

      setChatMessages(prev => {
        const updated = [...prev, leaveNotice];
        localStorage.setItem(`ldk_chat_messages_${id}`, JSON.stringify(updated));
        return updated;
      });

      if (activeChannelRef.current) {
        try {
          activeChannelRef.current.send({
            type: "broadcast",
            event: "chat_message",
            payload: leaveNotice
          });
        } catch {}
      }
      broadcastLocalEvent("chat_message", leaveNotice);

      setRoomMembers(prev => prev.filter(member => member.id !== "user-session"));
      setIsMuted(false);
      setIsVideoOn(false);
      setRemoteIsVideoOn(false);
      setRemoteIsMuted(false);
    }
  };

  // Artifact file upload simulation

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];

    setIsUploading(true);

    const myName = user?.email?.split("@")[0] || "You";
    const slotIdx = targetUploadSlot;
    const slotName = slotNames[slotIdx] || `Slot ${slotIdx + 1}`;

    const slotArtifacts = artifacts.filter(a => a.slot_index === slotIdx || a.slot_name === slotName);
    const currentHighestVersion = slotArtifacts.reduce((max, a) => Math.max(max, a.version), 0);
    const nextVersion = currentHighestVersion + 1;

    const readFileAsDataUrl = (f: File): Promise<string> => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "");
        reader.onerror = () => resolve("");
        reader.readAsDataURL(f);
      });
    };

    const dataUrl = await readFileAsDataUrl(file);
    let fileUrl = dataUrl || "#";
    try {
      if (!fileUrl || fileUrl === "#") {
        fileUrl = URL.createObjectURL(file);
      }
    } catch {}

    // If user logged in and not mock workspace
    if (user && id !== "e1" && id !== "e2") {
      try {
        const fileExt = file.name.split(".").pop();
        const fileName = `${id}/${getUniqueId("file")}.${fileExt}`;
        const filePath = `project_artifacts/${fileName}`;
        
        // Try uploading to "project-vaults" bucket
        const { error: uploadError } = await supabase.storage
          .from("project-vaults")
          .upload(filePath, file, {
            cacheControl: "3600",
            upsert: true,
          });

        if (!uploadError) {
          const { data: urlData } = supabase.storage
            .from("project-vaults")
            .getPublicUrl(filePath);
          if (urlData?.publicUrl) {
            fileUrl = urlData.publicUrl;
          }
        } else {
          console.warn("Storage bucket upload failed, using persistent Data URL fallback: ", uploadError);
        }

        // Insert into project_artifacts table regardless of storage bucket result
        const { error: dbError } = await supabase
          .from("project_artifacts")
          .insert({
            project_space_id: workspaceUuid,
            slot_index: slotIdx,
            slot_name: slotName,
            file_name: file.name,
            file_url: fileUrl,
            version: nextVersion,
            is_active: true,
            uploaded_by: user.id
          });

        if (dbError) {
          console.error("DB Artifact insert error: ", dbError);
        }
      } catch (err) {
        console.error("Supabase Storage error: ", err);
      }
    }

    // Update state locally
    setArtifacts(prev => {
      const deactivated = prev.map(art => {
        if (art.slot_index === slotIdx || art.slot_name === slotName) {
          return { ...art, is_active: false };
        }
        return art;
      });

      const newArtifact: Artifact = {
        id: getUniqueId("art"),
        slot_index: slotIdx,
        slot_name: slotName,
        file_name: file.name,
        file_url: fileUrl,
        version: nextVersion,
        is_active: true,
        uploaded_by: myName,
        created_at: new Date().toISOString()
      };

      const updated = [newArtifact, ...deactivated];
      localStorage.setItem(`ldk_workspace_artifacts_${id}`, JSON.stringify(updated));

      if (activeChannelRef.current) {
        try {
          activeChannelRef.current.send({
            type: "broadcast",
            event: "workspace_sync",
            payload: { action: "artifacts", data: updated }
          });
        } catch {}
      }
      broadcastLocalEvent("artifacts_update", updated);

      return updated;
    });

    // Auto-post notification message in chat
    const systemNotice: ChatMsg = {
      id: getUniqueId("sys"),
      sender_name: "LDK:BOT",
      sender_role: "SYSTEM",
      content: `${myName} uploaded artifact: ${file.name} (v${nextVersion})`,
      created_at: new Date().toISOString(),
      isSystem: true
    };
    setChatMessages(prev => [...prev, systemNotice]);

    // Save chat message notice to database
    if (user && workspaceUuid) {
      try {
        await supabase.from("chat_messages").insert({
          project_space_id: workspaceUuid,
          profile_id: user.id,
          content: `Uploaded artifact: ${file.name} (v${nextVersion})`
        });
      } catch (chatErr) {
        console.error("Failed to insert system upload message: ", chatErr);
      }
    }

    setIsUploading(false);
  };

  const formatUrl = (url: string) => {
    if (!url) return "";
    let clean = url.trim();
    if (!/^https?:\/\//i.test(clean)) {
      clean = `https://${clean}`;
    }
    return clean;
  };

  const handleClaimCredits = async () => {
    setIsSubmittingClaim(true);
    setClaimStatus("pending");
    if (typeof window !== "undefined") {
      localStorage.setItem(`ldk_workspace_credits_${id}`, "pending");
    }

    if (activeChannelRef.current) {
      try {
        activeChannelRef.current.send({
          type: "broadcast",
          event: "workspace_sync",
          payload: { action: "credits", data: "pending" }
        });
      } catch {}
    }

    broadcastLocalEvent("credits_update", "pending");
    
    // Default fallback mock response
    if (!user || id === "e1" || id === "e2") {
      setTimeout(() => {
        setIsSubmittingClaim(false);
      }, 500);
      return;
    }

    try {
      // 1. Submit claim to credit_applications table
      const { error } = await supabase
        .from("credit_applications")
        .insert({
          project_space_id: workspaceUuid,
          student_id: user.id,
          credit_points: 10,
          status: "pending"
        });

      if (!error) {
        setClaimStatus("pending");
        // Post system message in chat
        const systemNotice: ChatMsg = {
          id: getUniqueId("sys"),
          sender_name: "LDK:BOT",
          sender_role: "SYSTEM",
          content: `${user.email?.split("@")[0]} submitted an academic credit claim (10 pts).`,
          created_at: new Date().toISOString(),
          isSystem: true
        };
        setChatMessages(prev => [...prev, systemNotice]);

        const { error: chatErr } = await supabase.from("chat_messages").insert({
          project_space_id: workspaceUuid,
          profile_id: user.id,
          content: `Submitted academic credit claim for this project space.`
        });
        if (chatErr) {
          console.error("Supabase claim chat insert error: ", chatErr);
        }
        setMessage({ text: "Academic credit claim submitted successfully!", type: "success" });
      } else {
        console.error("Supabase claim submission error: ", error);
        setMessage({ text: "Failed to submit claim. Make sure you are registered to this project space.", type: "error" });
      }
    } catch (e) {
      console.error("Claim credits connection error: ", e);
    } finally {
      setIsSubmittingClaim(false);
    }
  };

  const handleSendDirectInvite = async (friendId: string, friendName: string) => {
    setInvitingFriendId(friendId);
    try {
      // Direct invite builds a notification with an accept actionUrl link
      const targetUrl = `/workspace/${id}?acceptInvite=${friendId}&friendName=${encodeURIComponent(friendName)}`;
      
      if (user?.id) {
        await fetch("/api/notifications/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            recipientId: friendId,
            senderId: user.id,
            title: "Workspace Invite",
            message: `${user?.user_metadata?.full_name || user?.user_metadata?.username || "A classmate"} has invited you to collaborate on the project workspace "${projectName || id}".`,
            actionUrl: targetUrl,
            type: "invite"
          })
        });
      }

      const recipientKey = `ldk_user_notifications_${friendId}`;
      const notifStored = localStorage.getItem(recipientKey);
      const notifList = notifStored ? JSON.parse(notifStored) : [];
      
      const alreadyInvited = notifList.some(
        (n: any) => n.actionUrl === targetUrl && !n.read
      );

      if (!alreadyInvited) {
        const uniqueInviteId = typeof crypto !== "undefined" && crypto.randomUUID ? `n_invite_${crypto.randomUUID()}` : `n_invite_${friendId}_${notifList.length + 1}`;
        notifList.unshift({
          id: uniqueInviteId,
          recipientId: friendId,
          senderId: user?.id,
          title: "Workspace Invite",
          message: `${user?.user_metadata?.full_name || user?.user_metadata?.username || "A classmate"} has invited you to collaborate on the project workspace "${projectName || id}".`,
          type: "invite",
          category: "alerts",
          time: "Just now",
          read: false,
          actionLabel: "Accept Invite",
          actionUrl: targetUrl
        });
        localStorage.setItem(recipientKey, JSON.stringify(notifList.slice(0, 100)));
        window.dispatchEvent(new Event("ldk_notifications_update"));
      }

      // Update sent invites state and persist to local storage
      setSentInviteIds(prev => {
        const updated = [...prev, friendId];
        localStorage.setItem(`ldk_sent_invites_${id}`, JSON.stringify(updated));
        return updated;
      });

      setMessage({ text: `Invite sent to ${friendName}! Waiting for them to accept.`, type: "success" });
    } catch (e) {
      console.error(e);
      setMessage({ text: `Failed to invite ${friendName}.`, type: "error" });
    } finally {
      setInvitingFriendId(null);
    }
  };

  const copyInviteLink = () => {
    const inviteUrl = `${window.location.origin}/workspace/${id}?join=true`;
    navigator.clipboard.writeText(inviteUrl);
    setCopiedLink(true);
    showToast("Workspace invite link copied to clipboard");
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const [gitUrlError, setGitUrlError] = useState<string | null>(null);
  const [demoUrlError, setDemoUrlError] = useState<string | null>(null);

  const saveGitRepo = async () => {
    const rawInput = tempGit.trim();
    if (!rawInput) {
      setGitUrlError("Please enter a GitHub repository or profile URL");
      return;
    }
    const cleanGit = formatUrl(rawInput);
    setGitUrlError(null);
    setGithubRepo(cleanGit);
    setIsEditingGit(false);

    if (typeof window !== "undefined") {
      localStorage.setItem(`ldk_workspace_git_${id}`, cleanGit);
    }
    if (activeChannelRef.current) {
      try {
        activeChannelRef.current.send({
          type: "broadcast",
          event: "workspace_sync",
          payload: { action: "links", githubRepo: cleanGit, liveDemo }
        });
      } catch {}
    }
    broadcastLocalEvent("links_update", { githubRepo: cleanGit, liveDemo });

    if (user && workspaceUuid) {
      try {
        const { data: existing } = await supabase
          .from("project_spaces")
          .select("id")
          .or(`id.eq.${workspaceUuid},id.eq.${id}`)
          .maybeSingle();

        if (existing) {
          await supabase
            .from("project_spaces")
            .update({ github_repo: cleanGit })
            .eq("id", existing.id);
        } else {
          await supabase
            .from("project_spaces")
            .upsert({
              id: workspaceUuid,
              github_repo: cleanGit,
              project_name: projectName || "Shared Workspace",
              status: status || "development"
            });
        }
      } catch (err) {
        console.error("Failed to save git repo: ", err);
      }
    }
  };

  const saveLiveDemo = async () => {
    const rawInput = tempDemo.trim();
    if (!rawInput) {
      setLiveDemo("");
      setDemoUrlError(null);
      setIsEditingDemo(false);
      if (typeof window !== "undefined") {
        localStorage.removeItem(`ldk_workspace_demo_${id}`);
      }
      if (activeChannelRef.current) {
        try {
          activeChannelRef.current.send({
            type: "broadcast",
            event: "workspace_sync",
            payload: { action: "links", githubRepo, liveDemo: "" }
          });
        } catch {}
      }
      broadcastLocalEvent("links_update", { githubRepo, liveDemo: "" });
      if (user && workspaceUuid) {
        try {
          await supabase
            .from("project_spaces")
            .update({ live_demo_url: null })
            .eq("id", workspaceUuid);
        } catch (err) {
          console.error("Failed to clear live demo: ", err);
        }
      }
      return;
    }

    const urlPattern = /^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z0-9]{2,}(:\d+)?(\/.*)?$/i;
    const localhostPattern = /^(https?:\/\/)?localhost(:\d+)?(\/.*)?$/i;
    if (!urlPattern.test(rawInput) && !localhostPattern.test(rawInput)) {
      setDemoUrlError("Please enter a valid URL (e.g. https://my-app.vercel.app or localhost:3000)");
      return;
    }

    const cleanDemo = formatUrl(rawInput);
    setDemoUrlError(null);
    setLiveDemo(cleanDemo);
    setIsEditingDemo(false);

    if (typeof window !== "undefined") {
      localStorage.setItem(`ldk_workspace_demo_${id}`, cleanDemo);
    }
    if (activeChannelRef.current) {
      try {
        activeChannelRef.current.send({
          type: "broadcast",
          event: "workspace_sync",
          payload: { action: "links", githubRepo, liveDemo: cleanDemo }
        });
      } catch {}
    }
    broadcastLocalEvent("links_update", { githubRepo, liveDemo: cleanDemo });

    if (user && workspaceUuid) {
      try {
        const { data: existing } = await supabase
          .from("project_spaces")
          .select("id")
          .eq("id", workspaceUuid)
          .maybeSingle();

        if (existing) {
          await supabase
            .from("project_spaces")
            .update({ live_demo_url: cleanDemo })
            .eq("id", workspaceUuid);
        } else {
          await supabase
            .from("project_spaces")
            .insert({
              id: workspaceUuid,
              live_demo_url: cleanDemo,
              project_name: projectName || "Shared Workspace",
              status: status || "development"
            });
        }
      } catch (err) {
        console.error("Failed to save live demo: ", err);
      }
    }
  };

  const saveProjectName = async () => {
    if (!tempName || !tempName.trim()) return;
    const cleanName = tempName.trim();
    setProjectName(cleanName);
    setIsEditingName(false);

    localStorage.setItem(`ldk_workspace_name_${id}`, cleanName);

    if (typeof window !== "undefined") {
      try {
        const eventsStr = localStorage.getItem("ldk_events");
        const eventsList: any[] = eventsStr ? JSON.parse(eventsStr) : [];
        const idx = eventsList.findIndex(e => e.id === id);
        if (idx >= 0) {
          eventsList[idx].title = cleanName;
        } else {
          eventsList.unshift({
            id,
            title: cleanName,
            deadline: "Ongoing",
            location: "online",
            level: "global",
            url: `/workspace/${id}`,
            status: status || "development",
            stages: ["Ideation", "Development", "Final Submission"]
          });
        }
        localStorage.setItem("ldk_events", JSON.stringify(eventsList));
        window.dispatchEvent(new Event("ldk_events_update"));
        window.dispatchEvent(new Event("storage"));
      } catch {}
    }

    if (activeChannelRef.current) {
      try {
        activeChannelRef.current.send({
          type: "broadcast",
          event: "workspace_sync",
          payload: { action: "name", projectName: cleanName }
        });
      } catch {}
    }

    broadcastLocalEvent("name_update", cleanName);

    if (workspaceUuid) {
      try {
        await fetch("/api/workspace/rename", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            workspaceId: workspaceUuid,
            projectName: cleanName
          })
        });
      } catch (err) {
        console.error("Failed updating workspace name in db via API", err);
      }
    }
  };

  const fetchCommits = useCallback(async () => {
    if (!githubRepo || !githubRepo.trim()) {
      setCommits([]);
      if (typeof window !== "undefined") {
        localStorage.removeItem(`ldk_workspace_commits_${id}`);
      }
      return;
    }
    try {
      const res = await fetch(`/api/github/commits?repoUrl=${encodeURIComponent(githubRepo)}`);
      const data = await res.json();
      if (res.ok && Array.isArray(data?.commits) && data.commits.length > 0) {
        setCommits(data.commits);
        if (typeof window !== "undefined") {
          localStorage.setItem(`ldk_workspace_commits_${id}`, JSON.stringify(data.commits));
        }
      } else {
        setCommits([]);
        if (typeof window !== "undefined") {
          localStorage.removeItem(`ldk_workspace_commits_${id}`);
        }
      }
    } catch {
      setCommits([]);
      if (typeof window !== "undefined") {
        localStorage.removeItem(`ldk_workspace_commits_${id}`);
      }
    }
  }, [githubRepo, id]);

  const fetchGitLanguages = useCallback(async () => {
    if (!githubRepo || !githubRepo.trim()) {
      setGitLanguages([]);
      if (typeof window !== "undefined") {
        localStorage.removeItem(`ldk_workspace_langs_${id}`);
      }
      return;
    }
    try {
      const res = await fetch(`/api/github/languages?repoUrl=${encodeURIComponent(githubRepo)}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data?.languages) && data.languages.length > 0) {
          setGitLanguages(data.languages);
          if (typeof window !== "undefined") {
            localStorage.setItem(`ldk_workspace_langs_${id}`, JSON.stringify(data.languages));
          }
          return;
        }
      }
      setGitLanguages([]);
      if (typeof window !== "undefined") {
        localStorage.removeItem(`ldk_workspace_langs_${id}`);
      }
    } catch (err) {
      console.warn("Failed fetching repo languages: ", err);
      setGitLanguages([]);
      if (typeof window !== "undefined") {
        localStorage.removeItem(`ldk_workspace_langs_${id}`);
      }
    }
  }, [githubRepo, id]);

  useEffect(() => {
    let active = true;
    (async () => {
      if (active) {
        await fetchCommits();
        await fetchGitLanguages();
      }
    })();
    return () => {
      active = false;
    };
  }, [fetchCommits, fetchGitLanguages]);

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    const myName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "You";
    const newTask: WorkspaceTask = {
      id: getUniqueId("task"),
      title: newTaskTitle.trim(),
      status: "todo",
      priority: newTaskPriority,
      assignee: myName,
      scope: newTaskScope,
      created_by: user?.id
    };
    setTasks(prev => {
      const updated = [...prev, newTask];
      localStorage.setItem(`ldk_workspace_tasks_${id}`, JSON.stringify(updated));
      const teamTasksOnly = updated.filter(t => t.scope !== "self");
      if (newTaskScope === "team") {
        if (activeChannelRef.current) {
          try {
            activeChannelRef.current.send({
              type: "broadcast",
              event: "workspace_sync",
              payload: { action: "tasks", data: teamTasksOnly }
            });
          } catch {}
        }
        broadcastLocalEvent("tasks_update", teamTasksOnly);
      }
      if (workspaceUuid) {
        (async () => {
          try {
            await supabase.from("project_spaces").update({ tasks: updated }).eq("id", workspaceUuid);
            const { data: inserted } = await supabase.from("project_tasks").insert({
              project_space_id: workspaceUuid,
              title: newTask.title,
              status: newTask.status,
              priority: newTask.priority,
              scope: newTask.scope,
              assigned_to: user?.id || null
            }).select("id").maybeSingle();

            if (inserted?.id) {
              setTasks(curr => {
                const refreshed = curr.map(t => t.id === newTask.id ? { ...t, id: inserted.id } : t);
                localStorage.setItem(`ldk_workspace_tasks_${id}`, JSON.stringify(refreshed));
                return refreshed;
              });
            }
          } catch {}
        })();
      }
      return updated;
    });
    setNewTaskTitle("");
  };

  const handleUpdateTaskStatus = (taskId: string, newStatus: "todo" | "in_progress" | "done") => {
    const myName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "You";
    setTasks(prev => {
      const target = prev.find(t => t.id === taskId);
      if (target && newStatus === "done" && target.status !== "done") {
        const noticeMsg: ChatMsg = {
          id: getUniqueId("sys_task"),
          sender_name: "LDK:BOT",
          sender_role: "SYSTEM",
          content: `${myName} completed task: "${target.title}"`,
          created_at: new Date().toISOString(),
          isSystem: true
        };
        setChatMessages(chatPrev => {
          const updatedChat = [...chatPrev, noticeMsg];
          localStorage.setItem(`ldk_chat_messages_${id}`, JSON.stringify(updatedChat));
          return updatedChat;
        });
      }
      const updatedTasks = prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t);
      localStorage.setItem(`ldk_workspace_tasks_${id}`, JSON.stringify(updatedTasks));
      const teamTasksOnly = updatedTasks.filter(t => t.scope !== "self");
      if (activeChannelRef.current) {
        try {
          activeChannelRef.current.send({
            type: "broadcast",
            event: "workspace_sync",
            payload: { action: "tasks", data: teamTasksOnly }
          });
        } catch {}
      }
      broadcastLocalEvent("tasks_update", teamTasksOnly);
      if (workspaceUuid) {
        (async () => {
          try {
            await supabase.from("project_spaces").update({ tasks: updatedTasks }).eq("id", workspaceUuid);
            if (!taskId.startsWith("task_") && !taskId.startsWith("local_")) {
              await supabase.from("project_tasks").update({ status: newStatus, updated_at: new Date().toISOString() }).eq("id", taskId);
            }
          } catch {}
        })();
      }
      return updatedTasks;
    });
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(prev => {
      const updatedTasks = prev.filter(t => t.id !== taskId);
      localStorage.setItem(`ldk_workspace_tasks_${id}`, JSON.stringify(updatedTasks));
      const teamTasksOnly = updatedTasks.filter(t => t.scope !== "self");
      if (activeChannelRef.current) {
        try {
          activeChannelRef.current.send({
            type: "broadcast",
            event: "workspace_sync",
            payload: { action: "tasks", data: teamTasksOnly }
          });
        } catch {}
      }
      broadcastLocalEvent("tasks_update", teamTasksOnly);
      if (workspaceUuid) {
        (async () => {
          try {
            await supabase.from("project_spaces").update({ tasks: updatedTasks }).eq("id", workspaceUuid);
            if (!taskId.startsWith("task_") && !taskId.startsWith("local_")) {
              await supabase.from("project_tasks").delete().eq("id", taskId);
            }
          } catch {}
        })();
      }
      return updatedTasks;
    });
  };

  return (
    <div className="min-h-screen lg:h-screen lg:overflow-hidden flex flex-col font-sans selection:bg-accent-main selection:text-bg-base">
      
      {/* Header (Unified Navigation & Notifications Drawer) */}
      <Header />

      <AnimatePresence mode="wait">
        {isWorkspaceHydrating ? (
          <motion.div
            key="workspace-hydration-loader"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex-1 flex items-center justify-center p-6 bg-bg-base"
          >
            <LynDeskLoadingCard
              message={projectName && projectName !== "Loading Project..." ? `Initializing ${projectName}...` : "Initializing Workspace..."}
              subtext="Syncing project vault, realtime channel & team presence..."
              minHeight="min-h-[500px]"
            />
          </motion.div>
        ) : (
          <motion.main
            key="workspace-hydrated-content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            ref={containerRef}
            className={`flex-1 overflow-y-auto lg:overflow-hidden flex flex-col lg:flex-row gap-0 ${isResizing ? "select-none" : ""}`}
          >
        
        {/* ================= COLUMN 1: STAGE TRACKER (Left Specs Panel) ================= */}
        <section 
          className="w-full border-b lg:border-b-0 lg:border-r border-border-main/50 bg-bg-surface/30 flex flex-col h-auto lg:h-full overflow-y-auto p-6 gap-6 shrink-0 transition-all duration-75"
          style={{ width: isDesktop ? `${panelWidths.left}%` : undefined }}
        >
          <div className="flex items-center justify-between gap-2">
            <Link 
              href="/event-desk"
              className="flex items-center gap-2 text-[10px] text-txt-muted hover:text-txt-main transition-colors font-mono tracking-wider uppercase"
            >
              <ArrowLeft size={12} />
              Back to Registry
            </Link>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={toggleLayoutLock}
                className="opacity-50 hover:opacity-100 transition-opacity text-[9px] font-mono tracking-wider uppercase text-txt-muted hover:text-txt-main flex items-center gap-1 cursor-pointer bg-bg-card/70 border border-border-main/60 px-1.5 py-0.5 rounded select-none"
              >
                {isLayoutLocked ? (
                  <Lock size={10} className="shrink-0 text-txt-muted" />
                ) : (
                  <Unlock size={10} className="shrink-0 text-txt-muted" />
                )}
                <span>Layout</span>
              </button>

              <button
                type="button"
                onClick={() => setShowLeaveConfirmModal(true)}
                className="text-[9px] font-mono tracking-wider uppercase text-txt-muted/50 hover:text-red-400 opacity-40 hover:opacity-100 transition-all flex items-center gap-1 cursor-pointer font-bold px-1.5 py-0.5 rounded hover:bg-red-500/10"
              >
                <LogOut size={10} />
                <span>Leave</span>
              </button>
            </div>
          </div>

          {/* Single Clean Unified Workspace Title Header */}
          <div className="flex flex-col gap-1.5 border-b border-border-main/40 pb-4">
            {!isEditingName ? (
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between gap-2 group">
                  <h2 className="font-display text-xl font-medium text-txt-main truncate">
                    {projectName && projectName !== "Loading Project..."
                      ? projectName 
                      : (eventTitle || "Project Workspace")}
                  </h2>
                  <button
                    type="button"
                    onClick={() => {
                      setTempName(projectName && projectName !== "Loading Project..." ? projectName : (eventTitle || ""));
                      setIsEditingName(true);
                    }}
                    className="text-[9px] font-mono text-txt-muted/70 hover:text-accent-main opacity-80 lg:opacity-0 group-hover:opacity-100 transition-all cursor-pointer flex items-center gap-1 shrink-0 bg-bg-surface px-2 py-0.5 rounded border border-border-main/50 font-semibold"
                  >
                    <Edit2 size={10} />
                    <span>Rename</span>
                  </button>
                </div>

                {eventTitle && projectName && projectName !== eventTitle && (
                  <span className="text-[10px] font-mono text-txt-muted uppercase tracking-wider">
                    Linked Event: <strong className="text-txt-main/80 font-normal">{eventTitle}</strong>
                  </span>
                )}

                <div className="flex items-center gap-1.5 flex-nowrap shrink-0 pt-0.5">
                  <a
                    href={eventMetadata.url}
                    target="_blank"
                    rel="noreferrer"
                    className="h-5 inline-flex items-center justify-center gap-1 px-2 text-[8px] font-mono uppercase text-txt-muted/70 hover:text-accent-main opacity-80 hover:opacity-100 transition-all cursor-pointer bg-bg-surface/80 rounded border border-border-main/50 shrink-0"
                  >
                    <span className="leading-none pt-[0.5px]">Visit Event Page</span>
                    <ExternalLink size={9} className="shrink-0" />
                  </a>

                  <button
                    type="button"
                    onClick={() => setShowBriefModal(true)}
                    className="h-5 inline-flex items-center justify-center gap-1 px-2 text-[8px] font-mono uppercase text-accent-main hover:underline cursor-pointer bg-accent-main/10 rounded border border-accent-main/30 shrink-0 font-semibold"
                  >
                    <Sparkles size={9} className="text-accent-main animate-pulse shrink-0" />
                    <span className="leading-none pt-[0.5px]">Event Brief & Rules</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-2 pt-0.5">
                <input
                  type="text"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") saveProjectName();
                    if (e.key === "Escape") setIsEditingName(false);
                  }}
                  className="h-8 px-2.5 bg-bg-base border border-accent-main text-txt-main text-xs font-mono rounded focus:outline-none w-full"
                  placeholder="Enter workspace name..."
                  autoFocus
                />
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={saveProjectName}
                    className="bg-accent-main text-bg-base text-[10px] font-mono font-bold px-3 py-1 rounded hover:opacity-90 cursor-pointer"
                  >
                    Save Name
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditingName(false)}
                    className="text-[10px] font-mono text-txt-muted hover:text-txt-main cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Automated Non-Selectable Milestone Stage Timeline */}
          <div className="relative flex flex-col gap-3.5 pl-1.5 py-1.5 flex-grow">
            {/* Fading Vertical Left Guide Line - Centered with Node Circles (18px) */}
            <div className="absolute top-4 bottom-2 left-[18px] -translate-x-1/2 w-[1px] bg-gradient-to-b from-border-main/70 via-border-main/35 to-transparent z-0" />
            
            {(() => {
              const cleanList = sanitizeStageItems(realStageItems);
              const firstUnpassed = cleanList.findIndex((s) => !isDatePassed(s.deadline));
              const activeIdx = firstUnpassed >= 0 ? firstUnpassed : cleanList.length - 1;

              return cleanList.map((item, idx) => {
                const liveDate = item.deadline || "Target Active";
                const isPassed = isDatePassed(liveDate);
                const isCompleted = isPassed || idx < activeIdx;
                const isActive = !isCompleted && idx === activeIdx;

                let cleanDisplayDate = liveDate.replace(/^(Completed|Target|\s*|\(|\))*/gi, "").replace(/\)$/g, "").trim();
                const displayDate = isCompleted
                  ? `Completed (${cleanDisplayDate || liveDate})`
                  : `Target ${cleanDisplayDate || liveDate}`;

                return (
                  <div 
                    key={idx} 
                    className="relative z-10 flex items-start gap-2.5 select-none p-1 rounded cursor-default transition-colors"
                  >
                    {/* Node Circle */}
                    <div className="relative h-4 w-4 shrink-0 flex items-center justify-center">
                      {isActive && (
                        <div className="absolute -inset-1 rounded-full bg-accent-main/20 blur-[2.5px] pointer-events-none animate-pulse" />
                      )}
                      {isCompleted && (
                        <div className="absolute -inset-0.5 rounded-full bg-emerald-500/15 blur-[2px] pointer-events-none" />
                      )}

                      <div className={`relative z-10 h-4 w-4 rounded-full border-[1.5px] flex items-center justify-center transition-all duration-300 ${
                        isCompleted
                          ? "border-emerald-500 bg-emerald-500/20 shadow-[0_0_5px_rgba(16,185,129,0.18)]"
                          : isActive
                          ? "border-accent-main bg-bg-surface shadow-[0_0_6px_rgba(var(--color-accent-main),0.15)]"
                          : "border-border-main/60 bg-bg-base/60"
                      }`}>
                        {isCompleted ? (
                          <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex items-center justify-center">
                            <Check size={9} strokeWidth={3} className="text-emerald-400" />
                          </motion.div>
                        ) : isActive ? (
                          <span className="w-1.5 h-1.5 rounded-full bg-accent-main animate-pulse shrink-0" />
                        ) : (
                          <span className="w-1 h-1 rounded-full bg-txt-muted/40 shrink-0" />
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col gap-0.5 pt-[0.5px]">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`text-[11px] font-semibold leading-tight ${
                          isCompleted
                            ? "text-emerald-400 font-bold"
                            : isActive
                            ? "text-accent-main font-bold"
                            : "text-txt-main/80"
                        }`}>
                          {item.title}
                        </span>
                      </div>
                      <span className={`text-[9px] font-mono tracking-tight ${
                        isCompleted 
                          ? "text-emerald-400/80 font-medium" 
                          : isActive 
                          ? "text-accent-main/80 font-medium" 
                          : "text-txt-muted/60"
                      }`}>
                        {displayDate}
                      </span>
                    </div>
                  </div>
                );
              });
            })()}
          </div>

          {/* Project Specification & Repository Languages Panel */}
          <div className="border border-border-main/40 bg-bg-surface/50 backdrop-blur-sm p-4 rounded-sm flex flex-col gap-3 mt-auto">
            <div className="flex items-center justify-between border-b border-border-main/30 pb-2">
              <span className="font-mono text-[9px] tracking-widest uppercase text-txt-muted font-semibold">Repository Specs</span>
              <Terminal size={11} className="text-accent-main/80" />
            </div>
            
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <span className="text-[9px] font-mono text-txt-muted uppercase font-semibold">Language Breakdown</span>
                {gitLanguages.length > 0 && (
                  <span className="text-[8px] font-mono text-txt-muted/70">{gitLanguages.length} Languages</span>
                )}
              </div>
              
              {gitLanguages.length > 0 ? (
                <div className="flex flex-col gap-2">
                  {/* Single Unified Multi-Segment Language Bar */}
                  <div className="w-full h-1.5 bg-bg-base rounded-full overflow-hidden flex border border-border-main/30">
                    {gitLanguages.map((lang, idx) => {
                      const colors = ["bg-accent-main", "bg-yellow-400", "bg-purple-400", "bg-emerald-400", "bg-sky-400"];
                      return (
                        <div
                          key={lang.name}
                          className={`h-full ${colors[idx % colors.length]}`}
                          style={{ width: `${lang.percentage}%` }}
                        />
                      );
                    })}
                  </div>

                  {/* Compact Inline Legend Badges */}
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[9px]">
                    {gitLanguages.map((lang, idx) => {
                      const dotColors = ["bg-accent-main", "bg-yellow-400", "bg-purple-400", "bg-emerald-400", "bg-sky-400"];
                      return (
                        <div key={lang.name} className="flex items-center gap-1">
                          <span className={`w-1.5 h-1.5 rounded-full ${dotColors[idx % dotColors.length]}`} />
                          <span className="text-txt-main font-medium">{lang.name}</span>
                          <span className="text-txt-muted/70 text-[8px]">{lang.percentage}%</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <span className="text-[10px] font-mono text-txt-muted/70 italic py-1 leading-relaxed">
                  {githubRepo ? "Fetching repository language data..." : "No Git repository linked yet. Click 'Edit' above to attach your project's GitHub URL."}
                </span>
              )}
            </div>
          </div>
        </section>

        {/* Mouse Drag Resizer Handle 1 (Left / Chat) */}
        {!isLayoutLocked && (
          <div
            onMouseDown={() => setIsResizing("left-center")}
            onDoubleClick={handleResetWidths}
            className={`hidden lg:flex w-1.5 hover:w-2 bg-border-main/30 hover:bg-accent-main/80 active:bg-accent-main transition-all cursor-col-resize z-30 shrink-0 items-center justify-center group relative select-none ${
              isResizing === "left-center" ? "bg-accent-main w-2" : ""
            }`}
          >
            <div className="w-0.5 h-6 bg-border-main/60 group-hover:bg-bg-base rounded-full" />
          </div>
        )}

        {/* ================= COLUMN 2: COLLABORATIVE CHAT & AUDIO (Center Panel) ================= */}
        <section 
          className="w-full border-b lg:border-b-0 lg:border-r border-border-main/50 flex flex-col h-auto lg:h-full bg-bg-base overflow-hidden shrink-0 transition-all duration-75"
          style={{ width: isDesktop ? `${panelWidths.chat}%` : undefined }}
        >
          
          {/* Header strip: Voice channels & members */}
          <div className="h-14 border-b border-border-main/50 bg-bg-surface/50 backdrop-blur px-5 flex items-center justify-between flex-shrink-0 gap-3">
            <div className="flex items-center gap-2.5">
              <span className="font-mono text-[9px] uppercase tracking-widest text-txt-muted hidden sm:inline">Voice & Chat</span>
              <button 
                onClick={handleJoinRoom}
                className={`h-7 px-3 rounded-sm font-mono text-[9px] leading-none tracking-wider uppercase transition-colors inline-flex items-center justify-center gap-1.5 cursor-pointer font-medium select-none ${
                  inRoom 
                    ? "bg-red-500/10 border border-red-500/40 text-red-400 hover:bg-red-500/20" 
                    : "border border-border-main/85 text-txt-main hover:bg-bg-card"
                }`}
              >
                {inRoom ? <PhoneOff size={11} className="shrink-0" /> : <Phone size={11} className="shrink-0" />}
                <span className="leading-none">{inRoom ? "Leave Call" : "Join Call"}</span>
              </button>
              <button 
                onClick={() => setIsInviteModalOpen(true)}
                className="h-7 px-3 rounded-sm border border-border-main/85 text-txt-main hover:bg-bg-card font-mono text-[9px] leading-none tracking-wider uppercase transition-colors inline-flex items-center justify-center gap-1.5 cursor-pointer font-medium select-none"
              >
                <UserPlus size={11} className="shrink-0" />
                <span className="leading-none">Invite</span>
              </button>
            </div>

            {/* Active Online Members Pill Section */}
            <div 
              onClick={() => setShowActiveMembersModal(true)}
              className="flex items-center gap-2 cursor-pointer hover:opacity-85 transition-opacity bg-bg-card/40 border border-border-main/60 px-2.5 py-1 rounded"
              aria-label="Click to view all Active Workspace Members"
            >
              <span className="text-[9px] font-mono text-txt-muted uppercase tracking-wider hidden sm:inline">Online ({onlineMembers.length}):</span>
              <div className="flex -space-x-1.5 overflow-hidden">
                {onlineMembers.map(member => (
                  <div 
                    key={member.id} 
                    title={`${member.name} (${member.id === user?.id ? "You" : "Teammate"})`}
                    className={`w-5 h-5 rounded-full border border-bg-surface bg-bg-card flex items-center justify-center font-mono text-[8px] font-bold text-txt-main overflow-hidden select-none transition-all duration-300 relative ${
                      member.isSpeaking ? "ring-2 ring-emerald-500 scale-105" : ""
                    }`}
                  >
                    <span className="font-mono text-[8px] font-bold text-txt-main uppercase">{member.name.charAt(0)}</span>
                    {member.avatarUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={member.avatarUrl} alt={member.name} className="absolute inset-0 w-full h-full object-cover" 
                        onError={(e) => { 
                          (e.target as HTMLImageElement).style.display = 'none';
                        }} 
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Visual Live Active Call Indicator Banner */}
          {(isCallActiveInRoom || inRoom || remoteStream !== null) && (
            <div className="bg-emerald-950/40 border-b border-emerald-500/30 px-5 py-2.5 flex items-center justify-between flex-shrink-0 animate-fade-in backdrop-blur-sm shadow-md">
              <div className="flex items-center gap-3">
                <div className="flex items-end gap-0.5 h-3.5 select-none">
                  <span className="w-1 h-3 bg-emerald-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-1 h-4 bg-emerald-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-1 h-2 bg-emerald-400 rounded-full animate-bounce" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    Live Call in Progress
                  </span>
                  <span className="text-[9px] font-mono text-txt-sub">
                    ({callCallerName || (onlineMembers.find(m => m.id !== user?.id)?.name || "Teammate")} is in the call)
                  </span>
                </div>
              </div>

              {!inRoom && (
                <button
                  type="button"
                  onClick={handleJoinRoom}
                  className="h-6 px-3 bg-emerald-500 hover:bg-emerald-400 text-bg-base font-mono text-[9px] font-bold uppercase tracking-wider rounded flex items-center gap-1 transition-colors cursor-pointer shadow-sm"
                >
                  <Video size={10} />
                  Join Call Now
                </button>
              )}
            </div>
          )}

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

          {/* WebRTC Video Streaming Grid */}
          {inRoom && (
            <motion.div 
              layout
              className="border-b border-border-main/50 bg-bg-surface/10 p-4 flex flex-col sm:flex-row items-center justify-center gap-4 flex-shrink-0 animate-fade-in transition-all duration-300"
            >
              {/* Local Video Frame */}
              <motion.div 
                layout
                className={`aspect-video relative border border-border-main/60 bg-bg-surface rounded-sm overflow-hidden flex items-center justify-center transition-all duration-300 ${
                  (remoteStream !== null || roomMembers.some(m => m.id !== "user-session"))
                    ? "w-full sm:w-1/2" 
                    : "w-full max-w-sm sm:max-w-md"
                }`}
              >
                <video 
                  ref={setLocalVideoNode} 
                  autoPlay 
                  playsInline 
                  muted 
                  className={`w-full h-full object-cover transition-opacity duration-300 ${isVideoOn ? "opacity-100" : "opacity-0 pointer-events-none"}`} 
                />
                
                {!isVideoOn && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center gap-2 bg-bg-base/90">
                    <div className="w-10 h-10 rounded-full bg-bg-card border border-border-main/50 flex items-center justify-center font-mono font-bold text-sm text-txt-main">
                      {(user?.email?.split("@")[0] || "Y").toUpperCase().charAt(0)}
                    </div>
                    <span className="text-[9px] font-mono text-txt-muted uppercase">Camera Disabled</span>
                  </div>
                )}
                
                {/* Labels overlay */}
                <div className="absolute bottom-2.5 left-2.5 bg-black/60 backdrop-blur px-2 py-0.5 rounded text-[8px] font-mono text-white flex items-center gap-1.5 select-none">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>You {isMuted && "(Muted)"}</span>
                </div>
              </motion.div>

              {/* Remote Video Frame (Rendered dynamically when teammate joins) */}
              {(remoteStream !== null || roomMembers.some(m => m.id !== "user-session")) && (
                <motion.div 
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ 
                    opacity: 0, 
                    scale: 0.95, 
                    width: 0, 
                    height: 0, 
                    marginTop: 0, 
                    marginBottom: 0, 
                    paddingTop: 0, 
                    paddingBottom: 0, 
                    overflow: "hidden" 
                  }}
                  transition={{ duration: 0.25 }}
                  className="relative z-10 w-full sm:w-1/2 aspect-video border border-border-main/60 bg-bg-surface rounded-sm overflow-hidden flex items-center justify-center"
                >
                  <video 
                    ref={setRemoteVideoNode} 
                    autoPlay 
                    playsInline 
                    className={`w-full h-full object-cover transition-opacity duration-300 ${remoteStream && remoteIsVideoOn ? "opacity-100" : "opacity-0 pointer-events-none"}`} 
                  />

                  {(!remoteStream || !remoteIsVideoOn) && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center gap-2 bg-bg-base/90">
                      <div className="w-10 h-10 rounded-full bg-bg-card border border-border-main/50 flex items-center justify-center font-mono font-bold text-sm text-txt-main">
                        {remoteName.toUpperCase().charAt(0)}
                      </div>
                      <span className="text-[9px] font-mono text-txt-muted uppercase">
                        {!remoteStream ? "Connecting Call..." : "Peer Camera Off"}
                      </span>
                    </div>
                  )}

                  {/* Labels overlay */}
                  <div className="absolute bottom-2.5 left-2.5 bg-black/60 backdrop-blur px-2 py-0.5 rounded text-[8px] font-mono text-white flex items-center gap-1.5 select-none">
                    <span className={`w-1.5 h-1.5 rounded-full ${remoteStream ? "bg-emerald-500 animate-pulse" : "bg-yellow-400"}`} />
                    <span>{remoteName} {remoteIsMuted && "(Muted)"}</span>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Main Chat Stream */}
          <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
            {chatMessages.map((msg) => {
              if (!msg.isSystem && !msg.content && !msg.file_url) return null;

              const myFullName = user?.user_metadata?.full_name;
              const myEmailPrefix = user?.email?.split("@")[0];
              const isMe = !msg.isSystem && (
                msg.sender_name === "You" ||
                (userUsername && msg.sender_name === userUsername) ||
                (myFullName && msg.sender_name === myFullName) ||
                (myEmailPrefix && msg.sender_name === myEmailPrefix) ||
                (user?.id && (msg as any).profile_id === user.id)
              );

              return (
                <div 
                  key={msg.id} 
                  className={`flex flex-col max-w-[85%] ${
                    msg.isSystem 
                      ? "self-center text-center py-1.5" 
                      : isMe 
                      ? "self-end items-end" 
                      : "self-start items-start"
                  }`}
                >
                  {msg.isSystem ? (
                    <span className="text-[8px] font-mono text-txt-muted/70 bg-bg-surface/30 border border-border-main/30 px-2 py-0.5 rounded-full opacity-60 hover:opacity-100 transition-opacity select-none my-0.5">
                      {msg.content}
                    </span>
                  ) : (
                    <>
                      <div className="flex items-baseline gap-2 mb-1 px-1">
                        <span className={`text-[10px] font-mono font-semibold ${isMe ? "text-accent-main" : "text-txt-main"}`}>
                          {isMe ? "You" : msg.sender_name}
                        </span>
                        {msg.sender_role && msg.sender_role !== "Collaborator" && msg.sender_role !== "Developer" && (
                          <span className="text-[8px] font-mono text-txt-muted uppercase tracking-wider">{msg.sender_role}</span>
                        )}
                      </div>
                      <div className={`p-3 rounded-md text-xs leading-relaxed flex flex-col gap-2 ${
                        isMe 
                          ? "bg-accent-main text-bg-base rounded-tr-none font-normal shadow-sm" 
                          : "bg-bg-surface border border-border-main/70 text-txt-main rounded-tl-none font-light"
                      }`}>
                        {msg.content && <span>{msg.content}</span>}

                        {/* Image Attachment Card */}
                        {msg.file_url && msg.file_type === "image" && (
                          <button 
                            type="button"
                            onClick={() => setChatImagePreviewUrl(msg.file_url!)}
                            className="block mt-1 overflow-hidden rounded border border-border-main/40 max-w-xs group relative text-left cursor-pointer"
                          >
                            <img 
                              src={msg.file_url} 
                              alt={msg.file_name || "Attachment"} 
                              className="max-h-52 w-full object-cover rounded hover:scale-105 transition-transform duration-300" 
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-mono gap-1 font-semibold">
                              <Eye size={12} /> View Full Image
                            </div>
                          </button>
                        )}

                        {/* Document/Archive/File Attachment Card */}
                        {msg.file_url && msg.file_type === "file" && (
                          <a 
                            href={msg.file_url} 
                            download={msg.file_name} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className={`mt-1 flex items-center gap-2.5 p-2.5 rounded border transition-colors ${
                              isMe 
                                ? "bg-bg-base/20 border-bg-base/30 text-bg-base hover:bg-bg-base/30" 
                                : "bg-bg-base/50 border-border-main/60 text-txt-main hover:bg-bg-base"
                            }`}
                          >
                            <FileText size={16} className={isMe ? "text-bg-base shrink-0" : "text-accent-main shrink-0"} />
                            <div className="flex flex-col min-w-0 flex-1 font-mono text-[10px]">
                              <span className="font-semibold truncate">{msg.file_name || "Attachment File"}</span>
                              {msg.file_size && <span className="opacity-70 text-[8px]">{msg.file_size}</span>}
                            </div>
                            <Download size={13} className="shrink-0 opacity-80 hover:opacity-100" />
                          </a>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
            <div ref={chatEndRef} />
          </div>

          {/* Hidden Chat File Attachment Input */}
          <input 
            type="file" 
            ref={chatFileInputRef}
            onChange={handleChatFileSelected}
            className="hidden"
            accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.zip,.txt,.json,.js,.ts,.tsx,.py"
          />

          {/* Attached File Preview Bar */}
          {chatAttachment && (
            <div className="px-4 py-2 bg-bg-surface border-t border-border-main/50 flex items-center justify-between gap-2 text-xs font-mono">
              <div className="flex items-center gap-2 truncate">
                {chatAttachment.type === "image" ? (
                  <img src={chatAttachment.previewUrl} alt="Preview" className="w-8 h-8 rounded object-cover border border-border-main/50 shrink-0" />
                ) : (
                  <div className="w-8 h-8 rounded bg-bg-card border border-border-main/50 flex items-center justify-center shrink-0 text-accent-main">
                    <FileText size={14} />
                  </div>
                )}
                <div className="flex flex-col min-w-0">
                  <span className="text-txt-main font-medium truncate text-[11px]">{chatAttachment.name}</span>
                  <span className="text-txt-muted text-[9px]">{chatAttachment.sizeStr}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setChatAttachment(null)}
                className="p-1 rounded text-txt-muted hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
              >
                <X size={12} />
              </button>
            </div>
          )}

          {/* Chat input box */}
          <form onSubmit={handleSendMessage} className="p-4 bg-bg-surface/30 border-t border-border-main/50 flex gap-2 flex-shrink-0 items-center">
            <button 
              type="button" 
              onClick={() => chatFileInputRef.current?.click()}
              className={`p-2.5 rounded border transition-colors focus:outline-none cursor-pointer ${
                chatAttachment ? "border-accent-main bg-accent-main/10 text-accent-main" : "border-border-main/80 text-txt-muted hover:text-txt-main hover:bg-bg-card"
              }`}
            >
              <Paperclip size={14} />
            </button>
            
            <input 
              type="text" 
              placeholder={chatAttachment ? "Add optional caption..." : "Send message to room deck..."}
              value={newMsg}
              onChange={(e) => setNewMsg(e.target.value)}
              className="flex-1 h-10 px-3 border border-border-main/80 bg-bg-base text-txt-main rounded-sm text-xs placeholder:text-txt-muted/50 focus:outline-none focus:border-txt-main focus:ring-1 focus:ring-ring-main transition-colors font-light"
            />
            
            <button 
              type="submit" 
              disabled={isUploadingChatFile}
              className="h-10 px-4 rounded-sm bg-accent-main hover:opacity-90 disabled:opacity-50 text-bg-base text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-1.5 transition-opacity cursor-pointer font-bold"
            >
              {isUploadingChatFile ? (
                <RefreshCw size={12} className="animate-spin" />
              ) : (
                <Send size={12} />
              )}
              <span className="hidden sm:inline">{isUploadingChatFile ? "Sending..." : "Send"}</span>
            </button>
          </form>

        </section>

        {/* Mouse Drag Resizer Handle 2 (Chat / Workbench) */}
        {!isLayoutLocked && (
          <div
            onMouseDown={() => setIsResizing("center-right")}
            onDoubleClick={handleResetWidths}
            className={`hidden lg:flex w-1.5 hover:w-2 bg-border-main/30 hover:bg-accent-main/80 active:bg-accent-main transition-all cursor-col-resize z-30 shrink-0 items-center justify-center group relative select-none ${
              isResizing === "center-right" ? "bg-accent-main w-2" : ""
            }`}
          >
            <div className="w-0.5 h-6 bg-border-main/60 group-hover:bg-bg-base rounded-full" />
          </div>
        )}

        {/* ================= COLUMN 3: ARTIFACT DECK & VERIFICATIONS (Right Workbench Panel) ================= */}
        <section 
          className="w-full bg-bg-surface/30 flex flex-col h-auto lg:h-full overflow-y-auto p-6 gap-6 flex-1 min-w-0 transition-all duration-75"
          style={{ width: isDesktop ? `${panelWidths.right}%` : undefined }}
        >
          
          {/* Tab Navigation Header - 5-column grid alignment */}
          <div className="grid grid-cols-5 border-b border-border-main/50 pb-2.5 gap-1 font-mono text-[9px] uppercase tracking-wider text-center">
            {(["workspace", "tasks", "artifacts", "notes", "credits"] as const).map(tab => (
              <button
                key={tab}
                type="button"
                onClick={() => handleTabChange(tab)}
                className={`px-1 py-1.5 rounded-sm cursor-pointer transition-colors text-center truncate ${
                  activeTab === tab 
                    ? "bg-accent-main text-bg-base font-bold" 
                    : "text-txt-muted hover:text-txt-main hover:bg-bg-card"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {(activeTab === "workspace") && (
            <>
              <div className="flex flex-col gap-0.5 border-b border-border-main/40 pb-4">
                <span className="font-mono text-[9px] uppercase tracking-widest text-txt-muted">Decks & Codebases</span>
                <h2 className="font-display text-lg font-light text-txt-main">Workspace Hub</h2>
              </div>

              {/* GitHub Repo Integration Card */}
              <div className="border border-border-main/70 bg-bg-surface p-4 rounded-sm flex flex-col gap-3">
                {!isEditingGit ? (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[9px] uppercase tracking-widest text-txt-muted">Git Repository</span>
                      <button 
                        onClick={() => {
                          setTempGit(githubRepo);
                          setIsEditingGit(true);
                        }}
                        className="text-[9px] font-mono uppercase text-txt-sub hover:text-txt-main transition-colors cursor-pointer font-medium"
                      >
                        Edit
                      </button>
                    </div>
                    <span className="text-xs font-mono text-txt-main truncate select-all font-normal">
                      {githubRepo || "Not linked"}
                    </span>
                    {githubRepo && (
                      <div className="flex items-center gap-2 pt-1 border-t border-border-main/20 flex-wrap">
                        <a 
                          href={formatUrl(githubRepo)}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[10px] font-mono text-txt-sub hover:text-txt-main bg-bg-card border border-border-main/50 px-2 py-1 rounded flex items-center gap-1.5 transition-colors font-normal"
                        >
                          <ExternalLink size={11} />
                          Open Codebase
                        </a>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[9px] uppercase tracking-widest text-txt-muted">Git Repository</span>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => setIsEditingGit(false)}
                          className="text-[9px] font-mono uppercase text-txt-muted hover:underline cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button 
                          onClick={saveGitRepo}
                          className="text-[9px] font-mono uppercase text-accent-main font-semibold hover:underline cursor-pointer"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                    <input 
                      type="text"
                      placeholder="github.com/username/project"
                      value={tempGit}
                      onChange={(e) => {
                        setTempGit(e.target.value);
                        if (gitUrlError) setGitUrlError(null);
                      }}
                      className="h-8 px-2.5 border border-border-main/80 bg-bg-base text-txt-main rounded-sm text-xs placeholder:text-txt-muted/50 focus:outline-none focus:border-txt-main transition-colors font-mono"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") saveGitRepo();
                      }}
                    />
                    {gitUrlError && (
                      <span className="text-[10px] font-mono text-red-400/80 bg-red-950/20 border border-red-500/20 px-2 py-0.5 rounded flex items-center gap-1.5 select-none">
                        <AlertCircle size={10} className="text-red-400/70 shrink-0" />
                        {gitUrlError}
                      </span>
                    )}
                  </>
                )}
              </div>

              {/* Prototype Demo Card */}
              <div className="border border-border-main/70 bg-bg-surface p-4 rounded-sm flex flex-col gap-3">
                {!isEditingDemo ? (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[9px] uppercase tracking-widest text-txt-muted">Prototype Demo URL</span>
                      <button 
                        onClick={() => {
                          setTempDemo(liveDemo);
                          setIsEditingDemo(true);
                        }}
                        className="text-[9px] font-mono uppercase text-txt-sub hover:text-txt-main transition-colors cursor-pointer font-medium"
                      >
                        Edit
                      </button>
                    </div>
                    {liveDemo ? (
                      <span className="text-xs font-mono text-txt-main truncate select-all font-normal">
                        {liveDemo}
                      </span>
                    ) : (
                      <div className="flex flex-col gap-1 py-3 px-2 text-center items-center justify-center border border-dashed border-border-main/40 rounded bg-bg-surface/50">
                        <AlertCircle size={14} className="text-txt-muted/60 mb-0.5" />
                        <span className="text-[10px] font-mono text-txt-main font-medium">No prototype demo connected</span>
                        <span className="text-[9px] font-mono text-txt-muted/80 leading-relaxed max-w-[210px]">
                          Click &apos;Edit&apos; above to attach your live project demo or prototype URL.
                        </span>
                      </div>
                    )}
                    {liveDemo && (
                      <div className="flex items-center gap-2 pt-1 border-t border-border-main/20 flex-wrap">
                        <button 
                          type="button"
                          onClick={() => setShowDemoPreviewModal(true)}
                          className="text-[10px] font-mono text-txt-sub hover:text-txt-main bg-bg-card border border-border-main/50 px-2 py-1 rounded flex items-center gap-1.5 transition-colors cursor-pointer font-normal"
                        >
                          <Eye size={11} />
                          Live Web Preview
                        </button>

                        <button
                          type="button"
                          onClick={() => setIsInlineDemoPreviewOpen(prev => !prev)}
                          className="text-[10px] font-mono text-txt-sub hover:text-txt-main bg-bg-card border border-border-main/50 px-2 py-1 rounded flex items-center gap-1.5 transition-colors cursor-pointer font-normal"
                        >
                          <Monitor size={11} />
                          {isInlineDemoPreviewOpen ? "Hide Frame" : "Inline Frame"}
                        </button>

                        <a 
                          href={formatUrl(liveDemo)}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[10px] font-mono text-txt-sub hover:text-txt-main bg-bg-card border border-border-main/50 px-2 py-1 rounded flex items-center gap-1.5 transition-colors font-normal"
                        >
                          <ExternalLink size={11} />
                          Open Demo
                        </a>
                      </div>
                    )}

                    {isInlineDemoPreviewOpen && liveDemo && (
                      <div className="mt-2 border border-border-main/60 rounded overflow-hidden bg-bg-base flex flex-col shadow-inner">
                        <div className="flex justify-between items-center bg-bg-surface px-2.5 py-1 border-b border-border-main/40 text-[9px] font-mono text-txt-muted">
                          <span className="truncate max-w-[200px]">{formatUrl(liveDemo)}</span>
                          <button onClick={() => setDemoIframeKey(k => k + 1)} className="hover:text-txt-main p-0.5 cursor-pointer">
                            <RefreshCw size={10} />
                          </button>
                        </div>
                        <iframe
                          key={demoIframeKey}
                          src={formatUrl(liveDemo)}
                          className="w-full h-[280px] bg-white border-0"
                          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                        />
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[9px] uppercase tracking-widest text-txt-muted">Prototype Demo URL</span>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => setIsEditingDemo(false)}
                          className="text-[9px] font-mono uppercase text-txt-muted hover:underline cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button 
                          onClick={saveLiveDemo}
                          className="text-[9px] font-mono uppercase text-accent-main font-bold hover:underline cursor-pointer"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                    <input 
                      type="text"
                      placeholder="project-demo.vercel.app"
                      value={tempDemo}
                      onChange={(e) => {
                        setTempDemo(e.target.value);
                        if (demoUrlError) setDemoUrlError(null);
                      }}
                      className="h-8 px-2.5 border border-border-main/80 bg-bg-base text-txt-main rounded-sm text-xs placeholder:text-txt-muted/50 focus:outline-none focus:border-txt-main transition-colors font-mono"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") saveLiveDemo();
                      }}
                    />
                    {demoUrlError && (
                      <span className="text-[10px] font-mono text-red-400/80 bg-red-950/20 border border-red-500/20 px-2 py-0.5 rounded flex items-center gap-1.5 select-none">
                        <AlertCircle size={10} className="text-red-400/70 shrink-0" />
                        {demoUrlError}
                      </span>
                    )}
                  </>
                )}
              </div>

              {/* Live Git Commit Ticker */}
              <div className="border border-border-main/70 bg-bg-surface p-4 rounded-sm flex flex-col gap-3">
                <div className="flex items-center justify-between border-b border-border-main/40 pb-2">
                  <span className="font-mono text-[9px] uppercase tracking-widest text-txt-muted">Git Commit Feed</span>
                  <Clock size={11} className="text-txt-main animate-pulse" />
                </div>
                <div className="flex flex-col gap-3">
                  {commits.length > 0 ? (
                    commits.map((c, idx) => (
                      <div key={idx} className="flex flex-col gap-0.5 font-mono text-[10px]">
                        <div className="flex justify-between items-center text-txt-main font-semibold">
                          <span className="text-txt-muted font-normal">[{c.hash}]</span>
                          <span>{c.author}</span>
                        </div>
                        <p className="text-[9px] text-txt-sub leading-normal truncate">{c.message}</p>
                        <span className="text-[8px] text-txt-muted self-end mt-0.5">{c.time}</span>
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col gap-1 py-3 px-2 text-center items-center justify-center border border-dashed border-border-main/40 rounded bg-bg-surface/50">
                      <AlertCircle size={14} className="text-txt-muted/60 mb-0.5" />
                      <span className="text-[10px] font-mono text-txt-main font-medium">
                        {!githubRepo || !githubRepo.trim() ? "No repository connected" : "No repository found"}
                      </span>
                      <span className="text-[9px] font-mono text-txt-muted/80 leading-relaxed max-w-[210px]">
                        {!githubRepo || !githubRepo.trim()
                          ? "Attach your GitHub repository link above to display live commit activity."
                          : "The repository link does not exist or is private."}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {activeTab === "tasks" && (() => {
            const teamTasksList = tasks.filter(t => t.scope !== "self");
            const selfTasksList = tasks.filter(t => t.scope === "self");

            const renderTaskCard = (t: WorkspaceTask) => (
              <div key={t.id} className="border border-border-main/70 bg-bg-surface p-3 rounded-sm flex flex-col gap-2 relative group hover:border-border-main transition-colors">
                <div className="flex justify-between items-start gap-2">
                  <div className="flex items-center gap-1.5 flex-1 min-w-0">
                    <span className={`text-xs text-txt-main font-medium truncate ${t.status === "done" ? "line-through text-txt-muted/70" : ""}`}>
                      {t.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <span className={`text-[8px] font-mono uppercase px-1.5 py-0.5 rounded border ${
                      t.scope === "self" 
                        ? "bg-purple-500/10 border-purple-500/30 text-purple-400" 
                        : "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                    }`}>
                      {t.scope === "self" ? "Self" : "Team"}
                    </span>
                    <span className={`text-[8px] font-mono uppercase px-1.5 py-0.5 rounded border ${
                      t.priority === "high" ? "bg-red-500/10 border-red-500/30 text-red-400" : "bg-bg-card border-border-main/50 text-txt-muted"
                    }`}>
                      {t.priority}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDeleteTask(t.id)}
                      className="p-1 text-txt-muted/50 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors cursor-pointer"
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>
                </div>

                <div className="flex justify-between items-center text-[9px] font-mono text-txt-muted pt-1.5 border-t border-border-main/30">
                  <span className="flex items-center gap-1 text-txt-muted/80">
                    {t.scope === "self" ? <User size={10} className="text-purple-400" /> : <Users size={10} className="text-emerald-400" />}
                    {t.assignee}
                  </span>
                  <div className="flex gap-1">
                    {(["todo", "in_progress", "done"] as const).map(st => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => handleUpdateTaskStatus(t.id, st)}
                        className={`px-1.5 py-0.5 rounded uppercase cursor-pointer transition-colors ${
                          t.status === st ? "bg-accent-main text-bg-base font-bold" : "hover:text-txt-main text-txt-muted"
                        }`}
                      >
                        {st === "in_progress" ? "doing" : st}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            );

            return (
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between border-b border-border-main/40 pb-4">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-mono text-[9px] uppercase tracking-widest text-txt-muted">Task & Milestone Manager</span>
                    <h2 className="font-display text-lg font-light text-txt-main">Workspace Action Items</h2>
                  </div>
                  <span className="text-[9px] font-mono text-txt-muted uppercase tracking-wider bg-bg-card border border-border-main/60 px-2.5 py-1 rounded font-normal">
                    {completedTasksCount} / {tasks.length || 1} Done
                  </span>
                </div>

                {/* Scope Filter Tabs */}
                <div className="flex items-center gap-1 bg-bg-card p-1 rounded border border-border-main/60 font-mono text-[9px] uppercase tracking-wider overflow-x-auto">
                  <button
                    type="button"
                    onClick={() => setTaskFilter("all")}
                    className={`flex-1 h-7 px-2 rounded transition-colors cursor-pointer flex items-center justify-center gap-1.5 leading-none whitespace-nowrap shrink-0 ${
                      taskFilter === "all" ? "bg-bg-surface text-txt-main font-medium border border-border-main/80 shadow-xs" : "text-txt-muted hover:text-txt-main font-normal"
                    }`}
                  >
                    <Layers size={10} className="shrink-0 text-txt-muted" />
                    <span className="whitespace-nowrap">All Tasks ({tasks.length})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setTaskFilter("team")}
                    className={`flex-1 h-7 px-2 rounded transition-colors cursor-pointer flex items-center justify-center gap-1.5 leading-none whitespace-nowrap shrink-0 ${
                      taskFilter === "team" ? "bg-bg-surface text-txt-main font-medium border border-border-main/80 shadow-xs" : "text-txt-muted hover:text-txt-main font-normal"
                    }`}
                  >
                    <Users size={10} className="shrink-0 text-txt-muted" />
                    <span className="whitespace-nowrap">Team ({teamTasksList.length})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setTaskFilter("self")}
                    className={`flex-1 h-7 px-2 rounded transition-colors cursor-pointer flex items-center justify-center gap-1.5 leading-none whitespace-nowrap shrink-0 ${
                      taskFilter === "self" ? "bg-bg-surface text-txt-main font-medium border border-border-main/80 shadow-xs" : "text-txt-muted hover:text-txt-main font-normal"
                    }`}
                  >
                    <User size={10} className="shrink-0 text-txt-muted" />
                    <span className="whitespace-nowrap">Self ({selfTasksList.length})</span>
                  </button>
                </div>

                {/* Add Task Form */}
                <form onSubmit={handleAddTask} className="flex flex-col gap-2.5 bg-bg-surface border border-border-main/70 p-3 rounded-sm">
                  <input
                    type="text"
                    placeholder="Add a new task title..."
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    className="h-8 px-2.5 bg-bg-base border border-border-main/80 rounded-sm text-xs text-txt-main placeholder:text-txt-muted/50 focus:outline-none focus:border-txt-main font-sans"
                  />
                  
                  <div className="flex flex-wrap justify-between items-center gap-2">
                    {/* Task Scope Selector Pill */}
                    <div className="flex items-center gap-1 bg-bg-base p-0.5 border border-border-main/80 rounded-sm font-mono text-[9px] uppercase">
                      <button
                        type="button"
                        onClick={() => setNewTaskScope("team")}
                        className={`px-2 py-1 rounded-xs transition-colors flex items-center gap-1 cursor-pointer ${
                          newTaskScope === "team" ? "bg-bg-card text-txt-main font-medium border border-border-main/60" : "text-txt-muted hover:text-txt-main"
                        }`}
                      >
                        <Users size={9} /> Team
                      </button>
                      <button
                        type="button"
                        onClick={() => setNewTaskScope("self")}
                        className={`px-2 py-1 rounded-xs transition-colors flex items-center gap-1 cursor-pointer ${
                          newTaskScope === "self" ? "bg-bg-card text-txt-main font-medium border border-border-main/60" : "text-txt-muted hover:text-txt-main"
                        }`}
                      >
                        <User size={9} /> Self
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <select
                        value={newTaskPriority}
                        onChange={(e) => setNewTaskPriority(e.target.value as any)}
                        className="h-7 px-2 bg-bg-base border border-border-main/80 rounded-sm text-[10px] font-mono text-txt-main focus:outline-none cursor-pointer"
                      >
                        <option value="high">High Priority</option>
                        <option value="medium">Medium Priority</option>
                        <option value="low">Low Priority</option>
                      </select>
                      <button
                        type="submit"
                        className="h-7 px-3 bg-accent-main text-bg-base font-mono text-[9px] uppercase tracking-wider rounded-sm font-semibold hover:opacity-90 transition-opacity cursor-pointer flex items-center gap-1"
                      >
                        <Plus size={11} /> Add Task
                      </button>
                    </div>
                  </div>
                </form>

                {/* Team Tasks Section */}
                {(taskFilter === "all" || taskFilter === "team") && (
                  <div className="flex flex-col gap-2 border border-border-main/50 bg-bg-surface/30 p-3 rounded-sm">
                    <div className="flex items-center justify-between border-b border-border-main/30 pb-1.5">
                      <span className="font-mono text-[9px] uppercase tracking-widest text-txt-muted flex items-center gap-1.5">
                        <Users size={11} /> Workspace Team ({teamTasksList.length})
                      </span>
                      <span className="text-[8px] font-mono text-txt-muted/70 uppercase">Shared with teammates</span>
                    </div>

                    {teamTasksList.length > 0 ? (
                      <div className="flex flex-col gap-2 mt-1">
                        {teamTasksList.map(renderTaskCard)}
                      </div>
                    ) : (
                      <span className="text-[10px] font-mono text-txt-muted/60 font-light italic py-2 text-center">
                        No team tasks created yet. Add a task above for your team.
                      </span>
                    )}
                  </div>
                )}

                {/* Self Tasks Section */}
                {(taskFilter === "all" || taskFilter === "self") && (
                  <div className="flex flex-col gap-2 border border-border-main/50 bg-bg-surface/30 p-3 rounded-sm">
                    <div className="flex items-center justify-between border-b border-border-main/30 pb-1.5">
                      <span className="font-mono text-[9px] uppercase tracking-widest text-txt-muted flex items-center gap-1.5">
                        <User size={11} /> Personal Self ({selfTasksList.length})
                      </span>
                      <span className="text-[8px] font-mono text-txt-muted/70 uppercase">Private to you</span>
                    </div>

                    {selfTasksList.length > 0 ? (
                      <div className="flex flex-col gap-2 mt-1">
                        {selfTasksList.map(renderTaskCard)}
                      </div>
                    ) : (
                      <span className="text-[10px] font-mono text-txt-muted/60 font-light italic py-2 text-center">
                        No personal tasks yet. Add a self task above for your private checklist.
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })()}

          {activeTab === "artifacts" && (
            <>
              {/* 4 Active Artifact Slots Header */}
              <div className="flex items-center justify-between border-b border-border-main/40 pb-4">
                <div className="flex flex-col gap-0.5">
                  <span className="font-mono text-[9px] uppercase tracking-widest text-txt-muted">Project Artifact Vault</span>
                  <h2 className="font-display text-lg font-light text-txt-main">Active Deliverable Decks</h2>
                </div>
                <span className="text-[9px] font-mono text-txt-muted uppercase tracking-wider bg-bg-card border border-border-main/60 px-2.5 py-1 rounded font-normal">
                  {activeSlotArtifacts.filter(Boolean).length} / 4 Slots Filled
                </span>
              </div>

              {/* 4 Slot Cards Stacked List (One After Another Layout) */}
              <div className="flex flex-col gap-3.5 w-full">
                {[0, 1, 2, 3].map(slotIdx => {
                  const slotArtifact = activeSlotArtifacts[slotIdx];
                  const defaultSlotTitle = slotNames[slotIdx] || `Slot ${slotIdx + 1}`;
                  const isEditingThisSlot = editingSlotIndex === slotIdx;

                  return (
                    <div key={slotIdx} className="border border-border-main/70 bg-bg-surface p-3.5 rounded-sm flex flex-col gap-3 relative group w-full overflow-hidden">
                      {/* Slot Name Header & Edit */}
                      <div className="flex justify-between items-center gap-2 border-b border-border-main/30 pb-2 w-full min-w-0">
                        {isEditingThisSlot ? (
                          <div className="flex items-center gap-2 w-full min-w-0">
                            <input
                              type="text"
                              value={tempSlotName}
                              onChange={(e) => setTempSlotName(e.target.value)}
                              className="bg-bg-card border border-accent-main/50 px-2.5 py-1 text-xs text-txt-main rounded-sm focus:outline-none w-full font-mono min-w-0"
                              placeholder="Enter slot name..."
                              autoFocus
                            />
                            <button onClick={() => saveSlotName(slotIdx)} className="p-1 text-emerald-400 hover:bg-emerald-500/10 rounded cursor-pointer shrink-0">
                              <Check size={14} />
                            </button>
                            <button onClick={() => setEditingSlotIndex(null)} className="p-1 text-txt-muted hover:bg-bg-card rounded cursor-pointer shrink-0">
                              <X size={14} />
                            </button>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-center gap-2 min-w-0 shrink flex-1">
                              <span className="font-mono text-[9px] text-accent-main font-bold shrink-0 bg-accent-main/10 border border-accent-main/30 px-1.5 py-0.5 rounded">SLOT {slotIdx + 1}</span>
                              <span className="text-xs font-semibold text-txt-main truncate min-w-0">{defaultSlotTitle}</span>
                            </div>
                            <button
                              onClick={() => {
                                setEditingSlotIndex(slotIdx);
                                setTempSlotName(defaultSlotTitle);
                              }}
                              className="opacity-80 lg:opacity-0 group-hover:opacity-100 transition-opacity text-txt-muted hover:text-txt-main p-1 cursor-pointer shrink-0"
                            >
                              <Edit3 size={12} />
                            </button>
                          </>
                        )}
                      </div>

                      {/* Slot Content */}
                      {slotArtifact ? (
                        <div className="flex flex-col gap-2.5 bg-bg-card/40 p-3 rounded-sm border border-border-main/50 w-full min-w-0 overflow-hidden">
                          <div className="flex items-center justify-between gap-2 min-w-0 w-full">
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                              <FileText size={14} className="text-accent-main shrink-0" />
                              <span className="text-xs text-txt-main font-medium truncate min-w-0">
                                {slotArtifact.file_name}
                              </span>
                            </div>
                            <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-1.5 py-0.5 rounded font-bold shrink-0">
                              v{slotArtifact.version}
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-[9px] text-txt-muted font-mono pt-2 border-t border-border-main/20 gap-2 min-w-0 w-full flex-wrap">
                            <span className="truncate max-w-[180px]">Uploaded by {slotArtifact.uploaded_by}</span>
                            
                            <div className="flex items-center gap-2 shrink-0">
                              <button
                                onClick={() => handleOpenPreview(slotArtifact)}
                                className="text-accent-main hover:underline flex items-center gap-1 cursor-pointer font-semibold bg-accent-main/10 border border-accent-main/30 px-2 py-0.5 rounded"
                              >
                                <Eye size={11} />
                                View File
                              </button>
                              <a
                                href={slotArtifact.file_url}
                                download
                                className="text-txt-sub hover:text-txt-main flex items-center gap-1 hover:underline bg-bg-surface border border-border-main/50 px-2 py-0.5 rounded"
                              >
                                <FolderDown size={11} />
                                Download
                              </a>
                            </div>
                          </div>

                          <button
                            onClick={() => triggerSlotUpload(slotIdx)}
                            disabled={isUploading}
                            className="mt-1 w-full h-7 border border-border-main/60 border-dashed text-[9px] font-mono tracking-wider uppercase rounded-sm hover:bg-bg-card flex items-center justify-center gap-1.5 transition-colors cursor-pointer text-txt-muted hover:text-txt-main"
                          >
                            <CloudUpload size={11} />
                            Replace File (Upload v{slotArtifact.version + 1})
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center gap-2 py-5 border border-dashed border-border-main/50 bg-bg-base/40 rounded-sm w-full">
                          <span className="text-[10px] text-txt-muted font-light italic">Slot Empty — No active deliverable attached</span>
                          <button
                            onClick={() => triggerSlotUpload(slotIdx)}
                            disabled={isUploading}
                            className="h-7 px-3 bg-accent-main/10 border border-accent-main/40 text-accent-main hover:bg-accent-main hover:text-bg-base text-[9px] font-mono tracking-wider uppercase rounded-sm flex items-center gap-1.5 transition-all cursor-pointer font-bold"
                          >
                            <CloudUpload size={11} />
                            Upload to Slot {slotIdx + 1}
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* File upload hidden input */}
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                className="hidden" 
                accept=".pdf,.ppt,.pptx,.doc,.docx,.png,.jpg,.jpeg,.svg,.webp,.txt,.json,.zip"
              />

              {/* Version History Drawer List */}
              <div className="border border-border-main/70 bg-bg-surface p-4 rounded-sm flex flex-col gap-3">
                <div className="flex justify-between items-center border-b border-border-main/30 pb-2">
                  <span className="font-mono text-[9px] uppercase tracking-widest text-txt-muted">Slot-Grouped Version History</span>
                  <span className="text-[9px] font-mono text-txt-muted">{archivedArtifacts.length} Archived Versions</span>
                </div>

                <div className="flex flex-col gap-2.5">
                  {archivedArtifacts.map(art => (
                    <div key={art.id} className="flex items-center justify-between border-b border-border-main/40 pb-2 text-[10px] font-mono">
                      <div className="flex flex-col min-w-0 pr-2">
                        <div className="flex items-center gap-1.5">
                          <span className="text-txt-main font-semibold truncate">{art.file_name}</span>
                          <span className="text-[8px] text-txt-muted bg-bg-card border border-border-main px-1 rounded">v{art.version}</span>
                          {art.slot_name && (
                            <span className="text-[8px] text-accent-main font-mono">[{art.slot_name}]</span>
                          )}
                        </div>
                        <span className="text-[8px] text-txt-muted">by {art.uploaded_by} • {new Date(art.created_at).toLocaleDateString()}</span>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => handleOpenPreview(art)}
                          className="text-accent-main hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                        >
                          <Eye size={11} />
                          View
                        </button>
                        <a href={art.file_url} download className="text-txt-sub hover:underline flex items-center gap-1">
                          Get
                        </a>
                      </div>
                    </div>
                  ))}

                  {archivedArtifacts.length === 0 && (
                    <span className="text-[10px] text-txt-muted font-light italic text-center py-2">No archived versions yet.</span>
                  )}
                </div>
              </div>
            </>
          )}

          {activeTab === "notes" && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-border-main/40 pb-4">
                <div className="flex flex-col gap-0.5">
                  <span className="font-mono text-[9px] uppercase tracking-widest text-txt-muted">Shared Scratchpad</span>
                  <h2 className="font-display text-lg font-light text-txt-main">Collaborative Session Notes</h2>
                </div>
                <span className="text-[9px] font-mono text-txt-muted uppercase tracking-wider bg-bg-card border border-border-main/60 px-2.5 py-1 rounded font-normal flex items-center gap-1.5">
                  <span className="text-emerald-500/80 font-medium">●</span> Live Auto-saved
                </span>
              </div>
              <textarea
                rows={16}
                value={workspaceNotes}
                onChange={(e) => {
                  const val = e.target.value;
                  setWorkspaceNotes(val);
                  localStorage.setItem(`ldk_workspace_notes_${id}`, val);
                  if (activeChannelRef.current) {
                    try {
                      activeChannelRef.current.send({
                        type: "broadcast",
                        event: "workspace_sync",
                        payload: { action: "notes", data: val }
                      });
                    } catch {}
                  }
                  broadcastLocalEvent("notes_update", val);
                  if (workspaceUuid) {
                    (async () => {
                      try {
                        await supabase.from("project_spaces").update({ notes: val }).eq("id", workspaceUuid);
                      } catch {}
                    })();
                  }
                }}
                placeholder="Write team notes, API specs, architectural decisions..."
                className="w-full p-3 bg-bg-surface border border-border-main/70 rounded-sm text-xs font-mono text-txt-main focus:outline-none focus:border-txt-main leading-relaxed"
              />
            </div>
          )}

          {activeTab === "credits" && (
            <div className="border border-border-main/70 bg-bg-surface p-4 rounded-sm flex flex-col gap-3">
              <div className="flex items-center justify-between border-b border-border-main/40 pb-2">
                <span className="font-mono text-[9px] uppercase tracking-widest text-txt-muted font-bold">Academic Verification</span>
                <Award size={14} className="text-txt-main" />
              </div>
              
              {claimStatus === "idle" && (
                <button 
                  onClick={handleClaimCredits}
                  disabled={isSubmittingClaim}
                  className="w-full h-9 bg-accent-main hover:opacity-90 disabled:opacity-50 text-bg-base text-[10px] font-mono tracking-wider uppercase rounded-sm flex items-center justify-center gap-1.5 transition-opacity cursor-pointer font-bold"
                >
                  {isSubmittingClaim ? "Submitting Claim..." : "Claim Campus Credits"}
                </button>
              )}

              {claimStatus === "pending" && (
                <div className="border border-border-main/60 p-2.5 rounded-sm bg-bg-card/50 flex flex-col gap-1 text-center">
                  <span className="text-[10px] font-semibold text-txt-main">Verification Pending</span>
                  <p className="text-[9px] text-txt-muted font-light leading-relaxed">
                    Submitted to department verifier for review.
                  </p>
                </div>
              )}

              {claimStatus === "approved" && (
                <div className="border border-emerald-500/20 p-2.5 rounded-sm bg-emerald-500/5 flex flex-col gap-1 text-center">
                  <span className="text-[10px] font-semibold text-emerald-500">Credits Approved</span>
                  <p className="text-[9px] text-txt-muted font-light leading-relaxed">
                    10 academic points credited to profile.
                  </p>
                </div>
              )}

              {claimStatus === "rejected" && (
                <div className="border border-red-500/20 p-2.5 rounded-sm bg-red-500/5 flex flex-col gap-1 text-center font-bold">
                  <span className="text-[10px] font-semibold text-red-500">Claim Rejected</span>
                  <p className="text-[9px] text-txt-muted font-light leading-relaxed">
                    Please review files or contact coordinator.
                  </p>
                </div>
              )}
            </div>
          )}

        </section>

          </motion.main>
        )}
      </AnimatePresence>

      {/* Invite Friends Modal */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-[100] overflow-hidden font-sans">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" 
            onClick={() => setIsInviteModalOpen(false)}
          />

          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="max-w-md w-full border border-border-main/70 bg-bg-surface p-6 rounded-md shadow-2xl flex flex-col gap-6 animate-fade-in relative z-[110]">
              
              <div className="flex justify-between items-start border-b border-border-main/40 pb-3">
                <div className="flex flex-col gap-0.5">
                  <span className="font-mono text-[9px] uppercase tracking-widest text-txt-muted">Workspace invite</span>
                  <h3 className="font-display text-lg font-semibold text-txt-main">Invite Classmates to Collaborate</h3>
                </div>
                <button 
                  onClick={() => setIsInviteModalOpen(false)}
                  className="p-1 rounded-full hover:bg-bg-card text-txt-muted hover:text-txt-main cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Shareable Link Block */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] text-txt-sub font-semibold uppercase tracking-wider">Shareable Invite Link</span>
                <div className="flex gap-2">
                  <input 
                    type="text"
                    readOnly
                    value={typeof window !== "undefined" ? `${window.location.origin}/workspace/${id}?join=true` : ""}
                    className="flex-1 h-9 px-2.5 border border-border-main/80 bg-bg-base text-txt-main rounded-sm text-xs focus:outline-none font-mono text-ellipsis overflow-hidden"
                  />
                  <button 
                    onClick={copyInviteLink}
                    className="h-9 px-3 bg-accent-main hover:opacity-90 text-bg-base text-xs font-mono uppercase tracking-wider rounded-sm transition-opacity cursor-pointer font-bold flex items-center gap-1"
                  >
                    {copiedLink ? "Copied" : "Copy Link"}
                  </button>
                </div>
              </div>

              {/* Direct Invite Friends Block */}
              <div className="flex flex-col gap-2.5">
                <span className="text-[10px] text-txt-sub font-semibold uppercase tracking-wider">Direct Invite Friends</span>
                
                <div className="max-h-56 overflow-y-auto border border-border-main/60 rounded bg-bg-base/30 divide-y divide-border-main/60">
                  {friendsToInvite.filter(f => !roomMembers.some(m => m.id === f.id)).length > 0 ? (
                    friendsToInvite.filter(f => !roomMembers.some(m => m.id === f.id)).map(f => {
                      const isAlreadyInvited = sentInviteIds.includes(f.id);
                      return (
                        <div key={f.id} className="p-3 flex justify-between items-center gap-4 bg-bg-surface">
                          <div className="flex flex-col text-left">
                            <span className="text-xs text-txt-main font-semibold">{f.full_name}</span>
                            <span className="text-[9px] text-txt-muted font-mono">@{f.username}</span>
                          </div>
                          <button 
                            onClick={() => handleSendDirectInvite(f.id, f.full_name)}
                            disabled={invitingFriendId === f.id}
                            className="h-7 px-3 text-[9px] font-mono tracking-wider uppercase rounded-sm flex items-center gap-1 transition-all bg-accent-main hover:opacity-90 disabled:opacity-50 text-bg-base cursor-pointer font-bold"
                          >
                            {invitingFriendId === f.id ? "Inviting..." : isAlreadyInvited ? "Re-send Invite" : "Send Invite"}
                          </button>
                        </div>
                      );
                    })
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

      {showActiveMembersModal && (
        <div className="fixed inset-0 z-[100] overflow-hidden font-sans text-left bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="max-w-md w-full border border-border-main/70 bg-bg-surface p-6 rounded-md shadow-2xl flex flex-col gap-6 relative z-[110]">
            
            <div className="flex justify-between items-start border-b border-border-main/40 pb-3">
              <div className="flex flex-col gap-0.5">
                <span className="font-mono text-[9px] uppercase tracking-widest text-txt-muted">Registry Desk</span>
                <h3 className="font-display text-lg font-semibold text-txt-main font-bold">Workspace Team Members</h3>
              </div>
              <button 
                onClick={() => setShowActiveMembersModal(false)}
                className="p-1 rounded-full hover:bg-bg-card text-txt-muted hover:text-txt-main cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>
            {/* Members List */}
            <div className="flex flex-col gap-3.5 max-h-[300px] overflow-y-auto pr-1">
              {roomMembers.map((member) => (
                <div 
                  key={member.id} 
                  className={`flex items-center justify-between p-3 border rounded-sm transition-all duration-200 ${
                    member.isOnline 
                      ? "border-emerald-500/30 bg-emerald-500/5 shadow-[0_0_10px_rgba(16,185,129,0.04)]" 
                      : "border-border-main/60 bg-bg-base/40"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Avatar with status ring */}
                    <div className={`relative w-8 h-8 rounded-full flex items-center justify-center font-mono text-xs font-bold text-txt-main overflow-hidden flex-shrink-0 ${
                      member.isOnline ? "ring-1 ring-emerald-500/85 border border-emerald-500/40" : "border border-border-main/80 bg-bg-card"
                    }`}>
                      <span className="font-mono text-xs font-bold text-txt-main uppercase">{member.name.charAt(0)}</span>
                      {member.avatarUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={member.avatarUrl} alt={member.name} className="absolute inset-0 w-full h-full object-cover" 
                          onError={(e) => { 
                            (e.target as HTMLImageElement).style.display = 'none';
                          }} 
                        />
                      )}
                    </div>

                    <div className="flex flex-col min-w-0 text-left">
                      <span className="text-xs font-semibold text-txt-main truncate">{member.name}</span>
                    </div>
                  </div>

                  <div>
                    {member.isOnline ? (
                      <span className="text-[8px] font-mono tracking-widest uppercase bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-2 py-0.5 rounded">
                        Online
                      </span>
                    ) : (
                      <span className="text-[8px] font-mono tracking-widest uppercase bg-bg-card text-txt-muted border border-border-main px-2 py-0.5 rounded">
                        Offline
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <button 
              onClick={() => {
                setShowActiveMembersModal(false);
                setIsInviteModalOpen(true);
              }}
              className="w-full h-10 bg-accent-main hover:opacity-90 text-bg-base text-xs font-mono tracking-wider uppercase rounded-sm flex items-center justify-center gap-1.5 cursor-pointer font-semibold"
            >
              <Plus size={14} /> Invite New Collaborator
            </button>

          </div>
        </div>
      )}

      {message && (
        <div className="fixed bottom-6 right-6 z-[100] animate-fade-in text-left">
          <div className={`px-4 py-3 rounded border text-xs font-mono tracking-wide shadow-2xl flex items-center gap-2 ${
            message.type === "success" 
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500" 
              : "bg-red-500/10 border-red-500/30 text-red-500"
          }`}>
            <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" />
            {message.text}
          </div>
        </div>
      )}

      {/* Custom Leave Workspace Confirmation Modal */}
      {showLeaveConfirmModal && (
        <div className="fixed inset-0 z-[150] overflow-hidden font-sans text-left bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="max-w-xs w-full border border-border-main/80 bg-bg-surface p-6 rounded-md shadow-2xl flex flex-col gap-4 relative z-[160]">
            <div className="flex flex-col gap-1.5 text-center">
              <span className="font-mono text-[9px] uppercase tracking-widest text-red-400 font-bold">Leave Workspace</span>
              <h3 className="font-display text-base font-semibold text-txt-main font-bold">Leave this workspace?</h3>
              <p className="text-[11px] text-txt-muted font-light leading-relaxed">
                You will be removed from the active member roster for <strong className="text-txt-main font-medium">{projectName}</strong>.
              </p>
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowLeaveConfirmModal(false)}
                className="flex-1 h-8 rounded bg-bg-card border border-border-main/80 text-txt-muted hover:text-txt-main text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  setShowLeaveConfirmModal(false);
                  try {
                    if (user) {
                      await Promise.allSettled([
                        deleteWallCalendarEvent(id, user.id),
                        deleteWallCalendarEvent(workspaceUuid, user.id),
                        supabase
                          .from("wall_calendar_events")
                          .delete()
                          .or(`source_id.eq.${id},source_id.eq.${workspaceUuid}`)
                          .eq("user_id", user.id)
                      ]);

                      fetch("/api/workspace/leave", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          workspaceId: id,
                          workspaceUuid: workspaceUuid || id,
                          userId: user.id
                        })
                      }).catch(() => {});

                      await supabase
                        .from("project_members")
                        .delete()
                        .or(`project_space_id.eq.${workspaceUuid},project_space_id.eq.${id}`)
                        .eq("profile_id", user.id);
                    }
                    if (typeof window !== "undefined") {
                      const storedKey = `ldk_workspace_members_${id}`;
                      const storedStr = localStorage.getItem(storedKey);
                      if (storedStr) {
                        const storedList = JSON.parse(storedStr);
                        const updated = storedList.filter((m: any) => m.id !== user?.id);
                        localStorage.setItem(storedKey, JSON.stringify(updated));
                      }

                      const joinedStr = localStorage.getItem("ldk_joined_workspaces");
                      const joinedIds: string[] = joinedStr ? JSON.parse(joinedStr) : [];
                      const filteredJoined = joinedIds.filter(jId => jId !== id);
                      localStorage.setItem("ldk_joined_workspaces", JSON.stringify(filteredJoined));

                      const eventsStr = localStorage.getItem("ldk_events");
                      if (eventsStr) {
                        const eventsList = JSON.parse(eventsStr);
                        const filteredEvents = eventsList.filter((e: any) => e.id !== id);
                        localStorage.setItem("ldk_events", JSON.stringify(filteredEvents));
                      }

                      const deletedStr = localStorage.getItem("ldk_deleted_workspaces");
                      const deletedIds: string[] = deletedStr ? JSON.parse(deletedStr) : [];
                      if (!deletedIds.includes(id)) {
                        deletedIds.push(id);
                        localStorage.setItem("ldk_deleted_workspaces", JSON.stringify(deletedIds));
                      }

                      localStorage.removeItem(`ldk_sent_invites_${id}`);
                      window.dispatchEvent(new CustomEvent("ldk_events_update"));
                    }
                    router.push("/event-desk");
                  } catch (err) {
                    console.error("Error leaving workspace: ", err);
                    router.push("/event-desk");
                  }
                }}
                className="flex-1 h-8 rounded bg-red-500/90 hover:bg-red-500 text-white text-xs font-mono uppercase tracking-wider font-bold transition-opacity cursor-pointer shadow-sm"
              >
                Leave
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Event Details & Stage Briefs Custom Modal */}
      {showBriefModal && (
        <div className="fixed inset-0 z-[10000] overflow-hidden font-sans">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setShowBriefModal(false)} />
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="bg-bg-surface border border-border-main/80 max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 rounded-md flex flex-col gap-6 shadow-2xl animate-fade-in text-left">
              
              <div className="flex justify-between items-start border-b border-border-main/40 pb-4">
                <div className="flex flex-col gap-1">
                  <span className="font-mono text-[9px] uppercase tracking-widest text-accent-main font-semibold">
                    {eventMetadata.organization} • Official Brief
                  </span>
                  <h2 className="text-xl font-display font-light text-txt-main">{eventMetadata.title}</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setShowBriefModal(false)}
                  className="p-1 rounded hover:bg-bg-base text-txt-muted hover:text-txt-main transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Prize & Deadline Highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3.5 bg-bg-base/60 border border-emerald-500/30 rounded flex flex-col gap-1">
                  <span className="text-[9px] font-mono uppercase tracking-wider text-emerald-400 font-bold">Prize Pool & Rewards</span>
                  <span className="text-xs font-semibold text-txt-main font-display">{eventMetadata.prizes}</span>
                </div>
                <div className="p-3.5 bg-bg-base/60 border border-accent-main/30 rounded flex flex-col gap-1">
                  <span className="text-[9px] font-mono uppercase tracking-wider text-accent-main font-bold">Final Target Deadline</span>
                  <span className="text-xs font-semibold text-txt-main font-mono">{eventMetadata.deadline}</span>
                </div>
              </div>

              {/* Description & Guidelines */}
              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-txt-muted font-bold">Event Description & Rules</span>
                <p className="text-xs text-txt-sub font-light leading-relaxed bg-bg-base/40 p-4 rounded border border-border-main/50 whitespace-pre-line">
                  {eventMetadata.description}
                  {"\n\n"}
                  <strong className="text-txt-main font-semibold">Official Guidelines & Rules:</strong>
                  {"\n"}
                  {eventMetadata.rules}
                </p>
              </div>

              {/* Stage-by-Stage Detailed Briefs */}
              <div className="flex flex-col gap-3">
                <span className="text-[10px] font-mono uppercase tracking-wider text-txt-muted font-bold">Stage-by-Stage Timeline & Briefs</span>
                <div className="flex flex-col gap-3">
                  {(() => {
                    const cleanBriefs = sanitizeStageItems(realStageItems);
                    return cleanBriefs.map((stg, idx) => {
                      const isPast = isDatePassed(stg.deadline);
                      const isCurrentActive = !isPast && (idx === 0 || isDatePassed(cleanBriefs[idx - 1]?.deadline));

                      return (
                        <div 
                          key={idx} 
                          className={`p-3.5 bg-bg-base/50 rounded flex flex-col gap-1 ${
                            isCurrentActive 
                              ? "border border-accent-main/40 ring-1 ring-accent-main/20" 
                              : "border border-border-main/60"
                          }`}
                        >
                          <div className="flex justify-between items-center gap-2">
                            <span className={`text-xs font-semibold font-display ${isCurrentActive ? "text-accent-main" : "text-txt-main"}`}>
                              {idx + 1}. {stg.title}
                            </span>
                            <span className={`text-[9px] font-mono font-bold uppercase shrink-0 ${
                              isPast ? "text-emerald-400" : isCurrentActive ? "text-accent-main" : "text-txt-muted"
                            }`}>
                              {isPast ? "Passed" : isCurrentActive ? "Active Round" : "Upcoming"}
                            </span>
                          </div>
                          {stg.deadline && (
                            <span className="text-[10px] font-mono text-txt-sub">
                              Target Date: {stg.deadline}
                            </span>
                          )}
                          {stg.brief && (
                            <p className="text-xs text-txt-muted font-light leading-relaxed mt-1">
                              {stg.brief}
                            </p>
                          )}
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>

              {/* Footer Actions */}
              <div className="flex justify-end items-center gap-3 pt-2 border-t border-border-main/40">
                <a
                  href={eventMetadata.url}
                  target="_blank"
                  rel="noreferrer"
                  className="h-8 px-4 bg-accent-main hover:opacity-90 text-bg-base text-[10px] font-mono uppercase font-bold rounded-sm flex items-center gap-1.5 transition-opacity"
                >
                  Open Official Event Link <ExternalLink size={10} />
                </a>
                <button
                  type="button"
                  onClick={() => setShowBriefModal(false)}
                  className="h-8 px-4 border border-border-main/80 hover:bg-bg-base text-txt-main text-[10px] font-mono uppercase rounded-sm transition-colors cursor-pointer"
                >
                  Close Brief
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* In-Browser Document Preview Modal */}
      {isPreviewOpen && previewArtifact && (
        <div className="fixed inset-0 z-[180] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in font-sans">
          <div className="bg-bg-surface border border-border-main/80 rounded-sm w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border-main/50 bg-bg-base">
              <div className="flex items-center gap-2 truncate">
                <Eye size={15} className="text-accent-main" />
                <span className="font-mono text-xs font-semibold text-txt-main truncate">{previewArtifact.file_name}</span>
                <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-1.5 py-0.5 rounded font-bold">v{previewArtifact.version}</span>
                {previewArtifact.slot_name && (
                  <span className="text-[9px] font-mono text-accent-main bg-accent-main/10 border border-accent-main/30 px-1.5 py-0.5 rounded font-bold truncate max-w-[180px]">[{previewArtifact.slot_name}]</span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={previewArtifact.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-7 px-2.5 bg-bg-card hover:bg-border-main/50 text-txt-main text-[10px] font-mono rounded flex items-center gap-1 transition-colors"
                >
                  <ExternalLink size={12} />
                  Open Tab
                </a>
                <a
                  href={previewArtifact.file_url}
                  download
                  className="h-7 px-2.5 bg-accent-main hover:opacity-90 text-bg-base text-[10px] font-mono rounded flex items-center gap-1 font-bold transition-opacity"
                >
                  <FolderDown size={12} />
                  Download
                </a>
                <button
                  onClick={() => setIsPreviewOpen(false)}
                  className="p-1 text-txt-muted hover:text-txt-main hover:bg-bg-card rounded cursor-pointer transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Modal Viewer Body */}
            <div className="p-4 flex-1 overflow-auto bg-bg-base/80 min-h-[400px] flex items-center justify-center">
              {isPreviewLoading ? (
                <div className="flex flex-col items-center gap-2">
                  <span className="h-6 w-6 rounded-full border-2 border-accent-main/30 border-t-accent-main animate-spin" />
                  <span className="text-xs font-mono text-txt-muted">Loading document preview...</span>
                </div>
              ) : (
                (() => {
                  const url = previewArtifact.file_url;
                  const isInvalidUrl = !url || url === "#";

                  if (isInvalidUrl) {
                    return (
                      <div className="flex flex-col items-center justify-center text-center gap-3 p-8 border border-border-main/60 bg-bg-surface rounded-sm max-w-md">
                        <FileText size={40} className="text-yellow-400" />
                        <div className="flex flex-col gap-1">
                          <span className="text-sm font-semibold text-txt-main">{previewArtifact.file_name}</span>
                          <span className="text-xs text-txt-muted">Preview unavailable for mock/placeholder URL. Please click &quot;Replace File&quot; in the slot to attach a live document.</span>
                        </div>
                      </div>
                    );
                  }

                  const ext = previewArtifact.file_name.split(".").pop()?.toLowerCase() || "";
                  const isImage = ["png", "jpg", "jpeg", "gif", "svg", "webp"].includes(ext);
                  const isPdf = ext === "pdf";
                  const isText = ["txt", "md", "json", "js", "ts", "jsx", "tsx", "py", "csv", "html", "css"].includes(ext);

                  if (isImage) {
                    return (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={previewArtifact.file_url}
                        alt={previewArtifact.file_name}
                        className="max-h-[70vh] max-w-full object-contain mx-auto rounded border border-border-main/40 shadow-lg"
                      />
                    );
                  }

                  if (isPdf) {
                    return (
                      <iframe
                        src={previewArtifact.file_url}
                        className="w-full h-[70vh] rounded border border-border-main/50 shadow-inner bg-white"
                      />
                    );
                  }

                  if (isText && previewContent) {
                    return (
                      <pre className="w-full max-h-[70vh] overflow-auto p-4 bg-bg-surface border border-border-main/60 rounded text-xs font-mono text-txt-main whitespace-pre-wrap leading-relaxed">
                        {previewContent}
                      </pre>
                    );
                  }

                  return (
                    <div className="flex flex-col items-center justify-center text-center gap-3 p-8 border border-border-main/60 bg-bg-surface rounded-sm max-w-md">
                      <FileText size={40} className="text-txt-muted" />
                      <div className="flex flex-col gap-1">
                        <span className="text-sm font-semibold text-txt-main">{previewArtifact.file_name}</span>
                        <span className="text-xs text-txt-muted">Binary file format (.{ext}). Download or open in tab to inspect.</span>
                      </div>
                      <a
                        href={previewArtifact.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="h-8 px-4 bg-accent-main text-bg-base text-xs font-mono font-bold rounded flex items-center gap-1.5 hover:opacity-90 transition-opacity"
                      >
                        <ExternalLink size={13} />
                        Open in New Window
                      </a>
                    </div>
                  );
                })()
              )}
            </div>
          </div>
        </div>
      )}

      {/* Interactive Device Simulator Modal for Prototype Demo URL */}
      {showDemoPreviewModal && liveDemo && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-3 sm:p-6">
          <div className="bg-bg-surface border border-border-main/80 rounded-lg shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden">
            {/* Modal Header Bar */}
            <div className="px-4 py-3 border-b border-border-main/50 bg-bg-base flex items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2 min-w-0">
                <span className="font-mono text-[9px] uppercase tracking-widest text-accent-main bg-accent-main/10 border border-accent-main/30 px-2 py-0.5 rounded font-bold shrink-0">
                  LIVE PROTOTYPE SIMULATOR
                </span>
                <span className="text-xs font-mono text-txt-main truncate min-w-0">{formatUrl(liveDemo)}</span>
              </div>

              {/* Viewport Switcher */}
              <div className="flex items-center gap-1 bg-bg-surface p-1 rounded border border-border-main/50 shrink-0">
                <button
                  onClick={() => setDemoViewportMode("desktop")}
                  className={`px-2.5 py-1 text-[10px] font-mono rounded flex items-center gap-1.5 transition-colors cursor-pointer ${
                    demoViewportMode === "desktop" ? "bg-accent-main text-bg-base font-bold" : "text-txt-muted hover:text-txt-main"
                  }`}
                >
                  <Monitor size={12} />
                  <span className="hidden sm:inline">Desktop</span>
                </button>
                <button
                  onClick={() => setDemoViewportMode("tablet")}
                  className={`px-2.5 py-1 text-[10px] font-mono rounded flex items-center gap-1.5 transition-colors cursor-pointer ${
                    demoViewportMode === "tablet" ? "bg-accent-main text-bg-base font-bold" : "text-txt-muted hover:text-txt-main"
                  }`}
                >
                  <Tablet size={12} />
                  <span className="hidden sm:inline">Tablet</span>
                </button>
                <button
                  onClick={() => setDemoViewportMode("mobile")}
                  className={`px-2.5 py-1 text-[10px] font-mono rounded flex items-center gap-1.5 transition-colors cursor-pointer ${
                    demoViewportMode === "mobile" ? "bg-accent-main text-bg-base font-bold" : "text-txt-muted hover:text-txt-main"
                  }`}
                >
                  <Smartphone size={12} />
                  <span className="hidden sm:inline">Mobile</span>
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setDemoIframeKey(k => k + 1)}
                  className="p-1.5 text-txt-muted hover:text-txt-main hover:bg-bg-surface rounded transition-colors cursor-pointer"
                >
                  <RefreshCw size={14} />
                </button>
                <a
                  href={formatUrl(liveDemo)}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1.5 text-txt-muted hover:text-txt-main hover:bg-bg-surface rounded transition-colors"
                >
                  <ExternalLink size={14} />
                </a>
                <button
                  onClick={() => setShowDemoPreviewModal(false)}
                  className="p-1.5 text-txt-muted hover:text-txt-main hover:bg-bg-surface rounded transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Device Frame Viewport Body */}
            <div className="flex-1 bg-bg-base/90 p-4 flex items-center justify-center overflow-auto">
              <div className={`transition-all duration-300 flex items-center justify-center h-full w-full ${
                demoViewportMode === "mobile"
                  ? "max-w-[375px] max-h-[667px]"
                  : demoViewportMode === "tablet"
                  ? "max-w-[768px] max-h-[750px]"
                  : "max-w-full h-full"
              }`}>
                <iframe
                  key={demoIframeKey}
                  src={formatUrl(liveDemo)}
                  className="w-full h-full rounded border border-border-main/60 bg-white shadow-2xl"
                  sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Full-Screen Chat Image Lightbox Modal */}
      {chatImagePreviewUrl && (
        <div 
          onClick={() => setChatImagePreviewUrl(null)}
          className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-4 sm:p-8 animate-fadeIn select-none"
        >
          <div className="absolute top-4 right-4 flex items-center gap-3 z-10" onClick={(e) => e.stopPropagation()}>
            <a
              href={chatImagePreviewUrl}
              download="chat_image_preview"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded bg-bg-surface/90 border border-border-main/60 text-txt-main hover:text-accent-main text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download size={13} />
              <span>Download Image</span>
            </a>
            <button
              type="button"
              onClick={() => setChatImagePreviewUrl(null)}
              className="p-2 rounded bg-bg-surface/90 border border-border-main/60 text-txt-muted hover:text-txt-main transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>

          <div className="relative max-w-5xl max-h-[85vh] flex items-center justify-center p-2" onClick={(e) => e.stopPropagation()}>
            <img 
              src={chatImagePreviewUrl} 
              alt="Full Image Preview" 
              className="max-h-[80vh] max-w-full object-contain rounded border border-border-main/40 shadow-2xl" 
            />
          </div>
        </div>
      )}
    </div>
  );
}
