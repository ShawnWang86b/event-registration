import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { organizerRequestsTable, usersTable } from "@/db/schema";
import { eq, and } from "drizzle-orm";

// GET specific organizer request (admin only)
export async function GET(
  req: Request,
  { params }: { params: Promise<{ requestId: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const user = await db.query.usersTable.findFirst({
      where: eq(usersTable.id, userId),
    });

    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden - Admin access required" },
        { status: 403 }
      );
    }

    const { requestId } = await params;
    if (!requestId) {
      return NextResponse.json(
        { error: "Invalid request ID" },
        { status: 400 }
      );
    }

    const request = await db.query.organizerRequestsTable.findFirst({
      where: eq(organizerRequestsTable.id, requestId),
      with: {
        user: true,
        reviewedBy: true,
      },
    });

    if (!request) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    return NextResponse.json(request);
  } catch (error) {
    console.error("Error fetching organizer request:", error);
    return NextResponse.json(
      { error: "Error fetching organizer request" },
      { status: 500 }
    );
  }
}

// PUT update organizer request status (admin only)
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ requestId: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const user = await db.query.usersTable.findFirst({
      where: eq(usersTable.id, userId),
    });

    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden - Admin access required" },
        { status: 403 }
      );
    }

    const { requestId } = await params;
    if (!requestId) {
      return NextResponse.json(
        { error: "Invalid request ID" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { status, reviewNotes } = body;

    // Validate status
    if (!status || !["approved", "rejected"].includes(status)) {
      return NextResponse.json(
        { error: "Status must be 'approved' or 'rejected'" },
        { status: 400 }
      );
    }

    // Check if request exists
    const existingRequest = await db.query.organizerRequestsTable.findFirst({
      where: eq(organizerRequestsTable.id, requestId),
    });

    if (!existingRequest) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    // Check if request is already processed
    if (existingRequest.status !== "pending") {
      return NextResponse.json(
        { error: "Request has already been processed" },
        { status: 400 }
      );
    }

    // Update request status
    const updatedRequest = await db
      .update(organizerRequestsTable)
      .set({
        status,
        reviewedBy: userId,
        reviewedAt: new Date(),
        reviewNotes: reviewNotes || null,
        updatedAt: new Date(),
      })
      .where(eq(organizerRequestsTable.id, requestId))
      .returning();

    // If approved, update user role to organizer
    if (status === "approved") {
      await db
        .update(usersTable)
        .set({
          role: "organizer",
          updatedAt: new Date(),
        })
        .where(eq(usersTable.id, existingRequest.userId));
    }

    return NextResponse.json(updatedRequest[0]);
  } catch (error) {
    console.error("Error updating organizer request:", error);
    return NextResponse.json(
      { error: "Error updating organizer request" },
      { status: 500 }
    );
  }
}

// DELETE organizer request (admin only)
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ requestId: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const user = await db.query.usersTable.findFirst({
      where: eq(usersTable.id, userId),
    });

    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden - Admin access required" },
        { status: 403 }
      );
    }

    const { requestId } = await params;
    if (!requestId) {
      return NextResponse.json(
        { error: "Invalid request ID" },
        { status: 400 }
      );
    }

    // Check if request exists
    const existingRequest = await db.query.organizerRequestsTable.findFirst({
      where: eq(organizerRequestsTable.id, requestId),
    });

    if (!existingRequest) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    // Delete the request
    await db
      .delete(organizerRequestsTable)
      .where(eq(organizerRequestsTable.id, requestId));

    return NextResponse.json({ message: "Request deleted successfully" });
  } catch (error) {
    console.error("Error deleting organizer request:", error);
    return NextResponse.json(
      { error: "Error deleting organizer request" },
      { status: 500 }
    );
  }
}
