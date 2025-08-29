import {
  formatDisplayTimeRange,
  formatDisplayDateLong,
} from "@/utils/dateTime";
import { EVENT_CARD_CONSTANTS } from "@/constants/eventCard";
import { Event, EventRegistrationsResponse } from "@/types";
import type { EventStatus } from "@/constants/eventCard";

interface EventCardDetailsProps {
  event: Event;
  registrationStatus: EventRegistrationsResponse["event"] | undefined;
  eventStatus: EventStatus;
  isEventFull: boolean;
  formatPrice: (price: string) => string;
}

export const EventCardDetails = ({
  event,
  registrationStatus,
  eventStatus,
  isEventFull,
  formatPrice,
}: EventCardDetailsProps) => {
  const renderRegistrationStatus = () => {
    switch (eventStatus) {
      case "loading":
        return (
          <span className="text-primary">
            {EVENT_CARD_CONSTANTS.STATUS.LOADING}
          </span>
        );
      case "error":
        return (
          <span className="text-red-500">
            {EVENT_CARD_CONSTANTS.STATUS.ERROR_LOADING}
          </span>
        );
      default:
        return registrationStatus ? (
          <span
            className={`font-semibold ${
              isEventFull ? "text-secondary" : "text-primary"
            }`}
          >
            {registrationStatus.registrationStatus}
            {isEventFull && EVENT_CARD_CONSTANTS.STATUS.FULL_SUFFIX}
          </span>
        ) : (
          <span className="text-primary">
            {EVENT_CARD_CONSTANTS.STATUS.DEFAULT_REGISTRATIONS}
          </span>
        );
    }
  };

  return (
    <div className="space-y-2 text-card-foreground">
      <div className="flex justify-between">
        <span>{EVENT_CARD_CONSTANTS.LABELS.PRICE}</span>
        <span>{formatPrice(event.price)}</span>
      </div>

      <div className="flex justify-between">
        <span>{EVENT_CARD_CONSTANTS.LABELS.DATE}</span>
        <span>{formatDisplayDateLong(event.startDate)}</span>
      </div>

      <div className="flex justify-between">
        <span>{EVENT_CARD_CONSTANTS.LABELS.TIME}</span>
        <span>{formatDisplayTimeRange(event.startDate, event.endDate)}</span>
      </div>

      {event.location && (
        <div className="flex justify-between">
          <span>{EVENT_CARD_CONSTANTS.LABELS.LOCATION}</span>
          <span>{event.location}</span>
        </div>
      )}

      <div className="flex justify-between">
        <span>{EVENT_CARD_CONSTANTS.LABELS.REGISTRATIONS}</span>
        {renderRegistrationStatus()}
      </div>

      <div className="flex justify-between">
        <span>{EVENT_CARD_CONSTANTS.LABELS.FREQUENCY}</span>
        <span className="capitalize">
          {event.frequency || EVENT_CARD_CONSTANTS.DEFAULTS.FREQUENCY}
        </span>
      </div>
    </div>
  );
};
