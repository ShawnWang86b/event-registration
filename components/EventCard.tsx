import { useState } from "react";
import Image from "next/image";
import { useEventRegistrations } from "@/hooks/use-registrations";
import { useCurrentUser } from "@/hooks";
import { Event } from "@/lib/types";
import RegistrationList from "@/components/RegistrationList";
import EndEventDialog from "@/components/EndEventDialog";
import EditEventDialog from "@/components/edit-event-dialog";

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
    // Toggle the registration section
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
      <div className="bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-all duration-300 overflow-hidden">
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

          {/* Expand Details button - similar to the design */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <button
              onClick={handleRegisterClick}
              disabled={loading || !!error}
              className="w-full flex items-center justify-between bg-gray-50 hover:bg-gray-100 disabled:bg-gray-200 disabled:cursor-not-allowed text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors border border-gray-200"
            >
              <span>
                {loading
                  ? "Loading..."
                  : isEventFull
                  ? "View Event Details"
                  : "Register for this event"}
              </span>
              <svg
                className={`w-5 h-5 transition-transform duration-200 ${
                  isRegistrationExpanded ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
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

        {/* Expandable Registration Section */}
        <div
          className={`transition-all duration-300 ease-in-out overflow-hidden ${
            isRegistrationExpanded
              ? "max-h-[2000px] opacity-100"
              : "max-h-0 opacity-0"
          }`}
        >
          <div className="border-t border-gray-200 bg-gray-50">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                Event Registration
              </h3>
              <RegistrationList eventId={event.id} isInline={true} />
            </div>
          </div>
        </div>
      </div>

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
    </>
  );
};

export default EventCard;
