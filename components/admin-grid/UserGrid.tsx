import { useMemo, useCallback } from "react";
import { AgGridReact } from "ag-grid-react";
import { ModuleRegistry, AllCommunityModule } from "ag-grid-community";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { type AdminUser } from "@/hooks/use-admin-users";
import { BalanceCell } from "./BalanceCell";
import { RoleCell } from "./RoleCell";
import { DateCell } from "./DateCell";

// Register AG Grid modules
ModuleRegistry.registerModules([AllCommunityModule]);

type UserGridProps = {
  users: AdminUser[];
  formatCurrency: (amount: number) => string;
  formatDate: (dateString: string) => string;
  isPositiveBalance: (amount: number) => boolean;
  isAdminRole: (role: string) => boolean;
  defaultColDef: any;
  gridOptions: any;
};

export const UserGrid = ({
  users,
  formatCurrency,
  formatDate,
  isPositiveBalance,
  isAdminRole,
  defaultColDef,
  gridOptions,
}: UserGridProps) => {
  // Balance cell renderer
  const BalanceCellRenderer = useCallback(
    (params: any) => (
      <BalanceCell
        value={params.value}
        formatCurrency={formatCurrency}
        isPositive={isPositiveBalance}
      />
    ),
    [formatCurrency, isPositiveBalance]
  );

  // Role cell renderer
  const RoleCellRenderer = useCallback(
    (params: any) => <RoleCell value={params.value} isAdmin={isAdminRole} />,
    [isAdminRole]
  );

  // Date cell renderer
  const DateCellRenderer = useCallback(
    (params: any) => <DateCell value={params.value} formatDate={formatDate} />,
    [formatDate]
  );

  // Column definitions
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
        cellRenderer: DateCellRenderer,
      },
      {
        headerName: "Last Updated",
        field: "updatedAt" as keyof AdminUser,
        sortable: true,
        filter: "agDateColumnFilter",
        width: 150,
        cellRenderer: DateCellRenderer,
      },
    ],
    [BalanceCellRenderer, RoleCellRenderer, DateCellRenderer]
  );

  return (
    <div className="ag-theme-alpine" style={{ height: "600px", width: "100%" }}>
      <AgGridReact
        theme="legacy"
        rowData={users}
        columnDefs={columnDefs}
        defaultColDef={defaultColDef}
        {...gridOptions}
      />
    </div>
  );
};
