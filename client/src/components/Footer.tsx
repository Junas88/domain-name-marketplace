import { Link, useLocation } from "wouter";
import { Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
  const [location] = useLocation();
  
  // Function to handle smooth scrolling to sections
  const scrollToSection = (sectionId: string) => {
    // If we're not on the home page, navigate there first
    if (location !== "/") {
      window.location.href = `/${sectionId}`;
      return;
    }
    
    // Otherwise scroll to the section
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <footer className="bg-black text-white py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-xl font-bold mb-4">TakeMyName</h3>
            <p className="text-white mb-4">Your trusted marketplace for premium domain names.</p>
            <div className="flex space-x-4">
              <a href="#" className="text-white hover:text-gray-300 transition-colors" aria-label="Facebook">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                </svg>
              </a>
              <a href="#" className="text-white hover:text-gray-300 transition-colors" aria-label="Twitter">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                </svg>
              </a>
              <a href="#" className="text-white hover:text-gray-300 transition-colors" aria-label="LinkedIn">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                  <rect x="2" y="9" width="4" height="12"></rect>
                  <circle cx="4" cy="4" r="2"></circle>
                </svg>
              </a>
              <a href="#" className="text-white hover:text-gray-300 transition-colors" aria-label="Instagram">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </a>
            </div>
          </div>
          
          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link href="/" className="text-white hover:text-gray-300 transition-colors">Home</Link></li>
              <li>
                <a 
                  href="#domains" 
                  className="text-white hover:text-gray-300 transition-colors cursor-pointer"
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection("domains");
                  }}
                >
                  Browse Domains
                </a>
              </li>
              <li>
                <a 
                  href="#domain-finder" 
                  className="text-white hover:text-gray-300 transition-colors cursor-pointer"
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection("domain-finder");
                  }}
                >
                  Domain Finder
                </a>
              </li>
              <li><Link href="/guide" className="text-white hover:text-gray-300 transition-colors">Domain Guide</Link></li>
              <li><Link href="/contact" className="text-white hover:text-gray-300 transition-colors">Contact Us</Link></li>
              <li><Link href="/how-it-works" className="text-white hover:text-gray-300 transition-colors">How It Works</Link></li>
            </ul>
          </div>
          
          {/* Resources */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Resources</h3>
            <ul className="space-y-2">
              <li><Link href="/domain-valuation" className="text-white hover:text-gray-300 transition-colors">Domain Valuation</Link></li>
              <li><Link href="/guide" className="text-white hover:text-gray-300 transition-colors">Domain Name Guide</Link></li>
              <li><Link href="/selling-strategy" className="text-white hover:text-gray-300 transition-colors">Selling Strategy</Link></li>
              <li><Link href="/guide#protection" className="text-white hover:text-gray-300 transition-colors">Buyer Protection</Link></li>
              <li><Link href="/faqs" className="text-white hover:text-gray-300 transition-colors">FAQs</Link></li>
            </ul>
          </div>
          
          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-2">
              <li className="flex items-start">
                <Mail className="text-white mt-1 mr-3 shrink-0" size={18} />
                <a href="mailto:support@takemyname.com" className="text-white hover:text-gray-300 transition-colors">support@takemyname.com</a>
              </li>
              <li className="flex items-start">
                <Phone className="text-white mt-1 mr-3 shrink-0" size={18} />
                <a href="tel:+18001234567" className="text-white hover:text-gray-300 transition-colors">+1 (800) 123-4567</a>
              </li>
              <li className="flex items-start">
                <MapPin className="text-white mt-1 mr-3 shrink-0" size={18} />
                <span className="text-white">123 Domain Street, San Francisco, CA 94107</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-white/20 mt-8 pt-8 text-center text-white">
          <p>&copy; {new Date().getFullYear()} TakeMyName.com. All rights reserved.</p>
          <div className="mt-2">
            <Link href="/admin" className="text-gray-400 hover:text-white text-sm">Admin Dashboard</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
