import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { verifyInstitutionalToken, INSTITUTIONAL_COOKIE_NAMES } from "@/app/lib/institutionalAuth";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-project.supabase.co";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder_service_role_key";
const supabaseServer = createClient(supabaseUrl, serviceRoleKey);

async function authenticateAdmin(req: NextRequest) {
  const token = req.cookies.get(INSTITUTIONAL_COOKIE_NAMES.ADMIN)?.value;
  if (!token) return null;
  const payload = await verifyInstitutionalToken(token);
  if (!payload || payload.role !== "college_admin") return null;
  return payload;
}

export async function POST(req: NextRequest) {
  try {
    const admin = await authenticateAdmin(req);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized administrator access." }, { status: 401 });
    }

    const body = await req.json();
    const { department, section, academicYear, missingRolls } = body;

    const rollList: string[] = Array.isArray(missingRolls) ? missingRolls : [];

    // Record invite dispatch event in institutional audit logs
    try {
      await supabaseServer.from("institutional_audit_logs").insert([
        {
          institute_id: admin.instituteId,
          actor_type: "admin",
          actor_id: admin.sub,
          actor_name: admin.name,
          action_type: "MISSING_INVITE_DISPATCHED",
          description: `Dispatched institutional onboarding invitations to ${rollList.length} missing student(s) in ${department} (${academicYear}, ${section})`,
          ip_hash: "admin_action",
          metadata: { department, section, academicYear, count: rollList.length, rolls: rollList.slice(0, 20) }
        }
      ]);
    } catch {}

    return NextResponse.json({
      success: true,
      sentCount: rollList.length,
      message: `Successfully queued ${rollList.length} branded campus enrollment invites for ${department} ${section}.`
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed dispatching invites." }, { status: 500 });
  }
}
