# Domain Name Guide - Deployment Checklist

This checklist will help you ensure a successful deployment of the Domain Name Guide application, particularly focusing on resolving the schema display issue on Vercel.

## Pre-Deployment Checklist

### 1. Code Preparation

- [ ] Run `node check-deployment-env.js` to verify deployment environment
- [ ] Run `node clear-deployment-cache.js` to ensure cache busting is set up
- [ ] Verify all special deployment files exist:
  - [ ] `api/index.js` (Vercel API handler)
  - [ ] `vercel.json` (proper routing configuration)
  - [ ] `404.html` (fallback page)
  - [ ] `vercel-index.html` (SPA fallback)
  - [ ] `vercel.js` (special routing handler)

### 2. Database Configuration

- [ ] Check database connection with `node check-database-connection.js`
- [ ] Verify DATABASE_URL is properly formatted
- [ ] Ensure tables exist in the database
- [ ] Make sure your database allows connections from Vercel's IP ranges

### 3. Environment Variables

- [ ] Prepare all required environment variables:
  - [ ] `DATABASE_URL` (critical for database connection)
  - [ ] `NODE_ENV=production` (ensures production mode)
  - [ ] `STRIPE_SECRET_KEY` (if using Stripe)
  - [ ] `VITE_STRIPE_PUBLIC_KEY` (if using Stripe)
  - [ ] Any other application-specific variables

### 4. GitHub Repository

- [ ] Ensure code is pushed to GitHub
- [ ] Verify GitHub repository is public or added to Vercel
- [ ] Check that all deployment files are included

## Deployment Process

### 1. Vercel Project Setup

- [ ] Log in to Vercel dashboard
- [ ] Create a new project and import from GitHub
- [ ] Configure the project:
  - [ ] Framework preset: Vite
  - [ ] Build command: `npm run build`
  - [ ] Output directory: `dist`
  - [ ] Add all environment variables

### 2. Initial Deployment

- [ ] Deploy the project
- [ ] Check for any build errors in logs
- [ ] Verify the deployment is successful

### 3. Schema Display Issue Troubleshooting

If you're seeing schema code instead of your application:

- [ ] Check that `vercel.json` has the correct routing configuration
- [ ] Verify all environment variables are properly set in Vercel
- [ ] Go to project settings → "General" → "Build & Development Settings"
- [ ] Click "Clear Build Cache" and redeploy
- [ ] Check API routes are working by navigating to an endpoint
- [ ] Verify database connection in Vercel logs

## Post-Deployment Verification

- [ ] Test the application functionality
- [ ] Verify database operations work correctly
- [ ] Check all pages and routes load properly
- [ ] Test the admin dashboard login
- [ ] Verify API endpoints return correct data

## Common Issues and Solutions

### Schema Code Displayed Instead of Application

**Symptoms:**
- The Vercel deployment shows TypeScript schema code instead of the actual website
- You see code definitions instead of your UI

**Solutions:**
1. Verify the following files exist:
   - `api/index.js`
   - `vercel.json` with correct SPA routing
   - `404.html`
   - `vercel-index.html`

2. Check environment variables:
   - Make sure `DATABASE_URL` is set correctly
   - Ensure `NODE_ENV` is set to `production`

3. Clear build cache and redeploy:
   - Go to Vercel project settings
   - Find "Build & Development Settings"
   - Click "Clear Build Cache"
   - Redeploy the project

4. Update your `vercel.json` routes:
   ```json
   "rewrites": [
     {
       "source": "/api/(.*)",
       "destination": "/api/$1"
     },
     {
       "source": "/(.*)",
       "destination": "/index.html"
     }
   ]
   ```

### Database Connection Issues

**Symptoms:**
- API routes return errors
- Database queries fail
- Application loads but data doesn't appear

**Solutions:**
1. Verify your database connection string
2. Check database server is running and accessible
3. Ensure your Supabase project allows connections from Vercel
4. Run `node check-database-connection.js` to test

### API Routes Not Working

**Symptoms:**
- 404 errors when accessing API endpoints
- Frontend can't fetch data from the backend

**Solutions:**
1. Check `api/index.js` is properly configured
2. Verify `vercel.json` has correct API routing
3. Test API endpoints directly with the browser or Postman
4. Check Vercel function logs for errors

## Final Checklist Before Going Live

- [ ] All pages load correctly
- [ ] Database operations work
- [ ] Admin dashboard is accessible
- [ ] Domain listings display properly
- [ ] Search functionality works
- [ ] Contact forms submit correctly
- [ ] No console errors in browser dev tools

**Note:** If you continue to experience issues after following this checklist, refer to the more detailed `VERCEL_DEPLOYMENT_INSTRUCTIONS.md` document.