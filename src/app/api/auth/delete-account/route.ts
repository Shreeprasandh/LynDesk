import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import nodemailer from "nodemailer";

// Initialize Supabase Admin Client using the secure Service Role Key
const getAdminClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!url || !serviceKey) {
    console.warn("Supabase Admin key not fully configured. Using fallback client.");
    return null;
  }
  return createClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
};

// NodeMailer Gmail SMTP Transporter helper
const sendOtpEmail = async (email: string, otp: string) => {
  const smtpUser = process.env.SMTP_USER || "shreecode.service@gmail.com";
  const smtpPass = process.env.SMTP_PASS;

  if (!smtpPass) {
    console.warn("SMTP_PASS is not configured in .env.local. Falling back to console log only.");
    return false;
  }

  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true, // SSL
      auth: {
        user: smtpUser,
        pass: smtpPass
      }
    });

    await transporter.sendMail({
      from: `"LynDesk Security" <${smtpUser}>`,
      to: email,
      subject: "LynDesk Security - Verification OTP",
      text: `Your LynDesk security verification code is: ${otp}\n\nIf you did not initiate this request, please disregard this email.`,
      html: `
        <div style="font-family: monospace; border: 1px solid #ddd; padding: 28px; max-width: 460px; margin: 0 auto; background-color: #fafafa;">
          <h2 style="font-weight: normal; margin-top: 0; color: #111; letter-spacing: 0.15em; text-transform: uppercase; font-size: 14px; border-bottom: 1px solid #eee; padding-bottom: 12px;">LynDesk Security Portal</h2>
          <p style="font-size: 11px; color: #555; line-height: 1.6; margin-top: 16px;">To permanently delete your LynDesk developer profile and purge all linked account records, enter this single-use verification code in your browser validation box:</p>
          <div style="background-color: #111; color: #fff; text-align: center; padding: 18px; font-size: 26px; letter-spacing: 0.4em; font-weight: bold; margin: 24px 0; font-family: monospace;">
            ${otp}
          </div>
          <p style="font-size: 10px; color: #888; margin-bottom: 0; line-height: 1.4;">This security code is only valid for 10 minutes. If you did not make this request, please contact administrator support immediately.</p>
        </div>
      `
    });
    return true;
  } catch (error) {
    console.error("Nodemailer SMTP email delivery failed:", error);
    return false;
  }
};

export async function POST(request: Request) {
  try {
    const { action, otp } = await request.json();
    
    // 1. Get Auth Token
    const authHeader = request.headers.get("Authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Authorization credentials required" }, { status: 401 });
    }
    const token = authHeader.replace("Bearer ", "");

    const supabaseAdmin = getAdminClient();
    
    // Check fallback mode (if local DB is completely offline or keys are missing)
    if (!supabaseAdmin) {
      return NextResponse.json({ 
        error: "Server configuration missing: Admin database authorization is required to process secure account deletion operations." 
      }, { status: 503 });
    }

    // 2. Validate user identity using session token
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);
    if (userError || !user) {
      return NextResponse.json({ error: "Invalid authentication session" }, { status: 401 });
    }

    // 3. Handle Requesting Verification Code
    if (action === "request") {
      if (!user.email) {
        return NextResponse.json({ error: "No registered email address found for this user account" }, { status: 400 });
      }

      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const expiry = Date.now() + 10 * 60 * 1000; // 10 minutes from now

      // Store verification code & expiry in user metadata
      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
        user_metadata: { 
          ...user.user_metadata, 
          delete_account_otp: code,
          delete_account_otp_expiry: expiry
        }
      });

      if (updateError) throw updateError;

      // Dispatch real email via NodeMailer SMTP
      const emailSent = await sendOtpEmail(user.email, code);

      return NextResponse.json({ 
        success: true, 
        message: emailSent 
          ? "Verification code sent to your registered email."
          : "Verification code generated."
      });
    }

    // 4. Handle Verifying Code & Permanent Deletion
    if (action === "verify") {
      const storedOtp = user.user_metadata?.delete_account_otp;
      const storedExpiry = user.user_metadata?.delete_account_otp_expiry;
      
      const isExpired = storedExpiry ? Date.now() > Number(storedExpiry) : false;

      if (!otp || otp !== storedOtp || isExpired) {
        return NextResponse.json({ 
          error: isExpired 
            ? "Verification code has expired. Please request a new code." 
            : "Invalid verification code. Please check your email." 
        }, { status: 400 });
      }

      // Clear OTP metadata before deletion
      const updatedMeta = { ...user.user_metadata };
      delete updatedMeta.delete_account_otp;
      delete updatedMeta.delete_account_otp_expiry;
      await supabaseAdmin.auth.admin.updateUserById(user.id, { user_metadata: updatedMeta });

      // Delete public profile database record first
      await supabaseAdmin
        .from("profiles")
        .delete()
        .eq("id", user.id);

      // Permanently delete user account
      const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user.id);
      if (deleteError) throw deleteError;

      return NextResponse.json({ success: true, message: "Account deleted permanently." });
    }

    return NextResponse.json({ error: "Invalid action parameter" }, { status: 400 });

  } catch (error) {
    const msg = error instanceof Error ? error.message : "Internal system failure";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
