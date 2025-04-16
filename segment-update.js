// Segment-based domain price update script
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

// Function to update domain prices for a specific segment
const updateDomainSegment = async (pool, domains, startIndex, endIndex) => {
  const segment = domains.slice(startIndex, endIndex);
  let updatedCount = 0;
  
  console.log(`Processing segment from ${startIndex} to ${endIndex-1} (${segment.length} domains)`);
  
  // Process each domain in the segment
  for (const domain of segment) {
    try {
      const result = await pool.query(
        'UPDATE domains SET price = $1 WHERE LOWER(name) = $2',
        [domain.price, domain.name]
      );
      
      if (result.rowCount > 0) {
        updatedCount++;
        console.log(`Updated domain: ${domain.name} to price: ${domain.price}`);
      }
    } catch (error) {
      console.error(`Error updating ${domain.name}: ${error.message}`);
    }
  }
  
  return updatedCount;
};

// Main function
const main = async () => {
  try {
    // Parse command line arguments
    const args = process.argv.slice(2);
    const startIndex = parseInt(args[0]) || 0;
    const segmentSize = parseInt(args[1]) || 50;
    const endIndex = startIndex + segmentSize;
    
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
    
    console.log(`Updating domains from index ${startIndex} to ${endIndex-1}...`);
    const updatedCount = await updateDomainSegment(pool, domains, startIndex, endIndex);
    
    console.log(`\nSuccessfully updated ${updatedCount} domain prices in this segment`);
    console.log(`Next segment would start at index ${endIndex}`);
    
    // Calculate segments
    const totalSegments = Math.ceil(domains.length / segmentSize);
    const currentSegment = Math.floor(startIndex / segmentSize) + 1;
    console.log(`\nProgress: Segment ${currentSegment} of ${totalSegments} completed`);
    
    await pool.end();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Unhandled error:', error);
    process.exit(1);
  }
};

// Execute the main function
main();