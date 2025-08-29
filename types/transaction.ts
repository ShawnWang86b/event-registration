// Transaction types
export type Transaction = {
  id: number;
  registrationId: number;
  amount: string;
  status: "pending" | "completed" | "failed" | "refunded";
  paymentMethod?: string;
  transactionId?: string;
  createdAt: Date;
  updatedAt: Date;
};

// Credit transaction types (from the database)
export type CreditTransaction = {
  id: number;
  userId: string;
  amount: string;
  balanceAfter: string;
  type: "deposit" | "spend" | "refund" | "admin_adjust" | "monthly_snapshot";
  description: string;
  eventId?: number;
  registrationId?: number;
  createdAt: Date;
  user?: {
    id: string;
    name: string;
    email: string;
  };
  event?: {
    id: number;
    title: string;
    price: string;
  };
};

// Credit transactions API response
export type CreditTransactionsResponse = {
  transactions: CreditTransaction[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
};

// Create transaction data
export type CreateTransactionData = {
  amount: number;
  type: "deposit" | "spend";
  description?: string;
  eventId?: number;
  registrationId?: number;
};

// Monthly Report Types
export type MonthlyTransaction = {
  id: number;
  amount: number;
  balanceAfter: number;
  type: "deposit" | "spend" | "refund" | "admin_adjust" | "monthly_snapshot";
  description: string;
  createdAt: Date;
  eventId?: number;
  registrationId?: number;
  eventTitle?: string;
  formattedDate: string;
};

export type MonthlySummary = {
  openingBalance: number;
  closingBalance: number;
  totalDeposits: number;
  totalSpending: number;
  totalRefunds: number;
  totalAdjustments: number;
  netChange: number;
  transactionCount: number;
};

export type MonthlyReportResponse = {
  success: boolean;
  user: {
    id: string;
    name: string;
    email: string;
    currentBalance: number;
  };
  reportPeriod: {
    year: number;
    month: number;
    monthName: string;
    startDate: string;
    endDate: string;
  };
  summary: MonthlySummary;
  transactions: MonthlyTransaction[];
  monthlyBalanceRecord?: {
    id: number;
    openingBalance: number;
    totalDeposits: number;
    totalSpending: number;
    totalRefunds: number;
    closingBalance: number;
    createdAt: Date;
  };
  generatedBy: string;
  generatedAt: string;
};

export type CreateMonthlyBalanceData = {
  year: number;
  month: number;
};

export type CreateMonthlyBalanceResponse = {
  success: boolean;
  monthlyBalanceRecord: {
    id: number;
    userId: string;
    month: number;
    year: number;
    openingBalance: string;
    totalDeposits: string;
    totalSpending: string;
    totalRefunds: string;
    closingBalance: string;
    createdAt: Date;
  };
  summary: {
    openingBalance: number;
    totalDeposits: number;
    totalSpending: number;
    totalRefunds: number;
    closingBalance: number;
    transactionCount: number;
  };
};
