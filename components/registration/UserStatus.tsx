import { UserRoundCheck } from "lucide-react";

type UserStatusProps = {
  isUserRegistered: boolean;
};

export const UserStatus = ({ isUserRegistered }: UserStatusProps) => {
  if (!isUserRegistered) return null;

  return (
    <div className="mb-6 p-4 bg-card border border-border rounded-lg">
      <div className="text-card-foreground flex items-center gap-2">
        <UserRoundCheck size={16} />
        <span>You are registered for this event!</span>
      </div>
    </div>
  );
};
