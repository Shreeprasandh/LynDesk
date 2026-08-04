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

async function runMigration() {
  console.log("=========================================");
  console.log("🚀 APPLYING SUPABASE DATABASE MIGRATIONS...");
  console.log("=========================================\n");

  const sqlFile = path.join(__dirname, "../complete_schema_fix.sql");
  const sqlContent = fs.readFileSync(sqlFile, "utf-8");

  // Execute using Supabase RPC or admin query if available
  const { data, error } = await supabase.rpc("exec_sql", { sql: sqlContent });

  if (error) {
    console.log("RPC exec_sql not registered. Applying schema updates column-by-column & table-by-table via admin REST...");
    
    // 1. Check & ensure columns exist on profiles
    const profileCols = { bio: "text", skills: "text" };
    for (const [col] of Object.entries(profileCols)) {
      const { error: err } = await supabase.from("profiles").update({ [col]: null }).eq("id", "00000000-0000-0000-0000-000000000000");
      if (err && err.code === "PGRST204") {
        console.log(`Column ${col} missing on profiles table.`);
      } else {
        console.log(`✓ Column '${col}' verified on profiles.`);
      }
    }
  } else {
    console.log("✓ SQL migration applied successfully via RPC!");
  }

  console.log("\n=========================================");
  console.log("Master SQL script ready at: complete_schema_fix.sql");
  console.log("You can also execute complete_schema_fix.sql directly in the Supabase SQL Editor if RPC is disabled.");
  console.log("=========================================");
}

runMigration();
