import { useMemo } from "react";
import { useCurrentUser, useCreditTransactions } from "@/hooks";
import { ACCOUNT_CONSTANTS } from "@/constants/account";

export const useAccount = () => {
  // Data fetching
  const { data: currentUserData, isLoading: userLoading } = useCurrentUser();
  const { data: transactionsData, isLoading: transactionsLoading } =
    useCreditTransactions({ limit: 20, offset: 0 });

  const currentUser = currentUserData?.user;

  // Currency formatting utility
  const formatCurrency = useMemo(
    () => (amount: number) => {
      return new Intl.NumberFormat(ACCOUNT_CONSTANTS.CURRENCY.LOCALE, {
        style: "currency",
        currency: ACCOUNT_CONSTANTS.CURRENCY.CURRENCY_CODE,
      }).format(amount);
    },
    []
  );

  // Transaction amount formatting with styling
  const formatTransactionAmount = useMemo(
    () => (amount: number) => {
      const formattedAmount = formatCurrency(Math.abs(amount));
      return {
        amount: formattedAmount,
        isPositive: amount > 0,
        color:
          amount > 0
            ? ACCOUNT_CONSTANTS.COLORS.POSITIVE
            : ACCOUNT_CONSTANTS.COLORS.NEGATIVE,
        sign: amount > 0 ? "+" : "-",
      };
    },
    [formatCurrency]
  );

  // Account summary calculations
  const accountSummary = useMemo(() => {
    if (!currentUser || !transactionsData?.transactions) {
      return null;
    }

    const transactions = transactionsData.transactions;
    const totalTransactions = transactions.length;

    // Calculate recent activity (transactions in last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentTransactions = transactions.filter(
      (t: any) => new Date(t.createdAt) >= thirtyDaysAgo
    );

    // Calculate totals
    const totalDeposits = transactions
      .filter((t: any) => t.type === "deposit")
      .reduce((sum: number, t: any) => sum + parseFloat(t.amount), 0);

    const totalSpending = Math.abs(
      transactions
        .filter((t: any) => t.type === "spend")
        .reduce((sum: number, t: any) => sum + parseFloat(t.amount), 0)
    );

    return {
      currentBalance: currentUser.creditBalance,
      totalTransactions,
      recentActivity: recentTransactions.length,
      totalDeposits,
      totalSpending,
      lastTransaction: transactions[0]
        ? new Date(transactions[0].createdAt)
        : null,
    };
  }, [currentUser, transactionsData]);

  // Loading and error states
  const isLoading = userLoading || transactionsLoading;
  const hasError = !currentUser && !userLoading;
  const hasTransactions = (transactionsData?.transactions?.length ?? 0) > 0;

  return {
    currentUser,
    transactions: transactionsData?.transactions || [],
    accountSummary,
    isLoading,
    hasError,
    hasTransactions,
    formatCurrency,
    formatTransactionAmount,
  };
};
