"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";
import { 
  X, 
  Plus, 
  Trash2, 
  Trophy,
  Calendar,
  Compass,
  UserCheck,
  ExternalLink,
  Pencil,
  Clock,
  Sparkles,
  Search,
  Building2
} from "lucide-react";

interface ApplicationItem {
  id: string;
  title: string;
  portal: "Unstop" | "Devpost" | "On-Campus" | "Other";
  portal_url: string;
  handle?: string;
  user_handle?: string;
  role: string;
  status: "Applied" | "Under Review" | "Shortlisted" | "Won" | "Rejected";
  stage: string;
  deadline?: string;
  created_at: string;
  updated_at: string;
}

interface AppliedHackathonsModalProps {
  isOpen?: boolean;
  onClose: () => void;
  unstopUser?: string;
  devpostUser?: string;
  onRefreshCount?: () => void;
}

const STAGES = ["Registration", "Round 1 / Ideation", "Round 2 / Prototype", "Grand Finale"];

function getDeadlineStatus(deadlineStr?: string) {
  if (!deadlineStr) {
    return { label: "⏳ Timeline TBA", isUrgent: false, isClosed: false, isTBA: true };
  }
  const deadline = new Date(deadlineStr).getTime();
  if (isNaN(deadline)) {
    return { label: "⏳ Timeline TBA", isUrgent: false, isClosed: false, isTBA: true };
  }
  const now = Date.now();
  const diffMs = deadline - now;
  if (diffMs <= 0) return { label: "Round Closed", isUrgent: false, isClosed: true, isTBA: false };
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);
  const remHours = diffHours % 24;
  if (diffDays >= 3) {
    return { label: `${diffDays}d ${remHours}h remaining`, isUrgent: false, isClosed: false, isTBA: false };
  }
  return { label: `Closing in ${diffDays}d ${remHours}h!`, isUrgent: true, isClosed: false, isTBA: false };
}

