import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { registrationsTable, usersTable } from "@/db/schema";
import { eq, and } from "drizzle-orm";

// PUT /api/registrations/:eventId/:registrationId
// Admin endpoint to update a specific registration for an event
export async function PUT(request: Request, context: any) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { eventId, registrationId } = await context.params;

    // Check if user is admin
    const user = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, userId))
      .limit(1);

    if (!user.length || user[0].role !== "admin") {
      return NextResponse.json(
        { error: "Only admins can update registrations" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { status, hasAttended, paymentProcessed } = body;

    // Validate the registration exists and belongs to the event
    const registration = await db
      .select()
      .from(registrationsTable)
      .where(
        and(
          eq(registrationsTable.id, parseInt(registrationId)),
          eq(registrationsTable.eventId, parseInt(eventId))
        )
      )
      .limit(1);

    if (!registration.length) {
      return NextResponse.json(
        { error: "Registration not found for this event" },
        { status: 404 }
      );
    }

    // Update the registration
    const [updatedRegistration] = await db
      .update(registrationsTable)
      .set({
        status: status || registration[0].status,
        hasAttended: hasAttended ?? registration[0].hasAttended,
        paymentProcessed: paymentProcessed ?? registration[0].paymentProcessed,
        updatedAt: new Date(),
      })
      .where(eq(registrationsTable.id, parseInt(registrationId)))
      .returning();

    return NextResponse.json(updatedRegistration);
  } catch (error) {
    console.error("Error updating registration:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
