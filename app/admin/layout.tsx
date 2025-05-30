"use client";

import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useCurrentUser } from "@/hooks";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoaded: authLoaded } = useAuth();
  const { data: currentUserData, isLoading: userLoading } = useCurrentUser();
  const currentUser = currentUserData?.user;
  const router = useRouter();

  const isLoading = !authLoaded || userLoading;
  const isAdmin = currentUser?.role === "admin";

  useEffect(() => {
    if (!isLoading) {
      // Redirect non-admin users
      if (!currentUser || !isAdmin) {
        router.push("/");
        return;
      }
    }
  }, [currentUser, isAdmin, isLoading, router]);

  // Show loading while checking permissions
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render anything if user is not admin
  if (!currentUser || !isAdmin) {
    return null;
  }

  return <>{children}</>;
}
