import axios, { AxiosError, AxiosResponse } from "axios";

// Create axios instance with base configuration
export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token if available
apiClient.interceptors.request.use(
  (config) => {
    // Add any auth headers here if needed
    // For Clerk, the auth is handled server-side, but you can add client-side tokens if needed
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    // Handle common errors
    if (error.response?.status === 401) {
      // Handle unauthorized - redirect to login or refresh token
      console.error("Unauthorized access");
    } else if (error.response?.status === 403) {
      // Handle forbidden
      console.error("Forbidden access");
    } else if (error.response?.status && error.response?.status >= 500) {
      // Handle server errors
      console.error("Server error:", error.response?.data);
    }

    return Promise.reject(error);
  }
);

// API Error class for better error handling
export class ApiError extends Error {
  constructor(message: string, public status?: number, public data?: any) {
    super(message);
    this.name = "ApiError";
  }
}

// Helper function to handle API errors
export const handleApiError = (error: AxiosError): ApiError => {
  const message =
    (error.response?.data as { error?: string })?.error ||
    error.message ||
    "An error occurred";
  const status = error.response?.status;
  const data = error.response?.data;

  return new ApiError(message, status, data);
};
