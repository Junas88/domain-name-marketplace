/**
 * Universal Admin Dashboard Redirect Component
 * This component ensures consistent navigation across all environments
 * It works in development, preview, and production deployments
 */

import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

export default function AdminDashboard() {
  const { user, isLoading } = useAuth();
  
  useEffect(() => {
    // Authentication check - don't redirect to admin if not authenticated
    if (!isLoading) {
      if (!user || !user.isAdmin) {
        // Not authenticated as admin, redirect to login
        console.log("Not authenticated as admin, redirecting to login");
        
        // Set loop prevention flag
        if (!sessionStorage.getItem('redirectingToLogin')) {
          sessionStorage.setItem('redirectingToLogin', 'true');
          
          // Clear flag after delay
          setTimeout(() => {
            sessionStorage.removeItem('redirectingToLogin');
          }, 3000);
          
          // Force hard navigation to login
          window.location.href = '/login';
        }
        return;
      }
    }
    
    // Admin redirection logic with loop prevention
    const hasRedirected = sessionStorage.getItem('adminRedirected');
    if (hasRedirected) {
      console.log("Already attempted redirect, avoiding loop");
      return;
    }
    
    // Set the flag to prevent future redirects
    sessionStorage.setItem('adminRedirected', 'true');
    
    // Clear the flag after delay
    setTimeout(() => {
      sessionStorage.removeItem('adminRedirected');
    }, 3000);
    
    // Production-safe redirect that works in all environments
    console.log("Redirecting to universal admin path");
    window.location.href = '/admin';
  }, [user, isLoading]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <Loader2 className="h-8 w-8 animate-spin text-black mb-4" />
      <p className="text-lg font-medium">
        {!user ? "Checking authentication..." : "Loading admin dashboard..."}
      </p>
    </div>
  );
}