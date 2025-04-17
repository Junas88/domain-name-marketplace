/**
 * This script is intended to help clear deployment caches and ensure the latest data
 * is shown in both development and production environments.
 */

import fs from 'fs';
import path from 'path';
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from 'ws';
import * as dotenv from 'dotenv';

dotenv.config();

// Configure Neon PostgreSQL connection
neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set. Did you forget to provision a database?");
}

// Create database connection
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);

async function main() {
  console.log('🧹 Starting cache clearing operations...');
  
  try {
    // 1. Clear domains table
    console.log('Deleting all domains from database...');
    await pool.query('DELETE FROM domains');
    console.log('✅ All domains deleted successfully');
    
    // 2. Clear related tables
    console.log('Cleaning up related tables...');
    await pool.query('DELETE FROM price_change_logs');
    await pool.query('DELETE FROM offers');
    await pool.query('DELETE FROM inquiries');
    await pool.query('DELETE FROM communications');
    console.log('✅ Related tables cleaned successfully');
    
    // 3. Add a cache invalidation record to data_versions
    console.log('Adding cache invalidation record...');
    await pool.query(`
      INSERT INTO data_versions (data_type, operation, version, record_count, details, last_updated, checksum)
      VALUES ('cache-invalidation', 'clear-all', 1, 0, 'Manual cache clearing operation', NOW(), $1)
    `, [Date.now().toString()]);
    console.log('✅ Cache invalidation record added');
    
    // 4. Log cleanup completion
    console.log('\n🎉 Cache clearing complete! The database has been reset.\n');
    console.log('If you still see old data in production:');
    console.log('1. Make sure to hard-refresh your browser (Ctrl+F5)');
    console.log('2. Try clearing your browser cache completely');
    console.log('3. Try accessing the site in an incognito/private window');
    console.log('4. If using a custom domain, DNS caching might be an issue');
    
  } catch (error) {
    console.error('❌ Error while clearing cache:', error);
  } finally {
    await pool.end();
  }
}

main().catch(console.error);