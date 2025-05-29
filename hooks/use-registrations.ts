import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-services";
import {
  Registration,
  CreateRegistrationData,
  RegistrationsQueryParams,
} from "@/lib/types";

// Query keys
export const registrationKeys = {
  all: ["registrations"] as const,
  lists: () => [...registrationKeys.all, "list"] as const,
  list: (params?: RegistrationsQueryParams) =>
    [...registrationKeys.lists(), params] as const,
  details: () => [...registrationKeys.all, "detail"] as const,
  detail: (id: number) => [...registrationKeys.details(), id] as const,
  byEvent: (eventId: number) =>
    [...registrationKeys.all, "event", eventId] as const,
};

// Get all registrations
export const useRegistrations = (params?: RegistrationsQueryParams) => {
  return useQuery({
    queryKey: registrationKeys.list(params),
    queryFn: () => api.registrations.getRegistrations(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Get registrations for a specific event
export const useEventRegistrations = (eventId: number) => {
  return useQuery({
    queryKey: registrationKeys.byEvent(eventId),
    queryFn: () => api.registrations.getEventRegistrations(eventId),
    enabled: !!eventId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Create registration mutation
export const useCreateRegistration = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateRegistrationData) =>
      api.registrations.createRegistration(data),
    onSuccess: (newRegistration) => {
      // Invalidate and refetch registrations list
      queryClient.invalidateQueries({ queryKey: registrationKeys.lists() });

      // Invalidate event-specific registrations
      queryClient.invalidateQueries({
        queryKey: registrationKeys.byEvent(newRegistration.eventId),
      });

      // Add the new registration to the cache
      queryClient.setQueryData(
        registrationKeys.detail(newRegistration.id),
        newRegistration
      );
    },
    onError: (error) => {
      console.error("Failed to create registration:", error);
    },
  });
};

// Cancel registration mutation
export const useCancelRegistration = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => api.registrations.cancelRegistration(id),
    onSuccess: (updatedRegistration) => {
      // Invalidate and refetch registrations list
      queryClient.invalidateQueries({ queryKey: registrationKeys.lists() });

      // Invalidate event-specific registrations
      queryClient.invalidateQueries({
        queryKey: registrationKeys.byEvent(updatedRegistration.eventId),
      });

      // Update the specific registration in cache
      queryClient.setQueryData(
        registrationKeys.detail(updatedRegistration.id),
        updatedRegistration
      );
    },
    onError: (error) => {
      console.error("Failed to cancel registration:", error);
    },
  });
};

// Delete registration mutation
export const useDeleteRegistration = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => api.registrations.deleteRegistration(id),
    onSuccess: (_, deletedId) => {
      // Invalidate and refetch registrations list
      queryClient.invalidateQueries({ queryKey: registrationKeys.lists() });

      // Remove the deleted registration from cache
      queryClient.removeQueries({
        queryKey: registrationKeys.detail(deletedId),
      });
    },
    onError: (error) => {
      console.error("Failed to delete registration:", error);
    },
  });
};
