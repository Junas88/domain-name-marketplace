# Vercel Deployment Guide for Domain Name Guide

## Prerequisites
- A Vercel account (sign up at [vercel.com](https://vercel.com))
- A PostgreSQL database (Neon, Supabase, or any other PostgreSQL provider)
- API keys for external services (OpenAI, etc.)

## Step 1: Database Setup
1. Set up a PostgreSQL database with a provider like [Neon](https://neon.tech) or [Supabase](https://supabase.com)
2. Get your database connection string in the format:
   ```
   postgres://user:password@hostname:port/database
   ```

## Step 2: Deploy to Vercel
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project" 
3. Import your GitHub repository (https://github.com/Junas88/domain-name-guide)
4. Configure the project:
   - Build Command: Should be auto-detected or set to `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

## Step 3: Set Environment Variables
In the Vercel project settings, add the following environment variables:

- `DATABASE_URL` - Your PostgreSQL connection string
- `SESSION_SECRET` - A random string for session encryption (generate with `openssl rand -base64 32`)
- `OPENAI_API_KEY` - Your OpenAI API key (if using AI features)
- `STRIPE_SECRET_KEY` - Your Stripe secret key (if using payment features)
- `VITE_STRIPE_PUBLIC_KEY` - Your Stripe publishable key (if using payment features)
- `NODE_ENV` - Set to `production`

## Step 4: Deploy
1. Click "Deploy" in the Vercel dashboard
2. Wait for the build to complete
3. Your site will be live at a *.vercel.app domain

## Step 5: Check Database Connection
1. Visit your deployed site
2. Check that data is loading correctly
3. Test admin login with your credentials
4. If database issues occur, check the Vercel logs for connection errors

## Step 6: Custom Domain (Optional)
1. In Vercel project settings, go to "Domains"
2. Add your custom domain
3. Follow Vercel instructions to verify ownership and set up DNS

## Troubleshooting
- **Build Errors**: Check the build logs in Vercel for specific errors
- **Database Connection Issues**: Ensure your DATABASE_URL is correct and the database is accessible from Vercel
- **Missing Environment Variables**: Double-check all required environment variables are set
- **Runtime Errors**: Check the Function Logs in Vercel dashboard

## Important Notes
- The free tier of most PostgreSQL providers should be sufficient for initial deployment
- Set up database backups to prevent data loss
- The project uses session-based authentication that requires proper SESSION_SECRET
- Make sure your database provider allows connections from Vercel's IP ranges