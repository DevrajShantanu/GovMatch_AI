import { createClient } from "@supabase/supabase-js";
import { REAL_INTERNSHIPS } from "../lib/real-data";
import * as fs from "fs";
import * as path from "path";

// Manually load .env.local
const envPath = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, "utf8");
  envConfig.split("\n").forEach((line) => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      const key = match[1];
      let value = match[2] || "";
      if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
      process.env[key] = value;
    }
  });
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing Supabase environment variables.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function seed() {
  console.log("🌱 Starting database seed...");

  // 1. Wipe existing internships
  console.log("Deleting existing internships...");
  const { error: deleteError } = await supabase
    .from("internships")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000"); // Deletes all rows

  if (deleteError) {
    console.error("Failed to delete existing internships:", deleteError);
    return;
  }

  // 2. Insert REAL_INTERNSHIPS
  console.log(`Inserting ${REAL_INTERNSHIPS.length} real internships...`);
  const { data, error: insertError } = await supabase
    .from("internships")
    .insert(REAL_INTERNSHIPS)
    .select();

  if (insertError) {
    console.error("Failed to insert new internships:", insertError);
    return;
  }

  console.log("✅ Seeding completed successfully!");
  console.log(`Inserted ${data.length} records.`);
}

seed().catch(console.error);
