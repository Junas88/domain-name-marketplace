import { 
  users, type User, type InsertUser,
  domains, type Domain, type InsertDomain,
  offers, type Offer, type InsertOffer,
  consultations, type Consultation, type InsertConsultation
} from "@shared/schema";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
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
  
  // Offer methods
  createOffer(offer: InsertOffer): Promise<Offer>;
  getOffersByDomainId(domainId: number): Promise<Offer[]>;
  
  // Consultation methods
  createConsultation(consultation: InsertConsultation): Promise<Consultation>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private domains: Map<number, Domain>;
  private offers: Map<number, Offer>;
  private consultations: Map<number, Consultation>;
  
  private userIdCounter: number;
  private domainIdCounter: number;
  private offerIdCounter: number;
  private consultationIdCounter: number;

  constructor() {
    this.users = new Map();
    this.domains = new Map();
    this.offers = new Map();
    this.consultations = new Map();
    
    this.userIdCounter = 1;
    this.domainIdCounter = 1;
    this.offerIdCounter = 1;
    this.consultationIdCounter = 1;
    
    // Initialize with some sample domains
    this.initializeDomains();
  }
  
  private initializeDomains() {
    const sampleDomains: InsertDomain[] = [
      {
        name: "techsolutions.com",
        description: "Perfect domain for tech companies and IT solution providers.",
        price: 12500,
        category: "Technology",
        length: 15,
      },
      {
        name: "healthwise.com",
        description: "Ideal for healthcare services, wellness brands, and medical practices.",
        price: 8900,
        category: "Health",
        length: 12,
      },
      {
        name: "learnfast.com",
        description: "Great for online learning platforms, educational services, and tutoring.",
        price: 5750,
        category: "Education",
        length: 10,
      },
      {
        name: "bizgrowth.com",
        description: "Perfect for business consultants, growth agencies, and B2B services.",
        price: 7200,
        category: "Business",
        length: 11,
      },
      {
        name: "streamhub.com",
        description: "Ideal for streaming services, content platforms, and media companies.",
        price: 14800,
        category: "Entertainment",
        length: 10,
      },
      {
        name: "cryptoinvest.com",
        description: "Perfect for cryptocurrency platforms, investment services, and fintech.",
        price: 17500,
        category: "Finance",
        length: 13,
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
    const user: User = { ...insertUser, id };
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
  
  private createDomain(insertDomain: InsertDomain): Domain {
    const id = this.domainIdCounter++;
    const domain: Domain = { ...insertDomain, id };
    this.domains.set(id, domain);
    return domain;
  }
  
  // Offer methods
  async createOffer(insertOffer: InsertOffer): Promise<Offer> {
    const id = this.offerIdCounter++;
    const offer: Offer = {
      ...insertOffer,
      id,
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
}

export const storage = new MemStorage();
