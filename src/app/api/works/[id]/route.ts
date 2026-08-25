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

type RouteContext = { params: Promise<{ id: string }> };

// ─── GET /api/works/[id] ────────────────────────────────────────────────────────
// Fetch a single approved work. Auth required (same institute check).
// Records a unique view per authenticated user.

export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

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

    // Fetch the work — enforce institute scope + approved status
    const { data: work, error: workErr } = await supabaseAdmin
      .from("student_works")
      .select(
        `
        *,
        profiles!student_works_student_id_fkey(
          full_name,
          department,
          academic_year
        )
        `
      )
      .eq("id", id)
      .eq("institute_id", profile.institute_id)
      .eq("status", "approved")
      .single();

    if (workErr || !work) {
      return NextResponse.json(
        { error: "Work not found or not accessible" },
        { status: 404 }
      );
    }

    // Attempt to record a view (upsert — UNIQUE constraint silences duplicates)
    // If the user has already viewed this work, the upsert is a no-op.
    const { error: viewErr } = await supabaseAdmin
      .from("student_work_views")
      .upsert(
        { work_id: id, viewer_id: user.id, viewed_at: new Date().toISOString() },
        { onConflict: "work_id,viewer_id", ignoreDuplicates: true }
      );

    if (!viewErr) {
      // Only increment counter for genuinely new views
      try {
        const { error: rpcErr } = await supabaseAdmin.rpc("increment_work_views", { work_id: id });
        if (rpcErr) {
          await supabaseAdmin
            .from("student_works")
            .update({ views: (work.views ?? 0) + 1 })
            .eq("id", id);
        }
      } catch {
        await supabaseAdmin
          .from("student_works")
          .update({ views: (work.views ?? 0) + 1 })
          .eq("id", id);
      }
    }

    // Flatten the joined profile
    type RawWork = typeof work & {
      profiles: {
        full_name: string;
        department: string;
        academic_year: string;
      } | null;
    };
    const r = work as RawWork;
    const { profiles: joinedProfile, ...rest } = r;
    const workItem: WorkItem = {
      ...rest,
      student_name: joinedProfile?.full_name ?? undefined,
      student_department: joinedProfile?.department ?? undefined,
      student_year: joinedProfile?.academic_year ?? undefined,
    } as WorkItem;

    return NextResponse.json(workItem);
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Internal Server Error";
    console.error("[GET /api/works/[id]] Unhandled error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ─── DELETE /api/works/[id] ─────────────────────────────────────────────────────
// Delete own work. Cleans up Storage file if present.

export async function DELETE(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

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

    // Fetch the work to verify ownership
    const { data: work, error: workErr } = await supabaseAdmin
      .from("student_works")
      .select("id, student_id, file_path")
      .eq("id", id)
      .single();

    if (workErr || !work) {
      return NextResponse.json({ error: "Work not found" }, { status: 404 });
    }
    if (work.student_id !== user.id) {
      return NextResponse.json(
        { error: "Forbidden: you do not own this work" },
        { status: 403 }
      );
    }

    // Delete Storage file if one exists
    if (work.file_path) {
      const { error: storageErr } = await supabaseAdmin.storage
        .from("student-works")
        .remove([work.file_path]);
      if (storageErr) {
        // Non-fatal — log and continue with DB deletion
        console.warn(
          "[DELETE /api/works/[id]] Storage delete warning:",
          storageErr.message
        );
      }
    }

    // Delete the DB record (cascades to ratings, views, staff reviews)
    const { error: deleteErr } = await supabaseAdmin
      .from("student_works")
      .delete()
      .eq("id", id);

    if (deleteErr) {
      console.error(
        "[DELETE /api/works/[id]] DB delete error:",
        deleteErr.message
      );
      return NextResponse.json({ error: deleteErr.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, id });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Internal Server Error";
    console.error("[DELETE /api/works/[id]] Unhandled error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
