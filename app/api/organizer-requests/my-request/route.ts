import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { organizerRequestsTable, usersTable } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";

// GET user's own organizer request
export async function GET(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's organizer requests (most recent first)
    const requests = await db
      .select({
        id: organizerRequestsTable.id,
        eventType: organizerRequestsTable.eventType,
        description: organizerRequestsTable.description,
        contactInfo: organizerRequestsTable.contactInfo,
        status: organizerRequestsTable.status,
        reviewedAt: organizerRequestsTable.reviewedAt,
        reviewNotes: organizerRequestsTable.reviewNotes,
        createdAt: organizerRequestsTable.createdAt,
        updatedAt: organizerRequestsTable.updatedAt,
        reviewedBy: {
          id: usersTable.id,
          name: usersTable.name,
        },
      })
      .from(organizerRequestsTable)
      .leftJoin(
        usersTable,
        eq(organizerRequestsTable.reviewedBy, usersTable.id)
      )
      .where(eq(organizerRequestsTable.userId, userId))
      .orderBy(desc(organizerRequestsTable.createdAt));

    return NextResponse.json(requests);
  } catch (error) {
    console.error("Error fetching user organizer request:", error);
    return NextResponse.json(
      { error: "Error fetching organizer request" },
      { status: 500 }
    );
  }
}
