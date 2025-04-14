import { useQuery } from "@tanstack/react-query";
import { Domain } from "@shared/schema";
import { formatCurrency } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useRef, useState } from "react";

export default function RecentlySoldDomains() {
  const { data: domains, isLoading } = useQuery<Domain[]>({
    queryKey: ["/api/domains/recently-sold"],
  });
  
  // State to duplicate domains for seamless infinite scrolling
  const [domainItems, setDomainItems] = useState<Domain[]>([]);
  
  // Create ref for the scroller
  const scrollerRef = useRef<HTMLDivElement>(null);
  
  // Setup the duplicated domains for infinite scrolling effect
  useEffect(() => {
    if (domains && domains.length > 0) {
      // Duplicate the domains array a few times to ensure continuous scrolling
      const duplicatedDomains = [...domains, ...domains, ...domains];
      setDomainItems(duplicatedDomains);
    }
  }, [domains]);

  if (isLoading) {
    return (
      <div className="bg-black text-white py-2 overflow-hidden">
        <div className="flex items-center h-10">
          <Skeleton className="h-6 w-full rounded-none bg-gray-800" />
        </div>
      </div>
    );
  }

  if (!domains || domains.length === 0) {
    return null;
  }

  // Prepare the domain ticker items
  const renderDomainItems = () => {
    return domainItems.map((domain, index) => (
      <div 
        key={`${domain.id}-${index}`} 
        className="inline-flex items-center whitespace-nowrap mx-12"
      >
        <a 
          href={`https://${domain.name}`}
          target="_blank" 
          rel="noopener noreferrer" 
          className="font-bold text-white mx-3 text-xl transition-all duration-300 hover:underline hover:text-yellow-300"
          aria-label={`View the domain ${domain.name}`}
        >
          {domain.name}
        </a>
        <span className="font-bold text-green-400 text-xl">
          sold for {formatCurrency(domain.price)}
        </span>
      </div>
    ));
  };

  return (
    <div 
      className="bg-black text-white py-5 overflow-hidden w-full group"
      aria-label="Recent domain sales ticker - hover to pause animation"
    >
      {/* Hidden heading for SEO and accessibility */}
      <h2 className="sr-only">Recent Domain Sales</h2>
      
      {/* Continuous scrolling ticker with pause on hover */}
      <div className="relative flex overflow-x-hidden h-14">
        <div 
          ref={scrollerRef}
          className="animate-marquee group-hover:animate-none whitespace-nowrap flex items-center cursor-default"
        >
          {renderDomainItems()}
        </div>
        
        {/* Duplicate for seamless looping */}
        <div 
          className="animate-marquee2 group-hover:animate-none whitespace-nowrap flex items-center absolute top-0 cursor-default"
        >
          {renderDomainItems()}
        </div>
      </div>
    </div>
  );
}