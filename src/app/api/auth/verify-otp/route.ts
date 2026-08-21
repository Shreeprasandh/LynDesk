import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { verifyOtpCode } from "../../../lib/otpStore";
import { validatePassword } from "../../../lib/passwordValidation";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

export async function POST(request: Request) {
  try {
    const { input, otp, newPassword, confirmPassword } = await request.json();

    if (!input || !otp || !newPassword) {
      return NextResponse.json({ error: "Email, OTP code, and new password are required." }, { status: 400 });
    }

    const passRules = validatePassword(newPassword, confirmPassword);
    if (!passRules.isValid) {
      return NextResponse.json({ error: "Password does not satisfy security rules." }, { status: 400 });
    }

    const trimmedInput = input.trim();
    let targetEmail = trimmedInput.toLowerCase();
    let userId = "";

    const supabaseAdmin = createClient(supabaseUrl, serviceKey);

    // 1. Resolve email & user.id
    if (!trimmedInput.includes("@")) {
      const cleanUsername = trimmedInput.replace(/^@/, "").toLowerCase();
      const { data: prof } = await supabaseAdmin
        .from("profiles")
        .select("id, email")
        .eq("username", cleanUsername)
        .maybeSingle();

      if (prof?.id) {
        userId = prof.id;
        if (prof.email) targetEmail = prof.email;
      }
    }

    if (!userId) {
      const { data: authUsers } = await supabaseAdmin.auth.admin.listUsers();
      const matched = authUsers?.users?.find(
        (u) => u.email?.toLowerCase() === targetEmail || u.user_metadata?.username?.toLowerCase() === targetEmail.replace(/^@/, "")
      );
      if (matched) {
        userId = matched.id;
        if (matched.email) targetEmail = matched.email;
      }
    }

    if (!userId) {
      return NextResponse.json({ error: "User account not found." }, { status: 404 });
    }

    // 2. Verify OTP code against Supabase user metadata or memory store
    let isOtpValid = false;
    const { data: targetUser } = await supabaseAdmin.auth.admin.getUserById(userId);
    const meta = targetUser?.user?.user_metadata || {};
    const metaOtp = meta.reset_otp;
    const metaExpiry = meta.reset_otp_expiry ? Number(meta.reset_otp_expiry) : 0;
    const attempts = meta.reset_attempts ? Number(meta.reset_attempts) : 0;

    if (attempts >= 5) {
      // Lockout exceeded
      await supabaseAdmin.auth.admin.updateUserById(userId, {
        user_metadata: { ...meta, reset_otp: null, reset_otp_expiry: null, reset_attempts: 0 }
      });
      return NextResponse.json({ error: "Too many failed attempts. Please request a new OTP code." }, { status: 429 });
    }

    if (metaOtp && metaExpiry > Date.now()) {
      if (metaOtp.trim() === otp.trim()) {
        isOtpValid = true;
      } else {
        // Increment attempts
        await supabaseAdmin.auth.admin.updateUserById(userId, {
          user_metadata: { ...meta, reset_attempts: attempts + 1 }
        });
      }
    } else {
      // Check memory fallback
      isOtpValid = verifyOtpCode(targetEmail, otp);
    }

    if (!isOtpValid) {
      return NextResponse.json({ error: "Invalid or expired 6-digit OTP code." }, { status: 400 });
    }

    // 3. Update password via Supabase Admin API and wipe OTP metadata
    const cleanMeta = { ...meta };
    delete cleanMeta.reset_otp;
    delete cleanMeta.reset_otp_expiry;
    delete cleanMeta.reset_attempts;

    const { error: updateErr } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      password: newPassword,
      user_metadata: cleanMeta,
    });

    if (updateErr) {
      throw updateErr;
    }

    return NextResponse.json({
      success: true,
      message: "LynDesk Password successfully updated! You can now log in.",
    });
  } catch (err: any) {
    console.error("Verify OTP API error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to update password." },
      { status: 500 }
    );
  }
}
