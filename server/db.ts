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
    return process.env.DATABASE_URL;
  }
  
  // Try to construct from individual parts
  const user = process.env.PGUSER;
  const password = process.env.PGPASSWORD;
  const host = process.env.PGHOST;
  const port = process.env.PGPORT;
  const database = process.env.PGDATABASE;
  
  if (user && password && host && port && database) {
    return `postgresql://${user}:${password}@${host}:${port}/${database}`;
  }
  
  // If neither approach works, log a warning but don't crash the application
  console.warn("No database credentials found. Using in-memory storage.");
  return null;
}

// Get the database URL (either directly or constructed)
const databaseUrl = constructDatabaseUrl();

let pool;
let db;

// Only initialize database if credentials are available
if (databaseUrl) {
  try {
    console.log(`Database connection initialized ${isDeployment ? 'in deployment' : 'in development'}`);
    pool = new Pool({ connectionString: databaseUrl });
    db = drizzle({ client: pool, schema });
  } catch (error) {
    console.error("Failed to initialize database connection:", error);
    pool = null;
    db = null;
  }
} else {
  pool = null;
  db = null;
}

export { pool, db };