
import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import AdminPage from "./AdminPage";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    if (!isLoading && (!user || !user.isAdmin)) {
      console.log("Not authenticated as admin, redirecting to login");
      setIsRedirecting(true);
      navigate("/login", { replace: true });
      return;
    }

    if (!isLoading && user?.isAdmin) {
      setIsRedirecting(false);
      console.log("Admin authenticated successfully");
    }
  }, [user, isLoading, navigate]);

  // Show loading state while auth is being checked or during redirect
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

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-black mb-4" />
        <p className="text-lg font-medium">Loading dashboard...</p>
      </div>
    );
  }

  if (!user?.isAdmin) {
    return null;
  }

  return <AdminPage />;
}
