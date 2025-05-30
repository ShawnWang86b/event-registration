// Export auth hooks
export { useCurrentUser, authKeys } from "./use-auth";

// Export all event hooks
export {
  useEvents,
  useEvent,
  useCreateEvent,
  useUpdateEvent,
  useDeleteEvent,
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
  transactionKeys,
} from "./use-transactions";

// Export admin hooks
export {
  useSearchUsers,
  useUserBalance,
  useAdjustUserBalance,
  adminKeys,
} from "./use-admin";

// Export existing hooks
export { useIsMobile } from "./use-mobile";
