import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { eventsTable, usersTable } from "@/db/schema";
import { eq } from "drizzle-orm";

// PATCH /api/events/[eventId]/toggle
// Admin endpoint to toggle event active/inactive status
export async function PATCH(request: Request, context: any) {
  try {
    const { userId: currentUserId } = await auth();
    if (!currentUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { eventId } = await context.params;
    const eventIdNum = parseInt(eventId);

    if (isNaN(eventIdNum)) {
      return NextResponse.json({ error: "Invalid event ID" }, { status: 400 });
    }

    // Check if current user is admin
    const currentUser = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, currentUserId))
      .limit(1);

    if (!currentUser.length || currentUser[0].role !== "admin") {
      return NextResponse.json(
        { error: "Only admins can toggle event status" },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { isActive } = body;

    if (typeof isActive !== "boolean") {
      return NextResponse.json(
        { error: "isActive must be a boolean value" },
        { status: 400 }
      );
    }

    // Check if event exists
    const event = await db
      .select()
      .from(eventsTable)
      .where(eq(eventsTable.id, eventIdNum))
      .limit(1);

    if (!event.length) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Update event status
    const [updatedEvent] = await db
      .update(eventsTable)
      .set({
        isActive,
        updatedAt: new Date(),
      })
      .where(eq(eventsTable.id, eventIdNum))
      .returning();

    // Log the action
    console.log(
      `Admin ${currentUserId} ${
        isActive ? "activated" : "deactivated"
      } event ${eventIdNum}: ${updatedEvent.title}`
    );

    return NextResponse.json({
      success: true,
      event: updatedEvent,
      message: `Event ${isActive ? "activated" : "deactivated"} successfully`,
      toggledBy: currentUser[0].name,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error toggling event status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
