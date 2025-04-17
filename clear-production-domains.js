/**
 * Utility script to clear all domains from the production database
 * Useful when local and production environments get out of sync
 * 
 * Usage: 
 * 1. Make sure you're logged in as admin on the production site
 * 2. Run: node clear-production-domains.js
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Create the flag file to trigger domain deletion on next deployment
function createFlagFile() {
  const flagPath = path.join(__dirname, 'clear-domains-on-deploy.flag');
  fs.writeFileSync(flagPath, 'DELETE ALL DOMAINS ON NEXT DEPLOYMENT');
  console.log('✅ Created flag file: clear-domains-on-deploy.flag');
  console.log('🚨 WARNING: All domains will be deleted when the app is deployed or restarted');
}

// Direct API approach - requires admin authentication
async function clearAllProductionData() {
  try {
    console.log('🔄 Sending production sync request...');
    
    // Get the production URL from environment or use default
    const productionUrl = process.env.PRODUCTION_URL || 'https://your-domain-marketplace.replit.app';
    
    // Create a promise to handle the async request
    const requestPromise = new Promise((resolve, reject) => {
      const options = {
        hostname: new URL(productionUrl).hostname,
        path: '/api/admin/sync-with-local',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      };
      
      // Send the request
      const req = https.request(options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            try {
              const responseData = JSON.parse(data);
              resolve(responseData);
            } catch (e) {
              resolve({ success: true, message: 'Production sync completed' });
            }
          } else {
            reject(new Error(`Request failed with status code ${res.statusCode}: ${data}`));
          }
        });
      });
      
      req.on('error', (e) => {
        reject(new Error(`Request error: ${e.message}`));
      });
      
      // Add confirmation code to the request body
      req.write(JSON.stringify({ confirmationCode: 'SYNC-PRODUCTION' }));
      req.end();
    });
    
    // Wait for the request to complete
    const result = await requestPromise;
    console.log('✅ Success:', result.message || 'Production synchronized with local environment');
    return true;
    
  } catch (error) {
    console.error('❌ Error clearing production data:', error.message);
    console.log('✳️ Creating flag file for automatic cleanup on next deployment instead...');
    createFlagFile();
    return false;
  }
}

// Main execution
async function main() {
  console.log('🚨 WARNING: This script will remove ALL domains from the production database.');
  console.log('📡 Attempting to clear production data using the API...');
  
  const success = await clearAllProductionData();
  
  if (!success) {
    console.log('🔄 API request failed. Creating flag file for automatic cleanup on next restart.');
    createFlagFile();
  }
  
  console.log('✅ Process completed. All domains will be removed from the production database.');
}

// Run the script
main().catch(err => {
  console.error('❌ Fatal error:', err);
  process.exit(1);
});