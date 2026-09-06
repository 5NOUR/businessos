import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";

export interface Supplier {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SuppliersResponse {
  items: Supplier[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export function useSuppliers(orgId: string | null, query: any) {
  const searchParams = new URLSearchParams();
  if (query.search) searchParams.set("search", query.search);
  if (query.page) searchParams.set("page", String(query.page));
  if (query.limit) searchParams.set("limit", String(query.limit));

  return useQuery<SuppliersResponse>({
    queryKey: ["suppliers", orgId, query],
    queryFn: () =>
      apiFetch(`/suppliers?${searchParams.toString()}`, {
        headers: { "x-organization-id": orgId || "" },
      }),
    enabled: !!orgId,
  });
}

export function useSupplier(orgId: string | null, id: string | undefined) {
  return useQuery<Supplier>({
    queryKey: ["supplier", orgId, id],
    queryFn: () =>
      apiFetch(`/suppliers/${id}`, {
        headers: { "x-organization-id": orgId || "" },
      }),
    enabled: !!orgId && !!id,
  });
}

export function useCreateSupplier(orgId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) =>
      apiFetch("/suppliers", {
        method: "POST",
        headers: {
          "x-organization-id": orgId || "",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["suppliers", orgId] }),
  });
}

export function useUpdateSupplier(orgId: string | null, id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) =>
      apiFetch(`/suppliers/${id}`, {
        method: "PATCH",
        headers: {
          "x-organization-id": orgId || "",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers", orgId] });
      queryClient.invalidateQueries({ queryKey: ["supplier", orgId, id] });
    },
  });
}

export function useDeleteSupplier(orgId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch(`/suppliers/${id}`, {
        method: "DELETE",
        headers: { "x-organization-id": orgId || "" },
      }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["suppliers", orgId] }),
  });
}
