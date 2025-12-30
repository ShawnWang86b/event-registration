"use client";

import {
  Calendar,
  Home,
  Shield,
  ShoppingBag,
  User,
  Puzzle,
  DollarSign,
  Users,
  FileText,
  ChevronRight,
} from "lucide-react";
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
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  useSidebar,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { useCurrentUser } from "@/hooks";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import {
  ThemeToggleButton,
  useThemeTransition,
} from "@/components/ui/shadcn-io/theme-toggle-button";
import LanguageSelect from "./LanguageSelect";
import { useTranslations } from "next-intl";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

export function AppSidebar() {
  // Get current user from database
  const {
    data: currentUserData,
    isLoading: userLoading,
    isPending: userPending,
  } = useCurrentUser();
  const currentUser = currentUserData?.user;

  // Check if user data is still loading
  const isUserLoading = userLoading || userPending;
  const t = useTranslations("SideBar");

  // Base menu items for all users
  const baseItems = [
    {
      title: t("home"),
      url: "/",
      icon: Home,
    },
    {
      title: t("events"),
      url: "/events",
      icon: Calendar,
    },
    {
      title: t("account"),
      url: "/account",
      icon: User,
    },
    {
      title: t("shop"),
      url: "/shop",
      icon: ShoppingBag,
    },
    {
      title: t("becomeOrganizer"),
      url: "/become-organizer",
      icon: Puzzle,
    },
  ];

  // Admin-only menu items with sub-items
  const adminParentItem = {
    title: t("admin"),
    icon: Shield,
    subItems: [
      {
        title: "Manage Credits", // You'll want to add this to translations
        url: "/admin",
        icon: DollarSign,
      },
      {
        title: "View Users", // You'll want to add this to translations
        url: "/admin/users",
        icon: Users,
      },
      {
        title: "Organizer Requests", // You'll want to add this to translations
        url: "/admin/organizer-requests",
        icon: FileText,
      },
    ],
  };
  // Get sidebar state and controls
  const { setOpenMobile, isMobile } = useSidebar();

  // Get current pathname for active route detection
  const pathname = usePathname();

  // Theme logic
  const { theme, setTheme, systemTheme } = useTheme();
  const { startTransition } = useThemeTransition();
  const [mounted, setMounted] = useState(false);
  const [isAdminMenuOpen, setIsAdminMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Auto-open admin menu if on admin route
    if (pathname.startsWith("/admin")) {
      setIsAdminMenuOpen(true);
    }
  }, [pathname]);

  const handleThemeToggle = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    startTransition(() => {
      setTheme(newTheme);
    });
  };

  const currentTheme = (() => {
    if (!mounted) return "light"; // Default for SSR
    if (theme === "system") {
      return (systemTheme as "light" | "dark") || "light";
    }
    return (theme as "light" | "dark") || "light";
  })();

  // Check if user is admin (only when user data is loaded)
  const isAdmin = !isUserLoading && currentUser?.role === "admin";

  // Combine menu items based on user role
  const menuItems = isAdmin ? baseItems : baseItems;

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
          <SidebarGroupLabel>{t("title")}</SidebarGroupLabel>
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

              {/* Admin menu item with collapsible sub-items */}
              {isAdmin && (
                <Collapsible
                  asChild
                  open={isAdminMenuOpen}
                  onOpenChange={setIsAdminMenuOpen}
                >
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton
                        isActive={pathname.startsWith("/admin")}
                        className={`${
                          pathname.startsWith("/admin")
                            ? "bg-primary text-primary-foreground hover:bg-primary/90"
                            : ""
                        }`}
                      >
                        <adminParentItem.icon />
                        <span>{adminParentItem.title}</span>
                        <ChevronRight
                          className={`ml-auto transition-transform duration-200 ${
                            isAdminMenuOpen ? "rotate-90" : ""
                          }`}
                        />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {adminParentItem.subItems.map((subItem) => (
                          <SidebarMenuSubItem key={subItem.title}>
                            <SidebarMenuSubButton
                              asChild
                              isActive={isActiveRoute(subItem.url)}
                            >
                              <Link href={subItem.url} onClick={handleNavClick}>
                                <subItem.icon />
                                <span>{subItem.title}</span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <div className="flex flex-col gap-4 mb-20 pb-10 ">
          {isUserLoading ? (
            // Loading skeleton for user section
            <div className="flex items-center space-x-4 pl-1">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-3 w-[150px]" />
                <Skeleton className="h-3 w-[100px]" />
              </div>
            </div>
          ) : (
            // User information when loaded
            <div className="flex justify-center items-center gap-2 ">
              <div className="mr-3 ">
                <SignedOut>
                  <SignInButton />
                </SignedOut>
                <SignedIn>
                  <UserButton />
                </SignedIn>
              </div>
              <div className="text-sm flex flex-col">
                <span> {currentUser?.email}</span>
                <span>{currentUser?.name}</span>
              </div>
            </div>
          )}
          <div className="flex justify-center items-center gap-2">
            {mounted ? (
              <ThemeToggleButton
                theme={currentTheme}
                onClick={handleThemeToggle}
                variant="circle"
                start="center"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-muted animate-pulse" />
            )}

            <LanguageSelect />
          </div>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
