import { useState } from "react";
import { Link } from "wouter";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user } = useAuth();

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
              <span className="text-black font-black text-2xl tracking-tight uppercase">DOMAIN NAME GUIDE</span>
            </Link>
          </div>

          {/* Navigation - Desktop */}
          <nav className="hidden md:flex space-x-6 items-center">
            <Link href="/" className="text-neutral-800 hover:text-black font-medium">
              Home
            </Link>
            <Link 
              href="/domain-finder" 
              className="text-neutral-800 hover:text-black font-medium cursor-pointer"
            >
              Domain Finder
            </Link>
            <Link 
              href="/#domains" 
              className="text-neutral-800 hover:text-black font-medium cursor-pointer"
            >
              Premium Domains
            </Link>
            <Link href="/guide" className="text-neutral-800 hover:text-black font-medium">
              Domain Guide
            </Link>
            <Link href="/faqs" className="text-neutral-800 hover:text-black font-medium">
              FAQs
            </Link>
            <Link href="/contact" className="text-neutral-800 hover:text-black font-medium">
              Contact
            </Link>
            {user?.isAdmin ? (
              <Link href="/admin/dashboard">
                <Button variant="outline" className="ml-2 border-black hover:bg-black hover:text-white">
                  Admin Dashboard
                </Button>
              </Link>
            ) : (
              <Link href="/login">
                <Button variant="outline" className="ml-2 border-black hover:bg-black hover:text-white">
                  Login
                </Button>
              </Link>
            )}
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
                className="block px-3 py-2 text-neutral-800 hover:bg-neutral-100 rounded-md"
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                href="/domain-finder" 
                className="block px-3 py-2 text-neutral-800 hover:bg-neutral-100 rounded-md cursor-pointer"
                onClick={() => setMobileMenuOpen(false)}
              >
                Domain Finder
              </Link>
              <Link 
                href="/#domains" 
                className="block px-3 py-2 text-neutral-800 hover:bg-neutral-100 rounded-md cursor-pointer"
                onClick={() => setMobileMenuOpen(false)}
              >
                Premium Domains
              </Link>
              <Link 
                href="/guide" 
                className="block px-3 py-2 text-neutral-800 hover:bg-neutral-100 rounded-md"
                onClick={() => setMobileMenuOpen(false)}
              >
                Domain Guide
              </Link>
              <Link 
                href="/faqs" 
                className="block px-3 py-2 text-neutral-800 hover:bg-neutral-100 rounded-md"
                onClick={() => setMobileMenuOpen(false)}
              >
                FAQs
              </Link>
              <Link 
                href="/contact" 
                className="block px-3 py-2 text-neutral-800 hover:bg-neutral-100 rounded-md"
                onClick={() => setMobileMenuOpen(false)}
              >
                Contact
              </Link>
              {user?.isAdmin ? (
                <Link 
                  href="/admin/dashboard" 
                  className="block px-3 py-2 mt-4 text-center bg-black text-white rounded-md hover:bg-neutral-800"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Admin Dashboard
                </Link>
              ) : (
                <Link 
                  href="/login" 
                  className="block px-3 py-2 mt-4 text-center bg-black text-white rounded-md hover:bg-neutral-800"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
