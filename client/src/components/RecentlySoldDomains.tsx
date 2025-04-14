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
      <div className="py-8 mb-4 bg-gray-50 border-y border-gray-100">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-between items-center mb-4">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-5 w-40" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white border-b-2 border-gray-200 p-3">
                <div className="flex justify-between">
                  <div>
                    <Skeleton className="h-6 w-40 mb-2" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <div className="flex flex-col items-end">
                    <Skeleton className="h-6 w-20 mb-2" />
                    <Skeleton className="h-4 w-12" />
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex justify-end mt-4 space-x-2">
            <Skeleton className="h-7 w-7" />
            <Skeleton className="h-7 w-7" />
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
          <div className="px-2 py-1">
            <div className="overflow-hidden border-b-2 border-black bg-white hover:bg-gray-50 transition-all duration-300">
              <div className="p-3 flex flex-row items-center justify-between">
                <div className="flex flex-col">
                  <h3 className="text-lg font-black text-black">
                    <a 
                      href={`https://${domain.name}`} 
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-gray-700 transition-colors inline-flex items-center"
                    >
                      {domain.name}
                      <ExternalLink className="ml-1 h-3 w-3" />
                    </a>
                  </h3>
                  
                  <div className="text-sm text-gray-600">
                    {domain.length} characters · {domain.category}
                  </div>
                </div>
                
                <div className="flex flex-col items-end">
                  <div className="font-bold text-lg text-black">
                    {formatCurrency(domain.price)}
                  </div>
                  
                  <div className="text-xs uppercase tracking-wider font-black text-white bg-black px-2 py-0.5 rounded-sm">
                    SOLD
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
    <div className="py-8 mb-4 bg-gray-50 border-y border-gray-100">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-black text-black">
            <span className="border-b-2 border-black pb-1">Gone Fast – See What's Already Sold</span>
          </h2>
          <div className="text-sm text-gray-600 font-medium">Real market performance</div>
        </div>
        
        <Carousel className="mx-auto">
          <CarouselContent className="-ml-2">
            {carouselItems()}
          </CarouselContent>
          <div className="flex justify-end mt-4 space-x-2">
            <CarouselPrevious className="bg-black hover:bg-gray-800 text-white border-none h-7 w-7 rounded-none shadow-none relative static ml-0" />
            <CarouselNext className="bg-black hover:bg-gray-800 text-white border-none h-7 w-7 rounded-none shadow-none relative static mr-0" />
          </div>
        </Carousel>
      </div>
    </div>
  );
}