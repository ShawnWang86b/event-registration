import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import {
  eventsTable,
  registrationsTable,
  usersTable,
  creditTransactionsTable,
} from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";

// Types for the response
interface DeductionResult {
  userId: string;
  userName: string;
  previousBalance: number;
  newBalance: number;
  deducted: number;
  transactionId: number;
}

interface DeductionError {
  userId: string;
  userName: string;
  currentBalance: number;
  eventPrice: number;
  deficit: number;
}

// POST /api/events/[eventId]/end
// Admin endpoint to end an event and deduct attendees' balances
export async function POST(request: Request, context: any) {
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
        { error: "Only admins can end events" },
        { status: 403 }
      );
    }

    // Check if event exists and is active
    const event = await db
      .select()
      .from(eventsTable)
      .where(eq(eventsTable.id, eventIdNum))
      .limit(1);

    if (!event.length) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    if (!event[0].isActive) {
      return NextResponse.json(
        { error: "Event is already ended" },
        { status: 400 }
      );
    }

    // Get all registered attendees with their registration info
    const registrations = await db
      .select({
        id: registrationsTable.id,
        userId: registrationsTable.userId,
        user: {
          id: usersTable.id,
          name: usersTable.name,
          email: usersTable.email,
          creditBalance: usersTable.creditBalance,
        },
      })
      .from(registrationsTable)
      .innerJoin(usersTable, eq(registrationsTable.userId, usersTable.id))
      .where(
        and(
          eq(registrationsTable.eventId, eventIdNum),
          eq(registrationsTable.status, "registered")
        )
      );

    const eventPrice = parseFloat(event[0].price);
    const deductionResults: DeductionResult[] = [];
    const errors: DeductionError[] = [];

    // Start a transaction to ensure data consistency
    await db.transaction(async (tx) => {
      // End the event first
      await tx
        .update(eventsTable)
        .set({
          isActive: false,
          updatedAt: new Date(),
        })
        .where(eq(eventsTable.id, eventIdNum));

      // Deduct balance from each registered attendee
      for (const registration of registrations) {
        const currentBalance = registration.user.creditBalance;
        const newBalance = currentBalance - eventPrice;

        if (newBalance < 0) {
          errors.push({
            userId: registration.userId,
            userName: registration.user.name,
            currentBalance,
            eventPrice,
            deficit: eventPrice - currentBalance,
          });
          continue;
        }

        // Update user balance
        await tx
          .update(usersTable)
          .set({
            creditBalance: newBalance,
            updatedAt: new Date(),
          })
          .where(eq(usersTable.id, registration.userId));

        // Create transaction record
        const [transaction] = await tx
          .insert(creditTransactionsTable)
          .values({
            userId: registration.userId,
            amount: (-eventPrice).toString(), // Negative amount for spending
            balanceAfter: newBalance.toString(),
            type: "spend",
            description: `Event fee deduction: ${event[0].title}`,
            eventId: eventIdNum,
            registrationId: registration.id,
          })
          .returning();

        deductionResults.push({
          userId: registration.userId,
          userName: registration.user.name,
          previousBalance: currentBalance,
          newBalance,
          deducted: eventPrice,
          transactionId: transaction.id,
        });
      }
    });

    // Log the action
    console.log(
      `Admin ${currentUserId} ended event ${eventIdNum}. Deducted ${eventPrice} credits from ${deductionResults.length} attendees. Created ${deductionResults.length} transaction records.`
    );

    return NextResponse.json({
      success: true,
      event: {
        id: event[0].id,
        title: event[0].title,
        price: eventPrice,
      },
      deductionResults,
      errors,
      summary: {
        totalAttendees: registrations.length,
        successfulDeductions: deductionResults.length,
        failedDeductions: errors.length,
        totalDeducted: deductionResults.length * eventPrice,
        transactionsCreated: deductionResults.length,
      },
      endedBy: currentUser[0].name,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error ending event:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
