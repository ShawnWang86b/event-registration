"use client";

import { Event } from "@/types";
import EventForm from "./EventForm";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useEditEvent } from "@/hooks";
import { useTranslations } from "next-intl";

type EditEventDialogProps = {
  event: Event;
  isOpen: boolean;
  onClose: () => void;
};

export default function EditEventDialog({
  event,
  isOpen,
  onClose,
}: EditEventDialogProps) {
  const { handleSubmit, isLoading } = useEditEvent(event, onClose);
  const t = useTranslations("EventsPage.adminActions.modal.editModal");

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="p-4! bg-card sm:max-w-md md:max-w-lg lg:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("mainTitle")}</DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>

        <EventForm
          event={event}
          onSubmit={handleSubmit}
          isLoading={isLoading}
          onCancel={onClose}
          submitText="Update Event"
        />
      </DialogContent>
    </Dialog>
  );
}
