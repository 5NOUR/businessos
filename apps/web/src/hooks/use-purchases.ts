import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";

export interface PurchaseOrderItem {
  id: string;
  productId: string;
  product?: { name: string; sku: string };
  quantity: number;
  unitCost: number;
  totalCost?: number;
}

export interface PurchaseOrder {
  id: string;
  supplierId: string;
  supplier?: { name: string };
  status: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  items: PurchaseOrderItem[];
}

export interface PurchaseOrdersResponse {
  items: PurchaseOrder[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export function usePurchaseOrders(orgId: string | null, query: any) {
  const searchParams = new URLSearchParams();
  if (query.supplierId) searchParams.set("supplierId", query.supplierId);
  if (query.status) searchParams.set("status", query.status);
  if (query.page) searchParams.set("page", String(query.page));
  if (query.limit) searchParams.set("limit", String(query.limit));

  return useQuery<PurchaseOrdersResponse>({
    queryKey: ["purchases", orgId, query],
    queryFn: () =>
      apiFetch(`/purchases?${searchParams.toString()}`, {
        headers: { "x-organization-id": orgId || "" },
      }),
    enabled: !!orgId,
  });
}

export function useCreatePurchaseOrder(orgId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) =>
      apiFetch("/purchases", {
        method: "POST",
        headers: {
          "x-organization-id": orgId || "",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["purchases", orgId] }),
  });
}

export function useReceivePurchaseOrder(orgId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch(`/purchases/${id}/receive`, {
        method: "POST",
        headers: { "x-organization-id": orgId || "" },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchases", orgId] });
      queryClient.invalidateQueries({ queryKey: ["products", orgId] }); // لأن المخزون تغير
    },
  });
}
