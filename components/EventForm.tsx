"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { EventFormData } from "@/lib/schemas";
import { Event } from "@/types";
import { useEventForm } from "@/hooks/use-event-form";
import { EVENT_FORM_CONSTANTS } from "@/constants/eventForm";
import { DateTimePicker } from "@/components/form/DateTimePicker";

type EventFormProps = {
  event?: Event;
  onSubmit: (data: EventFormData) => Promise<void>;
  isLoading?: boolean;
  onCancel?: () => void;
  submitText?: string;
};

export default function EventForm({
  event,
  onSubmit,
  isLoading = false,
  onCancel,
  submitText = EVENT_FORM_CONSTANTS.BUTTONS.SAVE_EVENT,
}: EventFormProps) {
  const { form, handleSubmit, handlePeriodicChange, isPeriodic } = useEventForm(
    {
      event,
      onSubmit,
    }
  );

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          {/* Title */}
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Event Title *</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Description */}
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description *</FormLabel>
                <FormControl>
                  <Textarea rows={4} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Price and Max Attendees Row */}
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price ($) *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={field.value || ""}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === "" || !isNaN(Number(value))) {
                          field.onChange(value === "" ? 0 : parseFloat(value));
                        }
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="maxAttendees"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Max Attendees *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="1"
                      value={field.value || ""}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === "" || !isNaN(Number(value))) {
                          field.onChange(value === "" ? 1 : parseInt(value));
                        }
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Start Date and Time - Keep this abstraction, it's complex and reusable */}
          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <DateTimePicker
                label="Start Date & Time *"
                value={field.value}
                onChange={field.onChange}
                defaultTime="10:00"
                error={form.formState.errors.startDate?.message}
                dateId="start-date-picker"
                timeId="start-time-picker"
              />
            )}
          />

          {/* End Date and Time */}
          <FormField
            control={form.control}
            name="endDate"
            render={({ field }) => (
              <DateTimePicker
                label="End Date & Time *"
                value={field.value}
                onChange={field.onChange}
                defaultTime="12:00"
                error={form.formState.errors.endDate?.message}
                dateId="end-date-picker"
                timeId="end-time-picker"
              />
            )}
          />

          {/* Location */}
          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location *</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormDescription>
                  Optional field for event venue or location details
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Recurring Event Toggle */}
          <FormField
            control={form.control}
            name="isPeriodic"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border-input border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Recurring Event</FormLabel>
                  <FormDescription>
                    Enable if this event repeats on a schedule
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={(checked) => {
                      field.onChange(checked);
                      handlePeriodicChange(checked);
                    }}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          {/* Frequency (only show if periodic) */}
          {isPeriodic && (
            <FormField
              control={form.control}
              name="frequency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Frequency *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* Active Status Toggle (only show for editing existing events) */}
          {event && (
            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Event Active</FormLabel>
                    <FormDescription>
                      Inactive events won&apos;t appear in the public event list
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          )}

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-4">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="w-[120px] hover:cursor-pointer hover:bg-secondary/90"
              >
                {EVENT_FORM_CONSTANTS.BUTTONS.CANCEL}
              </Button>
            )}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-[120px] bg-primary hover:bg-primary/90 text-primary-foreground hover:cursor-pointer"
            >
              {isLoading ? EVENT_FORM_CONSTANTS.BUTTONS.SAVING : submitText}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
