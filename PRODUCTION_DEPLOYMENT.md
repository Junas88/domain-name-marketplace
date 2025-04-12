# Production Deployment Guide

This document provides instructions for deploying the application to production environments while ensuring that the admin dashboard works correctly.

## Pre-deployment Steps

1. Make sure all admin routing fixes are in place:
   - `public/prodfix.js` (runs early in page load)
   - `public/admin-path-fix.js` (runs after DOM is loaded)
   - `client/src/admin-fix.js` (runs in React application)
   - `public/404.html` (handles SPA routing in production)

2. Run the production build script to create a deployment-ready build:
   ```
   ./build-production.sh
   ```
   This will create a `dist` folder with all necessary files.

## Deployment Configuration

The following files are automatically included in the production build:

- `_redirects` - For Netlify deployments
- `vercel.json` - For Vercel deployments
- `404.html` - For handling SPA routing in any environment
- Admin path fixing scripts

## Testing Production Deployment

Before deploying to production, you can test the admin routing locally:

1. Run the test script:
   ```
   ./test-production.sh
   ```

2. Open the `production-test/index.html` file in your browser.

3. Click the test links to verify that the admin paths are correctly handled.

## Deploying to Different Platforms

### Vercel

1. Connect your repository to Vercel.
2. Use the following build settings:
   - Build Command: `./build-production.sh`
   - Output Directory: `dist`

### Netlify

1. Connect your repository to Netlify.
2. Use the following build settings:
   - Build Command: `./build-production.sh`
   - Publish Directory: `dist`

### Other Static Hosts

1. Run `./build-production.sh` locally.
2. Upload the contents of the `dist` folder to your hosting provider.

## Troubleshooting

If you encounter issues with admin routing in production:

1. Check that the `prodfix.js` script is loaded before any other JavaScript.
2. Verify that the `_redirects` file (Netlify) or `vercel.json` (Vercel) is present in the root directory.
3. Ensure the `404.html` page is correctly handling SPA routing.

## Admin URL

In all production environments, the admin dashboard is accessible at:
`https://yourdomain.com/admin`