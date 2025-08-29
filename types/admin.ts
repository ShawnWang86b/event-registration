// Admin Balance Management Types
export type BalanceAdjustmentData = {
  action: "add" | "subtract";
  amount: number;
};

export type BalanceAdjustmentResponse = {
  success: boolean;
  user: {
    id: string;
    name: string;
    email: string;
    previousBalance: number;
    newBalance: number;
    adjustment: number;
  };
  transaction: {
    id: number;
    amount: number;
    type: "admin_adjust";
    description: string;
    createdAt: Date;
  };
  action: "add" | "subtract";
  amount: number;
  adjustedBy: string;
  timestamp: string;
};
