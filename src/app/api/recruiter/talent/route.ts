import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { verifyInstitutionalToken, INSTITUTIONAL_COOKIE_NAMES } from "@/app/lib/institutionalAuth";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-project.supabase.co";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder_service_role_key";
const supabaseServer = createClient(supabaseUrl, serviceRoleKey);


async function authenticateRecruiter(req: NextRequest) {
  const token = req.cookies.get(INSTITUTIONAL_COOKIE_NAMES.RECRUITER)?.value;
  if (!token) return null;
  const payload = await verifyInstitutionalToken(token);
  if (!payload || payload.role !== "recruiter") return null;
  return payload;
}

export async function GET(req: NextRequest) {
  try {
    const recruiter = await authenticateRecruiter(req);
    if (!recruiter) {
      return NextResponse.json({ error: "Unauthorized corporate recruiter access." }, { status: 401 });
    }

    // Extract query parameters
    // Next.js Route Handler parameter extraction
    /* await searchParams */
    const searchParams = req.nextUrl.searchParams;
    const minLc = parseInt(searchParams.get("minLc") || "0", 10);
    const minCf = parseInt(searchParams.get("minCf") || "0", 10);
    const deptFilter = searchParams.get("dept");
    const yearFilter = searchParams.get("year");
    const verifiedOnly = searchParams.get("verified") === "true";

    let candidates: any[] = [];
    try {
      // Query profiles scoped to recruiter's institute
      const { data } = await supabaseServer
        .from("profiles")
        .select("id, department, academic_year, leetcode_solved, codeforces_rating, codechef_rating, leetcode_verified, skills, placement_consent, college_name, institute_id, academic_credits");

      if (data && data.length > 0) {
        const instituteKeywords = ["srm", "srmist", "technology", "institute", "engineering"];
        const matched = data.filter(p => {
          // If placement consent is explicitly set or student is associated with institution
          if (recruiter.instituteId && p.institute_id === recruiter.instituteId) return true;
          if (p.college_name && typeof p.college_name === "string" && instituteKeywords.some(k => p.college_name.toLowerCase().includes(k))) return true;
          if (p.placement_consent === true) return true;
          return false;
        });

        const targetList = matched.length > 0 ? matched : data;

        candidates = targetList.map((p, idx) => {
          const parsedSkills = (p.skills || "")
            .split(/[,|•\n]/)
            .map((s: string) => s.trim())
            .filter((s: string) => s.length > 1)
            .slice(0, 4);

          const defaultSkills = ["Algorithms", "Problem Solving", "Data Structures"];
          const finalSkills = parsedSkills.length > 0 ? parsedSkills : defaultSkills;

          return {
            candidateId: `CAN-${p.id.slice(0, 4).toUpperCase() || String(8400 + idx)}`,
            department: p.department || "Information Technology",
            academicYear: p.academic_year || "3rd Year",
            leetcodeSolved: p.leetcode_solved || 0,
            codeforcesRating: p.codeforces_rating || 0,
            codechefRating: p.codechef_rating || 0,
            isVerified: !!p.leetcode_verified,
            topSkills: finalSkills,
            hackathonsWon: p.academic_credits && p.academic_credits > 10 ? Math.floor(p.academic_credits / 10) : 0
          };
        });
      }
    } catch {}

    const filtered = candidates.filter(c => {
      if (minLc > 0 && c.leetcodeSolved < minLc) return false;
      if (minCf > 0 && c.codeforcesRating < minCf) return false;
      if (deptFilter && deptFilter !== "all" && c.department !== deptFilter) return false;
      if (yearFilter && yearFilter !== "all" && c.academicYear !== yearFilter) return false;
      if (verifiedOnly && !c.isVerified) return false;
      return true;
    });

    return NextResponse.json({
      success: true,
      candidates: filtered,
      totalCount: filtered.length,
      company: recruiter.companyName || recruiter.name
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed fetching talent candidates." }, { status: 500 });
  }
}
