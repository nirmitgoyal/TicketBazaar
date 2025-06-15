import { sql } from "drizzle-orm";
import { db } from "../server/db";
import { 
  tickets as oldTickets, 
  users as oldUsers,
  contactRequests as oldContactRequests,
  userReviews as oldUserReviews,
  userFeedback as oldUserFeedback,
  ticketViews as oldTicketViews 
} from "../shared/schema";

/**
 * Migration script to transition from current schema to enhanced normalized schema
 * This script handles the complex data migration while preserving all existing data
 */

interface MigrationStats {
  venues: number;
  events: number;
  ticketsUpdated: number;
  usersUpdated: number;
  errors: string[];
}

export async function migrateToEnhancedSchema(): Promise<MigrationStats> {
  const stats: MigrationStats = {
    venues: 0,
    events: 0,
    ticketsUpdated: 0,
    usersUpdated: 0,
    errors: []
  };

  console.log("🚀 Starting migration to enhanced schema...");

  try {
    // Step 1: Create enum types
    await createEnumTypes();
    console.log("✅ Created enum types");

    // Step 2: Create new tables with enhanced structure
    await createEnhancedTables();
    console.log("✅ Created enhanced tables");

    // Step 3: Migrate venues from ticket data
    const venueMap = await migrateVenues(stats);
    console.log(`✅ Migrated ${stats.venues} venues`);

    // Step 4: Migrate events from ticket data
    const eventMap = await migrateEvents(venueMap, stats);
    console.log(`✅ Migrated ${stats.events} events`);

    // Step 5: Update users table with enhanced fields
    await enhanceUsersTable(stats);
    console.log(`✅ Enhanced ${stats.usersUpdated} user records`);

    // Step 6: Update tickets to reference new event structure
    await updateTicketsStructure(eventMap, stats);
    console.log(`✅ Updated ${stats.ticketsUpdated} ticket records`);

    // Step 7: Create optimized indexes
    await createOptimizedIndexes();
    console.log("✅ Created optimized indexes");

    // Step 8: Set up partitioning for tickets
    await setupTablePartitioning();
    console.log("✅ Set up table partitioning");

    // Step 9: Create materialized views for performance
    await createMaterializedViews();
    console.log("✅ Created materialized views");

    // Step 10: Validate data integrity
    await validateDataIntegrity(stats);
    console.log("✅ Data integrity validation completed");

    console.log("🎉 Migration completed successfully!");
    return stats;

  } catch (error) {
    console.error("❌ Migration failed:", error);
    stats.errors.push(`Migration failed: ${error.message}`);
    throw error;
  }
}

async function createEnumTypes() {
  const enums = [
    `CREATE TYPE event_category AS ENUM (
      'concerts', 'sports', 'theater', 'comedy', 'festivals', 
      'conferences', 'exhibitions', 'movies', 'dance', 'opera',
      'classical', 'family', 'nightlife', 'education', 'networking'
    )`,
    `CREATE TYPE venue_type AS ENUM (
      'stadium', 'arena', 'theater', 'concert_hall', 'club', 
      'outdoor', 'conference_center', 'exhibition_hall', 'other'
    )`,
    `CREATE TYPE event_status AS ENUM (
      'active', 'cancelled', 'postponed', 'completed', 'draft'
    )`,
    `CREATE TYPE ticket_status AS ENUM (
      'available', 'pending', 'sold', 'expired', 'cancelled', 'reserved'
    )`,
    `CREATE TYPE transfer_method AS ENUM (
      'in-person', 'electronic', 'mail', 'digital', 'mobile_transfer'
    )`,
    `CREATE TYPE contact_request_status AS ENUM (
      'pending', 'approved', 'denied', 'completed', 'expired'
    )`,
    `CREATE TYPE user_status AS ENUM (
      'active', 'inactive', 'suspended', 'banned', 'pending_verification'
    )`,
    `CREATE TYPE verification_status AS ENUM (
      'unverified', 'pending', 'verified', 'rejected'
    )`,
    `CREATE TYPE age_restriction AS ENUM (
      'all_ages', '18+', '21+', 'family_friendly'
    )`,
    `CREATE TYPE audit_operation AS ENUM (
      'INSERT', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT'
    )`
  ];

  for (const enumSql of enums) {
    try {
      await db.execute(sql.raw(`${enumSql}`));
    } catch (error) {
      // Ignore "already exists" errors
      if (!error.message.includes('already exists')) {
        throw error;
      }
    }
  }
}

