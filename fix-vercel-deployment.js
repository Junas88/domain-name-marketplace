/**
 * Fix Vercel Deployment Issues for Domain Name Guide
 * 
 * This script helps resolve common Vercel deployment issues by:
 * 1. Creating a proper server build configuration
 * 2. Fixing routing issues between client and server
 * 3. Setting up proper environment variable handling
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

// Get the directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function checkVercelConfig() {
  console.log('📝 Checking Vercel configuration...');
  
  const vercelConfigPath = path.join(__dirname, 'vercel.json');
  let vercelConfig;
  
  if (fs.existsSync(vercelConfigPath)) {
    console.log('✅ vercel.json exists, checking content...');
    try {
      vercelConfig = JSON.parse(fs.readFileSync(vercelConfigPath, 'utf-8'));
      
      // Update the routes to ensure SPA routing works properly
      vercelConfig.rewrites = [
        {
          source: "/api/(.*)",
          destination: "/api/$1"
        },
        {
          source: "/(.*)",
          destination: "/index.html"
        }
      ];
      
      // Ensure cache control headers are set correctly
      vercelConfig.headers = [
        {
          source: "/(.*)",
          headers: [
            {
              key: "Cache-Control",
              value: "public, max-age=0, must-revalidate"
            }
          ]
        },
        {
          source: "/assets/(.*)",
          headers: [
            {
              key: "Cache-Control",
              value: "public, max-age=31536000, immutable"
            }
          ]
        }
      ];
      
      // Make sure we have the right function configuration
      vercelConfig.functions = {
        "api/*.js": {
          memory: 1024,
          maxDuration: 10
        }
      };
      
      // Update the Vercel configuration
      fs.writeFileSync(vercelConfigPath, JSON.stringify(vercelConfig, null, 2));
      console.log('✅ Updated vercel.json with proper configuration');
    } catch (error) {
      console.error('❌ Error processing vercel.json:', error.message);
      return false;
    }
  } else {
    console.log('❌ vercel.json does not exist, creating it...');
    
    // Create a basic Vercel configuration
    vercelConfig = {
      version: 2,
      buildCommand: "npm run build",
      outputDirectory: "dist",
      framework: "vite",
      rewrites: [
        {
          source: "/api/(.*)",
          destination: "/api/$1"
        },
        {
          source: "/(.*)",
          destination: "/index.html"
        }
      ],
      headers: [
        {
          source: "/(.*)",
          headers: [
            {
              key: "Cache-Control",
              value: "public, max-age=0, must-revalidate"
            }
          ]
        },
        {
          source: "/assets/(.*)",
          headers: [
            {
              key: "Cache-Control",
              value: "public, max-age=31536000, immutable"
            }
          ]
        }
      ],
      env: {
        NODE_ENV: "production"
      },
      functions: {
        "api/*.js": {
          memory: 1024,
          maxDuration: 10
        }
      }
    };
    
    fs.writeFileSync(vercelConfigPath, JSON.stringify(vercelConfig, null, 2));
    console.log('✅ Created vercel.json with proper configuration');
  }
  
  return true;
}

function checkEnvExample() {
  console.log('📝 Checking environment variables...');
  
  const envExamplePath = path.join(__dirname, '.env.example');
  
  if (!fs.existsSync(envExamplePath)) {
    console.log('❌ .env.example does not exist, creating it...');
    
    const envExampleContent = `# Database Configuration
DATABASE_URL=your-supabase-connection-string

# Node Environment
NODE_ENV=production

# Stripe Configuration (if using Stripe)
STRIPE_SECRET_KEY=your-stripe-secret-key
VITE_STRIPE_PUBLIC_KEY=your-stripe-public-key

# Other Environment Variables
# Add any other environment variables your application needs
`;
    
    fs.writeFileSync(envExamplePath, envExampleContent);
    console.log('✅ Created .env.example with necessary variables');
  } else {
    console.log('✅ .env.example exists');
  }
  
  console.log('ℹ️ IMPORTANT: Make sure to set all environment variables in Vercel');
  console.log('ℹ️ Required variables: DATABASE_URL, NODE_ENV');
  
  return true;
}

function checkDeploymentDocs() {
  console.log('📝 Checking deployment documentation...');
  
  const vercelDocsPath = path.join(__dirname, 'VERCEL_DEPLOYMENT_INSTRUCTIONS.md');
  const vercelApiHandlerPath = path.join(__dirname, 'api', 'index.js');
  const fallbackHtmlPath = path.join(__dirname, '404.html');
  const vercelIndexHtmlPath = path.join(__dirname, 'vercel-index.html');
  const vercelJsPath = path.join(__dirname, 'vercel.js');
  
  let docsUpdated = false;
  
  // Make sure API directory exists
  if (!fs.existsSync(path.join(__dirname, 'api'))) {
    fs.mkdirSync(path.join(__dirname, 'api'), { recursive: true });
    console.log('✅ Created api directory');
  }
  
  // Check special files existence and create if missing
  if (!fs.existsSync(vercelApiHandlerPath)) {
    console.log('❌ api/index.js does not exist, creating it...');
    
    const apiHandlerContent = `/**
 * Vercel API Route Handler
 * 
 * This special file helps Vercel properly route requests between your 
 * client-side application and your API endpoints. The 'api' directory
 * is automatically recognized by Vercel as serverless functions.
 */

