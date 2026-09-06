import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";

export interface Product {
  id: string;
  name: string;
  sku: string;
  description?: string;
  sellingPrice: number;
  costPrice: number;
  currentStock: number;
  minimumStock: number;
  imageUrl?: string;
  status: string;
  categoryId?: string;
  supplierId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductsResponse {
  items: Product[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
export interface InventoryMovement {
  id: string;
  productId: string;
  type: string;
  quantity: number;
  referenceType?: string;
  referenceId?: string;
  note?: string;
  createdAt: string;
}
export function useProducts(orgId: string | null, query: any) {
  const searchParams = new URLSearchParams();
  if (query.search) searchParams.set("search", query.search);
  if (query.categoryId) searchParams.set("categoryId", query.categoryId);
  if (query.page) searchParams.set("page", String(query.page));
  if (query.limit) searchParams.set("limit", String(query.limit));

  return useQuery<ProductsResponse>({
    queryKey: ["products", orgId, query],
    queryFn: () =>
      apiFetch(`/products?${searchParams.toString()}`, {
        headers: { "x-organization-id": orgId || "" },
      }),
    enabled: !!orgId,
  });
}

export function useProduct(orgId: string | null, id: string | undefined) {
  return useQuery<Product>({
    queryKey: ["product", orgId, id],
    queryFn: () =>
      apiFetch(`/products/${id}`, {
        headers: { "x-organization-id": orgId || "" },
      }),
    enabled: !!orgId && !!id,
  });
}

export function useCreateProduct(orgId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) =>
      apiFetch("/products", {
        method: "POST",
        headers: {
          "x-organization-id": orgId || "",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["products", orgId] }),
  });
}

export function useUpdateProduct(orgId: string | null, id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) =>
      apiFetch(`/products/${id}`, {
        method: "PATCH",
        headers: {
          "x-organization-id": orgId || "",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products", orgId] });
      queryClient.invalidateQueries({ queryKey: ["product", orgId, id] });
    },
  });
}

export function useDeleteProduct(orgId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch(`/products/${id}`, {
        method: "DELETE",
        headers: { "x-organization-id": orgId || "" },
      }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["products", orgId] }),
  });
}

// Inventory hooks
export function useCreateMovement(orgId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) =>
      apiFetch("/inventory/movements", {
        method: "POST",
        headers: {
          "x-organization-id": orgId || "",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products", orgId] });
      queryClient.invalidateQueries({
        queryKey: ["inventory-movements", orgId],
      });
    },
  });
}

export function useMovementsForProduct(
  orgId: string | null,
  productId: string | undefined,
) {
  return useQuery<InventoryMovement[]>({
    queryKey: ["inventory-movements", orgId, productId],
    queryFn: () =>
      apiFetch<InventoryMovement[]>(
        `/inventory/movements/product/${productId}`,
        {
          headers: { "x-organization-id": orgId || "" },
        },
      ),
    enabled: !!orgId && !!productId,
  });
}
