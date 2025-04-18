/**
 * This script is intended to help clear deployment caches and ensure the latest data
 * is shown in both development and production environments.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Function to create a unique cache buster
function generateCacheBuster() {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000000);
  return `${timestamp}${random}`;
}

// Function to update cache buster file
function updateCacheBusterFile() {
  const cacheBuster = generateCacheBuster();
  const filePath = path.join(process.cwd(), `.cache-buster-${cacheBuster}`);
  
  // Remove any existing cache buster files
  const files = fs.readdirSync(process.cwd());
  files.forEach(file => {
    if (file.startsWith('.cache-buster-')) {
      fs.unlinkSync(path.join(process.cwd(), file));
      console.log(`✓ Removed old cache buster file: ${file}`);
    }
  });
  
  // Create new cache buster file
  fs.writeFileSync(filePath, cacheBuster.toString());
  console.log(`✓ Created new cache buster file: ${path.basename(filePath)}`);
  
  return cacheBuster;
}

// Function to update client cache utility
function updateClientCacheUtility(cacheBuster) {
  const filePath = path.join(process.cwd(), 'client', 'src', 'cache-buster.ts');
  
  // Ensure the file exists
  if (!fs.existsSync(filePath)) {
    console.log('⚠️ Client cache utility file not found. Skipping update.');
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Update the CACHE_BUSTER_VALUE
  content = content.replace(
    /export const CACHE_BUSTER_VALUE = .*;/,
    `export const CACHE_BUSTER_VALUE = '${cacheBuster}';`
  );
  
  fs.writeFileSync(filePath, content);
  console.log(`✓ Updated client cache utility with new value: ${cacheBuster}`);
}

// Main function
async function main() {
  console.log('🔄 Starting deployment cache clearing process...');
  
  // Update cache buster
  const cacheBuster = updateCacheBusterFile();
  updateClientCacheUtility(cacheBuster);
  
  // Add HTTP cache headers to .vercel/output/config.json if it exists
  const vercelConfigPath = path.join(process.cwd(), '.vercel', 'output', 'config.json');
  if (fs.existsSync(vercelConfigPath)) {
    try {
      const configJson = JSON.parse(fs.readFileSync(vercelConfigPath, 'utf8'));
      
      // Ensure headers exist
      if (!configJson.headers) {
        configJson.headers = [];
      }
      
      // Add/update cache control headers
      const rootHeaderConfig = configJson.headers.find(h => h.source === '/(.*)?');
      if (rootHeaderConfig) {
        // Update existing header config
        const cacheHeader = rootHeaderConfig.headers.find(h => h.key === 'Cache-Control');
        if (cacheHeader) {
          cacheHeader.value = 'public, max-age=0, must-revalidate';
        } else {
          rootHeaderConfig.headers.push({
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate'
          });
        }
      } else {
        // Add new header config
        configJson.headers.push({
          source: '/(.*)?',
          headers: [
            {
              key: 'Cache-Control',
              value: 'public, max-age=0, must-revalidate'
            }
          ]
        });
      }
      
      fs.writeFileSync(vercelConfigPath, JSON.stringify(configJson, null, 2));
      console.log(`✓ Updated Vercel config with cache control headers`);
    } catch (error) {
      console.error(`⚠️ Error updating Vercel config: ${error.message}`);
    }
  } else {
    console.log('ℹ️ Vercel config not found. No cache headers were updated.');
  }
  
  console.log('✅ Deployment cache clearing completed successfully!');
  console.log(`💡 New cache buster value: ${cacheBuster}`);
  console.log('');
  console.log('After deployment, verify that:');
  console.log('1. The API returns fresh data (check timestamps or version numbers)');
  console.log('2. The frontend shows the latest content and styles');
  console.log('3. No stale cache warnings appear in the browser console');
}

// Run the script
main().catch(error => {
  console.error('❌ Error clearing deployment cache:', error);
  process.exit(1);
});