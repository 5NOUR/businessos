import { useState } from "react";
import {
  useIncomes,
  useExpenses,
  useFinanceSummary,
} from "@/hooks/use-finance";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Plus } from "lucide-react";
import { IncomeForm } from "@/components/finance/income-form";
import { ExpenseForm } from "@/components/finance/expense-form";

export function FinancePage() {
  const orgId = localStorage.getItem("currentOrgId");
  const [showIncomeForm, setShowIncomeForm] = useState(false);
  const [showExpenseForm, setShowExpenseForm] = useState(false);

  const { data: summary, isLoading: summaryLoading } = useFinanceSummary(orgId);
  const { data: incomes, isLoading: incomesLoading } = useIncomes(orgId, {
    page: 1,
    limit: 10,
  });
  const { data: expenses, isLoading: expensesLoading } = useExpenses(orgId, {
    page: 1,
    limit: 10,
  });

  if (!orgId) return <div>Please select an organization</div>;
  if (summaryLoading || incomesLoading || expensesLoading)
    return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Finance</h1>
        <div className="flex gap-2">
          <Button onClick={() => setShowIncomeForm(true)}>
            <Plus className="h-4 w-4 mr-2" /> Add Income
          </Button>
          <Button onClick={() => setShowExpenseForm(true)} variant="outline">
            <Plus className="h-4 w-4 mr-2" /> Add Expense
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Total Income</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">
            {summary?.totalIncome ?? 0}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Expenses</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">
            {summary?.totalExpenses ?? 0}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Net Profit</CardTitle>
          </CardHeader>
          <CardContent
            className={`text-2xl font-bold ${(summary?.netProfit ?? 0) >= 0 ? "text-green-600" : "text-red-600"}`}
          >
            {summary?.netProfit ?? 0}
          </CardContent>
        </Card>
      </div>

      {/* Incomes Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Incomes</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {incomes?.items.map((income) => (
                <TableRow key={income.id}>
                  <TableCell>{income.category}</TableCell>
                  <TableCell>{income.description}</TableCell>
                  <TableCell className="text-green-600">
                    {income.amount}
                  </TableCell>
                  <TableCell>
                    {new Date(income.date).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
              {incomes?.items.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-gray-500">
                    No incomes
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Expenses Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenses?.items.map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell>{expense.category}</TableCell>
                  <TableCell>{expense.description}</TableCell>
                  <TableCell className="text-red-600">
                    {expense.amount}
                  </TableCell>
                  <TableCell>
                    {new Date(expense.date).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
              {expenses?.items.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-gray-500">
                    No expenses
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {showIncomeForm && (
        <IncomeForm orgId={orgId} onClose={() => setShowIncomeForm(false)} />
      )}
      {showExpenseForm && (
        <ExpenseForm orgId={orgId} onClose={() => setShowExpenseForm(false)} />
      )}
    </div>
  );
}
