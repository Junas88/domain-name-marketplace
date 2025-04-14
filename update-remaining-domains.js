import fetch from 'node-fetch';

// First, authenticate and get the cookies
async function login() {
  const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin', password: 'DomainGuide#2025' })
  });
  
  const cookies = loginResponse.headers.raw()['set-cookie'];
  return cookies;
}

// Function to get all domains
async function getDomains(cookies) {
  const response = await fetch('http://localhost:5000/api/domains', {
    headers: { 'Cookie': cookies }
  });
  return await response.json();
}

// Function to update a domain
async function updateDomain(id, description, cookies) {
  const response = await fetch(`http://localhost:5000/api/admin/domains/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': cookies
    },
    body: JSON.stringify({ description })
  });
  return await response.json();
}

// Create short, professional descriptions based on domain name and category
function createShortDescriptionForDomain(domain) {
  const name = domain.name.toLowerCase();
  let description = '';
  
  // Special cases for specific domains
  if (name === 'grape-website.com') {
    description = 'Perfect for vineyards, wine retailers, or grape-related businesses.';
  } else if (name === 'expired-website.com') {
    description = 'Ideal for website maintenance services, domain registrars, or renewal services.';
  } else if (name === 'lakome.com') {
    description = 'Short, brandable domain suitable for various industries.';
  } else if (name === 'iptvhd.com') {
    description = 'Perfect for streaming services or IPTV providers.';
  } else if (name === 'highchips.com') {
    description = 'Great for premium tech products or snack brands.';
  } else if (name === 'allgreenplants.com') {
    description = 'Ideal for plant nurseries, gardening supplies, or eco-friendly businesses.';
  } else if (name === 'freshmasks.com') {
    description = 'Perfect for healthcare supplies, beauty products, or PPE retailers.';
  } else {
    // Generic description based on category
    const categoryMappings = {
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
    
    description = categoryMappings[domain.category] || `Premium domain name with excellent branding potential.`;
  }
  
  return description;
}

// Main function
async function main() {
  try {
    const cookies = await login();
    const domains = await getDomains(cookies);
    
    // Filter domains with IDs between 1 and 10
    const targetDomains = domains.filter(domain => domain.id <= 10);
    
    console.log(`Found ${targetDomains.length} domains to update. Starting updates...`);
    
    for (const domain of targetDomains) {
      const newDescription = createShortDescriptionForDomain(domain);
      
      console.log(`Updating domain ${domain.id} - ${domain.name}`);
      console.log(`Old: ${domain.description}`);
      console.log(`New: ${newDescription}`);
      
      try {
        await updateDomain(domain.id, newDescription, cookies);
        console.log(`✅ Updated ${domain.name} successfully`);
      } catch (error) {
        console.error(`❌ Error updating ${domain.name}:`, error.message);
      }
      
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log('All target domain descriptions updated successfully!');
  } catch (error) {
    console.error('Error:', error);
  }
}

main();