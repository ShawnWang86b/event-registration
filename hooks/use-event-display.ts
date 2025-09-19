"use client";
import { useState, useMemo, useCallback } from "react";
import { useEvents } from "@/hooks/use-events";
import { useCurrentUser } from "@/hooks";
import { EVENT_DISPLAY_CONSTANTS } from "@/constants/eventDisplay";
import type {
  EventDisplayState,
  EventDisplayErrorType,
} from "@/constants/eventDisplay";

/**
 * Custom hook to manage EventDisplay logic and state
 * Separates business logic from presentation layer
 */
export const useEventDisplay = () => {
  // Local state
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Data fetching
  const { data: currentUserData } = useCurrentUser();
  const {
    data: events = [],
    isLoading: loading,
    error: queryError,
    refetch,
  } = useEvents();

  // Computed values
  const isAdmin = useMemo(
    () => currentUserData?.user?.role === "admin",
    [currentUserData?.user?.role]
  );

  const displayState: EventDisplayState = useMemo(() => {
    if (loading) return "loading";
    if (queryError) return "error";
    if (events.length === 0) return "empty";
    return "success";
  }, [loading, queryError, events.length]);

  const errorType: EventDisplayErrorType = useMemo(() => {
    if (!queryError) return "unknown";

    // You can enhance this based on your error structure
    const errorMessage = queryError.message?.toLowerCase() || "";
    if (errorMessage.includes("network") || errorMessage.includes("fetch")) {
      return "network";
    }
    if (errorMessage.includes("server") || errorMessage.includes("500")) {
      return "server";
    }
    return "unknown";
  }, [queryError]);

  const errorMessage = useMemo(() => {
    if (!queryError) return "";
    return queryError.message || EVENT_DISPLAY_CONSTANTS.ERRORS.GENERIC_ERROR;
  }, [queryError]);

  // Event handlers
  const handleCreateClick = useCallback(() => {
    setIsCreateDialogOpen(true);
  }, []);

  const handleCreateClose = useCallback(() => {
    setIsCreateDialogOpen(false);
  }, []);

  const handleRetry = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleEventRegister = useCallback((eventId: number) => {
    // This can be extended to handle registration logic
  }, []);

  // Admin-specific empty state action
  const getEmptyStateAction = useCallback(() => {
    if (!isAdmin) return undefined;

    return {
      label: "Create First Event",
      onClick: handleCreateClick,
      variant: "default" as const,
    };
  }, [isAdmin, handleCreateClick]);

  return {
    // State
    displayState,
    isCreateDialogOpen,

    // Data
    events,
    isAdmin,
    loading,

    // Error information
    errorType,
    errorMessage,

    // Event handlers
    handleCreateClick,
    handleCreateClose,
    handleRetry,
    handleEventRegister,

    // Computed actions
    emptyStateAction: getEmptyStateAction(),
  };
};
