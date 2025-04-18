/**
 * Special routing and configuration handler for Vercel deployment
 * 
 * This file helps ensure that Vercel correctly serves the application and API routes
 * to fix the issue where schema code is displayed instead of the actual application.
 */

// CommonJS format for Vercel compatibility
const fs = require('fs');
const path = require('path');

// This is a handler for Vercel that helps with routing
module.exports = (req, res) => {
  // Log information to help with debugging
  console.log('Vercel request handler invoked');
  console.log('Request URL:', req.url);
  console.log('NODE_ENV:', process.env.NODE_ENV);

  // Check if this is a specific API request
  if (req.url.startsWith('/api/')) {
    console.log('API request detected');
    
    // This is just for debugging - in production, your API routes should handle this
    return res.json({
      message: 'API route detected',
      path: req.url,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'unknown',
      note: 'If you see this message, make sure your API routes are correctly set up in Vercel'
    });
  }

  // For static files like CSS, JS, etc.
  const staticExtensions = ['.js', '.css', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico'];
  const urlExt = path.extname(req.url);
  
  if (staticExtensions.includes(urlExt)) {
    console.log('Static file request detected:', urlExt);
    
    // Let Vercel handle static files normally
    return {
      statusCode: 404,
      body: JSON.stringify({ error: 'Static file not found' })
    };
  }

  // For any other request, serve the application (SPA routing)
  console.log('Serving SPA route');
  
  // In production, Vercel should serve the built index.html
  // This is just a fallback for debugging
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Domain Name Guide</title>
  <style>
    body { 
      font-family: -apple-system, system-ui, sans-serif; 
      margin: 0; 
      padding: 0;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      background-color: #f5f5f5;
      color: #333;
    }
    .container {
      max-width: 800px;
      padding: 2rem;
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      text-align: center;
    }
    h1 { margin-top: 0; }
    pre {
      background-color: #f1f1f1;
      padding: 1rem;
      border-radius: 4px;
      overflow: auto;
      text-align: left;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Domain Name Guide</h1>
    <p>Vercel Deployment Handler</p>
    <p>This is a special handler file to fix deployment issues. If you're seeing this page instead of your application, check your Vercel deployment configuration.</p>
    <pre>
Request path: ${req.url}
Environment: ${process.env.NODE_ENV || 'unknown'}
Timestamp: ${new Date().toISOString()}
    </pre>
    <p>Troubleshooting steps:</p>
    <ul style="text-align: left;">
      <li>Verify your environment variables in Vercel</li>
      <li>Check that your build command is correctly set</li>
      <li>Ensure your output directory is properly configured</li>
      <li>Clear the build cache and redeploy</li>
    </ul>
  </div>
</body>
</html>
  `;
  
  // Return HTML
  res.setHeader('Content-Type', 'text/html');
  return res.send(html);
};