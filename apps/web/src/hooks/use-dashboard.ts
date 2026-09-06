import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";

interface DashboardSummary {
  revenueThisMonth: number;
  expensesThisMonth: number;
  profitThisMonth: number;
  revenueThisYear: number;
  expensesThisYear: number;
  profitThisYear: number;
  ordersCount: number;
  customersCount: number;
  lowStockCount: number;
  pendingTasksCount: number;
}

interface ChartData {
  labels: string[];
  revenueData: { label: string; value: number }[];
  expenseData: { label: string; value: number }[];
}

interface RecentActivity {
  id: string;
  action: string;
  entity: string;
  entityId: string;
  metadata: any;
  actorName: string;
  createdAt: string;
}

export function useDashboardSummary(orgId: string | null) {
  return useQuery<DashboardSummary>({
    queryKey: ["dashboard", "summary", orgId],
    queryFn: () =>
      apiFetch(`/dashboard/summary`, {
        headers: { "x-organization-id": orgId || "" },
      }),
    enabled: !!orgId,
  });
}

export function useDashboardCharts(
  orgId: string | null,
  period: "week" | "month" | "year" = "month",
) {
  return useQuery<ChartData>({
    queryKey: ["dashboard", "charts", orgId, period],
    queryFn: () =>
      apiFetch(`/dashboard/charts?period=${period}`, {
        headers: { "x-organization-id": orgId || "" },
      }),
    enabled: !!orgId,
  });
}

export function useRecentActivities(orgId: string | null) {
  return useQuery<RecentActivity[]>({
    queryKey: ["dashboard", "activities", orgId],
    queryFn: () =>
      apiFetch(`/dashboard/recent-activities`, {
        headers: { "x-organization-id": orgId || "" },
      }),
    enabled: !!orgId,
  });
}
