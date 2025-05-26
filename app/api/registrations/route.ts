import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { registrationsTable, eventsTable } from "@/db/schema";
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

    // Check if user already has a registration for this event
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
      return NextResponse.json(
        { error: "Already registered for this event" },
        { status: 400 }
      );
    }

    // Get the current position (count of registrations for this event)
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
        status: "registered",
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
