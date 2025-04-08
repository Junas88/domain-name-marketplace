import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, Book, Shield, Info, HelpCircle, BarChart3, Phone } from "lucide-react";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [location] = useLocation();

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // Function to handle smooth scrolling to sections
  const scrollToSection = (sectionId: string) => {
    // Close mobile menu
    setMobileMenuOpen(false);
    
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
    <header className="bg-white border-b border-black sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            {/* Logo */}
            <Link href="/" className="flex items-center">
              <span className="text-black font-bold text-2xl">TakeMyName</span>
            </Link>
          </div>

          {/* Navigation - Desktop */}
          <nav className="hidden md:flex space-x-6">
            <Link href="/" className="text-neutral-800 hover:text-black font-medium flex items-center gap-1">
              <Info className="h-4 w-4" />
              <span>Home</span>
            </Link>
            <a 
              href="#domain-finder" 
              className="text-neutral-800 hover:text-black font-medium cursor-pointer flex items-center gap-1"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection("domain-finder");
              }}
            >
              <BarChart3 className="h-4 w-4" />
              <span>Domain Finder</span>
            </a>
            <a 
              href="#domains" 
              className="text-neutral-800 hover:text-black font-medium cursor-pointer flex items-center gap-1"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection("domains");
              }}
            >
              <BarChart3 className="h-4 w-4" />
              <span>Browse Domains</span>
            </a>
            <Link href="/how-it-works" className="text-neutral-800 hover:text-black font-medium flex items-center gap-1">
              <Info className="h-4 w-4" />
              <span>How It Works</span>
            </Link>
            <Link href="/guide" className="text-neutral-800 hover:text-black font-medium flex items-center gap-1">
              <Book className="h-4 w-4" />
              <span>Domain Guide</span>
            </Link>
            <Link href="/buyer-protection" className="text-neutral-800 hover:text-black font-medium flex items-center gap-1">
              <Shield className="h-4 w-4" />
              <span>Buyer Protection</span>
            </Link>
            <Link href="/faqs" className="text-neutral-800 hover:text-black font-medium flex items-center gap-1">
              <HelpCircle className="h-4 w-4" />
              <span>FAQs</span>
            </Link>
            <Link href="/contact" className="text-neutral-800 hover:text-black font-medium flex items-center gap-1">
              <Phone className="h-4 w-4" />
              <span>Contact</span>
            </Link>
          </nav>

          {/* Navigation - Mobile */}
          <div className="md:hidden">
            <button 
              type="button" 
              className="text-neutral-800" 
              onClick={toggleMobileMenu}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden">
            <div className="py-3 space-y-2">
              <Link 
                href="/" 
                className="flex items-center gap-2 px-3 py-2 text-neutral-800 hover:bg-neutral-100 rounded-md"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Info className="h-4 w-4" />
                <span>Home</span>
              </Link>
              <a 
                href="#domain-finder" 
                className="flex items-center gap-2 px-3 py-2 text-neutral-800 hover:bg-neutral-100 rounded-md cursor-pointer"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection("domain-finder");
                }}
              >
                <BarChart3 className="h-4 w-4" />
                <span>Domain Finder</span>
              </a>
              <a 
                href="#domains" 
                className="flex items-center gap-2 px-3 py-2 text-neutral-800 hover:bg-neutral-100 rounded-md cursor-pointer"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection("domains");
                }}
              >
                <BarChart3 className="h-4 w-4" />
                <span>Browse Domains</span>
              </a>
              <Link 
                href="/how-it-works" 
                className="flex items-center gap-2 px-3 py-2 text-neutral-800 hover:bg-neutral-100 rounded-md"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Info className="h-4 w-4" />
                <span>How It Works</span>
              </Link>
              <Link 
                href="/guide" 
                className="flex items-center gap-2 px-3 py-2 text-neutral-800 hover:bg-neutral-100 rounded-md"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Book className="h-4 w-4" />
                <span>Domain Guide</span>
              </Link>
              <Link 
                href="/buyer-protection" 
                className="flex items-center gap-2 px-3 py-2 text-neutral-800 hover:bg-neutral-100 rounded-md"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Shield className="h-4 w-4" />
                <span>Buyer Protection</span>
              </Link>
              <Link 
                href="/faqs" 
                className="flex items-center gap-2 px-3 py-2 text-neutral-800 hover:bg-neutral-100 rounded-md"
                onClick={() => setMobileMenuOpen(false)}
              >
                <HelpCircle className="h-4 w-4" />
                <span>FAQs</span>
              </Link>
              <Link 
                href="/contact" 
                className="flex items-center gap-2 px-3 py-2 text-neutral-800 hover:bg-neutral-100 rounded-md"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Phone className="h-4 w-4" />
                <span>Contact</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
