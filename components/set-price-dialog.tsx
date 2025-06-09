"use client";

import React, { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useEventRegistrations } from "@/hooks/use-registrations";
import { useEndEventWithPrices } from "@/hooks/use-events";
import { Event } from "@/lib/types";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";

// Form schema using Zod
const setPriceSchema = z.object({
  userPrices: z.array(
    z.object({
      userId: z.string(),
      registrationId: z.number(),
      customPrice: z.number().min(0, "Price must be 0 or greater").optional(),
      useDefault: z.boolean(),
    })
  ),
});

type SetPriceFormData = z.infer<typeof setPriceSchema>;

interface SetPriceDialogProps {
  event: Event;
  isOpen: boolean;
  onClose: () => void;
}

const SetPriceDialog = ({ event, isOpen, onClose }: SetPriceDialogProps) => {
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  const [isLoading, setIsLoading] = useState(false);
  const endEventMutation = useEndEventWithPrices();

  // Get registered users for this event
  const {
    data: registrationData,
    isLoading: dataLoading,
    error,
  } = useEventRegistrations(event.id);

  // Memoize registered users to prevent unnecessary re-renders
  const registeredUsers = useMemo(() => {
    return (
      registrationData?.registrations.filter(
        (reg) => reg.status === "registered"
      ) || []
    );
  }, [registrationData?.registrations]);

  const defaultPrice = parseFloat(event.price);

  // Initialize form with registered users
  const form = useForm<SetPriceFormData>({
    resolver: zodResolver(setPriceSchema),
    defaultValues: {
      userPrices: [],
    },
  });

  // Reset form when registration data changes
  React.useEffect(() => {
    if (registeredUsers.length > 0) {
      const userPrices = registeredUsers.map((registration) => ({
        userId: registration.userId,
        registrationId: registration.id,
        customPrice: defaultPrice,
        useDefault: true,
      }));

      form.reset({
        userPrices,
      });
    }
  }, [registeredUsers, defaultPrice, form]);

  const handleStepOne = () => {
    // Debug: Log current form data when moving to step 2
    const formData = form.getValues();
    console.log("Step 1 -> Step 2, Form data:", formData);

    // Force form to re-validate and ensure we have latest data
    form.trigger();

    setCurrentStep(2);
  };

  const handleStepBack = () => {
    setCurrentStep(1);
  };

  const handleConfirmEndEvent = async () => {
    const data = form.getValues();
    setIsLoading(true);
    try {
      console.log(data);
      // Call the end event API with individual prices using the hook
      const result = await endEventMutation.mutateAsync({
        eventId: event.id,
        data: {
          userPrices: data.userPrices,
        },
      });

      // Show success toast with negative balance warnings if any
      if (
        result.negativeBalanceWarnings &&
        result.negativeBalanceWarnings.length > 0
      ) {
        toast.success("Event ended successfully!", {
          description: `${result.summary.successfulDeductions} users charged, $${result.summary.totalDeducted} total collected. ⚠️ ${result.summary.usersWithNegativeBalance} users now have negative balances.`,
          duration: 8000,
        });

        // Show additional warning toast for negative balances
        toast.warning("Negative Balance Alert", {
          description: `${result.summary.usersWithNegativeBalance} users have insufficient credits and now have negative balances. Please contact them for payment.`,
          duration: 10000,
        });
      } else {
        toast.success("Event ended successfully!", {
          description: `${result.summary.successfulDeductions} users charged, $${result.summary.totalDeducted} total collected`,
          duration: 5000,
        });
      }

      // Close the modal on success
      onClose();
      // Reset to step 1 for next time
      setCurrentStep(1);
    } catch (error) {
      console.error("Failed to end event:", error);
      toast.error("Failed to end event", {
        description:
          error instanceof Error ? error.message : "Unknown error occurred",
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    form.reset();
    setCurrentStep(1);
    onClose();
  };

  // Get current form data for confirmation step - use getValues() instead of watch()
  const getUserPricesWithDetails = () => {
    if (currentStep !== 2 || registeredUsers.length === 0) return [];

    const formData = form.getValues();
    console.log("Step 2 - Form data:", formData);

    if (!formData.userPrices) return [];

    return formData.userPrices.map((userPrice, index) => {
      const registration = registeredUsers[index];

      // Calculate final price
      let finalPrice: number;
      if (userPrice.useDefault) {
        finalPrice = defaultPrice;
      } else {
        finalPrice = userPrice.customPrice || defaultPrice;
      }

      // Check if modified (not using default AND custom price is different from default)
      const isModified =
        !userPrice.useDefault && userPrice.customPrice !== defaultPrice;

      // Note: We can't check for negative balance here because creditBalance is not available
      // in the registration data for security reasons. We'll show warnings after the event is processed.

      console.log(`User ${index}:`, {
        useDefault: userPrice.useDefault,
        customPrice: userPrice.customPrice,
        defaultPrice,
        finalPrice,
        isModified,
      });

      return {
        ...userPrice,
        userName: registration?.user.name || "Unknown",
        userEmail: registration?.user.email || "Unknown",
        finalPrice,
        isModified,
      };
    });
  };

  // Get the data for step 2
  const userPricesWithDetails = getUserPricesWithDetails();

  // Force re-calculation when step changes
  const [stepTrigger, setStepTrigger] = useState(0);

  React.useEffect(() => {
    if (currentStep === 2) {
      setStepTrigger((prev) => prev + 1);
    }
  }, [currentStep]);

  if (dataLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Set Individual Prices</DialogTitle>
            <DialogDescription>Loading registered users...</DialogDescription>
          </DialogHeader>
          <div className="flex justify-center items-center p-8">
            <div className="text-gray-500">Loading...</div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (error) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Set Individual Prices</DialogTitle>
            <DialogDescription>
              Error loading registered users
            </DialogDescription>
          </DialogHeader>
          <div className="text-center p-8 text-red-500">
            Failed to load registration data
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCancel}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  if (registeredUsers.length === 0) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Set Individual Prices</DialogTitle>
            <DialogDescription>
              Set custom prices for registered users
            </DialogDescription>
          </DialogHeader>
          <div className="text-center p-8 text-gray-500">
            No registered users found for this event
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCancel}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[90vw] sm:max-w-md md:max-w-lg lg:max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex flex-col lg:flex-row items-center gap-3">
            {currentStep === 1 ? "Set Individual Prices" : "Confirm End Event"}
            <div className="flex items-center gap-2">
              <Badge variant={currentStep === 1 ? "default" : "secondary"}>
                Step 1
              </Badge>
              <Badge variant={currentStep === 2 ? "default" : "secondary"}>
                Step 2
              </Badge>
            </div>
          </DialogTitle>
          <DialogDescription>
            {currentStep === 1 ? (
              <>
                Set custom prices for each registered user. Default price:
                <span className="text-blue-800 font-bold">
                  $ {defaultPrice.toFixed(2)}
                </span>
              </>
            ) : (
              <span className="text-red-600 font-medium">
                ⚠️ Please review the pricing summary below. Once confirmed,
                these prices cannot be changed.
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        {currentStep === 1 ? (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleStepOne)}
              className="flex flex-col flex-1 min-h-0"
            >
              <div className="flex-1 space-y-4 overflow-y-auto min-h-0 pr-2">
                {registeredUsers.map((registration, index) => (
                  <div
                    key={registration.id}
                    className="flex flex-col lg:flex-row items-start lg:items-center p-4 bg-gray-50 border border-gray-200 rounded-lg"
                  >
                    <div className="flex items-center gap-3 pb-4 lg:pb-0">
                      <div className="w-8 h-8 bg-blue-800 text-white rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
                        {index + 1}
                      </div>
                      <div className="">
                        <div className="font-medium text-gray-800 truncate">
                          {registration.user.name}
                        </div>
                        <div className="text-sm text-gray-600 truncate">
                          {registration.user.email}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 flex-shrink-0">
                      <FormField
                        control={form.control}
                        name={`userPrices.${index}.useDefault`}
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2 space-y-0 pl-2">
                            <FormControl>
                              <input
                                type="checkbox"
                                checked={field.value || false}
                                onChange={(e) => {
                                  field.onChange(e.target.checked);
                                  // When "use default" is checked, set custom price to default
                                  if (e.target.checked) {
                                    form.setValue(
                                      `userPrices.${index}.customPrice`,
                                      defaultPrice
                                    );
                                  }
                                }}
                                className="w-4 h-4 text-blue-800 bg-gray-100 border-gray-300 rounded focus:ring-blue-800"
                              />
                            </FormControl>
                            <FormLabel className="text-sm font-normal">
                              Use default (${defaultPrice.toFixed(2)})
                            </FormLabel>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`userPrices.${index}.customPrice`}
                        render={({ field }) => (
                          <FormItem className="w-24">
                            <FormControl>
                              <div className="relative">
                                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                                  $
                                </span>
                                <Input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  placeholder="0.00"
                                  value={field.value || ""}
                                  disabled={form.watch(
                                    `userPrices.${index}.useDefault`
                                  )}
                                  className="pl-6 text-right"
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    field.onChange(
                                      value === "" ? "" : parseFloat(value) || 0
                                    );
                                  }}
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Hidden fields to store userId and registrationId */}
                    <FormField
                      control={form.control}
                      name={`userPrices.${index}.userId`}
                      render={({ field }) => (
                        <input
                          type="hidden"
                          value={field.value || ""}
                          onChange={field.onChange}
                        />
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`userPrices.${index}.registrationId`}
                      render={({ field }) => (
                        <input
                          type="hidden"
                          value={field.value || ""}
                          onChange={field.onChange}
                        />
                      )}
                    />
                  </div>
                ))}
              </div>

              <DialogFooter className="mt-4 pt-4 border-t flex-shrink-0">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="bg-blue-800 text-white hover:bg-blue-900 hover:cursor-pointer"
                >
                  Next: Review & Confirm
                </Button>
              </DialogFooter>
            </form>
          </Form>
        ) : (
          // Step 2: Confirmation
          <div className="flex flex-col flex-1 min-h-0">
            <div className="flex-1 space-y-4 overflow-y-auto min-h-0 pr-2">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <h3 className="font-semibold text-yellow-800 mb-2">
                  Pricing Summary
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Total Attendees:</span>
                    <span className="font-medium ml-2">
                      {userPricesWithDetails.length}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Default Price Users:</span>
                    <span className="font-medium ml-2">
                      {
                        userPricesWithDetails.filter((u) => !u.isModified)
                          .length
                      }
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Custom Price Users:</span>
                    <span className="font-medium ml-2 text-red-600">
                      {userPricesWithDetails.filter((u) => u.isModified).length}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Total to Collect:</span>
                    <span className="font-medium ml-2 text-green-600">
                      $
                      {userPricesWithDetails
                        .reduce((sum, u) => sum + u.finalPrice, 0)
                        .toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {userPricesWithDetails.length === 0 ? (
                <div className="text-center p-8 text-gray-500">
                  No pricing data available. Please go back and set prices.
                </div>
              ) : (
                userPricesWithDetails.map((userPrice, index) => (
                  <div
                    key={userPrice.userId}
                    className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-8 h-8 bg-blue-800 text-white rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-800 truncate">
                          {userPrice.userName}
                        </div>
                        <div className="text-sm text-gray-600 truncate">
                          {userPrice.userEmail}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 flex-shrink-0">
                      <div className="text-right">
                        <div
                          className={`font-bold ${
                            userPrice.isModified
                              ? "text-red-600"
                              : "text-gray-800"
                          }`}
                        >
                          ${userPrice.finalPrice.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <DialogFooter className="mt-4 pt-4 border-t flex-shrink-0">
              <Button
                type="button"
                variant="outline"
                onClick={handleStepBack}
                disabled={isLoading}
              >
                Step Back
              </Button>
              <Button
                onClick={handleConfirmEndEvent}
                disabled={isLoading}
                className="bg-blue-800 hover:bg-blue-900 hover:cursor-pointer"
              >
                {isLoading ? "Ending Event..." : "Confirm End Event"}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SetPriceDialog;
