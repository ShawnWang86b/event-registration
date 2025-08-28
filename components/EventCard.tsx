import { useState } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { MoveRight, X } from "lucide-react";
import { useEventRegistrations } from "@/hooks/use-registrations";
import { useCurrentUser } from "@/hooks";
import { Event } from "@/lib/types";
import RegistrationList from "@/components/RegistrationList";
import EditEventDialog from "@/components/EditEvent";
import SetPriceDialog from "@/components/SetPrice";
import {
  formatDisplayDate,
  formatDisplayTimeRange,
  formatDisplayDateLong,
  formatDisplayTime12Hour,
} from "@/utils/dateTime";
import { Button } from "./ui/button";

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
  const [isRegistrationExpanded, setIsRegistrationExpanded] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isSetPriceDialogOpen, setIsSetPriceDialogOpen] = useState(false);

  // Get current user to check admin status
  const { data: currentUserData } = useCurrentUser();
  const isAdmin = currentUserData?.user?.role === "admin";

  const {
    data: registrationData,
    isLoading: loading,
    error,
  } = useEventRegistrations(event.id);

  const handleRegisterClick = () => {
    if (onRegister && !isRegistrationExpanded) {
      onRegister(event.id);
    }
    // Toggle the registration popup
    setIsRegistrationExpanded(!isRegistrationExpanded);
  };

  // Extract registration status from the query data
  const registrationStatus = registrationData?.event;
  const isEventFull =
    registrationStatus &&
    registrationStatus.currentRegistrations >= registrationStatus.maxAttendees;

  // Hard Code here for now, will modify it in multi-tenant version
  const getLocationImage = (location: string | null | undefined) => {
    if (!location) return "/stadium/default.jpg";

    const normalizedLocation = location.toLowerCase();
    if (normalizedLocation.includes("box hill")) {
      return "/stadium/box-hill.jpg";
    } else if (normalizedLocation.includes("vermont south")) {
      return "/stadium/vermont-south.jpg";
    }
    return "/stadium/default.jpg";
  };

  return (
    <>
      <div className="bg-card rounded-lg border-border border overflow-hidden">
        {/* Header with close button when externally expanded */}
        {externalExpanded && (
          <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-blue-50">
            <h3 className="text-lg font-semibold text-primary">
              Event Details
            </h3>
            <Button
              variant="ghost"
              size="icon"
              className="cursor-pointer"
              onClick={onClose}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}

        <div className="p-6">
          {/* Admin Actions Bar */}
          {isAdmin && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center text-primary">
                  <span className="text-sm font-medium">Admin Actions:</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsEditDialogOpen(true)}
                    className="cursor-pointer bg-primary hover:bg-primary/90 text-primary-foreground text-xs px-3 py-1 rounded-md transition-colors font-medium"
                  >
                    Edit
                  </button>

                  {event.isActive && (
                    <button
                      onClick={() => setIsSetPriceDialogOpen(true)}
                      className="cursor-pointer bg-secondary hover:bg-secondary/90 text-white text-xs px-3 py-1 rounded-md transition-colors font-medium"
                    >
                      Set Price
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Event Image with Title and Description Overlay - Large screens only */}
          <div className="relative mb-6 h-48 rounded-lg overflow-hidden">
            <Image
              src={getLocationImage(event.location)}
              alt={event.location || "Event location"}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 flex flex-col justify-end p-4 bg-gradient-to-t from-black/60 to-transparent">
              <h2 className="text-xl font-semibold mb-2 text-primary-foreground">
                {event.title}
              </h2>
              <p className="text-primary-foreground line-clamp-3">
                {event.description}
              </p>
            </div>
          </div>

          <div className="space-y-2 text-card-foreground">
            <div className="flex justify-between">
              <span>Price:</span>
              <span>${parseFloat(event.price).toFixed(2)}</span>
            </div>

            <div className="flex justify-between">
              <span>Date:</span>
              <span>{formatDisplayDateLong(event.startDate)}</span>
            </div>

            <div className="flex justify-between">
              <span>Time:</span>
              <span>
                {formatDisplayTimeRange(event.startDate, event.endDate)}
              </span>
            </div>

            {event.location && (
              <div className="flex justify-between">
                <span>Location:</span>
                <span>{event.location}</span>
              </div>
            )}

            <div className="flex justify-between">
              <span>Registrations:</span>
              {loading ? (
                <span className="text-primary">Loading...</span>
              ) : error ? (
                <span className="text-red-500">Error loading</span>
              ) : registrationStatus ? (
                <span
                  className={`font-semibold ${
                    isEventFull ? "text-secondary" : "text-primary"
                  }`}
                >
                  {registrationStatus.registrationStatus}
                  {isEventFull && " (Full)"}
                </span>
              ) : (
                <span className="text-primary">--</span>
              )}
            </div>

            <div className="flex justify-between">
              <span>Frequency:</span>
              <span className="capitalize">
                {event.frequency ? event.frequency : "one time"}
              </span>
            </div>
          </div>

          {/* Register button */}
          <div className="mt-4 pt-4">
            <button
              onClick={handleRegisterClick}
              disabled={loading || !!error}
              className="text-lg w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 disabled:bg-gray-100 disabled:cursor-not-allowed text-popover font-medium py-2 px-4 rounded-md border hover:cursor-pointer transition-colors"
            >
              <span>
                {loading
                  ? "Loading..."
                  : isEventFull
                  ? "View Event Details"
                  : "Register for this event"}
              </span>
              <MoveRight className="w-4 h-4" />
            </button>
          </div>

          {/* will design a better way */}
          {externalExpanded && (
            <div className="mt-4 pt-4">
              <div className="text-center text-primary">
                Registration details shown below, coming soon...
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Registration Details Dialog */}
      <Dialog
        open={isRegistrationExpanded}
        onOpenChange={setIsRegistrationExpanded}
      >
        <DialogContent className="max-w-[90vw] sm:max-w-md md:max-w-lg lg:max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{event.title}</DialogTitle>
            <DialogDescription className="text-card-foreground">
              Event Registration Details
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-card p-3 rounded border">
                <h3 className="font-semibold text-card-foreground text-sm mb-1">
                  Date
                </h3>
                <p className="text-primary text-sm font-medium">
                  {formatDisplayDateLong(event.startDate)}
                </p>
              </div>
              <div className="bg-card p-3 rounded border">
                <h3 className="font-semibold text-card-foreground text-sm mb-1">
                  Time
                </h3>
                <p className="text-primary text-sm font-medium">
                  {formatDisplayTimeRange(event.startDate, event.endDate)}
                </p>
              </div>
            </div>

            {event.location && (
              <div className="bg-card p-3 rounded border">
                <h3 className="font-semibold text-card-foreground text-sm mb-1">
                  Location
                </h3>
                <p className="text-primary text-sm">{event.location}</p>
              </div>
            )}

            {/* Registration List */}
            <div className="border rounded-md p-3">
              <h3 className="text-sm font-medium text-foreground mb-3">
                Event Registrations
              </h3>
              <RegistrationList eventId={event.id} isInline={true} />
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Event Dialog */}
      <EditEventDialog
        event={event}
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
      />

      {/* Set Price Dialog */}
      <SetPriceDialog
        event={event}
        isOpen={isSetPriceDialogOpen}
        onClose={() => setIsSetPriceDialogOpen(false)}
      />
    </>
  );
};

export default EventCard;
