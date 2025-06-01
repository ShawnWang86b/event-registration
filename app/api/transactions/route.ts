import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import {
  creditTransactionsTable,
  usersTable,
  eventsTable,
  registrationsTable,
} from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";

/**
 * GET /api/transactions
 * Get transaction history with filtering and pagination
 *
 * Query Parameters:
 * - userId: string (optional) - Filter by specific user ID (admin only)
 * - eventId: string (optional) - Filter by specific event ID
 * - limit: number (optional, default: 50) - Number of transactions to return
 * - offset: number (optional, default: 0) - Number of transactions to skip
 *
 * Examples:
 * - GET /api/transactions - Get current user's transactions (first 50)
 * - GET /api/transactions?limit=100&offset=50 - Get next 100 transactions
 * - GET /api/transactions?userId=user123 - Admin: Get specific user's transactions
 * - GET /api/transactions?eventId=456 - Get all transactions for event 456
 * - GET /api/transactions?userId=user123&eventId=456 - Get user's transactions for specific event
 *
 * Response:
 * {
 *   "transactions": [...],
 *   "pagination": {
 *     "total": 150,
 *     "limit": 50,
 *     "offset": 0,
 *     "hasMore": true
 *   }
 * }
 *
 * Access Control:
 * - Regular users: Can only see their own transactions
 * - Admins: Can see all transactions or filter by userId/eventId
 */
export async function GET(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const targetUserId = searchParams.get("userId");
    const eventId = searchParams.get("eventId");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    // Check if current user is admin
    const currentUser = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, userId))
      .limit(1);

    const isAdmin = currentUser.length > 0 && currentUser[0].role === "admin";

    // Build where conditions
    let whereConditions = [];

    // If not admin, only show their own transactions
    if (!isAdmin) {
      whereConditions.push(eq(creditTransactionsTable.userId, userId));
    } else if (targetUserId) {
      // Admin can filter by specific user
      whereConditions.push(eq(creditTransactionsTable.userId, targetUserId));
    }

    // Filter by event if specified
    if (eventId) {
      whereConditions.push(
        eq(creditTransactionsTable.eventId, parseInt(eventId))
      );
    }

    // Get transactions with related data
    const transactions = await db
      .select({
        id: creditTransactionsTable.id,
        userId: creditTransactionsTable.userId,
        amount: creditTransactionsTable.amount,
        balanceAfter: creditTransactionsTable.balanceAfter,
        type: creditTransactionsTable.type,
        description: creditTransactionsTable.description,
        eventId: creditTransactionsTable.eventId,
        registrationId: creditTransactionsTable.registrationId,
        createdAt: creditTransactionsTable.createdAt,
        user: {
          id: usersTable.id,
          name: usersTable.name,
          email: usersTable.email,
        },
        event: {
          id: eventsTable.id,
          title: eventsTable.title,
          price: eventsTable.price,
        },
      })
      .from(creditTransactionsTable)
      .leftJoin(usersTable, eq(creditTransactionsTable.userId, usersTable.id))
      .leftJoin(
        eventsTable,
        eq(creditTransactionsTable.eventId, eventsTable.id)
      )
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
      .orderBy(desc(creditTransactionsTable.createdAt))
      .limit(limit)
      .offset(offset);

    // Get total count for pagination
    const totalCount = await db
      .select({ count: creditTransactionsTable.id })
      .from(creditTransactionsTable)
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined);

    return NextResponse.json({
      transactions,
      pagination: {
        total: totalCount.length,
        limit,
        offset,
        hasMore: totalCount.length > offset + limit,
      },
    });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/transactions
 * Create a new transaction (deposit or spend)
 *
 * Request Body:
 * {
 *   "amount": number (required) - Transaction amount (positive number)
 *   "type": "deposit" | "spend" (required) - Transaction type
 *   "description": string (optional) - Transaction description
 *   "eventId": number (optional) - Related event ID (for spend transactions)
 *   "registrationId": number (optional) - Related registration ID (for spend transactions)
 * }
 *
 * Examples:
 *
 * Deposit (Add Credits):
 * {
 *   "amount": 100,
 *   "type": "deposit",
 *   "description": "Credit card deposit"
 * }
 *
 * Spend (Subtract Credits):
 * {
 *   "amount": 25,
 *   "type": "spend",
 *   "description": "Event registration fee",
 *   "eventId": 123,
 *   "registrationId": 456
 * }
 *
 * Response:
 * {
 *   "id": 789,
 *   "userId": "user123",
 *   "amount": "100.00",
 *   "balanceAfter": "125.00",
 *   "type": "deposit",
 *   "description": "Credit card deposit",
 *   "createdAt": "2024-01-01T12:00:00Z"
 * }
 */
export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { amount, type, description, eventId, registrationId } = body;

    // Validate input
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: "Amount must be greater than 0" },
        { status: 400 }
      );
    }

    if (!type || !["deposit", "spend"].includes(type)) {
      return NextResponse.json(
        { error: "Type must be either 'deposit' or 'spend'" },
        { status: 400 }
      );
    }

    // Start a transaction to ensure atomicity
    const result = await db.transaction(async (tx) => {
      // Get current user balance
      const user = await tx
        .select()
        .from(usersTable)
        .where(eq(usersTable.id, userId))
        .limit(1);

      if (!user.length) {
        throw new Error("User not found");
      }

      const currentBalance = user[0].creditBalance;
      let newBalance: number;
      let transactionAmount: number;

      if (type === "deposit") {
        // Add credits to balance
        newBalance = currentBalance + amount;
        transactionAmount = amount; // Positive amount for deposits
      } else {
        // Subtract credits from balance
        newBalance = currentBalance - amount;
        transactionAmount = -amount; // Negative amount for spending

        // Check if user has sufficient balance
        if (newBalance < 0) {
          throw new Error(
            `Insufficient balance. Current: ${currentBalance}, Required: ${amount}`
          );
        }
      }

      // Create transaction record
      const [transaction] = await tx
        .insert(creditTransactionsTable)
        .values({
          userId,
          amount: transactionAmount.toString(),
          balanceAfter: newBalance.toString(),
          type,
          description:
            description ||
            (type === "deposit" ? "Credit deposit" : "Credit spend"),
          eventId: eventId || null,
          registrationId: registrationId || null,
        })
        .returning();

      // Update user balance
      await tx
        .update(usersTable)
        .set({
          creditBalance: newBalance,
          updatedAt: new Date(),
        })
        .where(eq(usersTable.id, userId));

      return {
        ...transaction,
        previousBalance: currentBalance,
        newBalance,
      };
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Error creating transaction:", error);

    // Return specific error for insufficient balance
    if (
      error instanceof Error &&
      error.message.includes("Insufficient balance")
    ) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
