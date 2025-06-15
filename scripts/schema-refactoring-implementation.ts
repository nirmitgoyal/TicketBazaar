import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

/**
 * Practical Database Schema Refactoring Implementation
 * This script implements the most critical improvements with minimal risk
 */

const connectionString = process.env.DATABASE_URL!;
const sql = postgres(connectionString);
const db = drizzle(sql);

interface RefactoringProgress {
  step: string;
  status: 'pending' | 'completed' | 'failed';
  details?: string;
  timing?: number;
}

export class SchemaRefactoring {
  private progress: RefactoringProgress[] = [];

  async executeRefactoring(): Promise<RefactoringProgress[]> {
    console.log("Starting database schema refactoring...");

    // Phase 1: Add critical indexes for performance
    await this.addCriticalIndexes();
    
    // Phase 2: Add enhanced columns with proper constraints
    await this.addEnhancedColumns();
    
    // Phase 3: Create normalized venue and event tables
    await this.createNormalizedTables();
    
    // Phase 4: Implement data archival strategy
    await this.setupDataArchival();
    
    // Phase 5: Add audit capabilities
    await this.setupAuditSystem();
    
    // Phase 6: Create performance views
    await this.createPerformanceViews();

    return this.progress;
  }

  private async executeStep(stepName: string, operation: () => Promise<void>): Promise<void> {
    const startTime = Date.now();
    
    try {
      this.progress.push({ step: stepName, status: 'pending' });
      await operation();
      
      const timing = Date.now() - startTime;
      this.updateProgress(stepName, 'completed', `Completed in ${timing}ms`);
      console.log(`✅ ${stepName} completed in ${timing}ms`);
    } catch (error) {
      const timing = Date.now() - startTime;
      this.updateProgress(stepName, 'failed', error.message);
      console.error(`❌ ${stepName} failed: ${error.message}`);
      throw error;
    }
  }

  private updateProgress(step: string, status: RefactoringProgress['status'], details?: string): void {
    const index = this.progress.findIndex(p => p.step === step);
    if (index !== -1) {
      this.progress[index] = { ...this.progress[index], status, details };
    }
  }

  private async addCriticalIndexes(): Promise<void> {
    await this.executeStep("Adding Critical Performance Indexes", async () => {
      const indexes = [
        // Composite indexes for common query patterns
        `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tickets_seller_status_created 
         ON tickets (seller_id, status, created_at) 
         WHERE status IN ('available', 'pending')`,
        
        `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tickets_event_price_date 
         ON tickets (event_title, price, event_date) 
         WHERE status = 'available'`,
        
        `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tickets_location_category 
         ON tickets (city, country, category, event_date) 
         WHERE status = 'available'`,
        
        // Full-text search indexes
        `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tickets_search 
         ON tickets USING GIN (to_tsvector('english', 
         title || ' ' || event_title || ' ' || venue || ' ' || city))`,
        
        // Geographic search index
        `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tickets_location 
         ON tickets USING GIST (point(longitude, latitude)) 
         WHERE latitude IS NOT NULL AND longitude IS NOT NULL`,
        
        // User performance indexes
        `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_rating_country 
         ON users (rating DESC, country) 
         WHERE rating > 0`,
        
        // Contact requests optimization
        `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_contact_requests_seller_status 
         ON contact_requests (seller_id, status, created_at)`,
        
        // Ticket views analytics
        `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_ticket_views_ticket_date 
         ON ticket_views (ticket_id, viewed_at) 
         WHERE viewed_at >= CURRENT_DATE - INTERVAL '30 days'`
      ];

      for (const indexQuery of indexes) {
        await sql.unsafe(indexQuery);
      }
    });
  }

