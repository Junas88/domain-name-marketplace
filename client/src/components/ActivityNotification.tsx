import { useEffect, useState } from "react";
import { X, CheckCircle } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Domain } from "@shared/schema";

interface ActivityNotification {
  type: "offer" | "view" | "sold";
  domain: string;
  timeAgo: string;
}

// Use actual domains from our portfolio for notifications
const portfolioDomains: ActivityNotification[] = [
  { type: "offer", domain: "zoneplumbing.com", timeAgo: "2 minutes ago" },
  { type: "view", domain: "web3ton.com", timeAgo: "just now" },
  { type: "offer", domain: "xfloki.com", timeAgo: "3 minutes ago" },
  { type: "view", domain: "willevent.com", timeAgo: "just now" },
  { type: "offer", domain: "worldjoker.com", timeAgo: "1 minute ago" },
  { type: "view", domain: "webgrafic.com", timeAgo: "just now" },
  { type: "offer", domain: "waxhawplumber.com", timeAgo: "4 minutes ago" },
  { type: "view", domain: "wedelo.com", timeAgo: "1 minute ago" },
];

export default function ActivityNotification() {
  const [isVisible, setIsVisible] = useState(false);
  const [currentNotification, setCurrentNotification] = useState<ActivityNotification | null>(null);
  const [isInitialDelay, setIsInitialDelay] = useState(true);
  const [liveNotifications, setLiveNotifications] = useState<ActivityNotification[]>([]);

  // Fetch recently sold domains
  const { data: recentlySoldDomains } = useQuery<Domain[]>({
    queryKey: ["/api/domains/recently-sold"],
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Fetch all domains and subscribe to them for real-time updates
  const { data: allDomains } = useQuery<Domain[]>({
    queryKey: ["/api/domains"],
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Initialize notifications with only offer and view types
  useEffect(() => {
    // Only use offer and view notifications (no sold ones)
    const filteredNotifications = portfolioDomains.filter(n => n.type !== "sold");
    console.log("Setting up activity notifications (without sold domains)");
    setLiveNotifications(filteredNotifications);
  }, []);

  // Subscribe to domain status changes - keeping only for future extensions
  useEffect(() => {
    // Setup subscription for domain changes
    const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
      // We're no longer processing sold domains, but keeping the subscription
      // mechanism in place for future extensions if needed
      if (event.type === 'updated' && event.query.queryKey[0] === '/api/domains') {
        // Could add dynamic notification updates here in the future
        console.log("Domain data updated, no changes to notifications needed");
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    // Add initial delay before showing first notification
    const initialTimer = setTimeout(() => {
      setIsInitialDelay(false);
    }, 5000); // 5 seconds initial delay

    return () => clearTimeout(initialTimer);
  }, []);

  useEffect(() => {
    if (isInitialDelay || liveNotifications.length === 0) return;

    // Function to show a random notification
    const showRandomNotification = () => {
      // Get a random notification from our live notifications
      const randomIndex = Math.floor(Math.random() * liveNotifications.length);
      setCurrentNotification(liveNotifications[randomIndex]);
      setIsVisible(true);

      // Auto-hide after 5 seconds
      setTimeout(() => {
        setIsVisible(false);
      }, 5000);
    };

    // Show a notification immediately
    showRandomNotification();

    // Set up interval to show notifications periodically (between 20-40 seconds)
    const randomInterval = 20000 + Math.floor(Math.random() * 20000);
    const intervalId = setInterval(showRandomNotification, randomInterval);

    return () => clearInterval(intervalId);
  }, [isInitialDelay, liveNotifications]);

  const handleClose = () => {
    setIsVisible(false);
  };

  if (!currentNotification) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-4 left-4 z-50 max-w-xs bg-white rounded-lg shadow-lg border border-gray-200 p-3"
        >
          <div className="flex items-center">
            <div className="flex-shrink-0 mr-2">
              {currentNotification.type === "offer" && (
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                  </svg>
                </div>
              )}

              {currentNotification.type === "view" && (
                <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-500">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                </div>
              )}
            </div>

            <div className="flex-1">
              <p className="text-xs font-medium text-gray-900">
                {currentNotification.type === "offer" ? "New offer" : "New visitor"}: 
                <span className="font-semibold ml-1">{currentNotification.domain}</span>
                <span className="text-xs text-gray-400 ml-1">• {currentNotification.timeAgo}</span>
              </p>
            </div>

            <button
              onClick={handleClose}
              className="ml-2 inline-flex text-gray-400 hover:text-gray-500 focus:outline-none"
              aria-label="Close notification"
            >
              <X size={14} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}