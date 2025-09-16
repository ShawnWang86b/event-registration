import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-services";
import {
  CreateGuestRegistrationData,
  GuestRegistrationResponse,
  GuestRegistrationsListResponse,
} from "@/types";
import { registrationKeys } from "./use-registrations";

// Hook to register a guest for an event (admin only)
export const useRegisterGuest = () => {
  const queryClient = useQueryClient();

  return useMutation<
    GuestRegistrationResponse,
    Error,
    CreateGuestRegistrationData
  >({
    mutationFn: (data: CreateGuestRegistrationData) =>
      api.admin.registerGuest(data),
    onSuccess: async (data, variables) => {
      // Refetch event registrations immediately for better UX
      await queryClient.refetchQueries({
        queryKey: registrationKeys.byEvent(variables.eventId),
      });

      // Invalidate other related queries
      queryClient.invalidateQueries({
        queryKey: ["guest-registrations"],
      });
      queryClient.invalidateQueries({
        queryKey: ["events"],
      });
    },
    onError: (error) => {
      console.error("Failed to register guest:", error);
    },
  });
};

// Hook to get all guest registrations (admin only)
export const useGuestRegistrations = (eventId?: number) => {
  return useQuery<GuestRegistrationsListResponse, Error>({
    queryKey: eventId
      ? ["guest-registrations", eventId]
      : ["guest-registrations"],
    queryFn: () => api.admin.getGuestRegistrations(eventId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Hook to get guest registrations for a specific event
export const useEventGuestRegistrations = (eventId: number) => {
  return useGuestRegistrations(eventId);
};

// Hook to delete a guest registration (admin only)
export const useDeleteGuestRegistration = (eventId?: number) => {
  const queryClient = useQueryClient();

  return useMutation<
    { message: string; deletedRegistration: any },
    Error,
    number
  >({
    mutationFn: (registrationId: number) =>
      api.admin.deleteGuestRegistration(registrationId),
    onSuccess: async (data, registrationId) => {
      // Use refetchQueries for immediate refresh instead of just invalidation
      if (eventId) {
        // Refetch specific event registrations immediately
        await queryClient.refetchQueries({
          queryKey: registrationKeys.byEvent(eventId),
        });
      }

      // Also invalidate related queries
      queryClient.invalidateQueries({
        queryKey: registrationKeys.all,
      });

      queryClient.invalidateQueries({
        queryKey: ["guest-registrations"],
      });

      queryClient.invalidateQueries({
        queryKey: ["events"],
      });

      console.log("Cache refreshed after guest deletion");
    },
    onError: (error) => {
      console.error("Failed to delete guest registration:", error);
    },
  });
};
