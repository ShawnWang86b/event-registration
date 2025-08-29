"use client";

import CreateEventDialog from "@/components/CreateEvent";
import { LoadingState, ErrorState, EmptyState } from "@/components/ui/states";
import { EventDisplayHeader, EventGrid } from "@/components/event-display";
import { useEventDisplay } from "@/hooks/use-event-display";
import { EVENT_DISPLAY_CONSTANTS } from "@/constants/eventDisplay";
import { withErrorBoundary } from "@/components/ErrorBoundary";

const EventDisplay = () => {
  const {
    displayState,
    isCreateDialogOpen,
    events,
    isAdmin,
    errorType,
    errorMessage,
    handleCreateClick,
    handleCreateClose,
    handleRetry,
    handleEventRegister,
    emptyStateAction,
  } = useEventDisplay();

  // Render different states
  switch (displayState) {
    case "loading":
      return <LoadingState message="Loading events..." />;

    case "error":
      return (
        <ErrorState
          message={errorMessage}
          errorType={errorType}
          onRetry={handleRetry}
          showDetails={process.env.NODE_ENV === "development"}
          details={errorMessage}
        />
      );

    case "empty":
      return (
        <EmptyState
          title={EVENT_DISPLAY_CONSTANTS.TEXT.NO_EVENTS}
          message="There are no events available at the moment. Check back later or create a new event if you're an admin."
          action={emptyStateAction}
        />
      );

    case "success":
    default:
      return (
        <div className="min-h-screen min-w-[80vw] lg:w-auto p-16">
          <EventDisplayHeader
            isAdmin={isAdmin}
            onCreateClick={handleCreateClick}
          />

          <EventGrid events={events} onEventRegister={handleEventRegister} />

          {/* Create Event Dialog */}
          <CreateEventDialog
            isOpen={isCreateDialogOpen}
            onClose={handleCreateClose}
          />
        </div>
      );
  }
};

// Export wrapped component with error boundary
const EventDisplayWithErrorBoundary = withErrorBoundary(
  EventDisplay,
  <ErrorState
    message="Failed to load events page"
    errorType="unknown"
    fullHeight={true}
  />
);

EventDisplayWithErrorBoundary.displayName = "EventDisplay";

export default EventDisplayWithErrorBoundary;
