import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { verifyInstitutionalToken, INSTITUTIONAL_COOKIE_NAMES } from "@/app/lib/institutionalAuth";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-project.supabase.co";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder_service_role_key";
const supabaseServer = createClient(supabaseUrl, serviceRoleKey);

// Default seed structure rows if table is empty
const DEFAULT_STRUCTURES = [
  { id: "struct-1", academic_year: "3rd Year", department: "Information Technology", section: "Section A", roll_start: "RA2311003010001", roll_end: "RA2311003010065", expected_students: 65 },
  { id: "struct-2", academic_year: "3rd Year", department: "Information Technology", section: "Section B", roll_start: "RA2311003010066", roll_end: "RA2311003010130", expected_students: 65 },
  { id: "struct-3", academic_year: "3rd Year", department: "Information Technology", section: "Section E", roll_start: "RA2311003010261", roll_end: "RA2311003010325", expected_students: 65 },
  { id: "struct-4", academic_year: "3rd Year", department: "Computer Science and Engineering", section: "Section A", roll_start: "RA2311001010001", roll_end: "RA2311001010070", expected_students: 70 },
  { id: "struct-5", academic_year: "4th Year", department: "Computer Science and Engineering", section: "Section A", roll_start: "RA2211001010001", roll_end: "RA2211001010070", expected_students: 70 },
  { id: "struct-6", academic_year: "2nd Year", department: "Artificial Intelligence and Data Science", section: "Section A", roll_start: "RA2411010010001", roll_end: "RA2411010010060", expected_students: 60 }
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

    let structures: any[] = [];
    try {
      const { data, error } = await supabaseServer
        .from("college_structures")
        .select("*")
        .eq("institute_id", admin.instituteId)
        .order("academic_year", { ascending: true })
        .order("department", { ascending: true })
        .order("section", { ascending: true });

      if (!error && data && data.length > 0) {
        structures = data;
      }
    } catch {}

    if (structures.length === 0) {
      structures = DEFAULT_STRUCTURES.map(s => ({ ...s, institute_id: admin.instituteId }));
    }

    return NextResponse.json({ success: true, structures });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed fetching campus architecture." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await authenticateAdmin(req);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized administrator access." }, { status: 401 });
    }

    const body = await req.json();
    const { academic_year, department, section, roll_start, roll_end, expected_students } = body;

    if (!academic_year || !department || !section || !roll_start || !roll_end) {
      return NextResponse.json({ error: "All architectural fields are required." }, { status: 400 });
    }

    const newRow = {
      institute_id: admin.instituteId,
      academic_year: academic_year.trim(),
      department: department.trim(),
      section: section.trim(),
      roll_start: roll_start.trim().toUpperCase(),
      roll_end: roll_end.trim().toUpperCase(),
      expected_students: Number(expected_students) || 60,
      updated_at: new Date().toISOString()
    };

    let inserted = null;
    try {
      const { data, error } = await supabaseServer
        .from("college_structures")
        .upsert(newRow, { onConflict: "institute_id,academic_year,department,section" })
        .select()
        .single();

      if (!error) inserted = data;
    } catch {}

    if (!inserted) {
      inserted = { ...newRow, id: `local_struct_${Date.now()}` };
    }

    // Log admin action
    try {
      await supabaseServer.from("institutional_audit_logs").insert([
        {
          institute_id: admin.instituteId,
          actor_type: "admin",
          actor_id: admin.sub,
          actor_name: admin.name,
          action_type: "CAMPUS_STRUCTURE_UPDATED",
          description: `Configured ${newRow.department} ${newRow.academic_year} ${newRow.section} (Roll: ${newRow.roll_start} - ${newRow.roll_end})`,
          ip_hash: "admin_action",
          metadata: newRow
        }
      ]);
    } catch {}

    return NextResponse.json({ success: true, structure: inserted });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed configuring structure." }, { status: 500 });
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
      return NextResponse.json({ error: "Structure ID required." }, { status: 400 });
    }

    try {
      await supabaseServer
        .from("college_structures")
        .delete()
        .eq("id", id)
        .eq("institute_id", admin.instituteId);
    } catch {}

    return NextResponse.json({ success: true, message: "Structure removed." });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed deleting structure." }, { status: 500 });
  }
}
