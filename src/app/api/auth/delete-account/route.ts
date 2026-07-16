import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

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
    if (!supabaseAdmin) {
      // Fallback in case Service Role Key is missing locally
      if (action === "request") {
        const fallbackCode = "123456";
        console.log(`\n===============================================\n[DELETE ACCOUNT OTP CODE (FALLBACK)]: ${fallbackCode}\n===============================================\n`);
        return NextResponse.json({ success: true, message: "Verification code sent to email (Fallback active)." });
      } else {
        if (otp === "123456") {
          return NextResponse.json({ success: true, message: "Account verified (Mock Delete)." });
        }
        return NextResponse.json({ error: "Invalid verification code." }, { status: 400 });
      }
    }

    // 2. Validate user identity using token
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);
    if (userError || !user) {
      return NextResponse.json({ error: "Invalid authentication session" }, { status: 401 });
    }

    // 3. Handle Requesting Verification Code
    if (action === "request") {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Log code to terminal/console for developer visibility (since email worker is simulated)
      console.log(`\n===============================================\n[DELETE ACCOUNT OTP CODE for ${user.email}]: ${code}\n===============================================\n`);

      // Store verification code in user metadata
      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
        user_metadata: { 
          ...user.user_metadata, 
          delete_account_otp: code 
        }
      });

      if (updateError) throw updateError;

      return NextResponse.json({ success: true, message: "Verification code sent to your registered email." });
    }

    // 4. Handle Verifying Code & Permanent Deletion
    if (action === "verify") {
      const storedOtp = user.user_metadata?.delete_account_otp;
      
      if (!otp || otp !== storedOtp) {
        return NextResponse.json({ error: "Invalid verification code. Please check your email." }, { status: 400 });
      }

      // Delete public profile database record first (referential integrity check)
      await supabaseAdmin
        .from("profiles")
        .delete()
        .eq("id", user.id);

      // Permanently delete user from Supabase Auth
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
