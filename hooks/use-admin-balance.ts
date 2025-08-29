import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { useSearchUsers, useAdjustUserBalance } from "@/hooks";
import { UserSearchResult } from "@/types";

// Form schema
const balanceAdjustmentSchema = z.object({
  userIds: z.array(z.string()).min(1, "Please select at least one user"),
  amount: z.number().min(1, "Amount must be greater than 0"),
});

type BalanceAdjustmentForm = z.infer<typeof balanceAdjustmentSchema>;

export const useAdminBalance = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<UserSearchResult[]>([]);
  const [isComboboxOpen, setIsComboboxOpen] = useState(false);

  // Fetch users based on search query
  const { data: usersData, isLoading: isSearchLoading } =
    useSearchUsers(searchQuery);
  const users = usersData?.users || [];

  // Balance adjustment mutation
  const adjustBalanceMutation = useAdjustUserBalance();

  // Form setup
  const form = useForm<BalanceAdjustmentForm>({
    resolver: zodResolver(balanceAdjustmentSchema),
    defaultValues: {
      userIds: [],
      amount: 0,
    },
  });

  // Handle form submission
  const handleSubmit = async (data: BalanceAdjustmentForm) => {
    try {
      // Adjust balance for each selected user
      const results = await Promise.allSettled(
        selectedUsers.map((user) =>
          adjustBalanceMutation.mutateAsync({
            userId: user.id,
            data: {
              action: "add",
              amount: data.amount,
            },
          })
        )
      );

      // Count successful and failed operations
      const successful = results.filter((r) => r.status === "fulfilled").length;
      const failed = results.filter((r) => r.status === "rejected").length;

      if (failed === 0) {
        toast.success(
          `Successfully added $${data.amount} credits to ${successful} user(s)`
        );
      } else {
        toast.error(
          `Added credits to ${successful} user(s), but ${failed} failed. Check console for details.`
        );

        // Log failed attempts
        results.forEach((result, index) => {
          if (result.status === "rejected") {
            console.error(
              `Failed to add credits to ${selectedUsers[index]?.name}:`,
              result.reason
            );
          }
        });
      }

      // Reset form after processing
      form.reset();
      setSelectedUsers([]);
      setSearchQuery("");
    } catch (error) {
      console.error("Error adjusting balance:", error);
      toast.error("Failed to adjust balance. Please try again.");
    }
  };

  // Handle user selection
  const handleUserSelect = (user: UserSearchResult) => {
    if (!selectedUsers.find((u) => u.id === user.id)) {
      const newSelectedUsers = [...selectedUsers, user];
      setSelectedUsers(newSelectedUsers);
      form.setValue(
        "userIds",
        newSelectedUsers.map((u) => u.id)
      );
    }
    setSearchQuery("");
    setIsComboboxOpen(false);
  };

  // Handle user removal
  const handleRemoveUser = (userId: string) => {
    const newSelectedUsers = selectedUsers.filter((u) => u.id !== userId);
    setSelectedUsers(newSelectedUsers);
    form.setValue(
      "userIds",
      newSelectedUsers.map((u) => u.id)
    );
  };

  // Derived state
  const shouldShowDropdown = isComboboxOpen && searchQuery.length >= 2;
  const availableUsers = users.filter(
    (user: any) => !selectedUsers.find((u) => u.id === user.id)
  );

  return {
    // Form
    form,
    handleSubmit: form.handleSubmit(handleSubmit),

    // Search state
    searchQuery,
    setSearchQuery,
    isComboboxOpen,
    setIsComboboxOpen,
    shouldShowDropdown,

    // Users
    users: availableUsers,
    selectedUsers,
    isSearchLoading,

    // Actions
    handleUserSelect,
    handleRemoveUser,

    // UI state
    isSubmitting: adjustBalanceMutation.isPending,
  };
};
