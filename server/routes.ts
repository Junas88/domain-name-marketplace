import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { 
  insertOfferSchema, 
  insertConsultationSchema,
  insertDomainSchema,
  insertPageContentSchema
} from "@shared/schema";
import { z } from "zod";
import Stripe from "stripe";
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

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

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
  
  // Verify purchase and get download link
  app.post("/api/verify-purchase/:pageKey", async (req, res) => {
    try {
      const { paymentIntentId, sessionId } = req.body;
      
      // Check if we have a session ID (direct checkout)
      if (sessionId) {
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        if (session.payment_status === 'paid' && session.metadata?.pageKey === req.params.pageKey) {
          const pageContent = await storage.getPageContent(req.params.pageKey);
          if (!pageContent || !pageContent.filePath) {
            return res.status(404).json({ message: "File not found" });
          }
          
          const downloadUrl = `/api/page-contents/${req.params.pageKey}/download?paymentVerified=true`;
          return res.json({
            success: true,
            downloadUrl
          });
        } else {
          return res.status(400).json({ message: "Invalid payment session" });
        }
      }
      
      // Otherwise check for payment intent ID
      if (!paymentIntentId) {
        return res.status(400).json({ message: "Payment intent ID or session ID is required" });
      }
      
      // Verify the payment intent with Stripe
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      
      if (paymentIntent.status !== 'succeeded') {
        return res.status(400).json({ message: "Payment has not been completed" });
      }
      
      const pageKey = req.params.pageKey;
      const pageContent = await storage.getPageContent(pageKey);
      
      if (!pageContent) {
        return res.status(404).json({ message: "Page content not found" });
      }
      
      // Check if the page has a file
      if (!pageContent.filePath || !pageContent.fileName) {
        return res.status(404).json({ message: "No file associated with this content" });
      }
      
      // Generate download URL with payment verification
      const downloadUrl = `/api/page-contents/${pageKey}/download?paymentVerified=true`;
      
      res.json({
        success: true,
        downloadUrl
      });
    } catch (error: any) {
      console.error("Error verifying purchase:", error);
      res.status(500).json({ message: "Failed to verify purchase: " + error.message });
    }
  });

  // Stripe payment routes
  app.post("/api/create-payment-intent", async (req, res) => {
    try {
      const { amount, pageKey } = req.body;
      
      let finalAmount = amount;
      
      // If a pageKey is provided, use the price from that page content
      if (pageKey) {
        const pageContent = await storage.getPageContent(pageKey);
        if (pageContent && pageContent.price) {
          finalAmount = pageContent.price;
        }
      }
      
      // For amount coming from the client, we need to be careful as it might already be in cents
      const amountInCents = pageKey ? Math.round(finalAmount * 100) : finalAmount;
      
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amountInCents,
        currency: "usd",
        metadata: {
          pageKey: pageKey || '',
          type: pageKey ? 'ebook_purchase' : 'regular_payment'
        }
      });
      
      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error: any) {
      console.error("Error creating payment intent:", error);
      res.status(500).json({ message: "Error creating payment intent: " + error.message });
    }
  });
  
  // Create a direct Stripe checkout session for ebooks
  app.post("/api/create-checkout-session", async (req, res) => {
    try {
      const { pageKey, successUrl, cancelUrl } = req.body;
      
      if (!pageKey) {
        return res.status(400).json({ message: "pageKey is required" });
      }
      
      // Get the page content to determine the price
      const pageContent = await storage.getPageContent(pageKey);
      if (!pageContent || !pageContent.price) {
        return res.status(404).json({ message: "Page content not found or has no price" });
      }
      
      // Create a Stripe checkout session
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: pageContent.title || 'Ebook Purchase',
                description: pageContent.metaDescription || 'Digital download',
              },
              unit_amount: Math.round(pageContent.price * 100), // Convert to cents
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: successUrl || `${req.headers.origin || ''}/ebook-success?pageKey=${pageKey}&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: cancelUrl || `${req.headers.origin || ''}/ebook?pageKey=${pageKey}`,
        metadata: {
          pageKey: pageKey,
          type: 'ebook_purchase'
        }
      });
      
      res.json({ url: session.url });
    } catch (error: any) {
      console.error("Error creating checkout session:", error);
      res.status(500).json({ message: "Error creating checkout session: " + error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
