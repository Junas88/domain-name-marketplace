import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LogOut, Database, RefreshCw, Download, Upload } from 'lucide-react';
import BackupRestore from './BackupRestore';
import ForceSync from './ForceSync';

export default function DataSyncBackupPage() {
  const { user, isLoading, logoutMutation } = useAuth();
  const [isRedirecting, setIsRedirecting] = useState(false);
  
  // Simple admin check with redirect
  useEffect(() => {
    if (!isLoading && (!user || !user.isAdmin)) {
      console.log("Not authenticated as admin, redirecting to login page");
      setIsRedirecting(true);
      
      setTimeout(() => {
        window.location.href = "/login";
      }, 300);
    }
  }, [user, isLoading]);

  // Check if user is admin
  const isAdmin = !!user?.isAdmin;
  
  if (isLoading || isRedirecting) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            <h1 className="text-2xl font-bold">Loading...</h1>
          </div>
        </div>
      </div>
    );
  }
  
  if (!isAdmin) {
    return null;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Data Synchronization & Backup</h1>
        <div className="flex items-center gap-4">
          <span className="text-muted-foreground text-sm">Logged in as <span className="font-medium">{user?.username}</span></span>
          <Button variant="outline" size="sm" onClick={() => logoutMutation.mutate()} className="flex items-center gap-2">
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Database className="h-5 w-5 mr-2" />
            Domain Data Management
          </CardTitle>
          <CardDescription>
            Tools to ensure data consistency and create backups
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-sm text-muted-foreground">
            These tools help you maintain data consistency across environments and create backups 
            of your domain data. Use the Force Sync feature if prices aren't updating correctly
            in production, and use the Backup & Restore feature to transfer data between environments.
          </p>
          
          <ForceSync />
          
          <BackupRestore />
        </CardContent>
      </Card>
      
      <div className="mt-8 flex justify-end">
        <Button variant="outline" onClick={() => window.history.back()}>
          Back to Admin Dashboard
        </Button>
      </div>
    </div>
  );
}