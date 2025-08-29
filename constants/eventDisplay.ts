// EventDisplay Constants - Only meaningful business values
export const EVENT_DISPLAY_CONSTANTS = {
  // Text & Labels - These are business content
  TEXT: {
    TITLE: "Events",
    SUBTITLE: "Discover and register for upcoming basketball events",
    NO_EVENTS: "No events found",
    LOADING: "Loading events...",
  },

  // Error Messages - These are business logic
  ERRORS: {
    FETCH_FAILED: "Failed to fetch events",
    GENERIC_ERROR: "Something went wrong while loading events",
    NETWORK_ERROR: "Network error. Please check your connection.",
  },

  // Button Configuration - Meaningful values only
  CREATE_BUTTON: {
    ICON_SIZE: 16,
    ARIA_LABEL: "Create new event",
  },
} as const;

// Event Display States
export type EventDisplayState = "loading" | "error" | "empty" | "success";

// Error Types
export type EventDisplayErrorType = "network" | "server" | "unknown";
