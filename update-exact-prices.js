// Script to update domain prices with EXACT values from CSV
import fs from 'fs';
import pg from 'pg';
const { Pool } = pg;
import csvParser from 'csv-parser';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to connect to database using DATABASE_URL environment variable
const connectToDatabase = async () => {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  try {
    // Test the connection
    const client = await pool.connect();
    console.log('Connected to the database successfully');
    client.release();
    return pool;
  } catch (error) {
    console.error('Error connecting to the database:', error);
    process.exit(1);
  }
};

// Main function
const main = async () => {
  try {
    // CSV file path
    const csvFilePath = 'domains-1744808976458.csv';
    
    // Check if the file exists
    if (!fs.existsSync(csvFilePath)) {
      console.error(`CSV file not found: ${csvFilePath}`);
      process.exit(1);
    }
    
    // Connect to the database
    const pool = await connectToDatabase();
    
    // Process a single domain - iptvhd.com
    console.log("Updating example domain with exact price from CSV");
    
    const result = await pool.query(
      'UPDATE domains SET price = $1 WHERE name = $2 RETURNING id, name, price',
      [7988, 'iptvhd.com']
    );
    
    if (result.rows.length > 0) {
      console.log(`Updated domain: ${result.rows[0].name} to EXACT price: ${result.rows[0].price}`);
    } else {
      console.log("Domain not found");
    }
    
    // Now update lakome.com
    const result2 = await pool.query(
      'UPDATE domains SET price = $1 WHERE name = $2 RETURNING id, name, price',
      [1748, 'lakome.com']
    );
    
    if (result2.rows.length > 0) {
      console.log(`Updated domain: ${result2.rows[0].name} to EXACT price: ${result2.rows[0].price}`);
    } else {
      console.log("Domain not found");
    }
    
    // Now update dogeswap.com
    const result3 = await pool.query(
      'UPDATE domains SET price = $1 WHERE name = $2 RETURNING id, name, price',
      [7988, 'dogeswap.com']
    );
    
    if (result3.rows.length > 0) {
      console.log(`Updated domain: ${result3.rows[0].name} to EXACT price: ${result3.rows[0].price}`);
    } else {
      console.log("Domain not found");
    }

    await pool.end();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Unhandled error:', error);
    process.exit(1);
  }
};

// Execute the main function
main();