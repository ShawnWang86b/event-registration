import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { organizerLimitsTable, usersTable, eventsTable } from "@/db/schema";
import { eq, and, count } from "drizzle-orm";

// GET organizer limits for a specific organizer
export async function GET(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const organizerId = searchParams.get("organizerId");

    // If no organizerId provided, use current user
    const targetOrganizerId = organizerId || userId;

    // Check if user is admin or the organizer themselves
    const user = await db.query.usersTable.findFirst({
      where: eq(usersTable.id, userId),
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Only allow if user is admin or requesting their own limits
    if (user.role !== "admin" && userId !== targetOrganizerId) {
      return NextResponse.json(
        { error: "Forbidden - Can only view your own limits" },
        { status: 403 }
      );
    }

    // Get organizer info
    const organizer = await db.query.usersTable.findFirst({
      where: eq(usersTable.id, targetOrganizerId),
    });

    if (!organizer || organizer.role !== "organizer") {
      return NextResponse.json(
        { error: "User is not an organizer" },
        { status: 404 }
      );
    }

    // Get or create organizer limits record
    let limits = await db.query.organizerLimitsTable.findFirst({
      where: eq(organizerLimitsTable.organizerId, targetOrganizerId),
    });

    // If no limits record exists, create one based on tier
    if (!limits) {
      const maxEvents = organizer.organizerTier === "pro" ? 10 : 1;

      const newLimits = await db
        .insert(organizerLimitsTable)
        .values({
          organizerId: targetOrganizerId,
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
          eq(eventsTable.createdById, targetOrganizerId),
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

    return NextResponse.json({
      organizerId: targetOrganizerId,
      organizerName: organizer.name,
      organizerTier: organizer.organizerTier,
      maxEvents: limits.maxEvents,
      activeEvents: activeEventsCount,
      remainingEvents: limits.maxEvents - activeEventsCount,
      canCreateEvent: activeEventsCount < limits.maxEvents,
    });
  } catch (error) {
    console.error("Error fetching organizer limits:", error);
    return NextResponse.json(
      { error: "Error fetching organizer limits" },
      { status: 500 }
    );
  }
}

// PUT update organizer tier (admin only)
export async function PUT(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const user = await db.query.usersTable.findFirst({
      where: eq(usersTable.id, userId),
    });

    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden - Admin access required" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { organizerId, tier } = body;

    if (!organizerId || !tier || !["normal", "pro"].includes(tier)) {
      return NextResponse.json(
        { error: "Organizer ID and valid tier (normal/pro) are required" },
        { status: 400 }
      );
    }

    // Check if organizer exists
    const organizer = await db.query.usersTable.findFirst({
      where: eq(usersTable.id, organizerId),
    });

    if (!organizer || organizer.role !== "organizer") {
      return NextResponse.json(
        { error: "User is not an organizer" },
        { status: 404 }
      );
    }

    // Update organizer tier
    await db
      .update(usersTable)
      .set({
        organizerTier: tier,
        updatedAt: new Date(),
      })
      .where(eq(usersTable.id, organizerId));

    // Update or create organizer limits
    const maxEvents = tier === "pro" ? 10 : 1;

    const existingLimits = await db.query.organizerLimitsTable.findFirst({
      where: eq(organizerLimitsTable.organizerId, organizerId),
    });

    if (existingLimits) {
      await db
        .update(organizerLimitsTable)
        .set({
          maxEvents,
          lastUpdated: new Date(),
        })
        .where(eq(organizerLimitsTable.id, existingLimits.id));
    } else {
      await db.insert(organizerLimitsTable).values({
        organizerId,
        maxEvents,
        activeEvents: 0,
      });
    }

    return NextResponse.json({
      message: "Organizer tier updated successfully",
      organizerId,
      newTier: tier,
      maxEvents,
    });
  } catch (error) {
    console.error("Error updating organizer tier:", error);
    return NextResponse.json(
      { error: "Error updating organizer tier" },
      { status: 500 }
    );
  }
}