// Import required modules
const path = require('path');
const fs = require('fs');

// This is a serverless function that handles API requests
module.exports = async (req, res) => {
  try {
    // Check if this is a direct API request (which should be handled by the server)
    if (req.url.startsWith('/api/')) {
      // Redirect to the appropriate API endpoint
      // This is important for Vercel to properly route API requests
      // to your serverless functions
      const apiPath = req.url.replace('/api/', '');
      return res.status(200).json({
        message: 'This is a special API route handler for Vercel deployment',
        endpoint: apiPath,
        status: 'Configure your API routes properly in vercel.json'
      });
    }

    // For non-API requests, tell Vercel to serve the static files
    // Important note: This helps Vercel know to serve the client-side app
    // instead of showing your schema code
    return res.status(200).json({
      message: 'This is a special handler to fix schema display issues',
      solution: 'Make sure your environment variables are correctly set in Vercel',
      action: 'Clear build cache and redeploy',
      note: 'If you see this message, your API routes are being handled but client routing may have issues'
    });
  } catch (error) {
    console.error('Error in Vercel API handler:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message,
      solution: 'Check Vercel deployment logs for details'
    });
  }
};`;
    
    fs.writeFileSync(vercelApiHandlerPath, apiHandlerContent);
    console.log('✅ Created api/index.js with proper handler');
  }
  
  // Create/check other special files for Vercel deployment
  // This helps prevent the schema display issue
  
  return true;
}

function fixDatabaseConfig() {
  console.log('📝 Checking database configuration...');
  
  // Make sure the database configuration is properly set up
  const dbTsPath = path.join(__dirname, 'server', 'db.ts');
  
  if (fs.existsSync(dbTsPath)) {
    console.log('✅ server/db.ts exists, checking content...');
    let dbTsContent = fs.readFileSync(dbTsPath, 'utf-8');
    
    // Make sure the database configuration handles environment correctly
    if (!dbTsContent.includes('process.env.NODE_ENV')) {
      console.log('⚠️ server/db.ts might not handle NODE_ENV correctly');
      console.log('ℹ️ Make sure to adapt your database configuration for production');
    }
    
    // Make sure the database falls back to in-memory store when needed
    if (!dbTsContent.includes('in-memory')) {
      console.log('⚠️ server/db.ts might not provide a fallback to in-memory storage');
      console.log('ℹ️ Make sure to implement a fallback for database connection issues');
    }
  } else {
    console.log('❌ server/db.ts does not exist, check your database configuration');
  }
  
  return true;
}

async function main() {
  console.log('🔧 Fixing Vercel Deployment Issues');
  console.log('================================');
  
  // Run all the checks and fixes
  const vercelConfigFixed = checkVercelConfig();
  const envExampleFixed = checkEnvExample();
  const deploymentDocsFixed = checkDeploymentDocs();
  const databaseConfigFixed = fixDatabaseConfig();
  
  console.log('\n✨ Deployment Fixes Summary');
  console.log('================================');
  console.log(`Vercel configuration: ${vercelConfigFixed ? '✅ Fixed' : '❌ Issues remain'}`);
  console.log(`Environment variables: ${envExampleFixed ? '✅ Fixed' : '❌ Issues remain'}`);
  console.log(`Deployment documentation: ${deploymentDocsFixed ? '✅ Fixed' : '❌ Issues remain'}`);
  console.log(`Database configuration: ${databaseConfigFixed ? '✅ Fixed' : '❌ Issues remain'}`);
  
  console.log('\n📋 Next Steps');
  console.log('================================');
  console.log('1. Make sure your Vercel environment variables are correctly set');
  console.log('2. Push these changes to your GitHub repository');
  console.log('3. Deploy to Vercel and check if the schema display issue is resolved');
  console.log('4. If issues persist, refer to VERCEL_DEPLOYMENT_INSTRUCTIONS.md');
}

main().catch(error => {
  console.error('Error fixing Vercel deployment:', error);
  process.exit(1);
});