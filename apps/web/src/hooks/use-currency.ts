import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";

export interface CurrencyConfig {
  currency: string;
  exchangeRates: Record<string, number>;
}

export function useCurrencyConfig(orgId: string | null) {
  return useQuery<CurrencyConfig>({
    queryKey: ["currency-config", orgId],
    queryFn: () =>
      apiFetch("/currency/config", {
        headers: { "x-organization-id": orgId || "" },
      }),
    enabled: !!orgId,
  });
}
