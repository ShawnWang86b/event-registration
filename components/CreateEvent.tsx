"use client";

import { useCreateEvent } from "@/hooks/use-events";
import { EventFormData } from "@/lib/schemas";
import EventForm from "./EventForm";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EVENT_FORM_CONSTANTS } from "@/constants/eventForm";
import { withErrorBoundary } from "@/components/ErrorBoundary";

type CreateEventDialogProps = {
  isOpen: boolean;
  onClose: () => void;
};

const CreateEventDialog = ({ isOpen, onClose }: CreateEventDialogProps) => {
  const createEventMutation = useCreateEvent();

  const handleSubmit = async (data: EventFormData) => {
    try {
      // Use spread operator to pass all fields cleanly
      await createEventMutation.mutateAsync(data);
      onClose();
    } catch (error) {
      console.error("Failed to create event:", error);
      // Note: Error handling can be improved with toast notifications
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-card max-w-[90vw] sm:max-w-md md:max-w-lg lg:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-card-foreground">
            Create New Event
          </DialogTitle>
          <DialogDescription className="text-primary">
            Fill out the form below to create a new event for registration.
          </DialogDescription>
        </DialogHeader>

        <EventForm
          onSubmit={handleSubmit}
          isLoading={createEventMutation.isPending}
          onCancel={onClose}
          submitText={EVENT_FORM_CONSTANTS.BUTTONS.CREATE_EVENT}
        />
      </DialogContent>
    </Dialog>
  );
};

// Export with error boundary
const CreateEventDialogWithErrorBoundary = withErrorBoundary(
  CreateEventDialog,
  <div className="p-4 text-center text-red-600">
    Failed to load create event form. Please try again.
  </div>
);

export default CreateEventDialogWithErrorBoundary;
