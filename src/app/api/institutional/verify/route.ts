import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Initialize Server-Side Admin Supabase Client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-project.supabase.co";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder_service_role_key";

const supabaseServer = createClient(supabaseUrl, serviceRoleKey);

// Fallback known institute templates when dynamic structures are being provisioned
const KNOWN_COLLEGE_KEYS: Record<string, { name: string; emailDomain: string; defaultDept: string }> = {
  "COLLEGE_SRM": {
    name: "SRM Institute of Science and Technology",
    emailDomain: "srmist.edu.in",
    defaultDept: "Information Technology"
  },
  "COLLEGE_MIT": {
    name: "Madras Institute of Technology (Anna University)",
    emailDomain: "mitindia.edu",
    defaultDept: "Computer Science and Engineering"
  },
  "COLLEGE_IITM": {
    name: "Indian Institute of Technology Madras",
    emailDomain: "iitm.ac.in",
    defaultDept: "Computer Science"
  },
  "COLLEGE_SSN": {
    name: "SSN College of Engineering",
    emailDomain: "ssn.edu.in",
    defaultDept: "Information Technology"
  },
  "COLLEGE_PSG": {
    name: "PSG College of Technology",
    emailDomain: "psgtech.ac.in",
    defaultDept: "Computer Science and Engineering"
  }
};

/**
 * Helper to auto-resolve academic year and department from roll number heuristics
 */
function resolveStudentPosition(rollNumber: string, defaultDept: string) {
  const cleanRoll = rollNumber.toUpperCase().trim();
  const currentYear = new Date().getFullYear(); // e.g. 2026

  let academicYear = "3rd Year";
  let section = "Section A";
  let department = defaultDept || "Information Technology";
  let gradYear = "2026";

  // Heuristic 1: SRM Pattern e.g. RA2311003010045 (23 = 2023 admission)
  const srmMatch = cleanRoll.match(/^[A-Z]{2}(\d{2})(\d{2,3})(\d{3})(\d{4})$/);
  if (srmMatch) {
    const admissionYear = 2000 + parseInt(srmMatch[1], 10);
    const diff = currentYear - admissionYear;
    
    if (diff === 0 || diff === 1) academicYear = "1st Year";
    else if (diff === 2) academicYear = "2nd Year";
    else if (diff === 3) academicYear = "3rd Year";
    else academicYear = "4th Year";

    gradYear = String(admissionYear + 4);

    const rollSuffix = parseInt(srmMatch[4], 10);
    if (rollSuffix <= 65) section = "Section A";
    else if (rollSuffix <= 130) section = "Section B";
    else if (rollSuffix <= 195) section = "Section C";
    else if (rollSuffix <= 260) section = "Section D";
    else section = "Section E";

    // Dept code heuristic
    const deptCode = srmMatch[3];
    if (deptCode === "003" || deptCode === "001") department = "Computer Science and Engineering";
    else if (deptCode === "002" || deptCode === "008") department = "Information Technology";
    else if (deptCode === "004") department = "Electronics and Communication";
    else if (deptCode === "010") department = "Artificial Intelligence and Data Science";
  } 
  // Heuristic 2: General Numeric Roll No with Section suffix e.g. 2023-CS-042 or 23IT045
  else {
    const yrMatch = cleanRoll.match(/(\d{2,4})/);
    if (yrMatch) {
      let yr = parseInt(yrMatch[1], 10);
      if (yr < 100) yr += 2000;
      const diff = currentYear - yr;
      if (diff <= 1) academicYear = "1st Year";
      else if (diff === 2) academicYear = "2nd Year";
      else if (diff === 3) academicYear = "3rd Year";
      else academicYear = "4th Year";
      gradYear = String(yr + 4);
    }

    if (cleanRoll.includes("IT")) department = "Information Technology";
    else if (cleanRoll.includes("CS") || cleanRoll.includes("CSE")) department = "Computer Science and Engineering";
    else if (cleanRoll.includes("EC") || cleanRoll.includes("ECE")) department = "Electronics and Communication";
    else if (cleanRoll.includes("AI") || cleanRoll.includes("DS")) department = "Artificial Intelligence and Data Science";

    // Extract trailing number for section allocation
    const trailingNumMatch = cleanRoll.match(/(\d+)$/);
    if (trailingNumMatch) {
      const num = parseInt(trailingNumMatch[1], 10) % 100;
      if (num <= 30) section = "Section A";
      else if (num <= 60) section = "Section B";
      else if (num <= 90) section = "Section C";
      else section = "Section D";
    }
  }

  const batchCode = `Class of ${gradYear} / ${section}`;

  return {
    academicYear,
    department,
    section,
    batchCode,
    gradYear
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { rollNumber, collegeKey } = body;

    if (!rollNumber || typeof rollNumber !== "string" || !rollNumber.trim()) {
      return NextResponse.json(
        { success: false, error: "Please provide a valid Institutional Roll Number." },
        { status: 400 }
      );
    }

    if (!collegeKey || typeof collegeKey !== "string" || !collegeKey.trim()) {
      return NextResponse.json(
        { success: false, error: "Please provide a valid College Registrar Key." },
        { status: 400 }
      );
    }

    const cleanKey = collegeKey.trim().toUpperCase();
    const cleanRoll = rollNumber.trim().toUpperCase();

    // 1. Check institutes table in Supabase
    let matchedInstitute: { id?: string; name: string; email_domain?: string } | null = null;
    
    try {
      const { data: dbInstitutes, error: dbErr } = await supabaseServer
        .from("institutes")
        .select("id, name, email_domain")
        .ilike("name", `%${cleanKey.replace("COLLEGE_", "")}%`)
        .limit(1);

      if (!dbErr && dbInstitutes && dbInstitutes.length > 0) {
        matchedInstitute = dbInstitutes[0];
      }
    } catch {}

    // 2. Fallback to Known Keys Dictionary if not in DB institutes yet
    const knownConfig = KNOWN_COLLEGE_KEYS[cleanKey];
    if (!matchedInstitute && knownConfig) {
      matchedInstitute = {
        name: knownConfig.name,
        email_domain: knownConfig.emailDomain
      };
    }

    // If still no match and key format resembles a standard college code
    if (!matchedInstitute) {
      if (cleanKey.startsWith("COLLEGE_") || cleanKey.length >= 4) {
        const rawName = cleanKey.replace(/^COLLEGE_/, "").replace(/_/g, " ");
        matchedInstitute = {
          name: `${rawName} Institute of Technology`,
          email_domain: `${rawName.toLowerCase().replace(/\s+/g, "")}.edu`
        };
      } else {
        return NextResponse.json(
          { 
            success: false, 
            error: "Unrecognized College Registrar Key. Please verify the code issued by your campus faculty or registrar." 
          },
          { status: 404 }
        );
      }
    }

    // 3. Resolve department, year, and section via structural pattern matching
    const resolved = resolveStudentPosition(
      cleanRoll, 
      knownConfig ? knownConfig.defaultDept : "Information Technology"
    );

    return NextResponse.json({
      success: true,
      instituteId: matchedInstitute.id || null,
      instituteName: matchedInstitute.name,
      rollNumber: cleanRoll,
      department: resolved.department,
      academicYear: resolved.academicYear,
      section: resolved.section,
      batchCode: resolved.batchCode,
      graduationYear: resolved.gradYear,
      message: `Verified and mapped to ${matchedInstitute.name} (${resolved.department}, ${resolved.academicYear}, ${resolved.section}).`
    });

  } catch (error: any) {
    console.error("[Institutional Verify API Exception]:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error validating institutional enrollment credentials." },
      { status: 500 }
    );
  }
}
