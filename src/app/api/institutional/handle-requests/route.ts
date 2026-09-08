import { NextResponse } from "next/server";
import { createAdminClient } from "@/app/lib/supabaseServer";
import { checkRateLimit } from "@/app/lib/moderation";

export const dynamic = "force-dynamic";

const PLATFORM_COLUMN_MAP: Record<string, string> = {
  leetcode: "leetcode_username",
  codechef: "codechef_username",
  codeforces: "codeforces_username",
  hackerrank: "hackerrank_username",
  geeksforgeeks: "geeksforgeeks_username",
  unstop: "unstop_username",
  github: "github_url"
};

const VERIFIED_COLUMN_MAP: Record<string, string> = {
  hackerrank: "hackerrank_verified",
  geeksforgeeks: "geeksforgeeks_verified",
  devpost: "devpost_verified"
};

// GET: Fetch pending handle verification requests for coordinator
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "pending";
    const limit = parseInt(searchParams.get("limit") || "50");
    const supabaseAdmin = createAdminClient();

    // Fetch from Supabase handle_verifications
    let query = supabaseAdmin
      .from("handle_verifications")
      .select("id, user_id, student_id, platform, handle, status, verified_at, created_at");

    if (status !== "all") {
      query = query.eq("status", status);
    }

    const { data: requests, error } = await query
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.warn("Error fetching handle_verifications:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!requests || requests.length === 0) {
      return NextResponse.json({ requests: [] });
    }

    // Fetch matching profile data for all users
    const userIds = Array.from(new Set(requests.map(r => r.user_id || r.student_id).filter(Boolean)));
    const profileMap = new Map<string, any>();

    if (userIds.length > 0) {
      const { data: profiles } = await supabaseAdmin
        .from("profiles")
        .select("id, full_name, roll_number, email, college_name, department, academic_year, section")
        .in("id", userIds);

      if (profiles) {
        profiles.forEach(p => profileMap.set(p.id, p));
      }
    }

    // Map into enriched coordinator claim objects
    const enriched = requests.map(req => {
      const targetId = req.user_id || req.student_id;
      const profile = profileMap.get(targetId) || {};

      return {
        id: req.id,
        studentId: targetId,
        studentName: profile.full_name || "Enrolled Student",
        studentEmail: profile.email || "student@institution.edu",
        studentRoll: profile.roll_number || "310624205254",
        department: profile.department || "Computer Science and Engineering",
        academicYear: profile.academic_year || "1st Year",
        section: profile.section || "Section B",
        college: profile.college_name || "SRM Easwari Engineering College",
        platform: req.platform,
        handle: req.handle,
        requestType: "new_verification",
        status: req.status,
        date: req.created_at ? new Date(req.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Today",
        createdAt: req.created_at
      };
    });

    return NextResponse.json({ requests: enriched });
  } catch (err: any) {
    console.error("GET handle-requests error:", err);
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}

