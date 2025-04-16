// Script to update ALL domain prices from CSV
import fs from 'fs';
import pg from 'pg';
const { Pool } = pg;
import csvParser from 'csv-parser';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to connect to database
const connectToDatabase = async () => {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  try {
    const client = await pool.connect();
    console.log('Connected to the database successfully');
    client.release();
    return pool;
  } catch (error) {
    console.error('Error connecting to the database:', error);
    process.exit(1);
  }
};

// Function to get all domains from the database
const getAllDomains = async (pool) => {
  try {
    const result = await pool.query('SELECT id, name, price FROM domains');
    return result.rows;
  } catch (error) {
    console.error('Error fetching domains:', error);
    return [];
  }
};

// Function to read the CSV file
const readCsvFile = async (filePath) => {
  const domains = [];
  
  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csvParser())
      .on('data', (row) => {
        const domain = row.Domain?.toLowerCase()?.trim();
        const price = parseInt(row['Buy Now Price']);
        
        if (domain && !isNaN(price) && price > 0) {
          domains.push({ name: domain, price });
        }
      })
      .on('end', () => {
        resolve(domains);
      })
      .on('error', (error) => {
        reject(error);
      });
  });
};

// Function to update domain prices
const updateDomainPrices = async (pool, dbDomains, csvDomains) => {
  // Create a lookup map for faster domain matching
  const dbDomainMap = new Map();
  dbDomains.forEach(domain => {
    dbDomainMap.set(domain.name.toLowerCase(), domain);
  });
  
  console.log(`DB has ${dbDomainMap.size} domains`);
  console.log(`CSV has ${csvDomains.length} domains`);
  
  const updates = [];
  const notFound = [];
  let successCount = 0;
  
  // Process in small batches to avoid timeouts
  const BATCH_SIZE = 20;
  for (let i = 0; i < csvDomains.length; i += BATCH_SIZE) {
    const batch = csvDomains.slice(i, i + BATCH_SIZE);
    console.log(`\nProcessing batch ${Math.floor(i/BATCH_SIZE) + 1} of ${Math.ceil(csvDomains.length/BATCH_SIZE)}`);
    
    for (const csvDomain of batch) {
      // Try to find domain by exact name match first
      const dbDomain = dbDomainMap.get(csvDomain.name);
      
      if (dbDomain) {
        if (dbDomain.price !== csvDomain.price) {
          try {
            const result = await pool.query(
              'UPDATE domains SET price = $1 WHERE id = $2 RETURNING id, name, price',
              [csvDomain.price, dbDomain.id]
            );
            
            if (result.rows.length > 0) {
              updates.push({
                id: result.rows[0].id,
                name: result.rows[0].name,
                oldPrice: dbDomain.price,
                newPrice: result.rows[0].price
              });
              successCount++;
              
              if (successCount % 5 === 0) {
                console.log(`Updated ${successCount} domains so far...`);
              }
            }
          } catch (error) {
            console.error(`Error updating ${csvDomain.name}: ${error.message}`);
          }
        }
      } else {
        notFound.push(csvDomain.name);
      }
    }
  }
  
  return { updates, notFound };
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
    
    // Get all domains from the database
    console.log('Fetching all domains from the database...');
    const dbDomains = await getAllDomains(pool);
    
    // Read domain data from CSV
    console.log('Reading domain data from CSV...');
    const csvDomains = await readCsvFile(csvFilePath);
    
    // Update domain prices
    console.log('Updating domain prices...');
    const { updates, notFound } = await updateDomainPrices(pool, dbDomains, csvDomains);
    
    // Print results
    console.log('\n===== RESULTS =====');
    console.log(`Successfully updated ${updates.length} domains`);
    
    if (updates.length > 0) {
      console.log('\nSample of updated domains:');
      updates.slice(0, 10).forEach(update => {
        console.log(`- ${update.name}: $${update.oldPrice} -> $${update.newPrice}`);
      });
    }
    
    if (notFound.length > 0) {
      console.log(`\n${notFound.length} domains from CSV not found in database`);
      console.log('\nSample of domains not found:');
      notFound.slice(0, 10).forEach(name => {
        console.log(`- ${name}`);
      });
    }
    
    console.log('\nDomain price update completed');
    
    await pool.end();
  } catch (error) {
    console.error('Unhandled error:', error);
    process.exit(1);
  }
};

// Execute the main function
main();