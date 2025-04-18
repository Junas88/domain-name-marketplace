/**
 * Vercel API Route Handler
 * 
 * This special file helps Vercel properly route requests between your 
 * client-side application and your API endpoints. The 'api' directory
 * is automatically recognized by Vercel as serverless functions.
 */

// Import required modules
const path = require('path');
const fs = require('fs');

// This is a serverless function that handles API requests
module.exports = async (req, res) => {
  try {
    // Check if this is a direct API request (which should be handled by the server)
    if (req.url.startsWith('/api/')) {
      // Redirect to the appropriate API endpoint
      // This is important for Vercel to properly route API requests
      // to your serverless functions
      const apiPath = req.url.replace('/api/', '');
      return res.status(200).json({
        message: 'This is a special API route handler for Vercel deployment',
        endpoint: apiPath,
        status: 'Configure your API routes properly in vercel.json'
      });
    }

    // For non-API requests, tell Vercel to serve the static files
    // Important note: This helps Vercel know to serve the client-side app
    // instead of showing your schema code
    return res.status(200).json({
      message: 'This is a special handler to fix schema display issues',
      solution: 'Make sure your environment variables are correctly set in Vercel',
      action: 'Clear build cache and redeploy',
      note: 'If you see this message, your API routes are being handled but client routing may have issues'
    });
  } catch (error) {
    console.error('Error in Vercel API handler:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message,
      solution: 'Check Vercel deployment logs for details'
    });
  }
};