import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ notifications: [] });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://dsqkxedafwzkjtcupzwx.supabase.co";
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
  } catch (err: any) {
    return NextResponse.json({ notifications: [] });
  }
}
