import axios from 'axios';
import { db } from '../db';
import * as schema from '../../shared/schema';
import { eq } from 'drizzle-orm';
import fs from 'fs';
import path from 'path';
import { generateDomainDescription } from '../utils/domain-utils';

// Interface for Afternic domain data
interface AfternicDomain {
  domainName: string;
  price: number;
  inCart: boolean;
  category?: string;
  isPrivate: boolean;
  buyNowPrice?: number;
  createdDate: string;
  currency: string;
  status: string;
  isActive: boolean;
  isPremium: boolean;
  isAdult: boolean;
  primaryImageURL?: string;
  description?: string;
  registrar?: string;
  expirationDate?: string;
  trafficStats?: {
    monthlyVisitors?: number;
    totalVisitors?: number;
  };
}

interface AfternicAPIResponse {
  domains: AfternicDomain[];
  totalCount: number;
  pageSize: number;
  pageNumber: number;
}

// Map Afternic categories to our categories
const categoryMapping: Record<string, string> = {
  'Business': 'business',
  'Tech': 'technology',
  'Finance': 'finance',
  'Health': 'health',
  'Real Estate': 'real-estate',
  'Travel': 'travel',
  'Education': 'education',
  'Entertainment': 'entertainment',
  'Shopping': 'shopping',
  'Other': 'other',
  // Add more mappings as needed
};

/**
 * Fetches domain data from Afternic API
 */
