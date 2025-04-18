/**
 * Database Connection Tester for Domain Name Guide
 * 
 * This script tests the connection to your Supabase database.
 * Run it before deployment to verify your connection string works.
 */

// Load environment variables from .env file
require('dotenv').config();

async function main() {
  try {
    console.log('Testing database connection...');
    
    // Check if DATABASE_URL is set
    if (!process.env.DATABASE_URL) {
      console.error('❌ DATABASE_URL environment variable is not set.');
      console.log('Please set it in your .env file or environment variables.');
      process.exit(1);
    }
    
    // Check if it's a Supabase URL
    if (!process.env.DATABASE_URL.includes('supabase.co')) {
      console.warn('⚠️ This does not appear to be a Supabase database URL.');
      console.log('Expected format: postgresql://postgres:password@db.YOURPROJECT.supabase.co:5432/postgres');
    }
    
    // Import and initialize the database client
    const { Pool } = require('@neondatabase/serverless');
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    });
    
    // Test the connection
    console.log('Connecting to database...');
    const result = await pool.query(`
      SELECT current_setting('server_version') as version, 
             pg_is_in_recovery() as is_replica,
             current_timestamp as server_time;
    `);
    
    console.log('✅ Connection successful!');
    console.log(`PostgreSQL server version: ${result.rows[0].version}`);
    console.log(`Server time: ${result.rows[0].server_time}`);
    console.log(`Is replica: ${result.rows[0].is_replica}`);
    
    // Get database size
    try {
      const sizeResult = await pool.query(`
        SELECT pg_size_pretty(pg_database_size(current_database())) as db_size;
      `);
      console.log(`Database size: ${sizeResult.rows[0].db_size}`);
    } catch (sizeError) {
      console.warn('⚠️ Could not retrieve database size.');
    }
    
    // Check for required tables
    try {
      const tablesResult = await pool.query(`
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
        ORDER BY table_name;
      `);
      
      console.log('\nDatabase tables:');
      if (tablesResult.rows.length === 0) {
        console.log('No tables found in the database.');
      } else {
        tablesResult.rows.forEach(row => {
          console.log(`- ${row.table_name}`);
        });
      }
      
      // Check for essential tables
      const essentialTables = ['users', 'domains', 'page_contents', 'data_versions'];
      const missingTables = essentialTables.filter(
        table => !tablesResult.rows.some(row => row.table_name === table)
      );
      
      if (missingTables.length > 0) {
        console.warn('\n⚠️ Missing essential tables:');
        missingTables.forEach(table => {
          console.log(`- ${table}`);
        });
        console.log('\nYou may need to run database migrations or seed the database.');
      } else {
        console.log('\n✅ All essential tables are present.');
      }
    } catch (tablesError) {
      console.error('❌ Could not retrieve table information:', tablesError.message);
    }
    
    // Clean up
    await pool.end();
    console.log('\nConnection test completed.');
    
  } catch (error) {
    console.error('❌ Database connection failed:');
    console.error(error.message);
    process.exit(1);
  }
}

// Run the script
main().catch(err => {
  console.error('Unhandled error:', err);
  process.exit(1);
});