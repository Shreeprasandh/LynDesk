import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { recipientId, senderId, title, message, actionUrl, type } = body;

    if (!recipientId || !title || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

    if (url && serviceKey) {
      const supabaseAdmin = createClient(url, serviceKey, {
        auth: { persistSession: false }
      });

      // 1. Try inserting notification into notifications table
      try {
        const { error: insertErr } = await supabaseAdmin.from("notifications").insert({
          user_id: recipientId,
          sender_id: senderId || null,
          title: title,
          content: message,
          link_url: actionUrl || "/explore",
          type: type || "invite",
          is_read: false,
          created_at: new Date().toISOString()
        });
        if (insertErr) {
          console.warn("Database notifications table insert notice:", insertErr.message);
        }
      } catch (dbErr) {
        console.warn("Database notifications insert exception:", dbErr);
      }

      // 2. Broadcast via Supabase Realtime WebSocket to recipient channel & global bus
      try {
        const channel = supabaseAdmin.channel("ldk_global_realtime_bus");
        await channel.subscribe();
        await channel.send({
          type: "broadcast",
          event: "ldk_invite_sent",
          payload: { recipientId, senderId, title, message, actionUrl, type: type || "invite" }
        });
      } catch (rtErr) {
        console.warn("Realtime broadcast exception:", rtErr);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error sending notification via API route:", error);
    return NextResponse.json({ success: true, warning: "Fallback executed" });
  }
}
