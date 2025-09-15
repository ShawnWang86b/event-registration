import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { registrationsTable, eventsTable, usersTable } from "@/db/schema";
import { eq, and, count } from "drizzle-orm";

// GET http://localhost:3000/api/registrations?eventId=1
// GET http://localhost:3000/api/registrations
export async function GET(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get("eventId");

    const query = db
      .select({
        id: registrationsTable.id,
        userId: registrationsTable.userId,
        eventId: registrationsTable.eventId,
        position: registrationsTable.position,
        status: registrationsTable.status,
        createdAt: registrationsTable.createdAt,
        event: {
          id: eventsTable.id,
          title: eventsTable.title,
          description: eventsTable.description,
          price: eventsTable.price,
          startDate: eventsTable.startDate,
          endDate: eventsTable.endDate,
          location: eventsTable.location,
          maxAttendees: eventsTable.maxAttendees,
          isActive: eventsTable.isActive,
        },
      })
      .from(registrationsTable)
      .leftJoin(eventsTable, eq(registrationsTable.eventId, eventsTable.id))
      .where(
        eventId
          ? and(
              eq(registrationsTable.userId, userId),
              eq(registrationsTable.eventId, parseInt(eventId))
            )
          : eq(registrationsTable.userId, userId)
      );

    const registrations = await query;
    return NextResponse.json(registrations);
  } catch (error) {
    console.error("Error fetching registrations:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/registrations
export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { eventId } = body;

    if (!eventId) {
      return NextResponse.json(
        { error: "Event ID is required" },
        { status: 400 }
      );
    }

    // Check if event exists and is active
    const event = await db
      .select()
      .from(eventsTable)
      .where(and(eq(eventsTable.id, eventId), eq(eventsTable.isActive, true)))
      .limit(1);

    if (!event.length) {
      return NextResponse.json(
        { error: "Event not found or inactive" },
        { status: 404 }
      );
    }

    // Check if user has permission to register for this event
    // Get user role to determine access
    const user = await db.query.usersTable.findFirst({
      where: eq(usersTable.id, userId),
    });
    const isAdmin = user?.role === "admin";

    if (!isAdmin && !event[0].isPublicVisible) {
      return NextResponse.json(
        { error: "Event not found or inactive" },
        { status: 404 }
      );
    }

    // Check if user already has a registration for this event (including canceled ones)
    const existingRegistration = await db
      .select()
      .from(registrationsTable)
      .where(
        and(
          eq(registrationsTable.userId, userId),
          eq(registrationsTable.eventId, eventId)
        )
      )
      .limit(1);

    if (existingRegistration.length > 0) {
      // If user has a canceled registration, reactivate it
      if (existingRegistration[0].status === "canceled") {
        // Get current registered count to determine new status
        const currentRegisteredCount = await db
          .select({ count: count() })
          .from(registrationsTable)
          .where(
            and(
              eq(registrationsTable.eventId, eventId),
              eq(registrationsTable.status, "registered")
            )
          );

        const newStatus =
          currentRegisteredCount[0].count < event[0].maxAttendees
            ? "registered"
            : "waitlist";

        // Get new position
        const totalRegistrations = await db
          .select({ count: count() })
          .from(registrationsTable)
          .where(eq(registrationsTable.eventId, eventId));

        const [updatedRegistration] = await db
          .update(registrationsTable)
          .set({
            status: newStatus,
            position: totalRegistrations[0].count + 1,
            registrationDate: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(registrationsTable.id, existingRegistration[0].id))
          .returning();

        return NextResponse.json(updatedRegistration, { status: 200 });
      } else {
        return NextResponse.json(
          { error: "Already registered for this event" },
          { status: 400 }
        );
      }
    }

    // Get current registered count to determine status
    const currentRegisteredCount = await db
      .select({ count: count() })
      .from(registrationsTable)
      .where(
        and(
          eq(registrationsTable.eventId, eventId),
          eq(registrationsTable.status, "registered")
        )
      );

    // Determine if user should be registered or waitlisted
    const status =
      currentRegisteredCount[0].count < event[0].maxAttendees
        ? "registered"
        : "waitlist";

    // Get the current position (count of all registrations for this event)
    const positionResult = await db
      .select({ count: count() })
      .from(registrationsTable)
      .where(eq(registrationsTable.eventId, eventId));

    // Create new registration
    const [registration] = await db
      .insert(registrationsTable)
      .values({
        userId,
        eventId,
        position: positionResult[0].count + 1,
        status: status,
        registrationDate: new Date(),
      })
      .returning();

    return NextResponse.json(registration, { status: 201 });
  } catch (error) {
    console.error("Error creating registration:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