async function createEnhancedTables() {
  // Create venues table
  await db.execute(sql.raw(`
    CREATE TABLE IF NOT EXISTS venues_new (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      address TEXT NOT NULL,
      city VARCHAR(100) NOT NULL,
      state VARCHAR(100),
      country CHAR(2) NOT NULL,
      postal_code VARCHAR(20),
      latitude DECIMAL(10, 8),
      longitude DECIMAL(11, 8),
      timezone VARCHAR(50) DEFAULT 'UTC',
      capacity INTEGER,
      venue_type venue_type,
      website TEXT,
      phone_number VARCHAR(20),
      description TEXT,
      amenities JSONB,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT valid_capacity CHECK (capacity IS NULL OR capacity > 0)
    )
  `));

  // Create events table
  await db.execute(sql.raw(`
    CREATE TABLE IF NOT EXISTS events_new (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      venue_id INTEGER NOT NULL REFERENCES venues_new(id) ON DELETE CASCADE,
      category event_category NOT NULL,
      event_date TIMESTAMP WITH TIME ZONE NOT NULL,
      doors_open TIMESTAMP WITH TIME ZONE,
      age_restriction age_restriction,
      status event_status DEFAULT 'active',
      image_url TEXT,
      external_id VARCHAR(100),
      organizer VARCHAR(255),
      genre VARCHAR(100),
      duration_minutes INTEGER,
      is_recurring BOOLEAN DEFAULT FALSE,
      parent_event_id INTEGER REFERENCES events_new(id),
      tags JSONB,
      social_links JSONB,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `));

  // Add enhanced columns to existing tables
  const userEnhancements = [
    'ADD COLUMN IF NOT EXISTS reputation_score INTEGER DEFAULT 0',
    'ADD COLUMN IF NOT EXISTS account_status user_status DEFAULT \'active\'',
    'ADD COLUMN IF NOT EXISTS last_active TIMESTAMP',
    'ADD COLUMN IF NOT EXISTS profile_completion_score INTEGER DEFAULT 0',
    'ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN DEFAULT FALSE',
    'ADD COLUMN IF NOT EXISTS email_notifications BOOLEAN DEFAULT TRUE',
    'ADD COLUMN IF NOT EXISTS push_notifications BOOLEAN DEFAULT TRUE'
  ];

  for (const enhancement of userEnhancements) {
    try {
      await db.execute(sql.raw(`ALTER TABLE users ${enhancement}`));
    } catch (error) {
      if (!error.message.includes('already exists')) {
        console.warn(`User table enhancement warning: ${error.message}`);
      }
    }
  }

  // Add enhanced columns to tickets table
  const ticketEnhancements = [
    'ADD COLUMN IF NOT EXISTS event_id INTEGER',
    'ADD COLUMN IF NOT EXISTS available_quantity INTEGER',
    'ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE',
    'ADD COLUMN IF NOT EXISTS is_highlight BOOLEAN DEFAULT FALSE',
    'ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0',
    'ADD COLUMN IF NOT EXISTS favorites_count INTEGER DEFAULT 0'
  ];

  for (const enhancement of ticketEnhancements) {
    try {
      await db.execute(sql.raw(`ALTER TABLE tickets ${enhancement}`));
    } catch (error) {
      if (!error.message.includes('already exists')) {
        console.warn(`Tickets table enhancement warning: ${error.message}`);
      }
    }
  }

  // Create audit log table
  await db.execute(sql.raw(`
    CREATE TABLE IF NOT EXISTS audit_log (
      id SERIAL PRIMARY KEY,
      table_name VARCHAR(50) NOT NULL,
      record_id INTEGER NOT NULL,
      operation audit_operation NOT NULL,
      old_values JSONB,
      new_values JSONB,
      user_id INTEGER REFERENCES users(id),
      ip_address INET,
      user_agent TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `));

  // Create cache invalidation table
  await db.execute(sql.raw(`
    CREATE TABLE IF NOT EXISTS cache_invalidation (
      id SERIAL PRIMARY KEY,
      cache_key VARCHAR(255) NOT NULL,
      reason VARCHAR(100),
      invalidated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `));
}

