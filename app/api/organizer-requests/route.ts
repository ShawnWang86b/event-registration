import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { organizerRequestsTable, usersTable } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { randomUUID } from "crypto";
import { alias } from "drizzle-orm/pg-core";

// GET all organizer requests (admin only)
export async function GET(req: Request) {
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

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    // Build query conditions
    let whereConditions = [];

    if (status && ["pending", "approved", "rejected"].includes(status)) {
      whereConditions.push(
        eq(
          organizerRequestsTable.status,
          status as "pending" | "approved" | "rejected"
        )
      );
    }

    // Create alias for reviewer table
    const reviewerTable = alias(usersTable, "reviewer");

    const requests = await db
      .select({
        id: organizerRequestsTable.id,
        userId: organizerRequestsTable.userId,
        eventType: organizerRequestsTable.eventType,
        description: organizerRequestsTable.description,
        contactInfo: organizerRequestsTable.contactInfo,
        status: organizerRequestsTable.status,
        reviewedBy: organizerRequestsTable.reviewedBy,
        reviewedAt: organizerRequestsTable.reviewedAt,
        reviewNotes: organizerRequestsTable.reviewNotes,
        createdAt: organizerRequestsTable.createdAt,
        updatedAt: organizerRequestsTable.updatedAt,
        user: {
          id: usersTable.id,
          name: usersTable.name,
          email: usersTable.email,
        },
        reviewer: {
          id: reviewerTable.id,
          name: reviewerTable.name,
          email: reviewerTable.email,
        },
      })
      .from(organizerRequestsTable)
      .leftJoin(usersTable, eq(organizerRequestsTable.userId, usersTable.id))
      .leftJoin(
        reviewerTable,
        eq(organizerRequestsTable.reviewedBy, reviewerTable.id)
      )
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
      .orderBy(desc(organizerRequestsTable.createdAt));

    return NextResponse.json(requests);
  } catch (error) {
    console.error("Error fetching organizer requests:", error);
    return NextResponse.json(
      { error: "Error fetching organizer requests" },
      { status: 500 }
    );
  }
}

// POST a normal user new organizer request
export async function POST(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user exists
    const user = await db.query.usersTable.findFirst({
      where: eq(usersTable.id, userId),
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if user already has a pending request
    const existingRequest = await db.query.organizerRequestsTable.findFirst({
      where: and(
        eq(organizerRequestsTable.userId, userId),
        eq(organizerRequestsTable.status, "pending")
      ),
    });

    if (existingRequest) {
      return NextResponse.json(
        { error: "You already have a pending organizer request" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { eventType, description, contactInfo } = body;

    // Validate required fields
    if (!eventType || !description) {
      return NextResponse.json(
        { error: "Event type and description are required" },
        { status: 400 }
      );
    }

    // Create new organizer request
    const newRequest = await db
      .insert(organizerRequestsTable)
      .values({
        id: randomUUID(),
        userId,
        eventType,
        description,
        contactInfo: contactInfo || null,
        status: "pending",
      })
      .returning();

    return NextResponse.json(newRequest[0], { status: 201 });
  } catch (error) {
    console.error("Error creating organizer request:", error);
    return NextResponse.json(
      { error: "Error creating organizer request" },
      { status: 500 }
    );
  }
}
