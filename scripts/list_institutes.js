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
const supabase = createClient(supabaseUrl, serviceRoleKey);

const crypto = require("crypto");

function hash(str) {
  return crypto.createHash("sha256").update(str).digest("hex");
}

async function seedAndVerify() {
  console.log("Seeding Master Institutional Accounts...");

  const instId = "00000000-0000-0000-0000-000000000001";
  
  // 1. Institutes
  const { data: instData, error: instErr } = await supabase.from("institutes").upsert({
    id: instId,
    name: "SRM Institute of Science and Technology",
    email_domain: "srmist.edu.in",
    logo_url: "https://images.unsplash.com/photo-1562774053-701939374585?w=128&auto=format&fit=crop&q=80"
  }).select();
  console.log("Institute upsert:", instErr ? instErr.message : "SUCCESS");

  // 2. College Admins (admin@srmist.edu.in)
  const passHash = hash("Admin@LynDesk2026");
  const adminId = "00000000-0000-0000-0000-000000000001";
  const { error: admErr } = await supabase.from("college_admins").upsert({
    id: adminId,
    institute_id: instId,
    email: "admin@srmist.edu.in",
    password_hash: passHash,
    full_name: "Dr. K. Rangarajan (Dean of Engineering)",
    is_active: true
  });
  console.log("College Admin upsert:", admErr ? admErr.message : "SUCCESS");

  // 3. Staff Accounts
  const staffToSeed = [
    { id: "00000000-0000-0000-0000-000000000001", institute_id: instId, name: "Main Administrator", email: "admin@srmist.edu.in", passkey_hash: hash("ADMIN"), role: "coordinator", department_scope: "All", is_active: true },
    { id: "00000000-0000-0000-0000-000000000002", institute_id: instId, name: "Dr. S. Malathi", email: "hod.it@srmist.edu.in", passkey_hash: hash("HOD_IT_2026"), role: "hod", department_scope: "Information Technology", is_active: true },
    { id: "00000000-0000-0000-0000-000000000003", institute_id: instId, name: "Dr. N. Balamurugan", email: "hod.cse@srmist.edu.in", passkey_hash: hash("HOD_CSE_2026"), role: "hod", department_scope: "Computer Science and Engineering", is_active: true },
    { id: "00000000-0000-0000-0000-000000000004", institute_id: instId, name: "Prof. R. Venkatesh", email: "coordinator.it@srmist.edu.in", passkey_hash: hash("COORD_SEC_E"), role: "coordinator", department_scope: "Information Technology", is_active: true }
  ];

  for (const stf of staffToSeed) {
    const { error: stfErr } = await supabase.from("staff_accounts").upsert(stf);
    console.log("Staff " + stf.name + " upsert:", stfErr ? stfErr.message : "SUCCESS");
  }

  // 4. Recruiter Keys
  const futureExpiry = new Date(Date.now() + 180 * 86400000).toISOString();
  const recruitersToSeed = [
    { id: "00000000-0000-0000-0000-000000000010", institute_id: instId, company_name: "Google India", pin_hash: hash("847291"), is_active: true, expires_at: futureExpiry },
    { id: "00000000-0000-0000-0000-000000000011", institute_id: instId, company_name: "Microsoft", pin_hash: hash("301984"), is_active: true, expires_at: futureExpiry },
    { id: "00000000-0000-0000-0000-000000000012", institute_id: instId, company_name: "Amazon Campus", pin_hash: hash("592014"), is_active: true, expires_at: futureExpiry }
  ];

  for (const rec of recruitersToSeed) {
    const { error: recErr } = await supabase.from("recruiter_keys").upsert(rec);
    console.log("Recruiter " + rec.company_name + " upsert:", recErr ? recErr.message : "SUCCESS");
  }

  console.log("--- SEEDING COMPLETE ---");
}

seedAndVerify();
