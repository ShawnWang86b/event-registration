import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Event } from "@/lib/types";
import RegistrationList from "@/components/RegistrationList";
import EditEventDialog from "@/components/EditEvent";
import SetPriceDialog from "@/components/SetPrice";
import {
  formatDisplayTimeRange,
  formatDisplayDateLong,
} from "@/utils/dateTime";
import { useEventCard } from "@/hooks/use-event-card";
import { EVENT_CARD_CONSTANTS } from "@/constants/eventCard";
import {
  EventCardHeader,
  EventCardAdminActions,
  EventCardImage,
  EventCardDetails,
  EventCardRegisterButton,
} from "@/components/event-card";
import { withErrorBoundary } from "@/components/ErrorBoundary";

type EventCardProps = {
  event: Event;
  onRegister?: (eventId: number) => void;
  isExpanded?: boolean;
  onClose?: () => void;
};

const EventCard = ({
  event,
  onRegister,
  isExpanded: externalExpanded = false,
  onClose,
}: EventCardProps) => {
  const {
    state,
    isAdmin,
    registrationStatus,
    isEventFull,
    eventStatus,
    buttonState,
    loading,
    error,
    handleRegisterClick,
    toggleEditDialog,
    toggleSetPriceDialog,
    toggleRegistrationDialog,
    getLocationImage,
    formatPrice,
  } = useEventCard({ event, onRegister });

  return (
    <>
      <div className="bg-card rounded-lg border-border border overflow-hidden">
        {/* Header with close button when externally expanded */}
        <EventCardHeader isExpanded={externalExpanded} onClose={onClose} />

        <div className="p-6">
          {/* Admin Actions Bar */}
          <EventCardAdminActions
            event={event}
            isAdmin={isAdmin}
            onEditClick={() => toggleEditDialog(true)}
            onSetPriceClick={() => toggleSetPriceDialog(true)}
          />

          {/* Event Image with Title and Description Overlay */}
          <EventCardImage
            imageSrc={getLocationImage(event.location)}
            location={event.location}
            title={event.title}
            description={event.description}
          />

          {/* Event Details */}
          <EventCardDetails
            event={event}
            registrationStatus={registrationStatus}
            eventStatus={eventStatus}
            isEventFull={!!isEventFull}
            formatPrice={formatPrice}
          />

          {/* Register button */}
          <EventCardRegisterButton
            buttonState={buttonState}
            onClick={handleRegisterClick}
            disabled={loading || !!error}
          />

          {/* Expanded mode placeholder */}
          {externalExpanded && (
            <div className="mt-4 pt-4">
              <div className="text-center text-primary">
                {EVENT_CARD_CONSTANTS.STATUS.COMING_SOON}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Registration Details Dialog */}
      <Dialog
        open={state.isRegistrationExpanded}
        onOpenChange={toggleRegistrationDialog}
      >
        <DialogContent className="max-w-[90vw] sm:max-w-md md:max-w-lg lg:max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{event.title}</DialogTitle>
            <DialogDescription className="text-card-foreground">
              {EVENT_CARD_CONSTANTS.LABELS.REGISTRATION_DETAILS}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-card p-3 rounded border">
                <h3 className="font-semibold text-card-foreground text-sm mb-1">
                  {EVENT_CARD_CONSTANTS.LABELS.DATE}
                </h3>
                <p className="text-primary text-sm font-medium">
                  {formatDisplayDateLong(event.startDate)}
                </p>
              </div>
              <div className="bg-card p-3 rounded border">
                <h3 className="font-semibold text-card-foreground text-sm mb-1">
                  {EVENT_CARD_CONSTANTS.LABELS.TIME}
                </h3>
                <p className="text-primary text-sm font-medium">
                  {formatDisplayTimeRange(event.startDate, event.endDate)}
                </p>
              </div>
            </div>

            {event.location && (
              <div className="bg-card p-3 rounded border">
                <h3 className="font-semibold text-card-foreground text-sm mb-1">
                  {EVENT_CARD_CONSTANTS.LABELS.LOCATION}
                </h3>
                <p className="text-primary text-sm">{event.location}</p>
              </div>
            )}

            {/* Registration List */}
            <div className="border rounded-md p-3">
              <h3 className="text-sm font-medium text-foreground mb-3">
                {EVENT_CARD_CONSTANTS.LABELS.EVENT_REGISTRATIONS}
              </h3>
              <RegistrationList eventId={event.id} isInline={true} />
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Event Dialog */}
      <EditEventDialog
        event={event}
        isOpen={state.isEditDialogOpen}
        onClose={() => toggleEditDialog(false)}
      />

      {/* Set Price Dialog */}
      <SetPriceDialog
        event={event}
        isOpen={state.isSetPriceDialogOpen}
        onClose={() => toggleSetPriceDialog(false)}
      />
    </>
  );
};

// Export wrapped component with error boundary
const EventCardWithErrorBoundary = withErrorBoundary(
  EventCard,
  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
    <h3 className="text-red-800 font-semibold mb-2">Failed to load event</h3>
    <p className="text-red-600 text-sm">
      There was an error displaying this event. Please try refreshing the page.
    </p>
  </div>
);

EventCardWithErrorBoundary.displayName = "EventCard";

export default EventCardWithErrorBoundary;
