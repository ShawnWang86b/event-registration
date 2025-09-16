import { Trash2 } from "lucide-react";
import { formatDisplayDate } from "@/utils/dateTime";

type UserCardProps = {
  user: {
    id: number;
    userId: string;
    user: { name: string; email: string; role?: string };
    registrationDate: string;
  };
  index: number;
  isWaitlist?: boolean;
  isCurrentUser: boolean;
  isAdmin?: boolean; // New prop to identify admin users
  onCancel: () => void;
  onDeleteGuest?: () => void; // New prop for guest deletion
  isCanceling: boolean;
  isDeletingGuest?: boolean; // New prop for guest deletion loading state
};

export const UserCard = ({
  user,
  index,
  isWaitlist = false,
  isCurrentUser,
  isAdmin = false,
  onCancel,
  onDeleteGuest,
  isCanceling,
  isDeletingGuest = false,
}: UserCardProps) => {
  const cardStyles = isWaitlist
    ? "bg-yellow-50 border-yellow-200"
    : "bg-card border-border";

  const numberStyles = isWaitlist
    ? "bg-yellow-500 text-white"
    : "bg-primary text-popover";

  const textStyles = isWaitlist ? "text-gray-800" : "text-card-foreground";

  const emailStyles = isWaitlist ? "text-gray-600" : "text-primary";

  const numberText = isWaitlist ? `W${index + 1}` : `${index + 1}`;

  // Check if this is a guest user
  const isGuest = user.user.role === "guest";

  // Show delete button for guests (admin only) or cancel button for current user
  const showDeleteButton = isAdmin && isGuest && onDeleteGuest;
  const showCancelButton = isCurrentUser && !isGuest;

  return (
    <div
      className={`flex items-center justify-between p-3 border rounded-lg ${cardStyles}`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${numberStyles}`}
        >
          {numberText}
        </div>
        <div>
          <div className={`font-medium ${textStyles}`}>{user.user.name}</div>
          <div className={`text-sm hidden lg:block ${emailStyles}`}>
            {user.user.email}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {isWaitlist && (
          <div className="text-sm text-gray-500">
            {formatDisplayDate(user.registrationDate)}
          </div>
        )}

        {/* Guest badge */}
        {isGuest && (
          <div className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
            Guest
          </div>
        )}

        {/* Delete button for guests (admin only) */}
        {showDeleteButton && (
          <button
            onClick={onDeleteGuest}
            disabled={isDeletingGuest}
            className="bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white p-2 rounded-full transition-colors"
            title={isDeletingGuest ? "Deleting..." : "Delete guest"}
          >
            <Trash2 size={16} />
          </button>
        )}

        {/* Cancel button for current user (non-guests) */}
        {showCancelButton && (
          <button
            onClick={onCancel}
            disabled={isCanceling}
            className="bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white p-2 rounded-full transition-colors"
            title={isCanceling ? "Canceling..." : "Cancel registration"}
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>
    </div>
  );
};
