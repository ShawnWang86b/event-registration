import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-services";
import { CreateOrganizerRequestData, OrganizerRequestResponse, AdminOrganizerRequestsResponse } from "@/types";

// Query keys for organizer requests
export const organizerRequestKeys = {
  all: ["organizer-requests"] as const,
  lists: () => [...organizerRequestKeys.all, "list"] as const,
  detail: (id: string) => [...organizerRequestKeys.all, "detail", id] as const,
  myRequests: () => [...organizerRequestKeys.all, "my-requests"] as const,
};

// Hook to get current user's organizer requests
export const useMyOrganizerRequests = () => {
  return useQuery<OrganizerRequestResponse[]>({
    queryKey: organizerRequestKeys.myRequests(),
    queryFn: () => api.organizerRequests.getMyOrganizerRequests(),
    staleTime: 30 * 1000, // 30 seconds
  });
};

// Hook to create an organizer request
export const useCreateOrganizerRequest = () => {
  const queryClient = useQueryClient();

  return useMutation<
    OrganizerRequestResponse,
    Error,
    CreateOrganizerRequestData
  >({
    mutationFn: (data: CreateOrganizerRequestData) =>
      api.organizerRequests.createOrganizerRequest(data),
    onSuccess: () => {
      // Invalidate and refetch my requests
      queryClient.invalidateQueries({
        queryKey: organizerRequestKeys.myRequests(),
      });
    },
    onError: (error) => {
      console.error("Failed to create organizer request:", error);
    },
  });
};

// admin can see all organizer requests
export const useAdminOrganizerRequests = () => {
  return useQuery<AdminOrganizerRequestsResponse>({
    queryKey: [...organizerRequestKeys.all, "admin-organizer-requests"] as const,
    queryFn: async () => {
      const response = await api.admin.getAllOrganizerRequests();
      
      return {
        organizerRequests: response.organizerRequests,
        pagination: response.pagination,
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
};