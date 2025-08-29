import { CalendarPlus } from "lucide-react";
import { EVENT_DISPLAY_CONSTANTS } from "@/constants/eventDisplay";

type EventDisplayHeaderProps = {
  isAdmin: boolean;
  onCreateClick: () => void;
};

/**
 * Header component for EventDisplay
 * Contains title, subtitle, and admin create button
 */
export const EventDisplayHeader = ({
  isAdmin,
  onCreateClick,
}: EventDisplayHeaderProps) => {
  return (
    <div className="flex items-start justify-between mb-8">
      <div>
        <h1 className="text-3xl font-bold text-secondary-foreground">
          {EVENT_DISPLAY_CONSTANTS.TEXT.TITLE}
        </h1>
        <p className="text-primary text-lg mt-2">
          {EVENT_DISPLAY_CONSTANTS.TEXT.SUBTITLE}
        </p>
      </div>

      {/* Admin-only Create Event Button */}
      {isAdmin && (
        <button
          onClick={onCreateClick}
          className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-sm p-4 rounded-full transition-colors hover:cursor-pointer"
          aria-label={EVENT_DISPLAY_CONSTANTS.CREATE_BUTTON.ARIA_LABEL}
          type="button"
        >
          <CalendarPlus
            size={EVENT_DISPLAY_CONSTANTS.CREATE_BUTTON.ICON_SIZE}
          />
        </button>
      )}
    </div>
  );
};
