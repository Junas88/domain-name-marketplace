// Script to check if deployment environment variables are set
console.log('Checking deployment environment variables...');

const requiredVars = [
  'DATABASE_URL',
  'PGUSER',
  'PGPASSWORD',
  'PGHOST',
  'PGPORT',
  'PGDATABASE',
  'STRIPE_SECRET_KEY',
  'VITE_STRIPE_PUBLIC_KEY'
];

const missingVars = [];

requiredVars.forEach(varName => {
  if (!process.env[varName]) {
    missingVars.push(varName);
  }
});

if (missingVars.length === 0) {
  console.log('✅ All required environment variables are set.');
} else {
  console.log('❌ Missing the following environment variables:');
  missingVars.forEach(varName => {
    console.log(`  - ${varName}`);
  });
  console.log('\nHow to fix:');
  console.log('1. When deploying, make sure to add these variables in the Replit deployment settings');
  console.log('2. Copy the values from your development environment to your deployment');
  console.log('3. For security reasons, we cannot print the values of these variables');
}

// If missing DATABASE_URL, provide more detailed help
if (missingVars.includes('DATABASE_URL')) {
  console.log('\nSpecial instructions for DATABASE_URL:');
  console.log('- Make sure your database is accessible from your deployment environment');
  console.log('- The format should be: postgresql://username:password@host:port/database');
  console.log('- You may need to configure your database to accept connections from your deployment\'s IP');
}