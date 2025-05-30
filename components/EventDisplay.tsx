"use client";

import { useEvents } from "@/hooks/use-events";
import EventCard from "@/components/EventCard";
import LoadingSpinner from "@/components/LoadingSpinner";

const EventDisplay = () => {
  // Use TanStack Query for fetching events
  const {
    data: events = [],
    isLoading: loading,
    error: queryError,
  } = useEvents();

  // Convert query error to string for display
  const error = queryError ? "Failed to fetch events" : null;

  if (loading) {
    return (
      <div
        className="flex justify-center items-center min-h-screen"
        style={{ width: "calc(100vw - var(--sidebar-width))" }}
      >
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-red-500 text-lg">Error: {error}</div>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-gray-500 text-lg">No events found</div>
      </div>
    );
  }

  return (
    <div
      className="container mx-auto p-6"
      style={{ width: "calc(100vw - var(--sidebar-width))" }}
    >
      <h1 className="text-3xl font-bold mb-6">All Events</h1>

      <div className="grid gap-6 grid-cols-3 w-full">
        {events.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>
    </div>
  );
};

export default EventDisplay;
