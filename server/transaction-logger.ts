import { db } from "./db";
import { transactionLogs } from "@shared/transaction-log";
import { Request } from "express";

interface TransactionLogParams {
  entityType: string;
  entityId: number;
  operation: string;
  oldValue?: any;
  newValue?: any;
  userId?: number | null;
  ipAddress?: string;
  userAgent?: string;
  metadata?: any;
  status?: string;
}

/**
 * Logs a transaction with detailed information for audit purposes
 */
export async function logTransaction(
  params: TransactionLogParams,
  req?: Request
): Promise<void> {
  try {
    if (!db) {
      console.error("❌ Cannot log transaction: database connection not available");
      return;
    }

    const {
      entityType,
      entityId,
      operation,
      oldValue,
      newValue,
      userId,
      ipAddress,
      userAgent,
      metadata,
      status = "completed"
    } = params;

    // Use request information if available
    const requestIp = req?.ip || ipAddress;
    const requestUserAgent = req?.headers?.["user-agent"] || userAgent;
    const requestUserId = req?.user?.id || userId;

    // Insert transaction log
    await db.insert(transactionLogs).values({
      entityType,
      entityId,
      operation,
      oldValue: oldValue ? oldValue : undefined,
      newValue: newValue ? newValue : undefined,
      userId: requestUserId,
      ipAddress: requestIp,
      userAgent: requestUserAgent,
      metadata,
      status
    });

    // Log to console for debugging
    console.log(`📝 Transaction logged: ${operation} on ${entityType} #${entityId} by user #${requestUserId || 'unknown'}`);
  } catch (error) {
    // Don't let logging errors affect the main workflow
    console.error("❌ Failed to log transaction:", error);
  }
}

/**
 * Logs domain price changes with special handling for price tracking
 */
export async function logDomainPriceChange({
  domainId,
  domainName,
  oldPrice,
  newPrice,
  reason,
  req
}: {
  domainId: number;
  domainName: string;
  oldPrice: number;
  newPrice: number;
  reason?: string;
  req?: Request;
}): Promise<void> {
  try {
    // Calculate percentage change
    const changePercentage = Math.round(((newPrice - oldPrice) / oldPrice) * 100);

    // Log transaction
    await logTransaction({
      entityType: "domain",
      entityId: domainId,
      operation: "price_update",
      oldValue: { price: oldPrice },
      newValue: { price: newPrice },
      userId: req?.user?.id,
      ipAddress: req?.ip,
      userAgent: req?.headers?.["user-agent"],
      metadata: {
        domainName,
        changePercentage,
        reason,
        timestamp: new Date().toISOString()
      }
    }, req);

    // Log price change details
    console.log(`💲 Price change for ${domainName}: $${oldPrice} → $${newPrice} (${changePercentage}%)`);
  } catch (error) {
    console.error(`❌ Failed to log price change for domain ${domainId}:`, error);
  }
}