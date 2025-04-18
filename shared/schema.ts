import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Version tracking for domain data to ensure persistence
export const DB_VERSION = "1.4.0"; // Updated with category enhancements

// Category definitions with colors and trend information
export const DOMAIN_CATEGORIES = {
  'business': { 
    color: '#3b82f6', // Blue
    label: 'Business',
    isTrending: true
  },
  'technology': { 
    color: '#10b981', // Green
    label: 'Technology',
    isTrending: true
  },
  'finance': { 
    color: '#f59e0b', // Amber
    label: 'Finance',
    isTrending: true
  },
  'health': { 
    color: '#ef4444', // Red
    label: 'Health',
    isTrending: false
  },
  'real-estate': { 
    color: '#8b5cf6', // Purple
    label: 'Real Estate',
    isTrending: false
  },
  'travel': { 
    color: '#ec4899', // Pink
    label: 'Travel',
    isTrending: false
  },
  'education': { 
    color: '#14b8a6', // Teal
    label: 'Education',
    isTrending: false
  },
  'entertainment': { 
    color: '#f97316', // Orange
    label: 'Entertainment',
    isTrending: true
  },
  'shopping': { 
    color: '#06b6d4', // Cyan
    label: 'Shopping',
    isTrending: true
  },
  'sports': { 
    color: '#84cc16', // Lime
    label: 'Sports',
    isTrending: false
  },
  'gaming': { 
    color: '#7c3aed', // Violet
    label: 'Gaming',
    isTrending: true
  },
  'ai': { 
    color: '#6366f1', // Indigo
    label: 'AI',
    isTrending: true
  },
  'crypto': { 
    color: '#facc15', // Yellow
    label: 'Crypto',
    isTrending: true
  },
  'food': { 
    color: '#ea580c', // Orange-dark
    label: 'Food & Dining',
    isTrending: false
  },
  'fashion': { 
    color: '#db2777', // Pink-dark
    label: 'Fashion',
    isTrending: true
  },
  'legal': { 
    color: '#4338ca', // Indigo-dark
    label: 'Legal',
    isTrending: false
  },
  'social': { 
    color: '#2563eb', // Blue-dark
    label: 'Social Media',
    isTrending: true
  },
  'eco': { 
    color: '#059669', // Green-dark
    label: 'Eco-Friendly',
    isTrending: true
  },
  'other': { 
    color: '#6b7280', // Gray
    label: 'Other',
    isTrending: false
  }
};

