/**
 * Simple utility to manage admin path handling.
 * This approach avoids complex routing in production.
 */

/**
 * Returns the correct admin path based on environment
 */
export function getAdminPath(): string {
  // For all environments, just use the simplest path
  return '/admin';
}

/**
 * Checks if the current path is an admin path
 */
export function isAdminPath(): boolean {
  if (typeof window === 'undefined') return false;
  
  const path = window.location.pathname;
  return (
    path === '/admin' || 
    path.startsWith('/admin/') || 
    path === '/dashboard' ||
    path.startsWith('/dashboard/')
  );
}