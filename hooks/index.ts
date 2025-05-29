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
  registrationKeys,
} from "./use-registrations";

// Export all transaction hooks
export {
  useTransactions,
  useTransaction,
  useRegistrationTransactions,
  transactionKeys,
} from "./use-transactions";

// Export existing hooks
export { useIsMobile } from "./use-mobile";
