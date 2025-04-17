import { pgTable, text, timestamp, serial, integer, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const transactionLogs = pgTable("transaction_logs", {
  id: serial("id").primaryKey(),
  entityType: text("entity_type").notNull(), // E.g., "domain", "page_content"
  entityId: integer("entity_id").notNull(),   // ID of the entity being modified
  operation: text("operation").notNull(),     // E.g., "update", "create", "delete"
  oldValue: jsonb("old_value"),               // Previous state (JSON)
  newValue: jsonb("new_value"),               // New state (JSON)
  userId: integer("user_id"),                 // Who made the change
  ipAddress: text("ip_address"),              // IP address of the user
  userAgent: text("user_agent"),              // Browser/client information
  metadata: jsonb("metadata"),                // Any additional information
  status: text("status").notNull().default("completed"), // "pending", "completed", "failed"
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertTransactionLogSchema = createInsertSchema(transactionLogs).pick({
  entityType: true,
  entityId: true,
  operation: true,
  oldValue: true,
  newValue: true,
  userId: true,
  ipAddress: true,
  userAgent: true,
  metadata: true,
  status: true,
});

export type InsertTransactionLog = z.infer<typeof insertTransactionLogSchema>;
export type TransactionLog = typeof transactionLogs.$inferSelect;