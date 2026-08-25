import { NextRequest, NextResponse } from "next/server";
import { verifyInstitutionalToken, INSTITUTIONAL_COOKIE_NAMES } from "@/app/lib/institutionalAuth";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get(INSTITUTIONAL_COOKIE_NAMES.STAFF)?.value;

    if (!token) {
      return NextResponse.json(
        { authenticated: false, error: "No active staff session found." },
        { status: 401 }
      );
    }

    const payload = await verifyInstitutionalToken(token);

    if (!payload || !["hod", "coordinator", "faculty"].includes(payload.role)) {
      return NextResponse.json(
        { authenticated: false, error: "Invalid or expired staff token." },
        { status: 401 }
      );
    }

    return NextResponse.json({
      authenticated: true,
      staff: {
        id: payload.sub,
        name: payload.name,
        email: payload.email,
        role: payload.role,
        departmentScope: payload.departmentScope,
        assignedSections: payload.assignedSections || [],
        assignedYears: payload.assignedYears || [],
        instituteId: payload.instituteId,
        instituteName: payload.instituteName
      }
    });

  } catch {
    return NextResponse.json(
      { authenticated: false, error: "Failed verifying staff identity." },
      { status: 500 }
    );
  }
}
