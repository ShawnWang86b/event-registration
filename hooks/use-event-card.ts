import { useState, useMemo, useCallback } from "react";
import { useEventRegistrations } from "@/hooks/use-registrations";
import { useCurrentUser } from "@/hooks";
import { Event } from "@/types";
import { LOCATION_IMAGE_MAP } from "@/constants/eventCard";
import type { EventStatus, ButtonState } from "@/constants/eventCard";

interface UseEventCardProps {
  event: Event;
  onRegister?: (eventId: number) => void;
}

interface EventCardState {
  isRegistrationExpanded: boolean;
  isEditDialogOpen: boolean;
  isSetPriceDialogOpen: boolean;
}

/**
 * Custom hook to manage EventCard logic and state
 * Separates business logic from presentation layer
 */
export const useEventCard = ({ event, onRegister }: UseEventCardProps) => {
  // State management
  const [state, setState] = useState<EventCardState>({
    isRegistrationExpanded: false,
    isEditDialogOpen: false,
    isSetPriceDialogOpen: false,
  });

  // Data fetching
  const { data: currentUserData } = useCurrentUser();
  const {
    data: registrationData,
    isLoading: loading,
    error,
  } = useEventRegistrations(event.id);

  // Computed values
  const isAdmin = useMemo(
    () => currentUserData?.user?.role === "admin",
    [currentUserData?.user?.role]
  );

  const registrationStatus = useMemo(
    () => registrationData?.event,
    [registrationData?.event]
  );

  const isEventFull = useMemo(
    () =>
      registrationStatus &&
      registrationStatus.currentRegistrations >=
        registrationStatus.maxAttendees,
    [registrationStatus]
  );

  const eventStatus: EventStatus = useMemo(() => {
    if (loading) return "loading";
    if (error) return "error";
    if (isEventFull) return "full";
    return "available";
  }, [loading, error, isEventFull]);

  const buttonState: ButtonState = useMemo(() => {
    if (loading || error) return "disabled";
    if (loading) return "loading";
    if (isEventFull) return "view_details";
    return "register";
  }, [loading, error, isEventFull]);

  // Event handlers
  const handleRegisterClick = useCallback(() => {
    if (onRegister && !state.isRegistrationExpanded) {
      onRegister(event.id);
    }
    setState((prev) => ({
      ...prev,
      isRegistrationExpanded: !prev.isRegistrationExpanded,
    }));
  }, [onRegister, state.isRegistrationExpanded, event.id]);

  const toggleEditDialog = useCallback((open: boolean) => {
    setState((prev) => ({ ...prev, isEditDialogOpen: open }));
  }, []);

  const toggleSetPriceDialog = useCallback((open: boolean) => {
    setState((prev) => ({ ...prev, isSetPriceDialogOpen: open }));
  }, []);

  const toggleRegistrationDialog = useCallback((open: boolean) => {
    setState((prev) => ({ ...prev, isRegistrationExpanded: open }));
  }, []);

  // Utility functions
  const getLocationImage = useCallback(
    (location: string | null | undefined): string => {
      if (!location) return LOCATION_IMAGE_MAP.default;

      const normalizedLocation = location.toLowerCase();

      // Find matching location key
      const locationKey = Object.keys(LOCATION_IMAGE_MAP).find(
        (key) => key !== "default" && normalizedLocation.includes(key)
      ) as keyof typeof LOCATION_IMAGE_MAP;

      return LOCATION_IMAGE_MAP[locationKey] || LOCATION_IMAGE_MAP.default;
    },
    []
  );

  const formatPrice = useCallback((price: string): string => {
    return `$${parseFloat(price).toFixed(2)}`;
  }, []);

  return {
    // State
    state,

    // Computed values
    isAdmin,
    registrationStatus,
    isEventFull,
    eventStatus,
    buttonState,
    loading,
    error,

    // Event handlers
    handleRegisterClick,
    toggleEditDialog,
    toggleSetPriceDialog,
    toggleRegistrationDialog,

    // Utility functions
    getLocationImage,
    formatPrice,
  };
};
