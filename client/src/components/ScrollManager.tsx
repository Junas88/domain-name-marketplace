import { useEffect } from 'react';
import { useLocation } from 'wouter';

export function ScrollManager() {
  const [location] = useLocation();
  
  useEffect(() => {
    // Check if there's a hash in the current URL (e.g., /#domain-finder)
    if (window.location.hash) {
      const id = window.location.hash.substring(1); // Remove the # prefix
      const element = document.getElementById(id);
      
      if (element) {
        // Wait a bit for the page to fully render before scrolling
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    } else {
      // Scroll to top when navigating to a different page
      window.scrollTo(0, 0);
    }
  }, [location]);
  
  return null; // This component doesn't render anything
}