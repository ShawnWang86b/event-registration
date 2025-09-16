"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRegisterGuest } from "@/hooks/use-admin-guest-registration";
import { Event } from "@/types";
import LoadingSpinner from "@/components/LoadingSpinner";

type GuestRegistrationDialogProps = {
  event: Event;
  isOpen: boolean;
  onClose: () => void;
};

export const GuestRegistrationDialog = ({
  event,
  isOpen,
  onClose,
}: GuestRegistrationDialogProps) => {
  const [guestName, setGuestName] = useState("");
  const [success, setSuccess] = useState<string | null>(null);

  const registerGuestMutation = useRegisterGuest();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!guestName.trim()) {
      return;
    }

    try {
      setSuccess(null);
      const result = await registerGuestMutation.mutateAsync({
        eventId: event.id,
        guestName: guestName.trim(),
      });

      setSuccess(result.message);

      // Clear form
      setGuestName("");

      // Auto close after success
      setTimeout(() => {
        onClose();
        setSuccess(null);
      }, 2000);
    } catch (error) {
      console.error("Failed to register guest:", error);
      // Error is handled by the mutation hook
    }
  };

  const handleCancel = () => {
    setGuestName("");
    setSuccess(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Register Guest for Event</DialogTitle>
          <DialogDescription>
            Register a guest for {event.title}. The guest will occupy a position
            like a regular user but won&quot;t need to handle payment.
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="flex items-center justify-center p-6">
            <div className="text-center">
              <div className="text-primary font-medium mb-2">Success!</div>
              <div className="text-sm text-muted-foreground">{success}</div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="guestName">Guest Name</Label>
              <Input
                id="guestName"
                type="text"
                placeholder="Enter guest's full name"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                required
                disabled={registerGuestMutation.isPending}
              />
            </div>

            {registerGuestMutation.error && (
              <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                {registerGuestMutation.error.message}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={registerGuestMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={registerGuestMutation.isPending || !guestName.trim()}
              >
                {registerGuestMutation.isPending ? (
                  <>
                    <div className="w-4 h-4 mr-2">
                      <LoadingSpinner />
                    </div>
                    Registering...
                  </>
                ) : (
                  "Register Guest"
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};
