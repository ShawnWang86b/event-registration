import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-services";
import {
  UserBalanceInfo,
  UsersSearchResponse,
  BalanceAdjustmentData,
  MonthlyReportResponse,
  CreateMonthlyBalanceData,
} from "@/types";

// Query keys
export const adminKeys = {
  all: ["admin"] as const,
  users: () => [...adminKeys.all, "users"] as const,
  userSearch: (query?: string) =>
    [...adminKeys.users(), "search", query] as const,
  userBalance: (userId: string) =>
    [...adminKeys.users(), "balance", userId] as const,
};

// Search users (admin only)
export const useSearchUsers = (query?: string) => {
  const shouldSearch = Boolean(query && query.trim().length >= 2);

  return useQuery({
    queryKey: adminKeys.userSearch(query),
    queryFn: () => api.admin.searchUsers(query),
    enabled: shouldSearch, // Only search when query has at least 2 characters
    staleTime: 30 * 1000, // 30 seconds
    retry: (failureCount, error: any) => {
      // Don't retry on 403 errors
      if (error?.status === 403) {
        return false;
      }
      return failureCount < 2;
    },
  });
};

// Get user balance information (admin only)
export const useUserBalance = (userId: string) => {
  return useQuery({
    queryKey: adminKeys.userBalance(userId),
    queryFn: () => api.admin.getUserBalance(userId),
    enabled: !!userId, // Only run query if userId is provided
    staleTime: 30 * 1000, // 30 seconds
    retry: (failureCount, error: any) => {
      // Don't retry on 403/404 errors
      if (error?.status === 403 || error?.status === 404) {
        return false;
      }
      return failureCount < 2;
    },
  });
};

// Adjust user balance mutation (admin only)
export const useAdjustUserBalance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      data,
    }: {
      userId: string;
      data: BalanceAdjustmentData;
    }) => api.admin.adjustUserBalance(userId, data),
    onSuccess: (response, variables) => {
      // Invalidate the specific user's balance query
      queryClient.invalidateQueries({
        queryKey: adminKeys.userBalance(variables.userId),
      });

      // Invalidate all user queries to refresh search results
      queryClient.invalidateQueries({
        queryKey: adminKeys.users(),
      });

      // Invalidate the admin users grid queries (different query key structure)
      queryClient.invalidateQueries({
        queryKey: ["admin-users"],
      });

      // Update the cache with the new balance
      queryClient.setQueryData(adminKeys.userBalance(variables.userId), {
        ...response.user,
        creditBalance: response.user.newBalance,
      });
    },
    onError: (error: any) => {
      console.error("Failed to adjust user balance:", error);
    },
  });
};

// Generate monthly report query
export const useMonthlyReport = (
  userId: string,
  year?: number,
  month?: number,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: ["admin", "monthly-report", userId, year, month],
    queryFn: () => api.admin.generateMonthlyReport(userId, year, month),
    enabled: enabled && !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Create monthly balance record mutation
export const useCreateMonthlyBalance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      data,
    }: {
      userId: string;
      data: CreateMonthlyBalanceData;
    }) => api.admin.createMonthlyBalance(userId, data),
    onSuccess: (result, { userId, data }) => {
      // Invalidate related queries
      queryClient.invalidateQueries({
        queryKey: ["admin", "monthly-report", userId, data.year, data.month],
      });
      queryClient.invalidateQueries({
        queryKey: ["admin", "balance", userId],
      });
    },
    onError: (error: any) => {
      console.error("Failed to create monthly balance record:", error);
    },
  });
};
