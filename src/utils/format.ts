export function formatPrice(value: number | null | undefined, currency = 'USD'): string {
  if (value === null || value === undefined || Number.isNaN(value)) return '—';
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatChange(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return '—';
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}`;
}

export function formatPercent(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return '—';
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
}

export function formatNumber(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return '—';
  return new Intl.NumberFormat('de-DE').format(value);
}

export function formatMarketCap(value: number | null | undefined): string {
  if (!value) return '—';
  // Finnhub liefert MarketCap in Mio. USD
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(2)} Bio`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(2)} Mrd`;
  return `${value.toFixed(2)} Mio`;
}
