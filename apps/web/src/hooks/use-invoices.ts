import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";

export interface InvoiceItem {
  id: string;
  productId?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  total: number;
}

export interface Invoice {
  id: string;
  customerId: string;
  customer?: { name: string };
  invoiceNumber: string;
  status: string;
  paymentStatus: string;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  dueDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  items: InvoiceItem[];
  payments?: any[];
}

export interface InvoicesResponse {
  items: Invoice[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export function useInvoices(orgId: string | null, query: any) {
  const searchParams = new URLSearchParams();
  if (query.customerId) searchParams.set("customerId", query.customerId);
  if (query.status) searchParams.set("status", query.status);
  if (query.page) searchParams.set("page", String(query.page));
  if (query.limit) searchParams.set("limit", String(query.limit));

  return useQuery<InvoicesResponse>({
    queryKey: ["invoices", orgId, query],
    queryFn: () =>
      apiFetch(`/invoices?${searchParams.toString()}`, {
        headers: { "x-organization-id": orgId || "" },
      }),
    enabled: !!orgId,
  });
}

export function useInvoice(orgId: string | null, id: string | undefined) {
  return useQuery<Invoice>({
    queryKey: ["invoice", orgId, id],
    queryFn: () =>
      apiFetch(`/invoices/${id}`, {
        headers: { "x-organization-id": orgId || "" },
      }),
    enabled: !!orgId && !!id,
  });
}

export function useCreateInvoice(orgId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) =>
      apiFetch("/invoices", {
        method: "POST",
        headers: {
          "x-organization-id": orgId || "",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["invoices", orgId] }),
  });
}

export function useUpdateInvoice(orgId: string | null, id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) =>
      apiFetch(`/invoices/${id}`, {
        method: "PATCH",
        headers: {
          "x-organization-id": orgId || "",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices", orgId] });
      queryClient.invalidateQueries({ queryKey: ["invoice", orgId, id] });
    },
  });
}

export function useDeleteInvoice(orgId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch(`/invoices/${id}`, {
        method: "DELETE",
        headers: { "x-organization-id": orgId || "" },
      }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["invoices", orgId] }),
  });
}
