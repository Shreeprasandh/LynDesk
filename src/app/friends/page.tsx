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
  Copy,
  Clock
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
  github_url?: string;
  linkedin_url?: string;
  portfolio_url?: string;
}

interface Friendship {
  id: string;
  sender_id: string;
  receiver_id: string;
  status: "pending" | "accepted" | "rejected";
  friend: FriendProfile;
}

export default function FriendsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"friends" | "requests">("friends");
  const [uidCopied, setUidCopied] = useState(false);

  // Search States
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<FriendProfile[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchMessage, setSearchMessage] = useState<string | null>(null);

  // Friends & Requests Lists
  const [friendsList, setFriendsList] = useState<Friendship[]>([]);
  const [requestsList, setRequestsList] = useState<Friendship[]>([]);
  const [loadingList, setLoadingList] = useState(true);

  // Overview Modal
  const [selectedFriend, setSelectedFriend] = useState<FriendProfile | null>(null);

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

  const mockRequests: Friendship[] = [
    {
      id: "req_1",
      sender_id: "mock_r1",
      receiver_id: user?.id || "my_id",
      status: "pending",
      friend: {
        id: "mock_r1",
        username: "sofia_r",
        full_name: "Sofia Rodriguez",
        academic_credits: 15,
        department: "AI & Robotics",
        graduation_year: "2027",
        college_name: "California Institute of Technology",
        leetcode_username: "sofia_leetcode",
        github_url: "https://github.com/sofiar",
      }
    },
    {
      id: "req_2",
      sender_id: "mock_r2",
      receiver_id: user?.id || "my_id",
      status: "pending",
      friend: {
        id: "mock_r2",
        username: "david_chen",
        full_name: "David Chen",
        academic_credits: 22,
        department: "Electrical Engineering",
        graduation_year: "2026",
        college_name: "IIT Delhi",
        codeforces_username: "dchen_cf",
      }
    }
  ];

  const copyUidToClipboard = () => {
    if (!user) return;
    navigator.clipboard.writeText(user.id);
    setUidCopied(true);
    setTimeout(() => setUidCopied(false), 2000);
  };

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
          sender:sender_id ( id, username, full_name, avatar_url, academic_credits, department, graduation_year, leetcode_username, codeforces_username, github_url, linkedin_url, portfolio_url ),
          receiver:receiver_id ( id, username, full_name, avatar_url, academic_credits, department, graduation_year, leetcode_username, codeforces_username, github_url, linkedin_url, portfolio_url )
        `);

      if (!error && data && data.length > 0) {
        const friends: Friendship[] = [];
        const requests: Friendship[] = [];

        data.forEach((item: any) => {
          const isSender = item.sender_id === user.id;
          const partner = isSender ? item.receiver : item.sender;
          
          if (partner) {
            const formattedFriend: FriendProfile = {
              id: partner.id,
              username: partner.username || "user",
              full_name: partner.full_name || "Teammate",
              avatar_url: partner.avatar_url,
              academic_credits: partner.academic_credits || 0,
              department: partner.department,
              graduation_year: partner.graduation_year,
              leetcode_username: partner.leetcode_username,
              codeforces_username: partner.codeforces_username,
              github_url: partner.github_url,
              linkedin_url: partner.linkedin_url,
              portfolio_url: partner.portfolio_url
            };

            const friendshipObj: Friendship = {
              id: item.id,
              sender_id: item.sender_id,
              receiver_id: item.receiver_id,
              status: item.status,
              friend: formattedFriend
            };

            if (item.status === "accepted") {
              friends.push(friendshipObj);
            } else if (item.status === "pending") {
              if (item.receiver_id === user.id) {
                requests.push(friendshipObj);
              }
            }
          }
        });

        setFriendsList(friends);
        setRequestsList(requests);
      } else {
        setFriendsList(mockFriends.map(f => ({
          id: `f_${f.id}`,
          sender_id: f.id,
          receiver_id: user.id,
          status: "accepted",
          friend: f
        })));
        setRequestsList(mockRequests);
      }
    } catch (e) {
      console.error("Failed to load friendships: ", e);
      setFriendsList(mockFriends.map(f => ({
        id: `f_${f.id}`,
        sender_id: f.id,
        receiver_id: user.id,
        status: "accepted",
        friend: f
      })));
      setRequestsList(mockRequests);
    } finally {
      setLoadingList(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      const handle = setTimeout(() => {
        triggerFetchList();
      }, 0);
      return () => clearTimeout(handle);
    }
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
        const mockDb = [...mockFriends, ...mockRequests.map(r => r.friend)];
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
    const alreadyRequested = requestsList.some(r => r.friend.id === receiverId);
    if (alreadyFriends || alreadyRequested) {
      alert("You are already connected or request is pending.");
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
        alert("Friend request sent successfully!");
        setSearchQuery("");
        setSearchResults([]);
        triggerFetchList();
      } else {
        alert("Friend request sent (simulated fallback).");
      }
    } catch (e) {
      console.error(e);
      alert("Friend request sent (simulated fallback).");
    }
  };

  // Accept a Friend Request
  const acceptFriendRequest = async (requestId: string) => {
    if (!user) return;

    if (requestId.startsWith("req_")) {
      setRequestsList(prev => prev.filter(r => r.id !== requestId));
      const acceptedReq = requestsList.find(r => r.id === requestId);
      if (acceptedReq) {
        setFriendsList(prev => [...prev, { ...acceptedReq, status: "accepted" }]);
      }
      return;
    }

    try {
      const { error } = await supabase
        .from("friendships")
        .update({ status: "accepted" })
        .eq("id", requestId);

      if (!error) {
        triggerFetchList();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Decline/Cancel a Friend Request
  const declineFriendRequest = async (requestId: string) => {
    if (!user) return;

    if (requestId.startsWith("req_")) {
      setRequestsList(prev => prev.filter(r => r.id !== requestId));
      return;
    }

    try {
      const { error } = await supabase
        .from("friendships")
        .delete()
        .eq("id", requestId);

      if (!error) {
        triggerFetchList();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="h-screen overflow-hidden flex flex-col font-sans selection:bg-accent-main selection:text-bg-base bg-bg-base">
      <Header />

      <main className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-0">
        
        {/* ================= LEFT SECTION: FRIENDS MANAGER (7 Columns) ================= */}
        <section className="lg:col-span-7 border-r border-border-main/50 flex flex-col h-full bg-bg-base overflow-hidden p-6 gap-6">
          <div className="flex justify-between items-center border-b border-border-main/40 pb-4">
            <div className="flex flex-col gap-0.5">
              <span className="font-mono text-[9px] uppercase tracking-widest text-txt-muted font-bold">Social Network</span>
              <h1 className="font-display text-3xl font-light tracking-tight text-txt-main">Campus Directory</h1>
            </div>
            
            <div className="flex flex-col text-right items-end bg-bg-card/30 border border-border-main/60 p-2.5 rounded-sm">
              <span className="text-[10px] font-semibold text-txt-main">Your Desk ID</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[9px] text-txt-muted opacity-80 font-mono select-all">
                  {user?.id ? `${user.id.substring(0, 8)}...` : "Loading..."}
                </span>
                <button 
                  onClick={copyUidToClipboard}
                  className="text-txt-muted hover:text-txt-main cursor-pointer"
                  title="Copy Full UID"
                >
                  {uidCopied ? <span className="text-[8px] text-emerald-500 font-mono">Copied</span> : <Copy size={10} />}
                </button>
              </div>
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
                {searchResults.map(p => (
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

                    <button 
                      onClick={() => sendFriendRequest(p.id)}
                      className="h-7 px-3 bg-accent-main hover:opacity-90 text-bg-base text-[9px] font-mono tracking-wider uppercase rounded-sm flex items-center gap-1 cursor-pointer"
                    >
                      <UserPlus size={10} /> Add Classmate
                    </button>
                  </div>
                ))}
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
              Friend Requests Inbox ({requestsList.length})
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
                {requestsList.length > 0 ? (
                  requestsList.map(item => (
                    <div 
                      key={item.id}
                      className="p-4 flex justify-between items-center gap-4"
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
                  ))
                ) : (
                  <div className="h-44 flex flex-col items-center justify-center text-center p-6 text-txt-muted font-mono text-[10px] uppercase">
                    Inbox is empty. No pending friend requests.
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        {/* ================= RIGHT SECTION: FRIEND OVERVIEW (5 Columns) ================= */}
        <section className="lg:col-span-5 bg-bg-surface/30 flex flex-col h-full overflow-y-auto p-6 gap-6">
          <div className="flex flex-col gap-0.5 border-b border-border-main/40 pb-4">
            <span className="font-mono text-[9px] uppercase tracking-widest text-txt-muted font-bold">Classmate Portfolio</span>
            <h2 className="font-display text-lg font-light text-txt-main">Overview Profile</h2>
          </div>

          {selectedFriend ? (
            <div className="flex flex-col gap-6 animate-fade-in">
              
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
              <div className="border border-border-main/70 bg-bg-surface p-5 rounded-sm flex flex-col gap-3">
                <span className="font-mono text-[9px] uppercase tracking-widest text-txt-muted font-bold font-semibold">Competitive Coding Sync</span>
                
                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="bg-bg-base/30 p-3 border border-border-main/50 rounded flex flex-col gap-0.5">
                    <span className="text-[8px] font-mono text-txt-muted uppercase">LeetCode Username</span>
                    <span className="text-xs font-semibold text-txt-main font-mono truncate">{selectedFriend.leetcode_username || "Not synced"}</span>
                  </div>
                  <div className="bg-bg-base/30 p-3 border border-border-main/50 rounded flex flex-col gap-0.5">
                    <span className="text-[8px] font-mono text-txt-muted uppercase">Codeforces handle</span>
                    <span className="text-xs font-semibold text-accent-main font-mono truncate">{selectedFriend.codeforces_username || "Not synced"}</span>
                  </div>
                </div>
              </div>

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
    </div>
  );
}
