import { useQuery } from "@tanstack/react-query";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  creditBalance: number;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminUsersResponse {
  users: AdminUser[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const useAdminUsers = (page: number = 1, limit: number = 50) => {
  return useQuery<AdminUsersResponse>({
    queryKey: ["admin-users", page, limit],
    queryFn: async () => {
      const response = await fetch(
        `/api/admin/users/all?page=${page}&limit=${limit}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }

      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
};
