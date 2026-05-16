import { useMemo, useState } from 'react';
import SearchBar from '../components/SearchBar';
import WatchlistRow from '../components/WatchlistRow';
import { useWatchlist } from '../hooks/useWatchlist';
import { useWatchlistQuotes } from '../hooks/useWatchlistQuotes';
import { SORT_OPTIONS, sortWatchlist, type SortKey } from '../utils/sort';

const SORT_STORAGE_KEY = 'aktienwatcher.sort';

export default function WatchlistPage() {
  const { symbols, add, remove } = useWatchlist();
  const { data } = useWatchlistQuotes(symbols);
  const [sortKey, setSortKey] = useState<SortKey>(() => {
    const stored = localStorage.getItem(SORT_STORAGE_KEY);
    return (stored as SortKey) || 'default';
  });

  const sortedSymbols = useMemo(
    () => sortWatchlist(symbols, data, sortKey),
    [symbols, data, sortKey]
  );

  function handleSortChange(key: SortKey) {
    setSortKey(key);
    localStorage.setItem(SORT_STORAGE_KEY, key);
  }

  return (
    <>
      <SearchBar onSelect={add} />

      <div className="watchlist-toolbar">
        <h2 className="section-title">Deine Watchlist</h2>
        <div className="sort-control">
          <label htmlFor="sort">Sortieren:</label>
          <select
            id="sort"
            className="sort-select"
            value={sortKey}
            onChange={(e) => handleSortChange(e.target.value as SortKey)}
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="watchlist">
        <div className="watchlist-header">
          <div>Symbol</div>
          <div>Name</div>
          <div>Kurs</div>
          <div className="col-change">Veränderung</div>
          <div>%</div>
          <div></div>
        </div>
        {symbols.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-title">Deine Watchlist ist leer</div>
            <div>Nutze die Suche oben, um Aktien hinzuzufügen.</div>
          </div>
        ) : (
          sortedSymbols.map((symbol) => (
            <WatchlistRow
              key={symbol}
              symbol={symbol}
              entry={data[symbol]}
              onRemove={remove}
            />
          ))
        )}
      </div>
    </>
  );
}
