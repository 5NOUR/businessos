export function formatMoney(
  amount: number,
  currency: string = "EGP",
  locale: string = "en",
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(amount);
}

export function convertAmount(
  amount: number,
  from: string,
  to: string,
  rates: Record<string, number>,
): number {
  if (!rates[from] || !rates[to]) return amount;
  const baseAmount = amount / rates[from];
  return baseAmount * rates[to];
}
