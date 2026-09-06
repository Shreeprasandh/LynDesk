import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/app/lib/supabaseServer";
import { getWorkspaceUuid } from "@/app/lib/workspaceUtils";
import { z } from "zod";

const PresenceQuerySchema = z.object({
  workspaceId: z.string().min(1, "workspaceId is required")
});

const PresencePostSchema = z.object({
  workspaceId: z.string().min(1, "workspaceId is required"),
  userId: z.string().min(1, "userId is required"),
  statusText: z.string().max(100).optional(),
  isOnline: z.boolean().optional()
});

export async function GET(req: NextRequest) {
  const urlParams = req.nextUrl.searchParams;
  const parsed = PresenceQuerySchema.safeParse({
    workspaceId: urlParams.get("workspaceId")
  });

  if (!parsed.success) {
    return NextResponse.json({ error: "Missing or invalid workspaceId" }, { status: 400 });
  }

  const { workspaceId } = parsed.data;

  const targetUuid = getWorkspaceUuid(workspaceId);
  const supabaseAdmin = createAdminClient();

  try {
    // 1. Try querying workspace_presence table
    const { data: presenceData, error: pError } = await supabaseAdmin
      .from("workspace_presence")
      .select(`
        user_id,
        status_text,
        is_online,
        last_seen_at,
        profile:user_id ( id, username, full_name, avatar_url )
      `)
      .eq("workspace_id", targetUuid);

    if (!pError && presenceData && presenceData.length > 0) {
      const formatted = presenceData.map((item: any) => {
        const prof = item.profile || {};
        let formattedTime = "Recently";
        if (item.last_seen_at) {
          const dt = new Date(item.last_seen_at);
          formattedTime = dt.toLocaleDateString(undefined, {
            month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
          });
        }
        return {
          id: prof.id || item.user_id,
          name: prof.full_name || prof.username || "Collaborator",
          avatarUrl: prof.avatar_url || "",
          statusText: item.status_text || "Active",
          isOnline: !!item.is_online,
          lastSeenAt: formattedTime
        };
      });
      return NextResponse.json({ presence: formatted });
    }
  } catch (err) {
    console.error("GET presence error:", err);
  }

  // Fallback: Query project_members + profiles if workspace_presence table is empty or not created yet
  try {
    const { data: memberData } = await supabaseAdmin
      .from("project_members")
      .select(`
        role,
        profile:profile_id ( id, username, full_name, avatar_url )
      `)
      .eq("project_space_id", targetUuid);

    if (memberData && memberData.length > 0) {
      const formatted = memberData.map((item: any) => {
        const prof = item.profile;
        if (!prof) return null;
        return {
          id: prof.id,
          name: prof.full_name || prof.username || "Collaborator",
          avatarUrl: prof.avatar_url || "",
          statusText: "Active",
          isOnline: false,
          lastSeenAt: "Recently"
        };
      }).filter(Boolean);
      return NextResponse.json({ presence: formatted });
    }
  } catch {}

  return NextResponse.json({ presence: [] });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = PresencePostSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json({ 
        error: "Invalid request payload", 
        details: parsed.error.format() 
      }, { status: 400 });
    }

    const { workspaceId, userId, statusText, isOnline } = parsed.data;

    const supabaseAdmin = createAdminClient();
    const targetUuid = getWorkspaceUuid(workspaceId);
    const nowIso = new Date().toISOString();

    // Upsert row in workspace_presence table
    const { error: upsertError } = await supabaseAdmin
      .from("workspace_presence")
      .upsert({
        workspace_id: targetUuid,
        user_id: userId,
        status_text: statusText || "Active",
        is_online: isOnline !== undefined ? isOnline : true,
        last_seen_at: nowIso
      }, { onConflict: "workspace_id,user_id" });

    if (upsertError) {
      if (!upsertError.message?.includes("schema cache") && !upsertError.message?.includes("does not exist")) {
        console.warn("Failed upserting workspace_presence row:", upsertError.message);
      }
    }

    return NextResponse.json({
      success: true,
      row: {
        workspaceId,
        userId,
        statusText: statusText || "Active",
        isOnline: isOnline !== undefined ? isOnline : true,
        lastSeenAt: nowIso
      }
    });
  } catch (err: any) {
    console.error("POST presence error:", err);
    return NextResponse.json({ error: err.message || "Internal Error" }, { status: 500 });
  }
}
