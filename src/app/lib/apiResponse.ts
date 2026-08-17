import { NextResponse } from "next/server";

export interface ApiResponseEnvelope<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  timestamp: string;
}

export function apiSuccess<T>(data: T, status: number = 200) {
  return NextResponse.json(
    {
      success: true,
      data,
      timestamp: new Date().toISOString()
    },
    { status }
  );
}

export function apiError(message: string, status: number = 500, code: string = "INTERNAL_ERROR") {
  return NextResponse.json(
    {
      success: false,
      error: {
        code,
        message
      },
      timestamp: new Date().toISOString()
    },
    { status }
  );
}
