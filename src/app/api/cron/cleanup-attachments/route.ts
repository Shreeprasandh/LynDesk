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

    // Recursive helper to traverse directories and locate expired files
    const scanFolder = async (folderPath: string) => {
      try {
        const { data: items } = await supabaseAdmin.storage
          .from("project-vaults")
          .list(folderPath, { limit: 1000 });

        if (!items || items.length === 0) return;

        for (const item of items) {
          const itemFullPath = folderPath ? `${folderPath}/${item.name}` : item.name;
          if (!item.id || !item.created_at) {
            // Directory / User subfolder -> recurse
            await scanFolder(itemFullPath);
          } else if (new Date(item.created_at) < tenDaysAgo) {
            filesToDelete.push(itemFullPath);
          }
        }
      } catch {}
    };

    await scanFolder("");
    await scanFolder("uploads");

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
