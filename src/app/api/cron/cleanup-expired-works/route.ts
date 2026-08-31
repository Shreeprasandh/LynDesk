import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/app/lib/supabaseServer";

export async function GET(req: NextRequest) {
  try {
    // Cron secret verification
    const authHeader = req.headers.get("authorization") || req.headers.get("Authorization");
    const cronSecret = process.env.CRON_SECRET;
    if (process.env.NODE_ENV === "production") {
      if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json({ error: "Unauthorized cron execution." }, { status: 401 });
      }
    }

    const supabaseAdmin = createAdminClient();
    const now = new Date().toISOString();
    const sevenDaysFromNow = new Date(Date.now() + 7 * 86400000).toISOString();

    // 1. Send warning notifications for works expiring within 7 days
    const { data: expiringWorks, error: expiringError } = await supabaseAdmin
      .from("student_works")
      .select("id, student_id, title, expires_at")
      .eq("status", "approved")
      .is("renewed_at", null)
      .gt("expires_at", now)
      .lte("expires_at", sevenDaysFromNow);

    let warnedCount = 0;
    if (!expiringError && expiringWorks) {
      for (const work of expiringWorks) {
        const daysLeft = Math.max(1, Math.ceil((new Date(work.expires_at).getTime() - Date.now()) / (1000 * 86400)));
        await supabaseAdmin.from("notifications").insert({
          user_id: work.student_id,
          type: "work_expiring_soon",
          title: "Work Expiring Soon",
          content: `Your work "${work.title}" will expire in ${daysLeft} day(s). Renew it on your Works Hub to keep it live!`,
          link_url: "/explore?tab=works",
          category: "institution",
          is_read: false,
          created_at: new Date().toISOString()
        }).then(() => { warnedCount++; });
      }
    }

    // 2. Query expired works
    const { data: expiredWorks, error: expiredError } = await supabaseAdmin
      .from("student_works")
      .select("id, student_id, title, file_path")
      .lt("expires_at", now);

    let deletedCount = 0;
    if (!expiredError && expiredWorks && expiredWorks.length > 0) {
      for (const work of expiredWorks) {
        // Remove storage file if present
        if (work.file_path) {
          await supabaseAdmin.storage
            .from("student-works")
            .remove([work.file_path])
            .catch(() => {});
        }

        // Notify student of expiry
        await supabaseAdmin.from("notifications").insert({
          user_id: work.student_id,
          type: "work_expired",
          title: "Work Expired",
          content: `Your work "${work.title}" has reached its 90-day lifecycle limit and has been archived.`,
          link_url: "/explore?tab=works",
          category: "institution",
          is_read: false,
          created_at: new Date().toISOString()
        }).then(() => {});

        // Delete record (cascades to ratings and views)
        const { error: delErr } = await supabaseAdmin
          .from("student_works")
          .delete()
          .eq("id", work.id);

        if (!delErr) {
          deletedCount++;
        }
      }
    }

    return NextResponse.json({
      success: true,
      cleaned_count: deletedCount,
      warned_count: warnedCount,
      timestamp: now
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Cleanup failed.";
    console.error("[CRON cleanup-expired-works] Error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
