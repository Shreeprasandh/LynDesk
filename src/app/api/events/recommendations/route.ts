import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-project.supabase.co";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder_service_role_key";
const supabaseServer = createClient(supabaseUrl, serviceRoleKey);

const DEFAULT_RECOMMENDATIONS = [
  {
    id: "rec-1",
    title: "ACM-ICPC Amritapuri Regional Preliminary Contest",
    category: "contest",
    url: "https://icpc.global",
    deadline: "2026-09-15",
    location: "online",
    level: "international",
    description: "Top ranking teams get departmental sponsorship and academic credits.",
    faculty_recommended: true
  },
  {
    id: "rec-2",
    title: "Google Summer of Code 2027 Prep Track",
    category: "opportunity",
    url: "https://summerofcode.withgoogle.com",
    deadline: "2026-10-01",
    location: "remote",
    level: "global",
    description: "Faculty mentorship sessions available every Wednesday 4 PM.",
    faculty_recommended: true
  }
];

export async function GET(req: NextRequest) {
  try {
    // Next.js Route Handler parameter extraction
    /* await searchParams */
    const searchParams = req.nextUrl.searchParams;
    const department = searchParams.get("department");

    let recommendations: any[] = [];
    try {
      const query = supabaseServer
        .from("staff_recommended_events")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      const { data } = await query;
      if (data && data.length > 0) {
        recommendations = data.map(item => ({
          ...item,
          faculty_recommended: true
        }));
      }
    } catch {}

    if (recommendations.length === 0) {
      recommendations = DEFAULT_RECOMMENDATIONS;
    }

    if (department && department !== "all") {
      recommendations = recommendations.filter(r => {
        const scope = r.target_scope || {};
        return !scope.department || scope.department === department;
      });
    }

    return NextResponse.json({ success: true, recommendations });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed fetching recommendations." }, { status: 500 });
  }
}
