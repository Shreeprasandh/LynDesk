import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/app/lib/supabaseServer";

type RouteContext = { params: Promise<{ id: string }> };

// ─── POST /api/works/[id]/renew ──────────────────────────────────────────────────
// Renews own approved work by extending expires_at by 90 more days.
// Requires: auth, own work, status = 'approved'.

export async function POST(req: NextRequest, context: RouteContext) {
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

    // Fetch the work to verify ownership and status
    const { data: work, error: workErr } = await supabaseAdmin
      .from("student_works")
      .select("id, student_id, status, expires_at")
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
    if (work.status !== "approved") {
      return NextResponse.json(
        { error: "Only approved works can be renewed" },
        { status: 422 }
      );
    }

    const newExpiresAt = new Date(
      Date.now() + 90 * 24 * 60 * 60 * 1000
    ).toISOString();
    const renewedAt = new Date().toISOString();

    const { data: updated, error: updateErr } = await supabaseAdmin
      .from("student_works")
      .update({ expires_at: newExpiresAt, renewed_at: renewedAt })
      .eq("id", id)
      .select()
      .single();

    if (updateErr || !updated) {
      console.error(
        "[POST /api/works/[id]/renew] Update error:",
        updateErr?.message
      );
      return NextResponse.json(
        { error: updateErr?.message ?? "Failed to renew work" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      work: updated,
      expires_at: newExpiresAt,
    });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Internal Server Error";
    console.error("[POST /api/works/[id]/renew] Unhandled error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
