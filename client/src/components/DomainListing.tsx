import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Domain, DomainFilters } from "@/lib/types";
import { apiRequest } from "@/lib/queryClient";
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
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, ChevronRight } from "lucide-react";

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
  const domainsPerPage = 6;

  // Parse search query from URL if present
  const urlParams = new URLSearchParams(window.location.search);
  const searchQuery = urlParams.get("search") || "";

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

  const handleBuyNow = (domain: Domain) => {
    // In a real implementation, this would redirect to GoDaddy
    toast({
      title: "Redirecting to GoDaddy",
      description: `You're being redirected to purchase ${domain.name}`,
    });
    
    // Simulate redirect with a new window
    window.open("https://www.godaddy.com", "_blank");
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
    <section id="domains" className="py-12 bg-neutral-100">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold mb-2">Featured Domains</h2>
        <p className="text-neutral-800 mb-8">Browse our collection of premium domain names</p>
        
        {/* Filters */}
        <Card className="mb-8">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="w-full md:w-auto">
                <label className="block text-sm font-medium text-neutral-800 mb-1">Price Range</label>
                <Select 
                  value={filters.priceRange} 
                  onValueChange={(value) => setFilters({...filters, priceRange: value})}
                >
                  <SelectTrigger className="w-full md:w-48">
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
                <label className="block text-sm font-medium text-neutral-800 mb-1">Category</label>
                <Select 
                  value={filters.category} 
                  onValueChange={(value) => setFilters({...filters, category: value})}
                >
                  <SelectTrigger className="w-full md:w-48">
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
                  </SelectContent>
                </Select>
              </div>
              
              <div className="w-full md:w-auto">
                <label className="block text-sm font-medium text-neutral-800 mb-1">Length</label>
                <Select 
                  value={filters.length} 
                  onValueChange={(value) => setFilters({...filters, length: value})}
                >
                  <SelectTrigger className="w-full md:w-48">
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
                <Button onClick={applyFilters}>
                  Apply Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Domain Grid */}
        {isLoading ? (
          // Loading skeleton
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
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
          <div className="text-center py-10">
            <p className="text-red-500 mb-4">Error loading domains</p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </div>
        ) : currentDomains.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-lg mb-4">No domains found matching your criteria</p>
            <Button 
              onClick={() => setFilters({
                category: "All Categories",
                priceRange: "Any Price",
                length: "Any Length",
              })}
            >
              Clear Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentDomains.map((domain) => (
              <Card 
                key={domain.id} 
                className="overflow-hidden transition-transform hover:shadow-md hover:-translate-y-1"
              >
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-semibold text-neutral-900">{domain.name}</h3>
                    <span className="bg-neutral-100 text-neutral-800 px-2 py-1 rounded text-sm">
                      {domain.category}
                    </span>
                  </div>
                  <p className="text-neutral-700 mb-4">{domain.description}</p>
                  <div className="flex justify-between items-center">
                    <div className="text-xl font-bold text-primary">${domain.price.toLocaleString()}</div>
                    <div className="flex space-x-2">
                      <Button 
                        onClick={() => handleBuyNow(domain)}
                      >
                        Buy Now
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => onMakeOffer(domain)}
                      >
                        Make Offer
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        
        {/* Pagination */}
        {renderPagination()}
      </div>
    </section>
  );
}
