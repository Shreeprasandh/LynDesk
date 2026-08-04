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

// Map of tables and candidate columns queried across application
const tableColumns = {
  profiles: [
    "id",
    "username",
    "full_name",
    "avatar_url",
    "academic_credits",
    "is_profile_public",
    "leetcode_username",
    "codeforces_username",
    "codechef_username",
    "unstop_username",
    "hack2skill_username",
    "college_key",
    "company_key",
    "department",
    "graduation_year",
    "github_url",
    "linkedin_url",
    "portfolio_url",
    "leetcode_daily_completed",
    "bio",
    "skills",
    "college_name",
    "updated_at"
  ],
  institutes: [
    "id",
    "name",
    "email_domain",
    "logo_url",
    "created_at"
  ],
  friendships: [
    "id",
    "sender_id",
    "receiver_id",
    "status",
    "sender_restricted",
    "receiver_restricted",
    "created_at"
  ],
  events: [
    "id",
    "title",
    "description",
    "category",
    "deadline",
    "location",
    "level",
    "url",
    "faculty_recommended",
    "created_at"
  ],
  project_spaces: [
    "id",
    "project_name",
    "tagline",
    "github_repo",
    "stage",
    "current_stage",
    "tech_stack",
    "created_by",
    "updated_at"
  ],
  project_members: [
    "id",
    "project_space_id",
    "profile_id",
    "role",
    "joined_at"
  ],
  workspace_artifacts: [
    "id",
    "workspace_id",
    "title",
    "type",
    "content",
    "created_by",
    "created_at"
  ],
  workspace_tasks: [
    "id",
    "workspace_id",
    "title",
    "assignee_id",
    "completed",
    "created_at"
  ],
  workspace_notes: [
    "id",
    "workspace_id",
    "content",
    "author_id",
    "created_at"
  ],
  credit_applications: [
    "id",
    "student_id",
    "project_space_id",
    "credit_points",
    "status",
    "created_at"
  ],
  handle_verifications: [
    "id",
    "student_id",
    "platform",
    "handle",
    "status",
    "created_at"
  ]
};

async function auditDB() {
  console.log("=========================================");
  console.log("🌑 DB SCHEMA COMPREHENSIVE AUDIT REPORT");
  console.log("=========================================\n");

  const missingColumns = [];
  const missingTables = [];

  for (const [table, cols] of Object.entries(tableColumns)) {
    // Check if table exists
    const { error: tableError } = await supabase
      .from(table)
      .select("*")
      .limit(1);

    if (tableError) {
      if (tableError.code === "PGRST205" || tableError.message.includes("does not exist") || tableError.code === "42P01") {
        console.log(`❌ Table MISSING: ${table}`);
        missingTables.push(table);
        continue;
      }
    }

    console.log(`✓ Table EXISTS: ${table}`);

    for (const col of cols) {
      const { error: colError } = await supabase
        .from(table)
        .update({ [col]: null })
        .eq("id", "00000000-0000-0000-0000-000000000000");

      if (colError && colError.code === "PGRST204") {
        console.log(`   ❌ Column MISSING in '${table}': ${col}`);
        missingColumns.push({ table, col });
      }
    }
  }

  console.log("\n=========================================");
  console.log("SUMMARY OF MISSING DB ASSETS:");
  console.log(`Missing Tables: ${missingTables.length}`);
  console.log(`Missing Columns: ${missingColumns.length}`);
  console.log("=========================================");
  console.log(JSON.stringify({ missingTables, missingColumns }, null, 2));
}

auditDB();
