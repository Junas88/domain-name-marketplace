/**
 * This script is designed to be run after updating domain prices to force
 * the redeployment site to refresh its cache. It makes a direct API call to
 * set a special flag in the database that will trigger any remaining caches to
 * clear.
 */

const fetch = require('node-fetch');
require('dotenv').config();

// URL of the deployed site, should be adjusted to your actual deployment URL
const DEPLOYED_SITE_URL = process.env.DEPLOYED_SITE_URL || 'https://domain-marketplace-replit.vercel.app';

async function login() {
  console.log('Logging in to admin account...');
  
  try {
    const loginResponse = await fetch(`${DEPLOYED_SITE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'admin',
        password: 'DomainGuide#2025',
      }),
      credentials: 'include',
    });

    if (!loginResponse.ok) {
      throw new Error(`Login failed: ${loginResponse.statusText}`);
    }

    const cookies = loginResponse.headers.get('set-cookie');
    console.log('Login successful!');
    return cookies;
  } catch (error) {
    console.error('Login error:', error);
    process.exit(1);
  }
}

async function forceCacheRefresh(cookies) {
  console.log('Forcing cache refresh...');
  
  try {
    // The timestamp is used to ensure this is a unique request each time
    const timestamp = Date.now();
    
    // Call a special endpoint that will force all caches to refresh
    const response = await fetch(`${DEPLOYED_SITE_URL}/api/domains/fresh?t=${timestamp}`, {
      method: 'GET',
      headers: {
        'Cookie': cookies,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });

    if (!response.ok) {
      throw new Error(`Cache refresh failed: ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`Successfully refreshed cache for ${data.domains.length} domains at ${new Date().toISOString()}`);
    
    // Display a sample of domain prices for verification
    console.log('\nSample of domain prices from the server:');
    data.domains.slice(0, 5).forEach(domain => {
      console.log(`${domain.name}: $${domain.price.toLocaleString()}`);
    });
    
    console.log('\n✅ Cache refresh completed successfully! The website should now show the updated prices.');
    console.log('If prices still don\'t appear, try viewing the site in an incognito window or clearing your browser cache.');
    
  } catch (error) {
    console.error('Error forcing cache refresh:', error);
    process.exit(1);
  }
}

async function main() {
  try {
    const cookies = await login();
    await forceCacheRefresh(cookies);
  } catch (error) {
    console.error('Unexpected error:', error);
    process.exit(1);
  }
}

// Run the script
main();