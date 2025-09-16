import { UserCard } from "./UserCard";

type Registration = {
  id: number;
  userId: string;
  user: { name: string; email: string; role?: string };
  registrationDate: string;
};

type WaitlistUsersProps = {
  users: Registration[];
  currentUserId: string | null | undefined;
  isAdmin?: boolean;
  onCancelRegistration: () => void;
  onDeleteGuest?: (registrationId: number) => void;
  isCanceling: boolean;
  isDeletingGuest?: boolean;
};

export const WaitlistUsers = ({
  users,
  currentUserId,
  isAdmin = false,
  onCancelRegistration,
  onDeleteGuest,
  isCanceling,
  isDeletingGuest = false,
}: WaitlistUsersProps) => {
  if (users.length === 0) return null;

  return (
    <div>
      <h3 className="text-lg font-semibold text-primary-foreground mb-3">
        Waitlist ({users.length})
      </h3>
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {users.map((registration, index) => (
          <UserCard
            key={registration.id}
            user={registration}
            index={index}
            isWaitlist={true}
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
    </div>
  );
};
