import { z } from "zod";
import { createAdminClient } from "@/app/lib/supabaseServer";
import { apiSuccess, apiError } from "@/app/lib/apiResponse";

const renameSchema = z.object({
  workspaceId: z.string().min(1, { message: "workspaceId is required" }),
  projectName: z.string().min(1, { message: "projectName is required" })
});

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
    const body = await req.json();
    const parseResult = renameSchema.safeParse(body);

    if (!parseResult.success) {
      return apiError(parseResult.error.issues[0]?.message || "Invalid workspace rename payload", 400, "BAD_REQUEST");
    }

    const { workspaceId, projectName } = parseResult.data;
    const supabaseAdmin = createAdminClient();
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

    return apiSuccess({ projectName: projectName.trim() });
  } catch (err: any) {
    console.error("Workspace rename API error:", err);
    return apiError(err.message || "Failed to rename workspace", 500);
  }
}
