// Define shared types for the application

export interface Domain {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  length: number;
  isSold: boolean;
  createdAt: string;
  viewCount: number;
}

export interface PageContent {
  id: number;
  pageKey: string;
  title: string;
  content: string;
  metaTitle?: string;
  metaDescription?: string;
  createdAt?: string;
}

export interface SeoSettings {
  id: number;
  pageKey: string;
  title: string;
  metaDescription: string;
  metaKeywords: string;
  structuredData?: string;
}

export interface Consultation {
  id: number;
  name: string;
  email: string;
  phone?: string;
  message: string;
  budget?: string;
  createdAt: string;
}

export interface Offer {
  id: number;
  domainId: number;
  name: string;
  email: string;
  amount: number;
  message?: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}