import { EVENT_CARD_CONSTANTS } from "@/constants/eventCard";
import { Event } from "@/lib/types";

type EventCardAdminActionsProps = {
  event: Event;
  isAdmin: boolean;
  onEditClick: () => void;
  onSetPriceClick: () => void;
};

export const EventCardAdminActions = ({
  event,
  isAdmin,
  onEditClick,
  onSetPriceClick,
}: EventCardAdminActionsProps) => {
  if (!isAdmin) return null;

  return (
    <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center text-primary">
          <span className="text-sm font-medium">
            {EVENT_CARD_CONSTANTS.LABELS.ADMIN_ACTIONS}
          </span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onEditClick}
            className="cursor-pointer bg-primary hover:bg-primary/90 text-primary-foreground text-xs px-3 py-1 rounded-md transition-colors font-medium"
          >
            {EVENT_CARD_CONSTANTS.BUTTONS.EDIT}
          </button>

          {event.isActive && (
            <button
              onClick={onSetPriceClick}
              className="cursor-pointer bg-secondary hover:bg-secondary/90 text-white text-xs px-3 py-1 rounded-md transition-colors font-medium"
            >
              {EVENT_CARD_CONSTANTS.BUTTONS.SET_PRICE}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
