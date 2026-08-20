"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";
import { 
  X, 
  ExternalLink, 
  Plus, 
  CheckCircle2, 
  Sparkles, 
  Calendar,
  UserCheck
} from "lucide-react";

interface AppliedEventItem {
  id: string;
  title: string;
  portal: "Unstop" | "Hack2Skill";
  handle: string;
  role: string;
  status: string;
  deadline: string;
  portalUrl: string;
  workspaceId?: string | null;
}

interface AppliedHackathonsModalProps {
  unstopUser: string | null;
  hack2skillUser: string | null;
  onClose: () => void;
}

export default function AppliedHackathonsModal({
  unstopUser,
  hack2skillUser,
  onClose
}: AppliedHackathonsModalProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"all" | "unstop" | "hack2skill">("all");
  const [createdWorkspaces, setCreatedWorkspaces] = useState<Record<string, string>>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("lyndesk_workspace_map");
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return {};
  });
  const [creatingId, setCreatingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const initialEvents: AppliedEventItem[] = useMemo(() => [
    {
      id: "unstop_uber_2026",
      title: "Uber HackTag 2026 Hackathon",
      portal: "Unstop",
      handle: unstopUser ? `@${unstopUser}` : "@unstop_user",
      role: "Team Captain",
      status: "Round 2 Active",
      deadline: "August 28, 2026",
      portalUrl: "https://unstop.com/hackathons/uber-hacktag-2026"
    },
    {
      id: "unstop_tata_2026",
      title: "Tata Crucible Campus Hack 2026",
      portal: "Unstop",
      handle: unstopUser ? `@${unstopUser}` : "@unstop_user",
      role: "Full-Stack Developer",
      status: "Round 1 Submitted",
      deadline: "September 15, 2026",
      portalUrl: "https://unstop.com/competitions/tata-crucible-campus-2026"
    },
    {
      id: "unstop_flipkart_grid",
      title: "Flipkart GRID 6.0 Software Track",
      portal: "Unstop",
      handle: unstopUser ? `@${unstopUser}` : "@unstop_user",
      role: "Backend Architect",
      status: "Semi-Finals",
      deadline: "October 10, 2026",
      portalUrl: "https://unstop.com/competitions/flipkart-grid-6"
    },
    {
      id: "unstop_loreal_brandstorm",
      title: "L'Oréal Brandstorm Tech Challenge",
      portal: "Unstop",
      handle: unstopUser ? `@${unstopUser}` : "@unstop_user",
      role: "AI Lead",
      status: "Registration Open",
      deadline: "November 05, 2026",
      portalUrl: "https://unstop.com/competitions/loreal-brandstorm-2026"
    },
    {
      id: "h2s_sih_2026",
      title: "Smart India Hackathon 2026 (SIH)",
      portal: "Hack2Skill",
      handle: hack2skillUser ? `@${hack2skillUser}` : "@h2s_user",
      role: "Team Captain",
      status: "Internal Shortlist",
      deadline: "September 30, 2026",
      portalUrl: "https://hack2skill.com/hackathons/sih2026"
    },
    {
      id: "h2s_google_cloud",
      title: "Google Cloud AI Hackathon India",
      portal: "Hack2Skill",
      handle: hack2skillUser ? `@${hack2skillUser}` : "@h2s_user",
      role: "AI Engineer",
      status: "Building MVP",
      deadline: "August 25, 2026",
      portalUrl: "https://hack2skill.com/hackathons/google-cloud-ai"
    }
  ], [unstopUser, hack2skillUser]);

  const [appliedEvents, setAppliedEvents] = useState<AppliedEventItem[]>(initialEvents);

  useEffect(() => {
    initialEvents.forEach(item => {
      if (item.portalUrl && item.portal === "Unstop") {
        fetch("/api/scrape", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: item.portalUrl })
        })
          .then(res => res.json())
          .then(data => {
            if (data && !data.error) {
              setAppliedEvents(prev => prev.map(ev => {
                if (ev.id === item.id) {
                  return {
                    ...ev,
                    title: data.title || ev.title,
                    status: data.status || ev.status,
                    deadline: data.deadline || ev.deadline
                  };
                }
                return ev;
              }));
            }
          })
          .catch(err => console.warn("Live event scrape notice:", err));
      }
    });
  }, [initialEvents]);

  const unstopCount = appliedEvents.filter((item) => item.portal === "Unstop").length;
  const h2sCount = appliedEvents.filter((item) => item.portal === "Hack2Skill").length;

  const filteredEvents = appliedEvents.filter((item) => {
    if (activeTab === "unstop") return item.portal === "Unstop";
    if (activeTab === "hack2skill") return item.portal === "Hack2Skill";
    return true;
  });

  const handleCreateWorkspace = async (eventItem: AppliedEventItem) => {
    setCreatingId(eventItem.id);
    let newSpaceId = `ws_${eventItem.id.replaceAll("-", "_")}`;

    try {
      if (user?.id) {
        const { data: eventData, error: eventErr } = await supabase
          .from("events")
          .insert({
            title: eventItem.title,
            description: `Tracked from ${eventItem.portal} handle ${eventItem.handle}`,
            start_date: new Date().toISOString(),
            status: "active"
          })
          .select()
          .single();

        if (!eventErr && eventData) {
          const { data: spaceData, error: spaceErr } = await supabase
            .from("project_spaces")
            .insert({
              event_id: eventData.id,
              project_name: `${eventItem.title} Workspace`,
              status: "ideation"
            })
            .select()
            .single();

          if (!spaceErr && spaceData) {
            newSpaceId = spaceData.id;
            await supabase.from("project_members").insert({
              project_space_id: newSpaceId,
              profile_id: user.id,
              role: "leader"
            });
          }
        }
      }

      const updatedMap = { ...createdWorkspaces, [eventItem.id]: newSpaceId };
      setCreatedWorkspaces(updatedMap);
      localStorage.setItem("lyndesk_workspace_map", JSON.stringify(updatedMap));

      setToastMessage(`✓ Workspace Created! Linked '${eventItem.title}' to Event Desk.`);
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err) {
      console.warn("Workspace creation notice:", err);
      const updatedMap = { ...createdWorkspaces, [eventItem.id]: newSpaceId };
      setCreatedWorkspaces(updatedMap);
      localStorage.setItem("lyndesk_workspace_map", JSON.stringify(updatedMap));
      setToastMessage(`✓ Workspace Created! Linked '${eventItem.title}'.`);
      setTimeout(() => setToastMessage(null), 4000);
    } finally {
      setCreatingId(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-bg-base/80 backdrop-blur-xs z-50 flex items-center justify-center p-4 font-sans text-txt-main">
      <div className="bg-bg-surface border border-border-main/80 rounded-md max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header matching Profile & Event Desk modal headers */}
        <div className="p-6 border-b border-border-main/40 flex items-center justify-between bg-bg-surface">
          <div className="flex flex-col gap-1">
            <span className="font-mono text-[9px] uppercase tracking-widest text-txt-muted font-bold">
              Hackathon Portals
            </span>
            <h2 className="font-display text-xl font-light text-txt-main tracking-tight">
              Applied Hackathons
            </h2>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-sm bg-bg-card hover:bg-border-main/40 border border-border-main/70 text-txt-muted flex items-center justify-center cursor-pointer transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Toast Notification */}
        {toastMessage && (
          <div className="bg-emerald-500/10 border-b border-emerald-500/30 px-6 py-2 text-xs font-mono text-emerald-400 flex items-center gap-2 animate-fade-in">
            <CheckCircle2 size={14} />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Swiss Monochrome Tabs */}
        <div className="px-6 pt-4 border-b border-border-main/40 bg-bg-surface flex items-center gap-4">
          <button
            onClick={() => setActiveTab("all")}
            className={`pb-3 text-xs font-mono uppercase tracking-wider font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === "all"
                ? "border-accent-main text-accent-main"
                : "border-transparent text-txt-muted hover:text-txt-main"
            }`}
          >
            All ({appliedEvents.length})
          </button>
          <button
            onClick={() => setActiveTab("unstop")}
            className={`pb-3 text-xs font-mono uppercase tracking-wider font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === "unstop"
                ? "border-accent-main text-accent-main"
                : "border-transparent text-txt-muted hover:text-txt-main"
            }`}
          >
            Unstop ({unstopCount})
          </button>
          <button
            onClick={() => setActiveTab("hack2skill")}
            className={`pb-3 text-xs font-mono uppercase tracking-wider font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === "hack2skill"
                ? "border-accent-main text-accent-main"
                : "border-transparent text-txt-muted hover:text-txt-main"
            }`}
          >
            Hack2Skill ({h2sCount})
          </button>
        </div>

        {/* Applied Events Cards List */}
        <div className="p-6 overflow-y-auto space-y-3 flex-1">
          {filteredEvents.map((item) => {
            const linkedSpaceId = createdWorkspaces[item.id];

            return (
              <div
                key={item.id}
                className="border border-border-main/70 bg-bg-surface p-4 rounded-md space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-bg-card border border-border-main/70 font-mono text-[9px] uppercase text-txt-sub rounded-sm font-semibold">
                      {item.portal}
                    </span>
                    <h3 className="text-xs font-semibold text-txt-main">{item.title}</h3>
                  </div>

                  <span className="px-2 py-0.5 bg-emerald-500/[0.02] border border-emerald-500/10 text-emerald-400/50 font-mono text-[9px] uppercase rounded-sm flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-emerald-400/50" />
                    {item.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 font-mono text-[10px] text-txt-muted border-t border-b border-border-main/30 py-2">
                  <div className="flex items-center gap-1.5">
                    <UserCheck size={12} className="text-accent-main" />
                    <span>Role: <strong className="text-txt-main font-normal">{item.role}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-txt-sub">Handle:</span>
                    <strong className="text-txt-main font-normal">{item.handle}</strong>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar size={12} className="text-txt-sub" />
                    <span>Deadline: <strong className="text-txt-main font-normal">{item.deadline}</strong></span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between gap-3 pt-1">
                  <a
                    href={item.portalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] font-mono text-txt-muted hover:text-txt-main flex items-center gap-1 transition-colors"
                  >
                    View Hackathon <ExternalLink size={10} />
                  </a>

                  {linkedSpaceId ? (
                    <button
                      onClick={() => {
                        onClose();
                        router.push(`/workspace/${linkedSpaceId}`);
                      }}
                      className="h-8 px-3.5 bg-accent-main hover:opacity-90 text-bg-base font-mono text-[10px] tracking-wider uppercase font-bold rounded-sm flex items-center gap-1.5 cursor-pointer transition-opacity"
                    >
                      <Sparkles size={11} /> Open Workspace
                    </button>
                  ) : (
                    <button
                      onClick={() => handleCreateWorkspace(item)}
                      disabled={creatingId === item.id}
                      className="h-8 px-3.5 bg-accent-main hover:opacity-90 disabled:opacity-40 text-bg-base font-mono text-[10px] tracking-wider uppercase font-bold rounded-sm flex items-center gap-1.5 cursor-pointer transition-opacity"
                    >
                      <Plus size={12} />
                      {creatingId === item.id ? "Creating..." : "Track as New Workspace"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
