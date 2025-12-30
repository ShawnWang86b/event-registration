// API Response types
export type ApiResponse<T> = {
  data: T;
  message?: string;
};

export type PaginatedResponse<T> = {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

// Organizer Request types
export type OrganizerRequestStatus = "pending" | "approved" | "rejected";
export type EventType =
  | "basketball"
  | "badminton"
  | "volleyball"
  | "tennis"
  | "table tennis"
  | "other";

export type OrganizerRequest = {
  id: string;
  userId: string;
  eventType: EventType;
  description: string;
  contactInfo: string | null;
  status: OrganizerRequestStatus;
  reviewedBy: string | null;
  reviewedAt: Date | null;
  reviewNotes: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateOrganizerRequestData = {
  eventType: EventType;
  description: string;
  contactInfo?: string;
};

export type OrganizerRequestResponse = OrganizerRequest;
