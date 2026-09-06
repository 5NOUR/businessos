import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";

export interface Attendance {
  id: string;
  employeeId: string;
  date: string;
  status: string;
  checkIn?: string;
  checkOut?: string;
  notes?: string;
  employee?: {
    member?: {
      user?: {
        name?: string;
      };
    };
  };
  createdAt: string;
}

export function useAttendanceList(
  orgId: string | null,
  filters: { employeeId?: string; startDate?: string; endDate?: string } = {},
) {
  const searchParams = new URLSearchParams();
  if (filters.employeeId) searchParams.set("employeeId", filters.employeeId);
  if (filters.startDate) searchParams.set("startDate", filters.startDate);
  if (filters.endDate) searchParams.set("endDate", filters.endDate);

  return useQuery<Attendance[]>({
    queryKey: ["attendance", orgId, filters],
    queryFn: () =>
      apiFetch(`/attendance?${searchParams.toString()}`, {
        headers: { "x-organization-id": orgId || "" },
      }),
    enabled: !!orgId,
  });
}

export function useCreateAttendance(orgId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) =>
      apiFetch("/attendance", {
        method: "POST",
        headers: {
          "x-organization-id": orgId || "",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance", orgId] });
      queryClient.invalidateQueries({ queryKey: ["employee", orgId] });
    },
  });
}
