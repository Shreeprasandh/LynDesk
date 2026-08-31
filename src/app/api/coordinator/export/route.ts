import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { verifyInstitutionalToken, hashClientIp, INSTITUTIONAL_COOKIE_NAMES } from "@/app/lib/institutionalAuth";
import { sanitizeCsvCell } from "@/app/lib/sanitize";

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

export async function POST(req: NextRequest) {
  try {
    const staff = await authenticateStaff(req);
    if (!staff) {
      return NextResponse.json({ error: "Unauthorized staff access." }, { status: 401 });
    }

    const body = await req.json();
    const { students, format = "csv", filterMetadata = {} } = body;

    const studentList: any[] = Array.isArray(students) ? students : [];
    const ipHash = await hashClientIp(req);

    // 1. Audit Log the export action (strict institutional audit compliance)
    try {
      await supabaseServer.from("institutional_audit_logs").insert([
        {
          institute_id: staff.instituteId,
          actor_type: "staff",
          actor_id: staff.sub,
          actor_name: staff.name,
          action_type: "EXPORT_EXCEL",
          description: `Staff member exported ${studentList.length} student records from ${staff.departmentScope} (${format.toUpperCase()})`,
          ip_hash: ipHash,
          metadata: { count: studentList.length, format, filterMetadata }
        }
      ]);
    } catch {}

    // 2. Generate CSV content
    const headers = [
      "Roll Number",
      "Student Name",
      "Department",
      "Academic Year",
      "Section",
      "LeetCode Solved",
      "Codeforces Rating",
      "CodeChef Rating",
      "Verification Status"
    ];

    const rows = studentList.map(st => [
      sanitizeCsvCell(st.roll_number || ""),
      sanitizeCsvCell(st.full_name || st.username || ""),
      sanitizeCsvCell(st.department || ""),
      sanitizeCsvCell(st.academic_year || ""),
      sanitizeCsvCell(st.section || ""),
      Number(st.leetcode_solved) || 0,
      Number(st.codeforces_rating) || 0,
      Number(st.codechef_rating) || 0,
      sanitizeCsvCell(st.leetcode_verified ? "Verified" : "Self-Reported")
    ]);

    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");

    return NextResponse.json({
      success: true,
      csv: csvContent,
      fileName: `Lyndesk_${(staff.departmentScope || "Department").replace(/\s+/g, "_")}_Roster_${new Date().toISOString().split("T")[0]}.csv`,
      exportedCount: studentList.length
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed generating export." }, { status: 500 });
  }
}
