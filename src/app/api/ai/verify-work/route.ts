import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createAdminClient } from "@/app/lib/supabaseServer";
import { verifyInstitutionalToken, INSTITUTIONAL_COOKIE_NAMES } from "@/app/lib/institutionalAuth";
import { isSafeExternalUrl } from "@/app/lib/sanitize";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface VerifyWorkBody {
  work_id: string;
  url: string;
  claimed_title: string;
  claimed_description: string;
  student_name: string;
  student_enrollment_year: number;
}

interface GeminiVerdict {
  author_match: boolean;
  author_confidence: number;
  description_match: boolean;
  description_confidence: number;
  date_plausible: boolean;
  date_confidence: number;
  overall_confidence: number;
  verdict: "verified" | "uncertain" | "rejected";
  reason: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Auth helper — accepts either a staff session cookie, internal key header, or
// a Bearer token that resolves to a valid Supabase user (server-to-server).
// ─────────────────────────────────────────────────────────────────────────────

async function isAuthorized(req: NextRequest): Promise<boolean> {
  // 1. Internal key (fastest path — server-to-server)
  const internalKey = req.headers.get("x-internal-key");
  if (
    internalKey &&
    process.env.INTERNAL_API_SECRET &&
    internalKey === process.env.INTERNAL_API_SECRET
  ) {
    return true;
  }

  // 2. Staff JWT cookie (coordinator / hod calling manually)
  const staffToken = req.cookies.get(INSTITUTIONAL_COOKIE_NAMES.STAFF)?.value;
  if (staffToken) {
    const payload = await verifyInstitutionalToken(staffToken);
    if (payload && ["hod", "coordinator", "faculty"].includes(payload.role)) {
      return true;
    }
  }

  // 3. Bearer token — resolve via Supabase admin auth
  const authHeader = req.headers.get("Authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const bearer = authHeader.slice(7).trim();
    if (bearer) {
      try {
        const admin = createAdminClient();
        const {
          data: { user },
          error,
        } = await admin.auth.getUser(bearer);
        if (!error && user) return true;
      } catch {
        // fall through to reject
      }
    }
  }

  return false;
}

// ─────────────────────────────────────────────────────────────────────────────
// JSON parse helper — strips markdown code fences Gemini sometimes emits
// ─────────────────────────────────────────────────────────────────────────────

function parseGeminiJson(raw: string): GeminiVerdict {
  const cleaned = raw
    .replace(/^```(?:json)?/gim, "")
    .replace(/```$/gim, "")
    .trim();
  return JSON.parse(cleaned) as GeminiVerdict;
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/ai/verify-work
// ─────────────────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    // ── Auth ────────────────────────────────────────────────────────────────
    const authorized = await isAuthorized(req);
    if (!authorized) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    // ── Parse body ──────────────────────────────────────────────────────────
    const body = (await req.json()) as Partial<VerifyWorkBody>;
    const { work_id } = body;

    if (!work_id) {
      return NextResponse.json(
        { error: "Missing required field: work_id." },
        { status: 400 }
      );
    }

    const admin = createAdminClient();

    let url = body.url;
    let claimed_title = body.claimed_title;
    let claimed_description = body.claimed_description || "";
    let student_name = body.student_name;
    let student_enrollment_year = body.student_enrollment_year || 2024;

    // If details are missing, fetch from database
    if (!url || !claimed_title || !student_name) {
      const { data: dbWork, error: workErr } = await admin
        .from("student_works")
        .select(`
          id,
          title,
          description,
          external_url,
          student_id,
          profiles (
            full_name,
            academic_year
          )
        `)
        .eq("id", work_id)
        .single();

      if (workErr || !dbWork) {
        return NextResponse.json({ error: "Work record not found in database." }, { status: 404 });
      }

      url = url || dbWork.external_url || "";
      claimed_title = claimed_title || dbWork.title || "";
      claimed_description = claimed_description || dbWork.description || "";
      const profileData = (dbWork as Record<string, unknown>).profiles as { full_name?: string; academic_year?: string } | null;
      student_name = student_name || profileData?.full_name || "Student";
      student_enrollment_year = student_enrollment_year || parseInt(profileData?.academic_year || "2024", 10) || 2024;
    }

    if (!url) {
      return NextResponse.json({ error: "No external URL available to verify." }, { status: 400 });
    }

    // SSRF Protection Check
    const ssrfCheck = isSafeExternalUrl(url);
    if (!ssrfCheck.safe) {
      return NextResponse.json({ error: ssrfCheck.error || "Prohibited URL target" }, { status: 400 });
    }

    // ── Check 1: URL validity (HEAD request, 5s timeout) ────────────────────
    let urlAccessible = false;
    try {
      const headRes = await fetch(url, {
        method: "HEAD",
        signal: AbortSignal.timeout(5000),
      });
      // 2xx and 3xx are both acceptable — 3xx usually means redirect which is fine
      urlAccessible = headRes.status >= 200 && headRes.status < 400;
    } catch {
      urlAccessible = false;
    }

    if (!urlAccessible) {
      const hardRejectResult: GeminiVerdict = {
        author_match: false,
        author_confidence: 0,
        description_match: false,
        description_confidence: 0,
        date_plausible: false,
        date_confidence: 0,
        overall_confidence: 0,
        verdict: "rejected",
        reason: "URL is not accessible or returns an error status.",
      };

      await admin
        .from("student_works")
        .update({
          status: "rejected",
          ai_verdict: hardRejectResult,
          rejection_reason: hardRejectResult.reason,
        })
        .eq("id", work_id);

      return NextResponse.json(hardRejectResult);
    }

    // ── Check 2: Page content scrape (GET, 8s timeout, 50k char cap) ────────
    let pageContent = "";
    try {
      const pageRes = await fetch(url, {
        method: "GET",
        signal: AbortSignal.timeout(8000),
      });
      const fullText = await pageRes.text();
      pageContent = fullText.slice(0, 50_000);
    } catch {
      // Non-fatal — AI will work with empty content and likely flag as uncertain
      pageContent = "";
    }

    // ── Check 3: Duplicate link guard ───────────────────────────────────────
    const { data: duplicates } = await admin
      .from("student_works")
      .select("id")
      .eq("external_url", url)
      .neq("id", work_id)
      .neq("status", "rejected");

    if (duplicates && duplicates.length > 0) {
      const dupRejectResult: GeminiVerdict = {
        author_match: false,
        author_confidence: 0,
        description_match: false,
        description_confidence: 0,
        date_plausible: false,
        date_confidence: 0,
        overall_confidence: 0,
        verdict: "rejected",
        reason: "This URL is already claimed by another student.",
      };

      await admin
        .from("student_works")
        .update({
          status: "rejected",
          ai_verdict: dupRejectResult,
          rejection_reason: dupRejectResult.reason,
        })
        .eq("id", work_id);

      return NextResponse.json(dupRejectResult);
    }

    // ── Checks 4 & 5: Gemini 2.5 Flash AI analysis ──────────────────────────
    let aiResult: GeminiVerdict;

    const geminiApiKey = process.env.GEMINI_API_KEY;

    if (!geminiApiKey) {
      // Graceful fallback — route to staff review when AI is unavailable
      aiResult = {
        author_match: true,
        author_confidence: 0.6,
        description_match: true,
        description_confidence: 0.6,
        date_plausible: true,
        date_confidence: 0.6,
        overall_confidence: 0.6,
        verdict: "uncertain",
        reason:
          "AI verification skipped — GEMINI_API_KEY not configured. Work routed to staff review.",
      };
    } else {
      const genAI = new GoogleGenerativeAI(geminiApiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      const prompt = `You are an academic integrity verification AI for a student creative works platform.
A student has submitted a creative work link and claims authorship.

Analyse the page content below and evaluate whether the claim is credible.

--- STUDENT CLAIM ---
Student Name: "${student_name}"
Enrollment Year: ${student_enrollment_year}
Claimed Title: "${claimed_title}"
Claimed Description: "${claimed_description}"

--- PAGE CONTENT (first 8000 characters) ---
${pageContent.slice(0, 8000)}

--- RESPONSE FORMAT ---
Respond ONLY with a valid JSON object matching this exact structure. No explanation text. No markdown fences:
{
  "author_match": <true|false>,
  "author_confidence": <0.0-1.0>,
  "description_match": <true|false>,
  "description_confidence": <0.0-1.0>,
  "date_plausible": <true|false>,
  "date_confidence": <0.0-1.0>,
  "overall_confidence": <0.0-1.0>,
  "verdict": <"verified"|"uncertain"|"rejected">,
  "reason": "<concise 1-2 sentence explanation>"
}

--- GUIDELINES ---
- author_match: Does the page content mention or strongly imply this student's name or identity?
- description_match: Does the page content match the claimed description of the work?
- date_plausible: Is any date information on the page consistent with enrollment year ${student_enrollment_year}?
- overall_confidence: Weighted holistic score. 0.0 = certain fabrication, 1.0 = certain genuine authorship.
- verdict: Set to "verified" if overall_confidence >= 0.8, "uncertain" if >= 0.55, "rejected" if < 0.55.`;

      try {
        const geminiResponse = await model.generateContent(prompt);
        const rawText = geminiResponse.response.text();
        aiResult = parseGeminiJson(rawText);

        // Sanitise all confidence scores to [0, 1]
        const clamp = (n: number) => Math.max(0, Math.min(1, n ?? 0));
        aiResult.author_confidence = clamp(aiResult.author_confidence);
        aiResult.description_confidence = clamp(aiResult.description_confidence);
        aiResult.date_confidence = clamp(aiResult.date_confidence);
        aiResult.overall_confidence = clamp(aiResult.overall_confidence);
      } catch {
        // If Gemini fails or returns unparseable JSON, fall to uncertain
        aiResult = {
          author_match: false,
          author_confidence: 0,
          description_match: false,
          description_confidence: 0,
          date_plausible: false,
          date_confidence: 0,
          overall_confidence: 0.55,
          verdict: "uncertain",
          reason:
            "AI analysis encountered an error during processing. Work has been routed to staff for manual review.",
        };
      }
    }

    // ── Final verdict thresholding (overrides Gemini's own verdict field) ───
    let finalVerdict: "verified" | "uncertain" | "rejected";
    if (aiResult.overall_confidence >= 0.8) {
      finalVerdict = "verified";
    } else if (aiResult.overall_confidence >= 0.55) {
      finalVerdict = "uncertain";
    } else {
      finalVerdict = "rejected";
    }
    aiResult.verdict = finalVerdict;

    // ── DB update based on final verdict ─────────────────────────────────────
    if (finalVerdict === "verified") {
      await admin
        .from("student_works")
        .update({
          status: "approved",
          ai_verdict: aiResult,
          ai_verified_at: new Date().toISOString(),
        })
        .eq("id", work_id);
    } else if (finalVerdict === "uncertain") {
      await admin
        .from("student_works")
        .update({
          status: "staff_review",
          ai_verdict: aiResult,
        })
        .eq("id", work_id);
    } else {
      await admin
        .from("student_works")
        .update({
          status: "rejected",
          ai_verdict: aiResult,
          rejection_reason: aiResult.reason,
        })
        .eq("id", work_id);
    }

    return NextResponse.json(aiResult);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "AI verification failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
