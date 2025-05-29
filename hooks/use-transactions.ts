import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-services";
import { Transaction } from "@/lib/types";

// Query keys
export const transactionKeys = {
  all: ["transactions"] as const,
  lists: () => [...transactionKeys.all, "list"] as const,
  details: () => [...transactionKeys.all, "detail"] as const,
  detail: (id: number) => [...transactionKeys.details(), id] as const,
  byRegistration: (registrationId: number) =>
    [...transactionKeys.all, "registration", registrationId] as const,
};

// Get all transactions
export const useTransactions = () => {
  return useQuery({
    queryKey: transactionKeys.lists(),
    queryFn: () => api.transactions.getTransactions(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get single transaction
export const useTransaction = (id: number) => {
  return useQuery({
    queryKey: transactionKeys.detail(id),
    queryFn: () => api.transactions.getTransaction(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get transactions for a specific registration
export const useRegistrationTransactions = (registrationId: number) => {
  return useQuery({
    queryKey: transactionKeys.byRegistration(registrationId),
    queryFn: () => api.transactions.getRegistrationTransactions(registrationId),
    enabled: !!registrationId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};
