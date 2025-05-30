import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { registrationsTable, eventsTable, usersTable } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";

// GET /api/registrations/:eventId
// Get all registrations for a specific event (public access)
export async function GET(request: Request, context: any) {
  try {
    const eventId = await context.params.eventId;

    // Get event details
    const event = await db.query.eventsTable.findFirst({
      where: eq(eventsTable.id, parseInt(eventId)),
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Get all registrations for the event with user details
    const registrations = await db
      .select({
        id: registrationsTable.id,
        userId: registrationsTable.userId,
        eventId: registrationsTable.eventId,
        registrationDate: registrationsTable.registrationDate,
        status: registrationsTable.status,
        position: registrationsTable.position,
        hasAttended: registrationsTable.hasAttended,
        paymentProcessed: registrationsTable.paymentProcessed,
        createdAt: registrationsTable.createdAt,
        updatedAt: registrationsTable.updatedAt,
        user: {
          id: usersTable.id,
          name: usersTable.name,
          email: usersTable.email,
          // Don't expose sensitive user data like role and creditBalance to public
        },
        event: {
          id: eventsTable.id,
          title: eventsTable.title,
          description: eventsTable.description,
          price: eventsTable.price,
          startDate: eventsTable.startDate,
          endDate: eventsTable.endDate,
          location: eventsTable.location,
          maxAttendees: eventsTable.maxAttendees,
        },
      })
      .from(registrationsTable)
      .leftJoin(usersTable, eq(registrationsTable.userId, usersTable.id))
      .leftJoin(eventsTable, eq(registrationsTable.eventId, eventsTable.id))
      .where(eq(registrationsTable.eventId, parseInt(eventId)))
      .orderBy(registrationsTable.position);

    // Calculate summary statistics
    const summary = {
      totalRegistrations: registrations.length,
      registeredCount: registrations.filter((r) => r.status === "registered")
        .length,
      waitlistCount: registrations.filter((r) => r.status === "waitlist")
        .length,
      canceledCount: registrations.filter((r) => r.status === "canceled")
        .length,
      attendedCount: registrations.filter((r) => r.hasAttended).length,
      paymentProcessedCount: registrations.filter((r) => r.paymentProcessed)
        .length,
      availableSpots:
        event.maxAttendees -
        registrations.filter((r) => r.status === "registered").length,
    };

    return NextResponse.json({
      event: {
        id: event.id,
        title: event.title,
        currentRegistrations: registrations.filter(
          (r) => r.status === "registered"
        ).length,
        maxAttendees: event.maxAttendees,
        registrationStatus: `${
          registrations.filter((r) => r.status === "registered").length
        } / ${event.maxAttendees}`,
      },
      summary,
      registrations,
    });
  } catch (error) {
    console.error("Error fetching event registrations:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/registrations/:eventId
// Admin endpoint to update all registrations for an event after it ends
export async function PUT(request: Request, context: any) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const eventId = context.params.eventId;

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
      .where(eq(eventsTable.id, parseInt(eventId)))
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
      .where(eq(registrationsTable.eventId, parseInt(eventId)))
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
export async function DELETE(request: Request, context: any) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const eventId = context.params.eventId;

    // Validate the registration exists and belongs to the user
    const registration = await db
      .select()
      .from(registrationsTable)
      .where(
        and(
          eq(registrationsTable.eventId, parseInt(eventId)),
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
      // Get event details for capacity check
      const event = await tx
        .select()
        .from(eventsTable)
        .where(eq(eventsTable.id, parseInt(eventId)))
        .limit(1);

      if (!event.length) {
        throw new Error("Event not found");
      }

      // Cancel the registration
      const [canceledRegistration] = await tx
        .update(registrationsTable)
        .set({
          status: "canceled",
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(registrationsTable.eventId, parseInt(eventId)),
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
            eq(registrationsTable.eventId, parseInt(eventId)),
            sql`${registrationsTable.position} > ${canceledPosition}`,
            eq(registrationsTable.status, "registered")
          )
        );

      // Check if there's space available and promote first waitlist person
      const currentRegisteredCount = await tx
        .select({ count: sql`count(*)` })
        .from(registrationsTable)
        .where(
          and(
            eq(registrationsTable.eventId, parseInt(eventId)),
            eq(registrationsTable.status, "registered")
          )
        );

      const registeredCount = Number(currentRegisteredCount[0].count);

      // If there's space available, promote the first person from waitlist
      if (registeredCount < event[0].maxAttendees) {
        const firstWaitlistPerson = await tx
          .select()
          .from(registrationsTable)
          .where(
            and(
              eq(registrationsTable.eventId, parseInt(eventId)),
              eq(registrationsTable.status, "waitlist")
            )
          )
          .orderBy(registrationsTable.position)
          .limit(1);

        if (firstWaitlistPerson.length > 0) {
          // Promote the first waitlist person to registered
          await tx
            .update(registrationsTable)
            .set({
              status: "registered",
              position: registeredCount + 1, // New position at the end of registered list
              updatedAt: new Date(),
            })
            .where(eq(registrationsTable.id, firstWaitlistPerson[0].id));

          // Update positions of remaining waitlist people
          await tx
            .update(registrationsTable)
            .set({
              position: sql`${registrationsTable.position} - 1`,
              updatedAt: new Date(),
            })
            .where(
              and(
                eq(registrationsTable.eventId, parseInt(eventId)),
                eq(registrationsTable.status, "waitlist"),
                sql`${registrationsTable.position} > ${firstWaitlistPerson[0].position}`
              )
            );
        }
      }

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
