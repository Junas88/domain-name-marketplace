import { useQuery } from "@tanstack/react-query";
import { PageContent } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";

export default function Hero() {
  // Fetch hero content from API
  const { data: heroContent, isLoading } = useQuery<PageContent>({
    queryKey: ['/api/page-contents/hero'],
  });

  return (
    <section className="bg-black text-white py-16" aria-labelledby="hero-heading">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          {isLoading ? (
            // Show skeleton loading state
            <>
              <Skeleton className="h-12 w-3/4 mx-auto bg-gray-800 mb-6" />
              <Skeleton className="h-6 w-full mx-auto bg-gray-800 mb-2" />
              <Skeleton className="h-6 w-5/6 mx-auto bg-gray-800 mb-8" />
            </>
          ) : heroContent ? (
            // Show content from API
            <>
              <h1 id="hero-heading" className="text-4xl md:text-5xl font-bold mb-6">
                {heroContent.title || "Find Your Perfect Domain Name"}
              </h1>
              <div className="text-xl mb-8" dangerouslySetInnerHTML={{ __html: heroContent.content || "Premium domains with instant Buy-It-Now prices or make an offer. Secure the ideal domain for your startup, business, brand, or project." }} />
            </>
          ) : (
            // Fallback content if no data from API
            <>
              <h1 id="hero-heading" className="text-4xl md:text-5xl font-bold mb-6">
                Find Your Perfect Domain Name
              </h1>
              <p className="text-xl mb-8">
                Premium domains with instant Buy-It-Now prices or make an offer. Secure the ideal domain for your startup, business, brand, or project.
              </p>
            </>
          )}
          
          {/* SEO Keywords in hidden span for search engines */}
          <span className="sr-only">
            DOMAIN NAME GUIDE, domain marketplace, premium domains, buy domains, sell domains, domain broker, domain consultation, business domains, tech domains
          </span>
        </div>
      </div>
    </section>
  );
}
