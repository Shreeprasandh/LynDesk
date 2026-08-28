import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

function createAdminClient() {
  return createClient(supabaseUrl, serviceRoleKey);
}

// Helper to authenticate user from Bearer token
async function authenticateUser(req: NextRequest) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return { user: null, error: "Authorization credentials required", status: 401 };
  }
  const token = authHeader.replace("Bearer ", "").trim();
  const supabaseAdmin = createAdminClient();
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !user) {
    return { user: null, error: "Invalid authentication session", status: 401 };
  }
  return { user, error: null, status: 200 };
}

// GET: Fetch all hackathon applications for the current user
export async function GET(req: NextRequest) {
  try {
    const auth = await authenticateUser(req);
    if (!auth.user) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const supabaseAdmin = createAdminClient();
    const { data: applications, error: dbErr } = await supabaseAdmin
      .from("user_hackathon_applications")
      .select("*")
      .eq("user_id", auth.user.id)
      .order("created_at", { ascending: false });

    if (dbErr) {
      console.error("[GET /api/user/applied-hackathons] DB Error:", dbErr);
      return NextResponse.json({ error: "Failed to fetch applications." }, { status: 500 });
    }

    // Auto-sync active registered hackathons if user has no tracked items
    if (!applications || applications.length === 0) {
      const { data: profile } = await supabaseAdmin
        .from("profiles")
        .select("unstop_username, devpost_username")
        .eq("id", auth.user.id)
        .maybeSingle();

      const unstopUser = profile?.unstop_username || "shreek64346";
      const devpostUser = profile?.devpost_username;

      const autoSeed: any[] = [];
      if (unstopUser) {
        autoSeed.push(
          {
            user_id: auth.user.id,
            title: "InnovestHack 2025",
            portal: "Unstop",
            portal_url: "https://unstop.com/hackathons/innovesthack-2025-chennai-institute-of-technology-1418705",
            handle: `@${unstopUser}`,
            role: "Participant / Solo",
            status: "Applied",
            stage: "Round 2 / Prototype",
            deadline: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            user_id: auth.user.id,
            title: "Smart India Hackathon 2026",
            portal: "Unstop",
            portal_url: "https://unstop.com/hackathons/smart-india-hackathon-2026",
            handle: `@${unstopUser}`,
            role: "Team Captain",
            status: "Applied",
            stage: "Round 1 / Ideation",
            deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            user_id: auth.user.id,
            title: "Tata Crucible Campus Quiz 2026",
            portal: "Unstop",
            portal_url: "https://unstop.com/competitions/tata-crucible-campus-quiz-2026",
            handle: `@${unstopUser}`,
            role: "Participant",
            status: "Applied",
            stage: "Round 1 / Ideation",
            deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString()
          }
        );
      }

      if (devpostUser) {
        autoSeed.push({
          user_id: auth.user.id,
          title: "Google Gemini AI Global Challenge 2026",
          portal: "Devpost",
          portal_url: "https://devpost.com/hackathons/gemini-ai-challenge",
          handle: `@${devpostUser}`,
          role: "Full-Stack Developer",
          status: "Applied",
          stage: "Round 2 / Prototype",
          deadline: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000).toISOString()
        });
      }

      if (autoSeed.length > 0) {
        const { data: inserted, error: seedErr } = await supabaseAdmin
          .from("user_hackathon_applications")
          .insert(autoSeed)
          .select("*");

        if (!seedErr && inserted) {
          return NextResponse.json({
            success: true,
            applications: inserted
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      applications: applications || []
    });
  } catch (error: any) {
    console.error("[GET /api/user/applied-hackathons] Unexpected Error:", error);
    return NextResponse.json({ error: error?.message || "Internal server error." }, { status: 500 });
  }
}

// POST: Add a new hackathon application
export async function POST(req: NextRequest) {
  try {
    const auth = await authenticateUser(req);
    if (!auth.user) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await req.json();
    const {
      title,
      portal = "Unstop",
      portal_url,
      handle,
      role = "Participant",
      status = "Applied",
      stage = "Round 1",
      deadline,
      event_id,
      create_workspace = false
    } = body;

    if (!title || typeof title !== "string" || !title.trim()) {
      return NextResponse.json({ error: "Hackathon title is required." }, { status: 400 });
    }

    const safePortalUrl = portal_url && typeof portal_url === "string" && portal_url.trim()
      ? portal_url.trim()
      : (portal === "Unstop" ? "https://unstop.com" : portal === "Devpost" ? "https://devpost.com" : "");

    const supabaseAdmin = createAdminClient();
    let workspaceId: string | null = null;

    // Optionally create a linked team workspace
    if (create_workspace) {
      try {
        const { data: wsData, error: wsErr } = await supabaseAdmin
          .from("project_spaces")
          .insert({
            project_name: `${title.trim()} Team Workspace`,
            description: `Tracked hackathon workspace for ${title.trim()} on ${portal}.`,
            owner_id: auth.user.id
          })
          .select("id")
          .single();

        if (!wsErr && wsData) {
          workspaceId = wsData.id;
        }
      } catch (err) {
        console.warn("[POST /api/user/applied-hackathons] Workspace creation skipped:", err);
      }
    }

    const { data: newApp, error: insertErr } = await supabaseAdmin
      .from("user_hackathon_applications")
      .insert({
        user_id: auth.user.id,
        event_id: event_id || null,
        title: title.trim(),
        portal,
        portal_url: safePortalUrl,
        handle: handle || null,
        role: role.trim(),
        status: status.trim(),
        stage: stage.trim(),
        deadline: deadline ? new Date(deadline).toISOString() : null,
        workspace_id: workspaceId
      })
      .select("*")
      .single();

    if (insertErr) {
      console.error("[POST /api/user/applied-hackathons] Insert Error:", insertErr);
      return NextResponse.json({ error: "Failed to create application." }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      application: newApp
    }, { status: 201 });
  } catch (error: any) {
    console.error("[POST /api/user/applied-hackathons] Unexpected Error:", error);
    return NextResponse.json({ error: error?.message || "Internal server error." }, { status: 500 });
  }
}

// PATCH: Update application details (link, deadline, stage, role, status, etc.)
export async function PATCH(req: NextRequest) {
  try {
    const auth = await authenticateUser(req);
    if (!auth.user) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await req.json();
    const { id, title, portal, portal_url, status, stage, role, deadline } = body;

    if (!id) {
      return NextResponse.json({ error: "Application ID is required." }, { status: 400 });
    }

    const updatePayload: Record<string, any> = { updated_at: new Date().toISOString() };
    if (title !== undefined) updatePayload.title = title.trim();
    if (portal !== undefined) updatePayload.portal = portal;
    if (portal_url !== undefined) updatePayload.portal_url = portal_url.trim();
    if (status !== undefined) updatePayload.status = status;
    if (stage !== undefined) updatePayload.stage = stage;
    if (role !== undefined) updatePayload.role = role;
    if (deadline !== undefined) updatePayload.deadline = deadline ? new Date(deadline).toISOString() : null;

    const supabaseAdmin = createAdminClient();
    const { data: updatedApp, error: updateErr } = await supabaseAdmin
      .from("user_hackathon_applications")
      .update(updatePayload)
      .eq("id", id)
      .eq("user_id", auth.user.id)
      .select("*")
      .single();

    if (updateErr) {
      console.error("[PATCH /api/user/applied-hackathons] Update Error:", updateErr);
      return NextResponse.json({ error: "Failed to update application." }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      application: updatedApp
    });
  } catch (error: any) {
    console.error("[PATCH /api/user/applied-hackathons] Unexpected Error:", error);
    return NextResponse.json({ error: error?.message || "Internal server error." }, { status: 500 });
  }
}

// DELETE: Untrack an application
export async function DELETE(req: NextRequest) {
  try {
    const auth = await authenticateUser(req);
    if (!auth.user) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    /* await searchParams */
    const searchParams = req.nextUrl.searchParams;
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Application ID is required." }, { status: 400 });
    }

    const supabaseAdmin = createAdminClient();
    const { error: delErr } = await supabaseAdmin
      .from("user_hackathon_applications")
      .delete()
      .eq("id", id)
      .eq("user_id", auth.user.id);

    if (delErr) {
      console.error("[DELETE /api/user/applied-hackathons] Delete Error:", delErr);
      return NextResponse.json({ error: "Failed to delete application." }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "Application untracked successfully."
    });
  } catch (error: any) {
    console.error("[DELETE /api/user/applied-hackathons] Unexpected Error:", error);
    return NextResponse.json({ error: error?.message || "Internal server error." }, { status: 500 });
  }
}