async function migrateVenues(stats: MigrationStats): Promise<Map<string, number>> {
  const venueMap = new Map<string, number>();

  // Extract unique venues from tickets
  const uniqueVenues = await db.execute(sql.raw(`
    SELECT DISTINCT 
      venue,
      venue_address,
      city,
      country,
      state,
      postal_code,
      latitude,
      longitude,
      event_timezone as timezone
    FROM tickets 
    WHERE venue IS NOT NULL
    ORDER BY venue, city
  `));

  console.log(`Found ${uniqueVenues.rows.length} unique venues to migrate`);

  for (const venue of uniqueVenues.rows) {
    const venueKey = `${venue.venue}|${venue.city}|${venue.country}`;
    
    if (!venueMap.has(venueKey)) {
      try {
        const result = await db.execute(sql.raw(`
          INSERT INTO venues_new (
            name, address, city, state, country, postal_code,
            latitude, longitude, timezone, venue_type
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
          RETURNING id
        `, [
          venue.venue,
          venue.venue_address || '',
          venue.city,
          venue.state,
          venue.country,
          venue.postal_code,
          venue.latitude,
          venue.longitude,
          venue.timezone || 'UTC',
          'other' // Default venue type
        ]));

        const venueId = result.rows[0].id;
        venueMap.set(venueKey, venueId);
        stats.venues++;
      } catch (error) {
        stats.errors.push(`Failed to create venue ${venue.venue}: ${error.message}`);
      }
    }
  }

  return venueMap;
}

async function migrateEvents(venueMap: Map<string, number>, stats: MigrationStats): Promise<Map<string, number>> {
  const eventMap = new Map<string, number>();

  // Extract unique events from tickets
  const uniqueEvents = await db.execute(sql.raw(`
    SELECT DISTINCT 
      event_title,
      event_description,
      venue,
      city,
      country,
      category,
      event_date,
      event_image_url,
      trending,
      selling_fast,
      age_restriction,
      event_timezone
    FROM tickets 
    WHERE event_title IS NOT NULL
    ORDER BY event_title, event_date
  `));

  console.log(`Found ${uniqueEvents.rows.length} unique events to migrate`);

  for (const event of uniqueEvents.rows) {
    const venueKey = `${event.venue}|${event.city}|${event.country}`;
    const venueId = venueMap.get(venueKey);
    
    if (!venueId) {
      stats.errors.push(`Venue not found for event: ${event.event_title}`);
      continue;
    }

    const eventKey = `${event.event_title}|${event.event_date}|${venueId}`;
    
    if (!eventMap.has(eventKey)) {
      try {
        // Map old categories to new enum values
        const categoryMapping: Record<string, string> = {
          'music': 'concerts',
          'sport': 'sports',
          'theatre': 'theater',
          'conference': 'conferences',
          'exhibition': 'exhibitions',
          'movie': 'movies',
          'other': 'nightlife'
        };

        const mappedCategory = categoryMapping[event.category.toLowerCase()] || event.category.toLowerCase();

        // Map age restrictions
        const ageRestrictionMapping: Record<string, string> = {
          '18+': '18+',
          '21+': '21+',
          'All Ages': 'all_ages',
          'Family Friendly': 'family_friendly'
        };

        const mappedAgeRestriction = event.age_restriction ? 
          ageRestrictionMapping[event.age_restriction] || 'all_ages' : 'all_ages';

        const result = await db.execute(sql.raw(`
          INSERT INTO events_new (
            title, description, venue_id, category, event_date,
            age_restriction, image_url, created_at, updated_at
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
          RETURNING id
        `, [
          event.event_title,
          event.event_description,
          venueId,
          mappedCategory,
          event.event_date,
          mappedAgeRestriction,
          event.event_image_url
        ]));

        const eventId = result.rows[0].id;
        eventMap.set(eventKey, eventId);
        stats.events++;
      } catch (error) {
        stats.errors.push(`Failed to create event ${event.event_title}: ${error.message}`);
      }
    }
  }

  return eventMap;
}

async function enhanceUsersTable(stats: MigrationStats) {
  // Update all users with enhanced fields
  await db.execute(sql.raw(`
    UPDATE users SET 
      reputation_score = COALESCE(CAST(rating * 20 AS INTEGER), 0),
      profile_completion_score = CASE 
        WHEN phone IS NOT NULL AND instagram IS NOT NULL THEN 100
        WHEN phone IS NOT NULL OR instagram IS NOT NULL THEN 75
        ELSE 50
      END,
      last_active = CURRENT_TIMESTAMP,
      account_status = 'active'::user_status
    WHERE reputation_score IS NULL OR profile_completion_score IS NULL
  `));

  const result = await db.execute(sql.raw(`SELECT COUNT(*) as count FROM users`));
  stats.usersUpdated = parseInt(result.rows[0].count);
}

