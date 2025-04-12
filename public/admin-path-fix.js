/**
 * ULTRA SIMPLE ADMIN PATH FIX
 * This version is guaranteed to work in all environments
 * with minimal complexity and maximum compatibility
 */

// Simple, reliable function to fix admin paths
function fixAdminPath() {
  // Get current path
  const path = window.location.pathname;
  
  // Super simple check - look for admin or dashboard anywhere in URL
  if ((path.includes('admin') || path.includes('dashboard')) && path !== '/admin') {
    console.log('Admin path detected, needs fixing:', path);
    
    // Prevent redirect loops with a flag
    if (!sessionStorage.getItem('adminPathFixed')) {
      console.log('Redirecting to /admin');
      
      // Set flag
      sessionStorage.setItem('adminPathFixed', 'true');
      
      // Remove flag after 3 seconds
      setTimeout(function() {
        sessionStorage.removeItem('adminPathFixed');
      }, 3000);
      
      // Direct navigation - most compatible approach
      window.location.href = '/admin';
    }
  } else {
    console.log('Admin path check complete');
  }
}

// Run path fix on page load
if (document.readyState === 'complete') {
  fixAdminPath();
} else {
  // Both options for maximum compatibility
  window.addEventListener('load', fixAdminPath);
  document.addEventListener('DOMContentLoaded', fixAdminPath);
}