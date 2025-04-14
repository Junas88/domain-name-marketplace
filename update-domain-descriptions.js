import fetch from 'node-fetch';
import fs from 'fs';

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

// Function to create shorter, more professional descriptions
function createShortDescription(domain) {
  const name = domain.name.toLowerCase().replace(/\.com$|\.net$|\.org$/, '');
  
  // Create short, professional descriptions based on category
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
  
  // Default description if category not in mappings
  return categoryMappings[domain.category] || `Premium domain name with excellent branding potential.`;
}

// Main function
async function main() {
  try {
    const cookies = await login();
    const domains = await getDomains(cookies);
    
    console.log(`Retrieved ${domains.length} domains. Starting updates...`);
    
    // Process each domain with a small delay to prevent overwhelming the server
    for (let i = 0; i < domains.length; i++) {
      const domain = domains[i];
      const newDescription = createShortDescription(domain);
      
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
    
    console.log('All domain descriptions updated successfully!');
  } catch (error) {
    console.error('Error:', error);
  }
}

main();