# Vercel Deployment Instructions for Domain Name Guide

Your GitHub repository is already set up at:
https://github.com/Junas88/domain-name-guide

## Deploying to Vercel

Follow these steps to deploy your application:

1. Go to the Vercel dashboard: https://vercel.com/dashboard

2. Click "Add New" > "Project"

3. Import your GitHub repository:
   - Select your GitHub account
   - Find and select the "domain-name-guide" repository
   - Click "Import"

4. Configure your project:
   - Framework Preset: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

5. Add Environment Variables:
   - `DATABASE_URL`: Your Supabase connection string (postgresql://postgres:password@db.vefjxsavewdrhpjehmdx.supabase.co:5432/postgres)
   - `SESSION_SECRET`: A secure random string
   - `NODE_ENV`: production

6. Click "Deploy"

7. Once deployed, you can:
   - Add a custom domain
   - Configure additional settings
   - Set up domain redirects

## Important Notes

1. **Database Setup**: Ensure your Supabase database is properly set up with all required tables. See the SQL setup in `SUPABASE_VERCEL_DEPLOYMENT.md`.

2. **Environment Variables**: Double-check all environment variables are correctly set before deploying.

3. **Troubleshooting**: If you encounter any issues:
   - Check the Vercel deployment logs
   - Verify database connection
   - Check for build errors

4. **Post-Deployment**: After successful deployment, test all functionality:
   - Login/authentication
   - Domain browsing and filtering
   - Admin dashboard
   - Content management