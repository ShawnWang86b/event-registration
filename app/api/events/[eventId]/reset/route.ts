import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { eventsTable, registrationsTable, usersTable } from "@/db/schema";
import { eq } from "drizzle-orm";

// Types for the response
type ResetResult = {
  userId: string;
  userName: string;
  registrationId: number;
  status: string;
};

// POST /api/events/[eventId]/reset
// Admin endpoint to reset an event to zero registrations
// not frequently used
export async function POST(request: Request, context: any) {
  try {
    // Check if user is authenticated
    const { userId: currentUserId } = await auth();
    if (!currentUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get event ID from context
    const { eventId } = await context.params;
    const eventIdNum = parseInt(eventId);

    // Check if event ID is valid number
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
        { error: "Only admins can reset events" },
        { status: 403 }
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

    const registrations = await db
      .select({
        id: registrationsTable.id,
        userId: registrationsTable.userId,
        status: registrationsTable.status,
        user: {
          id: usersTable.id,
          name: usersTable.name,
        },
      })
      .from(registrationsTable)
      .innerJoin(usersTable, eq(registrationsTable.userId, usersTable.id))
      .where(eq(registrationsTable.eventId, eventIdNum));

    if (registrations.length === 0) {
      return NextResponse.json({
        success: true,
        message: "Event already has zero registrations",
      });
    }

    const resetResults: ResetResult[] = [];

    // Simply delete all registrations for this event
    await db
      .delete(registrationsTable)
      .where(eq(registrationsTable.eventId, eventIdNum));

    return NextResponse.json({
      success: true,
      message: `Event successfully reset. ${resetResults.length} registrations removed.`,
      resetResults,
    });
  } catch (error) {
    console.error("Error resetting event:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
