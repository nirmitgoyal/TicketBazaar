import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function addInstagramFields() {
  try {
    console.log("Adding Instagram authentication fields to users table...");

    // Add instagramId field if it doesn't exist
    try {
      await db.execute(sql`
        ALTER TABLE users 
        ADD COLUMN IF NOT EXISTS instagram_id TEXT UNIQUE
      `);
      console.log("✓ Added instagram_id column");
    } catch (error) {
      console.log("instagram_id column may already exist");
    }

    // Add instagramAccessToken field if it doesn't exist
    try {
      await db.execute(sql`
        ALTER TABLE users 
        ADD COLUMN IF NOT EXISTS instagram_access_token TEXT
      `);
      console.log("✓ Added instagram_access_token column");
    } catch (error) {
      console.log("instagram_access_token column may already exist");
    }

    console.log("Instagram fields added successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error adding Instagram fields:", error);
    process.exit(1);
  }
}

addInstagramFields();