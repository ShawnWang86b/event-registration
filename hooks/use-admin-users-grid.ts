import { useMemo, useCallback } from "react";
import { useAdminUsers, type AdminUser } from "@/hooks/use-admin-users";

/**
 * Custom hook for AdminUsersGrid component logic
 * Handles data fetching, formatting, and grid configuration
 */
export const useAdminUsersGrid = () => {
  const { data: usersData, isLoading, error } = useAdminUsers(1, 100);

  // Format currency (consistent with account page)
  const formatCurrency = useCallback((amount: number) => {
    return new Intl.NumberFormat("en-AU", {
      style: "currency",
      currency: "AUD",
    }).format(amount);
  }, []);

  // Format date
  const formatDate = useCallback((dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-AU", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }, []);

  // Check if balance is positive
  const isPositiveBalance = useCallback((balance: number) => {
    return balance >= 0;
  }, []);

  // Check if user is admin
  const isAdminRole = useCallback((role: string) => {
    return role === "admin";
  }, []);

  // Grid configuration
  const defaultColDef = useMemo(
    () => ({
      resizable: true,
      sortable: true,
      filter: true,
    }),
    []
  );

  const gridOptions = useMemo(
    () => ({
      pagination: true,
      paginationPageSize: 25,
      domLayout: "normal" as const,
      animateRows: true,
      rowSelection: "multiple" as const,
    }),
    []
  );

  // Derived data
  const users = usersData?.users || [];
  const pagination = usersData?.pagination;
  const totalUsers = pagination?.total || 0;
  const hasError = !!error;
  const hasData = users.length > 0;

  return {
    // Data
    users,
    pagination,
    totalUsers,

    // States
    isLoading,
    hasError,
    hasData,

    // Formatters
    formatCurrency,
    formatDate,
    isPositiveBalance,
    isAdminRole,

    // Grid config
    defaultColDef,
    gridOptions,
  };
};
