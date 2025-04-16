// Script to update domain prices from CSV data
const fs = require('fs');
const { Pool } = require('pg');
const csv = require('csv-parser');
const path = require('path');

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

// Process CSV file and update prices
const updateDomainPrices = async (pool, csvFilePath) => {
  console.log(`Reading domain data from: ${csvFilePath}`);
  
  const domains = [];
  const updates = [];
  const errors = [];

  return new Promise((resolve, reject) => {
    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on('data', (row) => {
        // Extract domain name and price from CSV
        const domainName = row.Domain?.toLowerCase();
        const price = parseFloat(row['Buy Now Price']?.replace(/,/g, ''));
        
        if (domainName && !isNaN(price) && price > 0) {
          domains.push({ name: domainName, price });
        } else {
          errors.push(`Invalid data for domain ${domainName}: price=${row['Buy Now Price']}`);
        }
      })
      .on('end', async () => {
        console.log(`Processed ${domains.length} domains from CSV`);
        
        for (const domain of domains) {
          try {
            const result = await pool.query(
              'UPDATE domains SET price = $1 WHERE LOWER(name) = $2 RETURNING id, name, price',
              [domain.price, domain.name]
            );
            
            if (result.rows.length > 0) {
              updates.push(result.rows[0]);
            } else {
              errors.push(`Domain not found in database: ${domain.name}`);
            }
          } catch (error) {
            errors.push(`Error updating ${domain.name}: ${error.message}`);
          }
        }
        
        resolve({ updates, errors });
      })
      .on('error', (error) => {
        console.error('Error reading CSV file:', error);
        reject(error);
      });
  });
};

// Main function
const main = async () => {
  try {
    // Get the CSV file path from command line arguments or use default
    const csvFilePath = process.argv[2] || path.join(__dirname, 'attached_assets', 'domains-1744808976458.csv');
    
    // Check if the file exists
    if (!fs.existsSync(csvFilePath)) {
      console.error(`CSV file not found: ${csvFilePath}`);
      process.exit(1);
    }
    
    // Connect to the database
    const pool = await connectToDatabase();
    
    // Process the CSV file and update domains
    const { updates, errors } = await updateDomainPrices(pool, csvFilePath);
    
    // Display results
    console.log(`\nSuccessfully updated ${updates.length} domain prices:`);
    updates.forEach(domain => {
      console.log(`- ${domain.name}: $${domain.price}`);
    });
    
    if (errors.length > 0) {
      console.log(`\nEncountered ${errors.length} errors:`);
      errors.forEach(error => {
        console.log(`- ${error}`);
      });
    }
    
    await pool.end();
  } catch (error) {
    console.error('Unhandled error:', error);
    process.exit(1);
  }
};

// Execute the main function
main();