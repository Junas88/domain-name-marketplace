import { Check, ShieldCheck, Headphones } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { PageContent } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";

export default function Features() {
  // Fetch features content from API
  const { data: featuresContent, isLoading } = useQuery<PageContent>({
    queryKey: ['/api/page-contents/features'],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return (
    <section className="py-16 bg-white border-t border-black">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {isLoading ? (
          // Loading state
          <Skeleton className="h-10 w-1/2 mx-auto bg-gray-200 mb-12" />
        ) : (
          // Heading from API or fallback
          <h2 className="text-3xl font-black text-center mb-12">
            {featuresContent?.title || "Why Choose DomainnameGuide.com?"}
          </h2>
        )}
        
        {isLoading ? (
          // Loading state for features
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white p-6 border border-gray-200 text-center">
                <Skeleton className="w-16 h-16 rounded-full mx-auto mb-4 bg-gray-200" />
                <Skeleton className="h-6 w-1/2 mx-auto bg-gray-200 mb-3" />
                <Skeleton className="h-4 w-full bg-gray-200 mb-2" />
                <Skeleton className="h-4 w-2/3 mx-auto bg-gray-200" />
              </div>
            ))}
          </div>
        ) : featuresContent && featuresContent.content ? (
          // If we have API content, render it
          <div dangerouslySetInnerHTML={{ __html: featuresContent.content }} />
        ) : (
          // Default fallback features
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white p-6 border border-black text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-black">
                <Check className="text-black text-2xl" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Verified Domains</h3>
              <p className="text-neutral-700">All our domains are verified for quality and legitimacy before listing.</p>
            </div>
            
            {/* Feature 2 */}
            <div className="bg-white p-6 border border-black text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-black">
                <ShieldCheck className="text-black text-2xl" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Secure Transfers</h3>
              <p className="text-neutral-700">We ensure safe and secure domain transfers with our trusted partner GoDaddy.</p>
            </div>
            
            {/* Feature 3 */}
            <div className="bg-white p-6 border border-black text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-black">
                <Headphones className="text-black text-2xl" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Expert Support</h3>
              <p className="text-neutral-700">Our domain experts are available to help you find the perfect domain for your needs.</p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
