import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(req: NextRequest) {
  const urlParams = req.nextUrl.searchParams;
  const workspaceId = urlParams.get("workspaceId");

  if (!workspaceId) {
    return NextResponse.json({ error: "Missing workspaceId" }, { status: 400 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json({ presence: [] });
  }

  const supabaseAdmin = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

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
      .eq("workspace_id", workspaceId);

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
      .eq("project_space_id", workspaceId);

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
    const { workspaceId, userId, statusText, isOnline } = body;

    if (!workspaceId || !userId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json({ error: "Missing configuration" }, { status: 500 });
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    const nowIso = new Date().toISOString();

    // Upsert row in workspace_presence table
    const { error: upsertError } = await supabaseAdmin
      .from("workspace_presence")
      .upsert({
        workspace_id: workspaceId,
        user_id: userId,
        status_text: statusText || "Active",
        is_online: isOnline !== undefined ? isOnline : true,
        last_seen_at: nowIso
      }, { onConflict: "workspace_id,user_id" });

    if (upsertError) {
      console.warn("Failed upserting workspace_presence row:", upsertError.message);
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
