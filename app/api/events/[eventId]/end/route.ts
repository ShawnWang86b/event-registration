import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import {
  eventsTable,
  registrationsTable,
  usersTable,
  creditTransactionsTable,
} from "@/db/schema";
import { eq, and } from "drizzle-orm";

// POST /api/events/:eventId/end
export async function POST(request: Request, context: any) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const eventId = context.params.eventId;

    // Check if user is admin
    const user = await db.query.usersTable.findFirst({
      where: eq(usersTable.id, userId),
    });

    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { error: "Only admins can end events" },
        { status: 403 }
      );
    }

    // Get event details
    const event = await db.query.eventsTable.findFirst({
      where: eq(eventsTable.id, parseInt(eventId)),
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Get all registered attendees who haven't had payment processed
    const registrations = await db
      .select({
        id: registrationsTable.id,
        userId: registrationsTable.userId,
        status: registrationsTable.status,
        paymentProcessed: registrationsTable.paymentProcessed,
      })
      .from(registrationsTable)
      .where(
        and(
          eq(registrationsTable.eventId, parseInt(eventId)),
          eq(registrationsTable.status, "registered"),
          eq(registrationsTable.paymentProcessed, false)
        )
      );

    // Process payments for each registration
    const results = await db.transaction(async (tx) => {
      const processedResults = [];

      for (const registration of registrations) {
        // Get user's current balance
        const user = await tx.query.usersTable.findFirst({
          where: eq(usersTable.id, registration.userId),
        });

        if (!user) {
          continue; // Skip if user not found
        }

        const currentBalance = user.creditBalance;
        const eventPrice = parseFloat(event.price);
        const newBalance = currentBalance - eventPrice;

        // Create transaction record
        const [transaction] = await tx
          .insert(creditTransactionsTable)
          .values({
            userId: registration.userId,
            amount: (-eventPrice).toString(), // Negative amount for spending
            balanceAfter: newBalance.toString(),
            type: "spend",
            description: `Payment for event: ${event.title}`,
            eventId: event.id,
            registrationId: registration.id,
            createdAt: new Date(),
          })
          .returning();

        // Update user balance
        await tx
          .update(usersTable)
          .set({
            creditBalance: newBalance,
            updatedAt: new Date(),
          })
          .where(eq(usersTable.id, registration.userId));

        // Mark registration as payment processed
        await tx
          .update(registrationsTable)
          .set({
            paymentProcessed: true,
            updatedAt: new Date(),
          })
          .where(eq(registrationsTable.id, registration.id));

        processedResults.push({
          userId: registration.userId,
          transaction,
          newBalance,
        });
      }

      return processedResults;
    });

    return NextResponse.json({
      message: "Event ended successfully",
      processedPayments: results,
    });
  } catch (error) {
    console.error("Error ending event:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
