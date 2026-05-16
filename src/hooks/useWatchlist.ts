import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'aktienwatcher.watchlist';
const DEFAULT_SYMBOLS = ['AAPL', 'MSFT', 'GOOGL', 'TSLA', 'NVDA'];

function loadWatchlist(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SYMBOLS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : DEFAULT_SYMBOLS;
  } catch {
    return DEFAULT_SYMBOLS;
  }
}

export function useWatchlist() {
  const [symbols, setSymbols] = useState<string[]>(loadWatchlist);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(symbols));
    } catch {
      // ignore storage errors
    }
  }, [symbols]);

  const add = useCallback((symbol: string) => {
    const upper = symbol.toUpperCase().trim();
    if (!upper) return;
    setSymbols((prev) => (prev.includes(upper) ? prev : [...prev, upper]));
  }, []);

  const remove = useCallback((symbol: string) => {
    setSymbols((prev) => prev.filter((s) => s !== symbol));
  }, []);

  const has = useCallback(
    (symbol: string) => symbols.includes(symbol.toUpperCase()),
    [symbols]
  );

  return { symbols, add, remove, has };
}
