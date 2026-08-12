import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "Missing userId parameter" }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://dsqkxedafwzkjtcupzwx.supabase.co";
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    const { data: profile, error } = await supabaseAdmin
      .from("profiles")
      .select("id, full_name, username, avatar_url, college_name, department, leetcode_username, github_url, updated_at")
      .eq("id", userId)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ profile: profile || null });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed fetching user profile" }, { status: 500 });
  }
}
