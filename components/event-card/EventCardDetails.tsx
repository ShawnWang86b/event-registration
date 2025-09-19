import {
  formatDisplayTimeRange,
  formatDisplayDateLong,
} from "@/utils/dateTime";
import { EVENT_CARD_CONSTANTS } from "@/constants/eventCard";
import { Event, EventRegistrationsResponse } from "@/types";
import type { EventStatus } from "@/constants/eventCard";
import { useTranslations } from "next-intl";

type EventCardDetailsProps = {
  event: Event;
  registrationStatus: EventRegistrationsResponse["event"] | undefined;
  eventStatus: EventStatus;
  isEventFull: boolean;
  formatPrice: (price: string) => string;
};

export const EventCardDetails = ({
  event,
  registrationStatus,
  eventStatus,
  isEventFull,
  formatPrice,
}: EventCardDetailsProps) => {
  const t = useTranslations("EventsPage.eventDetails");
  const tStatus = useTranslations("EventsPage");
  const renderRegistrationStatus = () => {
    switch (eventStatus) {
      case "loading":
        return <span className="text-primary">{tStatus("loading")}</span>;
      case "error":
        return <span className="text-red-500">{tStatus("error")}</span>;
      default:
        return registrationStatus ? (
          <span
            className={`font-semibold ${
              isEventFull ? "text-secondary" : "text-primary"
            }`}
          >
            {registrationStatus.registrationStatus}
            {isEventFull && tStatus("full")}
          </span>
        ) : (
          <span className="text-primary">{tStatus("default")}</span>
        );
    }
  };

  return (
    <div className="space-y-2 text-card-foreground">
      <div className="flex justify-between">
        <span>{t("price")}</span>
        <span>{formatPrice(event.price)}</span>
      </div>

      <div className="flex justify-between">
        <span>{t("date")}</span>
        <span>{formatDisplayDateLong(event.startDate)}</span>
      </div>

      <div className="flex justify-between">
        <span>{t("time")}</span>
        <span>{formatDisplayTimeRange(event.startDate, event.endDate)}</span>
      </div>

      {event.location && (
        <div className="flex justify-between">
          <span>{t("location")}</span>
          <span>{event.location}</span>
        </div>
      )}

      <div className="flex justify-between">
        <span>{t("registrations")}</span>
        {renderRegistrationStatus()}
      </div>

      <div className="flex justify-between">
        <span>{t("frequency")}</span>
        <span className="capitalize">
          {event.frequency || EVENT_CARD_CONSTANTS.DEFAULTS.FREQUENCY}
        </span>
      </div>
    </div>
  );
};
