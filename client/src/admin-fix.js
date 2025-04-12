/**
 * Admin Deep Link Handler
 * This script runs inside the React app to ensure proper internal routing
 * It complements the external path fixes in admin-path-fix.js and prodfix.js
 */

// This runs immediately when included in the React app bundle
(function() {
  // Only execute in the browser environment
  if (typeof window === 'undefined') return;
  
  console.log('Admin deep link handler running...');
  
  // Get the current path
  const currentPath = window.location.pathname;
  
  // Array of known problematic admin paths that need redirection
  const problematicPaths = [
    '/dashboard',
    '/dashboard/',
    '/admin/dashboard',
    '/admin/dashboard/',
    '/admin/index.html',
    '/dashboard/index.html',
    '/domainnameguide.com/admin',
    '/domainnameguide.com/dashboard',
    '/domainnameguide.com/admin/dashboard'
  ];
  
  // Detect production environments for additional handling
  const isProduction = !window.location.hostname.includes('localhost') && 
                      !window.location.hostname.includes('replit');
                      
  // Additional production paths to check
  if (isProduction) {
    [
      '/replit/admin',
      '/vercel/admin',
      '/netlify/admin',
      '/domainguide/admin'
    ].forEach(p => problematicPaths.push(p));
  }
  
  // Function to check for admin paths that need correction
  function needsPathCorrection(path) {
    // Direct path matches
    if (problematicPaths.includes(path)) return true;
    
    // Check for domain prefixed paths (common in some deployments)
    const domainPrefixPattern = /^\/[^\/]+\/(admin|dashboard)/;
    if (domainPrefixPattern.test(path)) return true;
    
    // Check for admin/dashboard in unusual places
    if (path.includes('/dashboard/index.html')) return true;
    if (path.includes('/admin/index.html')) return true;
    
    // Check for admin subpaths that aren't just /admin
    // But exclude /admin/ which is valid as a base path
    if (path.startsWith('/admin/') && path !== '/admin/') return true;
    
    return false;
  }
  
  // Handle any path issues
  if (needsPathCorrection(currentPath)) {
    console.log('Admin path needs correction:', currentPath);
    
    // Prevent redirect loops
    if (!sessionStorage.getItem('reactAdminRedirect')) {
      console.log('Redirecting to /admin...');
      sessionStorage.setItem('reactAdminRedirect', 'true');
      
      // Clear flag after delay to prevent permanent blocking
      setTimeout(() => {
        sessionStorage.removeItem('reactAdminRedirect');
      }, 3000);
      
      // Try clean navigation with History API first
      if (window.history && window.history.replaceState) {
        try {
          window.history.replaceState(null, '', '/admin');
          window.location.reload();
          return;
        } catch (e) {
          console.log('History API failed, using direct navigation');
        }
      }
      
      // Fallback to direct navigation
      window.location.href = '/admin';
    } else {
      console.log('Redirect already attempted, preventing loop');
    }
  } else {
    console.log('Admin deep link check: path OK');
  }
})();