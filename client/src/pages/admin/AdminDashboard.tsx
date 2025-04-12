// Simple redirect component for the admin dashboard
// This is a safety measure to ensure consistent navigation across all deployments

import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export default function AdminDashboard() {
  useEffect(() => {
    // This is a direct, simplified approach to avoid redirect loops
    // We'll use the simplest possible path that works reliably
    
    // Set a flag in sessionStorage to prevent redirect loops
    const hasRedirected = sessionStorage.getItem('adminRedirected');
    if (hasRedirected) {
      // We've already attempted a redirect, don't try again
      console.log("Already attempted redirect, avoiding loop");
      return;
    }
    
    // Set the flag to prevent future redirects
    sessionStorage.setItem('adminRedirected', 'true');
    
    // Clear the flag after 5 seconds so future navigations work properly
    setTimeout(() => {
      sessionStorage.removeItem('adminRedirected');
    }, 5000);
    
    // Simple, reliable redirect to the base admin page
    // This works in all environments without path structure issues
    console.log("Redirecting to simplified admin path");
    window.location.href = '/admin';
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <Loader2 className="h-8 w-8 animate-spin text-black mb-4" />
      <p className="text-lg font-medium">
        Loading admin dashboard...
      </p>
    </div>
  );
}