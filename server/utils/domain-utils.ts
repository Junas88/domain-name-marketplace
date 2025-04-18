/**
 * Generates a description for a domain based on its name and category
 */
export function generateDomainDescription(domainName: string, category: string): string {
  const baseName = domainName.split('.')[0].toLowerCase();
  
  // Extract likely words from domain name
  const words = baseName
    .replace(/[0-9]/g, '') // Remove numbers
    .replace(/-/g, ' ') // Replace hyphens with spaces
    .split(/(?=[A-Z])/) // Split on capital letters (camelCase)
    .join(' ')
    .trim();

  // Map of categories to description templates
  const categoryDescriptions: Record<string, string[]> = {
    'business': [
      `${domainName} is an ideal domain for a business focused on ${words}. It's concise, memorable, and directly relates to your industry.`,
      `A premium business domain that clearly communicates your professional focus on ${words}. Perfect for corporate websites and B2B services.`,
      `Establish instant credibility in the ${words} industry with this clear, professional domain name.`
    ],
    'technology': [
      `${domainName} perfectly positions your tech company or startup in the ${words} space. It's modern, innovative, and ready for your cutting-edge business.`,
      `A forward-thinking domain name for technology companies specializing in ${words}. Ideal for startups, SaaS, and tech innovations.`,
      `Launch your tech product or service with this domain that instantly communicates innovation in ${words}.`
    ],
    'finance': [
      `${domainName} conveys trust and reliability - essential qualities for financial services related to ${words}. Perfect for investment firms, financial advisors, or fintech platforms.`,
      `A premium domain name for financial services, investment platforms, or banking solutions focused on ${words}.`,
      `Build client trust immediately with this clear, professional domain for your financial services in the ${words} sector.`
    ],
    'health': [
      `${domainName} is an excellent choice for healthcare providers, wellness services, or health products focused on ${words}. It's clear, trustworthy, and health-focused.`,
      `A perfect domain for medical practices, wellness centers, or health technology focused on ${words}.`,
      `Convey care and professionalism in the healthcare or wellness industry with this ${words}-focused domain name.`
    ],
    'real-estate': [
      `${domainName} is ideal for real estate agencies, property developers, or rental services specializing in ${words} properties. It's location-specific and property-focused.`,
      `A premium domain for real estate listings, property management, or development companies focusing on ${words} areas.`,
      `Establish your real estate business with this property-focused domain that clearly indicates your ${words} specialization.`
    ],
    'travel': [
      `${domainName} is perfect for travel agencies, tourism services, or accommodation platforms specializing in ${words} destinations. It's travel-specific and evokes wanderlust.`,
      `Launch your travel business, tour operations, or vacation services with this ${words}-focused domain name.`,
      `Create a memorable travel brand with this domain perfect for tourism services, guides, or accommodations in ${words} regions.`
    ],
    'education': [
      `${domainName} is ideal for educational institutions, online courses, or learning platforms focused on ${words}. It communicates knowledge and expertise.`,
      `A perfect domain for schools, e-learning platforms, or educational resources specializing in ${words}.`,
      `Build your educational brand with this domain ideal for courses, tutorials, or institutions teaching ${words}.`
    ],
    'entertainment': [
      `${domainName} captures the excitement of entertainment focused on ${words}. Perfect for media companies, streaming services, or event venues.`,
      `Launch your entertainment platform, production company, or media service with this engaging ${words}-focused domain.`,
      `Ideal for streaming services, content creators, or production companies specializing in ${words} entertainment.`
    ],
    'shopping': [
      `${domainName} is perfect for e-commerce stores, marketplaces, or retail businesses selling ${words} products. It's direct and shopping-focused.`,
      `Launch your online store or retail business with this commerce-ready domain focused on ${words} products.`,
      `A premium domain for retail businesses, specialty shops, or marketplaces offering ${words} products or services.`
    ],
    'sports': [
      `${domainName} is ideal for sports teams, fitness brands, or athletic equipment providers focused on ${words}. It's energetic and sports-oriented.`,
      `Perfect domain for sports leagues, fitness services, or athletic wear brands related to ${words}.`,
      `Build your sports brand with this dynamic domain suited for teams, equipment, or training focused on ${words}.`
    ],
    'gaming': [
      `${domainName} is perfect for gaming platforms, esports teams, or game developers focused on ${words}. It's engaging and gaming-focused.`,
      `Launch your gaming studio, esports organization, or streaming channel with this ${words}-themed domain.`,
      `A premium domain for game development, gaming communities, or esports organizations in the ${words} space.`
    ],
    'ai': [
      `${domainName} positions your AI company at the forefront of ${words} innovation. Ideal for machine learning startups, AI services, and tech solutions.`,
      `A cutting-edge domain for artificial intelligence companies, research groups, or products focused on ${words}.`,
      `Build your AI brand with this forward-thinking domain perfect for machine learning, neural networks, or AI services related to ${words}.`
    ],
    'crypto': [
      `${domainName} is perfect for cryptocurrency exchanges, blockchain services, or NFT platforms focused on ${words}. It's modern and crypto-ready.`,
      `Launch your blockchain project, crypto exchange, or Web3 platform with this ${words}-focused domain.`,
      `A premium domain for DeFi services, cryptocurrency projects, or NFT marketplaces in the ${words} space.`
    ],
    'food': [
      `${domainName} is appetizing and perfect for restaurants, food delivery services, or recipe platforms focused on ${words} cuisine.`,
      `Launch your culinary business, food blog, or dining guide with this tasty ${words}-focused domain.`,
      `A premium domain for restaurants, catering services, or food blogs specializing in ${words} cuisine.`
    ],
    'fashion': [
      `${domainName} is stylish and perfect for fashion brands, clothing stores, or style blogs focused on ${words} trends.`,
      `Build your fashion brand with this trendy domain ideal for clothing lines, accessories, or style services related to ${words}.`,
      `A premium domain for boutiques, fashion designers, or style platforms in the ${words} space.`
    ],
    'legal': [
      `${domainName} conveys authority and expertise - essential for law firms, legal services, or attorney practices focused on ${words}.`,
      `A trustworthy domain for legal consultancies, law firms, or compliance services specializing in ${words} law.`,
      `Establish credibility for your legal practice with this professional domain focused on ${words} services.`
    ],
    'social': [
      `${domainName} is perfect for social networks, community platforms, or forums centered around ${words} interests.`,
      `Build your social media platform, online community, or networking service with this ${words}-focused domain.`,
      `A premium domain for community-building, social apps, or networking services in the ${words} space.`
    ],
    'eco': [
      `${domainName} perfectly captures sustainability and eco-consciousness for green businesses focused on ${words}.`,
      `Launch your sustainable brand, environmental service, or eco-friendly products with this ${words}-focused domain.`,
      `A premium domain for green initiatives, sustainable products, or environmental services in the ${words} sector.`
    ],
    'other': [
      `${domainName} is a versatile, brandable domain perfect for businesses related to ${words}. It's memorable and offers excellent brand potential.`,
      `A premium domain name ready for your next venture related to ${words}. It's unique, catchy, and has strong brand potential.`,
      `Secure this memorable domain for your business or project related to ${words}. It's concise and perfect for building a recognizable brand.`
    ]
  };

  // Pick a random description from the category or use generic if category not found
  const descriptions = categoryDescriptions[category] || categoryDescriptions['other'];
  return descriptions[Math.floor(Math.random() * descriptions.length)];
}