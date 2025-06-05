import { useState } from "react";
import Image from "next/image";
import { useEventRegistrations } from "@/hooks/use-registrations";
import { useCurrentUser } from "@/hooks";
import { Event } from "@/lib/types";
import RegistrationList from "@/components/RegistrationList";
import EndEventDialog from "@/components/EndEventDialog";
import EditEventDialog from "@/components/edit-event-dialog";
import SetPriceDialog from "@/components/SetPriceDialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

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
  // Internal expanded state for the registration section
  const [isRegistrationExpanded, setIsRegistrationExpanded] = useState(false);
  const [isEndDialogOpen, setIsEndDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isSetPriceDialogOpen, setIsSetPriceDialogOpen] = useState(false);

  // Get current user to check admin status
  const { data: currentUserData } = useCurrentUser();
  const isAdmin = currentUserData?.user?.role === "admin";

  // Use TanStack Query for fetching registration status
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

  // Function to get the appropriate image based on location
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
      <div className="bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow duration-200 overflow-hidden">
        {/* Header with close button when externally expanded */}
        {externalExpanded && (
          <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-blue-50">
            <h3 className="text-lg font-semibold text-blue-800">
              Event Details
            </h3>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl font-bold transition-colors hover:scale-110"
            >
              ×
            </button>
          </div>
        )}

        <div className="p-6">
          {/* Admin Actions Bar */}
          {isAdmin && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center text-blue-700">
                  <span className="text-sm font-medium">Admin Actions:</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsEditDialogOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1 rounded-full transition-colors font-medium"
                  >
                    Edit
                  </button>
                  {event.isActive && (
                    <button
                      onClick={() => setIsEndDialogOpen(true)}
                      className="bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-1 rounded-full transition-colors font-medium"
                    >
                      End Event
                    </button>
                  )}
                  {event.isActive && (
                    <button
                      onClick={() => setIsSetPriceDialogOpen(true)}
                      className="bg-yellow-600 hover:bg-yellow-700 text-white text-xs px-3 py-1 rounded-full transition-colors font-medium"
                    >
                      Set Price for group
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Event Image with Title and Description Overlay */}
          <div className="relative mb-6 h-48 rounded-lg overflow-hidden">
            <Image
              src={getLocationImage(event.location)}
              alt={event.location || "Event location"}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 flex flex-col justify-end p-4">
              <h2 className="text-xl font-semibold mb-2 text-white">
                {event.title}
              </h2>
              <p className="text-white text-sm line-clamp-3">
                {event.description}
              </p>
            </div>
          </div>

          {/* Event ended notice */}
          {!event.isActive && (
            <div className="mb-4 p-3 bg-gray-100 border border-gray-300 rounded-lg">
              <div className="text-gray-600 text-sm font-medium text-center">
                🔒 This event has ended
              </div>
            </div>
          )}

          <div className="space-y-2 text-sm text-gray-500">
            <div className="flex justify-between">
              <span className="font-medium">Price:</span>
              <span className="text-green-600 font-semibold">
                ${parseFloat(event.price).toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="font-medium">Date:</span>
              <span>{new Date(event.startDate).toLocaleDateString()}</span>
            </div>

            <div className="flex justify-between">
              <span className="font-medium">Time:</span>
              <span>
                {new Date(event.startDate).toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: false,
                })}{" "}
                -{" "}
                {new Date(event.endDate).toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: false,
                })}
              </span>
            </div>

            {event.location && (
              <div className="flex justify-between">
                <span className="font-medium">Location:</span>
                <span>{event.location}</span>
              </div>
            )}

            <div className="flex justify-between">
              <span className="font-medium">Registrations:</span>
              {loading ? (
                <span className="text-gray-400">Loading...</span>
              ) : error ? (
                <span className="text-red-500">Error loading</span>
              ) : registrationStatus ? (
                <span
                  className={`font-semibold ${
                    isEventFull ? "text-red-600" : "text-blue-600"
                  }`}
                >
                  {registrationStatus.registrationStatus}
                  {isEventFull && " (Full)"}
                </span>
              ) : (
                <span className="text-gray-400">--</span>
              )}
            </div>

            {event.isPeriodic && event.frequency && (
              <div className="flex justify-between">
                <span className="font-medium">Frequency:</span>
                <span className="capitalize">{event.frequency}</span>
              </div>
            )}

            <div className="flex justify-between">
              <span className="font-medium">Status:</span>
              <span
                className={`font-semibold ${
                  event.isActive ? "text-green-600" : "text-red-600"
                }`}
              >
                {event.isActive ? "Active" : "Ended"}
              </span>
            </div>
          </div>

          {/* Register button */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <button
              onClick={handleRegisterClick}
              disabled={loading || !!error}
              className="w-full flex items-center justify-between bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed text-gray-900 font-medium py-2 px-4 rounded-md border border-gray-300 hover:border-gray-400 transition-colors"
            >
              <span>
                {loading
                  ? "Loading..."
                  : isEventFull
                  ? "View Event Details"
                  : "Register for this event"}
              </span>
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>

          {/* Expanded message for external expanded state */}
          {externalExpanded && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="text-center text-blue-600 font-medium">
                📋 Registration details shown below
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
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{event.title}</DialogTitle>
            <DialogDescription>Event Registration Details</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 p-3 rounded border">
                <h3 className="font-medium text-gray-900 text-sm mb-1">
                  Event Date
                </h3>
                <p className="text-gray-600 text-sm">
                  {new Date(event.startDate).toLocaleDateString()}
                </p>
              </div>
              <div className="bg-gray-50 p-3 rounded border">
                <h3 className="font-medium text-gray-900 text-sm mb-1">
                  Price
                </h3>
                <p className="text-gray-600 text-sm font-medium">
                  ${parseFloat(event.price).toFixed(2)}
                </p>
              </div>
            </div>

            {event.location && (
              <div className="bg-gray-50 p-3 rounded border">
                <h3 className="font-medium text-gray-900 text-sm mb-1">
                  Location
                </h3>
                <p className="text-gray-600 text-sm">{event.location}</p>
              </div>
            )}

            {/* Registration List */}
            <div className="border rounded-md p-3">
              <h3 className="text-sm font-medium text-gray-900 mb-3">
                Event Registrations
              </h3>
              <RegistrationList eventId={event.id} isInline={true} />
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* End Event Dialog */}
      <EndEventDialog
        event={event}
        isOpen={isEndDialogOpen}
        onClose={() => setIsEndDialogOpen(false)}
      />

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
