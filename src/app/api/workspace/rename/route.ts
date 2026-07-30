import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  try {
    const { workspaceId, projectName } = await req.json();

    if (!workspaceId || !projectName) {
      return NextResponse.json({ error: "Missing workspaceId or projectName" }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Upsert project_name into project_spaces
    const { data: existing } = await supabaseAdmin
      .from("project_spaces")
      .select("id")
      .eq("id", workspaceId)
      .maybeSingle();

    if (existing) {
      await supabaseAdmin
        .from("project_spaces")
        .update({ project_name: projectName.trim() })
        .eq("id", workspaceId);
    } else {
      await supabaseAdmin
        .from("project_spaces")
        .insert({
          id: workspaceId,
          project_name: projectName.trim(),
          status: "development"
        });
    }

    return NextResponse.json({ success: true, projectName: projectName.trim() });
  } catch (err: any) {
    console.error("Workspace rename API error:", err);
    return NextResponse.json({ error: err.message || "Failed to rename workspace" }, { status: 500 });
  }
}
