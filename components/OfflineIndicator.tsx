"use client";

import { useState, useEffect } from "react";
import { WifiOff, Wifi } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export const OfflineIndicator = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [showOfflineMessage, setShowOfflineMessage] = useState(false);

  useEffect(() => {
    // Set initial online status
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      setShowOfflineMessage(false);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOfflineMessage(true);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Auto-hide offline message after 5 seconds when back online
  useEffect(() => {
    if (isOnline && showOfflineMessage) {
      const timer = setTimeout(() => {
        setShowOfflineMessage(false);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isOnline, showOfflineMessage]);

  if (!showOfflineMessage && isOnline) {
    return null;
  }

  return (
    <Card
      className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300 ${
        isOnline
          ? "bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800"
          : "bg-yellow-50 border-yellow-200 dark:bg-yellow-950 dark:border-yellow-800"
      }`}
    >
      <CardContent className="py-2 px-4">
        <div className="flex items-center gap-2">
          {isOnline ? (
            <>
              <Wifi className="h-4 w-4 text-green-600 dark:text-green-400" />
              <span className="text-sm font-medium text-green-800 dark:text-green-200">
                Back online
              </span>
            </>
          ) : (
            <>
              <WifiOff className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
              <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                You&apos;re offline
              </span>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
