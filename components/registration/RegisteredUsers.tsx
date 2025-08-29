import { UserCard } from "./UserCard";

type Registration = {
  id: number;
  userId: string;
  user: { name: string; email: string };
  registrationDate: string;
};

type RegisteredUsersProps = {
  users: Registration[];
  currentUserId: string | null | undefined;
  onCancelRegistration: () => void;
  isCanceling: boolean;
};

export const RegisteredUsers = ({
  users,
  currentUserId,
  onCancelRegistration,
  isCanceling,
}: RegisteredUsersProps) => {
  return (
    <div className="mb-6">
      <h3 className="text-sm mb-3">Registered Attendees ({users.length})</h3>
      {users.length > 0 ? (
        <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto">
          {users.map((registration, index) => (
            <UserCard
              key={registration.id}
              user={registration}
              index={index}
              isCurrentUser={registration.userId === currentUserId}
              onCancel={onCancelRegistration}
              isCanceling={isCanceling}
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
