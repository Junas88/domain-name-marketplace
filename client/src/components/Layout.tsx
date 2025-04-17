import { ReactNode, useEffect } from "react";
import Header from "./Header";
import Footer from "./Footer";
import { ForceRefreshButton } from "./ForceRefreshButton";
import { useLocation } from 'wouter';
import { useToast } from "@/hooks/use-toast";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { toast } = useToast();
  const [location] = useLocation();
  
  // Check if we're coming back from a force refresh
  useEffect(() => {
    // Get search params from the current URL
    const params = new URLSearchParams(window.location.search);
    if (params.get('refresh') === 'true') {
      toast({
        title: "Data Refreshed",
        description: "The latest data has been loaded from our servers.",
        duration: 3000,
      });
      
      // Clear the refresh parameter from URL without reloading
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
    }
  }, [location, toast]);
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
      
      {/* Add the force refresh button for all views */}
      <ForceRefreshButton />
    </div>
  );
}