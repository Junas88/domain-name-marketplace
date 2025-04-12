/**
 * Production deployment fix for admin paths
 * This script runs early in the page load process to catch and fix path issues
 * It's particularly designed to handle production deployment edge cases
 */
(function() {
  console.log("PRODFIX: Running path detection and correction");
  
  // PART 1: Handle SPA routing from 404.html redirects
  if (typeof window !== 'undefined') {
    // Check if we're being redirected with a query param
    const params = new URLSearchParams(window.location.search);
    const redirectFrom = params.get('redirectFrom');
    
    if (redirectFrom) {
      console.log("PRODFIX: Detected redirect from 404.html with path:", redirectFrom);
      
      // Clean the URL in address bar
      const cleanUrl = window.location.pathname;
      window.history.replaceState(null, '', cleanUrl);
      
      // Handle admin path specifically
      if (redirectFrom.includes('admin') || redirectFrom.includes('dashboard')) {
        console.log("PRODFIX: Admin path detected in redirect, sending to /admin");
        window.location.href = '/admin';
        return;
      }
    }
  }

  // PART 2: Direct path detection and correction
  // Get current path
  const path = window.location.pathname;
  
  // Known problematic admin paths in production environments
  const adminPaths = [
    '/dashboard',
    '/dashboard/',
    '/admin/dashboard',
    '/admin/dashboard/',
    '/admin/index.html',
    '/dashboard/index.html',
    '/domainnameguide.com/admin',
    '/domainnameguide.com/dashboard'
  ];
  
  // More complex path pattern detection
  function isNonStandardAdminPath(urlPath) {
    // Direct matches
    if (adminPaths.includes(urlPath)) return true;
    
    // Check segments for admin/dashboard keywords
    const segments = urlPath.split('/').filter(Boolean);
    if (segments.length === 0) return false;
    
    // Check for admin paths with additional segments
    if (urlPath.includes('/admin/') && urlPath !== '/admin/') return true;
    if (urlPath.includes('/dashboard/')) return true;
    
    // Domain prefix checks for production environments
    const domainPrefixMatch = urlPath.match(/^\/[^\/]+\/(admin|dashboard)/);
    if (domainPrefixMatch) return true;
    
    return false;
  }
  
  // If we're on a non-standard admin path that needs fixing
  if (isNonStandardAdminPath(path)) {
    console.log('PRODFIX: Non-standard admin path detected:', path);
    
    // Loop prevention
    if (!sessionStorage.getItem('adminPathFixed')) {
      console.log('PRODFIX: Redirecting to standard admin path: /admin');
      sessionStorage.setItem('adminPathFixed', 'true');
      
      // Clear flag after delay
      setTimeout(() => {
        sessionStorage.removeItem('adminPathFixed');
      }, 3000);
      
      // Force navigation to standard admin path
      window.location.href = '/admin';
    } else {
      console.log('PRODFIX: Redirect already attempted, avoiding loop');
    }
  } else {
    console.log('PRODFIX: No path correction needed');
  }
})();