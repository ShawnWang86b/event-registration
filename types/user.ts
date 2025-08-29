// User types
export type User = {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: "user" | "admin";
  createdAt: Date;
  updatedAt: Date;
};

export type CurrentUser = {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  creditBalance: number;
  createdAt: Date;
  updatedAt: Date;
};

export type CurrentUserResponse = {
  user: CurrentUser;
};

export type UserBalanceInfo = {
  id: string;
  name: string;
  email: string;
  creditBalance: number;
  role: "user" | "admin";
  createdAt: Date;
  updatedAt: Date;
};

// User search types
export type UserSearchResult = {
  id: string;
  name: string;
  email: string;
  creditBalance: number;
  role: "user" | "admin";
};

export type UsersSearchResponse = {
  users: UserSearchResult[];
};
