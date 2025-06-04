import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-services";
import { MonthlyReportResponse } from "@/lib/types";

// Query keys for user data
export const userKeys = {
  all: ["user"] as const,
  monthlyReports: () => [...userKeys.all, "monthly-reports"] as const,
  monthlyReport: (year?: number, month?: number) =>
    [...userKeys.monthlyReports(), year, month] as const,
};

// Generate monthly report for current user
export const useUserMonthlyReport = (
  year?: number,
  month?: number,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: userKeys.monthlyReport(year, month),
    queryFn: () => api.auth.generateUserMonthlyReport(year, month),
    enabled: enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error: any) => {
      // Don't retry on 401/403 errors
      if (error?.status === 401 || error?.status === 403) {
        return false;
      }
      return failureCount < 2;
    },
  });
};
