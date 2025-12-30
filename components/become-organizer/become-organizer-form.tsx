"use client";

import React from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
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
import {
  organizerRequestFormSchema,
  type OrganizerRequestFormData,
} from "@/lib/schemas";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useCreateOrganizerRequest } from "@/hooks/use-organizer-requests";

const BecomeOrganizerForm = () => {
  const router = useRouter();
  const t = useTranslations();
  const createOrganizerRequest = useCreateOrganizerRequest();

  const form = useForm<OrganizerRequestFormData>({
    resolver: zodResolver(organizerRequestFormSchema),
    defaultValues: {
      eventType: undefined,
      description: "",
      contactInfo: "",
    },
  });

  const handleSubmit: SubmitHandler<OrganizerRequestFormData> = async (
    data
  ) => {
    try {
      await createOrganizerRequest.mutateAsync(data);
      toast.success("Organizer request submitted successfully!");
      form.reset();
      router.refresh();
    } catch (error) {
      // Error toast is handled by React Query's onError
      toast.error(
        error instanceof Error ? error.message : "Failed to submit request"
      );
    }
  };

  return (
    <div className="mt-8 max-w-2xl">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {/* Event Type */}
          <FormField
            control={form.control}
            name="eventType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Event Type *</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={(value) => field.onChange(value)}
                    value={field.value}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select event type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basketball">Basketball</SelectItem>
                      <SelectItem value="badminton">Badminton</SelectItem>
                      <SelectItem value="volleyball">Volleyball</SelectItem>
                      <SelectItem value="tennis">Tennis</SelectItem>
                      <SelectItem value="table tennis">Table Tennis</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormDescription>
                  Select the type of events you want to organize
                </FormDescription>
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
                    rows={6}
                    placeholder="Tell us about your experience organizing events, your motivation, and why you want to become an organizer..."
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Please provide at least 10 characters describing your
                  experience and motivation
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Contact Info */}
          <FormField
            control={form.control}
            name="contactInfo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contact Information (Optional)</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Email, phone, or other contact methods"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Optional: Provide additional contact information if needed
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Submit Button */}
          <div className="flex gap-4">
            <Button type="submit" disabled={createOrganizerRequest.isPending}>
              {createOrganizerRequest.isPending
                ? "Submitting..."
                : "Submit Request"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default BecomeOrganizerForm;
