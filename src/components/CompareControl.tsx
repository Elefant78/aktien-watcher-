import { useEffect, useRef, useState } from 'react';
import { searchSymbols } from '../api/finnhub';
import type { SymbolSearchResult } from '../types/finnhub';

interface Props {
  symbols: string[];
  colors: string[];
  onAdd: (symbol: string) => void;
  onRemove: (symbol: string) => void;
  max?: number;
}

export default function CompareControl({
  symbols,
  colors,
  onAdd,
  onRemove,
  max = 2,
}: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SymbolSearchResult['result']>([]);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const handle = setTimeout(async () => {
      try {
        const r = await searchSymbols(query.trim());
        setResults(
          (r.result ?? [])
            .filter((x) => x.symbol && !x.symbol.includes('.'))
            .slice(0, 6)
        );
      } catch {
        setResults([]);
      }
    }, 300);
    return () => clearTimeout(handle);
  }, [query]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const canAdd = symbols.length < max;

  return (
    <div className="compare-toolbar">
      <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
        Vergleichen mit:
      </span>
      {symbols.map((s, i) => (
        <span key={s} className="compare-tag">
          <span
            className="compare-color"
            style={{ backgroundColor: colors[i] }}
          />
          {s}
          <button onClick={() => onRemove(s)} aria-label={`${s} entfernen`}>
            ×
          </button>
        </span>
      ))}
      {canAdd && (
        <div className="compare-add" ref={containerRef}>
          <button className="compare-add-btn" onClick={() => setOpen((v) => !v)}>
            + Aktie hinzufügen
          </button>
          {open && (
            <div
              className="search-results"
              style={{ minWidth: 260, top: 'calc(100% + 4px)' }}
            >
              <input
                type="text"
                className="search-input"
                style={{ border: 'none', borderRadius: 0, paddingLeft: '1rem' }}
                placeholder="Symbol suchen..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoFocus
              />
              {results.length === 0 && query.trim() && (
                <div className="search-result">Keine Treffer</div>
              )}
              {results.map((r) => (
                <div
                  key={r.symbol}
                  className="search-result"
                  onClick={() => {
                    onAdd(r.symbol);
                    setQuery('');
                    setOpen(false);
                  }}
                >
                  <span className="search-result-symbol">{r.displaySymbol}</span>
                  <span className="search-result-desc">{r.description}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
