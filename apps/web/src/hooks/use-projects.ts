import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";

export interface Project {
  id: string;
  name: string;
  description?: string;
  status: string;
  startDate?: string;
  dueDate?: string;
  createdAt: string;
  members?: any[];
  tasks?: any[];
}

export function useProjects(orgId: string | null, query: any) {
  const searchParams = new URLSearchParams();
  if (query.search) searchParams.set("search", query.search);
  if (query.status) searchParams.set("status", query.status);
  if (query.page) searchParams.set("page", String(query.page));
  if (query.limit) searchParams.set("limit", String(query.limit));

  return useQuery<{ items: Project[]; meta: any }>({
    queryKey: ["projects", orgId, query],
    queryFn: () =>
      apiFetch(`/projects?${searchParams.toString()}`, {
        headers: { "x-organization-id": orgId || "" },
      }),
    enabled: !!orgId,
  });
}

export function useProject(orgId: string | null, id: string | undefined) {
  return useQuery<Project>({
    queryKey: ["project", orgId, id],
    queryFn: () =>
      apiFetch(`/projects/${id}`, {
        headers: { "x-organization-id": orgId || "" },
      }),
    enabled: !!orgId && !!id,
  });
}

export function useCreateProject(orgId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) =>
      apiFetch("/projects", {
        method: "POST",
        headers: {
          "x-organization-id": orgId || "",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["projects", orgId] }),
  });
}

export function useUpdateProject(orgId: string | null, id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) =>
      apiFetch(`/projects/${id}`, {
        method: "PATCH",
        headers: {
          "x-organization-id": orgId || "",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects", orgId] });
      queryClient.invalidateQueries({ queryKey: ["project", orgId, id] });
    },
  });
}

export function useDeleteProject(orgId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch(`/projects/${id}`, {
        method: "DELETE",
        headers: { "x-organization-id": orgId || "" },
      }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["projects", orgId] }),
  });
}
