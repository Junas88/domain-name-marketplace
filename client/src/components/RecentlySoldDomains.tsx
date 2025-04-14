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
      <div className="relative py-8 mb-6 overflow-hidden bg-white">
        <div className="max-w-5xl mx-auto px-4 relative z-10">
          {/* Skeleton for updated title/subtitle */}
          <div className="flex flex-col items-center">
            <Skeleton className="h-10 w-80 mx-auto mb-2 bg-gray-200" />
            <Skeleton className="h-5 w-[400px] mx-auto mb-4 bg-gray-100" />
          </div>
          
          {/* Skeleton for carousel navigation - even more compact */}
          <div className="flex relative">
            {/* Left arrow skeleton - smaller black circle */}
            <div className="absolute -left-4 top-1/2 transform -translate-y-1/2 h-8 w-8 z-20">
              <Skeleton className="h-8 w-8 rounded-full bg-black opacity-70" />
            </div>
            
            {/* Skeleton carousel items - smaller */}
            <div className="mx-auto w-full">
              <div className="flex justify-center">
                <div className="px-2 py-0 text-center">
                  <Skeleton className="h-6 w-56 mx-auto mb-0.5 bg-gray-200" />
                  <Skeleton className="h-5 w-24 mx-auto bg-gray-400" />
                </div>
              </div>
            </div>
            
            {/* Right arrow skeleton - smaller black circle */}
            <div className="absolute -right-4 top-1/2 transform -translate-y-1/2 h-8 w-8 z-20">
              <Skeleton className="h-8 w-8 rounded-full bg-black opacity-70" />
            </div>
          </div>
          
          {/* Skeleton for dots - smaller with less spacing */}
          <div className="flex justify-center mt-2 space-x-1">
            {[...Array(10)].map((_, i) => (
              <Skeleton 
                key={i} 
                className={`w-1.5 h-1.5 rounded-full ${i === 0 ? 'bg-black' : 'bg-gray-200'}`} 
              />
            ))}
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
          <div className="px-2 py-0">
            <div className="text-center">
              {/* Domain name in smaller black text - more compact */}
              <h3 className="text-2xl font-black text-black mb-0.5 leading-tight">
                <a 
                  href={`https://${domain.name}`} 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-gray-700 transition-colors"
                >
                  {domain.name}
                </a>
              </h3>
              
              {/* Price in green - smaller and more compact */}
              <div className="font-bold text-lg text-green-500 mt-0.5">
                {formatCurrency(domain.price)}
              </div>
            </div>
          </div>
        </CarouselItem>
      ));
    }
    return null;
  };

  return (
    <div className="relative py-8 mb-6 overflow-hidden bg-white">
      <div className="max-w-5xl mx-auto px-4 relative z-10">
        {/* Main content - more compact */}
        <div className="flex flex-col items-center">
          {/* Updated black heading */}
          <h2 className="text-4xl font-black text-black text-center mb-2">
            Our Latest Domain Sales
          </h2>
          
          {/* Updated subtitle with minimal spacing */}
          <p className="text-black text-base text-center mb-4 max-w-xl">
            These domains opened doors for bold brands. Yours could be next.
          </p>
        </div>
        
        <Carousel className="mx-auto">
          <div className="flex relative">
            {/* Left arrow - smaller black circle with white arrow - moved closer */}
            <CarouselPrevious className="absolute -left-4 top-1/2 transform -translate-y-1/2 bg-black hover:bg-black text-white border-none shadow-md h-8 w-8 z-20 rounded-full flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 6L9 12L15 18" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </CarouselPrevious>
            
            <CarouselContent className="mx-auto">
              {carouselItems()}
            </CarouselContent>
            
            {/* Right arrow - smaller black circle with white arrow - moved closer */}
            <CarouselNext className="absolute -right-4 top-1/2 transform -translate-y-1/2 bg-black hover:bg-black text-white border-none shadow-md h-8 w-8 z-20 rounded-full flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 6L15 12L9 18" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </CarouselNext>
          </div>
          
          {/* Smaller dot indicators - all black/gray - less spacing */}
          <div className="flex justify-center mt-2 space-x-1">
            {Array.from({ length: Math.min(10, domains.length) }).map((_, i) => (
              <div 
                key={i} 
                className={`w-1.5 h-1.5 rounded-full ${i === 0 ? 'bg-black' : 'bg-gray-200 hover:bg-gray-400'}`}
              />
            ))}
          </div>
        </Carousel>
      </div>
    </div>
  );
}