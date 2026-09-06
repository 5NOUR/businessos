import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";

export interface Employee {
  id: string;
  memberId: string;
  position?: string;
  department?: string;
  salary?: number;
  joinDate?: string;
  status: string;
  member?: { user?: { name?: string; email?: string } };
  createdAt: string;
}

export function useEmployees(orgId: string | null, query: any) {
  const searchParams = new URLSearchParams();
  if (query.search) searchParams.set("search", query.search);
  if (query.department) searchParams.set("department", query.department);
  if (query.page) searchParams.set("page", String(query.page));
  if (query.limit) searchParams.set("limit", String(query.limit));

  return useQuery<{ items: Employee[]; meta: any }>({
    queryKey: ["employees", orgId, query],
    queryFn: () =>
      apiFetch(`/employees?${searchParams.toString()}`, {
        headers: { "x-organization-id": orgId || "" },
      }),
    enabled: !!orgId,
  });
}

export function useEmployee(orgId: string | null, id: string | undefined) {
  return useQuery<Employee>({
    queryKey: ["employee", orgId, id],
    queryFn: () =>
      apiFetch(`/employees/${id}`, {
        headers: { "x-organization-id": orgId || "" },
      }),
    enabled: !!orgId && !!id,
  });
}

export function useCreateEmployee(orgId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) =>
      apiFetch("/employees", {
        method: "POST",
        headers: {
          "x-organization-id": orgId || "",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["employees", orgId] }),
  });
}
