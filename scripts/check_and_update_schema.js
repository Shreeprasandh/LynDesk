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
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing Supabase env vars.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function testColumns() {
  console.log("Inspecting columns on public.profiles table...");

  const testPayload = {
    bio: "Test bio",
    skills: "React, TypeScript",
    college_name: "SRM Easwari",
    github_url: "https://github.com/test",
    linkedin_url: "https://linkedin.com/in/test",
    portfolio_url: "https://portfolio.test",
    leetcode_username: "test_lc",
    codeforces_username: "test_cf",
    codechef_username: "test_cc",
    unstop_username: "test_us",
    hack2skill_username: "test_h2s",
    graduation_year: "2026",
    avatar_url: "https://avatar.test/img.png"
  };

  for (const [col, val] of Object.entries(testPayload)) {
    const { error } = await supabase
      .from("profiles")
      .update({ [col]: val })
      .eq("id", "00000000-0000-0000-0000-000000000000");

    if (error) {
      if (error.code === "PGRST204") {
        console.log(`❌ Column MISSING in DB schema: ${col}`);
      } else {
        console.log(`✓ Column EXISTS in DB schema: ${col} (${error.message})`);
      }
    } else {
      console.log(`✓ Column EXISTS in DB schema: ${col}`);
    }
  }
}

testColumns();
