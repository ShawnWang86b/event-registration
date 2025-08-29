import { Event } from "@/types";
import EventCard from "@/components/EventCard";

type EventGridProps = {
  events: Event[];
  onEventRegister?: (eventId: number) => void;
};

export const EventGrid = ({ events, onEventRegister }: EventGridProps) => {
  if (events.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      {events.map((event) => (
        <EventCard key={event.id} event={event} onRegister={onEventRegister} />
      ))}
    </div>
  );
};
