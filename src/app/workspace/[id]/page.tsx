"use client";

import React, { use, useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  CloudUpload,
  Terminal,
  Award,
  Plus,
  X,
  LogOut,
  AlertCircle,
  Edit2
} from "lucide-react";



const getUniqueId = (prefix: string = "id") => {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};

const isValidUrl = (urlStr: string): boolean => {
  if (!urlStr || !urlStr.trim()) return false;
  const trimmed = urlStr.trim();
  // Valid URL pattern: requires valid domain like github.com/user/repo or https://example.com
  const pattern = /^(https?:\/\/)?([\w-]+\.)+[a-z]{2,}(\/[\w-./?%&=#]*)?$/i;
  return pattern.test(trimmed);
};

interface FriendProfile {
  id: string;
  username: string;
  full_name: string;
  academic_credits?: number;
}

interface TeamMember {
  id: string;
  name: string;
  isOnline: boolean;
  isSpeaking?: boolean;
  avatarUrl?: string;
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

interface WorkspaceTask {
  id: string;
  title: string;
  status: "todo" | "in_progress" | "done";
  priority: "high" | "medium" | "low";
  assignee: string;
}

interface GitLanguage {
  name: string;
  bytes: number;
  percentage: number;
}

const generateSessionId = () => Math.random().toString(36).substring(2, 11);

export default function WorkspacePage({ params }: { params: Promise<{ id: string }> }) {

  const { id } = use(params);
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<"workspace" | "tasks" | "artifacts" | "notes" | "credits">("workspace");

  // Workspace Tasks & Milestones State
  const [tasks, setTasks] = useState<WorkspaceTask[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState<"high" | "medium" | "low">("medium");

  // Collaborative Scratchpad Notes State
  const [workspaceNotes, setWorkspaceNotes] = useState(
    "## Team Architecture Notes\n- Next.js 16 App Router with React 19 Server Components\n- WebRTC peer connection for real-time voice call\n- Supabase real-time channel for live chat feed"
  );

  // Project Details
  const [projectName, setProjectName] = useState("Loading Project...");
  const [eventTitle, setEventTitle] = useState("Hackathon Event");
  const [status, setStatus] = useState<"ideation" | "development" | "testing" | "submitted">("development");
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
  const [roomMembers, setRoomMembers] = useState<TeamMember[]>([]);
  const [showActiveMembersModal, setShowActiveMembersModal] = useState(false);
  const [sentInviteIds, setSentInviteIds] = useState<string[]>([]);
  const router = useRouter();
  const [showLeaveConfirmModal, setShowLeaveConfirmModal] = useState(false);

  // WebRTC real-time voice and video variables
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [remoteIsVideoOn, setRemoteIsVideoOn] = useState(false);
  const [remoteIsMuted, setRemoteIsMuted] = useState(false);
  const [remoteName, setRemoteName] = useState("Classmate");

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const userSessionIdRef = useRef(generateSessionId());
  const signalingChannelRef = useRef<any>(null);
  const activeChannelRef = useRef<any>(null);

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

  // Browser BroadcastChannel for instant multi-tab sync on same origin
  useEffect(() => {
    if (typeof BroadcastChannel === "undefined") return;
    const bc = new BroadcastChannel(`ldk_bus_${id}`);
    bc.onmessage = (event) => {
      const { type, payload } = event.data || {};
      if (type === "chat_message" && payload) {
        setChatMessages((prev) => {
          if (prev.some((m) => m.id === payload.id)) return prev;
          const updated = [...prev, payload];
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
        if (payload.githubRepo) setGithubRepo(payload.githubRepo);
        if (payload.liveDemo) setLiveDemo(payload.liveDemo);
      } else if (type === "status_update" && typeof payload === "string") {
        setStatus(payload as any);
      } else if (type === "credits_update" && typeof payload === "string") {
        setClaimStatus(payload as any);
      } else if (type === "name_update" && typeof payload === "string") {
        setProjectName(payload);
      } else if (type === "call_presence" && payload) {
        setIsCallActiveInRoom(!!payload.active);
        if (payload.callerName) setCallCallerName(payload.callerName);
      }
    };
    return () => {
      bc.close();
    };
  }, [id]);

  // Live Call Active State for Room
  const [isCallActiveInRoom, setIsCallActiveInRoom] = useState(false);
  const [callCallerName, setCallCallerName] = useState("Teammate");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedCallStr = localStorage.getItem(`ldk_active_call_${id}`);
      if (savedCallStr) {
        try {
          const parsed = JSON.parse(savedCallStr);
          if (parsed && parsed.active) {
            setIsCallActiveInRoom(true);
            if (parsed.callerName) setCallCallerName(parsed.callerName);
          }
        } catch (e) {}
      }
    }
  }, [id]);

  // Chat Feed State
  const [chatMessages, setChatMessages] = useState<ChatMsg[]>([]);
  const [newMsg, setNewMsg] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Artifacts State
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Claim Academic Credits State
  const [claimStatus, setClaimStatus] = useState<"idle" | "pending" | "approved" | "rejected">("idle");
  const [isSubmittingClaim, setIsSubmittingClaim] = useState(false);

  // Invite Classmates Modal States
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
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
    
    const direct = item.avatar_url || item.avatarUrl || item.picture || item.avatar;
    if (direct && typeof direct === "string" && direct.trim().length > 0) {
      return direct.trim();
    }
    
    const meta = item.raw_user_meta_data || item.user_metadata;
    if (meta) {
      const metaAvatar = meta.avatar_url || meta.picture || meta.avatar;
      if (metaAvatar && typeof metaAvatar === "string" && metaAvatar.trim().length > 0) {
        return metaAvatar.trim();
      }
    }

    const email = item.email || meta?.email;
    if (email && typeof email === "string" && email.includes("@")) {
      return `https://unavatar.io/${encodeURIComponent(email)}`;
    }

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

      // 2. Query real database members from Supabase project_members
      let dbMembersList: TeamMember[] = [];
      try {
        const { data, error } = await supabase
          .from("project_members")
          .select(`
            role,
            profile:profile_id ( * )
          `)
          .eq("project_space_id", id);
        
        if (!error && data && data.length > 0) {
          dbMembersList = data.map((item: any) => {
            const prof = item.profile;
            if (!prof) return null;
            return {
              id: prof.id,
              name: prof.full_name || prof.username || "Collaborator",
              avatarUrl: getBestAvatarUrl(prof),
              isOnline: true
            };
          }).filter(Boolean) as TeamMember[];
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

      setRoomMembers(Array.from(uniqueMap.values()));
    };

    if (user) {
      loadMembers();
    }
  }, [id, user, workspaceTrigger]);

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
      const searchParams = new URLSearchParams(window.location.search);
      const inviteId = searchParams.get("acceptInvite");
      const inviteName = searchParams.get("friendName") || "Teammate";
      const isAutoJoin = searchParams.has("join") || !!inviteId;

      const storedKey = `ldk_workspace_members_${id}`;
      const storedStr = localStorage.getItem(storedKey);
      const storedList: TeamMember[] = storedStr ? JSON.parse(storedStr) : [];

      const joiningUserId = user.id;
      const joiningUserName = user.user_metadata?.full_name || user.email?.split("@")[0] || (inviteId ? decodeURIComponent(inviteName) : "Collaborator");
      const userAvatar = getBestAvatarUrl(user);

      // Register member in database project_members table
      const isUuidWorkspace = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
      if (isUuidWorkspace) {
        supabase.from("project_members").upsert({
          project_space_id: id,
          profile_id: joiningUserId,
          role: "member"
        }).then(() => {});
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
            content: `🎉 ${joiningUserName} accepted the invite and joined the shared workspace!`,
            created_at: new Date().toISOString(),
            isSystem: true
          };

          queueMicrotask(() => {
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

  // Join workspace check on mount (URLSearchParams // await searchParams)
  useEffect(() => {
    if (typeof window !== "undefined" && user && id !== "e1" && id !== "e2") {
      const searchParams = new URLSearchParams(window.location.search);
      if (searchParams.has("join")) {
        const autoJoin = async () => {
          try {
            const { data } = await supabase
              .from("project_members")
              .select("id")
              .eq("project_space_id", id)
              .eq("profile_id", user.id);
            
            if (!data || data.length === 0) {
              await supabase
                .from("project_members")
                .insert({
                  project_space_id: id,
                  profile_id: user.id,
                  role: "member"
                });

              // try catch error handling safeguard
              await supabase.from("chat_messages").insert({
                project_space_id: id,
                profile_id: user.id,
                content: `Joined the workspace via share link!`
              });

              setWorkspaceTrigger(prev => prev + 1);
            }
          } catch (e) {
            console.error("Auto join failure: ", e);
          }
        };
        autoJoin();
      }
    }
  }, [user, id]);

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
            setFriendsToInvite(friendsList);
          } else {
            setFriendsToInvite([
              { id: "mock_f1", username: "alex_carter", full_name: "Alex Carter", academic_credits: 0 },
              { id: "mock_f2", username: "mira_sen", full_name: "Mira Sen", academic_credits: 0 }
            ]);
          }
        } catch (e) {
          console.error(e);
          setFriendsToInvite([
            { id: "mock_f1", username: "alex_carter", full_name: "Alex Carter", academic_credits: 0 },
            { id: "mock_f2", username: "mira_sen", full_name: "Mira Sen", academic_credits: 0 }
          ]);
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

      const initialArtifacts: Artifact[] = [];
        // Fetch workspace details from Supabase
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
            setTempGit(data.github_repo || "");
            setTempDemo(data.live_demo_url || "");
            if (data.events) {
              setEventTitle(data.events.title);
            }

            // Sync workspace to ldk_joined_workspaces and ldk_events so home dashboard renders it
            if (typeof window !== "undefined") {
              try {
                const joinedStr = localStorage.getItem("ldk_joined_workspaces");
                const joinedList: string[] = joinedStr ? JSON.parse(joinedStr) : [];
                if (!joinedList.includes(id)) {
                  joinedList.push(id);
                  localStorage.setItem("ldk_joined_workspaces", JSON.stringify(joinedList));
                }

                const eventsStr = localStorage.getItem("ldk_events");
                const eventsList: any[] = eventsStr ? JSON.parse(eventsStr) : [];
                const itemTitle = data.project_name || "Shared Workspace";
                const existingIdx = eventsList.findIndex(e => e.id === id);
                const updatedItem = {
                  id,
                  title: itemTitle,
                  deadline: "Ongoing",
                  location: "online",
                  level: "global",
                  url: `/workspace/${id}`,
                  status: data.status || "development",
                  stages: ["Ideation", "Development", "Final Submission"]
                };
                if (existingIdx >= 0) {
                  eventsList[existingIdx] = { ...eventsList[existingIdx], ...updatedItem };
                } else {
                  eventsList.unshift(updatedItem);
                }
                localStorage.setItem("ldk_events", JSON.stringify(eventsList));
              } catch (e) {
                console.error("Error saving workspace to local dashboard storage: ", e);
              }
            }
          } else {
            // Default mock setup if not found in db
            setProjectName("Student Vault Space");
            setEventTitle("Campus Track Hackathon");
            setStatus("development");
          }
        } catch (e) {
          console.error("Workspace fetch error: ", e);
          setProjectName("Student Vault Space");
          setEventTitle("Campus Track Hackathon");
          setStatus("development");
        }

        // Fetch real chat messages and merge with persistent local storage
        const savedChatStr = typeof window !== "undefined" ? localStorage.getItem(`ldk_chat_messages_${id}`) : null;
        const savedChatList: ChatMsg[] = savedChatStr ? JSON.parse(savedChatStr) : [];

        try {
          const { data: dbChat, error: chatError } = await supabase
            .from("chat_messages")
            .select(`
              id,
              content,
              created_at,
              profiles ( username, college_key, company_key )
            `)
            .eq("project_space_id", id)
            .order("created_at", { ascending: true });

          let loadedChat: ChatMsg[] = [];
          if (!chatError && dbChat && dbChat.length > 0) {
            loadedChat = dbChat.map(c => {
              const profile = c.profiles as any;
              let role = "Developer";
              if (profile?.college_key) role = "Faculty";
              else if (profile?.company_key) role = "Recruiter";
              return {
                id: c.id,
                sender_name: profile?.username || "Teammate",
                sender_role: role,
                content: c.content,
                created_at: c.created_at
              };
            });
          }

          // Combine DB chat, saved local storage chat, current state, and initial system log
          setChatMessages(prev => {
            const combinedChat = [...initialLogs, ...savedChatList, ...loadedChat, ...prev];
            const uniqueChat = new Map<string, ChatMsg>();
            combinedChat.forEach(m => {
              if (m && m.id) uniqueChat.set(m.id, m);
            });
            const mergedList = Array.from(uniqueChat.values());
            if (typeof window !== "undefined") {
              localStorage.setItem(`ldk_chat_messages_${id}`, JSON.stringify(mergedList));
            }
            return mergedList;
          });
        } catch (e) {
          console.error("Failed to load chat: ", e);
          setChatMessages(prev => {
            const combinedChat = [...initialLogs, ...savedChatList, ...prev];
            const uniqueChat = new Map<string, ChatMsg>();
            combinedChat.forEach(m => {
              if (m && m.id) uniqueChat.set(m.id, m);
            });
            return Array.from(uniqueChat.values());
          });
        }

        // Fetch real artifacts
        try {
          const { data: dbArtifacts, error: artError } = await supabase
            .from("project_artifacts")
            .select(`
              id,
              file_name,
              file_url,
              version,
              is_active,
              created_at,
              profiles ( username )
            `)
            .eq("project_space_id", id)
            .order("created_at", { ascending: false });

          if (!artError && dbArtifacts && dbArtifacts.length > 0) {
            const loadedArtifacts: Artifact[] = dbArtifacts.map(a => ({
              id: a.id,
              file_name: a.file_name,
              file_url: a.file_url,
              version: a.version,
              is_active: a.is_active,
              uploaded_by: (a.profiles as any)?.username || "Teammate",
              created_at: a.created_at
            }));
            setArtifacts(loadedArtifacts);
          } else {
            setArtifacts(initialArtifacts);
          }
        } catch (e) {
          console.error("Failed to load artifacts: ", e);
          setArtifacts(initialArtifacts);
        }

        // Fetch credit application status
        if (user) {
          try {
            const { data: claim, error: claimErr } = await supabase
              .from("credit_applications")
              .select("status")
              .eq("project_space_id", id)
              .eq("student_id", user.id)
              .single();

            if (!claimErr && claim) {
              setClaimStatus(claim.status);
            } else {
              setClaimStatus("idle");
            }
          } catch (e) {
            console.error("Failed to load claim status: ", e);
            setClaimStatus("idle");
          }
        }
    };

    fetchWorkspaceDetails();
  }, [id, user, workspaceTrigger]);

  // Real-time Chat subscription
  useEffect(() => {
    // Subscribe to chat message inserts & real-time member joins/chat in Supabase for this project space
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
          // Skip if this message was sent by the current user (already added optimistically)
          if (payload.new.profile_id === user?.id) return;

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

          setChatMessages((prev) => {
            if (prev.some((m) => m.id === incomingMsg.id)) return prev;
            const updated = [...prev, incomingMsg];
            localStorage.setItem(`ldk_chat_messages_${id}`, JSON.stringify(updated));
            return updated;
          });
        }
      )
      .on(
        "broadcast",
        { event: "chat_message" },
        (payload) => {
          const incoming = payload.payload;
          if (incoming && incoming.id) {
            setChatMessages((prev) => {
              if (prev.some((m) => m.id === incoming.id)) return prev;
              const updated = [...prev, incoming];
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
            if (data.githubRepo) setGithubRepo(data.githubRepo);
            if (data.liveDemo) setLiveDemo(data.liveDemo);
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
          } else if (action === "credits" && typeof data === "string") {
            setClaimStatus(data as any);
          } else if (action === "name" && data.projectName) {
            setProjectName(data.projectName);
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
            setRoomMembers((prev) => {
              if (prev.some((m) => m.id === newMember.id)) return prev;
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

            setChatMessages((prev) => {
              const noticeId = `sys_rt_${newMember.id}`;
              if (prev.some((m) => m.id === noticeId)) return prev;
              const updated = [
                ...prev,
                {
                  id: noticeId,
                  sender_name: "LDK:BOT",
                  sender_role: "SYSTEM",
                  content: `🎉 ${newMember.name} joined the shared workspace!`,
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
      .subscribe((status) => {
        if (status === "SUBSCRIBED" && user) {
          const myName = user.user_metadata?.full_name || user.email?.split("@")[0] || "Collaborator";
          channel.send({
            type: "broadcast",
            event: "member_joined",
            payload: {
              id: user.id,
              name: myName,
              avatarUrl: getBestAvatarUrl(user)
            }
          });
        }
      });

    activeChannelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
      activeChannelRef.current = null;
    };
  }, [id, user]);

  // Scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMsg.trim()) return;

    const myName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "You";
    const localMsg: ChatMsg = {
      id: getUniqueId("msg"),
      sender_name: myName,
      sender_role: "Collaborator",
      content: newMsg.trim(),
      created_at: new Date().toISOString(),
    };

    // 1. Update state locally first & save to persistent localStorage
    setChatMessages((prev) => {
      const updated = [...prev, localMsg];
      localStorage.setItem(`ldk_chat_messages_${id}`, JSON.stringify(updated));
      return updated;
    });
    setNewMsg("");

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
    if (typeof BroadcastChannel !== "undefined") {
      try {
        const bc = new BroadcastChannel(`ldk_bus_${id}`);
        bc.postMessage({ type: "chat_message", payload: localMsg });
        bc.close();
      } catch (err) {
        console.warn("BroadcastChannel error: ", err);
      }
    }

    // 4. Send to Supabase DB if user session exists and valid UUID workspace
    const isUuidSpace = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    if (user && isUuidSpace) {
      try {
        await supabase.from("chat_messages").insert({
          project_space_id: id,
          profile_id: user.id,
          content: localMsg.content,
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
        } catch (e) {}
      }
    }
  }, [isMuted, isVideoOn]);

  const createPeerConnection = (channel: any, peerSessionId: string) => {
    if (peerConnectionRef.current) {
      try {
        peerConnectionRef.current.close();
      } catch (e) {}
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
        } catch (e) {}
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
        } catch (e) {}
      }
      if (typeof BroadcastChannel !== "undefined") {
        try {
          const bc = new BroadcastChannel(`ldk_bus_${id}`);
          bc.postMessage({ type: "call_presence", payload: { active: true, callerName: myName } });
          bc.close();
        } catch (e) {}
      }

      // Post system notice to chat section & broadcast to all teammates
      const callNotice: ChatMsg = {
        id: getUniqueId("sys_call"),
        sender_name: "LDK:BOT",
        sender_role: "SYSTEM",
        content: `🔊 ${myName} joined the call.`,
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
        } catch (e) {}
      }
      if (typeof BroadcastChannel !== "undefined") {
        try {
          const bc = new BroadcastChannel(`ldk_bus_${id}`);
          bc.postMessage({ type: "chat_message", payload: callNotice });
          bc.close();
        } catch (e) {}
      }
      
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
            }
          }
        });

        channel.on("broadcast", { event: "ice-candidate" }, async ({ payload }) => {
          if (payload.from !== userSessionIdRef.current && payload.target === userSessionIdRef.current) {
            if (peerConnectionRef.current) {
              try {
                await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(payload.candidate));
              } catch (e) {
                console.error("Error adding ice candidate: ", e);
              }
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
              } catch (e) {}
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

      } catch (err) {
        console.error("WebRTC getUserMedia / setup error: ", err);
        setInRoom(false);
        setRoomMembers(prev => prev.filter(m => m.id !== "user-session"));
      }
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
        } catch (e) {}
      }
      if (typeof BroadcastChannel !== "undefined") {
        try {
          const bc = new BroadcastChannel(`ldk_bus_${id}`);
          bc.postMessage({ type: "call_presence", payload: { active: false } });
          bc.close();
        } catch (e) {}
      }

      if (signalingChannelRef.current) {
        try {
          signalingChannelRef.current.send({
            type: "broadcast",
            event: "leave",
            payload: { from: userSessionIdRef.current }
          });
        } catch (e) {}
      }

      cleanUpCall();
      const myName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "You";
      const leaveNotice: ChatMsg = {
        id: getUniqueId("sys_leave"),
        sender_name: "LDK:BOT",
        sender_role: "SYSTEM",
        content: `🔇 ${myName} left the call.`,
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
        } catch (e) {}
      }
      if (typeof BroadcastChannel !== "undefined") {
        try {
          const bc = new BroadcastChannel(`ldk_bus_${id}`);
          bc.postMessage({ type: "chat_message", payload: leaveNotice });
          bc.close();
        } catch (e) {}
      }

      setRoomMembers(prev => prev.filter(member => member.id !== "user-session"));
      setIsMuted(false);
      setIsVideoOn(false);
      setRemoteIsVideoOn(false);
      setRemoteIsMuted(false);
    }
  };

  // Artifact file upload simulation
  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];

    setIsUploading(true);

    const myName = user?.email?.split("@")[0] || "You";
    const currentHighestVersion = artifacts
      .filter(a => a.file_name.split(".").pop() === file.name.split(".").pop())
      .reduce((max, a) => Math.max(max, a.version), 0);

    const nextVersion = currentHighestVersion + 1;

    let fileUrl = "#";

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

          // Insert into project_artifacts table
          const { error: dbError } = await supabase
            .from("project_artifacts")
            .insert({
              project_space_id: id,
              file_name: file.name,
              file_url: fileUrl,
              version: nextVersion,
              is_active: true,
              uploaded_by: user.id
            });

          if (dbError) {
            console.error("DB Artifact insert error: ", dbError);
          }
        } else {
          console.warn("Storage bucket upload failed, using fallback mock URL: ", uploadError);
        }
      } catch (err) {
        console.error("Supabase Storage error: ", err);
      }
    }

    // Update state locally
    setArtifacts(prev => {
      const deactivated = prev.map(art => {
        if (art.file_name.split(".").pop() === file.name.split(".").pop()) {
          return { ...art, is_active: false };
        }
        return art;
      });

      const newArtifact: Artifact = {
        id: getUniqueId("art"),
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
        } catch (e) {}
      }
      if (typeof BroadcastChannel !== "undefined") {
        try {
          const bc = new BroadcastChannel(`ldk_bus_${id}`);
          bc.postMessage({ type: "artifacts_update", payload: updated });
          bc.close();
        } catch (e) {}
      }

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
    if (user && id !== "e1" && id !== "e2") {
      try {
        await supabase.from("chat_messages").insert({
          project_space_id: id,
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
    
    // Default fallback mock response
    if (!user || id === "e1" || id === "e2") {
      setTimeout(() => {
        setClaimStatus("pending");
        setIsSubmittingClaim(false);
      }, 1000);
      return;
    }

    try {
      // 1. Submit claim to credit_applications table
      const { error } = await supabase
        .from("credit_applications")
        .insert({
          project_space_id: id,
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
          project_space_id: id,
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
        notifList.unshift({
          id: `n_invite_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
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
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const [gitUrlError, setGitUrlError] = useState<string | null>(null);
  const [demoUrlError, setDemoUrlError] = useState<string | null>(null);

  const saveGitRepo = async () => {
    if (!tempGit.trim() || !isValidUrl(tempGit)) {
      setGitUrlError("⚠️ Invalid URL. Format e.g. https://github.com/username/project");
      return;
    }
    setGitUrlError(null);
    const cleanGit = tempGit.trim();
    setGithubRepo(cleanGit);
    setIsEditingGit(false);

    localStorage.setItem(`ldk_workspace_git_${id}`, cleanGit);
    if (activeChannelRef.current) {
      try {
        activeChannelRef.current.send({
          type: "broadcast",
          event: "workspace_sync",
          payload: { action: "links", githubRepo: cleanGit, liveDemo }
        });
      } catch (e) {}
    }

    if (id !== "mock") {
      try {
        await supabase
          .from("project_spaces")
          .update({ github_repo: cleanGit })
          .eq("id", id);
      } catch (e) {
        console.error("Failed to save git repo: ", e);
      }
    }
  };

  const saveLiveDemo = async () => {
    if (!tempDemo.trim() || !isValidUrl(tempDemo)) {
      setDemoUrlError("⚠️ Invalid URL. Format e.g. https://my-app.vercel.app");
      return;
    }
    setDemoUrlError(null);
    const cleanDemo = tempDemo.trim();
    setLiveDemo(cleanDemo);
    setIsEditingDemo(false);

    localStorage.setItem(`ldk_workspace_demo_${id}`, cleanDemo);
    if (activeChannelRef.current) {
      try {
        activeChannelRef.current.send({
          type: "broadcast",
          event: "workspace_sync",
          payload: { action: "links", githubRepo, liveDemo: cleanDemo }
        });
      } catch (e) {}
    }

    if (id !== "mock") {
      try {
        await supabase
          .from("project_spaces")
          .update({ live_demo_url: cleanDemo })
          .eq("id", id);
      } catch (e) {
        console.error("Failed to save live demo: ", e);
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
      } catch (e) {}
    }

    if (activeChannelRef.current) {
      try {
        activeChannelRef.current.send({
          type: "broadcast",
          event: "workspace_sync",
          payload: { action: "name", projectName: cleanName }
        });
      } catch (e) {}
    }

    if (typeof BroadcastChannel !== "undefined") {
      try {
        const bc = new BroadcastChannel(`ldk_bus_${id}`);
        bc.postMessage({ type: "name_update", payload: cleanName });
        bc.close();
      } catch (e) {}
    }

    if (id !== "mock") {
      try {
        await supabase
          .from("project_spaces")
          .update({ project_name: cleanName })
          .eq("id", id);
      } catch (e) {
        console.error("Failed updating workspace name in db", e);
      }
    }
  };

  const fetchCommits = useCallback(async () => {
    if (!githubRepo || !githubRepo.trim()) {
      setCommits([]);
      return;
    }

    let fetched = false;

    // Fetch live commits from GitHub public REST API
    try {
      const githubMatch = githubRepo.trim().match(/(?:github\.com\/)?([^\/]+)\/([^\/]+)/);
      if (githubMatch) {
        const owner = githubMatch[1];
        const repo = githubMatch[2].replace(/\.git$/, "");
        const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/commits?per_page=5`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            const parsed = data.map((item: any) => {
              const dateObj = new Date(item.commit?.author?.date || item.commit?.committer?.date);
              const relative = dateObj.toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
              return {
                hash: item.sha ? item.sha.substring(0, 7) : "commit",
                author: item.commit?.author?.name || item.commit?.committer?.name || "GitHub Dev",
                message: item.commit?.message ? item.commit.message.split("\n")[0] : "Update codebase",
                time: relative
              };
            });
            setCommits(parsed);
            fetched = true;
          }
        }
      }
    } catch {
      // Ignore network / rate-limit errors when fetching external GitHub API
    }

    if (!fetched) {
      setCommits([]);
    }
  }, [githubRepo]);

  const fetchGitLanguages = useCallback(async () => {
    if (!githubRepo || !githubRepo.trim()) {
      setGitLanguages([]);
      return;
    }
    const githubMatch = githubRepo.trim().match(/(?:github\.com\/)?([^\/]+)\/([^\/]+)/);
    if (githubMatch) {
      const owner = githubMatch[1];
      const repo = githubMatch[2].replace(/\.git$/, "");
      try {
        const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/languages`);
        if (res.ok) {
          const data = await res.json();
          const total = Object.values(data).reduce((acc: number, val: any) => acc + Number(val), 0) as number;
          if (total > 0) {
            const parsed: GitLanguage[] = Object.entries(data).map(([name, bytes]) => ({
              name,
              bytes: Number(bytes),
              percentage: Number(((Number(bytes) / total) * 100).toFixed(1))
            })).sort((a, b) => b.bytes - a.bytes);
            setGitLanguages(parsed);
            localStorage.setItem(`ldk_workspace_langs_${id}`, JSON.stringify(parsed));
            return;
          }
        }
      } catch (e) {
        console.warn("Failed fetching repo languages: ", e);
      }
    }
    setGitLanguages([]);
  }, [githubRepo, id]);

  useEffect(() => {
    setTimeout(() => {
      fetchCommits();
      fetchGitLanguages();
    }, 0);
    const interval = setInterval(() => {
      fetchCommits();
      fetchGitLanguages();
    }, 10000);
    return () => clearInterval(interval);
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
      assignee: myName
    };
    setTasks(prev => {
      const updated = [...prev, newTask];
      localStorage.setItem(`ldk_workspace_tasks_${id}`, JSON.stringify(updated));
      if (activeChannelRef.current) {
        try {
          activeChannelRef.current.send({
            type: "broadcast",
            event: "workspace_sync",
            payload: { action: "tasks", data: updated }
          });
        } catch (e) {}
      }
      if (typeof BroadcastChannel !== "undefined") {
        try {
          const bc = new BroadcastChannel(`ldk_bus_${id}`);
          bc.postMessage({ type: "tasks_update", payload: updated });
          bc.close();
        } catch (e) {}
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
          content: `✅ ${myName} completed task: "${target.title}"`,
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
      if (activeChannelRef.current) {
        try {
          activeChannelRef.current.send({
            type: "broadcast",
            event: "workspace_sync",
            payload: { action: "tasks", data: updatedTasks }
          });
        } catch (e) {}
      }
      if (typeof BroadcastChannel !== "undefined") {
        try {
          const bc = new BroadcastChannel(`ldk_bus_${id}`);
          bc.postMessage({ type: "tasks_update", payload: updatedTasks });
          bc.close();
        } catch (e) {}
      }
      return updatedTasks;
    });
  };

  return (
    <div className="min-h-screen lg:h-screen lg:overflow-hidden flex flex-col font-sans selection:bg-accent-main selection:text-bg-base">
      
      {/* Header (Unified Navigation & Notifications Drawer) */}
      <Header />

      {/* Main split workspace grid */}
      <main className="flex-1 overflow-y-auto lg:overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-0">
        
        {/* ================= COLUMN 1: STAGE TRACKER (3 Columns) ================= */}
        <section className="lg:col-span-3 border-b lg:border-b-0 lg:border-r border-border-main/50 bg-bg-surface/30 flex flex-col h-auto lg:h-full overflow-y-auto p-6 gap-6">
          <div className="flex items-center justify-between gap-2">
            <Link 
              href="/"
              className="flex items-center gap-2 text-[10px] text-txt-muted hover:text-txt-main transition-colors font-mono tracking-wider uppercase"
            >
              <ArrowLeft size={12} />
              Back to Registry
            </Link>

            <button
              type="button"
              onClick={() => setShowLeaveConfirmModal(true)}
              className="text-[9px] font-mono tracking-wider uppercase text-txt-muted/50 hover:text-red-400 opacity-40 hover:opacity-100 transition-all flex items-center gap-1 cursor-pointer font-bold px-1.5 py-0.5 rounded hover:bg-red-500/10"
              title="Leave Workspace"
            >
              <LogOut size={10} />
              <span>Leave</span>
            </button>
          </div>

          <div className="flex flex-col gap-1 border-b border-border-main/40 pb-4">
            <span className="font-mono text-[9px] uppercase tracking-widest text-txt-muted">{eventTitle}</span>
            
            {!isEditingName ? (
              <div className="flex items-center justify-between gap-2 group">
                <h2 className="font-display text-lg font-light text-txt-main truncate">{projectName}</h2>
                <button
                  type="button"
                  onClick={() => {
                    setTempName(projectName);
                    setIsEditingName(true);
                  }}
                  className="text-[9px] font-mono text-txt-muted/60 hover:text-accent-main opacity-80 lg:opacity-0 group-hover:opacity-100 transition-all cursor-pointer flex items-center gap-1 shrink-0 bg-bg-surface px-1.5 py-0.5 rounded border border-border-main/50"
                  title="Rename Workspace"
                >
                  <Edit2 size={10} />
                  <span>Rename</span>
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-1.5 pt-0.5">
                <input
                  type="text"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") saveProjectName();
                    if (e.key === "Escape") setIsEditingName(false);
                  }}
                  className="h-8 px-2 bg-bg-base border border-accent-main text-txt-main text-sm font-display rounded-sm focus:outline-none"
                  placeholder="Enter workspace name..."
                  autoFocus
                />
                <div className="flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => setIsEditingName(false)}
                    className="text-[9px] font-mono text-txt-muted hover:underline uppercase cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={saveProjectName}
                    className="text-[9px] font-mono text-accent-main font-bold hover:underline uppercase cursor-pointer"
                  >
                    Save Name
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Vertical Node Line */}
          <div className="relative flex flex-col gap-6 pl-4 py-2 flex-grow">
            <div className="absolute top-0 bottom-0 left-[21px] w-[1px] bg-border-main/60 z-0" />
            
            {stages.map((stg, idx) => {
              const currentStageLower = status.toLowerCase();
              const stgLower = stg.toLowerCase();
              const currentIdx = stages.findIndex(s => s.toLowerCase() === currentStageLower);
              const isActive = currentStageLower === stgLower;
              const isPast = idx < (currentIdx >= 0 ? currentIdx : 0);
              
              return (
                <motion.div 
                  key={idx} 
                  whileHover={{ x: 2 }}
                  onClick={async () => {
                    const newStatus = stgLower as "ideation" | "development" | "testing" | "submitted";
                    setStatus(newStatus);
                    try {
                      if (user && id !== "e1" && id !== "e2") {
                        await supabase
                          .from("project_spaces")
                          .update({ status: newStatus })
                          .eq("id", id);
                      }
                    } catch (err) {
                      console.error("Failed updating stage status", err);
                    }
                  }}
                  className="relative z-10 flex gap-4 group cursor-pointer"
                >
                  <div className={`h-4 w-4 rounded-full border-2 bg-bg-base flex items-center justify-center translate-y-0.5 transition-colors duration-200 ${
                    isActive 
                      ? "border-accent-main ring-4 ring-accent-main/10" 
                      : isPast 
                      ? "border-accent-main bg-accent-main" 
                      : "border-border-main group-hover:border-accent-main/60"
                  }`}>
                    {isPast && <CheckCircle2 size={10} className="text-bg-base fill-accent-main" />}
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className={`text-xs font-semibold ${isActive ? "text-txt-main font-bold" : "text-txt-sub"}`}>{stg}</span>
                    <span className="text-[10px] text-txt-muted font-mono">{stageDeadlines[idx]}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Project Specification & Repository Languages Panel */}
          <div className="border border-border-main/60 bg-bg-surface p-4 rounded-sm flex flex-col gap-3 mt-auto">
            <div className="flex items-center justify-between border-b border-border-main/40 pb-2">
              <span className="font-mono text-[9px] tracking-widest uppercase text-txt-muted">Repository Specs</span>
              <Terminal size={11} className="text-accent-main animate-pulse" />
            </div>
            
            <div className="flex flex-col gap-2">
              <span className="text-[9px] font-mono text-txt-muted uppercase font-bold">Languages</span>
              {gitLanguages.length > 0 ? (
                <div className="flex flex-col gap-2">
                  {gitLanguages.map((lang) => (
                    <div key={lang.name} className="flex flex-col gap-1 font-mono">
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="text-txt-main font-semibold">{lang.name}</span>
                        <span className="text-txt-muted font-bold">{lang.percentage}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-bg-base rounded-full overflow-hidden border border-border-main/40">
                        <div className="h-full bg-accent-main rounded-full" style={{ width: `${lang.percentage}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <span className="text-[10px] font-mono text-txt-muted/70 italic py-1 leading-relaxed">
                  {githubRepo ? "Fetching repository language data..." : "No Git repository linked yet. Click 'Edit' above to attach your project's GitHub URL."}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-1 border-t border-border-main/30 pt-2.5">
              <span className="text-[9px] font-mono text-txt-muted uppercase font-bold">Workspace Health</span>
              <div className="flex justify-between items-center text-[10px] font-mono text-txt-sub">
                <span>Milestones</span>
                <span className="text-emerald-500 font-bold">
                  {tasks.filter(t => t.status === "done").length} / {tasks.length || 1} Complete
                </span>
              </div>
              <div className="flex justify-between items-center text-[10px] font-mono text-txt-sub">
                <span>Repository</span>
                <span className={githubRepo ? "text-emerald-500 font-bold" : "text-red-400 font-bold"}>
                  {githubRepo ? "Connected" : "Not Linked"}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ================= COLUMN 2: COLLABORATIVE CHAT & AUDIO (6 Columns) ================= */}
        <section className="lg:col-span-6 border-b lg:border-b-0 lg:border-r border-border-main/50 flex flex-col h-auto lg:h-full bg-bg-base overflow-hidden">
          
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
              <button 
                onClick={() => setIsInviteModalOpen(true)}
                className="h-7 px-3 rounded-sm border border-border-main/85 text-txt-main hover:bg-bg-card font-mono text-[9px] tracking-wider uppercase transition-colors flex items-center gap-1 cursor-pointer font-bold"
              >
                Invite
              </button>
            </div>

            {/* Speaking visual strip */}
            <div 
              onClick={() => setShowActiveMembersModal(true)}
              className="flex items-center gap-2.5 cursor-pointer hover:opacity-85 transition-opacity"
            >
              <span className="text-[9px] font-mono text-txt-muted uppercase tracking-wider hidden sm:inline">Active:</span>
              <div className="flex -space-x-2">
                {roomMembers.filter(m => m.isOnline).map(member => (
                  <div 
                    key={member.id} 
                    className={`w-6 h-6 rounded-full border border-bg-surface bg-bg-card flex items-center justify-center font-mono text-[8px] font-bold text-txt-main overflow-hidden select-none transition-all duration-300 ${
                      member.isSpeaking ? "ring-2 ring-emerald-500 scale-105" : ""
                    }`}
                    title={member.name}
                  >
                    {member.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={member.avatarUrl} alt={member.name} className="w-full h-full object-cover" 
                        onError={(e) => { 
                          (e.target as HTMLImageElement).style.display = 'none';
                        }} 
                      />
                    ) : (
                      <span className="font-mono text-[8px] font-bold text-txt-main uppercase">{member.name.charAt(0)}</span>
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
                    ({callCallerName || "Teammate"} is in the call)
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
                  ref={localVideoRef} 
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
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.25 }}
                  className="w-full sm:w-1/2 aspect-video relative border border-border-main/60 bg-bg-surface rounded-sm overflow-hidden flex items-center justify-center"
                >
                  <video 
                    ref={remoteVideoRef} 
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
              const myFullName = user?.user_metadata?.full_name;
              const myEmailPrefix = user?.email?.split("@")[0];
              const isMe = !msg.isSystem && (
                msg.sender_name === "You" ||
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
                      <div className={`p-3 rounded-md text-xs leading-relaxed ${
                        isMe 
                          ? "bg-accent-main text-bg-base rounded-tr-none font-normal shadow-sm" 
                          : "bg-bg-surface border border-border-main/70 text-txt-main rounded-tl-none font-light"
                      }`}>
                        {msg.content}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
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
        <section className="lg:col-span-3 bg-bg-surface/30 flex flex-col h-auto lg:h-full overflow-y-auto p-6 gap-6">
          
          {/* Tab Navigation Header - 5-column grid alignment */}
          <div className="grid grid-cols-5 border-b border-border-main/50 pb-2.5 gap-1 font-mono text-[9px] uppercase tracking-wider text-center">
            {(["workspace", "tasks", "artifacts", "notes", "credits"] as const).map(tab => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
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
                        className="text-[9px] font-mono uppercase text-accent-main hover:underline cursor-pointer"
                      >
                        Edit
                      </button>
                    </div>
                    <span className="text-xs font-mono text-txt-main truncate select-all">
                      {githubRepo || "Not linked"}
                    </span>
                    {githubRepo && (
                      <a 
                        href={formatUrl(githubRepo)}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] text-txt-muted hover:text-txt-main font-mono flex items-center gap-1.5 self-start transition-colors"
                      >
                        Open Codebase
                        <ExternalLink size={10} />
                      </a>
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
                          className="text-[9px] font-mono uppercase text-accent-main font-bold hover:underline cursor-pointer"
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
                        className="text-[9px] font-mono uppercase text-accent-main hover:underline cursor-pointer"
                      >
                        Edit
                      </button>
                    </div>
                    <span className="text-xs font-mono text-txt-main truncate select-all">
                      {liveDemo || "Not hosted"}
                    </span>
                    {liveDemo && (
                      <a 
                        href={formatUrl(liveDemo)}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] text-txt-muted hover:text-txt-main font-mono flex items-center gap-1.5 self-start transition-colors"
                      >
                        Launch Prototype
                        <ExternalLink size={10} />
                      </a>
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
              <div className="border border-border-main/70 bg-bg-surface p-4 rounded-sm flex flex-col gap-3 mt-auto">
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
                    <span className="text-[10px] font-mono text-txt-muted/70 italic py-1 leading-relaxed">
                      {githubRepo ? "No public commit history found for this repository." : "No Git repository linked yet. Click 'Edit' above to attach your project's GitHub URL."}
                    </span>
                  )}
                </div>
              </div>
            </>
          )}

          {activeTab === "tasks" && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-0.5 border-b border-border-main/40 pb-3">
                <span className="font-mono text-[9px] uppercase tracking-widest text-txt-muted font-bold">Kanban Tasks</span>
                <h2 className="font-display text-lg font-light text-txt-main">Milestone Tracker</h2>
              </div>

              {/* Add Task Form */}
              <form onSubmit={handleAddTask} className="flex flex-col gap-2.5 bg-bg-surface border border-border-main/70 p-3 rounded-sm">
                <input
                  type="text"
                  placeholder="Task title..."
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="h-8 px-2.5 bg-bg-base border border-border-main/80 rounded-sm text-xs text-txt-main placeholder:text-txt-muted/50 focus:outline-none focus:border-txt-main font-sans"
                />
                <div className="flex justify-between items-center gap-2">
                  <select
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value as any)}
                    className="h-7 px-2 bg-bg-base border border-border-main/80 rounded-sm text-[10px] font-mono text-txt-main focus:outline-none"
                  >
                    <option value="high">High Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="low">Low Priority</option>
                  </select>
                  <button
                    type="submit"
                    className="h-7 px-3 bg-accent-main text-bg-base font-mono text-[9px] uppercase tracking-wider rounded-sm font-bold hover:opacity-90 transition-opacity cursor-pointer"
                  >
                    Add Task
                  </button>
                </div>
              </form>

              {/* Tasks List */}
              <div className="flex flex-col gap-2.5">
                {tasks.map(t => (
                  <div key={t.id} className="border border-border-main/70 bg-bg-surface p-3 rounded-sm flex flex-col gap-2">
                    <div className="flex justify-between items-start gap-2">
                      <span className={`text-xs text-txt-main font-medium ${t.status === "done" ? "line-through text-txt-muted" : ""}`}>
                        {t.title}
                      </span>
                      <span className={`text-[8px] font-mono uppercase px-1.5 py-0.5 rounded border ${
                        t.priority === "high" ? "bg-red-500/10 border-red-500/30 text-red-400" : "bg-bg-card border-border-main/50 text-txt-muted"
                      }`}>
                        {t.priority}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-[9px] font-mono text-txt-muted pt-1 border-t border-border-main/30">
                      <span>{t.assignee}</span>
                      <div className="flex gap-1">
                        {(["todo", "in_progress", "done"] as const).map(st => (
                          <button
                            key={st}
                            type="button"
                            onClick={() => handleUpdateTaskStatus(t.id, st)}
                            className={`px-1.5 py-0.5 rounded uppercase cursor-pointer ${
                              t.status === st ? "bg-accent-main text-bg-base font-bold" : "hover:text-txt-main text-txt-muted"
                            }`}
                          >
                            {st === "in_progress" ? "doing" : st}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "artifacts" && (
            <>
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
                  className="w-full h-8 border border-border-main/80 border-dashed text-[10px] font-mono tracking-wider uppercase rounded-sm hover:bg-bg-card flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
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
            </>
          )}

          {activeTab === "notes" && (
            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-center border-b border-border-main/40 pb-2">
                <span className="font-mono text-[9px] uppercase tracking-widest text-txt-muted">Shared Scratchpad</span>
                <span className="text-[8px] font-mono text-emerald-500 font-semibold">Live Auto-saved</span>
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
                    } catch (err) {}
                  }
                  if (typeof BroadcastChannel !== "undefined") {
                    try {
                      const bc = new BroadcastChannel(`ldk_bus_${id}`);
                      bc.postMessage({ type: "notes_update", payload: val });
                      bc.close();
                    } catch (err) {}
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

      </main>

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
                    {/* Avatar with status shade */}
                    <div className={`relative w-8 h-8 rounded-full flex items-center justify-center font-mono text-xs font-bold text-txt-main border overflow-hidden flex-shrink-0 ${
                      member.isOnline ? "border-emerald-500/40" : "border-border-main/80 bg-bg-card"
                    }`}>
                      {member.avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={member.avatarUrl} alt={member.name} className="w-full h-full object-cover" 
                          onError={(e) => { 
                            (e.target as HTMLImageElement).style.display = 'none';
                          }} 
                        />
                      ) : (
                        <span className="font-mono text-xs font-bold text-txt-main uppercase">{member.name.charAt(0)}</span>
                      )}
                      
                      {/* Status badge dot */}
                      <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-bg-surface ${
                        member.isOnline ? "bg-emerald-500 animate-pulse" : "bg-txt-muted"
                      }`} />
                    </div>

                    <div className="flex flex-col min-w-0 text-left">
                      <span className="text-xs font-semibold text-txt-main truncate">{member.name}</span>
                    </div>
                  </div>

                  <div>
                    {member.isOnline ? (
                      <span className="text-[8px] font-mono tracking-widest uppercase bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-2 py-0.5 rounded">
                        Active Online
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
                    if (user && id !== "e1" && id !== "e2") {
                      await supabase
                        .from("project_members")
                        .delete()
                        .eq("project_space_id", id)
                        .eq("profile_id", user.id);
                    }
                    const storedKey = `ldk_workspace_members_${id}`;
                    const storedStr = localStorage.getItem(storedKey);
                    if (storedStr) {
                      const storedList = JSON.parse(storedStr);
                      const updated = storedList.filter((m: any) => m.id !== user?.id);
                      localStorage.setItem(storedKey, JSON.stringify(updated));
                    }
                    router.push("/");
                  } catch (err) {
                    console.error("Error leaving workspace: ", err);
                    router.push("/");
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
    </div>
  );
}
