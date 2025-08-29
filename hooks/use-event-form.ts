import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { eventFormSchema, EventFormData } from "@/lib/schemas";
import { Event } from "@/lib/types";
import { formatDateTimeLocal, parseDateTimeLocal } from "@/utils/dateTime";

interface UseEventFormProps {
  event?: Event;
  onSubmit: (data: EventFormData) => Promise<void>;
}

export const useEventForm = ({ event, onSubmit }: UseEventFormProps) => {
  const form = useForm<EventFormData>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: event?.title || "",
      description: event?.description || "",
      price: event?.price ? parseFloat(event.price) : 0,
      startDate: event?.startDate ? formatDateTimeLocal(event.startDate) : "",
      endDate: event?.endDate ? formatDateTimeLocal(event.endDate) : "",
      location: event?.location || "",
      isPeriodic: event?.isPeriodic || false,
      frequency: event?.frequency || "",
      maxAttendees: event?.maxAttendees || 1,
      isActive: event?.isActive ?? true,
    },
  });

  const handleSubmit: SubmitHandler<EventFormData> = async (data) => {
    const processedData = {
      ...data,
      startDate: data.startDate ? parseDateTimeLocal(data.startDate) : "",
      endDate: data.endDate ? parseDateTimeLocal(data.endDate) : "",
    };
    await onSubmit(processedData);
  };

  const handlePeriodicChange = (checked: boolean) => {
    form.setValue("isPeriodic", checked);
    if (!checked) {
      form.setValue("frequency", "");
    }
  };

  const isPeriodic = form.watch("isPeriodic");

  return {
    form,
    handleSubmit,
    handlePeriodicChange,
    isPeriodic,
  };
};
