/**
 * Automatic GitHub Push Script for Domain Name Guide
 * 
 * This script automatically pushes your project to GitHub without requiring
 * interactive input, making it ideal for automated deployment processes.
 */

import { execSync } from 'child_process';
import fs from 'fs';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m'
};

// Print banner
console.log(`${colors.bold}${colors.cyan}
=====================================================
   Domain Name Guide - Automatic GitHub Push
=====================================================
${colors.reset}`);

// Check for GitHub token
const githubToken = process.env.GITHUB_TOKEN;
if (!githubToken) {
  console.error(`${colors.red}Error: GITHUB_TOKEN environment variable is not set.${colors.reset}`);
  process.exit(1);
}

// Configuration (change these values if needed)
const config = {
  repoName: 'domain-name-guide',
  repoDescription: 'A comprehensive domain marketplace platform with AI-powered recommendations',
  branch: 'main'
};

// Get GitHub username from token
async function getGitHubUsername() {
  try {
    const userInfo = JSON.parse(
      execSync(`curl -s -H "Authorization: token ${githubToken}" https://api.github.com/user`).toString()
    );
    console.log(`${colors.green}✓ Authenticated as GitHub user: ${userInfo.login}${colors.reset}`);
    return userInfo.login;
  } catch (error) {
    console.error(`${colors.red}Failed to get GitHub username: ${error.message}${colors.reset}`);
    process.exit(1);
  }
}

// Initialize git repo if needed
function initGit() {
  console.log(`${colors.blue}Checking Git repository...${colors.reset}`);
  
  try {
    execSync('git rev-parse --is-inside-work-tree', { stdio: 'ignore' });
    console.log(`${colors.green}✓ Git repository already initialized${colors.reset}`);
    
    // Check for uncommitted changes
    const status = execSync('git status --porcelain').toString().trim();
    if (status) {
      console.log(`${colors.yellow}Uncommitted changes detected, committing them...${colors.reset}`);
      execSync('git add .', { stdio: 'inherit' });
      execSync('git commit -m "Prepare for Vercel deployment"', { stdio: 'inherit' });
      console.log(`${colors.green}✓ Changes committed${colors.reset}`);
    }
  } catch (error) {
    console.log(`${colors.blue}Initializing new Git repository...${colors.reset}`);
    
    // Create .gitignore if it doesn't exist
    if (!fs.existsSync('.gitignore')) {
      console.log(`${colors.blue}Creating .gitignore file...${colors.reset}`);
      fs.writeFileSync('.gitignore', `
# dependencies
/node_modules
/.pnp
.pnp.js

# testing
/coverage

# production
/dist
/build

# misc
.DS_Store
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*
`);
    }
    
    execSync('git init', { stdio: 'inherit' });
    execSync('git add .', { stdio: 'inherit' });
    execSync('git commit -m "Initial commit"', { stdio: 'inherit' });
    console.log(`${colors.green}✓ Git repository initialized with initial commit${colors.reset}`);
  }
}

