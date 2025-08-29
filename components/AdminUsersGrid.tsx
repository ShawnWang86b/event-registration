"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingState, ErrorState } from "@/components/states";
import { UserGrid } from "@/components/admin-grid";
import { useAdminUsersGrid } from "@/hooks";

const AdminUsersGrid = () => {
  const {
    users,
    pagination,
    totalUsers,
    isLoading,
    hasError,
    hasData,
    formatCurrency,
    formatDate,
    isPositiveBalance,
    isAdminRole,
    defaultColDef,
    gridOptions,
  } = useAdminUsersGrid();

  if (isLoading) {
    return <LoadingState message="Loading users..." />;
  }

  if (hasError) {
    return <ErrorState message="Failed to load users" errorType="server" />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-foreground text-lg">
          <span>All Users</span>
          <Badge variant="outline" className="text-primary text-sm">
            {totalUsers} total users
          </Badge>
        </CardTitle>
        <CardDescription className="text-primary text-md">
          Manage and view all registered users with their account details
        </CardDescription>
      </CardHeader>
      <CardContent>
        <UserGrid
          users={users}
          formatCurrency={formatCurrency}
          formatDate={formatDate}
          isPositiveBalance={isPositiveBalance}
          isAdminRole={isAdminRole}
          defaultColDef={defaultColDef}
          gridOptions={gridOptions}
        />

        {pagination && (
          <div className="mt-4 text-sm text-primary text-center">
            Showing {users.length} of {pagination.total} users
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminUsersGrid;
