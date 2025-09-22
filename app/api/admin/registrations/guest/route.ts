import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { registrationsTable, eventsTable, usersTable } from "@/db/schema";
import { eq, and, count, sql } from "drizzle-orm";

// POST /api/admin/registrations/guest
// Admin endpoint to register a guest for an event
export async function POST(request: Request) {
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
        { error: "Only admins can register guests" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { eventId, guestName } = body;

    // Validate required fields
    if (!eventId || !guestName) {
      return NextResponse.json(
        { error: "Event ID, guest name are required" },
        { status: 400 }
      );
    }

    // Check if event exists and is active
    const event = await db.query.eventsTable.findFirst({
      where: and(eq(eventsTable.id, eventId), eq(eventsTable.isActive, true)),
    });

    if (!event) {
      return NextResponse.json(
        { error: "Event not found or inactive" },
        { status: 404 }
      );
    }

    // Start a transaction to ensure atomicity
    const result = await db.transaction(async (tx) => {
      // Create a unique guest user (guests don't need to exist beforehand)
      const guestId = `guest_${Date.now()}_${Math.random()
        .toString(36)
        .substring(2)}`;

      const guestEmail = `${guestId}@guest.local`; // Generate dummy email for database constraint

      const [guestUser] = await tx
        .insert(usersTable)
        .values({
          id: guestId,
          name: guestName,
          email: guestEmail,
          role: "guest", // Set role as 'guest'
          creditBalance: "0", // Guests don't have credits
        })
        .returning();

      // Each guest registration creates a new user, so no need to check for existing registrations

      // Get current registered count to determine status
      const currentRegisteredCount = await tx
        .select({ count: count() })
        .from(registrationsTable)
        .where(
          and(
            eq(registrationsTable.eventId, eventId),
            eq(registrationsTable.status, "registered")
          )
        );

      // Determine if guest should be registered or waitlisted
      const status =
        currentRegisteredCount[0].count < event.maxAttendees
          ? "registered"
          : "waitlist";

      // Get the current position (count of all active registrations for this event + 1)
      const positionResult = await tx
        .select({ count: count() })
        .from(registrationsTable)
        .where(
          and(
            eq(registrationsTable.eventId, eventId),
            sql`${registrationsTable.status} != 'canceled'`
          )
        );

      // Create new registration
      const [registration] = await tx
        .insert(registrationsTable)
        .values({
          userId: guestUser.id,
          eventId,
          position: positionResult[0].count + 1,
          status: status,
          registrationDate: new Date(),
          paymentProcessed: true, // Admin registrations are considered paid
        })
        .returning();

      return {
        registration,
        user: guestUser,
        isNewUser: true, // Always true since we create a new user for each guest
        message: `Guest "${guestName}" ${
          status === "registered" ? "registered" : "added to waitlist"
        } successfully`,
      };
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Error creating guest registration:", error);

    // Handle specific error cases
    if (error instanceof Error) {
      if (error.message.includes("already registered")) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET /api/admin/registrations/guest
// Get all guest registrations (for admin view)
export async function GET(request: Request) {
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
        { error: "Only admins can view guest registrations" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get("eventId");

    // Build query for guest registrations (users with role 'guest')
    let whereConditions = eq(usersTable.role, "guest");

    if (eventId) {
      whereConditions =
        and(
          whereConditions,
          eq(registrationsTable.eventId, parseInt(eventId))
        ) || whereConditions;
    }

    const guestRegistrations = await db
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
      .where(whereConditions)
      .orderBy(registrationsTable.createdAt);

    return NextResponse.json({
      guestRegistrations,
      count: guestRegistrations.length,
    });
  } catch (error) {
    console.error("Error fetching guest registrations:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/registrations/guest
// Admin endpoint to delete a guest registration
export async function DELETE(request: Request) {
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
        { error: "Only admins can delete guests" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const registrationId = searchParams.get("registrationId");

    if (!registrationId) {
      return NextResponse.json(
        { error: "Registration ID is required" },
        { status: 400 }
      );
    }

    // Start a transaction to ensure atomicity
    const result = await db.transaction(async (tx) => {
      // Get the registration to delete
      const registration = await tx
        .select({
          id: registrationsTable.id,
          userId: registrationsTable.userId,
          eventId: registrationsTable.eventId,
          position: registrationsTable.position,
          status: registrationsTable.status,
        })
        .from(registrationsTable)
        .leftJoin(usersTable, eq(registrationsTable.userId, usersTable.id))
        .where(
          and(
            eq(registrationsTable.id, parseInt(registrationId)),
            eq(usersTable.role, "guest") // Ensure it's a guest
          )
        )
        .limit(1);

      if (!registration.length) {
        throw new Error("Guest registration not found");
      }

      const guestRegistration = registration[0];

      // Delete the registration
      await tx
        .delete(registrationsTable)
        .where(eq(registrationsTable.id, guestRegistration.id));

      // Delete the guest user as well (since they're only created for registration)
      await tx
        .delete(usersTable)
        .where(eq(usersTable.id, guestRegistration.userId));

      // Update positions of all registrations that came after the deleted one
      await tx
        .update(registrationsTable)
        .set({
          position: sql`${registrationsTable.position} - 1`,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(registrationsTable.eventId, guestRegistration.eventId),
            sql`${registrationsTable.position} > ${guestRegistration.position}`,
            sql`${registrationsTable.status} != 'canceled'`
          )
        );

      // If there's space available and this was a registered user, promote first waitlist person
      if (guestRegistration.status === "registered") {
        // Get event details for capacity check
        const event = await tx
          .select()
          .from(eventsTable)
          .where(eq(eventsTable.id, guestRegistration.eventId))
          .limit(1);

        if (event.length > 0) {
          // Count current registered users
          const currentRegisteredCount = await tx
            .select({ count: count() })
            .from(registrationsTable)
            .where(
              and(
                eq(registrationsTable.eventId, guestRegistration.eventId),
                eq(registrationsTable.status, "registered")
              )
            );

          const registeredCount = currentRegisteredCount[0].count;

          // If there's space available, promote the first person from waitlist
          if (registeredCount < event[0].maxAttendees) {
            const firstWaitlistPerson = await tx
              .select()
              .from(registrationsTable)
              .where(
                and(
                  eq(registrationsTable.eventId, guestRegistration.eventId),
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
                    eq(registrationsTable.eventId, guestRegistration.eventId),
                    eq(registrationsTable.status, "waitlist"),
                    sql`${registrationsTable.position} > ${firstWaitlistPerson[0].position}`
                  )
                );
            }
          }
        }
      }

      return {
        message: "Guest registration deleted successfully",
        deletedRegistration: guestRegistration,
      };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error deleting guest registration:", error);

    // Handle specific error cases
    if (error instanceof Error) {
      if (error.message.includes("not found")) {
        return NextResponse.json({ error: error.message }, { status: 404 });
      }
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
