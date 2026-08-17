import { z } from "zod";
import { createAdminClient } from "@/app/lib/supabaseServer";
import { apiSuccess, apiError } from "@/app/lib/apiResponse";

const querySchema = z.object({
  userId: z.string().uuid({ message: "Invalid user UUID format" })
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const parseResult = querySchema.safeParse({ userId: searchParams.get("userId") });

    if (!parseResult.success) {
      return apiError(parseResult.error.issues[0]?.message || "Invalid or missing userId parameter", 400, "BAD_REQUEST");
    }

    const { userId } = parseResult.data;
    const supabaseAdmin = createAdminClient();

    const { data: profile, error } = await supabaseAdmin
      .from("profiles")
      .select("id, full_name, username, avatar_url, college_key, department, bio, skills, leetcode_username, github_url, updated_at")
      .eq("id", userId)
      .maybeSingle();

    if (error) {
      return apiError(error.message, 500, "DATABASE_ERROR");
    }

    return apiSuccess({ profile: profile || null });
  } catch (err: any) {
    return apiError(err.message || "Failed fetching user profile", 500);
  }
}
