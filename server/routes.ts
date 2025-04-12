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

// Helper function to check if we're in a deployment environment
const isDeployment = process.env.REPL_DEPLOYMENT === 'true';

// Stripe functionality has been removed

export async function registerRoutes(app: Express): Promise<Server> {
  // Serve static admin HTML files
  app.get('/admin.html', (req, res) => {
    res.sendFile(path.resolve('public/admin.html'));
  });
  
  app.get('/admin-dashboard.html', (req, res) => {
    res.sendFile(path.resolve('public/admin-dashboard.html'));
  });
  
  // Serve the admin page directly instead of redirecting
  app.get('/admin', (req, res) => {
    // Embedded admin HTML (simplified version)
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
            window.location.href = '/admin-dashboard';
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
  
  // Serve the admin dashboard page directly
  app.get('/admin-dashboard', (req, res) => {
    // Embedded admin dashboard HTML
    const adminDashboardHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Admin Dashboard - Domain Name Guide</title>
  <style>
    body {
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
      margin: 0;
      padding: 0;
      background-color: #f8f8f8;
      color: #333;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }
    header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
      flex-wrap: wrap;
    }
    h1 {
      font-size: 28px;
      font-weight: 800;
      margin: 0;
      color: #000;
    }
    p {
      margin: 5px 0 0;
      color: #666;
    }
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: 4px;
      font-weight: 500;
      font-size: 14px;
      line-height: 1;
      padding: 10px 16px;
      cursor: pointer;
      text-decoration: none;
      user-select: none;
    }
    .btn-black {
      background-color: #000;
      color: #fff;
      border: none;
    }
    .btn-black:hover {
      background-color: #333;
    }
    .btn-outline {
      background-color: transparent;
      color: #000;
      border: 1px solid #000;
    }
    .btn-outline:hover {
      background-color: rgba(0,0,0,0.05);
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
      margin-bottom: 30px;
    }
    @media (max-width: 768px) {
      .grid {
        grid-template-columns: 1fr;
      }
      header {
        flex-direction: column;
        align-items: flex-start;
      }
      .header-actions {
        margin-top: 20px;
        width: 100%;
      }
    }
    .card {
      background-color: #fff;
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      padding: 20px;
    }
    .card-title {
      font-size: 14px;
      color: #666;
      margin-top: 0;
      margin-bottom: 10px;
      font-weight: 500;
    }
    .card-value {
      font-size: 24px;
      font-weight: 700;
      margin: 0;
    }
    .card-subtitle {
      font-size: 13px;
      color: #666;
      margin-top: 8px;
    }
    .tabs {
      display: flex;
      border-bottom: 1px solid #e5e5e5;
      margin-bottom: 20px;
      overflow-x: auto;
    }
    .tab {
      padding: 12px 20px;
      cursor: pointer;
      font-weight: 500;
      color: #666;
      border-bottom: 2px solid transparent;
    }
    .tab.active {
      color: #000;
      border-bottom-color: #000;
    }
    .btn-group {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin-top: 20px;
    }
  </style>
  <script>
    // Verify the user is logged in first
    window.addEventListener('DOMContentLoaded', async () => {
      try {
        const response = await fetch('/api/auth/user');
        if (response.ok) {
          const user = await response.json();
          if (user && user.isAdmin) {
            // User is admin, load data
            loadDashboardData();
            setupLogout();
            return;
          }
        }
        // Not authenticated, redirect to login
        window.location.href = '/auth';
      } catch (error) {
        console.error('Error checking authentication:', error);
        window.location.href = '/auth';
      }
    });
    
    // Load the dashboard stats
    async function loadDashboardData() {
      try {
        const response = await fetch('/api/admin/domains/stats');
        if (response.ok) {
          const stats = await response.json();
          
          // Update stats in the UI
          document.getElementById('total-domains').textContent = stats.totalDomains;
          document.getElementById('domains-sold').textContent = stats.soldDomains;
          document.getElementById('total-views').textContent = stats.totalViews;
          document.getElementById('total-revenue').textContent = '$' + stats.totalRevenue.toLocaleString();
          document.getElementById('avg-price').textContent = '$' + stats.averagePrice.toLocaleString();
          
          // Calculate conversion rate
          const conversionRate = stats.soldDomains > 0 
            ? ((stats.soldDomains / stats.totalDomains) * 100).toFixed(1) 
            : "0";
          document.getElementById('conversion-rate').textContent = conversionRate + '%';
        }
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      }
    }
    
    // Set up logout functionality
    function setupLogout() {
      document.getElementById('logout-btn').addEventListener('click', async () => {
        try {
          await fetch('/api/auth/logout', { method: 'POST' });
          window.location.href = '/';
        } catch (error) {
          console.error('Error logging out:', error);
        }
      });
    }
  </script>
</head>
<body>
  <div class="container">
    <header>
      <div>
        <h1>Admin Dashboard</h1>
        <p>Manage your domain listings, offers, and website content</p>
      </div>
      <div class="header-actions">
        <button id="logout-btn" class="btn btn-outline">Logout</button>
      </div>
    </header>
    
    <div class="grid">
      <div class="card">
        <h3 class="card-title">Total Domains</h3>
        <p class="card-value" id="total-domains">-</p>
      </div>
      <div class="card">
        <h3 class="card-title">Domains Sold</h3>
        <p class="card-value" id="domains-sold">-</p>
      </div>
      <div class="card">
        <h3 class="card-title">Total Views</h3>
        <p class="card-value" id="total-views">-</p>
      </div>
    </div>
    
    <div class="grid">
      <div class="card">
        <h3 class="card-title">Total Revenue</h3>
        <p class="card-value" id="total-revenue">-</p>
        <p class="card-subtitle">From sold domains</p>
      </div>
      <div class="card">
        <h3 class="card-title">Average Price</h3>
        <p class="card-value" id="avg-price">-</p>
        <p class="card-subtitle">Per domain</p>
      </div>
      <div class="card">
        <h3 class="card-title">Conversion Rate</h3>
        <p class="card-value" id="conversion-rate">-</p>
        <p class="card-subtitle">Domains sold / total domains</p>
      </div>
    </div>
    
    <div class="tabs">
      <div class="tab active">Dashboard Overview</div>
    </div>
    
    <div class="card">
      <h3 class="card-title">Admin Actions</h3>
      <p>Access the full admin dashboard with all features:</p>
      <div class="btn-group">
        <a href="/?admin=true" class="btn btn-black">Full Admin Dashboard</a>
        <a href="/" class="btn btn-outline">Return to Website</a>
      </div>
    </div>
  </div>
</body>
</html>`;
    res.setHeader('Content-Type', 'text/html');
    res.send(adminDashboardHtml);
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

  const httpServer = createServer(app);
  return httpServer;
}
