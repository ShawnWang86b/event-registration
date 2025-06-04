# Monthly Report API Documentation

This API allows administrators to generate comprehensive monthly reports for users, including detailed transaction listings and aggregated statistics.

## API Endpoints

### 1. Generate Monthly Report
**GET** `/api/admin/users/[userId]/monthly-report`

Generate a detailed monthly report for a specific user.

#### Query Parameters
- `year` (optional): Year for the report (defaults to current year)
- `month` (optional): Month for the report 1-12 (defaults to current month)

#### Example Request
```bash
GET /api/admin/users/user_123/monthly-report?year=2024&month=12
```

#### Example Response
```json
{
  "success": true,
  "user": {
    "id": "user_123",
    "name": "John Doe",
    "email": "john@example.com",
    "currentBalance": 150.50
  },
  "reportPeriod": {
    "year": 2024,
    "month": 12,
    "monthName": "December",
    "startDate": "2024-12-01T00:00:00.000Z",
    "endDate": "2024-12-31T23:59:59.999Z"
  },
  "summary": {
    "openingBalance": 100.00,
    "closingBalance": 150.50,
    "totalDeposits": 200.00,
    "totalSpending": 149.50,
    "totalRefunds": 0.00,
    "totalAdjustments": 0.00,
    "netChange": 50.50,
    "transactionCount": 15
  },
  "transactions": [
    {
      "id": 1,
      "amount": 50.00,
      "balanceAfter": 150.00,
      "type": "deposit",
      "description": "Credit deposit",
      "createdAt": "2024-12-01T10:00:00.000Z",
      "formattedDate": "Dec 1, 2024, 10:00 AM"
    },
    {
      "id": 2,
      "amount": -25.00,
      "balanceAfter": 125.00,
      "type": "spend",
      "description": "Event fee deduction: Holiday Party",
      "createdAt": "2024-12-02T14:30:00.000Z",
      "eventId": 5,
      "eventTitle": "Holiday Party",
      "registrationId": 10,
      "formattedDate": "Dec 2, 2024, 02:30 PM"
    }
  ],
  "monthlyBalanceRecord": {
    "id": 1,
    "openingBalance": 100.00,
    "totalDeposits": 200.00,
    "totalSpending": 149.50,
    "totalRefunds": 0.00,
    "closingBalance": 150.50,
    "createdAt": "2024-12-31T23:59:59.000Z"
  },
  "generatedBy": "Admin User",
  "generatedAt": "2024-12-15T10:30:00.000Z"
}
```

### 2. Create Monthly Balance Record
**POST** `/api/admin/users/[userId]/monthly-report`

Create or update a monthly balance record for permanent storage.

#### Request Body
```json
{
  "year": 2024,
  "month": 12
}
```

#### Example Response
```json
{
  "success": true,
  "monthlyBalanceRecord": {
    "id": 1,
    "userId": "user_123",
    "month": 12,
    "year": 2024,
    "openingBalance": "100.00",
    "totalDeposits": "200.00",
    "totalSpending": "149.50",
    "totalRefunds": "0.00",
    "closingBalance": "150.50",
    "createdAt": "2024-12-31T23:59:59.000Z"
  },
  "summary": {
    "openingBalance": 100.00,
    "totalDeposits": 200.00,
    "totalSpending": 149.50,
    "totalRefunds": 0.00,
    "closingBalance": 150.50,
    "transactionCount": 15
  }
}
```

## Frontend Usage

### Using React Hooks

```tsx
import { useMonthlyReport, useCreateMonthlyBalance } from "@/hooks/use-admin";

function MonthlyReportComponent({ userId }: { userId: string }) {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;

  // Generate monthly report
  const { 
    data: report, 
    isLoading, 
    error 
  } = useMonthlyReport(userId, currentYear, currentMonth);

  // Create monthly balance record
  const createMonthlyBalance = useCreateMonthlyBalance();

  const handleCreateRecord = () => {
    createMonthlyBalance.mutate({
      userId,
      data: { year: currentYear, month: currentMonth }
    });
  };

  if (isLoading) return <div>Loading report...</div>;
  if (error) return <div>Error loading report</div>;
  if (!report) return <div>No report data</div>;

  return (
    <div>
      <h2>Monthly Report for {report.user.name}</h2>
      <h3>{report.reportPeriod.monthName} {report.reportPeriod.year}</h3>
      
      {/* Summary */}
      <div className="summary">
        <p>Opening Balance: ${report.summary.openingBalance.toFixed(2)}</p>
        <p>Closing Balance: ${report.summary.closingBalance.toFixed(2)}</p>
        <p>Total Deposits: ${report.summary.totalDeposits.toFixed(2)}</p>
        <p>Total Spending: ${report.summary.totalSpending.toFixed(2)}</p>
        <p>Net Change: ${report.summary.netChange.toFixed(2)}</p>
        <p>Transaction Count: {report.summary.transactionCount}</p>
      </div>

      {/* Transactions */}
      <div className="transactions">
        <h4>Transactions</h4>
        {report.transactions.map((transaction) => (
          <div key={transaction.id} className="transaction">
            <span>{transaction.formattedDate}</span>
            <span>{transaction.description}</span>
            <span>${transaction.amount.toFixed(2)}</span>
            <span>Balance: ${transaction.balanceAfter.toFixed(2)}</span>
            {transaction.eventTitle && (
              <span>Event: {transaction.eventTitle}</span>
            )}
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <button onClick={handleCreateRecord}>
        Create Monthly Record
      </button>
    </div>
  );
}
```

### Using API Services Directly

```tsx
import { api } from "@/lib/api-services";

// Generate report
const report = await api.admin.generateMonthlyReport("user_123", 2024, 12);

// Create monthly balance record
const balanceRecord = await api.admin.createMonthlyBalance("user_123", {
  year: 2024,
  month: 12
});
```

## Features

### 📊 **Comprehensive Reporting**
- **User Information**: Name, email, current balance
- **Report Period**: Year, month, date range
- **Transaction Details**: All transactions with event information
- **Aggregated Statistics**: Totals by transaction type

### 📈 **Transaction Categories**
- **Deposits**: Credit additions
- **Spending**: Event fees and charges
- **Refunds**: Returned credits
- **Admin Adjustments**: Manual balance changes
- **Monthly Snapshots**: End-of-month records

### 🔍 **Detailed Transaction Info**
- **Amount and Balance**: Transaction amount and resulting balance
- **Event Association**: Linked event information when applicable
- **Formatted Dates**: Human-readable timestamps
- **Descriptions**: Detailed transaction descriptions

### 💾 **Monthly Balance Records**
- **Permanent Storage**: Create persistent monthly summaries
- **Historical Tracking**: Maintain month-end balances
- **Audit Trail**: Track when records were created

### 🛡️ **Security Features**
- **Admin Only Access**: Restricted to administrators
- **User Validation**: Ensures target user exists
- **Input Validation**: Validates year/month parameters
- **Audit Logging**: Logs all report generation activities

## Use Cases

1. **Monthly User Statements**: Generate detailed monthly statements for users
2. **Financial Reconciliation**: Compare calculated vs recorded balances
3. **Audit Reports**: Detailed transaction history for compliance
4. **Billing Analysis**: Understand user spending patterns
5. **Account Management**: Review user activity and balance changes 