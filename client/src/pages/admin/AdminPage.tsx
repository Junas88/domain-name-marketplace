import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Loader2, LogOut } from "lucide-react";
import { Domain } from "@/lib/types";

// This is an extremely simplified version of the admin dashboard
// that focuses only on making sure authentication/redirects work properly
export default function AdminPage() {
  const { user, isLoading, logoutMutation } = useAuth();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const { toast } = useToast();
  const [, navigate] = useLocation();
  
  // Auth check - redirect to login if not admin
  useEffect(() => {
    if (!isLoading && (!user || !user.isAdmin)) {
      console.log("Not authenticated as admin, redirecting to login page");
      setIsRedirecting(true);
      
      setTimeout(() => {
        window.location.href = "/login";
      }, 300);
    }
  }, [user, isLoading]);
  
  // Fetch domains - just as a simple test query
  const { data: domains = [] } = useQuery<Domain[]>({
    queryKey: ['/api/domains'],
    enabled: !!user?.isAdmin, // Only run query if user is admin
  });
  
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
          <p className="text-gray-600">Manage your domain listings, track offers, and monitor website stats</p>
        </div>
        <Button 
          variant="outline" 
          className="mt-4 md:mt-0 border-black" 
          onClick={() => {
            logoutMutation.mutate(undefined, {
              onSuccess: () => {
                navigate('/');
              }
            });
          }}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Domain Count</CardTitle>
            <CardDescription>Total domains in the database</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{domains.length}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Authentication Status</CardTitle>
            <CardDescription>Current authentication state</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Logged in as: <strong>{user.username}</strong></p>
            <p className="text-green-600 font-medium">Admin Access: ✓</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Admin Dashboard</CardTitle>
            <CardDescription>
              The full dashboard is available through the original dashboard component.
              This is a simplified version to ensure reliable authentication.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>This simplified admin view confirms your admin credentials are working properly.</p>
            <Button
              onClick={() => {
                toast({
                  title: "Authentication Verified",
                  description: "Your admin credentials are valid and working properly.",
                });
              }}
              className="mt-4 bg-black text-white hover:bg-gray-800"
            >
              Verify Authentication
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}