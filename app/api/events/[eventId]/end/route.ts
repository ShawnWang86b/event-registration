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

// Types for the request body
interface UserPrice {
  userId: string;
  registrationId: number;
  customPrice?: number;
  useDefault: boolean;
}

interface EndEventRequest {
  userPrices: UserPrice[];
}

// Types for the response
interface DeductionResult {
  userId: string;
  userName: string;
  previousBalance: number;
  newBalance: number;
  deducted: number;
  transactionId: number;
  priceUsed: number;
  wentNegative: boolean;
}

interface NegativeBalanceWarning {
  userId: string;
  userName: string;
  previousBalance: number;
  newBalance: number;
  priceCharged: number;
  deficit: number;
}

// POST /api/events/[eventId]/end
// Admin endpoint to end an event and deduct attendees' balances with individual pricing
export async function POST(request: Request, context: any) {
  try {
    // Check if user is admin
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

    // Parse request body for individual pricing
    const body: EndEventRequest = await request.json();
    const { userPrices } = body;

    if (!userPrices || !Array.isArray(userPrices)) {
      return NextResponse.json(
        { error: "userPrices array is required" },
        { status: 400 }
      );
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

    const defaultPrice = parseFloat(event[0].price);

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

    // Create a map of user prices for quick lookup
    const userPriceMap = new Map<string, UserPrice>();
    userPrices.forEach((userPrice) => {
      userPriceMap.set(userPrice.userId, userPrice);
    });

    const deductionResults: DeductionResult[] = [];
    const negativeBalanceWarnings: NegativeBalanceWarning[] = [];

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

      // Deduct balance from each registered attendee with their individual price
      for (const registration of registrations) {
        const userPriceInfo = userPriceMap.get(registration.userId);

        // Determine the price to charge for this user
        let priceToCharge: number;
        if (userPriceInfo) {
          priceToCharge = userPriceInfo.useDefault
            ? defaultPrice
            : userPriceInfo.customPrice || defaultPrice;
        } else {
          // If no price info provided, use default price
          priceToCharge = defaultPrice;
        }

        const currentBalance = registration.user.creditBalance;
        const newBalance = currentBalance - priceToCharge;
        const wentNegative = newBalance < 0;

        // Always deduct the fee, even if it results in negative balance
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
            amount: (-priceToCharge).toString(), // Negative amount for spending
            balanceAfter: newBalance.toString(),
            type: "spend",
            description: `Event fee deduction: ${event[0].title}${
              userPriceInfo && !userPriceInfo.useDefault
                ? ` (Custom price: $${priceToCharge.toFixed(2)})`
                : ` (Default price: $${priceToCharge.toFixed(2)})`
            }${wentNegative ? " - RESULTED IN NEGATIVE BALANCE" : ""}`,
            eventId: eventIdNum,
            registrationId: registration.id,
          })
          .returning();

        // Add to results
        deductionResults.push({
          userId: registration.userId,
          userName: registration.user.name,
          previousBalance: currentBalance,
          newBalance,
          deducted: priceToCharge,
          transactionId: transaction.id,
          priceUsed: priceToCharge,
          wentNegative,
        });

        // Track users who went negative for admin notification
        if (wentNegative) {
          negativeBalanceWarnings.push({
            userId: registration.userId,
            userName: registration.user.name,
            previousBalance: currentBalance,
            newBalance,
            priceCharged: priceToCharge,
            deficit: Math.abs(newBalance), // How much they're in the negative
          });
        }
      }
    });

    // Calculate summary statistics
    const totalDeducted = deductionResults.reduce(
      (sum, result) => sum + result.deducted,
      0
    );
    const customPriceCount = deductionResults.filter((result) => {
      const userPriceInfo = userPriceMap.get(result.userId);
      return userPriceInfo && !userPriceInfo.useDefault;
    }).length;

    // Log the action
    console.log(
      `Admin ${currentUserId} ended event ${eventIdNum}. Processed ${
        deductionResults.length
      } deductions (${customPriceCount} with custom prices). Total deducted: $${totalDeducted.toFixed(
        2
      )}. ${
        negativeBalanceWarnings.length
      } users have negative balances. Created ${
        deductionResults.length
      } transaction records.`
    );

    return NextResponse.json({
      success: true,
      event: {
        id: event[0].id,
        title: event[0].title,
        defaultPrice: defaultPrice,
      },
      deductionResults,
      negativeBalanceWarnings,
      summary: {
        totalAttendees: registrations.length,
        successfulDeductions: deductionResults.length,
        failedDeductions: 0, // No more failed deductions
        totalDeducted: parseFloat(totalDeducted.toFixed(2)),
        defaultPriceUsed: deductionResults.length - customPriceCount,
        customPriceUsed: customPriceCount,
        transactionsCreated: deductionResults.length,
        usersWithNegativeBalance: negativeBalanceWarnings.length,
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
