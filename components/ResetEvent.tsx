"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  Users,
  Calendar,
  RefreshCw,
  CheckCircle,
} from "lucide-react";
import { Event } from "@/types";
import { useState } from "react";
import { useResetEvent } from "@/hooks";

type ResetEventDialogProps = {
  event: Event;
  isOpen: boolean;
  onClose: () => void;
};

const ResetEventDialog = ({
  event,
  isOpen,
  onClose,
}: ResetEventDialogProps) => {
  const [success, setSuccess] = useState<string | null>(null);
  const resetEventMutation = useResetEvent();

  const handleReset = async () => {
    try {
      setSuccess(null);

      const result = await resetEventMutation.mutateAsync(event.id);

      setSuccess(result.message || "Event successfully reset!");

      // Auto close after success
      setTimeout(() => {
        onClose();
        setSuccess(null);
      }, 1500);
    } catch (err: any) {
      // Error is handled by the mutation hook
      console.error("Reset failed:", err);
    }
  };

  const handleCancel = () => {
    setSuccess(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="p-4! bg-card max-w-[90vw] sm:max-w-sm md:max-w-lg lg:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            Reset Event
          </DialogTitle>
          <DialogDescription>
            This action will remove all registrations from this event.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Event Info */}
          <div className="p-4 bg-card rounded-lg space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4" />
              <span className="font-medium">{event.title}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>All registered users will be removed</span>
            </div>
          </div>

          {/* Warning */}
          <div className="p-4 bg-secondary border border-secondary rounded-lg">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-secondary-foreground mt-0.5" />
              <div className="text-sm text-secondary-foreground">
                <p className="font-medium">Warning:</p>
                <p>
                  This will permanently remove all registrations. This action
                  cannot be undone.
                </p>
              </div>
            </div>
          </div>

          {/* Success Message */}
          {success && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                <div className="text-sm text-green-800">
                  <p className="font-medium">Success!</p>
                  <p>{success}</p>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {resetEventMutation.error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />
                <div className="text-sm text-red-800">
                  <p className="font-medium">Error:</p>
                  <p>
                    {resetEventMutation.error.message ||
                      "Failed to reset event"}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              className="cursor-pointer"
              onClick={handleCancel}
              disabled={resetEventMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              className="cursor-pointer"
              onClick={handleReset}
              disabled={resetEventMutation.isPending}
            >
              {resetEventMutation.isPending ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Resetting...
                </>
              ) : (
                <>Reset Event</>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ResetEventDialog;
