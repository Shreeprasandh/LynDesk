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
    const [spaceRes, chatRes, membersRes] = await Promise.allSettled([
      supabase
        .from("project_spaces")
        .select("id, project_name, status, github_repo")
        .eq("id", workspaceId)
        .maybeSingle(),
      supabase
        .from("chat_messages")
        .select("id, content, created_at, profile_id, profiles(id, full_name, username, avatar_url, college_key, company_key)")
        .eq("project_space_id", workspaceId)
        .order("created_at", { ascending: true })
        .limit(50),
      supabase
        .from("project_members")
        .select("profile_id, profiles(id, full_name, username, avatar_url, department)")
        .eq("project_space_id", workspaceId)
    ]);

    const spaceData = spaceRes.status === "fulfilled" ? spaceRes.value.data : null;
    const rawChat = chatRes.status === "fulfilled" ? (chatRes.value.data || []) : [];
    const membersData = membersRes.status === "fulfilled" ? (membersRes.value.data || []) : [];

    // Parse chat messages according to schema
    const formattedChat = rawChat.map((c: any) => {
      const profile = c.profiles as any;
      let role = "Developer";
      if (profile?.college_key) role = "Faculty";
      else if (profile?.company_key) role = "Recruiter";

      let textContent = c.content || "";
      let fileUrl = undefined;
      let fileName = undefined;
      let fileSizeStr = undefined;
      let isImage = false;

      if (textContent.startsWith("IMAGE_ATTACHMENT::")) {
        const parts = textContent.replace("IMAGE_ATTACHMENT::", "").split("::");
        fileUrl = parts[0];
        fileName = parts[1] || "Uploaded Image";
        fileSizeStr = parts[2] || "0 KB";
        isImage = true;
        textContent = "Shared an image attachment";
      } else if (textContent.startsWith("FILE_ATTACHMENT::")) {
        const parts = textContent.replace("FILE_ATTACHMENT::", "").split("::");
        fileUrl = parts[0];
        fileName = parts[1] || "Uploaded File";
        fileSizeStr = parts[2] || "0 KB";
        isImage = false;
        textContent = "Shared a file attachment";
      }

      return {
        id: c.id,
        sender_name: profile?.full_name || profile?.username || "Collaborator",
        sender_role: role,
        sender_id: c.profile_id,
        content: textContent,
        file_url: fileUrl,
        file_name: fileName,
        file_size_str: fileSizeStr,
        is_image: isImage,
        created_at: c.created_at,
        isSystem: false
      };
    });

    // Recover cached tasks from persistent storage
    let tasksData: any[] = [];
    if (typeof window !== "undefined") {
      try {
        const rawTasks = localStorage.getItem(`ldk_workspace_tasks_${workspaceId}`);
        if (rawTasks) {
          const parsed = JSON.parse(rawTasks);
          if (Array.isArray(parsed)) tasksData = parsed;
        }
      } catch {}
    }

    const snapshot: WorkspaceSnapshot = {
      workspaceId,
      projectName: spaceData?.project_name || "Workspace",
      status: spaceData?.status || "development",
      tasks: tasksData,
      chatMessages: formattedChat,
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
