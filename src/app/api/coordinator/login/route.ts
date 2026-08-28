import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { signInstitutionalToken, hashClientIp, INSTITUTIONAL_COOKIE_NAMES } from "@/app/lib/institutionalAuth";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-project.supabase.co";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder_service_role_key";
const supabaseServer = createClient(supabaseUrl, serviceRoleKey);

// Default provisioned staff accounts for development/testing
const DEFAULT_DEV_STAFF = [
  {
    id: "00000000-0000-0000-0000-000000000002",
    email: "coordinator.it@srmist.edu.in",
    passkey: "COORD_SEC_E",
    name: "Prof. R. Venkatesh",
    role: "coordinator" as const,
    department_scope: "Information Technology",
    assigned_sections: ["Section E"],
    assigned_years: ["3rd Year"],
    institute_id: "00000000-0000-0000-0000-000000000001",
    institute_name: "SRM Institute of Science and Technology"
  },
  {
    id: "00000000-0000-0000-0000-000000000003",
    email: "hod.it@srmist.edu.in",
    passkey: "HOD_IT_2026",
    name: "Dr. S. Malathi",
    role: "hod" as const,
    department_scope: "Information Technology",
    assigned_sections: [],
    assigned_years: ["1st Year", "2nd Year", "3rd Year", "4th Year"],
    institute_id: "00000000-0000-0000-0000-000000000001",
    institute_name: "SRM Institute of Science and Technology"
  }
];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, passkey } = body;

    if (!email || !passkey) {
      return NextResponse.json(
        { success: false, error: "Please enter both institutional staff email and passkey." },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanKey = passkey.trim();
    const ipHash = await hashClientIp(req);

    let authenticatedStaff: any = null;

    // 1. Check staff_accounts in Supabase
    try {
      const { data: dbStaff, error } = await supabaseServer
        .from("staff_accounts")
        .select("id, email, passkey_hash, name, role, department_scope, assigned_sections, assigned_years, institute_id, is_active, institutes(id, name)")
        .eq("email", cleanEmail)
        .single();

      if (!error && dbStaff && dbStaff.is_active) {
        const enc = new TextEncoder();
        const hashBuf = await crypto.subtle.digest("SHA-256", enc.encode(cleanKey));
        const computedHash = Array.from(new Uint8Array(hashBuf)).map(b => b.toString(16).padStart(2, "0")).join("");

        if (dbStaff.passkey_hash === computedHash || dbStaff.passkey_hash === cleanKey) {
          const inst = (dbStaff as any).institutes;
          authenticatedStaff = {
            id: dbStaff.id,
            email: dbStaff.email,
            name: dbStaff.name,
            role: dbStaff.role,
            departmentScope: dbStaff.department_scope,
            assignedSections: dbStaff.assigned_sections || [],
            assignedYears: dbStaff.assigned_years || [],
            instituteId: dbStaff.institute_id,
            instituteName: inst?.name || "Academic Department"
          };
        }
      }
    } catch {}

    // 2. Check default dev staff fallback (in dev mode or when explicitly enabled)
    if (!authenticatedStaff) {
      const allowDevFallbacks = process.env.NODE_ENV !== "production" || process.env.ENABLE_DEV_DEMO_ACCOUNTS === "true";
      if (allowDevFallbacks) {
        const matchedDev = DEFAULT_DEV_STAFF.find(s => s.email === cleanEmail && s.passkey === cleanKey);
        if (matchedDev) {
          authenticatedStaff = {
            id: matchedDev.id,
            email: matchedDev.email,
            name: matchedDev.name,
            role: matchedDev.role,
            departmentScope: matchedDev.department_scope,
            assignedSections: matchedDev.assigned_sections,
            assignedYears: matchedDev.assigned_years,
            instituteId: matchedDev.institute_id,
            instituteName: matchedDev.institute_name
          };
        }
      }
    }

    if (!authenticatedStaff) {
      return NextResponse.json(
        { success: false, error: "Invalid staff passkey or unauthorized email address." },
        { status: 401 }
      );
    }

    // 3. Sign JWT session token
    const token = await signInstitutionalToken({
      sub: authenticatedStaff.id,
      role: authenticatedStaff.role,
      name: authenticatedStaff.name,
      email: authenticatedStaff.email,
      departmentScope: authenticatedStaff.departmentScope,
      assignedSections: authenticatedStaff.assignedSections,
      assignedYears: authenticatedStaff.assignedYears,
      instituteId: authenticatedStaff.instituteId,
      instituteName: authenticatedStaff.instituteName
    }, 86400 * 7);

    // 4. Log to institutional_audit_logs
    try {
      await supabaseServer.from("institutional_audit_logs").insert([
        {
          institute_id: authenticatedStaff.instituteId,
          actor_type: "staff",
          actor_id: authenticatedStaff.id,
          actor_name: authenticatedStaff.name,
          action_type: "LOGIN",
          description: `Staff member authenticated with role ${authenticatedStaff.role.toUpperCase()} (Scope: ${authenticatedStaff.departmentScope}) from IP hash: ${ipHash}`,
          ip_hash: ipHash,
          metadata: { email: authenticatedStaff.email, role: authenticatedStaff.role, department: authenticatedStaff.departmentScope }
        }
      ]);
    } catch {}

    const response = NextResponse.json({
      success: true,
      staff: authenticatedStaff,
      message: `Welcome, ${authenticatedStaff.name}. Logged in to ${authenticatedStaff.departmentScope}.`
    });

    response.cookies.set({
      name: INSTITUTIONAL_COOKIE_NAMES.STAFF,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 86400 * 7
    });

    return response;

  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed staff authentication." },
      { status: 500 }
    );
  }
}
