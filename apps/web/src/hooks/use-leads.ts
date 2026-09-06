import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";

export interface Lead {
  id: string;
  customerId: string;
  customer: { id: string; name: string };
  title: string;
  description?: string;
  value: number;
  stage: string;
  assignedToId?: string;
  expectedCloseDate?: string;
  probability?: number;
  createdAt: string;
  updatedAt: string;
}

export const LEAD_STAGES = [
  "NEW",
  "CONTACTED",
  "QUALIFIED",
  "PROPOSAL",
  "NEGOTIATION",
  "WON",
  "LOST",
];

export function useLeads(orgId: string | null) {
  return useQuery<{ items: Lead[] }>({
    queryKey: ["leads", orgId],
    queryFn: () =>
      apiFetch(`/leads?limit=100`, {
        headers: { "x-organization-id": orgId || "" },
      }),
    enabled: !!orgId,
  });
}

export function useCreateLead(orgId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) =>
      apiFetch("/leads", {
        method: "POST",
        headers: {
          "x-organization-id": orgId || "",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["leads", orgId] }),
  });
}

export function useUpdateLeadStage(orgId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, stage }: { id: string; stage: string }) =>
      apiFetch(`/leads/${id}/stage`, {
        method: "PATCH",
        headers: {
          "x-organization-id": orgId || "",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ stage }),
      }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["leads", orgId] }),
  });
}

export function useUpdateLead(orgId: string | null, id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) =>
      apiFetch(`/leads/${id}`, {
        method: "PATCH",
        headers: {
          "x-organization-id": orgId || "",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["leads", orgId] }),
  });
}

export function useDeleteLead(orgId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch(`/leads/${id}`, {
        method: "DELETE",
        headers: { "x-organization-id": orgId || "" },
      }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["leads", orgId] }),
  });
}
