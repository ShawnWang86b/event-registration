import type { Metadata } from "next";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import {
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { QueryProvider } from "@/components/providers/query-provider";
import { Toaster } from "@/components/ui/sonner";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import { OfflineIndicator } from "@/components/OfflineIndicator";
import { ThemeProvider } from "next-themes";
import { NextIntlClientProvider } from "next-intl";
import { zhCN, enUS } from "@clerk/localizations";
import { cookies } from "next/headers";

export const metadata: Metadata = {
  title: "Melbourne Old Boys Hoops Event Registration",
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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Get the locale from cookies to determine Clerk localization
  const cookieStore = await cookies();
  const locale = cookieStore.get("locale")?.value || "en";

  // Conditionally set Clerk localization based on locale
  const clerkLocalization = locale === "cn" ? zhCN : enUS;

  return (
    <html lang={locale} suppressHydrationWarning>
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
        <NextIntlClientProvider>
          <ClerkProvider localization={clerkLocalization}>
            <QueryProvider>
              <ThemeProvider
                attribute="class"
                defaultTheme="system"
                enableSystem
                disableTransitionOnChange
              >
                <SidebarProvider>
                  <AppSidebar />
                  <SidebarInset>
                    <header className="flex h-16 shrink-0 items-center gap-2 px-4">
                      <SidebarTrigger />
                    </header>
                    <main className="flex-1 space-y-4 p-2 md:p-2">
                      {children}
                    </main>
                  </SidebarInset>
                </SidebarProvider>
                <Toaster />
                <PWAInstallPrompt />
                <OfflineIndicator />
              </ThemeProvider>
            </QueryProvider>
          </ClerkProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
