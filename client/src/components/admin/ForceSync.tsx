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
      const cacheParam = `?t=${Date.now()}`; // Add cache-busting timestamp
      
      // Fetch all domains with cache-busting
      const response = await fetch(`/api/domains${cacheParam}`, {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to sync domains');
      }
      
      // Force refresh the browser cache and DOM
      window.location.reload();
      
      toast({
        title: "Data Sync Successful",
        description: "All domain data has been refreshed",
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