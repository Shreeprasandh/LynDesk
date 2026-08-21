import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/app/lib/supabaseServer";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabaseAdmin = createAdminClient();

  try {
    const tenDaysAgo = new Date();
    tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);

    const filesToDelete: string[] = [];

    // 1. List root folder in project-vaults
    const { data: rootFiles } = await supabaseAdmin.storage
      .from("project-vaults")
      .list("", { limit: 1000 });

    (rootFiles || []).forEach((file) => {
      if (file.id && file.created_at && new Date(file.created_at) < tenDaysAgo) {
        filesToDelete.push(file.name);
      }
    });

    // 2. List uploads/ folder in project-vaults
    const { data: uploadFiles } = await supabaseAdmin.storage
      .from("project-vaults")
      .list("uploads", { limit: 1000 });

    (uploadFiles || []).forEach((file) => {
      if (file.id && file.created_at && new Date(file.created_at) < tenDaysAgo) {
        filesToDelete.push(`uploads/${file.name}`);
      }
    });

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
    return NextResponse.json({ error: err?.message || "Internal Error" }, { status: 500 });
  }
}
