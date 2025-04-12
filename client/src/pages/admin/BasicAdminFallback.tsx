import { useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

/**
 * Minimal Admin Fallback Component
 * This is a simplified version of the admin dashboard that will work
 * in any environment, even when routing fails.
 */
export default function BasicAdminFallback() {
  const { user, isLoading, logoutMutation } = useAuth();
  const { toast } = useToast();
  
  useEffect(() => {
    if (!isLoading && !user) {
      // Redirect to login if not authenticated
      window.location.href = '/login';
    }
  }, [user, isLoading]);
  
  // Handle logout
  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        toast({
          title: 'Logged out successfully',
          description: 'You have been logged out',
        });
        // Redirect to home
        window.location.href = '/';
      },
    });
  };
  
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-border" />
      </div>
    );
  }
  
  if (!user || !user.isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="p-6 max-w-md mx-auto">
          <h1 className="text-xl font-bold mb-4">Not Authorized</h1>
          <p className="mb-4">You must be logged in as an admin to view this page.</p>
          <Button onClick={() => window.location.href = '/login'}>
            Go to Login
          </Button>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="p-6 min-h-screen">
      <Card className="p-6 max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Admin Dashboard (Backup Version)</h1>
          <Button variant="outline" onClick={handleLogout}>
            Logout
          </Button>
        </div>
        
        <p className="mb-4">
          You are currently viewing a simplified version of the admin dashboard.
          This version is designed to work in any environment, even when routing fails.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <Card className="p-4 hover:bg-accent cursor-pointer" 
                onClick={() => window.location.href = '/admin'}>
            <h2 className="font-semibold mb-2">Standard Admin Dashboard</h2>
            <p className="text-sm text-muted-foreground">
              Go to the full-featured admin dashboard
            </p>
          </Card>
          
          <Card className="p-4 hover:bg-accent cursor-pointer"
                onClick={() => window.location.href = '/'}>
            <h2 className="font-semibold mb-2">Website Home</h2>
            <p className="text-sm text-muted-foreground">
              Return to the main website
            </p>
          </Card>
        </div>
      </Card>
    </div>
  );
}