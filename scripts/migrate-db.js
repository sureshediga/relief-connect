#!/usr/bin/env node

/**
 * Database Migration Script
 * 
 * This script pushes the Prisma schema to the database.
 * It uses DIRECT_URL for migrations (connection pooling doesn't support schema changes).
 * 
 * Usage:
 *   node scripts/migrate-db.js
 * 
 * Or set environment variables:
 *   DIRECT_URL="postgresql://..." node scripts/migrate-db.js
 */

const { execSync } = require('child_process');
const path = require('path');

console.log('🔄 Running database migration...\n');

// Check if DIRECT_URL is set
if (!process.env.DIRECT_URL) {
  console.error('❌ ERROR: DIRECT_URL environment variable is not set.');
  console.error('\nPlease set DIRECT_URL to your direct database connection string:');
  console.error('  DIRECT_URL="postgresql://postgres:password@db.xxx.supabase.co:5432/postgres?schema=public"');
  console.error('\nNote: Use the direct connection (port 5432), not the pooler connection.');
  process.exit(1);
}

try {
  // Set DATABASE_URL to DIRECT_URL for migrations
  process.env.DATABASE_URL = process.env.DIRECT_URL;
  
  // Run prisma db push
  console.log('📦 Pushing schema to database...');
  execSync('npx prisma db push --accept-data-loss', {
    stdio: 'inherit',
    cwd: path.join(__dirname, '..'),
  });
  
  console.log('\n✅ Database migration completed successfully!');
} catch (error) {
  console.error('\n❌ Migration failed:', error.message);
  process.exit(1);
}

