import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function sanitizeString(str: any): string {
  if (typeof str !== "string") return "";
  return str.trim();
}

function getVanguarDZClient() {
  const url = process.env.VANGUARDZ_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const key = process.env.VANGUARDZ_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
}

// STRICTLY READ-ONLY ROUTE HANDLER FOR VANGUARDZ INTEGRATION
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const username = sanitizeString(body.username);
    const password = sanitizeString(body.password);

    if (!username || !password) {
      return NextResponse.json(
        { success: false, message: "Username and password are required." },
        { status: 400 }
      );
    }

    const vanguardzDb = getVanguarDZClient();

    // STRICTLY READ-ONLY: Query profiles table for username & password match
    const { data: profile, error } = await vanguardzDb
      .from("profiles")
      .select("username, password, high_score")
      .eq("username", username)
      .maybeSingle();

    if (error) {
      console.error("VanguarDZ DB Read Error:", error);
      return NextResponse.json(
        { success: false, message: "Could not query VanguarDZ database. Check username." },
        { status: 500 }
      );
    }

    if (!profile) {
      return NextResponse.json(
        { success: false, message: "VanguarDZ player account not found." },
        { status: 404 }
      );
    }

    // Verify password match
    if (profile.password !== password) {
      return NextResponse.json(
        { success: false, message: "Invalid VanguarDZ password." },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      username: profile.username,
      highScore: profile.high_score ?? 0,
      connectedAt: new Date().toISOString()
    });
  } catch (err: any) {
    console.error("VanguarDZ connect error:", err);
    return NextResponse.json(
      { success: false, message: "Server error authenticating VanguarDZ account." },
      { status: 500 }
    );
  }
}

// STRICTLY READ-ONLY GET ROUTE HANDLER FOR LIVE HIGH SCORE POLLING
export async function GET(req: Request) {
  try {
    const { searchParams: urlParams } = new URL(req.url);
    const username = sanitizeString(urlParams.get("username"));

    if (!username) {
      return NextResponse.json(
        { success: false, message: "Missing username parameter." },
        { status: 400 }
      );
    }

    const vanguardzDb = getVanguarDZClient();

    // STRICTLY READ-ONLY: Query high_score for connected player
    const { data: profile, error } = await vanguardzDb
      .from("profiles")
      .select("username, high_score")
      .eq("username", username)
      .maybeSingle();

    if (error || !profile) {
      return NextResponse.json(
        { success: false, message: "VanguarDZ stats unavailable." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      username: profile.username,
      highScore: profile.high_score ?? 0
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Failed to fetch VanguarDZ stats." },
      { status: 500 }
    );
  }
}
