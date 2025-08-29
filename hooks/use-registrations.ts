import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-services";
import { CreateRegistrationData, RegistrationsQueryParams } from "@/types";

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
    staleTime: 0, // Always fetch fresh data for accurate summary statistics
    gcTime: 30 * 1000, // Keep in cache for 30 seconds
    enabled: !!eventId, // Only run query if eventId is provided
    refetchOnMount: true, // Always refetch when component mounts
    refetchOnWindowFocus: true, // Refetch when window gains focus
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

// Join event mutation (for event registrations)
export const useJoinEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateRegistrationData) =>
      api.registrations.createRegistration(data),
    onSuccess: async (newRegistration) => {
      // Remove cached data for this event to force fresh fetch
      queryClient.removeQueries({
        queryKey: registrationKeys.byEvent(newRegistration.eventId),
      });

      // Invalidate all registration-related queries
      await queryClient.invalidateQueries({
        queryKey: registrationKeys.all,
      });

      // Force immediate refetch of the event registrations
      await queryClient.refetchQueries({
        queryKey: registrationKeys.byEvent(newRegistration.eventId),
        exact: true,
      });
    },
    onError: (error) => {
      console.error("Failed to join event:", error);
    },
  });
};

// Cancel event registration mutation (for event registrations)
export const useCancelEventRegistration = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (eventId: number) => {
      // Use the DELETE endpoint for canceling registration
      return fetch(`/api/registrations/${eventId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      }).then((response) => {
        if (!response.ok) {
          throw new Error("Failed to cancel registration");
        }
        return response.json();
      });
    },
    onSuccess: async (_, eventId) => {
      // Remove all cached data for this event to force fresh fetch
      queryClient.removeQueries({
        queryKey: registrationKeys.byEvent(eventId),
      });

      // Invalidate all registration-related queries
      await queryClient.invalidateQueries({
        queryKey: registrationKeys.all,
      });

      // Force immediate refetch of the event registrations
      await queryClient.refetchQueries({
        queryKey: registrationKeys.byEvent(eventId),
        exact: true,
      });
    },
    onError: (error) => {
      console.error("Failed to cancel event registration:", error);
    },
  });
};
