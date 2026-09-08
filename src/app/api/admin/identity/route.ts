import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { verifyInstitutionalToken, INSTITUTIONAL_COOKIE_NAMES } from "@/app/lib/institutionalAuth";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-project.supabase.co";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder_service_role_key";
const supabaseServer = createClient(supabaseUrl, serviceRoleKey);

const UpdateIdentitySchema = z.object({
  name: z.string().min(2).max(200),
  logoUrl: z.string().url().or(z.string().regex(/^\/[a-zA-Z0-9_/.-]+$/)).or(z.string().length(0)).nullable().optional(),
  accreditation: z.string().max(300).optional(),
  address: z.string().max(300).optional(),
  signatoryTitle: z.string().max(150).optional(),
  contactEmail: z.string().email().or(z.string().length(0)).optional(),
  websiteUrl: z.string().url().or(z.string().length(0)).optional(),
});

async function authenticateAdmin(req: NextRequest) {
  const token = req.cookies.get(INSTITUTIONAL_COOKIE_NAMES.ADMIN)?.value;
  if (!token) return null;
  const payload = await verifyInstitutionalToken(token);
  if (!payload || payload.role !== "college_admin") return null;
  return payload;
}

export async function GET(req: NextRequest) {
  try {
    const admin = await authenticateAdmin(req);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized administrator access." }, { status: 401 });
    }

    let instituteData: any = null;
    if (admin.instituteId) {
      const { data, error } = await supabaseServer
        .from("institutes")
        .select("*")
        .eq("id", admin.instituteId)
        .maybeSingle();

      if (!error && data) {
        instituteData = data;
      }
    }

    // Check latest audit log for extended metadata
    let extendedMetadata: Record<string, any> = {};
    try {
      const { data: logData } = await supabaseServer
        .from("institutional_audit_logs")
        .select("metadata")
        .eq("institute_id", admin.instituteId)
        .eq("action_type", "CAMPUS_IDENTITY_UPDATED")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (logData?.metadata) {
        extendedMetadata = logData.metadata;
      }
    } catch {}

    const name = instituteData?.name || admin.instituteName || "University Institute of Technology";
    const emailDomain = instituteData?.email_domain || "college.edu";
    const logoUrl = instituteData?.logo_url || extendedMetadata.logoUrl || null;
    const accreditation = extendedMetadata.accreditation || "Autonomous Institution • Approved by AICTE • NAAC Accredited A++";
    const address = extendedMetadata.address || "Main University Campus, Institutional Area, India";
    const signatoryTitle = extendedMetadata.signatoryTitle || "Dean of Academic Affairs & Institutional Registrar";
    const contactEmail = extendedMetadata.contactEmail || `registrar@${emailDomain}`;
    const websiteUrl = extendedMetadata.websiteUrl || `https://www.${emailDomain}`;

    return NextResponse.json({
      success: true,
      identity: {
        instituteId: admin.instituteId,
        name,
        emailDomain,
        logoUrl,
        accreditation,
        address,
        signatoryTitle,
        contactEmail,
        websiteUrl,
      }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed fetching campus identity." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await authenticateAdmin(req);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized administrator access." }, { status: 401 });
    }

    const body = await req.json();
    const parsed = UpdateIdentitySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid identity configuration.", details: parsed.error.format() }, { status: 400 });
    }

    const { name, logoUrl, accreditation, address, signatoryTitle, contactEmail, websiteUrl } = parsed.data;

    // 1. Update institutes table
    if (admin.instituteId) {
      await supabaseServer
        .from("institutes")
        .update({
          name: name.trim(),
          logo_url: logoUrl ? logoUrl.trim() : null,
        })
        .eq("id", admin.instituteId);
    }

    const metadataRecord = {
      name: name.trim(),
      logoUrl: logoUrl ? logoUrl.trim() : null,
      accreditation: accreditation?.trim() || "Autonomous Institution • Approved by AICTE • NAAC Accredited A++",
      address: address?.trim() || "Main University Campus, Institutional Area, India",
      signatoryTitle: signatoryTitle?.trim() || "Dean of Academic Affairs & Institutional Registrar",
      contactEmail: contactEmail?.trim() || "",
      websiteUrl: websiteUrl?.trim() || "",
      updatedAt: new Date().toISOString()
    };

    // 2. Persist extended branding metadata into audit logs
    try {
      await supabaseServer.from("institutional_audit_logs").insert([
        {
          institute_id: admin.instituteId,
          actor_type: "admin",
          actor_id: admin.sub,
          actor_name: admin.name,
          action_type: "CAMPUS_IDENTITY_UPDATED",
          description: `Updated institutional branding & identity for ${name.trim()}.`,
          ip_hash: "admin_action",
          metadata: metadataRecord
        }
      ]);
    } catch {}

    return NextResponse.json({
      success: true,
      message: "Campus identity & branding updated successfully.",
      identity: {
        instituteId: admin.instituteId,
        ...metadataRecord
      }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed updating campus identity." }, { status: 500 });
  }
}