export default function AppliedHackathonsModal({
  isOpen = true,
  onClose,
  unstopUser,
  devpostUser,
  onRefreshCount
}: AppliedHackathonsModalProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterPortal, setFilterPortal] = useState<string>("all");
  const [showAddForm, setShowAddForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Verified Catalog Search & Auto-Fill
  const [catalogEvents, setCatalogEvents] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);

  // Add Form State
  const [formData, setFormData] = useState({
    title: "",
    portal: "Unstop" as "Unstop" | "Devpost" | "On-Campus" | "Other",
    portal_url: "",
    role: "Participant / Solo",
    status: "Applied" as const,
    stage: "Round 1 / Ideation",
    deadline: "",
    no_deadline: false
  });

  // Edit Modal State
  const [editModalItem, setEditModalItem] = useState<ApplicationItem | null>(null);
  const [editFormData, setEditFormData] = useState({
    title: "",
    portal: "Unstop" as "Unstop" | "Devpost" | "On-Campus" | "Other",
    portal_url: "",
    role: "Participant / Solo",
    stage: "Round 1 / Ideation",
    deadline: "",
    no_deadline: false
  });

  useEffect(() => {
    let isMounted = true;
    async function initialFetch() {
      if (!user) {
        if (isMounted) setLoading(false);
        return;
      }
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          if (isMounted) setLoading(false);
          return;
        }

        const [appRes, catRes] = await Promise.allSettled([
          fetch("/api/user/applied-hackathons", {
            headers: { Authorization: `Bearer ${session.access_token}` }
          }),
          fetch("/api/events")
        ]);

        if (appRes.status === "fulfilled" && appRes.value.ok && isMounted) {
          const data = await appRes.value.json();
          setApplications(data.applications || []);
        }

        if (catRes.status === "fulfilled" && catRes.value.ok && isMounted) {
          const cData = await catRes.value.json();
          setCatalogEvents(cData.events || []);
        }
      } catch (err) {
        console.warn("[AppliedHackathonsModal] Fetch notice:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    initialFetch();
    return () => { isMounted = false; };
  }, [user, unstopUser, devpostUser]);

  const handleTitleChange = (val: string) => {
    setFormData(prev => ({ ...prev, title: val }));
    if (!val.trim() || val.length < 2) {
      setSuggestions([]);
      return;
    }
    const q = val.toLowerCase();
    const matches = catalogEvents
      .filter(e => e.title?.toLowerCase().includes(q) || e.description?.toLowerCase().includes(q))
      .slice(0, 4);
    setSuggestions(matches);
  };

  const handleSelectSuggestion = (ev: any) => {
    let matchedPortal: "Unstop" | "Devpost" | "On-Campus" | "Other" = "Other";
    const srcUrl = (ev.url || "").toLowerCase();
    if (srcUrl.includes("unstop.com")) matchedPortal = "Unstop";
    else if (srcUrl.includes("devpost.com")) matchedPortal = "Devpost";
    else if (ev.location === "in_person" || ev.level === "institutional") matchedPortal = "On-Campus";

    let dateVal = "";
    if (ev.deadline && ev.deadline !== "Active / Rolling" && !isNaN(new Date(ev.deadline).getTime())) {
      const d = new Date(ev.deadline);
      dateVal = d.toISOString().split("T")[0];
    }

    setFormData(prev => ({
      ...prev,
      title: ev.title || prev.title,
      portal: matchedPortal,
      portal_url: ev.url && ev.url.startsWith("http") ? ev.url : "",
      deadline: dateVal,
      no_deadline: !dateVal
    }));
    setSuggestions([]);
  };

  const handleAddApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    setSubmitting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const handle = formData.portal === "Unstop" && unstopUser 
        ? `@${unstopUser}` 
        : (formData.portal === "Devpost" && devpostUser ? `@${devpostUser}` : undefined);

      const res = await fetch("/api/user/applied-hackathons", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          ...formData,
          deadline: formData.no_deadline ? null : (formData.deadline || null),
          handle,
          user_handle: handle
        })
      });

      if (res.ok) {
        const data = await res.json();
        setApplications(prev => [data.application, ...prev]);
        setShowAddForm(false);
        setFormData({
          title: "",
          portal: "Unstop",
          portal_url: "",
          role: "Participant / Solo",
          status: "Applied",
          stage: "Round 1 / Ideation",
          deadline: "",
          no_deadline: false
        });
        onRefreshCount?.();
      }
    } catch (err) {
      console.warn("Application add error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = (item: ApplicationItem) => {
    let dateStr = "";
    if (item.deadline) {
      const d = new Date(item.deadline);
      if (!isNaN(d.getTime())) {
        dateStr = d.toISOString().split("T")[0];
      }
    }
    setEditModalItem(item);
    setEditFormData({
      title: item.title,
      portal: item.portal,
      portal_url: item.portal_url && item.portal_url.startsWith("http") ? item.portal_url : "",
      role: item.role || "Participant / Solo",
      stage: item.stage || "Round 1 / Ideation",
      deadline: dateStr,
      no_deadline: !item.deadline
    });
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editModalItem) return;

    setSubmitting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const res = await fetch("/api/user/applied-hackathons", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          id: editModalItem.id,
          title: editFormData.title,
          portal: editFormData.portal,
          portal_url: editFormData.portal_url,
          role: editFormData.role,
          stage: editFormData.stage,
          deadline: editFormData.no_deadline ? null : (editFormData.deadline || null)
        })
      });

      if (res.ok) {
        const data = await res.json();
        setApplications(prev => prev.map(a => a.id === editModalItem.id ? data.application : a));
        setEditModalItem(null);
        onRefreshCount?.();
      }
    } catch (err) {
      console.warn("Edit application error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStage = async (id: string, newStage: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const res = await fetch("/api/user/applied-hackathons", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ id, stage: newStage })
      });

      if (res.ok) {
        setApplications(prev => prev.map(a => a.id === id ? { ...a, stage: newStage } : a));
      }
    } catch (err) {
      console.warn("Stage update error:", err);
    }
  };

  const handleDeleteApplication = async (id: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const res = await fetch(`/api/user/applied-hackathons?id=${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${session.access_token}` }
      });

      if (res.ok) {
        setApplications(prev => prev.filter(a => a.id !== id));
        onRefreshCount?.();
      }
    } catch (err) {
      console.warn("Application delete error:", err);
    }
  };

  const filteredApps = applications.filter(a => {
    if (
      a.status === "Rejected" || 
      (a.status as string) === "Eliminated" || 
      a.stage?.toLowerCase().includes("eliminated") || 
      (a.status as string) === "Finished"
    ) {
      return false;
    }
    if (filterPortal === "all") return true;
    return a.portal === filterPortal;
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-bg-base/80 backdrop-blur-xs z-50 flex items-center justify-center p-4 font-sans text-txt-main">
      <div className="bg-bg-surface border border-border-main/80 rounded-md max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90dvh] overscroll-contain">
        {/* Header */}
        <div className="p-6 border-b border-border-main/40 flex items-center justify-between bg-bg-surface">
          <div className="flex flex-col gap-0.5">
            <span className="font-mono text-[9px] uppercase tracking-widest text-txt-muted font-bold">
              Live Radar
            </span>
            <h2 className="font-display text-xl font-light text-txt-main tracking-tight">
              Applied Hackathons & Contests
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddForm(true)}
              className="h-8 px-3 bg-accent-main hover:opacity-90 text-bg-base font-mono text-[10px] uppercase tracking-wider font-bold rounded-xs flex items-center gap-1.5 cursor-pointer transition-opacity"
            >
              <Plus size={11} /> Track Event
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xs bg-bg-card hover:bg-border-main/40 border border-border-main/70 text-txt-muted hover:text-txt-main flex items-center justify-center cursor-pointer transition-colors"
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="px-6 pt-3 border-b border-border-main/40 bg-bg-surface flex items-center gap-4 overflow-x-auto">
          {["all", "Unstop", "Devpost", "On-Campus", "Other"].map(tab => (
            <button
              key={tab}
              onClick={() => setFilterPortal(tab)}
              className={`pb-2.5 text-xs font-mono uppercase tracking-wider font-semibold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
                filterPortal === tab
                  ? "border-accent-main text-accent-main"
                  : "border-transparent text-txt-muted hover:text-txt-main"
              }`}
            >
              {tab === "all" ? `All Active (${filteredApps.length})` : `${tab} (${filteredApps.filter(a => a.portal === tab).length})`}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto space-y-3 flex-1">
          {loading ? (
            <div className="py-16 text-center space-y-2">
              <div className="w-5 h-5 border-2 border-accent-main border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="font-mono text-xs text-txt-muted">Loading live registered events...</p>
            </div>
          ) : filteredApps.length === 0 ? (
            <div className="border border-dashed border-border-main/60 rounded-md p-10 text-center space-y-4 bg-bg-card/20">
              <div className="w-12 h-12 rounded-full bg-accent-main/10 border border-accent-main/20 flex items-center justify-center mx-auto text-accent-main">
                <Trophy size={22} />
              </div>
              <div className="space-y-1">
                <h3 className="font-display text-base font-normal text-txt-main">No Live Tracked Events</h3>
                <p className="font-mono text-xs text-txt-muted max-w-md mx-auto">
                  Keep active hackathons, round deadlines, and submission milestones synchronized in real time.
                </p>
              </div>
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => setShowAddForm(true)}
                  className="h-8 px-4 bg-accent-main text-bg-base font-mono text-[10px] uppercase tracking-wider font-bold rounded-xs flex items-center gap-1.5 cursor-pointer hover:opacity-90"
                >
                  <Plus size={12} /> Track Live Event
                </button>
                <button
                  onClick={() => {
                    onClose();
                    router.push("/explore");
                  }}
                  className="h-8 px-4 bg-bg-card border border-border-main text-txt-main font-mono text-[10px] uppercase tracking-wider font-semibold rounded-xs flex items-center gap-1.5 cursor-pointer hover:bg-border-main/40"
                >
                  <Compass size={12} /> Browse Explore Arena
                </button>
              </div>
            </div>
          ) : (
            filteredApps.map((item) => {
              const deadlineStatus = getDeadlineStatus(item.deadline);
              const currentStageIndex = STAGES.findIndex(s => s.toLowerCase() === (item.stage || "").toLowerCase());
              const activeIndex = currentStageIndex >= 0 ? currentStageIndex : 0;

              return (
                <div
                  key={item.id}
                  className="border border-border-main/70 bg-bg-surface p-4 rounded-md space-y-3.5 hover:border-border-main transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-bg-card border border-border-main/70 font-mono text-[9px] uppercase text-txt-sub rounded-xs font-semibold">
                        {item.portal}
                      </span>
                      <h3 className="text-xs font-semibold text-txt-main">{item.title}</h3>
                    </div>

                    <div className="flex items-center gap-2">
                      {deadlineStatus && (
                        <span className={`px-2 py-0.5 rounded font-mono text-[9px] border ${
                          deadlineStatus.isTBA
                            ? "bg-bg-card border-border-main/70 text-txt-muted"
                            : deadlineStatus.isClosed
                            ? "bg-red-500/10 border-red-500/30 text-red-400"
                            : deadlineStatus.isUrgent
                            ? "bg-amber-500/10 border-amber-500/30 text-amber-400 font-semibold"
                            : "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                        }`}>
                          {deadlineStatus.label}
                        </span>
                      )}
                      <button
                        onClick={() => startEdit(item)}
                        className="text-txt-muted hover:text-accent-main p-1 transition-colors cursor-pointer"
                        aria-label="Edit event details, link or deadline"
                      >
                        <Pencil size={12} />
                      </button>
                      <button
                        onClick={() => handleDeleteApplication(item.id)}
                        className="text-txt-muted hover:text-red-400 p-1 transition-colors cursor-pointer"
                        aria-label="Untrack event"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>

                  {/* Visual Stage Progression Tracker */}
                  <div className="pt-0.5">
                    <div className="flex items-center justify-between text-[9px] font-mono text-txt-muted pb-1.5 px-0.5">
                      <span className="uppercase text-[8.5px] font-bold text-txt-sub">Active Stage</span>
                      <select
                        value={item.stage || "Round 1 / Ideation"}
                        onChange={(e) => handleUpdateStage(item.id, e.target.value)}
                        className="bg-bg-card border border-border-main/60 rounded px-1.5 py-0.5 text-[9px] font-mono text-txt-main cursor-pointer focus:outline-hidden"
                      >
                        {STAGES.map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                    <div className="grid grid-cols-4 gap-1.5">
                      {STAGES.map((st, idx) => {
                        const isDone = idx <= activeIndex;
                        const isCurrent = idx === activeIndex;
                        return (
                          <div key={st} className="flex flex-col gap-1">
                            <div className={`h-1.5 rounded-full transition-colors ${
                              isCurrent 
                                ? "bg-accent-main" 
                                : isDone 
                                ? "bg-accent-main/60" 
                                : "bg-bg-card border border-border-main/50"
                            }`} />
                            <span className={`text-[8px] font-mono truncate ${
                              isCurrent ? "text-accent-main font-bold" : isDone ? "text-txt-main" : "text-txt-muted"
                            }`}>
                              {st.split("/")[0].trim()}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 font-mono text-[10px] text-txt-muted border-t border-b border-border-main/30 py-2">
                    <div className="flex items-center gap-1.5">
                      <UserCheck size={12} className="text-accent-main shrink-0" />
                      <span>Role: <strong className="text-txt-main font-normal">{item.role}</strong></span>
                    </div>
                    {(item.handle || item.user_handle) && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-txt-sub">Handle:</span>
                        <strong className="text-txt-main font-normal">{item.handle || item.user_handle}</strong>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5">
                      <Calendar size={12} className="text-txt-sub shrink-0" />
                      <span>Deadline: <strong className="text-txt-main font-normal">{item.deadline ? new Date(item.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "TBA"}</strong></span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between gap-3 pt-1">
                    {item.portal_url && item.portal_url.startsWith("http") ? (
                      <a
                        href={item.portal_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] font-mono text-txt-muted hover:text-accent-main flex items-center gap-1 transition-colors"
                      >
                        Open Official Portal <ExternalLink size={9} />
                      </a>
                    ) : (
                      <span className="text-[10px] font-mono text-txt-sub flex items-center gap-1">
                        On-Campus / In-Person
                      </span>
                    )}

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => startEdit(item)}
                        className="text-[10px] font-mono text-accent-main hover:underline flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Pencil size={9} /> {item.portal_url ? "Edit Link / Date" : "+ Add Link / Date"}
                      </button>
                      <button
                        onClick={() => handleDeleteApplication(item.id)}
                        className="text-[10px] font-mono text-txt-muted hover:text-red-400 flex items-center gap-1 transition-colors cursor-pointer"
                        aria-label="Untrack this event"
                      >
                        <Trash2 size={9} /> Untrack
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Track Application Dialog */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-60 flex items-center justify-center p-4">
          <div className="bg-bg-surface border border-border-main rounded-md max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border-main/40 pb-3">
              <div>
                <span className="font-mono text-[9px] uppercase tracking-widest text-txt-muted">Add Event</span>
                <h3 className="font-display text-lg font-light text-txt-main">Track Live Hackathon / Contest</h3>
              </div>
              <button
                onClick={() => setShowAddForm(false)}
                className="w-7 h-7 rounded-sm bg-bg-card text-txt-muted hover:text-txt-main flex items-center justify-center cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>

            <form onSubmit={handleAddApplication} className="space-y-3 font-sans">
              <div className="relative">
                <label className="block font-mono text-[10px] uppercase text-txt-muted mb-1">
                  Event Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Smart India Hackathon 2026 or CIT Takshashila Hack"
                  value={formData.title}
                  onChange={e => handleTitleChange(e.target.value)}
                  className="w-full h-9 px-3 bg-bg-card border border-border-main rounded-sm text-xs text-txt-main font-mono focus:outline-hidden focus:border-accent-main"
                />

                {/* Autocomplete verified suggestions */}
                {suggestions.length > 0 && (
                  <div className="absolute left-0 right-0 top-full mt-1 bg-bg-surface border border-border-main rounded-sm shadow-xl z-70 overflow-hidden">
                    <div className="px-2.5 py-1 bg-bg-card text-[9px] font-mono text-txt-muted uppercase border-b border-border-main/50 flex items-center gap-1">
                      <Sparkles size={9} className="text-accent-main" /> Verified Events in Catalog
                    </div>
                    {suggestions.map(s => (
                      <button
                        type="button"
                        key={s.id}
                        onClick={() => handleSelectSuggestion(s)}
                        className="w-full px-3 py-2 text-left hover:bg-bg-card/70 flex items-start justify-between gap-2 border-b border-border-main/30 last:border-0 cursor-pointer transition-colors"
                      >
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-txt-main truncate">{s.title}</p>
                          <p className="text-[10px] font-mono text-txt-muted truncate">{s.description}</p>
                        </div>
                        <span className="text-[9px] font-mono px-1.5 py-0.5 bg-accent-main/10 text-accent-main rounded-xs shrink-0">
                          {s.deadline || "Active"}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono text-[10px] uppercase text-txt-muted mb-1">
                    Portal Platform
                  </label>
                  <select
                    value={formData.portal}
                    onChange={e => setFormData({ ...formData, portal: e.target.value as "Unstop" | "Devpost" | "On-Campus" | "Other" })}
                    className="w-full h-9 px-2 bg-bg-card border border-border-main rounded-sm text-xs text-txt-main font-mono focus:outline-hidden focus:border-accent-main"
                  >
                    <option value="Unstop">Unstop</option>
                    <option value="Devpost">Devpost</option>
                    <option value="On-Campus">On-Campus / Symposium</option>
                    <option value="Other">Other Platform / Direct</option>
                  </select>
                </div>

                <div>
                  <label className="block font-mono text-[10px] uppercase text-txt-muted mb-1">
                    Your Role
                  </label>
                  <select
                    value={formData.role}
                    onChange={e => setFormData({ ...formData, role: e.target.value })}
                    className="w-full h-9 px-2 bg-bg-card border border-border-main rounded-sm text-xs text-txt-main font-mono focus:outline-hidden focus:border-accent-main"
                  >
                    <option value="Participant / Solo">Participant / Solo</option>
                    <option value="Team Captain">Team Captain</option>
                    <option value="Full-Stack Developer">Full-Stack Developer</option>
                    <option value="AI / ML Engineer">AI / ML Engineer</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-mono text-[10px] uppercase text-txt-muted mb-1">
                  Event / Brochure Link <span className="text-txt-sub font-normal normal-case">(Optional)</span>
                </label>
                <input
                  type="url"
                  placeholder="https://... (Leave blank for on-campus / offline registrations)"
                  value={formData.portal_url}
                  onChange={e => setFormData({ ...formData, portal_url: e.target.value })}
                  className="w-full h-9 px-3 bg-bg-card border border-border-main rounded-sm text-xs text-txt-main font-mono focus:outline-hidden focus:border-accent-main"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono text-[10px] uppercase text-txt-muted mb-1">
                    Current Stage / Round
                  </label>
                  <select
                    value={formData.stage}
                    onChange={e => setFormData({ ...formData, stage: e.target.value })}
                    className="w-full h-9 px-2 bg-bg-card border border-border-main rounded-sm text-xs text-txt-main font-mono focus:outline-hidden focus:border-accent-main"
                  >
                    {STAGES.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-mono text-[10px] uppercase text-txt-muted mb-1">
                    Round Deadline
                  </label>
                  <input
                    type="date"
                    disabled={formData.no_deadline}
                    value={formData.deadline}
                    onChange={e => setFormData({ ...formData, deadline: e.target.value })}
                    className="w-full h-9 px-3 bg-bg-card border border-border-main rounded-sm text-xs text-txt-main font-mono focus:outline-hidden focus:border-accent-main disabled:opacity-40"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-0.5">
                <input
                  type="checkbox"
                  id="no_deadline_add"
                  checked={formData.no_deadline}
                  onChange={e => setFormData({ ...formData, no_deadline: e.target.checked })}
                  className="rounded-xs border-border-main accent-accent-main cursor-pointer"
                />
                <label htmlFor="no_deadline_add" className="font-mono text-[10px] text-txt-muted cursor-pointer select-none">
                  Round deadlines &amp; timeline not announced yet (TBA)
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border-main/30">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="h-8 px-3 bg-bg-card border border-border-main text-txt-muted hover:text-txt-main font-mono text-[10px] uppercase rounded-sm cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="h-8 px-4 bg-accent-main hover:opacity-90 disabled:opacity-50 text-bg-base font-mono text-[10px] uppercase tracking-wider font-bold rounded-sm flex items-center gap-1.5 cursor-pointer"
                >
                  {submitting ? "Saving..." : "Save & Track Event"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Event Dialog */}
      {editModalItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-60 flex items-center justify-center p-4">
          <div className="bg-bg-surface border border-border-main rounded-md max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border-main/40 pb-3">
              <div>
                <span className="font-mono text-[9px] uppercase tracking-widest text-accent-main font-bold">Edit Tracked Event</span>
                <h3 className="font-display text-lg font-light text-txt-main truncate">{editModalItem.title}</h3>
              </div>
              <button
                onClick={() => setEditModalItem(null)}
                className="w-7 h-7 rounded-sm bg-bg-card text-txt-muted hover:text-txt-main flex items-center justify-center cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3 font-sans">
              <div>
                <label className="block font-mono text-[10px] uppercase text-txt-muted mb-1">
                  Event Title
                </label>
                <input
                  type="text"
                  required
                  value={editFormData.title}
                  onChange={e => setEditFormData({ ...editFormData, title: e.target.value })}
                  className="w-full h-9 px-3 bg-bg-card border border-border-main rounded-sm text-xs text-txt-main font-mono focus:outline-hidden focus:border-accent-main"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono text-[10px] uppercase text-txt-muted mb-1">
                    Portal Platform
                  </label>
                  <select
                    value={editFormData.portal}
                    onChange={e => setEditFormData({ ...editFormData, portal: e.target.value as "Unstop" | "Devpost" | "On-Campus" | "Other" })}
                    className="w-full h-9 px-2 bg-bg-card border border-border-main rounded-sm text-xs text-txt-main font-mono focus:outline-hidden focus:border-accent-main"
                  >
                    <option value="Unstop">Unstop</option>
                    <option value="Devpost">Devpost</option>
                    <option value="On-Campus">On-Campus / Symposium</option>
                    <option value="Other">Other Platform / Direct</option>
                  </select>
                </div>

                <div>
                  <label className="block font-mono text-[10px] uppercase text-txt-muted mb-1">
                    Your Role
                  </label>
                  <select
                    value={editFormData.role}
                    onChange={e => setEditFormData({ ...editFormData, role: e.target.value })}
                    className="w-full h-9 px-2 bg-bg-card border border-border-main rounded-sm text-xs text-txt-main font-mono focus:outline-hidden focus:border-accent-main"
                  >
                    <option value="Participant / Solo">Participant / Solo</option>
                    <option value="Team Captain">Team Captain</option>
                    <option value="Full-Stack Developer">Full-Stack Developer</option>
                    <option value="AI / ML Engineer">AI / ML Engineer</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-mono text-[10px] uppercase text-txt-muted mb-1">
                  Event / Brochure Link <span className="text-txt-sub font-normal normal-case">(Add or update portal URL)</span>
                </label>
                <input
                  type="url"
                  placeholder="https://... or leave blank for offline events"
                  value={editFormData.portal_url}
                  onChange={e => setEditFormData({ ...editFormData, portal_url: e.target.value })}
                  className="w-full h-9 px-3 bg-bg-card border border-border-main rounded-sm text-xs text-txt-main font-mono focus:outline-hidden focus:border-accent-main"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono text-[10px] uppercase text-txt-muted mb-1">
                    Current Stage / Round
                  </label>
                  <select
                    value={editFormData.stage}
                    onChange={e => setEditFormData({ ...editFormData, stage: e.target.value })}
                    className="w-full h-9 px-2 bg-bg-card border border-border-main rounded-sm text-xs text-txt-main font-mono focus:outline-hidden focus:border-accent-main"
                  >
                    {STAGES.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-mono text-[10px] uppercase text-txt-muted mb-1">
                    Round Deadline
                  </label>
                  <input
                    type="date"
                    disabled={editFormData.no_deadline}
                    value={editFormData.deadline}
                    onChange={e => setEditFormData({ ...editFormData, deadline: e.target.value })}
                    className="w-full h-9 px-3 bg-bg-card border border-border-main rounded-sm text-xs text-txt-main font-mono focus:outline-hidden focus:border-accent-main disabled:opacity-40"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-0.5">
                <input
                  type="checkbox"
                  id="no_deadline_edit"
                  checked={editFormData.no_deadline}
                  onChange={e => setEditFormData({ ...editFormData, no_deadline: e.target.checked })}
                  className="rounded-xs border-border-main accent-accent-main cursor-pointer"
                />
                <label htmlFor="no_deadline_edit" className="font-mono text-[10px] text-txt-muted cursor-pointer select-none">
                  Round deadlines &amp; timeline not announced yet (TBA)
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border-main/30">
                <button
                  type="button"
                  onClick={() => setEditModalItem(null)}
                  className="h-8 px-3 bg-bg-card border border-border-main text-txt-muted hover:text-txt-main font-mono text-[10px] uppercase rounded-sm cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="h-8 px-4 bg-accent-main hover:opacity-90 disabled:opacity-50 text-bg-base font-mono text-[10px] uppercase tracking-wider font-bold rounded-sm flex items-center gap-1.5 cursor-pointer"
                >
                  {submitting ? "Updating..." : "Update Event"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
