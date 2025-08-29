// EventCard Constants - Only meaningful business values
export const EVENT_CARD_CONSTANTS = {
  // Text & Labels - Business content
  LABELS: {
    ADMIN_ACTIONS: "Admin Actions:",
    EVENT_DETAILS: "Event Details",
    REGISTRATION_DETAILS: "Event Registration Details",
    EVENT_REGISTRATIONS: "Event Registrations",
    PRICE: "Price:",
    DATE: "Date:",
    TIME: "Time:",
    LOCATION: "Location:",
    REGISTRATIONS: "Registrations:",
    FREQUENCY: "Frequency:",
  },

  // Button Text - User-facing content
  BUTTONS: {
    EDIT: "Edit",
    SET_PRICE: "Set Price",
    LOADING: "Loading...",
    VIEW_DETAILS: "View Event Details",
    REGISTER: "Register for this event",
  },

  // Status Messages - Business logic content
  STATUS: {
    LOADING: "Loading...",
    ERROR_LOADING: "Error loading",
    FULL_SUFFIX: " (Full)",
    DEFAULT_REGISTRATIONS: "--",
    COMING_SOON: "Registration details shown below, coming soon...",
  },

  // Default Values - Business logic
  DEFAULTS: {
    FREQUENCY: "one time",
    PRICE_DECIMALS: 2,
  },
} as const;

// Location Image Mapping
export const LOCATION_IMAGE_MAP = {
  "box hill": "/stadium/box-hill.jpg",
  "vermont south": "/stadium/vermont-south.jpg",
  default: "/stadium/default.jpg",
} as const;

// Event Status Types
export type EventStatus = "loading" | "full" | "available" | "error";

// Registration Button States
export type ButtonState = "loading" | "disabled" | "register" | "view_details";
