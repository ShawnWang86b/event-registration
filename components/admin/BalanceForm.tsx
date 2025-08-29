import { UseFormReturn } from "react-hook-form";

type BalanceFormData = {
  userIds: string[];
  amount: number;
};

type BalanceFormProps = {
  form: UseFormReturn<BalanceFormData>;
  selectedUsersCount: number;
  isSubmitting: boolean;
  onSubmit: () => void;
};

export const BalanceForm = ({
  form,
  selectedUsersCount,
  isSubmitting,
  onSubmit,
}: BalanceFormProps) => {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* Amount Input */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-900">
          Amount to Add (will be added to each selected user)
        </label>
        <input
          type="number"
          min="1"
          step="1"
          {...form.register("amount", { valueAsNumber: true })}
          placeholder="Enter amount..."
          className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent"
        />
        {form.formState.errors.amount && (
          <p className="text-sm text-red-600">
            {form.formState.errors.amount.message}
          </p>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={selectedUsersCount === 0 || isSubmitting}
        className="w-full bg-primary hover:bg-primary/90 disabled:bg-gray-400 disabled:cursor-not-allowed text-primary-foreground font-medium py-3 px-4 rounded-lg transition-colors"
      >
        {isSubmitting
          ? "Adding Credits..."
          : `Add Credits to ${selectedUsersCount} User(s)`}
      </button>
    </form>
  );
};
