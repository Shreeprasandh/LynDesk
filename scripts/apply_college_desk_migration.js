const { Client } = require("pg");
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

async function runMigration() {
  const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.SUPABASE_DB_URL;
  if (!connectionString) {
    console.log("No direct PostgreSQL connection string found in .env.local.");
    console.log("Using Supabase REST client or providing SQL script for execution.");
    return;
  }

  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log("Connected to PostgreSQL database successfully.");

    const migrationSql = fs.readFileSync(
      path.join(__dirname, "../supabase/migrations/20260905_college_desk_and_erp.sql"),
      "utf-8"
    );

    console.log("Executing migration: 20260905_college_desk_and_erp.sql ...");
    await client.query(migrationSql);
    console.log("✓ Migration executed successfully!");
  } catch (err) {
    console.error("Migration error:", err.message);
  } finally {
    await client.end();
  }
}

runMigration();
