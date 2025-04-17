// Direct script to immediately clear production domains
// This is a simplified version for direct execution in the production environment
require('dotenv').config();

// This runs only with the explicit environment variable to prevent accidental execution
if (!process.env.FORCE_CLEAR_PRODUCTION) {
  console.log('⚠️ Safety check: Set FORCE_CLEAR_PRODUCTION=true to run this script');
  console.log('This prevents accidental clearing of production data');
  process.exit(0);
}

const { Pool } = require('@neondatabase/serverless');

async function clearProductionDomains() {
  console.log('🔄 Connecting to production database...');
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  
  try {
    // Execute in transaction for safety
    await pool.query('BEGIN');
    
    // Clear related tables first
    console.log('Clearing price_change_logs...');
    await pool.query('DELETE FROM price_change_logs');
    
    console.log('Clearing offers...');
    await pool.query('DELETE FROM offers');
    
    // Try other related tables
    try { await pool.query('DELETE FROM inquiries'); } catch (e) {}
    try { await pool.query('DELETE FROM communications'); } catch (e) {}
    
    // Delete all domains
    console.log('Deleting all domains from production...');
    const { rowCount } = await pool.query('DELETE FROM domains');
    
    await pool.query('COMMIT');
    
    console.log(`✅ Successfully deleted ${rowCount} domains from production`);
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('❌ Error:', error);
  } finally {
    await pool.end();
  }
}

console.log('🚨 WARNING: CLEARING ALL PRODUCTION DOMAINS 🚨');
clearProductionDomains().then(() => {
  console.log('✅ Production cleanup complete');
});