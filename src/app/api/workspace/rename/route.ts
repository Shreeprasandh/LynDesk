import { z } from "zod";
import { createAdminClient } from "@/app/lib/supabaseServer";
import { apiSuccess, apiError } from "@/app/lib/apiResponse";

const renameSchema = z.object({
  workspaceId: z.string().min(1, { message: "workspaceId is required" }),
  projectName: z.string().min(1, { message: "projectName is required" })
});

function getWorkspaceUuid(rawId: string): string {
  if (!rawId) return "00000000-0000-4000-8000-000000000000";
  const trimmed = rawId.trim();
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(trimmed)) {
    return trimmed;
  }
  let h1 = 0x811c9dc5;
  let h2 = 0x01000193;
  for (let i = 0; i < trimmed.length; i++) {
    const code = trimmed.charCodeAt(i);
    h1 = Math.imul(h1 ^ code, 16777619);
    h2 = Math.imul(h2 ^ code, 2246822519);
  }
  const hex1 = Math.abs(h1).toString(16).padStart(8, "0");
  const hex2 = Math.abs(h2).toString(16).padStart(8, "0");
  const combined = (hex1 + hex2 + hex1 + hex2).substring(0, 32);

  const p1 = combined.substring(0, 8);
  const p2 = combined.substring(8, 12);
  const p3 = "4" + combined.substring(13, 16);
  const p4 = "8" + combined.substring(17, 20);
  const p5 = combined.substring(20, 32);
  return `${p1}-${p2}-${p3}-${p4}-${p5}`;
}

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return apiError("Authorization credentials required", 401, "UNAUTHORIZED");
    }
    const token = authHeader.replace("Bearer ", "").trim();

    const body = await req.json();
    const parseResult = renameSchema.safeParse(body);

    if (!parseResult.success) {
      return apiError(parseResult.error.issues[0]?.message || "Invalid workspace rename payload", 400, "BAD_REQUEST");
    }

    const { workspaceId, projectName } = parseResult.data;
    const supabaseAdmin = createAdminClient();

    const { data: { user }, error: authErr } = await supabaseAdmin.auth.getUser(token);
    if (authErr || !user) {
      return apiError("Invalid authentication session", 401, "UNAUTHORIZED");
    }

    const targetUuid = getWorkspaceUuid(workspaceId);

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

    return apiSuccess({ projectName: projectName.trim(), workspaceUuid: targetUuid });
  } catch (err: any) {
    console.error("Workspace rename API error:", err);
    return apiError(err.message || "Failed to rename workspace", 500);
  }
}
