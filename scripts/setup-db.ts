#!/usr/bin/env node
import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';

dotenv.config();

async function setupDatabase() {
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.error('DATABASE_URL environment variable is required');
    process.exit(1);
  }

  console.log('Setting up database schema...');
  
  try {
    const sql = neon(databaseUrl);

    // Drop existing tables if they exist (for clean setup)
    console.log('Dropping existing tables...');
    await sql`DROP TABLE IF EXISTS ticket_views CASCADE`;
    await sql`DROP TABLE IF EXISTS user_reviews CASCADE`;
    await sql`DROP TABLE IF EXISTS contact_requests CASCADE`;
    await sql`DROP TABLE IF EXISTS user_feedback CASCADE`;
    await sql`DROP TABLE IF EXISTS tickets CASCADE`;
    await sql`DROP TABLE IF EXISTS users CASCADE`;

    // Create users table
    console.log('Creating users table...');
    await sql`
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255),
        avatar_url TEXT,
        rating DECIMAL(3,2) DEFAULT 0,
        phone VARCHAR(20),
        instagram VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create tickets table
    console.log('Creating tickets table...');
    await sql`
      CREATE TABLE tickets (
        id SERIAL PRIMARY KEY,
        seller_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        event_title VARCHAR(255) NOT NULL,
        description TEXT,
        venue VARCHAR(255) NOT NULL,
        event_date TIMESTAMP NOT NULL,
        category VARCHAR(100) NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        original_price DECIMAL(10,2),
        city VARCHAR(100) NOT NULL,
        latitude DECIMAL(10,8),
        longitude DECIMAL(11,8),
        image_url TEXT,
        status VARCHAR(50) DEFAULT 'available',
        verification_code VARCHAR(255),
        qr_code TEXT,
        is_verified BOOLEAN DEFAULT false,
        trending BOOLEAN DEFAULT false,
        selling_fast BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create contact_requests table
    console.log('Creating contact_requests table...');
    await sql`
      CREATE TABLE contact_requests (
        id SERIAL PRIMARY KEY,
        buyer_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        seller_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        ticket_id INTEGER REFERENCES tickets(id) ON DELETE CASCADE,
        message TEXT,
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create user_reviews table
    console.log('Creating user_reviews table...');
    await sql`
      CREATE TABLE user_reviews (
        id SERIAL PRIMARY KEY,
        reviewer_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        reviewed_user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        contact_request_id INTEGER REFERENCES contact_requests(id) ON DELETE CASCADE,
        rating INTEGER CHECK (rating >= 1 AND rating <= 5),
        comment TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create ticket_views table
    console.log('Creating ticket_views table...');
    await sql`
      CREATE TABLE ticket_views (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        ticket_id INTEGER REFERENCES tickets(id) ON DELETE CASCADE,
        viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create user_feedback table
    console.log('Creating user_feedback table...');
    await sql`
      CREATE TABLE user_feedback (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        feedback_type VARCHAR(100) NOT NULL,
        message TEXT NOT NULL,
        rating INTEGER CHECK (rating >= 1 AND rating <= 5),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    console.log('Database schema created successfully');

    // Insert sample data
    console.log('Inserting sample data...');
    
    // Sample users
    const users = await sql`
      INSERT INTO users (email, name, rating, phone, instagram) VALUES
      ('rajesh.kumar@example.com', 'Rajesh Kumar', 4.5, '+91-9876543210', 'rajesh_kumar_music'),
      ('priya.sharma@example.com', 'Priya Sharma', 4.2, '+91-8765432109', 'priya_events'),
      ('amit.singh@example.com', 'Amit Singh', 4.8, '+91-7654321098', 'amit_sports_fan'),
      ('neha.gupta@example.com', 'Neha Gupta', 4.1, '+91-6543210987', 'neha_concerts'),
      ('vikash.mehta@example.com', 'Vikash Mehta', 4.6, '+91-5432109876', 'vikash_theater')
      RETURNING id
    `;

    // Sample tickets with Indian events
    await sql`
      INSERT INTO tickets (
        seller_id, event_title, description, venue, event_date, 
        category, price, original_price, city, latitude, longitude, 
        image_url, trending, selling_fast
      ) VALUES
      (1, 'Arijit Singh Live Concert', 'Experience the magic of Arijit Singh live in Mumbai. Premium seats available with great acoustics.', 'Jio Garden, BKC', '2024-12-15 19:30:00', 'Music', 3500, 4000, 'Mumbai', 19.0760, 72.8777, 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=500&h=300&fit=crop', true, true),
      (2, 'IPL Final 2024', 'Witness the most awaited cricket match of the year. Category A seats with perfect stadium view.', 'Wankhede Stadium', '2024-12-20 19:30:00', 'Sports', 8500, 10000, 'Mumbai', 18.9388, 72.8258, 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=500&h=300&fit=crop', true, true),
      (3, 'Sunburn Festival 2024', 'Three days of non-stop electronic music with international DJs. VIP passes available.', 'Vagator Beach', '2024-12-25 16:00:00', 'Music', 4500, 5000, 'Goa', 15.6087, 73.7354, 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=500&h=300&fit=crop', true, false),
      (4, 'Stand-up Comedy Night', 'Hilarious evening with top Indian comedians. Front row seats for the best experience.', 'Phoenix Marketcity', '2024-12-18 20:00:00', 'Comedy', 1200, 1500, 'Bangalore', 12.9716, 77.5946, 'https://images.unsplash.com/photo-1576267423445-b2e0074d68a4?w=500&h=300&fit=crop', false, true),
      (5, 'Bollywood Dance Championship', 'Regional finals of the biggest dance competition. Reserved seating with great stage view.', 'Siri Fort Auditorium', '2024-12-22 18:00:00', 'Dance', 800, 1000, 'Delhi', 28.5500, 77.2207, 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=500&h=300&fit=crop', false, false),
      (1, 'AR Rahman Concert', 'The maestro returns to Chennai with his greatest hits. Orchestra seating available.', 'Music Academy', '2024-12-28 19:00:00', 'Music', 2800, 3200, 'Chennai', 13.0827, 80.2707, 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=500&h=300&fit=crop', true, false),
      (2, 'Kabaddi Pro League', 'Semifinal match with top teams. Premium viewing experience guaranteed.', 'EKA Arena', '2024-12-30 19:30:00', 'Sports', 1500, 2000, 'Ahmedabad', 23.0225, 72.5714, 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=500&h=300&fit=crop', false, true),
      (3, 'Food & Music Festival', 'Perfect blend of culinary delights and live music. Weekend passes available.', 'Jawaharlal Nehru Stadium', '2024-12-27 12:00:00', 'Festival', 1800, 2200, 'Kochi', 9.9312, 76.2673, 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=500&h=300&fit=crop', false, false)
    `;

    // Validate setup
    console.log('Validating database setup...');
    const userCount = await sql`SELECT COUNT(*) as count FROM users`;
    const ticketCount = await sql`SELECT COUNT(*) as count FROM tickets`;
    
    console.log(`Users created: ${userCount[0].count}`);
    console.log(`Tickets created: ${ticketCount[0].count}`);
    
    if (userCount[0].count >= 5 && ticketCount[0].count >= 8) {
      console.log('✅ Database setup completed successfully');
      console.log('Your ticket marketplace is ready with sample Indian events!');
    } else {
      throw new Error('Database validation failed - insufficient sample data');
    }
    
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  }
}

setupDatabase();