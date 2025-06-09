// Export auth hooks
export { useCurrentUser, authKeys } from "./use-auth";

// Export user hooks
export { useUserMonthlyReport, userKeys } from "./use-user";

// Export all event hooks
export {
  useEvents,
  useEvent,
  useCreateEvent,
  useUpdateEvent,
  useDeleteEvent,
  useEndEvent,
  eventKeys,
} from "./use-events";

// Export all registration hooks
export {
  useRegistrations,
  useEventRegistrations,
  useCreateRegistration,
  useCancelRegistration,
  useDeleteRegistration,
  useJoinEvent,
  useCancelEventRegistration,
  registrationKeys,
} from "./use-registrations";

// Export all transaction hooks
export {
  useTransactions,
  useTransaction,
  useRegistrationTransactions,
  useCreditTransactions,
  useCreateTransaction,
  transactionKeys,
} from "./use-transactions";

// Export admin hooks
export {
  useSearchUsers,
  useUserBalance,
  useAdjustUserBalance,
  adminKeys,
} from "./use-admin";

export { useAdminUsers } from "./use-admin-users";

export { useCalorieData } from "./use-calorie-data";

// Export existing hooks
export { useIsMobile } from "./use-mobile";
