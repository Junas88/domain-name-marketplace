/**
 * Admin path utilities for production deployments
 * This is a simple, reliable system that works in all environments
 */

// Simplest path check - no regex or complex logic
export function isAdminPath() {
  const path = window.location.pathname;
  
  // For direct admin paths
  if (path === '/admin' || path === '/admin/') return true;
  
  // For dashboard paths
  if (path === '/dashboard' || path === '/dashboard/') return true;
  
  // For segments with admin
  const segments = path.split('/').filter(Boolean);
  return segments.some(segment => 
    segment === 'admin' || 
    segment === 'dashboard'
  );
}

// Function to navigate to admin safely
export function goToAdmin() {
  // Simple and reliable redirect
  window.location.href = '/admin';
}

// Export a complete function to fix paths
export function fixAdminPath() {
  if (isAdminPath() && window.location.pathname !== '/admin') {
    // Prevent redirect loops with session storage
    if (!sessionStorage.getItem('adminRedirectAttempted')) {
      sessionStorage.setItem('adminRedirectAttempted', 'true');
      
      // Clear flag after 5 seconds
      setTimeout(() => {
        sessionStorage.removeItem('adminRedirectAttempted');
      }, 5000);
      
      // Go to admin
      goToAdmin();
    }
  }
}