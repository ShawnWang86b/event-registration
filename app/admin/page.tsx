"use client";

import AdminUsersGrid from "@/components/AdminUsersGrid";
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
    <div className="min-h-screen min-w-[90vw] lg:min-w-[80vw] p-0 pt-10 lg:p-16">
      <div className="mb-8">
        <h1 className="text-lg lg:text-3xl font-bold mb-2 text-secondary-foreground">
          Admin Panel
        </h1>
        <p className="text-primary text-sm lg:text-lg">
          Manage users and system administration
        </p>
      </div>

      {/* Credit Balance Management Section */}
      <Card className="mb-8 w-[90vw] lg:w-auto">
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
