"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";
import { 
  X, 
  Plus, 
  Trash2, 
  Sparkles, 
  Trophy,
  Calendar,
  Compass,
  UserCheck,
  ExternalLink
} from "lucide-react";

interface ApplicationItem {
  id: string;
  title: string;
  portal: "Unstop" | "Hack2Skill" | "Devpost" | "Other";
  portal_url: string;
  handle?: string;
  user_handle?: string;
  role: string;
  status: "Applied" | "Under Review" | "Shortlisted" | "Won" | "Rejected";
  stage: string;
  deadline?: string;
  workspace_id?: string;
  created_at: string;
  updated_at: string;
}

interface AppliedHackathonsModalProps {
  isOpen?: boolean;
  onClose: () => void;
  unstopUser?: string;
  hack2skillUser?: string;
  onRefreshCount?: () => void;
}

export default function AppliedHackathonsModal({
  isOpen = true,
  onClose,
  unstopUser,
  hack2skillUser,
  onRefreshCount
}: AppliedHackathonsModalProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterPortal, setFilterPortal] = useState<string>("all");
  const [showAddForm, setShowAddForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [creatingWsId, setCreatingWsId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    portal: "Unstop" as "Unstop" | "Hack2Skill" | "Devpost" | "Other",
    portal_url: "",
    role: "Team Leader / Solo",
    status: "Applied" as const,
    stage: "Round 1",
    deadline: "",
    create_workspace: true
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

        const res = await fetch("/api/user/applied-hackathons", {
          headers: { Authorization: `Bearer ${session.access_token}` }
        });

        if (res.ok && isMounted) {
          const data = await res.json();
          setApplications(data.applications || []);
        }
      } catch (err) {
        console.warn("[AppliedHackathonsModal] Fetch notice:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    initialFetch();
    return () => { isMounted = false; };
  }, [user]);

  const handleAddApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.portal_url.trim()) return;

    setSubmitting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const handle = formData.portal === "Unstop" && unstopUser 
        ? `@${unstopUser}` 
        : (formData.portal === "Hack2Skill" && hack2skillUser ? `@${hack2skillUser}` : undefined);

      const res = await fetch("/api/user/applied-hackathons", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          ...formData,
          handle
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
          role: "Team Captain",
          status: "Applied",
          stage: "Round 1",
          deadline: "",
          create_workspace: true
        });
        onRefreshCount?.();
      }
    } catch (err) {
      console.error("[AppliedHackathonsModal] Add error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
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
      console.error("Delete error:", err);
    }
  };

  const handleCreateWorkspace = async (item: ApplicationItem) => {
    setCreatingWsId(item.id);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session || !user) return;

      // Provision workspace
      const { data: wsData, error: wsErr } = await supabase
        .from("project_spaces")
        .insert({
          project_name: `${item.title} Team Workspace`,
          description: `Tracked hackathon workspace for ${item.title} on ${item.portal}.`,
          owner_id: user.id,
          status: "ideation"
        })
        .select("id")
        .single();

      if (!wsErr && wsData) {
        await supabase.from("project_members").insert({
          project_space_id: wsData.id,
          profile_id: user.id,
          role: "leader"
        });

        // Link to application record
        await fetch("/api/user/applied-hackathons", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`
          },
          body: JSON.stringify({
            id: item.id,
            workspace_id: wsData.id
          })
        });

        setApplications(prev => prev.map(a => a.id === item.id ? { ...a, workspace_id: wsData.id } : a));
        onRefreshCount?.();
      }
    } catch (err) {
      console.warn("Workspace creation error:", err);
    } finally {
      setCreatingWsId(null);
    }
  };

  const filteredApps = applications.filter(a => {
    if (filterPortal === "all") return true;
    return a.portal === filterPortal;
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-bg-base/80 backdrop-blur-xs z-50 flex items-center justify-center p-4 font-sans text-txt-main">
      <div className="bg-bg-surface border border-border-main/80 rounded-md max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90dvh] overscroll-contain">
        {/* Header */}
        <div className="p-6 border-b border-border-main/40 flex items-center justify-between bg-bg-surface">
          <div className="flex flex-col gap-1">
            <span className="font-mono text-[9px] uppercase tracking-widest text-txt-muted font-bold">
              Application Tracker
            </span>
            <h2 className="font-display text-xl font-light text-txt-main tracking-tight">
              Applied Hackathons & Contests
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddForm(true)}
              className="h-8 px-3 bg-accent-main hover:opacity-90 text-bg-base font-mono text-[10px] tracking-wider uppercase font-bold rounded-sm flex items-center gap-1.5 cursor-pointer transition-opacity"
            >
              <Plus size={12} /> Track Application
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-sm bg-bg-card hover:bg-border-main/40 border border-border-main/70 text-txt-muted flex items-center justify-center cursor-pointer transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="px-6 pt-4 border-b border-border-main/40 bg-bg-surface flex items-center gap-4 overflow-x-auto">
          {["all", "Unstop", "Hack2Skill", "Devpost", "Other"].map(tab => (
            <button
              key={tab}
              onClick={() => setFilterPortal(tab)}
              className={`pb-3 text-xs font-mono uppercase tracking-wider font-semibold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
                filterPortal === tab
                  ? "border-accent-main text-accent-main"
                  : "border-transparent text-txt-muted hover:text-txt-main"
              }`}
            >
              {tab === "all" ? `All (${applications.length})` : `${tab} (${applications.filter(a => a.portal === tab).length})`}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto space-y-3 flex-1">
          {loading ? (
            <div className="py-16 text-center space-y-2">
              <div className="w-5 h-5 border-2 border-accent-main border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="font-mono text-xs text-txt-muted">Loading your tracked applications...</p>
            </div>
          ) : filteredApps.length === 0 ? (
            <div className="border border-dashed border-border-main/60 rounded-md p-10 text-center space-y-4 bg-bg-card/20">
              <div className="w-12 h-12 rounded-full bg-accent-main/10 border border-accent-main/20 flex items-center justify-center mx-auto text-accent-main">
                <Trophy size={22} />
              </div>
              <div className="space-y-1">
                <h3 className="font-display text-base font-normal text-txt-main">No Tracked Applications</h3>
                <p className="font-mono text-xs text-txt-muted max-w-md mx-auto">
                  Keep your hackathons, round deadlines, and team spaces synchronized in one real-time dashboard.
                </p>
              </div>
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => setShowAddForm(true)}
                  className="h-8 px-4 bg-accent-main text-bg-base font-mono text-[10px] uppercase tracking-wider font-bold rounded-sm flex items-center gap-1.5 cursor-pointer hover:opacity-90"
                >
                  <Plus size={12} /> Track Application
                </button>
                <button
                  onClick={() => {
                    onClose();
                    router.push("/explore");
                  }}
                  className="h-8 px-4 bg-bg-card border border-border-main text-txt-main font-mono text-[10px] uppercase tracking-wider font-semibold rounded-sm flex items-center gap-1.5 cursor-pointer hover:bg-border-main/40"
                >
                  <Compass size={12} /> Browse Explore Arena
                </button>
              </div>
            </div>
          ) : (
            filteredApps.map((item) => (
              <div
                key={item.id}
                className="border border-border-main/70 bg-bg-surface p-4 rounded-md space-y-3 hover:border-border-main transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-bg-card border border-border-main/70 font-mono text-[9px] uppercase text-txt-sub rounded-sm font-semibold">
                      {item.portal}
                    </span>
                    <h3 className="text-xs font-semibold text-txt-main">{item.title}</h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-[9px] uppercase rounded-sm flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      {item.stage || item.status}
                    </span>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="text-txt-muted hover:text-red-400 p-1 transition-colors cursor-pointer"
                      title="Untrack application"
                    >
                      <Trash2 size={12} />
                    </button>
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
                  {item.deadline && (
                    <div className="flex items-center gap-1.5">
                      <Calendar size={12} className="text-txt-sub shrink-0" />
                      <span>Deadline: <strong className="text-txt-main font-normal">{new Date(item.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</strong></span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between gap-3 pt-1">
                  <a
                    href={item.portal_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] font-mono text-txt-muted hover:text-txt-main flex items-center gap-1 transition-colors"
                  >
                    View Official Portal <ExternalLink size={10} />
                  </a>

                  {item.workspace_id ? (
                    <button
                      onClick={() => {
                        onClose();
                        router.push(`/workspace/${item.workspace_id}`);
                      }}
                      className="h-8 px-3.5 bg-accent-main hover:opacity-90 text-bg-base font-mono text-[10px] tracking-wider uppercase font-bold rounded-sm flex items-center gap-1.5 cursor-pointer transition-opacity"
                    >
                      <Sparkles size={11} /> Open Workspace
                    </button>
                  ) : (
                    <button
                      onClick={() => handleCreateWorkspace(item)}
                      disabled={creatingWsId === item.id}
                      className="h-8 px-3.5 bg-accent-main hover:opacity-90 disabled:opacity-40 text-bg-base font-mono text-[10px] tracking-wider uppercase font-bold rounded-sm flex items-center gap-1.5 cursor-pointer transition-opacity"
                    >
                      <Plus size={12} />
                      {creatingWsId === item.id ? "Provisioning..." : "Launch Team Workspace"}
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Track Application Dialog */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-60 flex items-center justify-center p-4">
          <div className="bg-bg-surface border border-border-main rounded-md max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border-main/40 pb-3">
              <div>
                <span className="font-mono text-[9px] uppercase tracking-widest text-txt-muted">Add Application</span>
                <h3 className="font-display text-lg font-light text-txt-main">Track New Hackathon</h3>
              </div>
              <button
                onClick={() => setShowAddForm(false)}
                className="w-7 h-7 rounded-sm bg-bg-card text-txt-muted hover:text-txt-main flex items-center justify-center cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>

            <form onSubmit={handleAddApplication} className="space-y-3 font-sans">
              <div>
                <label className="block font-mono text-[10px] uppercase text-txt-muted mb-1">
                  Hackathon Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Smart India Hackathon 2026"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  className="w-full h-9 px-3 bg-bg-card border border-border-main rounded-sm text-xs text-txt-main font-sans focus:outline-hidden focus:border-accent-main"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono text-[10px] uppercase text-txt-muted mb-1">
                    Portal Platform
                  </label>
                  <select
                    value={formData.portal}
                    onChange={e => setFormData({ ...formData, portal: e.target.value as "Unstop" | "Hack2Skill" | "Devpost" | "Other" })}
                    className="w-full h-9 px-2 bg-bg-card border border-border-main rounded-sm text-xs text-txt-main font-mono focus:outline-hidden focus:border-accent-main"
                  >
                    <option value="Unstop">Unstop</option>
                    <option value="Devpost">Devpost</option>
                    <option value="Hack2Skill">Hack2Skill</option>
                    <option value="MLH">MLH</option>
                    <option value="Other">Other Platform</option>
                  </select>
                </div>

                <div>
                  <label className="block font-mono text-[10px] uppercase text-txt-muted mb-1">
                    Your Team Role
                  </label>
                  <select
                    value={formData.role}
                    onChange={e => setFormData({ ...formData, role: e.target.value })}
                    className="w-full h-9 px-2 bg-bg-card border border-border-main rounded-sm text-xs text-txt-main font-mono focus:outline-hidden focus:border-accent-main"
                  >
                    <option value="Team Captain">Team Captain</option>
                    <option value="Full-Stack Developer">Full-Stack Developer</option>
                    <option value="AI / ML Engineer">AI / ML Engineer</option>
                    <option value="Backend Architect">Backend Architect</option>
                    <option value="UI/UX Designer">UI/UX Designer</option>
                    <option value="Participant">Participant</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-mono text-[10px] uppercase text-txt-muted mb-1">
                  Portal Registration URL *
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://unstop.com/hackathons/..."
                  value={formData.portal_url}
                  onChange={e => setFormData({ ...formData, portal_url: e.target.value })}
                  className="w-full h-9 px-3 bg-bg-card border border-border-main rounded-sm text-xs text-txt-main font-mono focus:outline-hidden focus:border-accent-main"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono text-[10px] uppercase text-txt-muted mb-1">
                    Current Stage
                  </label>
                  <select
                    value={formData.stage}
                    onChange={e => setFormData({ ...formData, stage: e.target.value })}
                    className="w-full h-9 px-2 bg-bg-card border border-border-main rounded-sm text-xs text-txt-main font-mono focus:outline-hidden focus:border-accent-main"
                  >
                    <option value="Round 1">Round 1 (Idea Submission)</option>
                    <option value="Round 2">Round 2 (Prototype)</option>
                    <option value="Building MVP">Building MVP</option>
                    <option value="Shortlisted">Shortlisted</option>
                    <option value="Grand Finale">Grand Finale</option>
                    <option value="Winner">Winner</option>
                  </select>
                </div>

                <div>
                  <label className="block font-mono text-[10px] uppercase text-txt-muted mb-1">
                    Next Deadline (Optional)
                  </label>
                  <input
                    type="date"
                    value={formData.deadline}
                    onChange={e => setFormData({ ...formData, deadline: e.target.value })}
                    className="w-full h-9 px-3 bg-bg-card border border-border-main rounded-sm text-xs text-txt-main font-mono focus:outline-hidden focus:border-accent-main"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="create_ws"
                  checked={formData.create_workspace}
                  onChange={e => setFormData({ ...formData, create_workspace: e.target.checked })}
                  className="rounded-sm border-border-main accent-accent-main"
                />
                <label htmlFor="create_ws" className="font-mono text-[11px] text-txt-sub cursor-pointer">
                  Provision a linked team workspace in Project Spaces immediately
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
                  {submitting ? "Saving..." : "Save Application"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
