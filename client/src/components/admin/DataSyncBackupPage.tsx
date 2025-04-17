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
        <Card className="border-green-100 shadow-sm">
          <CardHeader className="pb-2 border-b border-green-100">
            <CardTitle className="text-sm font-medium text-green-800">Complete Backup</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-3xl font-bold flex items-center">
              <Download className="mr-2 h-6 w-6 text-green-600" />
              <span>1-Click Export</span>
            </div>
            <p className="mt-2 text-sm text-gray-600">
              Export all your website data for safekeeping
            </p>
          </CardContent>
          <CardFooter>
            <Button className="w-full bg-green-600 hover:bg-green-700" asChild>
              <a href="/api/admin/backup" download="domain-guide-backup.json">
                Download Full Backup
              </a>
            </Button>
          </CardFooter>
        </Card>

        <Card className="border-blue-100 shadow-sm">
          <CardHeader className="pb-2 border-b border-blue-100">
            <CardTitle className="text-sm font-medium text-blue-800">Restore Data</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-3xl font-bold flex items-center">
              <Upload className="mr-2 h-6 w-6 text-blue-600" />
              <span>Recovery</span>
            </div>
            <p className="mt-2 text-sm text-gray-600">
              Restore your website from a previous backup
            </p>
          </CardContent>
          <CardFooter>
            <BackupRestore />
          </CardFooter>
        </Card>

        <Card className="border-purple-100 shadow-sm">
          <CardHeader className="pb-2 border-b border-purple-100">
            <CardTitle className="text-sm font-medium text-purple-800">Force Refresh</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-3xl font-bold flex items-center">
              <RefreshCw className="mr-2 h-6 w-6 text-purple-600" />
              <span>Clear Cache</span>
            </div>
            <p className="mt-2 text-sm text-gray-600">
              Force client-side data refresh when changes aren't showing
            </p>
          </CardContent>
          <CardFooter>
            <ForceSync />
          </CardFooter>
        </Card>
      </div>

      <Tabs defaultValue="backup" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="backup">Backup & Restore</TabsTrigger>
          <TabsTrigger value="sync">Data Synchronization</TabsTrigger>
          <TabsTrigger value="best-practices">Best Practices</TabsTrigger>
        </TabsList>

        <TabsContent value="backup" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>What Gets Backed Up</CardTitle>
                <CardDescription>
                  The backup system captures all essential data from your website
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                    <div>
                      <span className="font-medium">Domain Listings</span>
                      <p className="text-sm text-gray-500">All domain properties including names, descriptions, prices, and status</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                    <div>
                      <span className="font-medium">Page Content</span>
                      <p className="text-sm text-gray-500">All website pages content including homepage, about, guide and contact</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                    <div>
                      <span className="font-medium">SEO Settings</span>
                      <p className="text-sm text-gray-500">Title, description and meta tags for all pages</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                    <div>
                      <span className="font-medium">User Inquiries</span>
                      <p className="text-sm text-gray-500">Contact submissions and domain consultation requests</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                    <div>
                      <span className="font-medium">Email Subscriptions</span>
                      <p className="text-sm text-gray-500">Email list subscribers and ebook download information</p>
                    </div>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Backup Strategy</CardTitle>
                <CardDescription>
                  Recommended backup schedule and management
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <Clock className="h-5 w-5 text-blue-500 mr-2 mt-0.5" />
                    <div>
                      <span className="font-medium">Regular Schedule</span>
                      <p className="text-sm text-gray-500">Create weekly backups to protect against data loss</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <ShieldAlert className="h-5 w-5 text-blue-500 mr-2 mt-0.5" />
                    <div>
                      <span className="font-medium">Before Major Changes</span>
                      <p className="text-sm text-gray-500">Always backup before importing domains, changing settings, or updating pages</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <HardDrive className="h-5 w-5 text-blue-500 mr-2 mt-0.5" />
                    <div>
                      <span className="font-medium">Multiple Storage Locations</span>
                      <p className="text-sm text-gray-500">Store backups in more than one location (local drive, cloud storage)</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <FileDown className="h-5 w-5 text-blue-500 mr-2 mt-0.5" />
                    <div>
                      <span className="font-medium">Version Control</span>
                      <p className="text-sm text-gray-500">Use dates in filenames to maintain multiple versions</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <Info className="h-5 w-5 text-blue-500 mr-2 mt-0.5" />
                    <div>
                      <span className="font-medium">Documentation</span>
                      <p className="text-sm text-gray-500">Note major changes when creating backups for future reference</p>
                    </div>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sync" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Data Synchronization Tools</CardTitle>
              <CardDescription>
                Tools to ensure your website data is in sync across all environments
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="border rounded-md p-6">
                <h3 className="text-lg font-medium mb-4">Cache Management</h3>
                <p className="mb-4 text-gray-600">
                  If changes to domains or content aren't appearing on your site, you may need to force a client-side refresh.
                  This will clear all cached data and fetch fresh data from the server.
                </p>
                <div className="mt-4">
                  <ForceSync />
                </div>
              </div>
              
              <div className="border rounded-md p-6">
                <h3 className="text-lg font-medium mb-4">Production Deployment Sync</h3>
                <p className="mb-4 text-gray-600">
                  When deploying to production, you'll need to transfer your development database to the production environment.
                  Download a backup from development and restore it in production after deployment.
                </p>
                <div className="mt-4 space-y-2">
                  <Button className="w-full" asChild>
                    <a href="/api/admin/backup" download="domain-guide-production-backup.json">
                      <Download className="mr-2 h-4 w-4" />
                      Download Production Backup
                    </a>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="best-practices" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Database Maintenance Best Practices</CardTitle>
              <CardDescription>
                Guidelines for maintaining a healthy database and avoiding common issues
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="border rounded-md p-4">
                    <h3 className="font-medium mb-2 flex items-center">
                      <AlertTriangle className="h-4 w-4 text-amber-500 mr-2" />
                      Common Issues to Avoid
                    </h3>
                    <ul className="space-y-2 text-sm list-disc pl-5">
                      <li>Deleting domain records that are referenced elsewhere</li>
                      <li>Uploading malformed JSON files during restore</li>
                      <li>Ignoring database errors or warnings</li>
                      <li>Operating without recent backups</li>
                      <li>Making bulk changes without testing first</li>
                    </ul>
                  </div>
                  <div className="border rounded-md p-4">
                    <h3 className="font-medium mb-2 flex items-center">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                      Performance Optimization
                    </h3>
                    <ul className="space-y-2 text-sm list-disc pl-5">
                      <li>Regularly clean up old or unused domain listings</li>
                      <li>Only store necessary data in each record</li>
                      <li>Use appropriate data types for each field</li>
                      <li>Avoid extremely large text fields when possible</li>
                      <li>Monitor database performance periodically</li>
                    </ul>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="border rounded-md p-4">
                    <h3 className="font-medium mb-2 flex items-center">
                      <Save className="h-4 w-4 text-blue-500 mr-2" />
                      Backup Success Checklist
                    </h3>
                    <ul className="space-y-2 text-sm list-disc pl-5">
                      <li>Verify download completed successfully</li>
                      <li>Check backup file size is reasonable (not 0KB)</li>
                      <li>Spot-check file contents for expected data</li>
                      <li>Store in a secure location with proper naming</li>
                      <li>Test restore process periodically</li>
                    </ul>
                  </div>
                  <div className="border rounded-md p-4">
                    <h3 className="font-medium mb-2 flex items-center">
                      <Info className="h-4 w-4 text-gray-500 mr-2" />
                      When to Contact Support
                    </h3>
                    <ul className="space-y-2 text-sm list-disc pl-5">
                      <li>Database or backup restoration errors</li>
                      <li>Unexpected data loss despite backups</li>
                      <li>Significant performance degradation</li>
                      <li>Need for advanced database operations</li>
                      <li>Assistance with large data migrations</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}