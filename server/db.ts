
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

// Configure Neon database to use websockets
neonConfig.webSocketConstructor = ws;

// Helper function to check if we're in a deployment environment
const isDeployment = process.env.REPL_DEPLOYMENT === 'true';

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

let pool;
let db;

try {
  const databaseUrl = constructDatabaseUrl();
  
  if (databaseUrl) {
    console.log(`Initializing database connection ${isDeployment ? 'in deployment' : 'in development'}`);
    pool = new Pool({ 
      connectionString: databaseUrl,
      ssl: isDeployment ? { rejectUnauthorized: false } : false,
      connectionTimeoutMillis: 5000
    });
    
    // Test the connection
    await pool.query('SELECT 1');
    db = drizzle(pool, { schema });
    console.log('✅ Database connection established successfully');
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

export { pool, db };
