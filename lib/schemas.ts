import { z } from "zod";

// Event form schema
export const eventFormSchema = z
  .object({
    title: z
      .string()
      .min(1, "Title is required")
      .max(255, "Title must be less than 255 characters"),
    description: z.string().min(1, "Description is required"),
    price: z.number().min(0, "Price must be 0 or greater"),
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().min(1, "End date is required"),
    location: z.string().optional().or(z.literal("")),
    isPeriodic: z.boolean(),
    frequency: z.string().optional().or(z.literal("")),
    maxAttendees: z.number().min(1, "Must allow at least 1 attendee"),
    isActive: z.boolean(),
  })
  .refine(
    (data) => {
      const startDate = new Date(data.startDate);
      const endDate = new Date(data.endDate);

      return endDate > startDate;
    },
    {
      message: "End date must be after start date",
      path: ["endDate"],
    }
  )
  .refine(
    (data) => {
      // If event is periodic, frequency is required
      if (
        data.isPeriodic &&
        (!data.frequency || data.frequency.trim() === "")
      ) {
        return false;
      }
      return true;
    },
    {
      message: "Frequency is required for periodic events",
      path: ["frequency"],
    }
  );

export type EventFormData = z.infer<typeof eventFormSchema>;
