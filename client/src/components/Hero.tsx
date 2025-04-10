import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Search } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";

export default function Hero() {
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) {
      toast({
        title: "Search query is empty",
        description: "Please enter a domain name to search",
        variant: "destructive",
      });
      return;
    }
    
    // Scroll to the domains section and apply the search filter
    const domainsSection = document.getElementById("domains");
    if (domainsSection) {
      domainsSection.scrollIntoView({ behavior: "smooth" });
    }
    
    // Update URL with search parameter
    setLocation(`/?search=${encodeURIComponent(searchQuery)}`);
  };

  return (
    <section className="bg-white text-black py-16" aria-labelledby="hero-heading">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 id="hero-heading" className="text-4xl md:text-5xl font-bold mb-6">
            Find Your Perfect Domain Name
          </h1>
          <p className="text-xl mb-8">
            Premium domains with instant Buy-It-Now prices or make an offer. Secure the ideal domain for your startup, business, brand, or project.
          </p>
          
          {/* SEO Keywords in hidden span for search engines */}
          <span className="sr-only">
            DOMAIN NAME GUIDE, domain marketplace, premium domains, buy domains, sell domains, domain broker, domain consultation, business domains, tech domains
          </span>
          
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="max-w-3xl mx-auto" role="search" aria-label="Search domains">
            <div className="relative shadow-lg rounded-full overflow-hidden">
              <label htmlFor="domain-search" className="sr-only">Search for domains</label>
              <input 
                id="domain-search"
                type="text" 
                placeholder="Search for domains..." 
                className="w-full px-6 py-4 border-none focus:outline-none focus:ring-0 text-neutral-800"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Domain search input"
              />
              <button 
                type="submit"
                className="absolute right-0 top-0 bottom-0 rounded-r-full bg-black text-white px-8 font-semibold hover:bg-neutral-800 transition-colors flex items-center"
                aria-label="Search domains"
              >
                <Search className="mr-2" size={18} />
                <span>Search</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
