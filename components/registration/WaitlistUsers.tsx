import { UserCard } from "./UserCard";

type Registration = {
  id: number;
  userId: string;
  user: { name: string; email: string };
  registrationDate: string;
};

type WaitlistUsersProps = {
  users: Registration[];
  currentUserId: string | null | undefined;
  onCancelRegistration: () => void;
  isCanceling: boolean;
};

export const WaitlistUsers = ({
  users,
  currentUserId,
  onCancelRegistration,
  isCanceling,
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
            onCancel={onCancelRegistration}
            isCanceling={isCanceling}
          />
        ))}
      </div>
    </div>
  );
};
