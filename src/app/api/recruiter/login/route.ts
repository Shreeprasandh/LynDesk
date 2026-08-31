import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { signInstitutionalToken, hashClientIp, INSTITUTIONAL_COOKIE_NAMES } from "@/app/lib/institutionalAuth";
import { checkRateLimit } from "@/app/lib/rateLimit";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-project.supabase.co";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder_service_role_key";
const supabaseServer = createClient(supabaseUrl, serviceRoleKey);

// Provisioned default keys for local verification & development
const DEFAULT_RECRUITER_PINS = [
  {
    id: "00000000-0000-0000-0000-000000000010",
    company_name: "Google India",
    access_pin: "847291",
    institute_id: "00000000-0000-0000-0000-000000000001",
    institute_name: "SRM Institute of Science and Technology",
    expires_at: new Date(Date.now() + 30 * 86400000).toISOString()
  },
  {
    id: "00000000-0000-0000-0000-000000000011",
    company_name: "Microsoft",
    access_pin: "301984",
    institute_id: "00000000-0000-0000-0000-000000000001",
    institute_name: "SRM Institute of Science and Technology",
    expires_at: new Date(Date.now() + 30 * 86400000).toISOString()
  },
  {
    id: "00000000-0000-0000-0000-000000000012",
    company_name: "Amazon Campus",
    access_pin: "592014",
    institute_id: "00000000-0000-0000-0000-000000000001",
    institute_name: "SRM Institute of Science and Technology",
    expires_at: new Date(Date.now() + 30 * 86400000).toISOString()
  }
];

export async function POST(req: NextRequest) {
  try {
    const ipHash = await hashClientIp(req);
    const rateLimit = checkRateLimit(`recruiter_login_${ipHash}`, 8, 60000);
    if (!rateLimit.success) {
      return NextResponse.json(
        { success: false, error: `Too many login attempts. Please wait ${rateLimit.resetInSeconds} seconds.` },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { pin, company } = body;

    if (!pin) {
      return NextResponse.json(
        { success: false, error: "Please enter your 6-digit corporate access PIN." },
        { status: 400 }
      );
    }

    const cleanPin = pin.trim();
    const cleanCompany = (company || "").trim().toLowerCase();

    let authenticatedCompany: any = null;

    // 1. Check recruiter_keys table in Supabase
    try {
      const enc = new TextEncoder();
      const hashBuf = await crypto.subtle.digest("SHA-256", enc.encode(cleanPin));
      const computedHash = Array.from(new Uint8Array(hashBuf)).map(b => b.toString(16).padStart(2, "0")).join("");

      const { data: dbKey, error } = await supabaseServer
        .from("recruiter_keys")
        .select("id, company_name, access_pin_hash, institute_id, expires_at, is_active, institutes(id, name)")
        .eq("is_active", true);

      if (!error && dbKey && dbKey.length > 0) {
        const matched = dbKey.find(k => {
          const pinMatch = k.access_pin_hash === computedHash || k.access_pin_hash === cleanPin;
          const companyMatch = !cleanCompany || k.company_name.toLowerCase().includes(cleanCompany);
          return pinMatch && companyMatch;
        });

        if (matched) {
          const inst = (matched as any).institutes;
          authenticatedCompany = {
            id: matched.id,
            companyName: matched.company_name,
            instituteId: matched.institute_id,
            instituteName: inst?.name || "SRM Institute of Science and Technology",
            expiresAt: matched.expires_at
          };
        }
      }
    } catch {}

    // 2. Check default dev recruiter fallback strictly in development
    if (!authenticatedCompany) {
      const allowDevFallbacks = process.env.NODE_ENV !== "production" || process.env.ENABLE_DEV_DEMO_ACCOUNTS === "true";
      if (allowDevFallbacks) {
        const matchedDev = DEFAULT_RECRUITER_PINS.find(p => {
          const pinMatch = p.access_pin === cleanPin;
          const compMatch = !cleanCompany || p.company_name.toLowerCase().includes(cleanCompany);
          return pinMatch && compMatch;
        });

        if (matchedDev) {
          authenticatedCompany = {
            id: matchedDev.id,
            companyName: matchedDev.company_name,
            instituteId: matchedDev.institute_id,
            instituteName: matchedDev.institute_name,
            expiresAt: matchedDev.expires_at
          };
        }
      }
    }

    if (!authenticatedCompany) {
      return NextResponse.json(
        { success: false, error: "Invalid or expired corporate access PIN." },
        { status: 401 }
      );
    }

    // 3. Sign JWT session token
    const token = await signInstitutionalToken({
      sub: authenticatedCompany.id,
      role: "recruiter",
      name: authenticatedCompany.companyName,
      companyName: authenticatedCompany.companyName,
      instituteId: authenticatedCompany.instituteId,
      instituteName: authenticatedCompany.instituteName
    }, 86400 * 3);

    // 4. Log to institutional_audit_logs
    try {
      await supabaseServer.from("institutional_audit_logs").insert([
        {
          institute_id: authenticatedCompany.instituteId,
          actor_type: "recruiter",
          actor_id: authenticatedCompany.id,
          actor_name: authenticatedCompany.companyName,
          action_type: "LOGIN",
          description: `Recruiter authenticated for company ${authenticatedCompany.companyName} from IP hash: ${ipHash}`,
          ip_hash: ipHash,
          metadata: { company: authenticatedCompany.companyName }
        }
      ]);
    } catch {}

    const response = NextResponse.json({
      success: true,
      company: authenticatedCompany,
      message: `Corporate session authorized for ${authenticatedCompany.companyName}.`
    });

    response.cookies.set({
      name: INSTITUTIONAL_COOKIE_NAMES.RECRUITER,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 86400 * 3
    });

    return response;

  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed recruiter authentication." },
      { status: 500 }
    );
  }
}
