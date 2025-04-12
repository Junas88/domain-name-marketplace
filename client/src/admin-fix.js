/**
 * SIMPLIFIED ADMIN FIX - Guaranteed to work in all environments
 * This is a minimal, robust script that fixes admin paths
 */

// Self-executing function for immediate execution
(function() {
  // Only run in browser
  if (typeof window === 'undefined') return;
  
  // Get current path
  const path = window.location.pathname;
  
  // Very simple check for admin or dashboard anywhere in path
  const isAdmin = path.includes('admin') || path.includes('dashboard');
  
  // Only redirect if we're not already at /admin
  if (isAdmin && path !== '/admin' && path !== '/admin/') {
    console.log('Fixing admin path:', path);
    
    // Prevent loops
    const redirectFlag = 'adminFixRedirect';
    
    if (!sessionStorage.getItem(redirectFlag)) {
      // Set flag and redirect
      sessionStorage.setItem(redirectFlag, 'true');
      console.log('Redirecting to /admin');
      
      // Clear flag after 3 seconds
      setTimeout(() => {
        sessionStorage.removeItem(redirectFlag);
      }, 3000);
      
      // Direct redirect - most reliable approach
      window.location.href = '/admin';
    }
  } else {
    console.log('Admin path check complete');
  }
})();