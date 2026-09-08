import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-project.supabase.co";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder_service_role_key";
const supabaseServer = createClient(supabaseUrl, serviceRoleKey);

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const instituteId = searchParams.get("instituteId");

    let instituteData: any = null;

    if (instituteId) {
      const { data } = await supabaseServer
        .from("institutes")
        .select("*")
        .eq("id", instituteId)
        .maybeSingle();

      instituteData = data;
    }

    if (!instituteData) {
      // Fetch default/first registered institute
      const { data } = await supabaseServer
        .from("institutes")
        .select("*")
        .limit(1)
        .maybeSingle();

      instituteData = data;
    }

    let extendedMetadata: Record<string, any> = {};
    if (instituteData?.id) {
      try {
        const { data: logData } = await supabaseServer
          .from("institutional_audit_logs")
          .select("metadata")
          .eq("institute_id", instituteData.id)
          .eq("action_type", "CAMPUS_IDENTITY_UPDATED")
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (logData?.metadata) {
          extendedMetadata = logData.metadata;
        }
      } catch {}
    }

    const name = instituteData?.name || "SRM Easwari Engineering College";
    const emailDomain = instituteData?.email_domain || "srmeaswari.edu.in";
    const logoUrl = instituteData?.logo_url || extendedMetadata.logoUrl || null;
    const accreditation = extendedMetadata.accreditation || "Autonomous Institution • Approved by AICTE • NAAC Accredited A++";
    const address = extendedMetadata.address || "Bharathi Salai, Ramapuram, Chennai - 600089, Tamil Nadu, India";
    const signatoryTitle = extendedMetadata.signatoryTitle || "Dean of Academic Affairs & Institutional Registrar";
    const contactEmail = extendedMetadata.contactEmail || `registrar@${emailDomain}`;
    const websiteUrl = extendedMetadata.websiteUrl || `https://www.${emailDomain}`;

    return NextResponse.json({
      success: true,
      identity: {
        instituteId: instituteData?.id || "e1b8b8f1-e123-4567-89ab-cdef01234567",
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
    return NextResponse.json({ error: error.message || "Failed fetching campus branding." }, { status: 500 });
  }
}
