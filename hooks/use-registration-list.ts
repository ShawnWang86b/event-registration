import { useAuth } from "@clerk/nextjs";
import {
  useEventRegistrations,
  useJoinEvent,
  useCancelEventRegistration,
} from "@/hooks/use-registrations";

export const useRegistrationList = (eventId: number) => {
  const { userId } = useAuth();

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

  // Error handling
  const getErrorMessage = () => {
    if (queryError) return "Error loading registrations";
    if (joinEventMutation.error)
      return "Failed to join event. Please try again.";
    if (cancelRegistrationMutation.error)
      return "Failed to cancel registration. Please try again.";
    return null;
  };

  // Loading states
  const isJoining = joinEventMutation.isPending;
  const isCanceling = cancelRegistrationMutation.isPending;

  return {
    // Data
    data,
    registeredUsers,
    waitlistUsers,

    // User state
    userId,
    isUserRegistered,

    // Actions
    handleJoinEvent,
    handleCancelRegistration,

    // Loading states
    isLoading,
    isJoining,
    isCanceling,

    // Error handling
    errorMessage: getErrorMessage(),
    hasError: !!queryError,
    hasData: !!data,
  };
};
