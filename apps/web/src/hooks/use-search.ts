import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";

export function useSearch(
  orgId: string | null,
  query: string,
  entity: string = "all",
  page: number = 1,
) {
  const searchParams = new URLSearchParams();
  if (query.trim()) {
    searchParams.set("query", query);
  }
  if (entity && entity !== "all") searchParams.set("entity", entity);
  searchParams.set("page", String(page));
  searchParams.set("limit", "5");

  return useQuery<any>({
    queryKey: ["search", orgId, query, entity, page],
    queryFn: () =>
      apiFetch(`/search?${searchParams.toString()}`, {
        headers: { "x-organization-id": orgId || "" },
      }),
    enabled: !!orgId && query.trim().length > 2, // يتطلب 3 أحرف على الأقل
  });
}
