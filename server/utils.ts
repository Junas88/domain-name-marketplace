// Utility functions for server operations

// Determine the current environment
export function getEnvironment(): 'development' | 'production' | 'test' {
  const env = process.env.NODE_ENV || 'development';
  if (env === 'production' || env === 'development' || env === 'test') {
    return env;
  }
  return 'development';
}

// Check if the application is running in a production environment
export function isProduction(): boolean {
  return getEnvironment() === 'production';
}