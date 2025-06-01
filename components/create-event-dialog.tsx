"use client";

import { useState } from "react";
import { useCreateEvent } from "@/hooks/use-events";
import { EventFormData } from "@/lib/schemas";
import EventForm from "./event-form";

interface CreateEventDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateEventDialog({
  isOpen,
  onClose,
}: CreateEventDialogProps) {
  const createEventMutation = useCreateEvent();

  const handleSubmit = async (data: EventFormData) => {
    try {
      await createEventMutation.mutateAsync({
        title: data.title,
        description: data.description,
        price: data.price,
        startDate: data.startDate,
        endDate: data.endDate,
        location: data.location,
        isPeriodic: data.isPeriodic,
        frequency: data.frequency,
        maxAttendees: data.maxAttendees,
      });
      onClose();
    } catch (error) {
      console.error("Failed to create event:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Create New Event
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          <EventForm
            onSubmit={handleSubmit}
            isLoading={createEventMutation.isPending}
            onCancel={onClose}
            submitText="Create Event"
          />
        </div>
      </div>
    </div>
  );
}
