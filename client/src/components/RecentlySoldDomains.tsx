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
      <div className="mb-4">
        <h2 className="text-center text-3xl font-bold mb-6">Premium Domains Sold</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-2">
              <div className="overflow-hidden border border-gray-200 rounded-lg bg-gray-50 shadow-sm">
                <div className="p-5 flex flex-col items-center justify-center">
                  <Skeleton className="h-7 w-4/5 bg-gray-200 mb-2" />
                  <Skeleton className="h-8 w-2/3 bg-gray-200 my-2" />
                  <Skeleton className="h-4 w-1/4 bg-gray-200 mt-1 rounded-full" />
                </div>
              </div>
            </div>
          ))}
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
          <div className="p-2">
            <div className="overflow-hidden border border-gray-200 rounded-lg bg-gray-50 shadow-sm hover:border-gray-300 hover:shadow-md transition-all">
              <div className="p-5 flex flex-col items-center justify-center">
                <h3 className="text-xl md:text-2xl font-bold mb-2 text-gray-800 text-center">
                  <a 
                    href={`https://${domain.name}`} 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-gray-600 transition-colors inline-flex items-center"
                  >
                    {domain.name}
                    <ExternalLink className="ml-1 h-4 w-4" />
                  </a>
                </h3>
                
                <div className="font-bold text-2xl md:text-3xl text-gray-900 mt-1 mb-2">
                  {formatCurrency(domain.price)}
                </div>
                
                <div className="text-xs uppercase tracking-widest font-semibold text-emerald-600 mt-1 border border-emerald-200 bg-emerald-50 px-2 py-0.5 rounded-full">
                  SOLD
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
    <div className="mb-4">
      <h2 className="text-center text-3xl font-bold mb-6">Premium Domains Sold</h2>
      <Carousel className="mx-auto max-w-6xl">
        <CarouselContent>
          {carouselItems()}
        </CarouselContent>
        <CarouselPrevious className="bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-200 -left-2 h-8 w-8 shadow-sm" />
        <CarouselNext className="bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-200 -right-2 h-8 w-8 shadow-sm" />
      </Carousel>
    </div>
  );
}