import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";

export interface AuditLog {
  id: string;
  actorId: string;
  actor?: { name?: string; email?: string };
  action: string;
  entity: string;
  entityId: string;
  metadata?: any;
  createdAt: string;
}

export function useAuditLogs(orgId: string | null, query: any = {}) {
  const searchParams = new URLSearchParams();
  if (query.entity) searchParams.set("entity", query.entity);
  if (query.action) searchParams.set("action", query.action);
  if (query.startDate) searchParams.set("startDate", query.startDate);
  if (query.endDate) searchParams.set("endDate", query.endDate);
  if (query.page) searchParams.set("page", String(query.page));
  if (query.limit) searchParams.set("limit", String(query.limit));

  return useQuery<{ items: AuditLog[]; meta: any }>({
    queryKey: ["audit-logs", orgId, query],
    queryFn: () =>
      apiFetch(`/audit-logs?${searchParams.toString()}`, {
        headers: { "x-organization-id": orgId || "" },
      }),
    enabled: !!orgId,
  });
}