async function updateTicketsStructure(eventMap: Map<string, number>, stats: MigrationStats) {
  // Get all tickets to update
  const tickets = await db.execute(sql.raw(`
    SELECT id, event_title, event_date, venue, city, country, quantity
    FROM tickets
    ORDER BY id
  `));

  console.log(`Updating ${tickets.rows.length} tickets with event references...`);

  for (const ticket of tickets.rows) {
    try {
      // Find the corresponding event
      let eventId = null;
      for (const [eventKey, eId] of eventMap.entries()) {
        const [title, date, venueId] = eventKey.split('|');
        if (title === ticket.event_title && 
            new Date(date).getTime() === new Date(ticket.event_date).getTime()) {
          eventId = eId;
          break;
        }
      }

      if (eventId) {
        await db.execute(sql.raw(`
          UPDATE tickets SET 
            event_id = $1,
            available_quantity = COALESCE(quantity, 1),
            updated_at = CURRENT_TIMESTAMP
          WHERE id = $2
        `, [eventId, ticket.id]));
        
        stats.ticketsUpdated++;
      } else {
        stats.errors.push(`Event not found for ticket ${ticket.id}: ${ticket.event_title}`);
      }
    } catch (error) {
      stats.errors.push(`Failed to update ticket ${ticket.id}: ${error.message}`);
    }
  }
}

async function createOptimizedIndexes() {
  const indexes = [
    // Venues indexes
    'CREATE INDEX IF NOT EXISTS idx_venues_name ON venues_new (name)',
    'CREATE INDEX IF NOT EXISTS idx_venues_city_country ON venues_new (city, country)',
    'CREATE INDEX IF NOT EXISTS idx_venues_location ON venues_new (latitude, longitude)',
    
    // Events indexes
    'CREATE INDEX IF NOT EXISTS idx_events_title ON events_new (title)',
    'CREATE INDEX IF NOT EXISTS idx_events_date ON events_new (event_date)',
    'CREATE INDEX IF NOT EXISTS idx_events_category ON events_new (category)',
    'CREATE INDEX IF NOT EXISTS idx_events_status ON events_new (status)',
    'CREATE INDEX IF NOT EXISTS idx_events_venue ON events_new (venue_id)',
    'CREATE INDEX IF NOT EXISTS idx_events_date_category ON events_new (event_date, category)',
    
    // Enhanced tickets indexes
    'CREATE INDEX IF NOT EXISTS idx_tickets_event_status_price ON tickets (event_id, status, price) WHERE event_id IS NOT NULL',
    'CREATE INDEX IF NOT EXISTS idx_tickets_seller_status ON tickets (seller_id, status)',
    'CREATE INDEX IF NOT EXISTS idx_tickets_available ON tickets (event_id, price) WHERE status = \'available\'',
    'CREATE INDEX IF NOT EXISTS idx_tickets_highlight ON tickets (is_highlight, created_at) WHERE is_highlight = true',
    
    // Users enhanced indexes
    'CREATE INDEX IF NOT EXISTS idx_users_reputation ON users (reputation_score)',
    'CREATE INDEX IF NOT EXISTS idx_users_status ON users (account_status)',
    'CREATE INDEX IF NOT EXISTS idx_users_last_active ON users (last_active)',
    
    // Contact requests enhanced indexes
    'CREATE INDEX IF NOT EXISTS idx_contact_requests_priority ON contact_requests (priority, created_at)',
    
    // Audit log indexes
    'CREATE INDEX IF NOT EXISTS idx_audit_log_table_record ON audit_log (table_name, record_id)',
    'CREATE INDEX IF NOT EXISTS idx_audit_log_user_date ON audit_log (user_id, created_at)',
    'CREATE INDEX IF NOT EXISTS idx_audit_log_operation ON audit_log (operation)',
    
    // Cache invalidation indexes
    'CREATE INDEX IF NOT EXISTS idx_cache_invalidation_key ON cache_invalidation (cache_key)',
    'CREATE INDEX IF NOT EXISTS idx_cache_invalidation_time ON cache_invalidation (invalidated_at)'
  ];

  for (const indexSql of indexes) {
    try {
      await db.execute(sql.raw(indexSql));
    } catch (error) {
      console.warn(`Index creation warning: ${error.message}`);
    }
  }
}

