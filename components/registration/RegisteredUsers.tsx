import { useTranslations } from "next-intl";
import { UserCard } from "./UserCard";

type Registration = {
  id: number;
  userId: string;
  user: { name: string; email: string; role?: string };
  registrationDate: string;
};

type RegisteredUsersProps = {
  users: Registration[];
  currentUserId: string | null | undefined;
  isAdmin?: boolean;
  onCancelRegistration: () => void;
  onDeleteGuest?: (registrationId: number) => void;
  isCanceling: boolean;
  isDeletingGuest?: boolean;
};

export const RegisteredUsers = ({
  users,
  currentUserId,
  isAdmin = false,
  onCancelRegistration,
  onDeleteGuest,
  isCanceling,
  isDeletingGuest = false,
}: RegisteredUsersProps) => {
  const t = useTranslations("EventsPage.registrationDetails");
  return (
    <div className="mb-6">
      <h3 className="text-sm mb-3">
        {t("registeredAttendees")} ({users.length})
      </h3>
      {users.length > 0 ? (
        <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto">
          {users.map((registration, index) => (
            <UserCard
              key={registration.id}
              user={registration}
              index={index}
              isCurrentUser={registration.userId === currentUserId}
              isAdmin={isAdmin}
              onCancel={onCancelRegistration}
              onDeleteGuest={
                onDeleteGuest ? () => onDeleteGuest(registration.id) : undefined
              }
              isCanceling={isCanceling}
              isDeletingGuest={isDeletingGuest}
            />
          ))}
        </div>
      ) : (
        <div className="text-gray-500 text-center py-4">
          No registered attendees yet
        </div>
      )}
    </div>
  );
};
