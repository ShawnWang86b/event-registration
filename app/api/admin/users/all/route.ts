import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { usersTable } from "@/db/schema";
import { eq, asc } from "drizzle-orm";

// GET /api/admin/users/all
// Admin endpoint to get all users for AG Grid display
export async function GET(request: Request) {
  try {
    const { userId: currentUserId } = await auth();
    if (!currentUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if current user is admin
    const currentUser = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, currentUserId))
      .limit(1);

    if (!currentUser.length || currentUser[0].role !== "admin") {
      return NextResponse.json(
        { error: "Only admins can view all users" },
        { status: 403 }
      );
    }

    // Get pagination parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = (page - 1) * limit;

    // Get all users with basic info
    const users = await db
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
      .orderBy(asc(usersTable.name))
      .limit(limit)
      .offset(offset);

    // Get total count for pagination
    const totalResult = await db
      .select({ count: usersTable.id })
      .from(usersTable);

    const totalUsers = totalResult.length;

    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        total: totalUsers,
        totalPages: Math.ceil(totalUsers / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching all users:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
