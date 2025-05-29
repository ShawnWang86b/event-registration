import { AxiosError } from "axios";
import { apiClient, handleApiError } from "./api-client";
import {
  Event,
  CreateEventData,
  UpdateEventData,
  Registration,
  CreateRegistrationData,
  Transaction,
  EventsQueryParams,
  RegistrationsQueryParams,
} from "./types";

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
  getEventRegistrations: async (eventId: number): Promise<Registration[]> => {
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
  // Get all transactions
  getTransactions: async (): Promise<Transaction[]> => {
    try {
      const response = await apiClient.get("/transactions");
      return response.data;
    } catch (error) {
      throw handleApiError(error as AxiosError);
    }
  },

  // Get transaction by ID
  getTransaction: async (id: number): Promise<Transaction> => {
    try {
      const response = await apiClient.get(`/transactions/${id}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error as AxiosError);
    }
  },

  // Get transactions for a registration
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

// Combined API object
export const api = {
  events: eventsApi,
  registrations: registrationsApi,
  transactions: transactionsApi,
};
