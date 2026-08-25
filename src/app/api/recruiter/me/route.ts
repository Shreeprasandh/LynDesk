import { NextRequest, NextResponse } from "next/server";
import { verifyInstitutionalToken, INSTITUTIONAL_COOKIE_NAMES } from "@/app/lib/institutionalAuth";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get(INSTITUTIONAL_COOKIE_NAMES.RECRUITER)?.value;

    if (!token) {
      return NextResponse.json(
        { authenticated: false, error: "No active recruiter session found." },
        { status: 401 }
      );
    }

    const payload = await verifyInstitutionalToken(token);

    if (!payload || payload.role !== "recruiter") {
      return NextResponse.json(
        { authenticated: false, error: "Invalid or expired recruiter session." },
        { status: 401 }
      );
    }

    return NextResponse.json({
      authenticated: true,
      recruiter: {
        id: payload.sub,
        companyName: payload.companyName || payload.name,
        instituteId: payload.instituteId,
        instituteName: payload.instituteName
      }
    });

  } catch {
    return NextResponse.json(
      { authenticated: false, error: "Failed verifying recruiter identity." },
      { status: 500 }
    );
  }
}