  private async addEnhancedColumns(): Promise<void> {
    await this.executeStep("Adding Enhanced Columns", async () => {
      // Add performance tracking columns to tickets
      const ticketEnhancements = [
        `ALTER TABLE tickets ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0`,
        `ALTER TABLE tickets ADD COLUMN IF NOT EXISTS contact_count INTEGER DEFAULT 0`,
        `ALTER TABLE tickets ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE`,
        `ALTER TABLE tickets ADD COLUMN IF NOT EXISTS boost_score INTEGER DEFAULT 0`,
        `ALTER TABLE tickets ADD COLUMN IF NOT EXISTS last_price_update TIMESTAMP`,
        `ALTER TABLE tickets ADD COLUMN IF NOT EXISTS availability_status TEXT DEFAULT 'available'`,
        
        // Add constraints
        `ALTER TABLE tickets ADD CONSTRAINT IF NOT EXISTS check_view_count 
         CHECK (view_count >= 0)`,
        `ALTER TABLE tickets ADD CONSTRAINT IF NOT EXISTS check_contact_count 
         CHECK (contact_count >= 0)`,
        `ALTER TABLE tickets ADD CONSTRAINT IF NOT EXISTS check_boost_score 
         CHECK (boost_score >= 0 AND boost_score <= 100)`
      ];

      // Add user reputation enhancements
      const userEnhancements = [
        `ALTER TABLE users ADD COLUMN IF NOT EXISTS trust_score DECIMAL(3,2) DEFAULT 0.00`,
        `ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_level INTEGER DEFAULT 0`,
        `ALTER TABLE users ADD COLUMN IF NOT EXISTS response_rate DECIMAL(3,2) DEFAULT 0.00`,
        `ALTER TABLE users ADD COLUMN IF NOT EXISTS avg_response_time INTEGER DEFAULT 0`,
        `ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login TIMESTAMP`,
        `ALTER TABLE users ADD COLUMN IF NOT EXISTS account_flags JSONB DEFAULT '[]'`,
        
        // Add constraints
        `ALTER TABLE users ADD CONSTRAINT IF NOT EXISTS check_trust_score 
         CHECK (trust_score >= 0 AND trust_score <= 5)`,
        `ALTER TABLE users ADD CONSTRAINT IF NOT EXISTS check_response_rate 
         CHECK (response_rate >= 0 AND response_rate <= 1)`,
        `ALTER TABLE users ADD CONSTRAINT IF NOT EXISTS check_verification_level 
         CHECK (verification_level >= 0 AND verification_level <= 5)`
      ];

      for (const enhancement of [...ticketEnhancements, ...userEnhancements]) {
        await sql.unsafe(enhancement);
      }
    });
  }

