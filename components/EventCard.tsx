import { useState, useEffect } from "react";

interface Event {
  id: number;
  title: string;
  description: string;
  price: string;
  startDate: string;
  endDate: string;
  location?: string;
  isPeriodic: boolean;
  frequency?: string;
  maxAttendees: number;
  createdById: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface RegistrationStatus {
  currentRegistrations: number;
  maxAttendees: number;
  registrationStatus: string;
}

interface EventCardProps {
  event: Event;
  onRegister?: (eventId: number) => void;
  isExpanded?: boolean;
  onClose?: () => void;
}

const EventCard = ({
  event,
  onRegister,
  isExpanded = false,
  onClose,
}: EventCardProps) => {
  const [registrationStatus, setRegistrationStatus] =
    useState<RegistrationStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRegistrationStatus = async () => {
      try {
        const response = await fetch(`/api/registrations/${event.id}`);
        if (response.ok) {
          const data = await response.json();
          setRegistrationStatus({
            currentRegistrations: data.event.currentRegistrations,
            maxAttendees: data.event.maxAttendees,
            registrationStatus: data.event.registrationStatus,
          });
        }
      } catch (error) {
        console.error("Error fetching registration status:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRegistrationStatus();
  }, [event.id]);

  const handleRegisterClick = () => {
    if (onRegister) {
      onRegister(event.id);
    }
  };

  const isEventFull =
    registrationStatus &&
    registrationStatus.currentRegistrations >= registrationStatus.maxAttendees;

  return (
    <div
      className={`bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-all duration-300 ${
        isExpanded ? "shadow-xl border-blue-300 transform scale-105" : ""
      }`}
    >
      {/* Header with close button when expanded */}
      {isExpanded && (
        <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-blue-50">
          <h3 className="text-lg font-semibold text-blue-800">Event Details</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold transition-colors hover:scale-110"
          >
            ×
          </button>
        </div>
      )}

      <div className="p-6">
        <h2 className="text-xl font-semibold mb-2 text-gray-800">
          {event.title}
        </h2>
        <p className="text-gray-600 mb-4 line-clamp-3">{event.description}</p>

        <div className="space-y-2 text-sm text-gray-500">
          <div className="flex justify-between">
            <span className="font-medium">Price:</span>
            <span className="text-green-600 font-semibold">
              ${parseFloat(event.price).toFixed(2)}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="font-medium">Start:</span>
            <span>{new Date(event.startDate).toLocaleDateString()}</span>
          </div>

          <div className="flex justify-between">
            <span className="font-medium">End:</span>
            <span>{new Date(event.endDate).toLocaleDateString()}</span>
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
        </div>

        {/* Action buttons - only show register button when not expanded */}
        {!isExpanded && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <button
              onClick={handleRegisterClick}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded transition-colors"
            >
              Register for Event
            </button>
          </div>
        )}

        {/* Expanded state message */}
        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="text-center text-blue-600 font-medium">
              📋 Registration details shown below
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventCard;
