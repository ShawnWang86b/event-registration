import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { eventsTable, usersTable } from "@/db/schema";
import { eq } from "drizzle-orm";

// POST copy event (admin only)
export async function POST(
  req: Request,
  { params }: { params: Promise<{ eventId: string }> }
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

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden - Admin access required" },
        { status: 403 }
      );
    }

    // Await the params and validate eventId parameter
    const { eventId: eventIdParam } = await params;
    const eventId = parseInt(eventIdParam, 10);
    if (isNaN(eventId)) {
      return NextResponse.json({ error: "Invalid event ID" }, { status: 400 });
    }

    // Find the original event to copy
    const originalEvent = await db.query.eventsTable.findFirst({
      where: eq(eventsTable.id, eventId),
    });

    if (!originalEvent) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Create the copied event with modified title
    const copiedTitle = `${originalEvent.title} - Copy`;

    const newEvent = await db
      .insert(eventsTable)
      .values({
        title: copiedTitle,
        description: originalEvent.description,
        price: originalEvent.price,
        startDate: originalEvent.startDate,
        endDate: originalEvent.endDate,
        location: originalEvent.location,
        isPeriodic: originalEvent.isPeriodic,
        frequency: originalEvent.frequency,
        maxAttendees: originalEvent.maxAttendees,
        createdById: userId, // Set the admin as the creator of the copy
        isPublicVisible: false, // Set to false initially for admin to review
        isActive: true,
      })
      .returning();

    return NextResponse.json(
      {
        message: "Event copied successfully",
        originalEvent: {
          id: originalEvent.id,
          title: originalEvent.title,
        },
        copiedEvent: newEvent[0],
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error copying event:", error);
    return NextResponse.json(
      {
        error: "Error copying event",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
