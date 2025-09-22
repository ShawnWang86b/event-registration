import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import {
  usersTable,
  creditTransactionsTable,
  monthlyBalancesTable,
  eventsTable,
  registrationsTable,
} from "@/db/schema";
import { eq, and, gte, lte, sql } from "drizzle-orm";

// Transaction with additional details for monthly report
interface MonthlyTransaction {
  id: number;
  amount: number;
  balanceAfter: number;
  type: "deposit" | "spend" | "refund" | "admin_adjust" | "monthly_snapshot";
  description: string;
  createdAt: Date;
  eventId?: number;
  registrationId?: number;
  eventTitle?: string;
  formattedDate: string;
}

// Monthly summary statistics
interface MonthlySummary {
  openingBalance: number;
  closingBalance: number;
  totalDeposits: number;
  totalSpending: number;
  totalRefunds: number;
  totalAdjustments: number;
  netChange: number;
  transactionCount: number;
}

// Complete monthly report response
interface MonthlyReportResponse {
  success: boolean;
  user: {
    id: string;
    name: string;
    email: string;
    currentBalance: number;
  };
  reportPeriod: {
    year: number;
    month: number;
    monthName: string;
    startDate: string;
    endDate: string;
  };
  summary: MonthlySummary;
  transactions: MonthlyTransaction[];
  monthlyBalanceRecord?: {
    id: number;
    openingBalance: number;
    totalDeposits: number;
    totalSpending: number;
    totalRefunds: number;
    closingBalance: number;
    createdAt: Date;
  };
  generatedBy: string;
  generatedAt: string;
}

