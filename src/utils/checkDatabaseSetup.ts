/**
 * Database Setup Checker
 * Checks if all required tables exist in Supabase
 */

import { supabase } from "./supabaseClient";

export interface SetupCheckResult {
  isSetupComplete: boolean;
  tablesExist: Record<string, boolean>;
  missingTables: string[];
  sampleDataExists: boolean;
  departmentCount: number;
  hospitalCount: number;
  errors: string[];
  warnings: string[];
}

const REQUIRED_TABLES = [
  "department_users",
  "sos_alerts",
  "disaster_events",
  "hospitals",
  "weather_warnings",
  "analytics_summary",
];

/**
 * Check if database setup is complete
 */
export async function checkDatabaseSetup(): Promise<SetupCheckResult> {
  const result: SetupCheckResult = {
    isSetupComplete: false,
    tablesExist: {},
    missingTables: [],
    sampleDataExists: false,
    departmentCount: 0,
    hospitalCount: 0,
    errors: [],
    warnings: [],
  };

  console.log("🔍 Checking database setup...");

  // Check each table
  for (const tableName of REQUIRED_TABLES) {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select("*", { count: "exact", head: true });

      if (error) {
        console.error(`❌ Table ${tableName} check failed:`, error.message);
        result.tablesExist[tableName] = false;
        result.missingTables.push(tableName);
        result.errors.push(`Table ${tableName}: ${error.message}`);
      } else {
        console.log(`✅ Table ${tableName} exists`);
        result.tablesExist[tableName] = true;
      }
    } catch (error: any) {
      console.error(`❌ Error checking table ${tableName}:`, error);
      result.tablesExist[tableName] = false;
      result.missingTables.push(tableName);
      result.errors.push(`Table ${tableName}: ${error.message || "Unknown error"}`);
    }
  }

  // Check if sample data exists
  try {
    const { data: departments, error: deptError } = await supabase
      .from("department_users")
      .select("*", { count: "exact" });

    const { data: hospitals, error: hospError } = await supabase
      .from("hospitals")
      .select("*", { count: "exact" });

    if (!deptError && departments) {
      result.departmentCount = departments.length;
      if (departments.length < 4) {
        result.warnings.push(
          `Only ${departments.length}/4 department accounts found. Expected 4 pre-configured accounts.`
        );
        console.warn(
          `⚠️ Only ${departments.length} department accounts (expected 4)`
        );
      } else {
        console.log(`✅ Department accounts: ${departments.length}/4`);
      }
    } else if (deptError) {
      result.errors.push(`Failed to check department_users: ${deptError.message}`);
    }

    if (!hospError && hospitals) {
      result.hospitalCount = hospitals.length;
      if (hospitals.length < 8) {
        result.warnings.push(
          `Only ${hospitals.length}/8 hospitals found. Expected 8 NCR hospitals.`
        );
        console.warn(`⚠️ Only ${hospitals.length} hospitals (expected 8)`);
      } else {
        console.log(`✅ Hospitals: ${hospitals.length}/8`);
      }
    } else if (hospError) {
      result.errors.push(`Failed to check hospitals: ${hospError.message}`);
    }

    result.sampleDataExists = result.departmentCount >= 4 && result.hospitalCount >= 8;
  } catch (error: any) {
    console.warn("⚠️ Could not check sample data:", error);
    result.warnings.push(`Could not verify sample data: ${error.message || "Unknown error"}`);
  }

  // Determine if setup is complete
  result.isSetupComplete =
    result.missingTables.length === 0 && result.sampleDataExists;

  if (result.isSetupComplete) {
    console.log("✅ Database setup is COMPLETE!");
  } else {
    console.error("❌ Database setup is INCOMPLETE");
    console.error("Missing tables:", result.missingTables);
  }

  return result;
}

/**
 * Get setup instructions based on check result
 */
export function getSetupInstructions(result: SetupCheckResult): string {
  if (result.isSetupComplete) {
    return "✅ Database setup is complete! Everything is ready.";
  }

  let instructions = "⚠️ DATABASE SETUP REQUIRED\n\n";

  if (result.missingTables.length > 0) {
    instructions += `Missing tables: ${result.missingTables.join(", ")}\n\n`;
  }

  if (!result.sampleDataExists) {
    instructions += `Missing sample data:\n`;
    instructions += `  - Department accounts: ${result.departmentCount}/4\n`;
    instructions += `  - Hospitals: ${result.hospitalCount}/8\n\n`;
  }

  if (result.warnings.length > 0) {
    instructions += "Warnings:\n";
    result.warnings.forEach((warning) => {
      instructions += `  ⚠️ ${warning}\n`;
    });
    instructions += "\n";
  }

  instructions += `
TO FIX THIS:

1. Open Supabase Dashboard: https://app.supabase.com
2. Go to SQL Editor → New Query
3. Open /SUPABASE_REALTIME_SETUP.sql in your project
4. Copy ALL the SQL code (make sure you get everything!)
5. Paste into Supabase SQL Editor
6. Click RUN

This will insert the missing sample data.

Then:
7. Refresh your app

NOTE: Realtime/Replication is currently in early access.
If you don't have access yet, the app will work in polling mode.

See /SETUP_NOW.md for detailed instructions.
`;

  return instructions;
}

/**
 * Display setup status in console
 */
export async function displaySetupStatus() {
  console.log("=".repeat(60));
  console.log("🔍 BANTAYALERT DATABASE SETUP CHECK");
  console.log("=".repeat(60));

  const result = await checkDatabaseSetup();

  console.log("\nTABLE STATUS:");
  for (const [table, exists] of Object.entries(result.tablesExist)) {
    console.log(`  ${exists ? "✅" : "❌"} ${table}`);
  }

  console.log("\nSAMPLE DATA:");
  console.log(`  ${result.sampleDataExists ? "✅" : "❌"} Sample data loaded`);

  if (result.errors.length > 0) {
    console.log("\nERRORS:");
    result.errors.forEach((err) => console.log(`  ❌ ${err}`));
  }

  console.log("\n" + "=".repeat(60));
  console.log(getSetupInstructions(result));
  console.log("=".repeat(60));

  return result;
}

/**
 * Auto-check on import (for development)
 */
if (typeof window !== "undefined") {
  // Only run in browser
  displaySetupStatus().catch((error) => {
    console.error("Failed to check database setup:", error);
  });
}
