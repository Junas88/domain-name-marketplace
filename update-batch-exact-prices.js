// Script to update domain prices with EXACT values from CSV in batches
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
    
    // Read domain data from CSV
    const domainData = [];
    
    await new Promise((resolve) => {
      fs.createReadStream(csvFilePath)
        .pipe(csvParser())
        .on('data', (row) => {
          const domain = row.Domain?.toLowerCase();
          const price = row['Buy Now Price']?.trim();
          
          if (domain && price) {
            domainData.push({ domain, price: parseInt(price) });
          }
        })
        .on('end', resolve);
    });
    
    console.log(`Read ${domainData.length} domains from CSV file`);
    
    // Update domains in batches
    const BATCH_SIZE = 10;
    const updates = [];
    const errors = [];
    
    // Process in batches
    for (let i = 0; i < Math.min(20, domainData.length); i += BATCH_SIZE) {
      const batch = domainData.slice(i, i + BATCH_SIZE);
      console.log(`\nProcessing batch ${Math.floor(i/BATCH_SIZE) + 1}`);
      
      for (const { domain, price } of batch) {
        try {
          const result = await pool.query(
            'UPDATE domains SET price = $1 WHERE name = $2 RETURNING id, name, price',
            [price, domain]
          );
          
          if (result.rows.length > 0) {
            updates.push(result.rows[0]);
            console.log(`Updated domain: ${result.rows[0].name} to EXACT price: ${result.rows[0].price}`);
          } else {
            console.log(`Domain not found: ${domain}`);
            errors.push(`Domain not found: ${domain}`);
          }
        } catch (error) {
          console.error(`Error updating ${domain}: ${error.message}`);
          errors.push(`Error updating ${domain}: ${error.message}`);
        }
      }
    }
    
    console.log(`\nSuccessfully updated ${updates.length} domains`);
    console.log(`${errors.length} domains had errors`);
    
    await pool.end();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Unhandled error:', error);
    process.exit(1);
  }
};

// Execute the main function
main();