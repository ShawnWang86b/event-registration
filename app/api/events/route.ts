import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { eventsTable, usersTable, registrationsTable } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";

// GET all events
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    // If no ID provided, return all events
    if (!id) {
      // Get current user to determine filtering
      const { userId } = await auth();
      let isAdmin = false;

      if (userId) {
        // Check if user is admin
        const user = await db.query.usersTable.findFirst({
          where: eq(usersTable.id, userId),
        });
        isAdmin = user?.role === "admin";
      }

      // Filter events based on user role
      let events;
      if (isAdmin) {
        // Admins can see all active events
        // Sort by isPublicVisible (true first), then by updatedAt (newest first)
        events = await db
          .select()
          .from(eventsTable)
          .where(eq(eventsTable.isActive, true))
          .orderBy(
            desc(eventsTable.isPublicVisible),
            desc(eventsTable.updatedAt)
          );
      } else {
        // Public users can only see active events that are publicly visible
        // Sort by updatedAt (newest first)
        events = await db
          .select()
          .from(eventsTable)
          .where(
            and(
              eq(eventsTable.isActive, true),
              eq(eventsTable.isPublicVisible, true)
            )
          )
          .orderBy(desc(eventsTable.updatedAt));
      }

      return NextResponse.json(events);
    }

    // Get specific event
    const eventId = parseInt(id, 10);
    if (isNaN(eventId)) {
      return NextResponse.json({ error: "Invalid event ID" }, { status: 400 });
    }

    // Get current user to determine access
    const { userId } = await auth();
    let isAdmin = false;

    if (userId) {
      // Check if user is admin
      const user = await db.query.usersTable.findFirst({
        where: eq(usersTable.id, userId),
      });
      isAdmin = user?.role === "admin";
    }

    const event = await db.query.eventsTable.findFirst({
      where: eq(eventsTable.id, eventId),
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Check if user has permission to view this event
    if (!isAdmin && !event.isPublicVisible) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    return NextResponse.json(event);
  } catch (error) {
    console.error("Error fetching event:", error);
    return NextResponse.json(
      { error: "Error fetching event" },
      { status: 500 }
    );
  }
}

