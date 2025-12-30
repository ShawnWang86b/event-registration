import { AxiosError } from "axios";
import { apiClient, handleApiError } from "./api-client";
import {
  Event,
  CreateEventData,
  CopyEventData,
  UpdateEventData,
  Registration,
  CreateRegistrationData,
  Transaction,
  EventsQueryParams,
  RegistrationsQueryParams,
  EventRegistrationsResponse,
  BalanceAdjustmentData,
  BalanceAdjustmentResponse,
  UserBalanceInfo,
  UsersSearchResponse,
  CurrentUserResponse,
  EndEventResponse,
  EndEventWithPricesData,
  EndEventWithPricesResponse,
  MonthlyReportResponse,
  CreateMonthlyBalanceData,
  CreateMonthlyBalanceResponse,
  CreditTransactionsResponse,
  CreateTransactionData,
  CreditTransaction,
  CreateGuestRegistrationData,
  GuestRegistrationResponse,
  GuestRegistrationsListResponse,
  CreateOrganizerRequestData,
  OrganizerRequestResponse,
  AdminOrganizerRequestsResponse,
} from "@/types";

// Events API
export const eventsApi = {
  // Get all events
  getEvents: async (params?: EventsQueryParams): Promise<Event[]> => {
    try {
      const response = await apiClient.get("/events", { params });
      return response.data;
    } catch (error) {
      throw handleApiError(error as AxiosError);
    }
  },

  // Get single event by ID
  getEvent: async (id: number): Promise<Event> => {
    try {
      const response = await apiClient.get(`/events?id=${id}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error as AxiosError);
    }
  },

  // Create new event (admin only)
  createEvent: async (data: CreateEventData): Promise<Event> => {
    try {
      const response = await apiClient.post("/events", data);
      return response.data;
    } catch (error) {
      throw handleApiError(error as AxiosError);
    }
  },

  // Copy event (admin only)
  copyEvent: async (data: CopyEventData): Promise<Event> => {
    try {
      const response = await apiClient.post(`/events/${data.eventId}/copy`);
      return response.data.copiedEvent;
    } catch (error) {
      throw handleApiError(error as AxiosError);
    }
  },

  // Update event (admin only)
  updateEvent: async (data: UpdateEventData): Promise<Event> => {
    try {
      const response = await apiClient.put("/events", data);
      return response.data;
    } catch (error) {
      throw handleApiError(error as AxiosError);
    }
  },

  // Delete event (admin only)
  deleteEvent: async (id: number): Promise<void> => {
    try {
      await apiClient.delete(`/events?id=${id}`);
    } catch (error) {
      throw handleApiError(error as AxiosError);
    }
  },

  // End event (admin only)
  endEvent: async (eventId: number): Promise<EndEventResponse> => {
    try {
      const response = await apiClient.post(`/events/${eventId}/end`);
      return response.data;
    } catch (error) {
      throw handleApiError(error as AxiosError);
    }
  },

  // Reset event (admin only)
  resetEvent: async (
    eventId: number
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await apiClient.post(`/events/${eventId}/reset`);
      return response.data;
    } catch (error) {
      throw handleApiError(error as AxiosError);
    }
  },

  // End event with individual prices (admin only)
  endEventWithPrices: async (
    eventId: number,
    data: EndEventWithPricesData
  ): Promise<EndEventWithPricesResponse> => {
    try {
      const response = await apiClient.post(`/events/${eventId}/end`, data);
      return response.data;
    } catch (error) {
      throw handleApiError(error as AxiosError);
    }
  },

  // Toggle event active status (admin only)
  toggleEventStatus: async (
    eventId: number,
    isActive: boolean
  ): Promise<Event> => {
    try {
      const response = await apiClient.patch(`/events/${eventId}/active`, {
        isActive,
      });
      return response.data.event;
    } catch (error) {
      throw handleApiError(error as AxiosError);
    }
  },

  // Toggle event public visibility (admin only)
  toggleEventPublicVisibility: async (
    eventId: number,
    isPublicVisible: boolean
  ): Promise<Event> => {
    try {
      const response = await apiClient.patch(
        `/events/${eventId}/public-visible`,
        {
          isPublicVisible,
        }
      );
      return response.data.event;
    } catch (error) {
      throw handleApiError(error as AxiosError);
    }
  },
};

// Registrations API
export const registrationsApi = {
  // Get all registrations
  getRegistrations: async (
    params?: RegistrationsQueryParams
  ): Promise<Registration[]> => {
    try {
      const response = await apiClient.get("/registrations", { params });
      return response.data;
    } catch (error) {
      throw handleApiError(error as AxiosError);
    }
  },

  // Get registrations for specific event
  getEventRegistrations: async (
    eventId: number
  ): Promise<EventRegistrationsResponse> => {
    try {
      const response = await apiClient.get(`/registrations/${eventId}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error as AxiosError);
    }
  },

  // Create new registration
  createRegistration: async (
    data: CreateRegistrationData
  ): Promise<Registration> => {
    try {
      const response = await apiClient.post("/registrations", data);
      return response.data;
    } catch (error) {
      throw handleApiError(error as AxiosError);
    }
  },

  // Cancel registration
  cancelRegistration: async (id: number): Promise<Registration> => {
    try {
      const response = await apiClient.put(`/registrations/${id}/cancel`);
      return response.data;
    } catch (error) {
      throw handleApiError(error as AxiosError);
    }
  },

  // Delete registration
  deleteRegistration: async (id: number): Promise<void> => {
    try {
      await apiClient.delete(`/registrations/${id}`);
    } catch (error) {
      throw handleApiError(error as AxiosError);
    }
  },
};

