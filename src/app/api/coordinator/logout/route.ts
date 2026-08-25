import { NextResponse } from "next/server";
import { INSTITUTIONAL_COOKIE_NAMES } from "@/app/lib/institutionalAuth";

export async function POST() {
  const response = NextResponse.json({
    success: true,
    message: "Coordinator session terminated safely."
  });

  response.cookies.delete(INSTITUTIONAL_COOKIE_NAMES.STAFF);
  return response;
}
