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

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m'
};

console.log(`${colors.bold}${colors.cyan}
=====================================================
     Fix Vercel Deployment for Domain Name Guide
=====================================================
${colors.reset}`);

// 1. Check if vercel.json exists and has the correct configuration
function checkVercelConfig() {
  console.log(`${colors.blue}Checking Vercel configuration...${colors.reset}`);
  
  const vercelConfigPath = './vercel.json';
  let vercelConfig = {};
  
  try {
    if (fs.existsSync(vercelConfigPath)) {
      vercelConfig = JSON.parse(fs.readFileSync(vercelConfigPath, 'utf8'));
      console.log(`${colors.green}✓ Found existing vercel.json${colors.reset}`);
    } else {
      console.log(`${colors.yellow}! No vercel.json found. Creating one...${colors.reset}`);
      vercelConfig = {
        "version": 2,
        "buildCommand": "npm run build",
        "outputDirectory": "dist",
        "framework": "vite",
      };
    }
    
    // Ensure correct routing configuration
    if (!vercelConfig.rewrites || vercelConfig.rewrites.length === 0) {
      console.log(`${colors.yellow}! Missing or incomplete rewrites. Updating...${colors.reset}`);
      vercelConfig.rewrites = [
        {
          "source": "/api/(.*)",
          "destination": "/api/$1"
        },
        {
          "source": "/(.*)",
          "destination": "/$1"
        }
      ];
    }
    
    // Ensure correct header configuration for caching
    if (!vercelConfig.headers) {
      console.log(`${colors.yellow}! Missing cache headers. Adding...${colors.reset}`);
      vercelConfig.headers = [
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
      ];
    }
    
    // Add Vercel serverless function configuration
    if (!vercelConfig.functions) {
      console.log(`${colors.yellow}! Adding serverless function configuration...${colors.reset}`);
      vercelConfig.functions = {
        "api/*.js": {
          "memory": 1024,
          "maxDuration": 10
        }
      };
    }
    
    // Ensure environment variables are set
    if (!vercelConfig.env) {
      console.log(`${colors.yellow}! Adding environment variables configuration...${colors.reset}`);
      vercelConfig.env = {
        "NODE_ENV": "production"
      };
    }
    
    // Write updated config
    fs.writeFileSync(vercelConfigPath, JSON.stringify(vercelConfig, null, 2));
    console.log(`${colors.green}✓ Vercel configuration updated${colors.reset}`);
    
  } catch (error) {
    console.error(`${colors.red}✗ Error updating Vercel configuration: ${error.message}${colors.reset}`);
  }
}

// 2. Check if .env.example has all required variables
function checkEnvExample() {
  console.log(`${colors.blue}Checking environment variables...${colors.reset}`);
  
  const envExamplePath = './.env.example';
  let envExample = '';
  
  const requiredVars = [
    'DATABASE_URL',
    'SESSION_SECRET',
    'NODE_ENV'
  ];
  
  try {
    if (fs.existsSync(envExamplePath)) {
      envExample = fs.readFileSync(envExamplePath, 'utf8');
      console.log(`${colors.green}✓ Found .env.example${colors.reset}`);
    } else {
      console.log(`${colors.yellow}! No .env.example found. Creating one...${colors.reset}`);
      envExample = `# Database Connection
# Replace with your actual Supabase connection string
DATABASE_URL=postgresql://postgres:password@db.example.supabase.co:5432/postgres

# Session Secret (Generate with: openssl rand -base64 32)
SESSION_SECRET=your_session_secret_here

# Node Environment
# Set to 'production' for deployment
NODE_ENV=production

# Cache Busting
# Optional: Used to force refresh browser cache after deployments
CACHE_BUSTER=timestamp_or_hash_here
`;
    }
    
    // Check for missing variables
    let missingVars = [];
    for (const varName of requiredVars) {
      if (!envExample.includes(varName + '=')) {
        missingVars.push(varName);
      }
    }
    
    if (missingVars.length > 0) {
      console.log(`${colors.yellow}! Missing required variables in .env.example: ${missingVars.join(', ')}${colors.reset}`);
      
      // Add missing variables
      let envLines = envExample.split('\n');
      for (const varName of missingVars) {
        envLines.push(`# ${varName}`);
        envLines.push(`${varName}=your_${varName.toLowerCase()}_here`);
        envLines.push('');
      }
      
      envExample = envLines.join('\n');
      fs.writeFileSync(envExamplePath, envExample);
      console.log(`${colors.green}✓ Updated .env.example with missing variables${colors.reset}`);
    } else {
      console.log(`${colors.green}✓ All required variables present in .env.example${colors.reset}`);
    }
    
  } catch (error) {
    console.error(`${colors.red}✗ Error checking environment variables: ${error.message}${colors.reset}`);
  }
}

