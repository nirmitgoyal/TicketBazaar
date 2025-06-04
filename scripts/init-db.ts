
import { db } from "../server/db.js";
import {
  users,
  tickets,
  contactRequests,
  userFeedback,
  userReviews,
} from "../shared/schema.js";

async function initDb() {
  try {
    console.log("Connecting to database...");

    // Drop users table if it exists to recreate with all columns
    await db.execute(`DROP TABLE IF EXISTS users CASCADE;`);

    // Create users table with all required columns
    await db.execute(`
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        password TEXT NOT NULL,
        full_name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        phone TEXT,
        whatsapp TEXT,
        instagram TEXT NOT NULL,
        google_id TEXT UNIQUE,
        rating DOUBLE PRECISION DEFAULT 0,
        ratings_count INTEGER DEFAULT 0,
        preferred_contact_method TEXT DEFAULT 'whatsapp'
      );
    `);
    console.log("Created users table");

    // Drop events table completely
    await db.execute(`DROP TABLE IF EXISTS events CASCADE;`);
    console.log("Dropped events table");

    // Drop and recreate tickets table with embedded event data
    await db.execute(`DROP TABLE IF EXISTS tickets CASCADE;`);

    // Create tickets table with embedded event information
    await db.execute(`
      CREATE TABLE tickets (
        id SERIAL PRIMARY KEY,
        seller_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        event_title TEXT NOT NULL,
        event_description TEXT,
        venue TEXT NOT NULL,
        event_date TIMESTAMP NOT NULL,
        category TEXT NOT NULL,
        event_image_url TEXT,
        trending BOOLEAN DEFAULT FALSE,
        selling_fast BOOLEAN DEFAULT FALSE,
        latitude DOUBLE PRECISION,
        longitude DOUBLE PRECISION,
        city TEXT NOT NULL,
        section TEXT NOT NULL,
        row TEXT,
        seat TEXT,
        price DOUBLE PRECISION NOT NULL,
        quantity INTEGER NOT NULL,
        status TEXT NOT NULL DEFAULT 'available',
        is_transferrable BOOLEAN DEFAULT TRUE,
        transfer_method TEXT NOT NULL,
        additional_info TEXT,
        show_contact_info BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        expires_at TIMESTAMP
      );
    `);
    console.log("Created tickets table");

    // Drop and recreate contact_requests table
    await db.execute(`DROP TABLE IF EXISTS contact_requests CASCADE;`);

    // Create contact_requests table
    await db.execute(`
      CREATE TABLE contact_requests (
        id SERIAL PRIMARY KEY,
        ticket_id INTEGER NOT NULL,
        requester_id INTEGER NOT NULL,
        seller_id INTEGER NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        responded_at TIMESTAMP,
        contact_method TEXT NOT NULL,
        message TEXT NOT NULL,
        offered_price DOUBLE PRECISION,
        meeting_location TEXT,
        preferred_time TEXT
      );
    `);
    console.log("Created contact_requests table");

    // Drop and recreate user_feedback table
    await db.execute(`DROP TABLE IF EXISTS user_feedback CASCADE;`);

    // Create user_feedback table
    await db.execute(`
      CREATE TABLE user_feedback (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        ticket_id INTEGER,
        feedback_type TEXT NOT NULL,
        description TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        reviewed_at TIMESTAMP
      );
    `);
    console.log("Created user_feedback table");

    // Drop and recreate user_reviews table
    await db.execute(`DROP TABLE IF EXISTS user_reviews CASCADE;`);

    // Create user_reviews table
    await db.execute(`
      CREATE TABLE user_reviews (
        id SERIAL PRIMARY KEY,
        reviewer_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        contact_request_id INTEGER,
        rating INTEGER NOT NULL,
        comment TEXT,
        review_type TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP
      );
    `);
    console.log("Created user_reviews table");

    // Drop and recreate ticket_views table
    await db.execute(`DROP TABLE IF EXISTS ticket_views CASCADE;`);

    // Create ticket_views table
    await db.execute(`
      CREATE TABLE ticket_views (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        ticket_id INTEGER NOT NULL,
        viewed_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);
    console.log("Created ticket_views table");

    // Clean up old tables that are no longer needed
    await db.execute(`DROP TABLE IF EXISTS transactions CASCADE;`);
    await db.execute(`DROP TABLE IF EXISTS disputes CASCADE;`);
    console.log("Cleaned up old tables");

    console.log("Database initialization completed successfully!");

  } catch (error) {
    console.error("Error initializing database:", error);
    throw error;
  }
}

initDb().catch((error) => {
  console.error("Failed to initialize database:", error);
  process.exit(1);
});
