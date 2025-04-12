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