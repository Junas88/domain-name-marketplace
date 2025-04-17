import { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Check, AlertCircle, Zap, Database, Shield } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

// Data version type
interface DataVersion {
  id: number;
  dataType: string;
  version: string;
  lastUpdated: string;
  checksum?: string;
  recordCount?: number;
  details?: string;
  createdAt?: string;
}

export default function ForceSync() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [syncResult, setSyncResult] = useState<{success: boolean; message: string} | null>(null);
  
  // Fetch the latest data versions
  const { data: dataVersions, isLoading: isLoadingVersions, refetch: refetchVersions } = useQuery<DataVersion[]>({ 
    queryKey: ['/api/admin/data-versions'],
    queryFn: async () => {
      try {
        const timestamp = Date.now();
        const response = await fetch(`/api/admin/data-versions?t=${timestamp}`, {
          method: 'GET',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          },
          credentials: 'include'
        });
        
        if (!response.ok) {
          console.warn('Could not fetch data versions');
          return [];
        }
        
        return await response.json();
      } catch (err) {
        console.error('Error fetching data versions:', err);
        return [];
      }
    },
    refetchInterval: 60000, // Refresh every minute
  });
  
  // Reset sync result after displaying
  useEffect(() => {
    if (syncResult) {
      const timer = setTimeout(() => {
        setSyncResult(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [syncResult]);
  
  const invalidateAllQueries = async () => {
    // Clear all caches
    await queryClient.invalidateQueries();
    
    // Force-refetch critical queries to ensure they are immediately updated
    await queryClient.refetchQueries({ queryKey: ['/api/domains'] });
    await queryClient.refetchQueries({ queryKey: ['/api/domains/recently-sold'] });
    
    // Additional strong cache busting measures
    const timestamp = Date.now();
    
    // Try a direct bust of the cache for deployed environment
    try {
      // Force a fresh domains fetch with cache-busting
      await fetch(`/api/domains?t=${timestamp}`, {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
          'x-force-refresh': 'true'
        },
        credentials: 'include'
      });
      
      // Also bust the recently-sold cache
      await fetch(`/api/domains/recently-sold?t=${timestamp}`, {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
          'x-force-refresh': 'true'
        },
        credentials: 'include'
      });
    } catch (err) {
      console.error('Error during explicit cache busting:', err);
    }
  };
  
  const handleForceSync = async () => {
    setIsSyncing(true);
    setSyncProgress(10);
    
    try {
      setSyncProgress(30);
      
      // Use a unique timestamp to prevent caching issues
      const timestamp = Date.now();
      
      // Call the server's dedicated force sync API endpoint
      const response = await fetch(`/api/admin/force-sync?t=${timestamp}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
          'x-force-refresh': 'true'
        },
        credentials: 'include'
      });
      
      setSyncProgress(50);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to sync domains');
      }
      
      const result = await response.json();
      setSyncProgress(75);
      
      // Invalidate all queries
      await invalidateAllQueries();
      
      // Also refresh data versions information
      await refetchVersions();
      
      setSyncProgress(90);
      
      // Small delay to ensure server side changes have propagated
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSyncProgress(100);
      
      // Display success message
      setSyncResult({
        success: true,
        message: `Successfully refreshed ${result.refreshed} domains. Timestamp: ${new Date().toLocaleTimeString()}`
      });
      
      toast({
        title: "Data Sync Complete",
        description: `Refreshed ${result.refreshed} domains with updated prices`,
      });
      
      // After a brief pause, reset progress
      setTimeout(() => {
        setSyncProgress(0);
      }, 2000);
    } catch (error) {
      console.error('Data sync error:', error);
      setSyncResult({
        success: false,
        message: error instanceof Error ? error.message : "An unknown error occurred"
      });
      
      toast({
        title: "Sync Failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSyncing(false);
      
      // Ensure clean-up of progress bar after a delay
      setTimeout(() => {
        setSyncProgress(0);
      }, 2000);
    }
  };
  
  // Check for recent data version updates (in last 24 hours)
  const getLatestDomainVersion = () => {
    if (!dataVersions || dataVersions.length === 0) return null;
    
    // Filter for domain data versions
    const domainVersions = dataVersions.filter(v => 
      v.dataType === 'domains' || v.dataType === 'domains-bulk-price-update'
    );
    
    // Sort by most recent
    return domainVersions.sort((a, b) => 
      new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()
    )[0] || null;
  };

  const latestVersion = getLatestDomainVersion();
  
  // Format time difference from now
  const getTimeSince = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);
    
    if (diffMinutes < 60) {
      return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
    }
    
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    }
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  };
  
  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <p className="text-xs text-gray-600">
          Use when domain prices aren't updating correctly in production. Forces a refresh by bypassing all caches.
        </p>
        
        {syncProgress > 0 && (
          <Progress value={syncProgress} className="h-1 mb-3" />
        )}
        
        {syncResult && (
          <div className={`text-xs p-2 rounded ${syncResult.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'} flex items-start gap-2 mb-2`}>
            {syncResult.success ? (
              <Check className="h-4 w-4 flex-shrink-0 text-green-600" />
            ) : (
              <AlertCircle className="h-4 w-4 flex-shrink-0 text-red-600" />
            )}
            <span>{syncResult.message}</span>
          </div>
        )}
        
        <div className="flex gap-2">
          <Button 
            onClick={handleForceSync} 
            disabled={isSyncing}
            className="w-full flex items-center justify-center gap-1.5"
            size="sm"
            variant={isSyncing ? "outline" : "default"}
          >
            {isSyncing ? (
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Zap className="h-3.5 w-3.5" />
            )}
            {isSyncing ? 'Syncing...' : 'Force Sync All Domains'}
          </Button>
        </div>
        
        {isSyncing && (
          <p className="text-xs text-gray-500 animate-pulse">
            Updating prices... this may take a few moments
          </p>
        )}
      </div>
      
      {/* Data Persistence Status */}
      <Card className="p-3">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Database className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium">Data Version Status</span>
            </div>
            
            <Badge 
              variant={latestVersion ? "outline" : "destructive"} 
              className="text-xs"
            >
              {isLoadingVersions ? 'Checking...' : (latestVersion ? 'v' + latestVersion.version : 'No Data')}
            </Badge>
          </div>
          
          {latestVersion ? (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">Last Update:</span>
                <span className="font-medium">{getTimeSince(latestVersion.lastUpdated)}</span>
              </div>
              
              {latestVersion.recordCount !== undefined && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">Domains Tracked:</span>
                  <span className="font-medium">{latestVersion.recordCount}</span>
                </div>
              )}
              
              {latestVersion.details && (
                <div className="text-xs text-gray-500 mt-1">
                  <span className="font-medium text-gray-700">Notes:</span>{' '}
                  {latestVersion.details}
                </div>
              )}
              
              <div className="flex items-center gap-1.5 mt-2">
                <Shield className="h-3.5 w-3.5 text-green-600" />
                <span className="text-xs text-green-600">Persistence protection active</span>
              </div>
            </div>
          ) : (
            <div className="text-xs text-gray-500 py-1">
              No data version information available. Run a force sync to update.
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}