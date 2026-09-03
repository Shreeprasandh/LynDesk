import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/app/lib/supabaseServer";

export async function GET(req: NextRequest) {
  try {
    // Next.js Route Handler parameter extraction
    /* await searchParams */
    const searchParams = req.nextUrl.searchParams;
    const department = searchParams.get("department");
    const year = searchParams.get("year");
    const section = searchParams.get("section");
    const rollNumber = searchParams.get("roll");
    const studentId = searchParams.get("studentId") || searchParams.get("userId");

    let broadcasts: any[] = [];
    const supabaseAdmin = createAdminClient();

    try {
      const { data, error } = await supabaseAdmin
        .from("staff_broadcasts")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(30);

      if (!error && data) {
        broadcasts = data;
      }
    } catch {}

    // Check read receipts for the student if studentId is provided
    const readBroadcastIds = new Set<string>();
    if (studentId) {
      try {
        const { data: receipts } = await supabaseAdmin
          .from("broadcast_receipts")
          .select("broadcast_id")
          .eq("student_id", studentId);

        if (receipts && receipts.length > 0) {
          receipts.forEach((r: any) => {
            if (r.broadcast_id) readBroadcastIds.add(String(r.broadcast_id));
          });
        }
      } catch {}
    }

    // Match broadcast target_scope against student metadata & exclude read ones
    const filtered = broadcasts.filter(b => {
      // Exclude if already marked as read/dismissed by student in database
      if (studentId && readBroadcastIds.has(String(b.id))) {
        return false;
      }

      const scope = b.target_scope || {};
      if (b.target_type === "all") return true;
      if (department && scope.department && scope.department !== "ALL" && scope.department !== department) return false;
      if (year && scope.year && scope.year !== year) return false;
      if (section && scope.section && scope.section !== section) return false;
      if (rollNumber && scope.roll_start && scope.roll_end) {
        if (rollNumber < scope.roll_start || rollNumber > scope.roll_end) return false;
      }
      return true;
    });

    return NextResponse.json({ success: true, broadcasts: filtered });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed fetching broadcasts." }, { status: 500 });
  }
}
