import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";

export function useReport(orgId: string | null, query: any) {
  const searchParams = new URLSearchParams();
  if (query.type) searchParams.set("type", query.type);
  if (query.startDate) searchParams.set("startDate", query.startDate);
  if (query.endDate) searchParams.set("endDate", query.endDate);

  return useQuery<any>({
    queryKey: ["report", orgId, query],
    queryFn: () =>
      apiFetch(`/reports?${searchParams.toString()}`, {
        headers: { "x-organization-id": orgId || "" },
      }),
    enabled: !!orgId && !!query.type,
  });
}