async function setupTablePartitioning() {
  // Create function for automatic partition management
  await db.execute(sql.raw(`
    CREATE OR REPLACE FUNCTION create_monthly_partition()
    RETURNS void AS $$
    DECLARE
        start_date date;
        end_date date;
        partition_name text;
    BEGIN
        start_date := date_trunc('month', CURRENT_DATE + interval '1 month');
        end_date := start_date + interval '1 month';
        partition_name := 'tickets_' || to_char(start_date, 'YYYY_MM');
        
        EXECUTE format('CREATE TABLE IF NOT EXISTS %I PARTITION OF tickets FOR VALUES FROM (%L) TO (%L)',
                       partition_name, start_date, end_date);
    END;
    $$ LANGUAGE plpgsql;
  `));

  // Note: Table partitioning setup would require more complex migration
  // For now, we'll prepare the function and can enable partitioning later
  console.log("Partition management function created (partitioning can be enabled later)");
}

async function createMaterializedViews() {
  // Popular events materialized view
  await db.execute(sql.raw(`
    CREATE MATERIALIZED VIEW IF NOT EXISTS popular_events AS
    SELECT 
      e.id,
      e.title,
      e.event_date,
      v.city,
      v.country,
      COUNT(t.id) as ticket_count,
      AVG(t.price) as avg_price,
      MIN(t.price) as min_price,
      MAX(t.price) as max_price
    FROM events_new e
    JOIN venues_new v ON e.venue_id = v.id
    LEFT JOIN tickets t ON e.id = t.event_id
    WHERE e.status = 'active' AND (t.status IS NULL OR t.status = 'available')
    GROUP BY e.id, e.title, e.event_date, v.city, v.country
    HAVING COUNT(t.id) >= 1
    ORDER BY ticket_count DESC, avg_price ASC
  `));

  // Create unique index on materialized view
  await db.execute(sql.raw(`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_popular_events_id ON popular_events (id)
  `));

  // User statistics materialized view
  await db.execute(sql.raw(`
    CREATE MATERIALIZED VIEW IF NOT EXISTS user_statistics AS
    SELECT 
      u.id,
      u.full_name,
      u.rating,
      u.reputation_score,
      COUNT(DISTINCT t.id) as total_tickets,
      COUNT(DISTINCT CASE WHEN t.status = 'available' THEN t.id END) as active_tickets,
      AVG(t.price) as avg_ticket_price,
      COUNT(DISTINCT cr.id) as total_contact_requests,
      COUNT(DISTINCT ur.id) as total_reviews
    FROM users u
    LEFT JOIN tickets t ON u.id = t.seller_id
    LEFT JOIN contact_requests cr ON u.id = cr.seller_id
    LEFT JOIN user_reviews ur ON u.id = ur.user_id
    WHERE u.account_status = 'active'
    GROUP BY u.id, u.full_name, u.rating, u.reputation_score
  `));

  console.log("Materialized views created for improved query performance");
}

async function validateDataIntegrity(stats: MigrationStats) {
  // Check venue integrity
  const venueCount = await db.execute(sql.raw(`SELECT COUNT(*) as count FROM venues_new`));
  console.log(`✓ Venues created: ${venueCount.rows[0].count}`);

  // Check event integrity
  const eventCount = await db.execute(sql.raw(`SELECT COUNT(*) as count FROM events_new`));
  console.log(`✓ Events created: ${eventCount.rows[0].count}`);

  // Check tickets with event references
  const ticketsWithEvents = await db.execute(sql.raw(`
    SELECT COUNT(*) as count FROM tickets WHERE event_id IS NOT NULL
  `));
  console.log(`✓ Tickets with event references: ${ticketsWithEvents.rows[0].count}`);

  // Check for orphaned tickets
  const orphanedTickets = await db.execute(sql.raw(`
    SELECT COUNT(*) as count FROM tickets 
    WHERE event_id IS NULL AND event_title IS NOT NULL
  `));
  
  if (parseInt(orphanedTickets.rows[0].count) > 0) {
    stats.errors.push(`Found ${orphanedTickets.rows[0].count} orphaned tickets without event references`);
  }

  // Check referential integrity
  const integrityCheck = await db.execute(sql.raw(`
    SELECT 
      (SELECT COUNT(*) FROM tickets t 
       LEFT JOIN events_new e ON t.event_id = e.id 
       WHERE t.event_id IS NOT NULL AND e.id IS NULL) as orphaned_ticket_events,
      (SELECT COUNT(*) FROM events_new e 
       LEFT JOIN venues_new v ON e.venue_id = v.id 
       WHERE v.id IS NULL) as orphaned_event_venues
  `));

  const check = integrityCheck.rows[0];
  if (parseInt(check.orphaned_ticket_events) > 0) {
    stats.errors.push(`Found ${check.orphaned_ticket_events} tickets referencing non-existent events`);
  }
  if (parseInt(check.orphaned_event_venues) > 0) {
    stats.errors.push(`Found ${check.orphaned_event_venues} events referencing non-existent venues`);
  }

  console.log("✓ Data integrity validation completed");
}

