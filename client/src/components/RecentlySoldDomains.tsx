import { useQuery } from "@tanstack/react-query";
import { Domain } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
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
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-center text-2xl">Recently Sold Domains</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-3">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </CardContent>
      </Card>
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
            <Card className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex flex-col items-center space-y-3">
                  <div className="w-full text-center">
                    <h3 className="text-xl font-bold mb-1 truncate hover:text-clip">
                      <a 
                        href={`https://${domain.name}`} 
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center"
                      >
                        {domain.name}
                        <ExternalLink className="ml-1 h-4 w-4" />
                      </a>
                    </h3>
                    <Badge className={`${getCategoryColor(domain.category)} text-white`}>
                      {domain.category}
                    </Badge>
                  </div>
                  <div className="font-semibold text-xl">
                    {formatCurrency(domain.price)}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </CarouselItem>
      ));
    }
    return null;
  };

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="text-center text-2xl">Recently Sold Domains</CardTitle>
      </CardHeader>
      <CardContent>
        <Carousel className="mx-auto">
          <CarouselContent>
            {carouselItems()}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </CardContent>
    </Card>
  );
}