  private async createNormalizedTables(): Promise<void> {
    await this.executeStep("Creating Normalized Tables", async () => {
      // Create venues table for normalization
      await sql.unsafe(`
        CREATE TABLE IF NOT EXISTS venues (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          address TEXT,
          city VARCHAR(100) NOT NULL,
          state VARCHAR(100),
          country CHAR(2) NOT NULL DEFAULT 'US',
          postal_code VARCHAR(20),
          latitude DECIMAL(10, 8),
          longitude DECIMAL(11, 8),
          timezone VARCHAR(50) DEFAULT 'UTC',
          capacity INTEGER,
          venue_type VARCHAR(50),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          
          CONSTRAINT unique_venue_location UNIQUE (name, city, country),
          CONSTRAINT valid_capacity CHECK (capacity IS NULL OR capacity > 0),
          CONSTRAINT valid_coordinates CHECK (
            (latitude IS NULL AND longitude IS NULL) OR 
            (latitude BETWEEN -90 AND 90 AND longitude BETWEEN -180 AND 180)
          )
        )
      `);

      // Create events table for normalization
      await sql.unsafe(`
        CREATE TABLE IF NOT EXISTS events (
          id SERIAL PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          description TEXT,
          venue_id INTEGER REFERENCES venues(id),
          category VARCHAR(50) NOT NULL,
          event_date TIMESTAMP WITH TIME ZONE NOT NULL,
          status VARCHAR(20) DEFAULT 'active',
          image_url TEXT,
          organizer VARCHAR(255),
          tags JSONB DEFAULT '[]',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          
          CONSTRAINT valid_event_date CHECK (event_date > created_at)
        )
      `);

      // Create indexes for new tables
      await sql.unsafe(`
        CREATE INDEX IF NOT EXISTS idx_venues_city_country ON venues (city, country);
        CREATE INDEX IF NOT EXISTS idx_venues_location ON venues (latitude, longitude) 
        WHERE latitude IS NOT NULL AND longitude IS NOT NULL;
        CREATE INDEX IF NOT EXISTS idx_events_date_category ON events (event_date, category);
        CREATE INDEX IF NOT EXISTS idx_events_venue ON events (venue_id);
        CREATE INDEX IF NOT EXISTS idx_events_status ON events (status) WHERE status = 'active';
      `);

      // Populate venues from existing ticket data
      await sql.unsafe(`
        INSERT INTO venues (name, address, city, country, latitude, longitude)
        SELECT DISTINCT 
          venue, 
          venue_address, 
          city, 
          COALESCE(country, 'US'), 
          latitude, 
          longitude
        FROM tickets 
        WHERE venue IS NOT NULL 
        AND NOT EXISTS (
          SELECT 1 FROM venues v 
          WHERE v.name = tickets.venue 
          AND v.city = tickets.city 
          AND v.country = COALESCE(tickets.country, 'US')
        )
        ON CONFLICT (name, city, country) DO NOTHING
      `);

      // Populate events from existing ticket data
      await sql.unsafe(`
        INSERT INTO events (title, description, venue_id, category, event_date, image_url)
        SELECT DISTINCT 
          t.event_title,
          t.event_description,
          v.id,
          COALESCE(t.category, 'other'),
          t.event_date,
          t.event_image_url
        FROM tickets t
        JOIN venues v ON v.name = t.venue AND v.city = t.city AND v.country = COALESCE(t.country, 'US')
        WHERE t.event_title IS NOT NULL 
        AND NOT EXISTS (
          SELECT 1 FROM events e 
          WHERE e.title = t.event_title 
          AND e.event_date = t.event_date 
          AND e.venue_id = v.id
        )
      `);
    });
  }

  private async setupDataArchival(): Promise<void> {
    await this.executeStep("Setting Up Data Archival", async () => {
      // Create archived tickets table
      await sql.unsafe(`
        CREATE TABLE IF NOT EXISTS tickets_archived (
          LIKE tickets INCLUDING ALL,
          archived_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          archive_reason VARCHAR(100)
        )
      `);

      // Create function to archive expired tickets
      await sql.unsafe(`
        CREATE OR REPLACE FUNCTION archive_expired_tickets()
        RETURNS INTEGER AS $$
        DECLARE
          archived_count INTEGER;
        BEGIN
          -- Move expired tickets to archive
          WITH moved_tickets AS (
            DELETE FROM tickets 
            WHERE (expires_at < CURRENT_TIMESTAMP OR 
                   event_date < CURRENT_TIMESTAMP - INTERVAL '7 days' OR
                   status = 'sold')
            RETURNING *
          )
          INSERT INTO tickets_archived (
            SELECT *, CURRENT_TIMESTAMP, 'auto_expired' FROM moved_tickets
          );
          
          GET DIAGNOSTICS archived_count = ROW_COUNT;
          RETURN archived_count;
        END;
        $$ LANGUAGE plpgsql;
      `);

      // Create cleanup function for old data
      await sql.unsafe(`
        CREATE OR REPLACE FUNCTION cleanup_old_data()
        RETURNS TEXT AS $$
        DECLARE
          result TEXT := '';
          cleaned_views INTEGER;
          cleaned_archives INTEGER;
        BEGIN
          -- Clean old ticket views (keep last 90 days)
          DELETE FROM ticket_views 
          WHERE viewed_at < CURRENT_DATE - INTERVAL '90 days';
          GET DIAGNOSTICS cleaned_views = ROW_COUNT;
          
          -- Clean very old archived tickets (keep last 2 years)
          DELETE FROM tickets_archived 
          WHERE archived_at < CURRENT_DATE - INTERVAL '2 years';
          GET DIAGNOSTICS cleaned_archives = ROW_COUNT;
          
          result := format('Cleaned %s ticket views, %s old archives', 
                          cleaned_views, cleaned_archives);
          RETURN result;
        END;
        $$ LANGUAGE plpgsql;
      `);
    });
  }

