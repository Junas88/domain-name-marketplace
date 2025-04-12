import { db } from "./db";
import { domains, pageContents, users } from "@shared/schema";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";
import { eq } from "drizzle-orm";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function seedDomains() {
  // Check if domains already exist
  const existingDomains = await db.select().from(domains);
  if (existingDomains.length > 0) {
    console.log("Domains already seeded, skipping...");
    return;
  }

  console.log("Seeding domains...");
  
  // Sample domains
  const domainData = [
    {
      name: "iptvhd.com",
      description: "Perfect for streaming services or IPTV providers. Short, memorable, and descriptive.",
      price: 2995,
      category: "Entertainment",
      length: 7,
      viewCount: 0,
      isSold: false
    },
    {
      name: "lakome.com",
      description: "Short, brandable domain suitable for various industries. Easy to remember and type.",
      price: 1795,
      category: "Brandable",
      length: 6,
      viewCount: 0,
      isSold: false
    },
    {
      name: "expired-website.com",
      description: "Useful for services related to domain expiration, website maintenance, or renewals.",
      price: 995,
      category: "Business",
      length: 17,
      viewCount: 0,
      isSold: false
    },
    {
      name: "grape-website.com",
      description: "Perfect for vineyards, wine retailers, or grape-related businesses. Memorable and descriptive.",
      price: 1195,
      category: "Food & Beverage",
      length: 15,
      viewCount: 0,
      isSold: false
    },
    {
      name: "highchips.com",
      description: "Great for premium snack brands, technology products, or gambling services.",
      price: 2495,
      category: "Food & Beverage",
      length: 9,
      viewCount: 0,
      isSold: false
    },
    {
      name: "allgreenplants.com",
      description: "Ideal for plant nurseries, gardening supplies, or sustainable products businesses.",
      price: 1895,
      category: "Home & Garden",
      length: 15,
      viewCount: 0,
      isSold: false
    },
    {
      name: "freshmasks.com",
      description: "Perfect for face mask retailers, beauty products, or healthcare supplies.",
      price: 3995,
      category: "Health",
      length: 10,
      viewCount: 0,
      isSold: false
    },
    {
      name: "cloudsync.io",
      description: "Excellent for cloud storage, data synchronization, or SaaS startups.",
      price: 4995,
      category: "Technology",
      length: 9,
      viewCount: 0,
      isSold: false
    },
    {
      name: "smartliving.app",
      description: "Perfect for smart home technologies, IoT devices, or lifestyle applications.",
      price: 3495,
      category: "Technology",
      length: 11,
      viewCount: 0,
      isSold: false
    },
    {
      name: "digitalhealth.co",
      description: "Great for telemedicine, health tech startups, or digital healthcare services.",
      price: 5995,
      category: "Health",
      length: 12,
      viewCount: 0,
      isSold: false
    },
    {
      name: "investpro.com",
      description: "Perfect for investment services, financial advisors, or trading platforms.",
      price: 7995,
      category: "Finance",
      length: 9,
      viewCount: 0,
      isSold: false
    },
    {
      name: "ecotravel.co",
      description: "Ideal for sustainable tourism, eco-friendly travel agencies, or green adventures.",
      price: 2995,
      category: "Travel",
      length: 9,
      viewCount: 0,
      isSold: false
    },
    {
      name: "fitnesshub.net",
      description: "Great for fitness centers, workout apps, or health coaching services.",
      price: 1795,
      category: "Health",
      length: 10,
      viewCount: 0,
      isSold: false
    },
    {
      name: "petlovers.org",
      description: "Perfect for pet adoption agencies, animal charities, or pet care services.",
      price: 1295,
      category: "Pets",
      length: 9,
      viewCount: 0,
      isSold: false
    },
    {
      name: "learnfast.co",
      description: "Ideal for online education, quick courses, or accelerated learning platforms.",
      price: 2195,
      category: "Education",
      length: 9,
      viewCount: 0,
      isSold: false
    },
    {
      name: "craftbeer.store",
      description: "Perfect for craft beer retailers, breweries, or beer subscription services.",
      price: 3295,
      category: "Food & Beverage",
      length: 10,
      viewCount: 0,
      isSold: false
    },
    {
      name: "homechef.recipes",
      description: "Great for recipe websites, cooking services, or culinary content creators.",
      price: 2495,
      category: "Food & Beverage",
      length: 13,
      viewCount: 0,
      isSold: false
    },
    {
      name: "gamezone.net",
      description: "Ideal for gaming websites, esports organizations, or game development studios.",
      price: 4795,
      category: "Entertainment",
      length: 8,
      viewCount: 0,
      isSold: false
    },
    {
      name: "localartists.com",
      description: "Perfect for art marketplaces, local galleries, or artist communities.",
      price: 3195,
      category: "Arts",
      length: 12,
      viewCount: 0,
      isSold: false
    },
    {
      name: "luxuryhomes.co",
      description: "Excellent for high-end real estate agencies, luxury property listings, or premium rentals.",
      price: 5795,
      category: "Real Estate",
      length: 11,
      viewCount: 0,
      isSold: false
    }
  ];

  // Insert domains
  await db.insert(domains).values(domainData);
  console.log(`Added ${domainData.length} domains to the database`);
}

async function seedPageContents() {
  // Check if page contents already exist
  const existingContents = await db.select().from(pageContents);
  if (existingContents.length > 0) {
    console.log("Page contents already seeded, skipping...");
    return;
  }

  console.log("Seeding page contents...");
  
  // Sample page contents
  const pageContentData = [
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
      content: '<h2>Domain Name Guide: The Complete E-Book</h2><p>Download our comprehensive guide to domain names, from acquisition strategies to investment opportunities.</p>',
      metaTitle: 'Domain Name Guide E-Book | Free Download',
      metaDescription: 'Get our free comprehensive e-book about domain names, acquisition strategies, and investment opportunities.',
      price: 4995,
      isPurchaseRequired: false,
      filePath: '/uploads/ebooks/domain-name-guide.pdf',
      fileName: 'Domain-Name-Guide-2023.pdf',
      fileType: 'application/pdf',
      fileSize: 2457600
    }
  ];

  // Insert page contents
  await db.insert(pageContents).values(pageContentData);
  console.log(`Added ${pageContentData.length} page content entries to the database`);
}

async function seedAdminUser() {
  // Check if admin user already exists
  const existingAdmin = await db.select().from(users).where(eq(users.username, 'admin'));
  if (existingAdmin.length > 0) {
    console.log("Admin user already exists, skipping...");
    return;
  }

  console.log("Creating admin user...");
  
  // Create admin user
  const hashedPassword = await hashPassword('admin123');
  
  await db.insert(users).values({
    username: 'admin',
    password: hashedPassword,
    isAdmin: true
  });
  
  console.log("Admin user created - Username: admin, Password: admin123");
}

export async function seedDatabase() {
  try {
    await seedAdminUser();
    await seedDomains();
    await seedPageContents();
    console.log("Database seeding completed successfully.");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}