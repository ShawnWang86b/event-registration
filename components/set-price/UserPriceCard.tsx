import { UseFormReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

type UserPriceCardProps = {
  index: number;
  userName: string;
  userEmail: string;
  userId: string;
  registrationId: number;
  defaultPrice: number;
  form: UseFormReturn<any>;
};

export const UserPriceCard = ({
  index,
  userName,
  userEmail,
  userId,
  registrationId,
  defaultPrice,
  form,
}: UserPriceCardProps) => {
  return (
    <div className="flex flex-col lg:flex-row items-start lg:items-center p-4 bg-card border border-border rounded-lg">
      <div className="flex justify-between w-full">
        <div className="flex items-center gap-3 pb-4 lg:pb-0">
          <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
            {index + 1}
          </div>
          <div>
            <div className="font-medium text-card-foreground truncate">
              {userName}
            </div>
            <div className="text-sm text-primary truncate">{userEmail}</div>
          </div>
        </div>

        <div className="flex items-center gap-4 flex-shrink-0">
          <FormField
            control={form.control}
            name={`userPrices.${index}.useDefault`}
            render={({ field }) => (
              <FormItem className="flex items-center space-x-2 space-y-0 pl-2">
                <FormControl>
                  <Checkbox
                    checked={field.value || false}
                    onCheckedChange={(checked) => {
                      field.onChange(checked);
                      // When "use default" is checked, set custom price to default
                      if (checked) {
                        form.setValue(
                          `userPrices.${index}.customPrice`,
                          defaultPrice
                        );
                      }
                    }}
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
                      disabled={form.watch(`userPrices.${index}.useDefault`)}
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
  );
};
