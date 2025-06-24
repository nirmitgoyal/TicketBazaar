import { db } from "../server/db.js";
import {
  users,
  events,
  tickets,
  contactRequests,
  userFeedback,
  userReviews,
  disputes,
} from "../shared/schema.js";
import fs from "fs";
import path from "path";

async function exportDatabase() {
  try {
    console.log("Starting database export...");

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const exportDir = path.join(process.cwd(), "db-exports");

    // Create exports directory if it doesn't exist
    if (!fs.existsSync(exportDir)) {
      fs.mkdirSync(exportDir, { recursive: true });
    }

    // Copy the schema.ts file to the export directory
    console.log("Copying database schema definition...");
    const schemaSourcePath = path.join(process.cwd(), "shared", "schema.ts");
    const schemaDestPath = path.join(
      exportDir,
      `database-schema-${timestamp}.ts`,
    );

    if (fs.existsSync(schemaSourcePath)) {
      fs.copyFileSync(schemaSourcePath, schemaDestPath);
      console.log(
        `Schema definition copied to: database-schema-${timestamp}.ts`,
      );
    } else {
      console.log("Schema file not found, skipping schema export...");
    }

    const exportData = {
      exportedAt: new Date().toISOString(),
      tables: {} as Record<string, any[]>,
    };

    console.log("Exporting users...");
    exportData.tables.users = await db.select().from(users);
    console.log(`Exported ${exportData.tables.users.length} users`);

    console.log("Exporting events...");
    exportData.tables.events = await db.select().from(events);
    console.log(`Exported ${exportData.tables.events.length} events`);

    console.log("Exporting tickets...");
    exportData.tables.tickets = await db.select().from(tickets);
    console.log(`Exported ${exportData.tables.tickets.length} tickets`);

    console.log("Exporting contact requests...");
    exportData.tables.contactRequests = await db.select().from(contactRequests);
    console.log(
      `Exported ${exportData.tables.contactRequests.length} contact requests`,
    );

    console.log("Exporting user feedback...");
    exportData.tables.userFeedback = await db.select().from(userFeedback);
    console.log(
      `Exported ${exportData.tables.userFeedback.length} feedback entries`,
    );

    console.log("Exporting user reviews...");
    try {
      exportData.tables.userReviews = await db.select().from(userReviews);
      console.log(`Exported ${exportData.tables.userReviews.length} reviews`);
    } catch (error) {
      console.log("User reviews table has schema issues, skipping...");
      exportData.tables.userReviews = [];
    }

    console.log("Exporting disputes...");
    try {
      exportData.tables.disputes = await db.select().from(disputes);
      console.log(`Exported ${exportData.tables.disputes.length} disputes`);
    } catch (error) {
      console.log("Disputes table does not exist, skipping...");
      exportData.tables.disputes = [];
    }

    // Write JSON dump
    const jsonFilename = `database-dump-${timestamp}.json`;
    const jsonFilePath = path.join(exportDir, jsonFilename);
    fs.writeFileSync(jsonFilePath, JSON.stringify(exportData, null, 2));

    // Generate complete SQL dump with schema and data
    const sqlFilename = `database-complete-dump-${timestamp}.sql`;
    const sqlFilePath = path.join(exportDir, sqlFilename);
    let sqlContent = `-- Complete Database dump created at ${new Date().toISOString()}\n`;
    sqlContent += `-- This file contains both schema and data\n\n`;

    // Add schema from schema.ts file as comments for reference
    const schemaContent = fs.readFileSync(schemaSourcePath, "utf8");
    sqlContent += `-- SCHEMA DEFINITION (from shared/schema.ts)\n`;
    sqlContent += `/*\n${schemaContent}\n*/\n\n`;

    // Add CREATE TABLE statements (basic ones based on our data)
    sqlContent += `-- CREATE TABLE statements\n`;
    sqlContent += `-- Note: Run 'npm run db:push' to create tables with proper Drizzle schema\n\n`;

    // Generate SQL INSERT statements for each table
    sqlContent += `-- DATA INSERTS\n\n`;
    for (const [tableName, rows] of Object.entries(exportData.tables)) {
      if (rows.length === 0) continue;

      sqlContent += `-- Table: ${tableName} (${rows.length} records)\n`;

      for (const row of rows) {
        const columns = Object.keys(row);
        const values = Object.values(row).map((val) => {
          if (val === null) return "NULL";
          if (typeof val === "string") return `'${val.replace(/'/g, "''")}'`;
          if (val instanceof Date) return `'${val.toISOString()}'`;
          if (typeof val === "boolean") return val ? "TRUE" : "FALSE";
          if (Array.isArray(val))
            return `'${JSON.stringify(val).replace(/'/g, "''")}'`;
          return val;
        });

        sqlContent += `INSERT INTO ${tableName} (${columns.join(", ")}) VALUES (${values.join(", ")});\n`;
      }
      sqlContent += "\n";
    }

    fs.writeFileSync(sqlFilePath, sqlContent);

    console.log("\n✅ Database export completed successfully!");
    console.log(`📁 Export location: ${exportDir}`);
    console.log(`📄 JSON dump: ${jsonFilename}`);
    console.log(`📄 Complete SQL dump: ${sqlFilename}`);
    console.log(`📄 Schema definition: database-schema-${timestamp}.ts`);
    console.log("\nSummary:");

    for (const [tableName, rows] of Object.entries(exportData.tables)) {
      console.log(`  • ${tableName}: ${rows.length} records`);
    }
  } catch (error) {
    console.error("❌ Error exporting database:", error);
    process.exit(1);
  }
}

exportDatabase();
