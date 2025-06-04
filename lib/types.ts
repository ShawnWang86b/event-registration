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
  isActive?: boolean;
}

// Event form types for components
export interface EventFormData {
  title: string;
  description: string;
  price: number;
  startDate: string;
  endDate: string;
  location?: string;
  isPeriodic: boolean;
  frequency?: string;
  maxAttendees: number;
  isActive: boolean;
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

// Event Registrations Response (for /api/registrations/[eventId])
export interface EventRegistrationsUser {
  id: string;
  name: string;
  email: string;
}

export interface EventRegistration {
  id: number;
  userId: string;
  eventId: number;
  registrationDate: string;
  status: "registered" | "waitlist" | "canceled";
  position: number;
  hasAttended: boolean;
  paymentProcessed: boolean;
  createdAt: string;
  updatedAt: string;
  user: EventRegistrationsUser;
  event: {
    id: number;
    title: string;
    description: string;
    price: string;
    startDate: string;
    endDate: string;
    location: string;
    maxAttendees: number;
  };
}

export interface EventRegistrationsResponse {
  event: {
    id: number;
    title: string;
    currentRegistrations: number;
    maxAttendees: number;
    registrationStatus: string;
  };
  summary: {
    totalRegistrations: number;
    registeredCount: number;
    waitlistCount: number;
    canceledCount: number;
    attendedCount: number;
    paymentProcessedCount: number;
    availableSpots: number;
  };
  registrations: EventRegistration[];
}

// Admin Balance Management Types
export interface BalanceAdjustmentData {
  action: "add" | "subtract";
  amount: number;
}

export interface BalanceAdjustmentResponse {
  success: boolean;
  user: {
    id: string;
    name: string;
    email: string;
    previousBalance: number;
    newBalance: number;
    adjustment: number;
  };
  transaction: {
    id: number;
    amount: number;
    type: "admin_adjust";
    description: string;
    createdAt: Date;
  };
  action: "add" | "subtract";
  amount: number;
  adjustedBy: string;
  timestamp: string;
}

export interface UserBalanceInfo {
  id: string;
  name: string;
  email: string;
  creditBalance: number;
  role: "user" | "admin";
  createdAt: Date;
  updatedAt: Date;
}

// User search types
export interface UserSearchResult {
  id: string;
  name: string;
  email: string;
  creditBalance: number;
  role: "user" | "admin";
}

export interface UsersSearchResponse {
  users: UserSearchResult[];
}

// Current user types
export interface CurrentUser {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  creditBalance: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CurrentUserResponse {
  user: CurrentUser;
}

// End Event Types
export interface EndEventResponse {
  success: boolean;
  event: {
    id: number;
    title: string;
    price: number;
  };
  deductionResults: {
    userId: string;
    userName: string;
    previousBalance: number;
    newBalance: number;
    deducted: number;
    transactionId: number;
  }[];
  errors: {
    userId: string;
    userName: string;
    currentBalance: number;
    eventPrice: number;
    deficit: number;
  }[];
  summary: {
    totalAttendees: number;
    successfulDeductions: number;
    failedDeductions: number;
    totalDeducted: number;
    transactionsCreated: number;
  };
  endedBy: string;
  timestamp: string;
}

// Individual Pricing End Event Types
export interface UserPrice {
  userId: string;
  registrationId: number;
  customPrice?: number;
  useDefault: boolean;
}

export interface EndEventWithPricesData {
  userPrices: UserPrice[];
}

export interface EndEventWithPricesResponse {
  success: boolean;
  event: {
    id: number;
    title: string;
    defaultPrice: number;
  };
  deductionResults: {
    userId: string;
    userName: string;
    previousBalance: number;
    newBalance: number;
    deducted: number;
    transactionId: number;
    priceUsed: number;
    wentNegative: boolean;
  }[];
  negativeBalanceWarnings: {
    userId: string;
    userName: string;
    previousBalance: number;
    newBalance: number;
    priceCharged: number;
    deficit: number;
  }[];
  summary: {
    totalAttendees: number;
    successfulDeductions: number;
    failedDeductions: number;
    totalDeducted: number;
    defaultPriceUsed: number;
    customPriceUsed: number;
    transactionsCreated: number;
    usersWithNegativeBalance: number;
  };
  endedBy: string;
  timestamp: string;
}
