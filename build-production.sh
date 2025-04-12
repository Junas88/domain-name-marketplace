#!/bin/bash
# Production build script with admin fix
# This creates a production build with all necessary fixes for admin routing

echo "Starting production build with admin fixes..."

# Backup original package.json
cp package.json package.json.bak

# Create a temporary package.json with modified build script
cat package.json | jq '.scripts.build = "vite build && esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist && ./client/dist-fix.sh"' > package.json.tmp
mv package.json.tmp package.json

# Run the build
echo "Building production version..."
npm run build

# Restore original package.json
mv package.json.bak package.json

echo "Production build completed with admin fixes!"
echo "The build includes:"
echo "- Simple admin path handling scripts"
echo "- 404.html for SPA routing" 
echo "- Netlify _redirects file"
echo "- vercel.json configuration"

echo "Ready for deployment!"