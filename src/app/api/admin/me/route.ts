import { NextRequest, NextResponse } from "next/server";
import { verifyInstitutionalToken, INSTITUTIONAL_COOKIE_NAMES } from "@/app/lib/institutionalAuth";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get(INSTITUTIONAL_COOKIE_NAMES.ADMIN)?.value;

    if (!token) {
      return NextResponse.json(
        { authenticated: false, error: "No active administrator session found." },
        { status: 401 }
      );
    }

    const payload = await verifyInstitutionalToken(token);

    if (!payload || payload.role !== "college_admin") {
      return NextResponse.json(
        { authenticated: false, error: "Invalid or expired administrator token." },
        { status: 401 }
      );
    }

    return NextResponse.json({
      authenticated: true,
      admin: {
        id: payload.sub,
        name: payload.name,
        email: payload.email,
        instituteId: payload.instituteId,
        instituteName: payload.instituteName
      }
    });

  } catch {
    return NextResponse.json(
      { authenticated: false, error: "Failed to verify admin identity." },
      { status: 500 }
    );
  }
}
