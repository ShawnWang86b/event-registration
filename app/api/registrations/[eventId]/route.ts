import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { registrationsTable, eventsTable, usersTable } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";

// PUT /api/registrations/:eventId
// Admin endpoint to update all registrations for an event after it ends
export async function PUT(
  request: Request,
  { params }: { params: { eventId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const user = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, userId))
      .limit(1);

    if (!user.length || user[0].role !== "admin") {
      return NextResponse.json(
        { error: "Only admins can update event registrations" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { status, hasAttended, paymentProcessed } = body;

    // Validate the event exists
    const event = await db
      .select()
      .from(eventsTable)
      .where(eq(eventsTable.id, parseInt(params.eventId)))
      .limit(1);

    if (!event.length) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Update all registrations for the event
    const [updatedRegistrations] = await db
      .update(registrationsTable)
      .set({
        status: status || "registered",
        hasAttended: hasAttended ?? false,
        paymentProcessed: paymentProcessed ?? false,
        updatedAt: new Date(),
      })
      .where(eq(registrationsTable.eventId, parseInt(params.eventId)))
      .returning();

    return NextResponse.json(updatedRegistrations);
  } catch (error) {
    console.error("Error updating event registrations:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/registrations/:eventId
// Cancel registration for the current user for a specific event
export async function DELETE(
  request: Request,
  { params }: { params: { eventId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Validate the registration exists and belongs to the user
    const registration = await db
      .select()
      .from(registrationsTable)
      .where(
        and(
          eq(registrationsTable.eventId, parseInt(params.eventId)),
          eq(registrationsTable.userId, userId)
        )
      )
      .limit(1);

    if (!registration.length) {
      return NextResponse.json(
        { error: "Registration not found for this event" },
        { status: 404 }
      );
    }

    const canceledPosition = registration[0].position;

    // Start a transaction to ensure all updates are atomic
    const result = await db.transaction(async (tx) => {
      // Cancel the registration
      const [canceledRegistration] = await tx
        .update(registrationsTable)
        .set({
          status: "canceled",
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(registrationsTable.eventId, parseInt(params.eventId)),
            eq(registrationsTable.userId, userId)
          )
        )
        .returning();

      // Update positions of all registrations that came after the canceled one
      await tx
        .update(registrationsTable)
        .set({
          position: sql`${registrationsTable.position} - 1`,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(registrationsTable.eventId, parseInt(params.eventId)),
            sql`${registrationsTable.position} > ${canceledPosition}`,
            eq(registrationsTable.status, "registered")
          )
        );

      return canceledRegistration;
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error canceling registration:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
