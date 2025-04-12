# Deployment Checklist for Domain Name Guide

This file provides a checklist to ensure your website deploys correctly.

## Required Environment Variables

When deploying to Replit, you need to add the following environment variables to your deployment configuration:

### Database Variables 
These are required for database connection:
- [ ] `DATABASE_URL` (main database connection string)
- [ ] `PGUSER` (database username)
- [ ] `PGPASSWORD` (database password)
- [ ] `PGHOST` (database host)
- [ ] `PGPORT` (database port)
- [ ] `PGDATABASE` (database name)

### Stripe Variables
These are required for payment processing:
- [ ] `STRIPE_SECRET_KEY` (starts with "sk_", used on the server)
- [ ] `VITE_STRIPE_PUBLIC_KEY` (starts with "pk_", used on the client)

## How to Add Environment Variables in Replit Deployment

1. Click the "Deploy" button in Replit
2. In the deployment configuration screen, look for a section labeled "Environment Variables" or "Secrets"
3. Add each of the variables listed above with their corresponding values
4. These values should be the same as the ones you're using in your development environment
5. Click "Deploy" to start the deployment process

## Troubleshooting

If your deployment fails with errors about missing environment variables:
- Check if all required variables have been added
- Verify that the values are correct (no typos)
- Make sure the database is accessible from the deployment environment

For Stripe-related issues:
- Verify that the Stripe keys are valid
- Ensure the public key starts with "pk_" and the secret key starts with "sk_"
- Test Stripe functionality in development first before deploying

## Post-Deployment Verification

After successful deployment, verify:
- [ ] Website loads correctly
- [ ] Database connection is working (domain listings appear)
- [ ] Stripe payments can be processed
- [ ] File downloads work correctly

For any persistent issues, check the deployment logs for specific error messages.