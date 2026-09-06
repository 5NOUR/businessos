import { useState } from "react";
import {
  useDashboardSummary,
  useDashboardCharts,
  useRecentActivities,
} from "@/hooks/use-dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// مكون Skeleton بسيط
function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-gray-200 rounded ${className}`} />;
}

// تنسيق العملة
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "EGP",
  }).format(value);
};

export function DashboardPage() {
  const orgId = localStorage.getItem("currentOrgId");
  const [period, setPeriod] = useState<"week" | "month" | "year">("month");

  const summaryQuery = useDashboardSummary(orgId);
  const chartsQuery = useDashboardCharts(orgId, period);
  const activitiesQuery = useRecentActivities(orgId);

  // عرض حالة التحميل
  if (
    summaryQuery.isLoading ||
    chartsQuery.isLoading ||
    activitiesQuery.isLoading
  ) {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-64" />
        <Skeleton className="h-48" />
      </div>
    );
  }

  // عرض حالة الخطأ
  if (summaryQuery.isError || chartsQuery.isError || activitiesQuery.isError) {
    return (
      <div className="text-red-500">
        Error loading dashboard data. Please check if the backend is running.
      </div>
    );
  }

  // التحقق من وجود البيانات
  if (!summaryQuery.data || !chartsQuery.data || !activitiesQuery.data) {
    return <div className="text-gray-500">No data available.</div>;
  }

  const summary = summaryQuery.data;
  const chartData = chartsQuery.data;
  const activities = activitiesQuery.data;

  // إذا لم يتم اختيار منظمة، نعرض رسالة
  if (!orgId) {
    return (
      <div className="text-center text-gray-500">
        Please select an organization to view dashboard.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Revenue (Month)
            </CardTitle>
            <Badge variant="success">+12%</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(summary.revenueThisMonth)}
            </div>
            <p className="text-xs text-muted-foreground">
              vs {formatCurrency(summary.revenueThisYear)} this year
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Expenses (Month)
            </CardTitle>
            <Badge variant="warning">+5%</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(summary.expensesThisMonth)}
            </div>
            <p className="text-xs text-muted-foreground">
              vs {formatCurrency(summary.expensesThisYear)} this year
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Profit (Month)
            </CardTitle>
            <Badge variant="success">+8%</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(summary.profitThisMonth)}
            </div>
            <p className="text-xs text-muted-foreground">
              Net profit this month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Orders</CardTitle>
            <Badge variant="secondary">{summary.ordersCount}</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.ordersCount}</div>
            <p className="text-xs text-muted-foreground">Total orders</p>
          </CardContent>
        </Card>
      </div>

      {/* Low stock and tasks */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Low Stock Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{summary.lowStockCount}</div>
            <p className="text-sm text-muted-foreground">
              Products below minimum stock
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Pending Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">
              {summary.pendingTasksCount}
            </div>
            <p className="text-sm text-muted-foreground">Tasks not yet done</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Revenue vs Expenses</CardTitle>
          <div className="flex gap-2">
            {(["week", "month", "year"] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1 text-sm rounded-md ${
                  period === p
                    ? "bg-primary text-white"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={chartData.labels.map((label, i) => ({
                name: label,
                revenue: chartData.revenueData[i]?.value || 0,
                expenses: chartData.expenseData[i]?.value || 0,
              }))}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="revenue" fill="#4f46e5" name="Revenue" />
              <Bar dataKey="expenses" fill="#ef4444" name="Expenses" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Recent Activities */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activities</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {activities.map((activity) => (
              <li
                key={activity.id}
                className="flex items-center justify-between text-sm border-b pb-2"
              >
                <span>
                  <strong>{activity.actorName}</strong> {activity.action}{" "}
                  {activity.entity} {activity.entityId}
                </span>
                <span className="text-xs text-gray-500">
                  {new Date(activity.createdAt).toLocaleString()}
                </span>
              </li>
            ))}
            {activities.length === 0 && (
              <li className="text-gray-500 text-center">
                No recent activities
              </li>
            )}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
