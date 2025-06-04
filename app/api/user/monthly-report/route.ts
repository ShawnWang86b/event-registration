import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import {
  usersTable,
  creditTransactionsTable,
  monthlyBalancesTable,
  eventsTable,
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
  generatedAt: string;
}

// GET /api/user/monthly-report
// Generate monthly report for current user
export async function GET(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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

    // Get the current user
    const currentUser = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, userId))
      .limit(1);

    if (!currentUser.length) {
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
        id: currentUser[0].id,
        name: currentUser[0].name,
        email: currentUser[0].email,
        currentBalance: currentUser[0].creditBalance,
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
      generatedAt: new Date().toISOString(),
    };

    return NextResponse.json(monthlyReportResponse);
  } catch (error) {
    console.error("Error generating user monthly report:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
