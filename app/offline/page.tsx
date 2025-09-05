"use client";

import { Button } from "@/components/ui/button";
import { WifiOff, RefreshCw } from "lucide-react";

export default function OfflinePage() {
  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md mx-auto text-center p-8">
        <div className="mb-6">
          <WifiOff className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">
            You&apos;re Offline
          </h1>
          <p className="text-muted-foreground">
            It looks like you&apos;ve lost your internet connection. Don&apos;t
            worry, you can still browse previously loaded content.
          </p>
        </div>

        <div className="space-y-4">
          <Button onClick={handleRetry} className="w-full">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>

          <div className="text-sm text-muted-foreground">
            <p>While offline, you can:</p>
            <ul className="mt-2 space-y-1">
              <li>• View previously loaded events</li>
              <li>• Browse your account information</li>
              <li>• Access cached content</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
