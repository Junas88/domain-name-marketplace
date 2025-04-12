/**
 * This utility file helps manage path differences between development and production environments
 * for the admin dashboard. In some deployment environments, the admin dashboard might be accessed
 * via /dashboard instead of /admin/dashboard.
 */

/**
 * Determines the appropriate admin dashboard path prefix based on the current URL
 */
export const getAdminPath = (): string => {
  if (typeof window !== 'undefined') {
    // Check if we're in a deployment with a simplified path (e.g., /dashboard)
    if (window.location.pathname.startsWith('/dashboard')) {
      return '/dashboard';
    }
  }
  
  // Default for development environment
  return '/admin/dashboard';
};

/**
 * Checks if the current URL is in the admin dashboard section
 */
export const isAdminPath = (): boolean => {
  if (typeof window !== 'undefined') {
    return window.location.pathname.includes('/dashboard') || 
           window.location.pathname.includes('/admin');
  }
  return false;
};

/**
 * Redirects to the appropriate admin dashboard path
 */
export const redirectToAdmin = (): void => {
  if (typeof window !== 'undefined') {
    window.location.href = getAdminPath();
  }
};