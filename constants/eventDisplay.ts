export const EVENT_DISPLAY_CONSTANTS = {
  TEXT: {
    TITLE: "Events",
    SUBTITLE: "Discover and register for upcoming basketball events",
    NO_EVENTS: "No events found",
    LOADING: "Loading events...",
  },

  ERRORS: {
    FETCH_FAILED: "Failed to fetch events",
    GENERIC_ERROR: "Something went wrong while loading events",
    NETWORK_ERROR: "Network error. Please check your connection.",
  },

  CREATE_BUTTON: {
    ICON_SIZE: 16,
    ARIA_LABEL: "Create new event",
  },
} as const;

export type EventDisplayState = "loading" | "error" | "empty" | "success";

export type EventDisplayErrorType = "network" | "server" | "unknown";
