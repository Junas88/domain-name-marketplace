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
      <div className="relative py-12 mb-8 overflow-hidden">
        {/* Skeleton background design elements */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-gray-100 to-white z-0"></div>
        
        <div className="max-w-6xl mx-auto px-4 relative z-10">
          {/* Skeleton heading with creative styling */}
          <div className="flex flex-col items-center mb-8 relative">
            <Skeleton className="h-10 w-96 mx-auto mb-2" />
            <div className="flex items-center space-x-2">
              <Skeleton className="h-1 w-12" />
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-1 w-12" />
            </div>
          </div>
          
          {/* Skeleton carousel items */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="px-2 py-3">
                <div className="relative rounded-lg overflow-hidden">
                  {/* Skeleton decorative elements */}
                  <div className="absolute -right-4 -top-4 w-20 h-20 bg-gray-200 rotate-12"></div>
                  <div className="absolute -left-4 -bottom-4 w-16 h-16 bg-gray-100 rotate-12"></div>
                  
                  {/* Skeleton content container */}
                  <div className="bg-white border border-gray-100 rounded-lg relative p-5">
                    {/* SOLD label skeleton */}
                    <Skeleton className="absolute right-0 top-4 h-4 w-20 rotate-45" />
                    
                    <Skeleton className="h-7 w-full max-w-[200px] mb-4" />
                    
                    {/* Info area skeleton */}
                    <div className="flex items-center justify-between bg-gray-50 rounded p-2">
                      <div className="flex items-center space-x-2">
                        <Skeleton className="h-5 w-16 rounded" />
                        <Skeleton className="h-5 w-20 rounded" />
                      </div>
                      <Skeleton className="h-7 w-20" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Skeleton navigation */}
          <div className="flex justify-center mt-8 space-x-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex items-center space-x-1">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="w-2 h-2 rounded-full" />
              ))}
            </div>
            <Skeleton className="h-10 w-10 rounded-full" />
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
              <div className="bg-white border border-gray-200 rounded-lg relative z-10">
                {/* SOLD label - styled as a banner */}
                <div className="absolute -right-8 top-4 bg-black text-white text-xs font-black py-1 px-10 rotate-45 shadow-md z-20">
                  SOLD
                </div>
                
                {/* Main content with radial gradient background */}
                <div className="p-5 bg-gradient-to-br from-white to-gray-50">
                  <h3 className="text-xl font-black text-black mb-2 truncate">
                    <a 
                      href={`https://${domain.name}`} 
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-gray-700 transition-colors inline-flex items-center"
                    >
                      {domain.name}
                      <ExternalLink className="ml-1 h-4 w-4 opacity-70" />
                    </a>
                  </h3>
                  
                  {/* Info area with glass-like effect */}
                  <div className="flex items-center justify-between bg-white bg-opacity-70 backdrop-blur-sm rounded p-2 border border-gray-100">
                    <div className="flex items-center space-x-2">
                      <span className="inline-flex items-center text-xs font-medium bg-gray-100 px-2 py-1 rounded">
                        {domain.length} chars
                      </span>
                      <span className="text-xs font-medium px-2 py-1 rounded bg-gray-800 text-white">
                        {domain.category}
                      </span>
                    </div>
                    
                    <div className="font-black text-xl text-black">
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
    <div className="relative py-12 mb-8 overflow-hidden">
      {/* Background design elements */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-gray-100 to-white z-0"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-black rounded-full -translate-y-1/2 translate-x-1/2 opacity-5"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-black rounded-full translate-y-1/3 -translate-x-1/3 opacity-5"></div>
      
      {/* Diagonal pattern */}
      <div className="absolute inset-0 z-0 opacity-10" 
           style={{ backgroundImage: 'linear-gradient(45deg, #000 25%, transparent 25%, transparent 50%, #000 50%, #000 75%, transparent 75%, transparent)', 
                    backgroundSize: '8px 8px' }}>
      </div>
      
      <div className="max-w-6xl mx-auto px-4 relative z-10">
        {/* Heading with creative styling */}
        <div className="flex flex-col items-center mb-8 relative">
          <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-6xl font-black text-black opacity-5 whitespace-nowrap">SOLD OUT</div>
          <h2 className="text-3xl font-black text-black relative z-10 text-center mb-1">
            <span className="inline-block px-2 pb-1 relative">
              Gone Fast
              <span className="absolute bottom-0 left-0 w-full h-1 bg-black"></span>
            </span>
            <span className="text-gray-400 mx-2">–</span>
            <span className="inline-block relative">
              See What's Already Sold
            </span>
          </h2>
          <div className="flex items-center space-x-2 text-sm text-gray-600 font-medium mt-2">
            <span className="inline-block w-12 h-px bg-gray-300"></span>
            <span>Real market performance indicators</span>
            <span className="inline-block w-12 h-px bg-gray-300"></span>
          </div>
        </div>
        
        <Carousel className="mx-auto">
          <CarouselContent className="-ml-2">
            {carouselItems()}
          </CarouselContent>
          
          {/* Creative navigation controls */}
          <div className="flex justify-center mt-8 space-x-4">
            <CarouselPrevious className="bg-black hover:bg-gray-800 text-white border-none h-10 w-10 rounded-full shadow-lg relative static ml-0 transform transition-transform hover:scale-110" />
            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(5, domains.length) }).map((_, i) => (
                <div key={i} className="w-2 h-2 rounded-full bg-gray-300"></div>
              ))}
            </div>
            <CarouselNext className="bg-black hover:bg-gray-800 text-white border-none h-10 w-10 rounded-full shadow-lg relative static mr-0 transform transition-transform hover:scale-110" />
          </div>
        </Carousel>
      </div>
    </div>
  );
}