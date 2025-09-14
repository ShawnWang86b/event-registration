import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Activity, Calendar, TrendingUp } from "lucide-react";

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

export const AccountSummary = ({
  summary,
  formatCurrency,
}: AccountSummaryProps) => {
  const summaryCards = [
    {
      title: "Current Balance",
      value: formatCurrency(summary.currentBalance),
      icon: DollarSign,
      color: "text-foreground",
      bgColor: "bg-card",
    },
    {
      title: "Total Transactions",
      value: summary.totalTransactions.toString(),
      icon: Activity,
      color: "text-foreground",
      bgColor: "bg-card",
    },
    {
      title: "Recent Transactions",
      value: `${summary.recentActivity} this month`,
      icon: TrendingUp,
      color: "text-foreground",
      bgColor: "bg-card",
    },
    {
      title: "Last Transaction",
      value: summary.lastTransaction
        ? summary.lastTransaction.toLocaleDateString()
        : "No transactions",
      icon: Calendar,
      color: "text-foreground",
      bgColor: "bg-card",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {summaryCards.map((card) => (
        <Card key={card.title} className="mr-4 lg:mr-0">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-medium text-primary">
              {card.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-semibold text-foreground tracking-wide">
              {card.value}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