export async function fetchAfternicDomains(apiKey: string, username: string, pageSize = 100, pageNumber = 1) {
  if (!apiKey) {
    throw new Error('Afternic API key is required');
  }

  try {
    console.log(`Fetching Afternic domains (page ${pageNumber}, size ${pageSize})...`);
    
    // Replace with the actual Afternic API endpoint
    const response = await axios.get('https://api.afternic.com/v1/domains', {
      params: {
        pageSize,
        pageNumber,
        username,
      },
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    return response.data as AfternicAPIResponse;
  } catch (error) {
    console.error('Error fetching domains from Afternic:', error);
    if (axios.isAxiosError(error) && error.response) {
      console.error('API response:', error.response.data);
      console.error('Status code:', error.response.status);
    }
    throw new Error(`Failed to fetch domains from Afternic: ${error.message}`);
  }
}

/**
 * Maps an Afternic domain to our domain schema
 */
function mapAfternicDomainToSchema(afternicDomain: AfternicDomain): Omit<schema.InsertDomain, 'id'> {
  // Determine category based on mapping or default to 'other'
  const category = afternicDomain.category 
    ? categoryMapping[afternicDomain.category] || 'other'
    : 'other';
  
  return {
    name: afternicDomain.domainName,
    price: afternicDomain.buyNowPrice || afternicDomain.price,
    category,
    description: afternicDomain.description || generateDomainDescription(afternicDomain.domainName, category),
    extension: afternicDomain.domainName.split('.').pop() || '',
    length: afternicDomain.domainName.split('.')[0].length,
    isFeatured: afternicDomain.isPremium,
    isNew: new Date(afternicDomain.createdDate) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days
    viewCount: 0,
    isSold: afternicDomain.status.toLowerCase() === 'sold' || !afternicDomain.isActive,
    lastSynced: new Date(),
    externalId: afternicDomain.domainName, // Use domain name as external ID for future syncs
    externalSource: 'afternic',
    externalData: JSON.stringify(afternicDomain),
    createdAt: new Date(),
    updatedAt: new Date()
  };
}

/**
 * Synchronizes all domains from Afternic to our database
 */
export async function syncAfternicDomains(apiKey: string, username: string) {
  try {
    console.log('Starting Afternic domain synchronization...');
    
    // Track metrics for logging
    const metrics = {
      total: 0,
      added: 0,
      updated: 0,
      unchanged: 0,
      removed: 0,
      errors: 0
    };

    // Create a backup of existing domains for safety
    const existingDomains = await db.select().from(schema.domains);
    const backupPath = path.join(__dirname, '../../backups', `domains-pre-afternic-sync-${Date.now()}.json`);
    fs.mkdirSync(path.dirname(backupPath), { recursive: true });
    fs.writeFileSync(backupPath, JSON.stringify(existingDomains, null, 2));
    console.log(`Created backup of ${existingDomains.length} existing domains at ${backupPath}`);

    // First, mark all domains from Afternic as potentially deleted
    // We'll update this flag during sync for domains that still exist
    await db.update(schema.domains)
      .set({ pendingDeletion: true })
      .where(eq(schema.domains.externalSource, 'afternic'));

    // Fetch and process domains from Afternic
    let pageNumber = 1;
    let hasMorePages = true;
    const pageSize = 100;

    while (hasMorePages) {
      try {
        const response = await fetchAfternicDomains(apiKey, username, pageSize, pageNumber);
        
        if (!response.domains || response.domains.length === 0) {
          hasMorePages = false;
          continue;
        }

        console.log(`Processing ${response.domains.length} domains from page ${pageNumber}`);
        metrics.total += response.domains.length;

        // Process each domain
        for (const afternicDomain of response.domains) {
          try {
            const domainData = mapAfternicDomainToSchema(afternicDomain);
            
            // Check if domain already exists in our database
            const existingDomain = await db.select()
              .from(schema.domains)
              .where(eq(schema.domains.name, afternicDomain.domainName))
              .limit(1);
            
            if (existingDomain.length > 0) {
              // Update existing domain
              await db.update(schema.domains)
                .set({
                  ...domainData,
                  pendingDeletion: false, // Clear the deletion flag
                  id: existingDomain[0].id, // Preserve the original ID
                  viewCount: existingDomain[0].viewCount, // Preserve view count
                  createdAt: existingDomain[0].createdAt // Preserve original creation date
                })
                .where(eq(schema.domains.id, existingDomain[0].id));
              
              metrics.updated++;
            } else {
              // Insert new domain
              await db.insert(schema.domains).values(domainData);
              metrics.added++;
            }
          } catch (error) {
            console.error(`Error processing domain ${afternicDomain.domainName}:`, error);
            metrics.errors++;
          }
        }

        // Check if we need to fetch more pages
        hasMorePages = response.totalCount > pageNumber * pageSize;
        pageNumber++;
        
        // Add a small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`Error processing page ${pageNumber}:`, error);
        metrics.errors++;
        hasMorePages = false; // Stop on error
      }
    }

    // Delete domains marked for deletion (they no longer exist in Afternic)
    const domainsToDelete = await db.select()
      .from(schema.domains)
      .where(eq(schema.domains.pendingDeletion, true));
    
    metrics.removed = domainsToDelete.length;
    
    if (domainsToDelete.length > 0) {
      console.log(`Removing ${domainsToDelete.length} domains that no longer exist in Afternic`);
      await db.delete(schema.domains)
        .where(eq(schema.domains.pendingDeletion, true));
    }

    // Log synchronization results
    console.log('Afternic domain synchronization completed');
    console.log(`Total domains processed: ${metrics.total}`);
    console.log(`New domains added: ${metrics.added}`);
    console.log(`Existing domains updated: ${metrics.updated}`);
    console.log(`Domains removed: ${metrics.removed}`);
    console.log(`Errors encountered: ${metrics.errors}`);

    return metrics;
  } catch (error) {
    console.error('Error synchronizing Afternic domains:', error);
    throw error;
  }
}

/**
 * Checks the connection to Afternic API
 */
export async function checkAfternicConnection(apiKey: string, username: string) {
  try {
    // Just fetch a single domain to test the connection
    await fetchAfternicDomains(apiKey, username, 1, 1);
    return { success: true, message: 'Successfully connected to Afternic API' };
  } catch (error) {
    return { 
      success: false, 
      message: `Failed to connect to Afternic API: ${error.message}`,
      error: error.message
    };
  }
}