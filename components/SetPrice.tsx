"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoadingState, ErrorState, EmptyState } from "@/components/states";
import { PriceStep, ConfirmStep } from "@/components/set-price";
import { useSetPrice } from "@/hooks";
import { Event } from "@/types";

type SetPriceDialogProps = {
  event: Event;
  isOpen: boolean;
  onClose: () => void;
};

const SetPriceDialog = ({ event, isOpen, onClose }: SetPriceDialogProps) => {
  const {
    form,
    handleStepOne,
    currentStep,
    handleStepBack,
    resetForm,
    registeredUsers,
    defaultPrice,
    pricingSummary,
    handleConfirmEndEvent,
    isLoading,
    dataLoading,
    hasError,
    hasNoUsers,
  } = useSetPrice(event);

  const handleCancel = () => {
    resetForm();
    onClose();
  };

  const handleConfirm = async () => {
    const success = await handleConfirmEndEvent();
    if (success) {
      resetForm();
      onClose();
    }
  };

  // Loading state
  if (dataLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="p-4! bg-card sm:max-w-md md:max-w-lg lg:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Set Individual Prices</DialogTitle>
            <DialogDescription>Loading registered users...</DialogDescription>
          </DialogHeader>
          <LoadingState
            message="Loading registered users..."
            fullHeight={false}
          />
        </DialogContent>
      </Dialog>
    );
  }

  // Error state
  if (hasError) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="p-4! bg-card sm:max-w-md md:max-w-lg lg:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Set Individual Prices</DialogTitle>
            <DialogDescription>
              Error loading registered users
            </DialogDescription>
          </DialogHeader>
          <ErrorState
            message="Failed to load registration data"
            fullHeight={false}
          />
          <div className="flex justify-end pt-4">
            <Button variant="outline" onClick={handleCancel}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Empty state
  if (hasNoUsers) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="p-4! bg-card sm:max-w-md md:max-w-lg lg:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Set Individual Prices</DialogTitle>
            <DialogDescription>
              Set custom prices for registered users
            </DialogDescription>
          </DialogHeader>
          <EmptyState
            title="No registered users found"
            message="No registered users found for this event"
            fullHeight={false}
          />
          <div className="flex justify-end pt-4">
            <Button variant="outline" onClick={handleCancel}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Main dialog
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="p-4! bg-card sm:max-w-md md:max-w-lg lg:max-w-2xl max-h-[90vh] overflow-y-auto">
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
                <span className="text-card-foreground text-lg">
                  Set custom prices for each registered user. Default price:{" "}
                </span>
                <span className="text-primary text-lg">
                  ${defaultPrice.toFixed(2)}
                </span>
              </>
            ) : (
              <span className="text-card-foreground text-lg">
                Please review the pricing summary below. Once confirmed, these
                prices cannot be changed.
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        {currentStep === 1 ? (
          <PriceStep
            form={form}
            registeredUsers={registeredUsers}
            defaultPrice={defaultPrice}
            onNext={handleStepOne}
            onCancel={handleCancel}
            isLoading={isLoading}
          />
        ) : (
          <ConfirmStep
            pricingSummary={pricingSummary}
            onBack={handleStepBack}
            onConfirm={handleConfirm}
            isLoading={isLoading}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SetPriceDialog;
