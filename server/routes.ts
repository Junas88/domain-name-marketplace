import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { db, backupDataToFile, verifyDataPersistence } from "./db";
import * as schema from "@shared/schema";
import { sql } from "drizzle-orm";
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
import crypto from 'crypto';

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
  
  // Export domains data as JSON for backup or deploying
  app.get("/api/admin/domains/export", async (req, res) => {
    try {
      // Check if user is authenticated and an admin
      if (!req.isAuthenticated() || !(req.user?.isAdmin)) {
        return res.status(403).json({ message: "Unauthorized" });
      }

      const domains = await storage.getAllDomains();
      
      // Set filename for download
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const filename = `domain-data-backup-${timestamp}.json`;
      
      // Set headers for file download
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
      
      // Return the domains as JSON file
      res.json({
        domains,
        exportDate: new Date().toISOString(),
        count: domains.length
      });
    } catch (error) {
      console.error("Error exporting domains:", error);
      res.status(500).json({ message: "Failed to export domains" });
    }
  });

  // Import domains from JSON backup
  app.post("/api/admin/domains/import", async (req, res) => {
    try {
      // Check if user is authenticated and an admin
      if (!req.isAuthenticated() || !(req.user?.isAdmin)) {
        return res.status(403).json({ message: "Unauthorized" });
      }

      const { domains } = req.body;
      
      if (!domains || !Array.isArray(domains) || domains.length === 0) {
        return res.status(400).json({ message: "Invalid or empty domains data" });
      }
      
      console.log(`📥 Importing ${domains.length} domains from backup...`);
      
      // Update each domain
      const results = await Promise.all(
        domains.map(async (domainData) => {
          try {
            // Find if domain already exists
            const existingDomain = await storage.getDomain(domainData.id);
            
            if (existingDomain) {
              // Update existing domain
              const updatedDomain = await storage.updateDomain(domainData.id, {
                name: domainData.name,
                description: domainData.description,
                price: domainData.price,
                category: domainData.category,
                length: domainData.length,
                isSold: domainData.isSold,
                viewCount: domainData.viewCount
              });
              return { id: domainData.id, action: "updated", success: true };
            } else {
              // Create new domain with default values
              const newDomain = await storage.createDomain({
                name: domainData.name,
                description: domainData.description,
                price: domainData.price,
                category: domainData.category,
                length: domainData.length,
                isSold: domainData.isSold || false
                // viewCount will be set to 0 by default in the schema
              });
              return { id: newDomain.id, action: "created", success: true };
            }
          } catch (error) {
            console.error(`Error processing domain ${domainData.id}:`, error);
            return { id: domainData.id, action: "failed", success: false };
          }
        })
      );
      
      const successCount = results.filter(r => r.success).length;
      
      res.json({
        success: true,
        message: `Successfully processed ${successCount} out of ${domains.length} domains`,
        created: results.filter(r => r.action === "created").length,
        updated: results.filter(r => r.action === "updated").length,
        failed: results.filter(r => !r.success).length
      });
    } catch (error) {
      console.error("Error importing domains:", error);
      res.status(500).json({ message: "Failed to import domains" });
    }
  });
  
  // Get data versions information for tracking domain persistence
  app.get("/api/admin/data-versions", async (req, res) => {
    try {
      // Check if user is authenticated and an admin
      if (!req.isAuthenticated() || !(req.user?.isAdmin)) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      // Set cache-busting headers
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      
      // Query the latest data versions
      const dataVersions = await db.query.dataVersions.findMany({
        orderBy: (dataVersions, { desc }) => [desc(dataVersions.lastUpdated)],
        limit: 20
      });
      
      res.json(dataVersions);
    } catch (error) {
      console.error("Error fetching data versions:", error);
      res.status(500).json({ message: "Failed to fetch data versions" });
    }
  });
  
  // Special production sync endpoint - forces database refresh with transaction logging
  app.post("/api/admin/force-sync", async (req, res) => {
    try {
      // Check if user is authenticated and an admin
      if (!req.isAuthenticated() || !(req.user?.isAdmin)) {
        return res.status(403).json({ message: "Unauthorized" });
      }

      console.log("⚠️ FORCE SYNC REQUESTED - Refreshing all domain data");
      
      // Log this major operation in the transaction log
      try {
        await db.insert(schema.dataVersions).values({
          dataType: "domains",
          version: schema.DB_VERSION,
          details: "Force sync initiated by admin",
          recordCount: -1, // Will be updated after we get the domains
        });
      } catch (logErr) {
        console.error("Failed to log data version for force sync:", logErr);
        // Continue anyway
      }

      // Set cache-busting headers
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      res.setHeader('Surrogate-Control', 'no-store');
      
      // Clear any existing domain cache in memory
      try {
        // Using a safe type-casting approach to access potential global cache
        const globalObj = global as any;
        if (globalObj.__domainCache) {
          console.log("Clearing global domain cache");
          globalObj.__domainCache = null;
        }
      } catch (e) {
        console.log("No global domain cache to clear");
      }

      // Clear any CDN or proxy caches with a special header
      res.setHeader('X-Cache-Invalidate', 'true');

      // Perform a complete refresh of all domain data
      const domains = await storage.getAllDomains(true); // Pass true to force fresh DB query
      
      // Force update each domain with its current data to refresh timestamps and force cache invalidation
      const refreshResults = await Promise.all(
        domains.map(async (domain) => {
          try {
            // Add a tiny random adjustment to force update
            // This ensures the price is actually updated in the database
            const randomAdjustment = domain.price > 10000 ? 0.01 : 0;
            const newPrice = parseFloat((domain.price + randomAdjustment).toFixed(2));
            
            // Update the domain with the slightly adjusted price
            // Note: Domain model has built-in timestamps that will be updated automatically
            const updatedDomain = await storage.updateDomain(domain.id, {
              price: newPrice,
              // The server will automatically update timestamps
            });
            
            console.log(`Force updated domain ${domain.id} (${domain.name}): $${domain.price} -> $${newPrice}`);
            return { id: domain.id, success: true, domain: updatedDomain };
          } catch (error) {
            console.error(`Error refreshing domain ${domain.id}:`, error);
            return { id: domain.id, success: false };
          }
        })
      );

      const successCount = refreshResults.filter(r => r.success).length;

      // Apply a short delay to ensure DB writes are complete
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Log the completion of this force sync operation
      try {
        await db.update(schema.dataVersions)
          .set({
            recordCount: successCount,
            lastUpdated: new Date(),
            checksum: Date.now().toString(), // Simple checksum using current timestamp
            details: `Force sync completed. Updated ${successCount} of ${domains.length} domains.`
          })
          .where(sql`data_type = 'domains' AND created_at = (SELECT MAX(created_at) FROM data_versions WHERE data_type = 'domains')`);
          
        // Create a full backup of domain data for safety
        const domainData = refreshResults.filter(r => r.success).map(r => r.domain);
        await backupDataToFile(domainData, 'domains-after-sync');
      } catch (e) {
        console.error("Error updating dataVersions after force sync:", e);
        // Continue anyway
      }

      res.json({
        success: true,
        message: `Successfully refreshed ${successCount} out of ${domains.length} domains`,
        refreshed: successCount,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error with force sync:", error);
      res.status(500).json({ message: "Failed to force sync domain data" });
    }
  });
  
  // Get all domains
  app.get("/api/domains", async (req, res) => {
    try {
      // Set cache-control headers to prevent caching of domain data
      // This ensures pricing is always fresh
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      res.setHeader('Surrogate-Control', 'no-store');
      
      // Check if force refresh is requested via header or query parameter
      const forceRefresh = 
        req.headers['x-force-refresh'] === 'true' || 
        req.query.forceRefresh === 'true' ||
        req.query.t !== undefined; // Timestamp in URL is another indicator of desired force refresh
      
      if (forceRefresh) {
        console.log('Force refreshing domains due to explicit request');
      }
      
      const domains = await storage.getAllDomains(forceRefresh);
      res.json(domains);
    } catch (error) {
      console.error("Error fetching domains:", error);
      res.status(500).json({ message: "Failed to fetch domains" });
    }
  });
  
  // Get recently sold domains
  app.get("/api/domains/recently-sold", async (req, res) => {
    try {
      // Set cache-control headers to prevent caching of domain data
      // This ensures pricing and sold status is always fresh
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      res.setHeader('Surrogate-Control', 'no-store');
      
      // Check if force refresh is requested via header or query parameter
      const forceRefresh = 
        req.headers['x-force-refresh'] === 'true' || 
        req.query.forceRefresh === 'true' ||
        req.query.t !== undefined; // Timestamp in URL is another indicator of desired force refresh
      
      if (forceRefresh) {
        console.log('Force refreshing recently sold domains due to explicit request');
        
        // First refresh all domains to ensure we're working with fresh data
        await storage.getAllDomains(true);
      }
      
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
      // Set cache-control headers to prevent caching of domain data
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      res.setHeader('Surrogate-Control', 'no-store');
      
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
  
  // Update a domain with enhanced persistence and logging
  app.patch("/api/admin/domains/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid domain ID" });
      }
      
      // Get existing domain data for comparison
      const existingDomain = await storage.getDomain(id);
      if (!existingDomain) {
        return res.status(404).json({ message: "Domain not found" });
      }
      
      console.log(`📝 Domain update request - ID: ${id}, Name: ${existingDomain.name}, User: ${req.user?.username || 'unknown'}`);
      
      // Calculate percentage change if price is being updated
      let changePercentage = null;
      if (req.body.price !== undefined && existingDomain.price !== undefined) {
        changePercentage = Math.round(((req.body.price - existingDomain.price) / existingDomain.price) * 100);
      }
      
      // Log price changes in dedicated table
      if (req.body.price !== undefined && req.body.price !== existingDomain.price) {
        try {
          // Log the price change in our audit table
          await db.insert(schema.priceChangeLogs).values({
            domainId: id,
            domainName: existingDomain.name,
            oldPrice: existingDomain.price,
            newPrice: req.body.price,
            changePercentage,
            userId: req.user?.id || null,
            ipAddress: req.ip,
            reason: req.body.reason || "Manual price update",
          });
          
          console.log(`📊 Price change logged for ${existingDomain.name}: $${existingDomain.price} → $${req.body.price} (${changePercentage}%)`);
        } catch (logErr) {
          console.error("⚠️ Failed to log price change:", logErr);
          // Continue with update even if logging fails
        }
      }
      
      // Apply the update with extra resilience measures
      let updatedDomain = null;
      let retryCount = 0;
      const maxRetries = 3;
      
      while (retryCount < maxRetries && !updatedDomain) {
        try {
          updatedDomain = await storage.updateDomain(id, req.body);
          
          // Verify the update was applied correctly for price changes
          if (req.body.price !== undefined) {
            const verifyDomain = await storage.getDomain(id);
            
            if (verifyDomain && verifyDomain.price !== req.body.price) {
              console.error(`⚠️ Price verification failed! Expected ${req.body.price}, got ${verifyDomain.price}`);
              throw new Error("Price verification failed");
            }
          }
          
          console.log(`✅ Domain ${existingDomain.name} updated successfully`);
        } catch (updateErr) {
          retryCount++;
          console.error(`❌ Update attempt ${retryCount} failed:`, updateErr);
          
          if (retryCount >= maxRetries) {
            throw new Error(`Failed to update domain after ${maxRetries} attempts`);
          }
          
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      
      // Set cache-busting headers
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      res.setHeader('Surrogate-Control', 'no-store');
      
      // Clear any CDN or proxy caches with a special header
      res.setHeader('X-Cache-Invalidate', `domains/${id}`);
      
      // Force cache refresh for all domain-related queries
      res.setHeader('X-Force-Refresh', 'true');
      
      res.json(updatedDomain);
    } catch (error) {
      console.error("Error updating domain:", error);
      res.status(500).json({ 
        message: "Failed to update domain", 
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // DELETE all domains (bulk operation)
  app.delete("/api/admin/domains/all", async (req, res) => {
    try {
      // Check if user is authenticated and an admin
      if (!req.isAuthenticated() || !(req.user?.isAdmin)) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      // Get confirmation code from request
      const { confirmationCode } = req.body;
      
      if (confirmationCode !== 'DELETE-ALL-DOMAINS') {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid confirmation code. Please provide the correct code to confirm this irreversible action.' 
        });
      }
      
      console.log('⚠️ DELETING ALL DOMAINS as requested by admin user');
      
      // Get all domains first to count them
      const allDomains = await storage.getAllDomains();
      const count = allDomains.length;
      
      // Create a backup before deletion
      await backupDataToFile(allDomains, 'domains-pre-deletion-backup');
      
      // Use the optimized deleteAllDomains method which handles deletion more efficiently
      const deletedCount = await storage.deleteAllDomains(confirmationCode);
      
      // Log the deletion operation
      await db.insert(schema.dataVersions).values({
        dataType: 'domains',
        operation: 'bulk-delete',
        version: schema.DB_VERSION, // Add the missing version value
        recordCount: deletedCount,
        lastUpdated: new Date(),
        checksum: Date.now().toString(),
        details: `Admin requested deletion of all domains. ${deletedCount} of ${count} domains were deleted.`
      });
      
      res.json({
        success: true,
        message: `Successfully deleted ${deletedCount} out of ${count} domains`,
        deletedCount,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error deleting all domains:", error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to delete domains. Please try again or contact support." 
      });
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
  
  // Bulk mark domains as sold
  app.patch("/api/admin/domains/bulk/mark-sold", async (req, res) => {
    try {
      const { ids } = req.body;
      
      if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ message: "Invalid domain IDs" });
      }
      
      const results = await Promise.all(
        ids.map(async (id) => {
          try {
            return await storage.markDomainAsSold(id);
          } catch (error) {
            console.error(`Error marking domain ${id} as sold:`, error);
            return null;
          }
        })
      );
      
      const successCount = results.filter(Boolean).length;
      
      res.json({
        success: true,
        message: `Successfully marked ${successCount} out of ${ids.length} domains as sold`,
        results: results.filter(Boolean)
      });
    } catch (error) {
      console.error("Error with bulk mark as sold:", error);
      res.status(500).json({ message: "Failed to process bulk mark as sold" });
    }
  });
  
  // Bulk cancel sold status (mark as not sold)
  app.patch("/api/admin/domains/bulk/cancel-sold", async (req, res) => {
    try {
      const { ids } = req.body;
      
      if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ message: "Invalid domain IDs" });
      }
      
      const results = await Promise.all(
        ids.map(async (id) => {
          try {
            // Update domain to set isSold to false
            return await storage.updateDomain(id, { isSold: false });
          } catch (error) {
            console.error(`Error canceling sold status for domain ${id}:`, error);
            return null;
          }
        })
      );
      
      const successCount = results.filter(Boolean).length;
      
      res.json({
        success: true,
        message: `Successfully canceled sold status for ${successCount} out of ${ids.length} domains`,
        results: results.filter(Boolean)
      });
    } catch (error) {
      console.error("Error with bulk cancel sold status:", error);
      res.status(500).json({ message: "Failed to process bulk cancel sold status" });
    }
  });
  
  // Bulk delete domains
  app.delete("/api/admin/domains/bulk", async (req, res) => {
    try {
      const { ids } = req.body;
      
      if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ message: "Invalid domain IDs" });
      }
      
      console.log(`Bulk deleting ${ids.length} domains`);
      const deletedCount = await storage.bulkDeleteDomains(ids);
      
      // Create a results array to maintain compatibility with existing code
      const results = ids.map(id => ({
        id,
        success: true // We're assuming success for all domains since bulkDeleteDomains doesn't return individual results
      }));
      
      res.json({
        success: true,
        message: `Successfully deleted ${deletedCount} out of ${ids.length} domains`,
        results
      });
    } catch (error) {
      console.error("Error with bulk delete:", error);
      res.status(500).json({ message: "Failed to process bulk delete" });
    }
  });
  
  // Bulk update domain prices with enhanced persistence and logging
  app.patch("/api/admin/domains/bulk/update-prices", async (req, res) => {
    try {
      const { ids, adjustmentType, adjustmentValue } = req.body;
      
      if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ message: "Invalid domain IDs" });
      }
      
      // Log this bulk operation for audit purposes
      console.log(`📊 BULK PRICE UPDATE: ${ids.length} domains, type: ${adjustmentType}, value: ${adjustmentValue}, user: ${req.user?.username || 'unknown'}, time: ${new Date().toISOString()}`);
      
      
      if (!adjustmentType || !['fixed', 'percentage'].includes(adjustmentType)) {
        return res.status(400).json({ message: "Invalid adjustment type" });
      }
      
      if (isNaN(adjustmentValue)) {
        return res.status(400).json({ message: "Invalid adjustment value" });
      }
      
      // Get all domains to update
      const domainsToUpdate = await Promise.all(
        ids.map(id => storage.getDomain(id))
      );
      
      // Filter out non-existent domains
      const validDomains = domainsToUpdate.filter(Boolean);
      
      const results = await Promise.all(
        validDomains.map(async (domain) => {
          try {
            let newPrice;
            
            // Make sure domain is defined
            if (!domain) {
              throw new Error(`Domain not found`);
            }
            
            // Check if this is a direct price update (adjustmentValue is negative)
            // In our updated UI, we're sending negative values to indicate "set price to this absolute value"
            if (adjustmentValue < 0 && adjustmentType === 'fixed') {
              // Direct price update - set the price to the absolute value
              newPrice = Math.abs(adjustmentValue);
              console.log(`Direct price update for domain ${domain.id}: Setting price to $${newPrice}`);
            } else if (adjustmentType === 'fixed') {
              // Traditional adjustment - add or subtract a fixed amount
              newPrice = domain.price + Number(adjustmentValue);
              console.log(`Price adjustment for domain ${domain.id}: ${adjustmentValue > 0 ? 'Adding' : 'Subtracting'} $${Math.abs(adjustmentValue)}`);
            } else {
              // Percentage change
              newPrice = domain.price * (1 + Number(adjustmentValue) / 100);
              console.log(`Price adjustment for domain ${domain.id}: ${adjustmentValue > 0 ? 'Increasing' : 'Decreasing'} by ${Math.abs(adjustmentValue)}%`);
            }
            
            // Ensure price is never negative
            newPrice = Math.max(0, newPrice);
            
            // Round to 2 decimal places
            newPrice = Math.round(newPrice * 100) / 100;
            
            // Log price change before applying it
            if (domain.price !== newPrice) {
              try {
                const changePercentage = Math.round(((newPrice - domain.price) / domain.price) * 100);
                
                // Log the price change in our audit table
                await db.insert(schema.priceChangeLogs).values({
                  domainId: domain.id,
                  domainName: domain.name,
                  oldPrice: domain.price,
                  newPrice: newPrice,
                  changePercentage,
                  userId: req.user?.id || null,
                  ipAddress: req.ip,
                  reason: "Bulk price update",
                });
                
                console.log(`📊 Bulk update: Price change for ${domain.name}: $${domain.price} → $${newPrice} (${changePercentage}%)`);
              } catch (logErr) {
                console.error(`⚠️ Failed to log bulk price change for ${domain.name}:`, logErr);
                // Continue with update even if logging fails
              }
            }
            
            // Update the domain with new price with retry mechanism
            if (!domain) return null;
            
            let updatedDomain = null;
            let retryCount = 0;
            const maxRetries = 3;
            
            while (retryCount < maxRetries && !updatedDomain) {
              try {
                updatedDomain = await storage.updateDomain(domain.id, { price: newPrice });
                
                // Verify the update was applied correctly
                const verifyDomain = await storage.getDomain(domain.id);
                
                if (verifyDomain && verifyDomain.price !== newPrice) {
                  console.error(`⚠️ Bulk price verification failed for ${domain.name}! Expected ${newPrice}, got ${verifyDomain.price}`);
                  throw new Error("Price verification failed");
                }
              } catch (updateErr) {
                retryCount++;
                console.error(`❌ Bulk update attempt ${retryCount} failed for ${domain.name}:`, updateErr);
                
                if (retryCount >= maxRetries) {
                  throw new Error(`Failed to update domain ${domain.name} after ${maxRetries} attempts`);
                }
                
                // Wait before retrying
                await new Promise(resolve => setTimeout(resolve, 1000));
              }
            }
            
            return updatedDomain;
          } catch (error) {
            console.error(`Error updating price for domain ${domain?.id ?? 'unknown'}:`, error);
            return null;
          }
        })
      );
      
      const successCount = results.filter(Boolean).length;
      
      // Create a record of this bulk price update in data versions
      try {
        const timestamp = new Date();
        await db.insert(schema.dataVersions).values({
          dataType: "domains-bulk-price-update",
          version: schema.DB_VERSION,
          recordCount: successCount,
          details: `Bulk price update by ${req.user?.username || 'unknown'}: ${adjustmentType} adjustment of ${adjustmentValue}`,
          lastUpdated: timestamp,
          checksum: crypto.createHash('sha256').update(`${timestamp.toISOString()}-${ids.join(',')}`).digest('hex')
        });
        
        // Create a backup of the successful updates
        const updatedDomains = results.filter(Boolean);
        if (updatedDomains.length > 0) {
          await backupDataToFile(updatedDomains, 'domains-after-bulk-update');
          
          // Verify persistence
          const isVerified = await verifyDataPersistence('domains', updatedDomains);
          console.log(`🔍 Data persistence verification: ${isVerified ? 'PASSED ✅' : 'FAILED ❌'}`);
          
          if (!isVerified) {
            console.error("⚠️ Data persistence verification failed after bulk price update");
          }
        }
      } catch (backupError) {
        console.error("Failed to log/backup bulk price update:", backupError);
        // Continue anyway - the updates themselves succeeded
      }
      
      res.json({
        success: true,
        message: `Successfully updated prices for ${successCount} out of ${ids.length} domains`,
        results: results.filter(Boolean)
      });
    } catch (error) {
      console.error("Error with bulk price update:", error);
      res.status(500).json({ message: "Failed to process bulk price update" });
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
  
  // Get most viewed domains
  app.get("/api/admin/domains/most-viewed", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const stats = await storage.getDomainStats();
      
      // The mostViewedDomains is already part of stats for DatabaseStorage
      // but we need to handle the case where it's not available (MemStorage)
      if (stats && 'mostViewedDomains' in stats && Array.isArray(stats.mostViewedDomains)) {
        // Limit the results
        const limitedDomains = stats.mostViewedDomains.slice(0, limit);
        res.json(limitedDomains);
      } else {
        // If mostViewedDomains is not available, return an empty array
        res.json([]);
      }
    } catch (error) {
      console.error("Error fetching most viewed domains:", error);
      res.status(500).json({ message: "Failed to fetch most viewed domains" });
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
  
  // Special no-cache endpoint for contact info
  app.get("/api/fresh-content/contact-info", async (req, res) => {
    try {
      // Set cache-busting headers
      res.set({
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Surrogate-Control': 'no-store'
      });
      
      // Force fresh data from database
      const pageContent = await storage.getPageContent('contact-info');
      
      if (!pageContent) {
        return res.status(404).json({ message: "Contact info not found" });
      }
      
      console.log("Serving fresh contact info:", pageContent);
      res.json(pageContent);
    } catch (error) {
      console.error("Error fetching contact info:", error);
      res.status(500).json({ message: "Failed to fetch contact info" });
    }
  });

  // Get a specific page content by key (public)
  app.get("/api/page-contents/:pageKey", async (req, res) => {
    try {
      const pageKey = req.params.pageKey;
      
      // For contact-related content, add no-cache headers
      if (pageKey === 'contact' || pageKey === 'contact-info') {
        res.set({
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
          'Surrogate-Control': 'no-store'
        });
        console.log(`Serving ${pageKey} with no-cache headers`);
      }
      
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
  
  // NOTE: Export and import domains functionality is already defined above
  
  // Handle file uploads for additional import methods
  app.post("/api/admin/domains/import-csv", upload.single('csv'), async (req, res) => {
    try {
      // Check if user is authenticated and an admin
      if (!req.isAuthenticated() || !(req.user?.isAdmin)) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      if (!req.file) {
        return res.status(400).json({ message: "No CSV file uploaded" });
      }
      
      // Read CSV file
      const fileContent = fs.readFileSync(req.file.path, 'utf8');
      const rows = fileContent.split('\n');
      
      // First row is header
      const header = rows[0].split(',');
      
      // Process each row from 2nd row onward
      const results: {
        total: number;
        success: number;
        failed: number;
        errors: string[];
      } = {
        total: rows.length - 1,
        success: 0,
        failed: 0,
        errors: []
      };
      
      for (let i = 1; i < rows.length; i++) {
        if (!rows[i].trim()) continue; // Skip empty rows
        
        const values = rows[i].split(',');
        
        try {
          // Map CSV values to domain object
          // Basic CSV parsing (doesn't handle quoted values with commas)
          // For a real implementation, consider using a CSV parsing library
          const domainData = {
            name: values[1]?.replace(/^"(.*)"$/, '$1') || '',  // Remove quotes if present
            description: values[2]?.replace(/^"(.*)"$/, '$1') || '',
            price: parseFloat(values[3] || '0'),
            category: values[4]?.replace(/^"(.*)"$/, '$1') || '',
            length: parseInt(values[5] || '0'),
            isSold: values[6]?.toLowerCase() === 'true'
          };
          
          // Validate data
          if (!domainData.name) {
            throw new Error("Domain name is required");
          }
          
          // Check if domain with this name already exists
          const domains = await storage.searchDomains(domainData.name);
          const existingDomain = domains.find(d => d.name.toLowerCase() === domainData.name.toLowerCase());
          
          if (existingDomain) {
            // Update existing domain
            await storage.updateDomain(existingDomain.id, domainData);
          } else {
            // Create new domain
            await storage.createDomain(domainData);
          }
          
          results.success++;
        } catch (error) {
          results.failed++;
          results.errors.push(`Row ${i}: ${error instanceof Error ? error.message : String(error)}`);
        }
      }
      
      // Delete the uploaded file
      fs.unlinkSync(req.file.path);
      
      res.json({
        success: true,
        message: `Import completed: ${results.success} domains imported/updated, ${results.failed} failed`,
        results
      });
    } catch (error) {
      console.error("Error importing domains:", error);
      
      // Delete the uploaded file if it exists
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      
      res.status(500).json({ message: "Failed to import domains", error: error instanceof Error ? error.message : String(error) });
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
  
  // Middleware to check if user is authenticated and an admin
  const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    next();
  };
  
  const adminMiddleware = (req: Request, res: Response, next: NextFunction) => {
    if (!req.user?.isAdmin) {
      return res.status(403).json({ message: "Not authorized" });
    }
    next();
  };
  
  // Data Backup & Restore Endpoints
  app.get("/api/admin/backup", authMiddleware, adminMiddleware, async (req, res) => {
    try {
      // Get all data from each collection
      const allDomains = await storage.getAllDomains();
      const allPageContents = await storage.getAllPageContents();
      const allSeoSettings = await storage.getAllSeoSettings();
      const allConsultations = await storage.getAllConsultations();
      const allEmailSubmissions = await storage.getAllEmailSubmissions();
      const allOffers = []; // We'll need to get offers for each domain
      
      // Get offers for each domain
      for (const domain of allDomains) {
        const domainOffers = await storage.getOffersByDomainId(domain.id);
        allOffers.push(...domainOffers);
      }
      
      // Create a single backup object with all data
      const backupData = {
        timestamp: new Date().toISOString(),
        version: "1.0.0",
        domains: allDomains,
        pageContents: allPageContents,
        seoSettings: allSeoSettings,
        consultations: allConsultations,
        emailSubmissions: allEmailSubmissions,
        offers: allOffers,
      };
      
      // Set appropriate headers for file download
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename=domain-guide-backup-${new Date().toISOString().split('T')[0]}.json`);
      
      // Send the backup data as a downloadable file
      res.json(backupData);
    } catch (error) {
      console.error("Backup error:", error);
      res.status(500).json({ 
        message: "Failed to create backup", 
        error: error instanceof Error ? error.message : String(error) 
      });
    }
  });
  
  app.post("/api/admin/restore", authMiddleware, adminMiddleware, async (req, res) => {
    try {
      const backupData = req.body;
      
      if (!backupData || !backupData.domains || !backupData.pageContents) {
        return res.status(400).json({ message: "Invalid backup data format" });
      }
      
      // Start a transaction or implement a way to rollback if something fails
      let restoredItems = {
        domains: 0,
        pageContents: 0,
        seoSettings: 0,
        consultations: 0,
        emailSubmissions: 0,
        offers: 0
      };
      
      // Restore domains (without overwriting existing by default)
      for (const domain of backupData.domains) {
        try {
          // Check if domain exists
          const existingDomain = await storage.getDomain(domain.id);
          
          if (existingDomain) {
            // Update existing domain
            await storage.updateDomain(domain.id, domain);
          } else {
            // Create new domain
            await storage.createDomain(domain);
          }
          restoredItems.domains++;
        } catch (e) {
          console.error("Error restoring domain:", domain.id, e);
        }
      }
      
      // Restore page contents
      for (const content of backupData.pageContents) {
        try {
          const existingContent = await storage.getPageContent(content.pageKey);
          
          if (existingContent) {
            // Update existing content
            await storage.updatePageContent(content.pageKey, content);
          } else {
            // Create new content
            await storage.createPageContent(content);
          }
          restoredItems.pageContents++;
        } catch (e) {
          console.error("Error restoring page content:", content.pageKey, e);
        }
      }
      
      // Restore SEO settings
      if (backupData.seoSettings) {
        for (const seo of backupData.seoSettings) {
          try {
            const existingSeo = await storage.getSeoSettingByPageKey(seo.pageKey);
            
            if (existingSeo) {
              // Update existing SEO
              await storage.updateSeoSetting(seo.pageKey, seo);
            } else {
              // Create new SEO
              await storage.createSeoSetting(seo);
            }
            restoredItems.seoSettings++;
          } catch (e) {
            console.error("Error restoring SEO setting:", seo.pageKey, e);
          }
        }
      }
      
      // Restore consultations
      if (backupData.consultations) {
        for (const consultation of backupData.consultations) {
          try {
            await storage.createConsultation(consultation);
            restoredItems.consultations++;
          } catch (e) {
            console.error("Error restoring consultation:", consultation.id, e);
          }
        }
      }
      
      // Restore email submissions
      if (backupData.emailSubmissions) {
        for (const submission of backupData.emailSubmissions) {
          try {
            await storage.createEmailSubmission(submission);
            restoredItems.emailSubmissions++;
          } catch (e) {
            console.error("Error restoring email submission:", submission.id, e);
          }
        }
      }
      
      // Restore offers
      if (backupData.offers) {
        for (const offer of backupData.offers) {
          try {
            await storage.createOffer(offer);
            restoredItems.offers++;
          } catch (e) {
            console.error("Error restoring offer:", offer.id, e);
          }
        }
      }
      
      res.json({ 
        message: "Backup restored successfully", 
        restored: restoredItems
      });
    } catch (error) {
      console.error("Restore error:", error);
      res.status(500).json({ 
        message: "Failed to restore backup", 
        error: error instanceof Error ? error.message : String(error) 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
