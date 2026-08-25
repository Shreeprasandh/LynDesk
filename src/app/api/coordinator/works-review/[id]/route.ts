import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/app/lib/supabaseServer";
import {
  verifyInstitutionalToken,
  INSTITUTIONAL_COOKIE_NAMES,
  InstitutionalSessionPayload,
} from "@/app/lib/institutionalAuth";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface ReviewDecisionBody {
  decision: "approved" | "rejected";
  review_note?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Auth helper — mirrors the pattern used across all coordinator routes
// ─────────────────────────────────────────────────────────────────────────────

async function authenticateStaff(
  req: NextRequest
): Promise<InstitutionalSessionPayload | null> {
  const token = req.cookies.get(INSTITUTIONAL_COOKIE_NAMES.STAFF)?.value;
  if (!token) return null;
  const payload = await verifyInstitutionalToken(token);
  if (!payload || !["hod", "coordinator", "faculty"].includes(payload.role))
    return null;
  return payload;
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/coordinator/works-review/[id]
// Approve or reject a student work that is pending staff review
// ─────────────────────────────────────────────────────────────────────────────

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // ── Auth ───────────────────────────────────────────────────────────────
    const staff = await authenticateStaff(req);
    if (!staff) {
      return NextResponse.json(
        { error: "Unauthorized staff access." },
        { status: 401 }
      );
    }

    // ── Resolve async params (Next.js 15+) ──────────────────────────────────
    const { id: work_id } = await params;

    if (!work_id) {
      return NextResponse.json(
        { error: "Work ID is required." },
        { status: 400 }
      );
    }

    // ── Parse and validate body ─────────────────────────────────────────
    const body: ReviewDecisionBody = await req.json();
    const { decision, review_note } = body;

    if (!decision || !["approved", "rejected"].includes(decision)) {
      return NextResponse.json(
        { error: "Invalid decision. Must be 'approved' or 'rejected'." },
        { status: 400 }
      );
    }

    const admin = createAdminClient();

    // ── Fetch the work to verify it belongs to this institute ──────────────
    const { data: work, error: fetchError } = await admin
      .from("student_works")
      .select("id, student_id, title, institute_id, status")
      .eq("id", work_id)
      .eq("institute_id", staff.instituteId)
      .single();

    if (fetchError || !work) {
      return NextResponse.json(
        { error: "Work not found or not accessible to this staff member." },
        { status: 404 }
      );
    }

    if (work.status !== "staff_review") {
      return NextResponse.json(
        { error: `Work is not pending staff review. Current status: ${work.status}.` },
        { status: 409 }
      );
    }

    // ── Insert staff review audit record ─────────────────────────────────
    const { error: reviewInsertError } = await admin
      .from("student_work_staff_reviews")
      .insert({
        work_id,
        staff_id: staff.sub,
        staff_name: staff.name,
        decision,
        review_note: review_note ?? null,
        reviewed_at: new Date().toISOString(),
      });

    // Log but do not abort if review audit fails — the status update is the critical path
    if (reviewInsertError) {
      // Non-fatal: table may not exist yet in current migration set
      // The decision is still applied and the student is notified
    }

    // ── Update student_works status ────────────────────────────────────
    const workUpdate: Record<string, unknown> = {
      status: decision,
      updated_at: new Date().toISOString(),
    };

    if (decision === "approved") {
      workUpdate.ai_verified_at = new Date().toISOString();
    } else {
      workUpdate.rejection_reason = review_note ?? "Rejected by staff reviewer.";
    }

    const { error: updateError } = await admin
      .from("student_works")
      .update(workUpdate)
      .eq("id", work_id)
      .eq("institute_id", staff.instituteId);

    if (updateError) {
      return NextResponse.json(
        { error: "Failed to update work status: " + updateError.message },
        { status: 500 }
      );
    }

    // ── Notify the student ─────────────────────────────────────────────
    const notificationPayload =
      decision === "approved"
        ? {
            user_id: work.student_id,
            type: "work_approved",
            title: "Work Approved — Live on Works Hub",
            content: `Your work "${work.title}" has been approved and is now live on the Works Hub!`,
            link_url: "/works",
            category: "institution",
            is_read: false,
            created_at: new Date().toISOString(),
          }
        : {
            user_id: work.student_id,
            type: "work_rejected",
            title: "Work Not Approved",
            content: `Your work "${work.title}" was not approved. Reason: ${
              review_note ?? "No reason provided."
            }`,
            link_url: "/works",
            category: "institution",
            is_read: false,
            created_at: new Date().toISOString(),
          };

    // Non-fatal — notification failure should not roll back the decision
    await admin.from("notifications").insert(notificationPayload).then(() => {});

    return NextResponse.json({
      success: true,
      decision,
      work_id,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed processing staff review decision.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
