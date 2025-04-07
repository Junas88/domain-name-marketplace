import { useState } from "react";
import { Link } from "wouter";
import { Menu, X } from "lucide-react";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <header className="bg-white border-b border-black sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            {/* Logo */}
            <Link href="/" className="flex items-center">
              <span className="text-black font-bold text-2xl">DomainHub</span>
            </Link>
          </div>

          {/* Navigation - Desktop */}
          <nav className="hidden md:flex space-x-8">
            <Link href="/" className="text-neutral-800 hover:text-black font-medium">
              Home
            </Link>
            <Link href="#domain-finder" className="text-neutral-800 hover:text-black font-medium">
              Domain Finder
            </Link>
            <Link href="#domains" className="text-neutral-800 hover:text-black font-medium">
              Browse Domains
            </Link>
            <Link href="/contact" className="text-neutral-800 hover:text-black font-medium">
              Contact
            </Link>
          </nav>

          {/* Navigation - Mobile */}
          <div className="md:hidden">
            <button 
              type="button" 
              className="text-neutral-800" 
              onClick={toggleMobileMenu}
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
                className="block px-3 py-2 text-neutral-800 hover:bg-neutral-100 rounded-md"
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                href="#domain-finder" 
                className="block px-3 py-2 text-neutral-800 hover:bg-neutral-100 rounded-md"
                onClick={() => setMobileMenuOpen(false)}
              >
                Domain Finder
              </Link>
              <Link 
                href="#domains" 
                className="block px-3 py-2 text-neutral-800 hover:bg-neutral-100 rounded-md"
                onClick={() => setMobileMenuOpen(false)}
              >
                Browse Domains
              </Link>
              <Link 
                href="/contact" 
                className="block px-3 py-2 text-neutral-800 hover:bg-neutral-100 rounded-md"
                onClick={() => setMobileMenuOpen(false)}
              >
                Contact
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
