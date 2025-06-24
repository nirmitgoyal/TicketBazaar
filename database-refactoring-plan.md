# Database Schema Refactoring Plan
## Global Ticket Resale Platform

### Executive Summary
This document outlines a comprehensive database schema refactoring to enhance efficiency, scalability, and maintainability of the global ticket resale platform. The refactoring addresses data redundancy, performance bottlenecks, and scalability concerns while maintaining data integrity.

## Current Schema Analysis

### Identified Issues

1. **Data Redundancy (Critical)**
   - Event information duplicated in every ticket record
   - Estimated 70% storage overhead due to denormalization
   - Inconsistent event data across tickets for same events

2. **Performance Bottlenecks**
   - Missing composite indexes for common query patterns
   - No partitioning strategy for large tables
   - Inefficient full-text search implementation

3. **Scalability Limitations**
   - No support for horizontal scaling
   - Missing archival strategy for expired tickets
   - No caching layer integration

4. **Data Integrity Concerns**
   - Missing enum constraints for status fields
   - Insufficient validation rules
   - No proper cascade deletion strategies

## Refactored Schema Design

### 1. Event Normalization

**New Events Table:**
```sql
CREATE TABLE events (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    venue_id INTEGER REFERENCES venues(id),
    category event_category NOT NULL,
    event_date TIMESTAMP WITH TIME ZONE NOT NULL,
    doors_open TIMESTAMP WITH TIME ZONE,
    age_restriction age_restriction_enum,
    status event_status DEFAULT 'active',
    image_url TEXT,
    external_id VARCHAR(100), -- For API integrations
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**New Venues Table:**
```sql
CREATE TABLE venues (
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
    venue_type venue_type_enum,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 2. Enhanced Tickets Table

**Refactored Tickets:**
```sql
CREATE TABLE tickets (
    id SERIAL PRIMARY KEY,
    event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    seller_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    section VARCHAR(50),
    row VARCHAR(10),
    seat VARCHAR(20),
    price DECIMAL(10, 2) NOT NULL CHECK (price > 0),
    currency CHAR(3) NOT NULL DEFAULT 'USD',
    original_price DECIMAL(10, 2) CHECK (original_price >= price),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    available_quantity INTEGER NOT NULL CHECK (available_quantity <= quantity),
    status ticket_status DEFAULT 'available',
    transfer_method transfer_method_enum NOT NULL,
    is_transferrable BOOLEAN DEFAULT TRUE,
    additional_info TEXT,
    show_contact_info BOOLEAN DEFAULT FALSE,
    verification_code VARCHAR(100),
    qr_code TEXT,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT valid_available_quantity CHECK (available_quantity >= 0),
    CONSTRAINT valid_expiry CHECK (expires_at > created_at)
) PARTITION BY RANGE (created_at);
```

### 3. Enhanced Indexing Strategy

**Performance Indexes:**
```sql
-- Composite indexes for common queries
CREATE INDEX idx_tickets_event_status_price ON tickets (event_id, status, price);
CREATE INDEX idx_tickets_seller_status ON tickets (seller_id, status);
CREATE INDEX idx_events_date_category ON events (event_date, category);
CREATE INDEX idx_venues_location ON venues USING GIST (point(longitude, latitude));

-- Full-text search indexes
CREATE INDEX idx_events_search ON events USING GIN (to_tsvector('english', title || ' ' || description));
CREATE INDEX idx_venues_search ON venues USING GIN (to_tsvector('english', name || ' ' || city));

-- Partial indexes for active records
CREATE INDEX idx_active_tickets ON tickets (event_id, price) WHERE status = 'available';
CREATE INDEX idx_active_events ON events (event_date, category) WHERE status = 'active';
```

### 4. Table Partitioning

**Tickets Partitioning by Date:**
```sql
-- Monthly partitions for tickets
CREATE TABLE tickets_2025_01 PARTITION OF tickets 
FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');

CREATE TABLE tickets_2025_02 PARTITION OF tickets 
FOR VALUES FROM ('2025-02-01') TO ('2025-03-01');

-- Automated partition management
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
    
    EXECUTE format('CREATE TABLE %I PARTITION OF tickets FOR VALUES FROM (%L) TO (%L)',
                   partition_name, start_date, end_date);
END;
$$ LANGUAGE plpgsql;
```

### 5. Enhanced User System

**Updated Users Table:**
```sql
ALTER TABLE users 
ADD COLUMN reputation_score INTEGER DEFAULT 0,
ADD COLUMN account_status user_status DEFAULT 'active',
ADD COLUMN last_active TIMESTAMP,
ADD COLUMN profile_completion_score INTEGER DEFAULT 0,
ADD COLUMN two_factor_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN email_notifications BOOLEAN DEFAULT TRUE,
ADD COLUMN push_notifications BOOLEAN DEFAULT TRUE;

-- Add check constraints
ALTER TABLE users ADD CONSTRAINT valid_rating CHECK (rating >= 0 AND rating <= 5);
ALTER TABLE users ADD CONSTRAINT valid_reputation CHECK (reputation_score >= 0);
```

### 6. Enhanced Security & Auditing

**Audit Table for Critical Operations:**
```sql
CREATE TABLE audit_log (
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
);

CREATE INDEX idx_audit_log_table_record ON audit_log (table_name, record_id);
CREATE INDEX idx_audit_log_user_date ON audit_log (user_id, created_at);
```

### 7. Caching Layer Integration

**Redis Integration Schema:**
```sql
-- Cache invalidation tracking
CREATE TABLE cache_invalidation (
    id SERIAL PRIMARY KEY,
    cache_key VARCHAR(255) NOT NULL,
    invalidated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reason VARCHAR(100)
);

-- Popular events caching
CREATE MATERIALIZED VIEW popular_events AS
SELECT 
    e.id,
    e.title,
    e.event_date,
    v.city,
    v.country,
    COUNT(t.id) as ticket_count,
    AVG(t.price) as avg_price,
    MIN(t.price) as min_price
FROM events e
JOIN venues v ON e.venue_id = v.id
JOIN tickets t ON e.id = t.event_id
WHERE e.status = 'active' AND t.status = 'available'
GROUP BY e.id, e.title, e.event_date, v.city, v.country
HAVING COUNT(t.id) >= 5;

CREATE UNIQUE INDEX idx_popular_events_id ON popular_events (id);
```

## Migration Strategy

### Phase 1: Schema Preparation (Week 1)
1. Create new tables (events, venues, audit_log)
2. Add new columns to existing tables
3. Create enum types and constraints
4. Set up partitioning infrastructure

### Phase 2: Data Migration (Week 2)
1. Extract unique events from tickets table
2. Create venue records from ticket data
3. Update ticket references to new event IDs
4. Validate data integrity

### Phase 3: Index Optimization (Week 3)
1. Drop old indexes
2. Create new optimized indexes
3. Create materialized views
4. Set up automatic partition management

### Phase 4: Application Updates (Week 4)
1. Update ORM schema definitions
2. Modify API endpoints
3. Update queries to use new structure
4. Implement caching layer

### Phase 5: Cleanup & Monitoring (Week 5)
1. Remove redundant columns
2. Set up monitoring and alerting
3. Performance testing and optimization
4. Documentation updates

## Performance Improvements Expected

### Storage Optimization
- **70% reduction** in storage usage through normalization
- **50% faster** query performance with optimized indexes
- **80% reduction** in data inconsistencies

### Scalability Enhancements
- Support for **10x more concurrent users**
- **90% faster** search operations with full-text indexes
- **Automatic scaling** with partitioning strategy

### Maintenance Benefits
- **Simplified** data updates and consistency
- **Automated** archival and cleanup processes
- **Enhanced** monitoring and debugging capabilities

## Risk Mitigation

### Data Safety
- Complete database backup before migration
- Rollback procedures documented and tested
- Data validation at each migration step

### Downtime Minimization
- Blue-green deployment strategy
- Staged rollout with feature flags
- Real-time monitoring during migration

### Performance Monitoring
- Query performance baseline establishment
- Continuous monitoring during transition
- Automated alerts for performance degradation

## Testing Strategy

### Unit Tests
- Schema validation tests
- Constraint enforcement tests
- Migration script validation

### Integration Tests
- API endpoint functionality
- Complex query performance
- Cache invalidation logic

### Performance Tests
- Load testing with realistic traffic
- Query performance benchmarks
- Scalability testing under stress

### Data Integrity Tests
- Foreign key constraint validation
- Data consistency checks
- Audit trail verification

## Deployment Plan

### Pre-Deployment
1. Complete testing in staging environment
2. Performance baseline measurement
3. Rollback procedure validation
4. Team training on new schema

### Deployment Steps
1. **Maintenance window announcement** (48 hours notice)
2. **Database backup** (full dump + WAL archiving)
3. **Schema migration** (automated scripts)
4. **Data validation** (automated checks)
5. **Application deployment** (blue-green switch)
6. **Performance monitoring** (real-time dashboards)

### Post-Deployment
1. **Performance validation** (compare to baseline)
2. **Error monitoring** (application and database logs)
3. **User acceptance testing** (critical user journeys)
4. **Documentation updates** (API docs, schema docs)

### Rollback Procedures
1. **Database rollback** (from backup if needed)
2. **Application rollback** (previous version deployment)
3. **DNS/Load balancer** switching
4. **User communication** (status updates)

## Success Metrics

### Performance KPIs
- Query response time < 100ms (95th percentile)
- Database storage reduction > 60%
- Search performance improvement > 80%
- User concurrency increase > 500%

### Reliability KPIs
- Zero data loss during migration
- Downtime < 2 hours during deployment
- Post-migration error rate < 0.1%
- User satisfaction score > 95%

### Scalability KPIs
- Support for 100k+ concurrent users
- 10M+ tickets without performance degradation
- Auto-scaling triggers working properly
- Cache hit ratio > 90%

This refactoring plan provides a comprehensive roadmap for transforming the database schema while maintaining system reliability and minimizing risk.