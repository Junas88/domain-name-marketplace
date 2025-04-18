import { execSync } from 'child_process';

// Check for GitHub token
const githubToken = process.env.GITHUB_TOKEN;
if (!githubToken) {
  console.error('Error: GITHUB_TOKEN environment variable is not set.');
  process.exit(1);
}

try {
  // Configure Git
  execSync('git config user.email "github@example.com"');
  execSync('git config user.name "GitHub Push User"');
  
  // Check for changes and commit if needed
  const status = execSync('git status --porcelain').toString().trim();
  if (status) {
    console.log('Changes detected, staging and committing...');
    execSync('git add .');
    execSync('git commit -m "Add Vercel deployment fixes"');
    console.log('Changes committed successfully.');
  } else {
    console.log('No changes to commit.');
  }
  
  // Set the remote with token
  console.log('Configuring GitHub remote with token...');
  const remoteUrl = `https://${githubToken}@github.com/Junas88/domain-name-marketplace.git`;
  
  try {
    // Check if remote exists
    execSync('git remote get-url origin');
    execSync(`git remote set-url origin ${remoteUrl}`);
    console.log('Remote URL updated.');
  } catch (e) {
    execSync(`git remote add origin ${remoteUrl}`);
    console.log('Remote URL added.');
  }
  
  // Push changes
  console.log('Pushing to GitHub...');
  execSync('git push -u origin main');
  console.log('Successfully pushed to GitHub!');
  
} catch (error) {
  console.error('Error:', error.message);
  process.exit(1);
}