// GET /api/admin/users/[userId]/monthly-report
// Generate monthly report for a specific user
export async function GET(request: Request, context: any) {
  try {
    const { userId: currentUserId } = await auth();
    if (!currentUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId } = await context.params;
    const { searchParams } = new URL(request.url);

    // Get year and month from query parameters, default to current month
    const now = new Date();
    const year = parseInt(
      searchParams.get("year") || now.getFullYear().toString()
    );
    const month = parseInt(
      searchParams.get("month") || (now.getMonth() + 1).toString()
    );

    // Validate month and year
    if (month < 1 || month > 12) {
      return NextResponse.json(
        { error: "Invalid month. Must be 1-12" },
        { status: 400 }
      );
    }
    if (year < 2020 || year > now.getFullYear() + 1) {
      return NextResponse.json({ error: "Invalid year" }, { status: 400 });
    }

    // Check if current user is admin
    const currentUser = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, currentUserId))
      .limit(1);

    if (!currentUser.length || currentUser[0].role !== "admin") {
      return NextResponse.json(
        { error: "Only admins can generate monthly reports" },
        { status: 403 }
      );
    }

    // Get the target user
    const targetUser = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, userId))
      .limit(1);

    if (!targetUser.length) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Calculate date range for the month
    const startDate = new Date(year, month - 1, 1); // First day of month
    const endDate = new Date(year, month, 0, 23, 59, 59, 999); // Last day of month

    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    // Get all transactions for the specified month
    const transactions = await db
      .select({
        transaction: {
          id: creditTransactionsTable.id,
          amount: creditTransactionsTable.amount,
          balanceAfter: creditTransactionsTable.balanceAfter,
          type: creditTransactionsTable.type,
          description: creditTransactionsTable.description,
          createdAt: creditTransactionsTable.createdAt,
          eventId: creditTransactionsTable.eventId,
          registrationId: creditTransactionsTable.registrationId,
        },
        event: {
          id: eventsTable.id,
          title: eventsTable.title,
        },
      })
      .from(creditTransactionsTable)
      .leftJoin(
        eventsTable,
        eq(creditTransactionsTable.eventId, eventsTable.id)
      )
      .where(
        and(
          eq(creditTransactionsTable.userId, userId),
          gte(creditTransactionsTable.createdAt, startDate),
          lte(creditTransactionsTable.createdAt, endDate)
        )
      )
      .orderBy(creditTransactionsTable.createdAt);

    // Format transactions for response
    const formattedTransactions: MonthlyTransaction[] = transactions.map(
      (row) => ({
        id: row.transaction.id,
        amount: parseFloat(row.transaction.amount),
        balanceAfter: parseFloat(row.transaction.balanceAfter),
        type: row.transaction.type,
        description: row.transaction.description,
        createdAt: row.transaction.createdAt,
        eventId: row.transaction.eventId || undefined,
        registrationId: row.transaction.registrationId || undefined,
        eventTitle: row.event?.title || undefined,
        formattedDate: row.transaction.createdAt.toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
      })
    );

    // Calculate opening balance (balance before first transaction of the month)
    let openingBalance = 0;
    if (formattedTransactions.length > 0) {
      // Opening balance = first transaction's balance after - first transaction's amount
      const firstTransaction = formattedTransactions[0];
      openingBalance = firstTransaction.balanceAfter - firstTransaction.amount;
    } else {
      // No transactions this month, get balance from previous month's last transaction
      const lastPreviousTransaction = await db
        .select({
          balanceAfter: creditTransactionsTable.balanceAfter,
        })
        .from(creditTransactionsTable)
        .where(
          and(
            eq(creditTransactionsTable.userId, userId),
            lte(creditTransactionsTable.createdAt, startDate)
          )
        )
        .orderBy(sql`${creditTransactionsTable.createdAt} DESC`)
        .limit(1);

      if (lastPreviousTransaction.length > 0) {
        openingBalance = parseFloat(lastPreviousTransaction[0].balanceAfter);
      }
    }

    // Calculate aggregated totals
    const summary: MonthlySummary = {
      openingBalance,
      closingBalance:
        formattedTransactions.length > 0
          ? formattedTransactions[formattedTransactions.length - 1].balanceAfter
          : openingBalance,
      totalDeposits: formattedTransactions
        .filter((t) => t.type === "deposit")
        .reduce((sum, t) => sum + t.amount, 0),
      totalSpending: Math.abs(
        formattedTransactions
          .filter((t) => t.type === "spend")
          .reduce((sum, t) => sum + t.amount, 0)
      ),
      totalRefunds: formattedTransactions
        .filter((t) => t.type === "refund")
        .reduce((sum, t) => sum + t.amount, 0),
      totalAdjustments: formattedTransactions
        .filter((t) => t.type === "admin_adjust")
        .reduce((sum, t) => sum + t.amount, 0),
      netChange: 0,
      transactionCount: formattedTransactions.length,
    };

    // Calculate net change
    summary.netChange = summary.closingBalance - summary.openingBalance;

    // Try to get existing monthly balance record
    const monthlyRecord = await db
      .select()
      .from(monthlyBalancesTable)
      .where(
        and(
          eq(monthlyBalancesTable.userId, userId),
          eq(monthlyBalancesTable.year, year),
          eq(monthlyBalancesTable.month, month)
        )
      )
      .limit(1);

    const monthlyReportResponse: MonthlyReportResponse = {
      success: true,
      user: {
        id: targetUser[0].id,
        name: targetUser[0].name,
        email: targetUser[0].email,
        currentBalance: parseFloat(targetUser[0].creditBalance),
      },
      reportPeriod: {
        year,
        month,
        monthName: monthNames[month - 1],
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      },
      summary,
      transactions: formattedTransactions,
      monthlyBalanceRecord:
        monthlyRecord.length > 0
          ? {
              id: monthlyRecord[0].id,
              openingBalance: parseFloat(monthlyRecord[0].openingBalance),
              totalDeposits: parseFloat(monthlyRecord[0].totalDeposits),
              totalSpending: parseFloat(monthlyRecord[0].totalSpending),
              totalRefunds: parseFloat(monthlyRecord[0].totalRefunds),
              closingBalance: parseFloat(monthlyRecord[0].closingBalance),
              createdAt: monthlyRecord[0].createdAt,
            }
          : undefined,
      generatedBy: currentUser[0].name,
      generatedAt: new Date().toISOString(),
    };

    return NextResponse.json(monthlyReportResponse);
  } catch (error) {
    console.error("Error generating monthly report:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/admin/users/[userId]/monthly-report
// Create/update monthly balance record for a specific month
export async function POST(request: Request, context: any) {
  try {
    const { userId: currentUserId } = await auth();
    if (!currentUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId } = await context.params;
    const body = await request.json();
    const { year, month } = body;

    // Validate required fields
    if (!year || !month) {
      return NextResponse.json(
        { error: "Year and month are required" },
        { status: 400 }
      );
    }

    // Check if current user is admin
    const currentUser = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, currentUserId))
      .limit(1);

    if (!currentUser.length || currentUser[0].role !== "admin") {
      return NextResponse.json(
        { error: "Only admins can create monthly balance records" },
        { status: 403 }
      );
    }

    // Check if user exists
    const targetUser = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, userId))
      .limit(1);

    if (!targetUser.length) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Calculate date range for the month
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    // Get opening balance and calculate totals (similar to GET logic)
    const transactions = await db
      .select({
        amount: creditTransactionsTable.amount,
        balanceAfter: creditTransactionsTable.balanceAfter,
        type: creditTransactionsTable.type,
        createdAt: creditTransactionsTable.createdAt,
      })
      .from(creditTransactionsTable)
      .where(
        and(
          eq(creditTransactionsTable.userId, userId),
          gte(creditTransactionsTable.createdAt, startDate),
          lte(creditTransactionsTable.createdAt, endDate)
        )
      )
      .orderBy(creditTransactionsTable.createdAt);

    // Calculate opening balance
    let openingBalance = 0;
    if (transactions.length > 0) {
      const firstTransaction = transactions[0];
      openingBalance =
        parseFloat(firstTransaction.balanceAfter) -
        parseFloat(firstTransaction.amount);
    } else {
      const lastPreviousTransaction = await db
        .select({
          balanceAfter: creditTransactionsTable.balanceAfter,
        })
        .from(creditTransactionsTable)
        .where(
          and(
            eq(creditTransactionsTable.userId, userId),
            lte(creditTransactionsTable.createdAt, startDate)
          )
        )
        .orderBy(sql`${creditTransactionsTable.createdAt} DESC`)
        .limit(1);

      if (lastPreviousTransaction.length > 0) {
        openingBalance = parseFloat(lastPreviousTransaction[0].balanceAfter);
      }
    }

    // Calculate totals
    const totalDeposits = transactions
      .filter((t) => t.type === "deposit")
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    const totalSpending = Math.abs(
      transactions
        .filter((t) => t.type === "spend")
        .reduce((sum, t) => sum + parseFloat(t.amount), 0)
    );

    const totalRefunds = transactions
      .filter((t) => t.type === "refund")
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    const closingBalance =
      transactions.length > 0
        ? parseFloat(transactions[transactions.length - 1].balanceAfter)
        : openingBalance;

    // Insert or update monthly balance record
    const monthlyBalanceData = {
      userId,
      month,
      year,
      openingBalance: openingBalance.toString(),
      totalDeposits: totalDeposits.toString(),
      totalSpending: totalSpending.toString(),
      totalRefunds: totalRefunds.toString(),
      closingBalance: closingBalance.toString(),
    };

    // Check if record already exists
    const existingRecord = await db
      .select()
      .from(monthlyBalancesTable)
      .where(
        and(
          eq(monthlyBalancesTable.userId, userId),
          eq(monthlyBalancesTable.year, year),
          eq(monthlyBalancesTable.month, month)
        )
      )
      .limit(1);

    let monthlyBalanceRecord;
    if (existingRecord.length > 0) {
      // Update existing record
      [monthlyBalanceRecord] = await db
        .update(monthlyBalancesTable)
        .set(monthlyBalanceData)
        .where(eq(monthlyBalancesTable.id, existingRecord[0].id))
        .returning();
    } else {
      // Create new record
      [monthlyBalanceRecord] = await db
        .insert(monthlyBalancesTable)
        .values(monthlyBalanceData)
        .returning();
    }

    return NextResponse.json({
      success: true,
      monthlyBalanceRecord,
      summary: {
        openingBalance,
        totalDeposits,
        totalSpending,
        totalRefunds,
        closingBalance,
        transactionCount: transactions.length,
      },
    });
  } catch (error) {
    console.error("Error creating monthly balance record:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
