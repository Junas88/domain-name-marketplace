
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";
import fs from "fs";
import path from "path";
import crypto from "crypto";

// Configure Neon database to use websockets
neonConfig.webSocketConstructor = ws;

// Helper function to check if we're in a deployment environment
const isDeployment = process.env.REPL_DEPLOYMENT === 'true';

// Define pool type explicitly to avoid implicit any
let pool: Pool | null = null;
let db: any = null;

// Function to construct DATABASE_URL from individual parts if needed
function constructDatabaseUrl() {
  // If DATABASE_URL is already set, use it
  if (process.env.DATABASE_URL) {
    console.log('Using DATABASE_URL from environment');
    return process.env.DATABASE_URL;
  }
  
  // Try to construct from individual parts
  const user = process.env.PGUSER;
  const password = process.env.PGPASSWORD;
  const host = process.env.PGHOST;
  const port = process.env.PGPORT;
  const database = process.env.PGDATABASE;
  
  if (user && password && host && port && database) {
    console.log('Constructing DATABASE_URL from individual credentials');
    return `postgresql://${user}:${password}@${host}:${port}/${database}`;
  }
  
  if (isDeployment) {
    console.warn("⚠️ No database credentials found in deployment environment!");
    console.warn("Please add DATABASE_URL to your deployment environment variables.");
  } else {
    console.warn("No database credentials found. Using in-memory storage for development.");
  }
  return null;
}

// Function to create a backup dump of critical data
async function backupDataToFile(data: any, type: string): Promise<string> {
  try {
    const timestamp = new Date().toISOString().replace(/:/g, '-');
    const backupDir = path.join(process.cwd(), 'backups');
    
    // Create backups directory if it doesn't exist
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    
    // Create a checksum of the data
    const dataString = JSON.stringify(data);
    const checksum = crypto.createHash('sha256').update(dataString).digest('hex');
    
    // Create the backup file path
    const backupPath = path.join(backupDir, `${type}-backup-${timestamp}.json`);
    
    // Write the data to a file
    fs.writeFileSync(backupPath, JSON.stringify({
      data,
      checksum,
      timestamp,
      type,
      version: schema.DB_VERSION,
      recordCount: Array.isArray(data) ? data.length : 1
    }, null, 2));
    
    // Also log this backup in the database if connection exists
    try {
      if (db) {
        await db.insert(schema.dataVersions).values({
          dataType: type,
          version: schema.DB_VERSION,
          checksum,
          recordCount: Array.isArray(data) ? data.length : 1,
          details: `Manual backup created: ${backupPath}`,
          lastUpdated: new Date()
        });
        console.log(`📊 Backup metadata saved to database`);
      }
    } catch (dbError) {
      console.error("Failed to log backup in database:", dbError);
      // Continue anyway - the file backup is still valid
    }
    
    console.log(`✅ Created backup of ${type} data at ${backupPath}`);
    return checksum;
  } catch (err) {
    console.error(`❌ Failed to backup ${type} data:`, err);
    return '';
  }
}

// Function to verify data persistence by checking if it exists in the database
async function verifyDataPersistence(type: string, data: any): Promise<boolean> {
  if (!db || !pool) {
    console.warn("⚠️ Cannot verify data persistence: database connection not available");
    return false;
  }
  
  try {
    // Different verification strategies based on data type
    switch (type) {
      case 'domains':
        // For domains, verify a sample of the domains exist with correct prices
        if (Array.isArray(data) && data.length > 0) {
          // Take a random sampling of domains to check (up to 5)
          const samplesToCheck = Math.min(5, data.length);
          const sampleIndices = Array.from({ length: samplesToCheck }, () => 
            Math.floor(Math.random() * data.length)
          );
          
          // Check each sampled domain
          for (const index of sampleIndices) {
            const domain = data[index];
            const result = await db.query.domains.findFirst({
              where: (domains, { eq }) => eq(domains.id, domain.id)
            });
            
            if (!result) {
              console.error(`❌ Domain #${domain.id} (${domain.name}) not found in database`);
              return false;
            }
            
            if (result.price !== domain.price) {
              console.error(`❌ Price mismatch for domain #${domain.id}: expected $${domain.price}, got $${result.price}`);
              return false;
            }
          }
          console.log(`✅ Verified ${samplesToCheck} sample domains in database`);
          return true;
        }
        return false;
      
      default:
        console.warn(`⚠️ No verification strategy for data type: ${type}`);
        return false;
    }
  } catch (error) {
    console.error(`❌ Error verifying data persistence:`, error);
    return false;
  }
}

try {
  const databaseUrl = constructDatabaseUrl();
  
  if (databaseUrl) {
    console.log(`Initializing database connection ${isDeployment ? 'in deployment' : 'in development'}`);
    pool = new Pool({ 
      connectionString: databaseUrl,
      ssl: isDeployment ? { rejectUnauthorized: false } : false,
      connectionTimeoutMillis: 10000, // Increased timeout
      max: 20,                        // Increased max connections
      idleTimeoutMillis: 30000,       // How long a client is allowed to remain idle before being closed
      retryDelay: 1000,               // Delay between connection retries
      maxConnAttempts: 5              // Maximum connection attempts
    });
    
    // Test the connection and get version at the same time
    const result = await pool.query(`
      SELECT current_setting('server_version') as version, 
             pg_is_in_recovery() as is_replica,
             current_timestamp as server_time;
    `);
    
    console.log(`PostgreSQL server version: ${result.rows[0].version}`);
    console.log(`Server time: ${result.rows[0].server_time}`);
    console.log(`Is replica: ${result.rows[0].is_replica}`);
    
    // Get database size info
    const sizeResult = await pool.query(`
      SELECT pg_size_pretty(pg_database_size(current_database())) as db_size;
    `);
    console.log(`Database size: ${sizeResult.rows[0].db_size}`);
    
    db = drizzle(pool, { schema });
    console.log('✅ Database connection established successfully');
    
    // Create a connection health check function that runs periodically
    const healthCheckInterval = setInterval(async () => {
      try {
        const healthCheck = await pool.query('SELECT 1 as health_check');
        if (healthCheck.rows[0].health_check === 1) {
          // Database is healthy
        } else {
          console.error("⚠️ Database health check returned unexpected result");
        }
      } catch (err) {
        console.error("❌ Database health check failed:", err.message);
        // Could add recovery logic here
      }
    }, 60000); // Check every minute
    
    // Clean up the interval on process exit
    process.on('SIGTERM', () => {
      clearInterval(healthCheckInterval);
      pool.end();
    });
    
    process.on('SIGINT', () => {
      clearInterval(healthCheckInterval);
      pool.end();
    });
    
  } else {
    pool = null;
    db = null;
    if (isDeployment) {
      throw new Error('DATABASE_URL is required in deployment environment');
    }
  }
} catch (error) {
  console.error("❌ Database connection error:", error.message);
  if (isDeployment) {
    console.error("Critical: Database connection failed in deployment environment");
    throw error; // Re-throw in deployment to prevent starting without database
  } else {
    console.log('Falling back to in-memory mode for development');
    pool = null;
    db = null;
  }
}

// Export database entities and utility functions
export { pool, db, backupDataToFile, verifyDataPersistence };
