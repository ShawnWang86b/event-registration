import { useState, useMemo, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { useEventRegistrations } from "@/hooks/use-registrations";
import { useEndEventWithPrices } from "@/hooks/use-events";
import { Event } from "@/types";

// Form schema
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

/**
 * Custom hook for SetPrice component logic
 * Handles multi-step form, data loading, and event ending
 */
export const useSetPrice = (event: Event) => {
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
        (reg: any) => reg.status === "registered"
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
  useEffect(() => {
    if (registeredUsers.length > 0) {
      const userPrices = registeredUsers.map((registration: any) => ({
        userId: registration.userId,
        registrationId: registration.id,
        customPrice: defaultPrice,
        useDefault: true,
      }));

      form.reset({ userPrices });
    }
  }, [registeredUsers, defaultPrice, form]);

  // Step navigation
  const handleStepOne = () => {
    form.trigger();
    setCurrentStep(2);
  };

  const handleStepBack = () => {
    setCurrentStep(1);
  };

  // Calculate pricing summary for step 2
  const pricingSummary = useMemo(() => {
    if (currentStep !== 2 || registeredUsers.length === 0) {
      return { userPricesWithDetails: [], totalAmount: 0, customPriceCount: 0 };
    }

    const formData = form.getValues();
    if (!formData.userPrices) {
      return { userPricesWithDetails: [], totalAmount: 0, customPriceCount: 0 };
    }

    const userPricesWithDetails = formData.userPrices.map(
      (userPrice, index) => {
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

        return {
          ...userPrice,
          userName: registration?.user.name || "Unknown",
          userEmail: registration?.user.email || "Unknown",
          finalPrice,
          isModified,
        };
      }
    );

    const totalAmount = userPricesWithDetails.reduce(
      (sum, u) => sum + u.finalPrice,
      0
    );
    const customPriceCount = userPricesWithDetails.filter(
      (u) => u.isModified
    ).length;

    return { userPricesWithDetails, totalAmount, customPriceCount };
  }, [currentStep, registeredUsers, defaultPrice, form]);

  // End event with pricing
  const handleConfirmEndEvent = async () => {
    const data = form.getValues();
    setIsLoading(true);

    try {
      const result = await endEventMutation.mutateAsync({
        eventId: event.id,
        data: { userPrices: data.userPrices },
      });

      // Show success toast with negative balance warnings if any
      if (result.negativeBalanceWarnings?.length > 0) {
        toast.success("Event ended successfully!", {
          description: `${result.summary.successfulDeductions} users charged, $${result.summary.totalDeducted} total collected. ⚠️ ${result.summary.usersWithNegativeBalance} users now have negative balances.`,
          duration: 8000,
        });

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

      return true; // Success
    } catch (error) {
      console.error("Failed to end event:", error);
      toast.error("Failed to end event", {
        description:
          error instanceof Error ? error.message : "Unknown error occurred",
        duration: 5000,
      });
      return false; // Failure
    } finally {
      setIsLoading(false);
    }
  };

  // Reset form and step
  const resetForm = () => {
    form.reset();
    setCurrentStep(1);
  };

  // Loading/error states
  const hasError = !!error;
  const hasNoUsers = registeredUsers.length === 0;
  const isReady = !dataLoading && !hasError && !hasNoUsers;

  return {
    // Form
    form,
    handleStepOne: form.handleSubmit(handleStepOne),

    // Step management
    currentStep,
    handleStepBack,
    resetForm,

    // Data
    registeredUsers,
    defaultPrice,
    pricingSummary,

    // Actions
    handleConfirmEndEvent,

    // State
    isLoading,
    dataLoading,
    hasError,
    hasNoUsers,
    isReady,
  };
};
