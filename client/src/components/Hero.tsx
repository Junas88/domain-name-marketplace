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
            DomainnameGuide.com: Find Your Perfect Domain Name
          </h1>
          <p className="text-xl mb-8">
            Premium domains with instant Buy-It-Now prices or make an offer. Secure the ideal domain for your startup, business, brand, or project.
          </p>
          
          {/* SEO Keywords in hidden span for search engines */}
          <span className="sr-only">
            DomainnameGuide.com, domain marketplace, premium domains, buy domains, sell domains, domain broker, domain consultation, business domains, tech domains
          </span>
          
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="max-w-3xl mx-auto" role="search" aria-label="Search domains">
            <div className="bg-white rounded-full overflow-hidden shadow-lg flex border border-black">
              <label htmlFor="domain-search" className="sr-only">Search for domains</label>
              <input 
                id="domain-search"
                type="text" 
                placeholder="Search for domains..." 
                className="flex-grow px-6 py-4 border-none focus:outline-none text-neutral-800"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Domain search input"
              />
              <button 
                type="submit"
                className="bg-black text-white px-8 py-4 font-semibold hover:bg-neutral-800 transition-colors"
                aria-label="Search domains"
              >
                <Search className="mr-2 inline-block" size={18} /> Search
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
