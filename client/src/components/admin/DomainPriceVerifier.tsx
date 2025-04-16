import { useState } from "react";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { toast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface Domain {
  id: number;
  name: string;
  price: number;
  category: string;
  description: string;
}

export default function DomainPriceVerifier() {
  const [loading, setLoading] = useState(false);
  const [domainsInfo, setDomainsInfo] = useState<{
    totalDomains: number;
    sampleDomains: Domain[];
    priceCounts: Record<number, number>;
    timestamp: number;
  } | null>(null);

  const verifyDomainPrices = async () => {
    try {
      setLoading(true);
      
      // Add cache-busting query param
      const timestamp = Date.now();
      const response = await apiRequest(`/api/domains/fresh?t=${timestamp}`, {
        method: "GET",
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          "Pragma": "no-cache",
          "Expires": "0"
        }
      });
      
      const data = await response.json();
      const domains = data.domains as Domain[];
      
      // Count occurrences of each price
      const priceCounts: Record<number, number> = {};
      domains.forEach(domain => {
        const price = domain.price;
        priceCounts[price] = (priceCounts[price] || 0) + 1;
      });
      
      // Sort prices by count (descending)
      const sortedPrices = Object.entries(priceCounts)
        .sort((a, b) => Number(b[1]) - Number(a[1]))
        .reduce((acc, [price, count]) => {
          acc[Number(price)] = count;
          return acc;
        }, {} as Record<number, number>);
      
      setDomainsInfo({
        totalDomains: domains.length,
        sampleDomains: domains.slice(0, 10),
        priceCounts: sortedPrices,
        timestamp
      });
      
      toast({
        title: "Price verification complete",
        description: `Verified ${domains.length} domains`
      });
    } catch (error) {
      console.error("Error verifying domain prices:", error);
      toast({
        title: "Verification failed",
        description: "Could not fetch domain data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Domain Price Verifier</CardTitle>
        <CardDescription>
          Verify domain prices are correctly updated in the database and API
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Button 
            onClick={verifyDomainPrices} 
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Checking domain prices...
              </>
            ) : (
              "Verify Domain Prices"
            )}
          </Button>
          
          {domainsInfo && (
            <div className="space-y-4 mt-4">
              <div className="rounded-md bg-green-50 p-4 border border-green-200">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-green-800">Database check completed</h3>
                    <div className="mt-2 text-sm text-green-700">
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Total domains in database: <strong>{domainsInfo.totalDomains}</strong></li>
                        <li>Verification timestamp: <strong>{new Date(domainsInfo.timestamp).toLocaleString()}</strong></li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
              
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="prices">
                  <AccordionTrigger>Price Distribution</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2">
                      {Object.entries(domainsInfo.priceCounts).map(([price, count]) => (
                        <div key={price} className="flex justify-between">
                          <span>${Number(price).toLocaleString()}</span>
                          <span className="font-medium">{count} domains</span>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="samples">
                  <AccordionTrigger>Sample Domains</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2">
                      {domainsInfo.sampleDomains.map(domain => (
                        <div key={domain.id} className="flex justify-between border-b pb-2">
                          <span>{domain.name}</span>
                          <span className="font-medium">${domain.price.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
              
              <div className="p-4 border rounded-md bg-blue-50 border-blue-200">
                <h4 className="font-medium text-blue-800">Deployment Instructions</h4>
                <p className="text-sm text-blue-700 mt-1">
                  If the prices look correct in this verifier but aren't appearing on the deployed site,
                  run the <code className="bg-blue-100 px-1 rounded">force-update-deployment.js</code> script.
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}