import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";

export interface LeaveRequest {
  id: string;
  employeeId: string;
  type: string;
  startDate: string;
  endDate: string;
  status: string;
  reason?: string;
  employee?: {
    member?: {
      user?: {
        name?: string;
      };
    };
  };
  createdAt: string;
  reviewedAt?: string;
}

export function useLeaves(
  orgId: string | null,
  filters: { status?: string; employeeId?: string } = {},
) {
  const searchParams = new URLSearchParams();
  if (filters.status) searchParams.set("status", filters.status);
  if (filters.employeeId) searchParams.set("employeeId", filters.employeeId);

  return useQuery<LeaveRequest[]>({
    queryKey: ["leaves", orgId, filters],
    queryFn: () =>
      apiFetch(`/leaves?${searchParams.toString()}`, {
        headers: { "x-organization-id": orgId || "" },
      }),
    enabled: !!orgId,
  });
}

export function useCreateLeave(orgId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) =>
      apiFetch("/leaves", {
        method: "POST",
        headers: {
          "x-organization-id": orgId || "",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leaves", orgId] });
      queryClient.invalidateQueries({ queryKey: ["employee", orgId] });
    },
  });
}

export function useUpdateLeaveStatus(orgId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      apiFetch(`/leaves/${id}/status`, {
        method: "PATCH",
        headers: {
          "x-organization-id": orgId || "",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leaves", orgId] });
      queryClient.invalidateQueries({ queryKey: ["employee", orgId] });
    },
  });
}
