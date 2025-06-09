"use client";

import React, { useMemo, useCallback } from "react";
import { AgGridReact } from "ag-grid-react";
import { ModuleRegistry, AllCommunityModule } from "ag-grid-community";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { useAdminUsers, type AdminUser } from "@/hooks/use-admin-users";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Register AG Grid modules
ModuleRegistry.registerModules([AllCommunityModule]);

const AdminUsersGrid = () => {
  const { data: usersData, isLoading, error } = useAdminUsers(1, 100); // Get first 100 users

  // Format currency
  const formatCurrency = useCallback((amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  }, []);

  // Format date
  const formatDate = useCallback((dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }, []);

  // Balance cell renderer component
  const BalanceCellRenderer = useCallback(
    (params: any) => {
      const balance = parseFloat(params.value);
      const formatted = formatCurrency(balance);
      const colorClass = balance >= 0 ? "text-green-600" : "text-red-600";

      return <span className={`${colorClass} font-semibold`}>{formatted}</span>;
    },
    [formatCurrency]
  );

  // Role cell renderer component
  const RoleCellRenderer = useCallback((params: any) => {
    const role = params.value;
    const isAdmin = role === "admin";

    return (
      <span
        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
          isAdmin ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-800"
        }`}
      >
        {role}
      </span>
    );
  }, []);

  // Column definitions for AG Grid
  const columnDefs = useMemo(
    () => [
      {
        headerName: "Name",
        field: "name" as keyof AdminUser,
        sortable: true,
        filter: true,
        minWidth: 150,
      },
      {
        headerName: "Email",
        field: "email" as keyof AdminUser,
        sortable: true,
        filter: true,
        minWidth: 300,
      },
      {
        headerName: "Balance",
        field: "creditBalance" as keyof AdminUser,
        sortable: true,
        filter: "agNumberColumnFilter",
        width: 120,
        cellRenderer: BalanceCellRenderer,
      },
      {
        headerName: "Role",
        field: "role" as keyof AdminUser,
        sortable: true,
        filter: true,
        width: 100,
        cellRenderer: RoleCellRenderer,
      },
      {
        headerName: "Member Since",
        field: "createdAt" as keyof AdminUser,
        sortable: true,
        filter: "agDateColumnFilter",
        width: 150,
        cellRenderer: (params: any) => formatDate(params.value),
      },
      {
        headerName: "Last Updated",
        field: "updatedAt" as keyof AdminUser,
        sortable: true,
        filter: "agDateColumnFilter",
        width: 150,
        cellRenderer: (params: any) => formatDate(params.value),
      },
    ],
    [BalanceCellRenderer, RoleCellRenderer, formatDate]
  );

  const defaultColDef = useMemo(
    () => ({
      resizable: true,
      sortable: true,
      filter: true,
    }),
    []
  );

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>
            Manage and view all registered users
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading users...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>
            Manage and view all registered users
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-red-600">Error loading users</p>
            <p className="text-sm text-gray-600 mt-1">
              Please try refreshing the page
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const users = usersData?.users || [];
  const pagination = usersData?.pagination;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>All Users</span>
          <Badge variant="outline">{pagination?.total || 0} total users</Badge>
        </CardTitle>
        <CardDescription>
          Manage and view all registered users with their account details
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div
          className="ag-theme-alpine"
          style={{ height: "600px", width: "100%" }}
        >
          <AgGridReact
            theme="legacy"
            rowData={users}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            pagination={true}
            paginationPageSize={25}
            domLayout="normal"
            animateRows={true}
            rowSelection="multiple"
          />
        </div>

        {pagination && (
          <div className="mt-4 text-sm text-gray-600 text-center">
            Showing {users.length} of {pagination.total} users
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminUsersGrid;
