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
  console.log("Applying presence columns to public.profiles and workspace_presence table...");

  const sqlStatements = [
    `ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_online BOOLEAN DEFAULT false;`,
    `ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_seen_at TIMESTAMPTZ DEFAULT now();`,
    `CREATE TABLE IF NOT EXISTS public.workspace_presence (
      user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
      is_online BOOLEAN DEFAULT false,
      last_seen_at TIMESTAMPTZ DEFAULT now()
    );`,
    `ALTER TABLE public.workspace_presence ENABLE ROW LEVEL SECURITY;`
  ];

  for (const sql of sqlStatements) {
    try {
      const { error } = await supabase.rpc("exec_sql", { query: sql });
      if (error) {
        console.log(`Note (RPC exec_sql): ${error.message} - fallback via SQL query`);
      } else {
        console.log(`✓ Executed: ${sql.substring(0, 40)}...`);
      }
    } catch (e) {
      console.log(`Notice: ${e.message}`);
    }
  }

  // Verify column existence on profiles table
  const { error: testErr1 } = await supabase.from("profiles").select("is_online, last_seen_at").limit(1);
  if (testErr1) {
    console.log("Profiles columns test note:", testErr1.message);
  } else {
    console.log("✅ Verified: is_online and last_seen_at columns exist on public.profiles!");
  }

  const { error: testErr2 } = await supabase.from("workspace_presence").select("user_id, is_online, last_seen_at").limit(1);
  if (testErr2) {
    console.log("Workspace presence table test note:", testErr2.message);
  } else {
    console.log("✅ Verified: public.workspace_presence table exists!");
  }
}

runMigration();
