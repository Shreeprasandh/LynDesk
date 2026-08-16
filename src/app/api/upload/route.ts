import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const rawBucket = (formData.get("bucket") as string) || "project-vaults";
    const ALLOWED_BUCKETS = ["project-vaults", "avatars"];
    const bucket = ALLOWED_BUCKETS.includes(rawBucket) ? rawBucket : "project-vaults";

    const rawPath = (formData.get("path") as string) || "";
    const safeFileName = (file?.name || "file").replace(/[^a-zA-Z0-9_.-]/g, "_");
    const sanitizedPath = rawPath 
      ? rawPath.replace(/\.\./g, "").replace(/^\/+/, "")
      : `uploads/${Date.now()}_${safeFileName}`;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Authorization credentials required" }, { status: 401 });
    }
    const token = authHeader.replace("Bearer ", "");

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json({ error: "Missing Supabase server configuration" }, { status: 500 });
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    const { data: { user }, error: authErr } = await supabaseAdmin.auth.getUser(token);
    if (authErr || !user) {
      return NextResponse.json({ error: "Invalid authentication session" }, { status: 401 });
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
    return NextResponse.json({ error: err.message || "Internal Server Error" }, { status: 500 });
  }
}
