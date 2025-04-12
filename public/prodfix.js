/**
 * MINIMAL PRODUCTION PATH FIX WITH FALLBACK
 * This script runs early in page load to ensure proper routing
 * Using absolute minimum code for maximum compatibility
 */
(function() {
  // Skip if not in browser
  if (typeof window === 'undefined') return;
  
  // CONFIGURATION
  var ADMIN_PATH = '/admin';               // Primary admin path
  var FALLBACK_PATH = '/admin-fallback';   // Fallback path if regular admin fails
  var MAX_FAILURES = 2;                    // Number of failures before using fallback
  
  // Check for admin failure count
  function getFailureCount() {
    return parseInt(localStorage.getItem('adminFailures') || '0', 10);
  }
  
  function incrementFailureCount() {
    var count = getFailureCount() + 1;
    localStorage.setItem('adminFailures', count.toString());
    return count;
  }
  
  function resetFailureCount() {
    localStorage.removeItem('adminFailures');
  }
  
  // Function to fix admin paths - ultra simple approach
  function fixAdminPath() {
    // Get current path
    var path = window.location.pathname;
    
    // Check if this is an admin path (simpler is more reliable)
    var hasAdmin = path.indexOf('admin') !== -1;
    var hasDashboard = path.indexOf('dashboard') !== -1;
    
    // Only redirect if we're not already at primary admin or fallback
    if ((hasAdmin || hasDashboard) && path !== ADMIN_PATH && path !== FALLBACK_PATH) {
      console.log('Admin path needs fixing:', path);
      
      // Prevent redirect loops
      if (!sessionStorage.getItem('prodFixRedirect')) {
        console.log('Redirecting to admin');
        sessionStorage.setItem('prodFixRedirect', 'true');
        
        // Clear flag after delay
        setTimeout(function() {
          sessionStorage.removeItem('prodFixRedirect');
        }, 3000);
        
        // Choose destination based on failure count
        var failures = getFailureCount();
        if (failures >= MAX_FAILURES) {
          console.log('Too many admin failures, using fallback');
          window.location.href = FALLBACK_PATH;
        } else {
          // Track this attempt
          incrementFailureCount();
          console.log('Admin failure count:', getFailureCount());
          
          // Try regular admin path
          window.location.href = ADMIN_PATH;
        }
      }
    }
    
    // If at admin path successfully, reset failure count
    if (path === ADMIN_PATH) {
      resetFailureCount();
    }
  }
  
  // Handle 404.html redirects
  var params = new URLSearchParams(window.location.search);
  var redirectFrom = params.get('redirectFrom');
  
  if (redirectFrom) {
    console.log('Handling redirect from:', redirectFrom);
    
    // Clean URL
    var cleanUrl = window.location.pathname;
    if (window.history && window.history.replaceState) {
      window.history.replaceState(null, '', cleanUrl);
    }
    
    // Handle admin path in redirect
    if (redirectFrom.indexOf('admin') !== -1 || redirectFrom.indexOf('dashboard') !== -1) {
      // Choose destination based on past failures
      var failures = getFailureCount();
      if (failures >= MAX_FAILURES) {
        window.location.href = FALLBACK_PATH;
      } else {
        incrementFailureCount();
        window.location.href = ADMIN_PATH;
      }
      return;
    }
  }
  
  // Also run the general fix
  fixAdminPath();
})();