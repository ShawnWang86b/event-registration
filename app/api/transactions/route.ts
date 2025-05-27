import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { creditTransactionsTable, usersTable } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";

// GET /api/transactions?userId=xxx
export async function GET(request: Request) {
  try {
    const { userId: authUserId } = await auth();
    if (!authUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const eventId = searchParams.get("eventId");

    // If userId is provided, check if the requesting user is admin or the same user
    if (userId && userId !== authUserId) {
      const user = await db.query.usersTable.findFirst({
        where: eq(usersTable.id, authUserId),
      });

      if (!user || user.role !== "admin") {
        return NextResponse.json(
          { error: "Unauthorized to view other users' transactions" },
          { status: 403 }
        );
      }
    }

    const query = db
      .select()
      .from(creditTransactionsTable)
      .where(
        and(
          userId ? eq(creditTransactionsTable.userId, userId) : undefined,
          eventId
            ? eq(creditTransactionsTable.eventId, parseInt(eventId))
            : undefined
        )
      )
      .orderBy(desc(creditTransactionsTable.createdAt));

    const transactions = await query;
    return NextResponse.json(transactions);
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/transactions - Create a new transaction (deposit)
export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { amount, type = "deposit", description } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: "Amount must be greater than 0" },
        { status: 400 }
      );
    }

    // Start a transaction to ensure atomicity
    const result = await db.transaction(async (tx) => {
      // Get current user balance
      const user = await tx.query.usersTable.findFirst({
        where: eq(usersTable.id, userId),
      });

      if (!user) {
        throw new Error("User not found");
      }

      const currentBalance = user.creditBalance;
      const newBalance = currentBalance + amount;

      // Create transaction record
      const [transaction] = await tx
        .insert(creditTransactionsTable)
        .values({
          userId,
          amount: amount.toString(),
          balanceAfter: newBalance.toString(),
          type,
          description: description || "Credit deposit",
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
        .where(eq(usersTable.id, userId));

      return transaction;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Error creating transaction:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
