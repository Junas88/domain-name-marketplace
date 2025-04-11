import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

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
  isSold: boolean("is_sold").default(false).notNull(),
  viewCount: integer("view_count").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertDomainSchema = createInsertSchema(domains).pick({
  name: true,
  description: true,
  price: true,
  category: true,
  length: true,
  isSold: true,
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
