import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

const LeaveWorkspaceSchema = z.object({
  workspaceId: z.string().optional(),
  workspaceUuid: z.string().optional(),
  userId: z.string().min(1, "User ID is required")
}).refine(data => data.workspaceId || data.workspaceUuid, {
  message: "Either workspaceId or workspaceUuid must be provided"
});

export async function POST(req: Request) {
  try {
    const rawBody = await req.json();
    const parsed = LeaveWorkspaceSchema.safeParse(rawBody);
    
    if (!parsed.success) {
      return NextResponse.json({ 
        error: "Missing required parameters", 
        details: parsed.error.format() 
      }, { status: 400 });
    }

    const { workspaceId, workspaceUuid, userId } = parsed.data;

    // Validate Auth Token
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Authorization credentials required" }, { status: 401 });
    }
    const token = authHeader.replace("Bearer ", "");

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !serviceKey) {
      return NextResponse.json({ error: "Missing Supabase server configuration" }, { status: 500 });
    }

    const supabaseAdmin = createClient(url, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    const { data: { user }, error: authErr } = await supabaseAdmin.auth.getUser(token);
    if (authErr || !user) {
      return NextResponse.json({ error: "Invalid authentication session" }, { status: 401 });
    }

    // Ensure users can only remove themselves (or admin/owner validation)
    if (user.id !== userId) {
      return NextResponse.json({ error: "Unauthorized operation" }, { status: 403 });
    }

    const targetSpaceIds = [workspaceId, workspaceUuid].filter(Boolean);

    // 1. Delete member from project_members and wall_calendar_events tables for all target space IDs
    for (const spaceId of targetSpaceIds) {
      await supabaseAdmin
        .from("project_members")
        .delete()
        .eq("project_space_id", spaceId)
        .eq("profile_id", userId);

      await supabaseAdmin
        .from("wall_calendar_events")
        .delete()
        .eq("source_id", spaceId)
        .eq("user_id", userId);
    }

    // 2. Broadcast member_left event via WebSockets Realtime bus
    try {
      const activeSpaceId = workspaceUuid || workspaceId;
      const channel = supabaseAdmin.channel(`project_chat:${activeSpaceId}`);
      channel.subscribe((status) => {
        if (status === "SUBSCRIBED") {
          channel.send({
            type: "broadcast",
            event: "member_left",
            payload: { userId, workspaceId: activeSpaceId }
          }).finally(() => {
            supabaseAdmin.removeChannel(channel);
          });
        }
      });
    } catch {}

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error in /api/workspace/leave:", error);
    return NextResponse.json({ error: error.message || "Failed to leave workspace" }, { status: 500 });
  }
}
