"use client";

import { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { eventFormSchema, EventFormData } from "@/lib/schemas";
import { Event } from "@/lib/types";

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

  return (
    <div className="space-y-6">
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        {/* Title */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-900">
            Event Title *
          </label>
          <input
            {...form.register("title")}
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter event title"
          />
          {form.formState.errors.title && (
            <p className="text-sm text-red-600">
              {form.formState.errors.title.message}
            </p>
          )}
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-900">
            Description *
          </label>
          <textarea
            {...form.register("description")}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter event description"
          />
          {form.formState.errors.description && (
            <p className="text-sm text-red-600">
              {form.formState.errors.description.message}
            </p>
          )}
        </div>

        {/* Price and Max Attendees Row */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-900">
              Price ($) *
            </label>
            <input
              {...form.register("price", { valueAsNumber: true })}
              type="number"
              min="0"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0.00"
            />
            {form.formState.errors.price && (
              <p className="text-sm text-red-600">
                {form.formState.errors.price.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-900">
              Max Attendees *
            </label>
            <input
              {...form.register("maxAttendees", { valueAsNumber: true })}
              type="number"
              min="1"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="50"
            />
            {form.formState.errors.maxAttendees && (
              <p className="text-sm text-red-600">
                {form.formState.errors.maxAttendees.message}
              </p>
            )}
          </div>
        </div>

        {/* Start Date and End Date Row */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-900">
              Start Date & Time *
            </label>
            <input
              {...form.register("startDate")}
              type="datetime-local"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {form.formState.errors.startDate && (
              <p className="text-sm text-red-600">
                {form.formState.errors.startDate.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-900">
              End Date & Time *
            </label>
            <input
              {...form.register("endDate")}
              type="datetime-local"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {form.formState.errors.endDate && (
              <p className="text-sm text-red-600">
                {form.formState.errors.endDate.message}
              </p>
            )}
          </div>
        </div>

        {/* Location */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-900">Location</label>
          <input
            {...form.register("location")}
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter event location (optional)"
          />
        </div>

        {/* Periodic Event Toggle */}
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="isPeriodic"
              checked={isPeriodic}
              onChange={(e) => handlePeriodicChange(e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
            />
            <label
              htmlFor="isPeriodic"
              className="text-sm font-medium text-gray-900"
            >
              Recurring Event
            </label>
          </div>

          {/* Frequency (only show if periodic) */}
          {isPeriodic && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900">
                Frequency *
              </label>
              <select
                {...form.register("frequency")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select frequency</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
              {form.formState.errors.frequency && (
                <p className="text-sm text-red-600">
                  {form.formState.errors.frequency.message}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Active Status Toggle (only show for editing existing events) */}
        {event && (
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="isActive"
                {...form.register("isActive")}
                className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500"
              />
              <label
                htmlFor="isActive"
                className="text-sm font-medium text-gray-900"
              >
                Event Active
              </label>
            </div>
            <p className="text-xs text-gray-500">
              Inactive events won&apos;t appear in the public event list
            </p>
          </div>
        )}

        {/* Form Actions */}
        <div className="flex gap-3 pt-4">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            {isLoading ? "Saving..." : submitText}
          </button>
        </div>
      </form>
    </div>
  );
}
