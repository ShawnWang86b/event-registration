"use client";
import { Calendar, Home, Shield, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { useCurrentUser } from "@/hooks";

// Base menu items for all users
const baseItems = [
  {
    title: "Home",
    url: "/",
    icon: Home,
  },
  {
    title: "Events",
    url: "/events",
    icon: Calendar,
  },
  {
    title: "Account",
    url: "/account",
    icon: User,
  },
];

// Admin-only menu items
const adminItems = [
  {
    title: "Admin",
    url: "/admin",
    icon: Shield,
  },
];

export function AppSidebar() {
  // Get current user from database
  const { data: currentUserData } = useCurrentUser();
  const currentUser = currentUserData?.user;

  // Get sidebar state and controls
  const { setOpenMobile, isMobile } = useSidebar();

  // Get current pathname for active route detection
  const pathname = usePathname();

  // Check if user is admin
  const isAdmin = currentUser?.role === "admin";

  // Combine menu items based on user role
  const menuItems = isAdmin ? [...baseItems, ...adminItems] : baseItems;

  // Handle navigation click - close mobile sidebar
  const handleNavClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  // Check if route is active
  const isActiveRoute = (url: string) => {
    if (url === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(url);
  };

  return (
    <Sidebar>
      <SidebarContent className="flex flex-col justify-between p-4">
        <SidebarGroup>
          <SidebarGroupLabel>Pages</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link
                      href={item.url}
                      onClick={handleNavClick}
                      className={`${
                        isActiveRoute(item.url)
                          ? "bg-primary text-primary-foreground hover:bg-primary/90"
                          : ""
                      }`}
                    >
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <div className="mb-10 pb-10 pl-2.5">
          <SignedOut>
            <SignInButton />
          </SignedOut>
          <SignedIn>
            <UserButton />
          </SignedIn>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
