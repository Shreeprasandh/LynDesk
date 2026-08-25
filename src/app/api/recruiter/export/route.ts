import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { verifyInstitutionalToken, hashClientIp, INSTITUTIONAL_COOKIE_NAMES } from "@/app/lib/institutionalAuth";

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

export async function POST(req: NextRequest) {
  try {
    const recruiter = await authenticateRecruiter(req);
    if (!recruiter) {
      return NextResponse.json({ error: "Unauthorized corporate recruiter access." }, { status: 401 });
    }

    const body = await req.json();
    const { candidates = [] } = body;
    const ipHash = await hashClientIp(req);

    // Audit Log the candidate benchmark export
    try {
      await supabaseServer.from("institutional_audit_logs").insert([
        {
          institute_id: recruiter.instituteId,
          actor_type: "recruiter",
          actor_id: recruiter.sub,
          actor_name: recruiter.companyName || recruiter.name,
          action_type: "EXPORT_PDF",
          description: `Recruiter exported candidate placement benchmarks for ${candidates.length} candidate(s)`,
          ip_hash: ipHash,
          metadata: { company: recruiter.companyName, count: candidates.length }
        }
      ]);
    } catch {}

    const headers = [
      "Candidate ID",
      "Department",
      "Academic Year",
      "LeetCode Solved",
      "Codeforces Rating",
      "CodeChef Rating",
      "Verification Status",
      "Top Skills"
    ];

    const rows = candidates.map((c: any) => [
      `"${c.candidateId || ""}"`,
      `"${c.department || ""}"`,
      `"${c.academicYear || ""}"`,
      c.leetcodeSolved || 0,
      c.codeforcesRating || 0,
      c.codechefRating || 0,
      `"${c.isVerified ? "Platform Verified" : "Self-Reported"}"`,
      `"${(c.topSkills || []).join("; ")}"`
    ]);

    const csvContent = [headers.join(","), ...rows.map((r: any[]) => r.join(","))].join("\n");

    return NextResponse.json({
      success: true,
      csv: csvContent,
      fileName: `Lyndesk_${(recruiter.companyName || "Company").replace(/\s+/g, "_")}_Talent_Report_${new Date().toISOString().split("T")[0]}.csv`,
      exportedCount: candidates.length
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed exporting candidate report." }, { status: 500 });
  }
}
