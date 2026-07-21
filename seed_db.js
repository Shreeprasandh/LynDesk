/* eslint-disable */
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Load environment variables from .env.local manually to avoid external dotenv dependency
const envContent = fs.readFileSync('.env.local', 'utf-8');
const envConfig = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    const key = match[1];
    let val = match[2] || '';
    if (val.startsWith('"') && val.endsWith('"')) {
      val = val.substring(1, val.length - 1);
    }
    envConfig[key] = val.trim();
  }
});

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || envConfig.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || envConfig.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error("Missing process.env.NEXT_PUBLIC_SUPABASE_URL or process.env.SUPABASE_SERVICE_ROLE_KEY in environment or .env.local");
  process.exit(1);
}

// Initialize Supabase Client with Service Role Key (Admin rights)
const supabase = createClient(supabaseUrl, serviceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const firstNames = [
  "Aarav", "Aditya", "Akash", "Ananya", "Arjun", "Diya", "Isha", "Kabir", "Meera", "Neha",
  "Pranav", "Rohan", "Sanjana", "Sid", "Tanvi", "Vihaan", "Alex", "Emma", "Liam", "Olivia"
];

const lastNames = [
  "Sharma", "Verma", "Gupta", "Mehta", "Patel", "Sen", "Das", "Nair", "Iyer", "Rao",
  "Singh", "Kumar", "Smith", "Johnson", "Williams", "Brown", "Wilson", "Martinez", "Taylor", "Hernandez"
];

const departments = ["Information Technology", "Computer Science", "Electronics & Communication", "Software Engineering"];

function getRandomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function seed() {
  console.log("🧹 Cleaning up old seed users from auth.users first...");
  
  const { data: { users }, error: listErr } = await supabase.auth.admin.listUsers({
    perPage: 500
  });

  if (listErr) {
    console.error("Failed to list users:", listErr);
    return;
  }

  const seedUsersToDelete = users.filter(u => 
    u.email.endsWith('@srmeaswari.edu.in') || 
    u.email.endsWith('@iitd.ac.in') || 
    u.email.endsWith('@google.com')
  );

  console.log(`Found ${seedUsersToDelete.length} seed users to delete.`);
  for (const u of seedUsersToDelete) {
    try {
      await supabase.auth.admin.deleteUser(u.id);
    } catch (delErr) {
      console.error(`Failed deleting user ${u.id}:`, delErr);
    }
  }
  console.log("✅ Cleanup complete.");

  const createdLogins = [];

  async function createUser(type, domain, collegeName, collegeKey, companyKey) {
    const first = getRandomElement(firstNames);
    const last = getRandomElement(lastNames);
    const fullName = `${first} ${last}`;
    const username = `${first.toLowerCase()}_${last.toLowerCase()}_${Math.floor(Math.random() * 900 + 100)}`;
    const email = `${username}@${domain}`;
    const password = "testpassword123";

    console.log(`Creating user: ${email}...`);

    // 1. Create Auth User directly (marks as confirmed and active instantly!)
    const { data: { user }, error: createErr } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        avatar_url: ""
      }
    });

    if (createErr) {
      console.error(`Error creating user ${email}:`, createErr.message);
      return;
    }

    // Wait a brief moment for the handle_new_user trigger to execute and create the profiles entry
    await sleep(200);

    // 2. Update Profile with realistic details
    const credits = type === 'faculty' ? 0 : Math.floor(Math.random() * 50 + 10);
    const dept = type === 'employee' ? 'Engineering' : getRandomElement(departments);
    const gradYear = type === 'employee' ? null : (type === 'faculty' ? null : getRandomElement(['2026', '2027', '2028', '2029']));
    
    const github = `https://github.com/${username}`;
    const linkedin = `https://linkedin.com/in/${username}`;
    const portfolio = `https://${username}.github.io`;

    const { error: profileErr } = await supabase
      .from('profiles')
      .update({
        college_name: collegeName || null,
        department: dept,
        graduation_year: gradYear,
        academic_credits: credits,
        leetcode_username: `${username}_lc`,
        codeforces_username: `${username}_cf`,
        codechef_username: `${username}_cc`,
        github_url: github,
        linkedin_url: linkedin,
        portfolio_url: portfolio,
        college_key: collegeKey || null,
        company_key: companyKey || null
      })
      .eq('id', user.id);

    if (profileErr) {
      console.error(`Error updating profile for ${email}:`, profileErr.message);
    } else {
      createdLogins.push({ type, email, fullName, key: collegeKey || companyKey });
    }
  }

  // SRM Easwari (10 Students, 2 Faculty)
  console.log("\n🏫 Seeding SRM Easwari...");
  for (let i = 0; i < 10; i++) await createUser('student', 'srmeaswari.edu.in', 'SRM Easwari Engineering College', 'COLLEGE_SRM', null);
  for (let i = 0; i < 2; i++) await createUser('faculty', 'srmeaswari.edu.in', 'SRM Easwari Engineering College', 'COLLEGE_SRM_FACULTY', null);

  // IIT Delhi (5 Students, 2 Faculty)
  console.log("\n🎓 Seeding IIT Delhi...");
  for (let i = 0; i < 5; i++) await createUser('student', 'iitd.ac.in', 'Indian Institute of Technology Delhi', 'COLLEGE_IITD', null);
  for (let i = 0; i < 2; i++) await createUser('faculty', 'iitd.ac.in', 'Indian Institute of Technology Delhi', 'COLLEGE_IITD_FACULTY', null);

  // Google India (5 Employees, 2 Admin)
  console.log("\n🏢 Seeding Google India...");
  for (let i = 0; i < 5; i++) await createUser('employee', 'google.com', null, null, 'COMPANY_GOOGLE');
  for (let i = 0; i < 2; i++) await createUser('faculty', 'google.com', null, null, 'COMPANY_GOOGLE_ADMIN');

  console.log("\n🎉 Database successfully seeded via Admin API!");
  console.log("=========================================");
  console.log("Credentials (Password: testpassword123):");
  console.log("=========================================");
  
  const formatted = createdLogins.map(c => `* [${c.type.toUpperCase()}] ${c.fullName} - ${c.email} (Key: ${c.key || 'None'})`).join('\n');
  fs.writeFileSync('C:\\Users\\shree\\shree_projects\\eventtracker\\seed_logins.txt', formatted);
  console.log(formatted);
  console.log("\nLogs written to C:\\Users\\shree\\shree_projects\\eventtracker\\seed_logins.txt");
}

seed();
