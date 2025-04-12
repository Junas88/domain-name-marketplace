/**
 * Path detection utilities that work reliably in production environments
 */

/**
 * Detects if the current path is an admin-related path, regardless of environment
 * Works in development, preview, and production
 */
export function isAdminPath(): boolean {
  if (typeof window === 'undefined') return false;
  
  const path = window.location.pathname;
  
  // Check if path directly contains admin or dashboard segments
  if (path === '/admin' || path === '/dashboard') return true;
  
  // Check for path patterns that include admin or dashboard
  if (path.includes('/admin/') || path.includes('/dashboard/')) return true;
  
  // Check for domain name prefixes that might appear in production
  if (path.match(/\/[^/]+\/(admin|dashboard)/)) return true;
  
  return false;
}

/**
 * Returns the standard admin path to use for redirects
 */
export function getStandardAdminPath(): string {
  return '/admin';
}

/**
 * Redirects to the login page in a way that works in all environments
 */
export function redirectToLogin() {
  // Prevent redirect loops
  const isAlreadyRedirecting = sessionStorage.getItem('loginRedirecting');
  
  if (!isAlreadyRedirecting) {
    sessionStorage.setItem('loginRedirecting', 'true');
    
    // Clear the flag after 5 seconds
    setTimeout(() => {
      sessionStorage.removeItem('loginRedirecting');
    }, 5000);
    
    // Force a hard refresh to ensure proper path handling
    window.location.href = '/login';
  }
}

/**
 * Safely navigates to any path in a way that works in all environments
 */
export function safeNavigate(path: string) {
  window.location.href = path;
}