/**
 * This script is intended to help clear deployment caches and ensure the latest data
 * is shown in both development and production environments.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

// Get the directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function generateCacheBuster() {
  return Date.now().toString();
}

function updateCacheBusterFile() {
  const cacheBuster = generateCacheBuster();
  const cacheBusterFileName = `.cache-buster-${cacheBuster}`;
  const cacheBusterPath = path.join(__dirname, cacheBusterFileName);
  
  // Find and remove old cache buster files
  const files = fs.readdirSync(__dirname);
  for (const file of files) {
    if (file.startsWith('.cache-buster-')) {
      const fullPath = path.join(__dirname, file);
      console.log(`Removing old cache buster: ${file}`);
      fs.unlinkSync(fullPath);
    }
  }
  
  // Create new cache buster file
  fs.writeFileSync(cacheBusterPath, cacheBuster);
  console.log(`Created new cache buster: ${cacheBusterFileName}`);
  
  return cacheBuster;
}

function updateClientCacheUtility(cacheBuster) {
  const appTsxPath = path.join(__dirname, 'client', 'src', 'App.tsx');
  
  if (fs.existsSync(appTsxPath)) {
    console.log('Updating App.tsx with cache busting code...');
    
    let appContent = fs.readFileSync(appTsxPath, 'utf8');
    
    // Check if we already have cache busting
    if (!appContent.includes('Cache invalidation')) {
      // Add cache busting near the beginning of the App component
      const cacheCode = `
  // Cache busting logic
  React.useEffect(() => {
    console.log("[App] Initialized with cache buster: ${cacheBuster}");
    
    // Clear any cached data
    const clearCaches = () => {
      // Attempt to clear any API caches
      if (window.caches) {
        try {
          window.caches.keys().then(keyList => {
            keyList.forEach(key => {
              console.log("[App] Clearing cache:", key);
              window.caches.delete(key);
            });
          });
        } catch (e) {
          console.error("[App] Error clearing caches:", e);
        }
      }
      
      console.log("[App] Cache invalidation complete");
    };
    
    clearCaches();
  }, []);`;
      
      // Find a suitable insertion point (after imports and before the component logic)
      const functionStartRegex = /function\s+App\s*\(\s*\)\s*{\s*$/m;
      const match = appContent.match(functionStartRegex);
      
      if (match && match.index !== undefined) {
        const insertPos = match.index + match[0].length;
        appContent = appContent.slice(0, insertPos) + cacheCode + appContent.slice(insertPos);
        fs.writeFileSync(appTsxPath, appContent);
        console.log('Added cache busting code to App.tsx');
      } else {
        console.log('Could not find a suitable place to add cache busting code');
      }
    } else {
      console.log('App.tsx already has cache busting code');
    }
  } else {
    console.log('App.tsx not found, skipping client cache updates');
  }
}

async function main() {
  console.log('🧹 Clearing Deployment Caches');
  console.log('===============================');
  
  // 1. Create/update cache buster file
  const cacheBuster = updateCacheBusterFile();
  
  // 2. Update client-side cache utility
  updateClientCacheUtility(cacheBuster);
  
  // 3. Display summary
  console.log('\n✅ Deployment Cache Cleared');
  console.log('===============================');
  console.log('Cache buster generated:', cacheBuster);
  console.log('Next steps:');
  console.log('1. Commit these changes to your repository');
  console.log('2. Redeploy your application to Vercel');
  console.log('3. In the Vercel dashboard, go to your project settings and clear the build cache');
}

main().catch(error => {
  console.error('Error clearing caches:', error);
  process.exit(1);
});