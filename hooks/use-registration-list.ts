import { useAuth } from "@clerk/nextjs";
import {
  useEventRegistrations,
  useJoinEvent,
  useCancelEventRegistration,
} from "@/hooks/use-registrations";
import { useCurrentUser } from "@/hooks";
import { useDeleteGuestRegistration } from "@/hooks/use-admin-guest-registration";
import { useMemo } from "react";

export const useRegistrationList = (eventId: number) => {
  const { userId } = useAuth();
  const { data: currentUserData } = useCurrentUser();

  // Data fetching
  const {
    data,
    isLoading,
    error: queryError,
    refetch,
  } = useEventRegistrations(eventId);

  // Mutations
  const joinEventMutation = useJoinEvent();
  const cancelRegistrationMutation = useCancelEventRegistration();
  const deleteGuestMutation = useDeleteGuestRegistration(eventId);

  // Admin status
  const isAdmin = useMemo(
    () => currentUserData?.user?.role === "admin",
    [currentUserData?.user?.role]
  );

  // Derived state
  const registeredUsers =
    data?.registrations.filter((reg: any) => reg.status === "registered") || [];

  const waitlistUsers =
    data?.registrations.filter((reg: any) => reg.status === "waitlist") || [];

  const isUserRegistered = data?.registrations.some(
    (reg: any) => reg.userId === userId && reg.status !== "canceled"
  );

  // Actions
  const handleJoinEvent = async () => {
    if (!userId) return;

    try {
      await joinEventMutation.mutateAsync({ eventId });
    } catch (error) {
      console.error("Error registering for event:", error);
    }
  };

  const handleCancelRegistration = async () => {
    if (!userId) return;

    try {
      await cancelRegistrationMutation.mutateAsync(eventId);
    } catch (error) {
      console.error("Error canceling registration:", error);
    }
  };

  const handleDeleteGuest = async (registrationId: number) => {
    if (!isAdmin) return;

    try {
      await deleteGuestMutation.mutateAsync(registrationId);
    } catch (error) {
      console.error("Error deleting guest:", error);
    }
  };

  // Error handling
  const getErrorMessage = () => {
    if (queryError) return "Error loading registrations";
    if (joinEventMutation.error)
      return "Failed to join event. Please try again.";
    if (cancelRegistrationMutation.error)
      return "Failed to cancel registration. Please try again.";
    if (deleteGuestMutation.error)
      return "Failed to delete guest. Please try again.";
    return null;
  };

  // Loading states
  const isJoining = joinEventMutation.isPending;
  const isCanceling = cancelRegistrationMutation.isPending;
  const isDeletingGuest = deleteGuestMutation.isPending;

  return {
    // Data
    data,
    registeredUsers,
    waitlistUsers,

    // User state
    userId,
    isUserRegistered,
    isAdmin,

    // Actions
    handleJoinEvent,
    handleCancelRegistration,
    handleDeleteGuest,

    // Loading states
    isLoading,
    isJoining,
    isCanceling,
    isDeletingGuest,

    // Error handling
    errorMessage: getErrorMessage(),
    hasError: !!queryError,
    hasData: !!data,
  };
};
