"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useSearchUsers, useAdjustUserBalance } from "@/hooks";
import { UserSearchResult } from "@/lib/types";
import AdminUsersGrid from "@/components/admin-users-grid";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useSidebar } from "@/components/ui/sidebar";
import { Spinner } from "@/components/ui/shadcn-io/spinner";

// Form schema using Zod
const balanceAdjustmentSchema = z.object({
  userIds: z.array(z.string()).min(1, "Please select at least one user"),
  amount: z.number().min(1, "Amount must be greater than 0"),
});

type BalanceAdjustmentForm = z.infer<typeof balanceAdjustmentSchema>;

export default function AdminPage() {
  const { state } = useSidebar();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<UserSearchResult[]>([]);
  const [isComboboxOpen, setIsComboboxOpen] = useState(false);

  // Fetch users based on search query (only when query has 2+ characters)
  const { data: usersData, isLoading: isSearchLoading } =
    useSearchUsers(searchQuery);
  const users = usersData?.users || [];

  // Balance adjustment mutation
  const adjustBalanceMutation = useAdjustUserBalance();

  // Form setup
  const form = useForm<BalanceAdjustmentForm>({
    resolver: zodResolver(balanceAdjustmentSchema),
    defaultValues: {
      userIds: [],
      amount: 0,
    },
  });

  const onSubmit = async (data: BalanceAdjustmentForm) => {
    try {
      // Adjust balance for each selected user
      const results = await Promise.allSettled(
        selectedUsers.map((user) =>
          adjustBalanceMutation.mutateAsync({
            userId: user.id,
            data: {
              action: "add",
              amount: data.amount,
            },
          })
        )
      );

      // Count successful and failed operations
      const successful = results.filter((r) => r.status === "fulfilled").length;
      const failed = results.filter((r) => r.status === "rejected").length;

      // Reset form after processing
      form.reset();
      setSelectedUsers([]);
      setSearchQuery("");

      if (failed === 0) {
        // Build success message with transaction details
        let message = `Successfully added ${data.amount} credits to ${successful} user(s)\n\n`;

        results.forEach((result, index) => {
          if (result.status === "fulfilled") {
            const response = result.value;
            message += `✅ ${selectedUsers[index]?.name}: +$${data.amount} (Transaction #${response.transaction.id})\n`;
          }
        });

        alert(message);
      } else {
        alert(
          `Added credits to ${successful} user(s), but ${failed} failed. Please check the console for details.`
        );

        // Log failed attempts
        results.forEach((result, index) => {
          if (result.status === "rejected") {
            console.error(
              `Failed to add credits to ${selectedUsers[index]?.name}:`,
              result.reason
            );
          }
        });
      }
    } catch (error) {
      console.error("Error adjusting balance:", error);
      alert("Failed to adjust balance. Please try again.");
    }
  };

  const handleUserSelect = (user: UserSearchResult) => {
    // Check if user is already selected
    if (!selectedUsers.find((u) => u.id === user.id)) {
      const newSelectedUsers = [...selectedUsers, user];
      setSelectedUsers(newSelectedUsers);
      form.setValue(
        "userIds",
        newSelectedUsers.map((u) => u.id)
      );
    }
    setSearchQuery("");
    setIsComboboxOpen(false);
  };

  const handleRemoveUser = (userId: string) => {
    const newSelectedUsers = selectedUsers.filter((u) => u.id !== userId);
    setSelectedUsers(newSelectedUsers);
    form.setValue(
      "userIds",
      newSelectedUsers.map((u) => u.id)
    );
  };

  const shouldShowDropdown = isComboboxOpen && searchQuery.length >= 2;

  return (
    <div className="min-h-screen min-w-[80vw] lg:w-auto p-16">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-foreground">Admin Panel</h1>
        <p className="text-primary text-lg">
          Manage users and system administration
        </p>
      </div>

      {/* Credit Balance Management Section */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-foreground text-lg">
            Manage User Credit Balances
          </CardTitle>
          <CardDescription className="text-primary text-md">
            Search for users and add credits to their accounts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="max-w-2xl">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* User Search Combobox */}
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
                          <Spinner
                            variant="ellipsis"
                            className="text-primary mx-auto"
                          />
                        </div>
                      ) : users.length > 0 ? (
                        users
                          .filter(
                            (user) =>
                              !selectedUsers.find((u) => u.id === user.id)
                          ) // Filter out already selected users
                          .map((user) => (
                            <div
                              key={user.id}
                              onClick={() => handleUserSelect(user)}
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
                        <div className="p-3 text-center text-primary">
                          No users found
                        </div>
                      )}
                    </div>
                  )}
                </div>
                {form.formState.errors.userIds && (
                  <p className="text-sm text-red-600">
                    {form.formState.errors.userIds.message}
                  </p>
                )}
              </div>

              {/* Selected Users Display */}
              {selectedUsers.length > 0 && (
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
                          <div className="font-medium text-foreground">
                            {user.name}
                          </div>
                          <div className="text-sm text-primary">
                            {user.email}
                          </div>
                          <div className="text-xs text-blue-600">
                            Balance: {user.creditBalance} credits
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveUser(user.id)}
                          className="bg-red-500 hover:bg-red-600 text-white text-xs px-2 py-1 rounded-full transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Amount Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-900">
                  Amount to Add (will be added to each selected user)
                </label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  {...form.register("amount", { valueAsNumber: true })}
                  placeholder="Enter amount..."
                  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent"
                />
                {form.formState.errors.amount && (
                  <p className="text-sm text-red-600">
                    {form.formState.errors.amount.message}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={
                  selectedUsers.length === 0 || adjustBalanceMutation.isPending
                }
                className="w-full bg-primary hover:bg-primary/90 disabled:bg-gray-400 disabled:cursor-not-allowed text-primary-foreground font-medium py-3 px-4 rounded-lg transition-colors"
              >
                {adjustBalanceMutation.isPending
                  ? "Adding Credits..."
                  : `Add Credits to ${selectedUsers.length} User(s)`}
              </button>
            </form>

            {/* Click outside to close dropdown */}
            {shouldShowDropdown && (
              <div
                className="fixed inset-0 z-0"
                onClick={() => setIsComboboxOpen(false)}
              />
            )}
          </div>
        </CardContent>
      </Card>

      {/* All Users Grid Section */}
      <AdminUsersGrid />
    </div>
  );
}
