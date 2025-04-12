import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { 
  insertOfferSchema, 
  insertConsultationSchema,
  insertDomainSchema,
  insertPageContentSchema,
  insertEmailSubmissionSchema,
  insertSeoSettingsSchema
} from "@shared/schema";
import { z } from "zod";
import multer from 'multer';
import path from 'path';
import fs from 'fs-extra';
import express from 'express';

// Create uploads directory if it doesn't exist
const uploadDir = path.join(process.cwd(), 'uploads');
fs.ensureDirSync(uploadDir);

// Configure multer for file uploads
const storage_config = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const upload = multer({ 
  storage: storage_config,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept PDFs, images, and DOC files
    const filetypes = /pdf|jpeg|jpg|png|doc|docx/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only PDF, image, and DOC files are allowed'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Serve static files from public directory
  app.use(express.static(path.join(process.cwd(), 'public')));
  
  // Serve the admin page directly instead of redirecting
  app.get('/admin', (req, res) => {
    // Simple admin check page
    const adminHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Admin Dashboard - Domain Name Guide</title>
  <script>
    window.addEventListener('DOMContentLoaded', async () => {
      try {
        const response = await fetch('/api/auth/user');
        if (response.ok) {
          const user = await response.json();
          
          if (user && user.isAdmin) {
            window.location.href = '/admin-dashboard.html';
            return;
          }
        }
        window.location.href = '/auth';
      } catch (error) {
        console.error('Error checking authentication:', error);
        window.location.href = '/auth';
      }
    });
  </script>
</head>
<body>
  <div style="display: flex; justify-content: center; align-items: center; height: 100vh; font-family: sans-serif;">
    <div style="text-align: center;">
      <div style="border: 4px solid #000; width: 40px; height: 40px; border-radius: 50%; border-top-color: transparent; animation: spin 1s linear infinite; margin: 0 auto;"></div>
      <p style="margin-top: 20px; font-size: 18px;">Verifying admin access...</p>
    </div>
  </div>
  <style>
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    body {
      margin: 0;
      padding: 0;
      background-color: #f8f8f8;
    }
  </style>
</body>
</html>`;
    res.setHeader('Content-Type', 'text/html');
    res.send(adminHtml);
  });
  
  // Set up authentication
  setupAuth(app);
  
  // Serve static files from public/downloads
  app.use('/downloads', express.static(path.join(process.cwd(), 'public/downloads')));
  
  // Special endpoint to fix ebook section settings
  app.get('/api/fix-ebook-settings', async (req, res) => {
    try {
      // Update ebook settings to make it free
      const pageContent = await storage.updatePageContent('ebook-section', {
        isPurchaseRequired: false,
        price: 0
      });
      
      if (!pageContent) {
        return res.status(404).json({ message: 'Ebook section not found' });
      }
      
      res.json({ 
        message: 'Ebook settings updated successfully',
        pageContent
      });
    } catch (err) {
      console.error('Error updating ebook settings:', err);
      res.status(500).json({ message: 'Error updating ebook settings' });
    }
  });

  // Direct ebook download endpoint - always serves the PDF regardless of purchase status
  app.get('/api/direct-download/ebook', async (req, res) => {
    try {
      console.log('Downloading ebook...');
      
      // First try to get the ebook from page content
      const pageContent = await storage.getPageContent('ebook-section');
      
      // For the direct-download/ebook endpoint, we always want to allow downloads
      // regardless of the isPurchaseRequired flag - this is a free download endpoint
      
      let filePath = '';
      let fileName = 'Domain Name Marketing.pdf';
      
      // Check if we have a valid file path from page content
      if (pageContent && pageContent.filePath) {
        // First check if the file exists as-is
        if (fs.existsSync(pageContent.filePath)) {
          filePath = pageContent.filePath;
          if (pageContent.fileName) {
            fileName = pageContent.fileName;
          }
          console.log('Using uploaded file:', filePath);
        } else {
          // If the file doesn't exist exactly as stored, check if it's just a filename issue 
          // by trying to find the file in the uploads folder
          const possiblePath = path.join('uploads', path.basename(pageContent.filePath));
          if (fs.existsSync(possiblePath)) {
            filePath = possiblePath;
            console.log('Found file in uploads directory:', filePath);
          }
        }
      }
      
      // If we still don't have a valid file path, try the fallback file
      if (!filePath || !fs.existsSync(filePath)) {
        filePath = path.join(process.cwd(), 'public/downloads/Domain Name Marketing.pdf');
        console.log('Using default file:', filePath);
        
        // Ensure the downloads directory exists
        fs.ensureDirSync(path.join(process.cwd(), 'public/downloads'));
        
        // If the default file doesn't exist either, return error
        if (!fs.existsSync(filePath)) {
          console.error('Default file not found:', filePath);
          return res.status(404).send('Ebook file not found. Please upload an ebook from the admin dashboard.');
        }
      }
      
      console.log('File exists at:', filePath);
      
      // Set headers for download
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      
      // Send file stream
      const fileStream = fs.createReadStream(filePath);
      fileStream.on('error', (error) => {
        console.error('Error streaming file:', error);
        if (!res.headersSent) {
          res.status(500).send('Error streaming file');
        }
      });
      
      fileStream.pipe(res);
    } catch (err) {
      console.error('Error downloading file:', err);
      res.status(500).send('Error processing download');
    }
  });
  
  // prefix all routes with /api
  
  // Get all domains
  app.get("/api/domains", async (req, res) => {
    try {
      const domains = await storage.getAllDomains();
      res.json(domains);
    } catch (error) {
      console.error("Error fetching domains:", error);
      res.status(500).json({ message: "Failed to fetch domains" });
    }
  });
  
  // Get recently sold domains
  app.get("/api/domains/recently-sold", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 6;
      const domains = await storage.getRecentlySoldDomains(limit);
      res.json(domains);
    } catch (error) {
      console.error("Error fetching recently sold domains:", error);
      res.status(500).json({ message: "Failed to fetch recently sold domains" });
    }
  });
  
  // Get a specific domain by ID
  app.get("/api/domains/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid domain ID" });
      }
      
      const domain = await storage.getDomain(id);
      if (!domain) {
        return res.status(404).json({ message: "Domain not found" });
      }
      
      res.json(domain);
    } catch (error) {
      console.error("Error fetching domain:", error);
      res.status(500).json({ message: "Failed to fetch domain" });
    }
  });
  
  // Search domains
  app.get("/api/domains/search", async (req, res) => {
    try {
      const query = req.query.q as string;
      const domains = await storage.searchDomains(query);
      res.json(domains);
    } catch (error) {
      console.error("Error searching domains:", error);
      res.status(500).json({ message: "Failed to search domains" });
    }
  });
  
  // Filter domains
  app.get("/api/domains/filter", async (req, res) => {
    try {
      const category = req.query.category as string;
      const priceRange = req.query.priceRange as string;
      const length = req.query.length as string;
      
      const domains = await storage.filterDomains({
        category,
        priceRange,
        length
      });
      
      res.json(domains);
    } catch (error) {
      console.error("Error filtering domains:", error);
      res.status(500).json({ message: "Failed to filter domains" });
    }
  });
  
  // Create an offer
  app.post("/api/offers", async (req, res) => {
    try {
      const offerData = insertOfferSchema.parse(req.body);
      const offer = await storage.createOffer(offerData);
      res.status(201).json(offer);
    } catch (error) {
      console.error("Error creating offer:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid offer data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create offer" });
    }
  });
  
  // Create a consultation booking
  app.post("/api/consultations", async (req, res) => {
    try {
      const consultationData = insertConsultationSchema.parse(req.body);
      const consultation = await storage.createConsultation(consultationData);
      res.status(201).json(consultation);
    } catch (error) {
      console.error("Error creating consultation:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid consultation data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create consultation" });
    }
  });

  // ADMIN API ROUTES
  
  // Create a new domain
  app.post("/api/admin/domains", async (req, res) => {
    try {
      const domainData = insertDomainSchema.parse(req.body);
      const domain = await storage.createDomain(domainData);
      res.status(201).json(domain);
    } catch (error) {
      console.error("Error creating domain:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid domain data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create domain" });
    }
  });
  
  // Update a domain
  app.patch("/api/admin/domains/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid domain ID" });
      }
      
      const domain = await storage.updateDomain(id, req.body);
      if (!domain) {
        return res.status(404).json({ message: "Domain not found" });
      }
      
      res.json(domain);
    } catch (error) {
      console.error("Error updating domain:", error);
      res.status(500).json({ message: "Failed to update domain" });
    }
  });
  
  // Delete a domain
  app.delete("/api/admin/domains/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid domain ID" });
      }
      
      const success = await storage.deleteDomain(id);
      if (!success) {
        return res.status(404).json({ message: "Domain not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      console.error("Error deleting domain:", error);
      res.status(500).json({ message: "Failed to delete domain" });
    }
  });
  
  // Mark domain as sold
  app.patch("/api/admin/domains/:id/mark-sold", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid domain ID" });
      }
      
      const domain = await storage.markDomainAsSold(id);
      if (!domain) {
        return res.status(404).json({ message: "Domain not found" });
      }
      
      res.json(domain);
    } catch (error) {
      console.error("Error marking domain as sold:", error);
      res.status(500).json({ message: "Failed to mark domain as sold" });
    }
  });
  
  // Increment view count
  app.patch("/api/domains/:id/view", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid domain ID" });
      }
      
      const domain = await storage.incrementViewCount(id);
      if (!domain) {
        return res.status(404).json({ message: "Domain not found" });
      }
      
      res.json(domain);
    } catch (error) {
      console.error("Error incrementing view count:", error);
      res.status(500).json({ message: "Failed to increment view count" });
    }
  });
  
  // Get domain statistics
  app.get("/api/admin/domains/stats", async (req, res) => {
    try {
      const stats = await storage.getDomainStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching domain stats:", error);
      res.status(500).json({ message: "Failed to fetch domain stats" });
    }
  });
  
  // Get all offers (admin)
  app.get("/api/admin/offers", async (req, res) => {
    try {
      let offers: any[] = [];
      // Get all domains
      const domains = await storage.getAllDomains();
      
      // Collect all offers for each domain
      for (const domain of domains) {
        const domainOffers = await storage.getOffersByDomainId(domain.id);
        offers = [...offers, ...domainOffers.map(offer => ({
          ...offer,
          domainName: domain.name
        }))];
      }
      
      res.json(offers);
    } catch (error) {
      console.error("Error fetching offers:", error);
      res.status(500).json({ message: "Failed to fetch offers" });
    }
  });
  
  // Get all consultations (admin)
  app.get("/api/admin/consultations", async (req, res) => {
    try {
      const consultations = await storage.getAllConsultations();
      res.json(consultations);
    } catch (error) {
      console.error("Error fetching consultations:", error);
      res.status(500).json({ message: "Failed to fetch consultations" });
    }
  });
  
  // Get all email submissions (admin)
  app.get("/api/admin/email-submissions", async (req, res) => {
    try {
      // Check if user is authenticated and an admin
      if (!req.isAuthenticated() || !(req.user?.isAdmin)) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const emailSubmissions = await storage.getAllEmailSubmissions();
      res.json(emailSubmissions);
    } catch (error) {
      console.error("Error fetching email submissions:", error);
      res.status(500).json({ message: "Failed to fetch email submissions" });
    }
  });
  
  // Create an email submission
  app.post("/api/email-submissions", async (req, res) => {
    try {
      const submissionData = insertEmailSubmissionSchema.parse(req.body);
      const submission = await storage.createEmailSubmission(submissionData);
      res.status(201).json(submission);
    } catch (error) {
      console.error("Error creating email submission:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid email submission data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create email submission" });
    }
  });

  // Page Content (CMS) API routes
  
  // Get all page contents (public)
  app.get("/api/page-contents", async (req, res) => {
    try {
      const pageContents = await storage.getAllPageContents();
      res.json(pageContents);
    } catch (error) {
      console.error("Error fetching page contents:", error);
      res.status(500).json({ message: "Failed to fetch page contents" });
    }
  });
  
  // Get a specific page content by key (public)
  app.get("/api/page-contents/:pageKey", async (req, res) => {
    try {
      const pageKey = req.params.pageKey;
      const pageContent = await storage.getPageContent(pageKey);
      
      if (!pageContent) {
        return res.status(404).json({ message: "Page content not found" });
      }
      
      // For ebook-section, add info about the file availability
      if (pageKey === 'ebook-section') {
        let fileInfo = null;
        
        if (pageContent.filePath && fs.existsSync(pageContent.filePath)) {
          fileInfo = {
            fileName: pageContent.fileName || 'Domain Name Marketing.pdf',
            fileSize: pageContent.fileSize,
            fileUpdated: pageContent.updatedAt
          };
        }
        
        return res.json({
          ...pageContent,
          fileInfo
        });
      }
      
      res.json(pageContent);
    } catch (error) {
      console.error("Error fetching page content:", error);
      res.status(500).json({ message: "Failed to fetch page content" });
    }
  });
  
  // Admin: Get all page contents
  app.get("/api/admin/page-contents", async (req, res) => {
    try {
      // Check if user is authenticated and an admin
      if (!req.isAuthenticated() || !(req.user?.isAdmin)) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const pageContents = await storage.getAllPageContents();
      res.json(pageContents);
    } catch (error) {
      console.error("Error fetching page contents:", error);
      res.status(500).json({ message: "Failed to fetch page contents" });
    }
  });
  
  // Admin: Create a new page content
  app.post("/api/admin/page-contents", async (req, res) => {
    try {
      // Check if user is authenticated and an admin
      if (!req.isAuthenticated() || !(req.user?.isAdmin)) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const pageContentData = insertPageContentSchema.parse(req.body);
      const pageContent = await storage.createPageContent(pageContentData);
      res.status(201).json(pageContent);
    } catch (error) {
      console.error("Error creating page content:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid page content data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create page content" });
    }
  });
  
  // Admin: Update a page content
  app.patch("/api/admin/page-contents/:pageKey", async (req, res) => {
    try {
      // Check if user is authenticated and an admin
      if (!req.isAuthenticated() || !(req.user?.isAdmin)) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const pageKey = req.params.pageKey;
      const pageContent = await storage.updatePageContent(pageKey, req.body);
      
      if (!pageContent) {
        return res.status(404).json({ message: "Page content not found" });
      }
      
      res.json(pageContent);
    } catch (error) {
      console.error("Error updating page content:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid page content data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update page content" });
    }
  });
  
  // Admin: Delete a page content
  app.delete("/api/admin/page-contents/:pageKey", async (req, res) => {
    try {
      // Check if user is authenticated and an admin
      if (!req.isAuthenticated() || !(req.user?.isAdmin)) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const pageKey = req.params.pageKey;
      const success = await storage.deletePageContent(pageKey);
      
      if (!success) {
        return res.status(404).json({ message: "Page content not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      console.error("Error deleting page content:", error);
      res.status(500).json({ message: "Failed to delete page content" });
    }
  });
  
  // Admin: Upload a file for a page content
  app.post("/api/admin/page-contents/:pageKey/upload", upload.single('file'), async (req, res) => {
    try {
      // Check if user is authenticated and an admin
      if (!req.isAuthenticated() || !(req.user?.isAdmin)) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      
      const pageKey = req.params.pageKey;
      const pageContent = await storage.getPageContent(pageKey);
      
      if (!pageContent) {
        return res.status(404).json({ message: "Page content not found" });
      }
      
      // Update the page content with the file info
      const updates = {
        filePath: req.file.path,
        fileName: req.file.originalname,
        fileSize: req.file.size
      };
      
      const updatedPageContent = await storage.updatePageContent(pageKey, updates);
      
      res.json(updatedPageContent);
    } catch (error) {
      console.error("Error uploading file:", error);
      res.status(500).json({ message: "Failed to upload file" });
    }
  });
  
  // SEO Settings API routes
  
  // Get all SEO settings (public)
  app.get("/api/seo-settings", async (req, res) => {
    try {
      const seoSettings = await storage.getAllSeoSettings();
      res.json(seoSettings);
    } catch (error) {
      console.error("Error fetching SEO settings:", error);
      res.status(500).json({ message: "Failed to fetch SEO settings" });
    }
  });
  
  // Get a specific SEO setting by page key (public)
  app.get("/api/seo-settings/:pageKey", async (req, res) => {
    try {
      const pageKey = req.params.pageKey;
      const seoSetting = await storage.getSeoSettingByPageKey(pageKey);
      
      if (!seoSetting) {
        return res.status(404).json({ message: "SEO setting not found" });
      }
      
      res.json(seoSetting);
    } catch (error) {
      console.error("Error fetching SEO setting:", error);
      res.status(500).json({ message: "Failed to fetch SEO setting" });
    }
  });
  
  // Admin: Get all SEO settings
  app.get("/api/admin/seo-settings", async (req, res) => {
    try {
      // Check if user is authenticated and an admin
      if (!req.isAuthenticated() || !(req.user?.isAdmin)) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const seoSettings = await storage.getAllSeoSettings();
      res.json(seoSettings);
    } catch (error) {
      console.error("Error fetching SEO settings:", error);
      res.status(500).json({ message: "Failed to fetch SEO settings" });
    }
  });
  
  // Admin: Create a new SEO setting
  app.post("/api/admin/seo-settings", async (req, res) => {
    try {
      // Check if user is authenticated and an admin
      if (!req.isAuthenticated() || !(req.user?.isAdmin)) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const seoSettingData = insertSeoSettingsSchema.parse(req.body);
      const seoSetting = await storage.createSeoSetting(seoSettingData);
      res.status(201).json(seoSetting);
    } catch (error) {
      console.error("Error creating SEO setting:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid SEO setting data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create SEO setting" });
    }
  });
  
  // Admin: Update a SEO setting
  app.patch("/api/admin/seo-settings/:pageKey", async (req, res) => {
    try {
      // Check if user is authenticated and an admin
      if (!req.isAuthenticated() || !(req.user?.isAdmin)) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const pageKey = req.params.pageKey;
      const seoSetting = await storage.updateSeoSetting(pageKey, req.body);
      
      if (!seoSetting) {
        return res.status(404).json({ message: "SEO setting not found" });
      }
      
      res.json(seoSetting);
    } catch (error) {
      console.error("Error updating SEO setting:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid SEO setting data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update SEO setting" });
    }
  });
  
  // Admin: Delete a SEO setting
  app.delete("/api/admin/seo-settings/:pageKey", async (req, res) => {
    try {
      // Check if user is authenticated and an admin
      if (!req.isAuthenticated() || !(req.user?.isAdmin)) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const pageKey = req.params.pageKey;
      const success = await storage.deleteSeoSetting(pageKey);
      
      if (!success) {
        return res.status(404).json({ message: "SEO setting not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      console.error("Error deleting SEO setting:", error);
      res.status(500).json({ message: "Failed to delete SEO setting" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}