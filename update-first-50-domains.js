// Script to update the first 50 domain prices from CSV data
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
    const csvFilePath = path.join(__dirname, 'domains-1744808976458.csv');
    
    // Check if the file exists
    if (!fs.existsSync(csvFilePath)) {
      console.error(`CSV file not found: ${csvFilePath}`);
      process.exit(1);
    }
    
    // Connect to the database
    const pool = await connectToDatabase();
    
    // Read and process CSV
    const domains = [];
    
    await new Promise((resolve) => {
      fs.createReadStream(csvFilePath)
        .pipe(csvParser())
        .on('data', (row) => {
          // Extract domain name and price from CSV
          const domainName = row.Domain?.toLowerCase();
          const price = parseFloat(row['Buy Now Price']?.replace(/,/g, ''));
          
          if (domainName && !isNaN(price) && price > 0) {
            domains.push({ name: domainName, price });
          }
          
          // Only process first 50 domains
          if (domains.length >= 50) {
            resolve();
          }
        })
        .on('end', resolve);
    });
    
    console.log(`Processing first ${domains.length} domains from CSV`);
    
    // Update domains in the database one by one
    const updates = [];
    const errors = [];
    
    for (const domain of domains) {
      try {
        const result = await pool.query(
          'UPDATE domains SET price = $1 WHERE LOWER(name) = $2 RETURNING id, name, price',
          [domain.price, domain.name]
        );
        
        if (result.rows.length > 0) {
          updates.push(result.rows[0]);
          console.log(`Updated domain: ${domain.name} to price: $${domain.price}`);
        } else {
          console.log(`Domain not found in database: ${domain.name}`);
          errors.push(`Domain not found in database: ${domain.name}`);
        }
      } catch (error) {
        console.error(`Error updating ${domain.name}: ${error.message}`);
        errors.push(`Error updating ${domain.name}: ${error.message}`);
      }
    }
    
    // Display results
    console.log(`\nSuccessfully updated ${updates.length} domain prices`);
    if (errors.length > 0) {
      console.log(`\nEncountered ${errors.length} errors`);
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