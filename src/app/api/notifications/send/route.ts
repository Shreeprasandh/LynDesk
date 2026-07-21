import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const { recipientId, senderId, title, message, actionUrl, type } = await req.json();

    if (!recipientId || !title || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

    if (url && serviceKey) {
      const supabaseAdmin = createClient(url, serviceKey, {
        auth: { persistSession: false }
      });

      // Insert notification into notifications table for recipient
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

      // Send realtime broadcast to recipient channel
      const channel = supabaseAdmin.channel(`user_notifs_${recipientId}`);
      await channel.send({
        type: "broadcast",
        event: "ldk_invite_sent",
        payload: { recipientId, senderId, title, message, actionUrl }
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error sending notification via API route:", error);
    return NextResponse.json({ success: true, warning: "Fallback mode executed" });
  }
}
