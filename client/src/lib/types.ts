// Domain type
export interface Domain {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  isSold: boolean;
  length: number;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
}

// Offer type
export interface Offer {
  id: number;
  domainId: number;
  name: string;
  email: string;
  price: number;
  message: string;
  createdAt: string;
}

// Consultation type
export interface Consultation {
  id: number;
  name: string;
  email: string;
  phone: string;
  industry: string;
  budget: string;
  message: string;
  createdAt: string;
}

// Page Content type
export interface PageContent {
  id: number;
  pageKey: string;
  title: string;
  content: string;
  metaTitle?: string;
  metaDescription?: string;
  sections?: any[];
  filePath?: string;
  fileName?: string;
  fileSize?: number;
  isPurchaseRequired?: boolean;
  price?: number;
  createdAt: string;
  updatedAt: string;
}

// Email Submission type
export interface EmailSubmission {
  id: number;
  email: string;
  source: string;
  createdAt: string;
}

// SEO Settings type - optimized for Google search ranking only
export interface SeoSettings {
  id: number;
  pageKey: string;
  title: string;
  metaDescription: string;
  metaKeywords: string;
  structuredData: string | null;
  updatedAt: string;
}

// Inquiry status type
export type InquiryStatus = 'new' | 'in_progress' | 'negotiating' | 'closed' | 'lost';

// Inquiry type
export interface Inquiry {
  id: number;
  domainId: number;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  status: InquiryStatus;
  priority: number;
  notes: string | null;
  budget: number | null;
  timeline: string | null;
  source: string | null;
  lastContactedAt: string | null;
  nextFollowUpAt: string | null;
  createdAt: string;
  updatedAt: string;
  // Added client-side for displaying purposes
  domainName?: string;
}

// Communication direction type
export type CommunicationDirection = 'incoming' | 'outgoing';

// Communication type
export interface Communication {
  id: number;
  inquiryId: number;
  direction: CommunicationDirection;
  message: string;
  sentAt: string;
}

// Domain Stats type
export interface DomainStats {
  totalDomains: number;
  soldDomains: number;
  totalViews: number;
  domainsByCategory: Record<string, number>;
  totalRevenue: number;
  averagePrice: number;
  mostViewedDomains?: Array<{
    id: number;
    name: string;
    viewCount: number;
    price: number;
  }>;
}