import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';

dotenv.config();

/**
 * Migration script to add profile picture column
 * Adds profile_picture field to store Google OAuth profile pictures
 */
async function migrateProfilePicture() {
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.error('DATABASE_URL environment variable is required');
    process.exit(1);
  }

  console.log('Starting profile picture migration...');
  
  try {
    const sql = neon(databaseUrl);

    // Check if the column already exists
    console.log('Step 1: Checking if profile_picture column exists...');
    const columnExists = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'profile_picture'
    `;

    if (columnExists.length > 0) {
      console.log('✅ profile_picture column already exists. Migration not needed.');
      process.exit(0);
    }

    // Add the profile_picture column
    console.log('Step 2: Adding profile_picture column...');
    await sql`ALTER TABLE users ADD COLUMN profile_picture TEXT`;

    console.log('✅ Profile picture migration completed successfully!');
    
    // Verify the migration
    const result = await sql`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'profile_picture'
    `;
    
    console.log('Profile picture column details after migration:', result[0]);
    
  } catch (error) {
    console.error('Migration failed:', error);
    console.log('\nNote: If you encounter any issues, please check your database connection and try again.');
    process.exit(1);
  }
}

// Run the migration
migrateProfilePicture();