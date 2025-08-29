import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { creditTransactionsTable } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";

export async function GET(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get successful spend transactions (which represent successful event attendance)
    const transactions = await db
      .select({
        id: creditTransactionsTable.id,
        amount: creditTransactionsTable.amount,
        createdAt: creditTransactionsTable.createdAt,
        description: creditTransactionsTable.description,
        eventId: creditTransactionsTable.eventId,
      })
      .from(creditTransactionsTable)
      .where(
        and(
          eq(creditTransactionsTable.userId, userId),
          eq(creditTransactionsTable.type, "spend") // Only spend transactions (event attendance)
        )
      )
      .orderBy(desc(creditTransactionsTable.createdAt));

    // Calculate calories consumed per month
    const calorieData = transactions.reduce((acc: any[], transaction) => {
      const date = new Date(transaction.createdAt);
      const monthYear = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;
      const monthName = date.toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      });

      // Each successful event attendance = 500 calories
      const calories = 500;

      const existingEntry = acc.find((entry) => entry.monthYear === monthYear);
      if (existingEntry) {
        existingEntry.calories += calories;
        existingEntry.events += 1;
      } else {
        acc.push({
          monthYear,
          monthName,
          year: date.getFullYear(),
          month: date.getMonth() + 1,
          calories,
          events: 1,
        });
      }

      return acc;
    }, []);

    // Sort by date and fill missing months with 0
    calorieData.sort((a, b) => a.monthYear.localeCompare(b.monthYear));

    // Calculate total calories since joining
    const totalCalories = calorieData.reduce(
      (sum, entry) => sum + entry.calories,
      0
    );
    const totalEvents = transactions.length;

    // Get user join date (oldest transaction or current date if no transactions)
    const joinDate =
      transactions.length > 0
        ? new Date(transactions[transactions.length - 1].createdAt)
        : new Date();

    return NextResponse.json({
      calorieData,
      totalCalories,
      totalEvents,
      joinDate: joinDate.toISOString(),
    });
  } catch (error) {
    console.error("Error fetching calorie data:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
