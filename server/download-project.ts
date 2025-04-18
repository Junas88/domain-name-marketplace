import express from 'express';
import path from 'path';
import fs from 'fs';

// Add the download route
export function setupDownloadRoutes(app: express.Express) {
  app.get('/api/download-project', (req, res) => {
    const zipFilePath = '/tmp/downloads/domain-name-guide.zip';
    
    // Check if the file exists
    if (fs.existsSync(zipFilePath)) {
      console.log('Serving project ZIP file for download');
      
      // Set headers
      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', 'attachment; filename=domain-name-guide.zip');
      
      // Send the file
      res.sendFile(zipFilePath);
    } else {
      res.status(404).send('Project ZIP file not found');
    }
  });
}