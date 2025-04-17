import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { AlertTriangle, RefreshCcw, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function ForceSync() {
  const { toast } = useToast();
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);

  const forceSyncMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('/api/admin/force-sync', {
        method: 'POST',
        body: JSON.stringify({}),
      });
      return res.json();
    },
    onSuccess: (data) => {
      // Invalidate all domain-related queries to force a fresh fetch
      queryClient.invalidateQueries({ queryKey: ['/api/domains'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/domains'] });
      queryClient.invalidateQueries({ queryKey: ['/api/domains/recently-sold'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/domains/stats'] });
      
      setLastSyncTime(new Date().toLocaleTimeString());
      
      toast({
        title: 'Sync Completed',
        description: `${data.message || 'All domain data has been refreshed'}`,
      });
    },
    onError: (error: any) => {
      console.error('Force sync error:', error);
      toast({
        title: 'Sync Failed',
        description: 'Failed to sync domain data. Please try again.',
        variant: 'destructive',
      });
    },
  });

  return (
    <div className="mb-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Production Sync</CardTitle>
          <CardDescription>
            Force a complete refresh of all domain data to ensure pricing is up-to-date everywhere
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className="bg-amber-50 border-amber-200">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertTitle className="text-amber-800">Seeing stale prices in production?</AlertTitle>
            <AlertDescription className="text-amber-700">
              If domain prices aren't refreshing in production, use this tool to force a complete data refresh. 
              This will update all domains with their current data.
            </AlertDescription>
          </Alert>
          
          <div className="flex items-center justify-between">
            <div>
              {lastSyncTime && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Check className="h-4 w-4 text-green-500" />
                  Last synced at {lastSyncTime}
                </div>
              )}
            </div>
            <Button 
              onClick={() => forceSyncMutation.mutate()}
              disabled={forceSyncMutation.isPending}
              className="flex items-center gap-2"
            >
              {forceSyncMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Syncing...
                </>
              ) : (
                <>
                  <RefreshCcw className="h-4 w-4" />
                  Force Sync All Domains
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}