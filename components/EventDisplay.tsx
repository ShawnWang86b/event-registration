"use client";

import { useState, useEffect } from "react";
import EventCard from "./EventCard";
import RegistrationList from "./RegistrationList";

interface Event {
  id: number;
  title: string;
  description: string;
  price: string;
  startDate: string;
  endDate: string;
  location?: string;
  isPeriodic: boolean;
  frequency?: string;
  maxAttendees: number;
  createdById: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const EventDisplay = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedEventId, setExpandedEventId] = useState<number | null>(null);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/events");

        if (!response.ok) {
          throw new Error(`Failed to fetch events: ${response.statusText}`);
        }

        const data = await response.json();
        setEvents(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch events");
        console.error("Error fetching events:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const handleRegister = (eventId: number) => {
    setExpandedEventId(eventId);
    setIsClosing(false);
  };

  const handleCloseRegistration = () => {
    setIsClosing(true);
    // Wait for animation to complete before hiding
    setTimeout(() => {
      setExpandedEventId(null);
      setIsClosing(false);
    }, 500);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-lg">Loading events...</div>
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
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">All Events</h1>

      <div className="relative">
        {/* Event Cards Grid */}
        <div
          className={`grid gap-6 transition-all duration-500 ease-in-out ${
            expandedEventId
              ? "md:grid-cols-1 lg:grid-cols-1"
              : "md:grid-cols-2 lg:grid-cols-3"
          }`}
        >
          {events.map((event) => (
            <div
              key={event.id}
              className={`transition-all duration-500 ease-in-out ${
                expandedEventId && expandedEventId !== event.id
                  ? "opacity-30 scale-95 pointer-events-none"
                  : "opacity-100 scale-100"
              } ${expandedEventId === event.id ? "col-span-full" : ""}`}
            >
              {expandedEventId === event.id ? (
                // Expanded view with side-by-side layout
                <div
                  className={`flex flex-col lg:flex-row gap-6 items-start transition-all duration-500 ease-in-out ${
                    isClosing
                      ? "opacity-0 scale-95 transform translate-y-2"
                      : "opacity-100 scale-100 transform translate-y-0"
                  }`}
                >
                  {/* Event Card */}
                  <div
                    className={`lg:w-2/5 transition-all duration-500 ease-in-out ${
                      isClosing
                        ? "opacity-0 transform translate-x-4"
                        : "opacity-100 transform translate-x-0"
                    }`}
                  >
                    <EventCard
                      event={event}
                      onRegister={handleRegister}
                      isExpanded={true}
                      onClose={handleCloseRegistration}
                    />
                  </div>
                  {/* Registration List Card */}
                  <div
                    className={`lg:w-3/5 transition-all duration-500 ease-in-out delay-100 ${
                      isClosing
                        ? "opacity-0 transform translate-x-4"
                        : "opacity-100 transform translate-x-0"
                    }`}
                  >
                    <div className="bg-white rounded-lg shadow-lg border-2 border-blue-200 h-full">
                      <div className="p-4 border-b border-gray-200 bg-blue-50 flex justify-between items-center">
                        <h3 className="text-lg font-semibold text-blue-800">
                          Event Registration
                        </h3>
                        <button
                          onClick={handleCloseRegistration}
                          className="text-gray-500 hover:text-gray-700 text-2xl font-bold transition-colors hover:scale-110"
                        >
                          ×
                        </button>
                      </div>
                      <div className="p-6">
                        <RegistrationList
                          eventId={expandedEventId}
                          isInline={true}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                // Normal event card
                <EventCard
                  event={event}
                  onRegister={handleRegister}
                  isExpanded={false}
                  onClose={handleCloseRegistration}
                />
              )}
            </div>
          ))}
        </div>

        {/* Debug JSON display - only show when not expanded */}
        {!expandedEventId && (
          <div className="mt-8 p-4 bg-gray-100 rounded-lg transition-all duration-500">
            <h3 className="text-lg font-semibold mb-2">Debug: Raw JSON Data</h3>
            <pre className="text-xs overflow-auto max-h-96 bg-white p-4 rounded border">
              {JSON.stringify(events, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventDisplay;
