#!/usr/bin/env node

/**
 * Domain Name Guide - GitHub Repository Setup
 * 
 * This script automates pushing your project to GitHub for Vercel deployment.
 * It uses the GitHub personal access token from your environment variables.
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createInterface } from 'readline';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
   Domain Name Guide - GitHub Repository Setup
=====================================================
${colors.reset}`);

// Check for GitHub token
const githubToken = process.env.GITHUB_TOKEN;
if (!githubToken) {
  console.error(`${colors.red}Error: GITHUB_TOKEN environment variable is not set.${colors.reset}`);
  console.log("Please set your GitHub personal access token.");
  process.exit(1);
}

// Create a readline interface
const rl = createInterface({
  input: process.stdin,
  output: process.stdout
});

// Prompt user for GitHub info
async function getGitHubInfo() {
  return new Promise((resolve) => {
    // Try to get GitHub username from token
    let githubUsername = '';
    try {
      const userInfo = JSON.parse(
        execSync(`curl -s -H "Authorization: token ${githubToken}" https://api.github.com/user`).toString()
      );
      githubUsername = userInfo.login;
      console.log(`${colors.green}✓ Authenticated as GitHub user: ${githubUsername}${colors.reset}`);
    } catch (error) {
      console.warn(`${colors.yellow}Could not retrieve GitHub username automatically.${colors.reset}`);
    }

    let repoInfo = {
      username: githubUsername,
      repoName: 'domain-name-guide',
      repoDescription: 'A comprehensive domain marketplace platform'
    };

    function promptUsername() {
      if (repoInfo.username) {
        promptRepoName();
        return;
      }

      rl.question(`${colors.bold}Enter your GitHub username: ${colors.reset}`, (answer) => {
        if (!answer.trim()) {
          console.log(`${colors.yellow}Username cannot be empty. Please try again.${colors.reset}`);
          promptUsername();
          return;
        }
        repoInfo.username = answer.trim();
        promptRepoName();
      });
    }

    function promptRepoName() {
      rl.question(`${colors.bold}Enter repository name [${repoInfo.repoName}]: ${colors.reset}`, (answer) => {
        if (answer.trim()) {
          repoInfo.repoName = answer.trim();
        }
        promptDescription();
      });
    }

    function promptDescription() {
      rl.question(`${colors.bold}Enter repository description [${repoInfo.repoDescription}]: ${colors.reset}`, (answer) => {
        if (answer.trim()) {
          repoInfo.repoDescription = answer.trim();
        }
        confirmSettings();
      });
    }

    function confirmSettings() {
      console.log(`
${colors.bold}Repository Settings:${colors.reset}
- Username: ${repoInfo.username}
- Repository Name: ${repoInfo.repoName}
- Description: ${repoInfo.repoDescription}
`);

      rl.question(`${colors.bold}Proceed with these settings? (y/n) ${colors.reset}`, (answer) => {
        if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
          rl.close();
          resolve(repoInfo);
        } else {
          console.log(`${colors.yellow}Operation cancelled. Starting over...${colors.reset}`);
          promptUsername();
        }
      });
    }

    promptUsername();
  });
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
async function setupGitHubRepo(repoInfo) {
  const { username, repoName, repoDescription } = repoInfo;
  const repoUrl = `https://github.com/${username}/${repoName}.git`;
  
  console.log(`${colors.blue}Setting up GitHub repository...${colors.reset}`);
  
  // Check if repository exists
  try {
    execSync(`curl -s -I -H "Authorization: token ${githubToken}" https://api.github.com/repos/${username}/${repoName}`, { stdio: 'ignore' });
    console.log(`${colors.green}✓ Repository already exists: ${repoUrl}${colors.reset}`);
  } catch (error) {
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
    const remotes = execSync('git remote').toString().trim().split('\n');
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
  
  // Push to GitHub
  console.log(`${colors.blue}Pushing to GitHub...${colors.reset}`);
  try {
    execSync('git push -u origin main || git push -u origin master', { stdio: 'inherit' });
    console.log(`${colors.green}✓ Successfully pushed to GitHub${colors.reset}`);
    return true;
  } catch (error) {
    console.error(`${colors.red}Failed to push to GitHub: ${error.message}${colors.reset}`);
    console.log(`${colors.yellow}Try pushing manually with: git push -u origin main${colors.reset}`);
    return false;
  }
}

// Show Vercel deployment instructions
function showVercelInstructions(repoInfo) {
  const { username, repoName } = repoInfo;
  const repoUrl = `https://github.com/${username}/${repoName}`;
  
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
    // Get GitHub info from user
    const repoInfo = await getGitHubInfo();
    
    // Initialize git repository
    initGit();
    
    // Setup GitHub repository
    const success = await setupGitHubRepo(repoInfo);
    
    // Show Vercel deployment instructions
    if (success) {
      showVercelInstructions(repoInfo);
    }
  } catch (error) {
    console.error(`${colors.red}Error: ${error.message}${colors.reset}`);
    process.exit(1);
  }
}

// Run the script
main();