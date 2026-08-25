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

export interface StaffReviewWork {
  id: string;
  student_id: string;
  institute_id: string;
  title: string;
  description: string | null;
  category: string;
  external_url: string;
  thumbnail_url: string | null;
  tags: string[];
  status: string;
  ai_verdict: Record<string, unknown> | null;
  rejection_reason: string | null;
  ai_verified_at: string | null;
  created_at: string;
  updated_at: string;
  // Joined from profiles
  student_name: string | null;
  student_roll_number: string | null;
  student_email: string | null;
  student_department: string | null;
  student_academic_year: string | null;
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
// GET /api/coordinator/works-review
// Returns all student_works with status = 'staff_review' for this institute
// ─────────────────────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  try {
    const staff = await authenticateStaff(req);
    if (!staff) {
      return NextResponse.json(
        { error: "Unauthorized staff access." },
        { status: 401 }
      );
    }

    const admin = createAdminClient();

    // Fetch works pending staff review, scoped to this staff member's institute.
    // We join profiles to surface student identity details for review context.
    const { data: works, error } = await admin
      .from("student_works")
      .select(
        `
        id,
        student_id,
        institute_id,
        title,
        description,
        category,
        external_url,
        thumbnail_url,
        tags,
        status,
        ai_verdict,
        rejection_reason,
        ai_verified_at,
        created_at,
        updated_at,
        profiles (
          full_name,
          roll_number,
          email,
          department,
          academic_year
        )
      `
      )
      .eq("status", "staff_review")
      .eq("institute_id", staff.instituteId)
      .order("created_at", { ascending: true });

    if (error) {
      return NextResponse.json(
        { error: "Failed to fetch review queue: " + error.message },
        { status: 500 }
      );
    }

    // Flatten the nested profile join into the work object for clean client consumption
    type RawWork = typeof works extends (infer T)[] | null ? T : never;
    const shaped: StaffReviewWork[] = (works ?? []).map((w: RawWork) => {
      const profile = (w as Record<string, unknown>).profiles as Record<string, string | null> | null;
      return {
        id: (w as Record<string, unknown>).id as string,
        student_id: (w as Record<string, unknown>).student_id as string,
        institute_id: (w as Record<string, unknown>).institute_id as string,
        title: (w as Record<string, unknown>).title as string,
        description: ((w as Record<string, unknown>).description as string | null) ?? null,
        category: (w as Record<string, unknown>).category as string,
        external_url: (w as Record<string, unknown>).external_url as string,
        thumbnail_url: ((w as Record<string, unknown>).thumbnail_url as string | null) ?? null,
        tags: ((w as Record<string, unknown>).tags as string[]) ?? [],
        status: (w as Record<string, unknown>).status as string,
        ai_verdict: ((w as Record<string, unknown>).ai_verdict as Record<string, unknown> | null) ?? null,
        rejection_reason: ((w as Record<string, unknown>).rejection_reason as string | null) ?? null,
        ai_verified_at: ((w as Record<string, unknown>).ai_verified_at as string | null) ?? null,
        created_at: (w as Record<string, unknown>).created_at as string,
        updated_at: (w as Record<string, unknown>).updated_at as string,
        student_name: profile?.full_name ?? null,
        student_roll_number: profile?.roll_number ?? null,
        student_email: profile?.email ?? null,
        student_department: profile?.department ?? null,
        student_academic_year: profile?.academic_year ?? null,
      };
    });

    return NextResponse.json({
      works: shaped,
      total: shaped.length,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed fetching review queue.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
