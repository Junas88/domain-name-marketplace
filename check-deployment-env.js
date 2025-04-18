/**
 * This script checks if all required environment variables are present for deployment.
 * Run this before deploying to verify your environment is correctly configured.
 */

// Define required environment variables for production
const REQUIRED_ENV_VARS = [
  'DATABASE_URL',
  'SESSION_SECRET',
];

// Define conditionally required variables (based on features enabled)
const CONDITIONAL_ENV_VARS = {
  'AI Features': ['OPENAI_API_KEY'],
  'Payment Processing': ['STRIPE_SECRET_KEY', 'VITE_STRIPE_PUBLIC_KEY'],
};

// Define recommended environment variables
const RECOMMENDED_ENV_VARS = [
  'NODE_ENV',
];

// Function to check if an environment variable is set
function isEnvVarSet(varName) {
  return process.env[varName] !== undefined && process.env[varName] !== '';
}

// Function to load .env file for testing
function loadEnvFile() {
  try {
    const fs = require('fs');
    const path = require('path');
    const dotenv = require('dotenv');
    
    // Try to load .env file if it exists
    const envPath = path.resolve(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
      const envConfig = dotenv.parse(fs.readFileSync(envPath));
      
      // Add env vars to process.env
      for (const key in envConfig) {
        if (!process.env[key]) {
          process.env[key] = envConfig[key];
        }
      }
      
      console.log('📄 Loaded environment variables from .env file');
    } else {
      console.log('⚠️ No .env file found. Using process environment only.');
    }
  } catch (error) {
    console.error('⚠️ Error loading .env file:', error.message);
    console.log('ℹ️ Continuing with existing environment variables...');
  }
}

// Main function
async function main() {
  console.log('🔍 Checking environment variables for deployment...');
  
  // Try to load .env file
  try {
    loadEnvFile();
  } catch (error) {
    // If dotenv isn't installed, continue with existing env vars
    console.warn('⚠️ dotenv package not found. Skipping .env file loading.');
  }
  
  let hasErrors = false;
  let hasWarnings = false;
  
  // Check required environment variables
  console.log('\n📋 Checking required environment variables:');
  
  REQUIRED_ENV_VARS.forEach(varName => {
    if (isEnvVarSet(varName)) {
      console.log(`✓ ${varName}: Found`);
    } else {
      console.error(`❌ ${varName}: Missing (REQUIRED)`);
      hasErrors = true;
    }
  });
  
  // Check conditional environment variables
  console.log('\n📋 Checking feature-specific environment variables:');
  
  Object.entries(CONDITIONAL_ENV_VARS).forEach(([feature, vars]) => {
    console.log(`\n🔹 ${feature}:`);
    
    let allVarsPresent = true;
    vars.forEach(varName => {
      if (isEnvVarSet(varName)) {
        console.log(`  ✓ ${varName}: Found`);
      } else {
        console.log(`  ✗ ${varName}: Missing`);
        allVarsPresent = false;
      }
    });
    
    if (!allVarsPresent) {
      console.log(`  ⚠️ Some variables missing for ${feature}. This feature may not work correctly.`);
      hasWarnings = true;
    }
  });
  
  // Check recommended environment variables
  console.log('\n📋 Checking recommended environment variables:');
  
  RECOMMENDED_ENV_VARS.forEach(varName => {
    if (isEnvVarSet(varName)) {
      console.log(`✓ ${varName}: Found (${process.env[varName]})`);
    } else {
      console.log(`⚠️ ${varName}: Missing (recommended)`);
      hasWarnings = true;
    }
  });
  
  // Print summary
  console.log('\n📊 Environment check summary:');
  
  if (hasErrors) {
    console.error('❌ CRITICAL ISSUES FOUND: Missing required environment variables');
    console.log('   Your application will not function correctly without these variables.');
    console.log('   Please add them to your deployment environment before continuing.');
  } else if (hasWarnings) {
    console.log('⚠️ WARNINGS FOUND: Some recommended or feature-specific variables are missing');
    console.log('   Your application may have limited functionality.');
    console.log('   Consider adding these variables for full functionality.');
  } else {
    console.log('✅ ALL CHECKS PASSED: Your environment is correctly configured');
  }
  
  // Print instructions
  console.log('\n📝 Next steps:');
  
  if (hasErrors) {
    console.log('1. Add the missing required environment variables to your deployment');
    console.log('2. Run this check again to verify all variables are set');
    console.log('3. Proceed with deployment once all critical issues are resolved');
  } else {
    console.log('1. Proceed with deployment');
    if (hasWarnings) {
      console.log('2. Consider adding the recommended variables for full functionality');
    }
  }
  
  // Return proper exit code
  if (hasErrors) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

// Run the script
main().catch(error => {
  console.error('❌ Error checking environment variables:', error);
  process.exit(1);
});