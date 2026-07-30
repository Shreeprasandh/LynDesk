import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(req: NextRequest) {
  // Verify authorization header or cron secret if defined
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json({ error: "Missing Supabase configuration" }, { status: 500 });
  }

  const supabaseAdmin = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  try {
    const tenDaysAgo = new Date();
    tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);

    // List chat files in project-vaults bucket
    const { data: files, error: listError } = await supabaseAdmin.storage
      .from("project-vaults")
      .list("", { limit: 1000 });

    if (listError) {
      return NextResponse.json({ error: listError.message }, { status: 500 });
    }

    if (!files || files.length === 0) {
      return NextResponse.json({ message: "No files found to clean up", deletedCount: 0 });
    }

    // Filter files created > 10 days ago
    const filesToDelete = files
      .filter((file) => {
        if (!file.created_at) return false;
        const createdAt = new Date(file.created_at);
        return createdAt < tenDaysAgo;
      })
      .map((file) => file.name);

    if (filesToDelete.length === 0) {
      return NextResponse.json({ message: "No expired files older than 10 days", deletedCount: 0 });
    }

    const { error: deleteError } = await supabaseAdmin.storage
      .from("project-vaults")
      .remove(filesToDelete);

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `Cleaned up ${filesToDelete.length} expired chat attachments older than 10 days`,
      deletedCount: filesToDelete.length,
      files: filesToDelete
    });
  } catch (err: any) {
    console.error("Cleanup error:", err);
    return NextResponse.json({ error: err.message || "Internal Error" }, { status: 500 });
  }
}
