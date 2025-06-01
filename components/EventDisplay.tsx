"use client";

import { useState } from "react";
import { useEvents } from "@/hooks/use-events";
import { useCurrentUser } from "@/hooks";
import EventCard from "@/components/EventCard";
import LoadingSpinner from "@/components/LoadingSpinner";
import CreateEventDialog from "@/components/create-event-dialog";

const EventDisplay = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Get current user to check admin status
  const { data: currentUserData } = useCurrentUser();
  const isAdmin = currentUserData?.user?.role === "admin";

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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">All Events</h1>
        {isAdmin && (
          <button
            onClick={() => setIsCreateDialogOpen(true)}
            className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
          >
            <span className="text-xl">+</span>
            Create Event
          </button>
        )}
      </div>

      <div className="grid gap-6 grid-cols-3 w-full">
        {events.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>

      {/* Create Event Dialog */}
      <CreateEventDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
      />
    </div>
  );
};

export default EventDisplay;
