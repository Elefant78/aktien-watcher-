import { useEffect, useRef, useState } from 'react';
import { searchSymbols } from '../api/finnhub';
import type { SymbolSearchResult } from '../types/finnhub';

interface Props {
  onSelect: (symbol: string) => void;
}

export default function SearchBar({ onSelect }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SymbolSearchResult['result']>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.trim().length < 1) {
      setResults([]);
      return;
    }

    const handle = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await searchSymbols(query.trim());
        const filtered = (data.result ?? [])
          .filter((r) => r.symbol && !r.symbol.includes('.'))
          .slice(0, 8);
        setResults(filtered);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(handle);
  }, [query]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  function handleSelect(symbol: string) {
    onSelect(symbol);
    setQuery('');
    setResults([]);
    setOpen(false);
  }

  return (
    <div className="search-bar" ref={containerRef}>
      <svg
        className="search-icon"
        aria-hidden="true"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="11" cy="11" r="7" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
      <input
        type="text"
        className="search-input"
        placeholder="Aktie suchen (z.B. AAPL, Tesla, SAP)..."
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
      />
      {open && query.trim().length > 0 && (
        <div className="search-results">
          {loading && <div className="search-result">Suche läuft…</div>}
          {!loading && results.length === 0 && (
            <div className="search-result">Keine Treffer</div>
          )}
          {!loading &&
            results.map((r) => (
              <div
                key={r.symbol}
                className="search-result"
                onClick={() => handleSelect(r.symbol)}
              >
                <span className="search-result-symbol">{r.displaySymbol}</span>
                <span className="search-result-desc">{r.description}</span>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
