#!/usr/bin/env node
/**
 * Initialize test database for GitHub Actions CI/CD
 * This script ensures the database schema is properly set up before running tests
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../shared/schema';

async function initTestDatabase() {
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.error('DATABASE_URL environment variable is required');
    process.exit(1);
  }

  console.log('Connecting to test database...');
  
  // Retry logic for database connection
  let retries = 10;
  let client: any;
  
  while (retries > 0) {
    try {
      console.log(`Attempting database connection... (${11 - retries}/10)`);
      
      // Create postgres client with connection options
      client = postgres(databaseUrl, { 
        max: 1,
        ssl: false,
        prepare: false,
        connect_timeout: 10,
        idle_timeout: 20
      });
      
      // Test the connection
      await client`SELECT 1`;
      console.log('Database connection successful');
      break;
      
    } catch (error: any) {
      console.log(`Connection failed: ${error.message}`);
      retries--;
      
      if (retries === 0) {
        console.error('Failed to connect to database after 10 attempts');
        process.exit(1);
      }
      
      console.log(`Retrying in 3 seconds... (${retries} attempts remaining)`);
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }
  
  try {
    
    // Initialize drizzle
    const db = drizzle(client, { schema });
    
    console.log('Creating database tables...');
    
    // Create users table
    await client`
      CREATE TABLE IF NOT EXISTS users (
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
      CREATE TABLE IF NOT EXISTS tickets (
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

    // Create contact_requests table
    await client`
      CREATE TABLE IF NOT EXISTS contact_requests (
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

    // Create user_reviews table
    await client`
      CREATE TABLE IF NOT EXISTS user_reviews (
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
    await client`
      CREATE TABLE IF NOT EXISTS ticket_views (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        ticket_id INTEGER REFERENCES tickets(id) ON DELETE CASCADE,
        viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create user_feedback table
    await client`
      CREATE TABLE IF NOT EXISTS user_feedback (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        feedback_type VARCHAR(100) NOT NULL,
        message TEXT NOT NULL,
        rating INTEGER CHECK (rating >= 1 AND rating <= 5),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    console.log('Database tables created successfully');

    // Insert sample test data
    console.log('Inserting sample test data...');

    // Sample users
    const testUsers = [
      { email: 'test1@example.com', name: 'Test User 1', rating: 4.5 },
      { email: 'test2@example.com', name: 'Test User 2', rating: 4.2 },
      { email: 'seller@example.com', name: 'Test Seller', rating: 4.8 }
    ];

    for (const user of testUsers) {
      await client`
        INSERT INTO users (email, name, rating) 
        VALUES (${user.email}, ${user.name}, ${user.rating})
        ON CONFLICT (email) DO NOTHING
      `;
    }

    // Sample tickets
    const testTickets = [
      {
        seller_id: 1,
        event_title: 'Test Concert',
        description: 'Amazing test concert',
        venue: 'Test Arena',
        event_date: new Date('2024-12-31'),
        category: 'Music',
        price: 2500,
        city: 'Mumbai',
        latitude: 19.0760,
        longitude: 72.8777
      },
      {
        seller_id: 2,
        event_title: 'Test Sports Event',
        description: 'Exciting test match',
        venue: 'Test Stadium',
        event_date: new Date('2024-12-25'),
        category: 'Sports',
        price: 1500,
        city: 'Delhi',
        latitude: 28.6139,
        longitude: 77.2090,
        trending: true
      }
    ];

    for (const ticket of testTickets) {
      await client`
        INSERT INTO tickets (
          seller_id, event_title, description, venue, event_date, 
          category, price, city, latitude, longitude, trending
        ) VALUES (
          ${ticket.seller_id}, ${ticket.event_title}, ${ticket.description}, 
          ${ticket.venue}, ${ticket.event_date.toISOString()}, ${ticket.category}, 
          ${ticket.price}, ${ticket.city}, ${ticket.latitude}, 
          ${ticket.longitude}, ${ticket.trending || false}
        )
      `;
    }

    console.log('Sample test data inserted successfully');
    console.log('Test database initialization completed');
    
    await client.end();
    process.exit(0);
    
  } catch (error) {
    console.error('Database initialization failed:', error);
    process.exit(1);
  }
}

// Run the initialization
initTestDatabase();

export { initTestDatabase };