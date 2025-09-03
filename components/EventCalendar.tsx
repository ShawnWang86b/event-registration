"use client";

import { useState, useEffect, useRef } from "react";
import { Calendar, dateFnsLocalizer, View } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { format } from "date-fns/format";
import { parse } from "date-fns/parse";
import { startOfWeek } from "date-fns/startOfWeek";
import { getDay } from "date-fns/getDay";
import { enUS } from "date-fns/locale/en-US";
import type { Event } from "@/types";
import EventCard from "@/components/EventCard";

const locales = {
  "en-US": enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

type EventCalendarProps = {
  events: Event[];
  isAdmin: boolean;
  onCreateClick: () => void;
};

const EventCalendar = ({
  events,
  isAdmin,
  onCreateClick,
}: EventCalendarProps) => {
  // Calendar view state
  const [view, setView] = useState<View>("month");
  const [date, setDate] = useState(new Date());

  // Event card popup state
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [clickPosition, setClickPosition] = useState({ x: 0, y: 0 });
  const [isEventCardVisible, setIsEventCardVisible] = useState(false);
  const calendarRef = useRef<HTMLDivElement>(null);

  // Transform events data for react-big-calendar
  const calendarEvents = events.map((event) => ({
    id: event.id,
    title: event.title,
    start: new Date(event.startDate),
    end: new Date(event.endDate),
    resource: event, // Keep original event data for potential use
  }));

  // Handle event selection
  const handleSelectEvent = (event: any) => {
    console.log("Selected event:", event);
    // You can add navigation or modal opening logic here
  };

  // Handle empty slot selection for creating new events
  const handleSelectSlot = (slotInfo: any) => {
    if (isAdmin) {
      console.log("Selected slot:", slotInfo);
      // You could open create event modal with pre-filled dates
      onCreateClick();
    }
  };

  // Handle view change (Month/Week/Day)
  const handleViewChange = (newView: View) => {
    setView(newView);
  };

  // Handle date navigation (Next/Back)
  const handleNavigate = (newDate: Date) => {
    setDate(newDate);
  };

  // Handle click outside to close event card
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      // Don't close if clicking on the event card itself or an event
      if (target.closest("[data-event-card]") || target.closest(".rbc-event")) {
        return;
      }

      setIsEventCardVisible(false);
      setSelectedEvent(null);
    };

    if (isEventCardVisible) {
      document.addEventListener("click", handleClickOutside);
    }

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [isEventCardVisible]);

  // Event click handlers
  useEffect(() => {
    const calendarElement = calendarRef.current;
    if (!calendarElement) return;

    const handleEventClick = (e: unknown) => {
      const mouseEvent = e as MouseEvent;
      const eventElement = (mouseEvent.target as HTMLElement).closest(
        ".rbc-event"
      );
      if (!eventElement) return;

      // Prevent event bubbling to avoid triggering click outside
      mouseEvent.stopPropagation();

      // Get the event title to find the corresponding event data
      const eventTitle =
        eventElement.querySelector(".rbc-event-content")?.textContent;
      if (!eventTitle) return;

      // Find the full event data
      const fullEvent = events.find((event) => event.title === eventTitle);
      if (!fullEvent) return;

      // Show event card at click position
      setSelectedEvent(fullEvent);
      setClickPosition({ x: mouseEvent.clientX, y: mouseEvent.clientY });
      setIsEventCardVisible(true);
    };

    // Add event listeners to all event elements
    const addEventListeners = () => {
      const eventElements = calendarElement.querySelectorAll(".rbc-event");
      eventElements.forEach((element) => {
        element.addEventListener("click", handleEventClick);
      });
    };

    // Initial setup
    addEventListeners();

    // Re-setup listeners when calendar re-renders (view changes, navigation, etc.)
    const observer = new MutationObserver(() => {
      // Remove old listeners first
      const eventElements = calendarElement.querySelectorAll(".rbc-event");
      eventElements.forEach((element) => {
        element.removeEventListener("click", handleEventClick);
      });

      // Add new listeners
      setTimeout(addEventListeners, 0);
    });

    observer.observe(calendarElement, {
      childList: true,
      subtree: true,
    });

    return () => {
      observer.disconnect();

      // Clean up event listeners
      const eventElements = calendarElement.querySelectorAll(".rbc-event");
      eventElements.forEach((element) => {
        element.removeEventListener("click", handleEventClick);
      });
    };
  }, [events, view, date]);

  // Event card handlers
  const handleEventCardClose = () => {
    setIsEventCardVisible(false);
    setSelectedEvent(null);
  };

  const handleEventRegister = (eventId: number) => {
    console.log("Register for event:", eventId);
    // TODO: Handle registration logic
  };

  return (
    <div className="w-full relative">
      <div className="transition-all duration-300 ease-in-out">
        <div className="flex justify-center" ref={calendarRef}>
          <Calendar
            className="bg-card p-4 rounded-md border border-border text-foreground"
            localizer={localizer}
            events={calendarEvents}
            startAccessor="start"
            endAccessor="end"
            titleAccessor="title"
            style={{ height: "70vh", width: "100%" }}
            view={view}
            date={date}
            onView={handleViewChange}
            onNavigate={handleNavigate}
            onSelectEvent={handleSelectEvent}
            onSelectSlot={handleSelectSlot}
            selectable={isAdmin}
            popup
            toolbar={true}
            views={["month", "week", "day"]}
            defaultView="month"
            step={60}
            timeslots={1}
          />
        </div>
      </div>

      {/* Event Card Popup */}
      {selectedEvent && isEventCardVisible && (
        <div
          data-event-card
          className="fixed z-50 pointer-events-auto w-[380px] max-h-[580px]"
          style={{
            left: Math.max(
              10,
              Math.min(clickPosition.x + 10, window.innerWidth - 390)
            ),
            top: Math.max(
              10,
              Math.min(clickPosition.y - 590, window.innerHeight - 590)
            ),
          }}
        >
          <div className="animate-in fade-in-0 zoom-in-95">
            <EventCard
              event={selectedEvent}
              onRegister={handleEventRegister}
              isExpanded={true}
              onClose={handleEventCardClose}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default EventCalendar;
