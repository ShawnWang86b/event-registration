"use client";

import { useState } from "react";
import {
  useEvents,
  useCreateEvent,
  useUpdateEvent,
  useDeleteEvent,
} from "@/hooks";
import { CreateEventData, UpdateEventData } from "@/lib/types";

export function EventsExample() {
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);

  // Fetch events
  const { data: events, isLoading, error, refetch } = useEvents();

  // Mutations
  const createEventMutation = useCreateEvent();
  const updateEventMutation = useUpdateEvent();
  const deleteEventMutation = useDeleteEvent();

  // Example: Create a new event
  const handleCreateEvent = async () => {
    const newEventData: CreateEventData = {
      title: "Sample Event",
      description: "This is a sample event created via API",
      price: 25.0,
      startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week from now
      endDate: new Date(
        Date.now() + 7 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000
      ).toISOString(), // 2 hours later
      location: "Sample Location",
      maxAttendees: 50,
      isPeriodic: false,
    };

    try {
      await createEventMutation.mutateAsync(newEventData);
      alert("Event created successfully!");
    } catch (error) {
      alert("Failed to create event");
    }
  };

  // Example: Update an event
  const handleUpdateEvent = async (eventId: number) => {
    const updateData: UpdateEventData = {
      id: eventId,
      title: "Updated Event Title",
      description: "This event has been updated",
    };

    try {
      await updateEventMutation.mutateAsync(updateData);
      alert("Event updated successfully!");
    } catch (error) {
      alert("Failed to update event");
    }
  };

  // Example: Delete an event
  const handleDeleteEvent = async (eventId: number) => {
    if (confirm("Are you sure you want to delete this event?")) {
      try {
        await deleteEventMutation.mutateAsync(eventId);
        alert("Event deleted successfully!");
      } catch (error) {
        alert("Failed to delete event");
      }
    }
  };

  if (isLoading) {
    return <div className="p-4">Loading events...</div>;
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="text-red-600 mb-4">
          Error loading events: {error.message}
        </div>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Events API Example</h1>

      {/* Create Event Button */}
      <div className="mb-6">
        <button
          onClick={handleCreateEvent}
          disabled={createEventMutation.isPending}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
        >
          {createEventMutation.isPending
            ? "Creating..."
            : "Create Sample Event"}
        </button>
      </div>

      {/* Events List */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">
          Events ({events?.length || 0})
        </h2>

        {events?.map((event) => (
          <div key={event.id} className="border rounded-lg p-4 bg-white shadow">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="text-lg font-medium">{event.title}</h3>
                <p className="text-gray-600 mt-1">{event.description}</p>
                <div className="mt-2 text-sm text-gray-500">
                  <p>Price: ${event.price}</p>
                  <p>Location: {event.location || "TBD"}</p>
                  <p>Max Attendees: {event.maxAttendees}</p>
                  <p>Start: {new Date(event.startDate).toLocaleString()}</p>
                  <p>End: {new Date(event.endDate).toLocaleString()}</p>
                </div>
              </div>

              <div className="flex gap-2 ml-4">
                <button
                  onClick={() => handleUpdateEvent(event.id)}
                  disabled={updateEventMutation.isPending}
                  className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 disabled:opacity-50"
                >
                  {updateEventMutation.isPending ? "Updating..." : "Update"}
                </button>

                <button
                  onClick={() => handleDeleteEvent(event.id)}
                  disabled={deleteEventMutation.isPending}
                  className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 disabled:opacity-50"
                >
                  {deleteEventMutation.isPending ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        ))}

        {events?.length === 0 && (
          <p className="text-gray-500 text-center py-8">No events found</p>
        )}
      </div>
    </div>
  );
}
