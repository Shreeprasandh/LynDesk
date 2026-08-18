import { supabase } from "./supabase";

export interface WorkspaceSnapshot {
  workspaceId: string;
  projectName: string;
  status: string;
  tasks: any[];
  chatMessages: any[];
  members: any[];
  fetchedAt: number;
}

const memoryCache = new Map<string, WorkspaceSnapshot>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

export function getCachedWorkspaceSnapshot(workspaceId: string): WorkspaceSnapshot | null {
  if (!workspaceId) return null;

  // 1. Check memory cache
  const inMem = memoryCache.get(workspaceId);
  if (inMem && Date.now() - inMem.fetchedAt < CACHE_TTL_MS) {
    return inMem;
  }

  // 2. Check sessionStorage
  if (typeof window !== "undefined") {
    try {
      const raw = sessionStorage.getItem(`ldk_ws_snap_${workspaceId}`);
      if (raw) {
        const parsed: WorkspaceSnapshot = JSON.parse(raw);
        if (parsed && Date.now() - parsed.fetchedAt < CACHE_TTL_MS) {
          memoryCache.set(workspaceId, parsed);
          return parsed;
        }
      }
    } catch {}
  }

  return null;
}

export async function prefetchWorkspace(workspaceId: string): Promise<WorkspaceSnapshot | null> {
  if (!workspaceId || typeof window === "undefined") return null;

  // If already fresh in cache, skip network query
  const existing = getCachedWorkspaceSnapshot(workspaceId);
  if (existing) return existing;

  try {
    const [spaceRes, tasksRes, chatRes, membersRes] = await Promise.allSettled([
      supabase
        .from("project_spaces")
        .select("id, project_name, status, github_repo")
        .eq("id", workspaceId)
        .maybeSingle(),
      supabase
        .from("project_tasks")
        .select("id, title, status, priority, assigned_to, position, created_at")
        .eq("project_space_id", workspaceId)
        .order("position", { ascending: true })
        .limit(100),
      supabase
        .from("chat_messages")
        .select("id, content, sender_name, sender_id, created_at, role, is_system")
        .eq("project_space_id", workspaceId)
        .order("created_at", { ascending: false })
        .limit(50),
      supabase
        .from("project_members")
        .select("profile_id, profiles(id, full_name, username, avatar_url, department)")
        .eq("project_space_id", workspaceId)
    ]);

    const spaceData = spaceRes.status === "fulfilled" ? spaceRes.value.data : null;
    const tasksData = tasksRes.status === "fulfilled" ? (tasksRes.value.data || []) : [];
    const chatData = chatRes.status === "fulfilled" ? (chatRes.value.data || []) : [];
    const membersData = membersRes.status === "fulfilled" ? (membersRes.value.data || []) : [];

    const snapshot: WorkspaceSnapshot = {
      workspaceId,
      projectName: spaceData?.project_name || "Workspace",
      status: spaceData?.status || "development",
      tasks: tasksData,
      chatMessages: chatData,
      members: membersData,
      fetchedAt: Date.now()
    };

    memoryCache.set(workspaceId, snapshot);
    try {
      sessionStorage.setItem(`ldk_ws_snap_${workspaceId}`, JSON.stringify(snapshot));
    } catch {}

    return snapshot;
  } catch {
    return null;
  }
}

export function scheduleIdlePrefetch(workspaceIds: string[], delayMs = 1500): () => void {
  if (typeof window === "undefined" || !workspaceIds || workspaceIds.length === 0) {
    return () => {};
  }

  const validIds = workspaceIds.filter(Boolean).slice(0, 3);
  let timerId: ReturnType<typeof setTimeout> | null = null;
  let isCancelled = false;

  timerId = setTimeout(() => {
    if (isCancelled) return;

    const runPrefetch = async () => {
      for (const id of validIds) {
        if (isCancelled) break;
        await prefetchWorkspace(id);
      }
    };

    if ("requestIdleCallback" in window) {
      (window as any).requestIdleCallback(() => {
        if (!isCancelled) runPrefetch();
      }, { timeout: 4000 });
    } else {
      runPrefetch();
    }
  }, delayMs);

  return () => {
    isCancelled = true;
    if (timerId) clearTimeout(timerId);
  };
}
