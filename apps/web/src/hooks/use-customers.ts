import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";

export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  address?: string;
  tags: string[];
  notes?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface CustomersResponse {
  items: Customer[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export function useCustomers(orgId: string | null, query: any) {
  const searchParams = new URLSearchParams();
  if (query.search) searchParams.set("search", query.search);
  if (query.status) searchParams.set("status", query.status);
  if (query.sortBy) searchParams.set("sortBy", query.sortBy);
  if (query.sortOrder) searchParams.set("sortOrder", query.sortOrder);
  if (query.page) searchParams.set("page", String(query.page));
  if (query.limit) searchParams.set("limit", String(query.limit));

  return useQuery<CustomersResponse>({
    queryKey: ["customers", orgId, query],
    queryFn: () =>
      apiFetch(`/customers?${searchParams.toString()}`, {
        headers: { "x-organization-id": orgId || "" },
      }),
    enabled: !!orgId,
  });
}

export function useCustomer(orgId: string | null, id: string | undefined) {
  return useQuery<Customer>({
    queryKey: ["customer", orgId, id],
    queryFn: () =>
      apiFetch(`/customers/${id}`, {
        headers: { "x-organization-id": orgId || "" },
      }),
    enabled: !!orgId && !!id,
  });
}

export function useCreateCustomer(orgId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) =>
      apiFetch("/customers", {
        method: "POST",
        headers: {
          "x-organization-id": orgId || "",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers", orgId] });
    },
  });
}

export function useUpdateCustomer(orgId: string | null, id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) =>
      apiFetch(`/customers/${id}`, {
        method: "PATCH",
        headers: {
          "x-organization-id": orgId || "",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers", orgId] });
      queryClient.invalidateQueries({ queryKey: ["customer", orgId, id] });
    },
  });
}

export function useDeleteCustomer(orgId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch(`/customers/${id}`, {
        method: "DELETE",
        headers: { "x-organization-id": orgId || "" },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers", orgId] });
    },
  });
}
