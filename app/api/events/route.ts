import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { eventsTable, usersTable } from "@/db/schema";
import { eq } from "drizzle-orm";

// GET all events
export async function GET() {
  try {
    const events = await db
      .select()
      .from(eventsTable)
      .where(eq(eventsTable.isActive, true));
    return NextResponse.json(events);
  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json(
      { error: "Error fetching events" },
      { status: 500 }
    );
  }
}

// POST new event (admin only)
export async function POST(req: Request) {
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

    const body = await req.json();
    const {
      title,
      description,
      price,
      startDate,
      endDate,
      location,
      isPeriodic,
      frequency,
      maxAttendees,
    } = body;

    // Validate required fields
    if (
      !title ||
      !description ||
      !price ||
      !startDate ||
      !endDate ||
      !maxAttendees
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const newEvent = await db
      .insert(eventsTable)
      .values({
        title,
        description,
        price,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        location,
        isPeriodic: isPeriodic || false,
        frequency,
        maxAttendees,
        createdById: userId,
        isActive: true,
      })
      .returning();

    return NextResponse.json(newEvent[0], { status: 201 });
  } catch (error) {
    console.error("Error creating event:", error);
    return NextResponse.json(
      { error: "Error creating event" },
      { status: 500 }
    );
  }
}
