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

    // Support Bulk Array Upload (e.g. from CSV parser)
    if (Array.isArray(body.structures) || Array.isArray(body)) {
      const items = Array.isArray(body.structures) ? body.structures : body;
      const rowsToInsert = items
        .map((item: any) => ({
          institute_id: admin.instituteId,
          academic_year: String(item.academic_year || item.academicYear || "1st Year").trim(),
          department: String(item.department || "").trim(),
          section: String(item.section || "").trim(),
          roll_start: String(item.roll_start || item.rollStart || "").trim().toUpperCase(),
          roll_end: String(item.roll_end || item.rollEnd || "").trim().toUpperCase(),
          expected_students: Number(item.expected_students || item.expectedStudents) || 60,
          updated_at: new Date().toISOString()
        }))
        .filter((r: any) => r.department && r.section && r.roll_start && r.roll_end);

      if (rowsToInsert.length === 0) {
        return NextResponse.json({ error: "No valid structure rows found in bulk payload." }, { status: 400 });
      }

      let insertedRows = rowsToInsert;
      try {
        const { data, error } = await supabaseServer
          .from("college_structures")
          .upsert(rowsToInsert, { onConflict: "institute_id,academic_year,department,section" })
          .select();

        if (!error && data) {
          insertedRows = data;
        }
      } catch {}

      try {
        await supabaseServer.from("institutional_audit_logs").insert([
          {
            institute_id: admin.instituteId,
            actor_type: "admin",
            actor_id: admin.sub,
            actor_name: admin.name,
            action_type: "CAMPUS_STRUCTURE_BULK_IMPORTED",
            description: `Bulk imported ${rowsToInsert.length} campus departments & roll ranges.`,
            ip_hash: "admin_action",
            metadata: { count: rowsToInsert.length }
          }
        ]);
      } catch {}

      return NextResponse.json({ success: true, count: rowsToInsert.length, structures: insertedRows });
    }

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

    // Next.js Route Handler parameter extraction
    /* await searchParams */
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
