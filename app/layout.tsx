import type { Metadata } from "next";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { QueryProvider } from "@/components/providers/query-provider";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "Event Registration",
  description: "Event Registration System for Melbourne Old Boys Hoops",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
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
        </ClerkProvider>
      </body>
    </html>
  );
}
