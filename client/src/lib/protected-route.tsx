import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Redirect, Route } from "wouter";

export function ProtectedRoute({
  path,
  component: Component,
}: {
  path: string;
  component: React.ComponentType<any>;
}) {
  const { user, isLoading } = useAuth();
  
  // Add console logging to debug the route protection
  console.log("Protected route:", path);
  console.log("Auth state:", { isLoading, isAuthenticated: !!user, isAdmin: user?.isAdmin });

  return (
    <Route path={path}>
      {(params) => {
        // Check authentication on render (after state updates)
        if (isLoading) {
          return (
            <div className="flex items-center justify-center min-h-screen">
              <Loader2 className="h-8 w-8 animate-spin text-border" />
            </div>
          );
        }
        
        if (!user || !user.isAdmin) {
          console.log("User not authenticated or not admin, redirecting to login");
          return <Redirect to="/login" />;
        }
        
        console.log("Rendering protected component for path:", path);
        // User is authenticated and admin, render the component
        return <Component params={params} />;
      }}
    </Route>
  );
}