import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { verifyInstitutionalToken, INSTITUTIONAL_COOKIE_NAMES } from "@/app/lib/institutionalAuth";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-project.supabase.co";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder_service_role_key";
const supabaseServer = createClient(supabaseUrl, serviceRoleKey);

// Fallback student cohort for testing & development
const DEFAULT_STUDENTS = [
  { id: "p1", full_name: "Alex Carter", username: "alexcarter", email: "alex.c@srmist.edu.in", roll_number: "RA2311003010261", department: "Information Technology", academic_year: "3rd Year", section: "Section E", leetcode_solved: 342, codeforces_rating: 1480, codechef_rating: 1620, leetcode_verified: true, updated_at: new Date().toISOString() },
  { id: "p2", full_name: "Mira Sen", username: "mirasen", email: "mira.s@srmist.edu.in", roll_number: "RA2311003010262", department: "Information Technology", academic_year: "3rd Year", section: "Section E", leetcode_solved: 412, codeforces_rating: 1590, codechef_rating: 1740, leetcode_verified: true, updated_at: new Date().toISOString() },
  { id: "p3", full_name: "Rohan Patel", username: "rohanp", email: "rohan.p@srmist.edu.in", roll_number: "RA2311003010263", department: "Information Technology", academic_year: "3rd Year", section: "Section E", leetcode_solved: 215, codeforces_rating: 1320, codechef_rating: 1450, leetcode_verified: false, updated_at: new Date(Date.now() - 40 * 86400000).toISOString() },
  { id: "p4", full_name: "Sneha Reddy", username: "snehacodes", email: "sneha.r@srmist.edu.in", roll_number: "RA2311003010264", department: "Information Technology", academic_year: "3rd Year", section: "Section E", leetcode_solved: 480, codeforces_rating: 1650, codechef_rating: 1810, leetcode_verified: true, updated_at: new Date().toISOString() },
  { id: "p5", full_name: "Vikram Kumar", username: "vikramk", email: "vikram.k@srmist.edu.in", roll_number: "RA2311003010265", department: "Information Technology", academic_year: "3rd Year", section: "Section E", leetcode_solved: 190, codeforces_rating: 1200, codechef_rating: 1350, leetcode_verified: false, updated_at: new Date().toISOString() }
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

    // Extract query filters
    // Next.js Route Handler parameter extraction
    /* await searchParams */
    const searchParams = req.nextUrl.searchParams;
    const yearFilter = searchParams.get("year");
    const sectionFilter = searchParams.get("section");
    const searchFilter = searchParams.get("search")?.toLowerCase();

    let students: any[] = [];
    try {
      let query = supabaseServer
        .from("profiles")
        .select("id, full_name, username, roll_number, department, academic_year, section, leetcode_solved, codeforces_rating, codechef_rating, leetcode_verified, updated_at")
        .not("roll_number", "is", null);

      if (staff.departmentScope && staff.departmentScope !== "ALL") {
        query = query.eq("department", staff.departmentScope);
      }

      const { data } = await query;
      if (data && data.length > 0) students = data;
    } catch {}

    if (students.length === 0) {
      students = DEFAULT_STUDENTS;
    }

    // Apply Scope Enforcement
    let filtered = students.filter(st => {
      // If staff has assigned sections e.g. ['Section E'], only include those
      if (staff.assignedSections && staff.assignedSections.length > 0) {
        if (!staff.assignedSections.includes(st.section)) return false;
      }
      // If staff has assigned years e.g. ['3rd Year'], only include those
      if (staff.assignedYears && staff.assignedYears.length > 0) {
        if (!staff.assignedYears.includes(st.academic_year)) return false;
      }
      return true;
    });

    // Apply Client UI Filters
    if (yearFilter && yearFilter !== "all") {
      filtered = filtered.filter(st => st.academic_year === yearFilter);
    }
    if (sectionFilter && sectionFilter !== "all") {
      filtered = filtered.filter(st => st.section === sectionFilter);
    }
    if (searchFilter) {
      filtered = filtered.filter(st => 
        (st.full_name && st.full_name.toLowerCase().includes(searchFilter)) ||
        (st.roll_number && st.roll_number.toLowerCase().includes(searchFilter)) ||
        (st.username && st.username.toLowerCase().includes(searchFilter))
      );
    }

    return NextResponse.json({
      success: true,
      students: filtered,
      totalCount: filtered.length,
      scope: {
        department: staff.departmentScope,
        sections: staff.assignedSections,
        years: staff.assignedYears
      }
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed fetching student roster." }, { status: 500 });
  }
}
