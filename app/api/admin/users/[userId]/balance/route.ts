import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { usersTable } from "@/db/schema";
import { eq } from "drizzle-orm";

// PUT /api/admin/users/:userId/balance
// Admin endpoint to adjust user's credit balance
export async function PUT(request: Request, context: any) {
  try {
    const { userId: currentUserId } = await auth();
    if (!currentUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId } = await context.params;

    // Check if current user is admin
    const currentUser = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, currentUserId))
      .limit(1);

    if (!currentUser.length || currentUser[0].role !== "admin") {
      return NextResponse.json(
        { error: "Only admins can manage user balances" },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { action, amount } = body;

    // Validate input
    if (!action || !amount || typeof amount !== "number") {
      return NextResponse.json(
        { error: "Action and amount are required" },
        { status: 400 }
      );
    }

    if (!["add", "subtract"].includes(action)) {
      return NextResponse.json(
        { error: "Action must be 'add' or 'subtract'" },
        { status: 400 }
      );
    }

    if (amount <= 0) {
      return NextResponse.json(
        { error: "Amount must be positive" },
        { status: 400 }
      );
    }

    // Check if target user exists
    const targetUser = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, userId))
      .limit(1);

    if (!targetUser.length) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Calculate new balance
    const currentBalance = targetUser[0].creditBalance;
    let newBalance: number;

    if (action === "add") {
      newBalance = currentBalance + amount;
    } else {
      newBalance = currentBalance - amount;
      // Prevent negative balance
      if (newBalance < 0) {
        return NextResponse.json(
          {
            error: `Insufficient balance. Current: ${currentBalance}, Requested: ${amount}`,
          },
          { status: 400 }
        );
      }
    }

    // Update user balance
    const [updatedUser] = await db
      .update(usersTable)
      .set({
        creditBalance: newBalance,
        updatedAt: new Date(),
      })
      .where(eq(usersTable.id, userId))
      .returning();

    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        previousBalance: currentBalance,
        newBalance: updatedUser.creditBalance,
        adjustment: action === "add" ? amount : -amount,
      },
      action,
      amount,
      adjustedBy: currentUser[0].name,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error adjusting user balance:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET /api/admin/users/:userId/balance
// Admin endpoint to get user's balance information
export async function GET(request: Request, context: any) {
  try {
    const { userId: currentUserId } = await auth();
    if (!currentUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId } = await context.params;

    // Check if current user is admin
    const currentUser = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, currentUserId))
      .limit(1);

    if (!currentUser.length || currentUser[0].role !== "admin") {
      return NextResponse.json(
        { error: "Only admins can view user balance details" },
        { status: 403 }
      );
    }

    // Get target user balance
    const targetUser = await db
      .select({
        id: usersTable.id,
        name: usersTable.name,
        email: usersTable.email,
        creditBalance: usersTable.creditBalance,
        role: usersTable.role,
        createdAt: usersTable.createdAt,
        updatedAt: usersTable.updatedAt,
      })
      .from(usersTable)
      .where(eq(usersTable.id, userId))
      .limit(1);

    if (!targetUser.length) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      user: targetUser[0],
    });
  } catch (error) {
    console.error("Error fetching user balance:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
