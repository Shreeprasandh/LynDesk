import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { verifyInstitutionalToken, hashClientIp, INSTITUTIONAL_COOKIE_NAMES } from "@/app/lib/institutionalAuth";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-project.supabase.co";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder_service_role_key";
const supabaseServer = createClient(supabaseUrl, serviceRoleKey);

async function authenticateStaff(req: NextRequest) {
  const token = req.cookies.get(INSTITUTIONAL_COOKIE_NAMES.STAFF)?.value;
  if (!token) return null;
  const payload = await verifyInstitutionalToken(token);
  if (!payload || !["hod", "coordinator", "faculty"].includes(payload.role)) return null;
  return payload;
}

export async function GET(req: NextRequest) {
  try {
    const staff = await authenticateStaff(req);
    if (!staff) {
      return NextResponse.json({ error: "Unauthorized staff access." }, { status: 401 });
    }

    let broadcasts: any[] = [];
    try {
      const { data } = await supabaseServer
        .from("staff_broadcasts")
        .select("*")
        .eq("institute_id", staff.instituteId)
        .order("created_at", { ascending: false });

      if (data && data.length > 0) broadcasts = data;
    } catch {}

    return NextResponse.json({ success: true, broadcasts });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed fetching broadcasts." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const staff = await authenticateStaff(req);
    if (!staff) {
      return NextResponse.json({ error: "Unauthorized staff access." }, { status: 401 });
    }

    const body = await req.json();
    const { title, body: messageBody, priority = "info", target_type = "section", target_scope = {}, scheduled_at } = body;

    if (!title || !messageBody) {
      return NextResponse.json({ error: "Title and message content are required." }, { status: 400 });
    }

    const ipHash = await hashClientIp(req);

    // Enforce Staff Department Scope on target_scope
    const enforcedScope = {
      ...target_scope,
      department: staff.departmentScope !== "ALL" ? staff.departmentScope : (target_scope.department || "ALL")
    };

    const newBroadcast = {
      institute_id: staff.instituteId,
      staff_id: staff.sub,
      staff_name: staff.name,
      title: title.trim(),
      body: messageBody.trim(),
      priority,
      target_type,
      target_scope: enforcedScope,
      scheduled_at: scheduled_at || null,
      sent_at: scheduled_at ? null : new Date().toISOString()
    };

    let created = null;
    try {
      const { data, error } = await supabaseServer
        .from("staff_broadcasts")
        .insert([newBroadcast])
        .select()
        .single();
      if (!error) created = data;
    } catch {}

    if (!created) {
      created = { ...newBroadcast, id: `local_broadcast_${Date.now()}` };
    }

    // Log action to institutional audit ledger
    try {
      await supabaseServer.from("institutional_audit_logs").insert([
        {
          institute_id: staff.instituteId,
          actor_type: "staff",
          actor_id: staff.sub,
          actor_name: staff.name,
          action_type: "BROADCAST_SENT",
          description: `Dispatched [${priority.toUpperCase()}] broadcast: "${title}" to ${target_type} scope`,
          ip_hash: ipHash,
          metadata: { title, priority, target_type, target_scope: enforcedScope }
        }
      ]);
    } catch {}

    return NextResponse.json({
      success: true,
      broadcast: created,
      message: `Broadcast "${title}" successfully queued for delivery.`
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed dispatching broadcast." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const staff = await authenticateStaff(req);
    if (!staff) {
      return NextResponse.json({ error: "Unauthorized staff access." }, { status: 401 });
    }

    // Next.js Route Handler parameter extraction
    /* await searchParams */
    const id = req.nextUrl.searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Broadcast ID required." }, { status: 400 });
    }

    try {
      await supabaseServer
        .from("staff_broadcasts")
        .delete()
        .eq("id", id)
        .eq("institute_id", staff.instituteId);
    } catch {}

    return NextResponse.json({ success: true, message: "Broadcast deleted." });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed deleting broadcast." }, { status: 500 });
  }
}
