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
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          {/* Skeleton for title/subtitle */}
          <div className="flex flex-col items-center">
            <Skeleton className="h-20 w-96 mx-auto mb-4 bg-green-100" />
            <Skeleton className="h-6 w-[500px] mx-auto mb-16 bg-gray-100" />
          </div>
          
          {/* Skeleton for carousel navigation */}
          <div className="flex relative">
            {/* Left arrow skeleton */}
            <div className="absolute -left-12 top-1/2 transform -translate-y-1/2 bg-transparent h-16 w-16 z-20">
              <Skeleton className="h-16 w-8 bg-green-100" />
            </div>
            
            {/* Skeleton carousel items */}
            <div className="mx-auto w-full">
              <div className="flex justify-center">
                <div className="px-8 py-4 text-center">
                  <Skeleton className="h-14 w-96 mx-auto mb-3 bg-gray-200" />
                  <Skeleton className="h-10 w-48 mx-auto bg-green-100" />
                </div>
              </div>
            </div>
            
            {/* Right arrow skeleton */}
            <div className="absolute -right-12 top-1/2 transform -translate-y-1/2 bg-transparent h-16 w-16 z-20">
              <Skeleton className="h-16 w-8 ml-auto bg-green-100" />
            </div>
          </div>
          
          {/* Skeleton for dots */}
          <div className="flex justify-center mt-8 space-x-2">
            {[...Array(10)].map((_, i) => (
              <Skeleton 
                key={i} 
                className={`w-3 h-3 rounded-full ${i === 0 ? 'bg-green-500' : 'bg-gray-200'}`} 
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
          <div className="px-8 py-2">
            <div className="text-center">
              {/* Domain name in large black text */}
              <h3 className="text-5xl font-black text-black mb-2">
                <a 
                  href={`https://${domain.name}`} 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-green-600 transition-colors"
                >
                  {domain.name}
                </a>
              </h3>
              
              {/* Price in green */}
              <div className="font-bold text-3xl text-green-500 mt-2">
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
    <div className="relative py-16 mb-10 overflow-hidden bg-white">
      <div className="max-w-7xl mx-auto px-4 relative z-10">
        {/* Main content */}
        <div className="flex flex-col items-center">
          {/* Large heading styled like the image */}
          <h2 className="text-7xl font-black text-green-500 text-center mb-4">
            Already Sold
          </h2>
          
          {/* Subtitle with consistent styling */}
          <p className="text-black text-xl text-center mb-16 max-w-2xl">
            use a premium domain and your business will grow faster
          </p>
        </div>
        
        <Carousel className="mx-auto">
          <div className="flex relative">
            {/* Left arrow - styled like image */}
            <CarouselPrevious className="absolute -left-12 top-1/2 transform -translate-y-1/2 bg-transparent hover:bg-transparent text-green-500 border-none shadow-none h-16 w-16 z-20">
              <svg width="40" height="60" viewBox="0 0 40 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M30 10L10 30L30 50" stroke="#22c55e" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </CarouselPrevious>
            
            <CarouselContent className="mx-auto">
              {carouselItems()}
            </CarouselContent>
            
            {/* Right arrow - styled like image */}
            <CarouselNext className="absolute -right-12 top-1/2 transform -translate-y-1/2 bg-transparent hover:bg-transparent text-green-500 border-none shadow-none h-16 w-16 z-20">
              <svg width="40" height="60" viewBox="0 0 40 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 10L30 30L10 50" stroke="#22c55e" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </CarouselNext>
          </div>
          
          {/* Dot indicators like in the image */}
          <div className="flex justify-center mt-8 space-x-2">
            {Array.from({ length: Math.min(10, domains.length) }).map((_, i) => (
              <div 
                key={i} 
                className={`w-3 h-3 rounded-full ${i === 0 ? 'bg-green-500' : 'bg-gray-200 hover:bg-green-200'}`}
              />
            ))}
          </div>
        </Carousel>
      </div>
    </div>
  );
}