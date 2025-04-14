import { useQuery } from "@tanstack/react-query";
import { Domain } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { cn, formatCurrency } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { ExternalLink } from "lucide-react";

export default function RecentlySoldDomains() {
  const { data: domains, isLoading } = useQuery<Domain[]>({
    queryKey: ["/api/domains/recently-sold"],
  });

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Business":
        return "bg-blue-500";
      case "Technology":
        return "bg-green-500";
      case "Health":
        return "bg-red-500";
      case "Education":
        return "bg-yellow-500";
      case "Finance":
        return "bg-purple-500";
      case "Entertainment":
        return "bg-pink-500";
      case "Travel":
        return "bg-orange-500";
      default:
        return "bg-gray-500";
    }
  };

  if (isLoading) {
    return (
      <div className="relative py-16 mb-10 overflow-hidden bg-white">
        {/* Skeleton light background with subtle green accents */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-green-50 to-white z-0"></div>
        
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          {/* Skeleton heading with larger styling */}
          <div className="flex flex-col items-center mb-12 relative">
            <Skeleton className="h-12 w-[500px] mx-auto mb-3 bg-green-100" />
            <div className="flex items-center space-x-3">
              <Skeleton className="h-1.5 w-16 bg-green-100" />
              <Skeleton className="h-6 w-64 bg-green-50" />
              <Skeleton className="h-1.5 w-16 bg-green-100" />
            </div>
          </div>
          
          {/* Skeleton carousel items - bigger and with green accent */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="px-3 py-4">
                <div className="relative rounded-lg overflow-hidden">
                  {/* Skeleton decorative elements */}
                  <div className="absolute -right-4 -top-4 w-20 h-20 bg-green-100 opacity-40 rotate-12"></div>
                  <div className="absolute -left-4 -bottom-4 w-16 h-16 bg-green-100 opacity-30 rotate-12"></div>
                  
                  {/* Skeleton content container */}
                  <div className="bg-white border-2 border-gray-100 rounded-lg relative p-6 shadow-sm">
                    {/* SOLD label skeleton */}
                    <Skeleton className="absolute right-2 top-3 h-9 w-24 bg-black" />
                    
                    <Skeleton className="h-9 w-full max-w-[240px] mb-5" />
                    
                    {/* Info area skeleton */}
                    <div className="flex flex-col md:flex-row justify-between bg-gray-50 rounded-lg p-3 border border-gray-100">
                      <div className="flex items-center space-x-2 mb-2 md:mb-0">
                        <Skeleton className="h-7 w-32 rounded-full bg-white" />
                        <Skeleton className="h-7 w-24 rounded-full bg-green-100" />
                      </div>
                      <Skeleton className="h-8 w-28 bg-green-100" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Skeleton navigation - bigger with green accents */}
          <div className="flex justify-center mt-10 space-x-6">
            <Skeleton className="h-12 w-12 rounded-full bg-gray-200 border-2 border-green-100" />
            <div className="flex items-center space-x-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="w-3 h-3 rounded-full bg-green-100" />
              ))}
            </div>
            <Skeleton className="h-12 w-12 rounded-full bg-gray-200 border-2 border-green-100" />
          </div>
        </div>
      </div>
    );
  }

  if (!domains || domains.length === 0) {
    return null;
  }

  const carouselItems = () => {
    if (Array.isArray(domains)) {
      return domains.map((domain) => (
        <CarouselItem key={domain.id}>
          <div className="px-2 py-3">
            <div className="group relative overflow-hidden rounded-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              {/* Decorative elements */}
              <div className="absolute -right-4 -top-4 w-20 h-20 bg-black rotate-12 z-0"></div>
              <div className="absolute -left-4 -bottom-4 w-16 h-16 bg-gray-900 rotate-12 z-0 opacity-80"></div>
              
              {/* Content Container */}
              <div className="bg-white border-2 border-gray-100 rounded-lg relative z-10 shadow-sm">
                {/* SOLD label - larger with green accent */}
                <div className="absolute right-2 top-3 bg-black text-white text-sm font-black py-2 px-6 shadow-lg z-20 rounded-lg transform scale-110 border-2 border-green-500">
                  SOLD
                </div>
                
                {/* Main content with light background */}
                <div className="p-6 bg-white">
                  <h3 className="text-2xl font-black text-black mb-3 truncate">
                    <a 
                      href={`https://${domain.name}`} 
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-green-600 transition-colors inline-flex items-center"
                    >
                      {domain.name}
                      <ExternalLink className="ml-2 h-5 w-5 text-green-500" />
                    </a>
                  </h3>
                  
                  {/* Larger info area */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-3 border border-gray-100 rounded-lg bg-gray-50">
                    <div className="flex flex-wrap gap-2">
                      <span className="inline-flex items-center text-sm font-medium bg-white px-3 py-1 rounded-full border border-gray-200">
                        {domain.length} characters
                      </span>
                      <span className="text-sm font-medium px-3 py-1 rounded-full bg-green-100 text-green-800 border border-green-200">
                        {domain.category}
                      </span>
                    </div>
                    
                    <div className="font-black text-2xl text-green-600">
                      {formatCurrency(domain.price)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CarouselItem>
      ));
    }
    return null;
  };

  return (
    <div className="relative py-16 mb-10 overflow-hidden bg-white">
      {/* Light background with subtle green accents */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-green-50 to-white z-0"></div>
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full -translate-y-1/2 translate-x-1/2 bg-green-100 opacity-20"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full translate-y-1/3 -translate-x-1/3 bg-green-100 opacity-20"></div>
      
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 z-0 opacity-5" 
           style={{ backgroundImage: 'linear-gradient(to right, #e5e5e5 1px, transparent 1px), linear-gradient(to bottom, #e5e5e5 1px, transparent 1px)', 
                   backgroundSize: '20px 20px' }}>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 relative z-10">
        {/* Larger, bolder heading with green accent */}
        <div className="flex flex-col items-center mb-12 relative">
          <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-7xl font-black text-green-50 whitespace-nowrap">PREMIUM DOMAINS</div>
          <h2 className="text-4xl font-black text-black relative z-10 text-center mb-3">
            <span className="inline-block px-2 pb-1 relative">
              Gone Fast
              <span className="absolute bottom-0 left-0 w-full h-1.5 bg-green-500"></span>
            </span>
            <span className="text-gray-400 mx-3">–</span>
            <span className="inline-block relative">
              See What's Already Sold
            </span>
          </h2>
          <div className="flex items-center space-x-3 text-base text-gray-600 font-medium mt-3">
            <span className="inline-block w-16 h-0.5 bg-green-200"></span>
            <span>Real market performance indicators</span>
            <span className="inline-block w-16 h-0.5 bg-green-200"></span>
          </div>
        </div>
        
        <Carousel className="mx-auto">
          <CarouselContent className="-mx-3">
            {carouselItems()}
          </CarouselContent>
          
          {/* Larger navigation controls with green accents */}
          <div className="flex justify-center mt-10 space-x-6">
            <CarouselPrevious className="bg-black hover:bg-green-700 text-white border-2 border-green-500 h-12 w-12 rounded-full shadow-lg relative static ml-0 transform transition-transform hover:scale-110" />
            <div className="flex items-center space-x-2">
              {Array.from({ length: Math.min(5, domains.length) }).map((_, i) => (
                <div key={i} className="w-3 h-3 rounded-full bg-green-200"></div>
              ))}
            </div>
            <CarouselNext className="bg-black hover:bg-green-700 text-white border-2 border-green-500 h-12 w-12 rounded-full shadow-lg relative static mr-0 transform transition-transform hover:scale-110" />
          </div>
        </Carousel>
      </div>
    </div>
  );
}