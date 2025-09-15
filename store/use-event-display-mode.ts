import { create } from "zustand";
import { persist } from "zustand/middleware";

// Define the display modes
export type EventDisplayMode = "grid" | "calendar";

// Define the store interface
type EventDisplayModeState = {
  displayMode: EventDisplayMode;
  setDisplayMode: (mode: EventDisplayMode) => void;
  toggleDisplayMode: () => void;
};

// Create the Zustand store with persistence
export const useEventDisplayMode = create<EventDisplayModeState>()(
  persist(
    (set, get) => ({
      // Default display mode is grid
      displayMode: "grid",

      // Set a specific display mode
      setDisplayMode: (mode: EventDisplayMode) => {
        set({ displayMode: mode });
      },

      // Toggle between grid and calendar modes
      toggleDisplayMode: () => {
        const currentMode = get().displayMode;
        const newMode = currentMode === "grid" ? "calendar" : "grid";
        set({ displayMode: newMode });
      },
    }),
    {
      name: "event-display-mode-storage", // Storage key
      // Only persist the displayMode, not the functions
      partialize: (state) => ({ displayMode: state.displayMode }),
    }
  )
);

// Convenience hooks for individual store actions
export const useDisplayMode = () =>
  useEventDisplayMode((state) => state.displayMode);
export const useSetDisplayMode = () =>
  useEventDisplayMode((state) => state.setDisplayMode);
export const useToggleDisplayMode = () =>
  useEventDisplayMode((state) => state.toggleDisplayMode);

// Export the type again for convenience