// Create or update GitHub repository
async function setupGitHubRepo(username) {
  const { repoName, repoDescription } = config;
  const repoUrl = `https://github.com/${username}/${repoName}.git`;
  
  console.log(`${colors.blue}Setting up GitHub repository...${colors.reset}`);
  
  // Check if repository exists
  let repoExists = false;
  try {
    const statusCode = execSync(`curl -s -o /dev/null -w "%{http_code}" -H "Authorization: token ${githubToken}" https://api.github.com/repos/${username}/${repoName}`).toString().trim();
    repoExists = statusCode === '200';
  } catch (error) {
    // Ignore errors, assume repo doesn't exist
  }
  
  if (repoExists) {
    console.log(`${colors.green}✓ Repository already exists: ${repoUrl}${colors.reset}`);
  } else {
    // Create new repository
    console.log(`${colors.blue}Creating new repository: ${repoName}...${colors.reset}`);
    
    try {
      execSync(`curl -s -X POST -H "Authorization: token ${githubToken}" -H "Accept: application/vnd.github.v3+json" https://api.github.com/user/repos -d '{"name":"${repoName}","description":"${repoDescription}","private":false}'`);
      console.log(`${colors.green}✓ Repository created: ${repoUrl}${colors.reset}`);
    } catch (error) {
      console.error(`${colors.red}Failed to create repository: ${error.message}${colors.reset}`);
      process.exit(1);
    }
  }
  
  // Configure git remote
  try {
    const remotes = execSync('git remote').toString().trim().split('\n').filter(Boolean);
    if (remotes.includes('origin')) {
      console.log(`${colors.blue}Updating remote 'origin'...${colors.reset}`);
      execSync(`git remote set-url origin ${repoUrl}`);
    } else {
      console.log(`${colors.blue}Adding remote 'origin'...${colors.reset}`);
      execSync(`git remote add origin ${repoUrl}`);
    }
    console.log(`${colors.green}✓ Remote 'origin' configured: ${repoUrl}${colors.reset}`);
  } catch (error) {
    console.error(`${colors.red}Failed to configure git remote: ${error.message}${colors.reset}`);
    process.exit(1);
  }
  
  return repoUrl;
}

// Push to GitHub
async function pushToGitHub() {
  console.log(`${colors.blue}Pushing to GitHub...${colors.reset}`);
  
  try {
    // Try to push to 'main' branch first, then fall back to 'master' if needed
    try {
      execSync(`git push -u origin ${config.branch}`, { stdio: 'inherit' });
    } catch (mainError) {
      console.log(`${colors.yellow}Failed to push to '${config.branch}' branch, trying 'master'...${colors.reset}`);
      execSync('git push -u origin master', { stdio: 'inherit' });
      config.branch = 'master';
    }
    
    console.log(`${colors.green}✓ Successfully pushed to GitHub (${config.branch} branch)${colors.reset}`);
    return true;
  } catch (error) {
    console.error(`${colors.red}Failed to push to GitHub: ${error.message}${colors.reset}`);
    console.log(`
${colors.yellow}Troubleshooting:${colors.reset}
1. Make sure your GITHUB_TOKEN has 'repo' permissions
2. Try pushing manually: git push -u origin ${config.branch}
3. Verify network connectivity
`);
    return false;
  }
}

// Show Vercel deployment instructions
function showVercelInstructions(repoUrl) {  
  console.log(`
${colors.bold}${colors.cyan}=====================================================
   Vercel Deployment Instructions
=====================================================
${colors.reset}

${colors.green}Your repository is ready at:${colors.reset}
${repoUrl}

${colors.bold}To deploy to Vercel:${colors.reset}

1. Go to ${colors.blue}https://vercel.com/new${colors.reset}
2. Import your GitHub repository
3. Configure project settings:
   - Framework Preset: ${colors.bold}Vite${colors.reset}
   - Build Command: ${colors.bold}npm run build${colors.reset}
   - Output Directory: ${colors.bold}dist${colors.reset}
4. Add environment variables:
   - ${colors.bold}DATABASE_URL${colors.reset}: Your Supabase connection string
   - ${colors.bold}SESSION_SECRET${colors.reset}: A secure random string
   - ${colors.bold}NODE_ENV${colors.reset}: production
5. Click "Deploy"

${colors.yellow}Important: Make sure your Supabase database is set up with the required tables.${colors.reset}
`);
}

// Main function
async function main() {
  try {
    // Get GitHub username
    const username = await getGitHubUsername();
    
    // Initialize git repository
    initGit();
    
    // Setup GitHub repository
    const repoUrl = await setupGitHubRepo(username);
    
    // Push to GitHub
    const success = await pushToGitHub();
    
    // Show Vercel deployment instructions
    if (success) {
      showVercelInstructions(repoUrl);
    }
  } catch (error) {
    console.error(`${colors.red}Error: ${error.message}${colors.reset}`);
    process.exit(1);
  }
}

// Run the script
main();