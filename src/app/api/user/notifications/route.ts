import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(request: Request) {
  try {
    const { searchParams: urlParams } = new URL(request.url);
    const userId = urlParams.get("userId");

    if (!userId) {
      return NextResponse.json({ notifications: [] });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

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
    const body = await request.json();
    const { id, userId, title, actionUrl } = body;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ success: false, error: "Missing configuration" }, { status: 500 });
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    if (id && !id.startsWith("n_cron_") && !id.startsWith("notif_local_")) {
      await supabaseAdmin.from("notifications").delete().eq("id", id);
    }

    if (userId) {
      if (title) {
        await supabaseAdmin.from("notifications").delete().eq("user_id", userId).eq("title", title);
      }
      if (actionUrl) {
        await supabaseAdmin.from("notifications").delete().eq("user_id", userId).eq("link_url", actionUrl);
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
