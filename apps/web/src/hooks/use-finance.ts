import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";

export interface Income {
  id: string;
  category: string;
  description: string;
  amount: number;
  date: string;
  createdAt: string;
}

export interface Expense {
  id: string;
  category: string;
  description: string;
  amount: number;
  date: string;
  createdAt: string;
}

export interface FinanceSummary {
  totalIncome: number;
  totalExpenses: number;
  netProfit: number;
}

export function useIncomes(orgId: string | null, query: any) {
  const searchParams = new URLSearchParams();
  if (query.page) searchParams.set("page", String(query.page));
  if (query.limit) searchParams.set("limit", String(query.limit));
  if (query.startDate) searchParams.set("startDate", query.startDate);
  if (query.endDate) searchParams.set("endDate", query.endDate);

  return useQuery<{ items: Income[]; meta: any }>({
    queryKey: ["incomes", orgId, query],
    queryFn: () =>
      apiFetch(`/incomes?${searchParams.toString()}`, {
        headers: { "x-organization-id": orgId || "" },
      }),
    enabled: !!orgId,
  });
}

export function useExpenses(orgId: string | null, query: any) {
  const searchParams = new URLSearchParams();
  if (query.page) searchParams.set("page", String(query.page));
  if (query.limit) searchParams.set("limit", String(query.limit));
  if (query.startDate) searchParams.set("startDate", query.startDate);
  if (query.endDate) searchParams.set("endDate", query.endDate);

  return useQuery<{ items: Expense[]; meta: any }>({
    queryKey: ["expenses", orgId, query],
    queryFn: () =>
      apiFetch(`/expenses?${searchParams.toString()}`, {
        headers: { "x-organization-id": orgId || "" },
      }),
    enabled: !!orgId,
  });
}

export function useFinanceSummary(
  orgId: string | null,
  startDate?: string,
  endDate?: string,
) {
  const params = new URLSearchParams();
  if (startDate) params.set("startDate", startDate);
  if (endDate) params.set("endDate", endDate);

  return useQuery<FinanceSummary>({
    queryKey: ["finance-summary", orgId, startDate, endDate],
    queryFn: () =>
      apiFetch(`/finance/summary?${params.toString()}`, {
        headers: { "x-organization-id": orgId || "" },
      }),
    enabled: !!orgId,
  });
}

export function useCreateIncome(orgId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) =>
      apiFetch("/incomes", {
        method: "POST",
        headers: {
          "x-organization-id": orgId || "",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["incomes", orgId] });
      queryClient.invalidateQueries({ queryKey: ["finance-summary", orgId] });
    },
  });
}

export function useCreateExpense(orgId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) =>
      apiFetch("/expenses", {
        method: "POST",
        headers: {
          "x-organization-id": orgId || "",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses", orgId] });
      queryClient.invalidateQueries({ queryKey: ["finance-summary", orgId] });
    },
  });
}
