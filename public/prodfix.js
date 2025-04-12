/**
 * MINIMAL PRODUCTION PATH FIX
 * This script runs early in page load to ensure proper routing
 * Using absolute minimum code for maximum compatibility
 */
(function() {
  // Skip if not in browser
  if (typeof window === 'undefined') return;
  
  // Function to fix admin paths - ultra simple approach
  function fixAdminPath() {
    // Get current path
    var path = window.location.pathname;
    
    // Check if this is an admin path (simpler is more reliable)
    var hasAdmin = path.indexOf('admin') !== -1;
    var hasDashboard = path.indexOf('dashboard') !== -1;
    
    // Only redirect if we're not already at /admin
    if ((hasAdmin || hasDashboard) && path !== '/admin') {
      console.log('Admin path needs fixing:', path);
      
      // Prevent redirect loops
      if (!sessionStorage.getItem('prodFixRedirect')) {
        console.log('Redirecting to /admin');
        sessionStorage.setItem('prodFixRedirect', 'true');
        
        // Clear flag after delay
        setTimeout(function() {
          sessionStorage.removeItem('prodFixRedirect');
        }, 3000);
        
        // Direct navigation is most reliable
        window.location.href = '/admin';
      }
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
      window.location.href = '/admin';
      return;
    }
  }
  
  // Also run the general fix
  fixAdminPath();
})();