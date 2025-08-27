"use client";

import { useUpdateEvent, useToggleEventStatus } from "@/hooks/use-events";
import { EventFormData } from "@/lib/schemas";
import { Event } from "@/lib/types";
import EventForm from "./EventForm";
import { formatDateTimeLocal } from "@/utils/dateTime";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface EditEventDialogProps {
  event: Event;
  isOpen: boolean;
  onClose: () => void;
}

export default function EditEventDialog({
  event,
  isOpen,
  onClose,
}: EditEventDialogProps) {
  const updateEventMutation = useUpdateEvent();
  const toggleStatusMutation = useToggleEventStatus();

  const handleSubmit = async (data: EventFormData) => {
    try {
      // Check if only the active status changed
      const onlyStatusChanged =
        data.title === event.title &&
        data.description === event.description &&
        data.price === parseFloat(event.price) &&
        data.startDate === formatDateTimeLocal(event.startDate) &&
        data.endDate === formatDateTimeLocal(event.endDate) &&
        (data.location || "") === (event.location || "") &&
        data.isPeriodic === event.isPeriodic &&
        (data.frequency || "") === (event.frequency || "") &&
        data.maxAttendees === event.maxAttendees &&
        data.isActive !== event.isActive;

      if (onlyStatusChanged) {
        // Use the toggle endpoint for status-only changes
        await toggleStatusMutation.mutateAsync({
          eventId: event.id,
          isActive: data.isActive,
        });
      } else {
        // Use the update endpoint for full updates
        await updateEventMutation.mutateAsync({
          id: event.id,
          title: data.title,
          description: data.description,
          price: data.price,
          startDate: data.startDate,
          endDate: data.endDate,
          location: data.location,
          isPeriodic: data.isPeriodic,
          frequency: data.frequency,
          maxAttendees: data.maxAttendees,
          isActive: data.isActive,
        });
      }
      onClose();
    } catch (error) {
      console.error("Failed to update event:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-card max-w-[90vw] sm:max-w-md md:max-w-lg lg:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Event</DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>

        <EventForm
          event={event}
          onSubmit={handleSubmit}
          isLoading={
            updateEventMutation.isPending || toggleStatusMutation.isPending
          }
          onCancel={onClose}
          submitText="Update Event"
        />
      </DialogContent>
    </Dialog>
  );
}
