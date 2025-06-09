"use client";

import { useState, useEffect } from "react";
import { CalendarPlus } from "lucide-react";
import { useEvents } from "@/hooks/use-events";
import { useCurrentUser } from "@/hooks";
import EventCard from "@/components/event-card";
import LoadingSpinner from "@/components/loading-spinner";
import CreateEventDialog from "@/components/create-event-dialog";
import { useSidebar } from "@/components/ui/sidebar";

const EventDisplay = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);

  const { data: currentUserData } = useCurrentUser();
  const isAdmin = currentUserData?.user?.role === "admin";

  const {
    data: events = [],
    isLoading: loading,
    error: queryError,
  } = useEvents();

  const error = queryError ? "Failed to fetch events" : null;

  const { state } = useSidebar();

  // Handle client-side mounting
  useEffect(() => {
    setIsClient(true);
  }, []);

  if (loading) {
    return (
      <div className="fixed inset-0 flex justify-center items-center bg-gray-50 z-50">
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

  // Calculate dynamic styles only on client-side
  const getDynamicStyles = () => {
    if (!isClient) return {};

    if (window.innerWidth >= 1024) {
      return state === "collapsed"
        ? { width: "100vw" }
        : { width: "calc(100vw - var(--sidebar-width))" };
    }
    return {};
  };

  return (
    <div
      className="min-h-screen bg-gray-50 w-full lg:w-auto"
      style={getDynamicStyles()}
    >
      <div className="container mx-auto p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-start justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Events</h1>
              <p className="text-gray-600 mt-2">
                Discover and register for upcoming basketball events
              </p>
            </div>

            {/* Admin-only Create Event Button */}
            {isAdmin && (
              <button
                onClick={() => setIsCreateDialogOpen(true)}
                className="flex items-center gap-2 bg-blue-800 hover:bg-blue-900 text-white font-sm p-4 rounded-full transition-colors hover:cursor-pointer"
              >
                <CalendarPlus size={16} />
                {/* Create Event */}
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </div>
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
