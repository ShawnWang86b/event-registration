"use client";

import { useState, useMemo } from "react";
import {
  Calendar,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Activity,
  FileText,
} from "lucide-react";
import {
  useCurrentUser,
  useUserMonthlyReport,
  useCreditTransactions,
} from "@/hooks";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const AccountPage = () => {
  const currentDate = new Date();
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(
    currentDate.getMonth() + 1
  );

  // Get current user data
  const { data: currentUserData, isLoading: userLoading } = useCurrentUser();
  const currentUser = currentUserData?.user;

  // Get monthly report for selected month
  const {
    data: monthlyReport,
    isLoading: reportLoading,
    error: reportError,
  } = useUserMonthlyReport(selectedYear, selectedMonth);

  // Get recent transactions
  const { data: transactionsData, isLoading: transactionsLoading } =
    useCreditTransactions({ limit: 20, offset: 0 });

  // Generate year options (current year and 2 years back)
  const yearOptions = useMemo(() => {
    const years = [];
    for (let i = 0; i < 3; i++) {
      years.push(currentDate.getFullYear() - i);
    }
    return years;
  }, [currentDate]);

  // Month options
  const monthOptions = [
    { value: 1, label: "January" },
    { value: 2, label: "February" },
    { value: 3, label: "March" },
    { value: 4, label: "April" },
    { value: 5, label: "May" },
    { value: 6, label: "June" },
    { value: 7, label: "July" },
    { value: 8, label: "August" },
    { value: 9, label: "September" },
    { value: 10, label: "October" },
    { value: 11, label: "November" },
    { value: 12, label: "December" },
  ];

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  // Format transaction amount with appropriate styling
  const formatTransactionAmount = (amount: number, type: string) => {
    const formattedAmount = formatCurrency(Math.abs(amount));
    return {
      amount: formattedAmount,
      isPositive: amount > 0,
      color: amount > 0 ? "text-green-600" : "text-red-600",
      sign: amount > 0 ? "+" : "-",
    };
  };

  // Calculate quick stats from recent transactions
  const recentStats = useMemo(() => {
    if (!transactionsData?.transactions) return null;

    const transactions = transactionsData.transactions;
    const thisMonth = transactions.filter((t) => {
      const transactionDate = new Date(t.createdAt);
      return (
        transactionDate.getMonth() === currentDate.getMonth() &&
        transactionDate.getFullYear() === currentDate.getFullYear()
      );
    });

    const totalSpent = thisMonth
      .filter((t) => t.type === "spend")
      .reduce((sum, t) => sum + Math.abs(parseFloat(t.amount)), 0);

    const totalDeposits = thisMonth
      .filter((t) => t.type === "deposit")
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    return {
      thisMonthSpent: totalSpent,
      thisMonthDeposits: totalDeposits,
      thisMonthTransactions: thisMonth.length,
      recentTransactions: transactions.slice(0, 5),
    };
  }, [transactionsData, currentDate]);

  if (userLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading your account...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600">Unable to load account information</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="container mx-auto p-6"
      style={{ width: "calc(100vw - var(--sidebar-width))" }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Account Dashboard
          </h1>
          <p className="text-gray-600 mt-2">
            Manage your account and view transaction history
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar - Statistics */}
          <div className="lg:col-span-1 space-y-6">
            {/* Current Balance Card */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  Current Balance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">
                  {formatCurrency(currentUser.creditBalance)}
                </div>
                <p className="text-sm text-gray-600 mt-1">Available credits</p>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            {recentStats && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Activity className="h-5 w-5 text-blue-600" />
                    This Month
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Spent</span>
                      <span className="font-semibold text-red-600">
                        {formatCurrency(recentStats.thisMonthSpent)}
                      </span>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Deposited</span>
                      <span className="font-semibold text-green-600">
                        {formatCurrency(recentStats.thisMonthDeposits)}
                      </span>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">
                        Transactions
                      </span>
                      <span className="font-semibold text-gray-900">
                        {recentStats.thisMonthTransactions}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Account Info */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Account Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Name</p>
                  <p className="font-medium">{currentUser.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium">{currentUser.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Role</p>
                  <Badge
                    variant={
                      currentUser.role === "admin" ? "default" : "secondary"
                    }
                  >
                    {currentUser.role}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Member Since</p>
                  <p className="font-medium">
                    {new Date(currentUser.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Content - Transactions and Reports */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="transactions" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="transactions">
                  Recent Transactions
                </TabsTrigger>
                <TabsTrigger value="reports">Monthly Reports</TabsTrigger>
              </TabsList>

              {/* Transactions Tab */}
              <TabsContent value="transactions" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5" />
                      Transaction History
                    </CardTitle>
                    <CardDescription>
                      Your recent credit transactions and activity
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {transactionsLoading ? (
                      <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                      </div>
                    ) : transactionsData?.transactions.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        No transactions found
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {transactionsData?.transactions.map((transaction) => {
                          const amountInfo = formatTransactionAmount(
                            parseFloat(transaction.amount),
                            transaction.type
                          );
                          return (
                            <div
                              key={transaction.id}
                              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                            >
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-medium">
                                    {transaction.description}
                                  </span>
                                  <Badge
                                    variant={
                                      transaction.type === "deposit"
                                        ? "default"
                                        : transaction.type === "spend"
                                        ? "destructive"
                                        : transaction.type === "refund"
                                        ? "default"
                                        : "secondary"
                                    }
                                    className="text-xs"
                                  >
                                    {transaction.type}
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-4 text-sm text-gray-600">
                                  <span>
                                    {new Date(
                                      transaction.createdAt
                                    ).toLocaleDateString("en-US", {
                                      year: "numeric",
                                      month: "short",
                                      day: "numeric",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </span>
                                  {transaction.event && (
                                    <span className="text-blue-600">
                                      Event: {transaction.event.title}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="text-right">
                                <div
                                  className={`font-semibold ${amountInfo.color}`}
                                >
                                  {amountInfo.sign}
                                  {amountInfo.amount}
                                </div>
                                <div className="text-sm text-gray-600">
                                  Balance:{" "}
                                  {formatCurrency(
                                    parseFloat(transaction.balanceAfter)
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Monthly Reports Tab */}
              <TabsContent value="reports" className="space-y-6">
                {/* Month/Year Selector */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Select Report Period
                    </CardTitle>
                    <CardDescription>
                      Choose a month and year to view your detailed monthly
                      report
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                          Month
                        </label>
                        <Select
                          value={selectedMonth.toString()}
                          onValueChange={(value) =>
                            setSelectedMonth(parseInt(value))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {monthOptions.map((month) => (
                              <SelectItem
                                key={month.value}
                                value={month.value.toString()}
                              >
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
                          onValueChange={(value) =>
                            setSelectedYear(parseInt(value))
                          }
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
                  </CardContent>
                </Card>

                {/* Monthly Report */}
                {reportLoading ? (
                  <Card>
                    <CardContent className="flex justify-center py-8">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-2 text-gray-600">Loading report...</p>
                      </div>
                    </CardContent>
                  </Card>
                ) : reportError ? (
                  <Card>
                    <CardContent className="text-center py-8">
                      <p className="text-red-600">Error loading report</p>
                      <p className="text-sm text-gray-600 mt-1">
                        Please try selecting a different month
                      </p>
                    </CardContent>
                  </Card>
                ) : monthlyReport ? (
                  <div className="space-y-6">
                    {/* Report Summary */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <FileText className="h-5 w-5" />
                          {monthlyReport.reportPeriod.monthName}{" "}
                          {monthlyReport.reportPeriod.year} Summary
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="text-center p-4 bg-blue-50 rounded-lg">
                            <div className="text-2xl font-bold text-blue-600">
                              {formatCurrency(
                                monthlyReport.summary.openingBalance
                              )}
                            </div>
                            <div className="text-sm text-gray-600">
                              Opening Balance
                            </div>
                          </div>
                          <div className="text-center p-4 bg-green-50 rounded-lg">
                            <div className="text-2xl font-bold text-green-600">
                              {formatCurrency(
                                monthlyReport.summary.totalDeposits
                              )}
                            </div>
                            <div className="text-sm text-gray-600">
                              Deposits
                            </div>
                          </div>
                          <div className="text-center p-4 bg-red-50 rounded-lg">
                            <div className="text-2xl font-bold text-red-600">
                              {formatCurrency(
                                monthlyReport.summary.totalSpending
                              )}
                            </div>
                            <div className="text-sm text-gray-600">
                              Spending
                            </div>
                          </div>
                          <div className="text-center p-4 bg-gray-50 rounded-lg">
                            <div className="text-2xl font-bold text-gray-900">
                              {formatCurrency(
                                monthlyReport.summary.closingBalance
                              )}
                            </div>
                            <div className="text-sm text-gray-600">
                              Closing Balance
                            </div>
                          </div>
                        </div>

                        <Separator className="my-6" />

                        <div className="grid grid-cols-2 gap-4">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Net Change:</span>
                            <span
                              className={`font-semibold ${
                                monthlyReport.summary.netChange >= 0
                                  ? "text-green-600"
                                  : "text-red-600"
                              }`}
                            >
                              {monthlyReport.summary.netChange >= 0 ? "+" : ""}
                              {formatCurrency(monthlyReport.summary.netChange)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Transactions:</span>
                            <span className="font-semibold">
                              {monthlyReport.summary.transactionCount}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Monthly Transactions */}
                    {monthlyReport.transactions.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle>Monthly Transactions</CardTitle>
                          <CardDescription>
                            All transactions for{" "}
                            {monthlyReport.reportPeriod.monthName}{" "}
                            {monthlyReport.reportPeriod.year}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {monthlyReport.transactions.map((transaction) => {
                              const amountInfo = formatTransactionAmount(
                                transaction.amount,
                                transaction.type
                              );
                              return (
                                <div
                                  key={transaction.id}
                                  className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                                >
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="font-medium text-sm">
                                        {transaction.description}
                                      </span>
                                      <Badge
                                        variant="outline"
                                        className="text-xs"
                                      >
                                        {transaction.type}
                                      </Badge>
                                    </div>
                                    <div className="flex items-center gap-4 text-xs text-gray-600">
                                      <span>{transaction.formattedDate}</span>
                                      {transaction.eventTitle && (
                                        <span className="text-blue-600">
                                          {transaction.eventTitle}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <div
                                      className={`font-semibold text-sm ${amountInfo.color}`}
                                    >
                                      {amountInfo.sign}
                                      {amountInfo.amount}
                                    </div>
                                    <div className="text-xs text-gray-600">
                                      {formatCurrency(transaction.balanceAfter)}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                ) : null}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountPage;
