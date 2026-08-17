import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getWorkspaceUuid(rawId: string): string {
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(rawId);
  if (isUuid) return rawId;
  let hash = 0;
  for (let i = 0; i < rawId.length; i++) {
    hash = (hash << 5) - hash + rawId.charCodeAt(i);
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).padStart(8, "0");
  return `00000000-0000-4000-8000-${hex.padStart(12, "0")}`;
}

export async function POST(req: Request) {
  try {
    const { workspaceId, projectName } = await req.json();

    if (!workspaceId || !projectName) {
      return NextResponse.json({ error: "Missing workspaceId or projectName" }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ success: true, projectName: projectName.trim(), isMock: true });
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    const targetUuid = getWorkspaceUuid(workspaceId);

    // Upsert project_name into project_spaces
    const { data: existing } = await supabaseAdmin
      .from("project_spaces")
      .select("id")
      .eq("id", targetUuid)
      .maybeSingle();

    if (existing) {
      await supabaseAdmin
        .from("project_spaces")
        .update({ project_name: projectName.trim(), updated_at: new Date().toISOString() })
        .eq("id", targetUuid);
    } else {
      await supabaseAdmin
        .from("project_spaces")
        .insert({
          id: targetUuid,
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
