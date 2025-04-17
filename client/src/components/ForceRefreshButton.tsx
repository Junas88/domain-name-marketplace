import React, { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export function ForceRefreshButton() {
  const { toast } = useToast();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleForceRefresh = async () => {
    setIsRefreshing(true);
    
    try {
      // Add a timestamp to force a fresh fetch
      const timestamp = Date.now();
      
      // List of critical endpoints to refresh
      const endpoints = [
        '/api/domains',
        '/api/domains/recently-sold',
        '/api/page-contents/hero',
        '/api/page-contents/features'
      ];
      
      // Invalidate all queries to force a refresh
      console.log("🔄 Force refreshing all data from server...");
      await queryClient.invalidateQueries();
      
      // Add a small delay to let the invalidation process start
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Force page reload with cache-busting parameters
      window.location.href = `${window.location.pathname}?refresh=true&t=${timestamp}`;
      
      toast({
        title: "Refreshing Data",
        description: "Fetching the latest content from our servers...",
        duration: 3000,
      });
    } catch (error) {
      console.error("Error refreshing data:", error);
      
      toast({
        title: "Refresh Failed",
        description: "There was a problem refreshing the data. Please try again.",
        variant: "destructive",
        duration: 5000,
      });
      
      setIsRefreshing(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      className="flex items-center gap-1 fixed bottom-4 right-4 z-50 bg-white dark:bg-gray-900 shadow-md"
      onClick={handleForceRefresh}
      disabled={isRefreshing}
    >
      <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
      <span>{isRefreshing ? "Refreshing..." : "Force Refresh"}</span>
    </Button>
  );
}