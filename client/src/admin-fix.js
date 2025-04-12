/**
 * IMPROVED ADMIN FIX - Works in all environments with fallback support
 * This is a minimal, robust script that fixes admin paths
 */

// Self-executing function for immediate execution
(function() {
  // Only run in browser
  if (typeof window === 'undefined') return;
  
  // CONFIGURATION
  const PRIMARY_PATH = '/admin';               // Main admin path
  const FALLBACK_PATH = '/admin-fallback';     // Fallback admin path
  const MAX_FAILURES = 2;                      // Max failures before using fallback
  
  // Simple persistent state management
  function getFailureCount() {
    return parseInt(localStorage.getItem('adminFailures') || '0', 10);
  }
  
  function incrementFailureCount() {
    const count = getFailureCount() + 1;
    localStorage.setItem('adminFailures', count.toString());
    return count;
  }
  
  function resetFailureCount() {
    localStorage.removeItem('adminFailures');
  }
  
  // Get current path - ignore hash part
  const path = window.location.pathname;
  
  // Allow both /admin and /admin-fallback to work
  if (path === PRIMARY_PATH || path === PRIMARY_PATH + '/' || 
      path === FALLBACK_PATH || path === FALLBACK_PATH + '/') {
    console.log('Admin path check complete');
    
    // If at the primary path, reset the failure counter
    if (path === PRIMARY_PATH || path === PRIMARY_PATH + '/') {
      resetFailureCount();
    }
    
    return;
  }
  
  // Very simple check for admin or dashboard anywhere in path
  const isAdmin = path.includes('admin') || path.includes('dashboard');
  
  // Only redirect if we're at an admin path but not the right one
  if (isAdmin) {
    console.log('Fixing admin path:', path);
    
    // Prevent redirect loops
    const redirectFlag = 'adminFixRedirect';
    
    if (!sessionStorage.getItem(redirectFlag)) {
      // Set flag to prevent loops
      sessionStorage.setItem(redirectFlag, 'true');
      
      // Clear flag after 3 seconds
      setTimeout(() => {
        sessionStorage.removeItem(redirectFlag);
      }, 3000);
      
      // Check failure count to determine which path to use
      const failures = getFailureCount();
      
      if (failures >= MAX_FAILURES) {
        // Use fallback path after too many failures
        console.log(`Using fallback admin path after ${failures} failures`);
        window.location.href = FALLBACK_PATH;
      } else {
        // Try primary path and increment failure counter
        incrementFailureCount();
        console.log(`Redirecting to primary admin (failure count: ${getFailureCount()})`);
        window.location.href = PRIMARY_PATH;
      }
    }
  } else {
    console.log('Admin path check complete');
  }
})();