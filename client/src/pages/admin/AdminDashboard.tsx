// This is a direct copy of the admin component, to avoid redirect loops
// It's safer to duplicate the component than to use redirects in production

import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Loader2, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TabsList, TabsTrigger, Tabs, TabsContent } from "@/components/ui/tabs";

// Define type for the domain stats
type DomainStats = {
  totalDomains: number;
  soldDomains: number;
  totalViews: number;
  domainsByCategory: Record<string, number>;
  totalRevenue: number;
  averagePrice: number;
};

// Simple dashboard that just shows key metrics
export default function AdminDashboard() {
  const { user, isLoading, logoutMutation } = useAuth();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [, navigate] = useLocation();
  
  // Fetch domain stats 
  const { data: stats = { 
    totalDomains: 0, 
    soldDomains: 0, 
    totalViews: 0,
    domainsByCategory: {},
    totalRevenue: 0,
    averagePrice: 0
  } } = useQuery<DomainStats>({
    queryKey: ['/api/admin/domains/stats'],
    enabled: !!user?.isAdmin,
  });

  // Auth check - redirect to login if not admin
  useEffect(() => {
    if (!isLoading && (!user || !user.isAdmin)) {
      console.log("Not authenticated as admin, redirecting to login page");
      setIsRedirecting(true);
      
      setTimeout(() => {
        window.location.href = "/auth";
      }, 300);
    }
  }, [user, isLoading, navigate]);

  // Show loading state
  if (isLoading || isRedirecting) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-black mb-4" />
        <p className="text-lg font-medium">
          {isRedirecting ? "Redirecting to login..." : "Loading dashboard..."}
        </p>
      </div>
    );
  }
  
  // Don't render anything if not admin
  if (!user?.isAdmin) {
    return null;
  }

  return (
    <div className="container mx-auto p-4 md:p-6">
      <header className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-black">Admin Dashboard</h1>
          <p className="text-gray-600">View a simplified version of the admin dashboard</p>
        </div>
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            onClick={() => {
              // Force full page reload to avoid any SPA routing issues
              window.location.href = "/admin?full=true";
            }}
          >
            View Complete Dashboard
          </Button>
          <Button 
            variant="outline" 
            className="border-black" 
            onClick={() => {
              logoutMutation.mutate(undefined, {
                onSuccess: () => {
                  window.location.href = '/';
                }
              });
            }}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Domains</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalDomains}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Domains Sold</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.soldDomains}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Views</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalViews}</div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">${stats.totalRevenue.toLocaleString()}</div>
            <div className="text-sm text-gray-500 mt-1">From sold domains</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Average Price</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">${stats.averagePrice.toLocaleString()}</div>
            <div className="text-sm text-gray-500 mt-1">Per domain</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Conversion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.soldDomains > 0 ? ((stats.soldDomains / stats.totalDomains) * 100).toFixed(1) : "0"}%</div>
            <div className="text-sm text-gray-500 mt-1">Domains sold / total domains</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="go-to-main">
        <TabsList className="grid w-full grid-cols-1 mb-6">
          <TabsTrigger value="go-to-main">
            Go to Full Dashboard
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="go-to-main" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Simplified View</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">For the full admin experience, please click the button below:</p>
              <Button 
                onClick={() => {
                  // Force full page reload to avoid any SPA routing issues
                  window.location.href = "/admin?full=true";
                }}
              >
                Go to Full Dashboard
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}