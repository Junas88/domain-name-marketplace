import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

// Simple static component that won't cause any redirect loops
export default function SimpleAdminDashboard() {
  const { user, isLoading } = useAuth();
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Simple initialization flag to prevent loops
  useEffect(() => {
    if (!isInitialized) {
      setIsInitialized(true);
      // Never redirect, just show a message if not authorized
    }
  }, [isInitialized]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-black mb-4" />
        <p className="text-lg font-medium">Loading dashboard...</p>
      </div>
    );
  }
  
  // Show unauthorized message if not admin
  if (!user?.isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h2 className="text-2xl font-bold mb-4">Admin Access Required</h2>
        <p className="mb-4">You need admin privileges to view this page.</p>
        <Button onClick={() => window.location.href = "/auth"}>
          Go to Login
        </Button>
      </div>
    );
  }

  // Use direct links for admin actions to avoid any SPA routing issues
  return (
    <div className="container mx-auto p-4 md:p-6">
      <header className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-black">Admin Dashboard</h1>
          <p className="text-gray-600 mb-4">Domain Name Guide Admin Access</p>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Admin Actions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <p>Click one of the buttons below to access admin features:</p>
            
            <div className="flex flex-wrap gap-4">
              <Button 
                className="bg-black hover:bg-gray-800" 
                onClick={() => {
                  window.location.href = "/admin?page=domains";
                }}
              >
                Manage Domains
              </Button>
              
              <Button 
                className="bg-black hover:bg-gray-800"
                onClick={() => {
                  window.location.href = "/admin?page=content"; 
                }}
              >
                Edit Website Content
              </Button>
              
              <Button 
                className="bg-black hover:bg-gray-800"
                onClick={() => {
                  window.location.href = "/admin?page=seo";
                }}
              >
                Manage SEO Settings
              </Button>
              
              <Button 
                className="bg-black hover:bg-gray-800"
                onClick={() => {
                  window.location.href = "/admin?page=consultations";
                }}
              >
                View Consultations
              </Button>
              
              <Button 
                variant="outline"
                className="border-black"
                onClick={() => {
                  window.location.href = "/";
                }}
              >
                Return to Homepage
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}