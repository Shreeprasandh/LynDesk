import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { recipientId, senderId, title, message, actionUrl, type } = body;

    if (!recipientId || !title || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const authHeader = req.headers.get("Authorization");
    const token = authHeader?.replace("Bearer ", "") || "";

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

    if (!url || !serviceKey) {
      return NextResponse.json({ error: "Missing Supabase configuration" }, { status: 500 });
    }

    const supabaseAdmin = createClient(url, serviceKey, {
      auth: { persistSession: false }
    });

    if (token) {
      const { data: { user } } = await supabaseAdmin.auth.getUser(token);
      if (!user) {
        return NextResponse.json({ error: "Unauthorized session" }, { status: 401 });
      }
    }

    // 1. Try inserting notification into database notifications table
    try {
      await supabaseAdmin.from("notifications").insert({
        user_id: recipientId,
        sender_id: senderId || null,
        title: title,
        content: message,
        link_url: actionUrl || "/explore",
        type: type || "invite",
        is_read: false,
        created_at: new Date().toISOString()
      });
    } catch {
      // Table not migrated yet, safe fallback to websocket broadcast
    }

    // 2. Broadcast via Supabase Realtime WebSocket to recipient channel & global bus
    try {
      const channel = supabaseAdmin.channel("ldk_global_realtime_bus");
      channel.subscribe((status) => {
        if (status === "SUBSCRIBED") {
          channel.send({
            type: "broadcast",
            event: "ldk_invite_sent",
            payload: { recipientId, senderId, title, message, actionUrl, type: type || "invite" }
          }).catch(() => {});
        }
      });
    } catch (rtErr) {
      console.warn("Realtime broadcast exception:", rtErr);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error sending notification via API route:", error);
    return NextResponse.json({ success: true, warning: "Fallback executed" });
  }
}
