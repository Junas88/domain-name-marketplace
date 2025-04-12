import { 
  users, type User, type InsertUser,
  domains, type Domain, type InsertDomain,
  offers, type Offer, type InsertOffer,
  consultations, type Consultation, type InsertConsultation,
  pageContents, type PageContent, type InsertPageContent,
  emailSubmissions, type EmailSubmission, type InsertEmailSubmission,
  seoSettings, type SeoSettings, type InsertSeoSettings,
  type SectionContent
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";
import { db, pool } from "./db";
import { eq, desc, count, sum, avg, and, like, or, not, gt, lt, between } from "drizzle-orm";
import connectPgSimple from "connect-pg-simple";

const MemoryStore = createMemoryStore(session);
const PostgresStore = connectPgSimple(session);

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
  
  // Page Content methods (CMS)
  getAllPageContents(): Promise<PageContent[]>;
  getPageContent(pageKey: string): Promise<PageContent | undefined>;
  createPageContent(pageContent: InsertPageContent): Promise<PageContent>;
  updatePageContent(pageKey: string, updates: Partial<InsertPageContent>): Promise<PageContent | undefined>;
  deletePageContent(pageKey: string): Promise<boolean>;
  
  // Email Submissions methods for ebook downloads
  createEmailSubmission(submission: InsertEmailSubmission): Promise<EmailSubmission>;
  getAllEmailSubmissions(): Promise<EmailSubmission[]>;
  
  // SEO Settings methods
  getAllSeoSettings(): Promise<SeoSettings[]>;
  getSeoSettingByPageKey(pageKey: string): Promise<SeoSettings | undefined>;
  createSeoSetting(seoSetting: InsertSeoSettings): Promise<SeoSettings>;
  updateSeoSetting(pageKey: string, updates: Partial<InsertSeoSettings>): Promise<SeoSettings | undefined>;
  deleteSeoSetting(pageKey: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private domains: Map<number, Domain>;
  private offers: Map<number, Offer>;
  private consultations: Map<number, Consultation>;
  private pageContents: Map<string, PageContent>;
  private emailSubmissions: Map<number, EmailSubmission>;
  private seoSettings: Map<string, SeoSettings>;
  
  public sessionStore: session.Store;
  
  private userIdCounter: number;
  private domainIdCounter: number;
  private offerIdCounter: number;
  private consultationIdCounter: number;
  private pageContentIdCounter: number;
  private emailSubmissionIdCounter: number;
  private seoSettingIdCounter: number;

  constructor() {
    this.users = new Map();
    this.domains = new Map();
    this.offers = new Map();
    this.consultations = new Map();
    this.pageContents = new Map();
    this.emailSubmissions = new Map();
    this.seoSettings = new Map();
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    });
    
    this.userIdCounter = 1;
    this.domainIdCounter = 1;
    this.offerIdCounter = 1;
    this.consultationIdCounter = 1;
    this.pageContentIdCounter = 1;
    this.emailSubmissionIdCounter = 1;
    this.seoSettingIdCounter = 1;
    
    // Initialize with some sample domains
    this.initializeDomains();
    
    // Initialize with default page contents
    this.initializePageContents();
  }
  
  private initializePageContents() {
    const defaultPages: InsertPageContent[] = [
      {
        pageKey: 'home',
        title: 'Home Page',
        content: '<h1>Find Your Perfect Domain</h1><p>Premium domain names for businesses of all sizes. Browse our curated selection of domain names or let us help you find the perfect match for your brand.</p>',
        metaTitle: 'Domain Name Guide - Premium Domain Marketplace',
        metaDescription: 'Find the perfect domain name for your business from our curated selection of premium domains. Expert guidance and secure transactions.'
      },
      {
        pageKey: 'buyer-protection',
        title: 'Buyer Protection',
        content: '<h1>Buyer Protection</h1><p>At Domain Name Guide, we prioritize your security and satisfaction in every transaction. Our comprehensive buyer protection program ensures that your domain purchases are safe, transparent, and exactly as described.</p><h2>Our Guarantees</h2><ul><li><strong>Secure Transactions:</strong> All payments are processed through secure channels.</li><li><strong>Domain Verification:</strong> We verify the ownership and status of every domain before listing.</li><li><strong>Escrow Service:</strong> For high-value domains, we offer escrow services to protect both buyers and sellers.</li><li><strong>Money-Back Guarantee:</strong> If the domain is not as described, we offer a full refund within 14 days.</li></ul>',
        metaTitle: 'Buyer Protection | Domain Name Guide',
        metaDescription: 'Our buyer protection program ensures secure domain transactions with verification, escrow services, and a money-back guarantee.'
      },
      {
        pageKey: 'contact',
        title: 'Contact Us',
        content: '<h1>Contact Us</h1><p>Have questions about our domains or services? We\'re here to help. Fill out the form below and our team will get back to you as soon as possible.</p><p>You can also reach us directly at: <a href="mailto:support@domainnameguide.com">support@domainnameguide.com</a></p>',
        metaTitle: 'Contact Us | Domain Name Guide',
        metaDescription: 'Contact our domain experts for assistance with domain acquisition, valuation, or any questions about our services.'
      },
      {
        pageKey: 'domain-valuation',
        title: 'Domain Valuation',
        content: '<h1>Domain Valuation Services</h1><p>Understanding the true value of a domain name is crucial for both buyers and sellers. Our expert valuation services provide accurate, market-based assessments to help you make informed decisions.</p><h2>Our Valuation Process</h2><p>We consider multiple factors when valuing domains:</p><ul><li>Domain length and memorability</li><li>Extension (.com, .net, .org, etc.)</li><li>Commercial potential</li><li>Search volume and keyword value</li><li>Industry relevance</li><li>Historical sales of similar domains</li></ul><p>Whether you\'re considering selling a domain or evaluating a purchase, our valuation experts can provide the insights you need.</p>',
        metaTitle: 'Domain Valuation Services | Domain Name Guide',
        metaDescription: 'Get accurate market-based domain valuations from our experts. We analyze length, extension, commercial potential, and industry relevance.'
      },
      {
        pageKey: 'faqs',
        title: 'Frequently Asked Questions',
        content: '<h1>Frequently Asked Questions</h1><h2>How do I purchase a domain?</h2><p>You can purchase a domain instantly using the "Buy Now" button or make an offer through the "Make Offer" option.</p><h2>What happens after I buy a domain?</h2><p>After purchasing, you\'ll receive detailed transfer instructions via email. Most transfers are completed within 24-48 hours.</p><h2>Do you offer domain escrow services?</h2><p>Yes, we provide escrow services for all transactions above $5,000 at no additional cost.</p><h2>Can I negotiate on domain prices?</h2><p>Yes, you can submit an offer on any domain using the "Make Offer" button.</p><h2>What payment methods do you accept?</h2><p>We accept all major credit cards, PayPal, bank transfers, and cryptocurrency.</p>',
        metaTitle: 'Frequently Asked Questions | Domain Name Guide',
        metaDescription: 'Find answers to common questions about domain purchases, transfers, escrow services, payments, and more.'
      },
      {
        pageKey: 'guide',
        title: 'Domain Guide',
        content: '<h1>Domain Name Guide</h1><p>Welcome to our comprehensive guide to domain names. Whether you\'re a beginner or experienced buyer, this resource will help you understand domains and make informed decisions.</p><h2>Domain Basics</h2><p>A domain name is your unique address on the internet. It\'s what customers type to find your website and a critical component of your online identity.</p><h2>Choosing the Right Domain</h2><p>When selecting a domain, consider these factors:</p><ul><li>Relevance to your business or brand</li><li>Memorability and pronounceability</li><li>Length (shorter is generally better)</li><li>Extension (.com remains the most valuable)</li><li>Avoidance of hyphens and numbers</li></ul><h2>Domain Value Factors</h2><p>What makes some domains more valuable than others? Key factors include:</p><ul><li>Length (shorter domains command higher prices)</li><li>Brandability and memorability</li><li>Commercial intent and relevance</li><li>Exact match to popular search terms</li><li>Extension (.com domains are typically most valuable)</li></ul>',
        metaTitle: 'Domain Guide | Everything You Need to Know About Domains',
        metaDescription: 'Learn about domain basics, selection criteria, value factors, and investment potential in our comprehensive domain guide.'
      },
      {
        pageKey: 'how-it-works',
        title: 'How It Works',
        content: '<h1>How It Works</h1><p>Purchasing a premium domain from Domain Name Guide is a simple, secure process designed to give you confidence in your acquisition.</p><h2>1. Browse Our Selection</h2><p>Explore our curated catalog of premium domains. Use filters to narrow down by industry, price range, or domain length.</p><h2>2. Choose Your Purchase Method</h2><p>For each domain, you have two options:</p><ul><li><strong>Buy Now:</strong> Purchase instantly at the listed price</li><li><strong>Make Offer:</strong> Submit your offer for consideration</li></ul><h2>3. Secure Transaction</h2><p>Once you decide to purchase, our secure checkout process handles your payment information with bank-level encryption.</p><h2>4. Domain Transfer</h2><p>After payment confirmation, we\'ll guide you through the transfer process. Most domains are transferred within 24-48 hours.</p><h2>5. Ongoing Support</h2><p>Our team remains available to answer questions or assist with any issues after your purchase.</p>',
        metaTitle: 'How It Works | Domain Name Guide Purchase Process',
        metaDescription: 'Learn how to browse, purchase, and transfer premium domains with our simple, secure process at Domain Name Guide.'
      },
      {
        pageKey: 'selling-strategy',
        title: 'Selling Strategy',
        content: '<h1>Domain Selling Strategy</h1><p>Whether you\'re looking to sell a single domain or build a portfolio, these strategies can help you maximize your returns.</p><h2>Understanding Market Value</h2><p>Before selling, it\'s crucial to understand what your domain is worth. Factors that influence value include:</p><ul><li>Domain length and memorability</li><li>Extension (.com, .net, .org, etc.)</li><li>Commercial potential and industry relevance</li><li>Search volume and keyword metrics</li><li>Historical sales of comparable domains</li></ul><h2>Timing Your Sale</h2><p>The domain market fluctuates based on industry trends, technological developments, and economic factors. Consider:</p><ul><li>Emerging industries that might increase demand for certain keywords</li><li>Seasonal trends that affect certain business categories</li><li>Market conditions and investor activity</li></ul><h2>Setting the Right Price</h2><p>Pricing strategy is critical. Too high, and you\'ll deter potential buyers; too low, and you\'ll leave money on the table.</p><p>Consider:</p><ul><li>Starting with a higher price to leave room for negotiation</li><li>Using a "Buy Now" price alongside the option to make offers</li><li>Researching recent sales of similar domains</li></ul>',
        metaTitle: 'Domain Selling Strategy | Maximize Your Domain Value',
        metaDescription: 'Learn effective strategies for selling domains, including market valuation, optimal timing, pricing strategies, and promotional techniques.'
      },
      {
        pageKey: 'not-found',
        title: 'Page Not Found',
        content: '<h1>Page Not Found</h1><p>We\'re sorry, but the page you\'re looking for doesn\'t exist or has been moved.</p><p>Please check the URL or navigate back to our <a href="/">homepage</a> to continue browsing.</p><p>If you believe this is an error, please <a href="/contact">contact our support team</a>.</p>',
        metaTitle: 'Page Not Found | Domain Name Guide',
        metaDescription: 'The requested page could not be found. Please navigate to our homepage or contact support.'
      },
      {
        pageKey: 'footer',
        title: 'Footer Content',
        content: '<h3>About Domain Name Guide</h3><p>We are a premium domain marketplace specializing in high-quality, brandable domain names for businesses of all sizes.</p><p>© 2025 Domain Name Guide. All rights reserved.</p>',
        metaTitle: '',
        metaDescription: ''
      },
      {
        pageKey: 'privacy-policy',
        title: 'Privacy Policy',
        content: '<h1>Privacy Policy</h1><p>At Domain Name Guide, we take your privacy seriously. This policy describes what personal information we collect and how we use it.</p><h2>Information We Collect</h2><p>We collect information you provide directly to us, such as when you create an account, make a purchase, or contact us for support.</p><p>This may include:</p><ul><li>Name and contact information</li><li>Payment and transaction information</li><li>Communications and correspondence</li><li>Account preferences</li></ul><h2>How We Use Your Information</h2><p>We use the information we collect to:</p><ul><li>Process transactions and send transaction notifications</li><li>Provide, maintain, and improve our services</li><li>Respond to your comments, questions, and requests</li><li>Send technical notices, updates, and administrative messages</li><li>Communicate about new offerings, promotions, and other news</li></ul>',
        metaTitle: 'Privacy Policy | Domain Name Guide',
        metaDescription: 'Review our privacy policy to understand how we collect, use, and protect your personal information at Domain Name Guide.'
      },
      {
        pageKey: 'terms',
        title: 'Terms of Service',
        content: '<h1>Terms of Service</h1><p>These Terms of Service ("Terms") govern your access to and use of Domain Name Guide services. By using our services, you agree to be bound by these Terms.</p><h2>Account Registration</h2><p>To access certain features, you may need to register for an account. You agree to provide accurate information and keep it updated.</p><h2>Domain Purchases</h2><p>When you purchase a domain:</p><ul><li>You agree to pay the specified price</li><li>We agree to facilitate the transfer of the domain to you</li><li>All sales are final unless otherwise specified</li></ul><h2>Ownership Transfer Process</h2><p>After purchase, we will initiate the domain transfer process within 24-48 hours. You agree to promptly complete any required steps to facilitate the transfer.</p>',
        metaTitle: 'Terms of Service | Domain Name Guide',
        metaDescription: 'Review the terms and conditions governing your use of Domain Name Guide services, including account registration, purchases, and transfers.'
      },
      {
        pageKey: 'ebook-section',
        title: 'E-Book Section',
        content: '<h2>The Ultimate Domain Investment Guide</h2><p>Our comprehensive e-book provides everything you need to know about investing in domain names. From valuation techniques to portfolio management strategies, this guide covers it all.</p><h3>What\'s Inside:</h3><ul><li>Domain valuation methods and tools</li><li>Market timing strategies</li><li>Portfolio diversification techniques</li><li>Case studies of successful domain investments</li><li>Tax considerations for domain investors</li><li>Legal protections for your domain portfolio</li></ul><p>Regular price: $49.95</p><p>Special offer: $29.95</p>',
        metaTitle: 'Ultimate Domain Investment Guide | Domain Name Guide',
        metaDescription: 'Download our comprehensive domain investment e-book. Learn valuation techniques, market timing strategies, and portfolio management from domain experts.',
        fileName: 'ultimate-domain-investment-guide.pdf',
        fileType: 'application/pdf',
        isPurchaseRequired: true,
        price: 2995
      },
      {
        pageKey: 'domain-guide-settings',
        title: 'Domain Guide Settings',
        content: '<h1>Domain Investment Guide</h1><p>Welcome to our comprehensive guide to domain name investment. This resource is designed to help both beginners and experienced investors make informed decisions in the domain market.</p><h2>Understanding Domain Value</h2><p>Domain value is determined by several key factors:</p><ul><li><strong>Length:</strong> Shorter domains are generally more valuable than longer ones.</li><li><strong>Extension:</strong> .com domains typically command the highest prices, followed by .net and .org.</li><li><strong>Memorability:</strong> Easy to spell, pronounce, and remember domains have higher value.</li><li><strong>Commercial Potential:</strong> Domains that align with profitable industries or popular search terms.</li><li><strong>Brandability:</strong> Names that can serve as effective brand identifiers.</li></ul><h2>Investment Strategies</h2><p>Successful domain investors typically follow these approaches:</p><ol><li><strong>Buy and Hold:</strong> Purchasing domains with long-term appreciation potential.</li><li><strong>Development:</strong> Adding value through website creation.</li><li><strong>Flipping:</strong> Buying undervalued domains and reselling quickly.</li><li><strong>Portfolio Building:</strong> Diversifying across different types of domains.</li></ol>',
        metaTitle: 'Domain Investment Guide | Learning Center',
        metaDescription: 'Learn domain investment strategies, valuation techniques, and market insights from our comprehensive domain guide.'
      }
    ];
    
    for (const page of defaultPages) {
      const pageContent: PageContent = {
        id: this.pageContentIdCounter++,
        pageKey: page.pageKey,
        title: page.title,
        content: page.content,
        metaTitle: page.metaTitle || null,
        metaDescription: page.metaDescription || null,
        filePath: page.filePath || null,
        fileName: page.fileName || null,
        fileType: page.fileType || null,
        fileSize: page.fileSize || null,
        isPurchaseRequired: page.isPurchaseRequired || false,
        price: page.price || null,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      this.pageContents.set(page.pageKey, pageContent);
    }
  }
  
  private initializeDomains() {
    const sampleDomains: InsertDomain[] = [
      // Domains from the provided list
      {
        name: "iptvhd.com",
        description: "Perfect for IPTV services, streaming providers, or digital TV platforms.",
        price: 24900,
        category: "Entertainment",
        length: 7,
        isSold: false,
      },
      {
        name: "lakome.com",
        description: "Great for international businesses, cultural platforms, or lifestyle brands.",
        price: 19800,
        category: "Business",
        length: 7,
        isSold: false,
      },
      {
        name: "expired.website",
        description: "Ideal for domain recovery services, website resellers, or digital archives.",
        price: 9500,
        category: "Technology",
        length: 16,
        isSold: false,
      },
      {
        name: "grape.website",
        description: "Perfect for vineyard businesses, wine enthusiasts, or agricultural platforms.",
        price: 8700,
        category: "Food & Beverage",
        length: 13,
        isSold: false,
      },
      {
        name: "highchips.com",
        description: "Ideal for semiconductor companies, tech hardware, or premium snack brands.",
        price: 17500,
        category: "Technology",
        length: 10,
        isSold: false,
      },
      {
        name: "allgreenplants.com",
        description: "Perfect for nurseries, plant shops, or sustainable gardening businesses.",
        price: 15800,
        category: "Home & Garden",
        length: 16,
        isSold: false,
      },
      {
        name: "freshmasks.com",
        description: "Great for face mask retailers, skincare brands, or beauty products.",
        price: 12900,
        category: "Health",
        length: 11,
        isSold: false,
      },
      {
        name: "usabakeries.com",
        description: "Ideal for bakery networks, pastry businesses, or food franchises.",
        price: 14500,
        category: "Food",
        length: 12,
        isSold: false,
      },
      {
        name: "neonmirrors.com",
        description: "Perfect for home decor shops, lighting businesses, or interior designers.",
        price: 16800,
        category: "Home Decor",
        length: 12,
        isSold: false,
      },
      {
        name: "parfumpourfemme.com",
        description: "Ideal for perfume retailers, fragrance creators, or luxury beauty brands.",
        price: 18500,
        category: "Beauty",
        length: 16,
        isSold: false,
      },
      {
        name: "shopifast.com",
        description: "Great for e-commerce platforms, fast delivery services, or online retailers.",
        price: 21900,
        category: "Retail",
        length: 10,
        isSold: false,
      },
      {
        name: "helloshoes.com",
        description: "Perfect for footwear retailers, shoe designers, or fashion accessories.",
        price: 26800,
        category: "Fashion",
        length: 11,
        isSold: false,
      },
      {
        name: "techub.xyz",
        description: "Ideal for tech communities, startup incubators, or innovation centers.",
        price: 9500,
        category: "Technology",
        length: 9,
        isSold: false,
      },
      {
        name: "chatgptbots.com",
        description: "Great for AI chatbot developers, conversational AI platforms, or GPT services.",
        price: 32500,
        category: "Technology",
        length: 12,
        isSold: false,
      },
      {
        name: "printsly.com",
        description: "Perfect for printing services, graphic design, or merchandise customization.",
        price: 14800,
        category: "Services",
        length: 9,
        isSold: false,
      },
      {
        name: "idelivery.xyz",
        description: "Ideal for delivery services, logistics companies, or courier platforms.",
        price: 11500,
        category: "Logistics",
        length: 12,
        isSold: false,
      },
      {
        name: "insuremydrone.com",
        description: "Perfect for drone insurance, aerial equipment coverage, or specialized insurance.",
        price: 19600,
        category: "Insurance",
        length: 14,
        isSold: false,
      },
      {
        name: "softcandle.com",
        description: "Great for candle makers, home fragrance brands, or relaxation products.",
        price: 15800,
        category: "Home Decor",
        length: 11,
        isSold: false,
      },
      {
        name: "ai-seo.com",
        description: "Ideal for AI-powered SEO services, digital marketing, or content optimization.",
        price: 28500,
        category: "Technology",
        length: 8,
        isSold: false,
      },
      {
        name: "brinksy.com",
        description: "Perfect for creative brands, innovative startups, or unique products.",
        price: 17900,
        category: "Business",
        length: 8,
        isSold: false,
      },
      {
        name: "aicolorist.com",
        description: "Great for AI image colorization, creative design services, or photo editing.",
        price: 24500,
        category: "Technology",
        length: 11,
        isSold: false,
      },
      {
        name: "dogeswap.com",
        description: "Ideal for cryptocurrency exchange, Dogecoin trading, or digital currency platforms.",
        price: 37900,
        category: "Finance",
        length: 9,
        isSold: false,
      },
      {
        name: "votira.com",
        description: "Perfect for voting systems, polling platforms, or democratic technology.",
        price: 16400,
        category: "Technology",
        length: 7,
        isSold: false,
      },
      {
        name: "idealbebe.com",
        description: "Great for baby products, parenting resources, or children's stores.",
        price: 22800,
        category: "Family",
        length: 10,
        isSold: false,
      },
      {
        name: "videozy.com",
        description: "Ideal for video platforms, editing services, or content creation tools.",
        price: 29500,
        category: "Entertainment",
        length: 8,
        isSold: false,
      },
      {
        name: "soracharacter.com",
        description: "Perfect for AI character creation, animation services, or digital storytelling.",
        price: 26700,
        category: "Technology",
        length: 14,
        isSold: false,
      },
      {
        name: "myhri.com",
        description: "Great for HR solutions, employee management, or recruitment services.",
        price: 18900,
        category: "Business",
        length: 6,
        isSold: false,
      },
      {
        name: "mimouna.com",
        description: "Ideal for cultural events, celebrations, or traditional services.",
        price: 21500,
        category: "Culture",
        length: 8,
        isSold: false,
      },
      {
        name: "vey.io",
        description: "Perfect for tech startups, modern web apps, or innovative digital services.",
        price: 15200,
        category: "Technology",
        length: 5,
        isSold: false,
      },
      {
        name: "animalio.com",
        description: "Great for pet services, animal care, or wildlife organizations.",
        price: 27800,
        category: "Pets",
        length: 9,
        isSold: false,
      },
      {
        name: "embowed.com",
        description: "Ideal for design services, artistic platforms, or creative businesses.",
        price: 16400,
        category: "Art",
        length: 8,
        isSold: false,
      },
      {
        name: "aitextlab.com",
        description: "Perfect for AI text generation, language processing, or content creation.",
        price: 31500,
        category: "Technology",
        length: 10,
        isSold: false,
      },
      {
        name: "soraediting.com",
        description: "Great for AI video editing, digital content creation, or media services.",
        price: 28900,
        category: "Technology",
        length: 12,
        isSold: false,
      },
      {
        name: "dentalto.com",
        description: "Ideal for dental practices, oral healthcare services, or medical platforms.",
        price: 23700,
        category: "Health",
        length: 9,
        isSold: false,
      },
      {
        name: "onlinedivorceforms.com",
        description: "Perfect for legal services, divorce assistance, or document preparation.",
        price: 32500,
        category: "Legal",
        length: 19,
        isSold: false,
      },
      {
        name: "bergelectronics.com",
        description: "Great for electronics retailers, technology manufacturers, or gadget shops.",
        price: 24800,
        category: "Technology",
        length: 17,
        isSold: false,
      },
      {
        name: "notaryloan.com",
        description: "Ideal for notary services, loan providers, or legal document processing.",
        price: 19700,
        category: "Finance",
        length: 11,
        isSold: false,
      },
      {
        name: "snoringmedicine.com",
        description: "Perfect for sleep medicine, anti-snoring products, or sleep clinics.",
        price: 25600,
        category: "Health",
        length: 16,
        isSold: false,
      },
      {
        name: "webrobo.com",
        description: "Great for web automation, robotic process services, or AI technology.",
        price: 21800,
        category: "Technology",
        length: 8,
        isSold: false,
      },
      {
        name: "texasdiscountfurniture.com",
        description: "Ideal for furniture stores, discount retailers, or home furnishings.",
        price: 35800,
        category: "Retail",
        length: 24,
        isSold: false,
      },
      {
        name: "smartylamps.com",
        description: "Perfect for smart lighting, home automation, or IoT devices.",
        price: 19500,
        category: "Technology",
        length: 12,
        isSold: false,
      },
      {
        name: "baseballballs.com",
        description: "Great for sports equipment, baseball supplies, or athletic goods.",
        price: 18400,
        category: "Sports",
        length: 14,
        isSold: false,
      },
      {
        name: "charlestonfarm.com",
        description: "Ideal for farms, agricultural businesses, or local produce suppliers.",
        price: 26700,
        category: "Agriculture",
        length: 15,
        isSold: false,
      },
      {
        name: "cheapcloset.com",
        description: "Perfect for affordable furniture, storage solutions, or home organization.",
        price: 22500,
        category: "Retail",
        length: 12,
        isSold: false,
      },
      {
        name: "galaxyvoip.com",
        description: "Great for VoIP services, telecommunications, or business phone systems.",
        price: 23900,
        category: "Technology",
        length: 11,
        isSold: false,
      },
      {
        name: "onlinesmartphone.com",
        description: "Ideal for smartphone retailers, mobile accessories, or tech reviews.",
        price: 29700,
        category: "Technology",
        length: 17,
        isSold: false,
      },
      {
        name: "guideforsuccess.com",
        description: "Perfect for coaching services, self-improvement, or business guidance.",
        price: 24800,
        category: "Education",
        length: 16,
        isSold: false,
      },
      {
        name: "waxhawplumber.com",
        description: "Great for plumbing services, local contractors, or home repair businesses.",
        price: 15600,
        category: "Services",
        length: 15,
        isSold: false,
      },
      {
        name: "muscada.com",
        description: "Ideal for music platforms, audio services, or entertainment businesses.",
        price: 18700,
        category: "Entertainment",
        length: 8,
        isSold: false,
      },
      {
        name: "trentonroofers.com",
        description: "Perfect for roofing services, construction companies, or home contractors.",
        price: 16700,
        category: "Services",
        length: 15,
        isSold: false,
      },
      {
        name: "usedelectricauto.com",
        description: "Great for electric vehicle dealerships, used EV marketplaces, or auto traders.",
        price: 28800,
        category: "Automotive",
        length: 17,
        isSold: false,
      },
      {
        name: "mobildialysis.com",
        description: "Ideal for mobile medical services, dialysis centers, or healthcare platforms.",
        price: 32100,
        category: "Health",
        length: 14,
        isSold: false,
      },
      {
        name: "dubaidomain.com",
        description: "Perfect for Dubai businesses, real estate, or tourism services.",
        price: 42500,
        category: "Real Estate",
        length: 12,
        isSold: false,
      },
      {
        name: "ekotoner.com",
        description: "Great for eco-friendly printer supplies, sustainable office products, or recycling services.",
        price: 18900,
        category: "Office",
        length: 9,
        isSold: false,
      },
      {
        name: "flyek.com",
        description: "Ideal for flight booking, travel services, or aviation platforms.",
        price: 21400,
        category: "Travel",
        length: 6,
        isSold: false,
      },
      {
        name: "augustatraining.com",
        description: "Perfect for training services, educational platforms, or professional development.",
        price: 23600,
        category: "Education",
        length: 17,
        isSold: false,
      },
      {
        name: "texiko.com",
        description: "Great for unique branding, creative startups, or innovative products.",
        price: 15900,
        category: "Business",
        length: 7,
        isSold: false,
      },
      {
        name: "zcach.com",
        description: "Ideal for fintech services, payment platforms, or financial technology.",
        price: 16700,
        category: "Finance",
        length: 6,
        isSold: false,
      },
      {
        name: "emergencyvehiclerepair.com",
        description: "Perfect for emergency vehicle maintenance, auto repair services, or mobile mechanics.",
        price: 27500,
        category: "Automotive",
        length: 24,
        isSold: false,
      },
      {
        name: "animextrem.com",
        description: "Great for anime platforms, streaming services, or fan communities.",
        price: 19800,
        category: "Entertainment",
        length: 11,
        isSold: false,
      },
      {
        name: "digitalarchiveservices.com",
        description: "Ideal for digital archiving, document storage, or preservation services.",
        price: 29600,
        category: "Technology",
        length: 25,
        isSold: false,
      },
      {
        name: "aibanned.com",
        description: "Perfect for AI policy discussions, regulatory services, or technology compliance.",
        price: 23500,
        category: "Technology",
        length: 9,
        isSold: false,
      },
      {
        name: "sangocoin.com",
        description: "Great for cryptocurrency, digital tokens, or blockchain platforms.",
        price: 32400,
        category: "Finance",
        length: 11,
        isSold: false,
      },
      {
        name: "bremertonplumber.com",
        description: "Ideal for plumbing services, local contractors, or home repair businesses.",
        price: 17800,
        category: "Services",
        length: 18,
        isSold: false,
      },
      {
        name: "aihunted.com",
        description: "Perfect for AI detection services, content verification, or technology tracking.",
        price: 25600,
        category: "Technology",
        length: 9,
        isSold: false,
      },
      {
        name: "dogtrainingplan.com",
        description: "Great for pet training services, dog training resources, or animal behavior specialists.",
        price: 19700,
        category: "Pets",
        length: 16,
        isSold: false,
      },
      {
        name: "melbourneofficefurniture.com",
        description: "Ideal for office furniture, business equipment, or workplace design services.",
        price: 31900,
        category: "Office",
        length: 25,
        isSold: false,
      },
      {
        name: "usedcarskilleen.com",
        description: "Perfect for used car dealerships, auto trading, or vehicle marketplaces.",
        price: 22500,
        category: "Automotive",
        length: 17,
        isSold: false,
      },
      {
        name: "dakarinfo.com",
        description: "Great for news services, information platforms, or regional content.",
        price: 18400,
        category: "News",
        length: 10,
        isSold: false,
      },
      {
        name: "onlinewritingservices.com",
        description: "Ideal for freelance writing, content creation, or copywriting businesses.",
        price: 27800,
        category: "Services",
        length: 23,
        isSold: false,
      },
      {
        name: "sydneysunglasses.com",
        description: "Perfect for eyewear retailers, sunglass stores, or fashion accessories.",
        price: 24600,
        category: "Fashion",
        length: 18,
        isSold: false,
      },
      {
        name: "gamefixing.com",
        description: "Great for game repair services, bug fixing, or gaming support platforms.",
        price: 19700,
        category: "Gaming",
        length: 11,
        isSold: false,
      },
      {
        name: "aihorses.com",
        description: "Ideal for AI-generated horse imagery, equestrian services, or digital art.",
        price: 21800,
        category: "Technology",
        length: 9,
        isSold: false,
      },
      {
        name: "pepacoin.com",
        description: "Perfect for cryptocurrency, meme coins, or digital currency platforms.",
        price: 29700,
        category: "Finance",
        length: 9,
        isSold: false,
      },
      {
        name: "storinator.com",
        description: "Great for storage solutions, data hosting, or cloud services.",
        price: 25600,
        category: "Technology",
        length: 11,
        isSold: false,
      },
      {
        name: "carunlockingservices.com",
        description: "Ideal for locksmith services, auto assistance, or emergency vehicle access.",
        price: 26900,
        category: "Automotive",
        length: 22,
        isSold: false,
      },
      {
        name: "scanator.com",
        description: "Perfect for scanning services, document digitization, or data capture platforms.",
        price: 22400,
        category: "Technology",
        length: 10,
        isSold: false,
      },
      {
        name: "aipixo.com",
        description: "Great for AI image generation, digital art creation, or creative platforms.",
        price: 26500,
        category: "Technology",
        length: 7,
        isSold: false,
      },
      {
        name: "profisy.com",
        description: "Ideal for professional services, business efficiency, or productivity tools.",
        price: 18700,
        category: "Business",
        length: 8,
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
  
  // Page Content methods for CMS
  async getAllPageContents(): Promise<PageContent[]> {
    return Array.from(this.pageContents.values());
  }
  
  async getPageContent(pageKey: string): Promise<PageContent | undefined> {
    return this.pageContents.get(pageKey);
  }
  
  async createPageContent(pageContent: InsertPageContent): Promise<PageContent> {
    const newPageContent: PageContent = {
      id: this.pageContentIdCounter++,
      pageKey: pageContent.pageKey,
      title: pageContent.title,
      content: pageContent.content,
      metaTitle: pageContent.metaTitle || null,
      metaDescription: pageContent.metaDescription || null,
      price: null,
      isPurchaseRequired: false,
      filePath: null,
      fileName: null,
      fileType: null,
      fileSize: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.pageContents.set(pageContent.pageKey, newPageContent);
    return newPageContent;
  }
  
  async updatePageContent(pageKey: string, updates: Partial<InsertPageContent>): Promise<PageContent | undefined> {
    const existingContent = this.pageContents.get(pageKey);
    
    if (!existingContent) {
      return undefined;
    }
    
    const updatedContent: PageContent = {
      ...existingContent,
      title: updates.title ?? existingContent.title,
      content: updates.content ?? existingContent.content,
      metaTitle: updates.metaTitle ?? existingContent.metaTitle,
      metaDescription: updates.metaDescription ?? existingContent.metaDescription,
      // Add support for file uploads and price updates
      filePath: updates.filePath !== undefined ? updates.filePath : existingContent.filePath,
      fileName: updates.fileName !== undefined ? updates.fileName : existingContent.fileName,
      fileType: updates.fileType !== undefined ? updates.fileType : existingContent.fileType,
      fileSize: updates.fileSize !== undefined ? updates.fileSize : existingContent.fileSize,
      price: updates.price !== undefined ? updates.price : existingContent.price,
      isPurchaseRequired: updates.isPurchaseRequired !== undefined ? updates.isPurchaseRequired : (existingContent.isPurchaseRequired || false),
      updatedAt: new Date()
    };
    
    this.pageContents.set(pageKey, updatedContent);
    return updatedContent;
  }
  
  async deletePageContent(pageKey: string): Promise<boolean> {
    if (!this.pageContents.has(pageKey)) {
      return false;
    }
    
    return this.pageContents.delete(pageKey);
  }
  
  // Email Submissions methods for ebook downloads
  async createEmailSubmission(submission: InsertEmailSubmission): Promise<EmailSubmission> {
    const newSubmission: EmailSubmission = {
      id: this.emailSubmissionIdCounter++,
      email: submission.email,
      source: submission.source || "ebook",
      downloadedAt: new Date(),
    };
    
    this.emailSubmissions.set(newSubmission.id, newSubmission);
    return newSubmission;
  }
  
  async getAllEmailSubmissions(): Promise<EmailSubmission[]> {
    return Array.from(this.emailSubmissions.values());
  }
  
  // SEO Settings methods
  async getAllSeoSettings(): Promise<SeoSettings[]> {
    // Convert Map to array safely
    const settingsArray: SeoSettings[] = [];
    this.seoSettings.forEach((value) => {
      settingsArray.push(value);
    });
    return settingsArray;
  }

  async getSeoSettingByPageKey(pageKey: string): Promise<SeoSettings | undefined> {
    return this.seoSettings.get(pageKey);
  }

  async createSeoSetting(seoSetting: InsertSeoSettings): Promise<SeoSettings> {
    const newSetting: SeoSettings = {
      id: this.seoSettingIdCounter++,
      pageKey: seoSetting.pageKey,
      title: seoSetting.title,
      metaDescription: seoSetting.metaDescription,
      metaKeywords: seoSetting.metaKeywords,
      structuredData: seoSetting.structuredData || null,
      updatedAt: new Date()
    };
    
    this.seoSettings.set(newSetting.pageKey, newSetting);
    return newSetting;
  }

  async updateSeoSetting(pageKey: string, updates: Partial<InsertSeoSettings>): Promise<SeoSettings | undefined> {
    const existingSetting = await this.getSeoSettingByPageKey(pageKey);
    
    if (!existingSetting) {
      return undefined;
    }
    
    const updatedSetting: SeoSettings = {
      ...existingSetting,
      ...updates,
      updatedAt: new Date()
    };
    
    this.seoSettings.set(pageKey, updatedSetting);
    return updatedSetting;
  }

  async deleteSeoSetting(pageKey: string): Promise<boolean> {
    return this.seoSettings.delete(pageKey);
  }
}

export class DatabaseStorage implements IStorage {
  public sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresStore({
      pool,
      createTableIfMissing: true
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getAllDomains(): Promise<Domain[]> {
    return await db.select().from(domains).orderBy(desc(domains.id));
  }

  async getDomain(id: number): Promise<Domain | undefined> {
    const [domain] = await db.select().from(domains).where(eq(domains.id, id));
    return domain;
  }

  async searchDomains(query: string): Promise<Domain[]> {
    return await db.select()
      .from(domains)
      .where(
        or(
          like(domains.name, `%${query}%`),
          like(domains.description, `%${query}%`),
          like(domains.category, `%${query}%`)
        )
      )
      .orderBy(desc(domains.id));
  }

  async filterDomains(filters: {
    category?: string;
    priceRange?: string;
    length?: string;
  }): Promise<Domain[]> {
    let conditions = [];
    
    if (filters.category && filters.category !== 'all') {
      conditions.push(eq(domains.category, filters.category));
    }
    
    if (filters.priceRange && filters.priceRange !== 'all') {
      const [min, max] = filters.priceRange.split('-').map(Number);
      if (max) {
        conditions.push(and(
          gt(domains.price, min),
          lt(domains.price, max)
        ));
      } else {
        conditions.push(gt(domains.price, min));
      }
    }
    
    if (filters.length && filters.length !== 'all') {
      const lengthNum = parseInt(filters.length);
      conditions.push(eq(domains.length, lengthNum));
    }
    
    // If there are no filters, return all domains
    if (conditions.length === 0) {
      return await this.getAllDomains();
    }
    
    return await db.select()
      .from(domains)
      .where(conditions.length > 1 ? and(...conditions) : conditions[0])
      .orderBy(desc(domains.id));
  }

  async createDomain(insertDomain: InsertDomain): Promise<Domain> {
    const [domain] = await db.insert(domains).values(insertDomain).returning();
    return domain;
  }

  async updateDomain(id: number, updates: Partial<Domain>): Promise<Domain | undefined> {
    const [updatedDomain] = await db.update(domains)
      .set(updates)
      .where(eq(domains.id, id))
      .returning();
    return updatedDomain;
  }

  async deleteDomain(id: number): Promise<boolean> {
    const result = await db.delete(domains).where(eq(domains.id, id));
    return true; // Drizzle doesn't return affected rows, so we assume success
  }

  async markDomainAsSold(id: number): Promise<Domain | undefined> {
    return await this.updateDomain(id, { isSold: true });
  }

  async incrementViewCount(id: number): Promise<Domain | undefined> {
    const domain = await this.getDomain(id);
    if (!domain) return undefined;
    
    const currentViews = domain.viewCount || 0;
    return await this.updateDomain(id, { viewCount: currentViews + 1 });
  }

  async getDomainStats(): Promise<{
    totalDomains: number;
    soldDomains: number;
    totalViews: number;
    domainsByCategory: Record<string, number>;
    totalRevenue: number;
    averagePrice: number;
    averageViews: number;
    mostViewedDomains: Array<{ id: number, name: string, viewCount: number, price: number }>;
    revenueByCategory: Record<string, number>;
    averagePriceByCategory: Record<string, number>;
    conversionRate: number;
    performanceByLength: Array<{ length: number, count: number, averagePrice: number, averageViews: number }>;
  }> {
    // Get total domains
    const [totalResult] = await db.select({ count: count() }).from(domains);
    const totalDomains = Number(totalResult.count);
    
    // Get sold domains
    const [soldResult] = await db.select({ count: count() })
      .from(domains)
      .where(eq(domains.isSold, true));
    const soldDomains = Number(soldResult.count);
    
    // Get total views
    const [viewsResult] = await db.select({ sum: sum(domains.viewCount) }).from(domains);
    const totalViews = Number(viewsResult.sum || 0);
    
    // Calculate average views per domain
    const averageViews = totalDomains > 0 ? totalViews / totalDomains : 0;
    
    // Get domains by category
    const categoryCounts = await db.select({
      category: domains.category,
      count: count(),
    })
    .from(domains)
    .groupBy(domains.category);
    
    const domainsByCategory: Record<string, number> = {};
    for (const row of categoryCounts) {
      domainsByCategory[row.category] = Number(row.count);
    }
    
    // Calculate total revenue and average price
    const [priceStats] = await db.select({
      totalRevenue: sum(domains.price),
      averagePrice: avg(domains.price)
    })
    .from(domains)
    .where(eq(domains.isSold, true));
    
    const totalRevenue = Number(priceStats?.totalRevenue || 0);
    const averagePrice = Number(priceStats?.averagePrice || 0);
    
    // Get top 5 most viewed domains
    const mostViewedDomains = await db.select({
      id: domains.id,
      name: domains.name,
      viewCount: domains.viewCount,
      price: domains.price
    })
    .from(domains)
    .orderBy(desc(domains.viewCount))
    .limit(5);
    
    // Calculate conversion rate (sold domains / total domains)
    const conversionRate = totalDomains > 0 ? (soldDomains / totalDomains) * 100 : 0;
    
    // Calculate revenue by category
    const categoryRevenue = await db.select({
      category: domains.category,
      revenue: sum(domains.price)
    })
    .from(domains)
    .where(eq(domains.isSold, true))
    .groupBy(domains.category);
    
    const revenueByCategory: Record<string, number> = {};
    for (const row of categoryRevenue) {
      revenueByCategory[row.category] = Number(row.revenue || 0);
    }
    
    // Calculate average price by category
    const categoryPriceAvg = await db.select({
      category: domains.category,
      avgPrice: avg(domains.price)
    })
    .from(domains)
    .groupBy(domains.category);
    
    const averagePriceByCategory: Record<string, number> = {};
    for (const row of categoryPriceAvg) {
      averagePriceByCategory[row.category] = Number(row.avgPrice || 0);
    }
    
    // Calculate performance metrics by domain length
    const lengthPerformance = await db.select({
      length: domains.length,
      count: count(),
      avgPrice: avg(domains.price),
      avgViews: avg(domains.viewCount)
    })
    .from(domains)
    .groupBy(domains.length)
    .orderBy(domains.length);
    
    const performanceByLength = lengthPerformance.map(row => ({
      length: Number(row.length),
      count: Number(row.count),
      averagePrice: Number(row.avgPrice || 0),
      averageViews: Number(row.avgViews || 0)
    }));
    
    return {
      totalDomains,
      soldDomains,
      totalViews,
      domainsByCategory,
      totalRevenue,
      averagePrice,
      averageViews,
      mostViewedDomains,
      revenueByCategory,
      averagePriceByCategory,
      conversionRate,
      performanceByLength
    };
  }

  async createOffer(insertOffer: InsertOffer): Promise<Offer> {
    const [offer] = await db.insert(offers).values(insertOffer).returning();
    return offer;
  }

  async getOffersByDomainId(domainId: number): Promise<Offer[]> {
    return await db.select()
      .from(offers)
      .where(eq(offers.domainId, domainId))
      .orderBy(desc(offers.createdAt));
  }

  async createConsultation(insertConsultation: InsertConsultation): Promise<Consultation> {
    const [consultation] = await db.insert(consultations).values(insertConsultation).returning();
    return consultation;
  }

  async getAllConsultations(): Promise<Consultation[]> {
    return await db.select()
      .from(consultations)
      .orderBy(desc(consultations.createdAt));
  }

  async getAllPageContents(): Promise<PageContent[]> {
    return await db.select().from(pageContents);
  }

  async getPageContent(pageKey: string): Promise<PageContent | undefined> {
    const [content] = await db.select()
      .from(pageContents)
      .where(eq(pageContents.pageKey, pageKey));
    return content;
  }

  async createPageContent(insertPageContent: InsertPageContent): Promise<PageContent> {
    const [content] = await db.insert(pageContents).values(insertPageContent).returning();
    return content;
  }

  async updatePageContent(pageKey: string, updates: Partial<InsertPageContent>): Promise<PageContent | undefined> {
    const [updatedContent] = await db.update(pageContents)
      .set(updates)
      .where(eq(pageContents.pageKey, pageKey))
      .returning();
    return updatedContent;
  }

  async deletePageContent(pageKey: string): Promise<boolean> {
    await db.delete(pageContents).where(eq(pageContents.pageKey, pageKey));
    return true;
  }

  async createEmailSubmission(submission: InsertEmailSubmission): Promise<EmailSubmission> {
    const [newSubmission] = await db.insert(emailSubmissions).values(submission).returning();
    return newSubmission;
  }

  async getAllEmailSubmissions(): Promise<EmailSubmission[]> {
    return await db.select()
      .from(emailSubmissions)
      .orderBy(desc(emailSubmissions.downloadedAt));
  }

  // SEO Settings methods
  async getAllSeoSettings(): Promise<SeoSettings[]> {
    return await db.select()
      .from(seoSettings)
      .orderBy(seoSettings.pageKey);
  }

  async getSeoSettingByPageKey(pageKey: string): Promise<SeoSettings | undefined> {
    const [settings] = await db.select()
      .from(seoSettings)
      .where(eq(seoSettings.pageKey, pageKey));
    return settings;
  }

  async createSeoSetting(setting: InsertSeoSettings): Promise<SeoSettings> {
    const [newSetting] = await db.insert(seoSettings)
      .values(setting)
      .returning();
    return newSetting;
  }

  async updateSeoSetting(pageKey: string, updates: Partial<InsertSeoSettings>): Promise<SeoSettings | undefined> {
    const [updatedSetting] = await db.update(seoSettings)
      .set(updates)
      .where(eq(seoSettings.pageKey, pageKey))
      .returning();
    return updatedSetting;
  }

  async deleteSeoSetting(pageKey: string): Promise<boolean> {
    await db.delete(seoSettings)
      .where(eq(seoSettings.pageKey, pageKey));
    return true;
  }
}

// Change to database storage
export const storage = new DatabaseStorage();
