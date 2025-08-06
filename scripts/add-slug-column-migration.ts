/**
 * Migration script to add slug column to tickets table and populate existing tickets
 */
import { db } from '../server/db';
import { tickets } from '../shared/schema';
import { sql } from 'drizzle-orm';
import { generateSlug, generateUniqueSlug } from '../shared/utils/slug';

async function addSlugColumnMigration() {
  console.log('🚀 Starting slug column migration...');

  try {
    // Step 1: Add slug column to tickets table
    console.log('1. Adding slug column to tickets table...');
    await db.execute(sql`
      ALTER TABLE tickets 
      ADD COLUMN IF NOT EXISTS slug TEXT;
    `);

    // Step 2: Get all existing tickets
    console.log('2. Fetching existing tickets...');
    const existingTickets = await db
      .select({
        id: tickets.id,
        eventTitle: tickets.eventTitle,
        slug: tickets.slug
      })
      .from(tickets);

    console.log(`Found ${existingTickets.length} existing tickets`);

    // Step 3: Generate slugs for tickets that don't have them
    const ticketsNeedingSlugs = existingTickets.filter(ticket => !ticket.slug);
    console.log(`${ticketsNeedingSlugs.length} tickets need slugs`);

    if (ticketsNeedingSlugs.length === 0) {
      console.log('✅ All tickets already have slugs');
      return;
    }

    // Step 4: Generate unique slugs
    const existingSlugs = existingTickets
      .map(ticket => ticket.slug)
      .filter(Boolean) as string[];

    const slugUpdates: { id: number; slug: string }[] = [];

    for (const ticket of ticketsNeedingSlugs) {
      const baseSlug = generateSlug(ticket.eventTitle);
      const uniqueSlug = generateUniqueSlug(baseSlug, [...existingSlugs, ...slugUpdates.map(u => u.slug)]);
      
      slugUpdates.push({
        id: ticket.id,
        slug: uniqueSlug
      });

      console.log(`Generated slug for ticket ${ticket.id}: "${ticket.eventTitle}" -> "${uniqueSlug}"`);
    }

    // Step 5: Update tickets with generated slugs
    console.log('3. Updating tickets with generated slugs...');
    for (const update of slugUpdates) {
      await db
        .update(tickets)
        .set({ slug: update.slug })
        .where(sql`id = ${update.id}`);
    }

    // Step 6: Add unique constraint to slug column
    console.log('4. Adding unique constraint to slug column...');
    await db.execute(sql`
      ALTER TABLE tickets 
      ADD CONSTRAINT tickets_slug_unique UNIQUE (slug);
    `);

    // Step 7: Make slug column NOT NULL
    console.log('5. Making slug column NOT NULL...');
    await db.execute(sql`
      ALTER TABLE tickets 
      ALTER COLUMN slug SET NOT NULL;
    `);

    // Step 8: Create index on slug column
    console.log('6. Creating index on slug column...');
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS tickets_slug_idx ON tickets(slug);
    `);

    console.log('✅ Slug column migration completed successfully!');
    console.log(`📊 Updated ${slugUpdates.length} tickets with new slugs`);

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

// Run migration if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  addSlugColumnMigration()
    .then(() => {
      console.log('Migration completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}

export { addSlugColumnMigration };
