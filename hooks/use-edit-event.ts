import { useUpdateEvent, useToggleEventStatus } from "@/hooks/use-events";
import { EventFormData } from "@/lib/schemas";
import { Event } from "@/types";
import { formatDateTimeLocal } from "@/utils/dateTime";
import { toast } from "sonner";

function isOnlyStatusChange(formData: EventFormData, event: Event): boolean {
  return (
    formData.title === event.title &&
    formData.description === event.description &&
    formData.price === parseFloat(event.price) &&
    formData.startDate === formatDateTimeLocal(event.startDate) &&
    formData.endDate === formatDateTimeLocal(event.endDate) &&
    (formData.location || "") === (event.location || "") &&
    formData.isPeriodic === event.isPeriodic &&
    (formData.frequency || "") === (event.frequency || "") &&
    formData.maxAttendees === event.maxAttendees &&
    formData.isActive !== event.isActive
  );
}

export const useEditEvent = (event: Event, onClose: () => void) => {
  const updateEventMutation = useUpdateEvent();
  const toggleStatusMutation = useToggleEventStatus();

  const handleSubmit = async (data: EventFormData) => {
    try {
      if (isOnlyStatusChange(data, event)) {
        // Use the toggle endpoint for status-only changes
        await toggleStatusMutation.mutateAsync({
          eventId: event.id,
          isActive: data.isActive,
        });
        toast.success(
          `Event ${data.isActive ? "activated" : "deactivated"} successfully`
        );
      } else {
        // Use the update endpoint for full updates
        await updateEventMutation.mutateAsync({
          id: event.id,
          ...data, // Spread the entire data object instead of manual mapping
        });
        toast.success("Event updated successfully");
      }
      onClose();
    } catch (error) {
      console.error("Failed to update event:", error);
      toast.error("Failed to update event. Please try again.");
    }
  };

  const isLoading =
    updateEventMutation.isPending || toggleStatusMutation.isPending;

  return {
    handleSubmit,
    isLoading,
  };
};
