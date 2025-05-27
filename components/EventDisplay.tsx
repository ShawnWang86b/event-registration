"use client";

import { useState, useEffect } from "react";
import EventCard from "./EventCard";

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
    console.log(`Registering for event ${eventId}`);
    // TODO: Implement registration logic
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
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {events.map((event) => (
          <EventCard key={event.id} event={event} onRegister={handleRegister} />
        ))}
      </div>

      {/* Debug JSON display */}
      <div className="mt-8 p-4 bg-gray-100 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Debug: Raw JSON Data</h3>
        <pre className="text-xs overflow-auto max-h-96 bg-white p-4 rounded border">
          {JSON.stringify(events, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default EventDisplay;
