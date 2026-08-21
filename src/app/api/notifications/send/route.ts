import { NextResponse } from "next/server";
import { createAdminClient } from "@/app/lib/supabaseServer";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { recipientId, senderId, title, message, actionUrl, type } = body;

    if (!recipientId || !title || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Authorization credentials required" }, { status: 401 });
    }
    const token = authHeader.replace("Bearer ", "").trim();

    const supabaseAdmin = createAdminClient();
    const { data: { user }, error: authErr } = await supabaseAdmin.auth.getUser(token);

    if (authErr || !user) {
      return NextResponse.json({ error: "Invalid authentication session" }, { status: 401 });
    }

    const effectiveSenderId = senderId || user.id;
    if (senderId && senderId !== user.id) {
      return NextResponse.json({ error: "Sender identity mismatch" }, { status: 403 });
    }

    // 1. Insert notification into database notifications table
    const { error: dbError } = await supabaseAdmin.from("notifications").insert({
      user_id: recipientId,
      sender_id: effectiveSenderId,
      title: title,
      content: message,
      link_url: actionUrl || "/explore",
      type: type || "invite",
      is_read: false,
      created_at: new Date().toISOString()
    });

    if (dbError) {
      console.warn("Notification DB insert warning:", dbError.message);
    }

    // 2. Broadcast via Supabase Realtime WebSocket to recipient channel & global bus
    try {
      const channel = supabaseAdmin.channel("ldk_global_realtime_bus");
      channel.subscribe((status) => {
        if (status === "SUBSCRIBED") {
          channel.send({
            type: "broadcast",
            event: "ldk_invite_sent",
            payload: { recipientId, senderId: effectiveSenderId, title, message, actionUrl, type: type || "invite" }
          }).finally(() => {
            supabaseAdmin.removeChannel(channel);
          });
        }
      });
    } catch (rtErr) {
      console.warn("Realtime broadcast notice:", rtErr);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error sending notification via API route:", error);
    return NextResponse.json({ error: error?.message || "Failed sending notification" }, { status: 500 });
  }
}
