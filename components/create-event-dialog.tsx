"use client";

import { useState } from "react";
import { useCreateEvent } from "@/hooks/use-events";
import { EventFormData } from "@/lib/schemas";
import EventForm from "./event-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Event</DialogTitle>
          <DialogDescription>
            Fill out the form below to create a new event for registration.
          </DialogDescription>
        </DialogHeader>

        <EventForm
          onSubmit={handleSubmit}
          isLoading={createEventMutation.isPending}
          onCancel={onClose}
          submitText="Create Event"
        />
      </DialogContent>
    </Dialog>
  );
}
