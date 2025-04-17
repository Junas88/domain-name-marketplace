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
      const response = await apiRequest('GET', `/api/domains${cacheParam}`, undefined, {
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
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Force Data Sync</CardTitle>
        <CardDescription>Refresh all domain data to ensure latest prices are displayed</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Use this when domain prices or availability aren't updating correctly in production.
          This will force a refresh of all domain data by bypassing the cache.
        </p>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleForceSync} 
          disabled={isSyncing}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
          {isSyncing ? 'Syncing Data...' : 'Force Sync Now'}
        </Button>
      </CardFooter>
    </Card>
  );
}