import type { WatchlistEntry } from '../hooks/useWatchlistQuotes';

export type SortKey =
  | 'default'
  | 'symbol-asc'
  | 'symbol-desc'
  | 'price-desc'
  | 'price-asc'
  | 'change-desc'
  | 'change-asc'
  | 'name-asc';

export const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'default', label: 'Hinzufüge-Reihenfolge' },
  { value: 'symbol-asc', label: 'Symbol (A-Z)' },
  { value: 'symbol-desc', label: 'Symbol (Z-A)' },
  { value: 'name-asc', label: 'Name (A-Z)' },
  { value: 'price-desc', label: 'Kurs (hoch → tief)' },
  { value: 'price-asc', label: 'Kurs (tief → hoch)' },
  { value: 'change-desc', label: 'Tagesgewinner zuerst' },
  { value: 'change-asc', label: 'Tagesverlierer zuerst' },
];

export function sortWatchlist(
  symbols: string[],
  data: Record<string, WatchlistEntry>,
  key: SortKey
): string[] {
  if (key === 'default') return symbols;

  const arr = [...symbols];
  arr.sort((a, b) => {
    const ea = data[a];
    const eb = data[b];
    const pa = ea?.quote?.c ?? 0;
    const pb = eb?.quote?.c ?? 0;
    const da = ea?.quote?.dp ?? 0;
    const db = eb?.quote?.dp ?? 0;
    const na = ea?.profile?.name ?? a;
    const nb = eb?.profile?.name ?? b;

    switch (key) {
      case 'symbol-asc':
        return a.localeCompare(b);
      case 'symbol-desc':
        return b.localeCompare(a);
      case 'name-asc':
        return na.localeCompare(nb);
      case 'price-desc':
        return pb - pa;
      case 'price-asc':
        return pa - pb;
      case 'change-desc':
        return db - da;
      case 'change-asc':
        return da - db;
      default:
        return 0;
    }
  });
  return arr;
}