  private async setupAuditSystem(): Promise<void> {
    await this.executeStep("Setting Up Audit System", async () => {
      // Create audit log table
      await sql.unsafe(`
        CREATE TABLE IF NOT EXISTS audit_log (
          id SERIAL PRIMARY KEY,
          table_name VARCHAR(50) NOT NULL,
          record_id INTEGER NOT NULL,
          operation VARCHAR(10) NOT NULL,
          old_values JSONB,
          new_values JSONB,
          user_id INTEGER,
          ip_address INET,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          
          CONSTRAINT valid_operation CHECK (operation IN ('INSERT', 'UPDATE', 'DELETE'))
        )
      `);

      // Create indexes for audit log
      await sql.unsafe(`
        CREATE INDEX IF NOT EXISTS idx_audit_table_record ON audit_log (table_name, record_id);
        CREATE INDEX IF NOT EXISTS idx_audit_user_date ON audit_log (user_id, created_at);
        CREATE INDEX IF NOT EXISTS idx_audit_created_at ON audit_log (created_at);
      `);

      // Create audit trigger function
      await sql.unsafe(`
        CREATE OR REPLACE FUNCTION audit_trigger_function()
        RETURNS TRIGGER AS $$
        BEGIN
          IF TG_OP = 'DELETE' THEN
            INSERT INTO audit_log (table_name, record_id, operation, old_values)
            VALUES (TG_TABLE_NAME, OLD.id, TG_OP, row_to_json(OLD));
            RETURN OLD;
          ELSIF TG_OP = 'UPDATE' THEN
            INSERT INTO audit_log (table_name, record_id, operation, old_values, new_values)
            VALUES (TG_TABLE_NAME, NEW.id, TG_OP, row_to_json(OLD), row_to_json(NEW));
            RETURN NEW;
          ELSIF TG_OP = 'INSERT' THEN
            INSERT INTO audit_log (table_name, record_id, operation, new_values)
            VALUES (TG_TABLE_NAME, NEW.id, TG_OP, row_to_json(NEW));
            RETURN NEW;
          END IF;
        END;
        $$ LANGUAGE plpgsql;
      `);

      // Add audit triggers to critical tables
      const auditTables = ['tickets', 'users', 'contact_requests'];
      for (const table of auditTables) {
        await sql.unsafe(`
          DROP TRIGGER IF EXISTS audit_${table}_trigger ON ${table};
          CREATE TRIGGER audit_${table}_trigger
            AFTER INSERT OR UPDATE OR DELETE ON ${table}
            FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
        `);
      }
    });
  }

