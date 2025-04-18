# Domain Name Guide - Vercel Deployment Instructions

This document provides detailed instructions for deploying the Domain Name Guide application to Vercel, specifically addressing the common issue where the schema code is displayed instead of the actual application.

## Before You Begin

Ensure you have:
- A GitHub repository with your code (see `setup-github-repo.js` if needed)
- A Vercel account
- Access to the Supabase database

## Step 1: Prepare Your Application

1. **Run the deployment check script:**
   ```bash
   node check-deployment-env.js
   ```
   This will verify that your environment is properly configured for deployment.

2. **Ensure all special files are present:**
   - `api/index.js` - Special Vercel API handler
   - `vercel.json` - Proper configuration for routing
   - `404.html` - Fallback for 404 errors
   - `vercel-index.html` - Special fallback for Vercel
   - `vercel.js` - Special routing handler

3. **Verify your vercel.json configuration:**
   ```json
   {
     "version": 2,
     "buildCommand": "npm run build",
     "outputDirectory": "dist",
     "framework": "vite",
     "rewrites": [
       {
         "source": "/api/(.*)",
         "destination": "/api/$1"
       },
       {
         "source": "/(.*)",
         "destination": "/index.html"
       }
     ],
     "headers": [
       {
         "source": "/(.*)",
         "headers": [
           {
             "key": "Cache-Control",
             "value": "public, max-age=0, must-revalidate"
           }
         ]
       },
       {
         "source": "/assets/(.*)",
         "headers": [
           {
             "key": "Cache-Control",
             "value": "public, max-age=31536000, immutable"
           }
         ]
       }
     ],
     "env": {
       "NODE_ENV": "production"
     },
     "functions": {
       "api/*.js": {
         "memory": 1024,
         "maxDuration": 10
       }
     }
   }
   ```

## Step 2: Deploy to Vercel

1. **Log in to Vercel dashboard:**
   Go to [https://vercel.com/dashboard](https://vercel.com/dashboard)

2. **Create a new project:**
   - Click "Add New" → "Project"
   - Import your GitHub repository
   - Configure the project:
     - **Framework Preset:** Vite
     - **Build Command:** `npm run build`
     - **Output Directory:** `dist`
     - **Environment Variables:**
       - `DATABASE_URL` - Your Supabase connection string
       - `NODE_ENV` - Set to `production`
       - `STRIPE_SECRET_KEY` - Your Stripe secret key (if using Stripe)
       - `VITE_STRIPE_PUBLIC_KEY` - Your Stripe public key (if using Stripe)
       - Any other environment variables your application needs

3. **Deploy:**
   - Click "Deploy"
   - Wait for the build to complete

## Step 3: Troubleshooting Schema Display Issues

If you see schema code instead of your application, follow these steps:

1. **Check Environment Variables:**
   - Go to your Vercel project settings
   - Navigate to "Environment Variables"
   - Ensure all required variables are set correctly, especially `DATABASE_URL`

2. **Clear Build Cache and Redeploy:**
   - Go to your Vercel project
   - Navigate to "Settings" → "General"
   - Scroll down to "Build & Development Settings"
   - Click "Clear Build Cache"
   - Redeploy your application

3. **Check Build Logs for Errors:**
   - Go to your latest deployment
   - Click "View Build Logs"
   - Look for any errors or warnings

4. **Verify API Routing:**
   - Test an API endpoint by navigating to `https://your-app.vercel.app/api/domains`
   - If the API works but the frontend doesn't load, it's likely a routing issue

## Common Issues and Solutions

### Schema Code Displayed

**Issue:** The application shows schema code or an empty/broken page.

**Solution:**
- Ensure `vercel.json` has the correct routing configuration
- Make sure all environment variables are properly set
- Check that the build command and output directory are correct
- Verify the `api/index.js` file is present
- Try the special fallback files (`404.html`, `vercel-index.html`)

### API Routes Not Working

**Issue:** API endpoints return 404 or don't function correctly.

**Solution:**
- Check that `api/index.js` is properly configured
- Verify `vercel.json` has the correct API routing in `rewrites`
- Ensure your database connection string is valid
- Check that your Supabase database is accessible

### Database Connection Issues

**Issue:** The application can't connect to the database.

**Solution:**
- Verify the `DATABASE_URL` environment variable is correct
- Ensure the Supabase database is properly set up and accessible
- Check for any networking restrictions that might prevent connections
- Use the `check-database-connection.js` script to test connectivity

## Additional Resources

- [SUPABASE_VERCEL_DEPLOYMENT.md](./SUPABASE_VERCEL_DEPLOYMENT.md) - Specific instructions for Supabase
- [Vercel Documentation](https://vercel.com/docs) - Official Vercel documentation
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html) - Official Vite deployment guide
- [Supabase Documentation](https://supabase.io/docs) - Official Supabase documentation

## Need Further Help?

If you're still experiencing issues after following these steps, consider:
- Checking for any recent changes in your codebase that might affect deployment
- Looking at similar issues in the Vercel or Vite communities
- Starting with a simpler application and gradually adding complexity
- Reaching out to Vercel support for assistance