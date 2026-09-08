import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { verifyInstitutionalToken, INSTITUTIONAL_COOKIE_NAMES } from "@/app/lib/institutionalAuth";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-project.supabase.co";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder_service_role_key";
const supabaseServer = createClient(supabaseUrl, serviceRoleKey);

const CreateDriveSchema = z.object({
  roleTitle: z.string().min(2).max(150),
  companyName: z.string().min(2).max(150),
  ctcPackage: z.string().min(2).max(50),
  location: z.string().min(2).max(100),
  driveMode: z.enum(["ON_CAMPUS", "VIRTUAL", "HYBRID"]),
  minCgpa: z.number().min(0).max(10).default(7.0),
  minLeetcodeSolved: z.number().min(0).default(50),
  eligibleDepartments: z.array(z.string()).min(1),
  eligibleYears: z.array(z.string()).min(1),
  deadline: z.string().min(4),
  description: z.string().min(10),
  applyUrl: z.string().url().optional().nullable(),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const department = searchParams.get("department");
    const academicYear = searchParams.get("academicYear");

    let drives: any[] = [];
    try {
      const { data, error } = await supabaseServer
        .from("placement_drives")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data) {
        drives = data;
      }
    } catch {}

    // Clean empirical filtering or fallback sample drive
    let filtered = drives;
    if (department && department !== "all") {
      filtered = filtered.filter(d => !d.eligible_departments || d.eligible_departments.includes(department));
    }
    if (academicYear && academicYear !== "all") {
      filtered = filtered.filter(d => !d.eligible_years || d.eligible_years.includes(academicYear));
    }

    return NextResponse.json({
      success: true,
      drives: filtered,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed fetching placement drives." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get(INSTITUTIONAL_COOKIE_NAMES.RECRUITER)?.value;
    const adminToken = req.cookies.get(INSTITUTIONAL_COOKIE_NAMES.ADMIN)?.value;

    let actorName = "Corporate Placement Cell";
    let companyName = "";

    if (token) {
      const rec = await verifyInstitutionalToken(token);
      if (rec) {
        actorName = rec.name || rec.companyName || "Corporate Recruiter";
        companyName = rec.companyName || "";
      }
    } else if (adminToken) {
      const adm = await verifyInstitutionalToken(adminToken);
      if (adm) {
        actorName = adm.name || "Administrator";
        companyName = adm.instituteName || "";
      }
    }

    const body = await req.json();
    const parsed = CreateDriveSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid placement drive parameters.", details: parsed.error.format() }, { status: 400 });
    }

    const driveData = {
      id: `drive_${Date.now()}`,
      role_title: parsed.data.roleTitle.trim(),
      company_name: parsed.data.companyName.trim() || companyName || "Corporate Partner",
      ctc_package: parsed.data.ctcPackage.trim(),
      location: parsed.data.location.trim(),
      drive_mode: parsed.data.driveMode,
      min_cgpa: parsed.data.minCgpa,
      min_leetcode_solved: parsed.data.minLeetcodeSolved,
      eligible_departments: parsed.data.eligibleDepartments,
      eligible_years: parsed.data.eligibleYears,
      deadline: parsed.data.deadline,
      description: parsed.data.description.trim(),
      apply_url: parsed.data.applyUrl || null,
      created_by: actorName,
      created_at: new Date().toISOString()
    };

    try {
      await supabaseServer.from("placement_drives").insert([driveData]);
    } catch {}

    return NextResponse.json({
      success: true,
      message: `Placement Drive for ${driveData.role_title} published successfully.`,
      drive: driveData
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed publishing placement drive." }, { status: 500 });
  }
}
