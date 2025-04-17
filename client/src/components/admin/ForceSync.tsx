import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCw } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

export default function ForceSync() {
  const { toast } = useToast();
  const [isSyncing, setIsSyncing] = useState(false);
  
  const handleForceSync = async () => {
    setIsSyncing(true);
    
    try {
      // Call the server's dedicated force sync API endpoint
      const response = await apiRequest('POST', '/api/admin/force-sync');
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to sync domains');
      }
      
      const result = await response.json();
      
      // Fetch fresh domain data with cache-busting
      const domainResponse = await fetch(`/api/domains?t=${Date.now()}`, {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
        credentials: 'include'
      });
      
      if (!domainResponse.ok) {
        throw new Error('Failed to refresh domain data');
      }
      
      // Force a complete page refresh to update everything
      window.location.reload();
      
      toast({
        title: "Data Sync Successful",
        description: `Refreshed ${result.refreshed} domains with updated prices`,
      });
    } catch (error) {
      console.error('Data sync error:', error);
      toast({
        title: "Sync Failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSyncing(false);
    }
  };
  
  return (
    <div>
      <p className="text-xs text-gray-600 mb-3">
        Use when domain prices aren't updating correctly. Forces a refresh by bypassing the cache.
      </p>
      <Button 
        onClick={handleForceSync} 
        disabled={isSyncing}
        className="w-full flex items-center justify-center gap-2"
        size="sm"
      >
        <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
        {isSyncing ? 'Syncing...' : 'Force Sync Now'}
      </Button>
    </div>
  );
}