import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/app/lib/supabaseServer";

const MAX_SIZES: Record<string, number> = {
  book: 20 * 1024 * 1024,      // 20 MB (PDF)
  research: 20 * 1024 * 1024,  // 20 MB (PDF)
  music: 50 * 1024 * 1024,     // 50 MB (MP3/WAV)
  art: 10 * 1024 * 1024,       // 10 MB (PNG/JPG/WEBP)
  physical_product: 10 * 1024 * 1024 // 10 MB (PNG/JPG/WEBP)
};

const ALLOWED_MIME_TYPES: Record<string, string[]> = {
  book: ["application/pdf"],
  research: ["application/pdf"],
  music: ["audio/mpeg", "audio/mp3", "audio/wav", "audio/x-wav", "audio/aac"],
  art: ["image/png", "image/jpeg", "image/jpg", "image/webp"],
  physical_product: ["image/png", "image/jpeg", "image/jpg", "image/webp"]
};

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Authorization credentials required" },
        { status: 401 }
      );
    }
    const token = authHeader.replace("Bearer ", "").trim();

    const supabaseAdmin = createAdminClient();

    const {
      data: { user },
      error: authErr,
    } = await supabaseAdmin.auth.getUser(token);
    if (authErr || !user) {
      return NextResponse.json(
        { error: "Invalid authentication session" },
        { status: 401 }
      );
    }

    const { data: profile, error: profileErr } = await supabaseAdmin
      .from("profiles")
      .select("institute_id, college_linked_status")
      .eq("id", user.id)
      .single();

    if (profileErr || !profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }
    if (profile.college_linked_status !== "linked" || !profile.institute_id) {
      return NextResponse.json(
        { error: "College verification required to upload files" },
        { status: 403 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const category = (formData.get("category") as string) || "art";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const allowedMimes = ALLOWED_MIME_TYPES[category];
    if (allowedMimes && !allowedMimes.includes(file.type)) {
      return NextResponse.json(
        {
          error: `Invalid file format for category '${category}'. Allowed formats: ${allowedMimes.join(", ")}`,
        },
        { status: 400 }
      );
    }

    const maxSize = MAX_SIZES[category] || 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        {
          error: `File size exceeds the limit of ${Math.round(maxSize / (1024 * 1024))}MB.`,
        },
        { status: 400 }
      );
    }

    const safeFileName = (file.name || "file").replace(/[^a-zA-Z0-9_.-]/g, "_");
    const filePath = `${profile.institute_id}/${user.id}/${Date.now()}_${safeFileName}`;

    const buffer = Buffer.from(await file.arrayBuffer());

    // Upload to 'student-works' bucket
    const { error: uploadError } = await supabaseAdmin.storage
      .from("student-works")
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("[POST /api/works/upload] Storage upload failed:", uploadError.message);
      return NextResponse.json(
        { error: `Storage upload failed: ${uploadError.message}` },
        { status: 400 }
      );
    }

    const { data: urlData } = supabaseAdmin.storage
      .from("student-works")
      .getPublicUrl(filePath);

    return NextResponse.json({
      file_path: filePath,
      public_url: urlData?.publicUrl || filePath,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    console.error("[POST /api/works/upload] Error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
