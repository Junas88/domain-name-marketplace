/**
 * Vercel Deployment Helper for Domain Name Guide
 * 
 * This script helps prepare the application for deployment to Vercel,
 * ensuring database compatibility with Supabase and proper environment
 * variables.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// Print banner
console.log(`${colors.bright}${colors.cyan}
==========================================================
    Domain Name Guide - Vercel Deployment Assistant
==========================================================
${colors.reset}`);

// Check if required environment variables are set
function checkEnvironmentVariables() {
  console.log(`${colors.bright}Checking environment variables...${colors.reset}`);
  
  const requiredVars = ['DATABASE_URL', 'SESSION_SECRET'];
  const missingVars = [];
  
  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      missingVars.push(varName);
    }
  }
  
  if (missingVars.length > 0) {
    console.error(`${colors.red}❌ Missing required environment variables: ${missingVars.join(', ')}${colors.reset}`);
    console.log(`Please create a .env file with these variables or set them in your environment.`);
    process.exit(1);
  }
  
  console.log(`${colors.green}✓ All required environment variables are set${colors.reset}`);
  
  // Check for Supabase URL
  if (process.env.DATABASE_URL.includes('supabase.co')) {
    console.log(`${colors.green}✓ Detected Supabase database connection${colors.reset}`);
  }
}

// Make sure vercel.json exists and is properly configured
function checkVercelConfig() {
  console.log(`${colors.bright}Checking Vercel configuration...${colors.reset}`);
  
  const vercelConfigPath = path.join(process.cwd(), 'vercel.json');
  
  if (!fs.existsSync(vercelConfigPath)) {
    console.error(`${colors.red}❌ vercel.json not found${colors.reset}`);
    console.log(`Please create a vercel.json file in the project root.`);
    process.exit(1);
  }
  
  try {
    const vercelConfig = JSON.parse(fs.readFileSync(vercelConfigPath, 'utf8'));
    
    // Check for required configuration
    if (!vercelConfig.buildCommand) {
      console.error(`${colors.yellow}⚠️ Missing buildCommand in vercel.json${colors.reset}`);
    }
    
    if (!vercelConfig.outputDirectory) {
      console.error(`${colors.yellow}⚠️ Missing outputDirectory in vercel.json${colors.reset}`);
    }
    
    console.log(`${colors.green}✓ vercel.json configuration looks good${colors.reset}`);
  } catch (error) {
    console.error(`${colors.red}❌ Error parsing vercel.json: ${error.message}${colors.reset}`);
    process.exit(1);
  }
}

// Test database connection
async function testDatabaseConnection() {
  console.log(`${colors.bright}Testing database connection...${colors.reset}`);
  
  try {
    const { Pool } = require('@neondatabase/serverless');
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    });
    
    const result = await pool.query('SELECT current_timestamp as time');
    console.log(`${colors.green}✓ Database connection successful${colors.reset}`);
    console.log(`  Database time: ${result.rows[0].time}`);
    
    await pool.end();
  } catch (error) {
    console.error(`${colors.red}❌ Database connection failed: ${error.message}${colors.reset}`);
    console.log(`Please check your DATABASE_URL environment variable.`);
    process.exit(1);
  }
}

// Make sure git is configured and changes are committed
function checkGitStatus() {
  console.log(`${colors.bright}Checking Git status...${colors.reset}`);
  
  try {
    // Check if git is initialized
    execSync('git rev-parse --is-inside-work-tree', { stdio: 'ignore' });
    
    // Check for uncommitted changes
    const status = execSync('git status --porcelain').toString().trim();
    
    if (status) {
      console.error(`${colors.yellow}⚠️ You have uncommitted changes:${colors.reset}`);
      console.log(status);
      console.log(`Please commit your changes before deploying.`);
      process.exit(1);
    }
    
    console.log(`${colors.green}✓ Git repository is clean${colors.reset}`);
    
    // Get remote info
    try {
      const remotes = execSync('git remote -v').toString().trim();
      if (remotes.includes('github.com')) {
        console.log(`${colors.green}✓ GitHub remote is configured${colors.reset}`);
      }
    } catch (error) {
      console.error(`${colors.yellow}⚠️ Could not detect GitHub remote${colors.reset}`);
      console.log(`Make sure your repository is pushed to GitHub for Vercel deployment.`);
    }
  } catch (error) {
    console.error(`${colors.yellow}⚠️ Git repository not initialized or git not installed${colors.reset}`);
    console.log(`Vercel deployments work best with Git-based workflows.`);
  }
}

// Run a build test to make sure everything compiles
function testBuild() {
  console.log(`${colors.bright}Testing build process...${colors.reset}`);
  
  try {
    execSync('npm run build', { stdio: 'inherit' });
    console.log(`${colors.green}✓ Build successful${colors.reset}`);
  } catch (error) {
    console.error(`${colors.red}❌ Build failed${colors.reset}`);
    console.log(`Please fix build errors before deploying to Vercel.`);
    process.exit(1);
  }
}

// Print deployment instructions
function printDeploymentInstructions() {
  console.log(`${colors.bright}${colors.cyan}
==========================================================
    Deployment Instructions
==========================================================
${colors.reset}`);

  console.log(`${colors.bright}1. Push your repository to GitHub${colors.reset}`);
  console.log(`   git push origin main`);
  
  console.log(`\n${colors.bright}2. Go to Vercel Dashboard${colors.reset}`);
  console.log(`   https://vercel.com/dashboard`);
  
  console.log(`\n${colors.bright}3. Import your GitHub repository${colors.reset}`);
  console.log(`   - Click "Import Project" or "New Project"`);
  console.log(`   - Select your GitHub repository`);
  
  console.log(`\n${colors.bright}4. Configure project settings${colors.reset}`);
  console.log(`   - Framework Preset: Vite`);
  console.log(`   - Build Command: npm run build`);
  console.log(`   - Output Directory: dist`);
  
  console.log(`\n${colors.bright}5. Add environment variables${colors.reset}`);
  console.log(`   - DATABASE_URL: ${process.env.DATABASE_URL ? '(using value from .env)' : 'Your Supabase connection string'}`);
  console.log(`   - SESSION_SECRET: ${process.env.SESSION_SECRET ? '(using value from .env)' : 'A secure random string'}`);
  console.log(`   - NODE_ENV: production`);
  
  console.log(`\n${colors.bright}6. Deploy${colors.reset}`);
  console.log(`   Click "Deploy" and wait for the build to complete`);
  
  console.log(`\n${colors.bright}${colors.green}✓ Your application is ready for deployment!${colors.reset}`);
}

// Main function
async function main() {
  try {
    // If dotenv is installed, load .env file
    try {
      require('dotenv').config();
    } catch (e) {
      console.log(`${colors.yellow}⚠️ dotenv package not found, skipping .env file loading${colors.reset}`);
    }
    
    // Run checks
    checkEnvironmentVariables();
    checkVercelConfig();
    await testDatabaseConnection();
    checkGitStatus();
    testBuild();
    
    // Print instructions
    printDeploymentInstructions();
  } catch (error) {
    console.error(`${colors.red}❌ An error occurred: ${error.message}${colors.reset}`);
    process.exit(1);
  }
}

// Run the script
main().catch(error => {
  console.error(`${colors.red}❌ Unhandled error: ${error.message}${colors.reset}`);
  process.exit(1);
});