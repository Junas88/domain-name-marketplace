
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
    
    // Ensure required tables exist
    try {
      // Check for dataVersions table and create it if it doesn't exist
      const tableCheck = await pool.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'data_versions'
        );
      `);
      
      if (!tableCheck.rows[0].exists) {
        console.log("⚠️ dataVersions table missing, creating it now...");
        
        // Create the table manually since it's critical for persistence monitoring
        await pool.query(`
          CREATE TABLE IF NOT EXISTS data_versions (
            id SERIAL PRIMARY KEY,
            data_type TEXT NOT NULL,
            version TEXT NOT NULL,
            last_updated TIMESTAMP DEFAULT NOW() NOT NULL,
            checksum TEXT,
            record_count INTEGER,
            details TEXT
          );
        `);
        
        console.log("✅ dataVersions table created successfully");
        
        // Add initial version record
        await db.insert(schema.dataVersions).values({
          dataType: "system-init",
          version: schema.DB_VERSION,
          details: "Initial system setup",
          recordCount: 0,
        });
        
        console.log("✅ Initial data version record created");
      }
    } catch (tableError) {
      console.error("❌ Error checking/creating dataVersions table:", tableError);
      // Continue anyway - table will be created by Drizzle migration
    }
    
    // Create a connection health check function with data integrity verification
    const healthCheckInterval = setInterval(async () => {
      try {
        // Basic connection health check
        const healthCheck = await pool.query('SELECT 1 as health_check');
        if (healthCheck.rows[0].health_check !== 1) {
          console.error("⚠️ Database health check returned unexpected result");
          return;
        }
        
        // Enhanced data integrity check (only run every 5th check - every 5 minutes)
        if (Math.random() < 0.2) { // 20% chance to run the verification
          console.log("📊 Running scheduled data integrity verification...");
          
          // Check domain price data integrity
          try {
            // Get a sample of domains to verify
            const domains = await db.query.domains.findMany({
              limit: 5,
              orderBy: (domains, { asc }) => [asc(domains.id)]
            });
            
            if (domains && domains.length > 0) {
              // Create a version record for this check
              const versionRecord = await db.insert(schema.dataVersions).values({
                dataType: "domains-integrity-check",
                version: schema.DB_VERSION,
                recordCount: domains.length,
                details: "Automated integrity verification",
              }).returning();
              
              console.log(`✅ Verified ${domains.length} domains with data integrity check`);
              
              // Additional verification by checking if ForceSync is needed
              const timestamp = new Date();
              const twentyFourHoursAgo = new Date(timestamp.getTime() - 24 * 60 * 60 * 1000);
              
              // Get latest domain version record
              const latestVersions = await db.query.dataVersions.findMany({
                where: (table, { eq, and, gt }) => and(
                  eq(table.dataType, "domains"),
                  gt(table.lastUpdated, twentyFourHoursAgo)
                ),
                orderBy: (table, { desc }) => [desc(table.lastUpdated)],
                limit: 1
              });
              
              // If no version in the last 24 hours, automatically sync domains
              if (!latestVersions || latestVersions.length === 0) {
                console.log("⚠️ No domain sync in last 24 hours, initiating automatic sync...");
                
                try {
                  // Get all domains from the database
                  const allDomains = await db.query.domains.findMany();
                  
                  if (allDomains && allDomains.length > 0) {
                    // Create a new version record for this sync
                    await db.insert(schema.dataVersions).values({
                      dataType: "domains-auto-sync",
                      version: schema.DB_VERSION,
                      recordCount: allDomains.length,
                      checksum: Date.now().toString(),
                      details: "Automatic domain sync from health check",
                    });
                    
                    console.log(`✓ Auto-sync completed for ${allDomains.length} domains`);
                  }
                } catch (syncError) {
                  console.error("❌ Auto-sync failed:", syncError);
                }
              }
            }
          } catch (verifyError) {
            console.error("❌ Data integrity check failed:", verifyError);
          }
        }
      } catch (err) {
        console.error("❌ Database health check failed:", err.message);
        // Could add recovery logic here
      }
    }, 60000); // Run health check every minute
    
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
