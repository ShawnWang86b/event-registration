"use client";

import AdminUsersGrid from "@/components/admin-users-grid";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { UserSearch, SelectedUsers, BalanceForm } from "@/components/admin";
import { useAdminBalance } from "@/hooks";

export default function AdminPage() {
  const {
    form,
    handleSubmit,
    searchQuery,
    setSearchQuery,
    isComboboxOpen,
    setIsComboboxOpen,
    shouldShowDropdown,
    users,
    selectedUsers,
    isSearchLoading,
    handleUserSelect,
    handleRemoveUser,
    isSubmitting,
  } = useAdminBalance();

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
          <div className="max-w-2xl space-y-6">
            {/* User Search */}
            <UserSearch
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              isComboboxOpen={isComboboxOpen}
              setIsComboboxOpen={setIsComboboxOpen}
              shouldShowDropdown={shouldShowDropdown}
              users={users}
              isSearchLoading={isSearchLoading}
              onUserSelect={handleUserSelect}
              error={form.formState.errors.userIds?.message}
            />

            {/* Selected Users */}
            <SelectedUsers
              selectedUsers={selectedUsers}
              onRemoveUser={handleRemoveUser}
            />

            {/* Balance Form */}
            <BalanceForm
              form={form}
              selectedUsersCount={selectedUsers.length}
              isSubmitting={isSubmitting}
              onSubmit={handleSubmit}
            />
          </div>
        </CardContent>
      </Card>

      {/* All Users Grid Section */}
      <AdminUsersGrid />
    </div>
  );
}
