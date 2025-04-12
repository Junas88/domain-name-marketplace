
import { useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Loader2 } from 'lucide-react';
import AdminPage from './AdminPage';

export default function AdminDashboard() {
  const { user, isLoading } = useAuth();

  useEffect(() => {
    // Simple authentication check
    if (!isLoading && (!user || !user.isAdmin)) {
      console.log("Not authenticated as admin, redirecting to login");
      window.location.href = '/login';
    }
  }, [user, isLoading]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-black mb-4" />
        <p className="text-lg font-medium">Loading dashboard...</p>
      </div>
    );
  }

  // Don't render anything if not admin
  if (!user?.isAdmin) {
    return null;
  }

  // Render admin page if authenticated
  return <AdminPage />;
}
