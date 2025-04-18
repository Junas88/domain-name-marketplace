# Vercel Deployment Checklist for Domain Name Guide

This document provides a step-by-step checklist for deploying the Domain Name Guide application to Vercel with Supabase as the database.

## Pre-Deployment Checklist

### 1. Environment Variables

Make sure you have the following environment variables ready:

- [ ] `DATABASE_URL` - Your Supabase connection string (format: `postgresql://postgres:[YOUR-PASSWORD]@db.vefjxsavewdrhpjehmdx.supabase.co:5432/postgres`)
- [ ] `SESSION_SECRET` - A secure random string (generate with `openssl rand -base64 32`)
- [ ] `NODE_ENV` - Set to `production`

### 2. Code Preparation

- [ ] All changes are committed to GitHub repository
- [ ] Production build is tested locally with `npm run build`
- [ ] `vercel.json` file is properly configured
- [ ] Static assets are optimized for production
- [ ] Cache busting implementation is working correctly

### 3. Database Preparation

- [ ] Supabase database is set up and tables are created
- [ ] Database connection is tested with test script
- [ ] Initial data is seeded if necessary
- [ ] Database backups are configured

## Deployment Steps

### 1. Set Up Vercel Project

- [ ] Log in to Vercel Dashboard at [vercel.com/dashboard](https://vercel.com/dashboard)
- [ ] Click "New Project" or "Import Project"
- [ ] Connect your GitHub account and select your repository
- [ ] Configure project settings:
  - Framework Preset: Vite
  - Build Command: `npm run build`
  - Output Directory: `dist`

### 2. Configure Environment Variables

- [ ] Add all required environment variables from the checklist above
- [ ] Verify all secrets are securely stored

### 3. Deploy

- [ ] Click "Deploy" button
- [ ] Wait for build and deployment to complete

## Post-Deployment Verification

### 1. Basic Functionality

- [ ] Website loads correctly
- [ ] Homepage displays domains
- [ ] No console errors in browser developer tools
- [ ] Navigation works between all pages

### 2. Admin Functionality

- [ ] Admin login works
- [ ] Domain management functions work
- [ ] Content management functions work

### 3. Database Connectivity

- [ ] Database connection is successful
- [ ] Data is loaded correctly from Supabase
- [ ] Admin changes persist in the database

## Troubleshooting Common Issues

### Build Failures

- Check build logs for specific errors
- Verify environment variables are correctly set
- Make sure all dependencies are properly installed

### Database Connection Issues

- Verify DATABASE_URL is correct
- Check if Supabase's IP restrictions might be blocking Vercel
- Ensure SSL settings are properly configured

### Runtime Errors

- Check Vercel function logs for server-side errors
- Verify client-side connectivity in browser console
- Test database connection directly from Vercel Functions

## Optimization

Once deployed, consider these optimizations:

- [ ] Add a custom domain in Vercel settings
- [ ] Configure Supabase connection pooling
- [ ] Enable Vercel Edge Functions if appropriate
- [ ] Set up Vercel Analytics

## Monitoring

- [ ] Set up Vercel status alerts
- [ ] Configure error notifications
- [ ] Implement uptime monitoring

## Maintenance

- [ ] Document deployment process for future reference
- [ ] Create scheduled database backup plan
- [ ] Plan for regular dependency updates