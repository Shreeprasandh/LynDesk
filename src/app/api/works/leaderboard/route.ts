import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/app/lib/supabaseServer";

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Authorization credentials required" },
        { status: 401 }
      );
    }
    const token = authHeader.replace("Bearer ", "").trim();

    const supabaseAdmin = createAdminClient();

    const {
      data: { user },
      error: authErr,
    } = await supabaseAdmin.auth.getUser(token);
    if (authErr || !user) {
      return NextResponse.json(
        { error: "Invalid authentication session" },
        { status: 401 }
      );
    }

    const { data: profile, error: profileErr } = await supabaseAdmin
      .from("profiles")
      .select("institute_id, college_linked_status")
      .eq("id", user.id)
      .single();

    if (profileErr || !profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }
    if (profile.college_linked_status !== "linked" || !profile.institute_id) {
      return NextResponse.json(
        { error: "College verification required" },
        { status: 403 }
      );
    }

    // Top rated and most viewed works
    const { data: topWorks, error: worksErr } = await supabaseAdmin
      .from("student_works")
      .select(`
        id,
        title,
        category,
        description,
        external_url,
        views,
        average_rating,
        rating_count,
        created_at,
        profiles!student_works_student_id_fkey (
          full_name,
          department,
          academic_year
        )
      `)
      .eq("institute_id", profile.institute_id)
      .eq("status", "approved")
      .order("average_rating", { ascending: false })
      .order("views", { ascending: false })
      .limit(10);

    if (worksErr) {
      return NextResponse.json({ error: worksErr.message }, { status: 500 });
    }

    const leaderboard = (topWorks || []).map((row, idx) => {
      const profileData = (row as Record<string, unknown>).profiles as {
        full_name?: string;
        department?: string;
        academic_year?: string;
      } | null;

      return {
        rank: idx + 1,
        id: row.id,
        title: row.title,
        category: row.category,
        views: row.views,
        average_rating: row.average_rating,
        rating_count: row.rating_count,
        student_name: profileData?.full_name || "Anonymous Student",
        department: profileData?.department || "General",
        academic_year: profileData?.academic_year || "2026"
      };
    });

    return NextResponse.json({ leaderboard });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
