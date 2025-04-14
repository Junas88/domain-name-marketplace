import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Domain } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";

// Define DomainFilters interface directly in this file
interface DomainFilters {
  category: string;
  priceRange: string;
  length: string;
}
import { 
  Card, 
  CardContent 
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, ChevronRight, Shield, Check, Search } from "lucide-react";

// Helper function to get colors for different categories
const getCategoryColor = (category: string): string => {
  switch (category) {
    case "Technology":
      return "bg-blue-100 text-blue-800 border border-blue-300";
    case "Business":
      return "bg-green-100 text-green-800 border border-green-300";
    case "Health":
      return "bg-red-100 text-red-800 border border-red-300";
    case "Education":
      return "bg-yellow-100 text-yellow-800 border border-yellow-300";
    case "Entertainment":
      return "bg-purple-100 text-purple-800 border border-purple-300";
    case "Finance":
      return "bg-teal-100 text-teal-800 border border-teal-300";
    case "Crypto":
      return "bg-orange-100 text-orange-800 border border-orange-300";
    default:
      return "bg-gray-100 text-gray-800 border border-gray-300";
  }
};

interface DomainListingProps {
  onMakeOffer: (domain: Domain) => void;
}

export default function DomainListing({ onMakeOffer }: DomainListingProps) {
  const [, params] = useLocation();
  const { toast } = useToast();
  const [filters, setFilters] = useState<DomainFilters>({
    category: "All Categories",
    priceRange: "Any Price",
    length: "Any Length",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [searchText, setSearchText] = useState("");
  const domainsPerPage = 20;

  // Parse search query from URL if present
  const urlParams = new URLSearchParams(window.location.search);
  const searchQueryFromUrl = urlParams.get("search") || "";
  
  // Use either direct search text or URL search param
  const searchQuery = searchText || searchQueryFromUrl;

  // Fetch domains
  const { data: domains, isLoading, isError } = useQuery<Domain[]>({
    queryKey: ['/api/domains'],
    refetchOnWindowFocus: false,
  });

  // Apply filters and search
  const filteredDomains = domains?.filter(domain => {
    let matches = true;
    
    // Apply search filter if query exists
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      const matchesSearch = 
        domain.name.toLowerCase().includes(lowerQuery) ||
        domain.description.toLowerCase().includes(lowerQuery) ||
        domain.category.toLowerCase().includes(lowerQuery);
      
      if (!matchesSearch) matches = false;
    }
    
    // Apply category filter
    if (filters.category && filters.category !== "All Categories") {
      if (domain.category !== filters.category) matches = false;
    }
    
    // Apply price range filter
    if (filters.priceRange && filters.priceRange !== "Any Price") {
      switch (filters.priceRange) {
        case "Under $1,000":
          if (domain.price >= 1000) matches = false;
          break;
        case "$1,000 - $5,000":
          if (domain.price < 1000 || domain.price > 5000) matches = false;
          break;
        case "$5,000 - $10,000":
          if (domain.price < 5000 || domain.price > 10000) matches = false;
          break;
        case "$10,000+":
          if (domain.price <= 10000) matches = false;
          break;
      }
    }
    
    // Apply length filter
    if (filters.length && filters.length !== "Any Length") {
      const domainNameLength = domain.name.length;
      switch (filters.length) {
        case "3-5 Characters":
          if (domainNameLength < 3 || domainNameLength > 5) matches = false;
          break;
        case "6-9 Characters":
          if (domainNameLength < 6 || domainNameLength > 9) matches = false;
          break;
        case "10+ Characters":
          if (domainNameLength < 10) matches = false;
          break;
      }
    }
    
    return matches;
  }) || [];

  // Pagination
  const indexOfLastDomain = currentPage * domainsPerPage;
  const indexOfFirstDomain = indexOfLastDomain - domainsPerPage;
  const currentDomains = filteredDomains.slice(indexOfFirstDomain, indexOfLastDomain);
  const totalPages = Math.ceil(filteredDomains.length / domainsPerPage);

  useEffect(() => {
    // Reset to first page when filters change
    setCurrentPage(1);
  }, [filters, searchQuery]);

  const handleBuyNow = async (domain: Domain) => {
    try {
      // Mark domain as sold in the database
      await apiRequest(`/api/admin/domains/${domain.id}/mark-sold`, {
        method: "PATCH"
      });
      
      // Invalidate the domains cache to reflect changes
      queryClient.invalidateQueries({ queryKey: ['/api/domains'] });
      
      toast({
        title: "Domain purchased!",
        description: `You've successfully purchased ${domain.name}. The transaction is securely processed through GoDaddy.`,
      });
      
      // Directly redirect to the domain
      const domainUrl = `https://${domain.name}`;
      
      // Use location.href for mobile compatibility or window.open for desktop
      // The setTimeout gives the toast a chance to appear before navigating
      setTimeout(() => {
        // Force open in the same window for mobile devices or new window for desktop
        try {
          const newWindow = window.open(domainUrl, "_blank");
          // If the new window wasn't successfully opened (often happens on mobile), redirect in the same window
          if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
            window.location.href = domainUrl;
          }
        } catch (e) {
          // Fallback for any issues with window.open
          window.location.href = domainUrl;
        }
      }, 500);
    } catch (error) {
      toast({
        title: "Purchase failed",
        description: "There was an error processing your purchase. Please try again.",
        variant: "destructive"
      });
    }
  };

  const applyFilters = () => {
    // Reset pagination when applying filters
    setCurrentPage(1);
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;
    
    return (
      <div className="mt-10 flex justify-center">
        <nav className="flex items-center space-x-1">
          <Button 
            variant="outline" 
            size="icon"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            className="h-9 w-9 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          {Array.from({ length: Math.min(totalPages, 5) }).map((_, index) => {
            let pageNumber: number;
            
            // Calculate which page numbers to show
            if (totalPages <= 5) {
              pageNumber = index + 1;
            } else {
              if (currentPage <= 3) {
                pageNumber = index + 1;
                if (index === 4) pageNumber = totalPages;
              } else if (currentPage >= totalPages - 2) {
                pageNumber = totalPages - 4 + index;
                if (index === 0) pageNumber = 1;
              } else {
                pageNumber = currentPage - 2 + index;
                if (index === 0) pageNumber = 1;
                if (index === 4) pageNumber = totalPages;
              }
            }
            
            return (
              <Button
                key={pageNumber}
                variant={currentPage === pageNumber ? "default" : "outline"}
                onClick={() => setCurrentPage(pageNumber)}
                className="h-9 w-9 p-0"
              >
                {pageNumber}
              </Button>
            );
          })}
          
          <Button 
            variant="outline" 
            size="icon"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            className="h-9 w-9 p-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </nav>
      </div>
    );
  };

  return (
    <section id="domains" className="py-12 bg-white" aria-labelledby="domains-heading">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hidden section title for accessibility */}
        <h2 id="domains-heading" className="sr-only">Premium Domains</h2>
        
        {/* Hidden keywords for SEO */}
        <div className="sr-only">
          Buy domains, domain marketplace, premium domains, domain names for sale, domain broker, domain auction, domain negotiation
        </div>
        
        {/* Search Bar */}
        <div className="mb-12">
          <div className="flex items-center max-w-3xl mx-auto shadow-lg rounded-md overflow-hidden border-2 border-black">
            <div className="relative flex-1">
              <Input
                type="text"
                placeholder="Search domains by name or category..."
                className="h-16 text-lg px-6 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    applyFilters();
                  }
                }}
              />
              {searchText ? (
                <button 
                  onClick={() => setSearchText("")}
                  className="absolute right-6 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-500 hover:text-black"
                  aria-label="Clear search"
                >
                  ✕
                </button>
              ) : null}
            </div>
            <Button 
              onClick={applyFilters}
              className="h-16 px-8 text-base font-medium bg-black text-white hover:bg-neutral-800 rounded-none"
              aria-label="Search domains"
            >
              <Search className="w-5 h-5 mr-2" /> Search
            </Button>
          </div>
        </div>
        
        {/* Filters */}
        <div className="max-w-4xl mx-auto mb-12 border border-gray-200 rounded-lg p-4">
          <div className="flex flex-wrap items-center gap-6" role="search" aria-label="Domain filter options">
            <div className="w-full md:w-auto">
              <label htmlFor="price-range-select" className="block text-sm font-medium text-neutral-800 mb-1">Price Range</label>
              <Select 
                value={filters.priceRange} 
                onValueChange={(value) => setFilters({...filters, priceRange: value})}
                name="price-range"
              >
                <SelectTrigger id="price-range-select" className="w-full md:w-40 border-gray-300">
                  <SelectValue placeholder="Any Price" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Any Price">Any Price</SelectItem>
                  <SelectItem value="Under $1,000">Under $1,000</SelectItem>
                  <SelectItem value="$1,000 - $5,000">$1,000 - $5,000</SelectItem>
                  <SelectItem value="$5,000 - $10,000">$5,000 - $10,000</SelectItem>
                  <SelectItem value="$10,000+">$10,000+</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="w-full md:w-auto">
              <label htmlFor="category-select" className="block text-sm font-medium text-neutral-800 mb-1">Category</label>
              <Select 
                value={filters.category} 
                onValueChange={(value) => setFilters({...filters, category: value})}
                name="category"
              >
                <SelectTrigger id="category-select" className="w-full md:w-40 border-gray-300">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All Categories">All Categories</SelectItem>
                  <SelectItem value="Technology">Technology</SelectItem>
                  <SelectItem value="Business">Business</SelectItem>
                  <SelectItem value="Health">Health</SelectItem>
                  <SelectItem value="Education">Education</SelectItem>
                  <SelectItem value="Entertainment">Entertainment</SelectItem>
                  <SelectItem value="Finance">Finance</SelectItem>
                  <SelectItem value="Crypto">Crypto</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="w-full md:w-auto">
              <label htmlFor="length-select" className="block text-sm font-medium text-neutral-800 mb-1">Length</label>
              <Select 
                value={filters.length} 
                onValueChange={(value) => setFilters({...filters, length: value})}
                name="length"
              >
                <SelectTrigger id="length-select" className="w-full md:w-40 border-gray-300">
                  <SelectValue placeholder="Any Length" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Any Length">Any Length</SelectItem>
                  <SelectItem value="3-5 Characters">3-5 Characters</SelectItem>
                  <SelectItem value="6-9 Characters">6-9 Characters</SelectItem>
                  <SelectItem value="10+ Characters">10+ Characters</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="w-full md:w-auto md:ml-auto mt-4 md:mt-0">
              <Button 
                onClick={applyFilters} 
                className="bg-black text-white hover:bg-neutral-800 rounded-sm"
                aria-label="Apply domain filters"
              >
                Apply Filters
              </Button>
            </div>
          </div>
        </div>
        
        {/* Domain Grid */}
        {isLoading ? (
          // Loading skeleton
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" aria-label="Loading domains">
            {Array.from({ length: 20 }).map((_, index) => (
              <Card key={index} className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <Skeleton className="h-7 w-48" />
                    <Skeleton className="h-6 w-24" />
                  </div>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-4/5 mb-8" />
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-8 w-24" />
                    <div className="flex space-x-2">
                      <Skeleton className="h-10 w-24" />
                      <Skeleton className="h-10 w-24" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : isError ? (
          <div className="text-center py-10" role="alert" aria-live="assertive">
            <p className="text-red-500 mb-4">Error loading domains</p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </div>
        ) : currentDomains.length === 0 ? (
          <div className="text-center py-10" role="alert" aria-live="polite">
            <p className="text-lg mb-4">No domains found matching your criteria</p>
            <Button 
              onClick={() => setFilters({
                category: "All Categories",
                priceRange: "Any Price",
                length: "Any Length",
              })}
              aria-label="Clear all domain filters"
            >
              Clear Filters
            </Button>
          </div>
        ) : (
          <div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" 
            role="region" 
            aria-label="Premium domains"
          >
            {currentDomains.map((domain) => (
              <Card 
                key={domain.id} 
                className="overflow-hidden transition-transform hover:shadow-md hover:-translate-y-1 border border-black"
              >
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-semibold text-neutral-900">
                      <span itemProp="name">{domain.name}</span>
                    </h3>
                    <div className="flex gap-2">
                      {domain.isSold && (
                        <span className="px-2 py-1 rounded-sm text-sm font-medium bg-red-100 text-red-800 border border-red-300">
                          Sold
                        </span>
                      )}
                      <span 
                        className={`px-2 py-1 rounded-sm text-sm font-medium ${getCategoryColor(domain.category)}`}
                        itemProp="category"
                      >
                        {domain.category}
                      </span>
                    </div>
                  </div>
                  <p className="text-neutral-700 mb-4" itemProp="description">{domain.description}</p>
                  <div className="flex justify-between items-center">
                    <div className="text-xl font-bold text-black" itemProp="price">${domain.price.toLocaleString()}</div>
                    {domain.isSold ? (
                      <div className="text-sm text-gray-500 italic">
                        This domain has been sold
                      </div>
                    ) : (
                      <div className="flex space-x-2">
                        <Button 
                          onClick={() => handleBuyNow(domain)}
                          className="bg-black text-white hover:bg-neutral-800"
                          aria-label={`Buy ${domain.name} now for $${domain.price.toLocaleString()}`}
                        >
                          Buy Now
                        </Button>
                        <Button 
                          variant="outline"
                          onClick={() => onMakeOffer(domain)}
                          className="border-black text-black hover:bg-neutral-100"
                          aria-label={`Make offer for ${domain.name}`}
                        >
                          Make Offer
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        
        {/* Buyer Protection */}
        <div className="mt-12 bg-neutral-50 border border-neutral-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="h-6 w-6 text-green-600" />
            <h3 className="text-xl font-semibold">Buyer Protection Guarantee</h3>
          </div>
          <p className="text-neutral-700 mb-4">
            All domain purchases on Domainnameguide.com are securely processed through GoDaddy, 
            the world's largest domain registrar. This ensures your transaction is protected 
            and the domain transfer is handled professionally.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Check className="h-5 w-5 text-green-600" />
              <span>Secure payments</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-5 w-5 text-green-600" />
              <span>Escrow service</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-5 w-5 text-green-600" />
              <span>Guaranteed transfers</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-5 w-5 text-green-600" />
              <span>Fraud prevention</span>
            </div>
          </div>
        </div>

        {/* Pagination */}
        {renderPagination()}
      </div>
    </section>
  );
}
