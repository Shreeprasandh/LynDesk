const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");

function loadEnv() {
  const envPath = path.join(__dirname, "../.env.local");
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, "utf-8").split("\n");
    for (const line of lines) {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let val = match[2] || "";
        if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
        process.env[key] = val.trim();
      }
    }
  }
}

loadEnv();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log("Supabase URL:", supabaseUrl);

const supabaseAnon = createClient(supabaseUrl, anonKey);
const supabaseAdmin = createClient(supabaseUrl, serviceKey);

async function diagnose() {
  console.log("\n--- Testing Notifications Query (Anon Client) ---");
  const { data: nData, error: nErr } = await supabaseAnon
    .from("notifications")
    .select("*")
    .limit(1);

  if (nErr) {
    console.log("❌ Anon Notifications Error:", nErr.code, nErr.message);
  } else {
    console.log("✓ Anon Notifications Success! Rows:", nData?.length);
  }

  console.log("\n--- Testing Profiles Avatar Query (Anon Client) ---");
  const { data: pData, error: pErr } = await supabaseAnon
    .from("profiles")
    .select("avatar_url")
    .limit(1);

  if (pErr) {
    console.log("❌ Anon Profiles Error:", pErr.code, pErr.message);
  } else {
    console.log("✓ Anon Profiles Success! Rows:", pData?.length);
  }
}

diagnose();
