#!/usr/bin/env node
/**
 * Complete database setup for CI environments
 * Handles connection, initialization, and validation
 */

import postgres from 'postgres';

async function setupDatabaseForCI() {
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.error('DATABASE_URL environment variable is required');
    process.exit(1);
  }

  console.log('Setting up database for CI environment...');
  
  // Step 1: Wait for PostgreSQL to be ready
  console.log('Step 1: Waiting for PostgreSQL...');
  let retries = 20;
  let client: any;
  
  while (retries > 0) {
    try {
      client = postgres(databaseUrl, { 
        max: 1,
        ssl: false,
        prepare: false,
        connect_timeout: 5,
        idle_timeout: 10
      });
      
      await client`SELECT 1`;
      console.log('PostgreSQL connection successful');
      break;
      
    } catch (error: any) {
      retries--;
      if (retries === 0) {
        console.error('PostgreSQL failed to start within timeout');
        process.exit(1);
      }
      console.log(`Waiting for PostgreSQL... (${retries} attempts remaining)`);
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      if (client) {
        try { await client.end(); } catch {}
      }
    }
  }

  // Step 2: Create database schema
  console.log('Step 2: Creating database schema...');
  try {
    // Drop existing tables if they exist (for clean CI runs)
    await client`DROP TABLE IF EXISTS ticket_views CASCADE`;
    await client`DROP TABLE IF EXISTS user_reviews CASCADE`;
    await client`DROP TABLE IF EXISTS contact_requests CASCADE`;
    await client`DROP TABLE IF EXISTS user_feedback CASCADE`;
    await client`DROP TABLE IF EXISTS tickets CASCADE`;
    await client`DROP TABLE IF EXISTS users CASCADE`;

    // Create users table
    await client`
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
    await client`
      CREATE TABLE tickets (
        id SERIAL PRIMARY KEY,
        seller_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        event_title VARCHAR(255) NOT NULL,
        description TEXT,
        venue VARCHAR(255) NOT NULL,
        event_date TIMESTAMP NOT NULL,
        category VARCHAR(100) NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        status VARCHAR(50) DEFAULT 'available',
        image_url TEXT,
        city VARCHAR(100),
        latitude DECIMAL(10,8),
        longitude DECIMAL(11,8),
        trending BOOLEAN DEFAULT FALSE,
        selling_fast BOOLEAN DEFAULT FALSE,
        verification_code VARCHAR(255),
        qr_code TEXT,
        verified BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create remaining tables
    await client`
      CREATE TABLE contact_requests (
        id SERIAL PRIMARY KEY,
        buyer_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        seller_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        ticket_id INTEGER REFERENCES tickets(id) ON DELETE CASCADE,
        status VARCHAR(50) DEFAULT 'pending',
        message TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    await client`
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

    await client`
      CREATE TABLE ticket_views (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        ticket_id INTEGER REFERENCES tickets(id) ON DELETE CASCADE,
        viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    await client`
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

    // Step 3: Insert test data
    console.log('Step 3: Inserting test data...');
    
    // Insert test users
    await client`
      INSERT INTO users (email, name, rating) VALUES
      ('test1@example.com', 'Test User 1', 4.5),
      ('test2@example.com', 'Test User 2', 4.2),
      ('seller@example.com', 'Test Seller', 4.8)
    `;

    // Insert test tickets
    await client`
      INSERT INTO tickets (
        seller_id, event_title, description, venue, event_date, 
        category, price, city, latitude, longitude, trending
      ) VALUES
      (1, 'Test Concert 2024', 'Amazing live performance', 'Test Arena Mumbai', 
       '2024-12-31 20:00:00', 'Music', 2500, 'Mumbai', 19.0760, 72.8777, false),
      (2, 'Test Sports Match', 'Exciting cricket match', 'Test Stadium Delhi', 
       '2024-12-25 15:00:00', 'Sports', 1500, 'Delhi', 28.6139, 77.2090, true),
      (3, 'Test Theatre Show', 'Classic drama performance', 'Test Theatre Bangalore', 
       '2024-12-20 19:30:00', 'Theatre', 800, 'Bangalore', 12.9716, 77.5946, false)
    `;

    console.log('Test data inserted successfully');

    // Step 4: Validate setup
    console.log('Step 4: Validating database setup...');
    
    const userCount = await client`SELECT COUNT(*) as count FROM users`;
    const ticketCount = await client`SELECT COUNT(*) as count FROM tickets`;
    
    console.log(`Users created: ${userCount[0].count}`);
    console.log(`Tickets created: ${ticketCount[0].count}`);
    
    if (userCount[0].count >= 3 && ticketCount[0].count >= 3) {
      console.log('Database setup validation passed');
    } else {
      throw new Error('Database validation failed - insufficient test data');
    }

    await client.end();
    console.log('Database setup completed successfully');
    process.exit(0);
    
  } catch (error) {
    console.error('Database setup failed:', error);
    if (client) {
      try { await client.end(); } catch {}
    }
    process.exit(1);
  }
}

setupDatabaseForCI();