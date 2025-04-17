
/**
 * This file is auto-generated to force Replit to rebuild the application
 * and clear caches. It should not be edited manually.
 * 
 * Generated: 2025-04-17T19:25:05.363Z
 */

// Unique timestamp: 1744917905360
export const CACHE_BUSTER = '1744917905360';

// Add this value as a URL parameter to force cache invalidation
export function addCacheBuster(url) {
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}_cachebust=${CACHE_BUSTER}`;
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
