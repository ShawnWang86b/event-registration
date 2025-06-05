"use client";

import { Calendar } from "lucide-react";
import { AgGridReact } from "ag-grid-react";
import { ModuleRegistry, AllCommunityModule } from "ag-grid-community";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Register AG Grid modules
ModuleRegistry.registerModules([AllCommunityModule]);

interface MonthlyAnalysisProps {
  selectedMonth: number;
  selectedYear: number;
  setSelectedMonth: (month: number) => void;
  setSelectedYear: (year: number) => void;
  monthOptions: { value: number; label: string }[];
  yearOptions: number[];
  reportLoading: boolean;
  reportError: any;
  monthlyReport: any;
  formatCurrency: (amount: number) => string;
}

const MonthlyAnalysis = ({
  selectedMonth,
  selectedYear,
  setSelectedMonth,
  setSelectedYear,
  monthOptions,
  yearOptions,
  reportLoading,
  reportError,
  monthlyReport,
  formatCurrency,
}: MonthlyAnalysisProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Monthly Analysis
        </CardTitle>
        <CardDescription>
          Analyze your transaction data by month and year
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Month/Year Selector */}
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Month
            </label>
            <Select
              value={selectedMonth.toString()}
              onValueChange={(value) => setSelectedMonth(parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {monthOptions.map((month) => (
                  <SelectItem key={month.value} value={month.value.toString()}>
                    {month.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1">
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Year
            </label>
            <Select
              value={selectedYear.toString()}
              onValueChange={(value) => setSelectedYear(parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {yearOptions.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* AG Grid Table */}
        <div
          className="ag-theme-alpine"
          style={{ height: "500px", width: "100%" }}
        >
          {reportLoading ? (
            <div className="flex justify-center items-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading analysis...</p>
              </div>
            </div>
          ) : reportError ? (
            <div className="flex justify-center items-center h-full">
              <div className="text-center">
                <p className="text-red-600">Error loading analysis</p>
                <p className="text-sm text-gray-600 mt-1">
                  Please try selecting a different month
                </p>
              </div>
            </div>
          ) : monthlyReport?.transactions ? (
            <AgGridReact
              theme="legacy"
              rowData={monthlyReport.transactions.map((transaction: any) => ({
                id: transaction.id,
                date: transaction.formattedDate,
                description: transaction.description,
                amount: transaction.amount,
                balanceAfter: transaction.balanceAfter,
                eventTitle: transaction.eventTitle || "-",
              }))}
              columnDefs={[
                {
                  headerName: "Date",
                  field: "date",
                  sortable: true,
                  filter: true,
                  width: 120,
                },
                {
                  headerName: "Description",
                  field: "description",
                  sortable: true,
                  filter: true,
                  flex: 1,
                },
                {
                  headerName: "Amount",
                  field: "amount",
                  sortable: true,
                  filter: true,
                  width: 120,
                  cellRenderer: (params: any) => {
                    const amount = parseFloat(params.value);
                    const color =
                      amount >= 0 ? "text-green-600" : "text-red-600";
                    const sign = amount >= 0 ? "+" : "";
                    return `<span class="${color} font-semibold">${sign}${formatCurrency(
                      Math.abs(amount)
                    )}</span>`;
                  },
                },
                {
                  headerName: "Balance After",
                  field: "balanceAfter",
                  sortable: true,
                  filter: true,
                  width: 140,
                  cellRenderer: (params: any) =>
                    formatCurrency(parseFloat(params.value)),
                },
                {
                  headerName: "Event",
                  field: "eventTitle",
                  sortable: true,
                  filter: true,
                  width: 150,
                },
              ]}
              defaultColDef={{
                resizable: true,
                sortable: true,
                filter: true,
              }}
              pagination={true}
              paginationPageSize={20}
              domLayout="normal"
            />
          ) : (
            <div className="flex justify-center items-center h-full">
              <div className="text-center text-gray-500">
                No data available for the selected period
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MonthlyAnalysis;
