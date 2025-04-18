/**
 * Database Connection Checker for Deployment
 * 
 * This script tests the database connection using the DATABASE_URL
 * environment variable. It's especially useful for verifying that
 * Vercel can connect to your Supabase database before deployment.
 */

import { Pool } from '@neondatabase/serverless';
import 'dotenv/config';

async function main() {
  console.log('🔍 Checking Database Connection');
  console.log('===============================');
  
  // Check for DATABASE_URL
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL environment variable is not set.');
    console.error('   This is required for connecting to the database.');
    console.error('   Make sure to add it to your .env file or Vercel environment variables.');
    process.exit(1);
  }
  
  console.log('✅ DATABASE_URL environment variable is set.');
  
  // Parse the URL to show some details (without exposing passwords)
  try {
    const dbUrl = new URL(process.env.DATABASE_URL);
    console.log(`   Database type: ${dbUrl.protocol.replace(':', '')}`);
    console.log(`   Host: ${dbUrl.hostname}`);
    console.log(`   Username: ${dbUrl.username}`);
    console.log(`   Database name: ${dbUrl.pathname.replace('/', '')}`);
  } catch (error) {
    console.error('❌ Unable to parse DATABASE_URL:', error.message);
    console.error('   Please check the format of your DATABASE_URL.');
    process.exit(1);
  }
  
  // Attempt to connect
  console.log('\nAttempting to connect to the database...');
  let pool;
  
  try {
    pool = new Pool({ connectionString: process.env.DATABASE_URL });
    
    // Test the connection
    const client = await pool.connect();
    console.log('✅ Successfully connected to the database!');
    
    // Quick test query
    const result = await client.query('SELECT NOW()');
    console.log(`   Server time: ${result.rows[0].now}`);
    
    // Check if tables exist
    try {
      const tablesResult = await client.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
      `);
      
      console.log(`   Found ${tablesResult.rowCount} tables in database:`);
      tablesResult.rows.forEach((row, index) => {
        console.log(`     ${index + 1}. ${row.table_name}`);
      });
    } catch (error) {
      console.warn('⚠️ Unable to check for tables:', error.message);
    }
    
    // Release the client
    client.release();
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('\nTroubleshooting tips:');
    console.error('1. Verify your DATABASE_URL is correct');
    console.error('2. Ensure your database server is running');
    console.error('3. Check if your IP is allowed in database firewall rules');
    console.error('4. For Supabase: Enable "Trusted IPs Only" in project settings');
    process.exit(1);
  } finally {
    if (pool) {
      console.log('Closing connection pool...');
      await pool.end();
    }
  }
  
  console.log('\n✅ Database Connection Test Completed Successfully!');
  console.log('This database connection should work when deployed to Vercel.');
}

main().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});