// User table with admin privileges
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  isAdmin: boolean("is_admin").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  isAdmin: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Domain listings table
export const domains = pgTable("domains", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: integer("price").notNull(),
  category: text("category").notNull(),
  length: integer("length").notNull(),
  extension: text("extension"),
  isFeatured: boolean("is_featured").default(false),
  isNew: boolean("is_new").default(false),
  isSold: boolean("is_sold").default(false).notNull(),
  viewCount: integer("view_count").default(0).notNull(),
  pendingDeletion: boolean("pending_deletion").default(false),
  lastSynced: timestamp("last_synced"),
  externalId: text("external_id"),
  externalSource: text("external_source"),
  externalData: text("external_data"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertDomainSchema = createInsertSchema(domains).omit({
  id: true,
  viewCount: true,
  createdAt: true,
  updatedAt: true
});

export type InsertDomain = z.infer<typeof insertDomainSchema>;
export type Domain = typeof domains.$inferSelect;

// Offers table
export const offers = pgTable("offers", {
  id: serial("id").primaryKey(),
  domainId: integer("domain_id").notNull(),
  amount: integer("amount").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  message: text("message"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertOfferSchema = createInsertSchema(offers).pick({
  domainId: true,
  amount: true,
  name: true,
  email: true,
  message: true,
});

export type InsertOffer = z.infer<typeof insertOfferSchema>;
export type Offer = typeof offers.$inferSelect;

// Consultations table
export const consultations = pgTable("consultations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  industry: text("industry").notNull(),
  message: text("message").notNull(),
  budget: text("budget").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertConsultationSchema = createInsertSchema(consultations).pick({
  name: true,
  email: true,
  industry: true,
  message: true,
  budget: true,
});

export type InsertConsultation = z.infer<typeof insertConsultationSchema>;
export type Consultation = typeof consultations.$inferSelect;

// Page content table for CMS
export const pageContents = pgTable("page_contents", {
  id: serial("id").primaryKey(),
  pageKey: text("page_key").notNull().unique(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  metaTitle: text("meta_title"),
  metaDescription: text("meta_description"),
  filePath: text("file_path"),
  fileName: text("file_name"),
  fileType: text("file_type"),
  fileSize: integer("file_size"),
  isPurchaseRequired: boolean("is_purchase_required").default(false),
  price: integer("price"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertPageContentSchema = createInsertSchema(pageContents).pick({
  pageKey: true,
  title: true,
  content: true,
  metaTitle: true,
  metaDescription: true,
  filePath: true,
  fileName: true,
  fileType: true,
  fileSize: true,
  isPurchaseRequired: true,
  price: true,
});

export type InsertPageContent = z.infer<typeof insertPageContentSchema>;
export type PageContent = typeof pageContents.$inferSelect;

// Define section content schema
export const sectionContentSchema = z.object({
  type: z.enum(['hero', 'heading', 'paragraph', 'list', 'image', 'features', 'faq', 'cta']),
  heading: z.string().optional(),
  subheading: z.string().optional(),
  text: z.string().optional(),
  items: z.array(z.object({
    title: z.string().optional(),
    description: z.string().optional(), 
    icon: z.string().optional(),
  })).optional(),
  imageUrl: z.string().optional(),
  linkText: z.string().optional(),
  linkUrl: z.string().optional(),
});

export type SectionContent = z.infer<typeof sectionContentSchema>;

// Email submissions for ebook downloads
export const emailSubmissions = pgTable("email_submissions", {
  id: serial("id").primaryKey(),
  email: text("email").notNull(),
  source: text("source").notNull().default("ebook"),
  downloadedAt: timestamp("downloaded_at").notNull().defaultNow(),
});

export const insertEmailSubmissionSchema = createInsertSchema(emailSubmissions).pick({
  email: true,
  source: true,
});

export type InsertEmailSubmission = z.infer<typeof insertEmailSubmissionSchema>;
export type EmailSubmission = typeof emailSubmissions.$inferSelect;

// SEO Settings table - optimized for Google search rankings only
export const seoSettings = pgTable("seo_settings", {
  id: serial("id").primaryKey(),
  pageKey: text("page_key").notNull().unique(),
  title: text("title").notNull(),
  metaDescription: text("meta_description").notNull(),
  metaKeywords: text("meta_keywords").notNull(),
  structuredData: json("structured_data"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertSeoSettingsSchema = createInsertSchema(seoSettings).pick({
  pageKey: true,
  title: true,
  metaDescription: true,
  metaKeywords: true,
  structuredData: true,
});

export type InsertSeoSettings = z.infer<typeof insertSeoSettingsSchema>;
export type SeoSettings = typeof seoSettings.$inferSelect;

// Domain inquiries tracking system
export const inquiryStatuses = ["new", "in_progress", "negotiating", "closed", "lost"] as const;
export type InquiryStatus = typeof inquiryStatuses[number];

export const inquiries = pgTable("inquiries", {
  id: serial("id").primaryKey(),
  domainId: integer("domain_id").references(() => domains.id).notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  company: text("company"),
  message: text("message").notNull(),
  offerAmount: integer("offer_amount"),
  status: text("status", { enum: inquiryStatuses }).notNull().default("new"),
  priority: integer("priority").notNull().default(0), // 0=normal, 1=high, 2=urgent
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  lastContactedAt: timestamp("last_contacted_at"),
  nextFollowUpAt: timestamp("next_follow_up_at"),
});

export const insertInquirySchema = createInsertSchema(inquiries).pick({
  domainId: true,
  name: true,
  email: true,
  phone: true,
  company: true,
  message: true,
  offerAmount: true,
  status: true,
  priority: true,
  notes: true,
  nextFollowUpAt: true,
});

export type InsertInquiry = z.infer<typeof insertInquirySchema>;
export type Inquiry = typeof inquiries.$inferSelect;

// Communication history for inquiries
export const communications = pgTable("communications", {
  id: serial("id").primaryKey(),
  inquiryId: integer("inquiry_id").references(() => inquiries.id).notNull(),
  direction: text("direction", { enum: ["incoming", "outgoing"] }).notNull(),
  message: text("message").notNull(),
  sentAt: timestamp("sent_at").notNull().defaultNow(),
});

export const insertCommunicationSchema = createInsertSchema(communications).pick({
  inquiryId: true,
  direction: true,
  message: true,
});

export type InsertCommunication = z.infer<typeof insertCommunicationSchema>;
export type Communication = typeof communications.$inferSelect;

// Price change log for tracking all price updates
export const priceChangeLogs = pgTable("price_change_logs", {
  id: serial("id").primaryKey(),
  domainId: integer("domain_id").references(() => domains.id).notNull(),
  domainName: text("domain_name").notNull(),
  oldPrice: integer("old_price").notNull(),
  newPrice: integer("new_price").notNull(),
  changePercentage: integer("change_percentage"),
  userId: integer("user_id"), // Which admin made the change
  ipAddress: text("ip_address"),
  reason: text("reason"), // Why the price was changed
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertPriceChangeLogSchema = createInsertSchema(priceChangeLogs).pick({
  domainId: true,
  domainName: true,
  oldPrice: true,
  newPrice: true,
  changePercentage: true,
  userId: true, 
  ipAddress: true,
  reason: true,
});

export type InsertPriceChangeLog = z.infer<typeof insertPriceChangeLogSchema>;
export type PriceChangeLog = typeof priceChangeLogs.$inferSelect;

// Domain data persistence version control table
export const dataVersions = pgTable("data_versions", {
  id: serial("id").primaryKey(),
  dataType: text("data_type").notNull(), // "domains", "pageContents", etc.
  version: text("version").notNull(),
  lastUpdated: timestamp("last_updated").notNull().defaultNow(),
  checksum: text("checksum"), // Optional checksum of data
  recordCount: integer("record_count"), // How many records were updated
  details: text("details"), // Additional information
});

export const insertDataVersionSchema = createInsertSchema(dataVersions).pick({
  dataType: true,
  version: true,
  checksum: true,
  recordCount: true,
  details: true,
});

export type InsertDataVersion = z.infer<typeof insertDataVersionSchema>;
export type DataVersion = typeof dataVersions.$inferSelect;