// POST new event (admin only)
export async function POST(req: Request) {
  try {
    const { userId, sessionId } = await auth();
    console.log("Auth details:", {
      userId,
      sessionId,
      headers: Object.fromEntries(req.headers.entries()),
    });

    if (!userId) {
      console.error("No user ID found in request");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const user = await db.query.usersTable.findFirst({
      where: eq(usersTable.id, userId),
    });

    console.log("Found user in database:", user);

    if (!user) {
      console.error(`User not found in database: ${userId}`);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.role !== "admin") {
      console.error(`User ${userId} is not an admin`);
      return NextResponse.json(
        { error: "Forbidden - Admin access required" },
        { status: 403 }
      );
    }

    const body = await req.json();
    console.log("Received request body:", body);

    const {
      title,
      description,
      price,
      startDate,
      endDate,
      location,
      isPeriodic,
      frequency,
      maxAttendees,
    } = body;

    // Validate required fields
    if (
      !title ||
      !description ||
      price === undefined ||
      !startDate ||
      !endDate ||
      !maxAttendees
    ) {
      console.error("Missing required fields:", {
        title: !title,
        description: !description,
        price: price === undefined,
        startDate: !startDate,
        endDate: !endDate,
        maxAttendees: !maxAttendees,
      });
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate price is a number
    if (isNaN(Number(price))) {
      console.error("Invalid price:", price);
      return NextResponse.json(
        { error: "Price must be a number" },
        { status: 400 }
      );
    }

    // Validate dates
    const startDateTime = new Date(startDate);
    const endDateTime = new Date(endDate);

    if (isNaN(startDateTime.getTime())) {
      console.error("Invalid start date:", startDate);
      return NextResponse.json(
        { error: "Invalid start date format" },
        { status: 400 }
      );
    }

    if (isNaN(endDateTime.getTime())) {
      console.error("Invalid end date:", endDate);
      return NextResponse.json(
        { error: "Invalid end date format" },
        { status: 400 }
      );
    }

    if (endDateTime <= startDateTime) {
      console.error("End date must be after start date");
      return NextResponse.json(
        { error: "End date must be after start date" },
        { status: 400 }
      );
    }

    const newEvent = await db
      .insert(eventsTable)
      .values({
        title,
        description,
        price: price.toString(),
        startDate: startDateTime,
        endDate: endDateTime,
        location,
        isPeriodic: isPeriodic || false,
        frequency,
        maxAttendees: Number(maxAttendees),
        createdById: userId,
        isActive: true,
      })
      .returning();

    console.log("Successfully created event:", newEvent[0]);
    return NextResponse.json(newEvent[0], { status: 201 });
  } catch (error) {
    console.error("Error creating event:", error);
    return NextResponse.json(
      {
        error: "Error creating event",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * Recalculates registration statuses when maxAttendees changes
 * Moves users to waitlist if the new capacity is exceeded
 */
async function recalculateRegistrationStatuses(
  eventId: number,
  newMaxAttendees: number
) {
  // Get all current registrations ordered by registration date (first-come, first-served)
  const allRegistrations = await db
    .select()
    .from(registrationsTable)
    .where(
      and(
        eq(registrationsTable.eventId, eventId),
        eq(registrationsTable.status, "registered")
      )
    )
    .orderBy(registrationsTable.registrationDate);

  // If we have more registered users than the new capacity
  if (allRegistrations.length > newMaxAttendees) {
    // Users beyond the new capacity should be moved to waitlist
    const usersToWaitlist = allRegistrations.slice(newMaxAttendees);

    // Update their status to 'waitlist'
    for (const registration of usersToWaitlist) {
      await db
        .update(registrationsTable)
        .set({
          status: "waitlist",
          updatedAt: new Date(),
        })
        .where(eq(registrationsTable.id, registration.id));
    }
  } else {
    // If capacity increased, potentially move waitlisted users to registered
    const waitlistUsers = await db
      .select()
      .from(registrationsTable)
      .where(
        and(
          eq(registrationsTable.eventId, eventId),
          eq(registrationsTable.status, "waitlist")
        )
      )
      .orderBy(registrationsTable.registrationDate);

    const availableSpots = newMaxAttendees - allRegistrations.length;
    const usersToRegister = waitlistUsers.slice(0, availableSpots);

    // Move users from waitlist to registered
    for (const registration of usersToRegister) {
      await db
        .update(registrationsTable)
        .set({
          status: "registered",
          updatedAt: new Date(),
        })
        .where(eq(registrationsTable.id, registration.id));
    }
  }
}

// PUT update event (admin only)
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
    const {
      id,
      title,
      description,
      price,
      startDate,
      endDate,
      location,
      isPeriodic,
      frequency,
      maxAttendees,
      isActive,
    } = body;

    // Validate required fields
    if (!id) {
      return NextResponse.json(
        { error: "Event ID is required" },
        { status: 400 }
      );
    }

    // Check if event exists
    const existingEvent = await db.query.eventsTable.findFirst({
      where: eq(eventsTable.id, id),
    });

    if (!existingEvent) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Check if maxAttendees is being changed
    const oldMaxAttendees = existingEvent.maxAttendees;
    const newMaxAttendees = maxAttendees ?? oldMaxAttendees;
    const maxAttendeesChanged = newMaxAttendees !== oldMaxAttendees;

    // Update event
    const updatedEvent = await db
      .update(eventsTable)
      .set({
        title: title ?? existingEvent.title,
        description: description ?? existingEvent.description,
        price: price ?? existingEvent.price,
        startDate: startDate ? new Date(startDate) : existingEvent.startDate,
        endDate: endDate ? new Date(endDate) : existingEvent.endDate,
        location: location ?? existingEvent.location,
        isPeriodic: isPeriodic ?? existingEvent.isPeriodic,
        frequency: frequency ?? existingEvent.frequency,
        maxAttendees: newMaxAttendees,
        isActive: isActive ?? existingEvent.isActive,
      })
      .where(eq(eventsTable.id, id))
      .returning();

    // If maxAttendees changed, recalculate registration statuses
    if (maxAttendeesChanged) {
      await recalculateRegistrationStatuses(id, newMaxAttendees);
    }

    return NextResponse.json(updatedEvent[0]);
  } catch (error) {
    console.error("Error updating event:", error);
    return NextResponse.json(
      { error: "Error updating event" },
      { status: 500 }
    );
  }
}

// DELETE event (admin only)
export async function DELETE(req: Request) {
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

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Event ID is required" },
        { status: 400 }
      );
    }

    const eventId = parseInt(id, 10);
    if (isNaN(eventId)) {
      return NextResponse.json({ error: "Invalid event ID" }, { status: 400 });
    }

    // Check if event exists
    const existingEvent = await db.query.eventsTable.findFirst({
      where: eq(eventsTable.id, eventId),
    });

    if (!existingEvent) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Soft delete by setting isActive to false
    const deletedEvent = await db
      .update(eventsTable)
      .set({ isActive: false })
      .where(eq(eventsTable.id, eventId))
      .returning();

    return NextResponse.json(deletedEvent[0]);
  } catch (error) {
    console.error("Error deleting event:", error);
    return NextResponse.json(
      { error: "Error deleting event" },
      { status: 500 }
    );
  }
}
