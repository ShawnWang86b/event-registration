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

interface EventFormProps {
  event?: Event;
  onSubmit: (data: EventFormData) => Promise<void>;
  isLoading?: boolean;
  onCancel?: () => void;
  submitText?: string;
}

export default function EventForm({
  event,
  onSubmit,
  isLoading = false,
  onCancel,
  submitText = "Save Event",
}: EventFormProps) {
  const [isPeriodic, setIsPeriodic] = useState(event?.isPeriodic || false);
  const [startDateOpen, setStartDateOpen] = useState(false);
  const [endDateOpen, setEndDateOpen] = useState(false);
  const [startDate, setStartDate] = useState<Date | undefined>(
    event?.startDate ? new Date(event.startDate) : undefined
  );
  const [endDate, setEndDate] = useState<Date | undefined>(
    event?.endDate ? new Date(event.endDate) : undefined
  );
  const [startTime, setStartTime] = useState(
    event?.startDate
      ? new Date(event.startDate).toTimeString().slice(0, 5)
      : "10:00"
  );
  const [endTime, setEndTime] = useState(
    event?.endDate
      ? new Date(event.endDate).toTimeString().slice(0, 5)
      : "12:00"
  );

  const form = useForm<EventFormData>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: event?.title || "",
      description: event?.description || "",
      price: event?.price ? parseFloat(event.price) : 0,
      startDate: event?.startDate
        ? new Date(event.startDate).toISOString().slice(0, 16)
        : "",
      endDate: event?.endDate
        ? new Date(event.endDate).toISOString().slice(0, 16)
        : "",
      location: event?.location || "",
      isPeriodic: event?.isPeriodic || false,
      frequency: event?.frequency || "",
      maxAttendees: event?.maxAttendees || 1,
      isActive: event?.isActive ?? true,
    },
  });

  const handleSubmit: SubmitHandler<EventFormData> = async (data) => {
    await onSubmit(data);
  };

  const handlePeriodicChange = (checked: boolean) => {
    setIsPeriodic(checked);
    form.setValue("isPeriodic", checked);
    if (!checked) {
      form.setValue("frequency", "");
    }
  };

  const combineDateAndTime = (date: Date, time: string): string => {
    const [hours, minutes] = time.split(":").map((num) => parseInt(num));
    const combined = new Date(date);
    combined.setHours(hours, minutes, 0, 0); // Set seconds and milliseconds to 0

    // Format as YYYY-MM-DDTHH:MM for datetime-local input compatibility
    const year = combined.getFullYear();
    const month = String(combined.getMonth() + 1).padStart(2, "0");
    const day = String(combined.getDate()).padStart(2, "0");
    const hour = String(combined.getHours()).padStart(2, "0");
    const minute = String(combined.getMinutes()).padStart(2, "0");

    return `${year}-${month}-${day}T${hour}:${minute}`;
  };

  const handleStartDateChange = (date: Date | undefined) => {
    setStartDate(date);
    if (date) {
      const combined = combineDateAndTime(date, startTime);
      form.setValue("startDate", combined);
    }
  };

  const handleStartTimeChange = (time: string) => {
    setStartTime(time);
    if (startDate) {
      const combined = combineDateAndTime(startDate, time);
      form.setValue("startDate", combined);
    }
  };

  const handleEndDateChange = (date: Date | undefined) => {
    setEndDate(date);
    if (date) {
      const combined = combineDateAndTime(date, endTime);
      form.setValue("endDate", combined);
    }
  };

  const handleEndTimeChange = (time: string) => {
    setEndTime(time);
    if (endDate) {
      const combined = combineDateAndTime(endDate, time);
      form.setValue("endDate", combined);
    }
  };

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
                  <Input placeholder="Enter event title" {...field} />
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
                  <Textarea
                    placeholder="Enter event description"
                    rows={4}
                    {...field}
                  />
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
                      placeholder="0.00"
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
                      placeholder="50"
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
            <FormLabel>Start Date & Time *</FormLabel>
            <div className="flex gap-4">
              <div className="flex flex-col gap-3">
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
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
                              className="w-40 justify-between font-normal"
                            >
                              {startDate
                                ? startDate.toLocaleDateString()
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
                            selected={startDate}
                            captionLayout="dropdown"
                            onSelect={(date) => {
                              handleStartDateChange(date);
                              setStartDateOpen(false);
                            }}
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex flex-col gap-3">
                <FormItem>
                  <FormLabel className="px-1">Time</FormLabel>
                  <FormControl>
                    <Input
                      type="time"
                      value={startTime}
                      onChange={(e) => handleStartTimeChange(e.target.value)}
                      className="w-32 bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                    />
                  </FormControl>
                </FormItem>
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
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="px-1">Date</FormLabel>
                      <Popover open={endDateOpen} onOpenChange={setEndDateOpen}>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className="w-40 justify-between font-normal"
                            >
                              {endDate
                                ? endDate.toLocaleDateString()
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
                            selected={endDate}
                            captionLayout="dropdown"
                            onSelect={(date) => {
                              handleEndDateChange(date);
                              setEndDateOpen(false);
                            }}
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex flex-col gap-3">
                <FormItem>
                  <FormLabel className="px-1">Time</FormLabel>
                  <FormControl>
                    <Input
                      type="time"
                      value={endTime}
                      onChange={(e) => handleEndTimeChange(e.target.value)}
                      className="w-32 bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                    />
                  </FormControl>
                </FormItem>
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
                  <Input placeholder="Enter event location" {...field} />
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
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
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
                        <SelectValue placeholder="Select frequency" />
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
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-blue-800 hover:bg-blue-900 text-white hover:cursor-pointer"
            >
              {isLoading ? "Saving..." : submitText}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
