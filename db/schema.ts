import {
  integer,
  pgTable,
  varchar,
  timestamp,
  text,
  decimal,
  boolean,
  pgEnum,
  serial,
  primaryKey,
  real,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Enums
export const roleEnum = pgEnum("role", ["admin", "user", "guest"]);
export const registrationStatusEnum = pgEnum("registration_status", [
  "registered",
  "waitlist",
  "canceled",
]);

export const transactionTypeEnum = pgEnum("transaction_type", [
  "deposit", // User adds credits
  "spend", // User spends on event registration
  "refund", // Credits returned from canceled event
  "admin_adjust", // Admin adjustment
  "monthly_snapshot", // Monthly balance record
]);

// Users Table
export const usersTable = pgTable("users", {
  id: varchar("id").primaryKey(), // Use Clerk's ID
  name: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  role: roleEnum("role").notNull().default("user"),
  creditBalance: decimal("credit_balance", {
    precision: 10,
    scale: 2,
  }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Users Relations
export const usersRelations = relations(usersTable, ({ many }) => ({
  registrations: many(registrationsTable),
  createdEvents: many(eventsTable, { relationName: "createdEvents" }),
}));

// Events Table
export const eventsTable = pgTable("events", {
  id: serial("id").primaryKey(),
  title: varchar({ length: 255 }).notNull(),
  description: text().notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  location: varchar({ length: 255 }),
  isPeriodic: boolean("is_periodic").notNull().default(false),
  frequency: varchar({ length: 50 }), // daily, weekly, monthly
  maxAttendees: integer("max_attendees").notNull(),
  createdById: varchar("created_by_id")
    .notNull()
    .references(() => usersTable.id),
  isPublicVisible: boolean("is_public_visible").notNull().default(true),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Events Relations
export const eventsRelations = relations(eventsTable, ({ many, one }) => ({
  registrations: many(registrationsTable),
  createdBy: one(usersTable, {
    fields: [eventsTable.createdById],
    references: [usersTable.id],
    relationName: "createdEvents",
  }),
  occurrences: many(eventOccurrencesTable),
}));

// Registrations Table
export const registrationsTable = pgTable("registrations", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id")
    .notNull()
    .references(() => usersTable.id),
  eventId: integer("event_id")
    .notNull()
    .references(() => eventsTable.id),
  registrationDate: timestamp("registration_date").defaultNow().notNull(),
  status: registrationStatusEnum("status").notNull().default("registered"),
  position: integer("position").notNull(), // Position in line (for determining waitlist)
  hasAttended: boolean("has_attended").notNull().default(false),
  paymentProcessed: boolean("payment_processed").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Registrations Relations
export const registrationsRelations = relations(
  registrationsTable,
  ({ one }) => ({
    user: one(usersTable, {
      fields: [registrationsTable.userId],
      references: [usersTable.id],
    }),
    event: one(eventsTable, {
      fields: [registrationsTable.eventId],
      references: [eventsTable.id],
    }),
  })
);

// For recurring events, we need to track individual event occurrences
export const eventOccurrencesTable = pgTable("event_occurrences", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id")
    .notNull()
    .references(() => eventsTable.id),
  occurrenceDate: timestamp("occurrence_date").notNull(),
  isCanceled: boolean("is_canceled").notNull().default(false),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Event Occurrences Relations
export const eventOccurrencesRelations = relations(
  eventOccurrencesTable,
  ({ one }) => ({
    event: one(eventsTable, {
      fields: [eventOccurrencesTable.eventId],
      references: [eventsTable.id],
    }),
  })
);

export const creditTransactionsTable = pgTable("credit_transactions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id")
    .notNull()
    .references(() => usersTable.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(), // Positive for deposits, negative for spending
  balanceAfter: decimal("balance_after", { precision: 10, scale: 2 }).notNull(), // Balance after this transaction
  type: transactionTypeEnum("type").notNull(),
  description: text("description").notNull(),
  eventId: integer("event_id").references(() => eventsTable.id),
  registrationId: integer("registration_id").references(
    () => registrationsTable.id
  ),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const monthlyBalancesTable = pgTable(
  "monthly_balances",
  {
    id: serial("id"),
    userId: varchar("user_id")
      .notNull()
      .references(() => usersTable.id),
    month: integer("month").notNull(), // 1-12
    year: integer("year").notNull(),
    openingBalance: decimal("opening_balance", {
      precision: 10,
      scale: 2,
    }).notNull(),
    totalDeposits: decimal("total_deposits", { precision: 10, scale: 2 })
      .notNull()
      .default("0"),
    totalSpending: decimal("total_spending", { precision: 10, scale: 2 })
      .notNull()
      .default("0"),
    totalRefunds: decimal("total_refunds", { precision: 10, scale: 2 })
      .notNull()
      .default("0"),
    closingBalance: decimal("closing_balance", {
      precision: 10,
      scale: 2,
    }).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    // Ensure one record per user per month
    uniqueUserMonth: primaryKey({
      columns: [table.userId, table.year, table.month],
    }),
  })
);

export const creditTransactionsRelations = relations(
  creditTransactionsTable,
  ({ one }) => ({
    user: one(usersTable, {
      fields: [creditTransactionsTable.userId],
      references: [usersTable.id],
    }),
    event: one(eventsTable, {
      fields: [creditTransactionsTable.eventId],
      references: [eventsTable.id],
    }),
    registration: one(registrationsTable, {
      fields: [creditTransactionsTable.registrationId],
      references: [registrationsTable.id],
    }),
  })
);

export const monthlyBalancesRelations = relations(
  monthlyBalancesTable,
  ({ one }) => ({
    user: one(usersTable, {
      fields: [monthlyBalancesTable.userId],
      references: [usersTable.id],
    }),
  })
);
