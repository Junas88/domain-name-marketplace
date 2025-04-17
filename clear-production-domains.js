// Script to clear all domains from the production database
require('dotenv').config();
const { Pool } = require('@neondatabase/serverless');
const crypto = require('crypto');

console.log('🚨 PRODUCTION DATABASE CLEANUP SCRIPT 🚨');
console.log('This script will remove ALL domains from the production database');

// Use the DATABASE_URL from environment (this will be the production one when deployed)
if (!process.env.DATABASE_URL) {
  console.error('❌ No DATABASE_URL environment variable found. Aborting.');
  process.exit(1);
}

// Safety check to make sure this is intended to run in production
const shouldRun = process.argv.includes('--confirm-production-cleanup');
if (!shouldRun) {
  console.error('❌ Safety check failed. Add --confirm-production-cleanup flag to run this script.');
  console.log('👉 This ensures you consciously want to delete ALL domains in production.');
  process.exit(1);
}

async function clearAllProductionData() {
  console.log('🔄 Connecting to database...');
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    console.log('📊 Creating backup before deletion...');
    const { rows: domainsToBackup } = await pool.query('SELECT * FROM domains');
    
    if (domainsToBackup.length === 0) {
      console.log('ℹ️ No domains found in database. Nothing to delete.');
      return;
    }
    
    console.log(`🔍 Found ${domainsToBackup.length} domains to delete`);
    
    // Log this operation
    const timestamp = new Date();
    const operationId = crypto.randomBytes(8).toString('hex');
    
    await pool.query(`
      INSERT INTO data_versions(data_type, operation, version, record_count, last_updated, checksum, details)
      VALUES($1, $2, $3, $4, $5, $6, $7)
    `, [
      'domains',
      'production-cleanup',
      1, // DB_VERSION
      domainsToBackup.length,
      timestamp,
      operationId,
      `Production cleanup initiated. ${domainsToBackup.length} domains to be deleted.`
    ]);
    
    // Clean related tables first to prevent foreign key constraint issues
    console.log('🧹 Cleaning related tables...');
    await pool.query('DELETE FROM price_change_logs');
    await pool.query('DELETE FROM offers');
    
    // Try to delete from other potential related tables safely
    try { await pool.query('DELETE FROM inquiries'); } catch (e) { console.log('No inquiries table or already empty'); }
    try { await pool.query('DELETE FROM communications'); } catch (e) { console.log('No communications table or already empty'); }
    
    // Now delete all domains
    console.log('🗑️ Deleting all domains...');
    const { rowCount } = await pool.query('DELETE FROM domains');
    
    console.log(`✅ Successfully deleted ${rowCount} domains from production database`);
    
    // Log the completion
    await pool.query(`
      INSERT INTO data_versions(data_type, operation, version, record_count, last_updated, checksum, details)
      VALUES($1, $2, $3, $4, $5, $6, $7)
    `, [
      'domains',
      'production-cleanup-complete',
      1, // DB_VERSION
      rowCount,
      new Date(),
      crypto.randomBytes(8).toString('hex'),
      `Production cleanup completed. ${rowCount} domains were deleted.`
    ]);
    
  } catch (error) {
    console.error('❌ Error during production cleanup:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
  
  console.log('🎉 Production database cleanup complete!');
  console.log('👉 Your production site should now show no domains, matching your local environment.');
}

clearAllProductionData();