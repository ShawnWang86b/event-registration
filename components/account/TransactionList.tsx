import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LoadingState, ErrorState, EmptyState } from "@/components/states";
import { CreditTransaction } from "@/lib/types";

type TransactionListProps = {
  transactions: CreditTransaction[];
  isLoading: boolean;
  hasError: boolean;
  hasTransactions: boolean;
  formatCurrency: (amount: number) => string;
  formatTransactionAmount: (amount: number) => {
    amount: string;
    isPositive: boolean;
    color: string;
    sign: string;
  };
  onRetry?: () => void;
};

export const TransactionList = ({
  transactions,
  isLoading,
  hasError,
  hasTransactions,
  formatCurrency,
  formatTransactionAmount,
  onRetry,
}: TransactionListProps) => {
  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
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
        {isLoading && (
          <LoadingState
            message="Loading transactions..."
            size="md"
            fullHeight={false}
          />
        )}

        {hasError && (
          <ErrorState
            message="Failed to load transactions"
            onRetry={onRetry}
            fullHeight={false}
          />
        )}

        {!isLoading && !hasError && !hasTransactions && (
          <EmptyState
            title="No transactions found"
            message="You haven't made any transactions yet. Your transaction history will appear here once you start using the platform."
            fullHeight={false}
          />
        )}

        {!isLoading && !hasError && hasTransactions && (
          <div className="space-y-4">
            {transactions.map((transaction) => {
              const amountInfo = formatTransactionAmount(
                parseFloat(transaction.amount)
              );

              return (
                <div
                  key={transaction.id}
                  className="flex-col lg:flex-row items-start lg:items-center justify-start lg:justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm lg:text-base pb-2 lg:pb-0 font-medium">
                        {transaction.description}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>
                        {formatDateTime(transaction.createdAt.toString())}
                      </span>
                    </div>
                  </div>

                  <div className="text-left lg:text-right py-2 lg:py-0">
                    <div className="text-sm text-gray-600">
                      Amount:{" "}
                      <span className={`font-semibold ${amountInfo.color}`}>
                        {amountInfo.sign}
                        {amountInfo.amount}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      Balance:{" "}
                      {formatCurrency(parseFloat(transaction.balanceAfter))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
