import { useEffect, useState } from 'react';
import { getCompanyProfile, getQuote } from '../api/finnhub';
import type { CompanyProfile, Quote } from '../types/finnhub';

export interface WatchlistEntry {
  symbol: string;
  quote: Quote | null;
  profile: CompanyProfile | null;
  error: boolean;
}

/**
 * Lädt Quote + Profile für alle Symbole. Aktualisiert alle 30s.
 * Profile werden gecached (ändern sich praktisch nie).
 */
export function useWatchlistQuotes(symbols: string[]) {
  const [data, setData] = useState<Record<string, WatchlistEntry>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadAll() {
      const results = await Promise.all(
        symbols.map(async (symbol): Promise<WatchlistEntry> => {
          try {
            const [quote, profile] = await Promise.all([
              getQuote(symbol),
              getCompanyProfile(symbol).catch(() => ({} as CompanyProfile)),
            ]);
            return { symbol, quote, profile, error: false };
          } catch {
            return { symbol, quote: null, profile: null, error: true };
          }
        })
      );

      if (cancelled) return;

      const map: Record<string, WatchlistEntry> = {};
      results.forEach((r) => {
        map[r.symbol] = r;
      });
      setData(map);
      setLoading(false);
    }

    setLoading(true);
    loadAll();
    const interval = setInterval(loadAll, 30_000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [symbols.join(',')]);

  return { data, loading };
}
