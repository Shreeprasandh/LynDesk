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
    "codechef_username",
    "hackerrank_username",
    "hackerrank_verified",
    "geeksforgeeks_username",
    "geeksforgeeks_verified",
    "codeforces_username",
    "unstop_username",
    "devpost_username",
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
    "updated_at",
    "roll_number",
    "academic_year",
    "section",
    "batch_code",
    "college_linked_status",
    "grant_share_permission",
    "placement_consent",
    "institute_id"
  ],
  consent_log: [
    "id",
    "student_id",
    "consent_type",
    "granted",
    "ip_hash",
    "changed_at"
  ],
  college_structures: [
    "id",
    "institute_id",
    "academic_year",
    "department",
    "section",
    "roll_start",
    "roll_end",
    "expected_students",
    "created_at",
    "updated_at"
  ],
  college_admins: [
    "id",
    "institute_id",
    "email",
    "password_hash",
    "full_name",
    "totp_secret",
    "totp_enabled",
    "is_active",
    "last_login_at",
    "created_at"
  ],
  staff_accounts: [
    "id",
    "institute_id",
    "name",
    "email",
    "passkey_hash",
    "role",
    "department_scope",
    "assigned_sections",
    "assigned_years",
    "is_active",
    "last_login_at",
    "created_at"
  ],
  recruiter_keys: [
    "id",
    "institute_id",
    "company_name",
    "pin_hash",
    "created_by",
    "expires_at",
    "is_active",
    "last_accessed_at",
    "created_at"
  ],
  institutional_audit_logs: [
    "id",
    "institute_id",
    "actor_type",
    "actor_id",
    "actor_name",
    "action_type",
    "description",
    "ip_hash",
    "metadata",
    "created_at"
  ],
  staff_broadcasts: [
    "id",
    "institute_id",
    "staff_id",
    "staff_name",
    "title",
    "body",
    "priority",
    "attachment_url",
    "target_type",
    "target_scope",
    "scheduled_at",
    "sent_at",
    "created_at"
  ],
  broadcast_receipts: [
    "id",
    "broadcast_id",
    "student_id",
    "delivered_at",
    "read_at"
  ],
  staff_recommended_events: [
    "id",
    "institute_id",
    "staff_id",
    "title",
    "category",
    "url",
    "deadline",
    "location",
    "level",
    "description",
    "target_scope",
    "is_active",
    "created_at"
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
  ],
  wall_calendar_events: [
    "id",
    "user_id",
    "title",
    "event_date",
    "event_time",
    "category",
    "description",
    "link",
    "source_type",
    "source_id",
    "created_at"
  ],
  study_paths: [
    "id",
    "user_id",
    "title",
    "description",
    "depth_mode",
    "upload_mode",
    "total_lessons",
    "completed_lessons",
    "xp_earned",
    "is_active",
    "created_at"
  ],
  study_mistakes: [
    "id",
    "user_id",
    "path_id",
    "lesson_id",
    "question_type",
    "question_prompt",
    "correct_answer",
    "user_answer",
    "created_at"
  ],
  user_dsa_progress: [
    "id",
    "user_id",
    "track_id",
    "problem_id",
    "status",
    "is_starred",
    "notes",
    "completed_at"
  ],
  workspace_presence: [
    "workspace_id",
    "user_id",
    "status_text",
    "is_online",
    "last_seen_at"
  ],
  student_works: [
    "id",
    "institute_id",
    "student_id",
    "title",
    "category",
    "description",
    "is_published",
    "external_url",
    "file_path",
    "is_alias",
    "alias_proof_path",
    "status",
    "ai_verdict",
    "ai_verified_at",
    "rejection_reason",
    "views",
    "average_rating",
    "rating_count",
    "tags",
    "how_to_use",
    "embed_url",
    "expires_at",
    "renewed_at",
    "created_at",
    "updated_at"
  ],
  student_work_ratings: [
    "id",
    "work_id",
    "rater_id",
    "rating",
    "created_at"
  ],
  student_work_views: [
    "id",
    "work_id",
    "viewer_id",
    "viewed_at"
  ],
  student_work_staff_reviews: [
    "id",
    "work_id",
    "reviewed_by",
    "decision",
    "review_note",
    "reviewed_at"
  ],
  user_hackathon_applications: [
    "id",
    "user_id",
    "event_id",
    "title",
    "portal",
    "portal_url",
    "handle",
    "role",
    "status",
    "stage",
    "deadline",
    "workspace_id",
    "created_at",
    "updated_at"
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
      if (
        tableError.code === "PGRST205" || 
        tableError.message.includes("does not exist") || 
        tableError.message.includes("schema cache") ||
        tableError.code === "42P01"
      ) {
        console.log(`❌ Table MISSING: ${table}`);
        missingTables.push(table);
        continue;
      }
    }

    console.log(`✓ Table EXISTS: ${table}`);

    for (const col of cols) {
      const { error: colError } = await supabase
        .from(table)
        .select(col)
        .limit(1);

      if (colError && (colError.code === "PGRST204" || colError.message.includes("does not exist"))) {
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
