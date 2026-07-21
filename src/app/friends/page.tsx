"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import Header from "../components/Header";
import { 
  Search, 
  UserPlus, 
  Award, 
  ExternalLink,
  Code,
  Clock,
  AlertTriangle,
  Check
} from "lucide-react";

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

// Fallback Mock Data for Demo
const mockFriends: FriendProfile[] = [
  {
    id: "mock_f1",
    username: "alex_carter",
    full_name: "Alex Carter",
    academic_credits: 32,
    department: "Computer Science",
    graduation_year: "2027",
    college_name: "Massachusetts Institute of Technology (MIT)",
    leetcode_username: "alex_leetcode",
    codeforces_username: "alex_cf",
    github_url: "https://github.com/shreeprasandh/healthvibe",
    linkedin_url: "https://linkedin.com/in/alexcarter",
    portfolio_url: "https://alexcarter.vercel.app"
  },
  {
    id: "mock_f2",
    username: "mira_sen",
    full_name: "Mira Sen",
    academic_credits: 28,
    department: "Data Science",
    graduation_year: "2026",
    college_name: "Stanford University",
    leetcode_username: "mira_codes",
    codeforces_username: "mira_sen_cf",
    github_url: "https://github.com/shreeprasandh/carbontrace",
    linkedin_url: "https://linkedin.com/in/mirasen",
    portfolio_url: "https://mirasen.dev"
  }
];

const mockRequestsStatic: FriendProfile[] = [
  {
    id: "mock_r1",
    username: "sofia_r",
    full_name: "Sofia Rodriguez",
    academic_credits: 15,
    department: "AI & Robotics",
    graduation_year: "2027",
    college_name: "California Institute of Technology",
    leetcode_username: "sofia_leetcode",
    github_url: "https://github.com/sofiar",
  },
  {
    id: "mock_r2",
    username: "david_chen",
    full_name: "David Chen",
    academic_credits: 22,
    department: "Electrical Engineering",
    graduation_year: "2026",
    college_name: "IIT Delhi",
    codeforces_username: "dchen_cf",
  }
];

