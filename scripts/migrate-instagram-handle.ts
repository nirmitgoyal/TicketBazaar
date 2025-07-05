import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';

dotenv.config();

/**
 * Migration script to update Instagram handle column
 * Makes it NOT NULL and VARCHAR(20)
 */
async function migrateInstagramHandle() {
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.error('DATABASE_URL environment variable is required');
    process.exit(1);
  }

  console.log('Starting Instagram handle migration...');
  
  try {
    const sql = neon(databaseUrl);

    // First, update any NULL Instagram values to empty string temporarily
    console.log('Step 1: Updating NULL Instagram values...');
    await sql`UPDATE users SET instagram = '' WHERE instagram IS NULL`;

    // Then alter the column to be VARCHAR(20) NOT NULL
    console.log('Step 2: Altering Instagram column...');
    await sql`ALTER TABLE users ALTER COLUMN instagram TYPE VARCHAR(20)`;
    await sql`ALTER TABLE users ALTER COLUMN instagram SET NOT NULL`;

    // Add a check constraint to ensure valid Instagram handles
    console.log('Step 3: Adding constraint for Instagram handle format...');
    await sql`ALTER TABLE users ADD CONSTRAINT valid_instagram_handle 
              CHECK (instagram ~ '^[a-zA-Z0-9_.]{1,20}$')`;

    console.log('✅ Instagram handle migration completed successfully!');
    
    // Verify the migration
    const result = await sql`
      SELECT column_name, data_type, character_maximum_length, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'instagram'
    `;
    
    console.log('Instagram column details after migration:', result[0]);
    
  } catch (error) {
    console.error('Migration failed:', error);
    console.log('\nNote: If users already have Instagram handles that are NULL or longer than 20 characters,');
    console.log('you may need to update those records first before running this migration.');
    process.exit(1);
  }
}

// Run the migration
migrateInstagramHandle();