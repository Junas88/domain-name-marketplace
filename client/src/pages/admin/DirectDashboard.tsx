import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import AdminDashboard from "./Dashboard";

// This is a direct-access dashboard that doesn't rely on React Router
export default function DirectDashboard() {
  const { user, isLoading } = useAuth();
  const [isRedirecting, setIsRedirecting] = useState(false);
  
  // Authentication check
  useEffect(() => {
    if (!isLoading && (!user || !user.isAdmin)) {
      console.log("Not authenticated as admin, redirecting to login...");
      setIsRedirecting(true);
      
      // Force navigation to login page
      setTimeout(() => {
        window.location.href = "/login";
      }, 300);
    }
  }, [user, isLoading]);
  
  // Loading or redirecting state
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
  
  // Render dashboard only if authenticated as admin
  if (!user?.isAdmin) {
    return null;
  }
  
  // Simply use the full dashboard component
  return <AdminDashboard />;
}