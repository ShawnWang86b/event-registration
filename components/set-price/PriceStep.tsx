import { UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { DialogFooter } from "@/components/ui/dialog";
import { UserPriceCard } from "./UserPriceCard";

type Registration = {
  id: number;
  userId: string;
  user: { name: string; email: string };
};

type PriceStepProps = {
  form: UseFormReturn<any>;
  registeredUsers: Registration[];
  defaultPrice: number;
  onNext: () => void;
  onCancel: () => void;
  isLoading: boolean;
};

export const PriceStep = ({
  form,
  registeredUsers,
  defaultPrice,
  onNext,
  onCancel,
  isLoading,
}: PriceStepProps) => {
  return (
    <Form {...form}>
      <form onSubmit={onNext} className="flex flex-col flex-1 min-h-0">
        <div className="flex-1 space-y-4 overflow-y-auto min-h-0 pr-2">
          {registeredUsers.map((registration, index) => (
            <UserPriceCard
              key={registration.id}
              index={index}
              userName={registration.user.name}
              userEmail={registration.user.email}
              userId={registration.userId}
              registrationId={registration.id}
              defaultPrice={defaultPrice}
              form={form}
            />
          ))}
        </div>

        <DialogFooter className="mt-4 pt-4 border-t flex-shrink-0">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
            className="hover:cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            className="bg-primary text-primary-foreground hover:bg-primary/90 hover:cursor-pointer"
          >
            Next: Review & Confirm
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
};
