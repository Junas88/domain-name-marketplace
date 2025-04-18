/**
 * GitHub Repository Setup Script for Domain Name Guide
 * 
 * This script automates the process of creating/updating a GitHub repository
 * and pushing the current project to it for Vercel deployment.
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { fileURLToPath } from 'url';

// ES module compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Check if GitHub CLI is available
let useGitHubCLI = false;
try {
  execSync('gh --version', { stdio: 'ignore' });
  useGitHubCLI = true;
  console.log('GitHub CLI detected, will use it for authentication.');
} catch (error) {
  console.log('GitHub CLI not detected, will use GITHUB_TOKEN for authentication.');
}

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
      GitHub Repository Setup for Domain Name Guide
==========================================================
${colors.reset}`);

// Check if git is installed
try {
  execSync('git --version', { stdio: 'ignore' });
} catch (error) {
  console.error(`${colors.red}Git is not installed or not in PATH. Please install Git first.${colors.reset}`);
  process.exit(1);
}

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Ask user for repository information
async function promptUser() {
  return new Promise((resolve) => {
    // Use existing GitHub token or ask for it
    const githubToken = process.env.GITHUB_TOKEN || null;
    
    let repoName = 'domain-name-guide';
    let repoDescription = 'A comprehensive domain marketplace platform with AI-powered recommendations';
    let githubUsername = '';
    
    // If we have the GitHub token but not using GitHub CLI, let's try to get the username
    if (githubToken && !useGitHubCLI) {
      try {
        const userInfoCommand = `curl -s -H "Authorization: token ${githubToken}" https://api.github.com/user`;
        const userInfo = JSON.parse(execSync(userInfoCommand).toString());
        githubUsername = userInfo.login;
        console.log(`${colors.green}✓ Authenticated as GitHub user: ${githubUsername}${colors.reset}`);
      } catch (error) {
        console.warn(`${colors.yellow}Could not retrieve GitHub username automatically.${colors.reset}`);
      }
    }
    
    // If using GitHub CLI, check if already authenticated
    if (useGitHubCLI) {
      try {
        const userInfo = JSON.parse(execSync('gh api user').toString());
        githubUsername = userInfo.login;
        console.log(`${colors.green}✓ GitHub CLI authenticated as user: ${githubUsername}${colors.reset}`);
      } catch (error) {
        console.warn(`${colors.yellow}GitHub CLI is not authenticated. You'll need to login.${colors.reset}`);
        try {
          execSync('gh auth login', { stdio: 'inherit' });
          // Check again after login
          const userInfo = JSON.parse(execSync('gh api user').toString());
          githubUsername = userInfo.login;
          console.log(`${colors.green}✓ GitHub CLI authenticated as user: ${githubUsername}${colors.reset}`);
        } catch (loginError) {
          console.error(`${colors.red}Failed to authenticate with GitHub CLI:${colors.reset}`, loginError.message);
          process.exit(1);
        }
      }
    }
    
    // Series of prompts
    if (!githubUsername) {
      rl.question(`${colors.bright}Enter your GitHub username: ${colors.reset}`, (answer) => {
        githubUsername = answer.trim();
        promptRepoName();
      });
    } else {
      promptRepoName();
    }
    
    function promptRepoName() {
      rl.question(`${colors.bright}Enter repository name [${repoName}]: ${colors.reset}`, (answer) => {
        if (answer.trim()) {
          repoName = answer.trim();
        }
        promptRepoDescription();
      });
    }
    
    function promptRepoDescription() {
      rl.question(`${colors.bright}Enter repository description [${repoDescription}]: ${colors.reset}`, (answer) => {
        if (answer.trim()) {
          repoDescription = answer.trim();
        }
        confirmAndResolve();
      });
    }
    
    function confirmAndResolve() {
      rl.question(`
${colors.bright}Repository Information:${colors.reset}
- GitHub Username: ${githubUsername}
- Repository Name: ${repoName}
- Description: ${repoDescription}

${colors.bright}Proceed with this configuration? (yes/no) ${colors.reset}`, (answer) => {
        if (answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y') {
          rl.close();
          resolve({
            githubUsername,
            repoName,
            repoDescription,
            githubToken
          });
        } else {
          console.log(`${colors.yellow}Operation canceled by user.${colors.reset}`);
          rl.close();
          process.exit(0);
        }
      });
    }
  });
}

// Function to check if the current directory is a git repository
function isGitRepository() {
  try {
    execSync('git rev-parse --is-inside-work-tree', { stdio: 'ignore' });
    return true;
  } catch (error) {
    return false;
  }
}

// Initialize git repository if needed
function initializeGit() {
  if (!isGitRepository()) {
    console.log(`${colors.blue}Initializing git repository...${colors.reset}`);
    execSync('git init', { stdio: 'inherit' });
    
    // Check if .gitignore exists, create it if not
    if (!fs.existsSync('.gitignore')) {
      fs.writeFileSync('.gitignore', `
# Dependencies
/node_modules
/.pnp
.pnp.js

# Testing
/coverage

# Production
/dist
/build

# Environment Files
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Editor directories and files
.idea
.vscode
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db
`);
      console.log(`${colors.green}✓ Created .gitignore file${colors.reset}`);
    }
    
    // Create initial commit
    execSync('git add .', { stdio: 'inherit' });
    execSync('git commit -m "Initial commit"', { stdio: 'inherit' });
    console.log(`${colors.green}✓ Created initial commit${colors.reset}`);
  } else {
    // Check for changes
    const status = execSync('git status --porcelain').toString();
    if (status) {
      console.log(`${colors.yellow}Uncommitted changes detected. Committing changes...${colors.reset}`);
      execSync('git add .', { stdio: 'inherit' });
      execSync('git commit -m "Update project for Vercel deployment"', { stdio: 'inherit' });
      console.log(`${colors.green}✓ Changes committed${colors.reset}`);
    } else {
      console.log(`${colors.green}✓ Git repository is clean${colors.reset}`);
    }
  }
}

// Create or update GitHub repository and push
async function setupGitHubRepository(config) {
  const { githubUsername, repoName, repoDescription, githubToken } = config;
  const repoUrl = `https://github.com/${githubUsername}/${repoName}.git`;
  
  console.log(`${colors.blue}Setting up GitHub repository...${colors.reset}`);
  
  try {
    // Check if repository exists by trying to get it
    let repoExists = false;
    
    if (useGitHubCLI) {
      try {
        execSync(`gh repo view ${githubUsername}/${repoName}`, { stdio: 'ignore' });
        repoExists = true;
      } catch (error) {
        // Repository doesn't exist
      }
    } else {
      try {
        execSync(`curl -s -I -H "Authorization: token ${githubToken}" https://api.github.com/repos/${githubUsername}/${repoName}`).toString();
        // If we reach here, repo exists
        repoExists = true;
      } catch (error) {
        // Repository doesn't exist
      }
    }
    
    if (!repoExists) {
      console.log(`${colors.blue}Creating new GitHub repository: ${repoName}...${colors.reset}`);
      
      if (useGitHubCLI) {
        execSync(`gh repo create ${repoName} --description "${repoDescription}" --public`, { stdio: 'inherit' });
      } else {
        // Create repo using GitHub API
        const createRepoCommand = `curl -s -X POST -H "Authorization: token ${githubToken}" -H "Accept: application/vnd.github.v3+json" https://api.github.com/user/repos -d '{"name":"${repoName}","description":"${repoDescription}","private":false}'`;
        execSync(createRepoCommand);
      }
      
      console.log(`${colors.green}✓ Repository created: ${repoUrl}${colors.reset}`);
    } else {
      console.log(`${colors.green}✓ Repository already exists: ${repoUrl}${colors.reset}`);
    }
    
    // Set up remote
    try {
      // Check if remote exists
      execSync('git remote get-url origin', { stdio: 'ignore' });
      // If we get here, remote exists, update it
      execSync(`git remote set-url origin ${repoUrl}`, { stdio: 'ignore' });
      console.log(`${colors.green}✓ Updated git remote to: ${repoUrl}${colors.reset}`);
    } catch (error) {
      // Remote doesn't exist, add it
      execSync(`git remote add origin ${repoUrl}`, { stdio: 'ignore' });
      console.log(`${colors.green}✓ Added git remote: ${repoUrl}${colors.reset}`);
    }
    
    // Push to GitHub
    console.log(`${colors.blue}Pushing to GitHub repository...${colors.reset}`);
    execSync('git push -u origin main || git push -u origin master', { stdio: 'inherit' });
    console.log(`${colors.green}✓ Successfully pushed to GitHub${colors.reset}`);
    
    return { success: true, repoUrl };
  } catch (error) {
    console.error(`${colors.red}Error setting up GitHub repository:${colors.reset}`, error.message);
    return { success: false, error: error.message };
  }
}

// Function to display Vercel deployment instructions
function displayVercelInstructions(repoUrl) {
  console.log(`
${colors.bright}${colors.cyan}==========================================================
      Vercel Deployment Instructions
==========================================================
${colors.reset}

${colors.bright}Your repository has been successfully pushed to:${colors.reset}
${repoUrl}

${colors.bright}Follow these steps to deploy to Vercel:${colors.reset}

1. Go to Vercel: ${colors.blue}https://vercel.com/dashboard${colors.reset}

2. Click "Add New" > "Project"

3. Import your GitHub repository: ${colors.green}${repoUrl.replace('.git', '')}${colors.reset}

4. Configure the project:
   - Framework Preset: ${colors.bright}Vite${colors.reset}
   - Build Command: ${colors.bright}npm run build${colors.reset}
   - Output Directory: ${colors.bright}dist${colors.reset}

5. Add Environment Variables:
   - ${colors.bright}DATABASE_URL${colors.reset}: Your Supabase connection string
   - ${colors.bright}SESSION_SECRET${colors.reset}: A secure random string
   - ${colors.bright}NODE_ENV${colors.reset}: production

6. Click "Deploy"

${colors.yellow}⚠️ Important: Make sure your Supabase database is properly set up with the required tables.${colors.reset}
`);
}

// Main function
async function main() {
  try {
    // Get user input
    const config = await promptUser();
    
    // Initialize git if needed
    initializeGit();
    
    // Setup GitHub repository
    const result = await setupGitHubRepository(config);
    
    if (result.success) {
      displayVercelInstructions(result.repoUrl);
    }
  } catch (error) {
    console.error(`${colors.red}An error occurred:${colors.reset}`, error.message);
    process.exit(1);
  }
}

// Run the script
main().catch(error => {
  console.error(`${colors.red}Unhandled error:${colors.reset}`, error.message);
  process.exit(1);
});