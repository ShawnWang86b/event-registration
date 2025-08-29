import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-services";
import {
  CreateEventData,
  UpdateEventData,
  EventsQueryParams,
  EndEventWithPricesData,
} from "@/types";
import { registrationKeys } from "./use-registrations";

// Query keys
export const eventKeys = {
  all: ["events"] as const,
  lists: () => [...eventKeys.all, "list"] as const,
  list: (params?: EventsQueryParams) => [...eventKeys.lists(), params] as const,
  details: () => [...eventKeys.all, "detail"] as const,
  detail: (id: number) => [...eventKeys.details(), id] as const,
};

// Get all events
export const useEvents = (params?: EventsQueryParams) => {
  return useQuery({
    queryKey: eventKeys.list(params),
    queryFn: () => api.events.getEvents(params),
    staleTime: 5 * 60 * 1000,
  });
};

// Get single event
export const useEvent = (id: number) => {
  return useQuery({
    queryKey: eventKeys.detail(id),
    queryFn: () => api.events.getEvent(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

// Create event mutation
export const useCreateEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateEventData) => api.events.createEvent(data),
    onSuccess: (newEvent) => {
      // Invalidate and refetch events list
      queryClient.invalidateQueries({ queryKey: eventKeys.lists() });
      // Add the new event to the cache
      queryClient.setQueryData(eventKeys.detail(newEvent.id), newEvent);
    },
    onError: (error) => {
      console.error("Failed to create event:", error);
    },
  });
};

// Update event mutation
export const useUpdateEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateEventData) => api.events.updateEvent(data),
    onSuccess: (updatedEvent) => {
      // Invalidate and refetch events list
      queryClient.invalidateQueries({ queryKey: eventKeys.lists() });
      // Update the specific event in cache
      queryClient.setQueryData(eventKeys.detail(updatedEvent.id), updatedEvent);
      // IMPORTANT: Invalidate registration cache for this event
      // This ensures "7 / 12" updates to "7 / 15" when maxAttendees changes
      queryClient.invalidateQueries({
        queryKey: registrationKeys.byEvent(updatedEvent.id),
      });
    },
    onError: (error) => {
      console.error("Failed to update event:", error);
    },
  });
};

// Delete event mutation (admin only)
export const useDeleteEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => api.events.deleteEvent(id),
    onSuccess: () => {
      // Invalidate events queries to refresh the list
      queryClient.invalidateQueries({ queryKey: eventKeys.all });
    },
    onError: (error: any) => {
      console.error("Failed to delete event:", error);
    },
  });
};

// End event mutation (admin only)
export const useEndEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (eventId: number) => api.events.endEvent(eventId),
    onSuccess: (data, eventId) => {
      // Invalidate all related queries
      queryClient.invalidateQueries({ queryKey: eventKeys.all });
      queryClient.invalidateQueries({ queryKey: ["registrations"] });
      queryClient.invalidateQueries({ queryKey: ["admin"] });

      // Log success
      console.log("Event ended successfully:", data.summary);
    },
    onError: (error: any) => {
      console.error("Failed to end event:", error);
    },
  });
};

// Toggle event status mutation (admin only)
export const useToggleEventStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      eventId,
      isActive,
    }: {
      eventId: number;
      isActive: boolean;
    }) => api.events.toggleEventStatus(eventId, isActive),
    onSuccess: (updatedEvent) => {
      // Invalidate and update queries
      queryClient.invalidateQueries({ queryKey: eventKeys.all });

      // Update the specific event in cache
      queryClient.setQueryData(eventKeys.detail(updatedEvent.id), updatedEvent);

      // Log success
      console.log(
        `Event ${updatedEvent.isActive ? "activated" : "deactivated"}:`,
        updatedEvent.title
      );
    },
    onError: (error: any) => {
      console.error("Failed to toggle event status:", error);
    },
  });
};

// End event with individual prices mutation (admin only)
export const useEndEventWithPrices = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      eventId,
      data,
    }: {
      eventId: number;
      data: EndEventWithPricesData;
    }) => api.events.endEventWithPrices(eventId, data),
    onSuccess: (result, { eventId }) => {
      // Invalidate all related queries
      queryClient.invalidateQueries({ queryKey: eventKeys.all });
      queryClient.invalidateQueries({ queryKey: ["registrations"] });
      queryClient.invalidateQueries({ queryKey: ["admin"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });

      // Log success with summary
      console.log("Event ended successfully with individual prices:", {
        eventId,
        summary: result.summary,
        customPricesUsed: result.summary.customPriceUsed,
        totalCollected: result.summary.totalDeducted,
      });
    },
    onError: (error: any) => {
      console.error("Failed to end event with individual prices:", error);
    },
  });
};
