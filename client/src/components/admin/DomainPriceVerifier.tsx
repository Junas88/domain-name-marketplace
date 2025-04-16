import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Domain } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, DownloadCloud, FileWarning, CheckCircle, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export default function DomainPriceVerifier() {
  const { toast } = useToast();
  const [searchText, setSearchText] = useState("");
  const [selectedDomain, setSelectedDomain] = useState<Domain | null>(null);
  const [loadingAction, setLoadingAction] = useState(false);
  const [showFullList, setShowFullList] = useState(false);
  
  // Define the type for our fresh domains response
  interface FreshDomainsResponse {
    domains: Domain[];
    cacheBuster: string;
    timestamp: number;
  }

  // Get domains from the API - force fresh data
  const { data: freshData, isLoading, isError, refetch } = useQuery<FreshDomainsResponse>({
    queryKey: ['/api/domains/fresh', { t: Date.now() }],
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  const domains = freshData?.domains || [];
  
  // Function to handle force update of domain cache
  const forceUpdateCache = async () => {
    try {
      setLoadingAction(true);
      
      // First update the React Query cache
      await queryClient.invalidateQueries({ queryKey: ['/api/domains'] });
      await queryClient.invalidateQueries({ queryKey: ['/api/domains/fresh'] });
      await queryClient.invalidateQueries({ queryKey: ['/api/domains/recently-sold'] });
      
      // Refetch the data
      await refetch();
      
      // Give user feedback
      toast({
        title: "Cache Refreshed",
        description: "The domain data has been refreshed from the server.",
      });
    } catch (error) {
      console.error("Error forcing cache update:", error);
      toast({
        title: "Refresh Failed",
        description: "There was an error refreshing the domain data.",
        variant: "destructive"
      });
    } finally {
      setLoadingAction(false);
    }
  };

  // Function to verify a specific domain price
  const verifyDomainPrice = async (domainName: string) => {
    if (!domainName) {
      toast({
        title: "Missing Domain Name",
        description: "Please enter a domain name to verify.",
        variant: "destructive"
      });
      return;
    }
    
    setLoadingAction(true);
    try {
      // First, refetch all domains to get fresh data
      await refetch();
      
      // Then find the domain in the fresh data
      const domain = domains.find(d => 
        d.name.toLowerCase() === domainName.toLowerCase()
      );
      
      if (domain) {
        setSelectedDomain(domain);
        toast({
          title: "Domain Found",
          description: `${domain.name} is priced at $${domain.price.toLocaleString()}`,
        });
      } else {
        setSelectedDomain(null);
        toast({
          title: "Domain Not Found",
          description: `"${domainName}" was not found in the database.`,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error verifying domain price:", error);
      toast({
        title: "Verification Failed",
        description: "There was an error verifying the domain price.",
        variant: "destructive"
      });
    } finally {
      setLoadingAction(false);
    }
  };

  // Handle submit of the search form
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    verifyDomainPrice(searchText);
  };
  
  // Helper to update the deployment cache
  const updateDeploymentCache = async () => {
    setLoadingAction(true);
    try {
      // Make the request to the force-update endpoint
      const response = await fetch('/api/admin/force-update-cache', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        toast({
          title: "Deployment Cache Updated",
          description: data.message || "The deployment cache has been updated successfully.",
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "Unknown error");
      }
    } catch (error) {
      console.error("Error updating deployment cache:", error);
      toast({
        title: "Update Failed",
        description: "There was an error updating the deployment cache. Try running force-update-deployment.js manually.",
        variant: "destructive"
      });
    } finally {
      setLoadingAction(false);
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Domain Price Verifier</CardTitle>
        <CardDescription>
          Verify domain prices and check for cache inconsistencies between development and production
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Switch 
            id="show-full-list" 
            checked={showFullList}
            onCheckedChange={setShowFullList}
          />
          <Label htmlFor="show-full-list">Show full domain list</Label>
        </div>
        
        {/* Domain search form */}
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <Input
            type="text"
            placeholder="Enter domain name (e.g., example.com)"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" disabled={loadingAction || isLoading}>
            {loadingAction ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Checking...
              </>
            ) : (
              "Verify Price"
            )}
          </Button>
        </form>
        
        {/* Domain verification results */}
        {selectedDomain && (
          <Card className="mt-4 border-2 border-green-500">
            <CardHeader className="py-3">
              <CardTitle className="text-lg">Domain Price Verification</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="font-medium">Domain Name:</div>
                <div>{selectedDomain.name}</div>
                
                <div className="font-medium">Price:</div>
                <div className="text-green-600 font-bold">${selectedDomain.price.toLocaleString()}</div>
                
                <div className="font-medium">Category:</div>
                <div>
                  <Badge variant="outline">{selectedDomain.category}</Badge>
                </div>
                
                <div className="font-medium">Status:</div>
                <div>
                  {selectedDomain.isSold ? (
                    <Badge variant="destructive">Sold</Badge>
                  ) : (
                    <Badge variant="outline" className="bg-green-100">Available</Badge>
                  )}
                </div>
                
                <div className="font-medium">Length:</div>
                <div>{selectedDomain.length} characters</div>
                
                <div className="font-medium">Views:</div>
                <div>{selectedDomain.viewCount}</div>
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Domain list card (only shown if showFullList is true) */}
        {showFullList && (
          <Card className="mt-4 max-h-96 overflow-y-auto">
            <CardHeader className="py-3 sticky top-0 bg-white z-10 border-b">
              <CardTitle className="text-lg">All Domains (Total: {domains.length})</CardTitle>
            </CardHeader>
            <CardContent className="px-2 py-0">
              <table className="min-w-full text-sm">
                <thead className="sticky top-14 bg-white border-b">
                  <tr>
                    <th className="py-2 px-3 text-left">Domain</th>
                    <th className="py-2 px-3 text-right">Price</th>
                    <th className="py-2 px-3 text-left">Category</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {isLoading ? (
                    <tr>
                      <td colSpan={3} className="py-4 text-center">
                        <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                        <p className="mt-2">Loading domains...</p>
                      </td>
                    </tr>
                  ) : domains.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="py-4 text-center">
                        <FileWarning className="h-6 w-6 mx-auto text-amber-500" />
                        <p className="mt-2">No domains found. This could indicate a database issue.</p>
                      </td>
                    </tr>
                  ) : (
                    domains.map((domain) => (
                      <tr key={domain.id} className="hover:bg-gray-50">
                        <td className="py-2 px-3 text-left font-medium">
                          {domain.name}
                        </td>
                        <td className="py-2 px-3 text-right font-mono">
                          ${domain.price.toLocaleString()}
                        </td>
                        <td className="py-2 px-3 text-left">
                          <Badge variant="outline" className="font-normal">
                            {domain.category}
                          </Badge>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </CardContent>
          </Card>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          onClick={forceUpdateCache}
          disabled={loadingAction}
        >
          {loadingAction ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="mr-2 h-4 w-4" />
          )}
          Refresh Cache
        </Button>
        
        <Button
          variant="secondary"
          onClick={updateDeploymentCache}
          disabled={loadingAction}
        >
          {loadingAction ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <DownloadCloud className="mr-2 h-4 w-4" />
          )}
          Update Deployment Cache
        </Button>
      </CardFooter>
    </Card>
  );
}