  private async createPerformanceViews(): Promise<void> {
    await this.executeStep("Creating Performance Views", async () => {
      // Create trending tickets view
      await sql.unsafe(`
        CREATE OR REPLACE VIEW trending_tickets AS
        SELECT 
          t.*,
          tv.recent_views,
          cr.recent_contacts
        FROM tickets t
        LEFT JOIN (
          SELECT ticket_id, COUNT(*) as recent_views
          FROM ticket_views 
          WHERE viewed_at >= CURRENT_DATE - INTERVAL '7 days'
          GROUP BY ticket_id
        ) tv ON t.id = tv.ticket_id
        LEFT JOIN (
          SELECT ticket_id, COUNT(*) as recent_contacts
          FROM contact_requests 
          WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
          GROUP BY ticket_id
        ) cr ON t.id = cr.ticket_id
        WHERE t.status = 'available'
        AND (tv.recent_views > 5 OR cr.recent_contacts > 2)
        ORDER BY COALESCE(tv.recent_views, 0) + COALESCE(cr.recent_contacts * 3, 0) DESC;
      `);

      // Create user performance view
      await sql.unsafe(`
        CREATE OR REPLACE VIEW user_performance AS
        SELECT 
          u.id,
          u.full_name,
          u.rating,
          COUNT(DISTINCT t.id) as total_tickets,
          COUNT(DISTINCT CASE WHEN t.status = 'available' THEN t.id END) as active_tickets,
          AVG(t.price) as avg_price,
          COUNT(DISTINCT cr.id) as total_contacts,
          COUNT(DISTINCT ur.id) as total_reviews,
          COALESCE(AVG(ur.rating), 0) as avg_review_rating
        FROM users u
        LEFT JOIN tickets t ON u.id = t.seller_id
        LEFT JOIN contact_requests cr ON u.id = cr.seller_id
        LEFT JOIN user_reviews ur ON u.id = ur.user_id
        GROUP BY u.id, u.full_name, u.rating
        HAVING COUNT(DISTINCT t.id) > 0;
      `);

      // Create event popularity view
      await sql.unsafe(`
        CREATE OR REPLACE VIEW popular_events AS
        SELECT 
          event_title,
          venue,
          city,
          country,
          event_date,
          category,
          COUNT(*) as ticket_count,
          MIN(price) as min_price,
          MAX(price) as max_price,
          AVG(price) as avg_price,
          SUM(view_count) as total_views
        FROM tickets
        WHERE status = 'available' 
        AND event_date > CURRENT_TIMESTAMP
        GROUP BY event_title, venue, city, country, event_date, category
        HAVING COUNT(*) >= 2
        ORDER BY ticket_count DESC, total_views DESC;
      `);

      // Create search optimization view
      await sql.unsafe(`
        CREATE OR REPLACE VIEW search_optimized_tickets AS
        SELECT 
          t.id,
          t.title,
          t.event_title,
          t.venue,
          t.city,
          t.country,
          t.price,
          t.currency,
          t.event_date,
          t.category,
          t.status,
          to_tsvector('english', 
            t.title || ' ' || t.event_title || ' ' || 
            t.venue || ' ' || t.city || ' ' || t.category
          ) as search_vector,
          t.latitude,
          t.longitude,
          t.view_count,
          t.created_at
        FROM tickets t
        WHERE t.status = 'available'
        AND t.event_date > CURRENT_TIMESTAMP;
      `);

      // Create index on search view
      await sql.unsafe(`
        CREATE INDEX IF NOT EXISTS idx_search_optimized_vector 
        ON tickets USING GIN (to_tsvector('english', 
          title || ' ' || event_title || ' ' || venue || ' ' || city || ' ' || category))
        WHERE status = 'available' AND event_date > CURRENT_TIMESTAMP;
      `);
    });
  }

  async generateReport(): Promise<string> {
    const completedSteps = this.progress.filter(p => p.status === 'completed').length;
    const failedSteps = this.progress.filter(p => p.status === 'failed').length;
    const totalSteps = this.progress.length;

    let report = `Database Schema Refactoring Report\n`;
    report += `=====================================\n\n`;
    report += `Completed: ${completedSteps}/${totalSteps} steps\n`;
    report += `Failed: ${failedSteps} steps\n\n`;

    report += `Step Details:\n`;
    this.progress.forEach(step => {
      const status = step.status === 'completed' ? '✅' : 
                    step.status === 'failed' ? '❌' : '⏳';
      report += `${status} ${step.step}\n`;
      if (step.details) {
        report += `   ${step.details}\n`;
      }
    });

    return report;
  }
}

// Execution script
export async function executeSchemaRefactoring(): Promise<void> {
  const refactoring = new SchemaRefactoring();
  
  try {
    await refactoring.executeRefactoring();
    const report = await refactoring.generateReport();
    console.log(report);
  } catch (error) {
    console.error("Schema refactoring failed:", error);
    const report = await refactoring.generateReport();
    console.log(report);
    throw error;
  } finally {
    await sql.end();
  }
}

if (require.main === module) {
  executeSchemaRefactoring()
    .then(() => {
      console.log("Schema refactoring completed successfully");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Schema refactoring failed:", error);
      process.exit(1);
    });
}