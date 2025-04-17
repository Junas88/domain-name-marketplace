import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';
import * as dotenv from 'dotenv';

dotenv.config();

neonConfig.webSocketConstructor = ws;

async function main() {
  console.log('Checking deployment environment variables...');
  
  // Check if DATABASE_URL exists
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL is not defined in the environment!');
    process.exit(1);
  }
  
  try {
    // Try connecting to the database
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    
    // Get database information
    const { rows: serverInfo } = await pool.query('SELECT version(), current_timestamp, inet_server_addr() as server_ip');
    console.log('\n📊 Database server info:');
    console.log(`PostgreSQL version: ${serverInfo[0].version}`);
    console.log(`Server time: ${serverInfo[0].current_timestamp}`);
    console.log(`Server IP: ${serverInfo[0].server_ip || 'Not available'}`);
    
    // Check if we're seeing a different connection in production
    const { rows: dbSize } = await pool.query('SELECT pg_database_size(current_database()) as size');
    console.log(`Database size: ${Math.round(dbSize[0].size / 1024)} KB`);
    
    // Count domains in this database connection
    const { rows: domainCount } = await pool.query('SELECT COUNT(*) as count FROM domains');
    console.log(`\n📋 Domain count: ${domainCount[0].count}`);
    
    if (parseInt(domainCount[0].count) > 0) {
      // List the first 5 domains if any exist
      const { rows: domains } = await pool.query('SELECT id, name, price, is_sold, updated_at FROM domains LIMIT 5');
      console.log('\n⚠️ Found domains in this database connection:');
      domains.forEach(domain => {
        console.log(`- ID: ${domain.id}, Name: ${domain.name}, Price: $${domain.price}, Sold: ${domain.is_sold ? 'Yes' : 'No'}, Updated: ${domain.updated_at}`);
      });
      
      console.log('\n🔄 These domains might be from a different database than your development environment.');
      console.log('Consider checking if you have multiple database connections or if production is using a different database URL.');
    } else {
      console.log('\n✅ No domains found in this database. This confirms your deletion operation worked as expected.');
    }
    
    // Check environment variables related to deployment
    console.log('\n🔧 Environment variables:');
    const deploymentVars = Object.keys(process.env).filter(key => 
      key.includes('REPLIT') || 
      key.includes('DEPLOYMENT') || 
      key.includes('PROD') || 
      key.includes('STAGING')
    );
    
    if (deploymentVars.length > 0) {
      console.log('Found deployment-related environment variables:');
      deploymentVars.forEach(key => {
        console.log(`- ${key}`);
      });
    } else {
      console.log('No deployment-specific environment variables found.');
    }
    
    await pool.end();
    console.log('\n✅ All required environment variables are set.');
    
  } catch (error) {
    console.error('❌ Error connecting to database:', error);
    process.exit(1);
  }
}

main().catch(console.error);