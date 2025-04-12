#!/bin/bash
# This script creates necessary files in the dist folder after build
# to ensure admin routing works in production

echo "Creating production fix files..."

# Create redirects file for Netlify
echo "# Netlify redirects file" > dist/_redirects
echo "/admin/*       /index.html   200" >> dist/_redirects
echo "/admin-fallback/*  /index.html   200" >> dist/_redirects
echo "/dashboard/*   /index.html   200" >> dist/_redirects
echo "/*            /index.html   200" >> dist/_redirects

# Copy 404.html to dist
cp public/404.html dist/404.html

# Create simple admin path helper in dist with fallback support
cat > dist/admin-fix.js << 'EOF'
// Simple admin path fix for production with fallback support
(function() {
  // Constants
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
  
  // Get path
  var path = window.location.pathname;
  
  // Simple check with fallback support
  if ((path.indexOf('admin') !== -1 || path.indexOf('dashboard') !== -1) 
      && path !== ADMIN_PATH && path !== FALLBACK_PATH) {
    console.log('Admin path needs fixing in production:', path);
    
    var failures = getFailureCount();
    if (failures >= MAX_FAILURES) {
      // Too many failures, use fallback
      window.location.href = FALLBACK_PATH;
    } else {
      // Try regular admin path
      incrementFailureCount();
      window.location.href = ADMIN_PATH;
    }
  }
})();
EOF

echo "Production fix files created successfully!"
echo "Administrator fallback system installed at /admin-fallback"