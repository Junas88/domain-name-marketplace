/**
 * Deployment Environment Checker
 * 
 * This script checks if the environment is properly configured for deployment,
 * particularly focusing on the issues that cause schema code to be displayed
 * instead of the actual application on Vercel.
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');

function isEnvVarSet(varName) {
  return process.env[varName] !== undefined;
}

function loadEnvFile() {
  const envPath = path.join(__dirname, '.env');
  const envExamplePath = path.join(__dirname, '.env.example');
  
  let envContent = null;
  let exampleContent = null;
  
  try {
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
      console.log('✅ .env file exists');
    } else {
      console.log('❌ .env file does not exist');
    }
    
    if (fs.existsSync(envExamplePath)) {
      exampleContent = fs.readFileSync(envExamplePath, 'utf8');
      console.log('✅ .env.example file exists');
    } else {
      console.log('❌ .env.example file does not exist');
    }
    
    return { envContent, exampleContent };
  } catch (error) {
    console.error('Error reading environment files:', error);
    return { envContent: null, exampleContent: null };
  }
}

async function main() {
  console.log('====================================');
  console.log('🔍 Checking Deployment Environment');
  console.log('====================================');
  
  // Check critical environment variables
  const criticalVars = [
    'DATABASE_URL',
    'NODE_ENV'
  ];
  
  let allCriticalVarsSet = true;
  
  for (const varName of criticalVars) {
    if (isEnvVarSet(varName)) {
      console.log(`✅ ${varName} is set`);
    } else {
      console.log(`❌ ${varName} is NOT set - this may cause deployment issues`);
      allCriticalVarsSet = false;
    }
  }
  
  // Check for env files
  const { envContent, exampleContent } = loadEnvFile();
  
  // Check Vercel configuration
  const vercelConfigPath = path.join(__dirname, 'vercel.json');
  
  if (fs.existsSync(vercelConfigPath)) {
    console.log('✅ vercel.json exists');
    
    // Analyze vercel.json content
    try {
      const vercelConfig = JSON.parse(fs.readFileSync(vercelConfigPath, 'utf8'));
      
      // Check for common issues
      if (!vercelConfig.rewrites || vercelConfig.rewrites.length === 0) {
        console.log('❌ vercel.json is missing rewrites configuration');
      } else {
        console.log('✅ vercel.json has rewrites configuration');
      }
      
      if (!vercelConfig.functions) {
        console.log('⚠️ vercel.json is missing functions configuration');
      } else {
        console.log('✅ vercel.json has functions configuration');
      }
      
      // Check for SPA routing
      const hasSpaCatchAll = vercelConfig.rewrites?.some(
        rewrite => rewrite.source === '/(.*)'
      );
      
      if (hasSpaCatchAll) {
        console.log('✅ vercel.json has catch-all route for SPA routing');
      } else {
        console.log('❌ vercel.json is missing catch-all route for SPA routing');
      }
      
    } catch (error) {
      console.error('Error parsing vercel.json:', error);
    }
  } else {
    console.log('❌ vercel.json does not exist - this will cause deployment issues');
  }
  
  // Check for special deployment files
  const specialFiles = [
    { name: 'api/index.js', description: 'Vercel API handler' },
    { name: 'vercel.js', description: 'Vercel helper' },
    { name: '404.html', description: 'Fallback HTML' },
    { name: 'vercel-index.html', description: 'Vercel index fallback' }
  ];
  
  for (const file of specialFiles) {
    const filePath = path.join(__dirname, file.name);
    
    if (fs.existsSync(filePath)) {
      console.log(`✅ ${file.name} (${file.description}) exists`);
    } else {
      console.log(`❌ ${file.name} (${file.description}) does not exist - this may help with deployment issues`);
    }
  }
  
  console.log('\n====================================');
  console.log('📋 Deployment Environment Summary');
  console.log('====================================');
  
  if (allCriticalVarsSet) {
    console.log('✅ All critical environment variables are set');
  } else {
    console.log('❌ Some critical environment variables are missing');
    console.log('   This may cause the schema to be displayed instead of your app');
  }
  
  console.log('\n📝 Next Steps:');
  if (!allCriticalVarsSet) {
    console.log('1. Add missing environment variables to Vercel');
    console.log('2. Go to the Vercel dashboard and ensure all environment variables are set');
    console.log('3. Clear the build cache and redeploy your application');
  } else {
    console.log('Your environment appears to be configured correctly for deployment.');
    console.log('If you are still seeing schema code instead of your application:');
    console.log('1. Make sure your build command is correctly set in Vercel (npm run build)');
    console.log('2. Ensure your output directory is correctly set (dist)');
    console.log('3. Clear the build cache and redeploy your application');
  }
  
  console.log('\nFor more detailed deployment instructions, refer to:');
  console.log('- VERCEL_DEPLOYMENT.md');
  console.log('- SUPABASE_VERCEL_DEPLOYMENT.md');
}

main().catch(error => {
  console.error('Error running deployment check:', error);
  process.exit(1);
});