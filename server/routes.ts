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
  insertSeoSettingsSchema,
  insertInquirySchema,
  insertCommunicationSchema,
  type InquiryStatus
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

// Helper function to check if we're in a deployment environment
const isDeployment = process.env.REPL_DEPLOYMENT === 'true';

// Stripe functionality has been removed

export async function registerRoutes(app: Express): Promise<Server> {
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
      res.status(500).json({ message: "Failed to update page content" });
    }
  });
  
  // Admin: Upload file for a page content
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
        // Delete the uploaded file if page doesn't exist
        fs.unlinkSync(req.file.path);
        return res.status(404).json({ message: "Page content not found" });
      }
      
      // If this is the ebook, we want to make sure the file is properly saved
      if (pageKey === 'ebook-section') {
        // Create a copy in the default location for failsafe
        const pdfName = 'Domain Name Marketing.pdf';
        const defaultPath = path.join(process.cwd(), 'public/downloads', pdfName);
        
        // Ensure the downloads directory exists
        fs.ensureDirSync(path.join(process.cwd(), 'public/downloads'));
        
        // Copy the uploaded file to the default location
        try {
          fs.copyFileSync(req.file.path, defaultPath);
          console.log('Created backup copy of PDF at:', defaultPath);
        } catch (copyErr) {
          console.error('Failed to create backup copy:', copyErr);
          // Continue even if copy fails, since we still have the uploaded file
        }
      }
      
      // Update page content with file information
      const updates = {
        filePath: req.file.path,
        fileName: req.file.originalname,
        fileType: req.file.mimetype,
        fileSize: req.file.size
      };
      
      // For ebook-section specifically, make sure to set isPurchaseRequired to false
      if (pageKey === 'ebook-section') {
        Object.assign(updates, {
          isPurchaseRequired: false,
          price: 0
        });
      }
      
      const updatedPageContent = await storage.updatePageContent(pageKey, updates);
      
      // Special message for ebook uploads to guide the admin
      if (pageKey === 'ebook-section') {
        res.json({
          ...updatedPageContent,
          message: "E-book uploaded successfully and set to FREE. Users can now download it from the website."
        });
      } else {
        res.json(updatedPageContent);
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      res.status(500).json({ message: "Failed to upload file" });
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
  
  // SEO SETTINGS API ROUTES - Added to handle metadata for Google search ranking optimization

  // Download file from a page content
  app.get("/api/page-contents/:pageKey/download", async (req, res) => {
    try {
      const pageKey = req.params.pageKey;
      const pageContent = await storage.getPageContent(pageKey);
      
      if (!pageContent) {
        return res.status(404).json({ message: "Page content not found" });
      }
      
      // Check if the page has a file
      if (!pageContent.filePath || !pageContent.fileName) {
        return res.status(404).json({ message: "No file associated with this content" });
      }
      
      // Check if this content requires purchase
      if (pageContent.isPurchaseRequired) {
        // Check for payment verification
        const paymentVerified = req.query.paymentVerified === 'true';
        
        if (!paymentVerified) {
          return res.status(402).json({
            message: "Payment required to download this file",
            price: pageContent.price,
            isPurchaseRequired: true
          });
        }
      }
      
      // Send the file as a download
      res.download(pageContent.filePath, pageContent.fileName);
    } catch (error) {
      console.error("Error downloading file:", error);
      res.status(500).json({ message: "Failed to download file" });
    }
  });
  
  // Direct download of ebooks without payment
  app.post("/api/request-download/:pageKey", async (req, res) => {
    try {
      const pageKey = req.params.pageKey;
      const pageContent = await storage.getPageContent(pageKey);
      
      if (!pageContent) {
        return res.status(404).json({ message: "Page content not found" });
      }
      
      // Check if the page has a file
      if (!pageContent.filePath || !pageContent.fileName) {
        return res.status(404).json({ message: "No file associated with this content" });
      }
      
      // Generate download URL - no payment verification needed anymore
      const downloadUrl = `/api/page-contents/${pageKey}/download`;
      
      res.json({
        success: true,
        downloadUrl
      });
    } catch (error: any) {
      console.error("Error processing download request:", error);
      res.status(500).json({ message: "Failed to process download request: " + error.message });
    }
  });

  // SEO Settings routes
  
  // Get all SEO settings (admin)
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
  
  // Get a specific SEO setting by page key (admin)
  app.get("/api/admin/seo-settings/:pageKey", async (req, res) => {
    try {
      // Check if user is authenticated and an admin
      if (!req.isAuthenticated() || !(req.user?.isAdmin)) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
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
  
  // Create a new SEO setting (admin)
  app.post("/api/admin/seo-settings", async (req, res) => {
    try {
      // Check if user is authenticated and an admin
      if (!req.isAuthenticated() || !(req.user?.isAdmin)) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const seoSettingData = insertSeoSettingsSchema.parse(req.body);
      
      // Check if the SEO setting already exists
      const existingSetting = await storage.getSeoSettingByPageKey(seoSettingData.pageKey);
      if (existingSetting) {
        return res.status(400).json({ message: "SEO setting for this page already exists" });
      }
      
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
  
  // Update an existing SEO setting (admin)
  app.patch("/api/admin/seo-settings/:pageKey", async (req, res) => {
    try {
      // Check if user is authenticated and an admin
      if (!req.isAuthenticated() || !(req.user?.isAdmin)) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const pageKey = req.params.pageKey;
      
      // Check if the SEO setting exists
      const existingSetting = await storage.getSeoSettingByPageKey(pageKey);
      if (!existingSetting) {
        return res.status(404).json({ message: "SEO setting not found" });
      }
      
      const updatedSetting = await storage.updateSeoSetting(pageKey, req.body);
      res.json(updatedSetting);
    } catch (error) {
      console.error("Error updating SEO setting:", error);
      res.status(500).json({ message: "Failed to update SEO setting" });
    }
  });
  
  // Delete an SEO setting (admin)
  app.delete("/api/admin/seo-settings/:pageKey", async (req, res) => {
    try {
      // Check if user is authenticated and an admin
      if (!req.isAuthenticated() || !(req.user?.isAdmin)) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const pageKey = req.params.pageKey;
      
      // Check if the SEO setting exists
      const existingSetting = await storage.getSeoSettingByPageKey(pageKey);
      if (!existingSetting) {
        return res.status(404).json({ message: "SEO setting not found" });
      }
      
      const success = await storage.deleteSeoSetting(pageKey);
      if (success) {
        res.status(204).end();
      } else {
        res.status(500).json({ message: "Failed to delete SEO setting" });
      }
    } catch (error) {
      console.error("Error deleting SEO setting:", error);
      res.status(500).json({ message: "Failed to delete SEO setting" });
    }
  });
  
  // Get SEO settings for a specific page (public)
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

  // Upload ebook file endpoint
  app.post("/api/admin/upload-ebook", async (req, res) => {
    try {
      // Check if user is authenticated and an admin
      if (!req.isAuthenticated() || !(req.user?.isAdmin)) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const upload = multer({
        storage: storage_config,
        limits: {
          fileSize: 20 * 1024 * 1024, // 20MB limit for PDFs
        },
        fileFilter: (req, file, cb) => {
          // Only accept PDF files
          if (file.mimetype === 'application/pdf') {
            cb(null, true);
          } else {
            cb(null, false);
            return cb(new Error('Only PDF files are allowed'));
          }
        }
      }).single('ebook');
      
      upload(req, res, async function(err) {
        if (err) {
          console.error("Error uploading file:", err);
          return res.status(400).json({ error: err.message });
        }
        
        if (!req.file) {
          return res.status(400).json({ error: 'No file uploaded' });
        }
        
        // Create ebooks directory if it doesn't exist
        const ebooksDir = path.join(uploadDir, 'ebooks');
        if (!fs.existsSync(ebooksDir)) {
          fs.mkdirSync(ebooksDir, { recursive: true });
        }
        
        // Move the file to the ebooks directory
        const originalPath = req.file.path;
        const filename = `domain-guide-${Date.now()}.pdf`;
        const targetPath = path.join(ebooksDir, filename);
        
        if (originalPath !== targetPath) {
          fs.renameSync(originalPath, targetPath);
        }
        
        // Get filesize in MB (rounded to 1 decimal place)
        const stats = fs.statSync(targetPath);
        const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(1);
        
        // Update the ebook page content
        const ebookContent = await storage.getPageContent('ebook-section');
        
        if (ebookContent) {
          await storage.updatePageContent('ebook-section', {
            pageKey: 'ebook-section',
            content: ebookContent.content,
            filePath: targetPath,
            fileName: req.file.originalname,
            fileSize: parseFloat(fileSizeMB)
          });
        } else {
          await storage.createPageContent({
            pageKey: 'ebook-section',
            title: 'Domain Name Guide Ebook',
            content: '<p>The complete guide to domain name acquisition and investment</p>',
            filePath: targetPath,
            fileName: req.file.originalname,
            fileSize: parseFloat(fileSizeMB)
          });
        }
        
        res.json({ 
          success: true,
          file: {
            path: targetPath,
            name: req.file.originalname,
            size: fileSizeMB
          }
        });
      });
    } catch (error: any) {
      console.error('Error handling ebook upload:', error);
      res.status(500).json({ error: error?.message || 'Unknown error uploading ebook' });
    }
  });
  
  // Get ebook info
  app.get("/api/admin/ebook-info", async (req, res) => {
    try {
      // Check if user is authenticated and an admin
      if (!req.isAuthenticated() || !(req.user?.isAdmin)) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const ebookContent = await storage.getPageContent('ebook-section');
      
      if (!ebookContent || !ebookContent.filePath) {
        return res.json({ 
          exists: false,
          downloadCount: await storage.getAllEmailSubmissions().then(submissions => submissions.length)
        });
      }
      
      // Check if file exists
      const fileExists = fs.existsSync(ebookContent.filePath);
      
      res.json({
        exists: fileExists,
        fileName: ebookContent.fileName || 'Domain Name Guide.pdf',
        filePath: ebookContent.filePath,
        fileSize: ebookContent.fileSize || '0',
        downloadCount: await storage.getAllEmailSubmissions().then(submissions => submissions.length)
      });
    } catch (error: any) {
      console.error('Error getting ebook info:', error);
      res.status(500).json({ error: error?.message || 'Unknown error retrieving ebook info' });
    }
  });

  // Domain Inquiry Management API routes
  
  // Get all inquiries (admin)
  app.get("/api/admin/inquiries", async (req, res) => {
    try {
      // Check if user is authenticated and an admin
      if (!req.isAuthenticated() || !(req.user?.isAdmin)) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const inquiries = await storage.getAllInquiries();
      
      // Get domain names for each inquiry
      const inquiriesWithDomainNames = await Promise.all(
        inquiries.map(async (inquiry) => {
          const domain = await storage.getDomain(inquiry.domainId);
          return {
            ...inquiry,
            domainName: domain?.name || `Unknown (ID: ${inquiry.domainId})`
          };
        })
      );
      
      res.json(inquiriesWithDomainNames);
    } catch (error) {
      console.error("Error fetching inquiries:", error);
      res.status(500).json({ message: "Failed to fetch inquiries" });
    }
  });
  
  // Get inquiry by ID (admin)
  app.get("/api/admin/inquiries/:id", async (req, res) => {
    try {
      // Check if user is authenticated and an admin
      if (!req.isAuthenticated() || !(req.user?.isAdmin)) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid inquiry ID" });
      }
      
      const inquiry = await storage.getInquiry(id);
      if (!inquiry) {
        return res.status(404).json({ message: "Inquiry not found" });
      }
      
      // Get domain name
      const domain = await storage.getDomain(inquiry.domainId);
      
      // Get communications for this inquiry
      const communications = await storage.getCommunicationsByInquiry(id);
      
      res.json({
        ...inquiry,
        domainName: domain?.name || `Unknown (ID: ${inquiry.domainId})`,
        communications
      });
    } catch (error) {
      console.error("Error fetching inquiry:", error);
      res.status(500).json({ message: "Failed to fetch inquiry" });
    }
  });
  
  // Create an inquiry
  app.post("/api/inquiries", async (req, res) => {
    try {
      const inquiryData = insertInquirySchema.parse(req.body);
      const inquiry = await storage.createInquiry(inquiryData);
      res.status(201).json(inquiry);
    } catch (error) {
      console.error("Error creating inquiry:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid inquiry data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create inquiry" });
    }
  });
  
  // Update inquiry (admin)
  app.patch("/api/admin/inquiries/:id", async (req, res) => {
    try {
      // Check if user is authenticated and an admin
      if (!req.isAuthenticated() || !(req.user?.isAdmin)) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid inquiry ID" });
      }
      
      const inquiry = await storage.updateInquiry(id, req.body);
      if (!inquiry) {
        return res.status(404).json({ message: "Inquiry not found" });
      }
      
      res.json(inquiry);
    } catch (error) {
      console.error("Error updating inquiry:", error);
      res.status(500).json({ message: "Failed to update inquiry" });
    }
  });
  
  // Update inquiry status (admin)
  app.patch("/api/admin/inquiries/:id/status", async (req, res) => {
    try {
      // Check if user is authenticated and an admin
      if (!req.isAuthenticated() || !(req.user?.isAdmin)) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid inquiry ID" });
      }
      
      const { status } = req.body;
      
      // Validate status
      if (!["new", "in_progress", "negotiating", "closed", "lost"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      
      const inquiry = await storage.updateInquiryStatus(id, status as InquiryStatus);
      if (!inquiry) {
        return res.status(404).json({ message: "Inquiry not found" });
      }
      
      res.json(inquiry);
    } catch (error) {
      console.error("Error updating inquiry status:", error);
      res.status(500).json({ message: "Failed to update inquiry status" });
    }
  });
  
  // Update inquiry priority (admin)
  app.patch("/api/admin/inquiries/:id/priority", async (req, res) => {
    try {
      // Check if user is authenticated and an admin
      if (!req.isAuthenticated() || !(req.user?.isAdmin)) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid inquiry ID" });
      }
      
      const { priority } = req.body;
      
      // Validate priority (0=normal, 1=high, 2=urgent)
      if (![0, 1, 2].includes(priority)) {
        return res.status(400).json({ message: "Invalid priority" });
      }
      
      const inquiry = await storage.updateInquiryPriority(id, priority);
      if (!inquiry) {
        return res.status(404).json({ message: "Inquiry not found" });
      }
      
      res.json(inquiry);
    } catch (error) {
      console.error("Error updating inquiry priority:", error);
      res.status(500).json({ message: "Failed to update inquiry priority" });
    }
  });
  
  // Create a communication for an inquiry (admin)
  app.post("/api/admin/inquiries/:id/communications", async (req, res) => {
    try {
      // Check if user is authenticated and an admin
      if (!req.isAuthenticated() || !(req.user?.isAdmin)) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const inquiryId = parseInt(req.params.id);
      if (isNaN(inquiryId)) {
        return res.status(400).json({ message: "Invalid inquiry ID" });
      }
      
      const communicationData = insertCommunicationSchema.parse({
        ...req.body,
        inquiryId
      });
      
      const communication = await storage.createCommunication(communicationData);
      res.status(201).json(communication);
    } catch (error) {
      console.error("Error creating communication:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid communication data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create communication" });
    }
  });
  
  // Get inquiries by domain ID
  app.get("/api/admin/domains/:id/inquiries", async (req, res) => {
    try {
      // Check if user is authenticated and an admin
      if (!req.isAuthenticated() || !(req.user?.isAdmin)) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const domainId = parseInt(req.params.id);
      if (isNaN(domainId)) {
        return res.status(400).json({ message: "Invalid domain ID" });
      }
      
      const inquiries = await storage.getInquiriesByDomain(domainId);
      res.json(inquiries);
    } catch (error) {
      console.error("Error fetching inquiries by domain:", error);
      res.status(500).json({ message: "Failed to fetch inquiries by domain" });
    }
  });
  
  // Get inquiries by status
  app.get("/api/admin/inquiries/by-status/:status", async (req, res) => {
    try {
      // Check if user is authenticated and an admin
      if (!req.isAuthenticated() || !(req.user?.isAdmin)) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const status = req.params.status as InquiryStatus;
      
      // Validate status
      if (!["new", "in_progress", "negotiating", "closed", "lost"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      
      const inquiries = await storage.getInquiriesByStatus(status);
      
      // Get domain names for each inquiry
      const inquiriesWithDomainNames = await Promise.all(
        inquiries.map(async (inquiry) => {
          const domain = await storage.getDomain(inquiry.domainId);
          return {
            ...inquiry,
            domainName: domain?.name || `Unknown (ID: ${inquiry.domainId})`
          };
        })
      );
      
      res.json(inquiriesWithDomainNames);
    } catch (error) {
      console.error("Error fetching inquiries by status:", error);
      res.status(500).json({ message: "Failed to fetch inquiries by status" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
