import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";

export interface Plan {
  id: string;
  name: string;
  displayName: string;
  description?: string;
  price: number;
  maxUsers: number;
  maxCustomers: number;
  maxProducts: number;
  maxOrders: number;
}

export interface Subscription {
  id: string;
  organizationId: string;
  planId: string;
  plan: Plan;
  status: string;
  startDate: string;
  renewalDate?: string;
  cancelledAt?: string;
}

export function useCurrentSubscription(orgId: string | null) {
  return useQuery<Subscription>({
    queryKey: ["subscription", "current", orgId],
    queryFn: () =>
      apiFetch("/subscriptions/current", {
        headers: { "x-organization-id": orgId || "" },
      }),
    enabled: !!orgId,
  });
}

export function usePlans() {
  return useQuery<Plan[]>({
    queryKey: ["plans"],
    queryFn: () => apiFetch("/plans"),
  });
}

export function useUpdateSubscription(orgId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) =>
      apiFetch("/subscriptions/update", {
        method: "PATCH",
        headers: {
          "x-organization-id": orgId || "",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["subscription", "current", orgId],
      });
    },
  });
}

export function useCancelSubscription(orgId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () =>
      apiFetch("/subscriptions/cancel", {
        method: "POST",
        headers: { "x-organization-id": orgId || "" },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["subscription", "current", orgId],
      });
    },
  });
}
