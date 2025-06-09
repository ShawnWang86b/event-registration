"use client";

import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useCurrentUser } from "@/hooks";
import LoadingSpinner from "@/components/loading-spinner";

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
      <div className="fixed inset-0 flex justify-center items-center bg-gray-50 z-50">
        <LoadingSpinner />
      </div>
    );
  }

  // Don't render anything if user is not admin
  if (!currentUser || !isAdmin) {
    return null;
  }

  return <>{children}</>;
}
