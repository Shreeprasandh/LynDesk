import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { createClient } from "@supabase/supabase-js";
import { storeOtp } from "../../../lib/otpStore";
import { validateEmail } from "../../../lib/emailValidation";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

export async function POST(request: Request) {
  try {
    const { input } = await request.json();
    if (!input || typeof input !== "string") {
      return NextResponse.json({ error: "Email or username is required." }, { status: 400 });
    }

    const trimmed = input.trim();
    let targetEmail = trimmed.toLowerCase();

    // Initialize Supabase Admin client
    const supabaseAdmin = createClient(supabaseUrl, serviceKey);

    // If input is a username, resolve to email from profiles table
    if (!trimmed.includes("@")) {
      const cleanUsername = trimmed.replace(/^@/, "").toLowerCase();
      const { data: prof } = await supabaseAdmin
        .from("profiles")
        .select("id, email")
        .eq("username", cleanUsername)
        .maybeSingle();

      if (prof?.email) {
        targetEmail = prof.email;
      } else {
        // Fallback: search auth users list
        const { data: authUsers } = await supabaseAdmin.auth.admin.listUsers();
        const matched = authUsers?.users?.find(
          (u) => u.user_metadata?.username?.toLowerCase() === cleanUsername
        );
        if (matched?.email) {
          targetEmail = matched.email;
        } else {
          return NextResponse.json(
            { error: `No registered user found with username @${cleanUsername}.` },
            { status: 404 }
          );
        }
      }
    }

    // Validate email syntax & disposable domains
    const val = validateEmail(targetEmail);
    if (!val.isValidSyntax) {
      return NextResponse.json({ error: "Invalid email format." }, { status: 400 });
    }
    if (val.isDisposable) {
      return NextResponse.json({ error: "Disposable email addresses are not allowed." }, { status: 400 });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    storeOtp(targetEmail, otp);

    // Configure Nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>LynDesk Security OTP</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #05080e; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #05080e; padding: 40px 10px;">
          <tr>
            <td align="center">
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 520px; background-color: #0f172a; border: 1px solid #1e293b; border-radius: 12px; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);">
                
                <!-- Brand Header -->
                <tr>
                  <td style="padding: 32px 32px 24px 32px; border-bottom: 1px solid #1e293b; background: linear-gradient(180deg, #111b2e 0%, #0f172a 100%);">
                    <table width="100%" border="0" cellspacing="0" cellpadding="0">
                      <tr>
                        <td>
                          <div style="display: inline-block; vertical-align: middle; margin-right: 10px;">
                            <div style="width: 32px; height: 32px; background: linear-gradient(135deg, #0284c7 0%, #38bdf8 100%); border-radius: 6px; display: flex; align-items: center; justify-content: center; text-align: center; line-height: 32px; color: #ffffff; font-weight: bold; font-size: 16px;">L</div>
                          </div>
                          <span style="font-size: 20px; font-weight: 600; color: #f8fafc; letter-spacing: -0.5px; vertical-align: middle;">LynDesk</span>
                        </td>
                        <td align="right">
                          <span style="font-family: monospace; font-size: 10px; color: #38bdf8; text-transform: uppercase; letter-spacing: 2px; background: rgba(56, 189, 248, 0.1); padding: 4px 10px; border-radius: 4px; border: 1px solid rgba(56, 189, 248, 0.2);">SECURITY VAULT</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Content Body -->
                <tr>
                  <td style="padding: 32px;">
                    <h1 style="font-size: 22px; font-weight: 400; color: #f8fafc; margin: 0 0 12px 0; letter-spacing: -0.3px;">Password Reset Verification</h1>
                    <p style="font-size: 14px; color: #94a3b8; line-height: 1.6; margin: 0 0 28px 0; font-weight: 300;">
                      A security verification code was requested for your LynDesk account (<strong style="color: #cbd5e1; font-weight: 500;">${targetEmail}</strong>).
                    </p>

                    <!-- OTP Code Display Card -->
                    <div style="background-color: #090d16; border: 1px solid #334155; border-radius: 8px; padding: 24px; text-align: center; margin-bottom: 28px;">
                      <span style="font-family: monospace; font-size: 10px; color: #64748b; text-transform: uppercase; letter-spacing: 2px; display: block; margin-bottom: 12px;">Your 6-Digit Verification OTP</span>
                      <div style="font-family: 'Courier New', Courier, monospace; font-size: 36px; font-weight: 700; color: #f8fafc; letter-spacing: 10px; text-indent: 10px; line-height: 1.2;">
                        ${otp}
                      </div>
                    </div>

                    <p style="font-size: 12px; color: #64748b; line-height: 1.6; margin: 0; font-weight: 300;">
                      This OTP code is valid for <strong style="color: #94a3b8;">10 minutes</strong>. If you did not request a password reset, no action is required and your account remains fully secure.
                    </p>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="padding: 20px 32px; background-color: #090d16; border-top: 1px solid #1e293b; text-align: center;">
                    <p style="font-family: monospace; font-size: 10px; color: #475569; margin: 0; text-transform: uppercase; letter-spacing: 1.5px;">
                      Link Your Next Desk &bull; LynDesk Security Team
                    </p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    await transporter.sendMail({
      from: `"LynDesk Security" <${process.env.SMTP_USER}>`,
      to: targetEmail,
      subject: `[LynDesk] ${otp} is your 6-Digit Security Reset Code`,
      html: htmlContent,
    });

    return NextResponse.json({
      success: true,
      email: targetEmail,
      message: `Security OTP code sent to ${targetEmail}`,
    });
  } catch (err: any) {
    console.error("Nodemailer send OTP error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to dispatch email via Nodemailer SMTP." },
      { status: 500 }
    );
  }
}
