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
      <div className="mb-8">
        <h2 className="text-center text-3xl font-bold mb-8">Recently Sold Domains</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-1">
              <div className="overflow-hidden border border-white/20 rounded-lg bg-black/40 backdrop-blur-sm">
                <div className="p-6">
                  <div className="flex flex-col items-center space-y-4">
                    <Skeleton className="h-8 w-3/4 bg-white/10" />
                    <Skeleton className="h-6 w-1/3 bg-white/10" />
                    <Skeleton className="h-8 w-1/2 bg-white/10" />
                    <Skeleton className="h-4 w-1/4 bg-white/10" />
                  </div>
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
          <div className="p-1">
            <div className="overflow-hidden border border-white/20 rounded-lg bg-black/40 backdrop-blur-sm">
              <div className="p-6">
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-full text-center">
                    <h3 className="text-xl font-bold mb-2 truncate hover:text-clip text-white">
                      <a 
                        href={`https://${domain.name}`} 
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center hover:text-gray-300 transition-colors"
                      >
                        {domain.name}
                        <ExternalLink className="ml-1 h-4 w-4" />
                      </a>
                    </h3>
                    <Badge className={`${getCategoryColor(domain.category)} text-white`}>
                      {domain.category}
                    </Badge>
                  </div>
                  <div className="font-semibold text-2xl text-white">
                    {formatCurrency(domain.price)}
                  </div>
                  <div className="text-xs uppercase tracking-wide text-gray-400">
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
    <div className="mb-8">
      <h2 className="text-center text-3xl font-bold mb-8">Recently Sold Domains</h2>
      <Carousel className="mx-auto">
        <CarouselContent>
          {carouselItems()}
        </CarouselContent>
        <CarouselPrevious className="bg-white/10 hover:bg-white/20 text-white border-none" />
        <CarouselNext className="bg-white/10 hover:bg-white/20 text-white border-none" />
      </Carousel>
    </div>
  );
}