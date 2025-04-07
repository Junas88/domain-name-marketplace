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
    <section className="bg-primary text-white py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Find Your Perfect Domain Name</h1>
          <p className="text-xl mb-8">Premium domains for your business, brand, or project.</p>
          
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="max-w-3xl mx-auto">
            <div className="bg-white rounded-full overflow-hidden shadow-lg flex">
              <input 
                type="text" 
                placeholder="Search for domains..." 
                className="flex-grow px-6 py-4 border-none focus:outline-none text-neutral-800"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button 
                type="submit"
                className="bg-[#ff9900] text-white px-8 py-4 font-semibold hover:bg-amber-600 transition-colors"
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
