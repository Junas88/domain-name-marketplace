import { pgTable, serial, integer, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Transaction log table to track all domain updates
export const transactionLogs = pgTable("transaction_logs", {
  id: serial("id").primaryKey(),
  domainId: integer("domain_id").notNull(),
  domainName: text("domain_name").notNull(),
  action: text("action").notNull(), // "price_update", "mark_sold", etc.
  oldValue: text("old_value"), // JSON string of old values
  newValue: text("new_value"), // JSON string of new values
  userId: integer("user_id"), // Optional user who made the change
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertTransactionLogSchema = createInsertSchema(transactionLogs).pick({
  domainId: true,
  domainName: true,
  action: true,
  oldValue: true,
  newValue: true,
  userId: true,
  ipAddress: true,
  userAgent: true,
});

export type InsertTransactionLog = z.infer<typeof insertTransactionLogSchema>;
export type TransactionLog = typeof transactionLogs.$inferSelect;