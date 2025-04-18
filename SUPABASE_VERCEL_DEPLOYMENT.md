# Supabase + Vercel Deployment Guide for Domain Name Guide

## Step 1: Prepare Your Supabase Database

1. Log into your Supabase account at [app.supabase.com](https://app.supabase.com)
2. Go to your project `vefjxsavewdrhpjehmdx` (based on your URL)
3. Navigate to SQL Editor
4. Run this SQL to ensure you have the required tables:

```sql
-- Note: Run only if tables don't exist yet
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  email TEXT,
  role TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS domains (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  price DECIMAL NOT NULL,
  category TEXT,
  description TEXT,
  featured BOOLEAN DEFAULT FALSE,
  sold BOOLEAN DEFAULT FALSE,
  sold_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS page_contents (
  id SERIAL PRIMARY KEY,
  page_key TEXT NOT NULL UNIQUE,
  title TEXT,
  content TEXT,
  meta_description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS seo_settings (
  id SERIAL PRIMARY KEY,
  page_key TEXT NOT NULL UNIQUE,
  title TEXT,
  meta_description TEXT,
  keywords TEXT,
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS data_versions (
  id SERIAL PRIMARY KEY,
  data_type TEXT NOT NULL,
  version TEXT NOT NULL,
  last_updated TIMESTAMP DEFAULT NOW() NOT NULL,
  checksum TEXT,
  record_count INTEGER,
  details TEXT
);
```

## Step 2: Prepare For Vercel Deployment

1. Make sure your project is pushed to GitHub (which we already did)
2. Go to [Vercel Dashboard](https://vercel.com/dashboard)
3. Click on "New Project" or "Import Project"
4. Connect your GitHub account if not already connected
5. Select your repository (domain-name-guide)

## Step 3: Configure Vercel Project Settings

1. In the project configuration screen:
   - Framework Preset: Select "Vite"
   - Root Directory: Leave as default
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

2. Environment Variables (very important):
   - `DATABASE_URL`: `postgresql://postgres:[YOUR-PASSWORD]@db.vefjxsavewdrhpjehmdx.supabase.co:5432/postgres`
   - `SESSION_SECRET`: Generate a random string (e.g., use `openssl rand -base64 32`)
   - `NODE_ENV`: Set to `production`

## Step 4: Deploy and Troubleshooting

1. Click "Deploy" to start the deployment process
2. If you encounter any errors, check:
   - Database Connection: Verify the DATABASE_URL is correct with no typos
   - Build Errors: Look for syntax errors or missing dependencies
   - Runtime Errors: Check Vercel Function Logs for issues

## Common Issues and Solutions

### Database Connection Errors:
- Make sure your Supabase database allows connections from Vercel IPs
- In Supabase, go to Project Settings > Database > Connection Pooling
- Enable connection pooling if available
- Check if you need to use `?sslmode=require` at the end of your connection string

### Build Failures:
- Check Node.js version compatibility
- Make sure all dependencies are correctly installed
- Look for TypeScript errors in your code

### Serverless Function Timeout:
- Optimize database queries
- Make sure connections are properly closed after use
- Consider adding connection pooling

## Post-Deployment Steps

1. Test your application thoroughly:
   - Verify admin login works
   - Test domain creation and management
   - Make sure all pages load correctly

2. Set up domain if needed:
   - In Vercel project settings, go to Domains
   - Add your custom domain
   - Follow DNS setup instructions

## Database Migration and Maintenance

To run database migrations for future updates:

1. Use `db:push` locally to test migrations
2. Deploy the changes
3. Monitor the Vercel logs for any migration issues

Remember that Vercel has a serverless environment, so database connection handling is different from traditional hosting. Make sure your application properly manages database connections.

## Security Considerations

1. Never commit your DATABASE_URL with password to GitHub
2. Always use environment variables for secrets
3. Set up database backups in Supabase
4. Regularly rotate your SESSION_SECRET