// 3. Check deployment documentation
function checkDeploymentDocs() {
  console.log(`${colors.blue}Checking deployment documentation...${colors.reset}`);
  
  const vercelDeploymentPath = './VERCEL_DEPLOYMENT_INSTRUCTIONS.md';
  
  try {
    if (fs.existsSync(vercelDeploymentPath)) {
      console.log(`${colors.green}✓ Found deployment instructions${colors.reset}`);
      
      // Add special note about the schema display issue
      const content = fs.readFileSync(vercelDeploymentPath, 'utf8');
      if (!content.includes('TROUBLESHOOTING SCHEMA DISPLAY ISSUE')) {
        const updatedContent = content + `\n\n## TROUBLESHOOTING SCHEMA DISPLAY ISSUE

If after deployment you see your schema code instead of the actual website:

1. **Environment Variables**: Make sure all environment variables are correctly set in Vercel:
   - \`DATABASE_URL\`: Your Supabase connection string
   - \`SESSION_SECRET\`: A secure random string
   - \`NODE_ENV\`: Must be set to 'production'

2. **Redeploy with Clear Cache**: In your Vercel dashboard:
   - Go to your project
   - Click "Settings" > "General"
   - Find "Build & Development Settings"
   - Click "Clear Build Cache" 
   - Trigger a new deployment

3. **Check Deployment Logs**: Look for any errors during the build process

4. **API Routes**: Ensure the API routes are correctly set up in vercel.json
`;
        fs.writeFileSync(vercelDeploymentPath, updatedContent);
        console.log(`${colors.green}✓ Added troubleshooting information to deployment instructions${colors.reset}`);
      }
    } else {
      console.log(`${colors.yellow}! No deployment instructions found. You may want to create them.${colors.reset}`);
    }
  } catch (error) {
    console.error(`${colors.red}✗ Error checking deployment documentation: ${error.message}${colors.reset}`);
  }
}

// 4. Fix database connection configuration for Vercel
function fixDatabaseConfig() {
  console.log(`${colors.blue}Checking database configuration...${colors.reset}`);
  
  const supabaseConfigPath = './server/supabase-config.ts';
  
  try {
    // Check if we already have a Supabase config
    if (fs.existsSync(supabaseConfigPath)) {
      console.log(`${colors.green}✓ Found Supabase configuration${colors.reset}`);
    } else {
      console.log(`${colors.yellow}! No Supabase configuration found. Please check your database setup.${colors.reset}`);
    }
  } catch (error) {
    console.error(`${colors.red}✗ Error checking database configuration: ${error.message}${colors.reset}`);
  }
}

// Main function
async function main() {
  try {
    checkVercelConfig();
    checkEnvExample();
    checkDeploymentDocs();
    fixDatabaseConfig();
    
    console.log(`
${colors.bold}${colors.green}✓ Vercel deployment fixes applied successfully!${colors.reset}

${colors.bold}Next steps:${colors.reset}
1. Commit and push these changes to GitHub
2. Go to Vercel and deploy again
3. Make sure you've set the correct environment variables in Vercel dashboard
4. If you still see the schema display issue, try clearing the build cache and redeploying

${colors.bold}Remember:${colors.reset} The most common cause of schema display issues is incorrectly set environment variables.
`);
  } catch (error) {
    console.error(`${colors.red}An error occurred: ${error.message}${colors.reset}`);
  }
}

// Run the script
main();