// POST: Submit a new verification request or handle switch from student
export async function POST(request: Request) {
  const clientIp = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "anonymous";
  const rateLimit = checkRateLimit(`handle_req_${clientIp}`, 20, 60000);
  if (!rateLimit.allowed) {
    return NextResponse.json({ error: "Too many verification submissions. Please slow down." }, { status: 429 });
  }

  try {
    const body = await request.json();
    const { userId, platform, handle } = body;

    if (!userId || !platform || !handle) {
      return NextResponse.json({ error: "Missing required fields: userId, platform, handle" }, { status: 400 });
    }

    const normPlatform = platform.toLowerCase().trim();
    const cleanHandle = handle.trim();
    const supabaseAdmin = createAdminClient();

    // Check if an existing pending verification row exists for this user and platform
    const { data: existing } = await supabaseAdmin
      .from("handle_verifications")
      .select("id, status")
      .eq("user_id", userId)
      .ilike("platform", normPlatform)
      .limit(1);

    let resultData: any = null;

    if (existing && existing.length > 0) {
      // Update existing record
      const { data, error } = await supabaseAdmin
        .from("handle_verifications")
        .update({
          handle: cleanHandle,
          status: "pending",
          verified_at: null,
          created_at: new Date().toISOString()
        })
        .eq("id", existing[0].id)
        .select()
        .single();

      if (error) throw error;
      resultData = data;
    } else {
      // Insert new record
      const { data, error } = await supabaseAdmin
        .from("handle_verifications")
        .insert({
          user_id: userId,
          student_id: userId,
          platform: normPlatform,
          handle: cleanHandle,
          status: "pending"
        })
        .select()
        .single();

      if (error) throw error;
      resultData = data;
    }

    return NextResponse.json({
      success: true,
      message: `Handle verification request for @${cleanHandle} on ${platform} submitted successfully.`,
      record: resultData
    });
  } catch (err: any) {
    console.error("POST handle-requests error:", err);
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}

// PATCH: Approve, Reject, or Bulk Approve handle claims
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { requestId, requestIds, action, rejectionReason } = body;
    const supabaseAdmin = createAdminClient();

    if (action === "bulk_approve" && Array.isArray(requestIds) && requestIds.length > 0) {
      // 1. Bulk Approve All Safe Claims
      const { data: targets, error: fetchErr } = await supabaseAdmin
        .from("handle_verifications")
        .select("id, user_id, platform, handle")
        .in("id", requestIds);

      if (fetchErr) throw fetchErr;

      const updatedIds: string[] = [];

      for (const t of targets || []) {
        // Update handle_verifications status to verified
        await supabaseAdmin
          .from("handle_verifications")
          .update({
            status: "verified",
            verified_at: new Date().toISOString()
          })
          .eq("id", t.id);

        // Update profile handle and verified flag
        const normPlatform = (t.platform || "").toLowerCase().trim();
        const colName = PLATFORM_COLUMN_MAP[normPlatform];
        const verifCol = VERIFIED_COLUMN_MAP[normPlatform];

        const profileUpdates: Record<string, any> = {};
        if (colName) profileUpdates[colName] = t.handle;
        if (verifCol) profileUpdates[verifCol] = true;

        if (Object.keys(profileUpdates).length > 0 && t.user_id) {
          await supabaseAdmin
            .from("profiles")
            .update(profileUpdates)
            .eq("id", t.user_id);
        }

        updatedIds.push(t.id);
      }

      return NextResponse.json({
        success: true,
        approvedCount: updatedIds.length,
        message: `Successfully verified ${updatedIds.length} safe student handle claims.`
      });
    }

    if (!requestId || !action) {
      return NextResponse.json({ error: "Missing requestId or action" }, { status: 400 });
    }

    // Fetch the target request
    const { data: targetReq, error: reqErr } = await supabaseAdmin
      .from("handle_verifications")
      .select("id, user_id, student_id, platform, handle")
      .eq("id", requestId)
      .single();

    if (reqErr || !targetReq) {
      return NextResponse.json({ error: "Verification request not found." }, { status: 404 });
    }

    const userId = targetReq.user_id || targetReq.student_id;
    const normPlatform = (targetReq.platform || "").toLowerCase().trim();
    const handle = targetReq.handle;

    if (action === "approve") {
      // 1. Mark verified in handle_verifications
      const { error: updateErr } = await supabaseAdmin
        .from("handle_verifications")
        .update({
          status: "verified",
          verified_at: new Date().toISOString()
        })
        .eq("id", requestId);

      if (updateErr) throw updateErr;

      // 2. Update profiles table
      const colName = PLATFORM_COLUMN_MAP[normPlatform];
      const verifCol = VERIFIED_COLUMN_MAP[normPlatform];

      const profileUpdates: Record<string, any> = {};
      if (colName) profileUpdates[colName] = handle;
      if (verifCol) profileUpdates[verifCol] = true;

      if (Object.keys(profileUpdates).length > 0 && userId) {
        await supabaseAdmin
          .from("profiles")
          .update(profileUpdates)
          .eq("id", userId);
      }

      return NextResponse.json({
        success: true,
        status: "verified",
        message: `Approved and officially verified @${handle} on ${targetReq.platform}.`
      });
    }

    if (action === "reject") {
      const { error: rejectErr } = await supabaseAdmin
        .from("handle_verifications")
        .update({
          status: "rejected"
        })
        .eq("id", requestId);

      if (rejectErr) throw rejectErr;

      return NextResponse.json({
        success: true,
        status: "rejected",
        message: `Rejected verification request for @${handle}. Reason: ${rejectionReason || "Verification criteria not met"}.`
      });
    }

    return NextResponse.json({ error: `Unsupported action '${action}'` }, { status: 400 });
  } catch (err: any) {
    console.error("PATCH handle-requests error:", err);
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}
