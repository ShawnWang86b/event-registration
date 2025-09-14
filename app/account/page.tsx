"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CalorieChart from "@/components/CalorieChart";
import { LoadingState, ErrorState } from "@/components/states";
import { AccountSummary, TransactionList } from "@/components/account";
import { useAccount } from "@/hooks";
import { withErrorBoundary } from "@/components/ErrorBoundary";

const AccountPage = () => {
  const {
    transactions,
    accountSummary,
    isLoading,
    hasError,
    hasTransactions,
    formatCurrency,
    formatTransactionAmount,
  } = useAccount();

  // Handle loading state
  if (isLoading) {
    return <LoadingState message="Loading your account..." />;
  }

  // Handle error state
  if (hasError) {
    return (
      <ErrorState
        message="Failed to load account information"
        errorType="server"
      />
    );
  }

  return (
    <div className="min-h-screen min-w-[80vw] lg:w-auto p-0 pt-10 lg:p-16">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-lg lg:text-3xl font-bold text-secondary-foreground">
          Account Dashboard
        </h1>
        <p className="text-primary text-sm lg:text-lg mt-2">
          Manage your account and view transaction history
        </p>
      </div>

      {/* Account Summary */}

      {accountSummary && (
        <AccountSummary
          summary={accountSummary}
          formatCurrency={formatCurrency}
        />
      )}

      {/* Main Content Tabs */}
      <div className="w-full pr-4 lg:pr-0">
        <Tabs defaultValue="transactions" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="transactions">Recent Transactions</TabsTrigger>
            <TabsTrigger value="reports">Calorie Consumption</TabsTrigger>
          </TabsList>

          {/* Transactions Tab */}
          <TabsContent value="transactions" className="space-y-6">
            <TransactionList
              transactions={transactions}
              isLoading={false} // Already handled at page level
              hasError={false} // Already handled at page level
              hasTransactions={hasTransactions}
              formatCurrency={formatCurrency}
              formatTransactionAmount={formatTransactionAmount}
            />
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

// Export wrapped component with error boundary
const AccountPageWithErrorBoundary = withErrorBoundary(
  AccountPage,
  <ErrorState
    message="Failed to load account page"
    errorType="unknown"
    fullHeight={true}
  />
);

AccountPageWithErrorBoundary.displayName = "AccountPage";

export default AccountPageWithErrorBoundary;
