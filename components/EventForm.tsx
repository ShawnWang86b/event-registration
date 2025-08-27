"use client";

import { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { eventFormSchema, EventFormData } from "@/lib/schemas";
import { Event } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
import { ChevronDownIcon } from "lucide-react";
import {
  formatDateTimeLocal,
  parseDateTimeLocal,
  updateDateTimeDate,
  updateDateTimeTime,
  formatDisplayDate,
  formatDisplayTime,
} from "@/utils/dateTime";

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
  submitText = "Save Event",
}: EventFormProps) {
  const [startDateOpen, setStartDateOpen] = useState(false);
  const [endDateOpen, setEndDateOpen] = useState(false);

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
    // Convert datetime-local strings to UTC ISO strings
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

  // Watch the isPeriodic value from the form
  const isPeriodic = form.watch("isPeriodic");

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
                        // Allow empty string or valid number input
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
                        // Allow empty string or valid number input
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

          {/* Start Date and Time */}
          <div className="space-y-4">
            <FormLabel className="text-card-foreground">
              Start Date & Time *
            </FormLabel>
            <div className="flex gap-4">
              <div className="flex flex-col gap-3">
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => {
                    const currentDate = field.value
                      ? new Date(field.value)
                      : undefined;
                    return (
                      <FormItem>
                        <FormLabel className="px-1">Date</FormLabel>
                        <Popover
                          open={startDateOpen}
                          onOpenChange={setStartDateOpen}
                        >
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className="w-40 justify-between font-normal bg-card text-card-foreground border-accent"
                              >
                                {currentDate
                                  ? formatDisplayDate(currentDate)
                                  : "Select date"}
                                <ChevronDownIcon className="h-4 w-4" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent
                            className="w-auto overflow-hidden p-0"
                            align="start"
                          >
                            <Calendar
                              mode="single"
                              selected={currentDate}
                              captionLayout="dropdown"
                              onSelect={(date) => {
                                if (date) {
                                  const newDateTime = updateDateTimeDate(
                                    field.value,
                                    date
                                  );
                                  field.onChange(newDateTime);
                                }
                                setStartDateOpen(false);
                              }}
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />
              </div>
              <div className="flex flex-col gap-3">
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => {
                    const currentTime = field.value
                      ? formatDisplayTime(field.value)
                      : "10:00";
                    return (
                      <FormItem>
                        <FormLabel className="px-1">Time</FormLabel>
                        <FormControl>
                          <Input
                            type="time"
                            value={currentTime}
                            onChange={(e) => {
                              const newDateTime = updateDateTimeTime(
                                field.value,
                                e.target.value
                              );
                              field.onChange(newDateTime);
                            }}
                            className="w-32 bg-card text-card-foreground appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />
              </div>
            </div>
          </div>

          {/* End Date and Time */}
          <div className="space-y-4">
            <FormLabel>End Date & Time *</FormLabel>
            <div className="flex gap-4">
              <div className="flex flex-col gap-3">
                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => {
                    const currentDate = field.value
                      ? new Date(field.value)
                      : undefined;
                    return (
                      <FormItem>
                        <FormLabel className="px-1">Date</FormLabel>
                        <Popover
                          open={endDateOpen}
                          onOpenChange={setEndDateOpen}
                        >
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className="w-40 justify-between font-normal bg-card text-card-foreground border-accent"
                              >
                                {currentDate
                                  ? formatDisplayDate(currentDate)
                                  : "Select date"}
                                <ChevronDownIcon className="h-4 w-4" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent
                            className="w-auto overflow-hidden p-0"
                            align="start"
                          >
                            <Calendar
                              mode="single"
                              selected={currentDate}
                              captionLayout="dropdown"
                              onSelect={(date) => {
                                if (date) {
                                  const newDateTime = updateDateTimeDate(
                                    field.value,
                                    date
                                  );
                                  field.onChange(newDateTime);
                                }
                                setEndDateOpen(false);
                              }}
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />
              </div>
              <div className="flex flex-col gap-3">
                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => {
                    const currentTime = field.value
                      ? formatDisplayTime(field.value)
                      : "12:00";
                    return (
                      <FormItem>
                        <FormLabel className="px-1">Time</FormLabel>
                        <FormControl>
                          <Input
                            type="time"
                            value={currentTime}
                            onChange={(e) => {
                              const newDateTime = updateDateTimeTime(
                                field.value,
                                e.target.value
                              );
                              field.onChange(newDateTime);
                            }}
                            className="w-32 bg-card text-card-foreground appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />
              </div>
            </div>
          </div>

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

          {/* Periodic Event Toggle */}
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
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-[120px] bg-primary hover:bg-primary/90 text-primary-foreground hover:cursor-pointer"
            >
              {isLoading ? "Saving..." : submitText}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
