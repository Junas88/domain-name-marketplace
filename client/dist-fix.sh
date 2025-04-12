#!/bin/bash
# This script creates necessary files in the dist folder after build
# to ensure admin routing works in production

echo "Creating production fix files..."

# Create redirects file for Netlify
echo "# Netlify redirects file" > dist/_redirects
echo "/admin/*       /index.html   200" >> dist/_redirects
echo "/dashboard/*   /index.html   200" >> dist/_redirects
echo "/*            /index.html   200" >> dist/_redirects

# Copy 404.html to dist
cp public/404.html dist/404.html

# Create simple admin path helper in dist
cat > dist/admin-fix.js << 'EOF'
// Simple admin path fix for production
(function() {
  // Get path
  var path = window.location.pathname;
  
  // Simple check
  if ((path.indexOf('admin') !== -1 || path.indexOf('dashboard') !== -1) && path !== '/admin') {
    console.log('Admin path needs fixing in production:', path);
    window.location.href = '/admin';
  }
})();
EOF

echo "Production fix files created successfully!"