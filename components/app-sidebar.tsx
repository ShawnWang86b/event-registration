"use client";
import { Calendar, Home, Shield, User } from "lucide-react";
import Link from "next/link";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
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

  // Check if user is admin
  const isAdmin = currentUser?.role === "admin";

  // Combine menu items based on user role
  const menuItems = isAdmin ? [...baseItems, ...adminItems] : baseItems;

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
                    <Link href={item.url}>
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
