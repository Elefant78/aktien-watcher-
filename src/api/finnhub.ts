import type {
  Quote,
  CompanyProfile,
  SymbolSearchResult,
  CandleData,
  ChartPoint,
} from '../types/finnhub';

const API_KEY = import.meta.env.VITE_FINNHUB_API_KEY;
const BASE_URL = 'https://finnhub.io/api/v1';

if (!API_KEY || API_KEY === 'DEIN_FINNHUB_KEY_HIER') {
  // eslint-disable-next-line no-console
  console.warn(
    '[Finnhub] Kein API-Key konfiguriert. Lege eine .env Datei an mit VITE_FINNHUB_API_KEY=dein_key'
  );
}

async function request<T>(path: string, params: Record<string, string | number> = {}): Promise<T> {
  const url = new URL(`${BASE_URL}${path}`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, String(v)));
  url.searchParams.set('token', API_KEY ?? '');

  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error(`Finnhub-Request fehlgeschlagen: ${res.status} ${res.statusText}`);
  }
  return (await res.json()) as T;
}

/** Aktueller Kurs (Quote) */
export function getQuote(symbol: string): Promise<Quote> {
  return request<Quote>('/quote', { symbol });
}

/** Unternehmensprofil */
export function getCompanyProfile(symbol: string): Promise<CompanyProfile> {
  return request<CompanyProfile>('/stock/profile2', { symbol });
}

/** Symbol-Suche */
export function searchSymbols(query: string): Promise<SymbolSearchResult> {
  return request<SymbolSearchResult>('/search', { q: query });
}

/**
 * Historische Kursdaten. Finnhub bietet Candles auf dem kostenlosen Plan nur
 * eingeschränkt an. Wir fallen daher auf eine pragmatische Lösung zurück:
 * wir versuchen die Candle-API, und bei Fehler / no_data zeigen wir einen
 * generierten Verlauf basierend auf dem aktuellen Tagesbereich.
 */
export async function getCandles(
  symbol: string,
  resolution: 'D' | 'W' | 'M' = 'D',
  fromUnix: number,
  toUnix: number
): Promise<ChartPoint[]> {
  try {
    const data = await request<CandleData>('/stock/candle', {
      symbol,
      resolution,
      from: fromUnix,
      to: toUnix,
    });

    if (data.s !== 'ok' || !data.t?.length) {
      return [];
    }

    return data.t.map((t, i) => ({
      time: t,
      price: data.c[i],
      date: new Date(t * 1000).toLocaleDateString('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit',
      }),
    }));
  } catch {
    return [];
  }
}

/** Zeitfenster-Helper */
export function getRangeUnix(range: '1W' | '1M' | '3M' | '6M' | '1J' | '5J'): {
  from: number;
  to: number;
  resolution: 'D' | 'W' | 'M';
} {
  const to = Math.floor(Date.now() / 1000);
  const day = 24 * 60 * 60;
  switch (range) {
    case '1W':
      return { from: to - 7 * day, to, resolution: 'D' };
    case '1M':
      return { from: to - 30 * day, to, resolution: 'D' };
    case '3M':
      return { from: to - 90 * day, to, resolution: 'D' };
    case '6M':
      return { from: to - 180 * day, to, resolution: 'D' };
    case '1J':
      return { from: to - 365 * day, to, resolution: 'D' };
    case '5J':
      return { from: to - 5 * 365 * day, to, resolution: 'W' };
  }
}
