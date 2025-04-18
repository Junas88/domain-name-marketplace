// Supabase-specific database configuration
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

// Configure for WebSocket connections (required for Supabase and Neon)
neonConfig.webSocketConstructor = ws;

// Vercel has specific connection handling requirements
const isProduction = process.env.NODE_ENV === 'production';

// Connection Pool Configuration
const poolConfig = {
  connectionString: process.env.DATABASE_URL,
  max: isProduction ? 10 : 20,  // Fewer connections in production (serverless)
  idleTimeoutMillis: 30000,     // How long a client can be idle before being closed
  ssl: {
    rejectUnauthorized: false   // Required for many PostgreSQL providers
  }
};

// Create a pool factory function to ensure proper connection handling in serverless
export function createPool() {
  return new Pool(poolConfig);
}

// For use in development where a persistent connection is okay
let devPool: Pool | null = null;
let devDb: any = null;

// Get a database connection
export function getDb() {
  if (isProduction) {
    // For production (Vercel), create a new connection for each request
    const pool = createPool();
    return {
      db: drizzle(pool, { schema }),
      pool,
      // Always close the pool when done to prevent connection leaks
      close: async () => {
        try {
          await pool.end();
        } catch (err) {
          console.error("Error closing pool:", err);
        }
      }
    };
  } else {
    // For development, reuse the connection
    if (!devPool) {
      devPool = createPool();
      devDb = drizzle(devPool, { schema });
      
      // Log connection success
      console.log("✅ Development database connection established");
    }
    
    return {
      db: devDb,
      pool: devPool,
      // In development, we don't need to close after each request
      close: async () => {}
    };
  }
}

// Test connection function - useful for verifying configuration
export async function testConnection() {
  const { db, pool, close } = getDb();
  
  try {
    // Simple query to test connection
    const result = await pool.query("SELECT current_timestamp as server_time");
    console.log(`✅ Database connection successful. Server time: ${result.rows[0].server_time}`);
    return true;
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    return false;
  } finally {
    // Important: close the connection in production
    await close();
  }
}