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
  console.log("Applying public.wall_calendar_events table to Supabase...");

  const sqlStatements = [
    `CREATE TABLE IF NOT EXISTS public.wall_calendar_events (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      event_date DATE NOT NULL,
      event_time TEXT DEFAULT '12:00',
      category TEXT NOT NULL CHECK (category IN ('contest', 'deadline', 'study', 'opportunity', 'reminder')),
      description TEXT DEFAULT '',
      link TEXT DEFAULT '',
      source_type TEXT DEFAULT 'custom',
      source_id TEXT DEFAULT '',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );`,
    `CREATE INDEX IF NOT EXISTS idx_wall_calendar_user_date ON public.wall_calendar_events(user_id, event_date);`,
    `CREATE INDEX IF NOT EXISTS idx_wall_calendar_source ON public.wall_calendar_events(user_id, source_id);`,
    `ALTER TABLE public.wall_calendar_events ENABLE ROW LEVEL SECURITY;`
  ];

  for (const sql of sqlStatements) {
    try {
      const { error } = await supabase.rpc("exec_sql", { query: sql });
      if (error) {
        console.log(`Notice (RPC): ${error.message}`);
      } else {
        console.log(`✓ Executed: ${sql.substring(0, 45)}...`);
      }
    } catch (e) {
      console.log(`Notice: ${e.message}`);
    }
  }

  // Verify table accessibility via Supabase admin REST
  const { error: testErr } = await supabase.from("wall_calendar_events").select("id, title, event_date, category").limit(1);
  if (testErr) {
    console.log("⚠️ Table verification note:", testErr.message);
  } else {
    console.log("✅ Verified: public.wall_calendar_events table exists and is accessible!");
  }
}

runMigration();
