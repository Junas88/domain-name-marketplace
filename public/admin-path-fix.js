/**
 * Admin Dashboard Path Handler
 * This script runs in all environments and fixes any path issues
 * It detects when we're on an admin page and ensures proper routing
 */

// Wait for DOM to be ready to ensure reliable path detection
document.addEventListener('DOMContentLoaded', function() {
  // Check current path
  const path = window.location.pathname;
  
  // All the potential admin paths that might occur in various environments
  const adminPaths = [
    '/admin/index.html',
    '/dashboard/index.html',
    '/admin/dashboard/index.html',
    '/domainnameguide.com/admin',
    '/domainnameguide.com/dashboard',
    '/domainnameguide.com/admin/dashboard',
    '/admin/dashboard',
    '/dashboard'
  ];
  
  // Check if we're in an admin section based on path segments
  function isAdminPath(path) {
    // Exact matches for common problematic paths
    if (adminPaths.includes(path)) return true;
    
    // Check for segment patterns
    const segments = path.split('/').filter(Boolean);
    return segments.some(segment => 
      segment === 'admin' || 
      segment === 'dashboard' || 
      segment.includes('admin') ||
      segment.includes('dashboard')
    );
  }
  
  // The standardized admin path we want to use
  const TARGET_ADMIN_PATH = '/admin';
  
  // Check if we're on a non-standard admin path that needs fixing
  if (isAdminPath(path) && path !== TARGET_ADMIN_PATH) {
    console.log('Detected non-standard admin path:', path);
    console.log('Redirecting to standard admin path:', TARGET_ADMIN_PATH);
    
    // Prevent redirect loops with session storage flag
    if (!sessionStorage.getItem('adminRedirectAttempted')) {
      sessionStorage.setItem('adminRedirectAttempted', 'true');
      
      // Clear the flag after 5 seconds
      setTimeout(() => {
        sessionStorage.removeItem('adminRedirectAttempted');
      }, 5000);
      
      // Redirect to the standard admin path
      window.location.href = TARGET_ADMIN_PATH;
    }
  } else {
    console.log('Admin path OK, no redirection needed');
  }
});