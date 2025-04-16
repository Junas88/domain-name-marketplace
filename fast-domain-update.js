// Fast batch script to update ALL domain prices from CSV using bulk updates
import fs from 'fs';
import pg from 'pg';
const { Pool } = pg;
import csvParser from 'csv-parser';

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

// Function to read the CSV file
const readCsvFile = async (filePath) => {
  const domains = [];
  
  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csvParser())
      .on('data', (row) => {
        if (row.Domain && row['Buy Now Price']) {
          domains.push({
            name: row.Domain.toLowerCase().trim(),
            price: parseInt(row['Buy Now Price'])
          });
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

// Function to update domain prices in very small batches
const updateDomainPricesInChunks = async (pool, domains) => {
  const CHUNK_SIZE = 5; // Very small size to avoid timeouts
  const totalBatches = Math.ceil(domains.length / CHUNK_SIZE);
  let updatedCount = 0;
  
  for (let i = 0; i < domains.length; i += CHUNK_SIZE) {
    const chunk = domains.slice(i, i + CHUNK_SIZE);
    const batchNumber = Math.floor(i / CHUNK_SIZE) + 1;
    
    console.log(`Processing batch ${batchNumber}/${totalBatches}`);
    
    // Update each domain in the chunk
    for (const domain of chunk) {
      try {
        const result = await pool.query(
          'UPDATE domains SET price = $1 WHERE LOWER(name) = $2',
          [domain.price, domain.name]
        );
        
        if (result.rowCount > 0) {
          updatedCount++;
          if (updatedCount % 10 === 0) {
            console.log(`Updated ${updatedCount} domains so far`);
          }
        }
      } catch (error) {
        console.error(`Error updating ${domain.name}: ${error.message}`);
      }
    }
  }
  
  return updatedCount;
};

// Main function
const main = async () => {
  try {
    // CSV file path 
    const csvFilePath = 'domains-1744808976458.csv';
    
    // Check if file exists
    if (!fs.existsSync(csvFilePath)) {
      console.error(`CSV file not found: ${csvFilePath}`);
      process.exit(1);
    }
    
    // Connect to database
    const pool = await connectToDatabase();
    
    console.log('Reading domains from CSV...');
    const domains = await readCsvFile(csvFilePath);
    console.log(`Found ${domains.length} domains in CSV`);
    
    console.log('Updating domain prices...');
    const updatedCount = await updateDomainPricesInChunks(pool, domains);
    
    console.log(`\nSuccessfully updated ${updatedCount} domain prices`);
    
    await pool.end();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Unhandled error:', error);
    process.exit(1);
  }
};

// Execute the main function
main();