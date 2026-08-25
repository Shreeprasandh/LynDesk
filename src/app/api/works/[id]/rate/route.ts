import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/app/lib/supabaseServer";

type RouteContext = { params: Promise<{ id: string }> };

// ─── POST /api/works/[id]/rate ───────────────────────────────────────────────────
// Submit or update a star rating (1–5) for an approved work.
// Cannot rate own work. Recalculates average_rating on student_works.

export async function POST(req: NextRequest, context: RouteContext) {
  try {
    const { id: workId } = await context.params;

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

    // Parse and validate body
    let body: { rating?: unknown };
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const rating = Number(body.rating);
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "rating must be an integer between 1 and 5" },
        { status: 400 }
      );
    }

    // Verify the work exists, is approved, and is not owned by the rater
    const { data: work, error: workErr } = await supabaseAdmin
      .from("student_works")
      .select("id, student_id, status")
      .eq("id", workId)
      .single();

    if (workErr || !work) {
      return NextResponse.json({ error: "Work not found" }, { status: 404 });
    }
    if (work.status !== "approved") {
      return NextResponse.json(
        { error: "Only approved works can be rated" },
        { status: 422 }
      );
    }
    if (work.student_id === user.id) {
      return NextResponse.json(
        { error: "You cannot rate your own work" },
        { status: 403 }
      );
    }

    // Upsert the rating (conflict on work_id + rater_id → update rating)
    const { error: upsertErr } = await supabaseAdmin
      .from("student_work_ratings")
      .upsert(
        { work_id: workId, rater_id: user.id, rating },
        { onConflict: "work_id,rater_id" }
      );

    if (upsertErr) {
      console.error(
        "[POST /api/works/[id]/rate] Upsert error:",
        upsertErr.message
      );
      return NextResponse.json({ error: upsertErr.message }, { status: 500 });
    }

    // Recalculate aggregate rating from all ratings for this work
    const { data: aggregates, error: aggErr } = await supabaseAdmin
      .from("student_work_ratings")
      .select("rating")
      .eq("work_id", workId);

    if (aggErr) {
      console.error(
        "[POST /api/works/[id]/rate] Aggregate query error:",
        aggErr.message
      );
      return NextResponse.json({ error: aggErr.message }, { status: 500 });
    }

    const ratings = (aggregates ?? []).map((r) => r.rating as number);
    const ratingCount = ratings.length;
    const averageRating =
      ratingCount > 0
        ? Math.round(
            (ratings.reduce((sum, r) => sum + r, 0) / ratingCount) * 100
          ) / 100
        : 0;

    // Persist updated aggregates back to student_works
    const { error: updateErr } = await supabaseAdmin
      .from("student_works")
      .update({
        average_rating: averageRating,
        rating_count: ratingCount,
      })
      .eq("id", workId);

    if (updateErr) {
      console.error(
        "[POST /api/works/[id]/rate] Aggregate update error:",
        updateErr.message
      );
      return NextResponse.json({ error: updateErr.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      rating,
      average_rating: averageRating,
      rating_count: ratingCount,
    });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Internal Server Error";
    console.error("[POST /api/works/[id]/rate] Unhandled error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
