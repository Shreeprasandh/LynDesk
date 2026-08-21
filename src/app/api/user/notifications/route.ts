import { NextResponse } from "next/server";
import { createAdminClient } from "@/app/lib/supabaseServer";

export async function GET(request: Request) {
  try {
    const { searchParams: urlParams } = new URL(request.url);
    const userId = urlParams.get("userId");

    if (!userId) {
      return NextResponse.json({ notifications: [] });
    }

    const authHeader = request.headers.get("Authorization");
    const token = authHeader?.replace("Bearer ", "").trim();

    const supabaseAdmin = createAdminClient();

    if (token) {
      const { data: { user } } = await supabaseAdmin.auth.getUser(token);
      if (user && user.id !== userId) {
        return NextResponse.json({ error: "Access denied" }, { status: 403 });
      }
    }

    const { data: dbData, error } = await supabaseAdmin
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ notifications: [] });
    }

    const notifications = (dbData || []).map((d: any) => {
      const isInvite = d.type === "invite" || d.title?.toLowerCase().includes("invite") || (d.content && d.content.toLowerCase().includes("invited"));
      const isDeclinedOrAccepted = d.title?.toLowerCase().includes("declined") || d.title?.toLowerCase().includes("accepted");
      return {
        id: d.id,
        senderId: d.sender_id || null,
        title: d.title || "Notification",
        message: d.content || d.message || "",
        type: isInvite ? "invite" : (d.type || "warning"),
        category: "alerts",
        time: "Recently",
        read: d.is_read ?? false,
        actionLabel: (isInvite && !isDeclinedOrAccepted) ? "Accept Invite" : undefined,
        actionUrl: d.link_url || "/explore"
      };
    });

    return NextResponse.json({ notifications });
  } catch {
    return NextResponse.json({ notifications: [] });
  }
}

export async function DELETE(request: Request) {
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Authorization credentials required" }, { status: 401 });
    }
    const token = authHeader.replace("Bearer ", "").trim();

    const body = await request.json();
    const { id, userId, title, actionUrl } = body;

    const supabaseAdmin = createAdminClient();
    const { data: { user }, error: authErr } = await supabaseAdmin.auth.getUser(token);

    if (authErr || !user) {
      return NextResponse.json({ error: "Invalid authentication session" }, { status: 401 });
    }

    const targetUserId = userId || user.id;
    if (userId && userId !== user.id) {
      return NextResponse.json({ error: "Unauthorized operation" }, { status: 403 });
    }

    if (id && !id.startsWith("n_cron_") && !id.startsWith("notif_local_")) {
      await supabaseAdmin.from("notifications").delete().eq("id", id).eq("user_id", user.id);
    }

    if (targetUserId) {
      if (title) {
        await supabaseAdmin.from("notifications").delete().eq("user_id", targetUserId).eq("title", title);
      }
      if (actionUrl) {
        await supabaseAdmin.from("notifications").delete().eq("user_id", targetUserId).eq("link_url", actionUrl);
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || "Failed deleting notifications" }, { status: 500 });
  }
}
