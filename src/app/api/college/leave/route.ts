import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { verifyInstitutionalToken, INSTITUTIONAL_COOKIE_NAMES } from "@/app/lib/institutionalAuth";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-project.supabase.co";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder_service_role_key";
const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

async function getStaffSession(req: NextRequest) {
  const token = req.cookies.get(INSTITUTIONAL_COOKIE_NAMES.STAFF)?.value || req.cookies.get(INSTITUTIONAL_COOKIE_NAMES.ADMIN)?.value;
  if (!token) return null;
  return await verifyInstitutionalToken(token);
}

// GET: Fetch leave & OD applications
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get("studentId");
    const isStaff = searchParams.get("isStaff") === "true";

    const staff = await getStaffSession(req);

    let query = supabaseAdmin
      .from("student_leave_applications")
      .select("*, student:profiles!student_id(id, full_name, roll_number, department, section, academic_year)")
      .order("created_at", { ascending: false });

    if (!isStaff && studentId) {
      query = query.eq("student_id", studentId);
    } else if (isStaff && staff) {
      if (staff.role === "coordinator" && staff.departmentScope && staff.departmentScope !== "ALL") {
        // Filter by coordinator's department if scoped
      }
    }

    const { data, error } = await query;
    if (error) {
      return NextResponse.json({ applications: [], error: error.message }, { status: 200 });
    }

    return NextResponse.json({
      success: true,
      applications: data || []
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed fetching leave applications" }, { status: 500 });
  }
}

// POST: Submit a new Leave or OD application
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      studentId,
      applicationType,
      targetDate,
      endDate,
      isFullDay,
      periods,
      category,
      title,
      reason,
      letterBody,
      proofUrl
    } = body;

    if (!studentId || !applicationType || !targetDate || !title) {
      return NextResponse.json({ error: "Missing required application parameters." }, { status: 400 });
    }

    const payload = {
      student_id: studentId,
      application_type: applicationType,
      target_date: targetDate,
      end_date: endDate || null,
      is_full_day: isFullDay !== undefined ? isFullDay : true,
      periods: Array.isArray(periods) ? periods : [],
      category: category || "academic",
      title: title.trim(),
      reason: (reason || "").trim(),
      letter_body: letterBody || null,
      proof_url: proofUrl || null,
      status: "pending"
    };

    const { data, error } = await supabaseAdmin
      .from("student_leave_applications")
      .insert(payload)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `${applicationType === "od" ? "On-Duty (OD)" : "Formal Leave"} application submitted successfully.`,
      application: data
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed submitting leave application." }, { status: 500 });
  }
}

// PATCH: Review / Approve / Reject application (Faculty / Coordinator)
export async function PATCH(req: NextRequest) {
  try {
    const staff = await getStaffSession(req);
    const body = await req.json();
    const { applicationId, status, remarks } = body;

    if (!applicationId || !["approved", "rejected"].includes(status)) {
      return NextResponse.json({ error: "Invalid review parameters." }, { status: 400 });
    }

    const { data: appData, error: fetchErr } = await supabaseAdmin
      .from("student_leave_applications")
      .select("*")
      .eq("id", applicationId)
      .single();

    if (fetchErr || !appData) {
      return NextResponse.json({ error: "Application not found." }, { status: 404 });
    }

    const { data: updated, error: updateErr } = await supabaseAdmin
      .from("student_leave_applications")
      .update({
        status,
        reviewed_by: staff?.sub || null,
        faculty_remarks: remarks || (status === "approved" ? "Approved by class coordinator." : "Rejected."),
        updated_at: new Date().toISOString()
      })
      .eq("id", applicationId)
      .select()
      .single();

    if (updateErr) {
      return NextResponse.json({ error: updateErr.message }, { status: 500 });
    }

    // If approved and type is OD, auto-sync or mark attendance status as OD
    if (status === "approved" && appData.application_type === "od") {
      try {
        const { data: subjects } = await supabaseAdmin
          .from("college_subjects")
          .select("id")
          .limit(5);

        if (subjects && subjects.length > 0) {
          const periodsToMark = appData.is_full_day ? [1, 2, 3, 4, 5, 6] : (appData.periods || [1]);
          const attendanceInserts = [];

          for (const sub of subjects) {
            for (const period of periodsToMark) {
              attendanceInserts.push({
                student_id: appData.student_id,
                subject_id: sub.id,
                date: appData.target_date,
                period_slot: period,
                status: "OD",
                faculty_remarks: `Approved OD: ${appData.title}`
              });
            }
          }

          if (attendanceInserts.length > 0) {
            await supabaseAdmin
              .from("student_attendance_logs")
              .upsert(attendanceInserts, { onConflict: "student_id,subject_id,date,period_slot" });
          }
        }
      } catch (syncErr) {
        console.warn("Attendance auto-sync note on OD approval:", syncErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Application marked as ${status}.`,
      application: updated
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed reviewing application." }, { status: 500 });
  }
}
