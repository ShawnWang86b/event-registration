import { useAuth } from "@clerk/nextjs";
import {
  useEventRegistrations,
  useJoinEvent,
  useCancelEventRegistration,
} from "@/hooks/use-registrations";
import React from "react";

interface RegistrationListProps {
  eventId: number;
  isInline?: boolean;
}

const RegistrationList = ({
  eventId,
  isInline = false,
}: RegistrationListProps) => {
  const { userId } = useAuth();

  // Use TanStack Query for data fetching
  const {
    data,
    isLoading: loading,
    error: queryError,
    refetch,
  } = useEventRegistrations(eventId);

  // Debug: Log summary data changes
  React.useEffect(() => {
    if (data?.summary) {
      console.log("Summary updated:", {
        registeredCount: data.summary.registeredCount,
        waitlistCount: data.summary.waitlistCount,
        availableSpots: data.summary.availableSpots,
        totalRegistrations: data.summary.totalRegistrations,
      });
    }
  }, [data?.summary]);

  // Mutations
  const joinEventMutation = useJoinEvent();
  const cancelRegistrationMutation = useCancelEventRegistration();

  // Convert query error to string for display
  const error = queryError ? "Error loading registrations" : null;
  const registering = joinEventMutation.isPending;

  const handleJoinEvent = async () => {
    if (!userId) {
      return;
    }

    try {
      await joinEventMutation.mutateAsync({
        eventId: eventId,
      });
    } catch (error) {
      console.error("Error registering for event:", error);
    }
  };

  const handleCancelRegistration = async () => {
    if (!userId) {
      return;
    }

    try {
      await cancelRegistrationMutation.mutateAsync(eventId);
    } catch (error) {
      console.error("Error canceling registration:", error);
    }
  };

  const isUserRegistered = data?.registrations.some(
    (reg) => reg.userId === userId && reg.status !== "canceled"
  );

  // Display mutation errors with more specific messages
  const getErrorMessage = () => {
    if (error) return error;
    if (joinEventMutation.error) {
      return "Failed to join event. Please try again.";
    }
    if (cancelRegistrationMutation.error) {
      return "Failed to cancel registration. Please try again.";
    }
    return null;
  };

  const displayError = getErrorMessage();

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-gray-500">Loading registrations...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center p-8 text-red-500">
        Failed to load registration data
      </div>
    );
  }

  const registeredUsers = data.registrations.filter(
    (reg) => reg.status === "registered"
  );
  const waitlistUsers = data.registrations.filter(
    (reg) => reg.status === "waitlist"
  );

  return (
    <div className={isInline ? "" : "bg-white rounded-lg shadow-md p-6"}>
      {/* Header - only show for standalone view */}
      {!isInline && (
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              {data.event.title}
            </h2>
            <p className="text-gray-600">
              Registrations: {data.event.registrationStatus}
            </p>
          </div>
        </div>
      )}

      {/* Join Event Button */}
      {!isUserRegistered && (
        <div className="mb-6">
          <button
            onClick={handleJoinEvent}
            disabled={registering || !userId}
            className="flex items-center gap-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white font-medium py-3 px-6 rounded-lg transition-colors w-full justify-center text-lg"
          >
            <span className="text-xl">+</span>
            {!userId
              ? "Sign in to join"
              : registering
              ? "Joining..."
              : "Join This Event"}
          </button>
        </div>
      )}

      {/* Error Message */}
      {displayError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {displayError}
        </div>
      )}

      {/* User Status */}
      {isUserRegistered && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="text-green-800 font-medium text-center">
            ✅ You are registered for this event!
          </div>
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-3 rounded-lg text-center">
          <div className="text-2xl font-bold text-blue-600">
            {data.summary.registeredCount}
          </div>
          <div className="text-sm text-gray-600">Registered</div>
        </div>
        <div className="bg-yellow-50 p-3 rounded-lg text-center">
          <div className="text-2xl font-bold text-yellow-600">
            {data.summary.waitlistCount}
          </div>
          <div className="text-sm text-gray-600">Waitlist</div>
        </div>
        <div className="bg-green-50 p-3 rounded-lg text-center">
          <div className="text-2xl font-bold text-green-600">
            {data.summary.availableSpots}
          </div>
          <div className="text-sm text-gray-600">Available</div>
        </div>
        <div className="bg-gray-50 p-3 rounded-lg text-center">
          <div className="text-2xl font-bold text-gray-600">
            {data.summary.totalRegistrations}
          </div>
          <div className="text-sm text-gray-600">Total</div>
        </div>
      </div>

      {/* Registered Users */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">
          Registered Attendees ({registeredUsers.length})
        </h3>
        {registeredUsers.length > 0 ? (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {registeredUsers.map((registration, index) => (
              <div
                key={registration.id}
                className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-medium text-gray-800">
                      {registration.user.name}
                      {registration.userId === userId && (
                        <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                          You
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600">
                      {registration.user.email}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-sm text-gray-500">
                    {new Date(
                      registration.registrationDate
                    ).toLocaleDateString()}
                  </div>
                  {registration.userId === userId && (
                    <button
                      onClick={handleCancelRegistration}
                      disabled={cancelRegistrationMutation.isPending}
                      className="bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white text-xs px-3 py-1 rounded-full transition-colors"
                    >
                      {cancelRegistrationMutation.isPending
                        ? "Canceling..."
                        : "Cancel"}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-gray-500 text-center py-4">
            No registered attendees yet
          </div>
        )}
      </div>

      {/* Waitlist Users */}
      {waitlistUsers.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            Waitlist ({waitlistUsers.length})
          </h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {waitlistUsers.map((registration, index) => (
              <div
                key={registration.id}
                className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-yellow-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                    W{index + 1}
                  </div>
                  <div>
                    <div className="font-medium text-gray-800">
                      {registration.user.name}
                      {registration.userId === userId && (
                        <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                          You
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600">
                      {registration.user.email}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-sm text-gray-500">
                    {new Date(
                      registration.registrationDate
                    ).toLocaleDateString()}
                  </div>
                  {registration.userId === userId && (
                    <button
                      onClick={handleCancelRegistration}
                      disabled={cancelRegistrationMutation.isPending}
                      className="bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white text-xs px-3 py-1 rounded-full transition-colors"
                    >
                      {cancelRegistrationMutation.isPending
                        ? "Canceling..."
                        : "Cancel"}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RegistrationList;
