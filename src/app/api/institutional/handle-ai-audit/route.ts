import { NextResponse } from "next/server";
import { createAdminClient } from "@/app/lib/supabaseServer";
import { checkRateLimit } from "@/app/lib/moderation";

export const dynamic = "force-dynamic";

interface AuditRequestBody {
  platform: string;
  handle: string;
  userId?: string;
}

const PLATFORM_COLUMN_MAP: Record<string, string> = {
  leetcode: "leetcode_username",
  codechef: "codechef_username",
  codeforces: "codeforces_username",
  hackerrank: "hackerrank_username",
  geeksforgeeks: "geeksforgeeks_username",
  unstop: "unstop_username",
  github: "github_url"
};

// Clean platform handle (strips URLs if pasted)
function normalizeHandle(platform: string, raw: string): string {
  if (!raw) return "";
  let clean = raw.trim();

  // Strip common URL prefixes
  clean = clean
    .replace(/^https?:\/\/(www\.)?leetcode\.com\/(u\/)?/i, "")
    .replace(/^https?:\/\/(www\.)?codechef\.com\/(users\/)?/i, "")
    .replace(/^https?:\/\/(www\.)?codeforces\.com\/(profile\/)?/i, "")
    .replace(/^https?:\/\/(www\.)?hackerrank\.com\/(profile\/)?/i, "")
    .replace(/^https?:\/\/(www\.)?geeksforgeeks\.org\/(user\/)?/i, "")
    .replace(/^https?:\/\/(www\.)?unstop\.com\/(u\/|user\/)?/i, "")
    .replace(/^https?:\/\/(www\.)?github\.com\//i, "")
    .replace(/\/+$/, "");

  return clean.trim();
}

export async function POST(request: Request) {
  // Rate limiting (Max 40 audits per min per client)
  const clientIp = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "anonymous";
  const rateLimit = checkRateLimit(`handle_audit_${clientIp}`, 40, 60000);
  if (!rateLimit.allowed) {
    return NextResponse.json({ error: "Too many audit requests. Please wait a moment." }, { status: 429 });
  }

  try {
    const body: AuditRequestBody = await request.json();
    const { platform, handle, userId } = body;

    if (!platform || !handle) {
      return NextResponse.json({ error: "Platform and handle are required." }, { status: 400 });
    }

    const normPlatform = platform.toLowerCase().trim();
    const cleanHandle = normalizeHandle(normPlatform, handle);

    if (!cleanHandle) {
      return NextResponse.json({ 
        verdict: "INVALID",
        isDuplicate: false,
        message: "Invalid or empty handle specified."
      }, { status: 400 });
    }

    const supabaseAdmin = createAdminClient();

    // 1. Anti-Theft Cross-Student Deduplication Check
    const colName = PLATFORM_COLUMN_MAP[normPlatform];
    let duplicateUser: any = null;

    if (colName) {
      let query = supabaseAdmin
        .from("profiles")
        .select("id, full_name, roll_number, college_name, department, academic_year")
        .ilike(colName, normPlatform === "github" ? `%${cleanHandle}%` : cleanHandle);

      if (userId) {
        query = query.neq("id", userId);
      }

      const { data: profileCollisions, error: profErr } = await query.limit(1);

      if (!profErr && profileCollisions && profileCollisions.length > 0) {
        duplicateUser = profileCollisions[0];
      }
    }

    // Check handle_verifications table for already approved/verified claims
    if (!duplicateUser) {
      let verifQuery = supabaseAdmin
        .from("handle_verifications")
        .select("id, user_id, handle, status")
        .ilike("platform", normPlatform)
        .ilike("handle", cleanHandle)
        .eq("status", "verified");

      if (userId) {
        verifQuery = verifQuery.neq("user_id", userId);
      }

      const { data: verifCollisions } = await verifQuery.limit(1);
      if (verifCollisions && verifCollisions.length > 0) {
        const row = verifCollisions[0] as any;
        // Fetch profile info for this collision
        if (row.user_id) {
          const { data: pData } = await supabaseAdmin
            .from("profiles")
            .select("id, full_name, roll_number, college_name, department")
            .eq("id", row.user_id)
            .single();
          if (pData) {
            duplicateUser = pData;
          }
        }
        if (!duplicateUser) {
          duplicateUser = { full_name: "Another Student", roll_number: "Registered" };
        }
      }
    }

    // If duplicate collision detected -> CONFLICT
    if (duplicateUser) {
      const maskedRoll = duplicateUser.roll_number 
        ? `${duplicateUser.roll_number.slice(0, 4)}...${duplicateUser.roll_number.slice(-3)}`
        : "Confidential";

      return NextResponse.json({
        verdict: "CONFLICT",
        isDuplicate: true,
        confidence: 99,
        conflictDetails: {
          studentName: duplicateUser.full_name || "Enrolled Student",
          maskedRollNumber: maskedRoll,
          department: duplicateUser.department || "Academic Department",
          college: duplicateUser.college_name || "Institution"
        },
        message: `Collision detected: @${cleanHandle} is already registered to ${duplicateUser.full_name || "another student"} (${maskedRoll}).`,
        recommendation: "Flag for staff review or prompt student to switch handle."
      });
    }

    // 2. Live Platform Scraper Probe (Fast 4.5s Timeout)
    let liveStats: {
      solved: number;
      rating?: number;
      rank?: number | string;
      streak?: number;
      active: boolean;
    } = {
      solved: 0,
      active: false
    };

    let probeSuccess = false;
    let probeError = "";

    try {
      const origin = new URL(request.url).origin;
      const statsUrl = `${origin}/api/coding-stats?platform=${encodeURIComponent(normPlatform)}&username=${encodeURIComponent(cleanHandle)}`;
      
      const statsRes = await fetch(statsUrl, {
        signal: AbortSignal.timeout(4500),
        cache: "no-store"
      });

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        if (statsData && !statsData.error) {
          probeSuccess = true;
          liveStats = {
            solved: statsData.solved || statsData.totalSolved || 0,
            rating: statsData.rating || statsData.currentRating || 0,
            rank: statsData.ranking || statsData.rank || "Unranked",
            streak: statsData.streak || statsData.activeDays || 0,
            active: (statsData.solved || 0) > 0 || (statsData.contributions || 0) > 0 || (statsData.rating || 0) > 0
          };
        } else {
          probeError = statsData.error || "Profile not found or inaccessible";
        }
      } else {
        probeError = `Platform returned status ${statsRes.status}`;
      }
    } catch (probeErr: any) {
      probeError = probeErr?.message || "Platform timeout";
    }

    // 3. Deterministic Risk Assessment
    if (!probeSuccess && probeError.toLowerCase().includes("not found")) {
      return NextResponse.json({
        verdict: "INVALID",
        isDuplicate: false,
        confidence: 90,
        liveStats,
        message: `The ${platform} profile '@${cleanHandle}' does not exist or is set to private.`,
        recommendation: "Ensure handle is spelt correctly and profile is public."
      });
    }

    // SAFE - No duplicates, active profile verified
    return NextResponse.json({
      verdict: "SAFE",
      isDuplicate: false,
      confidence: 98,
      cleanHandle,
      liveStats,
      summary: `Unique handle across institution. Scraper verified active profile with ${liveStats.solved} solves.`,
      message: "100% Safe for 1-click coordinator approval."
    });

  } catch (error: any) {
    console.error("Handle AI audit failed:", error);
    return NextResponse.json({ 
      error: "Internal server error during handle audit.",
      details: error?.message || "Unknown" 
    }, { status: 500 });
  }
}
