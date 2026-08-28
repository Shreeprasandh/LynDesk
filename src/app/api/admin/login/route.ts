import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { signInstitutionalToken, hashClientIp, INSTITUTIONAL_COOKIE_NAMES } from "@/app/lib/institutionalAuth";
import { checkRateLimit } from "@/app/lib/rateLimit";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-project.supabase.co";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder_service_role_key";
const supabaseServer = createClient(supabaseUrl, serviceRoleKey);

// Default provisioned root admin account for development/demo
const DEFAULT_DEV_ADMIN = {
  id: "00000000-0000-0000-0000-000000000001",
  email: "admin@srmist.edu.in",
  name: "Dr. K. Rangarajan (Dean of Engineering)",
  passkey: "Admin@LynDesk2026",
  instituteId: "00000000-0000-0000-0000-000000000001",
  instituteName: "SRM Institute of Science and Technology"
};

export async function POST(req: NextRequest) {
  try {
    const ipHash = await hashClientIp(req);
    const rateLimit = checkRateLimit(ipHash, 10, 60000);
    if (!rateLimit.success) {
      return NextResponse.json(
        { success: false, error: `Too many login attempts. Please wait ${rateLimit.resetInSeconds} seconds.` },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Please enter both official administrator email and passkey." },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = password.trim();

    let authenticatedAdmin: {
      id: string;
      email: string;
      name: string;
      instituteId: string;
      instituteName: string;
    } | null = null;

    // 1. Check college_admins in Supabase
    try {
      const { data: dbAdmin, error } = await supabaseServer
        .from("college_admins")
        .select("id, email, password_hash, full_name, institute_id, is_active, institutes(id, name)")
        .eq("email", cleanEmail)
        .single();

      if (!error && dbAdmin && dbAdmin.is_active) {
        // Verify password hash or plain match
        const enc = new TextEncoder();
        const hashBuf = await crypto.subtle.digest("SHA-256", enc.encode(cleanPass));
        const computedHash = Array.from(new Uint8Array(hashBuf)).map(b => b.toString(16).padStart(2, "0")).join("");

        if (dbAdmin.password_hash === computedHash || dbAdmin.password_hash === cleanPass) {
          const inst = (dbAdmin as any).institutes;
          authenticatedAdmin = {
            id: dbAdmin.id,
            email: dbAdmin.email,
            name: dbAdmin.full_name,
            instituteId: dbAdmin.institute_id,
            instituteName: inst?.name || "Campus Administration"
          };
        }
      }
    } catch {}

    // 2. Check default dev admin fallback (in dev mode or when explicitly enabled)
    if (!authenticatedAdmin) {
      const allowDevFallbacks = process.env.NODE_ENV !== "production" || process.env.ENABLE_DEV_DEMO_ACCOUNTS === "true";
      if (allowDevFallbacks && cleanEmail === DEFAULT_DEV_ADMIN.email && cleanPass === DEFAULT_DEV_ADMIN.passkey) {
        authenticatedAdmin = {
          id: DEFAULT_DEV_ADMIN.id,
          email: DEFAULT_DEV_ADMIN.email,
          name: DEFAULT_DEV_ADMIN.name,
          instituteId: DEFAULT_DEV_ADMIN.instituteId,
          instituteName: DEFAULT_DEV_ADMIN.instituteName
        };
      }
    }

    if (!authenticatedAdmin) {
      return NextResponse.json(
        { success: false, error: "Invalid administrator credentials or inactive institutional license." },
        { status: 401 }
      );
    }

    // 3. Generate signed JWT session token
    const token = await signInstitutionalToken({
      sub: authenticatedAdmin.id,
      role: "college_admin",
      name: authenticatedAdmin.name,
      email: authenticatedAdmin.email,
      instituteId: authenticatedAdmin.instituteId,
      instituteName: authenticatedAdmin.instituteName
    }, 86400 * 7); // 7 days

    // 4. Log to institutional_audit_logs
    try {
      await supabaseServer.from("institutional_audit_logs").insert([
        {
          institute_id: authenticatedAdmin.instituteId,
          actor_type: "admin",
          actor_id: authenticatedAdmin.id,
          actor_name: authenticatedAdmin.name,
          action_type: "LOGIN",
          description: `College Root Admin authenticated successfully from IP hash: ${ipHash}`,
          ip_hash: ipHash,
          metadata: { email: authenticatedAdmin.email }
        }
      ]);
    } catch {}

    const response = NextResponse.json({
      success: true,
      admin: authenticatedAdmin,
      message: `Welcome back, ${authenticatedAdmin.name}. Access granted to ${authenticatedAdmin.instituteName}.`
    });

    // Set secure httpOnly cookie
    response.cookies.set({
      name: INSTITUTIONAL_COOKIE_NAMES.ADMIN,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 86400 * 7
    });

    return response;

  } catch (error: any) {
    console.error("[Admin Login API Exception]:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error during administrator authentication." },
      { status: 500 }
    );
  }
}
