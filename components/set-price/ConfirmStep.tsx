import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";

type UserPriceWithDetails = {
  userId: string;
  userName: string;
  userEmail: string;
  finalPrice: number;
  isModified: boolean;
};

type PricingSummary = {
  userPricesWithDetails: UserPriceWithDetails[];
  totalAmount: number;
  customPriceCount: number;
};

type ConfirmStepProps = {
  pricingSummary: PricingSummary;
  onBack: () => void;
  onConfirm: () => void;
  isLoading: boolean;
};

export const ConfirmStep = ({
  pricingSummary,
  onBack,
  onConfirm,
  isLoading,
}: ConfirmStepProps) => {
  const { userPricesWithDetails, totalAmount, customPriceCount } =
    pricingSummary;

  if (userPricesWithDetails.length === 0) {
    return (
      <div className="flex flex-col flex-1 min-h-0">
        <div className="text-center p-8 text-gray-500">
          No pricing data available. Please go back and set prices.
        </div>
        <DialogFooter className="mt-4 pt-4 border-t flex-shrink-0">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            disabled={isLoading}
            className="hover:cursor-pointer"
          >
            Step Back
          </Button>
        </DialogFooter>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="flex-1 space-y-4 overflow-y-auto min-h-0 pr-2">
        {/* Pricing Summary */}
        <div className="bg-secondary border border-secondary rounded-lg p-4 mb-4">
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Pricing Summary
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-foreground">Total Attendees:</span>
              <span className="font-medium ml-2">
                {userPricesWithDetails.length}
              </span>
            </div>
            <div>
              <span className="text-foreground">Default Price Users:</span>
              <span className="font-medium ml-2">
                {userPricesWithDetails.length - customPriceCount}
              </span>
            </div>
            <div>
              <span className="text-foreground">Custom Price Users:</span>
              <span className="font-medium ml-2">{customPriceCount}</span>
            </div>
            <div>
              <span className="text-foreground">Total to Collect:</span>
              <span className="font-medium ml-2">
                ${totalAmount.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* User List */}
        {userPricesWithDetails.map((userPrice, index) => (
          <div
            key={userPrice.userId}
            className="flex items-center justify-between p-4 bg-card border border-border rounded-lg"
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
                {index + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-card-foreground truncate">
                  {userPrice.userName}
                </div>
                <div className="text-sm text-primary truncate">
                  {userPrice.userEmail}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 flex-shrink-0">
              <div className="text-right">
                <div
                  className={
                    userPrice.isModified ? "text-red-600" : "text-gray-800"
                  }
                >
                  ${userPrice.finalPrice.toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <DialogFooter className="mt-4 pt-4 border-t flex-shrink-0">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          disabled={isLoading}
          className="hover:cursor-pointer"
        >
          Step Back
        </Button>
        <Button
          onClick={onConfirm}
          disabled={isLoading}
          className="bg-primary text-primary-foreground hover:bg-primary/90 hover:cursor-pointer"
        >
          {isLoading ? "Ending Event..." : "Confirm End Event"}
        </Button>
      </DialogFooter>
    </div>
  );
};
