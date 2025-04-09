import { 
  users, type User, type InsertUser,
  domains, type Domain, type InsertDomain,
  offers, type Offer, type InsertOffer,
  consultations, type Consultation, type InsertConsultation
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  // Session store
  sessionStore: session.Store;
  
  // User methods (from the original template)
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Domain methods
  getAllDomains(): Promise<Domain[]>;
  getDomain(id: number): Promise<Domain | undefined>;
  searchDomains(query: string): Promise<Domain[]>;
  filterDomains(filters: {
    category?: string;
    priceRange?: string;
    length?: string;
  }): Promise<Domain[]>;
  createDomain(domain: InsertDomain): Promise<Domain>;
  updateDomain(id: number, domain: Partial<Domain>): Promise<Domain | undefined>;
  deleteDomain(id: number): Promise<boolean>;
  markDomainAsSold(id: number): Promise<Domain | undefined>;
  incrementViewCount(id: number): Promise<Domain | undefined>;
  getDomainStats(): Promise<{
    totalDomains: number;
    soldDomains: number;
    totalViews: number;
    domainsByCategory: Record<string, number>;
  }>;
  
  // Offer methods
  createOffer(offer: InsertOffer): Promise<Offer>;
  getOffersByDomainId(domainId: number): Promise<Offer[]>;
  
  // Consultation methods
  createConsultation(consultation: InsertConsultation): Promise<Consultation>;
  getAllConsultations(): Promise<Consultation[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private domains: Map<number, Domain>;
  private offers: Map<number, Offer>;
  private consultations: Map<number, Consultation>;
  
  public sessionStore: session.Store;
  
  private userIdCounter: number;
  private domainIdCounter: number;
  private offerIdCounter: number;
  private consultationIdCounter: number;

  constructor() {
    this.users = new Map();
    this.domains = new Map();
    this.offers = new Map();
    this.consultations = new Map();
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    });
    
    this.userIdCounter = 1;
    this.domainIdCounter = 1;
    this.offerIdCounter = 1;
    this.consultationIdCounter = 1;
    
    // Initialize with some sample domains
    this.initializeDomains();
  }
  
  private initializeDomains() {
    const sampleDomains: InsertDomain[] = [
      // Original sample domains
      {
        name: "techsolutions.com",
        description: "Perfect domain for tech companies and IT solution providers.",
        price: 12500,
        category: "Technology",
        length: 15,
        isSold: false,
      },
      {
        name: "healthwise.com",
        description: "Ideal for healthcare services, wellness brands, and medical practices.",
        price: 8900,
        category: "Health",
        length: 12,
        isSold: false,
      },
      {
        name: "learnfast.com",
        description: "Great for online learning platforms, educational services, and tutoring.",
        price: 5750,
        category: "Education",
        length: 10,
        isSold: false,
      },
      {
        name: "bizgrowth.com",
        description: "Perfect for business consultants, growth agencies, and B2B services.",
        price: 7200,
        category: "Business",
        length: 11,
        isSold: false,
      },
      {
        name: "streamhub.com",
        description: "Ideal for streaming services, content platforms, and media companies.",
        price: 14800,
        category: "Entertainment",
        length: 10,
        isSold: false,
      },
      {
        name: "cryptoinvest.com",
        description: "Perfect for cryptocurrency platforms, investment services, and fintech.",
        price: 17500,
        category: "Finance",
        length: 13,
        isSold: false,
      },
      
      // New domains from the list
      {
        name: "munchies.com",
        description: "Perfect for food delivery services, snack brands, or food blogs.",
        price: 32500,
        category: "Food",
        length: 9,
        isSold: false,
      },
      {
        name: "appliances.com",
        description: "Ideal for home appliance retailers or manufacturers.",
        price: 85000,
        category: "Retail",
        length: 11,
        isSold: false,
      },
      {
        name: "funddaddy.com",
        description: "Great for investment platforms, funding services, or financial advisors.",
        price: 7500,
        category: "Finance",
        length: 10,
        isSold: false,
      },
      {
        name: "gymjunkie.com",
        description: "Perfect for fitness enthusiasts, gym equipment stores, or workout programs.",
        price: 12800,
        category: "Health",
        length: 10,
        isSold: false,
      },
      {
        name: "bikeride.com",
        description: "Ideal for cycling communities, bicycle shops, or outdoor adventures.",
        price: 22500,
        category: "Sports",
        length: 9,
        isSold: false,
      },
      {
        name: "petlovers.com",
        description: "Perfect for pet supply stores, animal care services, or pet communities.",
        price: 28950,
        category: "Pets",
        length: 10,
        isSold: false,
      },
      {
        name: "smartmail.com",
        description: "Great for email services, marketing platforms, or productivity tools.",
        price: 43750,
        category: "Technology",
        length: 10,
        isSold: false,
      },
      {
        name: "travelbug.com",
        description: "Ideal for travel agencies, vacation planners, or travel blogs.",
        price: 38250,
        category: "Travel",
        length: 10,
        isSold: false,
      },
      {
        name: "winecellar.com",
        description: "Perfect for wine shops, collectors, or vineyard marketplaces.",
        price: 47500,
        category: "Food & Beverage",
        length: 11,
        isSold: false,
      },
      {
        name: "cyberguard.com",
        description: "Great for cybersecurity companies, data protection services, or IT security.",
        price: 35900,
        category: "Technology",
        length: 11,
        isSold: false,
      },
      {
        name: "watchstreet.com",
        description: "Ideal for luxury watch retailers, collectors, or watch reviews.",
        price: 19750,
        category: "Luxury",
        length: 12,
        isSold: false,
      },
      {
        name: "coffeelovers.com",
        description: "Perfect for coffee shops, bean retailers, or coffee enthusiast communities.",
        price: 33500,
        category: "Food & Beverage",
        length: 13,
        isSold: false,
      },
      {
        name: "digitalart.com",
        description: "Great for NFT marketplaces, digital artists, or art galleries.",
        price: 75000,
        category: "Art",
        length: 11,
        isSold: false,
      },
      {
        name: "gamezilla.com",
        description: "Perfect for gaming platforms, game reviews, or esports organizations.",
        price: 28750,
        category: "Gaming",
        length: 10,
        isSold: false,
      },
      {
        name: "luxuryhomes.com",
        description: "Ideal for real estate agencies, luxury property listings, or home designers.",
        price: 125000,
        category: "Real Estate",
        length: 12,
        isSold: false,
      },
    ];
    
    sampleDomains.forEach(domain => {
      this.createDomain(domain);
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { 
      ...insertUser, 
      id,
      isAdmin: insertUser.isAdmin || false,
      createdAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }
  
  // Domain methods
  async getAllDomains(): Promise<Domain[]> {
    return Array.from(this.domains.values());
  }
  
  async getDomain(id: number): Promise<Domain | undefined> {
    return this.domains.get(id);
  }
  
  async searchDomains(query: string): Promise<Domain[]> {
    if (!query) return this.getAllDomains();
    
    const lowercaseQuery = query.toLowerCase();
    return Array.from(this.domains.values()).filter(domain => 
      domain.name.toLowerCase().includes(lowercaseQuery) ||
      domain.description.toLowerCase().includes(lowercaseQuery) ||
      domain.category.toLowerCase().includes(lowercaseQuery)
    );
  }
  
  async filterDomains(filters: {
    category?: string;
    priceRange?: string;
    length?: string;
  }): Promise<Domain[]> {
    let domains = Array.from(this.domains.values());
    
    if (filters.category && filters.category !== 'All Categories') {
      domains = domains.filter(domain => domain.category === filters.category);
    }
    
    if (filters.priceRange && filters.priceRange !== 'Any Price') {
      switch (filters.priceRange) {
        case 'Under $1,000':
          domains = domains.filter(domain => domain.price < 1000);
          break;
        case '$1,000 - $5,000':
          domains = domains.filter(domain => domain.price >= 1000 && domain.price <= 5000);
          break;
        case '$5,000 - $10,000':
          domains = domains.filter(domain => domain.price > 5000 && domain.price <= 10000);
          break;
        case '$10,000+':
          domains = domains.filter(domain => domain.price > 10000);
          break;
      }
    }
    
    if (filters.length && filters.length !== 'Any Length') {
      switch (filters.length) {
        case '3-5 Characters':
          domains = domains.filter(domain => domain.length >= 3 && domain.length <= 5);
          break;
        case '6-9 Characters':
          domains = domains.filter(domain => domain.length >= 6 && domain.length <= 9);
          break;
        case '10+ Characters':
          domains = domains.filter(domain => domain.length >= 10);
          break;
      }
    }
    
    return domains;
  }
  
  async createDomain(insertDomain: InsertDomain): Promise<Domain> {
    const id = this.domainIdCounter++;
    const domain: Domain = { 
      ...insertDomain, 
      id,
      viewCount: 0,
      createdAt: new Date(),
      isSold: insertDomain.isSold || false 
    };
    this.domains.set(id, domain);
    return domain;
  }
  
  async updateDomain(id: number, updates: Partial<Domain>): Promise<Domain | undefined> {
    const domain = this.domains.get(id);
    if (!domain) return undefined;
    
    const updatedDomain = { ...domain, ...updates };
    this.domains.set(id, updatedDomain);
    return updatedDomain;
  }
  
  async deleteDomain(id: number): Promise<boolean> {
    return this.domains.delete(id);
  }
  
  async markDomainAsSold(id: number): Promise<Domain | undefined> {
    return this.updateDomain(id, { isSold: true });
  }
  
  async incrementViewCount(id: number): Promise<Domain | undefined> {
    const domain = this.domains.get(id);
    if (!domain) return undefined;
    
    return this.updateDomain(id, { viewCount: (domain.viewCount || 0) + 1 });
  }
  
  async getDomainStats(): Promise<{
    totalDomains: number;
    soldDomains: number;
    totalViews: number;
    domainsByCategory: Record<string, number>;
  }> {
    const domains = Array.from(this.domains.values());
    const soldDomains = domains.filter(domain => domain.isSold).length;
    const totalViews = domains.reduce((sum, domain) => sum + (domain.viewCount || 0), 0);
    
    const domainsByCategory: Record<string, number> = {};
    domains.forEach(domain => {
      domainsByCategory[domain.category] = (domainsByCategory[domain.category] || 0) + 1;
    });
    
    return {
      totalDomains: domains.length,
      soldDomains,
      totalViews,
      domainsByCategory
    };
  }
  
  // Offer methods
  async createOffer(insertOffer: InsertOffer): Promise<Offer> {
    const id = this.offerIdCounter++;
    const offer: Offer = {
      ...insertOffer,
      id,
      message: insertOffer.message || null,
      createdAt: new Date(),
    };
    this.offers.set(id, offer);
    return offer;
  }
  
  async getOffersByDomainId(domainId: number): Promise<Offer[]> {
    return Array.from(this.offers.values()).filter(
      offer => offer.domainId === domainId
    );
  }
  
  // Consultation methods
  async createConsultation(insertConsultation: InsertConsultation): Promise<Consultation> {
    const id = this.consultationIdCounter++;
    const consultation: Consultation = {
      ...insertConsultation,
      id,
      createdAt: new Date(),
    };
    this.consultations.set(id, consultation);
    return consultation;
  }
  
  async getAllConsultations(): Promise<Consultation[]> {
    return Array.from(this.consultations.values());
  }
}

export const storage = new MemStorage();
