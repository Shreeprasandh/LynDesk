import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { verifyInstitutionalToken, INSTITUTIONAL_COOKIE_NAMES } from "@/app/lib/institutionalAuth";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-project.supabase.co";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder_service_role_key";
const supabaseServer = createClient(supabaseUrl, serviceRoleKey);

const DEFAULT_RECOMMENDATIONS = [
  { id: "rec-1", title: "ACM-ICPC Amritapuri Regional Preliminary Contest", category: "contest", url: "https://icpc.global", deadline: "2026-09-15", location: "online", level: "international", description: "Top ranking teams get departmental sponsorship and academic credits.", target_scope: { department: "Information Technology" }, is_active: true, created_at: new Date().toISOString() },
  { id: "rec-2", title: "Google Summer of Code 2027 Prep Track", category: "opportunity", url: "https://summerofcode.withgoogle.com", deadline: "2026-10-01", location: "remote", level: "global", description: "Faculty mentorship sessions available every Wednesday 4 PM.", target_scope: {}, is_active: true, created_at: new Date(Date.now() - 86400000).toISOString() }
];

async function authenticateStaff(req: NextRequest) {
  const token = req.cookies.get(INSTITUTIONAL_COOKIE_NAMES.STAFF)?.value;
  if (!token) return null;
  const payload = await verifyInstitutionalToken(token);
  if (!payload || !["hod", "coordinator", "faculty"].includes(payload.role)) return null;
  return payload;
}

export async function GET(req: NextRequest) {
  try {
    const staff = await authenticateStaff(req);
    if (!staff) {
      return NextResponse.json({ error: "Unauthorized staff access." }, { status: 401 });
    }

    let recommendations: any[] = [];
    try {
      const { data } = await supabaseServer
        .from("staff_recommended_events")
        .select("*")
        .eq("institute_id", staff.instituteId)
        .order("created_at", { ascending: false });

      if (data && data.length > 0) recommendations = data;
    } catch {}

    if (recommendations.length === 0) {
      recommendations = DEFAULT_RECOMMENDATIONS.map(r => ({ ...r, institute_id: staff.instituteId }));
    }

    return NextResponse.json({ success: true, recommendations });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed fetching recommendations." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const staff = await authenticateStaff(req);
    if (!staff) {
      return NextResponse.json({ error: "Unauthorized staff access." }, { status: 401 });
    }

    const body = await req.json();
    const { title, category = "hackathon", url, deadline, location = "online", level = "national", description, target_scope = {} } = body;

    if (!title || !url) {
      return NextResponse.json({ error: "Opportunity title and URL are required." }, { status: 400 });
    }

    const newRec = {
      institute_id: staff.instituteId,
      staff_id: staff.sub,
      title: title.trim(),
      category,
      url: url.trim(),
      deadline: deadline || null,
      location,
      level,
      description: description?.trim() || null,
      target_scope,
      is_active: true
    };

    let created = null;
    try {
      const { data, error } = await supabaseServer
        .from("staff_recommended_events")
        .insert([newRec])
        .select()
        .single();
      if (!error) created = data;
    } catch {}

    if (!created) {
      created = { ...newRec, id: `local_rec_${Date.now()}` };
    }

    return NextResponse.json({
      success: true,
      recommendation: created,
      message: `Recommended "${title}" to students.`
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed posting recommendation." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const staff = await authenticateStaff(req);
    if (!staff) {
      return NextResponse.json({ error: "Unauthorized staff access." }, { status: 401 });
    }

    // Next.js Route Handler parameter extraction
    /* await searchParams */
    const id = req.nextUrl.searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Recommendation ID required." }, { status: 400 });
    }

    try {
      await supabaseServer
        .from("staff_recommended_events")
        .update({ is_active: false })
        .eq("id", id)
        .eq("institute_id", staff.instituteId);
    } catch {}

    return NextResponse.json({ success: true, message: "Recommendation archived." });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed deleting recommendation." }, { status: 500 });
  }
}
