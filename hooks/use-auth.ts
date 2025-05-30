import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import { api } from "@/lib/api-services";

// Query keys
export const authKeys = {
  all: ["auth"] as const,
  currentUser: () => [...authKeys.all, "currentUser"] as const,
};

// Get current user from database
export const useCurrentUser = () => {
  const { userId, isLoaded } = useAuth();

  return useQuery({
    queryKey: authKeys.currentUser(),
    queryFn: () => api.auth.getCurrentUser(),
    enabled: isLoaded && !!userId, // Only run when Clerk is loaded and user is authenticated
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error: any) => {
      // Don't retry on 401/404 errors
      if (error?.status === 401 || error?.status === 404) {
        return false;
      }
      return failureCount < 2;
    },
  });
};
