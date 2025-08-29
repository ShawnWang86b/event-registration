import { UserSearchResult } from "@/types";

type SelectedUsersProps = {
  selectedUsers: UserSearchResult[];
  onRemoveUser: (userId: string) => void;
};

export const SelectedUsers = ({
  selectedUsers,
  onRemoveUser,
}: SelectedUsersProps) => {
  if (selectedUsers.length === 0) return null;

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">
        Selected Users ({selectedUsers.length})
      </label>
      <div className="space-y-2 max-h-40 overflow-y-auto">
        {selectedUsers.map((user) => (
          <div
            key={user.id}
            className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg"
          >
            <div>
              <div className="font-medium text-foreground">{user.name}</div>
              <div className="text-sm text-primary">{user.email}</div>
              <div className="text-xs text-blue-600">
                Balance: {user.creditBalance} credits
              </div>
            </div>
            <button
              type="button"
              onClick={() => onRemoveUser(user.id)}
              className="bg-red-500 hover:bg-red-600 text-white text-xs px-2 py-1 rounded-full transition-colors"
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
