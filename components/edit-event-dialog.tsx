"use client";

import { useUpdateEvent, useToggleEventStatus } from "@/hooks/use-events";
import { EventFormData } from "@/lib/schemas";
import { Event } from "@/lib/types";
import EventForm from "./event-form";

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
        data.startDate ===
          new Date(event.startDate).toISOString().slice(0, 16) &&
        data.endDate === new Date(event.endDate).toISOString().slice(0, 16) &&
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Edit Event</h2>
              <p className="text-sm text-gray-600 mt-1">
                Event ID: {event.id} • Status:{" "}
                {event.isActive ? (
                  <span className="text-green-600 font-medium">Active</span>
                ) : (
                  <span className="text-red-600 font-medium">Inactive</span>
                )}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          <EventForm
            event={event}
            onSubmit={handleSubmit}
            isLoading={
              updateEventMutation.isPending || toggleStatusMutation.isPending
            }
            onCancel={onClose}
            submitText="Update Event"
          />
        </div>
      </div>
    </div>
  );
}
