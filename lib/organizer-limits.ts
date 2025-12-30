import { db } from "@/db";
import { organizerLimitsTable, usersTable, eventsTable } from "@/db/schema";
import { eq, and, count } from "drizzle-orm";

export interface OrganizerLimitCheck {
  canCreateEvent: boolean;
  maxEvents: number;
  activeEvents: number;
  remainingEvents: number;
  organizerTier: "normal" | "pro";
}

/**
 * Check if an organizer can create a new event based on their tier limits
 */
export async function checkOrganizerLimits(
  organizerId: string
): Promise<OrganizerLimitCheck> {
  // Get organizer info
  const organizer = await db.query.usersTable.findFirst({
    where: eq(usersTable.id, organizerId),
  });

  if (!organizer || organizer.role !== "organizer") {
    throw new Error("User is not an organizer");
  }

  // Get or create organizer limits record
  let limits = await db.query.organizerLimitsTable.findFirst({
    where: eq(organizerLimitsTable.organizerId, organizerId),
  });

  // If no limits record exists, create one based on tier
  if (!limits) {
    const maxEvents = organizer.organizerTier === "pro" ? 10 : 1;

    const newLimits = await db
      .insert(organizerLimitsTable)
      .values({
        organizerId,
        maxEvents,
        activeEvents: 0,
      })
      .returning();

    limits = newLimits[0];
  }

  // Count current active events
  const activeEventsResult = await db
    .select({ count: count() })
    .from(eventsTable)
    .where(
      and(
        eq(eventsTable.createdById, organizerId),
        eq(eventsTable.isActive, true)
      )
    );

  const activeEventsCount = activeEventsResult[0]?.count || 0;

  // Update the active events count if it's different
  if (limits.activeEvents !== activeEventsCount) {
    await db
      .update(organizerLimitsTable)
      .set({
        activeEvents: activeEventsCount,
        lastUpdated: new Date(),
      })
      .where(eq(organizerLimitsTable.id, limits.id));
  }

  return {
    canCreateEvent: activeEventsCount < limits.maxEvents,
    maxEvents: limits.maxEvents,
    activeEvents: activeEventsCount,
    remainingEvents: limits.maxEvents - activeEventsCount,
    organizerTier: organizer.organizerTier as "normal" | "pro",
  };
}

/**
 * Update organizer limits when an event is created or deleted
 */
export async function updateOrganizerLimits(
  organizerId: string
): Promise<void> {
  // Count current active events
  const activeEventsResult = await db
    .select({ count: count() })
    .from(eventsTable)
    .where(
      and(
        eq(eventsTable.createdById, organizerId),
        eq(eventsTable.isActive, true)
      )
    );

  const activeEventsCount = activeEventsResult[0]?.count || 0;

  // Update the organizer limits record
  await db
    .update(organizerLimitsTable)
    .set({
      activeEvents: activeEventsCount,
      lastUpdated: new Date(),
    })
    .where(eq(organizerLimitsTable.organizerId, organizerId));
}
