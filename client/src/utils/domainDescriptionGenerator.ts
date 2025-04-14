/**
 * Utility to generate professional domain descriptions based on category
 * This helps maintain consistent, clean descriptions across all domains
 */

/**
 * Generate a professional description for a domain based on its category
 * @param domainName - The name of the domain (e.g., "example.com")
 * @param category - The category of the domain (e.g., "Business", "Technology")
 * @returns A professional, concise description
 */
export function generateDomainDescription(domainName: string, category: string): string {
  // Extract domain name without extension for potential use in description
  const cleanName = domainName.toLowerCase().replace(/\.(com|net|org|io|co|app|xyz)$/, '');
  
  // Map of standard descriptions by category
  const categoryDescriptions: Record<string, string> = {
    'Business': `Premium business domain for corporate or professional services.`,
    'Technology': `Ideal tech domain for software, IT services, or digital solutions.`,
    'Health': `Perfect for healthcare providers, wellness services, or medical practices.`,
    'Finance': `Excellent for financial services, banking, or investment firms.`,
    'Entertainment': `Great for media companies, streaming services, or entertainment venues.`,
    'Education': `Ideal for educational institutions, e-learning, or training services.`,
    'Travel': `Perfect for travel agencies, tourism services, or hospitality businesses.`,
    'Food & Beverage': `Excellent for restaurants, food services, or beverage brands.`,
    'Real Estate': `Premium domain for real estate agencies, property listings, or construction.`,
    'Automotive': `Ideal for car dealerships, auto parts, or vehicle services.`,
    'Fashion': `Perfect domain for clothing brands, accessories, or fashion retail.`,
    'Sports': `Great for sports equipment, teams, leagues, or fitness services.`,
    'Home & Garden': `Excellent for home improvement, gardening, or interior design.`,
    'Crypto': `Ideal for cryptocurrency services, blockchain technology, or digital assets.`,
    'Brandable': `Short, memorable domain name suitable for building a unique brand.`
  };
  
  // Return the appropriate description based on category
  return categoryDescriptions[category] || `Premium domain name with excellent branding potential.`;
}