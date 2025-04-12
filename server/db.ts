import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

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
  
  // If we're in deployment and can't construct the URL, this is a critical error
  if (isDeployment) {
    console.error(
      "DEPLOYMENT ERROR: DATABASE_URL or individual database credentials must be set."
    );
    
    // In deployment, we'll throw an error that's more helpful
    throw new Error(
      "DATABASE_URL not configured for deployment. Please add DATABASE_URL to your deployment environment variables."
    );
  } else {
    // In development, use the original error
    throw new Error(
      "DATABASE_URL must be set. Did you forget to provision a database?"
    );
  }
}

// Get the database URL (either directly or constructed)
const databaseUrl = constructDatabaseUrl();

console.log(`Database connection initialized ${isDeployment ? 'in deployment' : 'in development'}`);

export const pool = new Pool({ connectionString: databaseUrl });
export const db = drizzle({ client: pool, schema });