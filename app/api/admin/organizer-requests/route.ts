import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { organizerRequestsTable, usersTable } from "@/db/schema";
import { eq, asc } from "drizzle-orm";

/**  
 @param none
 @returns The organizer requests with basic info and pagination
 @URL GET /api/admin/organizer-requests
 @Description This route is used to get all organizer requests for the admin dashboard
 It returns the organizer requests with basic info and pagination
 @Access Control Only admins can view all organizer requests
 @Query Parameters
 - page: number (optional, default: 1) - The page number
 - limit: number (optional, default: 50) - The number of organizer requests to return per page
 @Response
 - 200: The organizer requests with basic info and pagination
 - 401: The user is not authenticated
 - 403: The user is not an admin
 - 500: There is an internal server error
*/

export async function GET(request: Request) {
  try {
    // Get the current user
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
        { error: "Only admins can view all organizer requests" },
        { status: 403 }
      );
    }

    // Get pagination parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = (page - 1) * limit;

    // Get all organizer requests with basic info
    const organizerRequests = await db
      .select({
        id: organizerRequestsTable.id,
        user: { id: usersTable.id, name: usersTable.name },
        eventType: organizerRequestsTable.eventType,
        description: organizerRequestsTable.description,
        contactInfo: organizerRequestsTable.contactInfo,
        status: organizerRequestsTable.status,
        reviewedBy: organizerRequestsTable.reviewedBy,
        reviewedAt: organizerRequestsTable.reviewedAt,
        reviewNotes: organizerRequestsTable.reviewNotes,
        createdAt: organizerRequestsTable.createdAt,
        updatedAt: organizerRequestsTable.updatedAt,
      })
      .from(organizerRequestsTable)
      .leftJoin(usersTable, eq(organizerRequestsTable.userId, usersTable.id))
      .orderBy(asc(organizerRequestsTable.createdAt))
      .limit(limit)
      .offset(offset);

    // Get total count for pagination
    const totalResult = await db
      .select({ count: organizerRequestsTable.id })
      .from(organizerRequestsTable)
      .where(eq(organizerRequestsTable.status, "pending"));

    const totalOrganizerRequests = totalResult.length;

    return NextResponse.json({
      organizerRequests,
      pagination: {
        page,
        limit,
        total: totalOrganizerRequests,
        totalPages: Math.ceil(totalOrganizerRequests / limit),
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
