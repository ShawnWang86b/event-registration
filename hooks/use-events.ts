import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-services";
import {
  Event,
  CreateEventData,
  UpdateEventData,
  EventsQueryParams,
} from "@/lib/types";

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
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get single event
export const useEvent = (id: number) => {
  return useQuery({
    queryKey: eventKeys.detail(id),
    queryFn: () => api.events.getEvent(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
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
    },
    onError: (error) => {
      console.error("Failed to update event:", error);
    },
  });
};

// Delete event mutation
export const useDeleteEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => api.events.deleteEvent(id),
    onSuccess: (_, deletedId) => {
      // Invalidate and refetch events list
      queryClient.invalidateQueries({ queryKey: eventKeys.lists() });

      // Remove the deleted event from cache
      queryClient.removeQueries({ queryKey: eventKeys.detail(deletedId) });
    },
    onError: (error) => {
      console.error("Failed to delete event:", error);
    },
  });
};
