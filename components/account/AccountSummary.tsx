import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Activity, Calendar, TrendingUp } from "lucide-react";
import { ACCOUNT_CONSTANTS } from "@/constants/account";

type AccountSummaryProps = {
  summary: {
    currentBalance: number;
    totalTransactions: number;
    recentActivity: number;
    totalDeposits: number;
    totalSpending: number;
    lastTransaction: Date | null;
  };
  formatCurrency: (amount: number) => string;
};

/**
 * Account summary section showing key account metrics
 * Displays current balance and account statistics
 */
export const AccountSummary = ({
  summary,
  formatCurrency,
}: AccountSummaryProps) => {
  const summaryCards = [
    {
      title: "Current Balance",
      value: formatCurrency(summary.currentBalance),
      icon: DollarSign,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Total Transactions",
      value: summary.totalTransactions.toString(),
      icon: Activity,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Recent Activity",
      value: `${summary.recentActivity} this month`,
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      title: "Last Transaction",
      value: summary.lastTransaction
        ? summary.lastTransaction.toLocaleDateString()
        : "No transactions",
      icon: Calendar,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {summaryCards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              {card.title}
            </CardTitle>
            <div className={`p-2 rounded-full ${card.bgColor}`}>
              <card.icon className={`w-4 h-4 ${card.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{card.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
