import EventDisplay from "@/components/EventDisplay";
import EventCalendar from "@/components/EventCalendar";
import { EVENT_DISPLAY_CONSTANTS } from "@/constants/eventDisplay";

export default function EventsPage() {
  return (
    <div className="min-h-screen min-w-[90vw] lg:w-auto p-0 pt-10 lg:p-16">
      <h1 className="text-lg lg:text-3xl font-bold text-secondary-foreground">
        {EVENT_DISPLAY_CONSTANTS.TEXT.TITLE}
      </h1>
      <p className="text-primary text-sm lg:text-lg mt-2">
        {EVENT_DISPLAY_CONSTANTS.TEXT.SUBTITLE}
      </p>

      <EventDisplay />
    </div>
  );
}
