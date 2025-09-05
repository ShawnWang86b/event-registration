import type { Metadata } from "next";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { QueryProvider } from "@/components/providers/query-provider";
import { Toaster } from "@/components/ui/sonner";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import { OfflineIndicator } from "@/components/OfflineIndicator";

export const metadata: Metadata = {
  title: "Event Registration",
  description: "Event Registration System for Melbourne Old Boys Hoops",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "EventReg",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: "Event Registration",
    title: {
      default: "Event Registration",
      template: "%s - Event Registration",
    },
    description:
      "Discover and register for basketball events with calendar view and registration management",
  },
  keywords: [
    "events",
    "basketball",
    "registration",
    "calendar",
    "sports",
    "Melbourne Old Boys Hoops",
  ],
};

export const viewport = {
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
        />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Old Boy" />
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="apple-touch-icon" href="/web-app-manifest-192x192.png" />
        <link rel="icon" href="/web-app-manifest-192x192.png" />
      </head>
      <body>
        <ClerkProvider>
          <QueryProvider>
            <SidebarProvider>
              <AppSidebar />
              <SidebarTrigger />
              <main>{children}</main>
            </SidebarProvider>
          </QueryProvider>
          <Toaster />
          <PWAInstallPrompt />
          <OfflineIndicator />
        </ClerkProvider>
      </body>
    </html>
  );
}
