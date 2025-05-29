// Event types
export interface Event {
  id: number;
  title: string;
  description: string;
  price: string;
  startDate: Date;
  endDate: Date;
  location?: string;
  isPeriodic: boolean;
  frequency?: string;
  maxAttendees: number;
  createdById: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateEventData {
  title: string;
  description: string;
  price: number;
  startDate: string;
  endDate: string;
  location?: string;
  isPeriodic?: boolean;
  frequency?: string;
  maxAttendees: number;
}

export interface UpdateEventData extends Partial<CreateEventData> {
  id: number;
}

// Registration types
export interface Registration {
  id: number;
  eventId: number;
  userId: string;
  status: "pending" | "confirmed" | "cancelled";
  registeredAt: Date;
  updatedAt: Date;
}

export interface CreateRegistrationData {
  eventId: number;
}

// Transaction types
export interface Transaction {
  id: number;
  registrationId: number;
  amount: string;
  status: "pending" | "completed" | "failed" | "refunded";
  paymentMethod?: string;
  transactionId?: string;
  createdAt: Date;
  updatedAt: Date;
}

// User types
export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: "user" | "admin";
  createdAt: Date;
  updatedAt: Date;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Query parameters
export interface EventsQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  startDate?: string;
  endDate?: string;
  location?: string;
}

export interface RegistrationsQueryParams {
  page?: number;
  limit?: number;
  eventId?: number;
  userId?: string;
  status?: Registration["status"];
}
