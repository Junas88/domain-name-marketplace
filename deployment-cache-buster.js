import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import * as dotenv from 'dotenv';

dotenv.config();

/**
 * This script specifically tackles Replit deployment caching issues.
 * It creates cache-busting files that will force a rebuild of specific resources.
 */

// Generate a unique timestamp
const timestamp = Date.now();

function createCacheBustFile() {
  // Create a cache-busting file in the client directory
  const clientDir = path.resolve('./client');
  const cacheBusterPath = path.join(clientDir, 'src', 'cache-buster.ts');
  
  // Generate unique, timestamped content
  const content = `
/**
 * This file is auto-generated to force Replit to rebuild the application
 * and clear caches. It should not be edited manually.
 * 
 * Generated: ${new Date().toISOString()}
 */

// Unique timestamp: ${timestamp}
export const CACHE_BUSTER = '${timestamp}';

// Add this value as a URL parameter to force cache invalidation
export function addCacheBuster(url) {
  const separator = url.includes('?') ? '&' : '?';
  return \`\${url}\${separator}_cachebust=\${CACHE_BUSTER}\`;
}

// Add cache-busting headers to any fetch request
export function getCacheBustHeaders() {
  return {
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
    'Surrogate-Control': 'no-store',
    'X-Cache-Buster': CACHE_BUSTER.toString()
  };
}
`;
  
  fs.writeFileSync(cacheBusterPath, content);
  console.log(`✅ Created cache buster file at ${cacheBusterPath}`);
  
  // Update the main index file to import the cache buster
  try {
    const indexPath = path.join(clientDir, 'src', 'index.tsx');
    
    if (fs.existsSync(indexPath)) {
      const indexContent = fs.readFileSync(indexPath, 'utf8');
      
      // Only add the import if it doesn't exist
      if (!indexContent.includes('cache-buster')) {
        const updatedContent = `import { CACHE_BUSTER } from './cache-buster';\n` + indexContent + 
        `\n// Initialize cache busting\nconsole.log('[Cache-Buster] Initialized with timestamp:', CACHE_BUSTER);\n`;
        
        fs.writeFileSync(indexPath, updatedContent);
        console.log(`✅ Updated ${indexPath} to include cache busting`);
      } else {
        console.log(`ℹ️ Cache buster import already exists in ${indexPath}`);
      }
    } else {
      console.log(`⚠️ Could not find ${indexPath}`);
    }
  } catch (error) {
    console.error('❌ Error updating index file:', error);
  }

  // Also create an empty file at the project root level
  const rootCacheBusterPath = path.resolve(`./.cache-buster-${timestamp}`);
  fs.writeFileSync(rootCacheBusterPath, `Cache buster timestamp: ${timestamp}`);
  console.log(`✅ Created root cache buster file at ${rootCacheBusterPath}`);
}

function updateMetaTags() {
  console.log('Updating meta tags for cache control...');
  
  // Look for any HTML files that might serve as entry points
  const clientDir = path.resolve('./client');
  const publicDir = path.resolve('./public');
  
  try {
    // Add meta tags to any HTML files in the public directory
    if (fs.existsSync(publicDir)) {
      const files = fs.readdirSync(publicDir);
      
      for (const file of files) {
        if (file.endsWith('.html')) {
          const filePath = path.join(publicDir, file);
          let htmlContent = fs.readFileSync(filePath, 'utf8');
          
          // Add cache control meta tags if they don't exist
          if (!htmlContent.includes('Cache-Control')) {
            console.log(`Adding cache control meta tags to ${filePath}`);
            
            // Insert meta tags after the head opening tag
            htmlContent = htmlContent.replace(
              '<head>',
              `<head>
    <!-- Force no caching -->
    <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
    <meta http-equiv="Pragma" content="no-cache">
    <meta http-equiv="Expires" content="0">
    <meta name="cache-buster" content="${timestamp}">`
            );
            
            fs.writeFileSync(filePath, htmlContent);
            console.log(`✅ Updated ${filePath} with cache control meta tags`);
          } else {
            console.log(`ℹ️ Cache control meta tags already exist in ${filePath}`);
          }
        }
      }
    }
  } catch (error) {
    console.error('❌ Error updating HTML files:', error);
  }
}

function clearCaches() {
  console.log('Attempting to clear Replit caches...');
  
  try {
    // Clear any development caches
    const cacheDirs = [
      './.cache',
      './node_modules/.cache',
      './client/.cache',
      './client/node_modules/.cache',
    ];
    
    for (const dir of cacheDirs) {
      if (fs.existsSync(dir)) {
        console.log(`Clearing cache directory: ${dir}`);
        fs.rmSync(dir, { recursive: true, force: true });
      }
    }
    
    console.log('✅ Cleared local cache directories');
  } catch (error) {
    console.error('❌ Error clearing cache directories:', error);
  }
}

async function main() {
  console.log('🧹 Starting deployment cache busting operations...');
  
  // Step 1: Create cache buster file
  createCacheBustFile();
  
  // Step 2: Update HTML files with cache control meta tags
  updateMetaTags();
  
  // Step 3: Clear local caches
  clearCaches();
  
  console.log('\n🎉 Cache busting operations complete!');
  console.log('\nTo completely clear Replit deployment caches:');
  console.log('1. Commit all changes, including the generated cache-buster files');
  console.log('2. Restart your Replit workspace completely');
  console.log('3. Force refresh your browser with Ctrl+F5');
  console.log('4. Try accessing the site in an incognito/private window');
  console.log('5. If using a custom domain, DNS caching might be an issue');
}

main().catch(console.error);