// Rollback function in case migration needs to be reversed
export async function rollbackMigration(): Promise<void> {
  console.log("🔄 Rolling back migration...");

  try {
    // Drop new tables
    await db.execute(sql.raw(`DROP TABLE IF EXISTS cache_invalidation CASCADE`));
    await db.execute(sql.raw(`DROP TABLE IF EXISTS audit_log CASCADE`));
    await db.execute(sql.raw(`DROP MATERIALIZED VIEW IF EXISTS user_statistics CASCADE`));
    await db.execute(sql.raw(`DROP MATERIALIZED VIEW IF EXISTS popular_events CASCADE`));
    await db.execute(sql.raw(`DROP TABLE IF EXISTS events_new CASCADE`));
    await db.execute(sql.raw(`DROP TABLE IF EXISTS venues_new CASCADE`));

    // Remove enhanced columns (be careful with this in production)
    const userColumnRemovals = [
      'DROP COLUMN IF EXISTS reputation_score',
      'DROP COLUMN IF EXISTS account_status',
      'DROP COLUMN IF EXISTS last_active',
      'DROP COLUMN IF EXISTS profile_completion_score',
      'DROP COLUMN IF EXISTS two_factor_enabled',
      'DROP COLUMN IF EXISTS email_notifications',
      'DROP COLUMN IF EXISTS push_notifications'
    ];

    for (const removal of userColumnRemovals) {
      try {
        await db.execute(sql.raw(`ALTER TABLE users ${removal}`));
      } catch (error) {
        console.warn(`Column removal warning: ${error.message}`);
      }
    }

    const ticketColumnRemovals = [
      'DROP COLUMN IF EXISTS event_id',
      'DROP COLUMN IF EXISTS available_quantity',
      'DROP COLUMN IF EXISTS is_verified',
      'DROP COLUMN IF EXISTS is_highlight',
      'DROP COLUMN IF EXISTS view_count',
      'DROP COLUMN IF EXISTS favorites_count'
    ];

    for (const removal of ticketColumnRemovals) {
      try {
        await db.execute(sql.raw(`ALTER TABLE tickets ${removal}`));
      } catch (error) {
        console.warn(`Column removal warning: ${error.message}`);
      }
    }

    // Drop enum types
    const enumTypes = [
      'audit_operation', 'age_restriction', 'verification_status',
      'user_status', 'contact_request_status', 'transfer_method',
      'ticket_status', 'event_status', 'venue_type', 'event_category'
    ];

    for (const enumType of enumTypes) {
      try {
        await db.execute(sql.raw(`DROP TYPE IF EXISTS ${enumType} CASCADE`));
      } catch (error) {
        console.warn(`Enum drop warning: ${error.message}`);
      }
    }

    console.log("✅ Migration rollback completed");
  } catch (error) {
    console.error("❌ Rollback failed:", error);
    throw error;
  }
}

// Main execution function
if (require.main === module) {
  migrateToEnhancedSchema()
    .then((stats) => {
      console.log("\n📊 Migration Statistics:");
      console.log(`Venues created: ${stats.venues}`);
      console.log(`Events created: ${stats.events}`);
      console.log(`Tickets updated: ${stats.ticketsUpdated}`);
      console.log(`Users enhanced: ${stats.usersUpdated}`);
      
      if (stats.errors.length > 0) {
        console.log(`\n⚠️ Errors encountered: ${stats.errors.length}`);
        stats.errors.forEach(error => console.log(`  - ${error}`));
      }
      
      process.exit(0);
    })
    .catch((error) => {
      console.error("Migration failed:", error);
      process.exit(1);
    });
}