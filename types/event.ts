// Event types
export type Event = {
  id: number;
  title: string;
  description: string;
  price: string;
  startDate: string | Date; // API returns string, but may be Date object in some contexts
  endDate: string | Date; // API returns string, but may be Date object in some contexts
  location?: string;
  isPeriodic: boolean;
  frequency?: string;
  maxAttendees: number;
  createdById: string;
  isActive: boolean;
  createdAt: string | Date; // API returns string, but may be Date object in some contexts
  updatedAt: string | Date; // API returns string, but may be Date object in some contexts
};

export type CreateEventData = {
  title: string;
  description: string;
  price: number;
  startDate: string;
  endDate: string;
  location?: string;
  isPeriodic?: boolean;
  frequency?: string;
  maxAttendees: number;
};

export type UpdateEventData = Partial<CreateEventData> & {
  id: number;
  isActive?: boolean;
};

// Event form types for components
export type EventFormData = {
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
};

// Query parameters
export type EventsQueryParams = {
  page?: number;
  limit?: number;
  search?: string;
  startDate?: string;
  endDate?: string;
  location?: string;
};

// End Event Types
export type EndEventResponse = {
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
};

// Individual Pricing End Event Types
export type UserPrice = {
  userId: string;
  registrationId: number;
  customPrice?: number;
  useDefault: boolean;
};

export type EndEventWithPricesData = {
  userPrices: UserPrice[];
};

export type EndEventWithPricesResponse = {
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
};
