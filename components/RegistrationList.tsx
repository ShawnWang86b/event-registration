import { LoadingState, ErrorState } from "@/components/states";
import {
  JoinButton,
  RegisteredUsers,
  WaitlistUsers,
  UserStatus,
} from "@/components/registration";
import { useRegistrationList } from "@/hooks";

type RegistrationListProps = {
  eventId: number;
  isInline?: boolean;
};

const RegistrationList = ({
  eventId,
  isInline = false,
}: RegistrationListProps) => {
  const {
    data,
    registeredUsers,
    waitlistUsers,
    userId,
    isUserRegistered,
    handleJoinEvent,
    handleCancelRegistration,
    isLoading,
    isJoining,
    isCanceling,
    errorMessage,
    hasError,
    hasData,
  } = useRegistrationList(eventId);

  // Loading state
  if (isLoading) {
    return (
      <div
        className={
          isInline
            ? ""
            : "bg-white rounded-lg shadow-md p-6 max-w-4xl w-full mx-auto"
        }
      >
        <LoadingState message="Loading registrations..." fullHeight={false} />
      </div>
    );
  }

  // Error state
  if (hasError || !hasData) {
    return (
      <div
        className={
          isInline
            ? ""
            : "bg-white rounded-lg shadow-md p-6 max-w-4xl w-full mx-auto"
        }
      >
        <ErrorState
          message="Failed to load registration data"
          fullHeight={false}
        />
      </div>
    );
  }

  return (
    <div
      className={
        isInline
          ? ""
          : "bg-white rounded-lg shadow-md p-6 max-w-4xl w-full mx-auto"
      }
    >
      {/* Header - only show for standalone view */}
      {!isInline && data && (
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
      <JoinButton
        onJoin={handleJoinEvent}
        isJoining={isJoining}
        userId={userId}
        isUserRegistered={!!isUserRegistered}
      />

      {/* Error Message */}
      {errorMessage && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {errorMessage}
        </div>
      )}

      {/* User Status */}
      <UserStatus isUserRegistered={!!isUserRegistered} />

      {/* Registered Users */}
      <RegisteredUsers
        users={registeredUsers}
        currentUserId={userId}
        onCancelRegistration={handleCancelRegistration}
        isCanceling={isCanceling}
      />

      {/* Waitlist Users */}
      <WaitlistUsers
        users={waitlistUsers}
        currentUserId={userId}
        onCancelRegistration={handleCancelRegistration}
        isCanceling={isCanceling}
      />
    </div>
  );
};

export default RegistrationList;
