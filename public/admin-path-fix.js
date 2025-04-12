/**
 * Admin Dashboard Path Handler
 * This script runs in all environments and fixes any path issues
 * It detects when we're on an admin page and ensures proper routing
 */

// Wait for DOM to be ready to ensure reliable path detection
document.addEventListener('DOMContentLoaded', function() {
  // Check current path
  const path = window.location.pathname;
  
  // Detect production vs development environment
  const isProduction = !window.location.hostname.includes('localhost') && 
                      !window.location.hostname.includes('replit');
  
  // All the potential admin paths that might occur in various environments
  const adminPaths = [
    '/admin/index.html',
    '/dashboard/index.html',
    '/admin/dashboard/index.html',
    '/domainnameguide.com/admin',
    '/domainnameguide.com/dashboard',
    '/domainnameguide.com/admin/dashboard',
    '/admin/dashboard',
    '/dashboard',
    '/admin/domains',
    '/admin/users',
    '/admin/settings',
    '/admin/offers',
    '/admin/website-editor',
    '/admin/consultations',
    '/admin/analytics'
  ];
  
  // In production, add additional paths that might be problematic
  if (isProduction) {
    [
      '/replit/admin',
      '/vercel/admin',
      '/netlify/admin',
      '/domainguide/admin',
      '/domainguide/dashboard'
    ].forEach(p => adminPaths.push(p));
  }
  
  // Check if we're in an admin section based on path segments
  function isAdminPath(path) {
    // Exact matches for common problematic paths
    if (adminPaths.includes(path)) return true;
    
    // Special case for production domain prefixes (common in some deployments)
    if (isProduction) {
      const domainPrefixMatch = path.match(/^\/[^\/]+\/(admin|dashboard)/);
      if (domainPrefixMatch) return true;
    }
    
    // Check for admin paths with additional segments
    if (path.startsWith('/admin/') && path !== '/admin/') return true;
    if (path.startsWith('/dashboard/')) return true;
    
    // More detailed segment analysis
    const segments = path.split('/').filter(Boolean);
    return segments.some(segment => 
      segment === 'admin' || 
      segment === 'dashboard' || 
      (segment.includes('admin') && segment.length < 10) ||
      (segment.includes('dashboard') && segment.length < 15)
    );
  }
  
  // The standardized admin path we want to use
  const TARGET_ADMIN_PATH = '/admin';
  
  // Check if we're on a non-standard admin path that needs fixing
  if (isAdminPath(path) && path !== TARGET_ADMIN_PATH) {
    console.log('Detected non-standard admin path:', path);
    console.log('Environment:', isProduction ? 'Production' : 'Development');
    console.log('Redirecting to standard admin path:', TARGET_ADMIN_PATH);
    
    // Prevent redirect loops with session storage flag
    const REDIRECT_FLAG = 'adminRedirectAttempted';
    
    if (!sessionStorage.getItem(REDIRECT_FLAG)) {
      sessionStorage.setItem(REDIRECT_FLAG, 'true');
      
      // Clear the flag after 5 seconds
      setTimeout(() => {
        sessionStorage.removeItem(REDIRECT_FLAG);
      }, 5000);
      
      // Additional history handling for clean navigation
      if (window.history && window.history.replaceState) {
        try {
          window.history.replaceState(null, document.title, TARGET_ADMIN_PATH);
          window.location.reload();
          return;
        } catch (e) {
          console.log('History API failed, using direct navigation');
        }
      }
      
      // Fallback: direct navigation
      window.location.href = TARGET_ADMIN_PATH;
    } else {
      console.log('Redirect already attempted, preventing loop');
    }
  } else {
    console.log('Admin paths OK, no redirect needed');
  }
});