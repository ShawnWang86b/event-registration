// Registration types
export type Registration = {
  id: number;
  eventId: number;
  userId: string;
  status: "pending" | "confirmed" | "cancelled";
  registeredAt: Date;
  updatedAt: Date;
};

export type CreateRegistrationData = {
  eventId: number;
};

export type RegistrationsQueryParams = {
  page?: number;
  limit?: number;
  eventId?: number;
  userId?: string;
  status?: Registration["status"];
};

// Event Registrations Response (for /api/registrations/[eventId])
export type EventRegistrationsUser = {
  id: string;
  name: string;
  email: string;
};

export type EventRegistration = {
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
};

export type EventRegistrationsResponse = {
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
};
