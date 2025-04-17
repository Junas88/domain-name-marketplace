// Pre-deployment setup script
require('dotenv').config();
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting deployment preparation...');

// Create a flag file for production to detect and clear domains on first run
const flagFilePath = path.join(__dirname, 'clear-domains-on-deploy.flag');
fs.writeFileSync(flagFilePath, new Date().toISOString());
console.log('✅ Created deployment flag file');

// Modify server startup to detect production deployment
const serverFilePath = path.join(__dirname, 'server', 'index.ts');
let serverContent = fs.readFileSync(serverFilePath, 'utf8');

// Add production cleanup detection if not already there
if (!serverContent.includes('clearDomainsOnFirstProductionRun')) {
  console.log('🔧 Adding production cleanup code to server startup...');
  
  // Location to insert our code - after imports but before app configuration
  const insertAfter = 'import { setupAuth } from "./auth";\n';
  
  const deploymentCode = `
// Detect if this is a fresh deployment that needs domain cleanup
import fs from 'fs';
import path from 'path';

async function clearDomainsOnFirstProductionRun() {
  const flagPath = path.join(__dirname, '..', 'clear-domains-on-deploy.flag');
  
  // Only run in production and if flag file exists
  if (process.env.NODE_ENV === 'production' && fs.existsSync(flagPath)) {
    console.log('🚨 FIRST PRODUCTION RUN AFTER DEPLOYMENT DETECTED');
    console.log('🧹 Cleaning up production domains to match development');
    
    try {
      // Import only in production to avoid dependency issues in development
      const { Pool } = await import('@neondatabase/serverless');
      const pool = new Pool({ connectionString: process.env.DATABASE_URL });
      
      // Clear related tables first
      console.log('Clearing price_change_logs...');
      await pool.query('DELETE FROM price_change_logs');
      
      console.log('Clearing offers...');
      await pool.query('DELETE FROM offers');
      
      // Try to clear other potential related tables
      try { await pool.query('DELETE FROM inquiries'); } catch (e) {}
      try { await pool.query('DELETE FROM communications'); } catch (e) {}
      
      // Now clear all domains
      console.log('Clearing all domains...');
      const { rowCount } = await pool.query('DELETE FROM domains');
      console.log(\`✅ Deleted \${rowCount} domains from production database\`);
      
      // Delete the flag file so this doesn't run again
      fs.unlinkSync(flagPath);
      console.log('🗑️ Removed deployment flag file');
      
      await pool.end();
    } catch (error) {
      console.error('❌ Error clearing production domains:', error);
    }
  }
}

// Run the cleanup function on startup
clearDomainsOnFirstProductionRun().catch(console.error);
`;

  // Insert the deployment code after the imports
  serverContent = serverContent.replace(
    insertAfter,
    insertAfter + deploymentCode
  );
  
  // Write the modified file
  fs.writeFileSync(serverFilePath, serverContent);
  console.log('✅ Added production cleanup logic to server');
} else {
  console.log('ℹ️ Production cleanup code already exists in server');
}

console.log('🎉 Deployment preparation complete! Ready to deploy!');
console.log('👉 After deployment, your production site will automatically clear all domains to match your local environment');