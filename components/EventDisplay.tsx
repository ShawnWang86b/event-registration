"use client";

import CreateEventDialog from "@/components/CreateEvent";
import { LoadingState, ErrorState, EmptyState } from "@/components/states";
import { EventDisplayHeader, EventGrid } from "@/components/event-display";
import EventCalendar from "@/components/EventCalendar";
import { useEventDisplay } from "@/hooks/use-event-display";
import { useDisplayMode } from "@/store";
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

  const displayMode = useDisplayMode();

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
        <div className="pt-8">
          <EventDisplayHeader
            isAdmin={isAdmin}
            onCreateClick={handleCreateClick}
          />

          {displayMode === "grid" ? (
            <EventGrid events={events} onEventRegister={handleEventRegister} />
          ) : (
            <div className="pt-4">
              <EventCalendar
                events={events}
                isAdmin={isAdmin}
                onCreateClick={handleCreateClick}
              />
            </div>
          )}

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
