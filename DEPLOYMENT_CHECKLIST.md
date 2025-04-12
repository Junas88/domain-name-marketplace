# Deployment Checklist for Domain Name Guide

This file provides a checklist to ensure your website deploys correctly.

## Required Environment Variables

When deploying to Replit, you should add the following environment variables to your deployment configuration for optimal functionality:

### Database Variables 
These are recommended for persistent database connection:
- [ ] `DATABASE_URL` (main database connection string)

OR alternatively, you can provide individual connection parameters:
- [ ] `PGUSER` (database username)
- [ ] `PGPASSWORD` (database password)
- [ ] `PGHOST` (database host)
- [ ] `PGPORT` (database port)
- [ ] `PGDATABASE` (database name)

## Important Update - April 2025:
This application now runs in two modes:
1. **Database Mode** - When database credentials are available, uses PostgreSQL for data storage (full 369 domains)
2. **Fallback Mode** - When no database credentials are provided, falls back to in-memory storage with 200+ sample domains

The fallback in-memory storage has been enhanced to include 200+ domains, providing a near-complete experience even without a database connection.

Note: In fallback mode, data will not persist between application restarts, but the application will automatically reseed with the large set of sample domains.

## How to Add Environment Variables in Replit Deployment

1. Click the "Deploy" button in Replit
2. In the deployment configuration screen, look for a section labeled "Environment Variables" or "Secrets"
3. Add database variables listed above with their corresponding values
4. These values should be the same as the ones you're using in your development environment
5. Click "Deploy" to start the deployment process

## Troubleshooting

If your deployment seems to lose data after restarting:
- This indicates you're running in fallback mode with in-memory storage
- Add the database environment variables to enable persistent storage

For database connection issues:
- Check if your database variables have been added correctly
- Verify that the values are correct (no typos)
- Make sure the database is accessible from the Replit deployment environment

## Admin Access

After deployment, you can access the admin dashboard with these credentials:
- Username: `admin`
- Password: `admin123`

These credentials work in both database mode and fallback mode.

## Post-Deployment Verification

After successful deployment, verify:
- [ ] Website loads correctly
- [ ] Domain listings appear (from in-memory or database storage)
- [ ] Free ebook downloads work correctly
- [ ] Login to admin dashboard works with credentials above
- [ ] Admin dashboard displays data correctly

## Performance & Reliability Notes

1. **Domain Count**: In database mode, all 369 domains will be available. In fallback mode, 200+ sample domains will be displayed.

2. **Authentication**: Admin login has been simplified and hardened to work in both modes (credentials: admin/admin123)

3. **Redeployment**: If you need to redeploy, you can use the same settings - all fallback mechanisms will activate automatically if database credentials are not available.

4. **Database Connection**: If the application seems to lose data after restarts or shows only sample data, check if your database connection variables are configured correctly.

For any persistent issues, check the deployment logs for specific error messages.