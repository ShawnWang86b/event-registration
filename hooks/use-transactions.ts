import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-services";
import { CreateTransactionData } from "@/types";

// Query keys
export const transactionKeys = {
  all: ["transactions"] as const,
  creditTransactions: () => [...transactionKeys.all, "credit"] as const,
  creditTransactionsPaginated: (params?: {
    limit?: number;
    offset?: number;
    eventId?: number;
  }) => [...transactionKeys.creditTransactions(), "paginated", params] as const,
  transactions: () => [...transactionKeys.all, "legacy"] as const,
  transaction: (id: number) => [...transactionKeys.transactions(), id] as const,
  registrationTransactions: (registrationId: number) =>
    [...transactionKeys.all, "registration", registrationId] as const,
};

// Get credit transactions with pagination
export const useCreditTransactions = (params?: {
  limit?: number;
  offset?: number;
  eventId?: number;
}) => {
  return useQuery({
    queryKey: transactionKeys.creditTransactionsPaginated(params),
    queryFn: () => api.transactions.getCreditTransactions(params),
    staleTime: 30 * 1000, // 30 seconds
  });
};

// Create transaction mutation
export const useCreateTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTransactionData) =>
      api.transactions.createTransaction(data),
    onSuccess: () => {
      // Invalidate and refetch credit transactions
      queryClient.invalidateQueries({
        queryKey: transactionKeys.creditTransactions(),
      });
      // Also invalidate current user data to update balance
      queryClient.invalidateQueries({
        queryKey: ["auth", "me"],
      });
    },
    onError: (error: any) => {
      console.error("Failed to create transaction:", error);
    },
  });
};

// Legacy hooks (keeping for compatibility)

// Get all transactions
export const useTransactions = () => {
  return useQuery({
    queryKey: transactionKeys.transactions(),
    queryFn: () => api.transactions.getTransactions(),
  });
};

// Get single transaction by ID
export const useTransaction = (id: number) => {
  return useQuery({
    queryKey: transactionKeys.transaction(id),
    queryFn: () => api.transactions.getTransaction(id),
    enabled: !!id,
  });
};

// Get transactions for a specific registration
export const useRegistrationTransactions = (registrationId: number) => {
  return useQuery({
    queryKey: transactionKeys.registrationTransactions(registrationId),
    queryFn: () => api.transactions.getRegistrationTransactions(registrationId),
    enabled: !!registrationId,
  });
};