export default function FriendsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"friends" | "requests">("friends");

  // Search States
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<FriendProfile[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchMessage, setSearchMessage] = useState<string | null>(null);

  // Friends & Requests Lists
  const [friendsList, setFriendsList] = useState<Friendship[]>([]);
  const [requestsList, setRequestsList] = useState<Friendship[]>([]);
  const [outgoingRequestsList, setOutgoingRequestsList] = useState<Friendship[]>([]);
  const [loadingList, setLoadingList] = useState(true);

  // Overview Modal
  const [selectedFriend, setSelectedFriend] = useState<FriendProfile | null>(null);

  // Local mock overrides
  const [deletedMockIds, setDeletedMockIds] = useState<string[]>([]);
  const [simulatedFriendships, setSimulatedFriendships] = useState<Friendship[]>([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedDeleted = localStorage.getItem("deleted_mock_ids");
      const storedSimulated = localStorage.getItem("simulated_friendships");
      
      const timer = setTimeout(() => {
        if (storedDeleted) {
          try {
            setDeletedMockIds(JSON.parse(storedDeleted));
          } catch (err) {
            console.error("Failed to parse deleted mock IDs:", err);
          }
        }
        if (storedSimulated) {
          try {
            setSimulatedFriendships(JSON.parse(storedSimulated));
          } catch (err) {
            console.error("Failed to parse simulated friendships:", err);
          }
        }
      }, 0);
      return () => clearTimeout(timer);
    }
  }, []);

  const updateDeletedMockIds = (ids: string[]) => {
    setDeletedMockIds(ids);
    if (typeof window !== "undefined") {
      localStorage.setItem("deleted_mock_ids", JSON.stringify(ids));
    }
  };

  const updateSimulatedFriendships = (sfs: Friendship[]) => {
    setSimulatedFriendships(sfs);
    if (typeof window !== "undefined") {
      localStorage.setItem("simulated_friendships", JSON.stringify(sfs));
    }
  };

  // Custom Alert Modal State
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
      showCancel
    });
  };

  // mockFriends and mockRequests are defined static outside the component definition to avoid render changes and useCallback dependencies.



  // Fetch Friends and Requests on mount & tab change
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
        let friends: Friendship[] = [];
        let requests: Friendship[] = [];
        let outgoing: Friendship[] = [];

        data.forEach((item: any) => {
          const isSender = item.sender_id === user.id;
          const partner = isSender ? item.receiver : item.sender;
          
          const formattedFriend: FriendProfile = partner ? {
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
            college_name: partner.college_name
          } : {
            id: isSender ? item.receiver_id : item.sender_id,
            username: "anonymous_peer",
            full_name: "Anonymous Classmate",
            academic_credits: 0,
            department: "Engineering"
          };

          const friendshipObj: Friendship = {
            id: item.id,
            sender_id: item.sender_id,
            receiver_id: item.receiver_id,
            status: item.status,
            sender_restricted: !!item.sender_restricted,
            receiver_restricted: !!item.receiver_restricted,
            friend: formattedFriend
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

        // Filter out locally deleted overrides
        friends = friends.filter(f => !deletedMockIds.includes(f.id));
        requests = requests.filter(r => !deletedMockIds.includes(r.id));
        outgoing = outgoing.filter(o => !deletedMockIds.includes(o.id));

        // Add/replace simulated ones
        simulatedFriendships.forEach(sf => {
          if (sf.status === "accepted") {
            const index = friends.findIndex(f => f.friend.id === sf.friend.id);
            if (index !== -1) {
              friends[index] = sf;
            } else {
              friends.push(sf);
            }
          } else if (sf.status === "pending") {
            if (sf.receiver_id === user.id) {
              const index = requests.findIndex(r => r.friend.id === sf.friend.id);
              if (index !== -1) {
                requests[index] = sf;
              } else {
                requests.push(sf);
              }
            } else {
              const index = outgoing.findIndex(o => o.friend.id === sf.friend.id);
              if (index !== -1) {
                outgoing[index] = sf;
              } else {
                outgoing.push(sf);
              }
            }
          }
        });

        setFriendsList(friends);
        setRequestsList(requests);
        setOutgoingRequestsList(outgoing);
      } else {
        // Fallback to mock data with local overrides applied
        let friends: Friendship[] = mockFriends.map(f => ({
          id: `f_mock_${f.id}`,
          sender_id: f.id,
          receiver_id: user.id,
          status: "accepted" as const,
          sender_restricted: false,
          receiver_restricted: false,
          friend: f
        }));

        let requests: Friendship[] = mockRequestsStatic.map((r, index) => ({
          id: `req_${index + 1}`,
          sender_id: r.id,
          receiver_id: user.id,
          status: "pending" as const,
          sender_restricted: false,
          receiver_restricted: false,
          friend: r
        }));

        friends = friends.filter(f => !deletedMockIds.includes(f.id));
        requests = requests.filter(r => !deletedMockIds.includes(r.id));

        simulatedFriendships.forEach(sf => {
          if (sf.status === "accepted") {
            const index = friends.findIndex(f => f.friend.id === sf.friend.id);
            if (index !== -1) {
              friends[index] = sf;
            } else {
              friends.push(sf);
            }
          } else if (sf.status === "pending") {
            if (sf.receiver_id === user.id) {
              const index = requests.findIndex(r => r.friend.id === sf.friend.id);
              if (index !== -1) {
                requests[index] = sf;
              } else {
                requests.push(sf);
              }
            }
          }
        });

        setFriendsList(friends);
        setRequestsList(requests);
        setOutgoingRequestsList(simulatedFriendships.filter(sf => sf.status === "pending" && sf.sender_id === user.id));
      }
    } catch (e) {
      console.error("Failed to load friendships: ", e);
      setFriendsList(mockFriends.map(f => ({
        id: `f_mock_${f.id}`,
        sender_id: f.id,
        receiver_id: user.id,
        status: "accepted",
        sender_restricted: false,
        receiver_restricted: false,
        friend: f
      })));
      setRequestsList(mockRequestsStatic.map((r, index) => ({
        id: `req_${index + 1}`,
        sender_id: r.id,
        receiver_id: user.id,
        status: "pending" as const,
        sender_restricted: false,
        receiver_restricted: false,
        friend: r
      })));
      setOutgoingRequestsList([]);
    } finally {
      setLoadingList(false);
    }
  }, [user, deletedMockIds, simulatedFriendships]);

  useEffect(() => {
    if (!user) return;

    // Initial fetch - deferred to avoid synchronous setState inside effect body
    const handle = setTimeout(() => {
      triggerFetchList();
    }, 0);

    // Subscribe to realtime database changes on the friendships table
    const channel = supabase
      .channel("friendships_realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "friendships"
        },
        () => {
          // Re-fetch friends list on any insert/update/delete database event
          triggerFetchList();
        }
      )
      .subscribe();

    return () => {
      clearTimeout(handle);
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
      
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(searchQuery.trim());
      if (isUUID) {
        query = query.eq("id", searchQuery.trim());
      } else {
        query = query.ilike("username", `%${searchQuery.trim()}%`);
      }

      const { data, error } = await query.limit(5);

      if (!error && data && data.length > 0) {
        const filtered = data.filter((p: any) => p.id !== user?.id).map((p: any) => ({
          id: p.id,
          username: p.username || "user",
          full_name: p.full_name || "Teammate",
          avatar_url: p.avatar_url,
          academic_credits: p.academic_credits || 0,
          department: p.department,
          graduation_year: p.graduation_year,
          leetcode_username: p.leetcode_username,
          codeforces_username: p.codeforces_username,
          github_url: p.github_url,
          linkedin_url: p.linkedin_url,
          portfolio_url: p.portfolio_url
        }));
        setSearchResults(filtered);
        if (filtered.length === 0) {
          setSearchMessage("No users found matching query.");
        }
      } else {
        const mockDb = [...mockFriends, ...mockRequestsStatic];
        const match = mockDb.filter(m => 
          m.username.toLowerCase().includes(searchQuery.toLowerCase()) || 
          m.id.toLowerCase() === searchQuery.toLowerCase()
        );
        setSearchResults(match);
        if (match.length === 0) {
          setSearchMessage("No users found matching query.");
        }
      }
    } catch (err) {
      console.error("Search failed: ", err);
      setSearchMessage("Error executing user directory query.");
    } finally {
      setSearchLoading(false);
    }
  };

  // Send a Friend Request
  const sendFriendRequest = async (receiverId: string) => {
    if (!user) return;

    const alreadyFriends = friendsList.some(f => f.friend.id === receiverId);
    const alreadyRequested = requestsList.some(r => r.friend.id === receiverId) ||
                             outgoingRequestsList.some(r => r.friend.id === receiverId);
    if (alreadyFriends || alreadyRequested) {
      showCustomAlert("You are already connected or request is pending.");
      return;
    }

    const isMock = receiverId.startsWith("mock_") || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(receiverId);

    if (isMock) {
      const foundUser = searchResults.find(p => p.id === receiverId) || 
                         mockFriends.find(f => f.id === receiverId) ||
                         mockRequestsStatic.find(r => r.id === receiverId);
                         
      if (foundUser) {
        const simulatedObj: Friendship = {
          id: `sim_req_${foundUser.id}`,
          sender_id: user.id,
          receiver_id: foundUser.id,
          status: "pending",
          sender_restricted: false,
          receiver_restricted: false,
          friend: foundUser
        };
        
        updateSimulatedFriendships([...simulatedFriendships, simulatedObj]);
        showCustomAlert("Friend request sent successfully!");
      }
      return;
    }

    try {
      const { error } = await supabase
        .from("friendships")
        .insert({
          sender_id: user.id,
          receiver_id: receiverId,
          status: "pending"
        });

      if (!error) {
        showCustomAlert("Friend request sent successfully!");
        setSearchQuery("");
        setSearchResults([]);
        triggerFetchList();
      } else {
        showCustomAlert("Friend request sent (simulated fallback).");
      }
    } catch (e) {
      console.error(e);
      showCustomAlert("Friend request sent (simulated fallback).");
    }
  };

  // Toggle Restrict Friend Profile View
  const toggleRestrictFriend = async (friendshipId: string, isCurrentlyRestricted: boolean) => {
    if (!user) return;

    const friendship = friendsList.find(f => f.id === friendshipId);
    if (!friendship) return;

    const isSender = friendship.sender_id === user.id;
    const updatePayload = isSender 
      ? { sender_restricted: !isCurrentlyRestricted }
      : { receiver_restricted: !isCurrentlyRestricted };

    if (friendshipId.startsWith("f_mock_")) {
      const existingSim = simulatedFriendships.find(f => f.id === friendshipId);
      if (existingSim) {
        const updated = simulatedFriendships.map(f => {
          if (f.id === friendshipId) {
            return {
              ...f,
              sender_restricted: isSender ? !isCurrentlyRestricted : f.sender_restricted,
              receiver_restricted: !isSender ? !isCurrentlyRestricted : f.receiver_restricted
            };
          }
          return f;
        });
        updateSimulatedFriendships(updated);
      } else {
        const baseFriendship = friendsList.find(f => f.id === friendshipId);
        if (baseFriendship) {
          const newSim: Friendship = {
            ...baseFriendship,
            sender_restricted: isSender ? !isCurrentlyRestricted : baseFriendship.sender_restricted,
            receiver_restricted: !isSender ? !isCurrentlyRestricted : baseFriendship.receiver_restricted
          };
          updateSimulatedFriendships([...simulatedFriendships, newSim]);
        }
      }
      showCustomAlert(`Restriction ${!isCurrentlyRestricted ? "applied" : "removed"} successfully (mock mode).`);
      return;
    }

    if (friendshipId.startsWith("sim_")) {
      const updated = simulatedFriendships.map(f => {
        if (f.id === friendshipId) {
          return {
            ...f,
            sender_restricted: isSender ? !isCurrentlyRestricted : f.sender_restricted,
            receiver_restricted: !isSender ? !isCurrentlyRestricted : f.receiver_restricted
          };
        }
        return f;
      });
      updateSimulatedFriendships(updated);
      showCustomAlert(`Restriction ${!isCurrentlyRestricted ? "applied" : "removed"} successfully.`);
      return;
    }

    try {
      const { error } = await supabase
        .from("friendships")
        .update(updatePayload)
        .eq("id", friendshipId);

      if (!error) {
        showCustomAlert(`Restriction ${!isCurrentlyRestricted ? "applied" : "removed"} successfully!`);
        triggerFetchList();
      } else {
        console.error("Supabase restrict error:", error);
        setFriendsList(prev => prev.map(f => {
          if (f.id === friendshipId) {
            return {
              ...f,
              sender_restricted: isSender ? !isCurrentlyRestricted : f.sender_restricted,
              receiver_restricted: !isSender ? !isCurrentlyRestricted : f.receiver_restricted
            };
          }
          return f;
        }));
        showCustomAlert(`Restriction ${!isCurrentlyRestricted ? "applied" : "removed"} successfully (simulated fallback).`);
      }
    } catch (e) {
      console.error(e);
      showCustomAlert("Error updating restriction settings.");
    }
  };

  // Remove Friend
  const removeFriend = async (friendshipId: string) => {
    if (!user) return;

    updateDeletedMockIds([...deletedMockIds, friendshipId]);

    if (friendshipId.startsWith("f_mock_") || friendshipId.startsWith("sim_")) {
      setFriendsList(prev => prev.filter(f => f.id !== friendshipId));
      updateSimulatedFriendships(simulatedFriendships.filter(f => f.id !== friendshipId));
      setSelectedFriend(null);
      showCustomAlert("Friend removed successfully.");
      return;
    }

    try {
      const { error } = await supabase
        .from("friendships")
        .delete()
        .eq("id", friendshipId);

      if (!error) {
        showCustomAlert("Friend removed successfully.");
        setSelectedFriend(null);
        triggerFetchList();
      } else {
        console.error("Supabase delete friendship error:", error);
        setFriendsList(prev => prev.filter(f => f.id !== friendshipId));
        setSelectedFriend(null);
        showCustomAlert("Friend removed (simulated fallback).");
      }
    } catch (e) {
      console.error(e);
      showCustomAlert("Error removing friend.");
    }
  };

  // Accept a Friend Request
  const acceptFriendRequest = async (requestId: string) => {
    if (!user) return;

    if (requestId.startsWith("req_") || requestId.startsWith("sim_")) {
      setRequestsList(prev => prev.filter(r => r.id !== requestId));
      const acceptedReq = requestsList.find(r => r.id === requestId);
      if (acceptedReq) {
        const newFriendship = { ...acceptedReq, status: "accepted" as const };
        setFriendsList(prev => [...prev, newFriendship]);
        updateSimulatedFriendships([
          ...simulatedFriendships.filter(sf => sf.id !== requestId),
          newFriendship
        ]);
      }
      showCustomAlert("Friend request accepted!");
      return;
    }

    try {
      const { error } = await supabase
        .from("friendships")
        .update({ status: "accepted" })
        .eq("id", requestId);

      if (!error) {
        showCustomAlert("Friend request accepted!");
        triggerFetchList();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Decline/Cancel a Friend Request
  const declineFriendRequest = async (requestId: string) => {
    if (!user) return;

    updateDeletedMockIds([...deletedMockIds, requestId]);

    if (requestId.startsWith("req_") || requestId.startsWith("sim_")) {
      setRequestsList(prev => prev.filter(r => r.id !== requestId));
      updateSimulatedFriendships(simulatedFriendships.filter(f => f.id !== requestId));
      showCustomAlert("Friend request declined.");
      return;
    }

    try {
      const { error } = await supabase
        .from("friendships")
        .delete()
        .eq("id", requestId);

      if (!error) {
        showCustomAlert("Friend request declined successfully.");
        triggerFetchList();
      } else {
        showCustomAlert("Friend request declined.");
      }
    } catch (e) {
      console.error(e);
      showCustomAlert("Friend request declined.");
    }
  };

  // Active Friendship calculations
  const activeFriendship = selectedFriend 
    ? friendsList.find(f => f.friend.id === selectedFriend.id)
    : null;

  const isRestrictedByMe = activeFriendship
    ? (activeFriendship.sender_id === user?.id 
        ? !!activeFriendship.sender_restricted 
        : !!activeFriendship.receiver_restricted)
    : false;

  const isRestrictedByThem = activeFriendship
    ? (activeFriendship.sender_id === selectedFriend?.id 
        ? !!activeFriendship.sender_restricted 
        : !!activeFriendship.receiver_restricted)
    : false;

  const handleRestrictClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!activeFriendship) return;
    const nextRestricted = !isRestrictedByMe;
    const msg = nextRestricted
      ? `Restrict ${selectedFriend?.full_name} from viewing your profile?\n\nThey won't be notified, and they will just see a server error when trying to view your profile.`
      : `Remove profile view restriction for ${selectedFriend?.full_name}?`;

    showCustomAlert(
      msg,
      () => toggleRestrictFriend(activeFriendship.id, isRestrictedByMe),
      true // showCancel
    );
  };

  const handleRemoveFriendClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!activeFriendship) return;
    showCustomAlert(
      `Are you sure you want to remove ${selectedFriend?.full_name} from your friends list?`,
      () => removeFriend(activeFriendship.id),
      true // showCancel
    );
  };

  return (
    <div className="min-h-screen lg:h-screen lg:overflow-hidden flex flex-col font-sans selection:bg-accent-main selection:text-bg-base bg-bg-base">
      <Header />

      <main className="flex-1 overflow-y-auto lg:overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-0">
        
        {/* ================= LEFT SECTION: FRIENDS MANAGER (7 Columns) ================= */}
        <section className="lg:col-span-7 border-b lg:border-b-0 lg:border-r border-border-main/50 flex flex-col h-auto lg:h-full bg-bg-base overflow-hidden p-6 gap-6">
          <div className="flex justify-between items-center border-b border-border-main/40 pb-4">
            <div className="flex flex-col gap-0.5">
              <span className="font-mono text-[9px] uppercase tracking-widest text-txt-muted font-bold">Social Network</span>
              <h1 className="font-display text-3xl font-light tracking-tight text-txt-main">Campus Directory</h1>
              {user?.id && (
                <div 
                  onClick={() => {
                    navigator.clipboard.writeText(user.id);
                    showCustomAlert("UID copied to clipboard!");
                  }}
                  className="font-mono text-[9px] text-txt-muted/30 hover:text-txt-muted/80 transition-colors cursor-pointer select-all truncate mt-1 flex items-center gap-1 w-fit"
                  title="Click to copy UID"
                >
                  <span>My UID: {user.id}</span>
                </div>
              )}
            </div>
          </div>

          {/* Directory Search Form */}
          <form onSubmit={handleSearch} className="flex gap-2 items-center flex-shrink-0">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-txt-muted" size={14} />
              <input 
                type="text"
                required
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search classmates by username or full UUID..."
                className="w-full h-10 pl-9 pr-3 border border-border-main/80 bg-bg-base text-txt-main rounded-sm text-xs placeholder:text-txt-muted/50 focus:outline-none focus:border-txt-main focus:ring-1 focus:ring-ring-main transition-colors font-light"
              />
            </div>
            <button 
              type="submit"
              disabled={searchLoading}
              className="h-10 px-5 rounded-sm bg-accent-main hover:opacity-90 disabled:opacity-50 text-bg-base text-xs font-mono uppercase tracking-wider transition-opacity cursor-pointer font-bold"
            >
              {searchLoading ? "Searching..." : "Search"}
            </button>
          </form>

          {/* Search Results Display Area */}
          {searchResults.length > 0 && (
            <div className="border border-accent-main/40 bg-accent-main/5 p-4 rounded-sm flex flex-col gap-3 flex-shrink-0">
              <span className="font-mono text-[9px] uppercase tracking-widest text-accent-main font-bold">Search Results</span>
              <div className="flex flex-col gap-2.5">
                {searchResults.map(p => {
                  const isFriend = friendsList.some(f => f.friend.id === p.id);
                  const isOutgoing = outgoingRequestsList.some(r => r.friend.id === p.id);
                  const isIncoming = requestsList.some(r => r.friend.id === p.id);

                  return (
                    <div key={p.id} className="flex justify-between items-center bg-bg-surface p-2.5 border border-border-main/60 rounded-sm">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full border border-border-main/80 bg-bg-card flex items-center justify-center text-txt-muted flex-shrink-0">
                          <span className="text-[10px] font-mono font-bold uppercase">{p.username.substring(0, 2)}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs text-txt-main font-semibold">{p.full_name}</span>
                          <span className="text-[9px] text-txt-muted font-mono">@{p.username} • UID: {p.id.substring(0, 8)}...</span>
                        </div>
                      </div>

                      {isFriend ? (
                        <span className="h-7 px-3 bg-bg-card border border-border-main text-emerald-500 text-[9px] font-mono tracking-wider uppercase rounded-sm flex items-center gap-1 font-semibold select-none">
                          <Check size={10} /> Linked
                        </span>
                      ) : isOutgoing ? (
                        <span className="h-7 px-3 bg-bg-card border border-border-main text-txt-muted text-[9px] font-mono tracking-wider uppercase rounded-sm flex items-center gap-1 font-semibold select-none">
                          Pending
                        </span>
                      ) : isIncoming ? (
                        <button 
                          onClick={() => {
                            const req = requestsList.find(r => r.friend.id === p.id);
                            if (req) acceptFriendRequest(req.id);
                          }}
                          className="h-7 px-3 bg-emerald-600 hover:opacity-90 text-white text-[9px] font-mono tracking-wider uppercase rounded-sm flex items-center gap-1 cursor-pointer font-bold"
                        >
                          Accept
                        </button>
                      ) : (
                        <button 
                          onClick={() => sendFriendRequest(p.id)}
                          className="h-7 px-3 bg-accent-main hover:opacity-90 text-bg-base text-[9px] font-mono tracking-wider uppercase rounded-sm flex items-center gap-1 cursor-pointer font-bold"
                        >
                          <UserPlus size={10} /> Add
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {searchMessage && (
            <span className="text-[10px] text-txt-muted italic font-light px-1">{searchMessage}</span>
          )}

          {/* View Tab Selector */}
          <div className="flex border-b border-border-main/40 bg-bg-base/30 py-2.5 font-mono text-[10px] uppercase tracking-wider gap-6 flex-shrink-0">
            <button
              onClick={() => setActiveTab("friends")}
              className={`pb-1 cursor-pointer transition-all border-b-2 font-medium ${
                activeTab === "friends" 
                  ? "text-txt-main border-txt-main" 
                  : "text-txt-muted border-transparent hover:text-txt-main"
              }`}
            >
              My Friends ({friendsList.length})
            </button>
            <button
              onClick={() => setActiveTab("requests")}
              className={`pb-1 cursor-pointer transition-all border-b-2 font-medium ${
                activeTab === "requests" 
                  ? "text-txt-main border-txt-main" 
                  : "text-txt-muted border-transparent hover:text-txt-main"
              }`}
            >
              Friend Requests ({requestsList.length + outgoingRequestsList.length})
            </button>
          </div>

          {/* Friends & Requests List Content */}
          <div className="flex-1 overflow-y-auto px-1 py-1 border border-border-main/60 bg-bg-surface rounded-md">
            {loadingList ? (
              <div className="h-44 flex flex-col items-center justify-center text-center p-6 text-txt-muted font-mono text-[10px]">
                <Clock size={16} className="mb-2 animate-spin text-accent-main" />
                Syncing list...
              </div>
            ) : activeTab === "friends" ? (
              <div className="flex flex-col divide-y divide-border-main/60">
                {friendsList.length > 0 ? (
                  friendsList.map(item => (
                    <div 
                      key={item.id}
                      onClick={() => setSelectedFriend(item.friend)}
                      className="p-4 flex justify-between items-center gap-4 cursor-pointer hover:bg-bg-card/20 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full border border-border-main/80 bg-bg-card flex items-center justify-center text-txt-muted flex-shrink-0">
                          <span className="text-xs font-mono font-bold uppercase">{item.friend.username.substring(0, 2)}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs text-txt-main font-semibold hover:text-accent-main transition-colors">{item.friend.full_name}</span>
                          <span className="text-[10px] text-txt-muted font-mono">@{item.friend.username} • {item.friend.department || "Engineer"}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-[8px] font-mono bg-bg-card px-2 py-1 rounded border border-border-main/50 flex items-center gap-1 text-txt-sub">
                          <Award size={10} className="text-yellow-500" /> {item.friend.academic_credits} Credits
                        </span>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedFriend(item.friend);
                          }}
                          className="h-7 px-3 border border-border-main hover:bg-bg-card text-txt-main text-[9px] font-mono tracking-wider uppercase rounded-sm flex items-center cursor-pointer"
                        >
                          Overview
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="h-44 flex flex-col items-center justify-center text-center p-6 text-txt-muted font-mono text-[10px] uppercase">
                    No friends connected yet. Use search to find classmates.
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col divide-y divide-border-main/60">
                {/* Incoming Requests */}
                {requestsList.length > 0 && (
                  <div className="flex flex-col divide-y divide-border-main/60">
                    <div className="bg-bg-base/30 px-4 py-2 text-[9px] uppercase tracking-wider font-mono text-txt-muted border-b border-border-main/40 font-bold">
                      Incoming Requests ({requestsList.length})
                    </div>
                    {requestsList.map(item => (
                      <div 
                        key={item.id}
                        className="p-4 flex justify-between items-center gap-4 hover:bg-bg-card/5 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full border border-border-main/80 bg-bg-card flex items-center justify-center text-txt-muted flex-shrink-0">
                            <span className="text-xs font-mono font-bold uppercase">{item.friend.username.substring(0, 2)}</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs text-txt-main font-semibold">{item.friend.full_name}</span>
                            <span className="text-[10px] text-txt-muted font-mono">@{item.friend.username} • incoming request</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button 
                            onClick={() => acceptFriendRequest(item.id)}
                            className="h-7 px-3 bg-accent-main hover:opacity-90 text-bg-base text-[9px] font-mono tracking-wider uppercase rounded-sm flex items-center gap-1 font-bold cursor-pointer"
                          >
                            Accept
                          </button>
                          <button 
                            onClick={() => declineFriendRequest(item.id)}
                            className="h-7 px-3 border border-border-main hover:bg-bg-card text-txt-main text-[9px] font-mono tracking-wider uppercase rounded-sm flex items-center cursor-pointer"
                          >
                            Decline
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Sent Requests */}
                {outgoingRequestsList.length > 0 && (
                  <div className="flex flex-col divide-y divide-border-main/60">
                    <div className="bg-bg-base/30 px-4 py-2 text-[9px] uppercase tracking-wider font-mono text-txt-muted border-b border-border-main/40 border-t border-border-main/40 first:border-t-0 font-bold">
                      Sent Requests ({outgoingRequestsList.length})
                    </div>
                    {outgoingRequestsList.map(item => (
                      <div 
                        key={item.id}
                        className="p-4 flex justify-between items-center gap-4 hover:bg-bg-card/5 transition-colors bg-bg-surface/30"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full border border-border-main/80 bg-bg-card flex items-center justify-center text-txt-muted flex-shrink-0">
                            <span className="text-xs font-mono font-bold uppercase">{item.friend.username.substring(0, 2)}</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs text-txt-main font-semibold">{item.friend.full_name}</span>
                            <span className="text-[10px] text-txt-muted font-mono">@{item.friend.username} • waiting for approval</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-[9px] font-mono text-txt-muted uppercase tracking-wider bg-bg-card px-2.5 py-1 border border-border-main/50 rounded-sm">
                            Pending
                          </span>
                          <button 
                            onClick={() => declineFriendRequest(item.id)}
                            className="h-7 px-3 border border-border-main hover:bg-bg-card text-txt-main text-[9px] font-mono tracking-wider uppercase rounded-sm flex items-center cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {requestsList.length === 0 && outgoingRequestsList.length === 0 && (
                  <div className="h-44 flex flex-col items-center justify-center text-center p-6 text-txt-muted font-mono text-[10px] uppercase">
                    Inbox is empty. No pending friend requests.
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        {/* ================= RIGHT SECTION: FRIEND OVERVIEW (5 Columns) ================= */}
        <section className="lg:col-span-5 bg-bg-surface/30 flex flex-col h-auto lg:h-full overflow-y-auto p-6 gap-6">
          <div className="flex flex-col gap-0.5 border-b border-border-main/40 pb-4">
            <span className="font-mono text-[9px] uppercase tracking-widest text-txt-muted font-bold">Classmate Portfolio</span>
            <h2 className="font-display text-lg font-light text-txt-main">Overview Profile</h2>
          </div>

          {selectedFriend ? (
            <div className="flex flex-col gap-6 animate-fade-in">
              {isRestrictedByThem ? (
                /* SERVER ERROR CONTAINER */
                <div className="border border-red-500/20 bg-red-500/5 p-6 rounded-sm flex flex-col items-center justify-center text-center h-64 gap-2">
                  <AlertTriangle size={18} className="mb-1 text-red-500/70 animate-pulse" />
                  <span className="font-mono text-[9px] uppercase tracking-widest text-red-500 font-bold">Connection Refused</span>
                  <span className="text-[11px] font-mono text-txt-main/90 font-semibold">Error: Server Error (500)</span>
                  <p className="text-[10px] text-txt-muted/70 font-light max-w-xs leading-relaxed">
                    Internal system failure when establishing connection handshake with this peer database entry. Please retry later.
                  </p>
                </div>
              ) : (
                /* NORMAL PROFILE CONTENTS */
                <>
                  {/* Primary Identity */}
                  <div className="border border-border-main/70 bg-bg-surface p-5 rounded-sm flex flex-col gap-3">
                    <div className="flex justify-between items-start">
                      <span className="font-mono text-[9px] uppercase tracking-widest text-txt-muted font-bold font-semibold">Profile Credentials</span>
                      <span className="text-[8px] font-mono tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/40 px-2 py-0.5 rounded uppercase">
                        Connected Friend
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full border border-border-main/80 bg-bg-card flex items-center justify-center text-txt-muted text-base font-mono font-bold uppercase">
                        {selectedFriend.username.substring(0, 2)}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-base text-txt-main font-semibold">{selectedFriend.full_name}</span>
                        <span className="text-xs text-txt-muted font-mono">@{selectedFriend.username}</span>
                        <span className="text-[10px] text-txt-sub mt-0.5 leading-relaxed">
                          {selectedFriend.college_name || "Independent University"} • {selectedFriend.department || "Engineering"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Campus Academic Standing */}
                  <div className="border border-border-main/70 bg-bg-surface p-5 rounded-sm flex flex-col gap-3">
                    <span className="font-mono text-[9px] uppercase tracking-widest text-txt-muted font-bold">Campus Milestone Standings</span>
                    <div className="flex items-baseline gap-1 bg-bg-base/30 p-4 border border-border-main/50 rounded text-center justify-center flex-col">
                      <span className="text-3xl font-display font-light text-txt-main">{selectedFriend.academic_credits}</span>
                      <span className="text-[9px] font-mono text-txt-muted uppercase tracking-wider">Campus Activity Points Verified</span>
                    </div>
                  </div>

                  {/* Competitive Coding Profiles */}
                  {(selectedFriend.leetcode_username || 
                    selectedFriend.codeforces_username || 
                    selectedFriend.codechef_username || 
                    selectedFriend.unstop_username || 
                    selectedFriend.hack2skill_username) && (
                    <div className="border border-border-main/70 bg-bg-surface p-5 rounded-sm flex flex-col gap-3">
                      <span className="font-mono text-[9px] uppercase tracking-widest text-txt-muted font-bold font-semibold">Competitive Coding & Portals</span>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-center">
                        {selectedFriend.leetcode_username && (
                          <div className="bg-bg-base/30 p-3 border border-border-main/50 rounded flex flex-col gap-0.5">
                            <span className="text-[8px] font-mono text-txt-muted uppercase">LeetCode</span>
                            <span className="text-xs font-semibold text-txt-main font-mono truncate">@{selectedFriend.leetcode_username}</span>
                          </div>
                        )}
                        {selectedFriend.codeforces_username && (
                          <div className="bg-bg-base/30 p-3 border border-border-main/50 rounded flex flex-col gap-0.5">
                            <span className="text-[8px] font-mono text-txt-muted uppercase">Codeforces</span>
                            <span className="text-xs font-semibold text-accent-main font-mono truncate">@{selectedFriend.codeforces_username}</span>
                          </div>
                        )}
                        {selectedFriend.codechef_username && (
                          <div className="bg-bg-base/30 p-3 border border-border-main/50 rounded flex flex-col gap-0.5">
                            <span className="text-[8px] font-mono text-txt-muted uppercase">CodeChef</span>
                            <span className="text-xs font-semibold text-txt-main font-mono truncate">@{selectedFriend.codechef_username}</span>
                          </div>
                        )}
                        {selectedFriend.unstop_username && (
                          <div className="bg-bg-base/30 p-3 border border-border-main/50 rounded flex flex-col gap-0.5">
                            <span className="text-[8px] font-mono text-txt-muted uppercase">Unstop</span>
                            <span className="text-xs font-semibold text-txt-main font-mono truncate">@{selectedFriend.unstop_username}</span>
                          </div>
                        )}
                        {selectedFriend.hack2skill_username && (
                          <div className="bg-bg-base/30 p-3 border border-border-main/50 rounded flex flex-col gap-0.5">
                            <span className="text-[8px] font-mono text-txt-muted uppercase">Hack2Skill</span>
                            <span className="text-xs font-semibold text-txt-main font-mono truncate">@{selectedFriend.hack2skill_username}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Portfolio & Codebases */}
                  <div className="border border-border-main/70 bg-bg-surface p-5 rounded-sm flex flex-col gap-3">
                    <span className="font-mono text-[9px] uppercase tracking-widest text-txt-muted font-bold">Verified Codebases</span>
                    
                    <div className="flex flex-col divide-y divide-border-main/40 text-xs font-mono">
                      <div className="flex justify-between items-center py-2.5">
                        <span className="text-txt-sub">GitHub Link</span>
                        {selectedFriend.github_url ? (
                          <a href={selectedFriend.github_url} target="_blank" rel="noreferrer" className="text-txt-main hover:underline flex items-center gap-1 font-bold">
                            Visit Repo <ExternalLink size={9} />
                          </a>
                        ) : (
                          <span className="text-txt-muted italic">Unavailable</span>
                        )}
                      </div>
                      
                      <div className="flex justify-between items-center py-2.5">
                        <span className="text-txt-sub">LinkedIn</span>
                        {selectedFriend.linkedin_url ? (
                          <a href={selectedFriend.linkedin_url} target="_blank" rel="noreferrer" className="text-txt-main hover:underline flex items-center gap-1 font-bold">
                            Visit Profile <ExternalLink size={9} />
                          </a>
                        ) : (
                          <span className="text-txt-muted italic">Unavailable</span>
                        )}
                      </div>

                      <div className="flex justify-between items-center py-2.5">
                        <span className="text-txt-sub">Portfolio Website</span>
                        {selectedFriend.portfolio_url ? (
                          <a href={selectedFriend.portfolio_url} target="_blank" rel="noreferrer" className="text-txt-main hover:underline flex items-center gap-1 font-bold">
                            Visit Site <ExternalLink size={9} />
                          </a>
                        ) : (
                          <span className="text-txt-muted italic">Unavailable</span>
                        )}
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Action Toggles for Restriction / Removal */}
              {activeFriendship && (
                <div className="flex justify-between items-center mt-2 pt-4 border-t border-border-main/20">
                  <button
                    onClick={handleRestrictClick}
                    className="text-[9px] text-txt-muted/30 hover:text-red-400/80 transition-colors uppercase tracking-wider font-mono select-none cursor-pointer"
                  >
                    {isRestrictedByMe ? "Lift profile view restriction" : "Restrict profile view"}
                  </button>
                  <button
                    onClick={handleRemoveFriendClick}
                    className="text-[9px] text-txt-muted/50 hover:text-red-500 transition-colors uppercase tracking-wider font-mono select-none cursor-pointer"
                  >
                    Remove Friend
                  </button>
                </div>
              )}

            </div>
          ) : (
            <div className="h-64 border border-border-main/80 border-dashed rounded-sm flex flex-col items-center justify-center text-center p-6 text-txt-muted">
              <Code size={18} className="mb-2" />
              <span className="text-[10px] font-mono uppercase tracking-wider">No Selection</span>
              <p className="text-[10px] font-light leading-relaxed max-w-xs mt-1">
                Select a friend from the left list to audit their verified competitive coding stats, university credits, and online repos.
              </p>
            </div>
          )}
        </section>

      </main>

      {/* Custom Theme Alert Modal */}
      {customAlert.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-bg-surface border border-border-main max-w-sm w-full mx-4 p-6 rounded-sm shadow-2xl flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <span className="font-mono text-[9px] uppercase tracking-widest text-txt-muted font-bold">System Notification</span>
              <p className="text-xs text-txt-main font-light leading-relaxed mt-2 whitespace-pre-line">
                {customAlert.message}
              </p>
            </div>
            <div className="flex justify-end gap-2 mt-2 font-mono text-[9px] uppercase tracking-wider">
              {customAlert.showCancel && (
                <button
                  onClick={() => setCustomAlert(prev => ({ ...prev, isOpen: false }))}
                  className="px-4 h-8 border border-border-main hover:bg-bg-card text-txt-main rounded-sm cursor-pointer"
                >
                  Cancel
                </button>
              )}
              <button
                onClick={() => {
                  setCustomAlert(prev => ({ ...prev, isOpen: false }));
                  if (customAlert.onConfirm) {
                    customAlert.onConfirm();
                  }
                }}
                className="px-4 h-8 bg-accent-main hover:opacity-90 text-bg-base rounded-sm font-bold cursor-pointer"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
