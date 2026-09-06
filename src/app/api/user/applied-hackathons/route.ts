import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

function createAdminClient() {
  return createClient(supabaseUrl, serviceRoleKey);
}

const CreateApplicationSchema = z.object({
  title: z.string().min(1, "Hackathon title is required"),
  portal: z.string().optional().default("Unstop"),
  portal_url: z.string().optional(),
  handle: z.string().optional().nullable(),
  role: z.string().optional().default("Participant"),
  status: z.string().optional().default("Applied"),
  stage: z.string().optional().default("Round 1"),
  deadline: z.string().optional().nullable(),
  event_id: z.string().optional().nullable(),
  create_workspace: z.boolean().optional().default(false)
});

const UpdateApplicationSchema = z.object({
  id: z.string().min(1, "Application ID is required"),
  title: z.string().optional(),
  portal: z.string().optional(),
  portal_url: z.string().optional(),
  status: z.string().optional(),
  stage: z.string().optional(),
  role: z.string().optional(),
  deadline: z.string().optional().nullable()
});

const DeleteApplicationQuerySchema = z.object({
  id: z.string().min(1, "Application ID is required")
});

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

    const rawBody = await req.json();
    const parsed = CreateApplicationSchema.safeParse(rawBody);
    if (!parsed.success) {
      return NextResponse.json({ 
        error: "Invalid request payload", 
        details: parsed.error.format() 
      }, { status: 400 });
    }

    const {
      title,
      portal,
      portal_url,
      handle,
      role,
      status,
      stage,
      deadline,
      event_id,
      create_workspace
    } = parsed.data;

    const safePortalUrl = portal_url && portal_url.trim()
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

    const rawBody = await req.json();
    const parsed = UpdateApplicationSchema.safeParse(rawBody);
    if (!parsed.success) {
      return NextResponse.json({ 
        error: "Invalid request payload", 
        details: parsed.error.format() 
      }, { status: 400 });
    }

    const { id, title, portal, portal_url, status, stage, role, deadline } = parsed.data;

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

    const searchParams = req.nextUrl.searchParams;
    const parsedQuery = DeleteApplicationQuerySchema.safeParse({
      id: searchParams.get("id")
    });

    if (!parsedQuery.success) {
      return NextResponse.json({ error: "Application ID is required." }, { status: 400 });
    }

    const { id } = parsedQuery.data;

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
