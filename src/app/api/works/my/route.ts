import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/app/lib/supabaseServer";

// ─── Types ────────────────────────────────────────────────────────────────────

interface WorkItem {
  id: string;
  institute_id: string;
  student_id: string;
  title: string;
  category: string;
  description: string | null;
  is_published: boolean;
  external_url: string | null;
  file_path: string | null;
  is_alias: boolean;
  alias_proof_path: string | null;
  status: "pending" | "ai_verified" | "staff_review" | "approved" | "rejected";
  ai_verdict: Record<string, unknown> | null;
  rejection_reason: string | null;
  views: number;
  average_rating: number;
  rating_count: number;
  tags: string[] | null;
  how_to_use: string | null;
  embed_url: string | null;
  expires_at: string;
  renewed_at: string | null;
  created_at: string;
  student_name?: string;
  student_department?: string;
  student_year?: string;
}

const ACTIVE_WORK_LIMIT = 5;

// ─── GET /api/works/my ────────────────────────────────────────────────────────
// Returns the authenticated student's own works (all statuses).
// Response includes remaining quota: 5 − active count.

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

    // Fetch all of this student's works (all statuses, newest first)
    const { data: works, error: worksErr } = await supabaseAdmin
      .from("student_works")
      .select("*")
      .eq("student_id", user.id)
      .order("created_at", { ascending: false });

    if (worksErr) {
      console.error("[GET /api/works/my] DB error:", worksErr.message);
      return NextResponse.json({ error: worksErr.message }, { status: 500 });
    }

    const allWorks = (works ?? []) as WorkItem[];
    const now = new Date();

    // Active = not rejected AND not expired
    const activeCount = allWorks.filter(
      (w) => w.status !== "rejected" && new Date(w.expires_at) > now
    ).length;

    return NextResponse.json({
      works: allWorks,
      count: allWorks.length,
      remaining: Math.max(0, ACTIVE_WORK_LIMIT - activeCount),
    });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Internal Server Error";
    console.error("[GET /api/works/my] Unhandled error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
