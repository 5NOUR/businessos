import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  dueDate?: string;
  createdAt: string;
  assignees?: any[];
}

export function useTasks(orgId: string | null, query: any = {}) {
  const searchParams = new URLSearchParams();
  if (query.projectId) searchParams.set("projectId", query.projectId);
  if (query.status) searchParams.set("status", query.status);
  if (query.priority) searchParams.set("priority", query.priority);
  if (query.page) searchParams.set("page", String(query.page));
  if (query.limit) searchParams.set("limit", String(query.limit));

  return useQuery<{ items: Task[]; meta: any }>({
    queryKey: ["tasks", orgId, query],
    queryFn: () =>
      apiFetch(`/tasks?${searchParams.toString()}`, {
        headers: { "x-organization-id": orgId || "" },
      }),
    enabled: !!orgId,
  });
}

export function useCreateTask(orgId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) =>
      apiFetch("/tasks", {
        method: "POST",
        headers: {
          "x-organization-id": orgId || "",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", orgId] });
      queryClient.invalidateQueries({ queryKey: ["project", orgId] });
    },
  });
}

export function useUpdateTaskStatus(orgId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      apiFetch(`/tasks/${id}/status`, {
        method: "PATCH",
        headers: {
          "x-organization-id": orgId || "",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", orgId] });
      queryClient.invalidateQueries({ queryKey: ["project", orgId] });
    },
  });
}
