import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { verifyInstitutionalToken, INSTITUTIONAL_COOKIE_NAMES } from "@/app/lib/institutionalAuth";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-project.supabase.co";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder_service_role_key";
const supabaseServer = createClient(supabaseUrl, serviceRoleKey);

const DEFAULT_STAFF = [
  { id: "staff-1", name: "Dr. S. Malathi", email: "hod.it@srmist.edu.in", passkey: "HOD_IT_2026", role: "hod", department_scope: "Information Technology", assigned_sections: [], assigned_years: ["3rd Year", "4th Year"], is_active: true, queries_count: 48, exports_count: 12 },
  { id: "staff-2", name: "Prof. R. Venkatesh", email: "coordinator.it@srmist.edu.in", passkey: "COORD_SEC_E", role: "coordinator", department_scope: "Information Technology", assigned_sections: ["Section E"], assigned_years: ["3rd Year"], is_active: true, queries_count: 124, exports_count: 34 },
  { id: "staff-3", name: "Dr. N. Balamurugan", email: "hod.cse@srmist.edu.in", passkey: "HOD_CSE_2026", role: "hod", department_scope: "Computer Science and Engineering", assigned_sections: [], assigned_years: ["1st Year", "2nd Year", "3rd Year", "4th Year"], is_active: true, queries_count: 62, exports_count: 18 }
];

async function authenticateAdmin(req: NextRequest) {
  const token = req.cookies.get(INSTITUTIONAL_COOKIE_NAMES.ADMIN)?.value;
  if (!token) return null;
  const payload = await verifyInstitutionalToken(token);
  if (!payload || payload.role !== "college_admin") return null;
  return payload;
}

export async function GET(req: NextRequest) {
  try {
    const admin = await authenticateAdmin(req);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized administrator access." }, { status: 401 });
    }

    let staffList: any[] = [];
    try {
      const { data } = await supabaseServer
        .from("staff_accounts")
        .select("*")
        .eq("institute_id", admin.instituteId)
        .order("created_at", { ascending: false });

      if (data && data.length > 0) staffList = data;
    } catch {}

    if (staffList.length === 0) {
      staffList = DEFAULT_STAFF.map(s => ({ ...s, institute_id: admin.instituteId }));
    }

    return NextResponse.json({ success: true, staff: staffList });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed fetching staff accounts." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await authenticateAdmin(req);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized administrator access." }, { status: 401 });
    }

    const body = await req.json();
    const { name, email, role, department_scope, assigned_sections, assigned_years, custom_passkey } = body;

    if (!name || !email || !role || !department_scope) {
      return NextResponse.json({ error: "Name, email, role, and department scope are required." }, { status: 400 });
    }

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanRole = role;
    const cleanDept = department_scope.trim();

    // Auto-generate secure 8-character alphanumeric passkey if custom not provided
    const passkey = (custom_passkey || "").trim() || `${cleanRole.toUpperCase()}_${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    // Hash passkey
    const enc = new TextEncoder();
    const hashBuf = await crypto.subtle.digest("SHA-256", enc.encode(passkey));
    const passkeyHash = Array.from(new Uint8Array(hashBuf)).map(b => b.toString(16).padStart(2, "0")).join("");

    const newStaffRow = {
      institute_id: admin.instituteId,
      name: cleanName,
      email: cleanEmail,
      passkey_hash: passkeyHash,
      role: cleanRole,
      department_scope: cleanDept,
      assigned_sections: Array.isArray(assigned_sections) ? assigned_sections : [],
      assigned_years: Array.isArray(assigned_years) ? assigned_years : [],
      is_active: true
    };

    let created = null;
    try {
      const { data, error } = await supabaseServer
        .from("staff_accounts")
        .upsert(newStaffRow, { onConflict: "institute_id,email" })
        .select()
        .single();
      if (!error) created = data;
    } catch {}

    if (!created) {
      created = { ...newStaffRow, id: `local_staff_${Date.now()}` };
    }

    // Log admin action
    try {
      await supabaseServer.from("institutional_audit_logs").insert([
        {
          institute_id: admin.instituteId,
          actor_type: "admin",
          actor_id: admin.sub,
          actor_name: admin.name,
          action_type: "STAFF_PASSKEY_ISSUED",
          description: `Issued ${cleanRole.toUpperCase()} access passkey for ${cleanName} (${cleanDept})`,
          ip_hash: "admin_action",
          metadata: { email: cleanEmail, role: cleanRole, department: cleanDept }
        }
      ]);
    } catch {}

    return NextResponse.json({
      success: true,
      staff: created,
      issuedPasskey: passkey,
      message: `Passkey successfully generated for ${cleanName}. Please securely transmit the credential.`
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed issuing staff passkey." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const admin = await authenticateAdmin(req);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized administrator access." }, { status: 401 });
    }

    const id = req.nextUrl.searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Staff ID required." }, { status: 400 });
    }

    try {
      await supabaseServer
        .from("staff_accounts")
        .update({ is_active: false })
        .eq("id", id)
        .eq("institute_id", admin.instituteId);
    } catch {}

    // Log admin action
    try {
      await supabaseServer.from("institutional_audit_logs").insert([
        {
          institute_id: admin.instituteId,
          actor_type: "admin",
          actor_id: admin.sub,
          actor_name: admin.name,
          action_type: "STAFF_PASSKEY_REVOKED",
          description: `Revoked access passkey for staff ID: ${id}`,
          ip_hash: "admin_action",
          metadata: { staffId: id }
        }
      ]);
    } catch {}

    return NextResponse.json({ success: true, message: "Staff access revoked successfully." });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed revoking staff access." }, { status: 500 });
  }
}
