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
        <h2 className="text-center text-4xl font-bold mb-12">Premium Domains Sold</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-3">
              <div className="overflow-hidden border border-white/20 rounded-xl bg-gradient-to-b from-black/60 to-black/40 backdrop-blur-sm">
                <div className="p-8 flex flex-col items-center justify-center">
                  <Skeleton className="h-10 w-4/5 bg-white/10 mb-4" />
                  <Skeleton className="h-12 w-2/3 bg-white/10 my-4" />
                  <Skeleton className="h-6 w-1/4 bg-white/10 mt-2 rounded-full" />
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
          <div className="p-3">
            <div className="overflow-hidden border border-white/20 rounded-xl bg-gradient-to-b from-black/60 to-black/40 backdrop-blur-sm hover:border-white/40 transition-all">
              <div className="p-8 flex flex-col items-center justify-center">
                <h3 className="text-2xl md:text-3xl font-bold mb-4 text-white text-center">
                  <a 
                    href={`https://${domain.name}`} 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-gray-300 transition-colors inline-flex items-center"
                  >
                    {domain.name}
                    <ExternalLink className="ml-2 h-5 w-5" />
                  </a>
                </h3>
                
                <div className="font-bold text-3xl md:text-4xl text-white mt-2 mb-4">
                  {formatCurrency(domain.price)}
                </div>
                
                <div className="text-sm uppercase tracking-widest font-semibold text-emerald-400 mt-2 border border-emerald-400/30 px-3 py-1 rounded-full">
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
    <div className="mb-8">
      <h2 className="text-center text-4xl font-bold mb-12">Premium Domains Sold</h2>
      <Carousel className="mx-auto max-w-6xl">
        <CarouselContent>
          {carouselItems()}
        </CarouselContent>
        <CarouselPrevious className="bg-white/10 hover:bg-white/20 text-white border-none" />
        <CarouselNext className="bg-white/10 hover:bg-white/20 text-white border-none" />
      </Carousel>
    </div>
  );
}