// Transactions API
export const transactionsApi = {
  // Get credit transactions for current user (or admin filtered)
  getCreditTransactions: async (params?: {
    limit?: number;
    offset?: number;
    eventId?: number;
  }): Promise<CreditTransactionsResponse> => {
    try {
      const response = await apiClient.get("/transactions", { params });
      return response.data;
    } catch (error) {
      throw handleApiError(error as AxiosError);
    }
  },

  // Create new transaction (deposit or spend)
  createTransaction: async (
    data: CreateTransactionData
  ): Promise<CreditTransaction> => {
    try {
      const response = await apiClient.post("/transactions", data);
      return response.data;
    } catch (error) {
      throw handleApiError(error as AxiosError);
    }
  },

  // Get all transactions (legacy - keeping for compatibility)
  getTransactions: async (): Promise<Transaction[]> => {
    try {
      const response = await apiClient.get("/transactions");
      return response.data;
    } catch (error) {
      throw handleApiError(error as AxiosError);
    }
  },

  // Get transaction by ID (legacy - keeping for compatibility)
  getTransaction: async (id: number): Promise<Transaction> => {
    try {
      const response = await apiClient.get(`/transactions/${id}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error as AxiosError);
    }
  },

  // Get transactions for a registration (legacy - keeping for compatibility)
  getRegistrationTransactions: async (
    registrationId: number
  ): Promise<Transaction[]> => {
    try {
      const response = await apiClient.get(
        `/transactions?registrationId=${registrationId}`
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error as AxiosError);
    }
  },
};

// Admin API
export const adminApi = {
  // Search users by name or email
  searchUsers: async (query?: string): Promise<UsersSearchResponse> => {
    try {
      const params = query ? { q: query } : {};
      const response = await apiClient.get("/admin/users", { params });
      return response.data;
    } catch (error) {
      throw handleApiError(error as AxiosError);
    }
  },

  // Get user balance information
  getUserBalance: async (userId: string): Promise<UserBalanceInfo> => {
    try {
      const response = await apiClient.get(`/admin/users/${userId}/balance`);
      return response.data.user;
    } catch (error) {
      throw handleApiError(error as AxiosError);
    }
  },

  // Adjust user balance (add or subtract credits)
  adjustUserBalance: async (
    userId: string,
    data: BalanceAdjustmentData
  ): Promise<BalanceAdjustmentResponse> => {
    try {
      const response = await apiClient.put(
        `/admin/users/${userId}/balance`,
        data
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error as AxiosError);
    }
  },

  // Generate monthly report for a user
  generateMonthlyReport: async (
    userId: string,
    year?: number,
    month?: number
  ): Promise<MonthlyReportResponse> => {
    try {
      const params: Record<string, string> = {};
      if (year) params.year = year.toString();
      if (month) params.month = month.toString();

      const response = await apiClient.get(
        `/admin/users/${userId}/monthly-report`,
        { params }
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error as AxiosError);
    }
  },

  // Create/update monthly balance record
  createMonthlyBalance: async (
    userId: string,
    data: CreateMonthlyBalanceData
  ): Promise<CreateMonthlyBalanceResponse> => {
    try {
      const response = await apiClient.post(
        `/admin/users/${userId}/monthly-report`,
        data
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error as AxiosError);
    }
  },

  // Register a guest for an event (admin only)
  registerGuest: async (
    data: CreateGuestRegistrationData
  ): Promise<GuestRegistrationResponse> => {
    try {
      const response = await apiClient.post("/admin/registrations/guest", data);
      return response.data;
    } catch (error) {
      throw handleApiError(error as AxiosError);
    }
  },

  // Get all guest registrations (admin only)
  getGuestRegistrations: async (
    eventId?: number
  ): Promise<GuestRegistrationsListResponse> => {
    try {
      const params = eventId ? { eventId: eventId.toString() } : {};
      const response = await apiClient.get("/admin/registrations/guest", {
        params,
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error as AxiosError);
    }
  },

  // Delete a guest registration (admin only)
  deleteGuestRegistration: async (
    registrationId: number
  ): Promise<{ message: string; deletedRegistration: any }> => {
    try {
      const response = await apiClient.delete(
        `/admin/registrations/guest?registrationId=${registrationId}`
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error as AxiosError);
    }
  },

  //Admin can get all organizer requests
  getAllOrganizerRequests:
    async (): Promise<AdminOrganizerRequestsResponse> => {
      try {
        const response = await apiClient.get("/admin/organizer-requests");
        return response.data;
      } catch (error) {
        throw handleApiError(error as AxiosError);
      }
    },
};

// Auth API
export const authApi = {
  // Get current user information from database
  getCurrentUser: async (): Promise<CurrentUserResponse> => {
    try {
      const response = await apiClient.get("/auth/me");
      return response.data;
    } catch (error) {
      throw handleApiError(error as AxiosError);
    }
  },

  // Generate monthly report for current user
  generateUserMonthlyReport: async (
    year?: number,
    month?: number
  ): Promise<MonthlyReportResponse> => {
    try {
      const params: Record<string, string> = {};
      if (year) params.year = year.toString();
      if (month) params.month = month.toString();

      const response = await apiClient.get("/user/monthly-report", { params });
      return response.data;
    } catch (error) {
      throw handleApiError(error as AxiosError);
    }
  },
};

// Organizer Requests API
export const organizerRequestsApi = {
  // Create new organizer request
  createOrganizerRequest: async (
    data: CreateOrganizerRequestData
  ): Promise<OrganizerRequestResponse> => {
    try {
      const response = await apiClient.post("/organizer-requests", data);
      return response.data;
    } catch (error) {
      throw handleApiError(error as AxiosError);
    }
  },

  // Get user's own organizer requests
  getMyOrganizerRequests: async (): Promise<OrganizerRequestResponse[]> => {
    try {
      const response = await apiClient.get("/organizer-requests/my-request");
      return response.data;
    } catch (error) {
      throw handleApiError(error as AxiosError);
    }
  },
};

// Combined API object
export const api = {
  auth: authApi,
  events: eventsApi,
  registrations: registrationsApi,
  transactions: transactionsApi,
  admin: adminApi,
  organizerRequests: organizerRequestsApi,
};
