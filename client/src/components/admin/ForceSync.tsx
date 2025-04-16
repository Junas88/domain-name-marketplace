import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function ForceSync() {
  const [isSyncing, setIsSyncing] = useState(false);
  const { toast } = useToast();

  const forceSyncMutation = useMutation({
    mutationFn: async () => {
      setIsSyncing(true);
      const res = await apiRequest('/api/admin/force-sync', { method: 'POST' });
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: 'Sync Successful',
        description: data.message || `Successfully refreshed ${data.refreshed} domains`,
        variant: 'default',
      });
      
      // Invalidate all domain-related queries to ensure fresh data
      queryClient.invalidateQueries({ queryKey: ['/api/domains'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/domains'] });
      queryClient.invalidateQueries({ queryKey: ['/api/domains/recently-sold'] });
      
      setIsSyncing(false);
    },
    onError: (error) => {
      console.error('Force sync error:', error);
      toast({
        title: 'Sync Failed',
        description: 'Failed to synchronize domain data. Please try again.',
        variant: 'destructive',
      });
      setIsSyncing(false);
    },
  });

  const handleForceSync = () => {
    toast({
      title: 'Starting Sync',
      description: 'Forcing synchronization of all domain data. This may take a moment...',
    });
    forceSyncMutation.mutate();
  };

  return (
    <div className="mt-4 mb-6 p-4 border rounded-md bg-gray-50 dark:bg-gray-900">
      <h3 className="text-lg font-medium mb-2">Production Sync</h3>
      <p className="text-muted-foreground mb-3">
        Force a complete refresh of all domain data across the system. Use this if price updates are not showing up in production.
      </p>
      <Button 
        onClick={handleForceSync} 
        disabled={isSyncing}
        variant="default"
        className="flex items-center gap-2"
      >
        {isSyncing ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Syncing...
          </>
        ) : (
          'Force Sync All Domains'
        )}
      </Button>
    </div>
  );
}