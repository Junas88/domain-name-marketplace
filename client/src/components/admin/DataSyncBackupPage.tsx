import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertCircle,
  ArrowLeft,
  Database,
  Download,
  FileDown,
  FileUp,
  HardDrive,
  Info,
  Upload,
  RefreshCw,
  ShieldAlert,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Save,
  Loader2,
  LogOut,
  Home
} from "lucide-react";
import BackupRestore from "./BackupRestore";
import ForceSync from "./ForceSync";

export default function DataSyncBackupPage() {
  const { user, isLoading, logoutMutation } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("backup");
  const isAdmin = user?.isAdmin;

  // Redirect non-admin users
  useEffect(() => {
    if (!isLoading && !isAdmin) {
      console.log("Not authenticated as admin, redirecting to login page");
      window.location.href = "/auth";
    }
  }, [isLoading, isAdmin]);

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
          <p className="text-sm text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-6xl">
      <header className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-black mb-2">Data Sync & Backup Management</h1>
          <p className="text-gray-500">
            Create backups, restore data, and synchronize your database across environments
          </p>
        </div>
        <div className="flex gap-2 mt-4 md:mt-0">
          <Button
            variant="outline"
            size="sm"
            className="border-black"
            onClick={() => window.location.href = "/admin"}
          >
            <Home className="h-4 w-4 mr-2" />
            Admin Dashboard
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            className="border-black" 
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <Alert className="mb-6 bg-amber-50 border-amber-200">
        <AlertTriangle className="h-4 w-4 text-amber-600" />
        <AlertTitle className="text-amber-800">Important: Backup Before Making Changes</AlertTitle>
        <AlertDescription className="text-amber-700">
          Always download a backup before making significant changes to your website. 
          Backups can be restored if issues occur during updates or data migrations.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="border rounded-md bg-white p-4">
          <div className="mb-2 text-sm font-medium text-green-800">Complete Backup</div>
          
          <div className="flex items-center mb-2">
            <Download className="mr-2 h-5 w-5 text-green-600" />
            <h3 className="text-xl font-bold">1-Click Export</h3>
          </div>
          
          <p className="text-sm text-gray-600 mb-4">
            Export all your website data for safekeeping
          </p>
          
          <Button 
            className="w-full bg-green-600 hover:bg-green-700 h-9 px-3" 
            size="sm"
            asChild
          >
            <a href="/api/admin/backup" download="domain-guide-backup.json">
              Download Full Backup
            </a>
          </Button>
        </div>

        <div className="border rounded-md bg-white p-4">
          <div className="mb-2 text-sm font-medium text-blue-800">Restore Data</div>
          
          <div className="flex items-center mb-2">
            <Upload className="mr-2 h-5 w-5 text-blue-600" />
            <h3 className="text-xl font-bold">Recovery</h3>
          </div>
          
          <p className="text-sm text-gray-600 mb-4">
            Restore your website from a previous backup
          </p>
          
          <BackupRestore />
        </div>

        <div className="border rounded-md bg-white p-4">
          <div className="mb-2 text-sm font-medium text-purple-800">Force Refresh</div>
          
          <div className="flex items-center mb-2">
            <RefreshCw className="mr-2 h-5 w-5 text-purple-600" />
            <h3 className="text-xl font-bold">Clear Cache</h3>
          </div>
          
          <p className="text-sm text-gray-600 mb-4">
            Force client-side data refresh when changes aren't showing
          </p>
          
          <ForceSync />
        </div>
      </div>

      <Tabs defaultValue="backup" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="backup">Backup & Restore</TabsTrigger>
          <TabsTrigger value="sync">Data Synchronization</TabsTrigger>
          <TabsTrigger value="best-practices">Best Practices</TabsTrigger>
        </TabsList>

        <TabsContent value="backup" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border rounded-md p-4">
              <h3 className="text-base font-medium mb-3 flex items-center">
                <CheckCircle2 className="h-4 w-4 text-green-600 mr-2" />
                What Gets Backed Up
              </h3>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="border rounded p-2">
                  <span className="text-sm font-medium block mb-1">Domain Listings</span>
                  <span className="text-xs text-gray-600">Names, descriptions, prices, status</span>
                </div>
                
                <div className="border rounded p-2">
                  <span className="text-sm font-medium block mb-1">Page Content</span>
                  <span className="text-xs text-gray-600">All website pages and sections</span>
                </div>
                
                <div className="border rounded p-2">
                  <span className="text-sm font-medium block mb-1">SEO Settings</span>
                  <span className="text-xs text-gray-600">Title, description, meta tags</span>
                </div>
                
                <div className="border rounded p-2">
                  <span className="text-sm font-medium block mb-1">User Data</span>
                  <span className="text-xs text-gray-600">Inquiries, offers, subscriptions</span>
                </div>
              </div>
              
              <div className="mt-3 text-xs text-blue-600 bg-blue-50 p-2 rounded border border-blue-100">
                Backups create a complete snapshot of all your website's data - nothing is left out
              </div>
            </div>

            <div className="border rounded-md p-4">
              <h3 className="text-base font-medium mb-3 flex items-center">
                <Clock className="h-4 w-4 text-blue-600 mr-2" />
                Backup Strategy
              </h3>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <div className="bg-amber-50 text-amber-700 p-1 rounded">
                    <ShieldAlert className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <span className="font-medium text-sm">Before Changes</span>
                    <p className="text-xs text-gray-600">Always backup before importing domains or updating content</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <div className="bg-green-50 text-green-700 p-1 rounded">
                    <HardDrive className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <span className="font-medium text-sm">Multiple Locations</span>
                    <p className="text-xs text-gray-600">Store backups in more than one secure location</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <div className="bg-blue-50 text-blue-700 p-1 rounded">
                    <FileDown className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <span className="font-medium text-sm">Version Control</span>
                    <p className="text-xs text-gray-600">Use dates in filenames for multiple versions</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-3 text-xs flex items-center gap-1">
                <Info className="h-3.5 w-3.5 text-gray-500" />
                <span className="text-gray-600">Weekly backups recommended for best protection</span>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="sync" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border rounded-md p-4">
              <h3 className="text-base font-medium mb-3 flex items-center">
                <RefreshCw className="h-4 w-4 text-purple-600 mr-2" />
                Force Data Sync
              </h3>
              
              <div className="mb-4">
                <div className="bg-purple-50 border border-purple-100 p-3 rounded-md mb-4">
                  <p className="text-sm text-purple-800">
                    <strong>When to use:</strong> If domain prices or availability aren't showing correctly in the frontend despite being updated in the admin panel.
                  </p>
                </div>
                
                <div className="bg-gray-50 p-3 rounded-md text-xs text-gray-700 mb-4">
                  This tool bypasses browser cache and forces a refresh of all domain data from the database. Use when changes to domain prices aren't showing properly.
                </div>
                
                <ForceSync />
              </div>
            </div>
            
            <div className="border rounded-md p-4">
              <h3 className="text-base font-medium mb-3 flex items-center">
                <HardDrive className="h-4 w-4 text-blue-600 mr-2" />
                Production Deployment Sync
              </h3>
              
              <div className="mb-4">
                <div className="bg-blue-50 border border-blue-100 p-3 rounded-md mb-4">
                  <p className="text-sm text-blue-800">
                    <strong>When to use:</strong> When deploying to a new environment or syncing development and production databases.
                  </p>
                </div>
                
                <div className="flex gap-2 mb-4">
                  <div className="flex-1 border border-gray-200 rounded-md p-2">
                    <span className="text-xs font-medium block mb-1 text-gray-600">Step 1</span>
                    <span className="text-sm">Download backup from source environment</span>
                  </div>
                  
                  <div className="flex-1 border border-gray-200 rounded-md p-2">
                    <span className="text-xs font-medium block mb-1 text-gray-600">Step 2</span>
                    <span className="text-sm">Restore backup in target environment</span>
                  </div>
                </div>
                
                <Button className="w-full" size="sm" asChild>
                  <a href="/api/admin/backup" download="domain-guide-production-backup.json">
                    <Download className="mr-2 h-4 w-4" />
                    Download Production Backup
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="best-practices" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border rounded-md p-4">
              <h3 className="text-base font-medium mb-3 flex items-center text-amber-800">
                <AlertTriangle className="h-4 w-4 text-amber-600 mr-2" />
                Common Issues to Avoid
              </h3>
              
              <ul className="space-y-1.5">
                <li className="flex gap-1.5 text-sm">
                  <span className="text-amber-600">•</span>
                  <span>Deleting domain records referenced elsewhere</span>
                </li>
                <li className="flex gap-1.5 text-sm">
                  <span className="text-amber-600">•</span>
                  <span>Uploading malformed JSON files during restore</span>
                </li>
                <li className="flex gap-1.5 text-sm">
                  <span className="text-amber-600">•</span>
                  <span>Ignoring database errors or warnings</span>
                </li>
                <li className="flex gap-1.5 text-sm">
                  <span className="text-amber-600">•</span>
                  <span>Operating without recent backups</span>
                </li>
                <li className="flex gap-1.5 text-sm">
                  <span className="text-amber-600">•</span>
                  <span>Making bulk changes without testing first</span>
                </li>
              </ul>
            </div>
            
            <div className="border rounded-md p-4">
              <h3 className="text-base font-medium mb-3 flex items-center text-blue-800">
                <Save className="h-4 w-4 text-blue-600 mr-2" />
                Backup Success Checklist
              </h3>
              
              <div className="space-y-2">
                <div className="flex items-center text-sm">
                  <div className="h-5 w-5 rounded border border-blue-200 bg-blue-50 flex items-center justify-center mr-2 text-blue-600">1</div>
                  <span>Verify download completed successfully</span>
                </div>
                <div className="flex items-center text-sm">
                  <div className="h-5 w-5 rounded border border-blue-200 bg-blue-50 flex items-center justify-center mr-2 text-blue-600">2</div>
                  <span>Check backup file size is reasonable (not 0KB)</span>
                </div>
                <div className="flex items-center text-sm">
                  <div className="h-5 w-5 rounded border border-blue-200 bg-blue-50 flex items-center justify-center mr-2 text-blue-600">3</div>
                  <span>Spot-check file contents for expected data</span>
                </div>
                <div className="flex items-center text-sm">
                  <div className="h-5 w-5 rounded border border-blue-200 bg-blue-50 flex items-center justify-center mr-2 text-blue-600">4</div>
                  <span>Store in a secure location with proper naming</span>
                </div>
                <div className="flex items-center text-sm">
                  <div className="h-5 w-5 rounded border border-blue-200 bg-blue-50 flex items-center justify-center mr-2 text-blue-600">5</div>
                  <span>Test restore process periodically</span>
                </div>
              </div>
            </div>
            
            <div className="border rounded-md p-4">
              <h3 className="text-base font-medium mb-3 flex items-center text-green-800">
                <CheckCircle2 className="h-4 w-4 text-green-600 mr-2" />
                Performance Optimization
              </h3>
              
              <div className="grid grid-cols-2 gap-2">
                <div className="border border-green-100 bg-green-50 rounded-md p-2">
                  <span className="text-xs font-medium text-green-800">Regular cleanup</span>
                  <p className="text-xs text-green-700 mt-1">Clean up old or unused domain listings</p>
                </div>
                <div className="border border-green-100 bg-green-50 rounded-md p-2">
                  <span className="text-xs font-medium text-green-800">Data efficiency</span>
                  <p className="text-xs text-green-700 mt-1">Only store necessary data in each record</p>
                </div>
                <div className="border border-green-100 bg-green-50 rounded-md p-2">
                  <span className="text-xs font-medium text-green-800">Appropriate types</span>
                  <p className="text-xs text-green-700 mt-1">Use correct data types for each field</p>
                </div>
                <div className="border border-green-100 bg-green-50 rounded-md p-2">
                  <span className="text-xs font-medium text-green-800">Size limits</span>
                  <p className="text-xs text-green-700 mt-1">Avoid extremely large text fields</p>
                </div>
              </div>
            </div>
            
            <div className="border rounded-md p-4">
              <h3 className="text-base font-medium mb-3 flex items-center text-gray-800">
                <Info className="h-4 w-4 text-gray-600 mr-2" />
                When to Contact Support
              </h3>
              
              <div className="bg-gray-50 border border-gray-100 rounded-md p-3">
                <ul className="space-y-1.5 text-sm">
                  <li className="flex gap-1.5">
                    <span className="text-gray-400">•</span>
                    <span>Database or backup restoration errors</span>
                  </li>
                  <li className="flex gap-1.5">
                    <span className="text-gray-400">•</span>
                    <span>Unexpected data loss despite backups</span>
                  </li>
                  <li className="flex gap-1.5">
                    <span className="text-gray-400">•</span>
                    <span>Significant performance degradation</span>
                  </li>
                  <li className="flex gap-1.5">
                    <span className="text-gray-400">•</span>
                    <span>Need for advanced database operations</span>
                  </li>
                </ul>
              </div>
              
              <div className="mt-2 text-xs text-gray-500 flex items-center">
                <AlertCircle className="h-3 w-3 mr-1" />
                <span>Support available at support@domainguide.com</span>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}