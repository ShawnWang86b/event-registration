import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { usersTable } from "@/db/schema";
import { eq, or, ilike } from "drizzle-orm";

// GET /api/admin/users
// Admin endpoint to search for users
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
        { error: "Only admins can search users" },
        { status: 403 }
      );
    }

    // Get search query from URL parameters
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    // Only search if query is provided and has at least 2 characters
    if (!query || query.trim().length < 2) {
      return NextResponse.json({ users: [] });
    }

    // Search users by name or email
    const users = await db
      .select({
        id: usersTable.id,
        name: usersTable.name,
        email: usersTable.email,
        creditBalance: usersTable.creditBalance,
        role: usersTable.role,
      })
      .from(usersTable)
      .where(
        or(
          ilike(usersTable.name, `%${query}%`),
          ilike(usersTable.email, `%${query}%`)
        )
      )
      .limit(20); // Limit results to 20

    return NextResponse.json({ users });
  } catch (error) {
    console.error("Error searching users:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
