"use client";

import { useState, useMemo } from "react";
import { History } from "lucide-react";
import {
  useCurrentUser,
  useUserMonthlyReport,
  useCreditTransactions,
} from "@/hooks";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CalorieChart from "@/components/calorie-chart";
import { useSidebar } from "@/components/ui/sidebar";
import LoadingSpinner from "@/components/loading-spinner";
import { Spinner } from "@/components/ui/shadcn-io/spinner";

const AccountPage = () => {
  const currentDate = useMemo(() => new Date(), []);
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(
    currentDate.getMonth() + 1
  );

  const { state } = useSidebar();

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
      <div className="flex justify-center items-center min-h-[100vh] min-w-[80vw]"></div>
    );
  }

  if (!currentUser) {
    return (
      <div className="flex justify-center items-center min-h-[100vh] min-w-[80vw]">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen min-w-[80vw] lg:w-auto p-16">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Account Dashboard</h1>
        <p className="text-primary text-lg mt-2">
          Manage your account and view transaction history
        </p>
      </div>

      <div className="w-full">
        <Tabs defaultValue="transactions" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="transactions">Recent Transactions</TabsTrigger>
            <TabsTrigger value="reports">Calorie Consumption</TabsTrigger>
          </TabsList>

          {/* Transactions Tab */}
          <TabsContent value="transactions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground text-lg">
                  Transaction History
                </CardTitle>
                <CardDescription className="text-primary text-md">
                  Your recent credit transactions and activity
                </CardDescription>
              </CardHeader>
              <CardContent>
                {transactionsLoading ? (
                  <div className="flex justify-center py-8">
                    <Spinner variant="ellipsis" className="text-primary" />
                  </div>
                ) : transactionsData?.transactions.length === 0 ? (
                  <div className="text-center py-8 text-primary text-lg">
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
                          className="flex-col lg:flex-row items-start lg:items-center justify-start lg:justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm lg:text-base pb-2 lg:pb-0 font-medium">
                                {transaction.description}
                              </span>
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
                            </div>
                          </div>
                          <div className="text-left lg:text-right py-2 lg:py-0">
                            <div className="text-sm text-gray-600">
                              Amount:{" "}
                              <span
                                className={`font-semibold ${amountInfo.color}`}
                              >
                                {amountInfo.sign}
                                {amountInfo.amount}
                              </span>
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
            <CalorieChart />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AccountPage;
