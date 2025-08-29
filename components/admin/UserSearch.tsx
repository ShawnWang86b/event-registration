import { Spinner } from "@/components/ui/shadcn-io/spinner";
import { UserSearchResult } from "@/types";

type UserSearchProps = {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isComboboxOpen: boolean;
  setIsComboboxOpen: (open: boolean) => void;
  shouldShowDropdown: boolean;
  users: UserSearchResult[];
  isSearchLoading: boolean;
  onUserSelect: (user: UserSearchResult) => void;
  error?: string;
};

export const UserSearch = ({
  searchQuery,
  setSearchQuery,
  isComboboxOpen,
  setIsComboboxOpen,
  shouldShowDropdown,
  users,
  isSearchLoading,
  onUserSelect,
  error,
}: UserSearchProps) => {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-900">
        Search Users (type at least 2 characters)
      </label>
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setIsComboboxOpen(true);
          }}
          onFocus={() => setIsComboboxOpen(true)}
          placeholder="Search by name or email..."
          className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent"
        />

        {/* Dropdown Results */}
        {shouldShowDropdown && (
          <div className="absolute z-10 w-full mt-1 bg-primary-foreground border border-border rounded-md shadow-lg max-h-60 overflow-auto">
            {isSearchLoading ? (
              <div className="p-3 text-center text-primary">
                <Spinner variant="ellipsis" className="text-primary mx-auto" />
              </div>
            ) : users.length > 0 ? (
              users.map((user) => (
                <div
                  key={user.id}
                  onClick={() => onUserSelect(user)}
                  className="p-3 hover:bg-secondary cursor-pointer border-b border-border last:border-b-0"
                >
                  <div className="text-lg font-semibold text-foreground">
                    {user.name}
                  </div>
                  <div className="text-primary">{user.email}</div>
                  <div className="text-primary">
                    Balance: {user.creditBalance} credits
                  </div>
                </div>
              ))
            ) : (
              <div className="p-3 text-center text-primary">No users found</div>
            )}
          </div>
        )}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {/* Click outside to close dropdown */}
      {shouldShowDropdown && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setIsComboboxOpen(false)}
        />
      )}
    </div>
  );
};
