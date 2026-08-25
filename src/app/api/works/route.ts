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

// ─── GET /api/works ───────────────────────────────────────────────────────────
// Returns paginated, institute-scoped approved works.
// Query params: category, department, academic_year, sort, search, page

const VALID_CATEGORIES = [
  "book",
  "music",
  "web_game",
  "software",
  "art",
  "film",
  "mobile_app",
  "podcast",
  "research",
  "website",
  "physical_product",
] as const;

const PAGE_SIZE = 20;

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

    // Fetch profile for college gate
    const { data: profile, error: profileErr } = await supabaseAdmin
      .from("profiles")
      .select(
        "institute_id, full_name, department, academic_year, college_linked_status"
      )
      .eq("id", user.id)
      .single();

    if (profileErr || !profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }
    // college_linked_status is TEXT: 'none' | 'pending' | 'linked'
    if (profile.college_linked_status !== "linked" || !profile.institute_id) {
      return NextResponse.json(
        { error: "College verification required to access the Works Hub" },
        { status: 403 }
      );
    }

    // Extract query parameters
    // Next.js Route Handler parameter extraction
    /* await searchParams */
    const searchParams = req.nextUrl.searchParams;
    const category = searchParams.get("category") ?? undefined;
    const department = searchParams.get("department") ?? undefined;
    const academic_year = searchParams.get("academic_year") ?? undefined;
    const sort = searchParams.get("sort") ?? "newest";
    const search = searchParams.get("search") ?? undefined;
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
    const offset = (page - 1) * PAGE_SIZE;

    // Build query — admin client bypasses RLS; institute scope enforced manually
    let query = supabaseAdmin
      .from("student_works")
      .select(
        `
        *,
        profiles!student_works_student_id_fkey(
          full_name,
          department,
          academic_year
        )
        `,
        { count: "exact" }
      )
      .eq("institute_id", profile.institute_id)
      .eq("status", "approved");

    if (
      category &&
      VALID_CATEGORIES.includes(category as (typeof VALID_CATEGORIES)[number])
    ) {
      query = query.eq("category", category);
    }
    if (search) {
      query = query.or(
        `title.ilike.%${search}%,description.ilike.%${search}%`
      );
    }

    // Sort strategy
    switch (sort) {
      case "rated":
        query = query.order("average_rating", { ascending: false });
        break;
      case "views":
        query = query.order("views", { ascending: false });
        break;
      case "alpha":
        query = query.order("title", { ascending: true });
        break;
      case "expiring":
        query = query.order("expires_at", { ascending: true });
        break;
      case "trending":
        // Trending formula computed in memory below
        // Pre-sort by views desc + rating desc for a reasonable first pass
        query = query
          .order("views", { ascending: false })
          .order("average_rating", { ascending: false });
        break;
      case "newest":
      default:
        query = query.order("created_at", { ascending: false });
        break;
    }

    query = query.range(offset, offset + PAGE_SIZE - 1);

    const { data: rawWorks, error: worksErr, count } = await query;

    if (worksErr) {
      console.error("[GET /api/works] DB query error:", worksErr.message);
      return NextResponse.json({ error: worksErr.message }, { status: 500 });
    }

    // Map rows → WorkItem, flattening joined profile data
    let works: WorkItem[] = (rawWorks ?? []).map((row) => {
      type RawRow = typeof row & {
        profiles: {
          full_name: string;
          department: string;
          academic_year: string;
        } | null;
      };
      const r = row as RawRow;
      const { profiles: joinedProfile, ...rest } = r;
      return {
        ...rest,
        student_name: joinedProfile?.full_name ?? undefined,
        student_department: joinedProfile?.department ?? undefined,
        student_year: joinedProfile?.academic_year ?? undefined,
      } as WorkItem;
    });

    // Post-fetch filtering for profile fields (SQL join columns, not DB columns)
    if (department) {
      works = works.filter((w) => w.student_department === department);
    }
    if (academic_year) {
      works = works.filter((w) => w.student_year === academic_year);
    }

    // Trending sort: formula = (views * 0.6 + average_rating * 100 * 0.4) / max(1, daysSinceCreated)
    if (sort === "trending") {
      const now = Date.now();
      works.sort((a, b) => {
        const daysA = Math.max(
          1,
          (now - new Date(a.created_at).getTime()) / (1000 * 60 * 60 * 24)
        );
        const daysB = Math.max(
          1,
          (now - new Date(b.created_at).getTime()) / (1000 * 60 * 60 * 24)
        );
        const scoreA =
          (a.views * 0.6 + a.average_rating * 100 * 0.4) / daysA;
        const scoreB =
          (b.views * 0.6 + b.average_rating * 100 * 0.4) / daysB;
        return scoreB - scoreA;
      });
    }

    return NextResponse.json({
      works,
      total: count ?? works.length,
      page,
    });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Internal Server Error";
    console.error("[GET /api/works] Unhandled error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ─── POST /api/works ──────────────────────────────────────────────────────────
// Submit a new creative work. Enforces 5-work active limit.

export async function POST(req: NextRequest) {
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

    // Profile + college gate
    const { data: profile, error: profileErr } = await supabaseAdmin
      .from("profiles")
      .select(
        "institute_id, full_name, department, academic_year, college_linked_status"
      )
      .eq("id", user.id)
      .single();

    if (profileErr || !profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }
    if (profile.college_linked_status !== "linked" || !profile.institute_id) {
      return NextResponse.json(
        { error: "College verification required to submit works" },
        { status: 403 }
      );
    }

    // Active work count gate (limit = 5)
    const { count: activeCount, error: countErr } = await supabaseAdmin
      .from("student_works")
      .select("id", { count: "exact", head: true })
      .eq("student_id", user.id)
      .neq("status", "rejected")
      .gt("expires_at", new Date().toISOString());

    if (countErr) {
      console.error("[POST /api/works] Count query error:", countErr.message);
      return NextResponse.json({ error: countErr.message }, { status: 500 });
    }
    if ((activeCount ?? 0) >= 5) {
      return NextResponse.json(
        {
          error: "Work limit reached. Delete an existing work to add a new one.",
          limit: 5,
        },
        { status: 429 }
      );
    }

    // Parse and validate body
    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const title = typeof body.title === "string" ? body.title.trim() : "";
    const category =
      typeof body.category === "string" ? body.category.trim() : "";

    if (!title) {
      return NextResponse.json({ error: "title is required" }, { status: 400 });
    }
    if (
      !VALID_CATEGORIES.includes(
        category as (typeof VALID_CATEGORIES)[number]
      )
    ) {
      return NextResponse.json(
        { error: `category must be one of: ${VALID_CATEGORIES.join(", ")}` },
        { status: 400 }
      );
    }

    const description =
      typeof body.description === "string" ? body.description.trim() : null;
    const is_published =
      typeof body.is_published === "boolean" ? body.is_published : true;
    const external_url =
      typeof body.external_url === "string" && body.external_url.trim()
        ? body.external_url.trim()
        : null;
    const is_alias =
      typeof body.is_alias === "boolean" ? body.is_alias : false;
    const tags = Array.isArray(body.tags)
      ? (body.tags as unknown[]).filter(
          (t): t is string => typeof t === "string"
        )
      : null;
    const how_to_use =
      typeof body.how_to_use === "string" ? body.how_to_use.trim() : null;
    const file_path =
      typeof body.file_path === "string" ? body.file_path.trim() : null;
    const embed_url =
      typeof body.embed_url === "string" ? body.embed_url.trim() : null;

    // Determine initial status:
    // - Published & not alias → 'pending' (AI verify triggered in background)
    // - Alias OR unpublished → 'staff_review' (manual verification needed)
    const initialStatus: WorkItem["status"] =
      is_published && !is_alias ? "pending" : "staff_review";

    const { data: newWork, error: insertErr } = await supabaseAdmin
      .from("student_works")
      .insert({
        institute_id: profile.institute_id,
        student_id: user.id,
        title,
        category,
        description,
        is_published,
        external_url,
        file_path,
        is_alias,
        tags,
        how_to_use,
        embed_url,
        status: initialStatus,
        expires_at: new Date(
          Date.now() + 90 * 24 * 60 * 60 * 1000
        ).toISOString(),
      })
      .select()
      .single();

    if (insertErr || !newWork) {
      console.error("[POST /api/works] Insert error:", insertErr?.message);
      return NextResponse.json(
        { error: insertErr?.message ?? "Failed to create work" },
        { status: 500 }
      );
    }

    // Fire AI verification in background (non-blocking) for published, non-alias works
    if (is_published && !is_alias) {
      const baseUrl =
        process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
      // We intentionally do NOT await this — it runs in the background.
      // A 5-second abort controller prevents blocking the response.
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      fetch(`${baseUrl}/api/ai/verify-work`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ work_id: newWork.id }),
        signal: controller.signal,
      })
        .catch((err: unknown) => {
          console.warn(
            "[POST /api/works] Background AI verify trigger failed:",
            err instanceof Error ? err.message : err
          );
        })
        .finally(() => clearTimeout(timeoutId));
    }

    return NextResponse.json(newWork as WorkItem, { status: 201 });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Internal Server Error";
    console.error("[POST /api/works] Unhandled error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
