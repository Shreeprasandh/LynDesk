import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/app/lib/supabaseServer";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const rawBucket = (formData.get("bucket") as string) || "project-vaults";
    const ALLOWED_BUCKETS = ["project-vaults", "avatars"];
    const bucket = ALLOWED_BUCKETS.includes(rawBucket) ? rawBucket : "project-vaults";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Authorization credentials required" }, { status: 401 });
    }
    const token = authHeader.replace("Bearer ", "").trim();

    const supabaseAdmin = createAdminClient();
    const { data: { user }, error: authErr } = await supabaseAdmin.auth.getUser(token);
    if (authErr || !user) {
      return NextResponse.json({ error: "Invalid authentication session" }, { status: 401 });
    }

    const safeFileName = (file.name || "file").replace(/[^a-zA-Z0-9_.-]/g, "_");
    const rawPath = (formData.get("path") as string) || "";
    
    // Namespace paths by user.id to enforce tenant isolation
    let sanitizedPath: string;
    if (bucket === "avatars") {
      sanitizedPath = `${user.id}/avatar_${Date.now()}_${safeFileName}`;
    } else {
      const cleanSubPath = rawPath ? rawPath.replace(/\.\./g, "").replace(/^\/+/, "") : "";
      sanitizedPath = cleanSubPath 
        ? `${user.id}/${cleanSubPath}`
        : `uploads/${user.id}/${Date.now()}_${safeFileName}`;
    }

    const fileBuffer = Buffer.from(await file.arrayBuffer());

    const { error: uploadError } = await supabaseAdmin.storage
      .from(bucket)
      .upload(sanitizedPath, fileBuffer, {
        contentType: file.type || "application/octet-stream",
        upsert: true
      });

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 400 });
    }

    const { data: urlData } = supabaseAdmin.storage
      .from(bucket)
      .getPublicUrl(sanitizedPath);

    return NextResponse.json({
      success: true,
      publicUrl: urlData?.publicUrl || "",
      path: sanitizedPath
    });
  } catch (err: any) {
    console.error("Server upload route error:", err);
    return NextResponse.json({ error: err?.message || "Internal Server Error" }, { status: 500 });
  }
}
