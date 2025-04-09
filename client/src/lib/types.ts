export interface Domain {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  length: number;
  isSold?: boolean;
  viewCount?: number;
}

export interface Offer {
  id: number;
  domainId: number;
  amount: number;
  name: string;
  email: string;
  message?: string;
  createdAt: Date;
}

export interface Consultation {
  id: number;
  name: string;
  email: string;
  industry: string;
  message: string;
  budget: string;
  createdAt: Date;
}

export interface DomainFilters {
  category?: string;
  priceRange?: string;
  length?: string;
}

export interface OfferFormData {
  domainId: number;
  amount: number;
  name: string;
  email: string;
  message?: string;
}

export interface ConsultationFormData {
  name: string;
  email: string;
  industry: string;
  message: string;
  budget: string;
}

export interface PageContent {
  id: number;
  pageKey: string;
  title: string;
  content: string;
  metaTitle?: string | null;
  metaDescription?: string | null;
  price?: number | null;
  isPurchaseRequired?: boolean | null;
  filePath?: string | null;
  fileName?: string | null;
  fileType?: string | null;
  fileSize?: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface PageContentFormData {
  pageKey: string;
  title: string;
  content: string;
  metaTitle?: string;
  metaDescription?: string;
}
