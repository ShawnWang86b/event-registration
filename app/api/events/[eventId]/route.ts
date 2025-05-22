import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { eventsTable, usersTable } from "@/db/schema";
import { eq } from "drizzle-orm";

// GET single event
export async function GET(
  req: Request,
  { params }: { params: { eventId: string } }
) {
  try {
    const event = await db.query.eventsTable.findFirst({
      where: eq(eventsTable.id, parseInt(params.eventId)),
    });

    if (!event) {
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

// PUT update event (admin only)
export async function PUT(
  req: Request,
  { params }: { params: { eventId: string } }
) {
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

    // Check if event exists
    const existingEvent = await db.query.eventsTable.findFirst({
      where: eq(eventsTable.id, parseInt(params.eventId)),
    });

    if (!existingEvent) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

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
        maxAttendees: maxAttendees ?? existingEvent.maxAttendees,
        isActive: isActive ?? existingEvent.isActive,
        updatedAt: new Date(),
      })
      .where(eq(eventsTable.id, parseInt(params.eventId)))
      .returning();

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
export async function DELETE(
  req: Request,
  { params }: { params: { eventId: string } }
) {
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

    // Soft delete by setting isActive to false
    const deletedEvent = await db
      .update(eventsTable)
      .set({
        isActive: false,
        updatedAt: new Date(),
      })
      .where(eq(eventsTable.id, parseInt(params.eventId)))
      .returning();

    if (!deletedEvent.length) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Event deleted successfully" });
  } catch (error) {
    console.error("Error deleting event:", error);
    return NextResponse.json(
      { error: "Error deleting event" },
      { status: 500 }
    );
  }
}
