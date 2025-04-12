// This script will automatically be included on all admin pages 
// and fix any path issues in production deployments.

// This runs immediately when included
(function() {
  // Only execute in the browser environment
  if (typeof window === 'undefined') return;
  
  // Get the current path
  const currentPath = window.location.pathname;
  
  // Check if we're on a problematic path in production
  // dashboard/index.html is a common pattern in some deployments
  if (currentPath.includes('/dashboard/index.html')) {
    console.log('Fixing admin path, redirecting to /admin');
    window.location.href = '/admin';
    return;
  }
  
  // Another problematic pattern in production
  if (currentPath === '/dashboard') {
    console.log('Fixing admin path, redirecting to /admin');
    window.location.href = '/admin';
    return;
  }
  
  // Specific for this domain
  if (currentPath === '/domainnameguide.com/admin/dashboard') {
    console.log('Fixing admin path with domain prefix');
    window.location.href = '/admin';
    return;
  }
  
  console.log('Admin paths OK, no redirect needed');
})();